import { Camera, FolderOpen, ImagePlus, Sparkles } from 'lucide-react'
import DashboardShell from '../_components/shell'

const albums = [
  ['Santa Cruz Beach Day', '18 photos', 'bg-brand-blue'],
  ['Fall Camping', '42 photos', 'bg-brand-mint'],
  ['Summer 2026', '96 photos', 'bg-brand-peach'],
]

export default function PhotosPage() {
  return <DashboardShell title="Photos" eyebrow="KEEP THE MEMORIES">
    <div className="mb-6 brutal-card bg-brand-blue p-6 sm:p-8"><div className="grid h-11 w-11 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-white"><Camera size={19}/></div><h2 className="mt-4 text-3xl font-black">Put the memories next to the plan.</h2><p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-700">Albums belong to the crew and can be attached to events. Supabase Storage will handle the real uploads.</p><button className="brutal-btn mt-5 rounded-lg bg-white px-4 py-3 text-sm"><ImagePlus size={16}/> Upload photos</button></div>
    <div className="grid gap-4 md:grid-cols-3">
      {albums.map(([name, count, bg]) => <div key={name} className="brutal-card overflow-hidden"><div className={`grid aspect-[4/3] place-items-center border-b-2 border-[#1a1a1a] ${bg}`}><FolderOpen size={34}/></div><div className="p-5"><div className="text-[10px] font-black tracking-wider text-zinc-400">ALBUM</div><h2 className="mt-1 text-lg font-black">{name}</h2><div className="mt-2 text-xs font-medium text-zinc-500">{count}</div></div></div>)}
    </div>
    <div className="mt-6 flex items-center gap-3 rounded-xl border-2 border-[#1a1a1a] bg-brand-lemon p-4"><Sparkles size={18}/><p className="text-sm font-black">Google Photos / Drive integration can plug into this album layer later.</p></div>
  </DashboardShell>
}
