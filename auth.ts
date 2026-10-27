import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import prisma from "@/lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NODE_ENV === "development",
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.role = user.role
      return session
    },
  },
})
