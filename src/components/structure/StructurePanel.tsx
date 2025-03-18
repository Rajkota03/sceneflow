
import React, { useEffect } from 'react';
import { Structure } from '@/lib/types';
import { useStructureState } from './useStructureState';
import StructureHeader from './StructureHeader';
import ActSection from './ActSection';

interface StructurePanelProps {
  structure: Structure;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatDragDrop?: (beatId: string, targetSceneId: string) => void;
  onStructureUpdate?: (updatedStructure: Structure) => Promise<void>;
  linkedToProject?: boolean;
}

const StructurePanel: React.FC<StructurePanelProps> = ({
  structure,
  onBeatDragDrop,
  onStructureUpdate,
  linkedToProject = false
}) => {
  const {
    expandedActs,
    isEditing,
    localStructure,
    isSaving,
    hasChanges,
    progressPercentage,
    toggleAct,
    handleBeatsReorder,
    handleBeatUpdate,
    handleBeatToggleComplete,
    handleSaveStructure,
    resetToDefaultStructure,
    setIsEditing,
    cancelEditing
  } = useStructureState({ structure, onStructureUpdate });

  useEffect(() => {
    console.log(`StructurePanel rendering with structure ${structure.id}: ${structure.name}`);
    console.log(`Number of acts: ${structure.acts?.length || 0}`);
    
    if (structure.acts && Array.isArray(structure.acts)) {
      structure.acts.forEach(act => {
        if (act && act.beats) {
          console.log(`Act ${act.title || act.id} has ${act.beats.length} beats`);
        }
      });
    } else {
      console.log("Structure has no acts or not in the expected format");
    }
  }, [structure]);

  // Check if structure has valid acts
  const hasValidActs = localStructure.acts && Array.isArray(localStructure.acts) && localStructure.acts.length > 0;

  return (
    <div className="w-full">
      <StructureHeader
        name={localStructure.name}
        description={localStructure.description}
        projectTitle={localStructure.projectTitle}
        progressPercentage={progressPercentage}
        isEditing={isEditing}
        isSaving={isSaving}
        hasChanges={hasChanges}
        linkedToProject={linkedToProject}
        onEdit={() => setIsEditing(true)}
        onSave={handleSaveStructure}
        onCancel={cancelEditing}
        onReset={isEditing ? resetToDefaultStructure : undefined}
        canEdit={!!onStructureUpdate}
      />
      
      {!hasValidActs ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          This structure doesn't have any acts or beats defined. You may need to reset it to the default template.
        </div>
      ) : (
        <div className="space-y-3">
          {localStructure.acts.map((act) => (
            <ActSection
              key={`${localStructure.id}-${act.id}`}
              act={act}
              isExpanded={expandedActs[act.id]}
              toggleAct={toggleAct}
              onBeatToggleComplete={handleBeatToggleComplete}
              onBeatsReorder={handleBeatsReorder}
              onBeatUpdate={handleBeatUpdate}
              isEditing={isEditing}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StructurePanel;
