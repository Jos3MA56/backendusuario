import sgMail from '@sendgrid/mail';

const API_KEY = (process.env.SENDGRID_API_KEY || '').trim();
const FROM = (process.env.FROM_EMAIL || 'antonio37829@gmail.com').trim();

if (!API_KEY) throw new Error('Falta SENDGRID_API_KEY');
if (!FROM) throw new Error('Falta FROM_EMAIL (remitente verificado)');

sgMail.setApiKey(API_KEY);

export const sendMagicLinkEmail = async (to, url) => {
  const toAddr = (to || '').trim();

  console.log('DEBUG FROM_EMAIL =>', JSON.stringify(FROM));
  console.log('DEBUG TO        =>', JSON.stringify(toAddr));

  const msg = {
    to: toAddr,
    from: FROM,
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
export const sendResetPasswordEmail = async (to, url) => {
  const toAddr = (to || '').trim();

  const msg = {
    to: toAddr,
    from: FROM,
    subject: 'Restablecer contraseña',
    html: `
      <p>Hola,</p>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para definir una nueva contraseña:</p>
      <p><a href="${url}">${url}</a></p>
      <p>El enlace expira en 15 minutos. Si no fuiste tú, ignora este mensaje.</p>
    `,
  };

  await sgMail.send(msg);
  return { success: true };
};
