/**
 * GitHub OAuth profile shape (profile + account) for use in signIn/events.
 * Keeps casting in one place and avoids repeated optional chains.
 */
export type GitHubProfileLike = {
  id?: string | number
  login?: string
  avatar_url?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export function getGitHubSyncData(
  profile: GitHubProfileLike | null | undefined,
  account: { providerAccountId: string; access_token?: string } | null | undefined,
  user: { name?: string | null; email?: string | null; image?: string | null } | null | undefined
) {
  const githubId = profile?.id != null ? String(profile.id) : account?.providerAccountId ?? ""
  return {
    githubId,
    username: profile?.login ?? user?.name ?? null,
    email: user?.email ?? null,
    avatarUrl: profile?.avatar_url ?? user?.image ?? null,
    accessToken: account?.access_token ?? null,
  }
}
