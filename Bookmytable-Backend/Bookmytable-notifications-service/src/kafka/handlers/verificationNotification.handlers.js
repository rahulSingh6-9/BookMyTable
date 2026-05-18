/**
 * Handler for OTP and Verification notifications
 */

export const handlePhoneOTPNotification = async (event) => {
  const data = event.data || event.payload || event;
  const { phone, otp, purpose } = data;
  
  console.log(`\n📲 [SMS OTP] Dispatched to ${phone}`);
  console.log(`   OTP CODE: ${otp}`);
  console.log(`   PURPOSE : ${purpose || "Auth Verification"}\n`);
  
  return true;
};

export const handleEmailVerificationNotification = async (event) => {
  const data = event.data || event.payload || event;
  const { email, token, userId } = data;
  
  console.log(`\n📧 [Verification Email] Dispatched to ${email}`);
  console.log(`   TOKEN   : ${token}`);
  console.log(`   USER ID : ${userId}\n`);
  
  return true;
};

export const handlePasswordResetNotification = async (event) => {
  const data = event.data || event.payload || event;
  const { email, token } = data;
  
  console.log(`\n📧 [Password Reset Email] Dispatched to ${email}`);
  console.log(`   TOKEN   : ${token}\n`);
  
  return true;
};
