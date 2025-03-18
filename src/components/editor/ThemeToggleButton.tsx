
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/lib/themeContext';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-[#333333] hover:bg-[#DDDDDD] dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {theme === 'light' ? (
              <Moon size={16} className="transition-all" />
            ) : (
              <Sun size={16} className="transition-all" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {theme === 'light' ? 'Switch to Night Mode' : 'Switch to Day Mode'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggleButton;
