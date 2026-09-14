import Link from "next/link"
import BrandMark from "../_components/brand-mark"
import LinkView from "../dashboard/[groupId]/link-view"
import { fixtureEvents, fixtureExpenses, fixtureIdeas, fixtureLinks, fixturePhotos } from "@/lib/fixtures"

// Public preview: the full Link experience on fixture data, no session.
// TODO(plug): remove once real onboarding funnels into /dashboard.
export default function PreviewPage() {
  const groupId = "link-big-bear"
  const row = fixtureLinks.find(link => link.group_id === groupId) || fixtureLinks[0]
  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1a1a1a]">
      <header className="border-b-[3px] border-[#1a1a1a] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Linkup home">
            <BrandMark size={38} />
            <div className="text-xl font-black tracking-tight">linkup</div>
          </Link>
          <span className="rounded-lg border-[3px] border-[#1a1a1a] bg-brand-lemon px-2 py-1 text-[10px] font-black">PREVIEW</span>
          <Link href="/auth?mode=signup" className="ml-auto rounded-xl border-[3px] border-[#1a1a1a] bg-[#1a1a1a] px-4 py-2 text-sm font-black text-white shadow-[3px_3px_0_rgba(26,26,26,.25)]">
            Make it yours
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-7 sm:px-6 sm:pt-10">
        <LinkView
          groupId={row.group_id}
          name={row.groups?.name || "Untitled link"}
          description={row.groups?.description || null}
          role={row.role}
          memberCount={row.member_count ?? 0}
          initialEvents={fixtureEvents[row.group_id] || []}
          initialIdeas={fixtureIdeas[row.group_id] || []}
          initialExpenses={fixtureExpenses[row.group_id] || []}
          initialPhotos={fixturePhotos[row.group_id] || []}
        />
      </div>
    </main>
  )
}
