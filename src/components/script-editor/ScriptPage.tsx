
import React from 'react';
import { ScriptElement } from '@/lib/types';
import { renderStyle } from '@/lib/elementStyles';

interface ScriptPageProps {
  currentPage: number;
  elements: ScriptElement[];
}

const ScriptPage: React.FC<ScriptPageProps> = ({ 
  currentPage,
  elements
}) => {
  return (
    <div className="script-page mb-8">
      <div className="script-page-content">
        <div className="page-number absolute top-0.5 right-1 text-xs text-gray-400">
          {currentPage}
        </div>
        
        <div className="script-elements-container" dir="ltr">
          {elements.map((element) => (
            <div 
              key={element.id}
              className={`element-container ${element.type}`}
            >
              <div 
                className={`element-text ${renderStyle(element.type)}`}
                dir="ltr"
              >
                {element.text || (
                  <span className="text-gray-300">
                    {element.type === 'scene-heading' ? 'INT./EXT. LOCATION - TIME' :
                     element.type === 'character' ? 'CHARACTER NAME' :
                     element.type === 'dialogue' ? 'Character dialogue...' :
                     element.type === 'parenthetical' ? '(action)' :
                     element.type === 'transition' ? 'CUT TO:' :
                     'Start typing...'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScriptPage;
