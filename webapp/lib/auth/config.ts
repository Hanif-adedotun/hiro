import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "@/lib/db/client"
import { getGitHubSyncData, type GitHubProfileLike } from "./github-profile"

const isDev = process.env.NODE_ENV === "development"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (!session.user || !user?.id) return session
      session.user.id = user.id
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
        })
        if (dbUser) {
          session.user.githubId = dbUser.githubId ?? undefined
        }
      } catch (err) {
        if (isDev) console.error("[auth] session callback:", err)
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider !== "github" || !account.access_token) return true
      try {
        const gh = profile as GitHubProfileLike | null
        const data = getGitHubSyncData(gh, account, user)
        if (!data.githubId) return true
        // Only update if this is an existing DB user (id is our cuid). New users sync in events.signIn.
        const maybeDbId = (user as { id?: string }).id
        const existing =
          typeof maybeDbId === "string" && maybeDbId.length > 20
            ? await prisma.user.findFirst({ where: { id: maybeDbId } })
            : null
        if (existing) {
          await prisma.user.update({
            where: { id: existing.id },
            data: {
              githubId: data.githubId,
              username: data.username,
              email: data.email,
              avatarUrl: data.avatarUrl,
              accessToken: data.accessToken,
            },
          })
        }
      } catch (err) {
        if (isDev) console.error("[auth] signIn callback:", err)
        // Never throw: avoid NextAuth putting error message in redirect Location header
      }
      return true
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "github" || !account.access_token || !user?.id) return
      try {
        const gh = profile as GitHubProfileLike | undefined
        const data = getGitHubSyncData(gh, account, user)
        if (!data.githubId) return
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubId: data.githubId,
            username: data.username,
            email: data.email,
            avatarUrl: data.avatarUrl,
            accessToken: data.accessToken,
          },
        })
      } catch (err) {
        if (isDev) console.error("[auth] events.signIn:", err)
        // User is already created/linked; sync can retry on next sign-in
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "database",
  },
}

