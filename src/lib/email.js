// src/lib/email.js
import nodemailer from "nodemailer";

/**
 * Usa SMTP (Gmail u otro proveedor).
 * Variables .env esperadas:
 *  - SMTP_HOST (ej: smtp.gmail.com)
 *  - SMTP_PORT (465 SSL o 587 STARTTLS)
 *  - SMTP_USER
 *  - SMTP_PASS  (en Gmail, "contraseña de aplicación")
 *  - MAIL_FROM  (opcional; por defecto SMTP_USER)
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: Number(process.env.SMTP_PORT || 465) === 465, // true si 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    minVersion: "TLSv1.2",
  },
});

export async function sendMagicLinkEmail(to, url) {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER;
  const html = `
    <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px;margin:auto">
      <h2>Tu enlace mágico 🔐</h2>
      <p>Haz clic para iniciar sesión. Este enlace expira en <b>15 minutos</b>.</p>
      <p style="margin:24px 0">
        <a href="${url}" 
           style="background:#7c3aed;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;display:inline-block">
          Iniciar sesión
        </a>
      </p>
      <p>Si el botón no funciona, copia y pega esta URL en tu navegador:</p>
      <code style="display:block;word-break:break-all;background:#f3f4f6;padding:10px;border-radius:6px">${url}</code>
    </div>
  `;

  await transporter.sendMail({
    from,
    to,
    subject: "Tu enlace mágico para iniciar sesión",
    html,
  });
}
