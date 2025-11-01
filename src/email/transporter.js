import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true solo para puerto 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,   // 10 segundos
  greetingTimeout: 10000,     // 10 segundos
  socketTimeout: 10000        // 10 segundos
});

// Verificar conexión al iniciar
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Error:', error.message);
    console.error('Verifica: SMTP_USER y SMTP_PASS en .env');
  } else {
    console.log('✅ SMTP listo para enviar correos.');
  }
});