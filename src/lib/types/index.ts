
// Export all types from separate files
export * from './elementTypes';
export * from './structureTypes';
export * from './projectTypes';
export * from './utilityTypes';
// Export tagManagerTypes but exclude BeatSceneCount which is already exported from elementTypes
export type { 
  TagManagerProps,
  ScriptElementProps
} from './tagManagerTypes';
