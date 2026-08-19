// The roster. Categories are DERIVED from seat and band rather than stored,
// which is what lets RAPTOR's own roster replace this one without a migration:
// it already holds seat, the CAT ladder and an `sxo` qualification flag.

/** `gnd` is ground crew — no flying seat. It exists so a personnel body can
 *  ride the same roster, and every MANNING path skips it (countsFor); only the
 *  display groups it. */
export type Seat = 'pilot' | 'wso' | 'gnd'
/** `ops` is CAT D up to CAT A; `instructor` is the instructor grades above it. */
export type Band = 'instructor' | 'ops'
export type Category = 'IP' | 'OPSP' | 'IWSO' | 'OPSW'

export interface Person {
  id: string
  callsign: string
  seat: Seat
  band: Band
  /** Counted as an SXO on top of their normal category, never instead of it. */
  sxo: boolean
  /** First day in the squadron, inclusive. `null` means always. */
  from: string | null
  /** Last day in the squadron, inclusive — the posting-out date. `null` means still here. */
  to: string | null
  /** Archive the Raptor body once the posting-out date arrives (the PO
   *  sheet's "Archive on PO date" switch — owner, 19 Aug 26: on by default,
   *  off for the custom cases). Explicit true/false, written ONLY by
   *  `setPostOut` alongside `to`: absent means the window came from somewhere
   *  other than the sheet (seed, demo overlay), and the auto-archive pass in
   *  sync.ts leaves those alone. Meaningless without `to`. */
  poArchive?: boolean
  /** The Raptor CAT (OCU/D/C/B/A/IW/IP/IR/FI), carried through the projection
   *  so the display can group ops crew by CAT and split OCU / instructors out.
   *  Absent on the seed people (which know only band) — the display falls back
   *  to band there. NEVER read by manning: `categoryOf` still derives from
   *  seat + band, so a stale or missing CAT cannot move a count. */
  q?: string
  /** SC DAY / SC NIGHT currency, carried through the Raptor projection for the
   *  SC D / SC N team rows (owner, 19 Aug 26). Like `q` these are Raptor's to
   *  hold — the Quals page is where they are ticked — and NEVER read by the
   *  category counts: only the two SC team figures in `countsFor` look at
   *  them, so a stale or missing flag cannot move any other manning number.
   *  Absent on the raw seed people until `seedPeople` assigns the demo set. */
  scd?: boolean
  scn?: boolean
  /** EVERY qualification key this person holds in Raptor (`p.quals` truthy
   *  keys — sxo, scDay, daar, plus anything the squadron adds on the Quals
   *  page later), carried through the projection for the custom counters'
   *  filters (owner, 19 Aug 26). Like `q`, Raptor's to hold; absent on the
   *  raw seed, whose three boolean flags `heldQuals` folds in instead. */
  xq?: string[]
  /** Ground crew. Included in the roster since 18 Aug 26 (owner) so they can
   *  hold leave and be seen; excluded from every aircrew manning count. */
  pers?: boolean
  /** A personnel body's free-text label ("Maintenance", "Line crew"). Editable
   *  in edit mode; seeded from Raptor's `flight`. Only meaningful when `pers`. */
  label?: string
}

export function categoryOf(p: Person): Category {
  // Manning only. Ground crew never reach here — countsFor skips `pers` before
  // it would call this — but default the impossible seat to the WSO branch so
  // the return type stays a real Category rather than widening every caller.
  if (p.seat === 'pilot') return p.band === 'instructor' ? 'IP' : 'OPSP'
  return p.band === 'instructor' ? 'IWSO' : 'OPSW'
}

/**
 * Flight-lead vs wingman, for the FL P / WM P manning rows (owner, 18 Aug 26 —
 * "FL P (flight lead pilot) is cat B pilot and above; WM P (wingman pilot) is
 * cat C and below", instructor pilots counting as FL). PILOTS only — a WSO or
 * ground crew is neither, so this returns null for them.
 *
 * This is the ONE manning path that reads the CAT (`q`), a deliberate exception
 * to the note on `Person.q`: the owner's rule is CAT-defined, so it cannot be
 * derived from band alone the way `categoryOf` is. An instructor pilot is a
 * flight lead by BAND (IP/IR/FI are all above CAT B), so that case needs no
 * CAT; an ops pilot is read by CAT, and one with no CAT at all falls back to
 * wingman — the junior default — so FL P and WM P still partition every pilot
 * rather than dropping one silently. On the live app every pilot carries a real
 * CAT through the Raptor projection, so the fallback only ever meets the raw
 * seed (which knows band but not CAT).
 */
export function pilotLead(p: Person): 'FLP' | 'WMP' | null {
  if (p.seat !== 'pilot') return null
  if (p.band === 'instructor') return 'FLP'
  const q = (p.q || '').toUpperCase()
  return q === 'A' || q === 'B' ? 'FLP' : 'WMP'
}

// ---- Display grouping (owner, 18 Aug 26) --------------------------------
// The roster is drawn in named, colour-coded groups: SXO lifted to the top,
// then instructor pilots, ops pilots (by CAT), instructor WSOs, ops WSOs (by
// CAT), OCU, and ground crew. This is a DISPLAY layer only — `categoryOf`,
// the requirements and every count are untouched, so an OCU still counts as
// ops manning exactly as before; it is merely shown under its own heading.

export type Group = 'SXO' | 'IP' | 'OPSP' | 'IWSO' | 'OPSW' | 'OCU' | 'PERS'

/** Top-to-bottom order of the groups, the owner's own sequence. */
export const GROUP_ORDER: Group[] = ['SXO', 'IP', 'OPSP', 'IWSO', 'OPSW', 'OCU', 'PERS']

