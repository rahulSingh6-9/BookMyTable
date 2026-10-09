export const branchPermanentlyDeletedTemplate = ({ restaurantName }) => {
  return {
    subject: `Critical: Branch permanently deleted: ${restaurantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #c0392b;">Branch Permanently Deleted</h2>
        <p>Hello,</p>
        <p>Your branch <strong>${restaurantName}</strong> has been permanently deleted from BookMyTable.</p>
        <p>All associated data, memberships, tables, and analytics for this branch have been permanently wiped from the system. This action cannot be undone.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa;">Team BookMyTable</p>
      </div>
    `,
    text: `Your branch ${restaurantName} has been permanently deleted.`,
  };
};
