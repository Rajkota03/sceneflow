
import { Note } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NotebookPen, Calendar, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface NotesGridProps {
  notes: Note[];
  onDeleteNote: (noteId: string) => void;
  onViewNote?: (note: Note) => void;
  onEditNote?: (note: Note) => void;
}

const NotesGrid = ({ notes, onDeleteNote, onViewNote, onEditNote }: NotesGridProps) => {
  const navigate = useNavigate();

  const formatDate = (date: Date) => {
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      console.error('Invalid date format:', error);
      return 'Unknown date';
    }
  };

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center p-8 bg-slate-50 rounded-md border border-slate-200">
        <NotebookPen className="h-8 w-8 text-slate-400 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No notes yet</h3>
        <p className="text-sm text-slate-500">Create your first note to see it here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <Card key={note.id} className="border border-border bg-card hover:shadow-md transition-shadow group">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <NotebookPen className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg font-medium">{note.title}</CardTitle>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs flex items-center mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(note.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent 
            className="cursor-pointer" 
            onClick={() => onEditNote && onEditNote(note)}
          >
            <p className="text-sm text-muted-foreground line-clamp-3 h-14">{note.content}</p>
          </CardContent>
          <CardFooter className="pt-2 pb-3">
            {onEditNote && (
              <div className="w-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-primary flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNote(note);
                  }}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit Note
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default NotesGrid;
