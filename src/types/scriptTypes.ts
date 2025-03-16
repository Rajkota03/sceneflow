
import { ActType } from '@/lib/types';

// Define a concrete interface with explicit keys to prevent recursive type issues
export interface ActCountsRecord {
  [ActType.ACT_1]: number;
  [ActType.ACT_2A]: number;
  [ActType.MIDPOINT]: number;
  [ActType.ACT_2B]: number;
  [ActType.ACT_3]: number;
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
