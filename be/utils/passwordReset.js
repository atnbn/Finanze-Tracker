import crypto from "crypto";
import {
  canSendTransactionalEmail,
  sendTransactionalEmail,
} from "./emailSender.js";

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export function hashPasswordResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generatePasswordResetToken() {
  const token = crypto.randomBytes(32).toString("hex");

  return {
    token,
    tokenHash: hashPasswordResetToken(token),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
  };
}

function getResetUrl(token) {
  const frontendUrl = (
    process.env.FRONTEND_URL || "http://localhost:5173"
  ).replace(/\/$/, "");

  return `${frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function sendPasswordResetEmail({ email, token }) {
  const resetUrl = getResetUrl(token);

  if (!canSendTransactionalEmail()) {
    console.info(`Password reset link for ${email}: ${resetUrl}`);
    return { previewUrl: resetUrl, delivered: false };
  }

  const appName = process.env.APP_NAME || "FinTrack";

  await sendTransactionalEmail({
    to: email,
    subject: `Reset your ${appName} password`,
    text: [
      "Hello,",
      "",
      "We received a request to reset your password.",
      "Open this link to choose a new password:",
      resetUrl,
      "",
      "This link expires in 1 hour.",
      "If you did not request this, you can safely ignore this email.",
    ].join("\n"),
    html: `
      <p>Hello,</p>
      <p>We received a request to reset your password.</p>
      <p>
        <a
          href="${resetUrl}"
          style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;"
        >
          Reset password
        </a>
      </p>
      <p>If the button does not work, copy and paste this URL into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
    tag: "password-reset",
  });

  return { previewUrl: resetUrl, delivered: true };
}
