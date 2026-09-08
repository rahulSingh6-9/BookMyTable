import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MapPin, Grid, AlertCircle } from "lucide-react";

export function FloorPlanModal({ isOpen, onClose, restaurant }) {
  // We'll pass the restaurant tables here to eventually draw them out.
  // For now, this is a scalable placeholder for the real visual engine.

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0 overflow-hidden bg-background border-border">
        <DialogHeader className="p-6 border-b border-border bg-card shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <MapPin className="h-5 w-5 text-primary" />
            Visual Floor Plan
          </DialogTitle>
          <DialogDescription>
            View the layout of {restaurant.branchName || restaurant.name} and select your preferred seating area.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 bg-muted/30 p-6 flex items-center justify-center relative overflow-hidden">
          {/* 
            FUTURE ARCHITECTURE:
            Here we will render a <canvas> or SVG based layout using table coordinates.
            Example:
            <InteractiveFloorEngine tables={restaurant.tables} onSelectTable={handleSelect} />
          */}
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-2xl bg-card max-w-md w-full shadow-sm">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Grid className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Interactive Floor Plan</h3>
            <p className="text-sm text-muted-foreground mb-6">
              The 2D visual layout engine is currently being configured for this location. Soon, you will be able to see exactly where each table is located before booking.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-500 bg-orange-500/10 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              Feature rolling out in Phase 2
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
