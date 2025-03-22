
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFormat } from '@/lib/formatContext';
import { Pilcrow } from 'lucide-react';
import { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider';

const FormatMenu = () => {
  const { formatState, setLineSpacing } = useFormat();
  const { elements } = useScriptEditor();

  const handleLineSpacingChange = (spacing: 'single' | '1.5' | 'double') => {
    if (setLineSpacing) {
      setLineSpacing(spacing);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Pilcrow className="h-4 w-4" />
          <span className="sr-only">Format options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLineSpacingChange('single')}
          className={formatState.lineSpacing === 'single' ? 'bg-accent' : ''}
        >
          <span className="text-xs mr-2">1.0</span>
          Single Line Spacing
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLineSpacingChange('1.5')}
          className={formatState.lineSpacing === '1.5' ? 'bg-accent' : ''}
        >
          <span className="text-xs mr-2">1.5</span>
          1.5 Line Spacing
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLineSpacingChange('double')}
          className={formatState.lineSpacing === 'double' ? 'bg-accent' : ''}
        >
          <span className="text-xs mr-2">2.0</span>
          Double Line Spacing
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FormatMenu;
