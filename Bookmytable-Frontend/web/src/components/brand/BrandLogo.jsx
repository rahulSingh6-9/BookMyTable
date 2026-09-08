import React from "react";
import { BRAND_CONFIG } from "@/config/brand";
import { cn } from "@/lib/utils";

/**
 * BrandLogo - Centralized logo component for the application.
 * 
 * @param {string} className - Optional additional classes for the image
 * @param {string} variant - "default" (normal logo) or "compact" (for collapsed sidebar) - defaults to "default". 
 *                           Currently, the logo asset doesn't have a distinct compact version, so it uses the same image but you can style differently.
 */
export function BrandLogo({ className, variant = "default", ...props }) {
  // Use the official Cloudinary logo
  const logoUrl = "https://res.cloudinary.com/djgizjh2y/image/upload/v1787488218/Untitled5_20260823175651_thr2kt.jpg";
  
  return (
    <img 
      src={logoUrl} 
      alt={BRAND_CONFIG.logo.alt} 
      className={cn(
        "object-contain", // maintain aspect ratio without cropping
        className
      )}
      {...props}
    />
  );
}
