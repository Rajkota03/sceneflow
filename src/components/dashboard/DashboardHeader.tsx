
import { SearchIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateNewProject: () => void;
  projectType: 'screenplay' | 'note' | 'structure';
  customCreateButton?: ReactNode;
}

const DashboardHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  onCreateNewProject,
  projectType,
  customCreateButton
}: DashboardHeaderProps) => {
  const placeholderText = `Search ${projectType}s...`;
  const buttonText = `Create New ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}`;
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 mb-6">
      <div className="relative w-full sm:w-64 md:w-80">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholderText}
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {customCreateButton ? (
        customCreateButton
      ) : (
        <Button onClick={onCreateNewProject} size="sm">
          {buttonText}
        </Button>
      )}
    </div>
  );
};

export default DashboardHeader;
