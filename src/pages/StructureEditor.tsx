
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ThreeActStructurePanel from '@/components/structure/ThreeActStructurePanel';
import { Structure, Act } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingState from '@/components/dashboard/LoadingState';

const StructureEditor = () => {
  const { structureId } = useParams<{ structureId: string }>();
  const [structure, setStructure] = useState<Structure | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStructure();
  }, [structureId]);

  const fetchStructure = async () => {
    if (!structureId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .eq('id', structureId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        let actsData: Act[] = [];
        try {
          if (typeof data.beats === 'string') {
            const parsed = JSON.parse(data.beats);
            actsData = parsed.acts || [];
          } else if (data.beats && typeof data.beats === 'object') {
            const beatsObj = data.beats as any;
            actsData = beatsObj.acts || [];
          }
        } catch (e) {
          console.error('Error parsing beats data:', e);
          actsData = [];
        }
        
        const formattedStructure: Structure = {
          id: data.id,
          name: data.name,
          description: data.description || undefined,
          acts: actsData,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
        
        setStructure(formattedStructure);
      }
    } catch (error) {
      console.error('Error fetching structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to load structure. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStructure = async (updatedStructure: Structure) => {
    try {
      const beatsData = JSON.stringify({ acts: updatedStructure.acts });
      
      const { error } = await supabase
        .from('structures')
        .update({
          name: updatedStructure.name,
          description: updatedStructure.description,
          beats: beatsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedStructure.id);
      
      if (error) throw error;
      
      setStructure(updatedStructure);
      
      return;
    } catch (error) {
      console.error('Error updating structure:', error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-2xl font-bold">Structure Editor</h1>
      </div>
      
      {loading ? (
        <LoadingState />
      ) : structure ? (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <ThreeActStructurePanel 
            structure={structure} 
            onStructureUpdate={handleUpdateStructure}
          />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Structure not found</p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default StructureEditor;
