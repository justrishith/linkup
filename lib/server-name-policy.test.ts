import { describe, expect, it } from "vitest"
import { validateDisplayName, validateLinkName } from "./server-name-policy"

describe("public name policy", () => {
  it("normalizes a valid display name", () => {
    expect(validateDisplayName("  Rishith   K  ")).toEqual({ value: "Rishith K" })
  })

  it("rejects a blocked term even when it uses number substitutions", () => {
    const blocked = Buffer.from("bmlnZ2Vy", "base64").toString("utf8").replace("i", "1").replace("e", "3")
    expect(validateDisplayName(blocked)).toEqual({ error: "Use a respectful display name." })
  })

  it("keeps Link names bounded", () => {
    expect(validateLinkName("x")).toEqual({ error: "Use a Link name between 2 and 60 characters." })
    expect(validateLinkName("Weekend plans")).toEqual({ value: "Weekend plans" })
  })
})
