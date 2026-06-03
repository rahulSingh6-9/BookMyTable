export const branchSoftDeletedTemplate = ({ restaurantName }) => {
  return {
    subject: `Branch moved to trash: ${restaurantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #e74c3c;">Branch Deleted</h2>
        <p>Hello,</p>
        <p>Your branch <strong>${restaurantName}</strong> has been deleted and moved to the trash.</p>
        <p>It is no longer accessible to customers or staff. If this was a mistake, you can restore it from your brand dashboard within the retention period.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.WEB_URL || "#"}/brand" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Brand Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa;">Team BookMyTable</p>
      </div>
    `,
    text: `Your branch ${restaurantName} has been moved to the trash.`,
  };
};
