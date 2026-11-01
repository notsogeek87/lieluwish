import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe subset of the NextAuth config: no providers (Credentials'
 * `authorize` needs Prisma + bcrypt, which cannot run on the Edge runtime).
 * Next.js middleware always runs on the Edge runtime, so it must only ever
 * import this file, never src/lib/auth.ts.
 */
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.familyId = user.familyId;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.familyId = token.familyId as string;
      }
      return session;
    },
  },
};
