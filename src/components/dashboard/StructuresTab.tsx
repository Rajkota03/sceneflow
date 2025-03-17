
import React from 'react';
import { Structure } from '@/lib/types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LoadingState from '@/components/dashboard/LoadingState';
import EmptyState from '@/components/dashboard/EmptyState';
import StructureCard from '@/components/structure/StructureCard';
import { useNavigate } from 'react-router-dom';

interface StructuresTabProps {
  structures: Structure[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  handleCreateStructure: () => void;
  handleEditStructure: (structure: Structure) => void;
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
  const navigate = useNavigate();

  return (
    <>
      <DashboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateNewProject={handleCreateStructure}
        projectType="structure"
      />
      
      {isLoading ? (
        <LoadingState />
      ) : structures.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {structures.map(structure => (
            <StructureCard
              key={structure.id}
              structure={structure}
              onEdit={handleEditStructure}
              onDelete={handleDeleteStructure}
            />
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
