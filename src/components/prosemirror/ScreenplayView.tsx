import React, { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import ProseMirrorEditor, { ProseMirrorEditorRef } from './ProseMirrorEditor';
import { ScriptContent, ScriptElement, Note, ElementType, ActType } from '@/lib/types';
import { BeatMode } from '@/types/scriptTypes';
import TagManager from '../TagManager';
import ZoomControls from '../script-editor/ZoomControls';
import { useFormat } from '@/lib/formatContext';
import { useScriptEditor } from '../script-editor/ScriptEditorProvider';

interface ScreenplayViewProps {
  content: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
  projectName?: string;
  structureName?: string;
  projectId?: string;
  beatMode?: BeatMode;
}

const ScreenplayView: React.FC<ScreenplayViewProps> = ({
  content,
  onChange,
  notes,
  onNoteCreate,
  className = '',
  projectName = "Untitled Project",
  structureName = "Three Act Structure",
  projectId,
  beatMode = 'on'
}) => {
  const editorRef = useRef<ProseMirrorEditorRef>(null);
  const { formatState, setZoomLevel } = useFormat();
  const { showKeyboardShortcuts } = useScriptEditor();
  
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Handle element focus from ProseMirror
  const handleElementFocus = useCallback((elementId: string) => {
    setActiveElementId(elementId);
  }, []);

  // Memoized character names extraction
  const characterNames = useMemo(() => {
    const names = new Set<string>();
    content.elements.forEach(element => {
      if (element.type === 'character') {
        const name = element.text.replace(/\s*\(CONT'D\)\s*$/i, '').trim();
        if (name) {
          names.add(name);
        }
      }
    });
    return Array.from(names);
  }, [content.elements]);

  // Filter elements based on active filters
  const filteredElements = useMemo(() => {
    let filtered = content.elements;

    if (activeTagFilter) {
      filtered = filtered.filter(element => 
        element.tags && element.tags.includes(activeTagFilter)
      );
    }

    if (activeActFilter) {
      // Filter by act - this would need to be implemented based on your act structure
      // For now, we'll just return all elements
      filtered = filtered.filter(element => {
        // Implement act filtering logic here based on your beat/act system
        return true;
      });
    }

    return filtered;
  }, [content.elements, activeTagFilter, activeActFilter]);

  // Create filtered content for ProseMirror
  const filteredContent = useMemo(() => ({
    elements: filteredElements
  }), [filteredElements]);

  // Handle tag filtering
  const handleFilterByTag = useCallback((tag: string | null) => {
    setActiveTagFilter(tag);
    if (tag !== null) {
      setActiveActFilter(null);
    }
  }, []);

  // Handle act filtering
  const handleFilterByAct = useCallback((act: ActType | null) => {
    setActiveActFilter(act);
    if (act !== null) {
      setActiveTagFilter(null);
    }
  }, []);

  // Handle zoom changes
  const handleZoomChange = useCallback((value: number[]) => {
    const newZoomLevel = value[0] / 100;
    if (setZoomLevel) {
      setZoomLevel(newZoomLevel);
    }
  }, [setZoomLevel]);

  // Calculate zoom percentage
  const zoomPercentage = useMemo(() => 
    Math.round(formatState.zoomLevel * 100), 
    [formatState.zoomLevel]
  );

  // Handle content changes from ProseMirror
  const handleContentChange = useCallback((newContent: ScriptContent) => {
    // If we're filtering, we need to merge the changes back into the full content
    if (activeTagFilter || activeActFilter) {
      // For now, when filtering is active, we'll prevent editing
      // This is a simplification - a full implementation would need to handle this properly
      return;
    }
    
    onChange(newContent);
  }, [onChange, activeTagFilter, activeActFilter]);

  // Focus the editor when component mounts
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  return (
    <div className={`flex flex-col w-full h-full relative ${className}`}>
      <div className="flex justify-center w-full h-full overflow-auto p-4">
        <div className="w-full max-w-screen-lg mx-auto">
          {/* Tag manager with Act Bar */}
          <TagManager 
            scriptContent={content}
            onFilterByTag={handleFilterByTag}
            onFilterByAct={handleFilterByAct}
            activeFilter={activeTagFilter}
            activeActFilter={activeActFilter}
            projectName={projectName}
            structureName={structureName}
            beatMode={beatMode}
            projectId={projectId}
          />
          
          {/* Apply zoom transform to the content container */}
          <div 
            className="script-page-container mt-4" 
            style={{
              transform: `scale(${formatState.zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out',
            }}
          >
            {/* Script page styling */}
            <div className="script-page-content bg-white shadow-md" style={{
              fontFamily: '"Courier Prime", "Courier New", monospace',
              fontSize: '12pt',
              position: 'relative',
              width: '8.5in',
              minHeight: '11in',
              margin: '0 auto',
              padding: '1in 1in 1in 1.5in'
            }}>
              {/* Page number */}
              <div className="page-number absolute top-4 right-12 text-gray-500 text-xs" 
                   style={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
                {currentPage}
              </div>
              
              {/* ProseMirror Editor */}
              <ProseMirrorEditor
                ref={editorRef}
                content={filteredContent}
                onChange={handleContentChange}
                onElementFocus={handleElementFocus}
                editable={!activeTagFilter && !activeActFilter} // Disable editing when filtering
                className="prosemirror-screenplay"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Zoom Controls */}
      <ZoomControls 
        zoomPercentage={zoomPercentage}
        onZoomChange={handleZoomChange}
      />
    </div>
  );
};

export default ScreenplayView;