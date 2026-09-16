"use client"

import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Dialog as AriaDialog, Modal as AriaModal, ModalOverlay as AriaModalOverlay } from "react-aria-components"
import { CalendarDays, Camera, Check, ChevronDown, ChevronRight, CircleUserRound, Copy, ImagePlus, Link2, LoaderCircle, LogOut, MessageCircle, Plus, Send, Sparkles, Users, Vote } from "lucide-react"
import { AvailabilityGrid, DecisionHandoff, MemoryStack, PlanTimePicker, type CrewMember } from "@/components/ui/crew-planning-tools"
import { PlanLifecycle } from "@/components/ui/plan-lifecycle"
import styles from "./full-linkup-app.module.css"
import interactions from "./crew-dashboard-interactions.module.css"

export type CrewView = "home" | "plan" | "chat" | "links" | "profile"
export type PreviewScenario = "ready" | "empty" | "loading" | "error" | "partial-error"

type Member = { user_id: string; role: "owner" | "admin" | "member"; profiles?: { display_name?: string | null; avatar_url?: string | null; avatar_path?: string | null; avatarUrl?: string | null } | null }
type Group = { group_id: string; role: "owner" | "admin" | "member"; member_count?: number; groups: { id: string; name: string; description?: string | null; visibility?: "private" | "discoverable" } | null }
type DateOption = { id: string; starts_at: string; event_date_votes?: { user_id: string; vote: "like" | "dislike" | "undecided" }[] }
type Plan = { id: string; name: string; description?: string | null; location?: string | null; status?: string; starts_at?: string | null; event_date_options?: DateOption[] }
type ChatMessage = { id: string; body: string; created_at: string; user_id: string; profiles?: { display_name?: string | null } | null }
type Score = { userId: string; displayName: string; points: number }
type Photo = { id: string; caption?: string | null; signedUrl?: string | null; albumName?: string | null; eventId?: string | null; eventName?: string | null }
type Profile = { id: string; email?: string | null; display_name?: string | null; avatar_url?: string | null; avatar_path?: string | null; avatarUrl?: string | null }
type PlanSlot = { date: string; time: string }
type ResourceKey = "plans" | "chat" | "scores" | "photos" | "members"
type ResourceErrors = Partial<Record<ResourceKey, string>>
type PreviewGroupData = { plans: Plan[]; messages: ChatMessage[]; scores: Score[]; photos: Photo[]; members: Member[] }

const nav: { id: CrewView; label: string; icon: typeof Link2 }[] = [
  { id: "home", label: "Home", icon: Link2 }, { id: "plan", label: "Plan", icon: CalendarDays }, { id: "chat", label: "Chat", icon: MessageCircle }, { id: "links", label: "Links", icon: Users }, { id: "profile", label: "You", icon: CircleUserRound },
]
const localProfile: Profile = { id: "local-rishith", email: "local-preview@linkup.test", display_name: "Rishith" }
const localGroup: Group = { group_id: "local-weekend", role: "owner", member_count: 4, groups: { id: "local-weekend", name: "Rishith’s Weekend", description: "Made for local UI testing", visibility: "private" } }
const nextPreviewSlot = (weekday: number, hour: number, minute: number) => {
  const date = new Date()
  date.setHours(hour, minute, 0, 0)
  const offset = (weekday - date.getDay() + 7) % 7 || 7
  date.setDate(date.getDate() + offset)
  return date.toISOString()
}
const makeLocalPlans = (): Plan[] => [{ id: "local-boba", name: "Late-night boba run", location: "Cha Time", status: "planning", event_date_options: [
  { id: "fri", starts_at: nextPreviewSlot(5, 20, 30), event_date_votes: [{ user_id: "local-rishith", vote: "like" }, { user_id: "maya", vote: "like" }] },
  { id: "sat", starts_at: nextPreviewSlot(6, 20, 30), event_date_votes: [{ user_id: "avi", vote: "like" }] },
]}]
const localMessages: ChatMessage[] = [
  { id: "local-1", body: "who’s actually free friday?", created_at: "2026-09-02T18:00:00.000Z", user_id: "maya", profiles: { display_name: "Maya" } },
  { id: "local-2", body: "I am. Boba sounds good.", created_at: "2026-09-02T18:03:00.000Z", user_id: "local-rishith", profiles: { display_name: "Rishith" } },
]
const localScores: Score[] = [{ userId: "local-rishith", displayName: "Rishith", points: 240 }, { userId: "maya", displayName: "Maya", points: 240 }, { userId: "avi", displayName: "Avi", points: 160 }]
const localMembers: Member[] = [
  { user_id: "local-rishith", role: "owner", profiles: { display_name: "Rishith" } }, { user_id: "maya", role: "member", profiles: { display_name: "Maya" } }, { user_id: "avi", role: "member", profiles: { display_name: "Avi" } }, { user_id: "noah", role: "member", profiles: { display_name: "Noah" } },
]
const makeEmptyPreviewGroupData = (): PreviewGroupData => ({
  plans: [], messages: [], scores: [], photos: [],
  members: [{ user_id: localProfile.id, role: "owner", profiles: { display_name: localProfile.display_name } }],
})
const makeReadyPreviewGroupData = (): PreviewGroupData => ({
  plans: makeLocalPlans(), messages: [...localMessages], scores: [...localScores], photos: [], members: [...localMembers],
})

