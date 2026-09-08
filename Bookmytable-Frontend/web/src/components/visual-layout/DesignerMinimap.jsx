import { useRef, useState, useEffect } from 'react';

const WORLD_SIZE = 3000;
const MINIMAP_SIZE = 200;
const SCALE_RATIO = MINIMAP_SIZE / WORLD_SIZE;

export function DesignerMinimap({ activeTables, pan, setPan, scale, containerRef }) {
  const minimapRef = useRef(null);
  const [viewportRect, setViewportRect] = useState({ w: 0, h: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Measure parent container to know how big the "lens" should be
  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    // Initial measurement
    setViewportRect({ w: parent.clientWidth, h: parent.clientHeight });

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setViewportRect({ w: rect.width, h: rect.height });
    });
    
    observer.observe(parent);
    return () => observer.disconnect();
  }, [containerRef]);

  // Viewport math
  const vw = (viewportRect.w / scale) * SCALE_RATIO;
  const vh = (viewportRect.h / scale) * SCALE_RATIO;
  
  // Calculate top/left based on pan
  const vx = (-pan.x / scale) * SCALE_RATIO;
  const vy = (-pan.y / scale) * SCALE_RATIO;

  const handlePointerDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    updatePanFromEvent(e);
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    updatePanFromEvent(e);
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const updatePanFromEvent = (e) => {
    if (!minimapRef.current) return;
    
    const rect = minimapRef.current.getBoundingClientRect();
    // Center of viewport should align with mouse click
    let mx = e.clientX - rect.left;
    let my = e.clientY - rect.top;

    // Convert minimap coordinate to world coordinate
    const worldCenterX = mx / SCALE_RATIO;
    const worldCenterY = my / SCALE_RATIO;

    // Pan canvas to place that world coordinate at the center of the screen
    setPan({
      x: (viewportRect.w / 2) - (worldCenterX * scale),
      y: (viewportRect.h / 2) - (worldCenterY * scale)
    });
  };

  return (
    <div 
      className="absolute top-20 right-4 z-40 w-[200px] h-[200px] bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden cursor-crosshair group transition-all"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      ref={minimapRef}
      style={{
        backgroundColor: '#efedea',
        backgroundImage: `radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)`,
        backgroundSize: '10px 10px'
      }}
    >
      {/* Title */}
      <div className="absolute top-0 left-0 w-full px-2 py-1 bg-background/80 backdrop-blur-sm border-b border-border/50 text-[10px] font-bold text-muted-foreground z-10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span>OVERVIEW</span>
        <span>{Math.round(scale * 100)}%</span>
      </div>

      {/* Tables overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {activeTables.map(table => {
          const w = table.metadata?.width || (table.metadata?.isLayoutElement ? 150 : 80);
          const h = table.metadata?.height || (table.metadata?.isLayoutElement ? 20 : 60);
          const shape = table.metadata?.shape || (table.capacity <= 2 ? 'square' : 'rectangle');
          
          const tw = w * SCALE_RATIO;
          const th = h * SCALE_RATIO;
          const tx = (table.position?.x || 0) * SCALE_RATIO;
          const ty = (table.position?.y || 0) * SCALE_RATIO;
          
          let br = '1px';
          if (shape === 'circle' || shape === 'round') br = '50%';
          else if (shape === 'square') br = '2px';
          
          return (
            <div
              key={table._id}
              className={`absolute shadow-sm ${table.metadata?.isLayoutElement ? 'bg-primary/40' : 'bg-primary'}`}
              style={{
                width: tw,
                height: th,
                left: tx,
                top: ty,
                borderRadius: br,
                transform: `rotate(${table.position?.rotation || 0}deg)`,
              }}
            />
          );
        })}
      </div>

      {/* Viewport Overlay */}
      <div 
        className="absolute border-[1.5px] border-primary/80 bg-primary/5 pointer-events-none transition-all duration-75"
        style={{
          width: vw,
          height: vh,
          left: vx,
          top: vy,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.3)', // dims everything outside
        }}
      />
    </div>
  );
}
