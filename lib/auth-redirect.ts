const FALLBACK_PATH = "/dashboard"

export function safeNextPath(value: string | null | undefined, fallback = FALLBACK_PATH) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback

  try {
    const url = new URL(value, "https://linkup.local")
    if (url.origin !== "https://linkup.local" || url.pathname.startsWith("/auth")) return fallback
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return fallback
  }
}
