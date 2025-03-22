
import React from 'react';
import { useScriptEditor } from './ScriptEditorProvider';
import ScriptPage from './ScriptPage';
import { calculatePages } from '@/lib/elementStyles';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const ScriptContent: React.FC = () => {
  const { elements, addElement } = useScriptEditor();
  
  // Calculate page distribution
  const totalPages = calculatePages(elements);
  
  // Simple page division for now (will be more sophisticated later)
  const elementsPerPage = Math.ceil(elements.length / totalPages);
  
  // Create pages
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    const pageElements = elements.slice(
      i * elementsPerPage, 
      Math.min((i + 1) * elementsPerPage, elements.length)
    );
    
    if (pageElements.length > 0) {
      pages.push(
        <ScriptPage 
          key={`page-${i}`}
          currentPage={i + 1}
          elements={pageElements}
        />
      );
    }
  }

  // Handle adding a new scene
  const handleAddScene = () => {
    const lastElementId = elements.length > 0 ? elements[elements.length - 1].id : '';
    if (lastElementId) {
      const newElementId = addElement(lastElementId, 'scene-heading');
    }
  };

  return (
    <div className="w-full h-full overflow-auto bg-white dark:bg-slate-800 cursor-text">
      <div className="min-h-full flex flex-col items-center pt-8 pb-20">
        {pages.length > 0 ? (
          <>
            {pages}
            <div className="mt-8 mb-16">
              <Button 
                onClick={handleAddScene}
                variant="outline"
                className="flex items-center gap-2"
              >
                <PlusCircle size={16} />
                Add New Scene
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 mb-4">Your screenplay is empty. Start typing to create content.</p>
            <Button 
              onClick={handleAddScene}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlusCircle size={16} />
              Add First Scene
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScriptContent;
