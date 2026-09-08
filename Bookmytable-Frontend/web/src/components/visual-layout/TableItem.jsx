import { motion } from "framer-motion";
import { Users, GripHorizontal, Box } from "lucide-react";
import React, { useMemo } from "react";
import { DINING_AREA_PRESETS } from "@/lib/tableConstants";

const AutoChairs = React.memo(({ capacity, shape, width, height }) => {
  if (!capacity || capacity <= 0) return null;

  return useMemo(() => {
    const chairs = [];
    const chairSize = 12; // Visual size of the chair
    const chairOffset = 10; // Distance from the table edge

    // Matches the existing TableItem aesthetic (using primary color tokens)
    const getChairStyle = (x, y, rotation) => ({
      position: 'absolute',
      width: chairSize,
      height: chairSize,
      left: x - chairSize / 2,
      top: y - chairSize / 2,
      transform: `rotate(${rotation}deg)`,
      borderRadius: '4px',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      border: '2px solid hsl(var(--primary) / 0.3)',
      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
      pointerEvents: 'none', // Critical: Chairs are purely visual, cannot intercept clicks
      zIndex: -1 // Push chairs slightly below the table layer if desired, or keep default
    });

    // 1. Circular / Oval Placement
    if (shape === 'circle' || shape === 'round' || shape === 'oval' || shape === 'couple') {
      const centerX = width / 2;
      const centerY = height / 2;
      const radiusX = width / 2 + chairOffset + chairSize / 2;
      const radiusY = height / 2 + chairOffset + chairSize / 2;
      
      for (let i = 0; i < capacity; i++) {
        const angle = (i * 360) / capacity;
        const angleRad = (angle - 90) * (Math.PI / 180);
        const x = centerX + radiusX * Math.cos(angleRad);
        const y = centerY + radiusY * Math.sin(angleRad);
        chairs.push(<div key={`c-${i}`} style={getChairStyle(x, y, angle)} />);
      }
    } 
    // 2. Rectangular / Square Placement
    else {
      let T = 0, B = 0, L = 0, R = 0;
      const isSquare = shape === 'square' || Math.abs(width - height) < 10;

      // Heuristic Allocation
      if (isSquare) {
        if (capacity === 2) { T = 1; B = 1; }
        else if (capacity === 3) { T = 1; B = 1; L = 1; }
        else {
          const side = Math.floor(capacity / 4);
          const rem = capacity % 4;
          T = side + (rem > 0 ? 1 : 0);
          B = side + (rem > 1 ? 1 : 0);
          L = side + (rem > 2 ? 1 : 0);
          R = side;
        }
      } else {
        if (capacity === 2) {
           if (width > height) { T = 1; B = 1; } else { L = 1; R = 1; }
        } else if (capacity === 3) {
           if (width > height) { T = 1; B = 1; L = 1; } else { L = 1; R = 1; T = 1; }
        } else if (capacity === 4) {
           if (width > height * 1.2) { T = 2; B = 2; }
           else if (height > width * 1.2) { L = 2; R = 2; }
           else { T = 1; B = 1; L = 1; R = 1; }
        } else {
           if (width >= height) {
              L = 1; R = 1;
              const rem = capacity - 2;
              T = Math.ceil(rem / 2);
              B = Math.floor(rem / 2);
           } else {
              T = 1; B = 1;
              const rem = capacity - 2;
              L = Math.ceil(rem / 2);
              R = Math.floor(rem / 2);
           }
        }
      }

      // Render Top
      for(let i=0; i<T; i++) {
         const cx = width * (i + 1) / (T + 1);
         const cy = -chairOffset - chairSize / 2;
         chairs.push(<div key={`t-${i}`} style={getChairStyle(cx, cy, 180)} />);
      }
      // Render Bottom
      for(let i=0; i<B; i++) {
         const cx = width * (i + 1) / (B + 1);
         const cy = height + chairOffset + chairSize / 2;
         chairs.push(<div key={`b-${i}`} style={getChairStyle(cx, cy, 0)} />);
      }
      // Render Left
      for(let i=0; i<L; i++) {
         const cx = -chairOffset - chairSize / 2;
         const cy = height * (i + 1) / (L + 1);
         chairs.push(<div key={`l-${i}`} style={getChairStyle(cx, cy, 90)} />);
      }
      // Render Right
      for(let i=0; i<R; i++) {
         const cx = width + chairOffset + chairSize / 2;
         const cy = height * (i + 1) / (R + 1);
         chairs.push(<div key={`r-${i}`} style={getChairStyle(cx, cy, -90)} />);
      }
    }

    return <>{chairs}</>;
  }, [capacity, shape, width, height]);
});

