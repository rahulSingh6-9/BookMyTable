import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle } from "lucide-react";

export function BrandDeactivationModal({ isOpen, onClose, brand, onConfirm, isProcessing }) {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [brandName, setBrandName] = useState("");
  const [password, setPassword] = useState("");
  const [notifyMembers, setNotifyMembers] = useState(true);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setOtherReason("");
      setBrandName("");
      setPassword("");
      setNotifyMembers(true);
    }
  }, [isOpen]);

  const isFormValid = () => {
    if (!reason) return false;
    if (reason === "Other" && !otherReason.trim()) return false;
    if (brandName !== brand?.name) return false;
    if (!password) return false;
    return true;
  };

  const handleConfirm = () => {
    if (!isFormValid()) return;
    const finalReason = reason === "Other" ? `Other: ${otherReason}` : reason;
    onConfirm({ reason: finalReason, password, notifyMembers });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-destructive/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive text-xl">
            <AlertTriangle className="h-6 w-6" /> Deactivate Brand
          </DialogTitle>
          <DialogDescription className="pt-3 text-sm text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">This action will:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Disable all brand branches</li>
              <li>Stop new reservations</li>
              <li>Hide branches from discovery</li>
              <li>Disable brand operations</li>
              <li className="text-emerald-600 dark:text-emerald-400">Preserve data safely</li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Deactivation</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Temporary Closure">Temporary Closure</SelectItem>
                <SelectItem value="Business Restructuring">Business Restructuring</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Low Activity">Low Activity</SelectItem>
                <SelectItem value="Compliance Issue">Compliance Issue</SelectItem>
                <SelectItem value="Rebranding">Rebranding</SelectItem>
                <SelectItem value="Operational Pause">Operational Pause</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {reason === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="otherReason">Please specify</Label>
              <Textarea 
                id="otherReason" 
                placeholder="Enter details..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2 pt-2">
            <Label htmlFor="brandName">
              Type <strong className="text-foreground">{brand?.name}</strong> to confirm
            </Label>
            <Input 
              id="brandName" 
              placeholder={brand?.name}
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Confirm Your Password</Label>
            <Input 
              id="password" 
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="notifyMembers" 
              checked={notifyMembers}
              onCheckedChange={(checked) => setNotifyMembers(checked)}
            />
            <Label htmlFor="notifyMembers" className="text-sm font-normal cursor-pointer">
              Notify Brand Members (Managers, Owners)
            </Label>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onClose(false)} disabled={isProcessing}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={!isFormValid() || isProcessing}
          >
            {isProcessing ? "Deactivating..." : "Deactivate Brand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
