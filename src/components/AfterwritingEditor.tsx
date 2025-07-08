import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { debounce } from '@/lib/utils/debounce';
import { Eye, Code, FileText, Download, Users, FileImage } from 'lucide-react';

interface AfterwritingEditorProps {
  projectId: string;
}

const defaultScreenplayText = `Title: My Screenplay
Author: John Doe

FADE IN:

INT. BEDROOM - NIGHT

A man stands quietly.

JANE
I'm not going anywhere.

FADE OUT.`;

export function AfterwritingEditor({ projectId }: AfterwritingEditorProps) {
  const [content, setContent] = useState(defaultScreenplayText);
  const [parsedContent, setParsedContent] = useState<any>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'split' | 'raw' | 'preview'>('preview');
  const [usePagedView, setUsePagedView] = useState(true);
  const [pageCount, setPageCount] = useState(1);
  const [characterCount, setCharacterCount] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // Parse content with custom Fountain parser (inspired by Afterwriting)
  const parseContent = useCallback(async (text: string) => {
    try {
      const parsed = parseFountain(text);
      setParsedContent(parsed);
      
      // Calculate stats
      setCharacterCount(text.length);
      
      // Generate HTML for preview
      if (parsed && previewRef.current) {
        const html = generateHTML(parsed);
        generatePreview(html, parsed);
      }
    } catch (error) {
      console.error('Error parsing fountain content:', error);
      setParsedContent(null);
    }
  }, []);

  // Custom Fountain parser (based on Afterwriting logic)
  const parseFountain = useCallback((text: string) => {
    const lines = text.split('\n');
    const elements = [];
    let titlePage = null;
    let inTitlePage = true;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip empty lines in title page detection
      if (inTitlePage && !trimmed) continue;
      
      // Title page detection
      if (inTitlePage && (trimmed.toLowerCase().startsWith('title:') || 
                         trimmed.toLowerCase().startsWith('author:') ||
                         trimmed.toLowerCase().startsWith('draft date:') ||
                         trimmed.toLowerCase().startsWith('contact:'))) {
        if (!titlePage) titlePage = {};
        const [key, ...valueParts] = trimmed.split(':');
        titlePage[key.toLowerCase()] = valueParts.join(':').trim();
        continue;
      }
      
      // End of title page detection
      if (inTitlePage && (trimmed.toLowerCase() === 'fade in:' || 
                         trimmed.match(/^(INT\.|EXT\.|EST\.|INT\/EXT\.|I\/E\.)/))) {
        inTitlePage = false;
      }
      
      if (!trimmed) {
        elements.push({ type: 'empty', text: '' });
        continue;
      }
      
      let type = 'action';
      let text = trimmed;
      
      // Scene heading
      if (trimmed.match(/^(INT\.|EXT\.|EST\.|INT\/EXT\.|I\/E\.)/i)) {
        type = 'scene_heading';
        text = trimmed.toUpperCase();
      }
      // Character name (all caps, no periods, relatively short)
      else if (trimmed === trimmed.toUpperCase() && 
               !trimmed.includes('.') && 
               !trimmed.includes('(') &&
               trimmed.length > 1 && 
               trimmed.length < 40 &&
               !trimmed.match(/^(FADE IN|FADE OUT|CUT TO|DISSOLVE TO)/)) {
        type = 'character';
      }
      // Parenthetical
      else if (trimmed.startsWith('(') && trimmed.endsWith(')')) {
        type = 'parenthetical';
      }
      // Transition
      else if (trimmed.match(/^(FADE IN:|FADE OUT\.|CUT TO:|DISSOLVE TO:|MATCH CUT:|JUMP CUT:)/i)) {
        type = 'transition';
        text = trimmed.toUpperCase();
      }
      // If previous element was a character or parenthetical, this is likely dialogue
      else if (i > 0 && elements.length > 0) {
        const prev = elements[elements.length - 1];
        if (prev.type === 'character' || prev.type === 'parenthetical' || prev.type === 'dialogue') {
          type = 'dialogue';
        }
      }
      
      elements.push({ type, text });
    }
    
    return { titlePage, elements };
  }, []);

  // Generate HTML from parsed content
  const generateHTML = useCallback((parsed: any) => {
    if (!parsed.elements) return '';
    
    let html = '';
    
    // Add title page if present
    if (parsed.titlePage) {
      html += '<div class="title-page">';
      if (parsed.titlePage.title) {
        html += `<div class="title">${parsed.titlePage.title}</div>`;
      }
      if (parsed.titlePage.author) {
        html += `<div class="author">by<br>${parsed.titlePage.author}</div>`;
      }
      if (parsed.titlePage['draft date']) {
        html += `<div class="draft-date">${parsed.titlePage['draft date']}</div>`;
      }
      html += '</div>';
    }
    
    // Add screenplay content
    for (const element of parsed.elements) {
      if (element.type === 'empty') {
        html += '<br>';
        continue;
      }
      
      const className = element.type.replace('_', '-');
      html += `<div class="${className}">${element.text}</div>`;
    }
    
    return html;
  }, []);

  // Generate preview HTML with proper styling
  const generatePreview = useCallback((html: string, parsed: any) => {
    if (!previewRef.current) return;

    const styledHTML = `
      <style>
        @page {
          size: 8.5in 11in;
          margin: 1in 1in 1in 1.5in;
          @top-right {
            content: counter(page);
            font-family: "Courier Prime", "Courier New", monospace;
            font-size: 12pt;
          }
        }
        
        .screenplay-content {
          font-family: "Courier Prime", "Courier New", monospace;
          font-size: 12pt;
          line-height: 1.2;
          color: #000;
          background: white;
          max-width: 6in;
          margin: 0 auto;
          padding: ${usePagedView ? '1in 0' : '2rem 0'};
          min-height: ${usePagedView ? '9in' : 'auto'};
        }
        
        .scene-heading {
          margin: 1.5em 0 0.12in 0;
          text-transform: uppercase;
          font-weight: bold;
          page-break-after: avoid;
        }
        
        .action {
          margin: 0.12in 0;
          text-align: left;
        }
        
        .character {
          margin: 0.12in 0 0.06in 2.2in;
          text-transform: uppercase;
          font-weight: bold;
          text-align: left;
          page-break-after: avoid;
        }
        
        .dialogue {
          margin: 0 0 0.12in 1.0in;
          max-width: 4.0in;
          text-align: left;
          page-break-inside: avoid;
        }
        
        .parenthetical {
          margin: 0 0 0.06in 1.6in;
          font-style: italic;
          text-align: left;
          color: #666;
        }
        
        .transition {
          margin: 0.12in 0;
          text-transform: uppercase;
          font-weight: bold;
          text-align: right;
          padding-right: 0.5in;
        }

        .title-page {
          text-align: center;
          page-break-after: always;
          padding-top: 3in;
        }

        .title {
          font-size: 24pt;
          font-weight: bold;
          margin-bottom: 2in;
        }

        .author {
          margin-bottom: 1in;
        }
      </style>
      <div class="screenplay-content">
        ${html}
      </div>
    `;

    previewRef.current.innerHTML = styledHTML;

    // Calculate page count (rough estimation)
    const textLength = content.length;
    const estimatedPages = Math.max(1, Math.ceil(textLength / 3000)); // Rough estimate
    setPageCount(estimatedPages);
  }, [content, usePagedView]);

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
        } else {
          parseContent(defaultScreenplayText);
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
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    parseContent(value);
    debouncedSave(value);
  }, [parseContent, debouncedSave]);

  // Export to PDF
  const exportToPDF = useCallback(() => {
    if (previewRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Screenplay</title>
              <link href="https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
              ${previewRef.current.querySelector('style')?.outerHTML || ''}
            </head>
            <body>
              ${previewRef.current.innerHTML}
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
    }
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
          <span className="font-medium">Afterwriting Editor</span>
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
        
        {/* Stats and Controls */}
        <div className="flex items-center gap-4">
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
            <Label htmlFor="paged-view" className="text-xs">Paginated</Label>
            <Switch
              id="paged-view"
              checked={usePagedView}
              onCheckedChange={setUsePagedView}
            />
          </div>
        </div>
      </div>

      {/* Single Final Draft Style Editor */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {/* Hidden textarea for Fountain input - positioned off-screen but functional */}
          <textarea
            value={content}
            onChange={handleContentChange}
            className="absolute left-[-9999px] opacity-0 pointer-events-none"
            style={{ 
              fontFamily: '"Courier Prime", "Courier New", monospace',
            }}
          />
          
          {/* Final Draft Style Preview */}
          <div 
            className="bg-white mx-auto shadow-xl cursor-text"
            style={{
              width: usePagedView ? '8.5in' : '100%',
              maxWidth: usePagedView ? '8.5in' : 'none',
              minHeight: usePagedView ? '11in' : 'auto',
              boxShadow: usePagedView ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
            }}
            onClick={() => {
              // Focus the hidden textarea when clicking on the preview
              const textarea = document.querySelector('textarea');
              if (textarea) {
                textarea.focus();
              }
            }}
          >
            <div ref={previewRef} className="w-full h-full">
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading Final Draft editor...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AfterwritingEditor;