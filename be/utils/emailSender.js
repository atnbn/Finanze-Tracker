function debugEmailLog(message, details = {}) {
  if (process.env.DEBUG_AUTH_FLOW !== "true") {
    return;
  }

  console.log(`[email] ${message}`, details);
}

function hasResendConfiguration() {
  return Boolean(process.env.RESEND_API_KEY);
}

function getDefaultFromAddress() {
  const appName = process.env.APP_NAME || "FinTrack";

  return (
    process.env.RESEND_FROM ||
    process.env.SMTP_FROM ||
    `${appName} <onboarding@resend.dev>`
  );
}

export function canSendTransactionalEmail() {
  return hasResendConfiguration();
}

export async function sendTransactionalEmail({ to, subject, text, html, tag }) {
  if (!hasResendConfiguration()) {
    debugEmailLog("skipping email delivery because RESEND_API_KEY is missing", {
      to,
      subject,
      tag,
    });
    return { delivered: false };
  }

  const payload = {
    from: getDefaultFromAddress(),
    to: [to],
    subject,
    text,
    html,
  };

  debugEmailLog("sending transactional email", {
    to,
    subject,
    tag,
    from: payload.from,
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      data?.error?.message ||
      data?.message ||
      "Failed to send transactional email";

    debugEmailLog("transactional email failed", {
      to,
      subject,
      tag,
      status: response.status,
      error: errorMessage,
    });

    throw new Error(errorMessage);
  }

  debugEmailLog("transactional email sent", {
    to,
    subject,
    tag,
    id: data?.id,
  });

  return { delivered: true, id: data?.id };
}
