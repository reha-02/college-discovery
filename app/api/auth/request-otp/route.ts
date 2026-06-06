// app/api/auth/request-otp/route.ts
// Sends OTP codes for email/password signup and login.

import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
import { createOtpCode, hashSecret, verifySecret } from "@/lib/password";
import { sendOtpEmail } from "@/lib/mail";
import { z } from "zod";

const requestOtpSchema = z.object({
  flow: z.enum(["login", "signup"]),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(100),
  name: z.string().trim().min(1).max(80).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const parsed = requestOtpSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Invalid authentication payload", 400, parsed.error.flatten());
    }

    const { flow, email, password, name } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (flow === "signup" && user?.passwordHash) {
      return apiError("An account already exists for this email", 409);
    }

    if (flow === "login") {
      const validPassword = await verifySecret(password, user?.passwordHash);
      if (!user || !validPassword) {
        return apiError("Invalid email or password", 401);
      }
    }

    await prisma.emailOtp.updateMany({
      where: { email, purpose: flow, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const code = createOtpCode();
    await prisma.emailOtp.create({
      data: {
        email,
        purpose: flow,
        codeHash: await hashSecret(code),
        passwordHash: flow === "signup" ? await hashSecret(password) : null,
        name: flow === "signup" ? name : null,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOtpEmail({ email, code, purpose: flow });

    return Response.json({
      ok: true,
      data: { sent: true, expiresInMinutes: 10 },
      sent: true,
      meta: { flow },
    });
  } catch (error) {
    console.error("[POST /api/auth/request-otp]", error);
    return apiError("Could not send OTP. Check email settings and try again.", 500);
  }
}
