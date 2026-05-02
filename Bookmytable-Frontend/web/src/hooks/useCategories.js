import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../services/category.service";
import { toast } from "sonner";

export function useCategories(restaurantId) {
  return useQuery({
    queryKey: ["categories", restaurantId],
    queryFn: async () => {
      const response = await getCategories(restaurantId);
      return response.data.data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreateCategory(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createCategory(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  });
}

export function useUpdateCategory(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }) => updateCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  });
}

export function useDeleteCategory(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId) => deleteCategory(categoryId),
    onMutate: async (categoryId) => {
      await queryClient.cancelQueries({ queryKey: ["categories", restaurantId] });
      const previousCategories = queryClient.getQueryData(["categories", restaurantId]);
      queryClient.setQueryData(["categories", restaurantId], (old) =>
        old?.filter((cat) => cat._id !== categoryId)
      );
      return { previousCategories };
    },
    onError: (err, categoryId, context) => {
      queryClient.setQueryData(["categories", restaurantId], context.previousCategories);
      toast.error(err.message || "Failed to delete category");
    },
    onSuccess: () => {
      toast.success("Category deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["categories", restaurantId] });
    },
  });
}
