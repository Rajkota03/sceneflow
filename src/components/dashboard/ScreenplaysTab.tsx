
import React from 'react';
import { Project } from '@/lib/types';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import LoadingState from '@/components/dashboard/LoadingState';
import EmptyState from '@/components/dashboard/EmptyState';

interface ScreenplaysTabProps {
  projects: Project[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  handleCreateNewProject: () => void;
  handleDeleteProject: (id: string) => Promise<void>;
}

const ScreenplaysTab: React.FC<ScreenplaysTabProps> = ({
  projects,
  searchQuery,
  setSearchQuery,
  isLoading,
  handleCreateNewProject,
  handleDeleteProject
}) => {
  return (
    <>
      <DashboardHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onCreateNewProject={handleCreateNewProject}
        projectType="screenplay"
      />
      
      {isLoading ? (
        <LoadingState />
      ) : projects.length > 0 ? (
        <ProjectGrid 
          projects={projects} 
          onDeleteProject={handleDeleteProject} 
        />
      ) : (
        <EmptyState 
          searchQuery={searchQuery}
          clearSearch={() => setSearchQuery('')}
          createNewProject={handleCreateNewProject}
          emptyMessage="No screenplays yet"
          createMessage="Create your first screenplay"
        />
      )}
    </>
  );
};

export default ScreenplaysTab;
