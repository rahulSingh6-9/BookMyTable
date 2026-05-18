export const restaurantWelcomeTemplate = ({ ownerName, restaurantName, dashboardUrl }) => {
  return {
    subject: `Welcome to BookMyTable, ${restaurantName}!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">BookMyTable</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Your Enterprise Partner in Fine Dining & Reservations</p>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 25px;">
        
        <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 15px;">Welcome Aboard! 🍾</h2>
        <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 10px;">Hello ${ownerName || "Restaurant Partner"},</p>
        <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We are absolutely thrilled to welcome <strong>${restaurantName}</strong> to the BookMyTable family! Your digital onboarding is successfully complete, and your restaurant profile has been submitted to the admin team for quick activation review.
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 15px; border-radius: 4px; margin: 25px 0;">
          <h4 style="color: #0f172a; margin: 0 0 5px 0; font-size: 14px; font-weight: 600;">What Happens Next?</h4>
          <p style="color: #475569; margin: 0; font-size: 13px; line-height: 1.5;">
            Our administrators are currently reviewing your branch details, operating hours, and dining layouts. You will receive an automated email notification as soon as your branch is approved and live!
          </p>
        </div>

        <p style="color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
          In the meantime, you can access your merchant partner dashboard using the link below to configure your slots, staff details, and explore your premium tools.
        </p>

        <div style="text-align: center; margin: 35px 0;">
          <a href="${dashboardUrl || "#"}" style="background-color: #4f46e5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);">Access Merchant Dashboard</a>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;">
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5; margin: 0;">
          Thank you for choosing BookMyTable.<br>
          This is an automated operational notification. Please do not reply directly to this email.
        </p>
      </div>
    `,
    text: `Welcome to BookMyTable! Your restaurant "${restaurantName}" is successfully registered. Access your dashboard at: ${dashboardUrl}`,
  };
};
