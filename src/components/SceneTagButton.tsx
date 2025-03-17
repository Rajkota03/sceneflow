
import React, { useState } from 'react';
import { Tag as TagIcon, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Structure, ActType } from '@/types/scriptTypes';

interface SceneTagButtonProps {
  onTagSelect: (tagType: string, actType?: ActType, beatId?: string) => void;
  selectedStructure?: Structure | null;
  className?: string;
}

const SceneTagButton: React.FC<SceneTagButtonProps> = ({ 
  onTagSelect, 
  selectedStructure,
  className 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Helper function to get act name from ActType
  const getActName = (actType: ActType): string => {
    switch (actType) {
      case ActType.ACT_1: return 'Act 1';
      case ActType.ACT_2A: return 'Act 2A';
      case ActType.MIDPOINT: return 'Midpoint';
      case ActType.ACT_2B: return 'Act 2B';
      case ActType.ACT_3: return 'Act 3';
      default: return 'Unknown Act';
    }
  };

  // Get act color based on ActType
  const getActColor = (actType: ActType): string => {
    switch (actType) {
      case ActType.ACT_1: return 'text-[#2171D2] hover:bg-[#D3E4FD]';
      case ActType.ACT_2A: return 'text-[#D28A21] hover:bg-[#FEF7CD]';
      case ActType.MIDPOINT: return 'text-[#D24E4D] hover:bg-[#FFCCCB]';
      case ActType.ACT_2B: return 'text-[#D26600] hover:bg-[#FDE1D3]';
      case ActType.ACT_3: return 'text-[#007F73] hover:bg-[#F2FCE2]';
      default: return 'text-gray-700 hover:bg-gray-100';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "flex items-center gap-1 bg-white bg-opacity-90 hover:bg-gray-100 shadow-sm border border-gray-200 rounded-md px-2 py-1",
            className
          )}
        >
          <TagIcon size={14} />
          <span className="text-xs">Tag Scene</span>
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Tag Scene</DropdownMenuLabel>
        
        {/* Act-based tagging */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-gray-500">Acts</DropdownMenuLabel>
          <DropdownMenuItem 
            className={cn("text-[#2171D2] hover:bg-[#D3E4FD]")} 
            onClick={() => onTagSelect('act', ActType.ACT_1)}
          >
            <TagIcon className="mr-2 h-4 w-4" />
            <span>Act 1: Setup</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={cn("text-[#D28A21] hover:bg-[#FEF7CD]")} 
            onClick={() => onTagSelect('act', ActType.ACT_2A)}
          >
            <TagIcon className="mr-2 h-4 w-4" />
            <span>Act 2A: Reaction</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={cn("text-[#D24E4D] hover:bg-[#FFCCCB]")} 
            onClick={() => onTagSelect('act', ActType.MIDPOINT)}
          >
            <TagIcon className="mr-2 h-4 w-4" />
            <span>Midpoint</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={cn("text-[#D26600] hover:bg-[#FDE1D3]")} 
            onClick={() => onTagSelect('act', ActType.ACT_2B)}
          >
            <TagIcon className="mr-2 h-4 w-4" />
            <span>Act 2B: Approach</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className={cn("text-[#007F73] hover:bg-[#F2FCE2]")}
            onClick={() => onTagSelect('act', ActType.ACT_3)}
          >
            <TagIcon className="mr-2 h-4 w-4" />
            <span>Act 3: Resolution</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Beat-based tagging */}
        {selectedStructure && selectedStructure.acts && selectedStructure.acts.length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-gray-500">Beats</DropdownMenuLabel>
            {selectedStructure.acts.map((act) => (
              <DropdownMenuGroup key={act.id}>
                <DropdownMenuLabel className={cn("text-xs font-medium", getActColor(act.act_type))}>
                  {getActName(act.act_type)}
                </DropdownMenuLabel>
                {act.beats && act.beats.map((beat) => (
                  <DropdownMenuItem 
                    key={beat.id}
                    className={cn(getActColor(act.act_type))}
                    onClick={() => onTagSelect('beat', act.act_type, beat.id)}
                  >
                    <TagIcon className="mr-2 h-4 w-4" />
                    <span>{beat.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Custom tagging */}
        <DropdownMenuItem onClick={() => onTagSelect('custom')}>
          <Plus className="mr-2 h-4 w-4" />
          <span>Add Custom Tag</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SceneTagButton;
