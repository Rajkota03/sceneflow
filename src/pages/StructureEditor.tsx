
import React from 'react';
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

  const handleSave = async () => {
    if (!structure) return;
    
    try {
      const saved = await saveStructure(structure);
      
      if (structureId === 'new') {
        // Redirect to the new structure's edit page
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
    <div className="max-w-6xl mx-auto px-4 py-8">
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
        isSaving={isSaving}
      />
    </div>
  );
};

export default StructureEditorPage;
