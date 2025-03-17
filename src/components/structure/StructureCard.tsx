
import React from 'react';
import { Structure } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit, Trash2, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';

interface StructureCardProps {
  structure: Structure;
  onEdit: (structure: Structure) => void;
  onDelete: (id: string) => void;
}

const StructureCard = ({ structure, onEdit, onDelete }: StructureCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(structure.updated_at), { addSuffix: true });
  
  // Calculate progress percentage
  const totalBeats = structure.acts.reduce((total, act) => total + act.beats.length, 0);
  const completedBeats = structure.acts.reduce((total, act) => 
    total + act.beats.filter(beat => beat.complete).length, 0);
  const progressPercentage = totalBeats > 0 ? (completedBeats / totalBeats) * 100 : 0;
  
  return (
    <Card className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg group border border-slate-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 rounded-md p-2 text-primary">
              <FileText size={20} />
            </div>
            <CardTitle className="font-serif font-semibold text-xl text-slate-900">{structure.name}</CardTitle>
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(structure)}
            >
              <Edit size={16} />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDelete(structure.id)}
            >
              <Trash2 size={16} />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
        <CardDescription className="mt-2 flex items-center text-sm text-slate-500">
          <Calendar size={14} className="mr-1" />
          <span>Updated {timeAgo}</span>
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center gap-2 mb-3">
          <Progress value={progressPercentage} className="h-2 flex-grow" />
          <span className="text-xs font-medium text-slate-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        
        <div className="text-sm bg-slate-50 rounded-md p-3">
          <p className="line-clamp-2 text-slate-600">
            {structure.description || `A ${structure.acts.length}-act structure for your screenplay.`}
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="bg-slate-50 border-t border-slate-200 p-4">
        <Button 
          onClick={() => onEdit(structure)}
          variant="outline" 
          className="w-full inline-flex items-center justify-center text-primary hover:text-primary-foreground hover:bg-primary transition-colors rounded-md py-1.5 px-3 text-sm font-medium"
        >
          Open Structure
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StructureCard;
