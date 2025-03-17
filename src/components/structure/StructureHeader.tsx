
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, Save } from 'lucide-react';

interface StructureHeaderProps {
  name: string;
  description?: string;
  projectTitle?: string;
  progressPercentage: number;
  isEditing: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  linkedToProject?: boolean;
  onEdit: () => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  canEdit: boolean;
}

const StructureHeader: React.FC<StructureHeaderProps> = ({
  name,
  description,
  projectTitle,
  progressPercentage,
  isEditing,
  isSaving,
  hasChanges,
  linkedToProject = false,
  onEdit,
  onSave,
  onCancel,
  canEdit
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold">{name}</h2>
        {linkedToProject && projectTitle && (
          <span className="text-sm text-gray-600">
            Linked to: {projectTitle}
          </span>
        )}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}
      
      <div className="flex items-center gap-3 mb-3">
        <Progress value={progressPercentage} className="h-2 flex-grow" />
        <span className="text-sm font-medium">
          {Math.round(progressPercentage)}%
        </span>
      </div>
      
      <div className="flex items-center justify-end mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant={hasChanges ? "default" : "outline"} 
              onClick={onSave} 
              disabled={isSaving || !hasChanges}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-3 w-3 mr-1" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button 
            size="sm" 
            variant={canEdit ? "default" : "outline"} 
            onClick={onEdit}
            disabled={!canEdit}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit Structure
          </Button>
        )}
      </div>
    </div>
  );
};

export default StructureHeader;
