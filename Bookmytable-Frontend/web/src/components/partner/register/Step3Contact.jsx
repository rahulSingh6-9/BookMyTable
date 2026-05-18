import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  CheckCircle2, 
  RefreshCw, 
  ShieldCheck, 
  Globe, 
  Instagram, 
  PhoneCall, 
  Info,
  ShieldAlert,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { motion, AnimatePresence } from "framer-motion";
import { sendPhoneOTP, verifyPhoneOTP } from "@/services/verification.service";
import { Badge } from "@/components/ui/badge";

export function Step3Contact({ register, errors, setValue, watch }) {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [cooldown, setCooldown] = useState(false);

  const contactInfo = watch("contactInfo");
  const primaryPhone = contactInfo?.primaryPhone;
  const isPhoneVerified = primaryPhone?.isVerified;

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else {
      setCooldown(false);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    const phone = primaryPhone?.e164;
    if (!primaryPhone?.number || primaryPhone.number.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setIsVerifying(true);
      await sendPhoneOTP(phone);
      setIsOtpSent(true);
      setResendTimer(60);
      setCooldown(true);
      toast.success("OTP sent to your phone");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send OTP. Try again later.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setIsVerifying(true);
      await verifyPhoneOTP(primaryPhone.e164, otp);
      
      setValue("contactInfo.primaryPhone.isVerified", true, { shouldValidate: true });
      setIsOtpSent(false);
      setOtp("");
      toast.success("Phone number verified successfully!");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const updatePhone = (val) => {
    const number = val.replace(/\D/g, '').slice(0, 15);
    const e164 = `${primaryPhone?.countryCode}${number}`;
    setValue("contactInfo.primaryPhone.number", number);
    setValue("contactInfo.primaryPhone.e164", e164);
    if (isPhoneVerified) {
      setValue("contactInfo.primaryPhone.isVerified", false);
    }
  };

  return (
    <div className="space-y-10 pb-6">
      {/* SECTION 1: Primary Business Contact */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
           </div>
           <div>
              <h3 className="text-xl font-bold">Primary Business Contact</h3>
              <p className="text-xs text-muted-foreground">Used for business verification and critical alerts</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Phone Field */}
           <div className="space-y-3">
              <Label className="flex justify-between items-center">
                 <span>Primary Phone Number</span>
                 {isPhoneVerified && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 rounded-full">
                       <CheckCircle2 className="h-3 w-3" /> Verified
                    </Badge>
                 )}
              </Label>
              <div className="flex gap-2">
                 <div className="relative flex-1">
                    <div className="absolute left-0 top-0 h-full w-[70px] flex items-center justify-center border-r bg-muted/50 rounded-l-xl text-xs font-bold text-muted-foreground">
                       {primaryPhone?.countryCode}
                    </div>
                    <Input 
                      placeholder="9001685064" 
                      className={`h-12 pl-[82px] rounded-xl border-2 transition-all ${isPhoneVerified ? 'border-green-500/50 bg-green-50/10' : 'focus-visible:ring-primary/20'}`}
                      value={primaryPhone?.number}
                      onChange={(e) => updatePhone(e.target.value)}
                    />
                 </div>
                 {!isPhoneVerified && (
                    <Button 
                      type="button" 
                      onClick={handleSendOtp} 
                      disabled={isVerifying || !primaryPhone?.number || primaryPhone.number.length < 10 || cooldown}
                      className="h-12 rounded-xl px-4 shadow-md transition-all hover:scale-[1.02]"
                    >
                       {isVerifying ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify"}
                    </Button>
                 )}
              </div>
              {errors?.contactInfo?.primaryPhone?.number && (
                 <p className="text-[10px] text-destructive font-medium px-1">
                    {errors.contactInfo.primaryPhone.number.message}
                 </p>
              )}
           </div>

           {/* Email Field */}
           <div className="space-y-3">
              <Label>Business Email Address</Label>
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input 
                   type="email"
                   placeholder="partners@yourbrand.com" 
                   className="h-12 pl-12 rounded-xl border-2 focus-visible:ring-primary/20"
                   {...register("contactInfo.businessEmail.value")}
                 />
              </div>
              {errors?.contactInfo?.businessEmail?.value && (
                 <p className="text-[10px] text-destructive font-medium px-1">
                    {errors.contactInfo.businessEmail.value.message}
                 </p>
              )}
           </div>
        </div>

        {/* OTP Input UI */}
        <AnimatePresence>
          {isOtpSent && !isPhoneVerified && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 rounded-3xl bg-primary/5 border-2 border-primary/20 space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <h4 className="font-bold text-sm">Verify OTP</h4>
                       <p className="text-[10px] text-muted-foreground">Sent to {primaryPhone?.e164}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsOtpSent(false)}
                      className="text-[10px] h-7 px-2 rounded-full"
                    >
                      Change Number
                    </Button>
                 </div>
                 
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className="h-12 w-10 md:w-12 rounded-xl border-2" />
                        <InputOTPSlot index={1} className="h-12 w-10 md:w-12 rounded-xl border-2" />
                        <InputOTPSlot index={2} className="h-12 w-10 md:w-12 rounded-xl border-2" />
                        <InputOTPSlot index={3} className="h-12 w-10 md:w-12 rounded-xl border-2" />
                        <InputOTPSlot index={4} className="h-12 w-10 md:w-12 rounded-xl border-2" />
                        <InputOTPSlot index={5} className="h-12 w-10 md:w-12 rounded-xl border-2" />
                      </InputOTPGroup>
                    </InputOTP>
                    
                    <div className="flex-1 w-full space-y-2">
                       <Button 
                         type="button" 
                         onClick={handleVerifyOtp}
                         disabled={otp.length !== 6 || isVerifying}
                         className="w-full h-12 rounded-xl font-bold"
                       >
                         {isVerifying ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
                         Verify OTP
                       </Button>
                       <div className="flex justify-center">
                          {resendTimer > 0 ? (
                             <span className="text-[10px] text-muted-foreground">Resend available in <b className="text-primary">{resendTimer}s</b></span>
                          ) : (
                             <button 
                               type="button" 
                               onClick={handleSendOtp}
                               className="text-[10px] font-bold text-primary hover:underline"
                             >
                               Resend OTP
                             </button>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* SECTION 2: Additional Communication */}
      <div className="space-y-6 pt-6 border-t">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
              <PhoneCall className="h-5 w-5" />
           </div>
           <div>
              <h3 className="text-xl font-bold">Additional Communication</h3>
              <p className="text-xs text-muted-foreground">Optional contact points for support and marketing</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-3">
              <Label>Support / Alternate Email</Label>
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input 
                   placeholder="support@yourbrand.com" 
                   className="h-12 pl-12 rounded-xl border-2 focus-visible:ring-primary/20"
                   {...register("contactInfo.supportEmail")}
                 />
              </div>
           </div>
           <div className="space-y-3">
              <Label>Website URL</Label>
              <div className="relative">
                 <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input 
                   placeholder="https://www.yourbrand.com" 
                   className="h-12 pl-12 rounded-xl border-2 focus-visible:ring-primary/20"
                   {...register("contactInfo.website")}
                 />
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-3">
              <Label>Instagram Handle</Label>
              <div className="relative">
                 <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input 
                   placeholder="@your.restaurant" 
                   className="h-12 pl-12 rounded-xl border-2 focus-visible:ring-primary/20"
                   {...register("contactInfo.socialLinks.instagram")}
                 />
              </div>
           </div>
           <div className="space-y-3">
              <Label>Alternate Phone (Optional)</Label>
              <div className="relative">
                 <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 <Input 
                   placeholder="Manager's contact number" 
                   className="h-12 pl-12 rounded-xl border-2 focus-visible:ring-primary/20"
                   onChange={(e) => {
                     const num = e.target.value.replace(/\D/g, '');
                     setValue("contactInfo.alternatePhone.number", num);
                     setValue("contactInfo.alternatePhone.e164", `${contactInfo.alternatePhone.countryCode}${num}`);
                   }}
                 />
              </div>
           </div>
        </div>
      </div>

      {/* Trust Indicator */}
      <div className="p-5 rounded-3xl bg-secondary/50 border border-border flex gap-4 items-start">
         <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
            <Info className="h-4 w-4" />
         </div>
         <p className="text-xs text-muted-foreground leading-relaxed">
           <b>Privacy Note:</b> Your contact information is stored securely and used only for operational purposes. We never share your data with third parties without consent.
         </p>
      </div>
    </div>
  );
}
