
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";

interface DashboardHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onCreateNewProject: () => void;
  projectType?: 'screenplay' | 'note' | 'structure';
}

const DashboardHeader = ({
  searchQuery,
  setSearchQuery,
  onCreateNewProject,
  projectType = 'screenplay'
}: DashboardHeaderProps) => {
  const projectLabels = {
    screenplay: "Screenplay",
    note: "Note",
    structure: "Structure"
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      <div className="relative w-full sm:w-auto flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <Input
          type="search"
          placeholder={`Search ${projectLabels[projectType]}s...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-white shadow-sm border-slate-200"
        />
      </div>
      
      <Button onClick={onCreateNewProject} className="w-full sm:w-auto">
        <PlusCircle className="mr-2 h-4 w-4" />
        New {projectLabels[projectType]}
      </Button>
    </div>
  );
};

export default DashboardHeader;
