import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Mail, Phone, ShieldCheck, Activity, Key, Eye, EyeOff, Save, CheckCircle2, Lock, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useBrand } from "@/context/BrandContext";
import { 
  updateBrandBasicContact, 
  requestBrandPhoneOTP, 
  verifyBrandPhoneOTP, 
  requestBrandEmailUpdate 
} from "@/services/brand.service";
import { getBrandLogs } from "@/services/logs.service";
import { format } from "date-fns";

export default function OwnerContactSettings() {
  const { activeBrand, refreshBrand } = useBrand();
  const { toast } = useToast();

  const [logs, setLogs] = useState([]);

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

  useEffect(() => {
    if (activeBrand) {
      // Fetch Recent Logs
      const fetchLogs = async () => {
        try {
          const res = await getBrandLogs(activeBrand.id, { limit: 5 });
          setLogs(res.data?.docs || res.data || []);
        } catch (e) {
          console.error("Failed to fetch logs", e);
        }
      };
      fetchLogs();
    }
  }, [activeBrand]);

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
      if (pendingAction === "website" || pendingAction === "supportEmail") {
        await updateBrandBasicContact(activeBrand.id, { 
          [pendingAction]: fieldValue, 
          password 
        });
        toast({ title: "Success", description: "Contact information updated securely." });
        if (refreshBrand) refreshBrand();
        resetModals();
      } 
      else if (pendingAction === "contactPhone") {
        // Step 1: Request OTP
        await requestBrandPhoneOTP(activeBrand.id, {
          contactPhone: fieldValue,
          password
        });
        toast({ title: "OTP Sent", description: "Please check your phone for the code." });
        setOtpStep(true);
      }
      else if (pendingAction === "contactEmail") {
        // Send Verification Link
        await requestBrandEmailUpdate(activeBrand.id, {
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
      await verifyBrandPhoneOTP(activeBrand.id, {
        contactPhone: fieldValue,
        otp: otpValue
      });
      toast({ title: "Success", description: "Phone number verified and updated." });
      if (refreshBrand) refreshBrand();
      resetModals();
    } catch (e) {
      toast({ variant: "destructive", title: "Verification Failed", description: e.response?.data?.message || "Invalid OTP." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeBrand) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* SECTION 1: CONTACT SUMMARY HERO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6 text-primary" />
            Contact Information
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage global communication preferences for your brand securely.</p>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
             <div className="flex items-center gap-1.5 text-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
               <Mail className="w-4 h-4 text-muted-foreground" /> {activeBrand.contactEmail || "Not Set"}
               {activeBrand.contactEmailVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-1" />}
             </div>
             <div className="flex items-center gap-1.5 text-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-lg border border-border/50">
               <Phone className="w-4 h-4 text-muted-foreground" /> {activeBrand.contactPhone || "Not Set"}
               {activeBrand.contactPhoneVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-1" />}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="rounded-2xl border-border shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Primary Contact Details
                </CardTitle>
                <CardDescription>Update your public and internal contact methods individually.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                
                {/* Contact Email Field */}
                <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      Business Contact Email
                      {activeBrand.contactEmailVerified ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 h-5 px-1.5 text-[10px]">Verified</Badge>
                      ) : activeBrand.contactEmail ? (
                         <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 h-5 px-1.5 text-[10px]">Unverified</Badge>
                      ) : null}
                    </Label>
                    <p className="text-base font-medium">{activeBrand.contactEmail || <span className="text-muted-foreground italic">Not set</span>}</p>
                    <p className="text-[12px] text-muted-foreground">Used for official BookMyTable communications.</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("contactEmail", activeBrand.contactEmail)}>
                    Edit
                  </Button>
                </div>

                {/* Support Email Field */}
                <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Customer Support Email</Label>
                    <p className="text-base font-medium">{activeBrand.supportEmail || <span className="text-muted-foreground italic">Not set</span>}</p>
                    <p className="text-[12px] text-muted-foreground">Guests will see this email for reservation inquiries.</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("supportEmail", activeBrand.supportEmail)}>
                    Edit
                  </Button>
                </div>

                {/* Primary Phone Field */}
                <div className="p-6 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      Primary Phone Number
                      {activeBrand.contactPhoneVerified ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 h-5 px-1.5 text-[10px]">Verified</Badge>
                      ) : activeBrand.contactPhone ? (
                         <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 h-5 px-1.5 text-[10px]">Unverified</Badge>
                      ) : null}
                    </Label>
                    <p className="text-base font-medium">{activeBrand.contactPhone || <span className="text-muted-foreground italic">Not set</span>}</p>
                    <p className="text-[12px] text-muted-foreground">Main contact number for the brand.</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("contactPhone", activeBrand.contactPhone)}>
                    Edit
                  </Button>
                </div>

                {/* Website Field */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:bg-muted/10 transition-colors">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Website URL</Label>
                    <p className="text-base font-medium">{activeBrand.website || <span className="text-muted-foreground italic">Not set</span>}</p>
                  </div>
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={() => startEdit("website", activeBrand.website)}>
                    Edit
                  </Button>
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Sidebar Context */}
        <div className="space-y-6">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="rounded-2xl border-border shadow-sm overflow-hidden border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-5 flex gap-3">
                <Lock className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Secure Update Protocol</h4>
                  <p className="text-xs text-blue-800/80 dark:text-blue-200/80 leading-relaxed">
                    Modifying contact information requires password verification to prevent unauthorized account hijacking.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="rounded-2xl border-border shadow-sm">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-6">
                  {logs && logs.length > 0 ? (
                    logs.filter(log => log.action.includes('CONTACT')).map((log, index) => (
                      <div key={log._id || index} className="relative pl-5 before:absolute before:left-[7px] before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-border last:before:hidden">
                        <div className="absolute left-0 top-1.5 h-[16px] w-[16px] rounded-full border-2 border-background bg-primary" />
                        <p className="text-sm font-medium capitalize">{log.action.replace(/_/g, ' ').toLowerCase()}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(log.createdAt), "MMM d, h:mm a")}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      No recent contact updates.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>

      {/* SECURE EDIT MODAL */}
      <Dialog open={isPasswordModalOpen} onOpenChange={(open) => !open && resetModals()}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Key className="h-5 w-5 text-primary" /> Secure Update
            </DialogTitle>
            <DialogDescription className="pt-2">
              {!otpStep ? (
                <>Enter the new value for <strong>{editingField}</strong> and your password to confirm.</>
              ) : (
                <>Enter the 6-digit OTP sent to your phone to complete verification.</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            {!otpStep ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>New Value</Label>
                  <Input
                    value={fieldValue}
                    onChange={(e) => setFieldValue(e.target.value)}
                    className="rounded-xl"
                    placeholder={`Enter new ${editingField}`}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Your Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your account password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-xl pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-center block">One-Time Password (OTP)</Label>
                  <Input
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value)}
                    className="rounded-xl text-center tracking-widest text-lg font-bold"
                    placeholder="000000"
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={resetModals} className="rounded-xl" disabled={isSubmitting}>
              Cancel
            </Button>
            
            {!otpStep ? (
              <Button onClick={handlePasswordSubmit} disabled={!password || !fieldValue || isSubmitting} className="rounded-xl">
                {isSubmitting ? "Processing..." : pendingAction === "contactPhone" ? "Send OTP" : pendingAction === "contactEmail" ? "Send Link" : "Save Changes"}
              </Button>
            ) : (
              <Button onClick={handleVerifyOTP} disabled={!otpValue || isSubmitting} className="rounded-xl">
                {isSubmitting ? "Verifying..." : "Verify & Save"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
