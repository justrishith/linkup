import { ArrowUpRight, CircleDollarSign, Plus, ReceiptText, WalletCards } from 'lucide-react'
import DashboardShell from '../_components/shell'

const expenses = [
  ['Camping groceries', '$68.00', 'Rishi paid', 'Fall Camping'],
  ['Movie tickets', '$75.00', 'Sam paid', 'Movie + Dinner'],
  ['Gas', '$42.50', 'Ava paid', 'Santa Cruz Beach Day'],
]

export default function ExpensesPage() {
  return <DashboardShell title="Expenses" eyebrow="KEEP THE MONEY FAIR">
    <div className="grid gap-4 sm:grid-cols-3 mb-6">
      <div className="brutal-card bg-brand-coral p-5"><div className="text-xs font-bold text-zinc-600">You owe</div><div className="mt-2 text-3xl font-black">$12.50</div><div className="mt-1 text-xs text-zinc-500">to Alex</div></div>
      <div className="brutal-card bg-brand-mint p-5"><div className="text-xs font-bold text-zinc-600">Owed to you</div><div className="mt-2 text-3xl font-black">$31.00</div><div className="mt-1 text-xs text-zinc-500">from 2 people</div></div>
      <button className="brutal-card bg-brand-blue p-5 text-left"><Plus size={18}/><div className="mt-4 text-lg font-black">Add expense</div><div className="mt-1 text-xs text-zinc-600">Log who paid for what.</div></button>
    </div>
    <div className="brutal-card overflow-hidden">
      <div className="border-b-2 border-[#1a1a1a] p-5"><div className="text-[10px] font-black tracking-[.14em] text-zinc-500">RECENT EXPENSES</div><h2 className="mt-1 text-2xl font-black">Shared spending</h2></div>
      <div className="divide-y-2 divide-zinc-100">
        {expenses.map(([name, amount, paid, event]) => <div key={name} className="flex items-center gap-4 p-5"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-[#1a1a1a] bg-white"><ReceiptText size={17}/></div><div className="min-w-0 flex-1"><div className="text-sm font-black">{name}</div><div className="mt-1 text-xs text-zinc-500">{paid} · {event}</div></div><div className="text-right"><div className="text-sm font-black">{amount}</div><div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500"><WalletCards size={12}/> shared</div></div><ArrowUpRight size={16} className="text-zinc-400"/></div>)}
      </div>
    </div>
    <p className="mt-5 text-xs font-medium text-zinc-500">Splitwise sync will plug into this page later. The page is already shaped around the same group expense model.</p>
  </DashboardShell>
}
