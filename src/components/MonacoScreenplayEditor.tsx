import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from '@/lib/utils/debounce';
import { FountainPreview } from './FountainPreview';
import { Eye, Code, FileText } from 'lucide-react';

// Import fountain-js properly
const fountain = require('fountain-js');

interface MonacoScreenplayEditorProps {
  projectId: string;
}

const defaultScreenplayText = `INT. BEDROOM – NIGHT

A man stands quietly.

JANE
I'm not going anywhere.`;

export function MonacoScreenplayEditor({ projectId }: MonacoScreenplayEditorProps) {
  const [content, setContent] = useState(defaultScreenplayText);
  const [fountainAST, setFountainAST] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'raw' | 'preview'>('split');
  const [usePagedView, setUsePagedView] = useState(true);

  // Parse content with fountain-js
  const parseContent = useCallback((text: string) => {
    try {
      const output = fountain.parse(text, true);
      setFountainAST(output);
    } catch (error) {
      console.error('Error parsing fountain content:', error);
      setFountainAST(null);
    }
  }, []);

  // Debounced save to Supabase
  const debouncedSave = useCallback(
    debounce(async (content: string) => {
      try {
        setSaveStatus('saving');
        const { data: userData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !userData.user) {
          console.error('Auth error:', authError);
          setSaveStatus('error');
          return;
        }
        
        const { error } = await supabase
          .from('scenes')
          .upsert({
            id: projectId,
            author_id: userData.user.id,
            project_id: projectId,
            content_fountain: content,
            content_richtext: { type: 'fountain', content },
            updated_at: new Date().toISOString(),
          });
          
        if (error) {
          console.error('Save error:', error);
          setSaveStatus('error');
        } else {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (error) {
        console.error('Failed to save:', error);
        setSaveStatus('error');
      }
    }, 1000),
    [projectId]
  );

  // Load existing content
  useEffect(() => {
    const loadContent = async () => {
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData.user) {
          console.log('No authenticated user for loading content');
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('scenes')
          .select('content_fountain')
          .eq('id', projectId)
          .eq('author_id', userData.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading content:', error);
        } else if (data?.content_fountain) {
          setContent(data.content_fountain);
          parseContent(data.content_fountain);
        }
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [projectId, parseContent]);

  // Handle content changes
  const handleContentChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      parseContent(value);
      debouncedSave(value);
    }
  }, [parseContent, debouncedSave]);

  // Log AST to console
  const logAST = useCallback(() => {
    console.log('Fountain AST:', fountainAST);
  }, [fountainAST]);

  // Configure Monaco editor
  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    // Set editor options
    editor.updateOptions({
      fontFamily: '"Courier Prime", "Courier New", monospace',
      fontSize: 12,
      lineHeight: 24,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      padding: { top: 20, bottom: 20 },
      renderLineHighlight: 'none',
      hideCursorInOverviewRuler: true,
      overviewRulerBorder: false,
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
      }
    });

    // Define screenplay syntax highlighting
    monaco.languages.register({ id: 'fountain' });
    monaco.languages.setMonarchTokensProvider('fountain', {
      tokenizer: {
        root: [
          [/^(INT\.|EXT\.).*$/, 'scene-heading'],
          [/^[A-Z][A-Z\s]+$/, 'character'],
          [/^\(.*\)$/, 'parenthetical'],
          [/^(FADE IN:|FADE OUT\.|CUT TO:|DISSOLVE TO:).*$/, 'transition'],
          [/^>.*<$/, 'action-centered'],
          [/^\*.*\*$/, 'action-emphasized'],
          [/^.*$/, 'action']
        ]
      }
    });

    // Define color theme for screenplay
    monaco.editor.defineTheme('screenplay-theme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'scene-heading', foreground: '000000', fontStyle: 'bold' },
        { token: 'character', foreground: '000000', fontStyle: 'bold' },
        { token: 'parenthetical', foreground: '666666', fontStyle: 'italic' },
        { token: 'transition', foreground: '000000', fontStyle: 'bold' },
        { token: 'action', foreground: '000000' },
        { token: 'action-centered', foreground: '000000' },
        { token: 'action-emphasized', foreground: '000000', fontStyle: 'bold' }
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editorLineNumber.foreground': '#cccccc',
        'editor.selectionBackground': '#add6ff',
        'editor.lineHighlightBackground': '#f5f5f5'
      }
    });

    monaco.editor.setTheme('screenplay-theme');
    monaco.languages.setLanguageConfiguration('fountain', {
      brackets: [['(', ')']],
      autoClosingPairs: [
        { open: '(', close: ')' },
        { open: '"', close: '"' }
      ]
    });

    // Focus the editor
    editor.focus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading screenplay editor...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Status Bar */}
      <div className="px-4 py-2 bg-muted/50 border-b text-sm text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium">Final Draft Style Editor</span>
          {saveStatus === 'saving' && (
            <span className="text-blue-600 animate-pulse">💾 Saving...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-green-600">✅ Saved</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600">❌ Save failed</span>
          )}
        </div>
        
        {/* View Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="paged-view" className="text-xs">Paginated View</Label>
            <Switch
              id="paged-view"
              checked={usePagedView}
              onCheckedChange={setUsePagedView}
            />
          </div>
          
          <div className="flex items-center gap-1 bg-background rounded-lg p-1">
            <Button
              variant={viewMode === 'raw' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('raw')}
              className="h-7 px-2"
            >
              <Code className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'split' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split')}
              className="h-7 px-2"
            >
              <FileText className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="h-7 px-2"
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor and Preview Container */}
      <div className="flex-1 flex flex-col sm:flex-row">
        {/* Monaco Editor */}
        {(viewMode === 'raw' || viewMode === 'split') && (
          <div className={`flex-1 ${viewMode === 'split' ? 'sm:w-1/2 border-r border-muted' : 'w-full'}`}>
            {viewMode === 'split' && (
              <div className="px-4 py-2 bg-muted/30 border-b text-sm font-medium text-muted-foreground">
                Raw Fountain
              </div>
            )}
            <div className="h-full" style={{ 
              background: '#ffffff',
              boxShadow: usePagedView ? 'inset 0 0 0 1px #e0e0e0, 0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}>
              <Editor
                height="100%"
                defaultLanguage="fountain"
                value={content}
                onChange={handleContentChange}
                onMount={handleEditorDidMount}
                theme="screenplay-theme"
                options={{
                  fontFamily: '"Courier Prime", "Courier New", monospace',
                  fontSize: 12,
                  lineHeight: 24,
                  wordWrap: 'on',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: true,
                  automaticLayout: true,
                  padding: usePagedView ? { 
                    top: 72,    // 1 inch top margin
                    bottom: 72, // 1 inch bottom margin  
                    left: 108,  // 1.5 inch left margin
                    right: 72   // 1 inch right margin
                  } : { top: 20, bottom: 20, left: 20, right: 20 },
                  renderLineHighlight: 'none',
                  hideCursorInOverviewRuler: true,
                  overviewRulerBorder: false,
                  rulers: usePagedView ? [612] : [], // 8.5 inch page width marker
                  scrollbar: {
                    vertical: 'auto',
                    horizontal: 'auto',
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`flex-1 ${viewMode === 'split' ? 'sm:w-1/2' : 'w-full'} flex flex-col`}>
            {viewMode === 'split' && (
              <div className="px-4 py-2 bg-muted/30 border-b text-sm font-medium text-muted-foreground">
                Live Preview
              </div>
            )}
            <div className="flex-1">
              <FountainPreview 
                fountainAST={fountainAST} 
                usePagedView={usePagedView}
              />
            </div>
          </div>
        )}
      </div>

      {/* Console Button - moved below the editor/preview */}
      <div className="p-4 border-t bg-muted/30 flex justify-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logAST}
          disabled={!fountainAST}
        >
          Log AST to Console
        </Button>
      </div>
    </div>
  );
}

export default MonacoScreenplayEditor;