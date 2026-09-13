/* VERSION IDENTITY — Phase 1c, amendment-engine core build (AM-01)
   (docs/superpowers/specs/2026-09-12-amendment-core-build-plan.md §Phase 1c;
   brief §5 AM-01).

   A published version's IDENTITY is an immutable, per-day-unique id built from
   the day's FULL ISO date (incl the year) plus a per-day SEQUENCE (0 = Original,
   1 = AL1, 2 = AL2 …). The sequence and the display label ('Original', 'AL1' …)
   are kept separate from the id: the number is DISPLAY only, the id is the key.

   Why the full date, incl the year (brief §5.0 / AM-01):
   - It cannot collide across days — Monday-AL1 and Tuesday-AL1 are different
     ids, where the bare AL number the book uses today ('orig' | n) is only
     unique within a single day.
   - It is unaffected by the dow/dt/wc/today restamp (those are excluded from
     canonical content), so an id minted on one load still names the same
     version on the next, even across a year boundary.

   Pure module — no globals, no store reads. The bridge from the book's current
   'orig' | n addressing to these ids is Phase 2 work (the AL record rewrite);
   this file is the identity PRIMITIVE it will build on.

   Ordinary TS style (new file, not a ported engine body). */

const DAY_MS = 86_400_000

/** A day's full ISO date, `yyyy-mm-dd` incl the year, from the week's Monday key
 *  (`dd/mm/yyyy`, engine/waves.ts CURWEEK) and the day index (0 = Mon … 6 = Sun).
 *  Same UTC-midnight arithmetic as ui/WeekCal.tsx and ui/weeknav.ts, so the id's
 *  date and the calendar's date can never disagree. */
export function dayIso(weekKey: string, di: number): string {
  const [d, m, y] = weekKey.split('/').map(n => parseInt(n, 10))
  const dt = new Date(Date.UTC(y, m - 1, d) + di * DAY_MS)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${dt.getUTCFullYear()}-${p(dt.getUTCMonth() + 1)}-${p(dt.getUTCDate())}`
}

/** The immutable version id: the day's ISO date + `#` + the per-day sequence.
 *  e.g. `2026-07-13#0` (Original), `2026-07-13#1` (AL1). */
export function verId(iso: string, seq: number): string {
  return `${iso}#${seq}`
}

/** Split an id back into its ISO date and sequence. `#` is used only as the one
 *  separator (an ISO date never contains it), so lastIndexOf is exact. */
export function parseVerId(id: string): { iso: string; seq: number } {
  const s = String(id)
  const i = s.lastIndexOf('#')
  return { iso: s.slice(0, i), seq: +s.slice(i + 1) }
}
export function verIso(id: string): string { return parseVerId(id).iso }
export function verSeq(id: string): number { return parseVerId(id).seq }

/** Strict SYNTAX validity of a verId (§1, P2-REREVIEW-11). parseVerId is lenient
 *  — it coerces, so `2026-07-13#` reads as sequence 0 and `iso#-1` / `iso#1.5`
 *  slip through — but a resolver that must reject a malformed identity tests this
 *  first. Requires a REAL yyyy-mm-dd calendar date, a single `#`, and a
 *  nonnegative safe-integer sequence (digits only: no sign, decimal or empty). */
export function isValidVerId(id: any): boolean {
  const s = String(id)
  const i = s.lastIndexOf('#')
  if (i < 0) return false
  const iso = s.slice(0, i), seqStr = s.slice(i + 1)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const [y, m, d] = iso.split('-').map(n => +n)
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return false   // a real calendar date
  if (!/^\d+$/.test(seqStr)) return false            // digits only → nonnegative integer
  return Number.isSafeInteger(+seqStr)
}

/** The display label for a sequence: 0 (or below) = Original, else AL<seq>. The
 *  per-day AL number lives here, in display, never in a key. */
export function verSeqLabel(seq: number): string {
  return seq <= 0 ? 'Original' : 'AL' + seq
}
/** The display label for a whole id (its sequence's label). */
export function verIdLabel(id: string): string { return verSeqLabel(verSeq(id)) }
