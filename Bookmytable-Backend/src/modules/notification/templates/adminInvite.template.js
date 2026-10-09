export const adminInviteTemplate = ({ 
  role, 
  inviteLink,
  inviterName,
  customPermissions = [],
  expiresAt
}) => {
  const displayRole = role ? role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Platform Admin";
  const displayInviter = inviterName || "A BookMyTable Administrator";
  
  let expiryText = "This invitation expires in 24 hours.";
  if (expiresAt) {
    const hours = Math.round((new Date(expiresAt) - new Date()) / (1000 * 60 * 60));
    if (hours > 0) expiryText = `This invitation expires in ${hours} hours.`;
  }

  const permissionsList = customPermissions.length > 0 
    ? `
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-size: 14px; vertical-align: top;">Additional Permissions</td>
        <td style="padding: 8px 0; color: #111827; font-size: 14px; font-weight: 500;">
          <ul style="margin: 0; padding-left: 20px;">
            ${customPermissions.map(p => `<li>${p}</li>`).join('')}
          </ul>
        </td>
      </tr>
    ` : '';

  return {
    subject: `You are invited to join BookMyTable as a ${displayRole}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #111827; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; tracking: -0.5px;">BookMyTable</h1>
        </div>
        <div style="padding: 30px;">
          <div style="text-align: center;">
            <h2 style="color: #111827; margin-top: 0; margin-bottom: 8px; font-size: 24px;">Admin Invitation</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              <strong>${displayInviter}</strong> has invited you to join the BookMyTable core administrative team.
            </p>
          </div>

          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 35%;">Assigned Role</td>
                <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600;">${displayRole}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Invited By</td>
                <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600;">${displayInviter}</td>
              </tr>
              ${permissionsList}
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Accept Invitation</a>
          </div>

          <div style="margin-bottom: 30px;">
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="color: #2563eb; font-size: 13px; word-break: break-all; margin: 0;">${inviteLink}</p>
          </div>

          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          
          <div style="text-align: center;">
            <p style="font-size: 13px; color: #ef4444; font-weight: 500; margin-bottom: 8px;">⏰ ${expiryText}</p>
            <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin: 0;">
              If you were not expecting this invitation, please disregard this email.<br>
              BookMyTable Inc. Administrative Systems
            </p>
          </div>
        </div>
      </div>
    `,
    text: `You have been invited by ${displayInviter} to join BookMyTable as a ${displayRole}.\n\nAccept here: ${inviteLink}\n\n${expiryText}`,
  };
};
