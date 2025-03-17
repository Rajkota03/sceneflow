
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Structure } from '@/lib/models/structureModel';

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
  
  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-slate-700">Story Progress</p>
        <span className="text-sm text-slate-500">{completedBeats}/{totalBeats} beats</span>
      </div>
      <Progress value={progressPercentage} className="h-2 w-full bg-slate-100" />
      <div className="flex justify-between text-xs text-slate-500">
        <span>Setup</span>
        <span>Confrontation</span>
        <span>Resolution</span>
      </div>
    </div>
  );
};
