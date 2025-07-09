import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Sparkles, 
  Download, 
  Trash2, 
  Save, 
  MoreVertical, 
  Clock,
  FileText,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { useBeatGeneration, BeatGeneration, BeatTemplate, BeatGenerationRequest } from '@/hooks/useBeatGeneration';
import { format } from 'date-fns';
import LoadingState from './LoadingState';
import EmptyState from './EmptyState';

const BeatGenerationTab = () => {
  const {
    generations,
    templates,
    isLoading,
    isGenerating,
    generateBeats,
    saveAsTemplate,
    deleteGeneration,
    deleteTemplate,
    exportBeats
  } = useBeatGeneration();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [isGenerationDialogOpen, setIsGenerationDialogOpen] = useState(false);
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<BeatGeneration | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Generation form state
  const [generationForm, setGenerationForm] = useState<BeatGenerationRequest>({
    title: '',
    genre: '',
    theme: '',
    structure_type: 'three_act',
    custom_prompt: ''
  });

  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western'
  ];

  const structureTypes = [
    { value: 'three_act', label: 'Three Act Structure' },
    { value: 'save_the_cat', label: 'Save the Cat Beat Sheet' },
    { value: 'hero_journey', label: "Hero's Journey" },
    { value: 'story_circle', label: 'Story Circle' }
  ];

  const filteredGenerations = generations.filter(gen => {
    const matchesSearch = gen.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gen.theme.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || gen.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const handleGenerate = async () => {
    if (!generationForm.title || !generationForm.genre || !generationForm.theme) {
      return;
    }

    const result = await generateBeats(generationForm);
    if (result) {
      setIsGenerationDialogOpen(false);
      setGenerationForm({
        title: '',
        genre: '',
        theme: '',
        structure_type: 'three_act',
        custom_prompt: ''
      });
    }
  };

  const handleSaveTemplate = async () => {
    if (selectedGeneration && templateName) {
      await saveAsTemplate(selectedGeneration, templateName, templateDescription);
      setIsSaveTemplateDialogOpen(false);
      setTemplateDescription('');
      setTemplateName('');
      setSelectedGeneration(null);
    }
  };

  const handleUseTemplate = (template: BeatTemplate) => {
    setGenerationForm({
      title: `New ${template.name}`,
      genre: template.genre,
      theme: template.theme,
      structure_type: template.structure_type,
      custom_prompt: template.custom_prompt || ''
    });
    setIsGenerationDialogOpen(true);
  };

  const GenerationCard = ({ generation }: { generation: BeatGeneration }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{generation.title}</CardTitle>
            <CardDescription className="line-clamp-2">{generation.theme}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportBeats(generation, 'json')}>
                <Download className="h-4 w-4 mr-2" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportBeats(generation, 'txt')}>
                <Download className="h-4 w-4 mr-2" />
                Export as Text
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setSelectedGeneration(generation);
                  setIsSaveTemplateDialogOpen(true);
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteGeneration(generation.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{generation.genre}</Badge>
          <Badge variant="outline">{generation.structure_type.replace('_', ' ')}</Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          {format(new Date(generation.created_at), 'MMM d, yyyy')}
        </div>
        {generation.generated_beats?.acts && (
          <div className="mt-3 text-sm text-muted-foreground">
            {generation.generated_beats.acts.length} acts, {
              generation.generated_beats.acts.reduce((total: number, act: any) => 
                total + (act.beats?.length || 0), 0
              )
            } beats generated
          </div>
        )}
      </CardContent>
    </Card>
  );

  const TemplateCard = ({ template }: { template: BeatTemplate }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{template.name}</CardTitle>
            {template.description && (
              <CardDescription className="line-clamp-2">{template.description}</CardDescription>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                <Sparkles className="h-4 w-4 mr-2" />
                Use Template
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteTemplate(template.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="secondary">{template.genre}</Badge>
          <Badge variant="outline">{template.structure_type.replace('_', ' ')}</Badge>
          {template.is_public && <Badge variant="default">Public</Badge>}
        </div>
        <div className="text-sm text-muted-foreground">
          Theme: {template.theme}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Beat Generation</h1>
          <p className="text-gray-600 mt-1">Generate AI-powered story beats for your screenplays</p>
        </div>
        <Dialog open={isGenerationDialogOpen} onOpenChange={setIsGenerationDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Beats
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Story Beats</DialogTitle>
              <DialogDescription>
                Create AI-generated story beats based on your genre, theme, and structure preferences.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={generationForm.title}
                  onChange={(e) => setGenerationForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter your project title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Select value={generationForm.genre} onValueChange={(value) => setGenerationForm(prev => ({ ...prev, genre: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="structure">Structure Type</Label>
                  <Select value={generationForm.structure_type} onValueChange={(value) => setGenerationForm(prev => ({ ...prev, structure_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {structureTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="theme">Theme/Central Conflict</Label>
                <Input
                  id="theme"
                  value={generationForm.theme}
                  onChange={(e) => setGenerationForm(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="e.g., Good vs Evil, Coming of Age, Redemption"
                />
              </div>
              <div>
                <Label htmlFor="prompt">Custom Prompt (Optional)</Label>
                <Textarea
                  id="prompt"
                  value={generationForm.custom_prompt}
                  onChange={(e) => setGenerationForm(prev => ({ ...prev, custom_prompt: e.target.value }))}
                  placeholder="Add specific instructions for beat generation..."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !generationForm.title || !generationForm.genre || !generationForm.theme}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isGenerating ? 'Generating...' : 'Generate Beats'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search generations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedGenre} onValueChange={setSelectedGenre}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map(genre => (
              <SelectItem key={genre} value={genre}>{genre}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="generations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generations">My Generations</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generations" className="mt-6">
          {filteredGenerations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGenerations.map(generation => (
                <GenerationCard key={generation.id} generation={generation} />
              ))}
            </div>
          ) : generations.length > 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No matching generations</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <EmptyState
              searchQuery=""
              clearSearch={() => {}}
              createNewProject={() => setIsGenerationDialogOpen(true)}
              emptyMessage="No beat generations yet"
              createMessage="Generate your first story beats"
            />
          )}
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <TemplateCard key={template.id} template={template} />
              ))}
            </div>
          ) : (
            <EmptyState
              searchQuery=""
              clearSearch={() => {}}
              createNewProject={() => setIsGenerationDialogOpen(true)}
              emptyMessage="No templates saved yet"
              createMessage="Generate beats and save as template"
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Save Template Dialog */}
      <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this generation as a reusable template for future projects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="templateName">Template Name</Label>
              <Input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Enter template name"
              />
            </div>
            <div>
              <Label htmlFor="templateDescription">Description (Optional)</Label>
              <Textarea
                id="templateDescription"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe this template..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate} disabled={!templateName}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BeatGenerationTab;