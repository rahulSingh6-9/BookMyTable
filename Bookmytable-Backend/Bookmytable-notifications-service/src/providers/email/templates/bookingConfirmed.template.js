export const bookingConfirmedTemplate = ({ restaurantName, bookingDate, guests, bookingId }) => {
  return {
    subject: `Booking Confirmed: ${restaurantName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #28a745;">Your Table is Reserved!</h2>
        <p>Hello,</p>
        <p>Your booking at <strong>${restaurantName}</strong> has been confirmed.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Date:</strong> ${bookingDate}</p>
          <p style="margin: 5px 0;"><strong>Guests:</strong> ${guests}</p>
          <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
        </div>
        <div style="margin: 30px 0;">
          <a href="${process.env.WEB_URL || "#"}/profile/bookings" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Booking Details</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #aaa;">Thank you for choosing BookMyTable.</p>
      </div>
    `,
    text: `Booking Confirmed at ${restaurantName} for ${guests} guests on ${bookingDate}. ID: ${bookingId}`,
  };
};
