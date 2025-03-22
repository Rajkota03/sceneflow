
import React from 'react';
import { TitlePageData } from '@/lib/types';

interface TitlePageViewProps {
  data: TitlePageData;
}

const TitlePageView: React.FC<TitlePageViewProps> = ({ data }) => {
  return (
    <div className="title-page bg-white dark:bg-slate-800 p-6 rounded-md shadow-md">
      <div className="flex flex-col items-center text-center py-8">
        <div className="title-section mb-8">
          <h1 className="text-xl uppercase font-bold mb-8">{data.title || "SCRIPT TITLE"}</h1>
          
          <div className="author-section mt-12">
            <p className="mb-2">Written by</p>
            <p className="mb-12">{data.author || "Name of Writer"}</p>
          </div>
          
          {data.basedOn && (
            <div className="based-on-section mt-12">
              <p>{data.basedOn}</p>
            </div>
          )}
        </div>
        
        {data.contact && (
          <div className="contact-section mt-12 text-sm text-left whitespace-pre-line">
            <p>{data.contact}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TitlePageView;
