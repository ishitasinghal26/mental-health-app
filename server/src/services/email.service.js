const nodemailer = require("nodemailer");

/**
 * Creates a nodemailer transporter using Gmail SMTP.
 * Requires GMAIL_USER and GMAIL_APP_PASSWORD in .env
 */
function createTransporter() {
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Sends a 6-digit OTP email to the user.
 * @param {string} toEmail - recipient email
 * @param {string} otp - the 6-digit code
 * @param {string} name - user's first name for personalisation
 */
async function sendOtpEmail(toEmail, otp, name = "there") {
  const transporter = createTransporter();

  const html = `
    <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #fff8f8; border-radius: 16px; border: 1px solid #fecdd3;">
      <h2 style="color: #f43f5e; margin-bottom: 8px;">MindKare</h2>
      <p style="color: #374151; margin-bottom: 24px;">Hi ${name}, welcome! 🌸</p>

      <p style="color: #6b7280; margin-bottom: 16px;">
        Use the verification code below to confirm your email address. It expires in <strong>5 minutes</strong>.
      </p>

      <div style="background: linear-gradient(135deg, #fda4af, #f9a8d4); border-radius: 12px; padding: 20px 32px; text-align: center; margin: 24px 0;">
        <span style="font-size: 36px; font-weight: 900; letter-spacing: 12px; color: white;">${otp}</span>
      </div>

      <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
        If you didn't request this, you can safely ignore this email.
        Never share this code with anyone.
      </p>

      <p style="color: #9ca3af; font-size: 12px; margin-top: 16px; border-top: 1px solid #fecdd3; padding-top: 16px;">
        MindKare — Your safe space for mental wellness.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"MindKare" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Your MindKare verification code",
    html,
  });
}

/**
 * Generates a cryptographically random 6-digit OTP string.
 */
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = { sendOtpEmail, generateOtp };
