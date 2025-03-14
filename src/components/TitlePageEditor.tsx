
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface TitlePageData {
  title: string;
  author: string;
  basedOn?: string;
  contact?: string;
  [key: string]: string | undefined; // Add index signature for Json compatibility
}

interface TitlePageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: TitlePageData;
  onSave: (data: TitlePageData) => void;
}

const TitlePageEditor: React.FC<TitlePageEditorProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave
}) => {
  const [formData, setFormData] = useState<TitlePageData>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    toast({
      title: "Title page updated",
      description: "Your title page has been updated successfully."
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Title Page</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="title">Script Title</Label>
            <Input 
              id="title"
              name="title"
              value={formData.title} 
              onChange={handleChange}
              placeholder="Enter the title of your screenplay"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="author">Written by</Label>
            <Input 
              id="author"
              name="author"
              value={formData.author} 
              onChange={handleChange}
              placeholder="Your name or pseudonym"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="basedOn">Based on (optional)</Label>
            <Input 
              id="basedOn"
              name="basedOn"
              value={formData.basedOn} 
              onChange={handleChange}
              placeholder="Based on a novel, true story, etc."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Information (optional)</Label>
            <Textarea 
              id="contact"
              name="contact"
              value={formData.contact} 
              onChange={handleChange}
              placeholder="Address, Phone Number, Email, etc."
              rows={4}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Title Page</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TitlePageEditor;
