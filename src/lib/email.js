import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,    // smtp.mailtrap.io
  port: Number(process.env.SMTP_PORT || 465),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

export async function sendMagicLinkEmail(to, url) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: "Tu enlace mágico",
    html: `<a href="${url}">${url}</a>`,
  });
  return { id: info.messageId };
}
