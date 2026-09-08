import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/brand/BrandLogo";
import api from "@/lib/api";
import { toast } from "sonner";
import { ROLE_PERMISSIONS } from "@/config/roles";

import { useAuth } from "../context/AuthContext";
import { useBranch } from "../context/BranchContext";

export default function Login() {
  const { login, loginWithGoogle, logout } = useAuth();
  const { refreshMemberships, switchBranch } = useBranch();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteDetails, setInviteDetails] = useState(null);
  const [inviteFailure, setInviteFailure] = useState(null);
  
  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const inviteToken = searchParams.get("inviteToken");

  useEffect(() => {
    if (inviteToken) {
      api.get(`/staff/invite/validate?token=${inviteToken}`)
        .then((res) => setInviteDetails(res.data.data))
        .catch((err) => console.error("Failed to load invite", err));
    }
  }, [inviteToken]);

  const defaultFrom = "/profile";
  const from = location.state?.from?.pathname || defaultFrom;

  const handleLoginSuccess = async (userData) => {
    if (inviteToken && inviteDetails) {
      if (userData.email !== inviteDetails.email) {
        setInviteFailure("This invitation belongs to another account");
        return;
      }

      try {
        await api.post("/staff/accept-invite", { token: inviteToken });
        await refreshMemberships();
        
        if (inviteDetails.restaurantId) {
          switchBranch(inviteDetails.restaurantId);
        }

        const perms = ROLE_PERMISSIONS[inviteDetails.role] || [];
        if (perms.includes("*") || perms.includes("MANAGE_BRANCH")) {
          navigate("/owner/dashboard", { replace: true });
        } else {
          navigate("/staff/dashboard", { replace: true });
        }
      } catch (err) {
        setInviteFailure(err.response?.data?.message || "Failed to accept invitation");
      }
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleGoogleResponse = async (response) => {
    setLoading(true);
    try {
      const result = await loginWithGoogle(response.credential);
      if (result.success) {
        await handleLoginSuccess(result.user);
      }
    } catch (err) {
      console.error("Google authentication failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = "google-jssdk";
    let js = document.getElementById(id);
    if (!js) {
      js = document.createElement("script");
      js.id = id;
      js.src = "https://accounts.google.com/gsi/client";
      js.async = true;
      js.defer = true;
      document.body.appendChild(js);
    }

    const initializeGoogle = () => {
      if (window.google) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "180295844498-mockclientid.apps.googleusercontent.com";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 382, // matches the visual card width perfectly
          });
        }
      }
    };

    js.onload = initializeGoogle;
    if (window.google) {
      initializeGoogle();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        await handleLoginSuccess(result.user);
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (inviteFailure) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
             <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
             <h1 className="text-2xl font-bold text-foreground">Invitation Failed</h1>
             <p className="mt-2 text-sm text-muted-foreground">{inviteFailure}</p>
          </div>
          
          <div className="space-y-4">
            <Button onClick={() => handleLoginSuccess(JSON.parse(localStorage.getItem("user")))} className="w-full">
              Retry
            </Button>
            <Button variant="outline" onClick={() => { logout(); setInviteFailure(null); }} className="w-full">
              Logout & Switch Account
            </Button>
            <Button variant="ghost" onClick={() => navigate("/login", { replace: true })} className="w-full">
              Back to Normal Login
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2">
              <BrandLogo className="h-10 w-auto max-w-[150px] rounded-md" />
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Book<span className="text-primary">My</span>Table
              </span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {inviteToken ? "Join the Team" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {inviteDetails ? `You are joining ${inviteDetails.restaurantName}` : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-card-foreground">Password</label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : inviteToken ? (inviteDetails ? `Join ${inviteDetails.restaurantName}` : "Join Team") : "Sign In"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or continue with</span></div>
          </div>

          <div className="space-y-3">
            <div ref={googleBtnRef} className="w-full flex justify-center" />
            <Button variant="outline" type="button" className="w-full h-11 text-sm font-medium border-border flex items-center justify-center gap-2">
              Continue with Apple
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </motion.div>
    </div>
  );
}
