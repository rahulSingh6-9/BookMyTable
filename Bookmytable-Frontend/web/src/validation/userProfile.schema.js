import { z } from "zod";

export const profileSchema = z.object({
  userName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50),
  userEmail: z.string()
    .email("Invalid email format")
    .toLowerCase(),
  userPhone: z.string()
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must not exceed 15 digits")
    .regex(/^\+?\d+$/, "Phone number must contain only digits"),
})

export const passwordSchema = z.object({
  currentPassword: z.string()
    .min(1, "Current password is required"),
  newPassword: z.string()
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});