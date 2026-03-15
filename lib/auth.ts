import { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isEmailWhitelisted } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    /**
     * Runs before a session is created.
     * Returns true  → login proceeds
     * Returns false → login blocked (redirects to /denied)
     * Returns a URL → redirect to that URL
     */
    async signIn({ user }) {
      if (!user.email) return "/denied?reason=no_email";

      const allowed = await isEmailWhitelisted(user.email);
      if (!allowed) {
        const encoded = encodeURIComponent(user.email);
        return `/denied?reason=not_whitelisted&email=${encoded}`;
      }

      return true;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as typeof session.user & { id: string }).id = token.sub;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
  },
  pages: {
    signIn: "/",
    error: "/denied",
  },
};