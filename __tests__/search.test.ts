import { describe, it, expect } from "vitest"
import { registryItems } from "@/content/registry/items"

describe("Sidebar & Search Filtering", () => {
  it("should filter components by category", () => {
    const heroSections = registryItems.filter(
      (item) => item.category === "hero-sections"
    )
    expect(heroSections.length).toBeGreaterThan(0)
    expect(heroSections[0].category).toBe("hero-sections")
  })

  it("should filter components by category slug", () => {
    const categories = new Set(registryItems.map((item) => item.category))
    expect(categories.size).toBeGreaterThan(0)
    categories.forEach((category) => {
      const items = registryItems.filter((item) => item.category === category)
      expect(items.length).toBeGreaterThan(0)
    })
  })

  it("should search by component name", () => {
    const query = "glsl"
    const results = registryItems.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    )
    expect(results.length).toBeGreaterThan(0)
    expect(results[0].slug).toBe("glsl-hills-hero")
  })

  it("should search by description", () => {
    const query = "hero"
    const results = registryItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
    )
    expect(results.length).toBeGreaterThan(0)
  })

  it("should handle empty search results", () => {
    const query = "nonexistent-component-xyz"
    const results = registryItems.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    )
    expect(results.length).toBe(0)
  })

  it("should be case-insensitive for search", () => {
    const query1 = "GLSL"
    const query2 = "glsl"

    const results1 = registryItems.filter((item) =>
      item.title.toLowerCase().includes(query1.toLowerCase())
    )
    const results2 = registryItems.filter((item) =>
      item.title.toLowerCase().includes(query2.toLowerCase())
    )

    expect(results1.length).toBe(results2.length)
    expect(results1.length).toBeGreaterThan(0)
  })

  it("should group components by category", () => {
    const groupedByCategory = registryItems.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = []
        }
        acc[item.category].push(item)
        return acc
      },
      {} as Record<string, Array<(typeof registryItems)[number]>>
    )

    expect(Object.keys(groupedByCategory).length).toBeGreaterThan(0)
    expect(groupedByCategory["hero-sections"]).toBeDefined()
  })
})
