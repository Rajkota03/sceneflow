
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { Structure } from '@/lib/types';
import ThreeActStructurePanel from '@/components/structure/ThreeActStructurePanel';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface StructuresTabProps {
  structures: Structure[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  handleCreateStructure: () => Promise<void>;
  handleEditStructure: (id: string) => void;
  handleDeleteStructure: (id: string) => Promise<void>;
  handleUpdateStructure?: (updatedStructure: Structure) => Promise<void>;
}

const StructuresTab: React.FC<StructuresTabProps> = ({
  structures,
  searchQuery,
  setSearchQuery,
  isLoading,
  handleCreateStructure,
  handleEditStructure,
  handleDeleteStructure,
  handleUpdateStructure
}) => {
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [structureToDelete, setStructureToDelete] = useState<string | null>(null);
  const [inlineEditMode, setInlineEditMode] = useState(false);
  
  // If loading, show loading state
  if (isLoading) {
    return <LoadingState message="Loading your structures..." />;
  }
  
  // If no structures or filtered results, show empty state
  if (structures.length === 0) {
    return (
      <EmptyState
        title="No structures yet"
        description="Create a story structure to organize your screenplay beats."
        actionLabel="Create Structure"
        actionIcon={<Plus size={16} />}
        onAction={handleCreateStructure}
        searchQuery={searchQuery}
        clearSearch={() => setSearchQuery('')}
      />
    );
  }
  
  const handleOpenPreview = (structure: Structure) => {
    setSelectedStructure(structure);
    setPreviewOpen(true);
  };
  
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedStructure(null);
  };
  
  const handleStartInlineEdit = (structure: Structure) => {
    setSelectedStructure(structure);
    setInlineEditMode(true);
  };
  
  const handleCancelInlineEdit = () => {
    setSelectedStructure(null);
    setInlineEditMode(false);
  };
  
  const confirmDelete = (id: string) => {
    setStructureToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  const executeDelete = async () => {
    if (structureToDelete) {
      await handleDeleteStructure(structureToDelete);
      setDeleteConfirmOpen(false);
      setStructureToDelete(null);
    }
  };
  
  const handleStructureUpdate = async (updatedStructure: Structure) => {
    if (!handleUpdateStructure) {
      toast({
        title: "Update failed",
        description: "Structure update functionality is not available",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await handleUpdateStructure(updatedStructure);
      toast({
        title: "Structure updated",
        description: "Your changes have been saved successfully"
      });
      
      // If we're in inline edit mode, exit it after saving
      if (inlineEditMode) {
        setInlineEditMode(false);
        setSelectedStructure(null);
      }
    } catch (error) {
      console.error("Error updating structure:", error);
      toast({
        title: "Update failed",
        description: "Failed to update structure. Please try again.",
        variant: "destructive"
      });
      throw error; // Re-throw to be caught by the ThreeActStructurePanel
    }
  };
  
  // If we're in inline edit mode, show the editor directly on the page
  if (inlineEditMode && selectedStructure) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancelInlineEdit}
            className="gap-1"
          >
            <ArrowLeft size={16} />
            Back to Structures
          </Button>
          <h2 className="text-xl font-semibold">Editing: {selectedStructure.name}</h2>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          {selectedStructure && (
            <ThreeActStructurePanel 
              structure={selectedStructure} 
              onStructureUpdate={handleStructureUpdate}
              onBeatToggleComplete={(actId, beatId, complete) => {
                if (selectedStructure) {
                  const updatedStructure = {...selectedStructure};
                  const act = updatedStructure.acts.find(a => a.id === actId);
                  if (act) {
                    const beat = act.beats.find(b => b.id === beatId);
                    if (beat) {
                      beat.complete = complete;
                      handleStructureUpdate(updatedStructure);
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </div>
    );
  }
  
  // Show structures grid (default view)
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Structures</h2>
        <Button size="sm" onClick={handleCreateStructure}>
          <Plus size={16} className="mr-2" />
          New Structure
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {structures.map((structure) => {
          // Calculate structure progress
          const totalBeats = structure.acts.reduce((sum, act) => sum + act.beats.length, 0);
          const completeBeats = structure.acts.reduce((sum, act) => 
            sum + act.beats.filter(beat => beat.complete).length, 0);
          const progress = totalBeats > 0 ? Math.round((completeBeats / totalBeats) * 100) : 0;
          
          return (
            <Card key={structure.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{structure.name}</CardTitle>
                {structure.description && (
                  <CardDescription>{structure.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="text-sm text-gray-500">
                  {structure.acts.length} {structure.acts.length === 1 ? 'Act' : 'Acts'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {structure.acts.reduce((total, act) => total + act.beats.length, 0)} Beats
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Created: {new Date(structure.createdAt).toLocaleDateString()}
                </div>
                {progress > 0 && (
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-green-500 h-1.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenPreview(structure)}
                >
                  <Eye size={16} className="mr-2" />
                  Preview
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleStartInlineEdit(structure)}
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => confirmDelete(structure.id)}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {/* Preview dialog - kept separate from edit functionality */}
      <Dialog open={previewOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Structure Preview</DialogTitle>
            <DialogDescription>
              View the detailed structure and beats
            </DialogDescription>
          </DialogHeader>
          {selectedStructure && (
            <ThreeActStructurePanel 
              structure={selectedStructure} 
              onStructureUpdate={undefined}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the structure
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StructuresTab;
