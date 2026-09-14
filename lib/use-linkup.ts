"use client"

// Preview seam hooks. Every hook returns fixture data with the EXACT shape
// of its future API response.
// TODO(plug): swap each body for its fetch() call — no component changes needed:
//   useLinks  -> GET /api/groups            ({ groups: LinkRow[] })
//   useLink   -> GET /api/groups (find row)  + localStorage active id
//   useEvents -> GET /api/events?groupId=    ({ events: [...] })
//   useIdeas  -> GET /api/ideas?groupId=     ({ ideas: [...] })
//   useExpenses -> GET /api/expenses?groupId= ({ expenses: [...] })
//   usePhotos -> GET /api/photos             ({ photos: [...] }) then filter
//   useSession -> GET /api/auth/me           ({ profile, user })

import { useState } from "react"
import {
  fixtureEvents,
  fixtureExpenses,
  fixtureIdeas,
  fixtureLinks,
  fixturePhotos,
  type LinkRow,
  type PreviewEvent,
  type PreviewExpense,
  type PreviewIdea,
  type PreviewPhoto,
} from "./fixtures"

export function useLinks() {
  const [links] = useState<LinkRow[]>(fixtureLinks)
  return { links, loading: false }
}

export function useLink(groupId: string) {
  const [link] = useState<LinkRow | null>(() => fixtureLinks.find(row => row.group_id === groupId) || null)
  return { link, loading: false }
}

export function useEvents(groupId: string) {
  const [events] = useState<PreviewEvent[]>(fixtureEvents[groupId] || [])
  return { events }
}

export function useIdeas(groupId: string) {
  const [ideas, setIdeas] = useState<PreviewIdea[]>(fixtureIdeas[groupId] || [])
  return { ideas, setIdeas }
}

export function useExpenses(groupId: string) {
  const [expenses] = useState<PreviewExpense[]>(fixtureExpenses[groupId] || [])
  return { expenses }
}

export function usePhotos(groupId: string) {
  const [photos] = useState<PreviewPhoto[]>(fixturePhotos[groupId] || [])
  return { photos }
}

export function useSession() {
  const [session] = useState({ name: "Rishith", initial: "R" })
  return { session }
}
