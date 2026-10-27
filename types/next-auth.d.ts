import { DefaultSession, DefaultUser } from "@auth/prisma-adapter"

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}
