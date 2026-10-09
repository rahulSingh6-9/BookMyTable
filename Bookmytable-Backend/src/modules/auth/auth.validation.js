import Joi from "joi";

// COMMON
const email = Joi.string().email().required().lowercase().messages({
  "string.email": "Invalid email format",
  "any.required": "Email is required",
});

const password = Joi.string().min(6).max(50).required().messages({
  "string.min": "Password must be at least 6 characters",
  "any.required": "Password is required",
});

// LOGIN
export const loginSchema = Joi.object({
  email,
  password,
});

// SIGNUP
export const signupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.min": "Name must be at least 2 characters",
    "any.required": "Name is required",
  }),
  email,
  password,
  phone: Joi.string()
    .pattern(/^\+[1-9]\d{1,14}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid phone number format",
      "any.required": "Phone number is required",
    }),
});

// FORGOT PASSWORD
export const forgotPasswordSchema = Joi.object({
  email,
});

// RESET PASSWORD
export const resetPasswordSchema = Joi.object({
  newPassword: password,
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
});
