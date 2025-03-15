
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface StructureTitleEditorProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTitleBlur: () => void;
  onSave?: () => void;
  isSaving?: boolean;
}

const StructureTitleEditor: React.FC<StructureTitleEditorProps> = ({
  title,
  onTitleChange,
  onTitleBlur,
  onSave,
  isSaving = false
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          <Input
            type="text"
            placeholder="Enter structure title"
            value={title}
            onChange={onTitleChange}
            onBlur={onTitleBlur}
            className="text-xl font-semibold text-gray-800 bg-white border-gray-300 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </h2>
        {onSave && (
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default StructureTitleEditor;
