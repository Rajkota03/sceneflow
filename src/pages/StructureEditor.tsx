
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStructure } from '@/hooks/useStructure';
import { createDefaultStructure } from '@/lib/models/structureModel';
import { getStructureById, saveStructure as saveStructureToDb } from '@/services/structureService';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import StructureEditor from '@/components/structure/StructureEditor';
import { LoadingState, NotFoundState } from '@/components/structure/StructureStates';

const StructureEditorPage: React.FC = () => {
  const { structureId } = useParams<{ structureId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [structure, setStructure] = useState<any>(null);

  useEffect(() => {
    async function loadStructure() {
      setIsLoading(true);
      try {
        if (structureId && structureId !== 'new') {
          const loadedStructure = await getStructureById(structureId);
          if (!loadedStructure) {
            throw new Error('Structure not found');
          }
          setStructure(loadedStructure);
        } else {
          // Create a new default structure
          const newStructure = createDefaultStructure();
          newStructure.id = uuidv4();
          setStructure(newStructure);
        }
      } catch (err) {
        console.error('Error loading structure:', err);
        setError(err instanceof Error ? err : new Error('Failed to load structure'));
      } finally {
        setIsLoading(false);
      }
    }

    loadStructure();
  }, [structureId]);

  const updateStructure = (updatedStructure: any) => {
    setStructure(updatedStructure);
  };

  const handleSave = async () => {
    if (!structure) return;
    
    try {
      await saveStructureToDb(structure);
      
      if (structureId === 'new') {
        // Redirect to the new structure's edit page
        navigate(`/structure/${structure.id}`, { replace: true });
        toast({
          title: 'Structure created',
          description: 'Your new structure has been created successfully',
        });
      } else {
        toast({
          title: 'Structure saved',
          description: 'Your structure has been saved successfully',
        });
      }
    } catch (error) {
      console.error('Error saving structure:', error);
      toast({
        title: 'Error saving structure',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error Loading Structure</h1>
          <p className="mt-2 text-muted-foreground">
            There was an error loading the structure. Please try again later.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')} 
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!structure) {
    return <NotFoundState onNavigateBack={() => navigate('/dashboard')} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <StructureEditor 
        structure={structure} 
        onChange={updateStructure}
        onSave={handleSave}
      />
    </div>
  );
};

export default StructureEditorPage;
