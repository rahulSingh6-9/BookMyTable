import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAvailability } from "@/hooks/useAvailability";
import { useMyRestaurant } from "@/hooks/useRestaurantSettings";
import { Save, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

export default function OwnerBookingPolicies() {
  const { data: restaurant, isLoading: isLoadingRestaurant } = useMyRestaurant();
  const restaurantId = restaurant?._id; 
  
  const {
    data: availabilitySettings,
    isLoading: isAvailabilityLoading,
    updateBookingPolicies,
    isUpdatingBookingPolicies
  } = useAvailability(restaurantId);

  const [policies, setPolicies] = useState({
    minGuestsPerBooking: 1,
    maxGuestsPerBooking: 10,
    advanceBookingDays: 30,
    cancellationPolicy: "",
    autoAcceptBookings: true,
    depositRequired: false,
    depositAmount: 0,
  });

  useEffect(() => {
    if (availabilitySettings && availabilitySettings.settings) {
      setPolicies(prev => ({ ...prev, ...availabilitySettings.settings }));
    }
  }, [availabilitySettings]);

  const handlePolicyChange = (field, value) => {
    setPolicies(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePolicies = () => {
    updateBookingPolicies(policies);
  };

  if (isLoadingRestaurant || isAvailabilityLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Please set up your restaurant first to manage booking policies.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Booking Policies</h1>
              <p className="text-muted-foreground">Configure your reservation rule engine and requirements</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Reservation Rules</h3>
              </div>
              <Button onClick={handleSavePolicies} disabled={isUpdatingBookingPolicies} className="gap-2 rounded-lg">
                {isUpdatingBookingPolicies ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Policies
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Min Guests</Label>
                <Input
                  type="number"
                  min={1}
                  value={policies.minGuestsPerBooking}
                  onChange={(e) => handlePolicyChange("minGuestsPerBooking", Number(e.target.value))}
                  className="bg-background rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Guests</Label>
                <Input
                  type="number"
                  min={1}
                  value={policies.maxGuestsPerBooking}
                  onChange={(e) => handlePolicyChange("maxGuestsPerBooking", Number(e.target.value))}
                  className="bg-background rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Booking Window (Advance Booking Days)</Label>
              <Input
                type="number"
                min={1}
                value={policies.advanceBookingDays}
                onChange={(e) => handlePolicyChange("advanceBookingDays", Number(e.target.value))}
                className="bg-background rounded-lg"
              />
              <p className="text-xs text-muted-foreground">How many days ahead customers can book</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Cancellation Policy</Label>
              <Input
                value={policies.cancellationPolicy}
                onChange={(e) => handlePolicyChange("cancellationPolicy", e.target.value)}
                placeholder="e.g., Free cancellation up to 2 hours before"
                className="bg-background rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-xl bg-background/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Auto-Accept Bookings</Label>
                <p className="text-xs text-muted-foreground">Automatically confirm new reservations</p>
              </div>
              <Switch
                checked={policies.autoAcceptBookings}
                onCheckedChange={(v) => handlePolicyChange("autoAcceptBookings", v)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-xl bg-background/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Require Deposit</Label>
                <p className="text-xs text-muted-foreground">Charge a deposit at booking time</p>
              </div>
              <Switch
                checked={policies.depositRequired}
                onCheckedChange={(v) => handlePolicyChange("depositRequired", v)}
              />
            </div>

            {policies.depositRequired && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2 pt-2">
                <Label className="text-sm font-medium">Deposit Amount (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={policies.depositAmount}
                  onChange={(e) => handlePolicyChange("depositAmount", Number(e.target.value))}
                  className="bg-background rounded-lg"
                />
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
