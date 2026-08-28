import LinkupExperience from "./_components/linkup-experience"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export default async function Home() {
  const supabase = await createSupabaseServerClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const isAuthenticated = Boolean(claimsData?.claims?.sub)
  return <LinkupExperience isAuthenticated={isAuthenticated} />
}
