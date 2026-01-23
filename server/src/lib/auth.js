import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { deviceAuthorization } from "better-auth/plugins";
import prisma from "./db.js"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  basePath: "api/auth",
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: ["https://maverick-cli.vercel.app"],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }
  },
  plugins: [
    deviceAuthorization({
      expiresIn: "30m",
      interval: "5s",
    }),
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },
});


