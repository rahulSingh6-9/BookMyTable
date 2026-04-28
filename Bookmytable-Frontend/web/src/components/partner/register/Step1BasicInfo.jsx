import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useFormContext } from "react-hook-form";

const cuisines = ["Indian", "Chinese", "Italian", "Continental", "Fast Food", "Mexican", "Japanese", "Desserts"];

export function Step1BasicInfo() {
  const { register, formState: { errors }, setValue, watch } = useFormContext();

  const selectedCuisines = watch("cuisines") || [];
  const priceRangeValue = watch("priceRange");

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
      <div className="space-y-2">
        <Label htmlFor="restaurantName">Restaurant Name</Label>
        <Input 
          id="restaurantName" 
          placeholder="e.g. The Grand Bistro" 
          {...register("restaurantName", {
            required: "Restaurant name is required",
            minLength: {
              value: 3,
              message: "Restaurant name must be at least 3 characters"
            }
          })}
        />
        {errors.restaurantName && (
          <p className="text-xs text-destructive">{errors.restaurantName.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          placeholder="Describe your restaurant's story, vibe, and vision..." 
          className="min-h-[120px]"
          {...register("description", {
            required: "Description is required",
            minLength: {
              value: 10,
              message: "Description must be at least 10 characters"
            }
          })}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
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
