import { describe, expect, it } from "vitest"
import { safeNextPath } from "./auth-redirect"

describe("safeNextPath", () => {
  it("keeps an internal dashboard destination", () => {
    expect(safeNextPath("/dashboard/groups")).toBe("/dashboard/groups")
  })

  it("keeps internal query strings", () => {
    expect(safeNextPath("/join/ABC123?source=email")).toBe("/join/ABC123?source=email")
  })

  it.each([
    "https://attacker.example",
    "//attacker.example/path",
    "javascript:alert(1)",
    "dashboard",
  ])("rejects unsafe redirect %s", (value) => {
    expect(safeNextPath(value)).toBe("/dashboard")
  })

  it("uses the requested fallback when no destination exists", () => {
    expect(safeNextPath(null, "/welcome")).toBe("/welcome")
  })
})
