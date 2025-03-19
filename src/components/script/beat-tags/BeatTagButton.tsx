
import React from 'react';
import BeatPopover from './BeatPopover';

interface BeatTagButtonProps {
  elementId: string;
  beatId?: string;
  beatTitle?: string;
  onRemoveTag?: () => void;
}

const BeatTagButton: React.FC<BeatTagButtonProps> = ({
  elementId,
  beatId,
  beatTitle,
  onRemoveTag
}) => {
  return (
    <BeatPopover 
      elementId={elementId}
      elementBeatId={beatId}
      onRemoveTag={onRemoveTag}
    />
  );
};

export default BeatTagButton;
