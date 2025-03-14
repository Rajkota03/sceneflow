
import { Loader } from 'lucide-react';

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Loader className="animate-spin h-8 w-8 text-primary mb-4" />
      <p className="text-slate-600">Loading your projects...</p>
    </div>
  );
};

export default LoadingState;
