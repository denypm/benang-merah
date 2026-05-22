import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    "https://hwuxlxqmaqowtpvcjmdc.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3dXhseHFtYXFvd3RwdmNqbWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDE4NTQsImV4cCI6MjA5NDA3Nzg1NH0.U1vptiMEZh52VsPAb6S1nNvPfroZkTHEfo_zL1cl_U0",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
