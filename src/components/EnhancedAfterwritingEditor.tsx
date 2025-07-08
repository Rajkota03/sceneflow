import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from '@/lib/utils/debounce';
import { Eye, Code, FileText, Download, Users, FileImage, Undo, Redo } from 'lucide-react';
import { useUndoRedo, Command } from '@/hooks/useUndoRedo';
import { ScriptElementData } from '@/hooks/useScriptElement';
import InteractiveElement from '@/components/script-elements/InteractiveElement';
import { ElementType } from '@/lib/types';
import { generateUniqueId } from '@/lib/formatScript';

interface EnhancedAfterwritingEditorProps {
  projectId: string;
}

export function EnhancedAfterwritingEditor({ projectId }: EnhancedAfterwritingEditorProps) {
  const [elements, setElements] = useState<ScriptElementData[]>([]);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [usePagedView, setUsePagedView] = useState(true);
  const [showTypeIndicators, setShowTypeIndicators] = useState(true);
  const [pageCount, setPageCount] = useState(1);
  const [characterCount, setCharacterCount] = useState(0);
  const scriptContentRef = useRef<HTMLDivElement>(null);
  
  const { executeCommand, undo, redo, canUndo, canRedo } = useUndoRedo();

  // Convert elements to Fountain text for saving
  const elementsToFountain = useCallback((elementList: ScriptElementData[]): string => {
    return elementList.map(element => {
      switch (element.type) {
        case 'scene-heading':
          return element.text.toUpperCase();
        case 'character':
          return element.text.toUpperCase();
        case 'parenthetical':
          return element.text.startsWith('(') ? element.text : `(${element.text})`;
        case 'transition':
          return element.text.toUpperCase();
        default:
          return element.text;
      }
    }).join('\n\n');
  }, []);

  // Parse Fountain text to elements
  const fountainToElements = useCallback((fountainText: string): ScriptElementData[] => {
    if (!fountainText.trim()) {
      const defaultElement = { id: generateUniqueId(), type: 'action' as ElementType, text: '' };
      return [defaultElement];
    }

    const lines = fountainText.split('\n');
    const newElements: ScriptElementData[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (!trimmed) continue;
      
      let type: ElementType = 'action';
      
      // Auto-detect type
      if (/^(INT\.|EXT\.|EST\.|I\/E\.)/i.test(trimmed)) {
        type = 'scene-heading';
      } else if (trimmed === trimmed.toUpperCase() && trimmed.length < 30 && !trimmed.includes('.') && trimmed.length > 1) {
        type = 'character';
      } else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        type = 'parenthetical';
      } else if (/^(FADE|CUT TO|DISSOLVE)/i.test(trimmed)) {
        type = 'transition';
      } else if (i > 0 && newElements.length > 0) {
        const prev = newElements[newElements.length - 1];
        if (prev.type === 'character' || prev.type === 'parenthetical') {
          type = 'dialogue';
        }
      }
      
      newElements.push({
        id: generateUniqueId(),
        type,
        text: trimmed
      });
    }
    
    return newElements.length > 0 ? newElements : [{ id: generateUniqueId(), type: 'action', text: '' }];
  }, []);

  // Debounced save to Supabase
  const debouncedSave = useCallback(
    debounce(async (elementList: ScriptElementData[]) => {
      try {
        setSaveStatus('saving');
        const { data: userData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !userData.user) {
          setSaveStatus('error');
          return;
        }
        
        const fountainContent = elementsToFountain(elementList);
        setCharacterCount(fountainContent.length);
        
        const { error } = await supabase
          .from('scenes')
          .upsert({
            id: projectId,
            author_id: userData.user.id,
            project_id: projectId,
            content_fountain: fountainContent,
            content_richtext: { type: 'fountain', content: fountainContent },
            updated_at: new Date().toISOString(),
          });
          
        if (error) {
          setSaveStatus('error');
        } else {
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus('idle'), 2000);
        }
      } catch (error) {
        setSaveStatus('error');
      }
    }, 1000),
    [projectId, elementsToFountain]
  );

  // Handle element updates
  const handleElementUpdate = useCallback((id: string, text: string, type: ElementType) => {
    const updateCommand: Command = {
      execute: () => {
        setElements(prev => prev.map(el => 
          el.id === id ? { ...el, text, type } : el
        ));
      },
      undo: () => {
        setElements(prev => {
          const current = prev.find(el => el.id === id);
          if (current) {
            return prev.map(el => 
              el.id === id ? { ...el, text: current.text, type: current.type } : el
            );
          }
          return prev;
        });
      },
      description: `Update element ${type}`
    };
    
    executeCommand(updateCommand);
  }, [executeCommand]);

  // Handle navigation between elements
  const handleNavigate = useCallback((direction: 'up' | 'down', currentId: string) => {
    const currentIndex = elements.findIndex(el => el.id === currentId);
    if (currentIndex === -1) return;
    
    const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (nextIndex >= 0 && nextIndex < elements.length) {
      setActiveElementId(elements[nextIndex].id);
    }
  }, [elements]);

  // Handle Enter key - create new element
  const handleEnter = useCallback((currentId: string, createAfter: boolean) => {
    if (!createAfter) return;
    
    const currentIndex = elements.findIndex(el => el.id === currentId);
    if (currentIndex === -1) return;
    
    const newElement: ScriptElementData = {
      id: generateUniqueId(),
      type: 'action',
      text: ''
    };
    
    const addCommand: Command = {
      execute: () => {
        setElements(prev => {
          const newElements = [...prev];
          newElements.splice(currentIndex + 1, 0, newElement);
          return newElements;
        });
        setActiveElementId(newElement.id);
      },
      undo: () => {
        setElements(prev => prev.filter(el => el.id !== newElement.id));
        setActiveElementId(currentId);
      },
      description: 'Add new element'
    };
    
    executeCommand(addCommand);
  }, [elements, executeCommand]);

  // Handle element deletion
  const handleDelete = useCallback((id: string) => {
    const elementIndex = elements.findIndex(el => el.id === id);
    if (elementIndex === -1 || elements.length <= 1) return;
    
    const elementToDelete = elements[elementIndex];
    const nextActiveId = elements[elementIndex - 1]?.id || elements[elementIndex + 1]?.id || null;
    
    const deleteCommand: Command = {
      execute: () => {
        setElements(prev => prev.filter(el => el.id !== id));
        setActiveElementId(nextActiveId);
      },
      undo: () => {
        setElements(prev => {
          const newElements = [...prev];
          newElements.splice(elementIndex, 0, elementToDelete);
          return newElements;
        });
        setActiveElementId(id);
      },
      description: 'Delete element'
    };
    
    executeCommand(deleteCommand);
  }, [elements, executeCommand]);

  // Auto-save when elements change
  useEffect(() => {
    if (elements.length > 0) {
      debouncedSave(elements);
    }
  }, [elements, debouncedSave]);

  // Calculate page count
  useEffect(() => {
    const textLength = elementsToFountain(elements).length;
    const estimatedPages = Math.max(1, Math.ceil(textLength / 3000));
    setPageCount(estimatedPages);
  }, [elements, elementsToFountain]);

  // Load existing content
  useEffect(() => {
    const loadContent = async () => {
      try {
        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData.user) {
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
          const loadedElements = fountainToElements(data.content_fountain);
          setElements(loadedElements);
          setActiveElementId(loadedElements[0]?.id || null);
        } else {
          const defaultElements = fountainToElements('');
          setElements(defaultElements);
          setActiveElementId(defaultElements[0]?.id || null);
        }
      } catch (error) {
        console.error('Failed to load content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [projectId, fountainToElements]);

  // Auto-focus first element when editor loads
  useEffect(() => {
    if (!isLoading && elements.length > 0 && activeElementId) {
      // Small delay to ensure elements are rendered
      setTimeout(() => {
        const firstElement = document.getElementById(activeElementId)?.querySelector('[contenteditable="true"]') as HTMLElement;
        if (firstElement) {
          firstElement.focus();
        }
      }, 100);
    }
  }, [isLoading, activeElementId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Export to PDF
  const exportToPDF = useCallback(() => {
    const fountainContent = elementsToFountain(elements);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Screenplay</title>
            <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
            <style>
              body {
                font-family: "Courier Prime", "Courier New", monospace;
                font-size: 12pt;
                line-height: 1.2;
                white-space: pre-wrap;
                margin: 1in 1in 1in 1.5in;
              }
            </style>
          </head>
          <body>
            ${fountainContent.replace(/\n/g, '<br>')}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }, [elements, elementsToFountain]);

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
          <span className="font-medium">Enhanced Editor</span>
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
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              className="flex items-center gap-1 h-7 px-2"
            >
              <Undo className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              className="flex items-center gap-1 h-7 px-2"
            >
              <Redo className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <FileImage className="h-3 w-3" />
              <span>{pageCount} page{pageCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{characterCount.toLocaleString()} chars</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            className="flex items-center gap-1 h-7 px-2"
          >
            <Download className="h-3 w-3" />
            PDF
          </Button>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="type-indicators" className="text-xs">Types</Label>
            <Switch
              id="type-indicators"
              checked={showTypeIndicators}
              onCheckedChange={setShowTypeIndicators}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Label htmlFor="paged-view" className="text-xs">Paginated</Label>
            <Switch
              id="paged-view"
              checked={usePagedView}
              onCheckedChange={setUsePagedView}
            />
          </div>
        </div>
      </div>

      {/* Script Editor */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div 
            ref={scriptContentRef}
            className={`bg-white mx-auto shadow-xl transition-all duration-200`}
            style={{
              width: usePagedView ? '8.5in' : '100%',
              maxWidth: usePagedView ? '8.5in' : 'none',
              minHeight: usePagedView ? '11in' : 'auto',
              boxShadow: usePagedView ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
            }}
          >
            <div 
              className="script-page-content"
              style={{
                padding: usePagedView ? '1in 1in 1in 1.5in' : '2rem',
                fontFamily: '"Courier Prime", "Courier New", monospace',
                fontSize: '12pt',
                lineHeight: '1.2',
              }}
            >
              {elements.map((element) => (
                <InteractiveElement
                  key={element.id}
                  element={element}
                  onUpdate={handleElementUpdate}
                  onNavigate={handleNavigate}
                  onEnter={handleEnter}
                  onDelete={handleDelete}
                  isActive={activeElementId === element.id}
                  showTypeIndicator={showTypeIndicators}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedAfterwritingEditor;