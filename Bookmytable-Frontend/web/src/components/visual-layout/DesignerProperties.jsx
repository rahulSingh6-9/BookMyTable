import { Trash2, Settings2, Copy, RotateCw, Lock, Unlock, MoveUp, Link, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableProperties } from "./properties/TableProperties";
import { WallProperties } from "./properties/WallProperties";
import { ZoneProperties } from "./properties/ZoneProperties";
import { DiningAreaProperties } from "./properties/DiningAreaProperties";

export function DesignerProperties({ designer, onDelete }) {
  const { tables, selectedTableId, updateTableProperties } = designer;
  
  const table = tables.find(t => t._id === selectedTableId);
  if (!table) return null;

  const handleChange = (field, value) => {
    updateTableProperties(table._id, { [field]: value });
  };

  const handleMetadataChange = (field, value) => {
    updateTableProperties(table._id, { 
      metadata: { ...table.metadata, [field]: value } 
    });
  };

  const handleDuplicate = () => {
    // Generate new code safely
    const match = table.tableCode?.match(/^(.*?)(\d+)$/);
    const newCode = match ? `${match[1]}${parseInt(match[2]) + 1}` : `${table.tableCode || 'Table'} (Copy)`;
    
    designer.addUnsavedTable({
      ...table,
      _id: undefined, // Let the backend generate a new one
      tableCode: newCode,
      position: { 
        ...table.position, 
        x: (table.position?.x || 0) + 20, 
        y: (table.position?.y || 0) + 20 
      },
      isNew: true
    });
  };

  const handleRotate = () => {
    if (table.metadata?.isStructuralElement && table.metadata.edge) {
      const currentOffset = table.metadata.angleOffset || 0;
      handleMetadataChange('angleOffset', (currentOffset + 90) % 360);
    } else {
      const currentRot = table.position?.rotation || 0;
      const rotDelta = 45;
      const newRot = (currentRot + rotDelta) % 360;
      
      updateTableProperties(table._id, {
        position: { ...table.position, rotation: newRot }
      });
    }
  };

  const toggleLock = () => {
    handleMetadataChange("isLocked", !table.metadata?.isLocked);
  };

  const isLayoutElement = table.metadata?.isLayoutElement === true;
  const isArrangementZone = table.metadata?.isArrangementZone === true;
  const isDiningArea = table.metadata?.isDiningArea === true;

  return (
    <div className="flex flex-col h-full animate-in slide-in-from-right-8 duration-300">
      <div className="p-4 border-b border-border/50 bg-muted/20">
        <h3 className="font-bold text-foreground flex items-center gap-2">
          <Settings2 className="h-4 w-4" /> Properties
        </h3>
        <p className="text-xs text-muted-foreground mt-1">Configure selected object settings.</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
        
        {/* Component Router Map */}
        {isDiningArea ? (
          <DiningAreaProperties 
            table={table} 
            handleChange={handleChange} 
            handleMetadataChange={handleMetadataChange} 
            designer={designer}
          />
        ) : isArrangementZone ? (
          <ZoneProperties 
            table={table} 
            handleChange={handleChange} 
            handleMetadataChange={handleMetadataChange} 
            designer={designer}
          />
        ) : isLayoutElement ? (
          <WallProperties 
            table={table} 
            handleChange={handleChange} 
            handleMetadataChange={handleMetadataChange} 
            designer={designer}
          />
        ) : (
          <TableProperties 
            table={table} 
            handleChange={handleChange} 
            handleMetadataChange={handleMetadataChange}
            allTables={tables}
          />
        )}

      </div>

      {table.metadata?.attachments?.length > 0 && (
         <div className="p-4 border-t border-border/50 bg-card">
            <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
               <Link className="h-3 w-3" /> Connected Edges
            </h4>
            <div className="space-y-2">
               {table.metadata.attachments.map((att, idx) => {
                  const targetTable = tables.find(t => t._id === att.targetId);
                  return (
                    <div key={idx} className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-md p-2 text-xs">
                       <span className="text-foreground capitalize truncate pr-2">
                          {att.type.replace(/-/g, ' ')} <span className="text-muted-foreground ml-1">({targetTable?.tableCode || 'Object'})</span>
                       </span>
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                             const newAtts = table.metadata.attachments.filter((_, i) => i !== idx);
                             handleMetadataChange('attachments', newAtts);
                          }}
                          title="Detach"
                       >
                          <Unlink className="h-3 w-3" />
                       </Button>
                    </div>
                  );
               })}
            </div>
         </div>
      )}

      <div className="p-4 border-t border-border/50 bg-muted/10">
        {(table.metadata?.zoneId || table.metadata?.sectionId || table.metadata?.diningAreaId) && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mb-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 flex items-center justify-center gap-2"
            onClick={() => designer.bringToCanvas([table._id])}
          >
            <MoveUp className="h-4 w-4" /> Bring To Canvas
          </Button>
        )}
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate} title="Duplicate" className="h-8">
            <Copy className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleRotate} title="Rotate 45°" className="h-8">
            <RotateCw className="h-4 w-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="sm" onClick={toggleLock} title={table.metadata?.isLocked ? "Unlock" : "Lock"} className="h-8">
            {table.metadata?.isLocked ? <Lock className="h-4 w-4 text-primary" /> : <Unlock className="h-4 w-4 text-muted-foreground" />}
          </Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete(table._id)} title="Delete" className="h-8 bg-destructive/90 hover:bg-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
