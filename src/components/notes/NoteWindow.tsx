
import { useState, useRef, useEffect } from 'react';
import { X, Minimize, Maximize, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import Draggable from 'react-draggable';

interface NoteWindowProps {
  note: Note;
  onClose: () => void;
  onSplitScreen: (note: Note) => void;
  isFloating: boolean;
}

const NoteWindow = ({ note, onClose, onSplitScreen, isFloating }: NoteWindowProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 300, height: 400 });
  const noteRef = useRef<HTMLDivElement>(null);
  
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
        <div className="flex-grow p-3 overflow-auto whitespace-pre-wrap text-sm">
          {note.content}
        </div>
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
