import Link from "next/link"
import BrandMark from "../_components/brand-mark"
import DashNav from "./_components/dash-nav"
import ProfileChip from "./_components/profile-chip"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1a1a1a]">
      <header className="sticky top-0 z-20 border-b-[3px] border-[#1a1a1a] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6">
          <Link href="/dashboard" className="mr-1 flex shrink-0 items-center gap-3" aria-label="Linkup home">
            <BrandMark size={38} />
            <div className="text-xl font-black tracking-tight">linkup</div>
          </Link>
          <DashNav />
          <ProfileChip />
        </div>
      </header>
      <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-7 sm:px-6 sm:pt-10">{children}</div>
    </main>
  )
}
