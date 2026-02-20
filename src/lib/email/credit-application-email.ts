/**
 * Email dispatch stub for credit application notifications.
 * Replace the sendEmail implementation with Mailgun or another
 * provider when ready. The shape of the payload is finalized.
 */

type CreditAppEmailPayload = {
  to: string[];
  dealershipName: string;
  applicantName: string;
  vehicleLabel: string | null;
  applicationId: string;
  portalUrl: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function sendEmail(_payload: {
  to: string[];
  subject: string;
  html: string;
}): Promise<void> {
  // TODO: Wire up Mailgun / SendGrid / SES here
  // Example with Mailgun:
  // const mg = mailgun({ apiKey: process.env.MAILGUN_API_KEY!, domain: process.env.MAILGUN_DOMAIN! });
  // await mg.messages.create(process.env.MAILGUN_DOMAIN!, { from: '...', ...payload });
  console.log("[EMAIL STUB] Would send email:", _payload.subject, "to:", _payload.to.join(", "));
}

export async function notifyCreditAppSubmission(payload: CreditAppEmailPayload): Promise<void> {
  const vehicleLine = payload.vehicleLabel
    ? `<p style="margin:0 0 8px"><strong>Vehicle:</strong> ${payload.vehicleLabel}</p>`
    : "";

  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h2 style="margin:0 0 16px;color:#1a1d1e">New Credit Application</h2>
      <p style="margin:0 0 8px"><strong>Applicant:</strong> ${payload.applicantName}</p>
      ${vehicleLine}
      <p style="margin:16px 0 0">
        <a href="${payload.portalUrl}" style="display:inline-block;padding:10px 20px;background:#1a1d1e;color:#fff;text-decoration:none;border-radius:6px;font-size:14px">
          View Application
        </a>
      </p>
    </div>
  `.trim();

  await sendEmail({
    to: payload.to,
    subject: `New Credit Application — ${payload.applicantName}`,
    html,
  });
}
