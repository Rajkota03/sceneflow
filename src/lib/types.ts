
// Type definitions for the screenplay editor

// Element types for screenplay
export type ElementType = 'scene-heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'note';

// Script element interface
export interface ScriptElement {
  id: string;
  type: ElementType;
  text: string;
  tags?: string[];
  beat?: string;
}

// Script content interface
export interface ScriptContent {
  elements: ScriptElement[];
}

// Project interface
export interface Project {
  id: string;
  title: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  content: ScriptContent;
  title_page?: TitlePageData;
  notes?: Note[];
}

// Note interface
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// TitlePageData interface
export interface TitlePageData {
  title: string;
  author: string;
  basedOn?: string;
  contact?: string;
}

// Act types enum
export enum ActType {
  ACT_1 = 'act1',
  ACT_2A = 'act2a',
  MIDPOINT = 'midpoint',
  ACT_2B = 'act2b',
  ACT_3 = 'act3'
}

// Structure-related types
export type StructureType = 'three_act' | 'save_the_cat' | 'heroes_journey' | 'story_circle';

export interface Beat {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
}

export interface Act {
  id: string;
  title: string;
  type: ActType;
  beats: Beat[];
}

export interface Structure {
  id: string;
  name: string;
  description?: string;
  structure_type: StructureType;
  author_id?: string;
  created_at?: string; 
  updated_at?: string;
  acts: Act[];
}

// Helper functions for ScriptContent
export const jsonToScriptContent = (json: any): ScriptContent => {
  if (!json || !json.elements) {
    return { elements: [] };
  }
  return {
    elements: json.elements
  };
};

export const scriptContentToJson = (content: ScriptContent): any => {
  return {
    elements: content.elements
  };
};

// Function types
export type FormatChangeCallback = (id: string, newType: ElementType) => void;
export type ElementChangeCallback = (id: string, text: string, type: ElementType) => void;
export type NavigateCallback = (direction: 'up' | 'down', id: string) => void;
export type EnterKeyCallback = (id: string, shiftKey: boolean) => void;
export type FocusCallback = (id: string) => void;
export type TagsChangeCallback = (elementId: string, tags: string[]) => void;
