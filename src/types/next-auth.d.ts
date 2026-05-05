import 'next-auth'

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
    }
  }
}
