
import React, { useState } from 'react';
import { Structure } from '@/lib/models/structureModel';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface StructureMetadataProps {
  structure: Structure;
  onChange: (updatedStructure: Structure) => void;
}

export const StructureMetadata: React.FC<StructureMetadataProps> = ({ 
  structure, 
  onChange 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(structure.name);
  const [newDescription, setNewDescription] = useState(structure.description || '');

  const handleMetadataChange = () => {
    onChange({
      ...structure,
      name: newName,
      description: newDescription,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-slate-100 to-slate-50 p-6 rounded-xl shadow-sm border border-slate-100">
      {isEditing ? (
        <div className="w-full space-y-4">
          <Input 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            placeholder="Structure name"
            className="text-xl font-bold border-slate-200 focus:border-primary/50 transition-all"
          />
          <Textarea 
            value={newDescription} 
            onChange={(e) => setNewDescription(e.target.value)} 
            placeholder="Structure description"
            rows={3}
            className="border-slate-200 focus:border-primary/50 transition-all"
          />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleMetadataChange}>Save</Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {structure.name}
              </h1>
              {structure.description && (
                <p className="text-slate-600 mt-2 max-w-2xl">{structure.description}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-slate-600 hover:text-primary hover:bg-slate-100 transition-all" 
              onClick={() => {
                setNewName(structure.name);
                setNewDescription(structure.description || '');
                setIsEditing(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
