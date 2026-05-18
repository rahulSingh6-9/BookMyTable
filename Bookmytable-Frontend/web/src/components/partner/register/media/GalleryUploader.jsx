import { useState, useRef, useEffect } from "react";
import { UploadCloud, X, Plus, GripVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { uploadOnboardingMedia } from "@/services/onboarding.service";

export function GalleryUploader({ values = [], onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      uploadingFiles.forEach(uf => {
        if (uf.preview) URL.revokeObjectURL(uf.preview);
      });
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = async (files) => {
    const validFiles = Array.from(files).filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    if (values.length + uploadingFiles.length + validFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images");
      return;
    }

    if (validFiles.length === 0) return;

    // Create local previews for instant feedback
    const newUploads = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);

    try {
      const res = await uploadOnboardingMedia(validFiles);
      if (res.success && res.data) {
        // Only get the successful URLs
        const newUrls = res.data.map(item => item.url);
        
        // Ensure values is an array and append
        const currentValues = Array.isArray(values) ? values : [];
        onChange([...currentValues, ...newUrls]);
        toast.success(`Successfully uploaded ${validFiles.length} photo(s)`);
      }
    } catch (error) {
      toast.error("Failed to upload some images. Please try again.");
    } finally {
      // Remove from uploading state
      setUploadingFiles(prev => prev.filter(uf => !newUploads.find(n => n.id === uf.id)));
      
      // Cleanup Object URLs
      newUploads.forEach(uf => URL.revokeObjectURL(uf.preview));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    processFiles(e.target.files);
    e.target.value = null; // Reset input
  };

  const removeImage = (index) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-foreground flex items-center gap-2">
            Restaurant Gallery <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Optional</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Add up to 5 photos of your interiors and food.</p>
        </div>
        <span className="text-xs font-bold bg-muted px-3 py-1 rounded-full text-muted-foreground">{values.length + uploadingFiles.length}/5</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <AnimatePresence>
          {Array.isArray(values) && values.map((img, i) => (
            <motion.div 
              key={`val-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-2xl overflow-hidden border border-border group bg-muted"
            >
              <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 h-8 w-8 bg-destructive/90 text-white rounded-full flex items-center justify-center hover:bg-destructive hover:scale-110 transition-all backdrop-blur-sm shadow-sm"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {uploadingFiles.map((uf) => (
            <motion.div 
              key={uf.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative aspect-square rounded-2xl overflow-hidden border border-border group bg-muted flex items-center justify-center"
            >
              <img src={uf.preview} alt="Uploading" className="w-full h-full object-cover opacity-50 blur-sm" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                <Loader2 className="h-6 w-6 text-white animate-spin mb-2" />
                <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">Uploading...</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {values.length + uploadingFiles.length < 5 && (
          <motion.div 
            layout
            className={`aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="h-12 w-12 bg-background shadow-sm rounded-full flex items-center justify-center mb-2">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground">Add Photo</span>
          </motion.div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden" 
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />
    </div>
  );
}
