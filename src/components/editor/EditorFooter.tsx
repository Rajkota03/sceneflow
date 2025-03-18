
import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface EditorFooterProps {
  showTitlePage: boolean;
  lastSaved: Date | null;
  elementCount: number;
  characterCount: number;
}

const EditorFooter: React.FC<EditorFooterProps> = ({
  showTitlePage,
  lastSaved,
  elementCount,
  characterCount
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#F1F1F1] dark:bg-slate-800 border-t border-[#DDDDDD] dark:border-slate-700 py-1 px-4 flex items-center justify-between text-xs text-[#555555] dark:text-slate-300 z-10 transition-colors duration-200">
      <div className="flex items-center space-x-4">
        <span>Page {showTitlePage ? "Title" : "1"}</span>
        {!showTitlePage && (
          <>
            <span>Scene: 1</span>
            <span>Elements: {elementCount}</span>
            <span>Characters: {characterCount}</span>
            {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
          </>
        )}
      </div>
      
      <div className="flex items-center">
        <div className="flex items-center mr-4">
          <button className="p-1 text-gray-600 hover:text-gray-900">
            <ZoomOut size={14} />
          </button>
          <div className="w-24 h-2 mx-2 bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-blue-500 rounded-full"></div>
          </div>
          <button className="p-1 text-gray-600 hover:text-gray-900">
            <ZoomIn size={14} />
          </button>
        </div>
        <span>100%</span>
      </div>
    </div>
  );
};

export default EditorFooter;
