import nodemailer from "nodemailer";
import { logInfo, logError } from "../../utils/logger.js";

class NodemailerProvider {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async send(options) {
    const { to, subject, html, text, from } = options;

    try {
      const info = await this.transporter.sendMail({
        from: from || `"BookMyTable" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text,
      });

      logInfo("📧 Email sent via Nodemailer", { messageId: info.messageId, to });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logError("❌ Nodemailer send error", { error: error.message, to });
      throw error;
    }
  }
}

export default new NodemailerProvider();
