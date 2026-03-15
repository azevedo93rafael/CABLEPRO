import React, { useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';

interface DocxPreviewProps {
  blob: Blob | null;
  className?: string;
}

export const DocxPreview: React.FC<DocxPreviewProps> = ({ blob, className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDoc = async () => {
      if (blob && containerRef.current) {
        // Clear previous content
        containerRef.current.innerHTML = '';
        
        try {
          await renderAsync(blob, containerRef.current, undefined, {
            className: "docx-rendered",
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: true,
            experimental: false,
            trimXmlDeclaration: true,
            useBase64URL: false,
            debug: false,
          });
          
          // Apply some custom styles to the rendered container
          const wrapper = containerRef.current.querySelector('.docx-wrapper') as HTMLElement;
          if (wrapper) {
            wrapper.style.backgroundColor = 'transparent';
            wrapper.style.padding = '0';
          }
          
          const sections = containerRef.current.querySelectorAll('.docx') as NodeListOf<HTMLElement>;
          sections.forEach(section => {
            section.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)';
            section.style.marginBottom = '40px';
            section.style.borderRadius = '8px';
          });
          
        } catch (err) {
          console.error("Error rendering DOCX preview:", err);
          containerRef.current.innerHTML = `<div class="p-20 text-center opacity-50 italic">Errore durante il caricamento dell'anteprima.</div>`;
        }
      } else if (!blob && containerRef.current) {
         containerRef.current.innerHTML = `<div class="p-20 text-center opacity-50 italic">Nessun documento da visualizzare.</div>`;
      }
    };

    renderDoc();
  }, [blob]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full overflow-y-auto custom-scrollbar docx-preview-container ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};
