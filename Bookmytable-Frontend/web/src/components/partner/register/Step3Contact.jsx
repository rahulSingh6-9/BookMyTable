import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, Phone, PhoneCall, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/config/firebase";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function Step3Contact({ register, errors, setValue, watch }) {
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState(watch("phone")?.replace(/^\+\d+\s/, "") || "");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const isPhoneVerified = watch("isPhoneVerified");
  const confirmationResultRef = useRef(null);

  useEffect(() => {
    // Sync to form value
    if (phoneNumber) {
      setValue("phone", `${countryCode} ${phoneNumber}`, { shouldValidate: true });
    }
  }, [countryCode, phoneNumber, setValue]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const initRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      const container = document.getElementById("recaptcha-container");
      if (container) {
        container.innerHTML = "";
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
      });
    }
    return window.recaptchaVerifier;
  };

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setIsVerifying(true);
      const verifier = initRecaptcha();
      const formattedPhone = `${countryCode}${phoneNumber}`;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      confirmationResultRef.current = confirmationResult;
      
      setIsOtpSent(true);
      setResendTimer(60);
      toast.success("OTP sent to your phone");
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error(error.message || "Failed to send OTP. Try again later.");
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (e) {}
        window.recaptchaVerifier = null;
      }
      const container = document.getElementById("recaptcha-container");
      if (container) container.innerHTML = "";
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
      await confirmationResultRef.current.confirm(otp);
      
      setValue("isPhoneVerified", true, { shouldValidate: true });
      toast.success("Phone number verified successfully!");
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 flex items-center">
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                setValue("isPhoneVerified", false);
                setIsOtpSent(false);
              }}
              disabled={isPhoneVerified}
              className="absolute left-0 top-0 h-full w-[70px] bg-transparent pl-3 pr-1 text-sm border-r focus:outline-none appearance-none cursor-pointer"
            >
              <option value="+91">+91 (IN)</option>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
              <option value="+61">+61 (AU)</option>
            </select>
            <Input 
              id="phone" 
              placeholder="9001685064" 
              className={`pl-[80px] ${isPhoneVerified ? 'border-green-500 bg-green-50/50' : ''}`}
              value={phoneNumber}
              disabled={isPhoneVerified}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 15);
                setPhoneNumber(val);
                setValue("isPhoneVerified", false);
                setIsOtpSent(false);
              }}
            />
          </div>

          {!isPhoneVerified && (
            <Button 
              type="button" 
              onClick={handleSendOtp} 
              disabled={isVerifying || !phoneNumber || phoneNumber.length < 10 || (isOtpSent && resendTimer > 0)}
              variant={isOtpSent ? "outline" : "default"}
              className="w-full sm:w-auto"
            >
              {isVerifying ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isOtpSent ? (resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP") : "Verify Number"}
            </Button>
          )}

          {isPhoneVerified && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-md border border-green-200 w-full sm:w-auto justify-center">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium text-sm">Verified</span>
            </div>
          )}
        </div>
        
        {/* Hidden input to keep react-hook-form happy with validation if needed */}
        <input type="hidden" {...register("phone", { required: "Phone is required" })} />
        <input type="hidden" {...register("isPhoneVerified")} />
        
        {errors.phone && !phoneNumber && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <div id="recaptcha-container"></div>

      {isOtpSent && !isPhoneVerified && (
        <div className="space-y-3 p-4 bg-muted/30 rounded-xl border animate-in fade-in slide-in-from-top-2">
          <Label>Enter 6-digit OTP sent to {countryCode} {phoneNumber}</Label>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button 
              type="button" 
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || isVerifying}
              className="w-full sm:w-auto ml-auto"
            >
              Confirm OTP
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="altPhone">Alternate Phone (Optional)</Label>
        <div className="relative">
          <PhoneCall className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            id="altPhone" 
            placeholder="Manager or support number" 
            className="pl-10"
            {...register("altPhone")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Business Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            id="email" 
            type="email"
            placeholder="Official email for bookings" 
            className="pl-10"
            {...register("email", { 
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
            })}
          />
        </div>
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      
      <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
        <p className="text-xs text-orange-600 font-medium">
          Note: This email will be used to send reservation notifications and monthly performance reports.
        </p>
      </div>
    </div>
  );
}
