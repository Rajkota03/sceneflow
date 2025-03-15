
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThreeActStructure } from '@/lib/types';

interface StructureCardProps {
  projectId: string;
  projectTitle: string;
  structure: ThreeActStructure;
  onDeleteStructure: (projectId: string, e: React.MouseEvent) => void;
}

const StructureCard: React.FC<StructureCardProps> = ({ 
  projectId, 
  projectTitle, 
  structure, 
  onDeleteStructure 
}) => {
  const navigate = useNavigate();

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/editor/${projectId}`);
  };

  const handleStructureClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/structure/${projectId}`);
  };

  return (
    <div 
      className="border rounded-lg p-4 hover:border-primary/70 transition-colors bg-white cursor-pointer"
      onClick={handleStructureClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-lg">{projectTitle}</h3>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-primary hover:bg-primary/10"
            onClick={handleEditClick}
          >
            <Edit2 className="h-4 w-4" />
            <span className="sr-only">Edit screenplay</span>
          </Button>
          <div className="bg-primary/10 p-1 rounded">
            <Network className="h-4 w-4 text-primary" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => onDeleteStructure(projectId, e)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete structure</span>
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Four-Act Structure
      </p>
      <div className="grid grid-cols-5 gap-1 mb-3">
        <div className="bg-[#D3E4FD] h-2 rounded border border-gray-100"></div>
        <div className="bg-[#FEF7CD] h-2 rounded border border-gray-100"></div>
        <div className="bg-[#FFCCCB] h-3 -mt-0.5 rounded flex items-center justify-center border border-gray-100">
          <div className="bg-white h-1 w-1 rounded-full"></div>
        </div>
        <div className="bg-[#FDE1D3] h-2 rounded border border-gray-100"></div>
        <div className="bg-[#F2FCE2] h-2 rounded border border-gray-100"></div>
      </div>
      <div className="text-xs text-muted-foreground">
        Updated {new Date(structure.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default StructureCard;
