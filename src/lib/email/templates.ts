/**
 * Shared email layout wrapper. All transactional emails use this
 * to maintain consistent branding without heavy template dependencies.
 */
function layout(body: string, footer?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" style="background:#f4f4f5;padding:40px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden">
        <!-- Logo bar -->
        <tr>
          <td style="padding:24px 32px 0;border-bottom:1px solid #e4e4e7">
            <p style="margin:0 0 16px;font-size:15px;font-weight:700;letter-spacing:-0.02em;color:#18181b">Vehicle Hound</p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:28px 32px 32px">${body}</td>
        </tr>
      </table>
      ${footer ? `<table role="presentation" width="560" style="max-width:560px;width:100%"><tr><td style="padding:16px 32px;font-size:12px;color:#a1a1aa;text-align:center">${footer}</td></tr></table>` : ""}
    </td></tr>
  </table>
</body>
</html>`.trim();
}

function button(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;padding:10px 24px;background:#18181b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;letter-spacing:-0.01em">${text}</a>`;
}

function heading(text: string): string {
  return `<h2 style="margin:0 0 16px;font-size:20px;font-weight:700;letter-spacing:-0.03em;color:#18181b;line-height:1.3">${text}</h2>`;
}

function text(content: string): string {
  return `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#3f3f46">${content}</p>`;
}

function detail(label: string, value: string): string {
  return `<p style="margin:0 0 6px;font-size:14px;color:#3f3f46"><strong style="color:#18181b">${label}:</strong> ${value}</p>`;
}

function spacer(px = 16): string {
  return `<div style="height:${px}px"></div>`;
}

// ─── Template Builders ───────────────────────────────

export function creditAppNotification(params: {
  applicantName: string;
  vehicleLabel: string | null;
  portalUrl: string;
}): string {
  return layout(
    [
      heading("New Credit Application"),
      text(`<strong>${params.applicantName}</strong> submitted a credit application${params.vehicleLabel ? ` for a <strong>${params.vehicleLabel}</strong>` : ""}.`),
      spacer(20),
      button("View Application", params.portalUrl),
    ].join(""),
    "You're receiving this because your email is listed for credit application alerts."
  );
}

export function creditAppStatusUpdate(params: {
  applicantName: string;
  status: "approved" | "denied" | "reviewed";
  dealershipName: string;
  message?: string;
}): string {
  const statusLabels: Record<string, string> = {
    approved: "Approved",
    denied: "Not Approved",
    reviewed: "Under Review",
  };
  const statusColors: Record<string, string> = {
    approved: "#16a34a",
    denied: "#dc2626",
    reviewed: "#ca8a04",
  };

  return layout(
    [
      heading("Credit Application Update"),
      text(`Hi ${params.applicantName},`),
      text(`Your credit application with <strong>${params.dealershipName}</strong> has been updated.`),
      spacer(8),
      `<div style="display:inline-block;padding:6px 14px;background:${statusColors[params.status]}15;color:${statusColors[params.status]};border-radius:6px;font-size:13px;font-weight:600">${statusLabels[params.status]}</div>`,
      spacer(12),
      params.message ? text(params.message) : "",
      text("If you have questions, please contact the dealership directly."),
    ].join(""),
    `This email was sent on behalf of ${params.dealershipName}.`
  );
}

export function userInvitation(params: {
  dealershipName: string;
  inviterName: string;
  inviteUrl: string;
  expiresInDays: number;
}): string {
  return layout(
    [
      heading(`Join ${params.dealershipName}`),
      text(`${params.inviterName} has invited you to join <strong>${params.dealershipName}</strong> on Vehicle Hound.`),
      text("Click the button below to create your account and get started."),
      spacer(20),
      button("Accept Invitation", params.inviteUrl),
      spacer(20),
      text(`<span style="color:#a1a1aa;font-size:12px">This invitation expires in ${params.expiresInDays} days.</span>`),
    ].join("")
  );
}

export function dealSheetEmail(params: {
  customerName: string;
  dealershipName: string;
  sheetTitle: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}): string {
  const contactLines: string[] = [];
  if (params.contactName) contactLines.push(detail("Your contact", params.contactName));
  if (params.contactPhone) contactLines.push(detail("Phone", params.contactPhone));
  if (params.contactEmail) contactLines.push(detail("Email", params.contactEmail));

  return layout(
    [
      heading(params.sheetTitle),
      text(`Hi ${params.customerName},`),
      text(`Please find attached your deal options from <strong>${params.dealershipName}</strong>. Review at your convenience and reach out with any questions.`),
      contactLines.length > 0 ? spacer(16) + contactLines.join("") : "",
      spacer(16),
      text("<em style=\"font-size:12px;color:#a1a1aa\">The deal sheet is attached as a PDF.</em>"),
    ].join(""),
    `Sent by ${params.dealershipName} via Vehicle Hound.`
  );
}

export function welcomeEmail(params: {
  ownerName: string;
  dealershipName: string;
  loginUrl: string;
}): string {
  return layout(
    [
      heading(`Welcome to Vehicle Hound`),
      text(`Hi ${params.ownerName},`),
      text(`<strong>${params.dealershipName}</strong> is all set up and your trial has started. Here's what you can do right away:`),
      spacer(8),
      `<ul style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:2;color:#3f3f46">
        <li>Add your inventory (manually or CSV bulk import)</li>
        <li>Configure your embeddable search widget</li>
        <li>Set up credit application forms</li>
        <li>Invite your team members</li>
      </ul>`,
      button("Go to Dashboard", params.loginUrl),
    ].join(""),
    "You're receiving this because you signed up for Vehicle Hound."
  );
}
