import { sendEmail } from "./mailgun";
import { creditAppNotification, creditAppStatusUpdate } from "./templates";

type CreditAppEmailPayload = {
  to: string[];
  dealershipName: string;
  applicantName: string;
  vehicleLabel: string | null;
  applicationId: string;
  portalUrl: string;
};

export async function notifyCreditAppSubmission(payload: CreditAppEmailPayload): Promise<void> {
  const html = creditAppNotification({
    applicantName: payload.applicantName,
    vehicleLabel: payload.vehicleLabel,
    portalUrl: payload.portalUrl,
  });

  await sendEmail({
    to: payload.to,
    subject: `New Credit Application — ${payload.applicantName}`,
    html,
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
