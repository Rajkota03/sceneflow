export type ScreenplayElementType = 
  | 'sceneHeading'
  | 'action'
  | 'character'
  | 'parenthetical'
  | 'dialogue'
  | 'transition';

export interface SceneEditorProps {
  scriptId: string;
}

export interface ScreenplayNodeAttrs {
  elementType: ScreenplayElementType;
  slug?: string;
  number?: number;
  name?: string;
}

export interface AutocompleteItem {
  id: string;
  label: string;
  value: string;
}

export interface CollaborationUser {
  name: string;
  color: string;
  id: string;
}