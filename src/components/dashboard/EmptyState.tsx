
import { Button } from "@/components/ui/button";
import { FileText, PlusCircle, Search, X } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  searchQuery: string;
  clearSearch: () => void;
  createNewProject: () => void;
  emptyMessage?: string;
  createMessage?: string;
  icon?: ReactNode;
}

const EmptyState = ({
  searchQuery,
  clearSearch,
  createNewProject,
  emptyMessage = "No projects found",
  createMessage = "Create a new project",
  icon = <FileText className="h-16 w-16 text-muted-foreground mb-4" />
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {searchQuery ? (
        <>
          <Search className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No results found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            We couldn't find any projects matching "{searchQuery}"
          </p>
          <Button variant="outline" onClick={clearSearch}>
            <X className="mr-2 h-4 w-4" />
            Clear search
          </Button>
        </>
      ) : (
        <>
          {icon}
          <h3 className="text-xl font-medium mb-2">{emptyMessage}</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Get started by creating your first project
          </p>
          <Button onClick={createNewProject}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {createMessage}
          </Button>
        </>
      )}
    </div>
  );
};

export default EmptyState;
