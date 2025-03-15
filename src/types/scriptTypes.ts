
import { ActType } from '@/lib/types';

// Define a concrete interface with explicit keys to prevent recursive type issues
export interface ActCountsRecord {
  '1': number;
  '2A': number;
  'midpoint': number;
  '2B': number;
  '3': number;
  [key: string]: number;
}

export type BeatMode = 'on' | 'off';

export interface TagManagerProps {
  scriptContent: {
    elements: any[];
  };
  onFilterByTag: (tag: string | null) => void;
  onFilterByAct?: (act: ActType | null) => void;
  activeFilter: string | null;
  activeActFilter?: ActType | null;
  projectName?: string;
  structureName?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  availableStructures?: { id: string; name: string }[];
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
  projectId?: string;
}