const PresetDecoration = React.memo(({ type, width, height }) => {
  const color = "currentColor";
  switch (type) {
    case 'door':
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 opacity-70" preserveAspectRatio="none">
          <path d={`M 0,${height} A ${width},${height} 0 0,1 ${width},0 L 0,0 Z`} fill="none" stroke={color} strokeWidth="2" strokeDasharray="4 4" />
          <line x1="0" y1="0" x2={width} y2="0" stroke={color} strokeWidth="3" />
        </svg>
      );
    case 'window':
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 opacity-60" preserveAspectRatio="none">
          <rect x="0" y={height * 0.25} width={width} height={height * 0.5} fill="hsl(190, 80%, 80%)" opacity="0.4" />
          <line x1="0" y1={height * 0.25} x2={width} y2={height * 0.25} stroke={color} strokeWidth="1" />
          <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke={color} strokeWidth="1" />
        </svg>
      );
    case 'entrance':
      return (
        <div className="absolute inset-0 flex items-center justify-center opacity-70">
          <svg width={Math.min(width, height) * 0.6} height={Math.min(width, height) * 0.6} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </div>
      );
    case 'exit':
      return (
        <div className="absolute inset-0 flex items-center justify-center opacity-70">
          <svg width={Math.min(width, height) * 0.6} height={Math.min(width, height) * 0.6} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </div>
      );
    case 'stairs':
      const numSteps = Math.max(3, Math.floor(height / 10));
      const stepHeight = height / numSteps;
      const steps = [];
      const stringerWidth = Math.max(3, width * 0.08);
      
      for (let i = 0; i < numSteps; i++) {
         steps.push(
            <g key={i}>
              <rect 
                x={stringerWidth} 
                y={i * stepHeight} 
                width={width - (stringerWidth * 2)} 
                height={stepHeight} 
                fill="hsl(var(--background))" 
                stroke={color} 
                strokeWidth="1.5" 
                opacity="0.8"
              />
              <rect 
                x={stringerWidth} 
                y={i * stepHeight} 
                width={width - (stringerWidth * 2)} 
                height={stepHeight} 
                fill={color}
                opacity={0.05 + (i * (0.3 / numSteps))} 
              />
            </g>
         );
      }
      return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="absolute inset-0" preserveAspectRatio="none">
          {steps}
          <rect x={0} y={0} width={stringerWidth} height={height} fill="hsl(var(--muted))" stroke={color} strokeWidth="1.5" opacity="0.9" />
          <rect x={width - stringerWidth} y={0} width={stringerWidth} height={height} fill="hsl(var(--muted))" stroke={color} strokeWidth="1.5" opacity="0.9" />
        </svg>
      );

    case 'open_side':
      return (
        <div className="absolute inset-0 opacity-40 flex items-center justify-center border-t-2 border-dashed border-current" />
      );
    case 'view_marker':
      return (
        <div className="absolute inset-0 flex items-center justify-center opacity-70">
          <svg width={Math.min(width, height) * 0.6} height={Math.min(width, height) * 0.6} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
      );
    case 'washroom':
      return (
        <div className="absolute inset-0 flex items-center justify-center opacity-90">
          <svg width={Math.min(width, height) * 0.8} height={Math.min(width, height) * 0.8} viewBox="0 0 100 100" fill="currentColor">
            <path d="M 15 85 L 85 85 L 85 25 L 60 25 L 60 32" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
            <rect x="55" y="12" width="10" height="3" />
            <rect x="57" y="17" width="6" height="3" />
            <rect x="56" y="35" width="8" height="3" />
            <path d="M 60 42 C 65 50 65 55 60 55 C 55 55 55 50 60 42 Z" />
            <path d="M 15 55 L 75 55 Q 75 75 60 75 L 30 75 Q 15 75 15 55 Z" />
            <polygon points="32,75 38,75 35,81" />
            <polygon points="52,75 58,75 55,81" />
          </svg>
        </div>
      );
    case 'custom_preset':
      return (
        <div className="absolute inset-0 border-2 border-dashed border-current opacity-60" style={{ backgroundColor: 'currentColor' }} />
      );
    default:
      return null;
  }
});


