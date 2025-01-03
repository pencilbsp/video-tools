import NextAuth from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
// libs
import prisma from "@/libs/prisma"
import { NEXT_AUTH_SECRET } from "@/libs/configs"
// actions
import login from "@/actions/login"

// ----------------------------------------------------------------------

export const authOptions = {
  secret: NEXT_AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      async authorize(credentials, req) {
        const result = await login(credentials.email, credentials.password)
        if (result.error) throw new Error(result.error.message)
        return result
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id
      return Promise.resolve(token)
    },
    async session({ session, token }) {
      // async session({ session, token, user }) {
      return Promise.resolve({
        ...session,
        user: {
          ...session.user,
          id: token.id,
        },
      })
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  pages: {
    signIn: "/login",
    signUp: "/signup",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
