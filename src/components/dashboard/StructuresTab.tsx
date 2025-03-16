import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { getStructures, deleteStructure } from '@/services/structureService';
import DashboardHeader from './DashboardHeader';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Network, Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Structure } from '@/lib/models/structureModel';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface StructuresTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const StructuresTab: React.FC<StructuresTabProps> = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [filteredStructures, setFilteredStructures] = useState<Structure[]>([]);
  const [structureToDelete, setStructureToDelete] = useState<Structure | null>(null);

  useEffect(() => {
    async function loadStructures() {
      setIsLoading(true);
      try {
        const data = await getStructures();
        setStructures(data);
      } catch (error) {
        console.error('Error loading structures:', error);
        toast({
          title: 'Error loading structures',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadStructures();
  }, []);

  useEffect(() => {
    const filtered = structures.filter(structure =>
      structure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      structure.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStructures(filtered);
  }, [searchQuery, structures]);

  const handleCreateNewStructure = () => {
    // Create a new structure and navigate to the structure editor
    const structureId = 'new';
    navigate(`/structure/${structureId}`);
  };

  const handleEditStructure = (structureId: string) => {
    navigate(`/structure/${structureId}`);
  };

  const handleDeleteStructure = async (structure: Structure) => {
    setStructureToDelete(structure);
  };

  const confirmDelete = async () => {
    if (!structureToDelete) return;
    
    try {
      const success = await deleteStructure(structureToDelete.id);
      if (success) {
        setStructures(structures.filter(s => s.id !== structureToDelete.id));
        toast({
          title: 'Structure deleted',
          description: 'The structure has been deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting structure:', error);
      toast({
        title: 'Error deleting structure',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setStructureToDelete(null);
    }
  };

  return (
    <div>
      <DashboardHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        projectType="structure"
        onCreateNewProject={handleCreateNewStructure}
      />

      {isLoading ? (
        <LoadingState message="Loading structures..." />
      ) : structures.length === 0 ? (
        <EmptyState
          icon={<Network className="h-12 w-12 text-primary/50" />}
          title="No structures yet"
          description="Create your first story structure to organize your screenplay."
          actionText="Create Structure"
          onAction={handleCreateNewStructure}
        />
      ) : filteredStructures.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-700">No matching structures found</h3>
          <p className="text-muted-foreground mt-2">Try a different search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filteredStructures.map((structure) => (
            <Card key={structure.id} className="flex flex-col">
              <CardContent className="flex-grow p-6">
                <h3 className="text-lg font-semibold mb-2">{structure.name}</h3>
                {structure.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {structure.description}
                  </p>
                )}
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {structure.acts.slice(0, 3).map((act) => (
                      <div 
                        key={act.id} 
                        className="px-2 py-1 rounded text-xs"
                        style={{ backgroundColor: `${act.colorHex}20`, color: act.colorHex }}
                      >
                        {act.title}
                      </div>
                    ))}
                    {structure.acts.length > 3 && (
                      <div className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                        +{structure.acts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 flex justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive"
                  onClick={() => handleDeleteStructure(structure)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditStructure(structure.id)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {/* Add Structure Card */}
          <Card 
            className="flex flex-col items-center justify-center p-6 border-dashed cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={handleCreateNewStructure}
          >
            <Network className="h-12 w-12 text-primary/40 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Create New Structure</h3>
            <p className="text-muted-foreground text-sm text-center">
              Add a new story structure template
            </p>
          </Card>
        </div>
      )}

      <AlertDialog open={!!structureToDelete} onOpenChange={(open) => !open && setStructureToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the structure "{structureToDelete?.name}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StructuresTab;
