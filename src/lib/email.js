import sgMail from '@sendgrid/mail';

// Configurar API Key (desde variables de entorno)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendMagicLinkEmail = async (to, url) => {
  try {
    console.log('📧 Enviando email a:', to);

    const msg = {
      to,
      from: {
        // 👇 Usa el correo verificado en SendGrid aquí
        email: process.env.FROM_EMAIL || 'antonio37829@gmail.com',
        name: 'Enlace Mágico',
      },
      subject: 'Tu enlace de acceso',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🔐 Enlace de Acceso</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin-top: 0;">
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
              <p style="color: #6366f1; font-size: 12px; word-break: break-all; background: #f7f7f7; padding: 10px; border-radius: 5px;">
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
        </body>
        </html>
      `,
    };

    const response = await sgMail.send(msg);
    console.log('✅ Email enviado exitosamente a:', to);
    console.log('📊 Response status:', response[0].statusCode);

    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ Error enviando email con SendGrid:', error);

    if (error.response) {
      console.error('Error body:', error.response.body);
    }

    throw new Error(`No se pudo enviar el email: ${error.message}`);
  }
};
