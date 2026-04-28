import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RoomSelector } from "@/components/visual-layout/RoomSelector";
import { LayoutEditor } from "@/components/visual-layout/LayoutEditor";
import { useLayout } from "@/hooks/useLayout";

const elementTypes = [
  { value: "wall", label: "Wall" },
  { value: "door", label: "Door" },
  { value: "window", label: "Window" },
];

export default function OwnerLayoutEditor() {
  const { rooms, activeRoom, activeRoomId, setActiveRoomId, updateTablePosition, saveLayout } = useLayout("1");

  const [selected, setSelected] = useState(null); // { kind: 'table'|'element', id, data }
  const [newElementType, setNewElementType] = useState("wall");

  const selectedMeta = useMemo(() => {
    if (!selected || !activeRoom?.layout) return null;
    if (selected.kind === "table") {
      return activeRoom.layout.tables?.find((t) => t._id === selected.id) || null;
    }
    if (selected.kind === "element") {
      return activeRoom.layout.elements?.find((e) => e.id === selected.id) || null;
    }
    return null;
  }, [selected, activeRoom]);

  const handleSaveLayout = () => {
    saveLayout();
    toast.success("Layout saved (mock)");
  };

  const handleAddElement = () => {
    toast.message("Coming next", {
      description: "Element creation UI is scaffolded. Next step is persisting & dragging walls/doors/windows.",
    });
  };

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Layout Editor</h1>
              <p className="text-muted-foreground">Drag & drop tables and design your rooms</p>
            </div>
            <Button onClick={handleSaveLayout} className="gap-2">
              <Save className="h-4 w-4" />
              Save layout
            </Button>
          </div>

          <RoomSelector rooms={rooms} activeRoomId={activeRoomId} onSelect={setActiveRoomId} />

          <div className="grid gap-6 lg:grid-cols-[280px_1fr_320px]">
            {/* Tools */}
            <Card className="shadow-card h-fit lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="text-base">Tools</CardTitle>
                <CardDescription>Place structural elements (mock)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Element type</Label>
                  <Select value={newElementType} onValueChange={setNewElementType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {elementTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="w-full gap-2" onClick={handleAddElement}>
                  <Plus className="h-4 w-4" />
                  Add element
                </Button>
                <Separator />
                <div className="text-sm text-muted-foreground">
                  Tip: drag tables on the canvas; grid snapping is enabled.
                </div>
              </CardContent>
            </Card>

            {/* Canvas */}
            <div>
              <LayoutEditor
                room={activeRoom}
                updateTablePosition={updateTablePosition}
                saveLayout={handleSaveLayout}
              />
            </div>

            {/* Properties */}
            <Card className="shadow-card h-fit lg:sticky lg:top-24">
              <CardHeader>
                <CardTitle className="text-base">Properties</CardTitle>
                <CardDescription>Inspect the selected item</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedMeta ? (
                  <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                    Select a table on the canvas to view details.
                  </div>
                ) : (
                  <>
                    {"_id" in selectedMeta ? (
                      <>
                        <div className="space-y-2">
                          <Label>Table number</Label>
                          <Input value={selectedMeta.tableNumber} readOnly className="bg-muted" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Capacity</Label>
                            <Input value={selectedMeta.capacity} readOnly className="bg-muted" />
                          </div>
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Input value={selectedMeta.type} readOnly className="bg-muted capitalize" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>X</Label>
                            <Input value={selectedMeta.position?.x ?? 0} readOnly className="bg-muted font-mono text-xs" />
                          </div>
                          <div className="space-y-2">
                            <Label>Y</Label>
                            <Input value={selectedMeta.position?.y ?? 0} readOnly className="bg-muted font-mono text-xs" />
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => toast.message("Hook-ready", { description: "Wire this to open the Edit Table dialog." })}
                        >
                          Edit table details
                        </Button>
                      </>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Element type</Label>
                          <Input value={selectedMeta.type} readOnly className="bg-muted capitalize" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>X</Label>
                            <Input value={selectedMeta.position?.x ?? 0} readOnly className="bg-muted font-mono text-xs" />
                          </div>
                          <div className="space-y-2">
                            <Label>Y</Label>
                            <Input value={selectedMeta.position?.y ?? 0} readOnly className="bg-muted font-mono text-xs" />
                          </div>
                        </div>
                        <Button variant="destructive" className="w-full gap-2" onClick={() => toast.message("Mock", { description: "Delete element action will be wired to layout state." })}>
                          <Trash2 className="h-4 w-4" />
                          Delete element
                        </Button>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

