
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

// Import the StructureType from the scriptTypes to ensure consistency
import { StructureType } from '@/types/scriptTypes';

interface StructureEditorProps {}

const StructureEditor: React.FC<StructureEditorProps> = () => {
  const { structureId } = useParams<{ structureId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [structure, setStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!session) {
      navigate('/signin');
      return;
    }
    
    loadStructure();
  }, [session, structureId, navigate]);

  useEffect(() => {
    if (structure) {
      setName(structure.name);
      setDescription(structure.description || '');
    }
  }, [structure]);

  const handleSave = async () => {
    if (!structureId || !structure) return;
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('structures')
        .update({
          name: name,
          description: description,
          updated_at: new Date().toISOString()
        })
        .eq('id', structureId);
      
      if (error) {
        console.error('Error updating structure:', error);
        toast({
          title: "Error",
          description: "Could not update structure. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Success",
        description: "Structure updated successfully.",
      });
      
      // Optimistically update the local state
      if (structure) {
        setStructure({
          ...structure,
          name: name,
          description: description
        });
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: "Error",
        description: "Failed to update structure.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // When retrieving and mapping structure data, ensure proper type conversion
  const loadStructure = async () => {
    if (!structureId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .eq('id', structureId)
        .single();
      
      if (error) {
        console.error('Error loading structure:', error);
        toast({
          title: "Error",
          description: "Could not load structure. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      // Ensure we convert structure_type to the correct StructureType and parse beats to acts
      if (data) {
        // Convert the beats JSON to acts array
        const beatsData = data.beats as Json;
        let acts: Act[] = [];
        
        if (Array.isArray(beatsData)) {
          acts = beatsData as Act[];
        }
        
        const structureData: Structure = {
          id: data.id,
          name: data.name,
          description: data.description || '',
          acts: acts,
          created_at: data.created_at,
          updated_at: data.updated_at,
          structure_type: data.structure_type as StructureType
        };
        
        setStructure(structureData);
      }
    } catch (error) {
      console.error('Error in loadStructure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!structure) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Structure not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Structure</CardTitle>
          <CardDescription>Modify the structure details here.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StructureEditor;
