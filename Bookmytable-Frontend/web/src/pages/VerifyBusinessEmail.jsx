import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MailCheck, ShieldAlert, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { verifyBusinessEmailToken } from "@/services/verification.service";
import { toast } from "sonner";

export default function VerifyBusinessEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("We are verifying your business email. Please wait...");

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    const performVerification = async () => {
      if (!token || !email) {
        setStatus("error");
        setMessage("Invalid verification link. Token and email are required.");
        return;
      }

      try {
        const response = await verifyBusinessEmailToken(token, email);
        setStatus("success");
        setMessage(response.message || "Your business email has been verified successfully!");
        toast.success("Business email verified!");
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        setMessage(error.message || "Invalid or expired verification link. Please request a new link from the onboarding panel.");
        toast.error("Verification failed");
      }
    };

    performVerification();
  }, [token, email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="p-8 rounded-3xl border-2 shadow-xl bg-card text-center space-y-6">
          {status === "verifying" && (
            <div className="space-y-6 py-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto animate-spin">
                <RefreshCw className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Verifying Email</h2>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6 py-4">
              <div className="h-20 w-20 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
                <MailCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Email Verified!</h2>
                <p className="text-xs text-green-600 font-semibold bg-green-50 rounded-full px-3 py-1 inline-block border border-green-200">
                  {email}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                  Your business email is verified. You can now return to the partner onboarding dashboard to complete your application.
                </p>
              </div>
              <Button
                size="lg"
                className="w-full rounded-2xl h-12 font-bold shadow-lg transition-transform hover:scale-[1.02]"
                onClick={() => navigate("/partner/register")}
              >
                Continue Onboarding
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6 py-4">
              <div className="h-20 w-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                <ShieldAlert className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-destructive">Verification Failed</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {message}
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full rounded-2xl h-12 font-bold shadow-md hover:scale-[1.02] transition-transform"
                  onClick={() => navigate("/partner/register")}
                >
                  Return to Onboarding
                </Button>
                <Button
                  variant="ghost"
                  className="w-full h-12 text-xs font-bold text-muted-foreground"
                  onClick={() => navigate("/")}
                >
                  Go to Homepage
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
