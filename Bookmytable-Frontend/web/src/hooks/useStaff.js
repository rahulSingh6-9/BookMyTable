import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listStaff, inviteStaff, updateStaff, deleteStaff } from "../services/staff.service";
import { toast } from "sonner";

export function useStaff(restaurantId) {
  return useQuery({
    queryKey: ["staff", restaurantId],
    queryFn: async () => {
      const response = await listStaff(restaurantId);
      // Assuming response structure based on common patterns in the project
      return response.data || response; 
    },
    enabled: !!restaurantId,
  });
}

export function usePendingInvites(restaurantId) {
  return useQuery({
    queryKey: ["pendingInvites", restaurantId],
    queryFn: async () => {
      // Assuming a separate endpoint or query param for pending invites
      const response = await listStaff(restaurantId, { status: "pending" });
      return response.data || response;
    },
    enabled: !!restaurantId,
  });
}

export function useInviteStaff(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => inviteStaff(restaurantId, data),
    onSuccess: () => {
      // Invalidate both as requested
      queryClient.invalidateQueries({ queryKey: ["staff", restaurantId] });
      queryClient.invalidateQueries({ queryKey: ["pendingInvites", restaurantId] });
      toast.success("Invite sent successfully. Staff will receive an email shortly.");
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || "Failed to send invite";
      toast.error(message);
    },
  });
}


export function useUpdateStaff(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, data }) => updateStaff(staffId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", restaurantId] });
      toast.success("Staff member updated successfully");
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || "Failed to update staff";
      toast.error(message);
    },
  });
}

export function useDeleteStaff(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId) => deleteStaff(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff", restaurantId] });
      toast.success("Staff member removed successfully");
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || "Failed to remove staff";
      toast.error(message);
    },
  });
}
