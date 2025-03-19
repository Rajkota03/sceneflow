
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Structure, Act } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import StructureProgressBar from './StructureProgressBar';

interface StructureCardProps {
  structure: Structure;
  onEdit: (structure: Structure) => void;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

// Helper function to calculate beat completion as a percentage
const calculateProgress = (acts: Act[]): number => {
  let completedBeats = 0;
  let totalBeats = 0;
  
  acts.forEach(act => {
    act.beats.forEach(beat => {
      totalBeats++;
      if (beat.complete) {
        completedBeats++;
      }
    });
  });
  
  return totalBeats > 0 ? (completedBeats / totalBeats) * 100 : 0;
};

const StructureCard: React.FC<StructureCardProps> = ({ 
  structure, 
  onEdit, 
  onDelete,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const progress = calculateProgress(structure.acts);
  
  const handleEditClick = () => {
    onEdit(structure);
  };
  
  const handleViewClick = () => {
    navigate(`/structure/${structure.id}`);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      await onDelete(structure.id);
    } catch (error) {
      console.error('Error deleting structure:', error);
    } finally {
      setIsDeleting(false);
      setDeleteAlertOpen(false);
    }
  };
  
  // Format the dates
  const createdDate = new Date(structure.createdAt);
  const updatedDate = new Date(structure.updatedAt);
  
  const getStructureTypeLabel = () => {
    switch (structure.structure_type) {
      case 'three_act':
        return 'Three Act Structure';
      case 'save_the_cat':
        return 'Save the Cat';
      case 'hero_journey':
        return 'Hero\'s Journey';
      case 'story_circle':
        return 'Story Circle';
      default:
        return 'Three Act Structure';
    }
  };
  
  return (
    <Card className="w-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{structure.name}</CardTitle>
            <CardDescription className="text-sm text-gray-500">
              {getStructureTypeLabel()}
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isLoading || isDeleting}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewClick} disabled={isLoading || isDeleting}>
                View Structure
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditClick} disabled={isLoading || isDeleting}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setDeleteAlertOpen(true)}
                disabled={isLoading || isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        {structure.description && (
          <p className="text-sm text-gray-600 mb-4">{structure.description}</p>
        )}
        
        <div className="mt-2 text-sm text-gray-500">
          <StructureProgressBar 
            structure={structure} 
            progress={progress} 
          />
          <span className="text-xs">{Math.round(progress)}% complete</span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 text-xs text-gray-500 flex justify-between">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>Created: {format(createdDate, 'MMM d, yyyy')}</span>
        </div>
        
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          <span>Updated: {format(updatedDate, 'MMM d, yyyy')}</span>
        </div>
      </CardFooter>
      
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the structure "{structure.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }} 
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting || isLoading}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default StructureCard;
