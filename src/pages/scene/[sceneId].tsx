import React from 'react';
import { useParams } from 'react-router-dom';
import SceneEditor from '@/components/script-editor/SceneEditor';

export function ScenePage() {
  const { sceneId } = useParams<{ sceneId: string }>();

  if (!sceneId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Scene not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full">
      <SceneEditor projectId={sceneId} />
    </div>
  );
}