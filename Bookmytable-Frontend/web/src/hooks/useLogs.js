import { useQuery } from "@tanstack/react-query";
import { getRestaurantLogs, getGlobalLogs } from "../services/logs.service";

export function useRestaurantLogs(restaurantId, filters) {
  return useQuery({
    queryKey: ["logs", "restaurant", restaurantId, filters],
    queryFn: async () => {
      const response = await getRestaurantLogs(restaurantId, filters);
      return response.data || response;
    },
    enabled: !!restaurantId,
  });
}

export function useGlobalLogs(filters) {
  return useQuery({
    queryKey: ["logs", "global", filters],
    queryFn: async () => {
      const response = await getGlobalLogs(filters);
      return response.data || response;
    },
  });
}
