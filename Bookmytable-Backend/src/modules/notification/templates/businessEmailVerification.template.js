export const businessEmailVerificationTemplate = ({ email, verificationUrl }) => {
  return {
    subject: "Verify your BookMyTable Business Email",
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0;">BookMyTable</h1>
          <p style="color: #4b5563; font-size: 14px; margin-top: 4px;">Enterprise Onboarding Verification</p>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin-bottom: 24px;">
        
        <h2 style="color: #1f2937; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">Verify your business email address</h2>
        
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">
          Hello,
        </p>
        <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
          We received a request to verify the business contact email address for your restaurant branch onboarding: <strong>${email}</strong>.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; transition: background-color 0.2s;">
            Yes, It's Me
          </a>
        </div>
        
        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
          If the button above does not work, copy and paste this link directly into your browser:
        </p>
        <p style="color: #2563eb; font-size: 14px; word-break: break-all; margin-bottom: 24px;">
          ${verificationUrl}
        </p>
        
        <p style="color: #6b7280; font-size: 13px; line-height: 1.6;">
          This link is secure, single-use, and will automatically expire in 30 minutes. If you did not make this request, you can safely ignore this email.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 24px 0;">
        
        <div style="text-align: center;">
          <p style="font-size: 12px; color: #9ca3af; margin: 0;">
            &copy; 2026 BookMyTable Inc. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `Please verify your business email address by visiting this link: ${verificationUrl}`,
  };
};
