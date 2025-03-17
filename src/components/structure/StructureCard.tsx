
import React, { useState } from 'react';
import { Structure } from '@/lib/types';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2,
  FileText,
  Layers,
  Map,
  CircleDot,
  Infinity
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from 'date-fns';
import StructureProgressBar from './StructureProgressBar';

interface StructureCardProps {
  structure: Structure;
  onEdit: (structure: Structure) => void;
  onDelete: (id: string) => Promise<void>;
}

const StructureCard: React.FC<StructureCardProps> = ({ structure, onEdit, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(structure.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const calculateProgress = () => {
    const totalBeats = structure.acts.reduce((sum, act) => sum + act.beats.length, 0);
    const completeBeats = structure.acts.reduce((sum, act) => 
      sum + act.beats.filter(beat => beat.complete).length, 0);
    return totalBeats > 0 ? (completeBeats / totalBeats) * 100 : 0;
  };

  const progressPercentage = calculateProgress();
  
  const getStructureIcon = () => {
    switch (structure.structure_type) {
      case 'save_the_cat':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'hero_journey':
        return <Map className="h-5 w-5 text-emerald-500" />;
      case 'story_circle':
        return <CircleDot className="h-5 w-5 text-pink-500" />;
      case 'three_act':
      default:
        return <Layers className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStructureTypeLabel = () => {
    switch (structure.structure_type) {
      case 'save_the_cat':
        return "Save the Cat";
      case 'hero_journey':
        return "Hero's Journey";
      case 'story_circle':
        return "Story Circle";
      case 'three_act':
      default:
        return "Three Act";
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getStructureIcon()}
            <div>
              <h3 className="font-medium text-gray-900">{structure.name}</h3>
              <p className="text-xs text-gray-500">{getStructureTypeLabel()}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(structure)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onSelect={(e) => e.preventDefault()}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{structure.name}" and all of its beats. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-red-600 text-white hover:bg-red-700"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {structure.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
            {structure.description}
          </p>
        )}
        
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <StructureProgressBar 
            structure={structure}
            progress={progressPercentage}
          />
        </div>
        
        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <span>
            {structure.acts.reduce((sum, act) => sum + act.beats.length, 0)} beats
          </span>
          <span>
            Updated {formatDistanceToNow(structure.updatedAt, { addSuffix: true })}
          </span>
        </div>
      </div>
      
      <div 
        className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-lg cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => onEdit(structure)}
      >
        <div className="flex items-center justify-center text-indigo-600 text-sm">
          <Pencil className="h-3.5 w-3.5 mr-2" />
          Open Structure
        </div>
      </div>
    </div>
  );
};

export default StructureCard;
