import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMagicLinkEmail = async (to, url) => {
  try {
    console.log('📧 Enviando email a:', to);

    const { data, error } = await resend.emails.send({
      from: 'Enlace Mágico <onboarding@resend.dev>', // Email de prueba de Resend
      to: [to],
      subject: 'Tu enlace de acceso',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Enlace de Acceso</h1>
          </div>
          
          <div style="background: #f7f7f7; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Hola,
            </p>
            <p style="color: #333; font-size: 16px; line-height: 1.6;">
              Haz clic en el siguiente botón para iniciar sesión en tu cuenta:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" 
                 style="display: inline-block; 
                        padding: 14px 32px; 
                        background: #6366f1; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        font-size: 16px;
                        box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);">
                Iniciar Sesión
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              O copia y pega este enlace en tu navegador:
            </p>
            <p style="color: #6366f1; font-size: 12px; word-break: break-all; background: white; padding: 10px; border-radius: 5px;">
              ${url}
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                ⏱️ Este enlace expira en <strong>15 minutos</strong>
              </p>
              <p style="color: #999; font-size: 13px; margin: 5px 0;">
                🔒 Si no solicitaste este enlace, puedes ignorar este correo de forma segura
              </p>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Error de Resend:', error);
      throw new Error(error.message);
    }

    console.log('✅ Email enviado exitosamente:', data.id);
    return data;
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw new Error(`No se pudo enviar el email: ${error.message}`);
  }
};