// Preview fixtures. Shapes mirror the real API responses exactly so the
// seam hooks below can switch to fetch() with zero component changes.

export type LinkRow = {
  group_id: string
  role: string
  member_count?: number
  groups: { id: string; name: string; description?: string | null } | null
}

export type PreviewEvent = {
  id: string
  name: string
  description?: string | null
  starts_at?: string | null
  location?: string | null
}

export type PreviewIdea = {
  id: string
  title: string
  description?: string | null
  category?: string | null
  votes?: number
}

export type PreviewExpense = {
  id: string
  description: string
  amount: number
  currency: string
}

export type PreviewPhoto = {
  id: string
  storage_path: string
  caption?: string | null
}

const DAY = 86_400_000
const now = Date.now()
const iso = (offsetDays: number, hour: number) => {
  const date = new Date(now + offsetDays * DAY)
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

export const fixtureLinks: LinkRow[] = [
  {
    group_id: "link-big-bear",
    role: "owner",
    member_count: 6,
    groups: { id: "link-big-bear", name: "Big Bear weekend", description: "Cabin trip. Dates, food, gas money, and the photo dump." },
  },
  {
    group_id: "link-taco",
    role: "member",
    member_count: 4,
    groups: { id: "link-taco", name: "Taco Tuesdays", description: "Rotating dinner crew. Who picks the spot?" },
  },
]

export const fixtureEvents: Record<string, PreviewEvent[]> = {
  "link-big-bear": [
    { id: "ev-1", name: "Drive up", starts_at: iso(2, 17), location: "Rishith's driveway" },
    { id: "ev-2", name: "Lake day", starts_at: iso(3, 10), location: "Big Bear Lake" },
    { id: "ev-3", name: "Cabin dinner", starts_at: iso(3, 19), location: "The cabin" },
  ],
  "link-taco": [{ id: "ev-4", name: "Tacos at El Camino", starts_at: iso(5, 19), location: "El Camino" }],
}

export const fixtureIdeas: Record<string, PreviewIdea[]> = {
  "link-big-bear": [
    { id: "idea-1", title: "Sunrise hike", category: "Activity", votes: 5 },
    { id: "idea-2", title: "Rent a hot tub for one night", category: "Random", votes: 3 },
    { id: "idea-3", title: "Chili cook-off", category: "Food", votes: 4 },
  ],
  "link-taco": [{ id: "idea-4", title: "Birria crawl downtown", category: "Food", votes: 2 }],
}

export const fixtureExpenses: Record<string, PreviewExpense[]> = {
  "link-big-bear": [
    { id: "ex-1", description: "Cabin deposit", amount: 480, currency: "USD" },
    { id: "ex-2", description: "Groceries run", amount: 132.5, currency: "USD" },
    { id: "ex-3", description: "Gas", amount: 65, currency: "USD" },
  ],
  "link-taco": [{ id: "ex-4", description: "Tacos + horchata", amount: 48.75, currency: "USD" }],
}

export const fixturePhotos: Record<string, PreviewPhoto[]> = {
  "link-big-bear": [
    { id: "ph-1", storage_path: "big-bear/lake-sunset.jpg", caption: "Lake sunset" },
    { id: "ph-2", storage_path: "big-bear/cabin-porch.jpg", caption: "Porch hangs" },
    { id: "ph-3", storage_path: "big-bear/chili-night.jpg", caption: "Cook-off judging" },
  ],
  "link-taco": [],
}
