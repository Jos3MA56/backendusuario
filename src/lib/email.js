// lib/email.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendMagicLinkEmail = async (to, url) => {
  try {
    const msg = {
      to,
      from: 'antonio37829@gmail.com', // Usa tu email verificado
      subject: 'Tu enlace de acceso',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Enlace de Acceso</h1>
          </div>
          
          <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">Hola,</p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Haz clic en el siguiente botón para iniciar sesión:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" 
                 style="display: inline-block; padding: 14px 32px; background: #6366f1; 
                        color: white; text-decoration: none; border-radius: 8px; 
                        font-weight: bold; font-size: 16px;">
                Iniciar Sesión
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">O copia este enlace:</p>
            <p style="color: #6366f1; font-size: 12px; word-break: break-all; 
                      background: white; padding: 10px; border-radius: 5px;">
              ${url}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 13px;">⏱️ Expira en <strong>15 minutos</strong></p>
              <p style="color: #999; font-size: 13px;">🔒 Si no lo solicitaste, ignora este email</p>
            </div>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log('✅ Email enviado con SendGrid');
    return { success: true };
  } catch (error) {
    console.error('❌ Error SendGrid:', error);
    throw error;
  }
};