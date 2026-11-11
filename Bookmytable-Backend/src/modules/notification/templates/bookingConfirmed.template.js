export const bookingConfirmedTemplate = (data = {}) => {
  const {
    restaurantName = "Our Restaurant",
    branchLocation = "",
    date = data.bookingDate || "N/A",
    time = data.timeSlot || "N/A",
    guests = data.guestCount || data.partySize || 2,
    bookingId = data._id || data.id || "BMT-CONFIRMED",
    tableName = data.tableNumber || "Reserved",
    sectionLabel = "",
    amount = data.grandTotal != null ? `₹${data.grandTotal}` : "",
    paymentStatus = "Paid",
    customerName = "Valued Guest",
  } = data;

  return {
    subject: `Booking Confirmed: ${restaurantName} (${date})`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background-color: #ecfdf5; border: 2px solid #a7f3d0; border-radius: 50%; padding: 12px; margin-bottom: 12px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 style="color: #059669; font-size: 24px; font-weight: 800; margin: 0 0 6px 0;">Booking Confirmed!</h1>
          <p style="color: #64748b; font-size: 14px; margin: 0;">Hello ${customerName}, your table is reserved and confirmed.</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <h2 style="font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
            ${restaurantName} ${branchLocation ? `<span style="font-size: 14px; font-weight: 500; color: #64748b;">· ${branchLocation}</span>` : ""}
          </h2>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 40%;">Date</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${date}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Time</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${time}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Guests</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${guests} Guests</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Table / Section</td>
              <td style="padding: 6px 0; font-weight: 600; color: #0f172a;">
                ${tableName} ${sectionLabel ? `<span style="color: #64748b; font-weight: 400;">(${sectionLabel})</span>` : ""}
              </td>
            </tr>
            ${amount ? `
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Amount Paid</td>
              <td style="padding: 6px 0; font-weight: 700; color: #059669;">${amount} (${paymentStatus})</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Booking ID</td>
              <td style="padding: 6px 0; font-family: monospace; font-weight: 700; color: #334155;">${bookingId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Status</td>
              <td style="padding: 6px 0; font-weight: 700; color: #059669;">CONFIRMED</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff1f2; border: 1px dashed #f43f5e; border-radius: 12px; padding: 16px; margin-bottom: 24px; text-align: center;">
          <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: 600; color: #9f1239;">
            📲 Present your Booking QR Code upon arrival at the restaurant for instant check-in.
          </p>
          <a href="${process.env.WEB_URL || "http://localhost:8080"}/profile/bookings?qr=${bookingId}" 
             style="background-color: #e11d48; color: #ffffff; padding: 11px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block; box-shadow: 0 2px 4px rgba(225,29,72,0.2);">
            View Booking QR Code
          </a>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.WEB_URL || "http://localhost:8080"}/profile/bookings" 
             style="background-color: #0f172a; color: #ffffff; padding: 11px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 13px; display: inline-block;">
            View All Bookings
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
          Need help? Contact the restaurant or visit BookMyTable Support.<br>
          Thank you for choosing BookMyTable.
        </p>
      </div>
    `,
    text: `Booking Confirmed at ${restaurantName} on ${date} at ${time} for ${guests} guests. Table: ${tableName}. Booking ID: ${bookingId}. Status: Confirmed.`,
  };
};
