import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // NextAuth v5 si fida automaticamente dell'host solo in dev. In produzione
  // (build + start, e dietro il proxy di Vercel) l'host va dichiarato fidato
  // esplicitamente, altrimenti /api/auth/* risponde 500 UntrustedHost.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Google verifica sempre la proprietà dell'email: è quindi sicuro
      // collegare automaticamente l'account Google a un utente già esistente
      // con la stessa email (es. registrato prima con email+password), invece
      // di bloccare il login con OAuthAccountNotLinked.
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email.toLowerCase().trim(),
          image: profile.picture,
        };
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase().trim();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    // Google marca email_verified=false nei rari casi di indirizzo non
    // verificato (es. dominio G Suite con verifica disattivata): con
    // allowDangerousEmailAccountLinking attivo, meglio bloccare esplicitamente
    // questo caso piuttosto che fidarsi ciecamente del match sull'email.
    async signIn({ account, profile }) {
      if (account?.provider === "google" && profile?.email_verified === false) {
        return false;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
