
import React from 'react';
import { ScriptElement } from '@/lib/types';
import { renderStyle } from '@/lib/elementStyles';
import ScriptElementEditor from './ScriptElement';
import { useScriptEditor } from './ScriptEditorProvider';

interface ScriptPageProps {
  currentPage: number;
  elements: ScriptElement[];
}

const ScriptPage: React.FC<ScriptPageProps> = ({ 
  currentPage,
  elements
}) => {
  const { activeElementId } = useScriptEditor();
  
  return (
    <div className="script-page mb-8">
      <div className="script-page-content">
        <div className="page-number absolute top-0.5 right-1 text-xs text-gray-400">
          {currentPage}
        </div>
        
        <div className="script-elements-container" dir="ltr">
          {elements.map((element, index) => (
            <ScriptElementEditor 
              key={element.id}
              element={element}
              index={index}
              isActive={activeElementId === element.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScriptPage;
