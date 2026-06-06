// lib/mail.ts
// Transactional email helper for authentication OTP delivery.

import nodemailer from "nodemailer";

export async function sendOtpEmail({
  email,
  code,
  purpose,
}: {
  email: string;
  code: string;
  purpose: "login" | "signup";
}) {
  const server = process.env.EMAIL_SERVER;
  const from = process.env.EMAIL_FROM ?? "CollegeFinder <noreply@college-discovery.app>";
  const action = purpose === "signup" ? "complete your CollegeFinder signup" : "sign in to CollegeFinder";

  if (!server) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[auth otp] ${email}: ${code}`);
      return;
    }
    throw new Error("EMAIL_SERVER is not configured");
  }

  const transporter = nodemailer.createTransport(server);
  await transporter.sendMail({
    to: email,
    from,
    subject: `Your CollegeFinder OTP is ${code}`,
    text: `Use ${code} to ${action}. This code expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827">
        <h2 style="margin:0 0 12px">CollegeFinder verification</h2>
        <p>Use this OTP to ${action}:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:16px 0">${code}</p>
        <p style="color:#6b7280">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    `,
  });
}
