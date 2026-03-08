// backend/routes/otpRoutes.js

import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// ── SMTP credentials (hardcoded to bypass dotenv path issues) ─────────────────
const SMTP_USER = "onepunchsaitama00099@gmail.com";
const SMTP_PASS = "ehdxpdwwtmewpcyh";
const SMTP_FROM = `"LoanShark" <${SMTP_USER}>`;

// In-memory OTP store: { email -> { otp, expiresAt, attempts } }
const otpStore = new Map();

const OTP_TTL_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_ATTEMPTS = 5;               // max wrong guesses before lockout

// ── Helper: create transporter ────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

// ── Helper: generate 6-digit OTP ─────────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ── Helper: branded HTML email ────────────────────────────────────────────────
function buildEmailHTML(firstName, otp) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;border:1px solid #e5e7eb;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#1a1a2e;padding:24px 36px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-.2px;">🦈 LoanShark</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <p style="margin:0 0 18px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2563eb;">Email Verification</p>
              <p style="margin:0 0 6px;font-size:20px;font-weight:600;color:#1a1a2e;">Hi ${firstName},</p>
              <p style="margin:0 0 28px;font-size:14px;color:#6b7280;line-height:1.65;">
                Use the 6-digit code below to verify your email and complete your LoanShark registration.
                This code is valid for <strong style="color:#1a1a2e;font-weight:600;">5 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#9ca3af;">Your verification code</p>
                    <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:14px;color:#1a1a2e;font-family:'Courier New',monospace;padding-left:14px;">${otp}</p>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#dc2626;line-height:1.5;">⚠️ Never share this code with anyone. LoanShark will never ask for your OTP.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:18px 36px;background:#f9fafb;border-top:1px solid #f0f0f0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><p style="margin:0;font-size:12px;color:#9ca3af;">© 2026 LoanShark. All rights reserved.</p></td>
                  <td style="text-align:right;"><p style="margin:0;font-size:12px;color:#9ca3af;">support@loanshark.ph</p></td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────
router.post("/send-otp", async (req, res) => {
  const { email, firstName = "there" } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + OTP_TTL_MS;
  otpStore.set(email.toLowerCase(), { otp, expiresAt, attempts: 0 });

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Your LoanShark Verification Code",
      html: buildEmailHTML(firstName, otp),
      text: `Hi ${firstName},\n\nYour LoanShark verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nNever share this code with anyone.\n\n© 2026 LoanShark`,
    });

    return res.status(200).json({ message: "Verification code sent." });
  } catch (err) {
    console.error("SMTP error:", err);
    otpStore.delete(email.toLowerCase());
    return res.status(500).json({ message: "Failed to send verification email. Check SMTP configuration." });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and code are required." });
  }

  const record = otpStore.get(email.toLowerCase());

  if (!record) {
    return res.status(400).json({ message: "No verification code found. Please request a new one." });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return res.status(400).json({ message: "Code has expired. Please request a new one." });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(email.toLowerCase());
    return res.status(429).json({ message: "Too many incorrect attempts. Please request a new code." });
  }

  if (record.otp !== otp.toString()) {
    record.attempts += 1;
    const remaining = MAX_ATTEMPTS - record.attempts;
    return res.status(400).json({
      message: remaining > 0
        ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
        : "Too many incorrect attempts. Please request a new code."
    });
  }

  otpStore.delete(email.toLowerCase());
  return res.status(200).json({ message: "Email verified successfully." });
});

export default router;