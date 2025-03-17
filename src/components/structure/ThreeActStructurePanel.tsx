
import React from 'react';
import { Structure } from '@/lib/types';
import { useStructureState } from './useStructureState';
import StructureHeader from './StructureHeader';
import ActSection from './ActSection';

interface ThreeActStructurePanelProps {
  structure: Structure;
  onBeatToggleComplete?: (actId: string, beatId: string, complete: boolean) => void;
  onBeatDragDrop?: (beatId: string, targetSceneId: string) => void;
  onStructureUpdate?: (updatedStructure: Structure) => Promise<void>;
  linkedToProject?: boolean;
}

const ThreeActStructurePanel: React.FC<ThreeActStructurePanelProps> = ({
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
    setIsEditing,
    cancelEditing
  } = useStructureState({ structure, onStructureUpdate });

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
        canEdit={!!onStructureUpdate}
      />
      
      <div className="space-y-3">
        {localStructure.acts.map((act) => (
          <ActSection
            key={act.id}
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
    </div>
  );
};

export default ThreeActStructurePanel;
