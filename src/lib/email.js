import fs from "fs";
import nodemailer from "nodemailer";

let ca = null;
if (process.env.NODE_ENV !== "production") {
  ca = fs.readFileSync("C:/Users/Anton/Downloads/cer.cer");
}


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  tls: { minVersion: "TLSv1.2" }, // sin ca
});


export async function sendMagicLinkEmail(to, url) {
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.5;">
      <h2>Tu enlace mágico</h2>
      <p>Haz clic para iniciar sesión. Este enlace expira en <b>15 minutos</b>.</p>
      <p><a href="${url}">${url}</a></p>
    </div>
  `;
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject: "Inicia sesión con tu enlace mágico",
    html,
  });
  return { id: info.messageId };
}