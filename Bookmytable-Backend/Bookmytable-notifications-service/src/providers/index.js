import nodemailerProvider from "./email/nodemailer.provider.js";

/**
 * Main Providers Registry
 * This structure allows us to easily swap or add multiple providers 
 * (e.g., adding Resend, SendGrid, Firebase, or Socket.io)
 */

export const emailProvider = nodemailerProvider;

// Future expansions
// export const pushProvider = firebaseProvider;
// export const socketProvider = socketIoProvider;