export const GROUP_LABEL: Record<Group, string> = {
  SXO: 'SXO', IP: 'IP', OPSP: 'OPS P', IWSO: 'IWSO', OPSW: 'OPS W', OCU: 'OCU', PERS: 'Personnel',
}

/** Which display group a person belongs to. SXO wins over their flying
 *  category (an SXO IP shows once, at the top); ground crew are always PERS. */
export function groupOf(p: Person): Group {
  if (p.pers || p.seat === 'gnd') return 'PERS'
  if (p.sxo) return 'SXO'
  if ((p.q || '').toUpperCase() === 'OCU') return 'OCU'
  if (p.seat === 'pilot') return p.band === 'instructor' ? 'IP' : 'OPSP'
  return p.band === 'instructor' ? 'IWSO' : 'OPSW'
}

/** Most-qualified first: FI, IR, IP, IW, then the ops grades A→D, then OCU
 *  (owner, 18 Aug 26 — "look at my list of hierarchy"; the SXO group was
 *  jumbled because IP and IW used to share one rank and interleaved by
 *  callsign). Every grade now has its OWN rank, so a mixed group (SXO) reads
 *  top-qual-down; an ops-only group (OPS P / OPS W) is unaffected — it holds
 *  only A→D, whose relative order is unchanged. Unknown CATs sort last. */
const CAT_RANK: Record<string, number> = { FI: 0, IR: 1, IP: 2, IW: 3, A: 4, B: 5, C: 6, D: 7, OCU: 8 }

/** The CAT text a person's chip shows: their Raptor CAT, or the plain
 *  category as a fallback when the seed carries no CAT. Empty for ground crew
 *  (their free-text label stands in its place). */
export function catText(p: Person): string {
  if (p.pers || p.seat === 'gnd') return ''
  return (p.q || '').toUpperCase() || categoryOf(p)
}

/** The colour class for a person's chip, reusing Raptor's own `--q-*` CAT
 *  palette so a callsign wears the same colour in Quals and here. Ops crew
 *  colour by CAT letter; instructors share one; SXO and Personnel get their
 *  own; a seed person with no CAT falls back to a neutral ops fill. */
export function catClass(p: Person): string {
  const g = groupOf(p)
  if (g === 'PERS') return 'q-pers'
  if (g === 'SXO') return 'q-sxo'
  if (g === 'OCU') return 'q-ocu'
  if (g === 'IP' || g === 'IWSO') return 'q-ins'
  const q = (p.q || '').toUpperCase()
  return (q === 'A' || q === 'B' || q === 'C' || q === 'D') ? 'q-' + q.toLowerCase() : 'q-ops'
}

/** The CAT sub-heading a person sits under inside an ops group (desktop only),
 *  e.g. 'A'. Empty when the person is not in an ops group or carries no CAT. */
export function opsCatOf(p: Person): string {
  if (groupOf(p) !== 'OPSP' && groupOf(p) !== 'OPSW') return ''
  const q = (p.q || '').toUpperCase()
  return (q === 'A' || q === 'B' || q === 'C' || q === 'D') ? q : ''
}

/** The default categorised order: every group in `GROUP_ORDER`, each sorted by
 *  CAT (A first) then callsign. This is what the Auto-sort button writes and
 *  what a roster with no manual order shows. Stable and pure. */
export function autoOrder(people: Person[]): string[] {
  const out: string[] = []
  for (const g of GROUP_ORDER) {
    const arr = people.filter(p => groupOf(p) === g)
    arr.sort((a, b) => {
      const ra = CAT_RANK[(a.q || '').toUpperCase()] ?? 9
      const rb = CAT_RANK[(b.q || '').toUpperCase()] ?? 9
      if (ra !== rb) return ra - rb
      return a.callsign.localeCompare(b.callsign)
    })
    for (const p of arr) out.push(p.id)
  }
  return out
}

/** Apply a stored id order to the live roster: ids in `order` first (in that
 *  order), then anyone not yet placed appended in `autoOrder` position — so a
 *  person added to the squadron after the order was saved still appears,
 *  grouped, rather than vanishing. Ids in `order` that no longer exist are
 *  dropped. Returns the people in display order. */
export function orderedPeople(people: Person[], order: string[]): Person[] {
  const byId = new Map(people.map(p => [p.id, p]))
  const placed = new Set<string>()
  const out: Person[] = []
  for (const id of order) {
    const p = byId.get(id)
    if (p && !placed.has(id)) { out.push(p); placed.add(id) }
  }
  if (out.length < people.length) {
    for (const id of autoOrder(people)) {
      if (!placed.has(id)) { out.push(byId.get(id)!); placed.add(id) }
    }
  }
  return out
}

/**
 * The category as the grid shows it, with `(S)` appended for an SXO.
 *
 * The owner's ask, 10 Aug 26: "if they are SXO qualified they will have a (S)
 * tagged to it. Like IW(S)." SXO sits ON TOP of a category rather than
 * instead of one — a requirement of "2 pilots, 2 WSOs, 1 SXO" needs the same
 * person counted twice — so this decorates the category rather than replacing
 * it, and `categoryOf` is untouched. Everything that counts, sorts or
 * requires a category goes on reading the plain one; only the label differs.
 */
export function categoryLabel(p: Person): string {
  return p.sxo ? `${categoryOf(p)}(S)` : categoryOf(p)
}

// Plain string comparison is correct for `yyyy-mm-dd`: the format sorts
// lexicographically in date order, so no parsing (and no timezone) is involved.
export function inSquadron(p: Person, date: string): boolean {
  if (p.from && date < p.from) return false
  if (p.to && date > p.to) return false
  return true
}
