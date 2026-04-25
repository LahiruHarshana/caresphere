export function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f0fdfa; font-family: 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <!-- Header -->
        <tr>
          <td style="background: linear-gradient(135deg, #0f766e, #14b8a6); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">💚 CareSphere</h1>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 20px 30px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center;">
              © ${new Date().getFullYear()} CareSphere. All rights reserved.<br>
              This is an automated message. Please do not reply directly.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
