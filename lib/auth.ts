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
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      try {
        if (!user.email) return `/denied?reason=no_email`;

        const allowed = await isEmailWhitelisted(user.email);
        if (!allowed) {
          const encoded = encodeURIComponent(user.email);
          return `/denied?reason=not_whitelisted&email=${encoded}`;
        }

        return true;
      } catch (err) {
        // DB error — log it and block sign-in rather than silently failing
        console.error("[auth] signIn callback error:", err);
        return `/denied?reason=db_error`;
      }
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