import DashboardShell from "../_components/shell"
import LinkPage from "./link-page"

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  return <DashboardShell title="Link" eyebrow="ONE SHARED HOME"><LinkPage groupId={groupId} /></DashboardShell>
}
