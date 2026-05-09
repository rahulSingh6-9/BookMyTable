export const restaurantApprovedTemplate = ({ restaurantName, status }) => {
  const isApproved = status === "approved";
  const title = isApproved ? "Congratulations!" : "Restaurant Status Update";
  const message = isApproved 
    ? `Your restaurant <strong>${restaurantName}</strong> has been approved and is now live on BookMyTable.`
    : `Your restaurant <strong>${restaurantName}</strong> status has been updated to: <strong>${status}</strong>.`;

  return {
    subject: `Update regarding your restaurant: ${restaurantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: ${isApproved ? "#28a745" : "#333"};">${title}</h2>
        <p>Hello,</p>
        <p>${message}</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.WEB_URL || "#"}/owner/dashboard" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa;">Team BookMyTable</p>
      </div>
    `,
    text: `Update regarding your restaurant ${restaurantName}: ${status}`,
  };
};
