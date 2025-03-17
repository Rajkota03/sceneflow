
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import ThreeActStructurePanel from '@/components/structure/ThreeActStructurePanel';
import { Structure, Act } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Save, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingState from '@/components/dashboard/LoadingState';

const StructureEditor = () => {
  const { structureId } = useParams<{ structureId: string }>();
  const [structure, setStructure] = useState<Structure | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [structureName, setStructureName] = useState('Save the Cat Beats'); // Changed default name
  const [isSaving, setIsSaving] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchStructure();
  }, [structureId]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

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
        setStructureName(formattedStructure.name);
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

  const handleSaveStructureName = async () => {
    if (!structure || !structureName.trim()) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('structures')
        .update({ 
          name: structureName,
          updated_at: new Date().toISOString()
        })
        .eq('id', structure.id);
      
      if (error) throw error;
      
      setStructure({
        ...structure,
        name: structureName
      });
      
      setIsEditingName(false);
      toast({
        title: 'Success',
        description: 'Structure name updated successfully',
      });
    } catch (error) {
      console.error('Error updating structure name:', error);
      toast({
        title: 'Error',
        description: 'Failed to update structure name',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
      setStructureName(updatedStructure.name);
      
      return;
    } catch (error) {
      console.error('Error updating structure:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="text-white hover:bg-blue-700/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            <div className="flex-1 mx-4 flex items-center justify-center">
              {isEditingName ? (
                <div className="flex items-center gap-2 max-w-md w-full">
                  <Input 
                    ref={nameInputRef}
                    value={structureName}
                    onChange={(e) => setStructureName(e.target.value)}
                    className="bg-blue-700/30 border-blue-500 text-white placeholder-blue-300 focus-visible:ring-blue-500"
                    placeholder="Structure name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveStructureName();
                      } else if (e.key === 'Escape') {
                        setIsEditingName(false);
                        setStructureName(structure?.name || '');
                      }
                    }}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSaveStructureName}
                    disabled={isSaving}
                    className="text-white hover:bg-blue-700/30"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  className="group flex items-center cursor-pointer" 
                  onClick={() => setIsEditingName(true)}
                >
                  <h1 className="text-2xl font-bold tracking-tight">
                    {structure?.name || 'Loading...'}
                  </h1>
                  <Edit className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
            <div className="flex-shrink-0">
              {/* Right side placeholder for balance */}
              <div className="w-24"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {loading ? (
          <LoadingState />
        ) : structure ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
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
    </div>
  );
};

export default StructureEditor;
