import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import LoginButton from "./login-button"
import { AuthErrorCard } from "./auth-error-card"
import { LoginShell } from "./login-shell"

const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  OAuthSignin: {
    title: "Sign-in setup error",
    description:
      "We couldn't start the GitHub sign-in flow. Please try again or contact support if it persists.",
  },
  OAuthCallback: {
    title: "Sign-in didn't complete",
    description:
      "GitHub sign-in failed (e.g. no access token or state missing). Use the same browser and don't open the callback link in a new tab. In your GitHub OAuth app set the callback URL to this site's origin + /api/auth/callback/github and ensure NEXTAUTH_URL matches. Try again.",
  },
  Callback: {
    title: "Sign-in didn't complete",
    description:
      "Something went wrong during sign-in. Please try again. If it keeps happening, set the callback URL in your GitHub OAuth app to your site origin + /api/auth/callback/github.",
  },
  OAuthCreateAccount: {
    title: "Account creation failed",
    description:
      "We couldn't create your account. Please try again or contact support.",
  },
  OAuthAccountNotLinked: {
    title: "Account already in use",
    description:
      "This GitHub account is already linked to another sign-in method. Try signing in with the same method you used originally.",
  },
  GetUserByAccountError: {
    title: "Sign-in error",
    description:
      "We couldn't look up your account. Please try again. If it persists, try signing out and back in.",
  },
  AdapterError: {
    title: "Sign-in error",
    description:
      "A temporary problem occurred while signing you in. Please try again.",
  },
  AccessDenied: {
    title: "Access denied",
    description:
      "You chose not to grant access. Sign in again and approve the requested permissions to continue.",
  },
  Configuration: {
    title: "Configuration error",
    description:
      "There's a problem with the sign-in setup. Please try again later or contact support.",
  },
  Default: {
    title: "Something went wrong",
    description:
      "Sign-in failed. Please try again. If the problem continues, contact support.",
  },
}

/** Only use known short error codes; long/encoded values can break UI or be unsafe. */
const KNOWN_ERROR_CODES = new Set(Object.keys(ERROR_MESSAGES))

function getSafeErrorCode(raw: string | undefined): string {
  if (!raw || typeof raw !== "string") return ""
  const code = raw.trim()
  if (code.length > 64) return ""
  return KNOWN_ERROR_CODES.has(code) ? code : "Default"
}

type PageProps = { searchParams: Promise<{ error?: string }> }

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  const resolved = await searchParams
  const errorCode = getSafeErrorCode(resolved?.error)
  const errorInfo = ERROR_MESSAGES[errorCode]

  return (
    <LoginShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Hiro
          </h1>
          <p className="mt-2 text-gray-600">
            AI-Powered Test Generation Platform
          </p>
        </div>

        {errorCode ? (
          <AuthErrorCard
            title={errorInfo.title}
            description={errorInfo.description}
          />
        ) : null}

        <LoginButton />

        <p className="text-center text-sm text-gray-500">
          By signing in, you agree to grant Hiro access to your repositories
        </p>
      </div>
    </LoginShell>
  )
}
