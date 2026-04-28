import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Save, Trash2, Camera } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

//api
import { changePassword, updateProfile } from "@/services/user.service";

//validation Schemas
import { profileSchema, passwordSchema } from "../../validation/userProfile.schema.js";


export default function ProfileAccountSettings() {
  const { user, setUser } = useAuth();

  const initialName = useMemo(() => user?.name, [user?.name]);
  const initialEmail = useMemo(() => user?.email, [user?.email]);
  const initialPhone = useMemo(() => user?.phone || "+1 (555) 010-1234", [user?.phone]);
  const initialAvatar = useMemo(() => user?.avatar || user?.profileImage || null, [user]);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initialAvatar);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  //Forms
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      userName: user?.name || "",
      userEmail: user?.email || "",
      userPhone: user?.phone || ""
      // userAvatar: user?.avatar || ""
    }
  })

  const [prefNotifications, setPrefNotifications] = useState(true);
  const [prefEmailUpdates, setPrefEmailUpdates] = useState(false);

  // 🔥 UPDATED FUNCTION
  const handleSaveProfile = async (data) => {
    if (!data.userName.trim()) return toast.error("Name is required");

    try {
      let payload;


      if (photoFile) {
        payload = new FormData();
        payload.append("name", data.userName);
        payload.append("phone", data.userPhone);
        payload.append("avatar", photoFile);

      } else {
        payload = {
          name: data.userName,
          phone: data.userPhone,
        };
      }

      const res = await updateProfile(payload)

      const updatedUser = res.data.data;

      // 🔥 update context
      setUser(updatedUser);

      // 🔥 sync preview and clear file
      setPhotoPreview(updatedUser.avatar || updatedUser.profileImage || null);
      setPhotoFile(null);

      // 🔥 update localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully");

    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };


  const handleChangePassword = async (data) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      passwordForm.reset();
      toast.success("Password updated successfully");

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    }
  };

  const handleSavePreferences = () => {
    toast.success("Preferences saved (mock)");
  };

  const handleDeleteAccount = () => {
    toast.success("Account deletion requested (mock)");
  };

  return (
    <div className="p-4 lg:p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Info */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Profile info</CardTitle>
              <CardDescription>Keep your account details up to date.</CardDescription>
            </CardHeader>
            <CardContent >
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="grid gap-6">
                  {/* Avatar Upload Section */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group">
                      <Avatar className="h-20 w-20 border shadow-sm">
                        <AvatarImage src={photoPreview || ""} className="object-cover" />
                        <AvatarFallback className="text-2xl">{user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="photo-upload"
                        className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                      >
                        <Camera className="h-6 w-6" />
                      </label>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="font-medium text-sm">Profile Photo</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a new avatar. Recommended size: 400x400.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <FormField
                        control={profileForm.control}
                        name="userName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <FormField
                        control={profileForm.control}
                        name="userEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="example@gmail.com" readOnly disabled {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid gap-2">
                      <FormField
                        control={profileForm.control}
                        name="userPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="Phone Number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="gap-2" disabled={profileForm.formState.isSubmitting}>
                      <Save className="h-4 w-4" />
                      {profileForm.formState.isSubmitting ? "Updating..." : "Save changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Use a strong password to protect your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(handleChangePassword)} className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Current password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm new password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end mt-2">
                    <Button type="submit" variant="outline" disabled={passwordForm.formState.isSubmitting}>
                      {passwordForm.formState.isSubmitting ? "Updating..." : "Update password"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Control how we communicate with you.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <div className="font-medium text-card-foreground">Notifications</div>
                  <div className="text-sm text-muted-foreground">Booking updates and important alerts.</div>
                </div>
                <Switch checked={prefNotifications} onCheckedChange={setPrefNotifications} />
              </div>

              <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <div className="font-medium text-card-foreground">Email updates</div>
                  <div className="text-sm text-muted-foreground">Product news and occasional offers.</div>
                </div>
                <Switch checked={prefEmailUpdates} onCheckedChange={setPrefEmailUpdates} />
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={handleSavePreferences}>
                  Save preferences
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="shadow-card border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>This action is permanent. Please be careful.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground">Delete account</div>
                    <div className="text-sm text-muted-foreground">
                      This will delete your profile data and booking history after confirmation.
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This is a mock UI. In production this would permanently remove your account and data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>Confirm delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

