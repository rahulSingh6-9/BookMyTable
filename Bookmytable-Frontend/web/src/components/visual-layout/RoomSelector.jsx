import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RoomSelector({ rooms, activeRoomId, onSelect }) {
  if (!rooms || rooms.length === 0) return null;

  return (
    <div className="flex justify-center mb-6">
      <Tabs value={activeRoomId} onValueChange={onSelect} className="w-full max-w-md">
        <TabsList className="grid w-full h-11 p-1 bg-muted/50 rounded-xl" style={{ gridTemplateColumns: `repeat(${rooms.length}, minmax(0, 1fr))` }}>
          {rooms.map((room) => (
            <TabsTrigger 
              key={room.id} 
              value={room.id}
              className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all text-sm font-medium"
            >
              {room.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
