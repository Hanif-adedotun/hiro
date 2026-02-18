import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "@/lib/db/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        // Get user from database to include GitHub ID
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email || undefined },
        })
        if (dbUser) {
          session.user.id = dbUser.id
          session.user.githubId = dbUser.githubId
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && account.access_token) {
        // Store or update user with GitHub access token
        const githubId = profile?.id?.toString() || account.providerAccountId
        
        await prisma.user.upsert({
          where: { githubId },
          update: {
            username: profile?.login || user.name || "",
            email: user.email || null,
            avatarUrl: profile?.avatar_url || user.image || null,
            accessToken: account.access_token, // In production, encrypt this
          },
          create: {
            githubId,
            username: profile?.login || user.name || "",
            email: user.email || null,
            avatarUrl: profile?.avatar_url || user.image || null,
            accessToken: account.access_token, // In production, encrypt this
          },
        })
      }
      return true
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "database",
  },
}

