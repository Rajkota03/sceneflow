
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Structure } from '@/lib/models/structureModel';
import { FileText } from 'lucide-react';

interface StructureProgressProps {
  structure: Structure;
}

export const StructureProgress: React.FC<StructureProgressProps> = ({ structure }) => {
  // Calculate progress based on how many beats are completed
  // For now, we'll consider a beat "complete" if it has a non-empty description
  // This logic can be enhanced later to check if beats are linked to scenes
  const totalBeats = structure.acts.reduce((count, act) => count + act.beats.length, 0);
  const completedBeats = structure.acts.reduce((count, act) => {
    return count + act.beats.filter(beat => beat.description && beat.description.trim() !== '').length;
  }, 0);
  
  const progressPercentage = totalBeats > 0 ? Math.round((completedBeats / totalBeats) * 100) : 0;
  
  // Calculate the total estimated page count (assuming a 120-page screenplay)
  const totalPages = 120;
  
  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-slate-700">Story Progress</p>
        <span className="text-sm text-slate-500 flex items-center">
          <span>{completedBeats}/{totalBeats} beats</span>
          <span className="mx-2">•</span>
          <FileText className="h-3 w-3 mr-1" />
          <span>~{totalPages} pages</span>
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2 w-full bg-slate-100" />
      <div className="flex justify-between text-xs text-slate-500">
        <span className="flex items-center"><FileText className="h-3 w-3 mr-1" /> Page 1 (Setup)</span>
        <span className="flex items-center"><FileText className="h-3 w-3 mr-1" /> Page 60 (Confrontation)</span>
        <span className="flex items-center"><FileText className="h-3 w-3 mr-1" /> Page 120 (Resolution)</span>
      </div>
    </div>
  );
};
