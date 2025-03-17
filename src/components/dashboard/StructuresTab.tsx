
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, FileText, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { Structure } from '@/lib/types';
import ThreeActStructurePanel from '@/components/structure/ThreeActStructurePanel';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, Dialog } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

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
  const [editMode, setEditMode] = useState(false);
  
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
  
  const handlePreview = (structure: Structure, editingMode: boolean = false) => {
    setSelectedStructure(structure);
    setEditMode(editingMode);
    setPreviewOpen(true);
  };
  
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setSelectedStructure(null);
    setEditMode(false);
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
  
  // Show structures grid
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
            <Card key={structure.id} className="flex flex-col">
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
                  Created: {structure.createdAt.toLocaleDateString()}
                </div>
                {progress > 0 && (
                  <div className="mt-2 text-sm text-gray-500">
                    Progress: {progress}% complete
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePreview(structure)}
                >
                  <Eye size={16} className="mr-2" />
                  Preview
                </Button>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePreview(structure, true)}
                  >
                    <Edit size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteStructure(structure.id)}
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
      
      <Dialog open={previewOpen} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Structure" : "Structure Preview"}
            </DialogTitle>
            <DialogDescription>
              {editMode 
                ? "Edit your structure beats - changes will be saved automatically" 
                : "View the detailed structure and beats"}
            </DialogDescription>
          </DialogHeader>
          {selectedStructure && (
            <ThreeActStructurePanel 
              structure={selectedStructure} 
              onStructureUpdate={editMode ? handleStructureUpdate : undefined}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StructuresTab;
