import NextAuth from "next-auth";

import Google from "next-auth/providers/google";

import type { NextAuthConfig } from "next-auth";

export const config = {
  theme: {},
  providers: [Google],
  basePath: "/auth",
  callbacks: {},
  trustHost: true,
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
