import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createEditor, Descendant, Editor, Transforms } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import debug from 'debug';

import { SceneEditorProps } from './types';
import { BLANK_DOCUMENT, EMPTY_ACTION } from '@/lib/slate/screenplaySchema';
import { useScreenplayShortcuts } from '@/lib/slate/useScreenplayShortcuts';
import { ScreenplayFormatPills } from '@/lib/slate/ScreenplayFormatPills';
import { RawFountainEditor } from './components/RawFountainEditor';
import { toFountain, toFDX } from './utils/exportHelpers';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

const log = debug('scene-editor');

export function SceneEditor({ scriptId }: SceneEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'raw'>('write');
  const [fountainContent, setFountainContent] = useState('');
  
  // Initialize Slate editor
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
  // Initialize value with starter content
  const [value, setValue] = useState<Descendant[]>(BLANK_DOCUMENT);
  
  // Screenplay shortcuts
  const shortcutsProps = useScreenplayShortcuts(editor);

  // Focus safeguard
  const handleFocus = useCallback(() => {
    try {
      // Simple check - if value is empty or only has empty text, ensure we have content
      if (value.length === 0) {
        setValue(BLANK_DOCUMENT as any);
      }
    } catch (error) {
      log('Focus error:', error);
    }
  }, [value]);

  // Update fountain content when value changes
  useEffect(() => {
    if (activeTab === 'raw') {
      try {
        // Convert Slate value to fountain format
        const fountain = value.map((node: any) => {
          const text = node.children?.map((child: any) => child.text).join('') || '';
          const type = node.type || 'action';
          
          switch (type) {
            case 'sceneHeading':
              return text.toUpperCase();
            case 'character':
              return `\t\t\t\t${text.toUpperCase()}`;
            case 'dialogue':
              return `\t\t${text}`;
            case 'parenthetical':
              return `\t\t\t(${text})`;
            case 'transition':
              return `\t\t\t\t\t\t${text.toUpperCase()}`;
            default:
              return text;
          }
        }).join('\n\n');
        
        setFountainContent(fountain);
      } catch (error) {
        log('Error converting to fountain:', error);
      }
    }
  }, [value, activeTab]);

  const handleExportFountain = () => {
    const blob = new Blob([fountainContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene-${scriptId}.fountain`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportFDX = () => {
    // Simple FDX export - can be enhanced later
    const fdxContent = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Template="No" Version="1">
  <Content>
    ${value.map((node: any) => {
      const text = node.children?.map((child: any) => child.text).join('') || '';
      const type = node.type || 'Action';
      return `<Paragraph Type="${type}"><Text>${text}</Text></Paragraph>`;
    }).join('\n    ')}
  </Content>
</FinalDraft>`;
    
    const blob = new Blob([fdxContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scene-${scriptId}.fdx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render element based on type
  const renderElement = useCallback((props: any) => {
    const { attributes, children, element } = props;
    
    switch (element.type) {
      case 'sceneHeading':
        return (
          <div {...attributes} className="font-bold uppercase mb-4 text-left">
            {children}
          </div>
        );
      case 'action':
        return (
          <div {...attributes} className="mb-2 text-left">
            {children}
          </div>
        );
      case 'character':
        return (
          <div {...attributes} className="text-center font-bold uppercase mt-4 mb-0">
            {children}
          </div>
        );
      case 'dialogue':
        return (
          <div {...attributes} className="max-w-md mx-auto text-left mb-2">
            {children}
          </div>
        );
      case 'parenthetical':
        return (
          <div {...attributes} className="max-w-xs mx-auto text-left italic mb-0">
            {children}
          </div>
        );
      case 'transition':
        return (
          <div {...attributes} className="text-right font-bold uppercase mt-4 mb-4">
            {children}
          </div>
        );
      default:
        return (
          <div {...attributes} className="mb-2">
            {children}
          </div>
        );
    }
  }, []);

  const renderLeaf = useCallback((props: any) => {
    return <span {...props.attributes}>{props.children}</span>;
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="border-b border-border p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Scene Editor</h2>
        <div className="flex gap-2">
          <Button onClick={handleExportFountain} variant="outline" size="sm">
            Export Fountain
          </Button>
          <Button onClick={handleExportFDX} variant="outline" size="sm">
            Export FDX
          </Button>
        </div>
      </div>

      {/* Editor Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'write' | 'raw')} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="write">Write</TabsTrigger>
          <TabsTrigger value="raw">Raw</TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="flex-1 overflow-hidden relative">
          <div className="h-full overflow-auto p-4">
            <div className="max-w-4xl mx-auto">
              <Slate
                editor={editor}
                initialValue={value}
                onChange={setValue}
              >
                <Editable
                  {...shortcutsProps}
                  onFocus={handleFocus}
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  className="screenplay-content min-h-96 outline-none"
                  style={{
                    fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
                    fontSize: '12pt',
                    lineHeight: '1.2',
                  }}
                />
              </Slate>
            </div>
          </div>
          <ScreenplayFormatPills />
        </TabsContent>

        <TabsContent value="raw" className="flex-1 overflow-hidden">
          <div className="h-full p-4">
            <div className="max-w-4xl mx-auto h-full">
              {activeTab === 'raw' && (
                <RawFountainEditor
                  content={fountainContent}
                  onChange={setFountainContent}
                />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export { toFountain, toFDX };