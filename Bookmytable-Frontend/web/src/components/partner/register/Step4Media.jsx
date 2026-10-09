import { LogoUploader } from "./media/LogoUploader";
import { GalleryUploader } from "./media/GalleryUploader";
import { MediaPreviewPanel } from "./media/MediaPreviewPanel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";

export function Step4Media({ register, setValue, watch, skipStep }) {
  const brandName = watch("brandName") || watch("restaurantName");
  const cuisines = watch("cuisines");
  const addressLine1 = watch("addressLine1");
  const city = watch("city");
  
  // Media states (handled manually since it's base64 for now, but should sync with react-hook-form)
  const logo = watch("brandLogo");
  const gallery = watch("images") || [];

  const handleLogoChange = (base64) => {
    setValue("brandLogo", base64, { shouldValidate: true, shouldDirty: true });
  };

  const handleGalleryChange = (newGallery) => {
    setValue("images", newGallery, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
          <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
            Build your visual identity
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Restaurants with high-quality photos receive up to <strong>3x more bookings</strong>. 
            However, if you don't have them ready right now, you can skip this step and upload them later from your dashboard.
          </p>
          <Button 
            type="button"
            variant="outline" 
            onClick={skipStep}
            className="rounded-full font-bold"
          >
            Skip For Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <LogoUploader value={logo} onChange={handleLogoChange} />
        
        <GalleryUploader values={gallery} onChange={handleGalleryChange} />
      </div>

      <div className="lg:col-span-2 hidden lg:block">
        <MediaPreviewPanel 
          logo={logo} 
          gallery={gallery} 
          name={brandName}
          cuisines={cuisines}
          address={addressLine1 && city ? `${addressLine1}, ${city}` : addressLine1 || city}
        />
      </div>
    </div>
  );
}
