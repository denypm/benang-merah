import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    "https://hwuxlxqmaqowtpvcjmdc.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3dXhseHFtYXFvd3RwdmNqbWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MDE4NTQsImV4cCI6MjA5NDA3Nzg1NH0.U1vptiMEZh52VsPAb6S1nNvPfroZkTHEfo_zL1cl_U0"
  )
}