export const TableItem = React.memo(({ 
  table, 
  isAvailable = true,
  status,
  isSelected = false,
  isDragHoverTarget = false,
  isDragging = false,
  onClick, 
  isEditor = false,
  onPointerDown,
  onResizeStart,
  children
}) => {
  const isLayoutElement = table.metadata?.isLayoutElement === true;
  const isArrangementZone = table.metadata?.isArrangementZone === true;
  const isSection = table.metadata?.isSection === true;
  const isDiningArea = table.metadata?.isDiningArea === true;
  
  
  // Read from metadata ONLY if it's a layout element. Otherwise, force capacity-based sizing for professional uniformity.
  const width = isLayoutElement ? (table.metadata?.width || (isDiningArea ? 400 : isSection ? 350 : 150)) : (table.capacity <= 2 ? 60 : table.capacity <= 4 ? 80 : 100);
  const height = isLayoutElement ? (table.metadata?.height || (isDiningArea ? 300 : isSection ? 250 : 20)) : (table.capacity <= 2 ? 60 : table.capacity <= 4 ? 60 : 70);
  
  const shape = table.metadata?.shape || (isLayoutElement ? 'rectangle' : table.capacity <= 2 ? 'square' : 'rectangle');
  
  let borderRadius = '12px';
  let extraStyles = {};

  switch (shape) {
    case 'circle':
    case 'round':
      borderRadius = '50%';
      break;
    case 'square':
      borderRadius = '8px';
      break;
    case 'booth':
      // Thick top border to represent a booth backrest
      borderRadius = '16px 16px 4px 4px';
      extraStyles.borderTopWidth = '8px';
      break;
    case 'sofa':
      // Thick bottom and side borders
      borderRadius = '8px 8px 16px 16px';
      extraStyles.borderBottomWidth = '8px';
      break;
    case 'bar_counter':
      borderRadius = '4px';
      break;
    case 'washroom':
      borderRadius = '4px';
      break;
    case 'couple':
      borderRadius = '50% 50% 12px 12px';
      break;
    case 'long':
    case 'rectangle':
    default:
      borderRadius = '12px';
      break;
  }

  // Override for layout elements
  if (isLayoutElement) {
    borderRadius = '2px';
  }
  if (isSection || isArrangementZone) {
    borderRadius = '8px';
  }

  let bgColor = "bg-muted";
  let borderColor = "border-border";
  let textColor = "text-muted-foreground";

  if (!isEditor) {
    const derivedStatus = status || (isAvailable ? "available" : "occupied");
    if (isSelected) {
      bgColor = "bg-primary/10 backdrop-blur-sm shadow-[0_0_15px_rgba(var(--primary),0.3)]";
      borderColor = "border-primary";
      textColor = "text-primary";
    } else if (derivedStatus === "available") {
      bgColor = "bg-emerald-50 focus:bg-emerald-100 hover:bg-emerald-50 dark:bg-emerald-950/30";
      borderColor = "border-emerald-500/50";
      textColor = "text-emerald-700 dark:text-emerald-400";
    } else if (derivedStatus === "reserved") {
      bgColor = "bg-amber-50 hover:bg-amber-50 dark:bg-amber-950/20";
      borderColor = "border-amber-500/50";
      textColor = "text-amber-700 dark:text-amber-400";
    } else {
      bgColor = "bg-destructive/5 cursor-not-allowed";
      borderColor = "border-destructive/20";
      textColor = "text-destructive/70";
    }
  } else {
    // Editor UI
    bgColor = "bg-card shadow-sm";
    borderColor = "border-border hover:border-primary/50 hover:shadow-md";
    textColor = "text-foreground";
  }

  if (isArrangementZone) {
    bgColor = "bg-primary/5";
    borderColor = "border-primary/40 border-dashed border-2 hover:border-primary/80";
    textColor = "text-primary/70";
    if (isSelected) {
      bgColor = "bg-primary/10";
      borderColor = "border-primary border-dashed border-2 shadow-[0_0_15px_rgba(var(--primary),0.2)]";
    }
  }

  if (isSection) {
    if (table.metadata?.isColliding) {
      bgColor = "bg-red-500/20";
      borderColor = "border-red-500 border-4 border-solid shadow-[inset_0_0_20px_rgba(255,0,0,0.3)] ring-4 ring-red-500 ring-offset-2";
      textColor = "text-red-700 dark:text-red-400";
    } else if (table.metadata?.preset === 'couple_zone') {
      bgColor = "bg-pink-500/5 backdrop-blur-sm";
      borderColor = "border-pink-500/30 border-2 border-solid hover:border-pink-500/60 shadow-inner";
      textColor = "text-pink-700 dark:text-pink-400";
    } else {
      bgColor = "bg-blue-500/5 backdrop-blur-sm";
      borderColor = "border-blue-500/30 border-2 border-solid hover:border-blue-500/60 shadow-inner";
      textColor = "text-blue-700 dark:text-blue-400";
    }
    if (isSelected && !table.metadata?.isColliding) {
      borderColor = borderColor.replace('30', '80').replace('50', '80') + " shadow-[0_0_15px_rgba(0,0,0,0.1)] ring-2 ring-primary/20 ring-offset-1";
    }
  }

  if (isLayoutElement && table.type === 'washroom') {
    bgColor = "bg-slate-100 dark:bg-slate-800";
    borderColor = "border-slate-400 border-2";
    textColor = "text-slate-600 dark:text-slate-300";
  }

  if (isDiningArea) {
    const presetData = DINING_AREA_PRESETS.find(p => p.value === table.metadata?.preset) || DINING_AREA_PRESETS[0];
    bgColor = presetData.color;
    borderColor = `${presetData.border} border-2 border-solid shadow-inner`;
    textColor = "text-foreground";
    if (isSelected) {
      borderColor = `${presetData.border} border-2 border-solid shadow-[inset_0_0_20px_rgba(var(--primary),0.1)] ring-4 ring-primary ring-offset-2`;
    }
  }

  if (isDragHoverTarget) {
    borderColor = "border-primary border-4 shadow-[0_0_20px_rgba(var(--primary),0.5)]";
    bgColor = "bg-primary/20 backdrop-blur-sm";
  }

  let finalOpacity = 1;
  if (isDragging) {
    finalOpacity = 0.6;
    extraStyles.pointerEvents = 'none'; // prevent self-intersection during drag
  }

  // Strict Clipping for Containers
  if (isDiningArea || isSection) {
    extraStyles.overflow = 'hidden';
  }

  // Render Order Z-Index (Enforce hierarchy)
  let renderZIndex = isArrangementZone ? 4 : isSection ? 3 : isLayoutElement ? 6 : 10;
  if (isDragging) renderZIndex = 100;
  // ONLY elevate z-index on selection for Terminal elements (Tables).
  // Elevating containers breaks hierarchy.
  else if (isSelected && !isDiningArea && !isSection && !isArrangementZone && !isLayoutElement) renderZIndex = 50;

  return (
    <motion.div
      onPointerDown={(e) => {
        if (isEditor && onPointerDown) {
          e.stopPropagation();
          onPointerDown(e, table._id);
        }
      }}
      initial={{ x: table.position?.x || 0, y: table.position?.y || 0, rotate: table.position?.rotation || 0 }}
      animate={{ x: table.position?.x || 0, y: table.position?.y || 0, rotate: table.position?.rotation || 0 }}
      transition={isEditor ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
      onClick={(e) => {
        const derivedStatus = status || (isAvailable ? "available" : "occupied");
        if ((!isEditor && derivedStatus === "available" && !isLayoutElement && onClick) || isEditor) {
          onClick && onClick(e, table);
        }
      }}
      style={{
        width,
        height,
        position: 'absolute',
        top: 0,
        left: 0,
        borderRadius,
        opacity: finalOpacity,
        zIndex: renderZIndex,
        boxShadow: isSelected && !isArrangementZone ? '0 0 0 4px rgba(var(--primary), 0.3)' : undefined,
        ...extraStyles
      }}
      className={`
        flex flex-col items-center justify-center border-2 transition-colors cursor-pointer group
        ${bgColor} ${borderColor} ${textColor}
      `}
      whileHover={(!isEditor && (status || (isAvailable ? "available" : "occupied")) === "available" && !isSelected) ? { scale: 1.05 } : {}}
      whileTap={(!isEditor && (status || (isAvailable ? "available" : "occupied")) === "available") ? { scale: 0.95 } : {}}
    >
      <span 
        className="text-xs font-bold leading-none text-center px-1 w-full"
        style={isDiningArea ? {
          position: 'absolute',
          top: '16px',
          left: '16px',
          textAlign: 'left',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '12px',
          fontWeight: '800'
        } : isArrangementZone ? {
          position: 'absolute',
          top: '12px',
          left: '12px',
          textAlign: 'left',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontSize: '10px'
        } : (isLayoutElement && height < 30 ? {
          position: 'absolute',
          top: '-20px',
          whiteSpace: 'nowrap',
          color: 'var(--foreground)' // ensure it's visible outside the box
        } : {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        })}
      >
        {(table.tableCode || table.tableNumber) && (!isLayoutElement || (!table.metadata?.isStructuralElement && table.type !== 'washroom')) && (
          <>{table.tableCode || table.tableNumber}</>
        )}
        {isArrangementZone && (
          <span className="block mt-1 font-normal opacity-70 normal-case">Smart Zone</span>
        )}
        {isDiningArea && (
          <span className="block mt-1 font-medium opacity-50 normal-case text-xs tracking-wider">
            {table.metadata?.preset ? table.metadata.preset.replace('_', ' ') : 'Area'}
          </span>
        )}
      </span>
      
      {table.metadata?.isStructuralElement && (
        <PresetDecoration type={table.type || table.metadata?.elementType} width={width} height={height} />
      )}

      {!isLayoutElement && !isArrangementZone && !isDiningArea && (
        <div className="flex items-center gap-1 mt-1 opacity-70">
          <Users className="w-3 h-3" />
          <span className="text-[10px] font-medium leading-none">{table.capacity}</span>
        </div>
      )}

      {/* Resize Handles (8-point system) - ONLY FOR LAYOUT ELEMENTS */}
      {isSelected && isEditor && isLayoutElement && (!table.position?.rotation || table.position.rotation === 0) && !table.metadata?.isLocked && (
        <>
          {/* Edges */}
          <div className="absolute top-0 left-0 w-full h-1.5 -translate-y-1/2 cursor-ns-resize bg-transparent hover:bg-primary/50" onPointerDown={(e) => onResizeStart && onResizeStart(e, table._id, 'top')} />
          <div className="absolute bottom-0 left-0 w-full h-1.5 translate-y-1/2 cursor-ns-resize bg-transparent hover:bg-primary/50" onPointerDown={(e) => onResizeStart && onResizeStart(e, table._id, 'bottom')} />
          <div className="absolute top-0 left-0 w-1.5 h-full -translate-x-1/2 cursor-ew-resize bg-transparent hover:bg-primary/50" onPointerDown={(e) => onResizeStart && onResizeStart(e, table._id, 'left')} />
          <div className="absolute top-0 right-0 w-1.5 h-full translate-x-1/2 cursor-ew-resize bg-transparent hover:bg-primary/50" onPointerDown={(e) => onResizeStart && onResizeStart(e, table._id, 'right')} />
          
          {/* Corners */}
          <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-background border border-primary -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize rounded-sm shadow-sm" onPointerDown={(e) => onResizeStart && onResizeStart(e, table._id, 'top-left')} />
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-background border border-primary translate-x-1/2 -translate-y-1/2 cursor-nesw-resize rounded-sm shadow-sm" onPointerDown={(e) => onResizeStart && onResizeStart(e, table._id, 'top-right')} />
          <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-background border border-primary -translate-x-1/2 translate-y-1/2 cursor-nesw-resize rounded-sm shadow-sm" onPointerDown={(e) => onResizeStart && onResizeStart(e, table._id, 'bottom-left')} />
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-background border border-primary translate-x-1/2 translate-y-1/2 cursor-nwse-resize rounded-sm shadow-sm" onPointerDown={(e) => onResizeStart && onResizeStart(e, table._id, 'bottom-right')} />
        </>
      )}

      {isLayoutElement && table.type === "wall" && <GripHorizontal className="w-4 h-4 mt-1 opacity-20" />}

      {/* Professional Hover Info Tooltip */}
      {!isEditor && !isLayoutElement && (status || (isAvailable ? "available" : "occupied")) === "available" && (
        <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-card text-card-foreground p-3 rounded-lg shadow-xl border border-border/50 whitespace-nowrap pointer-events-none z-50 flex flex-col gap-1 min-w-[120px]">
          <div className="flex items-center justify-between border-b border-border/50 pb-1 mb-1">
            <span className="font-bold text-sm text-primary">{table.tableCode || table.tableNumber}</span>
            <div className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-[10px] font-semibold text-muted-foreground">
              <Users className="w-3 h-3" /> {table.capacity}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{table.sectionLabel || table.section}</p>
          <p className="text-xs capitalize flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary/50" /> {table.type}
          </p>
        </div>
      )}

      {/* Auto Chairs System */}
      {!isLayoutElement && !isArrangementZone && !isSection && !isDiningArea && (
        <AutoChairs 
          capacity={table.capacity} 
          shape={shape} 
          width={width} 
          height={height} 
        />
      )}

      {children}
    </motion.div>
  );
});
