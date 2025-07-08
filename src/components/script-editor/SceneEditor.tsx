import React from 'react';
import { EnhancedAfterwritingEditor } from '../EnhancedAfterwritingEditor';

interface SceneEditorProps {
  projectId: string;
}

export function SceneEditor({ projectId }: SceneEditorProps) {
  return <EnhancedAfterwritingEditor projectId={projectId} />;
}

export default SceneEditor;