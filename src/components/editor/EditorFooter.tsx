
import React from 'react';

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
    <div className="fixed bottom-0 left-0 right-0 bg-[#F1F1F1] border-t border-[#DDDDDD] py-1 px-4 flex items-center justify-between text-xs text-[#555555] z-10">
      <div>{showTitlePage ? "Title Page" : "Page 1"}</div>
      <div className="flex items-center space-x-4">
        {!showTitlePage && (
          <>
            <span>Scene: 1</span>
            <span>Elements: {elementCount}</span>
            <span>Characters: {characterCount}</span>
          </>
        )}
        {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
      </div>
      <div>100%</div>
    </div>
  );
};

export default EditorFooter;
