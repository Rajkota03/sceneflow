
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStructure } from '@/hooks/useStructure';
import StructureEditor from '@/components/structure/StructureEditor';
import { createDefaultStructure } from '@/lib/models/structureModel';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const StructureEditorPage: React.FC = () => {
  const { structureId } = useParams<{ structureId: string }>();
  const navigate = useNavigate();
  const isNew = structureId === 'new';
  const { 
    structure, 
    isLoading, 
    error, 
    updateStructure, 
    saveStructure 
  } = useStructure(isNew ? undefined : structureId);

  useEffect(() => {
    if (isNew && !isLoading && !structure) {
      // Create a new default structure
      const newStructure = createDefaultStructure();
      newStructure.id = uuidv4();
      updateStructure(newStructure);
    }
  }, [isNew, isLoading, structure, updateStructure]);

  const handleSave = async () => {
    if (!structure) return;
    
    try {
      await saveStructure(structure);
      
      if (isNew) {
        // Redirect to the new structure's edit page
        navigate(`/structure/${structure.id}`, { replace: true });
        toast({
          title: 'Structure created',
          description: 'Your new structure has been created successfully',
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
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Structure Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The structure you're looking for doesn't exist or has been deleted.
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
