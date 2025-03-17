
import React from 'react';
import { Act } from '@/lib/models/structureModel';
import { CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Edit, Trash2, FileText } from 'lucide-react';

interface ActHeaderProps {
  act: Act;
  isExpanded: boolean;
  toggleActExpansion: () => void;
  handleEditAct: (act: Act) => void;
  handleDeleteAct: (actId: string) => void;
}

export const ActHeader: React.FC<ActHeaderProps> = ({
  act,
  isExpanded,
  toggleActExpansion,
  handleEditAct,
  handleDeleteAct
}) => {
  // Convert percentage to estimated page count (assuming 1% = 1.2 pages in a 120-page screenplay)
  const getEstimatedPageCount = (percentage: number) => {
    return Math.round((percentage / 100) * 120);
  };
  
  const startPage = getEstimatedPageCount(act.startPosition);
  const endPage = getEstimatedPageCount(act.endPosition);
  const beatCount = act.beats.length;

  return (
    <div 
      className="flex items-center justify-between p-4 cursor-pointer bg-slate-50"
      onClick={toggleActExpansion}
    >
      <div className="flex items-center">
        {isExpanded ? 
          <ChevronUp className="h-5 w-5 mr-3 text-slate-400" /> : 
          <ChevronDown className="h-5 w-5 mr-3 text-slate-400" />
        }
        <div>
          <CardTitle className="text-lg font-semibold text-slate-800">{act.title}</CardTitle>
          <div className="flex items-center mt-1">
            <span className="flex items-center text-sm text-slate-500 mr-2">
              <FileText className="h-3 w-3 mr-1" />
              Pages {startPage}-{endPage}
            </span>
            {beatCount > 0 && (
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                {beatCount} Beat{beatCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="hover:bg-slate-100 text-slate-600"
          onClick={(e) => {
            e.stopPropagation();
            handleEditAct(act);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAct(act.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
