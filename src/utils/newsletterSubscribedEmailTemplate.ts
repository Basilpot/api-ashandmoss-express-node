import { EnvConfig } from "@/configs/env.config";

export const newsLetterSubscribedEmailTemplate = (
  email: string,
  unsubscribeToken: string
) => {
  return `<!DOCTYPE html>
<body style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td align="center" style="background-color: #D81B60; padding: 40px 20px 20px 20px;">
                            <h1 style="margin: 0; font-size: 28px; color: #ffffff; font-weight: bold; letter-spacing: 1px;">
                            My Easy Guide
                            </h1>
                            <p style="margin: 5px 0 0 0; font-size: 14px; color: #fce4ec;">
                                Your journey starts now.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 40px 20px;">
                            <div style="width: 70px; height: 70px; border-radius: 50%; background-color: #E91E63; margin: 0 auto 25px auto; line-height: 70px;">
                                <span style="font-size: 32px; color: #ffffff; display: block; height: 70px; line-height: 70px;">&#10003;</span>
                            </div>

                            <h2 style="font-size: 24px; color: #333333; margin: 0 0 15px 0;">
                                You're Officially Subscribed!
                            </h2>

                            <p style="font-size: 16px; line-height: 24px; color: #555555; margin: 0 0 25px 0;">
                                Thank you for joining our community. You are now subscribed to our newsletter and will receive the latest updates, special offers, and news straight to your inbox.
                            </p>

                            <p style="font-size: 16px; line-height: 24px; color: #555555; margin: 0 0 35px 0;">
                                Expect your first newsletter in the next few days. We can't wait to share our content with you.
                            </p>

                            <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                                <tr>
                                    <td align="center" style="border-radius: 50px;" bgcolor="#E91E63">
                                        <a href="https://myeasyguide.com" target="_blank" style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 50px; padding: 12px 25px; border: 1px solid #E91E63; display: inline-block; font-weight: bold;">
                                            Visit Our Website
                                        </a>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="padding: 30px 20px; background-color: #FCE4EC; border-radius: 0 0 8px 8px;">
                            <p style="font-size: 12px; line-height: 18px; color: #888888; margin: 0 0 10px 0;">
                                This email was sent to ${email}. If you did not subscribe, please ignore this message.
                                OR <a href="https://${EnvConfig.BASE_URL}/newsletter/unsubscribe?token=${unsubscribeToken}" target="_blank" style="color: #D81B60; text-decoration: none;">Unsubscribe here</a>.
                            </p>
                            <p style="font-size: 12px; line-height: 18px; color: #888888; margin: 0;">
                                &copy; ${new Date().getFullYear()} My Easy Guide. All rights reserved.
                            </p>
                            <p style="font-size: 12px; line-height: 18px; margin: 10px 0 0 0;">
                                <a href="https://myeasyguide.com/privacy-policy" target="_blank" style="color: #D81B60; text-decoration: none;">Privacy Policy</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};
