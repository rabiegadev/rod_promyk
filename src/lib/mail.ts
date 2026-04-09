import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const defaultFrom = process.env.RESEND_FROM ?? "ROD Promyk <onboarding@resend.dev>";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildPromykEmailHtml(opts: {
  subject: string;
  intro: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) {
  const safeSubject = escapeHtml(opts.subject);
  const safeIntro = escapeHtml(opts.intro);
  const safeBody = escapeHtml(opts.body).replaceAll("\n", "<br/>");
  const safeCtaLabel = opts.ctaLabel ? escapeHtml(opts.ctaLabel) : null;
  const safeCtaUrl = opts.ctaUrl ? escapeHtml(opts.ctaUrl) : null;

  return `
    <div style="margin:0;background:#fefce8;padding:24px 12px;font-family:Inter,Segoe UI,Arial,sans-serif;color:#1f2937;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #d9f99d;border-radius:16px;overflow:hidden;">
        <div style="padding:18px 20px;background:linear-gradient(135deg,#ecfccb,#fef9c3);border-bottom:1px solid #d9f99d;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="height:34px;width:34px;border-radius:12px;background:#fef08a;display:flex;align-items:center;justify-content:center;font-size:18px;">☀️</div>
            <div>
              <div style="font-weight:700;color:#14532d;">ROD "Promyk"</div>
              <div style="font-size:12px;color:#166534;">Przylep · powiadomienie systemowe</div>
            </div>
          </div>
        </div>
        <div style="padding:20px;">
          <h1 style="margin:0 0 8px;font-size:20px;line-height:1.3;color:#14532d;">${safeSubject}</h1>
          <p style="margin:0 0 14px;font-size:14px;color:#365314;">${safeIntro}</p>
          <div style="font-size:14px;line-height:1.65;color:#1f2937;">${safeBody}</div>
          ${
            safeCtaLabel && safeCtaUrl
              ? `<div style="margin-top:18px;">
                   <a href="${safeCtaUrl}" style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:600;">
                     ${safeCtaLabel}
                   </a>
                 </div>`
              : ""
          }
        </div>
        <div style="padding:12px 20px;border-top:1px solid #ecfccb;background:#fafaf9;font-size:12px;color:#4d7c0f;">
          Ten e-mail został wysłany automatycznie przez system ROD "Promyk".
        </div>
      </div>
    </div>
  `.trim();
}

export async function sendTransactionalEmail(
  to: string[],
  subject: string,
  text: string,
  options?: { intro?: string; ctaLabel?: string; ctaUrl?: string },
) {
  const recipients = to.filter(Boolean);
  if (!resend || recipients.length === 0) return { sent: false as const, reason: "no_provider_or_recipients" };

  const html = buildPromykEmailHtml({
    subject,
    intro: options?.intro ?? "Masz nowe powiadomienie z systemu ogrodu.",
    body: text,
    ctaLabel: options?.ctaLabel,
    ctaUrl: options?.ctaUrl,
  });

  await resend.emails.send({
    from: defaultFrom,
    to: recipients,
    subject,
    text,
    html: `<div style="font-family:Inter,Segoe UI,Arial,sans-serif;line-height:1.55;color:#1f2937;">${html}</div>`,
  });

  return { sent: true as const };
}

export async function notifyNewChatMessage(opts: {
  to: string[];
  senderLabel: string;
  preview: string;
  threadUrl: string;
}) {
  const subject = `Nowa wiadomość na czacie ROD Promyk (${opts.senderLabel})`;
  const text = `ROD "Promyk" - nowe powiadomienie\n\n${opts.senderLabel} napisał(a):\n\n${opts.preview.slice(
    0,
    800,
  )}\n\nOtwórz wątek: ${opts.threadUrl}`;
  return sendTransactionalEmail(opts.to, subject, text, {
    intro: "Nowa wiadomość na czacie działkowców.",
    ctaLabel: "Otwórz czat",
    ctaUrl: opts.threadUrl,
  });
}