class RequestError extends Error {
  constructor(message: string, readonly status: number) { super(message) }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new RequestError(body.error || "Something went wrong. Please try again.", response.status)
  return body as T
}
const errorMessage = (cause: unknown) => cause instanceof Error ? cause.message : "Something went wrong. Please try again."
const initial = (name?: string | null) => (name || "L").trim().slice(0, 1).toUpperCase()
const dateLabel = (value?: string | null) => value ? new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "Pick a date"
const votes = (option: DateOption) => (option.event_date_votes || []).filter((item) => item.vote === "like").length
const slotToIso = (slot: PlanSlot) => slot.date && slot.time ? new Date(`${slot.date}T${slot.time}:00`).toISOString() : ""
const memberForGrid = (members: Member[]): CrewMember[] => members.map((member) => ({ id: member.user_id, name: member.profiles?.display_name || "Link member", avatarUrl: member.profiles?.avatarUrl || member.profiles?.avatar_url }))

export default function FullLinkupApp({ preview = false, previewScenario = "ready", initialView = "home", framed = false }: { preview?: boolean; previewScenario?: PreviewScenario; initialView?: CrewView; framed?: boolean }) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const selectedGroupIdRef = useRef("")
  const groupLoadSequenceRef = useRef(0)
  const previewGroupsRef = useRef<Record<string, PreviewGroupData>>({ [localGroup.group_id]: makeReadyPreviewGroupData() })
  const readyPreview = preview && (previewScenario === "ready" || previewScenario === "partial-error")
  const [view, setView] = useState<CrewView>(initialView)
  const [profile, setProfile] = useState<Profile | null>(() => preview && previewScenario !== "loading" && previewScenario !== "error" ? localProfile : null)
  const [groups, setGroups] = useState<Group[]>(() => readyPreview ? [localGroup] : [])
  const [groupId, setGroupId] = useState(() => readyPreview ? localGroup.group_id : "")
  const [plans, setPlans] = useState<Plan[]>(() => readyPreview ? makeLocalPlans() : [])
  const [messages, setMessages] = useState<ChatMessage[]>(() => readyPreview ? [...localMessages] : [])
  const [scores, setScores] = useState<Score[]>(() => readyPreview ? [...localScores] : [])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [members, setMembers] = useState<Member[]>(() => readyPreview ? [...localMembers] : [])
  const [loading, setLoading] = useState(() => preview ? previewScenario === "loading" : true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState(() => preview && previewScenario === "error" ? "The local fixture could not load this Crew." : "")
  const [resourceErrors, setResourceErrors] = useState<ResourceErrors>(() => previewScenario === "partial-error" ? { photos: "Memories could not refresh. This is a local fixture failure.", chat: "Chat could not refresh. This is a local fixture failure." } : {})
  const [showCreateLink, setShowCreateLink] = useState(false)
  const [showCreatePlan, setShowCreatePlan] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [showMemoryUpload, setShowMemoryUpload] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)
  const [message, setMessage] = useState("")
  const [linkName, setLinkName] = useState("")
  const [linkDescription, setLinkDescription] = useState("")
  const [linkIssue, setLinkIssue] = useState("")
  const [planName, setPlanName] = useState("")
  const [planLocation, setPlanLocation] = useState("")
  const [planSlots, setPlanSlots] = useState<PlanSlot[]>([{ date: "", time: "18:00" }, { date: "", time: "18:00" }])
  const [activePlanSlot, setActivePlanSlot] = useState(0)
  const [planSubmissionIssue, setPlanSubmissionIssue] = useState("")
  const [profileName, setProfileName] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [deleteIssue, setDeleteIssue] = useState("")
  const [memoryEventId, setMemoryEventId] = useState("")
  const [memoryCaption, setMemoryCaption] = useState("")
  const [photoUploadState, setPhotoUploadState] = useState<"idle" | "uploading" | "processing">("idle")
  const linkNameRef = useRef<HTMLInputElement>(null)
  const active = useMemo(() => groups.find((item) => item.group_id === groupId), [groups, groupId])
  const activeName = active?.groups?.name || "Your Link"
  const isManager = active?.role === "owner" || active?.role === "admin"
  const nextPlan = plans.find((item) => item.status === "confirmed") || plans[0]
  const planChoices = useMemo(() => planSlots.map(slotToIso).filter(Boolean), [planSlots])
  const planIssue = !planName.trim() ? "Name the plan first." : planChoices.length < 2 ? "Choose two possible times." : new Set(planChoices).size !== planChoices.length ? "Each option needs a different time." : ""
  const visiblePlanIssue = planSubmissionIssue
  const isPlanNameInvalid = Boolean(visiblePlanIssue && !planName.trim())

  const loadGroup = useCallback(async (id: string) => {
    const loadSequence = ++groupLoadSequenceRef.current
    const [planResult, chatResult, scoreResult, photoResult, memberResult] = await Promise.allSettled([
      request<{ plans: Plan[] }>(`/api/calendar?groupId=${encodeURIComponent(id)}`), request<{ messages: ChatMessage[] }>(`/api/chat?groupId=${encodeURIComponent(id)}`), request<{ leaderboard: Score[] }>(`/api/leaderboard?groupId=${encodeURIComponent(id)}`), request<{ photos: Photo[] }>(`/api/photos?groupId=${encodeURIComponent(id)}`), request<{ members: Member[] }>(`/api/groups/${id}/members`),
    ])
    if ([planResult, chatResult, scoreResult, photoResult, memberResult].some((result) => result.status === "rejected" && result.reason instanceof RequestError && result.reason.status === 401)) {
      window.location.assign("/auth?next=/dashboard")
      return
    }
    if (loadSequence !== groupLoadSequenceRef.current || selectedGroupIdRef.current !== id) return
    const nextErrors: ResourceErrors = {}
    if (planResult.status === "fulfilled") setPlans(planResult.value.plans || [])
    else nextErrors.plans = `Plans could not refresh. ${errorMessage(planResult.reason)}`
    if (chatResult.status === "fulfilled") setMessages(chatResult.value.messages || [])
    else nextErrors.chat = `Chat could not refresh. ${errorMessage(chatResult.reason)}`
    if (scoreResult.status === "fulfilled") setScores(scoreResult.value.leaderboard || [])
    else nextErrors.scores = `Showing-up points could not refresh. ${errorMessage(scoreResult.reason)}`
    if (photoResult.status === "fulfilled") setPhotos(photoResult.value.photos || [])
    else nextErrors.photos = `Memories could not refresh. ${errorMessage(photoResult.reason)}`
    if (memberResult.status === "fulfilled") setMembers(memberResult.value.members || [])
    else nextErrors.members = `Members could not refresh. ${errorMessage(memberResult.reason)}`
    setResourceErrors(nextErrors)
  }, [])
  const load = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const [me, linkData] = await Promise.all([request<{ user: Profile; profile: Profile }>("/api/auth/me"), request<{ groups: Group[] }>("/api/groups")])
      setProfile({ ...me.user, ...me.profile }); setGroups(linkData.groups || [])
      const first = selectedGroupIdRef.current || linkData.groups?.[0]?.group_id || ""
      selectedGroupIdRef.current = first
      setGroupId(first); if (first) await loadGroup(first)
    } catch (cause) {
      if (cause instanceof RequestError && cause.status === 401) {
        window.location.assign("/auth?next=/dashboard")
        return
      }
      setError(errorMessage(cause))
    } finally { setLoading(false) }
  }, [loadGroup])
  useEffect(() => {
    if (preview) return
    const timer = window.setTimeout(() => void load(), 0)
    return () => window.clearTimeout(timer)
  }, [load, preview])
  useEffect(() => {
    if (preview || !groupId || !profile) return
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void loadGroup(groupId)
    }
    const timer = window.setInterval(refreshWhenVisible, 15_000)
    document.addEventListener("visibilitychange", refreshWhenVisible)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", refreshWhenVisible)
    }
  }, [groupId, loadGroup, preview, profile])

  function report(nextNotice: string) { setNotice(nextNotice); setError(""); window.setTimeout(() => setNotice(""), 3500) }
  function fail(cause: unknown) { setError(errorMessage(cause)); setNotice("") }
  function chooseGroup(id: string) {
    selectedGroupIdRef.current = id
    if (preview) {
      if (groupId) previewGroupsRef.current[groupId] = { plans, messages, scores, photos, members }
      const next = previewGroupsRef.current[id] || makeEmptyPreviewGroupData()
      previewGroupsRef.current[id] = next
      setGroupId(id); setPlans(next.plans); setMessages(next.messages); setScores(next.scores); setPhotos(next.photos); setMembers(next.members)
      return
    }
    setGroupId(id)
    void loadGroup(id)
  }
  function openLink(id: string) { chooseGroup(id); setView("home") }
  async function createLink(event: FormEvent) {
    event.preventDefault()
    if (linkName.trim().length < 2) {
      setLinkIssue("Use a Link name between 2 and 60 characters.")
      linkNameRef.current?.focus()
      return
    }
    setLinkIssue("")
    if (linkName.trim().length > 60) {
      setLinkIssue("Use a Link name between 2 and 60 characters.")
      linkNameRef.current?.focus()
      return
    }
    if (preview) {
      const id = `local-${Date.now()}`; const group: Group = { group_id: id, role: "owner", member_count: 1, groups: { id, name: linkName.trim(), description: linkDescription.trim(), visibility: "private" } }
      if (groupId) previewGroupsRef.current[groupId] = { plans, messages, scores, photos, members }
      const next = makeEmptyPreviewGroupData()
      previewGroupsRef.current[id] = next
      setGroups((items) => [...items, group]); selectedGroupIdRef.current = id; setGroupId(id); setPlans(next.plans); setMessages(next.messages); setScores(next.scores); setPhotos(next.photos); setMembers(next.members); setLinkName(""); setLinkDescription(""); setLinkIssue(""); setShowCreateLink(false); report("Local preview Link created."); return
    }
    setBusy(true)
    try { const result = await request<{ group: { id: string } }>("/api/groups", { method: "POST", body: JSON.stringify({ name: linkName, description: linkDescription }) }); setLinkName(""); setLinkDescription(""); setLinkIssue(""); setShowCreateLink(false); selectedGroupIdRef.current = result.group.id; setGroupId(result.group.id); await load(); report("Your Link is ready. Invite your people next.") } catch (cause) { setLinkIssue(errorMessage(cause)); linkNameRef.current?.focus() } finally { setBusy(false) }
  }
  async function createPlan(event: FormEvent) {
    event.preventDefault()
    const futureIssue = planChoices.some((option) => new Date(option).getTime() <= Date.now()) ? "Choose times in the future." : ""
    if (!groupId || planIssue || futureIssue) { if (planIssue || futureIssue) setPlanSubmissionIssue(planIssue || futureIssue); return }
    const options = planChoices.map((starts_at) => ({ starts_at }))
    if (preview) { setPlans((items) => [...items, { id: `local-plan-${Date.now()}`, name: planName.trim(), location: planLocation.trim(), status: "planning", event_date_options: planChoices.map((starts_at, index) => ({ id: `local-option-${Date.now()}-${index}`, starts_at, event_date_votes: [] })) }]); setPlanName(""); setPlanLocation(""); setPlanSlots([{ date: "", time: "18:00" }, { date: "", time: "18:00" }]); setActivePlanSlot(0); setPlanSubmissionIssue(""); setShowCreatePlan(false); report("Local preview plan added."); return }
    setBusy(true)
    try { await request("/api/calendar", { method: "POST", body: JSON.stringify({ groupId, name: planName, location: planLocation, options }) }); setPlanName(""); setPlanLocation(""); setPlanSlots([{ date: "", time: "18:00" }, { date: "", time: "18:00" }]); setActivePlanSlot(0); setPlanSubmissionIssue(""); setShowCreatePlan(false); await loadGroup(groupId); report("Plan added. Everyone can vote now.") } catch (cause) { setPlanSubmissionIssue(errorMessage(cause)) } finally { setBusy(false) }
  }
  async function castVote(optionId: string, vote: "like" | "dislike") {
    if (preview) { setPlans((items) => items.map((plan) => ({ ...plan, event_date_options: plan.event_date_options?.map((option) => option.id === optionId ? { ...option, event_date_votes: [...(option.event_date_votes || []).filter((item) => item.user_id !== localProfile.id), { user_id: localProfile.id, vote }] } : option) }))); report("Local preview vote saved."); return }
    setBusy(true); try { await request("/api/calendar", { method: "PUT", body: JSON.stringify({ optionId, vote }) }); await loadGroup(groupId); report(vote === "like" ? "Vote saved." : "Marked as not for you.") } catch (cause) { fail(cause) } finally { setBusy(false) }
  }
  async function confirmPlan(planId: string, optionId: string) {
    if (preview) { setPlans((items) => items.map((plan) => plan.id === planId ? { ...plan, status: "confirmed", starts_at: plan.event_date_options?.find((option) => option.id === optionId)?.starts_at } : plan)); report("Local preview plan confirmed."); return }
    setBusy(true); try { await request(`/api/calendar/${planId}`, { method: "PUT", body: JSON.stringify({ action: "confirm", optionId }) }); await loadGroup(groupId); report("Plan confirmed. Time to show up.") } catch (cause) { fail(cause) } finally { setBusy(false) }
  }
  async function sendMessage(event: FormEvent) {
    event.preventDefault(); if (!message.trim() || !groupId || !profile) return
    const body = message.trim(); setMessage("")
    if (preview) { setMessages((items) => [...items, { id: `local-message-${Date.now()}`, body, created_at: new Date().toISOString(), user_id: localProfile.id, profiles: { display_name: localProfile.display_name } }]); report("Local preview message sent."); return }
    try { await request("/api/chat", { method: "POST", body: JSON.stringify({ groupId, body }) }); await loadGroup(groupId) } catch (cause) { setMessage(body); fail(cause) }
  }
  async function copyInvite() {
    if (!groupId) return
    if (preview) { try { await navigator.clipboard.writeText(`${window.location.origin}/_dev/crew-preview`) } catch { /* local receipt still works without clipboard permission */ } setInviteCopied(true); report("Local preview invite copied. No real link was created."); return }
    setBusy(true); try { const result = await request<{ invite: { code: string } }>("/api/invites", { method: "POST", body: JSON.stringify({ groupId }) }); await navigator.clipboard.writeText(`${window.location.origin}/join/${result.invite.code}`); setInviteCopied(true); report("Invite copied. Send it in your existing group chat.") } catch (cause) { fail(cause) } finally { setBusy(false) }
  }
  function beginMemoryUpload() {
    setMemoryEventId("")
    setMemoryCaption("")
    setPhotoUploadState("idle")
    setShowMemoryUpload(true)
  }
  async function uploadPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !groupId) return
    const memoryEvent = plans.find((plan) => plan.id === memoryEventId)
    setPhotoUploadState("uploading")
    if (preview) { setPhotoUploadState("processing"); setPhotos((items) => [{ id: `local-photo-${Date.now()}`, caption: memoryCaption || file.name, signedUrl: URL.createObjectURL(file), albumName: memoryEvent ? `Memories from ${memoryEvent.name}` : "Link memories", eventId: memoryEvent?.id || null, eventName: memoryEvent?.name || null }, ...items]); setShowMemoryUpload(false); setPhotoUploadState("idle"); report("Local preview memory added."); event.target.value = ""; return }
    const form = new FormData(); form.set("file", file); form.set("groupId", groupId); form.set("caption", memoryCaption); if (memoryEventId) form.set("eventId", memoryEventId); setBusy(true)
    try { const response = await fetch("/api/photos", { method: "POST", body: form }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Upload failed"); setPhotoUploadState("processing"); await loadGroup(groupId); setShowMemoryUpload(false); report(memoryEvent ? `Memory added to ${memoryEvent.name}.` : "Memory added to this Link.") } catch (cause) { fail(cause) } finally { setBusy(false); setPhotoUploadState("idle"); event.target.value = "" }
  }
  function openProfileEditor() {
    setProfileName(profile?.display_name || "")
    setShowProfileEditor(true)
  }
  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    const displayName = profileName.trim()
    if (displayName.length < 2 || displayName.length > 48) { setError("Use a display name between 2 and 48 characters."); return }
    if (preview) { setProfile((current) => current ? { ...current, display_name: displayName } : current); setShowProfileEditor(false); report("Local preview profile updated."); return }
    setBusy(true)
    try { const result = await request<{ profile: Profile }>("/api/profile", { method: "PATCH", body: JSON.stringify({ displayName }) }); setProfile((current) => current ? { ...current, ...result.profile } : result.profile); setShowProfileEditor(false); report("Profile saved.") } catch (cause) { fail(cause) } finally { setBusy(false) }
  }
  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (preview) { setProfile((current) => current ? { ...current, avatarUrl: URL.createObjectURL(file) } : current); event.target.value = ""; report("Local preview avatar updated."); return }
    const form = new FormData(); form.set("file", file); setBusy(true)
    try { const response = await fetch("/api/profile/avatar", { method: "POST", body: form }); const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(data.error || "Avatar upload failed"); setProfile((current) => current ? { ...current, ...data.profile } : data.profile); report("Profile photo updated.") } catch (cause) { fail(cause) } finally { setBusy(false); event.target.value = "" }
  }
  async function logout() { if (preview) { report("Local preview stays signed in."); return }; setBusy(true); try { await request("/api/auth/logout", { method: "POST" }); window.location.assign("/") } catch (cause) { fail(cause); setBusy(false) } }
  async function deleteAccount(event: FormEvent) {
    event.preventDefault()
    if (deleteConfirmation !== "DELETE") { setDeleteIssue('Type DELETE to confirm permanent account deletion.'); return }
    if (preview) { setShowDeleteAccount(false); setDeleteConfirmation(""); setDeleteIssue(""); report("Account deletion is disabled in the local fixture."); return }
    setBusy(true)
    try {
      await request<{ ok: true }>("/api/account", { method: "DELETE" })
      window.location.assign("/?account=deleted")
    } catch (cause) {
      setDeleteIssue(errorMessage(cause))
    } finally {
      setBusy(false)
    }
  }
  function retryActiveGroup() { if (preview) { setResourceErrors({}); report("Local fixture reloaded."); return }; void loadGroup(groupId) }

  if (loading) return <main className={styles.loading} aria-busy="true"><LoaderCircle className={styles.spin} /><p>Opening your Link…</p></main>
  if (preview && previewScenario === "error") return <main className={styles.gate} role="alert"><Link2 size={42}/><h1>That Link needs another try.</h1><p>{error}</p><Link href="/_dev/crew-preview" className={styles.primary}>Reload local Crew <ChevronRight size={17}/></Link></main>
  if (!profile) return <main className={styles.gate}><Link2 size={42}/><h1>LinkUp is private.</h1><p>Sign in to make a Link, invite your people, and keep the plan clear.</p><Link href="/auth?mode=login" className={styles.primary}>Continue with Google <ChevronRight size={17}/></Link></main>

  const framedStyle = framed ? { position: "relative" as const, height: "760px", minHeight: "760px", overflow: "auto" as const, paddingBottom: 0 } : undefined
  return <MotionConfig reducedMotion="user"><main className={styles.page} style={framedStyle}>
    <header className={styles.header}><Link href="/" className={styles.brand}><Link2 size={24}/><span>linkup</span></Link><button type="button" className={styles.linkShortcut} onClick={() => setView("links")} aria-label="Open your Links"><span>YOUR LINK</span><b>{activeName}</b><ChevronDown size={15}/></button><button className={styles.avatar} onClick={() => setView("profile")} aria-label="Open profile"><Avatar name={profile.display_name} url={profile.avatarUrl || profile.avatar_url}/></button></header>
    {(notice || error) && <div className={error ? styles.error : styles.notice} role={error ? "alert" : "status"}>{error || notice}</div>}
    {!active ? <section className={styles.empty}><Sparkles size={30}/><p>Your first Link is a private home for one group of people.</p><button className={styles.primary} onClick={() => setShowCreateLink(true)}><Plus size={17}/> Make your first Link</button></section> : <>
      <section className={styles.content} aria-live="polite"><AnimatePresence initial={false} mode="wait"><motion.div key={view} className={interactions.viewPanel} initial={{ clipPath: "inset(0 100% 0 0 round 22px)" }} animate={{ clipPath: "inset(0 0% 0 0 round 22px)" }} exit={{ clipPath: "inset(0 0 0 100% round 22px)" }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}>
        {view === "home" && <Home activeName={activeName} nextPlan={nextPlan} scores={scores} photos={photos} resourceErrors={resourceErrors} onRetry={retryActiveGroup} onPlan={() => setView("plan")} onCreatePlan={() => setShowCreatePlan(true)} onAddMemory={beginMemoryUpload}/>}
        {view === "plan" && <Plans plans={plans} members={members} busy={busy} isManager={isManager} resourceErrors={resourceErrors} onRetry={retryActiveGroup} onCreate={() => setShowCreatePlan(true)} onVote={castVote} onConfirm={confirmPlan}/>}
        {view === "chat" && <Chat messages={messages} message={message} setMessage={setMessage} onSend={sendMessage} profile={profile} nextPlan={nextPlan} resourceError={resourceErrors.chat} onRetry={retryActiveGroup} onPlan={() => setView("plan")}/>}
        {view === "links" && <LinksView groups={groups} activeId={groupId} members={members} isManager={isManager} inviteCopied={inviteCopied} resourceError={resourceErrors.members} onRetry={retryActiveGroup} onChoose={openLink} onCreate={() => setShowCreateLink(true)} onInvite={() => setShowInvite(true)}/>}
        {view === "profile" && <ProfileView profile={profile} scores={scores} busy={busy} resourceError={resourceErrors.scores} onRetry={retryActiveGroup} onLogout={logout} onEdit={openProfileEditor} onDeleteAccount={() => setShowDeleteAccount(true)}/>}
      </motion.div></AnimatePresence></section>
      <button type="button" aria-label="Add a memory" className={styles.photoButton} style={{ border: 0, font: "inherit", ...(framed ? { position: "absolute", right: 14, bottom: 74 } : {}) }} onClick={beginMemoryUpload}><ImagePlus size={17}/><span>Add memory</span></button>
      <input ref={photoInputRef} style={{ display: "none" }} type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadPhoto}/>
    </>}
    <nav className={styles.nav} style={framed ? { position: "sticky", bottom: 0, width: "100%", transform: "none" } : undefined} aria-label="LinkUp navigation">{nav.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? styles.activeNav : ""} onClick={() => setView(id)} aria-current={view === id ? "page" : undefined}><Icon size={19}/><span>{label}</span></button>)}</nav>
    {showCreateLink && <Modal title="Make a Link" onClose={() => { setShowCreateLink(false); setLinkIssue("") }}><form noValidate onSubmit={createLink} className={styles.form}><label>Name<input ref={linkNameRef} autoFocus minLength={2} maxLength={60} aria-invalid={Boolean(linkIssue)} aria-describedby={linkIssue ? "link-name-error" : undefined} value={linkName} onChange={(event) => { setLinkName(event.target.value); if (linkIssue) setLinkIssue("") }} placeholder="Weekend plans"/></label>{linkIssue && <p id="link-name-error" className={styles.formError} role="alert">{linkIssue}</p>}<label>What is this group about?<textarea maxLength={280} value={linkDescription} onChange={(event) => setLinkDescription(event.target.value)} placeholder="Plans, memories, and the moments you want to make."/></label><button disabled={busy} className={styles.primary}>{busy ? "Making it…" : "Make this Link"}</button></form></Modal>}
    {showCreatePlan && <Modal title="Suggest a plan" onClose={() => { setShowCreatePlan(false); setPlanSubmissionIssue("") }}><form noValidate onSubmit={createPlan} className={styles.form}><label>What are you doing?<input autoFocus aria-invalid={isPlanNameInvalid} aria-describedby={visiblePlanIssue ? "plan-error" : undefined} value={planName} onChange={(event) => { setPlanName(event.target.value); setPlanSubmissionIssue("") }} placeholder="Late-night boba run"/></label><label>Where?<input value={planLocation} onChange={(event) => setPlanLocation(event.target.value)} placeholder="Cha Time"/></label><PlanTimePicker slots={planSlots} activeIndex={activePlanSlot} onActiveChange={(index) => { setActivePlanSlot(index); setPlanSubmissionIssue("") }} onSlotsChange={(slots) => { setPlanSlots(slots); setPlanSubmissionIssue("") }}/>{visiblePlanIssue && <p id="plan-error" className={styles.formError} role="alert">{visiblePlanIssue}</p>}<button disabled={busy} className={styles.primary}>{busy ? "Saving…" : "Ask the group"}</button></form></Modal>}
    {showInvite && <Modal title="Invite your people" onClose={() => setShowInvite(false)}><div className={styles.invite}><Users size={28}/>{inviteCopied ? <><p>Your private invite is copied. Send it in the group chat you already use.</p><button className={styles.secondary} onClick={() => setShowInvite(false)}>Done</button></> : <><p>Make a private invite, then send it wherever your crew already talks.</p><button className={styles.primary} disabled={busy} onClick={copyInvite}><Copy size={16}/> Copy private invite</button></>}</div></Modal>}
    {showMemoryUpload && <Modal title="Add a memory" onClose={() => { if (photoUploadState === "idle") setShowMemoryUpload(false) }}><div className={styles.form}><fieldset className={styles.memoryScope} disabled={photoUploadState !== "idle"}><legend>Where should this memory live?</legend><label><input type="radio" name="memory-scope" checked={!memoryEventId} onChange={() => setMemoryEventId("")}/><span><b>This Link</b><small>For the general story your people share.</small></span></label>{plans.filter((plan) => plan.status === "confirmed").map((plan) => <label key={plan.id}><input type="radio" name="memory-scope" checked={memoryEventId === plan.id} onChange={() => setMemoryEventId(plan.id)}/><span><b>{plan.name}</b><small>Attach it to this confirmed plan.</small></span></label>)}</fieldset><label>Caption <input maxLength={140} value={memoryCaption} disabled={photoUploadState !== "idle"} onChange={(event) => setMemoryCaption(event.target.value)} placeholder="A tiny note for later"/></label><button type="button" className={styles.primary} disabled={photoUploadState !== "idle"} onClick={() => photoInputRef.current?.click()}>{photoUploadState === "uploading" ? <><LoaderCircle className={styles.spin} size={16}/> Uploading privately…</> : photoUploadState === "processing" ? <><LoaderCircle className={styles.spin} size={16}/> Rendering memory…</> : <><ImagePlus size={16}/> Choose a photo</>}</button><p className={styles.formHint}>JPEG, PNG, or WebP · private to this Link.</p></div></Modal>}
    {showProfileEditor && <Modal title="Your profile" onClose={() => setShowProfileEditor(false)}><form className={styles.form} onSubmit={saveProfile}><label>Display name<input autoFocus value={profileName} maxLength={48} onChange={(event) => setProfileName(event.target.value)} placeholder="What should your crew call you?"/></label><label className={styles.avatarUpload}>Profile photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar}/><span><Camera size={16}/> Upload a private photo</span></label><p className={styles.formHint}>JPEG, PNG, or WebP · up to 5MB · visible only to people in your Links.</p><button disabled={busy} className={styles.primary}>{busy ? "Saving…" : "Save profile"}</button></form></Modal>}
    {showDeleteAccount && <Modal title="Delete your account" onClose={() => { setShowDeleteAccount(false); setDeleteConfirmation(""); setDeleteIssue("") }}><form noValidate className={styles.form} onSubmit={deleteAccount}><p id="delete-account-warning" className={styles.deleteNote}>This permanently deletes your account, private files, Links, plans, messages, and test data. It cannot be undone.</p><label>Type DELETE to confirm<input autoFocus value={deleteConfirmation} aria-invalid={Boolean(deleteIssue)} aria-describedby="delete-account-warning delete-account-error" onChange={(event) => { setDeleteConfirmation(event.target.value); setDeleteIssue("") }} autoComplete="off"/></label>{deleteIssue && <p id="delete-account-error" className={styles.formError} role="alert">{deleteIssue}</p>}<button disabled={busy} className={styles.danger}>{busy ? "Deleting…" : "Permanently delete account"}</button></form></Modal>}
  </main></MotionConfig>
}

