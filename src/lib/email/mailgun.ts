const API_BASE = "https://api.mailgun.net/v3";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: { filename: string; data: Buffer; contentType: string }[];
};

type MailgunResponse = {
  id: string;
  message: string;
};

function getConfig() {
  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const from = process.env.MAILGUN_FROM || `Vehicle Hound <postmaster@${domain}>`;

  if (!apiKey || !domain) {
    return null;
  }

  return { apiKey, domain, from };
}

export async function sendEmail(params: SendEmailParams): Promise<MailgunResponse | null> {
  const config = getConfig();
  if (!config) {
    console.warn("[EMAIL] Mailgun not configured — skipping email:", params.subject);
    return null;
  }

  const form = new FormData();
  form.append("from", params.from || config.from);
  const recipients = Array.isArray(params.to) ? params.to : [params.to];
  for (const r of recipients) {
    form.append("to", r);
  }
  form.append("subject", params.subject);
  form.append("html", params.html);

  if (params.replyTo) {
    form.append("h:Reply-To", params.replyTo);
  }

  if (params.attachments) {
    for (const att of params.attachments) {
      form.append("attachment", new Blob([new Uint8Array(att.data)], { type: att.contentType }), att.filename);
    }
  }

  const auth = Buffer.from(`api:${config.apiKey}`).toString("base64");

  const response = await fetch(`${API_BASE}/${config.domain}/messages`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}` },
    body: form,
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("[EMAIL] Mailgun error:", response.status, text);
    throw new Error(`Mailgun API error: ${response.status}`);
  }

  return response.json() as Promise<MailgunResponse>;
}
