
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateNewProject: () => void;
}

const DashboardHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  onCreateNewProject 
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">My Projects</h1>
        <p className="text-slate-600">Manage your screenplays and scripts</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            type="text" 
            placeholder="Search projects" 
            className="w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={onCreateNewProject} className="flex items-center">
          <Plus size={18} className="mr-2" />
          New Project
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
