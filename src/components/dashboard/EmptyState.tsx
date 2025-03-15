
import { SearchX, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface EmptyStateProps {
  searchQuery: string;
  clearSearch: () => void;
  createNewProject: () => void;
  emptyMessage: string;
  createMessage: string;
  customCreateButton?: ReactNode;
}

const EmptyState = ({ 
  searchQuery, 
  clearSearch, 
  createNewProject,
  emptyMessage,
  createMessage,
  customCreateButton
}: EmptyStateProps) => {
  const isSearching = searchQuery.trim().length > 0;
  
  return (
    <div className="border border-border rounded-lg p-12 mt-6 bg-card">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
        {isSearching ? (
          <>
            <SearchX className="h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-xl font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any items matching "{searchQuery}".
            </p>
            <Button variant="outline" onClick={clearSearch}>
              Clear Search
            </Button>
          </>
        ) : (
          <>
            <div className="flex justify-center items-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">{emptyMessage}</h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first project.
            </p>
            {customCreateButton ? (
              customCreateButton
            ) : (
              <Button onClick={createNewProject}>
                {createMessage}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
