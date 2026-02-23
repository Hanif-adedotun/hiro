import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      githubId?: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }

  interface User {
    id: string
    githubId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    githubId: string
  }
}

