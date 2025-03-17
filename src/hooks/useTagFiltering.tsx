
import { useState } from 'react';
import { ActType } from '@/lib/types';

export function useTagFiltering() {
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const [beatMode, setBeatMode] = useState<'on' | 'off'>('on');

  const handleFilterByTag = (tag: string | null) => {
    setActiveTagFilter(tag);
    if (tag !== null) {
      setActiveActFilter(null);
    }
  };

  const handleFilterByAct = (act: ActType | null) => {
    setActiveActFilter(act);
  };

  const handleToggleBeatMode = (mode: 'on' | 'off') => {
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
