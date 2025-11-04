// src/email/sendMail.js
export async function sendMagicLinkEmail(to, link) {
    try {
        // Usa la API HTTP de Resend
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                from: "Auth App <onboarding@resend.dev>", // puedes cambiarlo
                to: [to],
                subject: "Tu enlace mágico de inicio de sesión",
                html: `
          <p>Hola 👋</p>
          <p>Haz clic en el siguiente enlace para acceder:</p>
          <p><a href="${link}">${link}</a></p>
          <br>
          <small>Si no solicitaste este enlace, ignora este correo.</small>
        `
            })
        })

        const data = await res.json()
        console.log("Resend response:", data)

        // Devuelve true si el envío fue exitoso
        return res.ok
    } catch (error) {
        console.error("Error enviando con Resend:", error)
        return false
    }
}
