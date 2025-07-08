import React from 'react';
import { MonacoScreenplayEditor } from '../MonacoScreenplayEditor';

interface SceneEditorProps {
  projectId: string;
}

export function SceneEditor({ projectId }: SceneEditorProps) {
  return <MonacoScreenplayEditor projectId={projectId} />;
}

export default SceneEditor;