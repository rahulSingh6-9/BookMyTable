export const staffInviteTemplate = ({ 
  restaurantName, 
  brandName,
  branchName,
  role, 
  inviteLink,
  inviterName,
  logo,
  coverImage,
  expiresAt
}) => {
  const displayRestaurantName = brandName || restaurantName || "BookMyTable";
  const displayBranch = branchName && brandName && branchName !== brandName ? branchName : null;
  const displayRole = role ? role.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) : "Team Member";
  const displayInviter = inviterName || "A Team Member";
  
  let expiryText = "This invitation expires in 24 hours.";
  if (expiresAt) {
    const hours = Math.round((new Date(expiresAt) - new Date()) / (1000 * 60 * 60));
    if (hours > 0) expiryText = `This invitation expires in ${hours} hours.`;
  }

  const logoHtml = logo 
    ? `<img src="${logo}" alt="${displayRestaurantName} logo" style="max-height: 60px; margin-bottom: 20px; border-radius: 8px;">`
    : '';
    
  const coverHtml = coverImage
    ? `<img src="${coverImage}" alt="Cover" style="width: 100%; max-height: 150px; object-fit: cover; border-radius: 10px 10px 0 0; margin-bottom: 20px;">`
    : '';

  return {
    subject: `You're invited to join ${displayRestaurantName} as a ${displayRole}`,
    html: `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        ${coverHtml}
        <div style="padding: 30px;">
          <div style="text-align: center;">
            ${logoHtml}
            <h2 style="color: #111827; margin-top: 0; margin-bottom: 8px; font-size: 24px;">You're Invited!</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              <strong>${displayInviter}</strong> has invited you to join their team on BookMyTable.
            </p>
          </div>

          <div style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 35%;">Restaurant</td>
                <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600;">${displayRestaurantName}</td>
              </tr>
              ${displayBranch ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Branch</td>
                <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600;">${displayBranch}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Role</td>
                <td style="padding: 8px 0; color: #111827; font-size: 15px; font-weight: 600;">${displayRole}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${inviteLink}" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">Accept Invitation</a>
          </div>

          <div style="margin-bottom: 30px;">
            <p style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">If the button doesn't work, copy and paste this link:</p>
            <p style="color: #2563eb; font-size: 13px; word-break: break-all; margin: 0;">${inviteLink}</p>
          </div>

          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          
          <div style="text-align: center;">
            <p style="font-size: 13px; color: #ef4444; font-weight: 500; margin-bottom: 8px;">⏰ ${expiryText}</p>
            <p style="font-size: 12px; color: #9ca3af; line-height: 1.5; margin: 0;">
              If you were not expecting this invitation, you can safely ignore this email.<br>
              BookMyTable Inc.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `${displayInviter} has invited you to join ${displayRestaurantName} as a ${displayRole}.\n\nAccept here: ${inviteLink}\n\n${expiryText}`,
  };
};
