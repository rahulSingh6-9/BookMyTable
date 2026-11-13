import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRestaurantBookings, updateBookingStatus } from "@/services/booking.service";

export const restaurantBookingsQueryKey = (branchId) => ["bookings", branchId, "reservations"];

const normalizeBookings = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.data)) return raw.data;
  if (Array.isArray(raw.data?.data)) return raw.data.data;
  if (Array.isArray(raw.bookings)) return raw.bookings;
  return [];
};

export function useRestaurantBookings(branchId) {
  return useQuery({
    queryKey: restaurantBookingsQueryKey(branchId),
    queryFn: async () => {
      const res = await getRestaurantBookings(branchId);
      return normalizeBookings(res?.data);
    },
    enabled: !!branchId,
    staleTime: 15_000,
  });
}

export function useUpdateBookingStatus(branchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", branchId] });
    },
  });
}
