import { useState, useRef } from "react";
import { UploadCloud, X, ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { uploadOnboardingMedia } from "@/services/onboarding.service";

export function LogoUploader({ value, onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be less than 2MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, WEBP, and SVG are allowed");
      return;
    }

    try {
      setIsUploading(true);
      const res = await uploadOnboardingMedia([file]);
      if (res.success && res.data.length > 0) {
        onChange(res.data[0].url);
        toast.success("Logo uploaded successfully");
      }
    } catch (error) {
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm relative overflow-hidden group">
      <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
        Restaurant Logo <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Optional</span>
      </h3>
      
      {!value ? (
        <div 
          className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-300 ${isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50 hover:bg-muted/50"} ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 transition-colors ${isDragging ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"}`}>
            {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <UploadCloud className="h-8 w-8" />}
          </div>
          <p className="font-semibold text-foreground mb-1">
            {isUploading ? "Uploading..." : "Click or drag & drop to upload"}
          </p>
          <p className="text-xs text-muted-foreground mb-4">SVG, PNG, JPG or WEBP (Max 2MB)</p>
        </div>
      ) : (
        <div className="flex items-center gap-6 bg-muted/30 p-4 rounded-2xl border border-border/50">
          <div className="h-24 w-24 rounded-2xl overflow-hidden border border-border shadow-sm bg-white shrink-0 relative group/img">
            <img src={value} alt="Logo" className="w-full h-full object-contain p-2" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-white hover:scale-110 transition-transform font-medium text-xs bg-black/40 px-3 py-1.5 rounded-full"
              >
                Replace
              </button>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-emerald-500 font-medium mb-1">
              <CheckCircle2 className="h-5 w-5" /> Logo uploaded
            </div>
            <p className="text-sm text-muted-foreground mb-3">Your brand logo looks great!</p>
            <button 
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-destructive hover:underline font-medium"
            >
              Remove Logo
            </button>
          </div>
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleFileChange}
      />
    </div>
  );
}
