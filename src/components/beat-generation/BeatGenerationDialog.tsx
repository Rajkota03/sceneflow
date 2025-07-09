import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Sparkles, RefreshCw, CheckCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Structure, Act, Beat } from '@/lib/types';
import { generateUniqueId } from '@/lib/formatScript';

interface BeatGenerationDialogProps {
  selectedStructure: Structure | null;
  onBeatsGenerated: (updatedStructure: Structure) => void;
  trigger?: React.ReactNode;
}

interface GeneratedBeat {
  title: string;
  description: string;
  pageRange: string;
  timePosition: number;
}

interface GeneratedAct {
  actId: string;
  title: string;
  beats: GeneratedBeat[];
}

interface GenerationResponse {
  acts: GeneratedAct[];
}

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
  'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Crime',
  'Family', 'Animation', 'Documentary', 'Musical', 'War', 'Biography'
];

const COMMON_THEMES = [
  'Love conquers all', 'Good vs Evil', 'Coming of age', 'Redemption',
  'Sacrifice for others', 'Power corrupts', 'Family bonds', 'Justice prevails',
  'Self-discovery', 'Overcoming fear', 'Hope in darkness', 'Betrayal and trust',
  'The American Dream', 'Man vs Nature', 'Technology vs Humanity'
];

export function BeatGenerationDialog({ 
  selectedStructure, 
  onBeatsGenerated, 
  trigger 
}: BeatGenerationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genre, setGenre] = useState('');
  const [theme, setTheme] = useState('');
  const [customTheme, setCustomTheme] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedBeats, setGeneratedBeats] = useState<GenerationResponse | null>(null);

  const handleGenerate = async () => {
    if (!selectedStructure || !genre || (!theme && !customTheme)) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a genre and theme to generate beats."
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-beats', {
        body: {
          genre,
          theme: customTheme || theme,
          actStructure: selectedStructure,
          customPrompt: customPrompt || undefined
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      setGeneratedBeats(data.beats);
      toast({
        title: "Beats Generated!",
        description: "Story beats have been successfully generated.",
      });

    } catch (error) {
      console.error('Beat generation error:', error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: error.message || "Failed to generate beats. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyBeats = () => {
    if (!generatedBeats || !selectedStructure) return;

    const updatedStructure = { ...selectedStructure };
    
    // Apply generated beats to the structure
    generatedBeats.acts.forEach((generatedAct, actIndex) => {
      if (actIndex < updatedStructure.acts.length) {
        const existingAct = updatedStructure.acts[actIndex];
        
        // Convert generated beats to our Beat format
        const newBeats: Beat[] = generatedAct.beats.map(beat => ({
          id: generateUniqueId(),
          title: beat.title,
          description: beat.description,
          timePosition: beat.timePosition,
          pageRange: beat.pageRange,
          complete: false,
          sceneCount: 0
        }));

        // Replace existing beats with generated ones
        updatedStructure.acts[actIndex] = {
          ...existingAct,
          beats: newBeats
        };
      }
    });

    onBeatsGenerated(updatedStructure);
    setIsOpen(false);
    setGeneratedBeats(null);
    
    toast({
      title: "Beats Applied!",
      description: "Generated beats have been added to your structure.",
    });
  };

  const resetForm = () => {
    setGenre('');
    setTheme('');
    setCustomTheme('');
    setCustomPrompt('');
    setGeneratedBeats(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetForm();
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Generate Beats
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Beat Generation
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-hidden">
          {/* Input Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre *</Label>
              <Select value={genre} onValueChange={setGenre}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent>
                  {GENRES.map(g => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme *</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_THEMES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customTheme">Or Custom Theme</Label>
              <Input
                id="customTheme"
                placeholder="Enter your own theme..."
                value={customTheme}
                onChange={(e) => setCustomTheme(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customPrompt">Custom Instructions (Optional)</Label>
              <Textarea
                id="customPrompt"
                placeholder="Add specific instructions for beat generation..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
            </div>

            {selectedStructure && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Target Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">{selectedStructure.name}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedStructure.acts.map((act, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {act.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !selectedStructure}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Beats
                </>
              )}
            </Button>
          </div>

          {/* Generated Beats Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Generated Beats</Label>
              {generatedBeats && (
                <Button
                  onClick={() => setGeneratedBeats(null)}
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                >
                  <RefreshCw className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>

            <ScrollArea className="h-[400px] border rounded-md p-4">
              {!generatedBeats ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Generated beats will appear here</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedBeats.acts.map((act, actIndex) => (
                    <Card key={actIndex}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {act.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {act.beats.map((beat, beatIndex) => (
                          <div key={beatIndex} className="p-2 bg-muted/50 rounded">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-medium text-sm">{beat.title}</h4>
                              <Badge variant="outline" className="text-xs">
                                {beat.pageRange}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {beat.description}
                            </p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          {generatedBeats && (
            <Button onClick={handleApplyBeats} className="gap-2">
              <Download className="h-4 w-4" />
              Apply to Structure
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}