import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema } from "../validation/auth.schema.js";

import { forgotPassword } from "../services/auth.service";
import { toast } from "sonner";



export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const [userEmail, setUserEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const emailSubmit = async (data) => {
    setIsLoading(true);
    try {
      const res = await forgotPassword(data.email);
      setUserEmail(data.email);
      setSent(true);
      toast.success("Reset link sent!");
    } catch (error) {
      toast.error(error.message || "Failed to send email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll send you a link to reset your password</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-card">
          {sent ? (
            <div className="text-center py-4">
              <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <Check className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground">Check your email</h3>
              <p className="mt-1 text-sm text-muted-foreground">We sent a reset link to {userEmail}</p>
              <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>Try another email</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(emailSubmit)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-card-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="you@example.com" {...register("email")} className="pl-10" required />
                </div>
              </div>
               <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-4 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
