import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Shield, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { invitationService } from "../services/invitation.service";
import api from "../lib/api";
import { useAdminAuth } from "../context/AuthContext";
import { toast } from "sonner";

const AdminAcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { admin, login } = useAdminAuth();

  const [status, setStatus] = useState("loading"); // loading, valid, invalid, success
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);
  
  // Auth state for new user
  const [authMode, setAuthMode] = useState("login"); // login, register
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setError("No invitation token provided.");
      return;
    }

    const validateToken = async () => {
      try {
        const res = await api.get(`/admin/invitations/token/${token}`);
        if (res.data.success) {
          setInviteData(res.data.data);
          setStatus("valid");
          setAuthForm(prev => ({ ...prev, email: res.data.data.email }));
        }
      } catch (err) {
        setStatus("invalid");
        setError(err?.response?.data?.message || "Invalid or expired invitation token.");
      }
    };

    validateToken();
  }, [token]);

  const handleAcceptInvite = async () => {
    try {
      setStatus("loading");
      await api.post("/admin/invitations/accept", { token });
      setStatus("success");
      toast.success("Invitation accepted successfully!");
      setTimeout(() => {
        if (inviteData?.role === "RESTAURANT_APPROVAL_MANAGER") {
          navigate("/admin/restaurants");
        } else if (inviteData?.role === "CONTENT_MODERATOR") {
          navigate("/admin/reviews");
        } else if (inviteData?.role === "FINANCE_ADMIN") {
          navigate("/admin/payments");
        } else {
          navigate("/admin");
        }
      }, 2000);
    } catch (err) {
      setStatus("valid");
      toast.error(err?.response?.data?.message || "Failed to accept invitation");
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      if (authMode === "login") {
        const res = await api.post("/auth/login/web", {
          email: authForm.email,
          password: authForm.password,
        });
        
        localStorage.setItem("admin_token", res.data.data.token);
        // Call accept invite now that we have a basic token
        await handleAcceptInvite();
        
      } else {
        // Assume auth service register endpoint
        const res = await api.post("/auth/signup", {
          email: authForm.email,
          password: authForm.password,
          name: `${authForm.firstName} ${authForm.lastName}`.trim(),
          phone: "0000000000", // Required by backend validator
        });
        
        localStorage.setItem("admin_token", res.data.data.token);
        // Call accept invite now that we have a basic token
        await handleAcceptInvite();
      }
    } catch (err) {
      setStatus("valid");
      toast.error(err?.response?.data?.message || "Authentication failed.");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Processing invitation...</p>
        </div>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to the Team!</h2>
          <p className="text-gray-500 mb-6">Your admin account is now ready.</p>
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-400 mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">BookMyTable</h1>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Accept Admin Invitation</h2>
          <p className="text-gray-500 text-sm">
            You've been invited by <span className="font-semibold text-gray-900">{inviteData?.invitedBy}</span> to join as a <span className="font-semibold text-blue-600">{inviteData?.role?.replace(/_/g, " ")}</span>.
          </p>
        </div>

        {admin ? (
          // Logged in user matches invite email or can just accept
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-800 text-center">
                You are currently logged in as <strong>{admin.email}</strong>.
              </p>
            </div>
            <button
              onClick={handleAcceptInvite}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              Accept Invitation <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${authMode === "login" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setAuthMode("login")}
              >
                Login
              </button>
              <button
                type="button"
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${authMode === "register" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setAuthMode("register")}
              >
                Create Account
              </button>
            </div>

            {authMode === "register" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.firstName}
                    onChange={(e) => setAuthForm({ ...authForm, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={authForm.lastName}
                    onChange={(e) => setAuthForm({ ...authForm, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                disabled
                value={authForm.email}
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg outline-none cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              {authMode === "login" ? "Login & Accept" : "Register & Accept"} <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminAcceptInvite;
