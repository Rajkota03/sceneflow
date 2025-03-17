
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/App';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Structure } from '@/lib/types';
import { Json } from '@/integrations/supabase/types';

const StructuresTab = () => {
  const { session } = useAuth();
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newStructureName, setNewStructureName] = useState('');
  const [newStructureDescription, setNewStructureDescription] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (!session) return;
    
    const fetchStructures = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('structures')
          .select('*')
          .eq('author_id', session.user.id);
          
        if (error) throw error;
        
        if (data) {
          const structuresData: Structure[] = data.map(item => {
            // Safely parse the acts JSON data
            let parsedActs = [];
            try {
              if (typeof item.acts === 'string') {
                parsedActs = JSON.parse(item.acts);
              } else if (item.acts && typeof item.acts === 'object') {
                parsedActs = item.acts as any[];
              }
            } catch (e) {
              console.error('Error parsing acts data:', e);
              parsedActs = [];
            }
            
            return {
              id: item.id,
              name: item.name,
              description: item.description,
              acts: parsedActs,
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.updated_at)
            };
          });
          
          setStructures(structuresData);
        }
      } catch (err) {
        console.error('Error fetching structures:', err);
        toast({
          title: 'Error loading structures',
          description: 'Failed to load your structures. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStructures();
  }, [session]);
  
  const handleCreateStructure = async () => {
    if (!session || !newStructureName.trim()) return;
    
    try {
      const newStructureId = `structure-${uuidv4()}`;
      
      const { error } = await supabase
        .from('structures')
        .insert({
          id: newStructureId,
          name: newStructureName.trim(),
          description: newStructureDescription.trim(),
          author_id: session.user.id,
          acts: JSON.stringify([]) as unknown as Json,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      // Add to local state
      setStructures([
        ...structures,
        {
          id: newStructureId,
          name: newStructureName.trim(),
          description: newStructureDescription.trim(),
          acts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
      
      // Reset form
      setNewStructureName('');
      setNewStructureDescription('');
      setCreateDialogOpen(false);
      
      toast({
        title: 'Structure created',
        description: 'Your new structure has been created successfully.',
      });
    } catch (err) {
      console.error('Error creating structure:', err);
      toast({
        title: 'Error creating structure',
        description: 'Failed to create the structure. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleDeleteStructure = async (id: string) => {
    if (!session) return;
    
    try {
      const { error } = await supabase
        .from('structures')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Remove from local state
      setStructures(structures.filter(structure => structure.id !== id));
      
      toast({
        title: 'Structure deleted',
        description: 'The structure has been deleted successfully.',
      });
    } catch (err) {
      console.error('Error deleting structure:', err);
      toast({
        title: 'Error deleting structure',
        description: 'Failed to delete the structure. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return <LoadingState message="Loading your structures..." />;
  }
  
  if (structures.length === 0) {
    return (
      <EmptyState
        title="No structures yet"
        description="Create a story structure to organize your screenplay beats."
        actionLabel="Create Structure"
        actionIcon={<Plus size={16} />}
        onAction={() => setCreateDialogOpen(true)}
      >
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Structure</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newStructureName}
                  onChange={(e) => setNewStructureName(e.target.value)}
                  placeholder="Three Act Structure"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newStructureDescription}
                  onChange={(e) => setNewStructureDescription(e.target.value)}
                  placeholder="A traditional structure with three acts: Setup, Confrontation, and Resolution."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateStructure}>Create Structure</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </EmptyState>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Structures</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus size={16} className="mr-2" />
              New Structure
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Structure</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newStructureName}
                  onChange={(e) => setNewStructureName(e.target.value)}
                  placeholder="Three Act Structure"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newStructureDescription}
                  onChange={(e) => setNewStructureDescription(e.target.value)}
                  placeholder="A traditional structure with three acts: Setup, Confrontation, and Resolution."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateStructure}>Create Structure</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {structures.map((structure) => (
          <Card key={structure.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{structure.name}</CardTitle>
              {structure.description && (
                <CardDescription>{structure.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm text-gray-500">
                {structure.acts.length} {structure.acts.length === 1 ? 'Act' : 'Acts'}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Created: {structure.createdAt.toLocaleDateString()}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <Button variant="outline" size="sm">
                <Edit size={16} className="mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeleteStructure(structure.id)}
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StructuresTab;
