import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,              // smtp.gmail.com
  port: Number(process.env.SMTP_PORT || 465),
  secure: true,                             // 465 => true
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: { minVersion: "TLSv1.2" },
  logger: true,
  debug: true,
});

transporter.verify((err, ok) => {
  if (err) console.error("SMTP verify error:", err);
  else console.log("SMTP ready:", ok);
});
