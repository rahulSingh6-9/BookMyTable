import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  Smartphone,
  Lock,
  ChevronRight,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle,
  HelpCircle,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  requestPhoneChange,
  verifyPhoneOtp,
  resendPhoneOtp,
  requestEmailChange,
  verifyEmailToken
} from "@/services/user.service";

export default function ContactVerification() {
  const { user, setUser } = useAuth();

  // Core Identity State
  const currentEmail = user?.email || "";
  const currentPhone = user?.phone?.e164 || user?.phone?.number || (typeof user?.phone === "string" ? user?.phone : "") || "Not Linked";
  const isEmailVerified = !!user?.verification?.emailVerified;
  const isPhoneVerified = !!(user?.phone?.isVerified || user?.verification?.phoneVerified);

  // Modal Control States
  const [activeModal, setActiveModal] = useState(null); // 'email' or 'phone' or null
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3

  // Form Fields & States
  const [inputEmail, setInputEmail] = useState("");
  const [inputPhone, setInputPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Segmented OTP Input States
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [tokenValues, setTokenValues] = useState(["", "", "", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);

  const otpRefs = useRef([]);
  const tokenRefs = useRef([]);

  // Cooldown Countdown Timer
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Reset Form State when modal changes
  const resetForms = () => {
    setActiveModal(null);
    setCurrentStep(1);
    setInputEmail("");
    setInputPhone("");
    setConfirmPassword("");
    setOtpValues(["", "", "", "", "", ""]);
    setTokenValues(["", "", "", "", "", "", "", ""]);
    setLoading(false);
  };

  // Open Modal Handler
  const openModal = (type) => {
    resetForms();
    setActiveModal(type);
    setCurrentStep(1);
  };

  // 📞 PHONE CHANGE FLOWS
  const handlePhoneRequest = async (e) => {
    if (e) e.preventDefault();
    if (!inputPhone) {
      toast.error("Please enter a valid phone number");
      return;
    }

    try {
      setLoading(true);
      const res = await requestPhoneChange(inputPhone);
      if (res.data?.success || res.status === 200) {
        toast.success(res.data?.message || "A verification OTP has been dispatched!");
        setCurrentStep(2); // Jump to OTP entry
        setCooldown(60);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to trigger phone verification");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerifySubmit = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otpValues.join("");
    if (otpCode.length < 6) {
      toast.error("Please enter the complete 6-digit OTP code");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyPhoneOtp(otpCode);
      if (res.data?.success || res.status === 200) {
        const updatedUser = res.data?.data;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Phone verified and updated successfully!");
        resetForms();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect verification OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneResend = async () => {
    if (cooldown > 0) return;
    try {
      setLoading(true);
      const res = await resendPhoneOtp();
      if (res.data?.success || res.status === 200) {
        toast.success(res.data?.message || "Verification OTP resent successfully!");
        setCooldown(60);
        setOtpValues(["", "", "", "", "", ""]);
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✉️ EMAIL CHANGE FLOWS
  const handleEmailStep1Submit = (e) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setCurrentStep(2); // Move to Password confirmation step
  };

  const handleEmailStep2Submit = async (e) => {
    e.preventDefault();
    if (!confirmPassword) {
      toast.error("Please confirm your password to authenticate");
      return;
    }

    try {
      setLoading(true);
      const res = await requestEmailChange(inputEmail);
      if (res.data?.success || res.status === 200) {
        toast.success(res.data?.message || "Verification code dispatched to your email");
        setCurrentStep(3); // Jump to Token verification entry
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Email request rejected");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerifySubmit = async (e) => {
    if (e) e.preventDefault();
    const tokenCode = tokenValues.join("");
    if (tokenCode.length < 8) {
      toast.error("Please enter the complete 8-character verification token");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyEmailToken(tokenCode);
      if (res.data?.success || res.status === 200) {
        const updatedUser = res.data?.data;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Email verified and updated successfully!");
        resetForms();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect verification token code");
    } finally {
      setLoading(false);
    }
  };

  // Segmented OTP Input change handlers
  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);

    // Auto-focus next field
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus();
    }
  };

  // Segmented Email Token Change Handlers
  const handleTokenChange = (index, value) => {
    const newTokens = [...tokenValues];
    newTokens[index] = value.substring(value.length - 1).toUpperCase();
    setTokenValues(newTokens);

    // Auto-focus next field
    if (value && index < 7 && tokenRefs.current[index + 1]) {
      tokenRefs.current[index + 1].focus();
    }
  };

  const handleTokenKeyDown = (index, e) => {
    if (e.key === "Backspace" && !tokenValues[index] && index > 0 && tokenRefs.current[index - 1]) {
      tokenRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Visual Header */}
      <div className="border-b border-slate-100 pb-5">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="h-6 w-6 text-primary animate-pulse" />
          Contact & Verification
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Configure your primary contact parameters and verification tokens to authorize secure dining transactions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        
        {/* ==================== 1. EMAIL MANAGEMENT CARD ==================== */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden flex flex-col justify-between h-full">
          <div className="p-5 border-b border-slate-50 bg-slate-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-slate-400" />
                Primary Email
              </span>
              {isEmailVerified ? (
                <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100/60 hover:bg-emerald-50 rounded-xl gap-1 text-[9px] font-black uppercase px-2 py-0.5 shadow-sm">
                  <CheckCircle2 className="h-3 w-3 shrink-0" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-100 rounded-xl gap-1 text-[9px] font-black uppercase px-2 py-0.5 shadow-sm animate-pulse">
                  <AlertTriangle className="h-3 w-3 shrink-0" /> Action Required
                </Badge>
              )}
            </div>
            <p className="text-slate-400 text-[10px] mt-1 font-medium">Used for security recoveries and billing receipts</p>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between min-h-[160px] gap-6">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Active Credentials Email</span>
              <span className="text-xs font-extrabold text-slate-800 truncate max-w-[210px]">{currentEmail}</span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => openModal("email")}
                className="flex-1 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold h-10 gap-1.5 transition duration-150"
              >
                Change Email Address
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </Button>
            </div>
          </div>
        </Card>

        {/* ==================== 2. PHONE MANAGEMENT CARD ==================== */}
        <Card className="border border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden flex flex-col justify-between h-full">
          <div className="p-5 border-b border-slate-50 bg-slate-50/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-slate-400" />
                Mobile Phone
              </span>
              {isPhoneVerified ? (
                <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100/60 hover:bg-emerald-50 rounded-xl gap-1 text-[9px] font-black uppercase px-2 py-0.5 shadow-sm">
                  <CheckCircle2 className="h-3 w-3 shrink-0" /> Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-100 rounded-xl gap-1 text-[9px] font-black uppercase px-2 py-0.5 shadow-sm animate-pulse">
                  <AlertTriangle className="h-3 w-3 shrink-0" /> Action Required
                </Badge>
              )}
            </div>
            <p className="text-slate-400 text-[10px] mt-1 font-medium">Used for SMS seat alerts and priority updates</p>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between min-h-[160px] gap-6">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between shadow-inner">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Linked Phone Number</span>
              <span className="text-xs font-extrabold text-slate-800">{currentPhone}</span>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => openModal("phone")}
                className="flex-1 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold h-10 gap-1.5 transition duration-150"
              >
                Change Phone Number
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </Button>
            </div>
          </div>
        </Card>

      </div>

      {/* ==================== 3. SECURITY BANNER SECTION ==================== */}
      <Card className="border border-slate-100 rounded-3xl bg-slate-50/50 p-5 flex gap-4 text-xs leading-relaxed text-slate-600 shadow-sm items-start mt-6">
        <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <span className="text-slate-900 font-extrabold block text-sm">Enterprise Account Protection Rules</span>
          <p className="text-[11px] font-semibold text-slate-400 leading-normal">
            For maximum diner protection, BookMyTable never updates emails or phone links directly. Every change request generates secure, event-driven OTP verification tickets delivered downstream through isolated Kafka event queues. We strictly enforce multi-factor validation at the microservice database layer before updating any records.
          </p>
        </div>
      </Card>

      {/* ==================== HIGH-FIDELITY MODAL OVERLAYS ==================== */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col relative"
            >
              {/* Top Bar */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                <span className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                  {activeModal === "email" ? <Mail className="h-4 w-4 text-primary" /> : <Smartphone className="h-4 w-4 text-primary" />}
                  {activeModal === "email" ? "Change Primary Email" : "Change Mobile Phone"}
                </span>
                <button
                  onClick={resetForms}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="h-4 w-4 shrink-0" />
                </button>
              </div>

              {/* Modal Body Canvas */}
              <div className="p-6">
                
                {/* ✉️ EMAIL MODAL SECTIONS */}
                {activeModal === "email" && (
                  <AnimatePresence mode="wait">
                    
                    {/* Step 1: Input new email */}
                    {currentStep === 1 && (
                      <motion.form
                        key="email-s1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleEmailStep1Submit}
                        className="space-y-4"
                      >
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex gap-2.5 text-[11px] leading-relaxed font-semibold text-slate-500">
                          <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>Provide your new primary email address. In the next steps, we will prompt for security credentials confirmation before dispatching token keys.</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">New Email Address</span>
                          <Input
                            type="email"
                            required
                            value={inputEmail}
                            onChange={(e) => setInputEmail(e.target.value)}
                            placeholder="rahul.singh@newdomain.com"
                            className="border-slate-200 focus-visible:ring-primary rounded-xl text-xs h-10 w-full"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={!inputEmail || !inputEmail.includes("@")}
                          className="w-full bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold h-10 gap-1.5 transition"
                        >
                          Confirm & Continue
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </motion.form>
                    )}

                    {/* Step 2: Confirm password */}
                    {currentStep === 2 && (
                      <motion.form
                        key="email-s2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleEmailStep2Submit}
                        className="space-y-4"
                      >
                        <div className="bg-red-50 border border-red-100/50 rounded-2xl p-3 flex gap-2.5 text-[11px] leading-relaxed font-semibold text-red-700">
                          <Lock className="h-4 w-4 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                          <span>Security authorization challenge: please confirm your password credentials to dispatch the email change request token.</span>
                        </div>
                        <div className="space-y-1 relative">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Enter Current Password</span>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="••••••••"
                              disabled={loading}
                              className="border-slate-200 focus-visible:ring-primary rounded-xl text-xs h-10 w-full pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                            className="flex-1 border-slate-200 text-slate-600 rounded-xl text-xs font-bold h-10"
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading || !confirmPassword}
                            className="flex-1 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold h-10"
                          >
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify & Send Token"}
                          </Button>
                        </div>
                      </motion.form>
                    )}

                    {/* Step 3: Input Verification Token */}
                    {currentStep === 3 && (
                      <motion.form
                        key="email-s3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handleEmailVerifySubmit}
                        className="space-y-4"
                      >
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-2.5 text-[11px] leading-relaxed font-semibold text-amber-700">
                          <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                          <span>An 8-character verification token key has been dispatched to <b>{inputEmail}</b>. Please input it below:</span>
                        </div>

                        {/* Segmented Input Blocks */}
                        <div className="flex justify-between gap-1.5 py-2">
                          {tokenValues.map((val, idx) => (
                            <input
                              key={idx}
                              type="text"
                              ref={(el) => (tokenRefs.current[idx] = el)}
                              value={val}
                              onChange={(e) => handleTokenChange(idx, e.target.value)}
                              onKeyDown={(e) => handleTokenKeyDown(idx, e)}
                              maxLength={1}
                              disabled={loading}
                              className="w-10 h-11 border border-slate-200 rounded-xl text-center font-black text-sm uppercase text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                            />
                          ))}
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                            className="flex-1 border-slate-200 text-slate-600 rounded-xl text-xs font-bold h-10"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={loading || tokenValues.join("").length < 8}
                            className="flex-1 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold h-10"
                          >
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify Code"}
                          </Button>
                        </div>
                      </motion.form>
                    )}

                  </AnimatePresence>
                )}

                {/* 📞 PHONE MODAL SECTIONS */}
                {activeModal === "phone" && (
                  <AnimatePresence mode="wait">
                    
                    {/* Step 1: Input Phone */}
                    {currentStep === 1 && (
                      <motion.form
                        key="phone-s1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handlePhoneRequest}
                        className="space-y-4"
                      >
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex gap-2.5 text-[11px] leading-relaxed font-semibold text-slate-500">
                          <Smartphone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>Input your new mobile phone number using full international format (e.g. +91XXXXXXXXXX). We will trigger a security OTP.</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">New Phone Number</span>
                          <Input
                            type="text"
                            required
                            value={inputPhone}
                            onChange={(e) => setInputPhone(e.target.value)}
                            placeholder="e.g. +919876543210"
                            className="border-slate-200 focus-visible:ring-primary rounded-xl text-xs h-10 w-full"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={loading || !inputPhone}
                          className="w-full bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold h-10 gap-1.5 transition"
                        >
                          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Request SMS OTP Code"}
                        </Button>
                      </motion.form>
                    )}

                    {/* Step 2: OTP inputs */}
                    {currentStep === 2 && (
                      <motion.form
                        key="phone-s2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onSubmit={handlePhoneVerifySubmit}
                        className="space-y-4"
                      >
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-2.5 text-[11px] leading-relaxed font-semibold text-amber-700">
                          <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                          <span>An SMS containing a 6-digit verification OTP code has been dispatched. (Logs viewable in notifications microservice).</span>
                        </div>

                        {/* Segmented OTP blocks */}
                        <div className="flex justify-between gap-2.5 py-2">
                          {otpValues.map((val, idx) => (
                            <input
                              key={idx}
                              type="text"
                              ref={(el) => (otpRefs.current[idx] = el)}
                              value={val}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              maxLength={1}
                              disabled={loading}
                              className="w-12 h-12 border border-slate-200 rounded-2xl text-center font-black text-base text-slate-800 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                            />
                          ))}
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handlePhoneResend}
                            disabled={loading || cooldown > 0}
                            className="flex-1 border-slate-200 text-slate-650 rounded-xl text-xs font-bold h-10 gap-1"
                          >
                            <RefreshCw className={`h-3 w-3 shrink-0 ${loading ? 'animate-spin' : ''}`} />
                            {cooldown > 0 ? `Resend (${cooldown}s)` : "Resend OTP"}
                          </Button>
                          
                          <Button
                            type="submit"
                            disabled={loading || otpValues.join("").length < 6}
                            className="flex-1 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold h-10"
                          >
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Confirm Verification"}
                          </Button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-center w-full mt-2 block transition"
                        >
                          Cancel Verification
                        </button>
                      </motion.form>
                    )}

                  </AnimatePresence>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
