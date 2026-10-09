export const planLimitReachedTemplate = ({ limitVal, currentCount }) => {
  return {
    subject: `Plan Limit Reached: Branch Creation Blocked`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #e67e22;">Action Required: Upgrade Plan</h2>
        <p>Hello,</p>
        <p>A recent attempt to create a new branch was blocked because your brand has reached its subscription limit.</p>
        <p>Your current plan allows a maximum of <strong>${limitVal} branches</strong>, and you currently have ${currentCount} active branches.</p>
        <p>Please upgrade your subscription plan to unlock unlimited growth and add more branches to your brand.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.WEB_URL || "#"}/admin/subscriptions" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Upgrade Subscription</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa;">Team BookMyTable</p>
      </div>
    `,
    text: `Branch creation blocked. Your plan allows a maximum of ${limitVal} branches. Please upgrade your subscription.`,
  };
};
