import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Phone, Eye, EyeOff, ArrowRight, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AuthContext";

export default function Login() {
  const  { login } = useAdminAuth()
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try{
      const result = await login(email, password)

      if(result.success) {
        navigate("/admin")
      }

    } catch(error) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
   
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-elevated transform -rotate-6">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Admin <span className="text-primary">Portal</span>
          </h1>
          <p className="text-muted-foreground max-w-[280px]">
            Table-Time-Connect administrative management system.
          </p>
        </div>

        <Card className="rounded-2xl border-border/40 shadow-elevated bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="password" name="password-tab" className="rounded-lg data-[state=active]:shadow-sm">Password</TabsTrigger>
                <TabsTrigger value="otp" name="otp-tab" className="rounded-lg data-[state=active]:shadow-sm">OTP Login</TabsTrigger>
              </TabsList>

              <TabsContent value="password">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        placeholder="admin@tabletime.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-12 bg-muted/30 border-border/50 focus:bg-background transition-all rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button variant="link" className="px-0 font-medium text-xs text-primary h-auto">
                        Forgot password?
                      </Button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 h-12 bg-muted/30 border-border/50 focus:bg-background transition-all rounded-xl"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] mt-2" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        Sign In <ArrowRight size={18} />
                      </div>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="otp">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="phone"
                        placeholder="+91 99999 99999"
                        type="tel"
                        className="pl-10 h-12 bg-muted/30 border-border/50 focus:bg-background transition-all rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-dashed border-2 hover:bg-muted/50 transition-all">
                    Send Verification Code
                  </Button>
                  <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold mt-2" disabled={isLoading}>
                    Login with OTP
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-border/40 py-6 bg-muted/20 rounded-b-2xl">
            <p className="text-xs text-center text-muted-foreground px-6">
              Access to this panel is restricted to authorized personnel only. 
              Unauthorized access attempts are monitored and logged.
            </p>
          </CardFooter>
        </Card>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          © 2026 Table-Time-Connect. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
