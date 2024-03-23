import NextAuth from "next-auth";

import Google from "next-auth/providers/google";

import type { NextAuthConfig } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./lib/db";

export const config = {
  theme: {},
  adapter: DrizzleAdapter(db),
  providers: [Google],
  basePath: "/auth",
  callbacks: {},
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
