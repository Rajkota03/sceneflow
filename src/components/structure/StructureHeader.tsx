
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Edit, Save, FileText, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onReset?: () => void;
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
  onReset,
  canEdit
}) => {
  return (
    <div className="mb-6 relative group">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{name}</h2>
          {linkedToProject && projectTitle && (
            <span className="text-sm text-gray-600 mt-1 flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              Linked to: {projectTitle}
            </span>
          )}
        </div>
        <div className="text-sm font-medium text-gray-700">
          Overall Progress: {Math.round(progressPercentage)}%
        </div>
      </div>
      
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}
      
      <div className="flex items-center gap-3 mb-4">
        <Progress 
          value={progressPercentage} 
          className={cn(
            "h-2 flex-grow",
            progressPercentage < 30 ? "bg-red-100" :
            progressPercentage < 70 ? "bg-yellow-100" : "bg-green-100"
          )}
        />
      </div>
      
      <div className="flex items-center justify-end mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant={hasChanges ? "default" : "outline"} 
              onClick={onSave} 
              disabled={isSaving || !hasChanges}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Save className="h-3 w-3 mr-1" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            {onReset && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onReset}
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset to Default
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              size="sm" 
              variant={canEdit ? "default" : "outline"} 
              onClick={onEdit}
              disabled={!canEdit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit Structure
            </Button>
          </div>
        )}
      </div>
      
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 mb-4">
          <p className="font-medium">Edit Mode Active</p>
          <p className="text-xs mt-1">You can now edit beat titles, descriptions, add notes, and reorder beats using drag-and-drop.</p>
        </div>
      )}

      <div className="border-b border-gray-200 mb-4"></div>
    </div>
  );
};

export default StructureHeader;
