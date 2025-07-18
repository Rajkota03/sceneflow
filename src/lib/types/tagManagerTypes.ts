
import { ScriptContent, ActType, BeatMode } from './elementTypes';
import { Structure } from './structureTypes';

export interface TagManagerProps {
  scriptContent: ScriptContent;
  onFilterByTag?: (tag: string | null) => void;
  onFilterByAct?: (act: ActType | null) => void;
  activeFilter?: string | null;
  activeActFilter?: ActType | null;
  projectName?: string;
  structureName?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  structures?: Structure[];
  activeBeatId?: string | null;
  onBeatClick?: (beatId: string) => void;
  beatSceneCounts?: BeatSceneCount[];
  projectId?: string;
  selectedStructure?: Structure | null;
}

export interface ScriptElementProps {
  element: {
    id: string;
    type: string;
    text: string;
    tags?: string[];
    beat?: string;
  };
  previousElementType?: string;
  onChange: (id: string, text: string, type: string) => void;
  onFocus: () => void;
  isActive: boolean;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: string) => void;
  onTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  beatMode?: BeatMode;
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

export interface BeatSceneCount {
  beatId: string;
  actId: string;
  count: number;
  pageRange?: string;
  sceneIds?: string[];
}
