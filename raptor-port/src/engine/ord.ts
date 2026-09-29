// src/state/ord.ts
/* THE ORDER OF A LIST, ON EACH ROW ([DB-READINESS] group A, phase 2 — plan §2.3; Fable F5, F2-04; Astra R2-10).
   Once the requests, the roster and the planning notes are one stored row each, a list's order can no longer be the
   position of an item inside one big record. Each row carries its place: `ord`, a number, sparse — the design's
   `sortIndex` (decimal) on `Input`, `Person`, `PlanningPuck`. The order everywhere is (ord, id): two rows given the
   same place by two people at once still read the same way on every device.

   `ord` is minted where the ids are minted — at every command's apply-end (state/sched-commit.ts applyEnd, the people
   store's advance) — and ONLY for rows that need one, from their current neighbours in the live list:
   - a row with no `ord` between two that have one takes the midpoint (a run of several, evenly spaced);
   - at the top, 1024 below the first; at the bottom, 1024 above the last; a list with none at all, 1024 apart;
   - a row that HAS one and still sits in order keeps it, untouched — so a new request on top writes ONE row, and a
     leave cut around a medical writes only its pieces;
   - a row whose `ord` no longer fits where the list now holds it (a writer MOVED it — a planning note dragged to
     another place on its day) takes a new one; the fewest rows possible are renumbered (those outside the longest
     run already in order), so a moved row is one row written.
   When a gap closes (the midpoint no longer lands strictly between), every row takes a fresh `ord` 1024 apart — the
   one time a whole list is renumbered, and every row it changes is named in the command's change (plan §2.3). */

export const ORD_STEP = 1024

const hasOrd = (r: any) => r && typeof r === 'object' && typeof r.ord === 'number' && Number.isFinite(r.ord)

/** the (ord, id) comparison every reader sorts by; a row with no ord sorts after every row that has one */
export function byOrd(idOf: (r: any) => string) {
  return (a: any, b: any): number => {
    const x = hasOrd(a) ? a.ord : Infinity, y = hasOrd(b) ? b.ord : Infinity
    if (x !== y) return x < y ? -1 : 1
    const i = String(idOf(a) ?? ''), j = String(idOf(b) ?? '')
    return i < j ? -1 : i > j ? 1 : 0
  }
}

/** sort a live list IN PLACE by (ord, id) — every reader holds the array's identity */
export function sortByOrd(rows: any[], idOf: (r: any) => string): void {
  const sorted = rows.slice().sort(byOrd(idOf))
  for (let i = 0; i < sorted.length; i++) rows[i] = sorted[i]
}

/* the indexes of the longest run of rows already in (ord, id) order — the rows that keep their ord */
function keepers(rows: any[], idOf: (r: any) => string): Set<number> {
  const cmp = byOrd(idOf)
  const idx = rows.map((_, i) => i).filter(i => hasOrd(rows[i]))
  const tails: number[] = [], prev: number[] = new Array(rows.length).fill(-1)
  for (const i of idx) {
    let lo = 0, hi = tails.length
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cmp(rows[tails[mid]], rows[i]) < 0) lo = mid + 1; else hi = mid }
    if (lo > 0) prev[i] = tails[lo - 1]
    tails[lo] = i
  }
  const out = new Set<number>()
  for (let i = tails.length ? tails[tails.length - 1] : -1; i >= 0; i = prev[i]) out.add(i)
  return out
}

/** Give every row that needs one an `ord` from its neighbours (above). Returns whether anything changed. */
export function mintOrd(rows: any[], idOf: (r: any) => string): boolean {
  if (!rows.length) return false
  const keep = keepers(rows, idOf)
  let changed = false
  for (let i = 0; i < rows.length; i++) if (!keep.has(i) && rows[i] && typeof rows[i] === 'object' && 'ord' in rows[i]) { delete rows[i].ord; changed = true }
  let i = 0
  while (i < rows.length) {
    if (hasOrd(rows[i]) || !rows[i] || typeof rows[i] !== 'object') { i++; continue }
    let j = i
    while (j < rows.length && !hasOrd(rows[j]) && rows[j] && typeof rows[j] === 'object') j++
    const lo = i > 0 && hasOrd(rows[i - 1]) ? rows[i - 1].ord : null
    const hi = j < rows.length && hasOrd(rows[j]) ? rows[j].ord : null
    const k = j - i
    for (let n = 0; n < k; n++) {
      rows[i + n].ord = lo == null && hi == null ? (i + n + 1) * ORD_STEP
        : lo == null ? hi - (k - n) * ORD_STEP
        : hi == null ? lo + (n + 1) * ORD_STEP
        : lo + ((hi - lo) * (n + 1)) / (k + 1)
    }
    changed = true
    /* the gap closed: the new places no longer sit strictly between their neighbours — renumber the whole list */
    const at = (x: number) => rows[x].ord
    for (let n = i; n < j; n++) {
      const a = n > 0 ? at(n - 1) : -Infinity, b = n + 1 < rows.length && hasOrd(rows[n + 1]) ? at(n + 1) : Infinity
      if (!(a < at(n) && at(n) < b)) { renumber(rows); return true }
    }
    i = j
  }
  return changed
}

function renumber(rows: any[]): void {
  let n = 0
  for (const r of rows) if (r && typeof r === 'object') r.ord = ++n * ORD_STEP
}
