import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

interface InviteEmailParams {
  to: string;
  workspaceName: string;
  inviterName: string;
  inviteLink: string;
}

export const sendInviteEmail = async ({
  to,
  workspaceName,
  inviterName,
  inviteLink,
}: InviteEmailParams): Promise<void> => {
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL as string,
      name: 'TeamTask',
    },
    subject: `You've been invited to join ${workspaceName} on TeamTask`,
    text: `Hi there!\n\n${inviterName} has invited you to join the "${workspaceName}" workspace on TeamTask.\n\nClick the link below to accept the invitation and create your account:\n${inviteLink}\n\nThis invitation expires in 7 days.\n\nIf you didn't expect this invitation, you can safely ignore this email.\n\n— The TeamTask Team`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#f0f4ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f0f4ff;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 32px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:22px; font-weight:800; letter-spacing:-0.5px;">
                ✦ TeamTask
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin:0 0 8px; color:#0f172a; font-size:20px; font-weight:800;">
                You're Invited! 🎉
              </h2>
              <p style="margin:0 0 24px; color:#64748b; font-size:14px; line-height:1.6;">
                <strong style="color:#0f172a;">${inviterName}</strong> has invited you to join the
                <strong style="color:#2563eb;">${workspaceName}</strong> workspace on TeamTask.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align:center; padding: 8px 0 24px;">
                    <a href="${inviteLink}" style="display:inline-block; background:linear-gradient(135deg, #2563eb, #1d4ed8); color:#ffffff; text-decoration:none; padding:14px 40px; border-radius:12px; font-size:14px; font-weight:700; letter-spacing:0.3px; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 16px; color:#94a3b8; font-size:12px; line-height:1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px; padding:12px 16px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0; word-break:break-all;">
                <a href="${inviteLink}" style="color:#2563eb; font-size:12px; text-decoration:none; font-family:monospace;">${inviteLink}</a>
              </p>
              
              <div style="border-top:1px solid #f1f5f9; padding-top:20px; margin-top:8px;">
                <p style="margin:0; color:#94a3b8; font-size:11px; line-height:1.5;">
                  ⏰ This invitation expires in <strong>7 days</strong>.<br>
                  If you didn't expect this email, you can safely ignore it.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc; padding:20px 40px; text-align:center; border-top:1px solid #f1f5f9;">
              <p style="margin:0; color:#94a3b8; font-size:11px;">
                Sent by TeamTask · Workspace Management Made Simple
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`✉️  Invite email sent to ${to}`);
  } catch (error: any) {
    const errorDetail = error?.response?.body?.errors?.[0]?.message || error.message;
    console.error('SendGrid email error:', errorDetail);
    throw new Error(errorDetail);
  }
};
