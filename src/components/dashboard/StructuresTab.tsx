
import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Network } from 'lucide-react';

interface StructuresTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const StructuresTab: React.FC<StructuresTabProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  // Dummy function for onCreateNewProject
  const handleCreateNewStructure = () => {
    // This is a placeholder function that will be implemented later
    console.log('Create new structure clicked');
  };

  return (
    <>
      <DashboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        projectType="structure"
        onCreateNewProject={handleCreateNewStructure}
      />
      
      <div className="border border-border rounded-lg p-8 mt-4 bg-card">
        <div className="text-center max-w-md mx-auto">
          <Network className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
          <h3 className="text-2xl font-medium mb-2">Story Structure Tools</h3>
          <p className="text-muted-foreground mb-6">
            Coming soon! Break down your screenplay using classical story structures 
            with interactive scene cards and timeline visualization.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm mb-6">
            <div className="flex items-start gap-2">
              <div className="bg-primary/10 p-2 rounded-full">
                <Network className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">Four-Act Structure</p>
                <p className="text-muted-foreground">Act 1, 2A, Midpoint, 2B, Act 3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StructuresTab;
