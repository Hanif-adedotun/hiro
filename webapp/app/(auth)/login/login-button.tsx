"use client"

import { signIn } from "next-auth/react"

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn("github", { callbackUrl: "/" })}
      className="w-full rounded-md bg-gray-900 px-4 py-3 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
    >
      Sign in with GitHub
    </button>
  )
}

