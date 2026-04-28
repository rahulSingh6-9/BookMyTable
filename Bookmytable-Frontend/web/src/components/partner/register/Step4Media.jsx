import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Camera, Plus, X, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

export function Step4Media({ register, setValue, watch }) {
  const [previews, setPreviews] = useState([]);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleImageChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (type === "logo") {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(files[0]);
      setValue("logo", files[0]);
    } else {
      const newPreviews = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result].slice(0, 5));
        };
        reader.readAsDataURL(file);
      });
      // In a real app, you'd append the files to a list
      setValue("images", files.slice(0, 5));
    }
  };

  const removeImage = (index) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Label>Restaurant Logo</Label>
        <div className="flex items-center gap-6">
          <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            )}
          </div>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="rounded-full relative">
              <Camera className="mr-2 h-4 w-4" />
              Upload Logo
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*"
                onChange={(e) => handleImageChange(e, "logo")}
              />
            </Button>
            <p className="text-[10px] text-muted-foreground">PNG, JPG or SVG. Max 2MB.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <Label>Restaurant Photos (Max 5)</Label>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">{previews.length}/5 photos</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {previews.map((preview, i) => (
            <div key={i} className="group relative aspect-square rounded-2xl border border-border overflow-hidden bg-muted">
              <img src={preview} alt={`Preview ${i}`} className="h-full w-full object-cover" />
              <button 
                type="button" 
                onClick={() => removeImage(i)}
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {previews.length < 5 && (
            <div className="relative aspect-square rounded-2xl border-2 border-dashed border-border bg-muted/30 hover:bg-muted transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
              <div className="h-10 w-10 bg-background rounded-full flex items-center justify-center shadow-sm">
                <Plus className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Add Photo</span>
              <input 
                type="file" 
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*"
                onChange={(e) => handleImageChange(e, "images")}
              />
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground text-center pt-2">
          High quality photos of your interiors and dishes help in getting 3x more bookings.
        </p>
      </div>
    </div>
  );
}
