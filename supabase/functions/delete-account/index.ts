import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2.112.4"

type StoredObject = { bucket_id: string; name: string }
type Album = { id: string }
type Photo = { storage_path: string | null }

const json = (body: Record<string, unknown>, status: number) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
})

const secretKey = () => {
  const legacy = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (legacy) return legacy
  const keys = Deno.env.get("SUPABASE_SECRET_KEYS")
  return keys ? JSON.parse(keys).default : ""
}

async function removeOwnedFiles(admin: ReturnType<typeof createClient>, userId: string) {
  const objectsByBucket = new Map<string, string[]>()
  const add = (bucket: string, path: string) => {
    const paths = objectsByBucket.get(bucket) || []
    if (!paths.includes(path)) objectsByBucket.set(bucket, [...paths, path])
  }

  // A group owner can remove a Link containing photos uploaded by another
  // member. Capture those paths before the cascading account deletion removes
  // the rows, so neither private files nor their metadata are left behind.
  const { data: groups, error: groupsError } = await admin.from("groups").select("id").eq("owner_id", userId)
  if (groupsError) throw groupsError
  const groupIds = (groups || []).map((group: { id: string }) => group.id)
  if (groupIds.length) {
    const { data: albums, error: albumsError } = await admin.from("albums").select("id").in("group_id", groupIds)
    if (albumsError) throw albumsError
    const albumIds = (albums || []).map((album: Album) => album.id)
    if (albumIds.length) {
      const { data: photos, error: photosError } = await admin.from("photos").select("storage_path").in("album_id", albumIds)
      if (photosError) throw photosError
      for (const photo of (photos || []) as Photo[]) if (photo.storage_path) add("photos", photo.storage_path)
    }
  }

  const { data: ownedObjects, error: ownedObjectsError } = await admin.schema("storage").from("objects").select("bucket_id,name").eq("owner_id", userId)
  if (ownedObjectsError) throw ownedObjectsError
  for (const object of (ownedObjects || []) as StoredObject[]) {
    add(object.bucket_id, object.name)
  }

  for (const [bucket, paths] of objectsByBucket) {
    for (let start = 0; start < paths.length; start += 1000) {
      const { error: removeError } = await admin.storage.from(bucket).remove(paths.slice(start, start + 1000))
      if (removeError) throw removeError
    }
  }
}

Deno.serve(async (request: Request) => {
  if (request.method !== "DELETE") return json({ error: "Method not allowed." }, 405)

  const authorization = request.headers.get("Authorization")
  const token = authorization?.replace(/^Bearer\s+/i, "")
  if (!token) return json({ error: "Authentication is required." }, 401)

  const url = Deno.env.get("SUPABASE_URL") || ""
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") || ""
  const adminKey = secretKey()
  if (!url || !anonKey || !adminKey) {
    console.error("The account deletion function is missing Supabase runtime credentials.")
    return json({ error: "Account deletion is not configured yet." }, 503)
  }

  const caller = createClient(url, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } } })
  const { data: { user }, error: userError } = await caller.auth.getUser(token)
  if (userError || !user) return json({ error: "Your session has expired. Sign in again before deleting your account." }, 401)

  const admin = createClient(url, adminKey)
  try {
    await removeOwnedFiles(admin, user.id)
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
    if (deleteError) throw deleteError
    return json({ ok: true }, 200)
  } catch (error) {
    console.error("Account deletion failed", error)
    return json({ error: "We could not delete your account. Please try again." }, 500)
  }
})
