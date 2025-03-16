import { ScriptContent, ActType } from "@/lib/types";

export type ActCountsRecord = {
  [key in ActType]: number;
};

export type BeatMode = 'on' | 'off';

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
  availableStructures?: { id: string; name: string }[];
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
  projectId?: string;
}

export interface ScriptElementProps {
  element: {
    id: string;
    type: string;
    text: string;
    tags?: string[];
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
}
