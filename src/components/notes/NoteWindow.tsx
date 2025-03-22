
import { useState, useRef, useEffect } from 'react';
import { X, Minimize, Maximize, ExternalLink, Edit, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import Draggable from 'react-draggable';

interface NoteWindowProps {
  note: Note;
  onClose: () => void;
  onSplitScreen: (note: Note) => void;
  isFloating: boolean;
  onEditNote?: (note: Note) => void;
}

const NoteWindow = ({ note, onClose, onSplitScreen, isFloating, onEditNote }: NoteWindowProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 300, height: 400 });
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<string[]>(['']);
  const noteRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Log the note when it renders to verify its data
    console.log('NoteWindow rendering note:', note?.id, note?.title);
    
    // Split content into pages if it contains page break markers
    if (note?.content && note.content.includes('---PAGE_BREAK---')) {
      setPages(note.content.split('---PAGE_BREAK---'));
    } else if (note?.content) {
      setPages([note.content]);
    } else {
      setPages(['']);
    }
    
    setCurrentPage(1);
  }, [note]);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleResize = (e: MouseEvent) => {
    if (!noteRef.current) return;
    
    const width = Math.max(200, e.clientX - noteRef.current.getBoundingClientRect().left);
    const height = Math.max(100, e.clientY - noteRef.current.getBoundingClientRect().top);
    
    setWindowSize({ width, height });
  };

  useEffect(() => {
    const handleResizeMouseUp = () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
    
    const handleResizeMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      document.addEventListener('mousemove', handleResize);
      document.addEventListener('mouseup', handleResizeMouseUp);
    };
    
    const resizeHandle = document.getElementById('resize-handle');
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', handleResizeMouseDown as any);
    }
    
    return () => {
      if (resizeHandle) {
        resizeHandle.removeEventListener('mousedown', handleResizeMouseDown as any);
      }
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeMouseUp);
    };
  }, []);

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (direction === 'next' && currentPage < pages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (!note) {
    console.error('Note is undefined in NoteWindow');
    return null;
  }

  const windowContent = (
    <div 
      ref={noteRef}
      className={`flex flex-col bg-white border border-gray-200 shadow-md rounded-md overflow-hidden ${isFloating ? '' : 'h-full'}`}
      style={isFloating ? { width: windowSize.width, height: isCollapsed ? 'auto' : windowSize.height } : undefined}
    >
      <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
        <h3 className="text-sm font-medium truncate">{note.title}</h3>
        <div className="flex items-center space-x-1">
          {isFloating && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={toggleCollapse}
              >
                {isCollapsed ? <Maximize size={12} /> : <Minimize size={12} />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => onSplitScreen(note)}
              >
                <ExternalLink size={12} />
              </Button>
            </>
          )}
          {onEditNote && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => onEditNote(note)}
            >
              <Pencil size={12} />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6" 
            onClick={onClose}
          >
            <X size={12} />
          </Button>
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          <div className="flex-grow p-3 overflow-auto whitespace-pre-wrap text-sm">
            {pages[currentPage - 1]}
          </div>
          
          {pages.length > 1 && (
            <div className="flex items-center justify-between border-t p-1 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 1}
                className="h-6 text-xs px-2"
              >
                Previous
              </Button>
              <span className="text-xs text-gray-500">
                Page {currentPage} of {pages.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange('next')}
                disabled={currentPage === pages.length}
                className="h-6 text-xs px-2"
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
      
      {isFloating && !isCollapsed && (
        <div 
          id="resize-handle"
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
          style={{ 
            background: 'linear-gradient(135deg, transparent 50%, #ddd 50%, #aaa)'
          }}
        />
      )}
    </div>
  );

  return isFloating ? (
    <Draggable handle=".bg-gray-100" bounds="parent">
      <div className="absolute z-40 top-24 right-8">
        {windowContent}
      </div>
    </Draggable>
  ) : (
    windowContent
  );
};

export default NoteWindow;
