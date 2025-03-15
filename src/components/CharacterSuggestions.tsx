
import React from 'react';
import { ElementType } from '@/lib/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CharacterSuggestionsProps {
  onSelect: (character: string | ElementType) => void;
  onClose?: () => void; // Make onClose optional
  currentType?: ElementType;
  suggestions?: string[];
  isVisible?: boolean;
}

const CharacterSuggestions: React.FC<CharacterSuggestionsProps> = ({ 
  suggestions = [], 
  onSelect,
  onClose,
  currentType,
  isVisible = true
}) => {
  // For element type selection
  if (currentType !== undefined) {
    const elementTypes: ElementType[] = [
      'scene-heading',
      'action',
      'character',
      'dialogue',
      'parenthetical',
      'transition'
    ];
    
    const handleSelect = (value: string) => {
      onSelect(value as ElementType);
      if (onClose) onClose();
    };
    
    return (
      <div className="absolute top-full left-0 w-40 bg-white border border-gray-300 shadow-md rounded-md z-50">
        {elementTypes.map((type) => (
          <div 
            key={type}
            className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${currentType === type ? 'bg-gray-100' : ''}`}
            onClick={() => handleSelect(type)}
          >
            {formatElementType(type)}
          </div>
        ))}
      </div>
    );
  }

  // For character suggestions
  if (!isVisible || !suggestions || suggestions.length === 0) return null;

  return (
    <div className="character-suggestions absolute top-full left-0 w-full z-10">
      <Select onValueChange={onSelect}>
        <SelectTrigger className="w-full bg-white border border-gray-300">
          <SelectValue placeholder="Select character..." />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {suggestions.map((character, index) => (
            <SelectItem key={index} value={character}>{character}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

function formatElementType(type: ElementType): string {
  switch (type) {
    case 'scene-heading':
      return 'Scene Heading';
    case 'action':
      return 'Action';
    case 'character':
      return 'Character';
    case 'dialogue':
      return 'Dialogue';
    case 'parenthetical':
      return 'Parenthetical';
    case 'transition':
      return 'Transition';
    case 'note':
      return 'Note';
    default:
      return type;
  }
}

export default CharacterSuggestions;
