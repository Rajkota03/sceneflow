
import React from 'react';

interface EditorFooterProps {
  showTitlePage: boolean;
  lastSaved: string | null;
  elementCount: number;
  characterCount: number;
}

const EditorFooter: React.FC<EditorFooterProps> = ({
  showTitlePage,
  lastSaved,
  elementCount,
  characterCount
}) => {
  if (showTitlePage) return null;
  
  return (
    <footer className="h-8 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800 text-xs text-slate-500 dark:text-slate-400 px-4 flex items-center justify-between select-none">
      <div className="flex items-center space-x-4">
        <span>
          Elements: <span className="font-medium text-slate-700 dark:text-slate-300">{elementCount}</span>
        </span>
        <span>
          Characters: <span className="font-medium text-slate-700 dark:text-slate-300">{characterCount}</span>
        </span>
        <span>
          Duration: <span className="font-medium text-slate-700 dark:text-slate-300">{Math.round(elementCount / 60)} min</span>
        </span>
      </div>
      
      <div>
        {lastSaved ? (
          <span>
            Last saved: <span className="font-medium text-slate-700 dark:text-slate-300">{lastSaved}</span>
          </span>
        ) : (
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            Not saved yet
          </span>
        )}
      </div>
    </footer>
  );
};

export default EditorFooter;
