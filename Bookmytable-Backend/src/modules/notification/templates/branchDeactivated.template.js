export const branchDeactivatedTemplate = ({ restaurantName }) => {
  return {
    subject: `Your branch has been deactivated: ${restaurantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #f39c12;">Branch Deactivated</h2>
        <p>Hello,</p>
        <p>This is a notification that your branch <strong>${restaurantName}</strong> has been successfully deactivated.</p>
        <p>The branch is now hidden from customers, but its data is securely retained. You can restore operations whenever you are ready.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.WEB_URL || "#"}/brand" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Brand Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa;">Team BookMyTable</p>
      </div>
    `,
    text: `Your branch ${restaurantName} has been deactivated.`,
  };
};
