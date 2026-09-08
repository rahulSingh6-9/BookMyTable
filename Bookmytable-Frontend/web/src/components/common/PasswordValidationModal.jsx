import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useValidatePricingPassword } from "@/hooks/usePricing";

export function PasswordValidationModal({ open, onOpenChange, onSuccess, actionDescription }) {
  const [password, setPassword] = useState("");
  const { mutate: validatePassword, isPending } = useValidatePricingPassword();

  const handleValidate = () => {
    if (!password) return;
    
    validatePassword(password, {
      onSuccess: () => {
        onSuccess(password);
        setPassword("");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Security Verification</DialogTitle>
          <DialogDescription>
            {actionDescription || "Please enter your password to continue."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Input 
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleValidate} disabled={isPending || !password}>
            {isPending ? "Verifying..." : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
