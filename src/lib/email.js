// src/lib/email.js
import nodemailer from "nodemailer";

function buildTransport() {
  const host = process.env.SMTP_HOST || "live.smtp.mailtrap.io";
  const port = Number(process.env.SMTP_PORT || 587);

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,                 // TLS directo solo en 465
    requireTLS: port !== 465,             // STARTTLS en 587/2525/25
    auth: {
      user: process.env.SMTP_USER || "api",
      pass: process.env.SMTP_PASS,        // <-- TU API TOKEN de Mailtrap Live
    },
    family: 4,                            // fuerza IPv4
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

const transporter = buildTransport();

/**
 * Envía el correo del enlace mágico.
 * @param {string} to Correo del destinatario
 * @param {string} url URL completa del enlace mágico
 */
export async function sendMagicLinkEmail(to, url) {
  const from =
    process.env.SMTP_FROM || 'Tu App <no-reply@tudominio.com>'; // dominio verificado en Mailtrap

  const html = `
    <div style="font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;line-height:1.4">
      <h2>Inicio de sesión con enlace mágico</h2>
      <p>Haz clic en el siguiente botón para acceder. El enlace expira en 15 minutos.</p>
      <p style="margin:24px 0">
        <a href="${url}" target="_blank"
           style="display:inline-block;padding:12px 18px;border-radius:8px;text-decoration:none;
                  background:#111;color:#fff">Entrar ahora</a>
      </p>
      <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
      <p><a href="${url}" target="_blank">${url}</a></p>
    </div>
  `;

  const info = await transporter.sendMail({
    from,
    to,
    subject: "Tu enlace mágico",
    html,
    text: `Accede con este enlace (expira en 15 minutos): ${url}`,
  });

  // Útil para logs/diagnóstico
  // console.log("SMTP accepted:", info.accepted, "response:", info.response);
  return info;
}
