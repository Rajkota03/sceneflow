import React from 'react';

interface PageViewPreviewProps {
  editor: any;
}

const PageViewPreview: React.FC<PageViewPreviewProps> = ({ editor }) => {
  if (!editor) return null;

  // Get the formatted content and split into pages
  const getPagedContent = () => {
    const htmlContent = editor.getHTML();
    
    // For now, we'll create multiple pages if content is long
    // In a real implementation, you'd want more sophisticated page break logic
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const estimatedPages = Math.max(1, Math.ceil(tempDiv.textContent?.length || 0 / 2500)); // Rough estimate
    
    const pages = [];
    for (let i = 0; i < estimatedPages; i++) {
      pages.push({
        number: i + 1,
        content: i === 0 ? htmlContent : '' // For simplicity, show all content on first page
      });
    }
    
    return pages;
  };

  const pages = getPagedContent();

  return (
    <div className="w-full h-full bg-gray-100 overflow-auto">
      <style>{`
        .page-view-scroll {
          padding: 2rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
        }
        
        .screenplay-page {
          width: 8.5in;
          height: 11in;
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 1in 1in 1.5in 1.5in;
          font-family: "Courier Final Draft", "Courier Prime", "Courier New", monospace;
          font-size: 12pt;
          line-height: 1.2;
          position: relative;
          overflow: hidden;
          page-break-after: always;
        }
        
        .page-number {
          position: absolute;
          bottom: 0.5in;
          right: 50%;
          transform: translateX(50%);
          font-size: 12pt;
          color: #666;
          font-family: inherit;
        }
        
        /* Reset margins for preview */
        .screenplay-page * {
          margin: 0;
          padding: 0;
        }
        
        /* Screenplay element formatting */
        .screenplay-page h3,
        .screenplay-page [data-element-type="sceneHeading"],
        .screenplay-page [data-type="sceneHeading"] {
          margin: 1.5em 0 0.12in 0 !important;
          text-transform: uppercase !important;
          font-weight: bold !important;
          text-align: left !important;
          display: block;
        }
        
        .screenplay-page [data-element-type="action"] {
          margin: 0.12in 0 !important;
          text-align: left !important;
          display: block;
        }
        
        .screenplay-page [data-element-type="character"],
        .screenplay-page [data-type="character"] {
          margin: 0.12in 0 0.06in 2.2in !important;
          text-transform: uppercase !important;
          font-weight: bold !important;
          text-align: left !important;
          display: block;
        }
        
        .screenplay-page [data-element-type="dialogue"] {
          margin: 0 0 0.12in 1.0in !important;
          max-width: 4.0in !important;
          text-align: left !important;
          display: block;
        }
        
        .screenplay-page [data-element-type="parenthetical"] {
          margin: 0 0 0.06in 1.6in !important;
          font-style: italic !important;
          text-align: left !important;
          display: block;
        }
        
        .screenplay-page [data-element-type="transition"],
        .screenplay-page [data-type="transition"] {
          margin: 0.12in 0 !important;
          text-transform: uppercase !important;
          font-weight: bold !important;
          text-align: right !important;
          padding-right: 0.5in !important;
          display: block;
        }
        
        .screenplay-page p {
          margin: 0.12in 0 !important;
        }
        
        .screenplay-page p:empty {
          margin: 0.06in 0 !important;
          min-height: 0.12in;
        }
        
        @media print {
          .page-view-scroll {
            padding: 0;
            gap: 0;
          }
          
          .screenplay-page {
            box-shadow: none;
            margin: 0;
            page-break-after: always;
          }
        }
      `}</style>
      
      <div className="page-view-scroll">
        {pages.map((page) => (
          <div key={page.number} className="screenplay-page">
            <div className="page-number">{page.number}</div>
            <div 
              dangerouslySetInnerHTML={{ __html: page.content }}
              style={{ 
                pointerEvents: 'none',
                userSelect: 'none',
                height: '100%',
                overflow: 'hidden'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PageViewPreview;