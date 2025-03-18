
import { useEffect, useState } from 'react';

interface UseKeyboardShortcutsProps {
  onExport?: () => void;
}

export function useKeyboardShortcuts({ onExport }: UseKeyboardShortcutsProps = {}) {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle keyboard shortcuts help with Ctrl+/
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
      
      // Export PDF with Cmd+E
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && onExport) {
        e.preventDefault();
        onExport();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExport]);

  return {
    showKeyboardShortcuts,
    setShowKeyboardShortcuts
  };
}

export default useKeyboardShortcuts;
