
import React from 'react';
import { TitlePageData } from '@/lib/types';
import FormatStyler from './FormatStyler';

interface TitlePageViewProps {
  data: TitlePageData;
}

const TitlePageView: React.FC<TitlePageViewProps> = ({ data }) => {
  return (
    <FormatStyler forPrint={false}>
      <div className="title-page flex flex-col items-center min-h-[11in] text-center relative">
        <div className="title-section">
          <h1 className="uppercase font-bold mb-8">{data.title || "SCRIPT TITLE"}</h1>
          
          {data.subtitle && (
            <p className="mb-8">{data.subtitle}</p>
          )}
          
          <div className="author-section mt-12">
            <p className="mb-2">Written by</p>
            <p className="mb-12">{data.author || "Name of Writer"}</p>
          </div>
          
          {data.basedOn && (
            <div className="based-on-section mt-8">
              <p>{data.basedOn}</p>
            </div>
          )}
        </div>
        
        {data.contact && (
          <div className="contact-section absolute bottom-24 left-0 text-left whitespace-pre-line">
            <p>{data.contact}</p>
          </div>
        )}
      </div>
    </FormatStyler>
  );
};

export default TitlePageView;
