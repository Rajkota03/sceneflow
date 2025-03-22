
import React from 'react';

interface ScriptPageProps {
  currentPage: number;
}

const ScriptPage: React.FC<ScriptPageProps> = ({ 
  currentPage
}) => {
  return (
    <div className="script-container p-4">
      <div className="script-elements-container" dir="ltr">
        <p className="text-center text-gray-500">Page {currentPage}</p>
        <p className="text-center text-gray-500">This page will be implemented when we rebuild the screenplay editor</p>
      </div>
    </div>
  );
};

export default ScriptPage;
