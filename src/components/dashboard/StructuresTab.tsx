
import React, { useState } from 'react';
import { Structure } from '@/types/scriptTypes';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LoadingState from '@/components/dashboard/LoadingState';
import EmptyState from '@/components/dashboard/EmptyState';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, GitFork, BookOpen, GitBranch } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';

interface StructuresTabProps {
  structures: Structure[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  handleCreateStructure: () => void;
  handleEditStructure: (id: string) => void;
  handleDeleteStructure: (id: string) => Promise<void>;
}

const StructuresTab: React.FC<StructuresTabProps> = ({
  structures,
  searchQuery,
  setSearchQuery,
  isLoading,
  handleCreateStructure,
  handleEditStructure,
  handleDeleteStructure
}) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter structures based on search query
  const filteredStructures = structures.filter(structure => 
    structure.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await handleDeleteStructure(id);
      toast({
        title: "Structure deleted",
        description: "The structure has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting structure:", error);
      toast({
        title: "Error",
        description: "Failed to delete the structure. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <DashboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateNewProject={handleCreateStructure}
        projectType="structure"
        customCreateButton={
          <Button onClick={handleCreateStructure}>Create New Structure</Button>
        }
      />
      
      {isLoading ? (
        <LoadingState />
      ) : filteredStructures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {filteredStructures.map((structure) => (
            <Card key={structure.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold line-clamp-1">{structure.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground mt-1">
                      {structure.acts?.length || 0} acts, {structure.acts?.reduce((sum, act) => sum + act.beats.length, 0) || 0} beats
                    </CardDescription>
                  </div>
                  <GitBranch className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {structure.description || "No description provided."}
                </p>
              </CardContent>
              
              <CardFooter className="pt-2 flex justify-between items-center border-t">
                <div className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(new Date(structure.updatedAt), { addSuffix: true })}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditStructure(structure.id)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Structure</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{structure.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => confirmDelete(structure.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          {deletingId === structure.id ? (
                            <span className="flex items-center">
                              <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                              Deleting...
                            </span>
                          ) : (
                            "Delete"
                          )}
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
        <EmptyState 
          searchQuery={searchQuery}
          clearSearch={() => setSearchQuery('')}
          createNewProject={handleCreateStructure}
          emptyMessage="No structures yet"
          createMessage="Create your first structure"
        />
      )}
    </>
  );
};

export default StructuresTab;
