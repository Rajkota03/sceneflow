
import React from 'react';
import { TitlePageData } from './TitlePageEditor';
import FormatStyler from './FormatStyler';

interface TitlePageViewProps {
  data: TitlePageData;
}

const TitlePageView: React.FC<TitlePageViewProps> = ({ data }) => {
  return (
    <FormatStyler>
      <div className="title-page flex flex-col items-center min-h-[11in] text-center relative py-8">
        <div className="title-section" style={{ marginTop: '3in' }}>
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
          <div className="contact-section absolute bottom-24 left-24 text-sm text-left whitespace-pre-line">
            <p>{data.contact}</p>
          </div>
        )}
      </div>
    </FormatStyler>
  );
};

export default TitlePageView;
