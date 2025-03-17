
import { useState } from 'react';
import { ActType, BeatMode } from '@/types/scriptTypes';

export function useTagFiltering() {
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const [beatMode, setBeatMode] = useState<BeatMode>('on');

  const handleFilterByTag = (tag: string | null) => {
    setActiveTagFilter(tag);
    if (tag !== null) {
      setActiveActFilter(null);
    }
  };

  const handleFilterByAct = (act: ActType | null) => {
    setActiveActFilter(act);
  };

  const handleToggleBeatMode = (mode: BeatMode) => {
    setBeatMode(mode);
  };

  return {
    activeTagFilter,
    activeActFilter,
    beatMode,
    handleFilterByTag,
    handleFilterByAct,
    handleToggleBeatMode
  };
}
