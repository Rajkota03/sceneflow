
import { ScriptContent } from '@/lib/types';
import ScriptEditor from './ScriptEditor';

interface ScriptEditorAdapterProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  className?: string;
  projectName?: string;
  structureName?: string;
  projectId?: string;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
}

const ScriptEditorAdapter = ({
  initialContent,
  onChange,
  className,
  projectName,
  structureName,
  projectId,
  selectedStructureId,
  onStructureChange
}: ScriptEditorAdapterProps) => {
  return (
    <ScriptEditor
      content={initialContent}
      onContentChange={onChange}
      projectId={projectId}
      selectedStructureId={selectedStructureId}
      onStructureChange={onStructureChange}
    />
  );
};

export default ScriptEditorAdapter;
