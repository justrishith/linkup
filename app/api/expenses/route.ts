import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'

async function context() {
  const token = (await cookies()).get('linkup_access_token')?.value
  if (!token) return null
  const response = await fetch(`${supabase.url}/auth/v1/user`, { headers: { apikey: supabase.key, Authorization: `Bearer ${token}` }, cache: 'no-store' })
  const user = await response.json().catch(() => null)
  return response.ok && user?.id ? { token, user } : null
}

export async function GET(request: Request) {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const groupId = url.searchParams.get('groupId')
  const query = groupId ? `?group_id=eq.${encodeURIComponent(groupId)}&select=*&order=created_at.desc` : '?select=*&order=created_at.desc'
  const response = await fetch(`${supabase.url}/rest/v1/expenses${query}`, { headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}` }, cache: 'no-store' })
  const data = await response.json().catch(() => [])
  if (!response.ok) return NextResponse.json({ error: data.message || 'Unable to load expenses' }, { status: response.status })
  return NextResponse.json({ expenses: data })
}

export async function POST(request: Request) {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { groupId, eventId = null, description, amount, currency = 'USD', participants = [] } = body
  if (!groupId || !description || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json({ error: 'groupId, description, and a positive amount are required' }, { status: 400 })
  }
  const expenseResponse = await fetch(`${supabase.url}/rest/v1/expenses`, {
    method: 'POST', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ group_id: groupId, event_id: eventId, paid_by: ctx.user.id, description: description.trim(), amount: Number(amount), currency }),
  })
  const expenses = await expenseResponse.json().catch(() => [])
  if (!expenseResponse.ok) return NextResponse.json({ error: expenses.message || expenses.hint || 'Unable to create expense' }, { status: expenseResponse.status })
  const expense = Array.isArray(expenses) ? expenses[0] : expenses

  const shares = Array.isArray(participants) && participants.length ? participants : [{ userId: ctx.user.id, share: Number(amount) }]
  const rows = shares.map((p: { userId: string; share: number }) => ({ expense_id: expense.id, user_id: p.userId, share: Number(p.share), settled: p.userId === ctx.user.id }))
  const participantsResponse = await fetch(`${supabase.url}/rest/v1/expense_participants`, {
    method: 'POST', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(rows),
  })
  if (!participantsResponse.ok) {
    await fetch(`${supabase.url}/rest/v1/expenses?id=eq.${expense.id}`, { method: 'DELETE', headers: { apikey: supabase.key, Authorization: `Bearer ${ctx.token}` } })
    const error = await participantsResponse.json().catch(() => ({}))
    return NextResponse.json({ error: error.message || 'Unable to save expense shares' }, { status: participantsResponse.status })
  }
  return NextResponse.json({ expense }, { status: 201 })
}
