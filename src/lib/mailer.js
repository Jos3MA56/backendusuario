import nodemailer from 'nodemailer';

export function getTransporter() {
    if (!process.env.SMTP_HOST) return null;

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true', // 465 => true, 587 => false
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        requireTLS: process.env.SMTP_REQUIRE_TLS === 'true',
        connectionTimeout: 8000, // 8s para no colgar el request
    });
}
