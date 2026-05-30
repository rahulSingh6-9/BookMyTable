export const USER_TOPICS = {
  // Commands from Admin (Consumed)
  USER_ADMIN_COMMAND: "user.admin.command",

  // Events from Auth Service (Consumed)
  AUTH_USER_REGISTERED: "auth.user.registered",

  // User events (Produced)
  USER_UPDATED: "user.updated",
  
  // Verification events (Produced)
  PHONE_OTP_REQUESTED: "auth.phone.otp.requested",
  VERIFICATION_EMAIL_REQUESTED: "auth.email.verification.requested",
};
