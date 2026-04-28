import { z } from "zod";

// COMMON
const email = z
  .string()
  .email("Invalid email format")
  .toLowerCase();

const password = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(50);

// LOGIN
export const loginSchema = z.object({
  email,
  password,
});

// SIGNUP
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50),

  email,
  password,

  phone: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format"),
});

// FORGOT PASSWORD
export const forgotPasswordSchema = z.object({
  email,
});

// RESET PASSWORD
export const resetPasswordSchema = z.object({
  newPassword: password,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});