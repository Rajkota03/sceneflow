
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/App';
import ScreenplaysTab from '@/components/dashboard/ScreenplaysTab';
import NotesTab from '@/components/dashboard/NotesTab';
import StructuresTab from '@/components/dashboard/StructuresTab';
import BeatGenerationTab from '@/components/dashboard/BeatGenerationTab';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { useDashboardProjects } from '@/hooks/useDashboardProjects';
import { useDashboardStructures } from '@/hooks/useDashboardStructures';
import { Note, Structure } from '@/lib/types';
import Navbar from '@/components/Navbar';

const Dashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("screenplays");
  
  // Projects and notes state
  const {
    projects,
    notes,
    searchQuery: projectsSearchQuery,
    setSearchQuery: setProjectsSearchQuery,
    isLoading: isProjectsLoading,
    handleCreateNewProject,
    handleDeleteProject,
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote
  } = useDashboardProjects();
  
  // Structures state
  const {
    structures,
    searchQuery: structuresSearchQuery,
    setSearchQuery: setStructuresSearchQuery,
    isLoading: isStructuresLoading,
    handleCreateStructure,
    handleEditStructure,
    handleDeleteStructure
  } = useDashboardStructures();
  
  // Notes editor state
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  
  // Notes tab handlers
  const handleOpenNewNote = () => {
    setCurrentNote(null);
    setIsNoteEditorOpen(true);
  };

  const handleViewNote = (note: Note) => {
    setCurrentNote(note);
    setIsNoteEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setIsNoteEditorOpen(true);
  };

  const handleSaveNote = async (note: Note) => {
    if (!session) return;
    
    try {
      // Check if it's a new note or existing one
      const isNewNote = !notes.some(n => n.id === note.id);
      
      if (isNewNote) {
        await handleCreateNote(note);
      } else {
        await handleUpdateNote(note);
      }
      
      setIsNoteEditorOpen(false);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  if (!session) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl pt-20 pb-6 px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome to your Dashboard</h1>
              <p className="text-gray-600">Manage your screenplays, notes, and story structures</p>
            </div>
            <Button 
              onClick={() => navigate('/beat-board')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Wand2 className="mr-2 h-5 w-5" />
              40-Beat Story Board
            </Button>
          </div>
          
          <Tabs 
            defaultValue="screenplays" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="screenplays">Screenplays</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="structures">Structures</TabsTrigger>
              <TabsTrigger value="beats">Beat Generation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="screenplays">
              <ScreenplaysTab 
                projects={projects}
                searchQuery={projectsSearchQuery}
                setSearchQuery={setProjectsSearchQuery}
                isLoading={isProjectsLoading}
                handleCreateNewProject={handleCreateNewProject}
                handleDeleteProject={handleDeleteProject}
              />
            </TabsContent>
            
            <TabsContent value="notes">
              <NotesTab 
                notes={notes}
                searchQuery={projectsSearchQuery}
                setSearchQuery={setProjectsSearchQuery}
                isLoading={isProjectsLoading}
                handleCreateNote={handleOpenNewNote}
                handleDeleteNote={handleDeleteNote}
                handleViewNote={handleViewNote}
                handleEditNote={handleEditNote}
                isNoteEditorOpen={isNoteEditorOpen}
                setIsNoteEditorOpen={setIsNoteEditorOpen}
                currentNote={currentNote}
                handleSaveNote={handleSaveNote}
              />
            </TabsContent>
            
            <TabsContent value="structures">
              <StructuresTab 
                structures={structures}
                searchQuery={structuresSearchQuery}
                setSearchQuery={setStructuresSearchQuery}
                isLoading={isStructuresLoading}
                handleCreateStructure={handleCreateStructure}
                handleEditStructure={handleEditStructure}
                handleDeleteStructure={handleDeleteStructure}
              />
            </TabsContent>
            
            <TabsContent value="beats">
              <BeatGenerationTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
