
import React, { useState } from 'react';
import { MoreHorizontal, Tag, X } from 'lucide-react';
import { ScriptElement, Structure } from '@/lib/types';
import { PopoverTrigger, PopoverContent, Popover } from './ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command';

interface SceneTagsProps {
  element: ScriptElement;
  onTagsChange: (elementId: string, tags: string[]) => void;
  projectId?: string;
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const SceneTags: React.FC<SceneTagsProps> = ({ 
  element, 
  onTagsChange,
  projectId,
  selectedStructure,
  onBeatTag
}) => {
  const [open, setOpen] = useState(false);
  const [customTag, setCustomTag] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleAddTag = (tag: string) => {
    const updatedTags = [...(element.tags || [])];
    if (!updatedTags.includes(tag)) {
      updatedTags.push(tag);
      onTagsChange(element.id, updatedTags);
    }
    setOpen(false);
  };
  
  const handleRemoveTag = (tag: string) => {
    const updatedTags = (element.tags || []).filter(t => t !== tag);
    onTagsChange(element.id, updatedTags);
  };
  
  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      handleAddTag(customTag.trim());
      setCustomTag('');
    }
  };
  
  const handleTagBeat = (beatId: string, actId: string, beatTitle: string, actTitle: string) => {
    // Create a formatted tag like "Act 1: Inciting Incident"
    const tagText = `${actTitle}: ${beatTitle}`;
    
    // Add the tag to the element
    const updatedTags = [...(element.tags || [])];
    
    // Remove any existing tags from the same act
    const filteredTags = updatedTags.filter(tag => !tag.startsWith(`${actTitle}:`));
    
    // Add the new tag
    filteredTags.push(tagText);
    onTagsChange(element.id, filteredTags);
    
    // Mark the beat as complete in the structure
    if (onBeatTag) {
      onBeatTag(element.id, beatId, actId);
    }
    
    setMenuOpen(false);
  };
  
  // Style function for tag colors based on content
  const getTagStyle = (tag: string) => {
    // Three Act Structure
    if (tag.startsWith('Act 1:')) {
      return "bg-[#D3E4FD] text-[#2171D2]";
    } else if (tag.startsWith('Act 2A:')) {
      return "bg-[#FEF7CD] text-[#D28A21]";
    } else if (tag.startsWith('Midpoint:')) {
      return "bg-[#FFCCCB] text-[#D24E4D]";
    } else if (tag.startsWith('Act 2B:')) {
      return "bg-[#FDE1D3] text-[#D26600]";
    } else if (tag.startsWith('Act 3:')) {
      return "bg-[#F2FCE2] text-[#007F73]";
    }
    
    // Save The Cat
    else if (tag.startsWith('Opening Image:') || tag.startsWith('Setup:')) {
      return "bg-[#D3E4FD] text-[#2171D2]";
    } else if (tag.startsWith('Catalyst:') || tag.startsWith('Debate:') || tag.startsWith('Break Into 2:')) {
      return "bg-[#E6F7FF] text-[#0066CC]";
    } else if (tag.startsWith('B Story:') || tag.startsWith('Fun & Games:')) {
      return "bg-[#FEF7CD] text-[#D28A21]";
    } else if (tag.startsWith('Bad Guys Close In:') || tag.startsWith('All Is Lost:') || tag.startsWith('Dark Night of Soul:')) {
      return "bg-[#FDE1D3] text-[#D26600]";
    } else if (tag.startsWith('Break Into 3:') || tag.startsWith('Finale:')) {
      return "bg-[#F2FCE2] text-[#007F73]";
    }
    
    // Hero's Journey
    else if (tag.startsWith('Ordinary World:') || tag.startsWith('Call to Adventure:') || tag.startsWith('Refusal:')) {
      return "bg-[#D3E4FD] text-[#2171D2]";
    } else if (tag.startsWith('Mentor:') || tag.startsWith('Crossing Threshold:')) {
      return "bg-[#E6F7FF] text-[#0066CC]";
    } else if (tag.startsWith('Tests, Allies, Enemies:') || tag.startsWith('Approach:')) {
      return "bg-[#FEF7CD] text-[#D28A21]";
    } else if (tag.startsWith('Ordeal:') || tag.startsWith('Reward:')) {
      return "bg-[#FFCCCB] text-[#D24E4D]";
    } else if (tag.startsWith('Road Back:') || tag.startsWith('Resurrection:')) {
      return "bg-[#FDE1D3] text-[#D26600]";
    } else if (tag.startsWith('Return:')) {
      return "bg-[#F2FCE2] text-[#007F73]";
    }
    
    // Story Circle
    else if (tag.startsWith('You:') || tag.startsWith('Need:')) {
      return "bg-[#D3E4FD] text-[#2171D2]";
    } else if (tag.startsWith('Go:') || tag.startsWith('Search:')) {
      return "bg-[#FEF7CD] text-[#D28A21]";
    } else if (tag.startsWith('Find:') || tag.startsWith('Take:')) {
      return "bg-[#FDE1D3] text-[#D26600]";
    } else if (tag.startsWith('Return:') || tag.startsWith('Change:')) {
      return "bg-[#F2FCE2] text-[#007F73]";
    }
    
    // Default for custom tags
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="scene-tags-container flex items-center gap-1">
      {element.tags && element.tags.map((tag, index) => (
        <div 
          key={index} 
          className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${getTagStyle(tag)}`}
        >
          <span className="truncate max-w-[100px]">{tag}</span>
          <button 
            onClick={() => handleRemoveTag(tag)} 
            className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5"
          >
            <X size={10} />
          </button>
        </div>
      ))}
      
      {selectedStructure ? (
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger asChild>
            <button className="p-1 rounded-full hover:bg-gray-100">
              <Tag size={16} className="text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" side="bottom" align="start">
            <Command>
              <CommandInput placeholder="Search beat..." />
              <CommandList>
                <CommandEmpty>No beats found.</CommandEmpty>
                {selectedStructure.acts.map((act) => (
                  <CommandGroup key={act.id} heading={act.title}>
                    {act.beats.map((beat) => (
                      <CommandItem 
                        key={beat.id}
                        onSelect={() => handleTagBeat(beat.id, act.id, beat.title, act.title)}
                        className="cursor-pointer"
                      >
                        <span>{beat.title}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="p-1 rounded-full hover:bg-gray-100">
              <Tag size={16} className="text-gray-500" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-3" side="bottom" align="start">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Add Tag</h3>
              <div className="flex">
                <input 
                  type="text" 
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  className="flex-1 p-2 text-sm border rounded-l-md focus:outline-none"
                  placeholder="Enter custom tag"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                />
                <button 
                  onClick={handleAddCustomTag}
                  className="px-3 py-2 text-sm bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              <div className="mt-2">
                <h4 className="text-xs text-gray-500 mb-1">Common Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {['Character', 'Location', 'Plot Point', 'Subplot'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="text-xs px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default SceneTags;
