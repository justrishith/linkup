import { cookies } from "next/headers"
import LinkupExperience from "./_components/linkup-experience"

export default async function Home() {
  const isAuthenticated = Boolean((await cookies()).get("linkup_access_token")?.value)
  return <LinkupExperience isAuthenticated={isAuthenticated} />
}
