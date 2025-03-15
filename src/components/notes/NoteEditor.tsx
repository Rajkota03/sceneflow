import { useState, useEffect, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Note } from '@/lib/types';
import { Pencil, Save, X, MinusSquare, PlusSquare } from 'lucide-react';
import Draggable from 'react-draggable';

interface NoteEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onSaveNote: (note: Note) => void;
}

const NoteEditor = ({ open, onOpenChange, note, onSaveNote }: NoteEditorProps) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<string[]>(['']);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editorHeight, setEditorHeight] = useState(300);
  const isNewNote = !note?.id;
  const nodeRef = useRef(null);

  useEffect(() => {
    if (note) {
      setNoteTitle(note.title);
      
      if (note.content.includes('---PAGE_BREAK---')) {
        const contentPages = note.content.split('---PAGE_BREAK---');
        setPages(contentPages);
        setNoteContent(contentPages[0]);
      } else {
        setPages([note.content]);
        setNoteContent(note.content);
      }
      
      setCurrentPage(1);
    } else {
      setNoteTitle('');
      setNoteContent('');
      setPages(['']);
      setCurrentPage(1);
    }
  }, [note, open]);

  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note",
        variant: "destructive"
      });
      return;
    }
    
    const fullContent = pages.join('---PAGE_BREAK---');
    
    const updatedNote: Note = {
      id: note?.id || `note-${Date.now()}`,
      title: noteTitle,
      content: fullContent,
      createdAt: note?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    console.log(isNewNote ? 'Creating new note:' : 'Updating note:', updatedNote);
    onSaveNote(updatedNote);
    
    toast({
      title: isNewNote ? "Note created" : "Note updated",
      description: `"${noteTitle}" has been ${isNewNote ? 'created' : 'updated'} successfully.`
    });
    
    if (isNewNote) {
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handlePageChange = (pageNum: number) => {
    const updatedPages = [...pages];
    updatedPages[currentPage - 1] = noteContent;
    setPages(updatedPages);
    
    setCurrentPage(pageNum);
    setNoteContent(pages[pageNum - 1]);
  };

  const addNewPage = () => {
    const updatedPages = [...pages];
    updatedPages[currentPage - 1] = noteContent;
    
    updatedPages.push('');
    setPages(updatedPages);
    
    const newPageNumber = updatedPages.length;
    setCurrentPage(newPageNumber);
    setNoteContent('');
  };

  const deletePage = () => {
    if (pages.length <= 1) {
      toast({
        title: "Cannot delete page",
        description: "You must have at least one page",
        variant: "destructive"
      });
      return;
    }
    
    const updatedPages = [...pages];
    updatedPages.splice(currentPage - 1, 1);
    setPages(updatedPages);
    
    const newPageNumber = currentPage > 1 ? currentPage - 1 : 1;
    setCurrentPage(newPageNumber);
    setNoteContent(updatedPages[newPageNumber - 1]);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    setEditorHeight(isFullScreen ? 300 : 600);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
    
    const updatedPages = [...pages];
    updatedPages[currentPage - 1] = e.target.value;
    setPages(updatedPages);
  };

  const dialogContent = (
    <DialogContent 
      className={`${isFullScreen ? 'sm:max-w-3xl h-[80vh]' : 'sm:max-w-md'} overflow-hidden`}
      onInteractOutside={(e) => e.preventDefault()}
    >
      <DialogHeader>
        <DialogTitle>{isNewNote ? 'Create New Note' : 'Edit Note'}</DialogTitle>
        <DialogDescription>
          {isNewNote ? 'Add a note for your screenplay' : 'Edit your note'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4 flex-grow overflow-hidden">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">Title</label>
          <Input
            id="title"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Enter note title"
            autoFocus
          />
        </div>
        <div className="space-y-2 flex-grow overflow-hidden">
          <div className="flex justify-between items-center">
            <label htmlFor="content" className="text-sm font-medium">Content</label>
            <div className="flex space-x-2 items-center">
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {pages.length}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handlePageChange(Math.min(pages.length, currentPage + 1))}
                disabled={currentPage === pages.length}
              >
                Next
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={addNewPage}
                title="Add new page"
              >
                <PlusSquare size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={deletePage}
                disabled={pages.length <= 1}
                title="Delete current page"
              >
                <MinusSquare size={16} />
              </Button>
            </div>
          </div>
          <Textarea
            id="content"
            value={noteContent}
            onChange={handleContentChange}
            placeholder="Enter note content"
            style={{ height: `${editorHeight}px`, transition: 'height 0.3s ease' }}
            className="resize-none overflow-auto flex-grow"
          />
        </div>
      </div>
      <DialogFooter className="flex justify-between items-center">
        <div>
          <Button variant="outline" onClick={toggleFullScreen} className="mr-2">
            {isFullScreen ? 'Minimize' : 'Expand'}
          </Button>
        </div>
        <div>
          <Button variant="outline" onClick={handleClose} className="mr-2">
            Cancel
          </Button>
          <Button onClick={handleSaveNote}>
            <Save size={16} className="mr-2" />
            {isNewNote ? 'Create Note' : 'Save Changes'}
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );

  if (!isFullScreen) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Draggable nodeRef={nodeRef} handle=".dialog-header" bounds="parent">
        <div ref={nodeRef}>
          {dialogContent}
        </div>
      </Draggable>
    </Dialog>
  );
};

export default NoteEditor;
