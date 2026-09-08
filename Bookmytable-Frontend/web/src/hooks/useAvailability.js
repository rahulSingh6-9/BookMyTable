import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAvailabilitySettings,
  updateSchedule,
  updateSlotConfig,
  addException,
  deleteException,
  updateBookingPolicies
} from "../services/settings.service";
import { toast } from "sonner";

export const useAvailability = (restaurantId) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["availability-settings", restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const res = await getAvailabilitySettings(restaurantId);
      return res.data.data;
    },
    enabled: !!restaurantId,
  });

  const scheduleMutation = useMutation({
    mutationFn: (data) => updateSchedule(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["availability-settings", restaurantId]);
      toast.success("Schedule updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update schedule");
    },
  });

  const slotConfigMutation = useMutation({
    mutationFn: (data) => updateSlotConfig(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["availability-settings", restaurantId]);
      toast.success("Slot config updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update slot config");
    },
  });

  const addExceptionMutation = useMutation({
    mutationFn: (data) => addException(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["availability-settings", restaurantId]);
      toast.success("Exception added successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add exception");
    },
  });

  const deleteExceptionMutation = useMutation({
    mutationFn: (date) => deleteException(restaurantId, date),
    onSuccess: () => {
      queryClient.invalidateQueries(["availability-settings", restaurantId]);
      toast.success("Exception removed successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to remove exception");
    },
  });

  const bookingPoliciesMutation = useMutation({
    mutationFn: (data) => updateBookingPolicies(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["availability-settings", restaurantId]);
      toast.success("Booking policies updated successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update booking policies");
    },
  });

  return {
    ...query,
    updateSchedule: scheduleMutation.mutate,
    isUpdatingSchedule: scheduleMutation.isPending,
    updateSlotConfig: slotConfigMutation.mutate,
    isUpdatingSlotConfig: slotConfigMutation.isPending,
    addException: addExceptionMutation.mutate,
    isAddingException: addExceptionMutation.isPending,
    deleteException: deleteExceptionMutation.mutate,
    isDeletingException: deleteExceptionMutation.isPending,
    updateBookingPolicies: bookingPoliciesMutation.mutate,
    isUpdatingBookingPolicies: bookingPoliciesMutation.isPending,
  };
};
