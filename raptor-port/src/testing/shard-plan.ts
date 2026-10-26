/* THE UNIT TESTS SPLIT ACROSS GITHUB'S MACHINES BY TIME, NOT BY NAME ([CI-UNIT-SHARE-2-6], 21 Oct 26 — D1089).
   Vitest's own `--shard` cuts the file list into equal COUNTS by a hash of each path, so one share drew the heavy files
   (raptor 2/6 ran 5m19s to 5m28s while 1/6 ran under 2 minutes). This plan spreads the files by their measured time
   instead: the heaviest first, each to the share carrying the least so far. The times are `unit-times.ts`, written by
   `scripts/unit-times.mjs` from a GitHub run; a file the times do not know (a new one) has its share fixed by its
   path's hash, and the known files are re-planned around it — a file added or removed can move many known files to
   other shares, which is safe because every leg of one run plans from the same commit's list, so the split stays
   exact. Every path lands in exactly one share — the proof is `shard-plan.test.ts`. No imports, so the test
   configuration and the tests can both read it. */

/** What one file costs beyond its tests' own time — loading, its page world; measured ~1 s a file on GitHub. */
export const PER_FILE_MS = 1000

/** A stable 32-bit hash of a path (FNV-1a) — the same on every machine, unlike a random or time-based order. */
export function pathHash(path: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < path.length; i++) {
    h ^= path.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/** `paths` (relative, forward slashes) into `count` shares: the plan's shares in order, each a list of paths. */
export function planShards(paths: readonly string[], times: Readonly<Record<string, number>>, count: number): string[][] {
  if (!Number.isInteger(count) || count < 1) throw new Error(`a share count must be a whole number of at least 1, not ${count}`)
  const unique = [...new Set(paths)]
  const shares: string[][] = Array.from({ length: count }, () => [])
  const loads: number[] = new Array(count).fill(0)
  const known = unique.filter(p => Object.prototype.hasOwnProperty.call(times, p))
  const unknown = unique.filter(p => !Object.prototype.hasOwnProperty.call(times, p))
  /* a new file costs what a middling known one does, until a run measures it */
  const sorted = known.map(p => times[p]).sort((a, b) => a - b)
  const guess = (sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0) + PER_FILE_MS
  for (const p of unknown.sort()) {
    const i = pathHash(p) % count
    shares[i].push(p)
    loads[i] += guess
  }
  /* heaviest first; ties broken by the path, so every machine builds the same plan */
  known.sort((a, b) => times[b] - times[a] || (a < b ? -1 : a > b ? 1 : 0))
  for (const p of known) {
    let best = 0
    for (let i = 1; i < count; i++) if (loads[i] < loads[best]) best = i
    shares[best].push(p)
    loads[best] += times[p] + PER_FILE_MS
  }
  return shares
}
