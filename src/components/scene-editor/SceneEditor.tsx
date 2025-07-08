import React from 'react';
import { AfterwritingEditor } from '../AfterwritingEditor';

interface SceneEditorProps {
  projectId: string;
}

export function SceneEditor({ projectId }: SceneEditorProps) {
  return <AfterwritingEditor projectId={projectId} />;
}

export default SceneEditor;