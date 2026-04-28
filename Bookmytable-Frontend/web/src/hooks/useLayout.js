import { useState, useCallback } from "react";
import { restaurantLayouts } from "@/lib/mockData";

export function useLayout(restaurantId = "1") {
  // Deep copy to allow editing without immediately mutating the global import
  const [layoutData, setLayoutData] = useState(() => 
    JSON.parse(JSON.stringify(restaurantLayouts[restaurantId] || { rooms: [] }))
  );
  const [activeRoomId, setActiveRoomId] = useState(
    layoutData.rooms.length > 0 ? layoutData.rooms[0].id : null
  );

  const rooms = layoutData.rooms;
  const activeRoom = rooms.find(r => r.id === activeRoomId) || rooms[0];

  const getTables = useCallback(() => {
    return activeRoom?.layout?.tables || [];
  }, [activeRoom]);

  const updateTablePosition = useCallback((tableId, newPosition) => {
    setLayoutData(prev => {
      const next = { ...prev };
      const roomIndex = next.rooms.findIndex(r => r.id === activeRoomId);
      if (roomIndex === -1) return prev;
      
      const tables = [...next.rooms[roomIndex].layout.tables];
      const tableIndex = tables.findIndex(t => t._id === tableId);
      if (tableIndex > -1) {
        tables[tableIndex] = { ...tables[tableIndex], position: newPosition };
        next.rooms[roomIndex].layout.tables = tables;
      }
      return next;
    });
  }, [activeRoomId]);

  const saveLayout = useCallback(() => {
    // In a real app, this would be an API call POST/PUT
    console.log("Saving layout configuration to backend:", layoutData);
    return true;
  }, [layoutData]);

  return {
    rooms,
    activeRoom,
    activeRoomId,
    setActiveRoomId,
    getTables,
    updateTablePosition,
    saveLayout
  };
}
