import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Replace, X, Wand2, Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAltBeatGeneration } from '@/hooks/useAltBeatGeneration';
import { useDownstreamRegeneration } from '@/hooks/useDownstreamRegeneration';

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

interface BeatAlternativesDrawerProps {
  beat: Beat40 | null;
  isOpen: boolean;
  onClose: () => void;
  onReplace: (beatId: number, newSummary: string, sourceId?: number) => void;
  onUpdateAlternatives?: (beatId: number, alternatives: Array<{ summary: string; source_id: number; }>) => void;
  onAdaptiveReplace?: (beatId: number, newSummary: string, sourceId?: number, allBeats?: Beat40[], model?: string) => void;
  beats?: Beat40[];
  model?: string;
}

export function BeatAlternativesDrawer({ 
  beat, 
  isOpen, 
  onClose, 
  onReplace,
  onUpdateAlternatives,
  onAdaptiveReplace,
  beats,
  model
}: BeatAlternativesDrawerProps) {
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [useAdaptive, setUseAdaptive] = useState(true);
  const { generateAltBeats, isGenerating } = useAltBeatGeneration();
  const { regenerateDownstream, isRegenerating } = useDownstreamRegeneration();

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'setup':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'fun and games':
        return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'bad guys close in':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
      case 'finale':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  const handleReplace = async () => {
    if (!beat || !selectedAlternative) return;

    if (useAdaptive && onAdaptiveReplace && beats && model) {
      // Use adaptive replacement
      await onAdaptiveReplace(beat.id, selectedAlternative, selectedSourceId || undefined, beats, model);
    } else {
      // Use regular replacement
      onReplace(beat.id, selectedAlternative, selectedSourceId || undefined);
    }
    
    setSelectedAlternative(null);
    setSelectedSourceId(null);
    onClose();
  };

  const handleGenerateAlternatives = async () => {
    if (!beat) return;

    const result = await generateAltBeats({
      beat_id: beat.id,
      beat_title: beat.title,
      current_summary: beat.summary,
      story_type: beat.type,
      conflict_start_id: undefined // We don't have this info in the current beat structure
    });

    if (result?.alternatives && onUpdateAlternatives) {
      onUpdateAlternatives(beat.id, result.alternatives);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg">Beat Alternatives</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {beat && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", getTypeColor(beat.type))}
                >
                  {beat.type}
                </Badge>
                <span className="text-sm text-muted-foreground">Beat #{beat.id}</span>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm mb-2">{beat.title}</h3>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Current Summary:</p>
                  <p className="text-sm mt-1">{beat.summary}</p>
                </div>
              </div>
            </div>
          )}
        </SheetHeader>

        {beat && (
          <>
            <Separator className="my-4" />
            
            {/* Adaptive Mode Toggle */}
            {beats && model && onAdaptiveReplace && (
              <div className="p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="adaptive-mode" className="text-sm font-medium flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Adaptive Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically regenerate downstream beats for story consistency
                    </p>
                  </div>
                  <Switch
                    id="adaptive-mode"
                    checked={useAdaptive}
                    onCheckedChange={setUseAdaptive}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">
                    Choose Alternative ({beat.alternatives?.length || 0} available)
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAlternatives}
                    disabled={isGenerating}
                    className="text-xs"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3 mr-1" />
                        Generate New
                      </>
                    )}
                  </Button>
                </div>
                
                {!beat.alternatives || beat.alternatives.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No alternatives available for this beat.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {beat.alternatives.map((alternative, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50",
                            selectedAlternative === alternative.summary && "border-primary bg-primary/5"
                          )}
                           onClick={() => {
                             setSelectedAlternative(alternative.summary);
                             setSelectedSourceId(alternative.source_id);
                           }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm flex-1">{alternative.summary}</p>
                            <Badge variant="outline" className="text-xs">
                              ID: {alternative.source_id}
                            </Badge>
                          </div>
                          
                          {selectedAlternative === alternative.summary && (
                            <div className="mt-3 flex justify-end">
                              <Button
                                size="sm"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleReplace();
                                 }}
                                className="text-xs"
                              >
                                <Replace className="h-3 w-3 mr-1" />
                                Replace Current
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}