import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTables, createTable, updateTable, deleteTable, bulkGenerateTables } from "../services/table.service";
import { toast } from "sonner";

export function useTables(restaurantId) {
  return useQuery({
    queryKey: ["tables", restaurantId],
    queryFn: async () => {
      const response = await getTables(restaurantId);
      return response.data.data;
    },
    enabled: !!restaurantId,
  });
}

export function useCreateTable(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => createTable(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      toast.success("Table created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create table");
    },
  });
}

export function useUpdateTable(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tableId, data }) => updateTable(tableId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      toast.success("Table updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update table");
    },
  });
}

export function useDeleteTable(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tableId) => deleteTable(tableId),
    onMutate: async (tableId) => {
      await queryClient.cancelQueries({ queryKey: ["tables", restaurantId] });
      const previousTables = queryClient.getQueryData(["tables", restaurantId]);
      queryClient.setQueryData(["tables", restaurantId], (old) =>
        old?.filter((table) => table._id !== tableId)
      );
      return { previousTables };
    },
    onError: (err, tableId, context) => {
      queryClient.setQueryData(["tables", restaurantId], context.previousTables);
      toast.error(err.message || "Failed to delete table");
    },
    onSuccess: () => {
      toast.success("Table deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });
}

export function useBulkGenerateTables(restaurantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => bulkGenerateTables(restaurantId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
      // Access the number of created tables from response data if available
      const createdCount = res?.data?.created || "Tables";
      toast.success(`${createdCount} generated successfully`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || "Failed to generate tables");
    },
  });
}
