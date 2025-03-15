
import { Note } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NotebookPen, Calendar, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface NotesGridProps {
  notes: Note[];
  onDeleteNote: (noteId: string) => void;
}

const NotesGrid = ({ notes, onDeleteNote }: NotesGridProps) => {
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  const handleViewNote = (note: Note) => {
    // Open a dialog to view the note content
    // For now we'll just show an alert until we implement a note viewer
    alert(`Note content: ${note.content}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <Card key={note.id} className="border border-border bg-card hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg font-medium">{note.title}</CardTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteNote(note.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <CardDescription className="text-xs flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(note.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent onClick={() => handleViewNote(note)} className="cursor-pointer">
            <p className="text-sm text-muted-foreground line-clamp-3 h-14">{note.content}</p>
          </CardContent>
          <CardFooter className="pt-2 pb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-primary w-full"
              onClick={() => handleViewNote(note)}
            >
              View Note
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default NotesGrid;
