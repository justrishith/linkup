import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Linkup · Your crew, in one place',
  description: 'Plan events, share ideas, split costs, and keep the memories together.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}