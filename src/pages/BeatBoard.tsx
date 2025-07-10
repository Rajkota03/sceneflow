import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { use40BeatSheetGeneration } from '@/hooks/use40BeatSheetGeneration';
import { useDownstreamRegeneration } from '@/hooks/useDownstreamRegeneration';
import { useAutoGenerateAlternatives } from '@/hooks/useAutoGenerateAlternatives';
import { BeatGrid } from '@/components/beat-board/BeatGrid';
import { BeatAlternativesDrawer } from '@/components/beat-board/BeatAlternativesDrawer';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Wand2, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';

const formSchema = z.object({
  genre: z.string().min(1, 'Genre is required'),
  logline: z.string().min(10, 'Logline must be at least 10 characters'),
  characters: z.string().optional(),
  model: z.string().default('meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo'),
  storyTitle: z.string().min(1, 'Story title is required for saving'),
});

type FormData = z.infer<typeof formSchema>;

interface Beat40 {
  id: number;
  title: string;
  type: string;
  summary: string;
  source_id?: number;
  alternatives: Array<{
    summary: string;
    source_id: number;
  }>;
}

export default function BeatBoard() {
  const [beats, setBeats] = useState<Beat40[]>([]);
  const [selectedBeat, setSelectedBeat] = useState<Beat40 | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  
  const { generate40BeatSheet, isGenerating } = use40BeatSheetGeneration();
  const { regenerateDownstream, isRegenerating } = useDownstreamRegeneration();
  const { generateAlternativesForFirstBeats, isGenerating: isAutoGenerating } = useAutoGenerateAlternatives();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genre: '',
      logline: '',
      characters: '',
      model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
      storyTitle: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const result = await generate40BeatSheet({
        genre: data.genre,
        logline: data.logline,
        characters: data.characters,
        model: data.model,
      });

      if (result && result.beats) {
        const generatedBeats = result.beats.beats || [];
        setBeats(generatedBeats);
        toast({
          title: "Success!",
          description: `Generated ${generatedBeats.length} beats using ${result.masterplotUsed?.story_type}`,
        });

        // Auto-generate alternatives for the first 5 beats
        if (generatedBeats.length > 0) {
          const beatsWithAlternatives = await generateAlternativesForFirstBeats(generatedBeats, 5);
          setBeats(beatsWithAlternatives);
        }
      }
    } catch (error) {
      console.error('Error generating beats:', error);
      toast({
        title: "Error",
        description: "Failed to generate beats. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBeatClick = (beat: Beat40) => {
    setSelectedBeat(beat);
    setIsDrawerOpen(true);
  };

  const handleBeatReorder = (reorderedBeats: Beat40[]) => {
    setBeats(reorderedBeats);
    toast({
      title: "Beats Reordered",
      description: "Your beat sequence has been updated.",
    });
  };

  const handleBeatEdit = (beatId: number, updates: { title?: string; summary?: string }) => {
    setBeats(prevBeats => 
      prevBeats.map(beat => 
        beat.id === beatId 
          ? { ...beat, ...updates }
          : beat
      )
    );
    toast({
      title: "Beat Updated",
      description: "Beat has been successfully edited.",
    });
  };

  const handleBeatReplace = (beatId: number, newSummary: string, sourceId?: number) => {
    setBeats(prevBeats => 
      prevBeats.map(beat => 
        beat.id === beatId 
          ? { ...beat, summary: newSummary, source_id: sourceId }
          : beat
      )
    );
    toast({
      title: "Beat Updated",
      description: "The beat summary has been replaced with the alternative.",
    });
  };

  const handleAdaptiveReplace = async (beatId: number, newSummary: string, sourceId?: number, allBeats?: Beat40[], model?: string) => {
    // First update the beat with the new summary and source_id
    const updatedBeats = beats.map(beat => 
      beat.id === beatId 
        ? { ...beat, summary: newSummary, source_id: sourceId }
        : beat
    );
    
    setBeats(updatedBeats);

    toast({
      title: "Beat Updated",
      description: "Beat replaced successfully. Regenerating downstream beats for consistency...",
    });

    try {
      // Regenerate downstream beats
      const regeneratedBeats = await regenerateDownstream({
        beats: updatedBeats,
        changedIndex: beatId,
        model: model || form.getValues('model'),
      });

      setBeats(regeneratedBeats);
      
      toast({
        title: "Story Adapted",
        description: "All downstream beats have been regenerated to maintain story consistency.",
      });
    } catch (error) {
      console.error('Error during adaptive replacement:', error);
      // Keep the initial beat replacement even if downstream regeneration fails
      toast({
        title: "Partial Update",
        description: "Beat was replaced, but downstream regeneration failed. You can try again manually.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAlternatives = (beatId: number, alternatives: Array<{ summary: string; source_id: number; }>) => {
    setBeats(prevBeats => 
      prevBeats.map(beat => 
        beat.id === beatId 
          ? { ...beat, alternatives }
          : beat
      )
    );
    toast({
      title: "New Alternatives Generated",
      description: `Generated ${alternatives.length} new alternatives for this beat.`,
    });
  };

  const handleSave = async () => {
    const storyTitle = form.getValues('storyTitle');
    
    if (!storyTitle) {
      toast({
        title: "Story Title Required",
        description: "Please enter a story title before saving.",
        variant: "destructive",
      });
      return;
    }

    if (beats.length === 0) {
      toast({
        title: "No Beats to Save",
        description: "Generate some beats first before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const user = await supabase.auth.getUser();
      
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('user_beats')
        .insert({
          user_id: user.data.user.id,
          story_title: storyTitle,
          beats_json: { beats, metadata: { genre: form.getValues('genre'), logline: form.getValues('logline') } } as any,
        });

      if (error) throw error;

      toast({
        title: "Beats Saved!",
        description: `Your 40-beat structure for "${storyTitle}" has been saved.`,
      });
    } catch (error) {
      console.error('Error saving beats:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your beats. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setBeats([]);
    form.reset();
    toast({
      title: "Board Reset",
      description: "All beats and form data have been cleared.",
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">40-Beat Story Board</h1>
        <p className="text-muted-foreground">
          Generate, organize, and customize your story beats with drag-and-drop functionality
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Generation Form */}
        <div className={`lg:col-span-1 transition-all duration-300 ${isFormCollapsed ? 'lg:w-16' : ''}`}>
          <Card className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFormCollapsed(!isFormCollapsed)}
              className="absolute top-2 right-2 z-10"
            >
              {isFormCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
            
            <Collapsible open={!isFormCollapsed} onOpenChange={(open) => setIsFormCollapsed(!open)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer">
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    {!isFormCollapsed && "Generate Beats"}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
            <CardContent className="space-y-4">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    placeholder="e.g., Thriller, Romance, Sci-fi"
                    {...form.register('genre')}
                  />
                  {form.formState.errors.genre && (
                    <p className="text-sm text-destructive">{form.formState.errors.genre.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logline">Logline</Label>
                  <Textarea
                    id="logline"
                    placeholder="A brief summary of your story concept..."
                    rows={3}
                    {...form.register('logline')}
                  />
                  {form.formState.errors.logline && (
                    <p className="text-sm text-destructive">{form.formState.errors.logline.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="characters">Character Names (Optional)</Label>
                  <Input
                    id="characters"
                    placeholder="e.g., Sarah, Detective Martinez"
                    {...form.register('characters')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select 
                    onValueChange={(value) => form.setValue('model', value)}
                    defaultValue={form.getValues('model')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border shadow-lg z-50">
                      <SelectItem value="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo">
                        <div className="flex flex-col">
                          <span className="font-medium">Llama 3.1 8B Turbo</span>
                          <span className="text-xs text-muted-foreground">Fast • Balanced performance</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo">
                        <div className="flex flex-col">
                          <span className="font-medium">Llama 3.1 70B Turbo</span>
                          <span className="text-xs text-muted-foreground">Powerful • Best quality</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo">
                        <div className="flex flex-col">
                          <span className="font-medium">Llama 3.1 405B Turbo</span>
                          <span className="text-xs text-muted-foreground">Premium • Highest intelligence</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mistralai/Mixtral-8x7B-Instruct-v0.1">
                        <div className="flex flex-col">
                          <span className="font-medium">Mixtral 8x7B</span>
                          <span className="text-xs text-muted-foreground">Alternative • Good reasoning</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose the AI model for beat generation. Larger models provide better quality but take longer.
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="storyTitle">Story Title (For Saving)</Label>
                  <Input
                    id="storyTitle"
                    placeholder="Enter title to save your beats"
                    {...form.register('storyTitle')}
                  />
                </div>

                <div className="space-y-3">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isGenerating || isAutoGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Beats...
                      </>
                    ) : isAutoGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Auto-generating Alternatives...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate 40 Beats
                      </>
                    )}
                  </Button>

                  {beats.length > 0 && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                        className="flex-1"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reset
                      </Button>
                    </div>
                  )}
                </div>
              </form>

              {beats.length > 0 && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generated Beats</span>
                    <Badge variant="secondary">{beats.length} beats</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ✨ First 5 beats include auto-generated alternatives • Click any beat to explore or generate more
                  </p>
                </div>
              )}
              </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>

        {/* Beat Grid */}
        <div className={`transition-all duration-300 ${isFormCollapsed ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          <Card>
            <CardHeader>
              <CardTitle>Story Beats</CardTitle>
              <p className="text-sm text-muted-foreground">
                Drag and drop to reorder • Click to view alternatives
              </p>
            </CardHeader>
            <CardContent>
              <BeatGrid
                beats={beats}
                onBeatClick={handleBeatClick}
                onReorder={handleBeatReorder}
                onEdit={handleBeatEdit}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Alternatives Drawer */}
      <BeatAlternativesDrawer
        beat={selectedBeat}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onReplace={handleBeatReplace}
        onUpdateAlternatives={handleUpdateAlternatives}
        onAdaptiveReplace={handleAdaptiveReplace}
        beats={beats}
        model={form.getValues('model')}
      />
    </div>
  );
}