
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Note } from '@/lib/types';
import { Pencil, Save, X, MinusSquare, PlusSquare } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NoteEditorProps {
  note: Note | null;
  onSaveNote: (note: Note) => void;
  onCancel: () => void;
}

const NoteEditor = ({ note, onSaveNote, onCancel }: NoteEditorProps) => {
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pages, setPages] = useState<string[]>(['']);
  
  const isNewNote = !note?.id;

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
  }, [note]);

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
      id: note?.id || '', // Pass empty string for new notes, keep existing ID for edits
      title: noteTitle,
      content: fullContent,
      createdAt: note?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    console.log(isNewNote ? 'Creating new note:' : 'Updating note:', updatedNote);
    onSaveNote(updatedNote);
    
    if (isNewNote) {
      onCancel();
    } else {
      toast({
        title: "Note updated",
        description: `"${noteTitle}" has been updated successfully.`
      });
    }
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

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
    
    const updatedPages = [...pages];
    updatedPages[currentPage - 1] = e.target.value;
    setPages(updatedPages);
  };

  return (
    <Card className="border shadow-md w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium flex items-center">
          <Input
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="Enter note title"
            className="text-lg font-medium"
            autoFocus
          />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
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
        <ScrollArea className="h-[400px] border rounded-md p-4 bg-white">
          <Textarea
            value={noteContent}
            onChange={handleContentChange}
            placeholder="Enter note content"
            className="min-h-[350px] border-0 focus-visible:ring-0 resize-none p-0"
          />
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          <X size={16} className="mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSaveNote}>
          <Save size={16} className="mr-2" />
          {isNewNote ? 'Create Note' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NoteEditor;
