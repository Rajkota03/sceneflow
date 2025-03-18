
import React, { useState } from 'react';
import { Structure } from '@/lib/types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import LoadingState from '@/components/dashboard/LoadingState';
import EmptyState from '@/components/dashboard/EmptyState';
import StructureCard from '@/components/structure/StructureCard';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PlusCircle, ChevronDown } from 'lucide-react';
import { StructureType } from '@/types/scriptTypes';

interface StructuresTabProps {
  structures: Structure[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  handleCreateStructure: (structureType?: StructureType) => void;
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
  const [isStructureMenuOpen, setIsStructureMenuOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Story Structures</h1>
        
        <DropdownMenu open={isStructureMenuOpen} onOpenChange={setIsStructureMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Structure
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => {
              handleCreateStructure('three_act');
              setIsStructureMenuOpen(false);
            }}>
              Three Act Structure
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              handleCreateStructure('save_the_cat');
              setIsStructureMenuOpen(false);
            }}>
              Save the Cat Beat Sheet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              handleCreateStructure('heroes_journey');
              setIsStructureMenuOpen(false);
            }}>
              Hero's Journey
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              handleCreateStructure('story_circle');
              setIsStructureMenuOpen(false);
            }}>
              Story Circle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <DashboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateNewProject={() => setIsStructureMenuOpen(true)}
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
          createNewProject={() => setIsStructureMenuOpen(true)}
          emptyMessage="No structures yet"
          createMessage="Create your first structure"
        />
      )}
    </>
  );
};

export default StructuresTab;
