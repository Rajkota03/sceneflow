import React from 'react';
import { Button } from '@/components/ui/button';

interface SceneEditorToolbarProps {
  projectId: string;
}

export function SceneEditorToolbar({ projectId }: SceneEditorToolbarProps) {
  return (
    <div className="border-b border-border p-4 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Scene Editor - {projectId}</h2>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Export
        </Button>
      </div>
    </div>
  );
}