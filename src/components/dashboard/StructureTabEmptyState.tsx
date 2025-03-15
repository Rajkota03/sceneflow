
import React from 'react';
import { Network, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StructureTabEmptyStateProps {
  createNewStructure: () => void;
}

const StructureTabEmptyState: React.FC<StructureTabEmptyStateProps> = ({ createNewStructure }) => {
  return (
    <div className="border border-border rounded-lg p-8 mt-4 bg-card">
      <div className="text-center max-w-md mx-auto">
        <Network className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
        <h3 className="text-2xl font-medium mb-2">Story Structure Tools</h3>
        <p className="text-muted-foreground mb-6">
          Break down your screenplay using classical story structures with a special emphasis on the critical midpoint, 
          creating a four-act framework with interactive scene cards.
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
          <div className="flex items-start gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Bookmark className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium">Highlighted Midpoint</p>
              <p className="text-muted-foreground">Visual emphasis on the crucial turning point</p>
            </div>
          </div>
        </div>
        <Button onClick={createNewStructure}>Create Your First Structure</Button>
      </div>
    </div>
  );
};

export default StructureTabEmptyState;
