
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStructures } from '@/services/structureService';
import { Structure } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Plus, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardHeader from './DashboardHeader';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { format } from 'date-fns';
import { toast } from '../ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';

interface StructureCardProps {
  structure: Structure;
  onDelete: (id: string) => void;
}

const StructureCard: React.FC<StructureCardProps> = ({ structure, onDelete }) => {
  const navigate = useNavigate();
  
  const handleEdit = () => {
    navigate(`/structure/${structure.id}`);
  };
  
  const handleDelete = () => {
    onDelete(structure.id);
  };
  
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">{structure.name}</h3>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleEdit}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="icon"
                  className="h-8 w-8"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the structure.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-2">{structure.description}</p>
        <p className="text-xs text-gray-400">
          Updated {format(new Date(structure.updatedAt), 'MMM dd, yyyy')}
        </p>
      </CardContent>
    </Card>
  );
};

const StructuresTab: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: structures, isLoading, error, refetch } = useQuery({
    queryKey: ['structures'],
    queryFn: getStructures
  });
  
  const handleDeleteStructure = async (id: string) => {
    try {
      const { deleteStructure } = await import('@/services/structureService');
      const success = await deleteStructure(id);
      
      if (success) {
        refetch();
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
    }
  };
  
  const handleCreateNew = () => {
    navigate('/structure/new');
  };

  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const filteredStructures = structures?.filter(structure => 
    structure.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading structures</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <DashboardHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        projectType="structure"
        onCreateNewProject={handleCreateNew}
      />
      
      {!structures || structures.length === 0 ? (
        <EmptyState 
          searchQuery={searchQuery}
          clearSearch={clearSearch}
          createNewProject={handleCreateNew}
          emptyMessage="No structures found. Create your first story structure to get started!"
          createMessage="Create New Structure"
          customCreateButton={
            <Button onClick={handleCreateNew}>
              Create New Structure
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStructures.map(structure => (
            <StructureCard 
              key={structure.id} 
              structure={structure} 
              onDelete={handleDeleteStructure} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StructuresTab;
