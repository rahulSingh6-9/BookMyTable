import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, ShieldCheck, Key, Eye, EyeOff, Save, CheckCircle2, Lock, Globe, Store, MessageCircle, MapPin, UserSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useBranch } from "@/context/BranchContext";
import { 
  updateBranchBasicContact, 
  requestBranchPhoneOTP, 
  verifyBranchPhoneOTP, 
  requestBranchEmailUpdate 
} from "@/services/restaurant.service";

export default function BranchContactSettings() {
  const { activeBranch, refreshBranch } = useBranch();
  const { toast } = useToast();

  // Generic Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Which action triggered the password prompt?
  const [pendingAction, setPendingAction] = useState(null); 
  const [pendingData, setPendingData] = useState(null);

  // Field Edit States
  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  const resetModals = () => {
    setIsPasswordModalOpen(false);
    setPassword("");
    setPendingAction(null);
    setPendingData(null);
    setEditingField(null);
    setFieldValue("");
    setOtpValue("");
    setOtpStep(false);
  };

  const startEdit = (field, currentVal) => {
    setEditingField(field);
    setFieldValue(currentVal || "");
    setIsPasswordModalOpen(true);
    setPendingAction(field);
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      toast({ variant: "destructive", title: "Error", description: "Password is required to confirm changes." });
      return;
    }

    setIsSubmitting(true);
    try {
      const basicFields = ["reservationPhone", "whatsappNumber", "managerName", "managerPhone", "googleMapsLink"];
      
      if (basicFields.includes(pendingAction)) {
        await updateBranchBasicContact(activeBranch.id, { 
          [pendingAction]: fieldValue, 
          password 
        });
        toast({ title: "Success", description: "Contact information updated securely." });
        if (refreshBranch) refreshBranch();
        resetModals();
      } 
      else if (pendingAction === "branchPhone") {
        await requestBranchPhoneOTP(activeBranch.id, {
          contactPhone: fieldValue,
          password
        });
        toast({ title: "OTP Sent", description: "Please check your phone for the code." });
        setOtpStep(true);
      }
      else if (pendingAction === "branchEmail") {
        await requestBranchEmailUpdate(activeBranch.id, {
          contactEmail: fieldValue,
          password
        });
        toast({ title: "Verification Sent", description: "A verification link has been sent to the new email." });
        resetModals();
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Action Failed", description: e.response?.data?.message || "Failed to perform action." });
      if (e.response?.status === 401) setPassword(""); // clear password on invalid
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue) return;
    setIsSubmitting(true);
    try {
      await verifyBranchPhoneOTP(activeBranch.id, {
        contactPhone: fieldValue,
        otp: otpValue
      });
      toast({ title: "Success", description: "Phone number verified and updated." });
      if (refreshBranch) refreshBranch();
      resetModals();
    } catch (e) {
      toast({ variant: "destructive", title: "Verification Failed", description: e.response?.data?.message || "Invalid OTP." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeBranch) return null;

  const contact = activeBranch.contact || {};
  const primaryPhone = contact.primaryPhone || {};
  const secondaryPhone = contact.secondaryPhone || {};

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            Branch Contact Info
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage the contact preferences strictly for this branch.</p>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Core Contact */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Primary Branch Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              
              <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    Branch Email
                    {contact.isEmailVerified ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 h-5 px-1.5 text-[10px]">Verified</Badge>
                    ) : contact.email ? (
                       <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 h-5 px-1.5 text-[10px]">Unverified</Badge>
                    ) : null}
                  </Label>
                  <p className="text-base font-medium">{contact.email || <span className="text-muted-foreground italic">Not set</span>}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("branchEmail", contact.email)}>Edit</Button>
              </div>

              <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    Branch Phone
                    {primaryPhone.isVerified ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 h-5 px-1.5 text-[10px]">Verified</Badge>
                    ) : primaryPhone.number ? (
                       <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 h-5 px-1.5 text-[10px]">Unverified</Badge>
                    ) : null}
                  </Label>
                  <p className="text-base font-medium">{primaryPhone.number || <span className="text-muted-foreground italic">Not set</span>}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("branchPhone", primaryPhone.number)}>Edit</Button>
              </div>

              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Reservation Phone</Label>
                  <p className="text-base font-medium">{secondaryPhone.number || <span className="text-muted-foreground italic">Not set</span>}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("reservationPhone", secondaryPhone.number)}>Edit</Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>

        {/* Extended Contact */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Extended Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              
              <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">WhatsApp Number</Label>
                  <p className="text-base font-medium">{contact.whatsappNumber || <span className="text-muted-foreground italic">Not set</span>}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("whatsappNumber", contact.whatsappNumber)}>Edit</Button>
              </div>

              <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Manager Name</Label>
                  <p className="text-base font-medium">{contact.managerName || <span className="text-muted-foreground italic">Not set</span>}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("managerName", contact.managerName)}>Edit</Button>
              </div>

              <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Manager Phone</Label>
                  <p className="text-base font-medium">{contact.managerPhone || <span className="text-muted-foreground italic">Not set</span>}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("managerPhone", contact.managerPhone)}>Edit</Button>
              </div>

              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Google Maps Link</Label>
                  <p className="text-base font-medium max-w-[300px] truncate">{contact.googleMapsLink || <span className="text-muted-foreground italic">Not set</span>}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("googleMapsLink", contact.googleMapsLink)}>Edit</Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* EDIT MODAL */}
      <Dialog open={isPasswordModalOpen} onOpenChange={(open) => {
        if (!open) resetModals();
      }}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-border/50 shadow-2xl">
          <div className="bg-gradient-to-r from-muted/50 to-background p-6 border-b border-border/50">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Lock className="w-5 h-5 text-primary" />
                Secure Update
              </DialogTitle>
              <DialogDescription className="pt-2">
                You are updating the branch <strong>{pendingAction}</strong>. This requires password confirmation.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 bg-background">
            
            {/* Value Input */}
            {!otpStep && (
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">New Value</Label>
                <Input 
                  type={pendingAction?.toLowerCase().includes("email") ? "email" : "text"}
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder={`Enter new ${pendingAction}`}
                  className="rounded-xl bg-muted/20 border-border/50 h-11 text-base focus-visible:ring-primary/20"
                />
              </div>
            )}

            {/* OTP Input */}
            {otpStep && (
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Verification Code</Label>
                <div className="flex gap-2">
                  <Input 
                    type="text"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="rounded-xl bg-muted/20 border-border/50 h-11 text-center text-lg tracking-widest focus-visible:ring-primary/20"
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">We sent a verification code to {fieldValue}.</p>
              </div>
            )}

            {/* Password Input (Hidden if OTP Step active) */}
            {!otpStep && (
              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Current Password</Label>
                <div className="relative group">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password to verify"
                    className="pl-9 pr-10 rounded-xl bg-muted/20 border-border/50 h-11 focus-visible:ring-primary/20"
                    onKeyDown={(e) => { if (e.key === "Enter" && password && fieldValue) handlePasswordSubmit(); }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-muted/30 p-4 border-t border-border/50 flex justify-end gap-3 rounded-b-2xl">
            <Button variant="ghost" onClick={resetModals} disabled={isSubmitting} className="rounded-xl hover:bg-muted/50">Cancel</Button>
            {!otpStep ? (
               <Button onClick={handlePasswordSubmit} disabled={isSubmitting || !password || !fieldValue} className="rounded-xl shadow-md min-w-[120px]">
                 {isSubmitting ? "Verifying..." : "Update Details"}
               </Button>
            ) : (
               <Button onClick={handleVerifyOTP} disabled={isSubmitting || otpValue.length < 6} className="rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]">
                 {isSubmitting ? "Verifying..." : "Confirm OTP"}
               </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
