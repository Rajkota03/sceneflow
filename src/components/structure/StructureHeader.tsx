
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface StructureHeaderProps {
  title: string;
}

const StructureHeader: React.FC<StructureHeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white border-b border-gray-200 py-4 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard?tab=structures')}
            className="text-gray-600"
          >
            <ArrowLeft size={18} className="mr-1" />
            Back to Structures
          </Button>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>
      </div>
    </div>
  );
};

export default StructureHeader;
