import { notFound } from "next/navigation"
import { fixtureEvents, fixtureExpenses, fixtureIdeas, fixtureLinks, fixturePhotos } from "@/lib/fixtures"
import LinkView from "./link-view"

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const row = fixtureLinks.find(link => link.group_id === groupId)
  // TODO(plug): replace fixture reads with GET /api/groups + ?groupId= fetches.
  if (!row) notFound()
  return (
    <LinkView
      groupId={groupId}
      name={row.groups?.name || "Untitled link"}
      description={row.groups?.description || null}
      role={row.role}
      memberCount={row.member_count ?? 0}
      initialEvents={fixtureEvents[groupId] || []}
      initialIdeas={fixtureIdeas[groupId] || []}
      initialExpenses={fixtureExpenses[groupId] || []}
      initialPhotos={fixturePhotos[groupId] || []}
    />
  )
}
