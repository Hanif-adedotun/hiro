import { NextRequest, NextResponse } from 'next/server'

/**
 * GitHub OAuth callback URL: https://hiro.hanif.one/github/callback
 * Forwards to NextAuth's callback handler so the OAuth app can use this URL.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const redirectUrl = new URL('/api/auth/callback/github', request.url)
  searchParams.forEach((value: string, key: string) => {
    redirectUrl.searchParams.set(key, value)
  })
  return NextResponse.redirect(redirectUrl)
}
