import { describe, expect, it } from "vitest"

import { getMetaStats } from "@/lib/stats/meta-seeds"
import { ZERO_STATS } from "@/lib/stats/types"

/**
 * The `getStats` cases that used to live here exercised the filesystem store,
 * which has been deleted — counters are in Neon now. Those assertions would
 * need a live database connection, which belongs in an integration test rather
 * than a unit run, so what remains covers the pure seed logic.
 *
 * The "at least meta seeds" guarantee still holds; it now lives in
 * `readStats()` in lib/stats/api.ts, which floors each stored counter at its
 * launch seed for public display.
 */
describe("component stats", () => {
  it("ZERO_STATS is all zeros", () => {
    expect(ZERO_STATS).toEqual({ views: 0, likes: 0, installs: 0 })
  })

  it("returns zeros for an unknown component slug", () => {
    expect(getMetaStats("non-existent-slug")).toEqual({
      views: 0,
      likes: 0,
      installs: 0,
    })
  })

  it("uses launch seeds from meta.ts", () => {
    expect(getMetaStats("glsl-hills-hero")).toEqual({
      views: 44231,
      likes: 312,
      installs: 1240,
    })
  })
})
