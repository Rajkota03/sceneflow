import { useState, useCallback, useRef } from 'react';

export interface Command {
  execute: () => void;
  undo: () => void;
  description: string;
}

export function useUndoRedo(maxHistorySize = 50) {
  const [history, setHistory] = useState<Command[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isExecuting = useRef(false);

  const executeCommand = useCallback((command: Command) => {
    if (isExecuting.current) return;
    
    isExecuting.current = true;
    command.execute();
    
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(command);
      return newHistory.slice(-maxHistorySize);
    });
    
    setCurrentIndex(prev => {
      const newIndex = Math.min(prev + 1, maxHistorySize - 1);
      return newIndex;
    });
    
    isExecuting.current = false;
  }, [currentIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (currentIndex >= 0 && !isExecuting.current) {
      isExecuting.current = true;
      history[currentIndex].undo();
      setCurrentIndex(prev => prev - 1);
      isExecuting.current = false;
    }
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1 && !isExecuting.current) {
      isExecuting.current = true;
      const nextCommand = history[currentIndex + 1];
      nextCommand.execute();
      setCurrentIndex(prev => prev + 1);
      isExecuting.current = false;
    }
  }, [currentIndex, history]);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    executeCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    history: history.slice(0, currentIndex + 1)
  };
}