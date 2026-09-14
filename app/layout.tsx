import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Linkup · Get the group out of the chat",
  description: "One playful home for the date, the vote, and the plan.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
