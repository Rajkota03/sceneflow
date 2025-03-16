
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getStructures, deleteStructure, saveStructure } from '@/services/structureService';
import { Structure } from '@/lib/types';
import { 
  ChevronDown, 
  ChevronUp, 
  Link, 
  Pencil, 
  Plus, 
  Trash2, 
  FileText,
  Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DashboardHeader from './DashboardHeader';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import { format } from 'date-fns';
import { toast } from '../ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { createDefaultStructure } from '@/lib/models/structureModel';
import { createSaveTheCatStructure } from '@/lib/models/saveTheCatModel';
import StructureTimeline from '../structure/StructureTimeline';
import { v4 as uuidv4 } from 'uuid';

interface StructureItemProps {
  structure: Structure;
  onDelete: (id: string) => void;
  linkedProjects?: Array<{ id: string, title: string }>;
}

const StructureItem: React.FC<StructureItemProps> = ({ structure, onDelete, linkedProjects = [] }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [structureName, setStructureName] = useState(structure.name);
  
  const handleEdit = () => {
    navigate(`/structure/${structure.id}`);
  };
  
  const handleDelete = () => {
    onDelete(structure.id);
  };

  const handleRename = () => {
    if (isEditing && structureName.trim()) {
      // Update structure name logic would go here
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleInputBlur = () => {
    if (structureName.trim()) {
      setIsEditing(false);
      // Here you would save the new name
      const updatedStructure = { ...structure, name: structureName };
      saveStructure(updatedStructure).catch(console.error);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  const hasLinkedProjects = linkedProjects.length > 0;
  
  return (
    <div className="mb-4 border rounded-lg shadow-sm overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between p-4 bg-background hover:bg-accent/10 transition-colors">
          <div className="flex items-center gap-2 flex-1">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-8 w-8">
                {isOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={structureName}
                  onChange={(e) => setStructureName(e.target.value)}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  className="border p-1 rounded w-full"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{structure.name}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRename}
                    className="h-7 w-7 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Updated {format(new Date(structure.updatedAt), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasLinkedProjects && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => navigate(`/editor/${linkedProjects[0].id}`)}
              >
                <FileText className="h-4 w-4" />
                <span>Go to Screenplay</span>
              </Button>
            )}

            {!hasLinkedProjects && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
              >
                <Link className="h-4 w-4" />
                <span>Link to Screenplay</span>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEdit}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the structure.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        
        <CollapsibleContent>
          <div className="p-4 bg-muted/20">
            {structure.description && (
              <p className="text-sm text-muted-foreground mb-4">{structure.description}</p>
            )}
            <StructureTimeline 
              structure={structure} 
              onBeatClick={(actId, beatId) => navigate(`/structure/${structure.id}`)} 
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const StructuresTab: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: structures, isLoading, error, refetch } = useQuery({
    queryKey: ['structures'],
    queryFn: getStructures
  });
  
  const handleDeleteStructure = async (id: string) => {
    try {
      const success = await deleteStructure(id);
      
      if (success) {
        refetch();
        toast({
          title: 'Structure deleted',
          description: 'The structure has been deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting structure:', error);
      toast({
        title: 'Error deleting structure',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };
  
  const handleCreateNewStructure = async (template: 'three-act' | 'save-the-cat') => {
    try {
      let newStructure: Structure;
      
      if (template === 'three-act') {
        newStructure = createDefaultStructure();
      } else {
        newStructure = createSaveTheCatStructure();
      }
      
      newStructure.id = uuidv4();
      
      const savedStructure = await saveStructure(newStructure);
      refetch();
      
      toast({
        title: 'Structure created',
        description: `Your new ${template === 'three-act' ? 'Three-Act Structure' : 'Save the Cat! Beat Sheet'} has been created.`,
      });
    } catch (error) {
      console.error('Error creating structure:', error);
      toast({
        title: 'Error creating structure',
        description: 'Please try again later',
        variant: 'destructive',
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const filteredStructures = structures?.filter(structure => 
    structure.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  // Mock linked projects data
  const linkedProjects = {} as Record<string, Array<{ id: string, title: string }>>;
  if (structures && structures.length > 0) {
    // For demo purposes, link the first structure to a project
    linkedProjects[structures[0].id] = [{ id: 'project-1', title: 'My Screenplay' }];
  }

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading structures</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <DashboardHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        projectType="structure"
        onCreateNewProject={() => {}} // We'll use our custom create button instead
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Network className="h-5 w-5" /> 
          Story Structures
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Structure
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleCreateNewStructure('three-act')}>
              Three-Act Structure
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleCreateNewStructure('save-the-cat')}>
              Save the Cat! Beat Sheet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {!structures || structures.length === 0 ? (
        <EmptyState 
          searchQuery={searchQuery}
          clearSearch={clearSearch}
          createNewProject={() => {}}
          emptyMessage="No structures found. Create your first story structure to get started!"
          createMessage="Create New Structure"
          customCreateButton={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Structure
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleCreateNewStructure('three-act')}>
                  Three-Act Structure
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateNewStructure('save-the-cat')}>
                  Save the Cat! Beat Sheet
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredStructures.map(structure => (
            <StructureItem 
              key={structure.id} 
              structure={structure} 
              onDelete={handleDeleteStructure}
              linkedProjects={linkedProjects[structure.id] || []}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StructuresTab;
