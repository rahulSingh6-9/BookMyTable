import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Camera, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ProfileSettings() {
  const { user, setUser, logout } = useAuth();
  
  // Profile Tab State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    bookingConfirmations: true,
    bookingReminders: true,
    promotionalOffers: true,
    reviewResponses: true,
  });

  // Load user data on mount or when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  // Handle Profile Update
  const handleProfileUpdate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setProfileLoading(true);
    try {
      const payload = {
        name,
        phone,
      };
      
      console.log("📤 Sending profile update:", payload);
      
      const response = await api.put("/users/me", payload);

      console.log("✅ Profile update response:", response.data);

      const updatedUser = response.data.data;
      setUser(updatedUser);
      
      // 🔥 Update localStorage with new user data
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("❌ Profile update error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle Password Update
  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
      console.error("Password update error:", error);
    } finally {
      setPasswordLoading(false);
    }
  };

  //Logout
  const navigate = useNavigate();

 const handleLogout = () => {

  logout();
  navigate("/login");
};

  // Handle Notification Preferences
  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNotificationSave = async () => {
    try {
      // TODO: Add notification preferences API endpoint when backend is ready
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto max-w-3xl px-4 py-8 lg:px-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto max-w-3xl px-4 py-8 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Profile & Settings</h1>
          <p className="mb-6 text-muted-foreground">Manage your account and preferences</p>

          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt={name} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                      <Camera className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">{name}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">Full Name</label>
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">Email</label>
                    <Input 
                      type="email" 
                      value={email} 
                      disabled 
                      className="bg-muted cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-card-foreground">Phone</label>
                    <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleProfileUpdate} 
                  disabled={profileLoading}
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />Logout</Button>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">Current Password</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">New Password</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-card-foreground">Confirm Password</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handlePasswordUpdate}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="rounded-lg border border-border bg-card p-6 shadow-card space-y-4">
                {[
                  { key: "bookingConfirmations", label: "Booking confirmations" },
                  { key: "bookingReminders", label: "Booking reminders" },
                  { key: "promotionalOffers", label: "Promotional offers" },
                  { key: "reviewResponses", label: "Review responses" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-sm text-card-foreground">{label}</span>
                    <input 
                      type="checkbox" 
                      checked={notifications[key]}
                      onChange={() => handleNotificationChange(key)}
                      className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                    />
                  </div>
                ))}
                <Button onClick={handleNotificationSave}>Save Preferences</Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
