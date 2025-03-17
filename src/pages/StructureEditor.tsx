
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStructure } from '@/hooks/useStructure';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import StructureEditor from '@/components/structure/StructureEditor';
import { LoadingState, NotFoundState } from '@/components/structure/StructureStates';

const StructureEditorPage: React.FC = () => {
  const { structureId } = useParams<{ structureId: string }>();
  const navigate = useNavigate();
  
  const {
    structure,
    isLoading,
    error,
    isSaving,
    saveStructure,
    updateStructure
  } = useStructure(undefined, structureId);

  // Debug logging to trace structure loading
  useEffect(() => {
    if (error) {
      console.error('Error loading structure:', error);
    }
    if (structure) {
      console.log('Structure loaded successfully:', structure.id);
    }
  }, [structure, error]);

  const handleSave = async () => {
    if (!structure) {
      console.error('Cannot save null structure');
      return;
    }
    
    try {
      console.log('Saving structure:', structure);
      const saved = await saveStructure(structure);
      console.log('Structure saved:', saved);
      
      if (structureId === 'new') {
        // Ensure we have a valid ID before redirecting
        if (!saved || !saved.id) {
          throw new Error('Failed to get ID from saved structure');
        }
        
        // Redirect to the new structure's edit page
        console.log('Redirecting to new structure:', saved.id);
        navigate(`/structure/${saved.id}`, { replace: true });
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

  const handleNavigateBack = () => {
    navigate('/dashboard');
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
            onClick={handleNavigateBack} 
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!structure) {
    return <NotFoundState onNavigateBack={handleNavigateBack} />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4" 
          onClick={handleNavigateBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <StructureEditor 
        structure={structure} 
        onChange={updateStructure}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};

export default StructureEditorPage;
