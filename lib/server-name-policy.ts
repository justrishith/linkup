/**
 * Server-only safety checks for names that are shown to other people. The
 * encoded list keeps hateful terms out of source views and test output while
 * still normalizing common attempts to bypass a word filter.
 */
const blockedTerms = [
  "ZnVjaw==", "c2hpdA==", "Yml0Y2g=", "Y3VudA==", "YXNzaG9sZQ==", "ZGljaw==", "d2hvcmU=", "c2x1dA==",
  "bmlnZ2Vy", "bmlnZ2E=", "a2lrZQ==", "Y2hpbms=", "Z29vaw==", "c3BpYw==", "d2V0YmFjaw==", "YmVhbmVy",
  "cmVkc2tpbg==", "cmFnaGVhZA==", "Y29vbg==", "ZmFnZ290", "ZHlrZQ==", "dHJhbm55",
].map((term) => Buffer.from(term, "base64").toString("utf8"))

const leetMap: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" }

export type NamePolicyResult = { value: string } | { error: string }

export function normalizePublicName(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : ""
}

function compactForSafety(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[013457@$]/g, (character) => leetMap[character] || character)
    .replace(/[^a-z0-9]+/g, "")
}

function containsBlockedTerm(value: string) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[013457@$]/g, (character) => leetMap[character] || character)
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean)
  const compact = compactForSafety(value)
  return blockedTerms.some((term) => tokens.includes(term) || compact === term)
}

export function validateDisplayName(value: unknown): NamePolicyResult {
  const name = normalizePublicName(value)
  if (name.length < 2 || name.length > 48) return { error: "Use a display name between 2 and 48 characters." }
  if (/\p{Cc}/u.test(name)) return { error: "Use a display name without control characters." }
  if (containsBlockedTerm(name)) return { error: "Use a respectful display name." }
  return { value: name }
}

export function validateLinkName(value: unknown): NamePolicyResult {
  const name = normalizePublicName(value)
  if (name.length < 2 || name.length > 60) return { error: "Use a Link name between 2 and 60 characters." }
  if (/\p{Cc}/u.test(name)) return { error: "Use a Link name without control characters." }
  if (containsBlockedTerm(name)) return { error: "Use a respectful Link name." }
  return { value: name }
}