function ResourceRecovery({ message, onRetry }: { message?: string; onRetry: () => void }) {
  if (!message) return null
  return <aside className={interactions.resourceRecovery} role="alert"><span>{message}</span><button type="button" onClick={onRetry}>Try again</button></aside>
}

function Home({ activeName, nextPlan, scores, photos, resourceErrors, onRetry, onPlan, onCreatePlan, onAddMemory }: { activeName: string; nextPlan?: Plan; scores: Score[]; photos: Photo[]; resourceErrors: ResourceErrors; onRetry: () => void; onPlan: () => void; onCreatePlan: () => void; onAddMemory: () => void }) {
  return <>
    <section className={styles.hero}><p>YOUR LINK · {activeName.toUpperCase()}</p><h1>Make a plan<br/><i>actually happen.</i></h1><button className={styles.primary} onClick={onCreatePlan}><Plus size={17}/> Suggest a plan</button></section>
    <ResourceRecovery message={resourceErrors.plans} onRetry={onRetry}/>
    {nextPlan ? <section className={styles.nextPlan}><button className={styles.next} onClick={onPlan}><span>{nextPlan.status === "confirmed" ? "NEXT UP · CONFIRMED" : "PICKING A TIME"}</span><strong>{nextPlan.name}</strong><small>{nextPlan.location || "Location to be decided"} · {dateLabel(nextPlan.starts_at || nextPlan.event_date_options?.[0]?.starts_at)}</small><ChevronRight size={22}/></button><PlanLifecycle status={nextPlan.status === "confirmed" ? "confirmed" : "choosing"} /></section> : <section className={styles.blank}><CalendarDays size={23}/><b>Nothing is planned yet.</b><span>Start tiny: one idea and two possible times.</span></section>}
    <section className={styles.homeGrid}>
      <article className={styles.peopleCard}><div className={styles.sectionHead}><span>YOUR PEOPLE</span><Users size={17}/></div><h2>{activeName}</h2><ResourceRecovery message={resourceErrors.scores} onRetry={onRetry}/>{scores.length ? <ol className={styles.score}>{scores.slice(0, 3).map((score, index) => <li key={score.userId}><b>{index + 1}</b><i>{initial(score.displayName)}</i><strong>{score.displayName}</strong><em>{score.points}</em></li>)}</ol> : <p className={styles.muted}>Verified plans will make this board worth looking at.</p>}</article>
      <section><ResourceRecovery message={resourceErrors.photos} onRetry={onRetry}/><MemoryStack photos={photos} onAdd={onAddMemory}/></section>
    </section>
  </>
}

