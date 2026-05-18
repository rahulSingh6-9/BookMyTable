import { useEffect } from "react";
import { ReservationTimingCard } from "./settings/ReservationTimingCard";
import { BookingCapacityCard } from "./settings/BookingCapacityCard";
import { AutomationHandlingCard } from "./settings/AutomationHandlingCard";
import { ReservationPoliciesCard } from "./settings/ReservationPoliciesCard";
import { SettingsSummaryPanel } from "./settings/SettingsSummaryPanel";

const DEFAULT_SETTINGS = {
  timeSlotInterval: 30,
  slotDuration: 60,
  advanceBookingDays: 30,
  minGuestsPerBooking: 1,
  maxGuestsPerBooking: 10,
  onlineBookingLimitPerSlot: 10,
  autoAcceptBookings: true,
  waitlistEnabled: true,
  tableBufferMinutes: 15,
  depositRequired: false,
  depositAmount: 0,
  cancellationPolicy: ""
};

export function Step7BookingSettings({ setValue, watch }) {
  const settings = watch("settings");

  // Hydrate defaults on mount if empty
  useEffect(() => {
    if (!settings || Object.keys(settings).length === 0) {
      setValue("settings", DEFAULT_SETTINGS, { shouldValidate: true, shouldDirty: true });
    }
  }, []);

  const safeSettings = settings || DEFAULT_SETTINGS;

  const updateSetting = (key, value) => {
    const updated = { ...safeSettings, [key]: value };
    setValue("settings", updated, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
          <h3 className="font-bold text-primary mb-2">
            Reservation Engine Settings
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Configure how your online bookings operate. These rules ensure that reservations seamlessly match your operational capacity and reduce no-shows.
          </p>
        </div>

        <ReservationTimingCard settings={safeSettings} updateSetting={updateSetting} />
        <BookingCapacityCard settings={safeSettings} updateSetting={updateSetting} />
        <AutomationHandlingCard settings={safeSettings} updateSetting={updateSetting} />
        <ReservationPoliciesCard settings={safeSettings} updateSetting={updateSetting} />
        
      </div>

      <div className="lg:col-span-2 hidden lg:block">
        <SettingsSummaryPanel settings={safeSettings} />
      </div>
    </div>
  );
}
