import crypto from "crypto";
import {
  canSendTransactionalEmail,
  sendTransactionalEmail,
} from "./emailSender.js";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export function hashEmailVerificationToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateEmailVerificationToken() {
  const token = crypto.randomBytes(32).toString("hex");

  return {
    token,
    tokenHash: hashEmailVerificationToken(token),
    expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
  };
}

function getVerificationUrl(token) {
  const frontendUrl = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  ).replace(/\/$/, "");
  return `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;
}

export async function sendVerificationEmail({ email, displayName, token }) {
  const verificationUrl = getVerificationUrl(token);

  if (!canSendTransactionalEmail()) {
    console.info(`Email verification link for ${email}: ${verificationUrl}`);
    return { previewUrl: verificationUrl, delivered: false };
  }

  const appName = process.env.APP_NAME || "FinTrack";
  const greetingName = displayName || email;

  await sendTransactionalEmail({
    to: email,
    subject: `Verify your ${appName} account`,
    text: [
      `Hello ${greetingName},`,
      "",
      "Please verify your email address by opening this link:",
      verificationUrl,
      "",
      "This link expires in 24 hours.",
    ].join("\n"),
    html: `
      <p>Hello ${greetingName},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p>
        <a
          href="${verificationUrl}"
          style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;"
        >
          Verify email
        </a>
      </p>
      <p>If the button does not work, copy and paste this URL into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link expires in 24 hours.</p>
    `,
    tag: "verify-email",
  });

  return { previewUrl: verificationUrl, delivered: true };
}
