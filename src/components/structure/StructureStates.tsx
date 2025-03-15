
import React from 'react';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Loading structure..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center">
        <Loader className="animate-spin h-8 w-8 text-primary mb-4" />
        <p className="text-slate-600">{message}</p>
      </div>
    </div>
  );
};

interface NotFoundStateProps {
  onNavigateBack?: () => void;
}

export const NotFoundState: React.FC<NotFoundStateProps> = ({ 
  onNavigateBack 
}) => {
  const navigate = useNavigate();
  
  const handleNavigateBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      navigate('/dashboard?tab=structures');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <p className="text-xl font-medium text-slate-900 mb-4">Structure not found</p>
        <Button onClick={handleNavigateBack}>Return to Dashboard</Button>
      </div>
    </div>
  );
};
