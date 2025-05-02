
import React, { useState, useEffect, useCallback, useMemo } from 'react'; // Added useMemo
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors, 
    DragEndEvent, 
    DragStartEvent, 
    DragOverEvent, 
    UniqueIdentifier 
} from '@dnd-kit/core';
import { 
    arrayMove, 
    SortableContext, 
    sortableKeyboardCoordinates, 
    verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Structure, Act, Beat } from '@/lib/types';
import { useScriptEditor } from '../script-editor/ScriptEditorProvider';
import SortableActItem from './SortableActItem';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { generateUniqueId } from '@/lib/formatScript';
import { toast } from '../ui/use-toast';
import { produce } from 'immer'; // Using Immer for easier state updates

interface VerticalStructurePanelProps {
  // Props might be added later if needed
}

const VerticalStructurePanel: React.FC<VerticalStructurePanelProps> = () => {
  const { selectedStructure, updateStructure } = useScriptEditor();
  const [acts, setActs] = useState<Act[]>([]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null); // Track the currently dragged item ID

  // Memoize the initial state setting
  useEffect(() => {
    console.log("Structure Panel: Initializing or updating acts from context.");
    setActs(selectedStructure?.acts || []);
  }, [selectedStructure]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Memoize IDs for SortableContext to prevent unnecessary re-renders
  const actIds = useMemo(() => acts.map(act => act.id), [acts]);

  // Helper to find act and beat indices
  const findItemIndices = (id: UniqueIdentifier): { actIndex: number; beatIndex?: number } | null => {
    for (let actIndex = 0; actIndex < acts.length; actIndex++) {
      if (acts[actIndex].id === id) {
        return { actIndex };
      }
      const beatIndex = acts[actIndex].beats?.findIndex(beat => beat.id === id);
      if (beatIndex !== undefined && beatIndex !== -1) {
        return { actIndex, beatIndex };
      }
    }
    return null;
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    console.log("Drag Start:", event.active.id);
    setActiveId(event.active.id);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;

    const activeIndices = findItemIndices(activeId);
    const overIndices = findItemIndices(overId);

    if (!activeIndices || !overIndices) return; // Item not found

    const isDraggingAct = activeIndices.beatIndex === undefined;
    const isOverAct = overIndices.beatIndex === undefined;

    // Handle dragging a BEAT over an ACT (but not its own act if empty)
    if (!isDraggingAct && isOverAct) {
        const { actIndex: sourceActIndex, beatIndex: sourceBeatIndex } = activeIndices;
        const { actIndex: targetActIndex } = overIndices;

        if (sourceActIndex === targetActIndex) return; // Already in the target act

        setActs(produce(draft => {
            const movedBeat = draft[sourceActIndex].beats?.splice(sourceBeatIndex!, 1)[0];
            if (movedBeat) {
                if (!draft[targetActIndex].beats) {
                    draft[targetActIndex].beats = [];
                }
                // Add to the beginning of the target act's beats
                draft[targetActIndex].beats!.unshift(movedBeat);
            }
        }));
    }

    // Note: Dragging Act over Beat or Act over Act is handled by handleDragEnd's arrayMove
    // Note: Dragging Beat over Beat is handled by handleDragEnd's arrayMove

  }, [acts]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null); // Reset active ID

    if (!over || active.id === over.id) {
        console.log("Drag End: No change or dropped on self.");
        return; // No change or dropped on self
    }

    const activeId = active.id;
    const overId = over.id;
    console.log(`Drag End: Active=${activeId}, Over=${overId}`);

    const activeIndices = findItemIndices(activeId);
    const overIndices = findItemIndices(overId);

    if (!activeIndices || !overIndices) {
        console.error("Drag End Error: Could not find indices for active or over item.");
        return;
    }

    let finalActs = acts;

    // Scenario 1: Reordering Acts
    if (activeIndices.beatIndex === undefined && overIndices.beatIndex === undefined) {
        console.log("Reordering Acts");
        finalActs = arrayMove(acts, activeIndices.actIndex, overIndices.actIndex);
    }
    // Scenario 2: Reordering Beats within the same Act
    else if (activeIndices.beatIndex !== undefined && overIndices.beatIndex !== undefined && activeIndices.actIndex === overIndices.actIndex) {
        console.log("Reordering Beats within Act", acts[activeIndices.actIndex].title);
        finalActs = produce(acts, draft => {
            draft[activeIndices.actIndex].beats = arrayMove(
                draft[activeIndices.actIndex].beats!,
                activeIndices.beatIndex!,
                overIndices.beatIndex!
            );
        });
    }
    // Scenario 3: Moving a Beat to a different Act (already handled partially by handleDragOver)
    // We just need the final placement within the target act's beats array.
    else if (activeIndices.beatIndex !== undefined && activeIndices.actIndex !== overIndices.actIndex) {
        console.log(`Moving Beat from Act ${acts[activeIndices.actIndex].title} to Act ${acts[overIndices.actIndex].title}`);
        // The state should already reflect the move due to handleDragOver.
        // Now, determine the final position within the target act.
        finalActs = produce(acts, draft => {
            const targetAct = draft[overIndices.actIndex];
            const sourceBeatIndexInTarget = targetAct.beats?.findIndex(b => b.id === activeId) ?? -1;
            const targetBeatIndex = overIndices.beatIndex ?? (targetAct.beats?.length ?? 1) -1; // Place at end if dropped on act

            if (sourceBeatIndexInTarget !== -1 && sourceBeatIndexInTarget !== targetBeatIndex) {
                 targetAct.beats = arrayMove(targetAct.beats!, sourceBeatIndexInTarget, targetBeatIndex);
            }
        });
    }

    // Update local state immediately
    setActs(finalActs);

    // Persist the change
    if (updateStructure && selectedStructure && JSON.stringify(finalActs) !== JSON.stringify(selectedStructure.acts)) {
      console.log("Persisting updated structure...");
      updateStructure({ ...selectedStructure, acts: finalActs });
    } else {
      console.log("No structure update needed or update function unavailable.");
    }

  }, [acts, selectedStructure, updateStructure]);

  const handleAddBeat = useCallback((actId: string) => {
    const newBeat: Beat = {
      id: `beat-${generateUniqueId()}`,
      title: "New Beat",
      description: "",
      complete: false,
    };

    const updatedActs = produce(acts, draft => {
        const act = draft.find(a => a.id === actId);
        if (act) {
            if (!act.beats) act.beats = [];
            act.beats.push(newBeat);
        }
    });

    setActs(updatedActs);

    if (updateStructure && selectedStructure) {
      updateStructure({ ...selectedStructure, acts: updatedActs });
      toast({ description: "New beat added." });
    } else {
      console.warn("updateStructure function not available in context.");
    }
  }, [acts, selectedStructure, updateStructure]);

  const handleDeleteBeat = useCallback((actId: string, beatId: string) => {
    const updatedActs = produce(acts, draft => {
        const act = draft.find(a => a.id === actId);
        if (act && act.beats) {
            act.beats = act.beats.filter(beat => beat.id !== beatId);
        }
    });

    setActs(updatedActs);

    if (updateStructure && selectedStructure) {
      updateStructure({ ...selectedStructure, acts: updatedActs });
      toast({ description: "Beat deleted." });
    } else {
      console.warn("updateStructure function not available in context.");
    }
  }, [acts, selectedStructure, updateStructure]);


  if (!selectedStructure || !acts || acts.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No structure selected or structure has no acts.</div>;
  }

  return (
    <div className="h-full flex flex-col p-2 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
      <h3 className="text-sm font-medium mb-3 px-1 text-gray-700 dark:text-gray-300">Structure Outline</h3>
      <div className="flex-grow overflow-y-auto pr-1"> 
        <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
          <SortableContext items={actIds} strategy={verticalListSortingStrategy}>
            {acts.map((act) => (
              <SortableActItem 
                key={act.id} 
                act={act} 
                onAddBeat={handleAddBeat} 
                onDeleteBeat={handleDeleteBeat}
                isDraggingAct={activeId === act.id}
                activeDragId={activeId}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default VerticalStructurePanel;

