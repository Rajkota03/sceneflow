
import { Project } from '@/lib/types';
import ProjectCard from '@/components/ProjectCard';

interface ProjectGridProps {
  projects: Project[];
  onDeleteProject: (id: string) => Promise<void>;
}

const ProjectGrid = ({ projects, onDeleteProject }: ProjectGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onDelete={onDeleteProject} 
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
