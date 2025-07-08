import React from 'react';
import { PaginatedSceneEditor } from './components/PaginatedSceneEditor';

interface SceneEditorProps {
  projectId: string;
}

export function SceneEditor({ projectId }: SceneEditorProps) {
  return <PaginatedSceneEditor projectId={projectId} />;
}

export default SceneEditor;