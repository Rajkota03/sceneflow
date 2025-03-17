
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import StructurePanel from '@/components/structure/StructurePanel';
import { Structure, Act } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Edit, Save, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import LoadingState from '@/components/dashboard/LoadingState';
import Logo from '@/components/Logo';

const StructureEditor = () => {
  const { structureId } = useParams<{ structureId: string }>();
  const [structure, setStructure] = useState<Structure | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [structureName, setStructureName] = useState('');
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
          createdAt: new Date(data.created_at).toISOString(), // Convert Date to string
          updatedAt: new Date(data.updated_at).toISOString(), // Convert Date to string
          structure_type: data.structure_type || 'three_act'
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
      updatedStructure.structure_type = structure?.structure_type || 'three_act';
      
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
    <div className="min-h-screen bg-gray-50">
      {/* Modern minimalist header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="h-5 w-px bg-gray-200"></div>
            <Logo size="sm" />
          </div>

          <div className="flex-1 max-w-md mx-4">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input 
                  ref={nameInputRef}
                  value={structureName}
                  onChange={(e) => setStructureName(e.target.value)}
                  className="border-gray-300 focus-visible:ring-indigo-500"
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
                  className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div 
                className="group flex items-center cursor-pointer px-3 py-1 rounded-md hover:bg-gray-100" 
                onClick={() => setIsEditingName(true)}
              >
                <h1 className="text-lg font-medium text-gray-800">
                  {structure?.name || 'Loading...'}
                </h1>
                <Edit className="h-3.5 w-3.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {loading ? (
          <LoadingState />
        ) : structure ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <StructurePanel 
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
      </main>
    </div>
  );
};

export default StructureEditor;
