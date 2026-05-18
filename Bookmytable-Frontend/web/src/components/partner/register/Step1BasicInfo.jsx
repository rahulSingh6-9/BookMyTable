import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Hash, Link as LinkIcon, Info, Sparkles, Store } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cuisines = ["Indian", "Chinese", "Italian", "Continental", "Fast Food", "Mexican", "Japanese", "Desserts"];

export function Step1BasicInfo() {
  const { register, formState: { errors }, setValue, watch } = useFormContext();
  const [tagInput, setTagInput] = useState("");

  const selectedCuisines = watch("cuisines") || [];
  const priceRangeValue = watch("priceRange");
  const restaurantName = watch("restaurantName");
  const city = watch("city");
  const slug = watch("slug");
  const isManualSlug = watch("isManualSlug");
  const tags = watch("tags") || [];

  // 🔗 Intelligent Slug Generation
  useEffect(() => {
    if (!isManualSlug && restaurantName) {
      const generatedSlug = generateSlug(restaurantName, city);
      setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [restaurantName, city, isManualSlug, setValue]);

  const generateSlug = (name, cityName) => {
    let base = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
      .trim()
      .replace(/\s+/g, "-"); // Replace spaces with hyphens

    if (cityName) {
      const citySlug = cityName.toLowerCase().trim().replace(/\s+/g, "-");
      if (!base.includes(citySlug)) {
        base = `${base}-${citySlug}`;
      }
    }
    
    return base.replace(/-+/g, "-"); // Remove duplicate hyphens
  };

  const handleSlugChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setValue("slug", value, { shouldValidate: true });
    if (!isManualSlug) {
      setValue("isManualSlug", true);
    }
  };

  // 🏷️ Tag Management
  const addTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
      if (!tags.includes(newTag) && tags.length < 10) {
        setValue("tags", [...tags, newTag], { shouldValidate: true });
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setValue("tags", tags.filter(t => t !== tagToRemove), { shouldValidate: true });
  };

  const toggleCuisine = (cuisine) => {
    const current = [...selectedCuisines];
    if (current.includes(cuisine)) {
      setValue("cuisines", current.filter(c => c !== cuisine), { shouldValidate: true });
    } else {
      setValue("cuisines", [...current, cuisine], { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Restaurant Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="restaurantName" className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            Restaurant / Branch Name
          </Label>
          <Input 
            id="restaurantName" 
            placeholder="e.g. Royal Spice Hub" 
            className="h-12 rounded-xl border-2 focus-visible:ring-primary/20"
            {...register("restaurantName")}
          />
          {errors.restaurantName && (
            <p className="text-xs text-destructive ml-1">{errors.restaurantName.message}</p>
          )}
        </div>

        {/* Slug Field */}
        <div className="space-y-2">
          <Label htmlFor="slug" className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-primary" />
              Public URL Slug
            </div>
            {isManualSlug && (
              <button 
                type="button" 
                onClick={() => setValue("isManualSlug", false)}
                className="text-[10px] uppercase font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Auto-sync
              </button>
            )}
          </Label>
          <div className="relative">
            <Input 
              id="slug" 
              value={slug}
              onChange={handleSlugChange}
              placeholder="royal-spice-hub-kota" 
              className="h-12 rounded-xl border-2 pl-4 focus-visible:ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-2 px-2">
             <span className="text-[10px] font-medium text-muted-foreground">Preview:</span>
             <code className="text-[10px] text-primary font-bold bg-primary/5 px-2 py-0.5 rounded-full">
               bookmytable.com/r/{slug || "..."}
             </code>
          </div>
          {errors.slug && (
            <p className="text-xs text-destructive ml-1">{errors.slug.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          Short Description
        </Label>
        <Textarea 
          id="description" 
          placeholder="Describe your restaurant's story, vibe, and vision..." 
          className="min-h-[100px] rounded-2xl border-2 focus-visible:ring-primary/20 resize-none"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive ml-1">{errors.description.message}</p>
        )}
      </div>

      {/* Tags Input */}
      <div className="space-y-3">
        <Label htmlFor="tags" className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-primary" />
          Search Tags & Categories
        </Label>
        
        <div className="relative group">
          <Input 
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder={tags.length >= 10 ? "Maximum tags reached" : "Add tag (e.g. rooftop, family) and press Enter"}
            disabled={tags.length >= 10}
            className="h-12 rounded-xl border-2 focus-visible:ring-primary/20 pl-4"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded">
            {tags.length}/10
          </div>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-2xl bg-muted/30 border border-dashed border-border">
          <AnimatePresence>
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground/60 italic ml-2 mt-1">No tags added yet. Tags help users find you faster.</p>
            ) : (
              tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Badge variant="secondary" className="pl-3 pr-1 py-1.5 gap-1.5 bg-background border-2 border-primary/20 text-primary rounded-xl group hover:border-primary/50 transition-colors shadow-sm">
                    <span className="text-xs font-bold font-mono">#{tag}</span>
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      className="hover:bg-destructive hover:text-destructive-foreground p-0.5 rounded-full transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cuisines */}
      <div className="space-y-2">
        <Label>Cuisines (Select multiple)</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedCuisines.map(c => (
            <Badge key={c} variant="secondary" className="pl-3 pr-1 py-1 gap-1">
              {c}
              <button 
                type="button" 
                onClick={() => toggleCuisine(c)}
                className="hover:bg-muted p-0.5 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {cuisines.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCuisine(c)}
              className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                selectedCuisines.includes(c) 
                  ? "bg-primary/10 border-primary text-primary" 
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        {errors.cuisines && (
          <p className="text-xs text-destructive">{errors.cuisines.message}</p>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <Label htmlFor="priceRange">Price Range</Label>
        <Select 
          value={priceRangeValue} 
          onValueChange={(val) => setValue("priceRange", val, { shouldValidate: true })}
        >
          <SelectTrigger id="priceRange">
            <SelectValue placeholder="Select price level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="₹">₹ (Budget Friendly)</SelectItem>
            <SelectItem value="₹₹">₹₹ (Mid-range)</SelectItem>
            <SelectItem value="₹₹₹">₹₹₹ (Premium)</SelectItem>
            <SelectItem value="₹₹₹₹">₹₹₹₹ (Luxury)</SelectItem>
          </SelectContent>
        </Select>
        {errors.priceRange && (
          <p className="text-xs text-destructive">{errors.priceRange.message}</p>
        )}
      </div>
    </div>
  );
}