function Plans({ plans, members, busy, isManager, resourceErrors, onRetry, onCreate, onVote, onConfirm }: { plans: Plan[]; members: Member[]; busy: boolean; isManager: boolean; resourceErrors: ResourceErrors; onRetry: () => void; onCreate: () => void; onVote: (id: string, vote: "like" | "dislike") => void; onConfirm: (planId: string, optionId: string) => void }) {
  return <section><div className={styles.titleRow}><div><p>PLAN TOGETHER</p><h1>Pick a time.</h1></div><button className={styles.circleButton} onClick={onCreate} aria-label="Suggest a new plan"><Plus size={20}/></button></div><ResourceRecovery message={resourceErrors.plans || resourceErrors.members} onRetry={onRetry}/>{plans.length ? <div className={styles.planList}>{plans.map((plan) => { const confirmedOption = plan.event_date_options?.find((option) => option.starts_at === plan.starts_at); return <article className={styles.plan} key={plan.id}><div><span>{plan.status === "confirmed" ? "CONFIRMED" : "NEEDS A VOTE"}</span><h2>{plan.name}</h2><p>{plan.location || "Place to be decided"}</p></div>{plan.status === "confirmed" && <section className={interactions.decisionTicket} aria-label="Confirmed plan"><span><Check size={14}/> PLAN SET</span><b>{dateLabel(confirmedOption?.starts_at || plan.starts_at)}</b><small>Everyone has one clear answer now.</small></section>}<div className={styles.options}>{(plan.event_date_options || []).map((option) => <div className={styles.option} key={option.id}><div><b>{dateLabel(option.starts_at)}</b><small>{votes(option)} people like this time</small></div><AvailabilityMap option={option} members={members}/>{plan.status === "confirmed" ? null : <div className={styles.optionActions}><button disabled={busy} onClick={() => onVote(option.id, "like")}><Vote size={14}/> Like</button><button disabled={busy} onClick={() => onVote(option.id, "dislike")}>Nope</button>{isManager && <button disabled={busy} onClick={() => onConfirm(plan.id, option.id)}>Confirm</button>}</div>}</div>)}</div></article>})}</div> : <section className={styles.blank}><Vote size={24}/><b>There are no plans to vote on.</b><span>Put two possible dates in front of the group.</span><button className={styles.primary} onClick={onCreate}>Suggest a plan</button></section>}</section>
}

