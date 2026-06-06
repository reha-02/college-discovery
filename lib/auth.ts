// lib/auth.ts
// NextAuth configuration — Google + Email providers, Prisma adapter

import { PrismaAdapter } from "@auth/prisma-adapter";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { verifySecret } from "@/lib/password";

async function consumeOtp({
  email,
  code,
  purpose,
}: {
  email: string;
  code: string;
  purpose: "login" | "signup";
}) {
  const otp = await prisma.emailOtp.findFirst({
    where: {
      email,
      purpose,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otp || otp.attempts >= 5) return null;

  const valid = await verifySecret(code, otp.codeHash);
  if (!valid) {
    await prisma.emailOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });
    return null;
  }

  await prisma.emailOtp.update({
    where: { id: otp.id },
    data: { consumedAt: new Date() },
  });

  return otp;
}

export const authOptions: NextAuthOptions = {
  // Use Prisma to store sessions and users
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: "email-password",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
        flow: { label: "Flow", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        const otpCode = credentials?.otp?.trim() ?? "";
        const flow = credentials?.flow === "signup" ? "signup" : "login";

        if (!email || !password || !otpCode) return null;

        if (flow === "signup") {
          const otp = await consumeOtp({ email, code: otpCode, purpose: "signup" });
          if (!otp?.passwordHash) return null;
          const passwordMatchesSignup = await verifySecret(password, otp.passwordHash);
          if (!passwordMatchesSignup) return null;

          const existingUser = await prisma.user.findUnique({ where: { email } });
          if (existingUser?.passwordHash) return null;

          const user = existingUser
            ? await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  name: otp.name ?? credentials?.name ?? existingUser.name,
                  passwordHash: otp.passwordHash,
                  emailVerified: existingUser.emailVerified ?? new Date(),
                },
              })
            : await prisma.user.create({
                data: {
                  email,
                  name: otp.name ?? credentials?.name ?? email.split("@")[0],
                  passwordHash: otp.passwordHash,
                  emailVerified: new Date(),
                },
              });

          return { id: user.id, email: user.email, name: user.name, image: user.image };
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const passwordMatches = await verifySecret(password, user.passwordHash);
        if (!passwordMatches) return null;

        const otp = await consumeOtp({ email, code: otpCode, purpose: "login" });
        if (!otp) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    // Attach user ID to the JWT so it's accessible in server components
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};
