
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, FileText, Plus, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Structure } from '@/lib/models/structureModel';
import { useToast } from '@/components/ui/use-toast';
import { getStructures, deleteStructure } from '@/services/structureService';
import { LoadingState } from '@/components/structure/StructureStates';
import { supabase } from '@/integrations/supabase/client';

const StructuresTab: React.FC = () => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStructures();
  }, []);

  const fetchStructures = async () => {
    setIsLoading(true);
    try {
      const structuresData = await getStructures();
      setStructures(structuresData);
    } catch (error) {
      console.error('Error fetching structures:', error);
      toast({
        title: 'Error',
        description: 'Could not load structures',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewStructure = () => {
    navigate('/structure/new');
  };

  const handleDeleteStructure = async (id: string) => {
    try {
      const success = await deleteStructure(id);
      if (success) {
        setStructures(structures.filter(s => s.id !== id));
        toast({
          title: 'Success',
          description: 'Structure deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting structure:', error);
      toast({
        title: 'Error',
        description: 'Could not delete structure',
        variant: 'destructive',
      });
    }
  };

  const filteredStructures = structures.filter(structure =>
    structure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (structure.description && structure.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search structures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button onClick={handleCreateNewStructure} className="ml-4 gap-2">
          <Plus className="h-4 w-4" />
          Create New Structure
        </Button>
      </div>

      {filteredStructures.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-slate-50 inline-flex rounded-full p-4 mb-4">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No structures found</h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            {searchQuery 
              ? "No structures match your search criteria." 
              : "You haven't created any story structures yet. Create your first one to get started."}
          </p>
          <Button onClick={handleCreateNewStructure} className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Structure
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStructures.map((structure) => (
            <Card key={structure.id} className="flex flex-col overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{structure.name}</CardTitle>
              </CardHeader>
              <CardContent className="py-2 flex-grow">
                <p className="text-sm text-slate-500 line-clamp-2">
                  {structure.description || "No description provided"}
                </p>
              </CardContent>
              <CardFooter className="pt-2 flex-col items-start border-t">
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center text-xs text-slate-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>Updated {formatDistanceToNow(structure.updatedAt, { addSuffix: true })}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteStructure(structure.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Link to={`/structure/${structure.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StructuresTab;
