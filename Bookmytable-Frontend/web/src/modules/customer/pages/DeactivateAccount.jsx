import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, ShieldAlert, KeyRound, Info, X, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deactivateAccount } from "@/services/user.service";

export default function DeactivateAccount() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Form States
  const [password, setPassword] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");
  const [customFeedback, setCustomFeedback] = useState("");
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  
  // Double-Confirmation Challenge State
  const [challengeText, setChallengeText] = useState("");

  const reasons = [
    { id: "privacy", label: "Privacy / Security concerns" },
    { id: "frequency", label: "Too many email notification alerts" },
    { id: "not_using", label: "No longer hosting/dining out via BookMyTable" },
    { id: "usability", label: "System UI/UX feels hard to navigate" },
    { id: "other", label: "Other reasons (provide feedback)" }
  ];

  // Step 1 Form Handler
  const handleOpenChallenge = (e) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password credentials to proceed");
      return;
    }
    if (!deactivateReason) {
      toast.error("Please select a primary deactivation reason");
      return;
    }
    if (!confirmCheckbox) {
      toast.error("You must acknowledge the security warnings first");
      return;
    }
    
    // Open the final confirmation challenge dialog
    setShowFinalModal(true);
    setChallengeText("");
  };

  // Step 2 Final Dispatch
  const handleConfirmDeactivate = async () => {
    if (challengeText.toUpperCase() !== "DEACTIVATE") {
      toast.error("Please type 'DEACTIVATE' exactly to proceed");
      return;
    }

    try {
      setLoading(true);
      const res = await deactivateAccount(password);
      
      if (res.data?.success || res.status === 200) {
        toast.success(res.data?.message || "Account soft-deactivated successfully.");
        
        // Purge tokens and exit immediately
        try {
          logout?.();
        } finally {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/", { replace: true });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect password credential confirmation");
      setShowFinalModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl select-none">
      
      {/* Visual Header */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Trash2 className="h-6 w-6 text-destructive animate-pulse animate-duration-1000 shrink-0" />
          Deactivate Account
        </h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Suspend your BookMyTable credentials. Soft deactivation hides active slots and freezes reward levels immediately.</p>
      </div>

      {/* Critical Warnings Notice Block */}
      <div className="bg-red-50 border border-red-100 rounded-3xl p-5 flex gap-4 text-xs text-red-800 leading-relaxed shadow-sm items-start">
        <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-2">
          <span className="font-black block text-sm tracking-tight text-red-950">Critical Security & Access Notices:</span>
          <ul className="list-disc pl-4 space-y-1 text-[11px] font-semibold text-red-700">
            <li>Your account status immediately toggles to **Blocked** and **Inactive** in the database register.</li>
            <li>All pending or upcoming table reservations will be automatically cancelled or hidden.</li>
            <li>Accumulated Gold level loyalty points and active wallet logs will be frozen.</li>
            <li>You will be instantly logged out and barred from logging back in unless restored by the support desk.</li>
          </ul>
        </div>
      </div>

      <Card className="border border-slate-100 shadow-sm rounded-3xl bg-white overflow-hidden">
        <div className="p-5 border-b border-slate-50 bg-slate-50/20">
          <CardTitle className="text-xs font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldAlert className="h-4.5 w-4.5 text-slate-400" />
            Soft Deactivation Wizard
          </CardTitle>
          <CardDescription className="text-slate-400 text-[10px] mt-1 font-medium">Please fulfill all security checklist elements below</CardDescription>
        </div>
        
        <CardContent className="p-6">
          <form onSubmit={handleOpenChallenge} className="space-y-5">
            
            {/* Reason Radio Group */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">1. Why are you deactivating your account?</span>
              <div className="space-y-2">
                {reasons.map((item) => (
                  <label 
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-[11px] font-semibold leading-tight cursor-pointer transition-all duration-150 select-none ${
                      deactivateReason === item.id 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-slate-100 bg-slate-50/40 text-slate-650 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deactivate_reason"
                      checked={deactivateReason === item.id}
                      onChange={() => setDeactivateReason(item.id)}
                      className="h-3.5 w-3.5 border-slate-300 text-primary focus:ring-primary cursor-pointer shrink-0"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom feedback box if other is selected */}
            {deactivateReason === "other" && (
              <div className="space-y-1 animate-fadeIn">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Additional Details</span>
                <textarea
                  value={customFeedback}
                  onChange={(e) => setCustomFeedback(e.target.value)}
                  placeholder="Tell us how we can improve BookMyTable..."
                  maxLength={200}
                  className="w-full min-h-[80px] p-3 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* 2. PASSWORD CONFIRMATION */}
            <div className="space-y-1 relative">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">2. Confirm Security Password</span>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password credentials to authorize"
                disabled={loading}
                className="border-slate-200 focus-visible:ring-primary rounded-xl text-xs h-10 w-full"
              />
            </div>

            {/* 3. ACKNOWLEDGEMENT CHECKBOX */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
              <input
                type="checkbox"
                id="ack_deactivate"
                checked={confirmCheckbox}
                onChange={(e) => setConfirmCheckbox(e.target.checked)}
                className="mt-1 h-3.5 w-3.5 rounded border-slate-350 text-destructive focus:ring-destructive shrink-0 cursor-pointer"
              />
              <label htmlFor="ack_deactivate" className="text-[11px] font-semibold text-slate-500 leading-normal cursor-pointer select-none">
                I understand and acknowledge that checking this statement authorizes the immediate cancellation of active table slots and suspension of loyalty metrics.
              </label>
            </div>

            {/* Trigger challenge */}
            <Button
              type="submit"
              disabled={loading || !confirmCheckbox || !password || !deactivateReason}
              className="w-full bg-red-600 hover:bg-red-650 text-white rounded-xl text-xs font-bold h-11 mt-3 flex items-center justify-center gap-1.5 transition"
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Authorize Deactivation Request
            </Button>

          </form>
        </CardContent>
      </Card>

      {/* ==================== HIGH-FIDELITY DEACTIVATION CHALLENGE DIALOG ==================== */}
      <AnimatePresence>
        {showFinalModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
            
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-[32px] w-full max-w-sm shadow-2xl overflow-hidden flex flex-col relative"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-red-50/20">
                <span className="text-xs font-black text-red-700 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="h-4 w-4" />
                  Final Security Confirmation
                </span>
                <button
                  onClick={() => setShowFinalModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="h-4 w-4 shrink-0" />
                </button>
              </div>

              {/* Challenge canvas */}
              <div className="p-6 space-y-4">
                <p className="text-[11px] font-semibold text-slate-500 leading-relaxed text-center">
                  This action will soft-delete your user record immediately. Please type <b className="text-slate-900 uppercase">"DEACTIVATE"</b> exactly below to proceed.
                </p>

                <Input
                  type="text"
                  value={challengeText}
                  onChange={(e) => setChallengeText(e.target.value)}
                  placeholder="Type DEACTIVATE to confirm"
                  className="border-slate-200 text-center tracking-widest font-black uppercase text-xs h-10 w-full focus-visible:ring-red-550"
                />

                <div className="flex gap-2.5 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFinalModal(false)}
                    className="flex-1 border-slate-200 text-slate-600 rounded-xl text-xs font-bold h-10"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmDeactivate}
                    disabled={loading || challengeText.toUpperCase() !== "DEACTIVATE"}
                    className="flex-1 bg-red-600 hover:bg-red-650 text-white rounded-xl text-xs font-bold h-10 flex items-center justify-center gap-1"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin shrink-0" /> : <Trash2 className="h-4 w-4 shrink-0" />}
                    Deactivate
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
