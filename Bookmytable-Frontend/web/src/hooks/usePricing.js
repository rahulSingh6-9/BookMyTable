import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPricingConfig, updatePricingConfig, validatePricingPassword, deletePricingConfig } from "../services/pricing.service";
import { toast } from "sonner";

export function usePricingConfig(branchId) {
  return useQuery({
    queryKey: ["pricingConfig", branchId],
    queryFn: async () => {
      const response = await getPricingConfig(branchId);
      return response.data.data;
    },
    enabled: !!branchId,
  });
}

export function useUpdatePricingConfig(branchId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updatePricingConfig(branchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricingConfig", branchId] });
      toast.success("Pricing updated successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update pricing");
    },
  });
}

export const useDeletePricingConfig = (branchId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pricingId, password }) => deletePricingConfig(branchId, pricingId, password),
    onSuccess: () => {
      toast.success("Pricing rule deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["pricingConfig", branchId] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete pricing rule");
    }
  });
};

export function useValidatePricingPassword() {
  return useMutation({
    mutationFn: (password) => validatePricingPassword(password),
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Invalid password");
    },
  });
}
