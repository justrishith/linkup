"use client"

// Client boundary for the neobrutalism barrel. The library's entry imports
// browser-only modules (react-hook-form) that break Server Component builds,
// so server files import from here instead of the package directly.

export {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stat,
} from "neobrutalism-ui-react"
export type { DialogHandle } from "neobrutalism-ui-react"
