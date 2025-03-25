
import { useState } from 'react';
import { ActType, BeatMode } from '@/lib/types';

export const useEditorUIState = () => {
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const [beatMode, setBeatMode] = useState<BeatMode>('on');
  const [currentPage, setCurrentPage] = useState(1);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState<boolean>(false);

  const onToggleBeatMode = (mode: BeatMode) => {
    setBeatMode(mode);
  };

  const toggleKeyboardShortcuts = () => {
    setShowKeyboardShortcuts(prev => !prev);
  };

  return {
    activeTagFilter,
    setActiveTagFilter,
    activeActFilter,
    setActiveActFilter,
    beatMode,
    onToggleBeatMode,
    currentPage,
    setCurrentPage,
    showKeyboardShortcuts,
    toggleKeyboardShortcuts
  };
};

export default useEditorUIState;
