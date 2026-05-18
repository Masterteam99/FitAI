import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "FitAI <onboarding@resend.dev>";
const APP_URL = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

type SendArgs = { to: string; subject: string; html: string; text: string };

async function send({ to, subject, html, text }: SendArgs) {
  if (!resend) {
    console.log("\n📧 [EMAIL DEV MODE — RESEND_API_KEY non configurata]");
    console.log(`  To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Text:\n${text}\n`);
    return { id: "dev-mode", skipped: true };
  }
  const { data, error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html, text });
  if (error) {
    console.error("[email] resend error:", error);
    throw new Error(`Email send failed: ${error.message}`);
  }
  return { id: data?.id ?? "unknown", skipped: false };
}

function layout(title: string, body: string, ctaUrl?: string, ctaLabel?: string): string {
  const cta = ctaUrl && ctaLabel
    ? `<table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0">
         <tr><td bgcolor="#22c55e" style="border-radius:8px">
           <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;color:#0d1117;text-decoration:none;font-weight:600;font-size:15px">${ctaLabel}</a>
         </td></tr>
       </table>`
    : "";
  return `<!doctype html><html lang="it"><body style="margin:0;background:#0d1117;color:#e6edf3;font-family:system-ui,Arial,sans-serif">
    <table cellpadding="0" cellspacing="0" border="0" width="100%" style="padding:24px 0">
      <tr><td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="560" style="background:#161b22;border:1px solid #30363d;border-radius:12px;padding:32px;max-width:560px">
          <tr><td>
            <div style="font-size:24px;font-weight:700;color:#22c55e;margin-bottom:8px">FitAI</div>
            <h1 style="font-size:20px;margin:16px 0 8px;color:#e6edf3">${title}</h1>
            <div style="font-size:15px;line-height:1.6;color:#c9d1d9">${body}</div>
            ${cta}
            <hr style="border:none;border-top:1px solid #30363d;margin:24px 0">
            <p style="font-size:12px;color:#6e7681;margin:0">Hai ricevuto questa email perché è collegata al tuo account FitAI. Se non riconosci questa attività, ignorala.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const url = `${APP_URL}/reset-password?token=${token}`;
  const html = layout(
    "Reimposta la tua password",
    "<p>Abbiamo ricevuto una richiesta di reset password per il tuo account FitAI. Clicca sul pulsante qui sotto per scegliere una nuova password.</p><p style='color:#6e7681;font-size:13px'>Il link scade tra 1 ora.</p>",
    url,
    "Reimposta password"
  );
  const text = `Reimposta password FitAI\n\nApri questo link per reimpostare la password (scade tra 1 ora):\n${url}\n\nSe non hai richiesto il reset, ignora questa email.`;
  return send({ to, subject: "FitAI — reimposta la tua password", html, text });
}

export async function sendVerifyEmail(to: string, token: string) {
  const url = `${APP_URL}/api/auth/verify-email?token=${token}`;
  const html = layout(
    "Verifica il tuo indirizzo email",
    "<p>Benvenuto su FitAI! Clicca sul pulsante qui sotto per confermare la tua email e attivare l'account.</p>",
    url,
    "Verifica email"
  );
  const text = `Verifica email FitAI\n\nApri questo link per confermare la tua email:\n${url}`;
  return send({ to, subject: "FitAI — verifica la tua email", html, text });
}

export async function sendWelcomeEmail(to: string, name: string | null) {
  const firstName = name?.split(" ")[0] ?? "atleta";
  const html = layout(
    `Benvenuto su FitAI, ${firstName}! 💪`,
    `<p>Siamo felici di averti con noi. Ecco cosa puoi fare:</p>
     <ul style='padding-left:20px;line-height:1.8'>
       <li>Genera piani di allenamento personalizzati con l'AI</li>
       <li>Analizza la tua tecnica in tempo reale con video</li>
       <li>Traccia nutrizione, progressi e achievement</li>
       <li>Chiedi consigli al tuo AI Coach personale</li>
     </ul>
     <p>Inizia subito dalla dashboard.</p>`,
    `${APP_URL}/dashboard`,
    "Vai alla dashboard"
  );
  const text = `Benvenuto su FitAI, ${firstName}!\n\nGenera piani AI, analizza la tecnica, traccia progressi e chiedi al coach AI.\n\nDashboard: ${APP_URL}/dashboard`;
  return send({ to, subject: `Benvenuto su FitAI, ${firstName}!`, html, text });
}
