// Words that should stay fully upper-case in category labels.
const ACRONYMS = new Set(["ai"])

export function formatCategory(category: string) {
  return category
    .split("-")
    .map((word) =>
      ACRONYMS.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ")
}
