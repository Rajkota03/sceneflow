
import React from 'react';
import { Structure } from '@/lib/types';
import StructurePanel from './StructurePanel';

interface ThreeActStructurePanelProps {
  structure: Structure;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatDragDrop?: (beatId: string, targetSceneId: string) => void;
  onStructureUpdate?: (updatedStructure: Structure) => Promise<void>;
  linkedToProject?: boolean;
}

const ThreeActStructurePanel: React.FC<ThreeActStructurePanelProps> = (props) => {
  // This is now a wrapper around the generic StructurePanel
  return <StructurePanel {...props} />;
};

export default ThreeActStructurePanel;
