
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/App';
import ScreenplaysTab from '@/components/dashboard/ScreenplaysTab';
import NotesTab from '@/components/dashboard/NotesTab';
import StructuresTab from '@/components/dashboard/StructuresTab';
import { useDashboardProjects } from '@/hooks/useDashboardProjects';
import useDashboardStructures from '@/hooks/useDashboardStructures';
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
    isLoading: isStructuresLoading,
    handleCreateStructure,
    handleUpdateStructure: handleEditStructure,
    handleDeleteStructure
  } = useDashboardStructures();

  const [structuresSearchQuery, setStructuresSearchQuery] = useState("");
  
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl pt-20 pb-6 px-4 sm:px-6 lg:px-8">
        <Tabs 
          defaultValue="screenplays" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="screenplays">Screenplays</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="structures">Structures</TabsTrigger>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
