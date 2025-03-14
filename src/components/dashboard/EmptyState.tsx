
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  searchQuery: string;
  clearSearch: () => void;
  createNewProject: () => void;
}

const EmptyState = ({ searchQuery, clearSearch, createNewProject }: EmptyStateProps) => {
  if (searchQuery) {
    return (
      <div className="text-center py-16">
        <p className="text-xl font-medium text-slate-900 mb-3">No projects match your search</p>
        <p className="text-slate-600 mb-6">Try adjusting your search terms</p>
        <Button variant="outline" onClick={clearSearch}>Clear Search</Button>
      </div>
    );
  }
  
  return (
    <div className="text-center py-16">
      <p className="text-xl font-medium text-slate-900 mb-3">You don't have any projects yet</p>
      <p className="text-slate-600 mb-6">Create your first screenplay</p>
      <Button onClick={createNewProject}>Create New Project</Button>
    </div>
  );
};

export default EmptyState;
