
import { Link } from 'react-router-dom';
import { Project } from '../lib/types';
import { FileText, Edit, Trash2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(project.updated_at), { addSuffix: true });
  
  return (
    <div className="glass-card rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg group border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 h-full flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 rounded-md p-2 text-primary">
              <FileText size={20} />
            </div>
            <h3 className="font-serif font-semibold text-xl text-slate-900 dark:text-slate-100">{project.title}</h3>
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="h-8 w-8"
            >
              <Link to={`/editor/${project.id}`}>
                <Edit size={16} />
                <span className="sr-only">Edit</span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(project.id)}
            >
              <Trash2 size={16} />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
        
        <div className="mt-4 flex items-center text-sm text-slate-500 dark:text-slate-400">
          <Calendar size={14} className="mr-1" />
          <span>Updated {timeAgo}</span>
        </div>
        
        <div className="mt-4 text-sm bg-slate-50 dark:bg-slate-800 rounded-md p-3 font-mono">
          <p className="line-clamp-3 text-left text-slate-600 dark:text-slate-300">
            {project.content.elements.map(element => element.text).join('\n').substring(0, 150)}
            {project.content.elements.map(element => element.text).join('\n').length > 150 ? '...' : ''}
          </p>
        </div>
      </div>
      
      <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4">
        <Link 
          to={`/editor/${project.id}`}
          className={cn(
            "w-full inline-flex items-center justify-center transition-colors rounded-md py-1.5 px-3 text-sm font-medium",
            "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
          )}
        >
          Open Project
        </Link>
      </div>
    </div>
  );
};

export default ProjectCard;
