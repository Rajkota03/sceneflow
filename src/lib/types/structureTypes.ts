
import { Json } from '@/integrations/supabase/types';

// Structure-related types
export interface Structure {
  id: string;
  name: string;
  description?: string;
  acts: Act[];
  createdAt: string; // Changed from Date to string
  updatedAt: string; // Changed from Date to string
  structure_type?: string;
  projectTitle?: string;
}

export interface Act {
  id: string;
  title: string;
  colorHex: string;
  startPosition: number; // percentage (0-100)
  endPosition: number; // percentage (0-100)
  beats: Beat[];
}

export interface Beat {
  id: string;
  title: string;
  description: string;
  timePosition: number; // percentage (0-100)
  pageRange?: string;
  complete?: boolean;
  notes?: string;
  sceneCount?: number; // Added this property to fix TypeScript errors
}

// ThreeActStructure used in some components
export interface ThreeActStructure {
  id: string;
  name: string;
  acts: {
    setup: {
      name: string;
      description: string;
      beats: {
        name: string;
        description: string;
        position: number;
      }[];
    };
    confrontation: {
      name: string;
      description: string;
      beats: {
        name: string;
        description: string;
        position: number;
      }[];
    };
    resolution: {
      name: string;
      description: string;
      beats: {
        name: string;
        description: string;
        position: number;
      }[];
    };
  };
}
