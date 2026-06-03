import { emailProvider } from "../providers/index.js";
import { staffInviteTemplate } from "../providers/email/templates/staffInvite.template.js";
import { adminInviteTemplate } from "../providers/email/templates/adminInvite.template.js";
import { restaurantApprovedTemplate } from "../providers/email/templates/restaurantApproved.template.js";
import { bookingConfirmedTemplate } from "../providers/email/templates/bookingConfirmed.template.js";
import { restaurantWelcomeTemplate } from "../providers/email/templates/restaurantWelcome.template.js";
import { businessEmailVerificationTemplate } from "../providers/email/templates/businessEmailVerification.template.js";
import { branchDeactivatedTemplate } from "../providers/email/templates/branchDeactivated.template.js";
import { branchSoftDeletedTemplate } from "../providers/email/templates/branchSoftDeleted.template.js";
import { branchPermanentlyDeletedTemplate } from "../providers/email/templates/branchPermanentlyDeleted.template.js";
import { branchRestoredTemplate } from "../providers/email/templates/branchRestored.template.js";
import { planLimitReachedTemplate } from "../providers/email/templates/planLimitReached.template.js";
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

        case "admin.invited":
        case "admin.resent":
          templateData = adminInviteTemplate(metadata);
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

        case "restaurant.deactivated":
          templateData = branchDeactivatedTemplate(metadata);
          break;

        case "restaurant.soft_deleted":
          templateData = branchSoftDeletedTemplate(metadata);
          break;

        case "restaurant.permanently_deleted":
          templateData = branchPermanentlyDeletedTemplate(metadata);
          break;

        case "restaurant.restored":
          templateData = branchRestoredTemplate(metadata);
          break;

        case "restaurant.plan_limit_reached":
          templateData = planLimitReachedTemplate(metadata);
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
