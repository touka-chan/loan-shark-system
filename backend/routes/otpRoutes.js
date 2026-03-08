// backend/routes/otpRoutes.js

import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

// ── SMTP credentials ──────────────────────────────────────────────────────────
const SMTP_USER = "onepunchsaitama00099@gmail.com";
const SMTP_PASS = "ehdxpdwwtmewpcyh";
const SMTP_FROM = `"EzLoan" <${SMTP_USER}>`;  // Changed from "LoanShark" to "EzLoan"

// ── In-memory OTP stores ──────────────────────────────────────────────────────
const otpStore = new Map();   // registration OTPs
const updateOtpStore = new Map();   // profile-update OTPs (separate to avoid collisions)

const OTP_TTL_MS = 5 * 60 * 1000;   // 5 minutes
const MAX_ATTEMPTS = 5;                // max wrong guesses before lockout

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

// ── Email template: Registration ──────────────────────────────────────────────
function buildRegistrationEmailHTML(firstName, otp) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Outfit:wght@300;400;500;600;700&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:'Outfit',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e8ede8;overflow:hidden;box-shadow:0 4px 24px rgba(21,37,21,.08);">

          <!-- Header with #152515 color -->
          <tr>
            <td style="background:#152515;padding:24px 36px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-.2px;font-family:'Lora',serif;">EzLoan</p>
              <p style="margin:4px 0 0;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#9de89d;">Email Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <p style="margin:0 0 6px;font-size:20px;font-weight:600;color:#1a2e1a;font-family:'Lora',serif;">Hi ${firstName},</p>
              <p style="margin:0 0 28px;font-size:14px;color:#7a9a7a;line-height:1.65;">
                Use the 6-digit code below to verify your email and complete your EzLoan registration.
                This code is valid for <strong style="color:#152515;font-weight:600;">5 minutes</strong>.
              </p>

              <!-- OTP Box with green theme -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f4f6f5;border:2px solid #e8ede8;border-radius:12px;padding:24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7a9a7a;">Your verification code</p>
                    <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:14px;color:#152515;font-family:'Courier New',monospace;padding-left:14px;">${otp}</p>
                  </td>
                </tr>
              </table>

              <!-- Security notice - green soft background -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background:rgba(45,122,45,.08);border:1px solid rgba(45,122,45,.25);border-radius:10px;padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#2d7a2d;line-height:1.5;display:flex;align-items:center;gap:6px;">
                      <span style="font-size:16px;">🔒</span> Never share this code with anyone. EzLoan will never ask for your OTP.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">If you didn't request this, you can safely ignore this email.</p>
            </td>
          </tr>

          <!-- Footer with #152515 color -->
          <tr>
            <td style="padding:18px 36px;background:#f4f6f5;border-top:1px solid #e8ede8;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><p style="margin:0;font-size:12px;color:#7a9a7a;">© 2026 EzLoan. All rights reserved.</p></td>
                  <td style="text-align:right;"><p style="margin:0;font-size:12px;color:#7a9a7a;">support@ezloan.ph</p></td>
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

// ── Email template: Profile Update ───────────────────────────────────────────
function buildUpdateProfileEmailHTML(firstName, otp) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600&family=Outfit:wght@300;400;500;600;700&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:'Outfit',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e8ede8;overflow:hidden;box-shadow:0 4px 24px rgba(21,37,21,.08);">

          <!-- Header with #152515 color -->
          <tr>
            <td style="background:#152515;padding:24px 36px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-.2px;font-family:'Lora',serif;">EzLoan</p>
              <p style="margin:4px 0 0;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:#9de89d;">Profile Update Request</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 36px 28px;">
              <p style="margin:0 0 6px;font-size:20px;font-weight:600;color:#1a2e1a;font-family:'Lora',serif;">Hi ${firstName},</p>
              <p style="margin:0 0 28px;font-size:14px;color:#7a9a7a;line-height:1.65;">
                We received a request to update your EzLoan profile information.
                Use the verification code below to confirm your changes.
                This code is valid for <strong style="color:#152515;font-weight:600;">5 minutes</strong>.
              </p>

              <!-- OTP Box with green dashed border -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#f4f6f5;border:2px dashed #c8e8c8;border-radius:12px;padding:24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7a9a7a;">Confirmation Code</p>
                    <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:14px;color:#152515;font-family:'Courier New',monospace;padding-left:14px;">${otp}</p>
                  </td>
                </tr>
              </table>

              <!-- Warning notice - orange for profile updates -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background:#fff9ed;border:1px solid #f8e4b0;border-radius:10px;padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#c47a00;line-height:1.5;display:flex;align-items:center;gap:6px;">
                      <span style="font-size:16px;">⚠️</span> If you did <strong>not</strong> request a profile update, please ignore this email
                      or contact support immediately — your account may be at risk.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Security notice - green soft background -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background:rgba(45,122,45,.08);border:1px solid rgba(45,122,45,.25);border-radius:10px;padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#2d7a2d;line-height:1.5;display:flex;align-items:center;gap:6px;">
                      <span style="font-size:16px;">🔒</span> Never share this code with anyone. EzLoan will never ask for your OTP.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer with #152515 color -->
          <tr>
            <td style="padding:18px 36px;background:#f4f6f5;border-top:1px solid #e8ede8;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td><p style="margin:0;font-size:12px;color:#7a9a7a;">© 2026 EzLoan. All rights reserved.</p></td>
                  <td style="text-align:right;"><p style="margin:0;font-size:12px;color:#7a9a7a;">support@ezloan.ph</p></td>
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


