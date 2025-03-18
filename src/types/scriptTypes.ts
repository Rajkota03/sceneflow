
import { ScriptContent, ActType, Structure as StructureType } from '@/lib/types';

export type BeatMode = 'on' | 'off';

export interface TagManagerProps {
  scriptContent: ScriptContent;
  onFilterByTag?: (tag: string | null) => void;
  onFilterByAct?: (act: ActType | null) => void;
  activeFilter: string | null;
  activeActFilter: ActType | null;
  projectName?: string;
  structureName?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  structures?: StructureType[];
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
}

export interface SimpleStructure {
  id: string;
  name: string;
}
