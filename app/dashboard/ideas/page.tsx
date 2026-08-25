import { Lightbulb, Plus, ThumbsUp } from 'lucide-react'
import DashboardShell from '../_components/shell'

const ideas = [
  ['Lake Tahoe weekend', '6 votes', 'Trip'],
  ['Sunrise hike', '5 votes', 'Outdoors'],
  ['Bowling tournament', '4 votes', 'Hangout'],
  ['Beach bonfire', '3 votes', 'Weekend'],
]

export default function IdeasPage() {
  return <DashboardShell title="Ideas" eyebrow="BRAIN DUMP">
    <div className="mb-5 flex items-center justify-between gap-3"><p className="text-sm font-medium text-zinc-500">Throw it in. Let the crew decide.</p><button className="brutal-btn rounded-lg bg-brand-lemon px-4 py-3 text-sm"><Plus size={16}/> Add idea</button></div>
    <div className="space-y-3">
      {ideas.map(([name, votes, tag], i) => <div key={name} className="brutal-card flex items-center gap-4 p-5">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border-2 border-[#1a1a1a] bg-brand-lemon shadow-[3px_3px_0_#1a1a1a]"><Lightbulb size={20}/></div>
        <div className="min-w-0 flex-1"><div className="text-[10px] font-black text-zinc-400">0{i + 1} · {tag}</div><div className="mt-1 text-base font-black">{name}</div></div>
        <button className="flex items-center gap-2 rounded-lg border-2 border-[#1a1a1a] bg-white px-3 py-2 text-xs font-black"><ThumbsUp size={14}/> {votes}</button>
      </div>)}
    </div>
  </DashboardShell>
}
