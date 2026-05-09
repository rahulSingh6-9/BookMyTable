import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBookingStatus } from "@/services/booking.service";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const CheckInButton = ({ bookingId, currentStatus, className }) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => updateBookingStatus(bookingId, "checked_in"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", "bookings"] });
      toast.success("Customer checked in successfully");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to check in");
    },
  });

  if (currentStatus === "checked_in") {
    return (
      <div className="flex items-center gap-1 text-green-600 font-medium text-sm">
        <CheckCircle2 className="w-4 h-4" />
        Checked In
      </div>
    );
  }

  if (currentStatus !== "confirmed") return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      ) : (
        <CheckCircle2 className="w-4 h-4 mr-2" />
      )}
      Check In
    </Button>
  );
};
