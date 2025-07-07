// Export utility functions for converting editor content to different formats

export function toFountain(editorJSON: any): string {
  // Stub implementation - convert Tiptap JSON to Fountain format
  if (!editorJSON || !editorJSON.content) return '';
  
  const lines: string[] = [];
  
  editorJSON.content.forEach((node: any) => {
    const text = node.content?.[0]?.text || '';
    
    switch (node.attrs?.elementType) {
      case 'sceneHeading':
        lines.push(text.toUpperCase());
        break;
      case 'action':
        lines.push(text);
        break;
      case 'character':
        lines.push(text.toUpperCase());
        break;
      case 'parenthetical':
        lines.push(`(${text})`);
        break;
      case 'dialogue':
        lines.push(text);
        break;
      case 'transition':
        lines.push(text.toUpperCase());
        break;
      default:
        lines.push(text);
    }
    
    lines.push(''); // Add blank line after each element
  });
  
  return lines.join('\n');
}

export function toFDX(editorJSON: any): string {
  // Stub implementation - convert Tiptap JSON to Final Draft XML format
  if (!editorJSON || !editorJSON.content) return '';
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<FinalDraft DocumentType="Script" Template="No">\n';
  xml += '<Content>\n';
  
  editorJSON.content.forEach((node: any, index: number) => {
    const text = node.content?.[0]?.text || '';
    const elementType = node.attrs?.elementType || 'action';
    
    xml += `  <Paragraph Number="${index + 1}">\n`;
    xml += `    <ScriptElement Type="${elementType}">\n`;
    xml += `      <Text>${escapeXml(text)}</Text>\n`;
    xml += `    </ScriptElement>\n`;
    xml += `  </Paragraph>\n`;
  });
  
  xml += '</Content>\n';
  xml += '</FinalDraft>';
  
  return xml;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}