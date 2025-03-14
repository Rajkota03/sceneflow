
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';

const ProductionMenu = () => {
  const handleNotImplemented = () => {
    toast({
      title: "Future Upgrade",
      description: "This production feature will be available in a future update.",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Production</MenubarTrigger>
      <MenubarContent>
        <MenubarItem disabled onClick={handleNotImplemented}>
          Generate Shooting Script
        </MenubarItem>
        <MenubarItem disabled onClick={handleNotImplemented}>
          Schedule Breakdown
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem disabled onClick={handleNotImplemented}>
          Script Notes & Annotations
        </MenubarItem>
        <MenubarItem disabled onClick={handleNotImplemented}>
          Export for Production
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default ProductionMenu;
