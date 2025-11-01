import nodemailer from 'nodemailer';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // 465 => true
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  tls: {
    minVersion: 'TLSv1.2',
    servername: 'smtp.gmail.com',
    rejectUnauthorized: false, // ⚠️ SOLO DEV para saltar el cert interceptado
  },
});
