
import React, { useRef, useEffect } from 'react';
import { Structure, Act, Beat } from '@/lib/models/structureModel';

interface StructureTimelineProps {
  structure: Structure;
  onBeatClick?: (actId: string, beatId: string) => void;
}

const StructureTimeline: React.FC<StructureTimelineProps> = ({ 
  structure,
  onBeatClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Draw timeline
    const timelineY = rect.height / 2;
    const timelineHeight = 20;
    
    // Draw acts backgrounds
    structure.acts.forEach(act => {
      const startX = (act.startPosition / 100) * rect.width;
      const endX = (act.endPosition / 100) * rect.width;
      const width = endX - startX;
      
      ctx.fillStyle = act.colorHex + '40'; // 40 is hex for 25% opacity
      ctx.fillRect(startX, timelineY - timelineHeight / 2, width, timelineHeight);
      
      ctx.strokeStyle = act.colorHex;
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, timelineY - timelineHeight / 2, width, timelineHeight);
      
      // Draw act title
      ctx.fillStyle = '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      const titleX = startX + width / 2;
      const titleY = timelineY - timelineHeight / 2 - 10;
      ctx.fillText(act.title, titleX, titleY);
    });
    
    // Draw timeline base line
    ctx.beginPath();
    ctx.moveTo(0, timelineY);
    ctx.lineTo(rect.width, timelineY);
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw timeline markers at 25%, 50%, 75%
    [25, 50, 75].forEach(percent => {
      const markerX = (percent / 100) * rect.width;
      
      ctx.beginPath();
      ctx.moveTo(markerX, timelineY - 15);
      ctx.lineTo(markerX, timelineY + 15);
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${percent}%`, markerX, timelineY + 30);
    });
    
    // Draw beats
    structure.acts.forEach(act => {
      act.beats.forEach(beat => {
        const beatX = (beat.timePosition / 100) * rect.width;
        
        // Draw beat marker
        ctx.beginPath();
        ctx.arc(beatX, timelineY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = act.colorHex;
        ctx.fill();
        
        // Draw beat title
        ctx.fillStyle = '#000000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        // Alternate between above and below the timeline to avoid overlap
        const titleY = timelineY + ((beat.timePosition % 2 === 0) ? 30 : -30);
        ctx.fillText(beat.title, beatX, titleY);
      });
    });
    
  }, [structure]);
  
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onBeatClick || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickPosition = (x / rect.width) * 100;
    const timelineY = rect.height / 2;
    
    // Check if click is near the timeline
    if (Math.abs(y - timelineY) <= 15) {
      // Find the closest beat
      let closestBeat: { act: Act, beat: Beat, distance: number } | null = null;
      
      structure.acts.forEach(act => {
        act.beats.forEach(beat => {
          const beatPosition = beat.timePosition;
          const distance = Math.abs(beatPosition - clickPosition);
          
          if (!closestBeat || distance < closestBeat.distance) {
            closestBeat = { act, beat, distance };
          }
        });
      });
      
      // If the closest beat is within a reasonable distance, trigger the click handler
      if (closestBeat && closestBeat.distance < 3) {
        onBeatClick(closestBeat.act.id, closestBeat.beat.id);
      }
    }
  };
  
  return (
    <div className="w-full mt-4">
      <canvas 
        ref={canvasRef} 
        className="w-full h-[200px]"
        onClick={handleCanvasClick}
      />
    </div>
  );
};

export default StructureTimeline;
