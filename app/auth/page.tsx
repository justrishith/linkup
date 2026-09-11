import CrewAuth from "../_components/crew-auth"
import { safeNextPath } from "@/lib/auth-redirect"

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams
  return <CrewAuth nextPath={safeNextPath(next)} initialError={error || ""} />
}
