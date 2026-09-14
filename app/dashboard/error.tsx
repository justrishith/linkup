"use client"

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-[20px] border-[3px] border-[#1a1a1a] bg-white p-10 text-center shadow-[6px_6px_0_#1a1a1a]">
      <h2 className="text-2xl font-black">This Link hit a snag.</h2>
      <p className="mt-2 text-sm text-zinc-500">Try again — your stuff is safe.</p>
      <button type="button" onClick={reset} className="brutal-btn mt-5 rounded-xl bg-brand-lemon px-5 py-3 text-sm">
        Try again
      </button>
    </div>
  )
}
