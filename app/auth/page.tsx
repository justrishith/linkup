import CrewAuth from "../_components/crew-auth"
import { safeNextPath } from "@/lib/auth-redirect"

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string; mode?: string }> }) {
  const { next, error, mode } = await searchParams
  const initialMode = mode === "signup" ? "signup" : "login"
  return <CrewAuth nextPath={safeNextPath(next)} initialError={error || ""} mode={initialMode} />
}
