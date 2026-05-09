export const staffInviteTemplate = ({ restaurantName, role, inviteLink }) => {
  return {
    subject: `Invitation to join ${restaurantName || "BookMyTable"}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333;">You're Invited!</h2>
        <p>Hello,</p>
        <p>You have been invited to join <strong>${restaurantName || "our restaurant"}</strong> as a <strong>${role}</strong> on BookMyTable.</p>
        <div style="margin: 30px 0;">
          <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
        </div>
        <p style="color: #777; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #007bff; font-size: 14px; word-break: break-all;">${inviteLink}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa;">This invitation will expire in 24 hours.</p>
      </div>
    `,
    text: `You have been invited to join ${restaurantName} as a ${role}. Accept here: ${inviteLink}`,
  };
};
