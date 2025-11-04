import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 465, // ← Cambiar de 587 a 465
    secure: true, // ← true para puerto 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Error:', error.message);
    } else {
        console.log('✅ SMTP listo para enviar correos');
    }
});