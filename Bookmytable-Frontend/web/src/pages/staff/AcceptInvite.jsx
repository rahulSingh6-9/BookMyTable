import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2, Store } from "lucide-react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user: loggedInUser, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const [inviteDetails, setInviteDetails] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link. Missing token.");
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await api.get(`/staff/invite/validate?token=${token}`);
        setInviteDetails(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or expired invitation");
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  // If user is already logged in but email doesn't match invite email
  const emailMismatch = isAuthenticated && inviteDetails && loggedInUser?.email !== inviteDetails.email;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleAccept = async (e) => {
    if (e) e.preventDefault();
    
    if (!isAuthenticated && formData.password !== formData.confirmPassword) {
      return toast({
        title: "Passwords do not match",
        variant: "destructive",
      });
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.post("/staff/accept-invite", {
        token,
        name: isAuthenticated ? undefined : formData.name,
        password: isAuthenticated ? undefined : formData.password,
      });

      setSuccess(true);
      toast({
        title: "Invitation Accepted!",
        description: "You have successfully joined the restaurant team.",
      });
      
      // If already logged in, redirect to dashboard immediately
      if (isAuthenticated) {
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept invitation");
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to accept invitation",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
        <Card className="w-full max-w-md text-center shadow-lg border-primary/20">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold">Account Activated!</CardTitle>
            <CardDescription className="text-base mt-2">
              You have successfully joined <span className="font-bold text-foreground">{inviteDetails?.restaurantName}</span>.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full h-11" onClick={() => navigate(isAuthenticated ? "/profile" : "/login")}>
              {isAuthenticated ? "Go to Dashboard" : "Proceed to Login"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-border/60">
        <CardHeader className="space-y-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2 mx-auto">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Join the Team</CardTitle>
          {inviteDetails && !error && (
            <CardDescription className="text-center text-sm">
              You've been invited to join <span className="font-bold text-foreground">{inviteDetails.restaurantName}</span> as a <span className="capitalize">{inviteDetails.role?.replace(/_/g, " ")}</span>.
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3 border border-red-100">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold">Invitation Error</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          ) : emailMismatch ? (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-xl flex items-start gap-3 border border-amber-200">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-bold">Email Mismatch</p>
                <p className="text-sm opacity-90">
                  This invitation was sent to <strong>{inviteDetails.email}</strong>, but you are currently logged in as <strong>{loggedInUser.email}</strong>.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 w-full bg-white border-amber-300 hover:bg-amber-100 text-amber-900"
                  onClick={() => navigate(`/login?inviteToken=${token}`)}
                >
                  Log in with correct account
                </Button>
              </div>
            </div>
          ) : isAuthenticated ? (
            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-center">
                <p className="text-sm text-muted-foreground mb-1">Accepting invitation as</p>
                <p className="font-bold text-foreground">{loggedInUser.email}</p>
              </div>
              <Button onClick={handleAccept} className="w-full h-11 text-base font-bold" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accepting...</>
                ) : (
                  "Accept Invitation"
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleAccept} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteDetails.email}
                  disabled
                  className="bg-muted/50 font-medium text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[10px] text-muted-foreground pl-1">Bound to invitation. Cannot be changed.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="h-11"
                />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-bold mt-2" disabled={submitting}>
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
                ) : (
                  "Create Account & Join"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        
        {(!error && !isAuthenticated) && (
          <CardFooter className="justify-center border-t p-4 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              Already have an account? <span className="text-primary font-bold hover:underline cursor-pointer" onClick={() => navigate(`/login?inviteToken=${token}`)}>Log In</span>
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default AcceptInvite;
