import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from '@/lib/utils/debounce';

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
      fontFamily: 'Courier New',
      fontSize: 14,
      lineHeight: 20,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
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
          <span className="font-medium">Monaco Screenplay Editor</span>
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
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={logAST}
          disabled={!fountainAST}
        >
          Log AST to Console
        </Button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="plaintext"
          value={content}
          onChange={handleContentChange}
          onMount={handleEditorDidMount}
          theme="vs"
          options={{
            fontFamily: 'Courier New',
            fontSize: 14,
            lineHeight: 20,
            wordWrap: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 20, bottom: 20 },
          }}
        />
      </div>
    </div>
  );
}

export default MonacoScreenplayEditor;