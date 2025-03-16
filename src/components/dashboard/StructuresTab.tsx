
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Network, Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getStructures, deleteStructure } from '@/services/structureService';
import { Structure } from '@/lib/models/structureModel';
import { useToast } from '@/components/ui/use-toast';
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
import { Skeleton } from '@/components/ui/skeleton';

interface StructuresTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const StructuresTab: React.FC<StructuresTabProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStructures() {
      setLoading(true);
      try {
        const data = await getStructures();
        setStructures(data);
      } catch (error) {
        console.error('Error fetching structures:', error);
        toast({
          title: 'Failed to load structures',
          description: 'Please try again later',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchStructures();
  }, [toast]);

  const handleCreateNewStructure = () => {
    navigate('/structure/new');
  };

  const handleDeleteStructure = async (id: string) => {
    try {
      await deleteStructure(id);
      setStructures(structures.filter(structure => structure.id !== id));
      toast({
        title: 'Structure deleted',
        description: 'The structure has been deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting structure:', error);
      toast({
        title: 'Failed to delete structure',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const filteredStructures = structures.filter(
    structure => structure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 structure.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <DashboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        projectType="structure"
        onCreateNewProject={handleCreateNewStructure}
      />
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border">
              <CardHeader>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredStructures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredStructures.map((structure) => (
            <Card key={structure.id} className="border border-border">
              <CardHeader>
                <CardTitle>{structure.name}</CardTitle>
                <CardDescription>
                  Last updated: {new Date(structure.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {structure.description || 'No description provided'}
                </p>
                <p className="text-sm mt-2">
                  <span className="font-medium">Project: </span>
                  {structure.projectTitle || 'Not linked to a project'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => navigate(`/structure/${structure.id}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                
                <div className="flex space-x-2">
                  {structure.projectId && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/editor/${structure.projectId}`)}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Open Project
                    </Button>
                  )}
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the
                          structure and remove it from the database.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteStructure(structure.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="border border-border rounded-lg p-8 mt-4 bg-card">
          <div className="text-center max-w-md mx-auto">
            <Network className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
            <h3 className="text-2xl font-medium mb-2">Story Structure Tools</h3>
            <p className="text-muted-foreground mb-6">
              Break down your screenplay using classical story structures 
              with interactive scene cards and timeline visualization.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm mb-6">
              <div className="flex items-start gap-2">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Network className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Three-Act Structure</p>
                  <p className="text-muted-foreground">Setup, Confrontation, Resolution</p>
                </div>
              </div>
            </div>
            <Button onClick={handleCreateNewStructure}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Structure
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default StructuresTab;
