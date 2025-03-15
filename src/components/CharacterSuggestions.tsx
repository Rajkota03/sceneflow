
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CharacterSuggestionsProps {
  suggestions: string[];
  onSelect: (character: string) => void;
  isVisible: boolean;
}

const CharacterSuggestions: React.FC<CharacterSuggestionsProps> = ({ 
  suggestions, 
  onSelect,
  isVisible
}) => {
  if (!isVisible || suggestions.length === 0) return null;

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

export default CharacterSuggestions;