function AvailabilityMap({ option, members }: { option: DateOption; members: Member[] }) { return <AvailabilityGrid members={memberForGrid(members)} votes={option.event_date_votes || []} /> }

function Chat({ messages, message, setMessage, onSend, profile, nextPlan, resourceError, onRetry, onPlan }: { messages: ChatMessage[]; message: string; setMessage: (value: string) => void; onSend: (event: FormEvent) => void; profile: Profile; nextPlan?: Plan; resourceError?: string; onRetry: () => void; onPlan: () => void }) {
  return <section className={styles.chat}><div className={styles.titleRow}><div><p>THE GROUP CHAT</p><h1>Say it once.</h1></div><MessageCircle size={25}/></div><ResourceRecovery message={resourceError} onRetry={onRetry}/><DecisionHandoff title={nextPlan ? nextPlan.name : "Start the next plan"} detail={nextPlan ? "See the choices and make the call." : "Put two times in front of the group."} onOpen={onPlan}/><div className={styles.messages}>{messages.length ? messages.map((item) => <article key={item.id} className={item.user_id === profile.id ? styles.yours : ""}><i>{initial(item.profiles?.display_name)}</i><div><b>{item.user_id === profile.id ? "You" : item.profiles?.display_name || "Link member"}</b><p>{item.body}</p></div></article>) : <p className={styles.muted}>No messages yet. Break the silence.</p>}</div><form className={styles.composer} onSubmit={onSend}><input value={message} maxLength={2000} onChange={(event) => setMessage(event.target.value)} placeholder="Message your people"/><button disabled={!message.trim()} aria-label="Send message"><Send size={17}/></button></form></section>
}

