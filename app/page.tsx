import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function Home() {
  const hasSession = Boolean((await cookies()).get('linkup_access_token')?.value)
  redirect(hasSession ? '/dashboard' : '/welcome')
}
