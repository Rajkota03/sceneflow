
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { Structure } from '@/lib/types';

interface StructuresTabProps {
  structures: Structure[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  handleCreateStructure: () => Promise<void>;
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
        {structures.map((structure) => (
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
              <div className="mt-2 text-sm text-gray-500">
                Created: {structure.createdAt.toLocaleDateString()}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleEditStructure(structure.id)}
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
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StructuresTab;
