import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordSchema } from "../validation/auth.schema.js";

//validation Schemas
import { resetPassword } from "../services/auth.service";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors }} = useForm({resolver: zodResolver(resetPasswordSchema)});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);



  const resetPasswordSubmit = async (data) => {
    
     
setIsLoading(true);
    
    // Simulate API call
    try {

      const res = await resetPassword({
        token: token,
        newPassword: data.newPassword
      })
      setIsSuccess(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-full max-w-md text-center"
        >
          <div className="mb-8 rounded-2xl border border-border bg-card p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-green-500/10 p-3 ring-8 ring-green-500/5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Password Reset Complete</h1>
            <p className="mt-3 text-muted-foreground">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Button 
              className="mt-8 w-full group" 
              onClick={() => navigate("/login")}
            >
              Sign In
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-16 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/2 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-30" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">New Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please enter your new password below to secure your account
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit(resetPasswordSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  {...register("newPassword")}
                  className={`pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary transition-all duration-300 ${errors.newPassword ? "border-destructive focus:border-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Confirm New Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  {...register("confirmPassword")}
                  className={`pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary transition-all duration-300 ${errors.confirmPassword ? "border-destructive focus:border-destructive" : ""}`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-background/30 border-t-background animate-spin rounded-full" />
                    Updating...
                  </div>
                ) : "Reset Password"}
              </Button>
            </div>
          </form>
        </div>

        <p className="mt-8 text-center">
          <Link 
            to="/login" 
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            Remembered your password? <span className="text-primary font-bold hover:underline">Sign In</span>
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
