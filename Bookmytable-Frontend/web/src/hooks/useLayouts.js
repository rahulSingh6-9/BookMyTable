import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDiningAreas, createDiningArea, deleteDiningArea, getLayoutProject, updateLayoutProject } from "../services/layout.service";
import { toast } from "sonner";

export function useDiningAreas(restaurantId) {
  return useQuery({
    queryKey: ["diningAreas", restaurantId],
    queryFn: async () => {
      const response = await getDiningAreas(restaurantId);
      return response.data.data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreateDiningArea(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createDiningArea(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diningAreas", restaurantId] });
      toast.success("Dining Area created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create Dining Area");
    },
  });
}

export function useDeleteDiningArea(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteDiningArea(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diningAreas", restaurantId] });
      toast.success("Dining Area deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete Dining Area");
    },
  });
}

export function useLayoutProject(layoutId) {
  return useQuery({
    queryKey: ["layoutProject", layoutId],
    queryFn: async () => {
      const response = await getLayoutProject(layoutId);
      return response.data.data;
    },
    enabled: !!layoutId,
  });
}

export function useUpdateLayoutProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ layoutId, data }) => updateLayoutProject(layoutId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["layoutProject", variables.layoutId] });
      toast.success("Layout saved successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save layout");
    },
  });
}
