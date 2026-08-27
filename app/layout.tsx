import type { Metadata } from 'next'
import './globals.css'
import '@ascentsparksoftware/react-calendar/styles.css'
import 'react-tourlight/styles.css'

export const metadata: Metadata = {
  title: 'Linkup · Get the group out of the chat',
  description: 'One playful home for your group’s dates, ideas, and plans.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
