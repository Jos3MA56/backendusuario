import sgMail from '@sendgrid/mail';

// --- Config ---
const API_KEY = (process.env.SENDGRID_API_KEY || '').trim();
const FROM = (process.env.FROM_EMAIL || 'antonio37829@gmail.com').trim(); // 👈 debe ser el remitente verificado

if (!API_KEY) throw new Error('Falta SENDGRID_API_KEY');
if (!FROM) throw new Error('Falta FROM_EMAIL (remitente verificado)');

sgMail.setApiKey(API_KEY);

export const sendMagicLinkEmail = async (to, url) => {
  const toAddr = (to || '').trim();

  console.log('DEBUG FROM_EMAIL =>', JSON.stringify(FROM));
  console.log('DEBUG TO        =>', JSON.stringify(toAddr));

  const msg = {
    to: toAddr,
    from: FROM, // 👈 usa string; primero validamos lo mínimo
    subject: 'Tu enlace de acceso',
    html: `
      <p>Hola,</p>
      <p>Haz clic para entrar: <a href="${url}">${url}</a></p>
      <p>Este enlace expira en 15 minutos.</p>
    `,
  };

  try {
    const [res] = await sgMail.send(msg);
    console.log('STATUS:', res?.statusCode);
    console.log('X-MESSAGE-ID:', res?.headers?.['x-message-id']);
    return { success: true };
  } catch (error) {
    console.error('CODE:', error.code);
    console.error('BODY:', error.response?.body || error.message);
    throw new Error(`No se pudo enviar el email: ${error.message}`);
  }
};
