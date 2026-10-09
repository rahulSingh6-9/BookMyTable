import nodemailer from "nodemailer";
import Notification from "./notification.model.js";
import { env } from "../../config/env.js";

import { staffInviteTemplate } from "./templates/staffInvite.template.js";
import { adminInviteTemplate } from "./templates/adminInvite.template.js";
import { restaurantApprovedTemplate } from "./templates/restaurantApproved.template.js";
import { bookingConfirmedTemplate } from "./templates/bookingConfirmed.template.js";
import { restaurantWelcomeTemplate } from "./templates/restaurantWelcome.template.js";
import { businessEmailVerificationTemplate } from "./templates/businessEmailVerification.template.js";
import { branchDeactivatedTemplate } from "./templates/branchDeactivated.template.js";
import { branchSoftDeletedTemplate } from "./templates/branchSoftDeleted.template.js";
import { branchPermanentlyDeletedTemplate } from "./templates/branchPermanentlyDeleted.template.js";
import { branchRestoredTemplate } from "./templates/branchRestored.template.js";
import { planLimitReachedTemplate } from "./templates/planLimitReached.template.js";

class NotificationService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  initTransporter() {
    if (env.EMAIL_USER && env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
      });
    } else {
      console.warn("⚠️ EMAIL_USER/EMAIL_PASS not configured. Emails will be logged to console.");
    }
  }

  async sendRawEmail({ to, subject, html, text }) {
    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail({
          from: `"BookMyTable" <${env.EMAIL_USER}>`,
          to,
          subject,
          html,
          text: text || "",
        });
        console.log(`📧 [Nodemailer] Email sent to ${to} (MessageId: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
      } catch (err) {
        console.error(`❌ [Nodemailer] Failed to send email to ${to}:`, err.message);
        throw err;
      }
    } else {
      console.log(`📨 [Email Simulated] To: ${to} | Subject: ${subject}`);
      return { success: true, messageId: `sim_${Date.now()}` };
    }
  }

  /**
   * Dispatches email and logs to Notification collection
   */
  async dispatchNotification({ type = "email", event, recipient, payload = {}, metadata = {}, brandId, branchId }) {
    let notificationRecord;
    try {
      notificationRecord = await Notification.create({
        type,
        event,
        recipient,
        payload,
        brandId,
        branchId,
        status: "pending",
      });
    } catch (e) {
      // Non-blocking log
    }

    try {
      let templateData;

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
        case "auth.email.verification":
          templateData = {
            subject: "Verify Your Email - BookMyTable",
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to BookMyTable!</h2>
                <p>Please click the button below to verify your email address:</p>
                <a href="${metadata.verifyUrl}" style="background: #e11d48; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
                <p>Or paste this link into your browser: <br>${metadata.verifyUrl}</p>
              </div>
            `,
          };
          break;
        case "auth.password.reset":
          templateData = {
            subject: "Reset Your Password - BookMyTable",
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click below to continue:</p>
                <a href="${metadata.resetUrl}" style="background: #e11d48; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
                <p>Or paste this link into your browser: <br>${metadata.resetUrl}</p>
              </div>
            `,
          };
          break;
        default:
          templateData = {
            subject: metadata.subject || `Notification: ${event}`,
            html: metadata.html || `<p>${metadata.message || JSON.stringify(metadata)}</p>`,
            text: metadata.text || "",
          };
      }

      const result = await this.sendRawEmail({
        to: recipient,
        subject: templateData.subject,
        html: templateData.html,
        text: templateData.text,
      });

      if (notificationRecord) {
        notificationRecord.status = "sent";
        notificationRecord.sentAt = new Date();
        await notificationRecord.save();
      }

      return result;
    } catch (error) {
      if (notificationRecord) {
        notificationRecord.status = "failed";
        notificationRecord.error = error.message;
        await notificationRecord.save();
      }
      console.error(`❌ Notification dispatch failed for [${event}] to ${recipient}:`, error.message);
    }
  }

  // Specialized helpers for business modules:

  async sendEmailVerification({ email, token, userId }) {
    const verifyUrl = `${env.WEB_URL}/verify-email?token=${token}`;
    return this.dispatchNotification({
      event: "auth.email.verification",
      recipient: email,
      metadata: { verifyUrl, token, userId },
    });
  }

  async sendPasswordReset({ email, token }) {
    const resetUrl = `${env.WEB_URL}/reset-password?token=${token}`;
    return this.dispatchNotification({
      event: "auth.password.reset",
      recipient: email,
      metadata: { resetUrl, token },
    });
  }

  async sendPhoneOTP({ phone, otp, purpose }) {
    console.log(`\n📲 [SMS OTP] Dispatched to ${phone} | Code: ${otp} | Purpose: ${purpose || "Verification"}\n`);
    return true;
  }

  async sendStaffInvite(data) {
    const { email, brandId, branchId } = data;
    return this.dispatchNotification({
      event: "staff.invited",
      recipient: email,
      brandId,
      branchId,
      metadata: {
        ...data,
        acceptInviteUrl: `${env.WEB_URL}/staff/accept-invite?token=${data.inviteToken || data.token}`,
      },
    });
  }

  async sendAdminInvite(data) {
    const { email } = data;
    return this.dispatchNotification({
      event: "admin.invited",
      recipient: email,
      metadata: {
        ...data,
        acceptInviteUrl: `${env.ADMIN_URL}/accept-invite?token=${data.inviteToken || data.token}`,
      },
    });
  }

  async sendBookingConfirmation(bookingData) {
    const recipient = bookingData.customerEmail || bookingData.guestEmail || bookingData.userEmail;
    if (!recipient) {
      console.warn("⚠️ No recipient email for booking confirmation");
      return;
    }

    return this.dispatchNotification({
      event: "booking.confirmed",
      recipient,
      brandId: bookingData.brandId,
      branchId: bookingData.branchId,
      metadata: {
        customerName: bookingData.customerName || bookingData.guestName || "Valued Guest",
        restaurantName: bookingData.restaurantName || "Our Restaurant",
        branchLocation: bookingData.branchLocation || "",
        bookingId: bookingData._id || bookingData.id,
        date: bookingData.bookingDate || bookingData.date,
        time: bookingData.timeSlot || bookingData.time,
        guests: bookingData.guests || bookingData.guestCount || bookingData.partySize || 2,
        tableName: bookingData.tableName || (bookingData.tables && bookingData.tables.map(t => t.tableName).join(", ")) || "Reserved",
        sectionLabel: bookingData.sectionLabel || (bookingData.tables && bookingData.tables[0]?.sectionLabel) || "",
        grandTotal: bookingData.grandTotal,
        paymentStatus: bookingData.paymentStatus || "Paid",
      },
    });
  }

  async sendRestaurantStatusNotification(restaurant, status) {
    const recipient = restaurant.ownerId?.email || restaurant.contactEmail || restaurant.email;
    if (!recipient) return;

    return this.dispatchNotification({
      event: `restaurant.${status.toLowerCase()}`,
      recipient,
      branchId: String(restaurant._id),
      brandId: String(restaurant.brandId || ""),
      metadata: {
        restaurantName: restaurant.name,
        status,
        reason: restaurant.rejectionReason || restaurant.suspensionReason || "",
      },
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;

