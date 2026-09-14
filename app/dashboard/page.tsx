import GroupsBoard from "./groups/groups-board"
import DashboardShell from "./_components/shell"

export default function DashboardPage() {
  return <DashboardShell title="Your links" eyebrow="THE PEOPLE YOU PLAN WITH"><GroupsBoard /></DashboardShell>
}
