import { sendEmail } from "./mailgun";
import { creditAppNotification, creditAppStatusUpdate } from "./templates";

type Attachment = { filename: string; data: Buffer; contentType: string };

type CreditAppEmailPayload = {
  to: string[];
  dealershipName: string;
  applicantName: string;
  vehicleLabel: string | null;
  applicationId: string;
  portalUrl: string;
  pdfBytes?: Uint8Array | null;
  frontIdBase64?: string | null;
};

export async function notifyCreditAppSubmission(payload: CreditAppEmailPayload): Promise<void> {
  const attachments: Attachment[] = [];

  if (payload.pdfBytes) {
    attachments.push({
      filename: `Credit-Application-${payload.applicantName.replace(/\s+/g, "-")}.pdf`,
      data: Buffer.from(payload.pdfBytes),
      contentType: "application/pdf",
    });
  }

  if (payload.frontIdBase64) {
    const raw = payload.frontIdBase64.replace(/^data:[^;]+;base64,/, "");
    const isPng = payload.frontIdBase64.startsWith("data:image/png");
    const isPdf = payload.frontIdBase64.startsWith("data:application/pdf");
    const ext = isPng ? "png" : isPdf ? "pdf" : "jpg";
    const ct = isPng ? "image/png" : isPdf ? "application/pdf" : "image/jpeg";
    attachments.push({
      filename: `ID-${payload.applicantName.replace(/\s+/g, "-")}.${ext}`,
      data: Buffer.from(raw, "base64"),
      contentType: ct,
    });
  }

  const html = creditAppNotification({
    applicantName: payload.applicantName,
    vehicleLabel: payload.vehicleLabel,
    portalUrl: payload.portalUrl,
    hasAttachments: attachments.length > 0,
  });

  await sendEmail({
    to: payload.to,
    subject: `New Credit Application — ${payload.applicantName}`,
    html,
    attachments: attachments.length > 0 ? attachments : undefined,
  });
}

export async function notifyCreditAppStatusChange(params: {
  applicantEmail: string;
  applicantName: string;
  status: "approved" | "denied" | "reviewed";
  dealershipName: string;
}): Promise<void> {
  const statusLabels: Record<string, string> = {
    approved: "Approved",
    denied: "Update",
    reviewed: "Under Review",
  };

  const html = creditAppStatusUpdate({
    applicantName: params.applicantName,
    status: params.status,
    dealershipName: params.dealershipName,
  });

  await sendEmail({
    to: params.applicantEmail,
    subject: `Credit Application ${statusLabels[params.status]} — ${params.dealershipName}`,
    html,
  });
}
