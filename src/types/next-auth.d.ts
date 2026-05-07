import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      userType?: string | null
      status?: string | null
      companyId?: string | null
      isAdmin?: boolean | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    userType?: string | null
    status?: string | null
    companyId?: string | null
    isAdmin?: boolean
  }
}