function LinksView({ groups, activeId, members, isManager, inviteCopied, resourceError, onRetry, onChoose, onCreate, onInvite }: { groups: Group[]; activeId: string; members: Member[]; isManager: boolean; inviteCopied: boolean; resourceError?: string; onRetry: () => void; onChoose: (id: string) => void; onCreate: () => void; onInvite: () => void }) {
  return <section><div className={styles.titleRow}><div><p>YOUR PEOPLE</p><h1>Your Links.</h1></div><button className={styles.circleButton} onClick={onCreate} aria-label="Make another Link"><Plus size={20}/></button></div>{inviteCopied && <aside className={interactions.inviteReceipt} role="status"><Copy size={16}/><div><b>Private invite copied</b><span>Now send it where your crew already talks.</span></div></aside>}<div className={styles.linkCards}>{groups.map((group) => <button key={group.group_id} className={group.group_id === activeId ? styles.selectedLink : ""} onClick={() => onChoose(group.group_id)}><i>{initial(group.groups?.name)}</i><span><b>{group.groups?.name || "Untitled Link"}</b><small>{group.member_count || 0} people · {group.groups?.visibility || "private"}</small></span><ChevronRight size={18}/></button>)}</div><section className={styles.members}><div className={styles.sectionHead}><span>MEMBERS</span><Users size={17}/></div><ResourceRecovery message={resourceError} onRetry={onRetry}/>{members.length ? members.map((member) => <div key={member.user_id}><Avatar name={member.profiles?.display_name} url={member.profiles?.avatarUrl || member.profiles?.avatar_url}/><b>{member.profiles?.display_name || "Link member"}</b><small>{member.role}</small></div>) : <p className={styles.muted}>Members appear here after your first invite is accepted.</p>}{isManager && <button className={styles.secondary} onClick={onInvite}><Copy size={15}/> Invite people</button>}</section></section>
}

