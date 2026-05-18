import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBranch } from "@/context/BranchContext";
import { getVerificationDetails, confirmPhoneVerificationStatus } from "@/services/workspace.service";
import { sendPhoneOTP, verifyPhoneOTP } from "@/services/verification.service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, ShieldAlert, Mail, Phone, MapPin, Award, 
  Loader2, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw,
  Lock, X, Clock
} from "lucide-react";
import { toast } from "sonner";
import API from "@/lib/api";

export default function BusinessVerification() {
  const { activeBranch, activeMembership, activeBranchId, refreshMemberships, isLoading: isBranchLoading } = useBranch();
  const [isLoading, setIsLoading] = useState(true);
  
  // Verification States
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Phone Verification Modal State
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  // Email Verification Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailOtpInput, setEmailOtpInput] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [isSendingEmailOTP, setIsSendingEmailOTP] = useState(false);
  const [isVerifyingEmailOTP, setIsVerifyingEmailOTP] = useState(false);

  // Sync state reactively with active branch from central memberships context
  useEffect(() => {
    if (!activeBranch) return;
    
    setIsLoading(false);
    setPhoneInput(activeBranch.contact?.primaryPhone?.number || "");
    setEmailInput(activeBranch.contact?.email || activeMembership?.user?.email || "");
  }, [activeBranch, activeMembership]);

  // Timers for Cooldown logic
  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldown]);

  useEffect(() => {
    if (phoneCooldown > 0) {
      const timer = setTimeout(() => setPhoneCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCooldown]);

  // EMAIL VERIFICATION RESEND HANDLER
  const handleSendEmailVerification = async () => {
    if (emailCooldown > 0) return;
    setIsSendingEmailOTP(true);
    try {
      // Trigger email verification OTP via auth-service
      const response = await API.post("/verification/send-email-otp", {
        email: emailInput,
        purpose: "email_verification"
      });
      if (response.data?.success) {
        setEmailOtpSent(true);
        setEmailCooldown(60);
        toast.success("Verification Email OTP sent successfully! Check your inbox.");
      }
    } catch (error) {
      console.error("Email verification send failed:", error);
      toast.error(error.response?.data?.message || "Failed to trigger email verification");
    } finally {
      setIsSendingEmailOTP(false);
    }
  };

  const handleVerifyEmailOTP = async () => {
    if (!emailOtpInput.trim()) {
      toast.error("Please enter the verification OTP");
      return;
    }
    setIsVerifyingEmailOTP(true);
    try {
      const response = await API.post("/verification/verify-email-otp", {
        email: emailInput,
        otp: emailOtpInput,
        purpose: "email_verification"
      });
      if (response.data?.success) {
        toast.success("Email verified successfully! Updating status...");
        setShowEmailModal(false);
        setEmailOtpSent(false);
        setEmailOtpInput("");
        await refreshMemberships();
      }
    } catch (error) {
      console.error("Email OTP verification failed:", error);
      toast.error(error.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setIsVerifyingEmailOTP(false);
    }
  };

  // PHONE VERIFICATION OTP FLOW
  const handleRequestPhoneOTP = async () => {
    if (phoneCooldown > 0) return;
    if (!phoneInput.trim()) {
      toast.error("Primary phone number is required");
      return;
    }
    setIsSendingOTP(true);
    try {
      const response = await sendPhoneOTP(phoneInput, "restaurant_onboarding");
      if (response.success) {
        setOtpSent(true);
        setPhoneCooldown(60);
        toast.success("Verification Phone OTP SMS sent successfully!");
      }
    } catch (error) {
      console.error("Phone OTP trigger failed:", error);
      toast.error(error.message || "Failed to trigger phone OTP");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyPhoneOTP = async () => {
    if (!otpInput.trim()) {
      toast.error("Please enter the 6-digit OTP code");
      return;
    }
    setIsVerifyingOTP(true);
    try {
      // 1. Verify OTP with auth-service
      const response = await verifyPhoneOTP(phoneInput, otpInput, "restaurant_onboarding");
      if (response.success) {
        // 2. Confirm verification status on our branch
        await confirmPhoneVerificationStatus();
        toast.success("Phone verified successfully!");
        setShowPhoneModal(false);
        setOtpSent(false);
        setOtpInput("");
        await refreshMemberships();
      }
    } catch (error) {
      console.error("Phone OTP verify failed:", error);
      toast.error(error.message || "Invalid or expired Phone OTP");
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  if (isLoading || isBranchLoading || !activeBranch) {
    return (
      <div className="flex h-screen items-center justify-center bg-background/50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium text-sm">Checking Credentials status...</p>
        </div>
      </div>
    );
  }

  // Derive verification metrics dynamically from the active branch context
  const email = {
    email: activeBranch?.contact?.email || "",
    verified: !!activeBranch?.contact?.email
  };
  const phone = {
    phone: activeBranch?.contact?.primaryPhone?.number || "",
    verified: activeBranch?.contact?.primaryPhone?.isVerified || false
  };
  const business = {
    status: activeBranch?.status || "draft",
    approvedAt: activeBranch?.approvedAt,
    approvedBy: activeBranch?.approvedBy
  };
  const location = {
    verified: !!(activeBranch?.address?.addressLine1 && activeBranch?.location?.coordinates),
    address: activeBranch?.address
  };

  const timeline = [
    {
      event: "Merchant Space Registration Created",
      status: "completed",
      date: activeBranch?.createdAt
    },
    {
      event: "Primary Email Address Registered",
      status: activeBranch?.contact?.email ? "completed" : "pending",
      date: activeBranch?.createdAt
    },
    {
      event: "Contact Phone Verification Verified",
      status: activeBranch?.contact?.primaryPhone?.isVerified ? "completed" : "pending",
      date: activeBranch?.updatedAt
    },
    {
      event: "Platform Compliance Review Completed",
      status: (activeBranch?.status === "approved" || activeBranch?.status === "rejected" || activeBranch?.status === "suspended") ? "completed" : "pending",
      date: activeBranch?.approvedAt || activeBranch?.rejectedAt || activeBranch?.suspendedAt
    },
    {
      event: "Platform Approval Activated",
      status: activeBranch?.status === "approved" ? "completed" : "pending",
      date: activeBranch?.approvedAt
    }
  ];

  return (
    <div className="w-full min-h-screen bg-muted/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
        
        {/* Header section */}
        <div>
          <h1 className="text-3xl font-extrabold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Verification Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your credentials, platform approval moderation checklist, and live business authenticity standing.
          </p>
        </div>

        {/* 1. VERIFICATION CARD GRID OVERVIEW */}
        <div className="grid gap-6 sm:grid-cols-2">
          
          {/* Card 1: Email verification */}
          <Card className="p-6 rounded-[2rem] border border-border bg-card shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-100 dark:bg-blue-950/40 rounded-2xl">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                {email?.verified ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full font-bold">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700 rounded-full font-bold">
                    Pending
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Email Authenticity</h3>
                <p className="text-xs text-muted-foreground mt-1">Enables system email notifications, orders statements, and direct invoices.</p>
                <p className="text-sm font-semibold font-mono text-foreground mt-3 break-all">{email?.email || "No email configured"}</p>
              </div>
            </div>
            
            <div className="pt-5 border-t border-border/50 mt-4">
              {email?.verified ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Credentials are active and secure
                </div>
              ) : (
                <Button 
                  onClick={() => setShowEmailModal(true)}
                  className="w-full rounded-full font-bold text-xs h-10"
                >
                  Verify Email Address
                </Button>
              )}
            </div>
          </Card>

          {/* Card 2: Phone verification */}
          <Card className="p-6 rounded-[2rem] border border-border bg-card shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-purple-100 dark:bg-purple-950/40 rounded-2xl">
                  <Phone className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                {phone?.verified ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full font-bold">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700 rounded-full font-bold">
                    Pending
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Phone SMS Verification</h3>
                <p className="text-xs text-muted-foreground mt-1">Allows instant OTP logins, customer reservations alerts, and SMS integrations.</p>
                <p className="text-sm font-semibold font-mono text-foreground mt-3">{phone?.phone || "No phone configured"}</p>
              </div>
            </div>
            
            <div className="pt-5 border-t border-border/50 mt-4">
              {phone?.verified ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                  <CheckCircle2 className="h-4 w-4" /> Live SMS gateway is verified
                </div>
              ) : (
                <Button 
                  onClick={() => setShowPhoneModal(true)}
                  className="w-full rounded-full font-bold text-xs h-10"
                >
                  Verify Phone Number
                </Button>
              )}
            </div>
          </Card>

          {/* Card 3: Admin Approval */}
          <Card className="p-6 rounded-[2rem] border border-border bg-card shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-rose-100 dark:bg-rose-950/40 rounded-2xl">
                  <Award className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <Badge className={`rounded-full font-bold capitalize ${
                  business?.status === "approved" ? "bg-emerald-600 text-white" :
                  business?.status === "pending" ? "bg-amber-500 text-white" :
                  "bg-destructive text-white"
                }`}>
                  {business?.status || "Draft"}
                </Badge>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Moderation & Approval</h3>
                <p className="text-xs text-muted-foreground mt-1">Reviews complete compliance documents, GST credentials, and platform guidelines.</p>
                <div className="text-xs font-semibold text-foreground/80 mt-3 space-y-1">
                  {business?.approvedAt && (
                    <p>Approved At: <span className="font-mono text-[10px]">{new Date(business.approvedAt).toLocaleDateString()}</span></p>
                  )}
                  {business?.approvedBy && (
                    <p>Approved By Admin ID: <span className="font-mono text-[10px]">{business.approvedBy}</span></p>
                  )}
                  {!business?.approvedAt && (
                    <p className="text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Awaiting compliance review</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-5 border-t border-border/50 mt-4 text-[11px] text-muted-foreground italic flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Checked dynamically by BookMyTable Admins.
            </div>
          </Card>

          {/* Card 4: Location Verification */}
          <Card className="p-6 rounded-[2rem] border border-border bg-card shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-amber-100 dark:bg-amber-950/40 rounded-2xl">
                  <MapPin className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                {location?.verified ? (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-full font-bold">
                    Mapped
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 dark:border-amber-700 rounded-full font-bold">
                    Incomplete
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Location Pinning</h3>
                <p className="text-xs text-muted-foreground mt-1">Validates physical street addresses, coordinates mapping, and local reservations range.</p>
                <p className="text-xs font-semibold text-foreground/80 mt-3 break-words">
                  {location?.verified ? `${location.address?.addressLine1}, ${location.address?.city}, ${location.address?.state}` : "Physical address mapping missing"}
                </p>
              </div>
            </div>
            
            <div className="pt-5 border-t border-border/50 mt-4 text-[11px] text-muted-foreground italic flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" /> Address fields updated in basic location onboarding.
            </div>
          </Card>

        </div>

        {/* 2. INTERACTIVE TIMELINE / PROGRESS UI */}
        <Card className="p-8 rounded-[2rem] border border-border shadow-md space-y-6 bg-card">
          <div>
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" /> Live Moderation Timeline
            </h3>
            <p className="text-sm text-muted-foreground">Keep track of active milestones on the road to premium merchant approval.</p>
          </div>

          <div className="relative border-l-2 border-border/80 pl-6 ml-4 space-y-8">
            {timeline?.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Node icon circle */}
                <div className={`absolute -left-10 top-0.5 h-7 w-7 rounded-full border-2 border-card flex items-center justify-center font-bold text-xs ${
                  step.status === "completed" 
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {step.status === "completed" ? "✓" : idx + 1}
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-base font-bold ${
                      step.status === "completed" ? "text-foreground" : "text-muted-foreground"
                    }`}>{step.event}</h4>
                    {step.status === "completed" ? (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold text-[10px] rounded-full px-2 py-0.5">Completed</Badge>
                    ) : (
                      <Badge variant="secondary" className="font-bold text-[10px] rounded-full px-2 py-0.5">Pending</Badge>
                    )}
                  </div>
                  {step.date && (
                    <span className="text-xs font-semibold text-muted-foreground block font-mono">
                      Done on: {new Date(step.date).toLocaleString()}
                    </span>
                  )}
                  {step.status === "pending" && (
                    <span className="text-xs text-muted-foreground block">Verification checklist requires this step.</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* MODAL 1: EMAIL VERIFICATION MODAL */}
        {showEmailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border w-full max-w-md rounded-[2rem] p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-foreground">Verify Email Address</h3>
                <Button variant="ghost" onClick={() => (setShowEmailModal(false), setEmailOtpSent(false))} className="rounded-full h-8 w-8 p-0">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="font-bold">Registered email address</Label>
                  <Input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} disabled={emailOtpSent} placeholder="e.g. owner@restaurant.com" className="h-11 rounded-xl" />
                </div>

                {emailOtpSent && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <Label className="font-bold">Enter 6-Digit Email OTP</Label>
                    <Input value={emailOtpInput} onChange={(e) => setEmailOtpInput(e.target.value.trim())} placeholder="Enter OTP code" maxLength={6} className="h-11 rounded-xl text-center font-bold tracking-widest text-lg font-mono" />
                  </motion.div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                {emailOtpSent ? (
                  <Button onClick={handleVerifyEmailOTP} disabled={isVerifyingEmailOTP} className="w-full h-11 rounded-full font-bold">
                    {isVerifyingEmailOTP ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    Confirm Email OTP
                  </Button>
                ) : (
                  <Button onClick={handleSendEmailVerification} disabled={isSendingEmailOTP} className="w-full h-11 rounded-full font-bold">
                    {isSendingEmailOTP ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
                    Send Verification Email OTP
                  </Button>
                )}

                {emailOtpSent && (
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mt-2 px-1">
                    <span>Didn't receive email code?</span>
                    <button 
                      onClick={handleSendEmailVerification}
                      disabled={emailCooldown > 0 || isSendingEmailOTP}
                      className="text-primary hover:underline flex items-center gap-1 disabled:opacity-50 disabled:no-underline font-bold"
                    >
                      {emailCooldown > 0 ? (
                        <>Resend in {emailCooldown}s</>
                      ) : (
                        <><RefreshCw className="h-3 w-3" /> Resend OTP</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL 2: PHONE VERIFICATION MODAL */}
        {showPhoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border w-full max-w-md rounded-[2rem] p-8 shadow-2xl space-y-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-foreground">Verify Phone Number</h3>
                <Button variant="ghost" onClick={() => (setShowPhoneModal(false), setOtpSent(false))} className="rounded-full h-8 w-8 p-0">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="font-bold">Contact mobile number</Label>
                  <Input value={phoneInput} onChange={(e) => setPhoneInput(e.target.value)} disabled={otpSent} placeholder="e.g. +91 9876543210" className="h-11 rounded-xl" />
                </div>

                {otpSent && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <Label className="font-bold">Enter 6-Digit SMS OTP</Label>
                    <Input value={otpInput} onChange={(e) => setOtpInput(e.target.value.trim())} placeholder="Enter OTP code" maxLength={6} className="h-11 rounded-xl text-center font-bold tracking-widest text-lg font-mono" />
                  </motion.div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                {otpSent ? (
                  <Button onClick={handleVerifyPhoneOTP} disabled={isVerifyingOTP} className="w-full h-11 rounded-full font-bold">
                    {isVerifyingOTP ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
                    Confirm OTP & Verify
                  </Button>
                ) : (
                  <Button onClick={handleRequestPhoneOTP} disabled={isSendingOTP} className="w-full h-11 rounded-full font-bold">
                    {isSendingOTP ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
                    Request SMS OTP
                  </Button>
                )}

                {otpSent && (
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mt-2 px-1">
                    <span>Didn't receive SMS?</span>
                    <button 
                      onClick={handleRequestPhoneOTP}
                      disabled={phoneCooldown > 0 || isSendingOTP}
                      className="text-primary hover:underline flex items-center gap-1 disabled:opacity-50 disabled:no-underline font-bold"
                    >
                      {phoneCooldown > 0 ? (
                        <>Resend in {phoneCooldown}s</>
                      ) : (
                        <><RefreshCw className="h-3 w-3" /> Resend SMS OTP</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
