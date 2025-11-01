import * as React from "react";

/**
 * Logo Concept 1: "The Modular Construct"
 * This icon represents the "building blocks" of an AI bot,
 * with the central hexagon as the "brain" or "intelligence".
 */
export const LogoIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-label="BuildMyBot Icon"
  >
    {/* Left Block ▉ */}
    <rect 
      x="10" 
      y="10" 
      width="25" 
      height="60" 
      rx="5" 
      fill="hsl(var(--primary))" 
    />
    
    {/* Right Block ▉ */}
    <rect 
      x="65" 
      y="10" 
      width="25" 
      height="60" 
      rx="5" 
      fill="hsl(var(--primary))" 
    />
    
    {/* Middle Hexagon ⬣ (The AI Core) */}
    <polygon 
      points="50,20 38,30 38,50 50,60 62,50 62,30" 
      fill="hsl(var(--secondary))" 
      stroke="hsl(var(--accent))" 
      strokeWidth="4" 
    />
  </svg>
);
