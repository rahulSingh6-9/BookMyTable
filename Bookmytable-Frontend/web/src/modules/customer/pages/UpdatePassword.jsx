import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePassword } from "@/services/user.service";

export default function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Live Checklist States
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
    match: false
  });

  const [strengthScore, setStrengthScore] = useState(0); // 0 to 4
  const [strengthLabel, setStrengthLabel] = useState("Weak");
  const [strengthColor, setStrengthColor] = useState("bg-slate-200");

  // Run Live Validations
  useEffect(() => {
    const pw = formData.newPassword;
    const cpw = formData.confirmPassword;

    const lengthValid = pw.length >= 6;
    const uppercaseValid = /[A-Z]/.test(pw);
    const numberValid = /[0-9]/.test(pw);
    const specialValid = /[^A-Za-z0-9]/.test(pw);
    const matchValid = pw && pw === cpw;

    setChecks({
      length: lengthValid,
      uppercase: uppercaseValid,
      number: numberValid,
      special: specialValid,
      match: matchValid
    });

    // Compute Strength Score
    let score = 0;
    if (lengthValid) score++;
    if (uppercaseValid) score++;
    if (numberValid) score++;
    if (specialValid) score++;

    setStrengthScore(score);

    // Set Strength Metadata
    if (pw.length === 0) {
      setStrengthLabel("Not Entered");
      setStrengthColor("bg-slate-100");
    } else if (score <= 1) {
      setStrengthLabel("Weak");
      setStrengthColor("bg-red-500");
    } else if (score === 2) {
      setStrengthLabel("Fair");
      setStrengthColor("bg-amber-500");
    } else if (score === 3) {
      setStrengthLabel("Good");
      setStrengthColor("bg-blue-500");
    } else {
      setStrengthLabel("Strong");
      setStrengthColor("bg-emerald-500");
    }
  }, [formData.newPassword, formData.confirmPassword]);

  const isFormValid = 
    formData.currentPassword &&
    checks.length &&
    checks.uppercase &&
    checks.number &&
    checks.special &&
    checks.match;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please satisfy all password safety requirements first");
      return;
    }

    try {
      setLoading(true);
      const res = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });
      
      if (res.data?.success || res.status === 200) {
        toast.success(res.data?.message || "Password updated successfully!");
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password. Current password is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl select-none">
      
      {/* Visual Header */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <KeyRound className="h-6 w-6 text-primary animate-pulse" />
          Update Password
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Configure complex credentials to safeguard reservation slots, wallet credit limits, and dining logs.</p>
      </div>

      <Card className="border border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="p-5 border-b border-slate-50 bg-slate-50/20">
          <CardTitle className="text-xs font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-slate-400" />
            Security Challenge Update
          </CardTitle>
          <CardDescription className="text-slate-400 text-[10px] mt-1 font-medium">Changing your password invalidates active login tokens</CardDescription>
        </div>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* 1. CURRENT PASSWORD */}
            <div className="space-y-1 relative">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Current Password</span>
              <div className="relative">
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current active password"
                  disabled={loading}
                  className="border-slate-200 focus-visible:ring-primary rounded-xl text-xs h-10 w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition shrink-0"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
                </button>
              </div>
            </div>

            {/* 2. NEW PASSWORD */}
            <div className="space-y-1.5 relative">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">New Secret Password</span>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Create complex password"
                  disabled={loading}
                  className="border-slate-200 focus-visible:ring-primary rounded-xl text-xs h-10 w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition shrink-0"
                >
                  {showNew ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {formData.newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[9px] font-extrabold tracking-wider uppercase">
                    <span className="text-slate-400">Strength Indicator:</span>
                    <span className={
                      strengthLabel === "Strong" ? "text-emerald-600" :
                      strengthLabel === "Good" ? "text-blue-600" :
                      strengthLabel === "Fair" ? "text-amber-600" : "text-red-500"
                    }>
                      {strengthLabel}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4].map((barIdx) => (
                      <div 
                        key={barIdx}
                        className={`h-full flex-1 transition-all duration-300 ${
                          barIdx <= strengthScore ? strengthColor : "bg-slate-100"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. CONFIRM PASSWORD */}
            <div className="space-y-1 relative">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Confirm New Password</span>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Verify security key match"
                  disabled={loading}
                  className="border-slate-200 focus-visible:ring-primary rounded-xl text-xs h-10 w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition shrink-0"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4 shrink-0" /> : <Eye className="h-4 w-4 shrink-0" />}
                </button>
              </div>
            </div>

            {/* Live Requirement Checklist Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5">
              <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase block border-b border-slate-200/60 pb-1.5">
                Password Security Checklist
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-extrabold leading-tight">
                
                <div className="flex items-center gap-2">
                  {checks.length ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-slate-350 shrink-0" />
                  )}
                  <span className={checks.length ? "text-emerald-700" : "text-slate-400"}>Minimum 6 characters</span>
                </div>

                <div className="flex items-center gap-2">
                  {checks.uppercase ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-slate-350 shrink-0" />
                  )}
                  <span className={checks.uppercase ? "text-emerald-700" : "text-slate-400"}>One uppercase letter</span>
                </div>

                <div className="flex items-center gap-2">
                  {checks.number ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-slate-350 shrink-0" />
                  )}
                  <span className={checks.number ? "text-emerald-700" : "text-slate-400"}>One numeric value</span>
                </div>

                <div className="flex items-center gap-2">
                  {checks.special ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-slate-350 shrink-0" />
                  )}
                  <span className={checks.special ? "text-emerald-700" : "text-slate-400"}>One special character</span>
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  {checks.match ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-slate-350 shrink-0" />
                  )}
                  <span className={checks.match ? "text-emerald-700" : "text-slate-400"}>New credentials match perfectly</span>
                </div>

              </div>
            </div>

            {/* Submit Action */}
            <Button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold h-11 mt-3 transition duration-150 shadow-sm"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin shrink-0" /> : "Commit Security Credentials"}
            </Button>

          </form>
        </CardContent>
      </Card>

    </div>
  );
}
