import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { authConfig } from "@/lib/auth.config";
import { clientIp, consumeRateLimit } from "@/lib/rate-limit";

/** Surfaced to the login page as ?error=rate. */
export class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited";
}

// Full config, Node.js runtime only (route handlers, server actions, RSCs).
// See src/lib/auth.config.ts for why middleware must not import this file.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") return null;
        const normalized = email.toLowerCase().trim();

        // Brute-force protection, enforced here so it also covers direct
        // calls to /api/auth/callback/credentials: 10 attempts per minute per
        // IP, and 10 per 15 minutes per account.
        const ip = clientIp(request.headers);
        const allowed =
          (await consumeRateLimit(`login-ip:${ip}`, 10, 60)) &&
          (await consumeRateLimit(`login-email:${normalized}`, 10, 15 * 60));
        if (!allowed) throw new TooManyAttempts();

        const user = await prisma.user.findUnique({
          where: { email: normalized },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: decrypt(user.name),
          familyId: user.familyId,
        };
      },
    }),
  ],
});
