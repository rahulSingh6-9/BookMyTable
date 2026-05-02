import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from "../services/menuItem.service";
import { toast } from "sonner";

export function useMenuItems(restaurantId, categoryId = null) {
  return useQuery({
    queryKey: ["menuItems", restaurantId, categoryId],
    queryFn: async () => {
      const response = await getMenuItems(restaurantId, categoryId);
      return response.data.data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreateMenuItem(restaurantId, categoryId = null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createMenuItem(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", restaurantId, categoryId] });
      toast.success("Menu item created successfully");
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message || "Failed to create menu item";
      toast.error(message);
    },
  });
}

export function useUpdateMenuItem(restaurantId, categoryId = null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }) => updateMenuItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", restaurantId, categoryId] });
      toast.success("Menu item updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update menu item");
    },
  });
}

export function useDeleteMenuItem(restaurantId, categoryId = null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId) => deleteMenuItem(itemId),
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ["menuItems", restaurantId, categoryId] });
      const previousItems = queryClient.getQueryData(["menuItems", restaurantId, categoryId]);
      queryClient.setQueryData(["menuItems", restaurantId, categoryId], (old) =>
        old?.filter((item) => item._id !== itemId)
      );
      return { previousItems };
    },
    onError: (err, itemId, context) => {
      queryClient.setQueryData(["menuItems", restaurantId, categoryId], context.previousItems);
      toast.error(err.message || "Failed to delete menu item");
    },
    onSuccess: () => {
      toast.success("Menu item deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems", restaurantId, categoryId] });
    },
  });
}
