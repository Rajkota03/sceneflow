
import React from 'react';
import BeatPopover from './BeatPopover';

interface BeatTagButtonProps {
  elementId: string;
  beatId?: string;
  beatTitle?: string;
}

const BeatTagButton: React.FC<BeatTagButtonProps> = ({
  elementId,
  beatId,
  beatTitle
}) => {
  return (
    <BeatPopover 
      elementId={elementId}
      elementBeatId={beatId}
    />
  );
};

export default BeatTagButton;
