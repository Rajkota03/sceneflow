
import { Loader } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Loading your projects..." }: LoadingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader className="animate-spin h-8 w-8 text-primary mb-4" />
      <p className="text-slate-600">{message}</p>
    </div>
  );
};

export default LoadingState;
