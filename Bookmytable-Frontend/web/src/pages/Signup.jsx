import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, Phone } from "lucide-react";
import { z } from "zod";
import { signupSchema } from "../validation/auth.schema.js"; // ✅ shared schema
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logo from "@/assets/BookMyTable_logo.jpg";

import { signup as signupApi } from "../services/auth.service.js";
import { socket } from "../services/socket";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const googleBtnRef = useRef(null);

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle(response.credential);
      if (result.success) {
        navigate("/profile");
      }
    } catch (err) {
      console.error("Google authentication failed:", err);
    } finally {
      setIsLoading(false);
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
            text: "signup_with",
            shape: "rectangular",
            width: 382,
          });
        }
      }
    };

    js.onload = initializeGoogle;
    if (window.google) {
      initializeGoogle();
    }
  }, []);
  const [errors, setErrors] = useState({});

  const countries = [
    { code: "+91", iso: "in", label: "India" },
    { code: "+1", iso: "us", label: "USA" },
    { code: "+44", iso: "gb", label: "UK" },
    { code: "+971", iso: "ae", label: "UAE" },
    { code: "+61", iso: "au", label: "Australia" },
    { code: "+1-CAN", iso: "ca", label: "Canada" },
  ];

  const currentCountry = countries.find((c) => c.code === countryCode) || countries[0];

  const validateForm = () => {
    try {
      setErrors({});
      // Build full phone with country code for validation
      const fullPhone = `${countryCode === "+1-CAN" ? "+1" : countryCode}${phone}`;
      signupSchema.parse({ name, email, password, phone: fullPhone });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const fullPhone = `${countryCode === "+1-CAN" ? "+1" : countryCode}${phone}`;

      const response = await signupApi({ name, email, password, phone: fullPhone });

      const token = response.data.data.token;
      const user = response.data.data.user;

      localStorage.setItem("token", token);

      socket.auth = { token };
      socket.connect();

      if (user?._id) {
        socket.emit("join_user", user._id);
      }

      toast.success("Account created successfully!");

      setName("");
      setEmail("");
      setPassword("");
      setPhone("");

      navigate("/profile");
    } catch (error) {
      const message = error.message || "Registration failed. Try again.";
      toast.error(message);
      setErrors({ form: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-16">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <img src={logo} alt="BookMyTable" className="h-10 w-10 rounded-md object-cover" />
            <span className="text-xl font-bold text-foreground">Book<span className="text-primary">My</span>Table</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start booking tables in seconds</p>
        </div>

        <form onSubmit={handleSignup} className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
          {errors.form && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">
              {errors.form}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} className={`pl-10 ${errors.name ? "border-red-500" : ""}`} />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`pl-10 ${errors.email ? "border-red-500" : ""}`} />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">Mobile Number</label>
            <div
              className="flex gap-0 border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-background overflow-hidden items-center group transition-all duration-200 shadow-sm"
              style={errors.phone ? { borderColor: "#ef4444" } : {}}
            >
              <div className="flex items-center">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="border-0 focus:ring-0 w-auto h-11 px-3 bg-transparent hover:bg-muted/30 transition-colors shadow-none rounded-none focus:ring-offset-0">
                    <div className="flex items-center gap-2 mr-1">
                      <img src={`https://flagcdn.com/w40/${currentCountry.iso}.png`} alt={currentCountry.label} className="w-5 h-3.5 object-cover shadow-sm" />
                      <span className="font-medium text-sm text-foreground">{countryCode === "+1-CAN" ? "+1" : countryCode}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        <div className="flex items-center gap-2">
                          <img src={`https://flagcdn.com/w40/${c.iso}.png`} alt={c.label} className="w-5 h-3.5 object-cover" />
                          <span>{c.code === "+1-CAN" ? "+1" : c.code} ({c.label})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-[1px] h-6 bg-border opacity-50" />
              <Input
                type="tel"
                placeholder="Continue with mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="border-0 focus-visible:ring-0 pl-3 h-11 flex-1 shadow-none rounded-none bg-transparent"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-card-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`pl-10 pr-10 ${errors.password ? "border-red-500" : ""}`} />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
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

        <p className="mt-10 mb-10 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
