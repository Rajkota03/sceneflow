
import React from 'react';
import { ThreeActStructure } from '@/lib/types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LoadingState from '@/components/dashboard/LoadingState';
import EmptyState from '@/components/dashboard/EmptyState';
import StructureCard from './StructureCard';
import StructureTabEmptyState from './StructureTabEmptyState';
import { Button } from '@/components/ui/button';
import StructurePlaceholder from './StructurePlaceholder';

interface StructuresTabProps {
  structures: {projectId: string, projectTitle: string, structure: ThreeActStructure}[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  createNewStructure: () => void;
  handleDeleteStructure: (projectId: string, e: React.MouseEvent) => void;
}

const StructuresTab: React.FC<StructuresTabProps> = ({
  structures,
  searchQuery,
  setSearchQuery,
  isLoading,
  createNewStructure,
  handleDeleteStructure
}) => {
  return (
    <>
      <DashboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateNewProject={createNewStructure}
        projectType="structure"
        customCreateButton={
          <Button onClick={createNewStructure}>Create New Structure</Button>
        }
      />
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <StructurePlaceholder key={i} />
          ))}
        </div>
      ) : structures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structures.map((item) => (
            <StructureCard
              key={item.structure.id}
              projectId={item.projectId}
              projectTitle={item.projectTitle}
              structure={item.structure}
              onDeleteStructure={handleDeleteStructure}
            />
          ))}
        </div>
      ) : (
        <StructureTabEmptyState createNewStructure={createNewStructure} />
      )}
    </>
  );
};

export default StructuresTab;
