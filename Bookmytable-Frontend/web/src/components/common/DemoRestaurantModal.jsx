import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Info } from "lucide-react";

export function DemoRestaurantModal({ isOpen, onClose, restaurantName }) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[280px] sm:max-w-sm rounded-2xl p-4 sm:p-6 border border-border bg-card shadow-xl">
        <DialogHeader className="space-y-2 sm:space-y-3 text-center sm:text-left">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
              <Store className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DialogTitle className="text-base sm:text-xl font-bold text-foreground">
                  Demo Restaurant
                </DialogTitle>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0">
                  DEMO
                </Badge>
              </div>
              {restaurantName && (
                <p className="text-[11px] sm:text-xs text-muted-foreground font-medium mt-0.5">
                  {restaurantName}
                </p>
              )}
            </div>
          </div>

          <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1 sm:pt-2">
            This restaurant is shown for demonstration purposes only. Restaurant details and online booking are not available.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4 sm:mt-6">
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-9 sm:h-11 text-sm transition-all"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
