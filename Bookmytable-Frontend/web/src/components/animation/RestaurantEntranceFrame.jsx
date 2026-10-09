import React, { forwardRef } from "react";

// Auto-detect if a custom restaurantEntrance asset is placed in src/assets
const entranceAssets = import.meta.glob("/src/assets/restaurantEntrance.{png,webp,svg,jpg,jpeg}", { eager: true });
const detectedEntranceAsset = Object.values(entranceAssets)[0]?.default || null;

/**
 * RestaurantEntranceFrame
 * 
 * Provides the foreground entrance architectural frame through which the interior is viewed.
 * Features:
 * - 100% transparent central doorway opening revealing the interior image behind
 * - Neoclassical architectural facade matching the luxury dining room's arches and warm lighting
 * - Fluted pilasters, keystoned Roman arch, warm brass wall sconces, and recessed stone jamb
 * - Left & right French glass door leaves with 3D perspective transforms
 * - Automatic support for `src/assets/restaurantEntrance.png` if provided
 */
export const RestaurantEntranceFrame = forwardRef(function RestaurantEntranceFrame(
  { customEntranceSrc, className = "" },
  ref
) {
  const entranceImageSrc = customEntranceSrc || detectedEntranceAsset;

  return (
    <div
      ref={ref}
      className={`entrance-frame absolute inset-0 pointer-events-none select-none flex items-center justify-center overflow-visible will-change-transform ${className}`}
      style={{
        transformOrigin: "50% 50%",
      }}
    >
      {/* If an external transparent entrance PNG is supplied, render it as primary asset layer */}
      {entranceImageSrc ? (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center">
          <img
            src={entranceImageSrc}
            alt="Restaurant Entrance Architecture"
            className="w-full h-full object-cover pointer-events-none"
          />
        </div>
      ) : (
        /* Procedural Neoclassical Entrance Architectural Facade */
        <div className="entrance-facade-container relative w-full h-full flex items-center justify-center">
          
          {/* Architectural Facade Frame (SVG + CSS with pure transparent doorway aperture) */}
          <svg
            className="w-full h-full absolute inset-0 preserve-3d"
            viewBox="0 0 1920 1080"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Mask defining the transparent doorway opening */}
              <mask id="doorwayApertureMask">
                {/* Everything white is visible facade */}
                <rect x="0" y="0" width="1920" height="1080" fill="#FFFFFF" />
                {/* The central arched doorway opening is cut out (black = transparent) */}
                {/* Arch radius 340px, width 680px, height from y=180 to y=1080 (floor) */}
                <path
                  d="M 620,1080
                     L 620,440
                     A 340,340 0 0 1 1300,440
                     L 1300,1080
                     Z"
                  fill="#000000"
                />
              </mask>

              {/* Exterior stone wall gradient (Luxury warm limestone & Parisian evening facade) */}
              <linearGradient id="stoneWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1a1816" />
                <stop offset="35%" stopColor="#25211c" />
                <stop offset="70%" stopColor="#1e1b17" />
                <stop offset="100%" stopColor="#12100e" />
              </linearGradient>

              {/* Architectural Moulding Highlight */}
              <linearGradient id="goldTrimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8c6d3b" stopOpacity="0.4" />
                <stop offset="30%" stopColor="#e5c378" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#fff2c6" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#e5c378" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8c6d3b" stopOpacity="0.4" />
              </linearGradient>

              {/* Doorway Inner Jamb Depth (Simulating 3D stone wall thickness) */}
              <linearGradient id="jambLeftGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0a0908" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2f261c" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="jambRightGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0a0908" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#2f261c" stopOpacity="0.2" />
              </linearGradient>
              <radialGradient id="archSoffitGrad" cx="50%" cy="30%" r="50%">
                <stop offset="0%" stopColor="#3d3023" stopOpacity="0.8" />
                <stop offset="85%" stopColor="#14100b" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0a0806" />
              </radialGradient>

              {/* Warm Sconce Glow Filter */}
              <filter id="lanternGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="25" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Facade Wall with Cutout Doorway */}
            <g mask="url(#doorwayApertureMask)" className="entrance-surround-walls">
              {/* Base Wall Surface */}
              <rect x="0" y="0" width="1920" height="1080" fill="url(#stoneWallGrad)" />

              {/* Left Architectural Pilaster / Column */}
              <rect x="420" y="100" width="140" height="980" fill="#2c2721" />
              <rect x="435" y="100" width="10" height="980" fill="#1c1915" />
              <rect x="465" y="100" width="10" height="980" fill="#1c1915" />
              <rect x="495" y="100" width="10" height="980" fill="#1c1915" />
              <rect x="525" y="100" width="10" height="980" fill="#1c1915" />
              {/* Left Column Capital & Plinth */}
              <rect x="400" y="80" width="180" height="30" fill="#3a332a" rx="3" />
              <rect x="410" y="1000" width="160" height="80" fill="#2a241d" />

              {/* Right Architectural Pilaster / Column */}
              <rect x="1360" y="100" width="140" height="980" fill="#2c2721" />
              <rect x="1375" y="100" width="10" height="980" fill="#1c1915" />
              <rect x="1405" y="100" width="10" height="980" fill="#1c1915" />
              <rect x="1435" y="100" width="10" height="980" fill="#1c1915" />
              <rect x="1465" y="100" width="10" height="980" fill="#1c1915" />
              {/* Right Column Capital & Plinth */}
              <rect x="1340" y="80" width="180" height="30" fill="#3a332a" rx="3" />
              <rect x="1350" y="1000" width="160" height="80" fill="#2a241d" />

              {/* Classical Entablature / Architrave beam above entrance */}
              <rect x="360" y="40" width="1200" height="46" fill="#362f27" />
              <rect x="340" y="24" width="1240" height="18" fill="#443b31" />
              <rect x="380" y="80" width="1160" height="8" fill="url(#goldTrimGrad)" />

              {/* Classical Exterior Wall Sconces (Left & Right) */}
              {/* Left Sconce */}
              <g transform="translate(320, 480)" className="sconce-left">
                {/* Sconce Wall Bracket */}
                <path d="M 20,40 L 45,10 L 45,55 L 20,40 Z" fill="#1f1a14" stroke="#524331" strokeWidth="2" />
                <rect x="40" y="-10" width="8" height="60" fill="#8c6d3b" />
                {/* Lantern Housing */}
                <polygon points="30,-30 58,-30 52,20 36,20" fill="#1c1712" stroke="#caa662" strokeWidth="2" />
                {/* Amber Light Bulb & Ambient Glow */}
                <circle cx="44" cy="-5" r="14" fill="#ffb443" filter="url(#lanternGlow)" opacity="0.95" />
                <circle cx="44" cy="-5" r="7" fill="#fff7d6" />
              </g>

              {/* Right Sconce */}
              <g transform="translate(1560, 480)" className="sconce-right">
                {/* Sconce Wall Bracket */}
                <path d="M 20,40 L -5,10 L -5,55 L 20,40 Z" fill="#1f1a14" stroke="#524331" strokeWidth="2" />
                <rect x="-8" y="-10" width="8" height="60" fill="#8c6d3b" />
                {/* Lantern Housing */}
                <polygon points="-18,-30 10,-30 4,20 -12,20" fill="#1c1712" stroke="#caa662" strokeWidth="2" />
                {/* Amber Light Bulb & Ambient Glow */}
                <circle cx="-4" cy="-5" r="14" fill="#ffb443" filter="url(#lanternGlow)" opacity="0.95" />
                <circle cx="-4" cy="-5" r="7" fill="#fff7d6" />
              </g>

              {/* Arch Moulding (Archivolt & Crown Keystone) */}
              <path
                d="M 580,1080
                   L 580,440
                   A 380,380 0 0 1 1340,440
                   L 1340,1080
                   L 1300,1080
                   L 1300,440
                   A 340,340 0 0 0 620,440
                   L 620,1080
                   Z"
                fill="#322b23"
                stroke="#1f1b16"
                strokeWidth="3"
              />
              <path
                d="M 600,1080
                   L 600,440
                   A 360,360 0 0 1 1320,440
                   L 1320,1080"
                fill="none"
                stroke="url(#goldTrimGrad)"
                strokeWidth="2.5"
                opacity="0.85"
              />

              {/* Arch Keystone at apex */}
              <polygon
                points="930,90 990,90 1005,150 915,150"
                fill="#42392d"
                stroke="#caa662"
                strokeWidth="2"
              />

              {/* Vignette on Outer Edges */}
              <rect x="0" y="0" width="300" height="1080" fill="black" opacity="0.45" />
              <rect x="1620" y="0" width="300" height="1080" fill="black" opacity="0.45" />
            </g>

            {/* Doorway Inner Reveal / Jamb (Rendered behind door leaves to give physical stone depth) */}
            <g className="doorway-jamb">
              {/* Left Door Jamb Revealing Depth */}
              <path
                d="M 620,440
                   L 650,450
                   L 650,1080
                   L 620,1080
                   Z"
                fill="url(#jambLeftGrad)"
              />
              {/* Right Door Jamb Revealing Depth */}
              <path
                d="M 1300,440
                   L 1270,450
                   L 1270,1080
                   L 1300,1080
                   Z"
                fill="url(#jambRightGrad)"
              />
              {/* Arch Soffit (Underneath arch curve) */}
              <path
                d="M 620,440
                   A 340,340 0 0 1 1300,440
                   L 1270,455
                   A 310,310 0 0 0 650,455
                   Z"
                fill="url(#archSoffitGrad)"
              />
            </g>
          </svg>

          {/* 3D Physical Open French Glass Doors (Framing the left and right of the doorway opening) */}
          <div
            className="doors-container absolute inset-0 pointer-events-none flex items-center justify-center"
            style={{ perspective: "1400px" }}
          >
            {/* Opening bounds container matching SVG coordinates:
                Doorway spans horizontal 32.3% (620/1920) to 67.7% (1300/1920) -> Width = 35.4%
                Height spans from 9.25% (100/1080) to 100% (floor) -> Height = 90.75%
            */}
            <div
              className="doorway-opening-frame relative flex justify-between"
              style={{
                width: "35.416vw",
                height: "90.74vh",
                bottom: 0,
                marginTop: "9.26vh",
              }}
            >
              {/* LEFT FRENCH DOOR PANEL (Ajar, angled open inwards towards interior) */}
              <div
                className="entrance-left-door relative w-[48%] h-full will-change-transform"
                style={{
                  transformOrigin: "left center",
                  transform: "rotateY(52deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Mahogany & Bronze Frame */}
                <div className="absolute inset-0 rounded-tl-[160px] border-[10px] border-[#221a14] bg-[#16120e]/60 shadow-2xl backdrop-blur-[0.5px]">
                  {/* Subtle inner golden highlight edge */}
                  <div className="absolute inset-1 rounded-tl-[152px] border border-[#a88243]/30 pointer-events-none" />

                  {/* Multi-pane glass grids with delicate reflection */}
                  <div className="grid grid-cols-2 grid-rows-4 w-full h-full p-2 gap-1.5 opacity-90">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`left-pane-${i}`}
                        className="relative rounded-sm border border-[#3b2e23] bg-gradient-to-br from-white/10 via-transparent to-amber-200/5 shadow-inner"
                      >
                        {/* Diagonal Glass Sheen Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                      </div>
                    ))}
                  </div>

                  {/* Brass Door Handle & Lock Plate */}
                  <div className="absolute right-3 top-[52%] -translate-y-1/2 w-3.5 h-20 rounded-full bg-gradient-to-b from-[#e5c378] via-[#caa662] to-[#735728] shadow-lg border border-[#ffd885]/40 flex items-center justify-center">
                    <div className="w-1.5 h-10 rounded-full bg-[#3d2b12]/30" />
                  </div>
                </div>
              </div>

              {/* RIGHT FRENCH DOOR PANEL (Ajar, angled open inwards towards interior) */}
              <div
                className="entrance-right-door relative w-[48%] h-full will-change-transform"
                style={{
                  transformOrigin: "right center",
                  transform: "rotateY(-52deg)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Mahogany & Bronze Frame */}
                <div className="absolute inset-0 rounded-tr-[160px] border-[10px] border-[#221a14] bg-[#16120e]/60 shadow-2xl backdrop-blur-[0.5px]">
                  {/* Subtle inner golden highlight edge */}
                  <div className="absolute inset-1 rounded-tr-[152px] border border-[#a88243]/30 pointer-events-none" />

                  {/* Multi-pane glass grids with delicate reflection */}
                  <div className="grid grid-cols-2 grid-rows-4 w-full h-full p-2 gap-1.5 opacity-90">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={`right-pane-${i}`}
                        className="relative rounded-sm border border-[#3b2e23] bg-gradient-to-bl from-white/10 via-transparent to-amber-200/5 shadow-inner"
                      >
                        {/* Diagonal Glass Sheen Reflection */}
                        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-white/10 to-transparent pointer-events-none" />
                      </div>
                    ))}
                  </div>

                  {/* Brass Door Handle & Lock Plate */}
                  <div className="absolute left-3 top-[52%] -translate-y-1/2 w-3.5 h-20 rounded-full bg-gradient-to-b from-[#e5c378] via-[#caa662] to-[#735728] shadow-lg border border-[#ffd885]/40 flex items-center justify-center">
                    <div className="w-1.5 h-10 rounded-full bg-[#3d2b12]/30" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Warm doorway ambient spill light (Simulating chandelier warmth spilling across the threshold) */}
          <div
            className="doorway-light-spill absolute bottom-0 w-[42vw] h-[35vh] pointer-events-none opacity-45"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255, 185, 90, 0.45) 0%, rgba(215, 140, 50, 0.15) 60%, transparent 100%)",
            }}
          />
        </div>
      )}
    </div>
  );
});

RestaurantEntranceFrame.displayName = "RestaurantEntranceFrame";
export default RestaurantEntranceFrame;
