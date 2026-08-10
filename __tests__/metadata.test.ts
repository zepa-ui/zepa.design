import { describe, it, expect } from "vitest"
import { registryItems } from "@/content/registry/items"

describe("Component Metadata", () => {
  it("should have registryItems array", () => {
    expect(Array.isArray(registryItems)).toBe(true)
    expect(registryItems.length).toBeGreaterThan(0)
  })

  it("should have required metadata fields for each component", () => {
    registryItems.forEach((item) => {
      expect(item).toHaveProperty("slug")
      expect(item).toHaveProperty("title")
      expect(item).toHaveProperty("description")
      expect(item).toHaveProperty("category")
      expect(item).toHaveProperty("preview")
    })
  })

  it("should have valid categories", () => {
    // Keep in sync with the category folders under content/registry/.
    // "cards" and "buttons" are placeholders — no components use them yet.
    const validCategories = [
      "hero-sections",
      "grid-sections",
      "navbar-sections",
      "unicorn-section",
      "interactive-illustrations",
      "cards",
      "buttons",
    ]
    registryItems.forEach((item) => {
      expect(validCategories).toContain(item.category)
    })
  })

  it("should have unique slugs", () => {
    const slugs = registryItems.map((item) => item.slug)
    const uniqueSlugs = new Set(slugs)
    expect(uniqueSlugs.size).toBe(slugs.length)
  })

  it("should have glsl-hills-hero component", () => {
    const component = registryItems.find((item) => item.slug === "glsl-hills-hero")
    expect(component).toBeDefined()
    expect(component?.title).toBe("GLSL Hills Hero")
    expect(component?.category).toBe("hero-sections")
    expect(component?.github).toBe("vij-sameerb5")
  })

  it("should parse metadata correctly", () => {
    const item = registryItems[0]
    expect(typeof item.slug).toBe("string")
    expect(typeof item.title).toBe("string")
    expect(typeof item.category).toBe("string")
    expect(Array.isArray(item.dependencies)).toBe(true)
    if (item.github !== undefined) {
      expect(typeof item.github).toBe("string")
    }
  })
})
