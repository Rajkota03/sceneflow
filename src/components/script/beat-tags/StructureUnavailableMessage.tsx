
import React from 'react';
import { AlertTriangle } from 'lucide-react';

const StructureUnavailableMessage: React.FC = () => {
  return (
    <div className="text-xs text-gray-500 italic flex items-center">
      <AlertTriangle size={12} className="mr-1" />
      No structure available
    </div>
  );
};

export default StructureUnavailableMessage;
