import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Heart,
  ShieldAlert,
  MapPin,
  Users,
  Save,
  Plus,
  Trash2,
  CheckCircle,
  Info,
  Camera,
  Award,
  Calendar,
  Check,
  AlertCircle,
  Loader2,
  PhoneCall,
  Mail,
  Flame
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateProfile, uploadAvatar } from "@/services/user.service";

export default function CustomerPreferences() {
  const { user, setUser } = useAuth();
  const fileInputRef = useRef(null);

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Form Fields (initialized with user properties)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Cuisine Interests tags
  const [cuisines, setCuisines] = useState([
    { name: "Japanese", selected: true },
    { name: "Italian", selected: true },
    { name: "French", selected: false },
    { name: "Indian", selected: true },
    { name: "Steakhouse", selected: true },
    { name: "Mexican", selected: false },
    { name: "Thai", selected: false },
    { name: "Chinese", selected: false }
  ]);

  // Allergies & Dietary requirements
  const [dietary, setDietary] = useState([
    { name: "Peanuts", selected: false },
    { name: "Dairy / Lactose", selected: false },
    { name: "Gluten Free", selected: true },
    { name: "Shellfish", selected: false },
    { name: "Vegetarian", selected: false },
    { name: "Halal", selected: false },
    { name: "Vegan", selected: false }
  ]);

  // Saved locations list
  const [addresses, setAddresses] = useState([
    { id: "add1", label: "Home Base", address: "12, High Street, Bandra West, Mumbai 400050" },
    { id: "add2", label: "Corporate Office", address: "Naman Centre, BKC, Bandra East, Mumbai 400051" }
  ]);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");

  // Family Profiles guest list
  const [guests, setGuests] = useState([
    { id: "g1", name: "Pooja Singh", role: "Spouse", notes: "No onions" },
    { id: "g2", name: "Rohan Sen", role: "Friend", notes: "Lactose intolerant" }
  ]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestRole, setNewGuestRole] = useState("Friend");
  const [newGuestNotes, setNewGuestNotes] = useState("");

  // Sync state with loaded user
  useEffect(() => {
    if (user) {
      setFullName(user.profile?.fullName || user.name || "");
      setPhone(user.phone?.number || (typeof user.phone === "string" ? user.phone : ""));
    }
  }, [user]);

  // Toggle Cuisines
  const toggleCuisine = (name) => {
    setCuisines(prev => 
      prev.map(c => c.name === name ? { ...c, selected: !c.selected } : c)
    );
  };

  // Toggle Dietary
  const toggleDietary = (name) => {
    setDietary(prev => 
      prev.map(d => d.name === name ? { ...d, selected: !d.selected } : d)
    );
  };

  // Add Address
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (!newLabel || !newAddress) return;
    setAddresses(prev => [...prev, { id: Date.now().toString(), label: newLabel, address: newAddress }]);
    setNewLabel("");
    setNewAddress("");
    toast.success("Delivery address saved successfully");
  };

  // Delete Address
  const handleDeleteAddress = (id) => {
    setAddresses(prev => prev.filter(a => a.id !== id));
    toast.success("Address removed");
  };

  // Add Guest
  const handleAddGuest = (e) => {
    e.preventDefault();
    if (!newGuestName) return;
    setGuests(prev => [
      ...prev,
      { id: Date.now().toString(), name: newGuestName, role: newGuestRole, notes: newGuestNotes }
    ]);
    setNewGuestName("");
    setNewGuestNotes("");
    toast.success("Guest profile linked successfully");
  };

  // Delete Guest
  const handleDeleteGuest = (id) => {
    setGuests(prev => prev.filter(g => g.id !== id));
    toast.success("Guest profile removed");
  };

  // Avatar Upload
  const triggerAvatarUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await uploadAvatar(formData);
      
      if (res.data?.success) {
        // Update user state globally
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profile avatar updated successfully!");
      }
    } catch (err) {
      console.error("Avatar Upload Error:", err);
      toast.error(err.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Save Partial Text Details (PATCH)
  const handleSaveChanges = async () => {
    const currentFullName = user.profile?.fullName || user.name || "";

    const patchData = {};
    if (fullName.trim() !== currentFullName) {
      patchData.fullName = fullName.trim();
    }

    if (Object.keys(patchData).length === 0) {
      toast.info("No modifications detected in profile fields");
      return;
    }

    try {
      setIsSaving(true);
      const res = await updateProfile(patchData);

      if (res.data?.success) {
        const updatedUser = res.data.data;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Personal identity credentials updated successfully");
      }
    } catch (err) {
      console.error("Profile Save Error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile details");
    } finally {
      setIsSaving(false);
    }
  };

  // Get Initials for Avatar Fallback
  const getInitials = () => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Date formatted "Member since Month Year"
  const memberSinceDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "May 2026";

  // Dynamic style parameters matching loyalty tiers
  const getLoyaltyTheme = (tier) => {
    switch (tier) {
      case "Platinum":
        return {
          bg: "bg-gradient-to-br from-violet-600 to-indigo-700",
          badgeBg: "bg-violet-500/20 text-violet-300 border-violet-500/30",
          text: "text-violet-400",
          glow: "shadow-violet-500/10",
        };
      case "Gold":
        return {
          bg: "bg-gradient-to-br from-amber-500 to-orange-600",
          badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          text: "text-amber-400",
          glow: "shadow-amber-500/10",
        };
      case "Silver":
        return {
          bg: "bg-gradient-to-br from-slate-400 to-slate-600",
          badgeBg: "bg-slate-500/20 text-slate-300 border-slate-500/30",
          text: "text-slate-400",
          glow: "shadow-slate-500/10",
        };
      default: // Bronze
        return {
          bg: "bg-gradient-to-br from-amber-700 to-amber-900",
          badgeBg: "bg-amber-700/20 text-amber-300 border-amber-700/30",
          text: "text-amber-500",
          glow: "shadow-amber-900/10",
        };
    }
  };

  const loyaltyTheme = getLoyaltyTheme(user?.loyalty?.tier || "Bronze");

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-8 pb-12">
      
      {/* Invisible Avatar File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAvatarChange}
        className="hidden"
        accept="image/*"
      />

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Profile & Preferences
          </h1>
          <p className="text-xs md:text-sm text-slate-500">Configure personal dining habits, allergen details, and linked guest files</p>
        </div>

        <Button 
          size="sm" 
          disabled={isSaving}
          className="bg-primary hover:bg-primary/95 text-white rounded-xl gap-1.5 shadow-md shadow-primary/10 transition-all duration-200" 
          onClick={handleSaveChanges}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* THREE COLUMN GRID */}
      <div className="grid gap-8 lg:grid-cols-12">
        
        {/* COLUMN 1: PREMIUM CUSTOMER IDENTITY PROFILE CARD (4/12 width) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Card */}
          <Card className="bg-slate-950 border-slate-900 text-white shadow-xl overflow-hidden rounded-3xl relative group">
            {/* Background Decorative Accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <CardContent className="pt-8 pb-6 flex flex-col items-center text-center relative z-10">
              
              {/* Dynamic Loyalty Badge (Floating) */}
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className={`font-black tracking-wider text-[9px] uppercase px-2 py-0.5 rounded-full border ${loyaltyTheme.badgeBg}`}>
                  {user?.loyalty?.tier || "Bronze"} Tier
                </Badge>
              </div>

              {/* Avatar Editor Container */}
              <div className="relative mb-4 group cursor-pointer" onClick={triggerAvatarUpload}>
                <div className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-tr from-primary to-orange-500 shadow-md">
                  <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 flex items-center justify-center relative">
                    {isUploadingAvatar ? (
                      <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center z-10">
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      </div>
                    ) : null}

                    {user?.profile?.avatar || user?.avatar ? (
                      <img 
                        src={user.profile?.avatar || user.avatar} 
                        alt={fullName}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-2xl font-black tracking-wider text-slate-300">
                        {getInitials()}
                      </span>
                    )}

                    {/* Camera Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-1 z-20">
                      <Camera className="h-5 w-5 text-white animate-pulse" />
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Change</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Metadata */}
              <div className="space-y-1 mt-1">
                <h3 className="font-extrabold text-lg text-slate-100 flex items-center justify-center gap-1">
                  {fullName || "Rahul Singh"}
                  {user?.verification?.emailVerified && user?.verification?.phoneVerified ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-500/10 shrink-0" />
                  ) : null}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block">
                  Customer Account Workspace
                </span>
              </div>

              {/* Member Since badge */}
              <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-slate-400 border border-slate-900 bg-slate-900/40 rounded-xl px-2.5 py-1">
                <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Member since {memberSinceDate}</span>
              </div>

              {/* Dynamic Live Statistics Board */}
              <div className="grid grid-cols-2 gap-3 w-full mt-6 border-t border-slate-900 pt-6">
                
                {/* Bookings Stats */}
                <div className="bg-slate-900/50 border border-slate-900/80 rounded-2xl p-3 flex flex-col items-center text-center">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary mb-1">
                    <Flame className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Reservations</span>
                  <span className="text-base font-black text-slate-100 mt-0.5">
                    {user?.statistics?.totalBookings || 0}
                  </span>
                </div>

                {/* Reward Points */}
                <div className="bg-slate-900/50 border border-slate-900/80 rounded-2xl p-3 flex flex-col items-center text-center">
                  <div className={`p-1.5 rounded-lg bg-orange-500/10 ${loyaltyTheme.text} mb-1`}>
                    <Award className="h-4 w-4" />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Reward Points</span>
                  <span className="text-base font-black text-slate-100 mt-0.5">
                    {user?.loyalty?.rewardPoints || 0} pts
                  </span>
                </div>

              </div>

            </CardContent>
          </Card>

          {/* Real Customer Verification Badges */}
          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-black text-slate-950 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-slate-400" />
                Security Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              
              {/* Email Verification Status */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="font-extrabold text-slate-900 block leading-none">Email Address</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{user?.email || "No email bound"}</span>
                  </div>
                </div>
                {user?.verification?.emailVerified ? (
                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl gap-1 text-[9px] font-bold hover:bg-emerald-50 px-2 py-0.5">
                    <Check className="h-3 w-3" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 bg-amber-50/50 border-amber-100 text-[9px] font-bold rounded-xl gap-0.5 px-2 py-0.5 cursor-pointer hover:bg-amber-100/50">
                    <AlertCircle className="h-3 w-3" /> Pending
                  </Badge>
                )}
              </div>

               {/* Phone Verification Status */}
              <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/50 text-xs">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="font-extrabold text-slate-900 block leading-none">Phone Verification</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{phone || "No phone bound"}</span>
                  </div>
                </div>
                {user?.verification?.phoneVerified ? (
                  <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl gap-1 text-[9px] font-bold hover:bg-emerald-50 px-2 py-0.5">
                    <Check className="h-3 w-3" /> Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 bg-amber-50/50 border-amber-100 text-[9px] font-bold rounded-xl gap-0.5 px-2 py-0.5 cursor-pointer hover:bg-amber-100/50">
                    <AlertCircle className="h-3 w-3" /> Pending
                  </Badge>
                )}
              </div>

              {/* Secure Settings Workspace Redirect CTAs */}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link to="/profile/settings/contact-verification" className="w-full">
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 h-9">
                    Manage Contact & Verification
                  </Button>
                </Link>
                <Link to="/profile/settings/update-password" className="w-full">
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 h-9">
                    Security Settings
                  </Button>
                </Link>
              </div>

            </CardContent>
          </Card>

        </div>

        {/* COLUMN 2 & 3: FORM WORKSPACE (8/12 width) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Account details modification */}
          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Personal Information
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">Manage personal identity details strictly pushed to restaurant billing tickets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="border-slate-200 rounded-xl focus-visible:ring-primary text-xs h-10 w-full"
                  />
                </div>

                {/* Contact Phone (Strictly Read-Only/Disabled for Security) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                  <Input
                    type="text"
                    disabled
                    value={phone || "No phone registered"}
                    className="border-slate-100 bg-slate-50 text-slate-500 rounded-xl text-xs h-10 w-full cursor-not-allowed"
                  />
                </div>

              </div>

              {/* Registered Email */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registered Email</span>
                <Input
                  type="email"
                  disabled
                  value={user?.email || "rahulsingh@example.com"}
                  className="border-slate-100 bg-slate-50 text-slate-500 rounded-xl text-xs h-10 w-full cursor-not-allowed"
                />
              </div>

            </CardContent>
          </Card>

          {/* Cuisine Interests Selector */}
          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                <Heart className="h-4 w-4 text-slate-400" />
                Favorite Cuisines
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">Used to rank trending search indexes and recommendations dynamically</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {cuisines.map((cuisine) => (
                  <button
                    key={cuisine.name}
                    onClick={() => toggleCuisine(cuisine.name)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 select-none ${
                      cuisine.selected
                        ? "bg-primary/5 border-primary/20 text-primary font-extrabold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cuisine.name}</span>
                    {cuisine.selected && <CheckCircle className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies & Dietary requirements */}
          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-slate-400" />
                Dietary & Allergens
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">Transmitted automatically to kitchen staff for dining protection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {dietary.map((allergy) => (
                  <button
                    key={allergy.name}
                    onClick={() => toggleDietary(allergy.name)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition flex items-center gap-1.5 select-none ${
                      allergy.selected
                        ? "bg-primary/5 border-primary/20 text-primary font-extrabold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{allergy.name}</span>
                    {allergy.selected && <CheckCircle className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
              </div>

              <div className="flex gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 leading-normal">
                <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Allergen flags are securely shared with host stands at check-in so kitchen chefs can bypass selected materials safely during course preparation.</span>
              </div>
            </CardContent>
          </Card>

          {/* Saved Addresses list */}
          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                Saved Addresses
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">Used for ordering home drop caterings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {addresses.map((add) => (
                  <div key={add.id} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-start gap-4 text-xs font-semibold text-slate-700">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-extrabold text-primary block">{add.label}</span>
                      <p className="text-slate-600 leading-relaxed font-medium">{add.address}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteAddress(add.id)}
                      className="h-7 w-7 text-slate-400 hover:text-primary rounded-full shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddAddress} className="space-y-2 border-t border-slate-50 pt-3 flex flex-col gap-2">
                <Input
                  type="text"
                  placeholder="Address Label (e.g. Office)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="h-9 text-xs border-slate-200 rounded-lg"
                />
                <Input
                  type="text"
                  placeholder="Detailed street, city, country..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="h-9 text-xs border-slate-200 rounded-lg"
                />
                <Button type="submit" size="sm" variant="outline" className="w-full h-9 rounded-lg gap-1 border-slate-200 text-slate-600 text-xs font-bold">
                  <Plus className="h-4.5 w-4.5" /> Save Location
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Household Guest Profiles */}
          <Card className="bg-white border-slate-100 shadow-sm rounded-3xl">
            <CardHeader>
              <CardTitle className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-400" />
                Linked Guests
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs">Rapidity selection of household seats during checkout reservations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {guests.map((g) => (
                  <div key={g.id} className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-between items-center gap-4 text-xs font-semibold text-slate-700">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-slate-900">{g.name}</span>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-[8px] font-bold px-1 py-0">{g.role}</Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">Pref: {g.notes || "None"}</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteGuest(g.id)}
                      className="h-7 w-7 text-slate-400 hover:text-primary rounded-full shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddGuest} className="space-y-2 border-t border-slate-50 pt-3 flex flex-col gap-2">
                <Input
                  type="text"
                  placeholder="Guest Full Name"
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="h-9 text-xs border-slate-200 rounded-lg"
                />
                <select
                  value={newGuestRole}
                  onChange={(e) => setNewGuestRole(e.target.value)}
                  className="h-9 border border-slate-200 bg-white text-xs font-bold text-slate-700 rounded-lg px-2 outline-none cursor-pointer w-full"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Friend">Friend</option>
                  <option value="Family">Family Member</option>
                  <option value="Colleague">Colleague</option>
                </select>
                <Input
                  type="text"
                  placeholder="Dietary Notes (e.g. Vegetarian)"
                  value={newGuestNotes}
                  onChange={(e) => setNewGuestNotes(e.target.value)}
                  className="h-9 text-xs border-slate-200 rounded-lg"
                />
                <Button type="submit" size="sm" variant="outline" className="w-full h-9 rounded-lg gap-1 border-slate-200 text-slate-600 text-xs font-bold">
                  <Plus className="h-4.5 w-4.5" /> Link Guest File
                </Button>
              </form>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
