import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,     // live.smtp.mailtrap.io
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,                   // STARTTLS
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,   // api
    pass: process.env.SMTP_PASS,   // tu token
  },
  family: 4,
  connectionTimeout: 15000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
});

export async function sendMagicLinkEmail(to, url) {
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Tu enlace mágico",
    html: `<a href="${url}">${url}</a>`,
  });
  return { id: info.messageId };
}
