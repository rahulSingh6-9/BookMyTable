import React from "react";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, ...props }) {
  const logoUrl = "https://res.cloudinary.com/djgizjh2y/image/upload/v1787488218/Untitled5_20260823175651_thr2kt.jpg";
  
  return (
    <img 
      src={logoUrl} 
      alt="BookMyTable" 
      className={cn(
        "object-contain",
        className
      )}
      {...props}
    />
  );
}
