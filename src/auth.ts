import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  loginOrEmail: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/logowanie",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role as Role;
        token.login = user.login ?? null;
        token.mustSetEmailOnLogin = user.mustSetEmailOnLogin ?? false;
        token.mustChangePassword = user.mustChangePassword ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (!token.id) return session;
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      session.user.login = token.login ?? null;
      session.user.mustSetEmailOnLogin = Boolean(token.mustSetEmailOnLogin);
      session.user.mustChangePassword = Boolean(token.mustChangePassword);
      return session;
    },
  },
  providers: [
    Credentials({
      name: "login",
      credentials: {
        loginOrEmail: { label: "Login lub e-mail", type: "text" },
        password: { label: "Hasło", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { loginOrEmail, password } = parsed.data;
        const trimmed = loginOrEmail.trim();
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { login: trimmed },
              { email: { equals: trimmed, mode: "insensitive" } },
            ],
          },
        });

        if (!user || !user.accountActive) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          role: user.role,
          login: user.login,
          mustSetEmailOnLogin: user.mustSetEmailOnLogin,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});
