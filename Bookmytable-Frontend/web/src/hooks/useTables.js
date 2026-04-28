import { useState, useCallback } from "react";
import { restaurantTables } from "@/lib/mockData";

export function useTables(restaurantId = "1") {
  const [tables, setTables] = useState(restaurantTables[restaurantId] || []);

  const addTable = useCallback((table) => {
    const newTable = {
      ...table,
      _id: `t${Date.now()}`,
      restaurant: restaurantId,
      isActive: true,
    };
    setTables((prev) => [...prev, newTable]);
    return newTable;
  }, [restaurantId]);

  const updateTable = useCallback((tableId, data) => {
    setTables((prev) => prev.map((t) => (t._id === tableId ? { ...t, ...data } : t)));
  }, []);

  const deleteTable = useCallback((tableId) => {
    setTables((prev) => prev.filter((t) => t._id !== tableId));
  }, []);

  return { tables, addTable, updateTable, deleteTable };
}
