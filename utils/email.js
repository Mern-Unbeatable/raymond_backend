const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp, name = "") => {
  await transporter.sendMail({
    from: `"Raymond Real Estate" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Password Reset OTP - Raymond",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px;">
        <h2 style="color:#1f2937;">Password Reset Request</h2>
        <p style="color:#374151;">Hello${name ? " " + name : ""},</p>
        <p style="color:#374151;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div style="text-align:center;margin:32px 0;">
          <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#4f46e5;">${otp}</span>
        </div>
        <p style="color:#6b7280;font-size:13px;">If you did not request a password reset, please ignore this email. Your account is safe.</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail };
