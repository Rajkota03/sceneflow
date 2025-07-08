import React from 'react';
import { SceneEditor as NewSceneEditor } from '../scene-editor/SceneEditor';

interface SceneEditorProps {
  projectId: string;
}

export function SceneEditor({ projectId }: SceneEditorProps) {
  return <NewSceneEditor projectId={projectId} />;
}

export default SceneEditor;