function ProfileView({ profile, scores, busy, resourceError, onRetry, onLogout, onEdit, onDeleteAccount }: { profile: Profile; scores: Score[]; busy: boolean; resourceError?: string; onRetry: () => void; onLogout: () => void; onEdit: () => void; onDeleteAccount: () => void }) {
  const score = scores.find((item) => item.userId === profile.id); const highScore = Math.max(...scores.map((item) => item.points), 1); const points = score?.points || 0; const progress = Math.round(points / highScore * 100)
  return <section><div className={styles.profile}><button type="button" className={styles.profileAvatarButton} onClick={onEdit} aria-label="Change profile picture and profile details"><Avatar name={profile.display_name} url={profile.avatarUrl || profile.avatar_url}/><span><Camera size={14}/></span></button><div><p>YOUR SPACE</p><h1>{profile.display_name || "Your LinkUp"}</h1><span>{profile.email}</span></div><button className={styles.profileEdit} onClick={onEdit}>Edit</button></div><ResourceRecovery message={resourceError} onRetry={onRetry}/><section className={interactions.showingUp} aria-label="Showing-up points"><div><span>SHOWING UP</span><b>{points} points</b></div><div className={interactions.showingUpTrack} aria-hidden="true"><span style={{ width: `${progress}%` }}/></div><details><summary>What counts?</summary><p>Verified plans reward everyone fairly. This is your current LinkUp total, not a streak.</p></details></section><div className={styles.settings}><div><b>Notifications</b><span>Plans and replies from your Links</span></div><div><b>Privacy</b><span>Photos are private to Link members</span></div></div><button className={styles.logout} disabled={busy} onClick={onLogout}><LogOut size={16}/> Log out</button><button className={styles.deleteAccount} disabled={busy} onClick={onDeleteAccount}>Delete account</button></section>
}

function Avatar({ name, url }: { name?: string | null; url?: string | null }) {
  return <span className={styles.avatarFace}>{url ? <Image src={url} alt="" width={80} height={80} unoptimized/> : initial(name)}</span>
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return <AriaModalOverlay className={styles.modalBackdrop} isOpen isDismissable onOpenChange={(open) => { if (!open) onClose() }}><AriaModal><AriaDialog className={styles.modal} aria-label={title}>{({ close }) => <><button className={styles.close} onClick={close} aria-label="Close">×</button><h2>{title}</h2>{children}</>}</AriaDialog></AriaModal></AriaModalOverlay>
}
