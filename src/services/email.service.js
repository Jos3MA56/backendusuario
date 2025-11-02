import { transporter } from "../lib/email.js";

export async function sendMail({ to, subject, html, text }) {
    const info = await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html,
        text,
    });

    // Útil para debug/logs
    console.log("SMTP accepted:", info.accepted, "response:", info.response);
    return info;
}
