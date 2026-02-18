import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import LoginButton from "./login-button"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Hiro</h1>
          <p className="mt-2 text-gray-600">
            AI-Powered Test Generation Platform
          </p>
        </div>
        
        <LoginButton />
        
        <p className="text-center text-sm text-gray-500">
          By signing in, you agree to grant Hiro access to your repositories
        </p>
      </div>
    </div>
  )
}
