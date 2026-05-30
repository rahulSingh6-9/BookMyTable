import { emailProvider } from "../providers/index.js";
import { staffInviteTemplate } from "../providers/email/templates/staffInvite.template.js";
import { restaurantApprovedTemplate } from "../providers/email/templates/restaurantApproved.template.js";
import { bookingConfirmedTemplate } from "../providers/email/templates/bookingConfirmed.template.js";
import { restaurantWelcomeTemplate } from "../providers/email/templates/restaurantWelcome.template.js";
import { businessEmailVerificationTemplate } from "../providers/email/templates/businessEmailVerification.template.js";
import { logError } from "../utils/logger.js";

class EmailService {
  /**
   * High-level email sending logic. 
   * Maps events to templates and calls the provider.
   */
  async send(event, to, metadata) {
    try {
      let templateData;

      // Map event to template
      switch (event) {
        case "staff.invited":
          templateData = staffInviteTemplate(metadata);
          break;
        
        case "restaurant.approved":
        case "restaurant.suspended":
        case "restaurant.rejected":
        case "restaurant.STATUS_CHANGED":
          templateData = restaurantApprovedTemplate(metadata);
          break;

        case "restaurant_welcome":
          templateData = restaurantWelcomeTemplate(metadata);
          break;

        case "booking.confirmed":
        case "booking.created":
          templateData = bookingConfirmedTemplate(metadata);
          break;

        case "restaurant.business.email.verification.requested":
          templateData = businessEmailVerificationTemplate(metadata);
          break;

        default:
          throw new Error(`No email template found for event: ${event}`);
      }

      // Execute via provider
      return await emailProvider.send({
        to,
        subject: templateData.subject,
        html: templateData.html,
        text: templateData.text,
      });
    } catch (error) {
      logError("❌ Email service dispatch error", { event, to, error: error.message });
      throw error;
    }
  }
}

export const emailService = new EmailService();
