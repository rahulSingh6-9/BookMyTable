import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBranch } from "@/context/BranchContext";
import { useUpdatePricingConfig } from "@/hooks/usePricing";
import { Loader2, Settings2 } from "lucide-react";
import { TABLE_TYPES } from "@/lib/mockData";
import { FLOOR_OPTIONS, SECTION_OPTIONS } from "@/lib/tableConstants";

export function PricingConfigurationModal({ 
  open, 
  onOpenChange, 
  floor, 
  diningAreaType, 
  sectionType, 
  onSuccess 
}) {
  const { activeBranchId } = useBranch();
  const { mutate: updatePricing, isPending } = useUpdatePricingConfig(activeBranchId);
  
  const [price, setPrice] = useState("");
  const [password, setPassword] = useState("");

  // Helper to format labels safely
  const floorLabel = FLOOR_OPTIONS.find(f => f.value === floor)?.label || floor || "Unknown Floor";
  const typeLabel = TABLE_TYPES.find(t => t.value === diningAreaType)?.label || diningAreaType || "Unknown Type";
  const sectionLabel = SECTION_OPTIONS.find(s => s.value === sectionType)?.label || sectionType || "Unknown Section";

  const handleSave = () => {
    if (!price || !password) return;

    updatePricing(
      {
        floor,
        diningAreaType,
        sectionType,
        price: Number(price),
        password
      },
      {
        onSuccess: () => {
          setPrice("");
          setPassword("");
          if (onSuccess) onSuccess();
          onOpenChange(false);
        }
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-primary" />
            <DialogTitle>Configure Pricing</DialogTitle>
          </div>
          <DialogDescription>
            Pricing is missing for this area. Configure it now to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Context Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Floor</span>
              <span className="font-medium capitalize">{floorLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dining Area</span>
              <span className="font-medium">{typeLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Section</span>
              <span className="font-medium capitalize">{sectionLabel}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Base Price (₹)</Label>
              <Input 
                type="number" 
                min="0"
                placeholder="e.g. 150" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Security Verification</Label>
              <Input 
                type="password" 
                placeholder="Enter your account password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
              <p className="text-xs text-muted-foreground">
                Pricing updates are business-critical and require authorization.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            disabled={isPending || !price || !password}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Pricing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
