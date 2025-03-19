
import { Structure, Act, Beat } from './types';
import { v4 as uuidv4 } from 'uuid';

// Create a new structure with the given name and template
export function createStructure(name: string, template?: Structure): Structure {
  const id = `structure-${Date.now()}`;
  
  if (template) {
    return {
      ...template,
      id,
      name,
      acts: template.acts?.map(act => ({
        ...act,
        id: `act-${uuidv4()}`,
        beats: act.beats?.map(beat => ({
          ...beat,
          id: `beat-${uuidv4()}`,
          complete: false
        }))
      }))
    };
  }
  
  return {
    id,
    name,
    acts: []
  };
}

// Update a beat in a structure
export function updateBeat(structure: Structure, beatId: string, actId: string, updatedBeat: Partial<Beat>): Structure {
  return {
    ...structure,
    acts: structure.acts?.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          beats: act.beats?.map(beat => {
            if (beat.id === beatId) {
              return {
                ...beat,
                ...updatedBeat
              };
            }
            return beat;
          })
        };
      }
      return act;
    })
  };
}

// Update an act in a structure
export function updateAct(structure: Structure, actId: string, updatedAct: Partial<Act>): Structure {
  return {
    ...structure,
    acts: structure.acts?.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          ...updatedAct
        };
      }
      return act;
    })
  };
}

// Add a new beat to an act
export function addBeatToAct(structure: Structure, actId: string, beat: Partial<Beat>): Structure {
  const newBeat: Beat = {
    id: `beat-${uuidv4()}`,
    title: beat.title || 'New Beat',
    description: beat.description || '',
    complete: beat.complete || false,
    ...beat
  };
  
  return {
    ...structure,
    acts: structure.acts?.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          beats: [...(act.beats || []), newBeat]
        };
      }
      return act;
    })
  };
}

// Add a new act to a structure
export function addActToStructure(structure: Structure, act: Partial<Act>): Structure {
  const newAct: Act = {
    id: `act-${uuidv4()}`,
    title: act.title || 'New Act',
    beats: [],
    ...act
  };
  
  return {
    ...structure,
    acts: [...(structure.acts || []), newAct]
  };
}

// Remove a beat from an act
export function removeBeatFromAct(structure: Structure, beatId: string, actId: string): Structure {
  return {
    ...structure,
    acts: structure.acts?.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          beats: act.beats?.filter(beat => beat.id !== beatId)
        };
      }
      return act;
    })
  };
}

// Remove an act from a structure
export function removeActFromStructure(structure: Structure, actId: string): Structure {
  return {
    ...structure,
    acts: structure.acts?.filter(act => act.id !== actId)
  };
}

// Update a structure
export function updateStructure(structure: Structure, updates: Partial<Structure>): Structure {
  return {
    ...structure,
    ...updates
  };
}

// Check if a structure is complete (all beats marked as complete)
export function isStructureComplete(structure: Structure): boolean {
  if (!structure.acts || structure.acts.length === 0) {
    return false;
  }
  
  for (const act of structure.acts) {
    if (!act.beats || act.beats.length === 0) {
      return false;
    }
    
    for (const beat of act.beats) {
      if (!beat.complete) {
        return false;
      }
    }
  }
  
  return true;
}

// Calculate completion percentage of a structure
export function getStructureCompletionPercentage(structure: Structure): number {
  if (!structure.acts || structure.acts.length === 0) {
    return 0;
  }
  
  let totalBeats = 0;
  let completeBeats = 0;
  
  for (const act of structure.acts) {
    if (act.beats && act.beats.length > 0) {
      totalBeats += act.beats.length;
      completeBeats += act.beats.filter(beat => beat.complete).length;
    }
  }
  
  return totalBeats > 0 ? Math.round((completeBeats / totalBeats) * 100) : 0;
}

// Update a beat's completion status
export function updateStructureBeatCompletion(structure: Structure, beatId: string, actId: string, complete: boolean): Structure | null {
  if (!structure || !structure.acts) return null;
  
  return {
    ...structure,
    acts: structure.acts.map(act => {
      if (act.id === actId) {
        return {
          ...act,
          beats: act.beats?.map(beat => {
            if (beat.id === beatId) {
              return {
                ...beat,
                complete
              };
            }
            return beat;
          })
        };
      }
      return act;
    })
  };
}

// Save beat completion status to the database
export async function saveStructureBeatCompletion(structureId: string, structure: Structure): Promise<boolean> {
  try {
    console.log('Saving structure beat completion', structureId, structure);
    // Simulate a successful update for now
    return true;
  } catch (error) {
    console.error('Error saving beat completion', error);
    return false;
  }
}

// Find a beat by its ID in a structure
export function findBeatById(structure: Structure, beatId: string): { beat: Beat | null; act: Act | null } {
  if (!structure.acts) return { beat: null, act: null };
  
  for (const act of structure.acts) {
    if (!act.beats) continue;
    
    const beat = act.beats.find(b => b.id === beatId);
    if (beat) {
      return { beat, act };
    }
  }
  
  return { beat: null, act: null };
}

// Get all beats from a structure as a flat array
export function getAllBeatsFlat(structure: Structure): Beat[] {
  if (!structure.acts) return [];
  
  return structure.acts.flatMap(act => act.beats || []);
}
