
import React, { createContext, useContext } from 'react';
import { ScriptContent } from '@/lib/types';

interface ScriptEditorProviderProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  projectId?: string;
  projectTitle?: string;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  children: React.ReactNode;
}

// Create a minimal context type 
export interface ScriptEditorContextType {
  projectTitle?: string;
}

const ScriptEditorContext = createContext<ScriptEditorContextType | undefined>(undefined);

export const useScriptEditor = (): ScriptEditorContextType => {
  const context = useContext(ScriptEditorContext);
  if (!context) {
    throw new Error('useScriptEditor must be used within a ScriptEditorProvider');
  }
  return context;
};

const ScriptEditorProvider: React.FC<ScriptEditorProviderProps> = ({
  initialContent,
  onChange,
  projectId,
  projectTitle,
  selectedStructureId,
  onStructureChange,
  children
}) => {
  const contextValue: ScriptEditorContextType = {
    projectTitle
  };

  return (
    <ScriptEditorContext.Provider value={contextValue}>
      {children}
    </ScriptEditorContext.Provider>
  );
};

export default ScriptEditorProvider;
