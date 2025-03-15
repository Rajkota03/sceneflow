
import React from 'react';
import { Button } from '@/components/ui/button';

const StructureToolsSidebar: React.FC = () => {
  return (
    <div className="w-full lg:w-80">
      <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-medium mb-4">Structure Tools</h2>
        <div className="space-y-2">
          <Button variant="outline" className="w-full justify-start">
            Four-Part Structure
          </Button>
          <Button variant="outline" className="w-full justify-start text-gray-500" disabled>
            Save the Cat Beats (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full justify-start text-gray-500" disabled>
            Hero's Journey (Coming Soon)
          </Button>
          <Button variant="outline" className="w-full justify-start text-gray-500" disabled>
            Character Arc (Coming Soon)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StructureToolsSidebar;
