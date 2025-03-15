
import React, { useState } from 'react';
import { StoryBeat } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface StoryBeatItemProps {
  beat: StoryBeat;
  onUpdate: (beatId: string, updates: Partial<StoryBeat>) => void;
  onDelete?: () => void;
}

const StoryBeatItem: React.FC<StoryBeatItemProps> = ({ beat, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(beat.title);
  const [description, setDescription] = useState(beat.description);
  
  const handleSave = () => {
    onUpdate(beat.id, { 
      title, 
      description 
    });
    setIsEditing(false);
  };
  
  return (
    <div className="mb-3 last:mb-0 bg-white border rounded-md shadow-sm hover:shadow transition-shadow">
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900">{beat.title}</h3>
          <div className="flex space-x-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0"
                >
                  <Edit size={16} className="text-gray-500" />
                  <span className="sr-only">Edit</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Story Beat</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title" className="text-sm font-medium">
                      Beat Title
                    </label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">
                      Description
                    </label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="button" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={16} className="text-gray-500 hover:text-red-500" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Story Beat</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this story beat? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={onDelete}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
        {beat.description && (
          <p className="mt-1 text-sm text-gray-600">{beat.description}</p>
        )}
      </div>
    </div>
  );
};

export default StoryBeatItem;
