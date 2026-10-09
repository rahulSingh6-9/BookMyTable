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
      <DialogContent className="max-w-md rounded-2xl p-6 border border-border bg-card shadow-xl">
        <DialogHeader className="space-y-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl font-bold text-foreground">
                  Demo Restaurant
                </DialogTitle>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] font-semibold tracking-wider uppercase">
                  DEMO
                </Badge>
              </div>
              {restaurantName && (
                <p className="text-xs text-muted-foreground font-medium mt-0.5">
                  {restaurantName}
                </p>
              )}
            </div>
          </div>

          <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-2">
            This restaurant is shown for demonstration purposes only. Restaurant details and online booking are not available.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6">
          <Button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl h-11 transition-all"
          >
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
