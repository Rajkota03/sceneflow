
import React from 'react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
  children?: React.ReactNode;
  // Add support for search query functionality
  searchQuery?: string;
  clearSearch?: () => void;
  createNewProject?: () => void;
  emptyMessage?: string;
  createMessage?: string;
}

const EmptyState = ({ 
  title, 
  description, 
  actionLabel, 
  actionIcon, 
  onAction,
  children,
  searchQuery,
  clearSearch,
  createNewProject,
  emptyMessage,
  createMessage
}: EmptyStateProps) => {
  // Display an alternative view when there's a search query with no results
  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="bg-gray-100 rounded-full p-3 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6 text-gray-500"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">No results found</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          We couldn't find any results matching "{searchQuery}"
        </p>
        {clearSearch && (
          <Button onClick={clearSearch} className="mt-4">
            Clear search
          </Button>
        )}
      </div>
    );
  }

  // Original empty state for when there are no items (not search related)
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
      <div className="bg-gray-100 rounded-full p-3 mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-gray-500"
        >
          <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
          <path d="M10 16H5a2 2 0 0 1-2-2V9" />
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>
      <h3 className="text-lg font-medium">{emptyMessage || title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{description}</p>
      
      {((actionLabel && onAction) || createNewProject) && (
        <Button onClick={onAction || createNewProject} className="mt-4">
          {actionIcon && <span className="mr-2">{actionIcon}</span>}
          {actionLabel || createMessage}
        </Button>
      )}
      
      {children}
    </div>
  );
};

export default EmptyState;
