export const NOTIFICATION_TOPICS = {
  // Consumed notification/event topics
  SEND_EMAIL_NOTIFICATION: "notification.email.send",
  SEND_SMS_NOTIFICATION: "notification.sms.send",

  VERIFICATION_EMAIL_REQUESTED: "auth.email.verification.requested",
  PASSWORD_RESET_REQUESTED: "auth.password.reset.requested",
  PHONE_OTP_REQUESTED: "auth.phone.otp.requested",

  RESTAURANT_APPROVED: "restaurant.approved",
  RESTAURANT_REJECTED: "restaurant.rejected",
  RESTAURANT_SUSPENDED: "restaurant.suspended",
  
  STAFF_INVITED: "staff.invited",
  STAFF_JOINED: "staff.joined",
  INVITATION_FAILED: "invitation.failed",
  INVITATION_REVOKED: "invitation.revoked",
  RESTAURANT_UPDATED: "restaurant.updated",
  USER_UPDATED: "user.updated",
  BOOKING_CREATED: "booking.created",
  PAYMENT_SUCCESS: "payment.success",
};