// ══════════════════════════════════════════════════════════════════════════════
// REGISTRATION OTP ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────
router.post("/send-otp", async (req, res) => {
  const { email, firstName = "there" } = req.body;

  if (!email)
    return res.status(400).json({ message: "Email is required." });

  const otp = generateOTP();
  const expiresAt = Date.now() + OTP_TTL_MS;
  otpStore.set(email.toLowerCase(), { otp, expiresAt, attempts: 0 });

  try {
    await createTransporter().sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Your EzLoan Verification Code",
      html: buildRegistrationEmailHTML(firstName, otp),
      text: `Hi ${firstName},\n\nYour EzLoan verification code is: ${otp}\n\nThis code expires in 5 minutes.\n\nNever share this code with anyone.\n\n© 2026 EzLoan`,
    });

    return res.status(200).json({ message: "Verification code sent." });
  } catch (err) {
    console.error("SMTP error (send-otp):", err);
    otpStore.delete(email.toLowerCase());
    return res.status(500).json({ message: "Failed to send verification email. Check SMTP configuration." });
  }
});

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Email and code are required." });

  const record = otpStore.get(email.toLowerCase());

  if (!record)
    return res.status(400).json({ message: "No verification code found. Please request a new one." });

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


// ══════════════════════════════════════════════════════════════════════════════
// PROFILE UPDATE OTP ROUTES
// ══════════════════════════════════════════════════════════════════════════════

// ── POST /api/auth/send-update-otp ───────────────────────────────────────────
router.post("/send-update-otp", async (req, res) => {
  const { email, firstName = "there" } = req.body;

  if (!email)
    return res.status(400).json({ message: "Email is required." });

  const otp = generateOTP();
  const expiresAt = Date.now() + OTP_TTL_MS;

  // Separate store — never collides with registration OTPs
  updateOtpStore.set(email.toLowerCase(), { otp, expiresAt, attempts: 0 });

  try {
    await createTransporter().sendMail({
      from: SMTP_FROM,
      to: email,
      subject: "Confirm Your Profile Update — EzLoan",
      html: buildUpdateProfileEmailHTML(firstName, otp),
      text: `Hi ${firstName},\n\nYour EzLoan profile update confirmation code is: ${otp}\n\nThis code expires in 5 minutes.\n\nIf you did not request a profile update, please ignore this email.\n\nNever share this code with anyone.\n\n© 2026 EzLoan`,
    });

    return res.status(200).json({ message: "Confirmation code sent to your email." });
  } catch (err) {
    console.error("SMTP error (send-update-otp):", err);
    updateOtpStore.delete(email.toLowerCase());
    return res.status(500).json({ message: "Failed to send confirmation email. Please try again." });
  }
});

// ── POST /api/auth/verify-update-otp ─────────────────────────────────────────
router.post("/verify-update-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp)
    return res.status(400).json({ message: "Email and code are required." });

  const record = updateOtpStore.get(email.toLowerCase());

  if (!record)
    return res.status(400).json({ message: "No confirmation code found. Please request a new one." });

  if (Date.now() > record.expiresAt) {
    updateOtpStore.delete(email.toLowerCase());
    return res.status(400).json({ message: "Code has expired. Please request a new one." });
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    updateOtpStore.delete(email.toLowerCase());
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

  // ✅ Correct — delete immediately (one-time use)
  updateOtpStore.delete(email.toLowerCase());
  return res.status(200).json({ message: "Profile update confirmed successfully." });
});


export default router;