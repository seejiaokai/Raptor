// Wire 0 of the Leave War ⇄ Raptor sync (docs/superpowers/specs/
// leavewar-sync.md): ONE roster. Leave War's people are a PROJECTION of
// Raptor's own PEOPLE, computed at boot and installed through setPeople —
// never stored, so the two rosters cannot drift. `categoryOf` derives the
// category from seat + band, which is precisely what lets Raptor's roster
// drop in without a migration.

import { PEOPLE, isInstr } from '../../engine/people'
import type { Person, QualDef } from '../engine'

/**
 * Raptor's aircrew as Leave War people.
 *
 * - Ground crew (`pers: true`, seat `GND`) are excluded — Leave War is
 *   aircrew-only today and the owner has not asked otherwise.
 * - Sentinel bodies (`special`, e.g. ALL AVAIL) are excluded too: they are
 *   slot fillers, not people, and a leave row for one would be nonsense.
 *   (The spec names only ground crew; the sentinel exclusion follows from
 *   the same rule — Raptor itself keeps them out of every roster surface.)
 * - ARCHIVED bodies are excluded on the same principle: `archived` "keeps them
 *   out of every roster" in Raptor (people.ts), and the Quals table already
 *   hides them, so a body taken off the roster there must leave Leave War too
 *   (it does, on the next notify, via reprojectRoster). Every sentinel is also
 *   archived, so this subsumes the `special` skip; both are kept for clarity.
 * - SANS aircrew (`p.san`) are excluded BY DEFAULT (owner, 18 Aug 26 — "we
 *   will not show the SANS in the leave war however there is a function to
 *   still enable this"): SANS offer availability rather than being planned as
 *   squadron manning, so they neither ride the leave grid nor count in its
 *   manning rows. The enable function is the store's `showSans` config
 *   (`setShowSans`, admin-gated, surfaced in the Rearrange toolbar) — its two
 *   callers pass it through as `includeSans`, and with it on a SANS body rides
 *   the roster exactly as before the exclusion existed.
 * - `band` reads off the CAT ladder exactly as Raptor's own `isInstr` does:
 *   the instructor CATs (IW / IP / IR / FI) are 'instructor', the rest
 *   (OCU → D → C → B → A) are 'ops'.
 * - `from`/`to` are null: Raptor has no posting dates. The demo overlay in
 *   state/demoworld.ts is the one thing that sets them, and only on the
 *   demo crew.
 */
export function projectPeople(includeSans = false): Person[] {
  const out: Person[] = []
  for (const [id, p] of Object.entries<any>(PEOPLE)) {
    if (p.special || p.archived) continue
    if (p.san && !includeSans) continue
    // Ground crew ride the roster since 18 Aug 26 (owner: "when I add
    // personnel through quals, the new personnel will appear on leave war
    // too"). They carry no CAT and no flying seat — `pers` marks them out of
    // every manning count — and their free-text label seeds from Raptor's
    // own `flight`, editable in Leave War's edit mode thereafter.
    if (p.pers || p.seat === 'GND') {
      out.push({
        id, callsign: p.cs, seat: 'gnd', band: 'ops', sxo: false,
        from: null, to: null, pers: true, label: p.flight || '',
      })
      continue
    }
    out.push({
      id,
      callsign: p.cs,
      seat: p.seat === 'FCP' ? 'pilot' : 'wso',
      band: isInstr(p.q) ? 'instructor' : 'ops',
      sxo: !!p.sxo,
      from: null,
      to: null,
      // The CAT itself, for the display's by-CAT grouping and colour — never
      // for manning, which reads seat + band as it always has.
      q: p.q || '',
      // SC currency, for the SC D / SC N team rows only (owner, 19 Aug 26).
      // Ticked on Raptor's Quals page; reprojectRoster's signature carries
      // them, so a tick reaches Leave War on the next notify like any other
      // qual change.
      scd: !!(p.quals && p.quals.scDay),
      scn: !!(p.quals && p.quals.scNight),
      // EVERY held qualification key, for the custom counters' filters
      // (owner, 19 Aug 26). Truthy covers the AAR cells' 'I' state — cleared
      // to instruct is still held. Sorted so an unchanged set compares equal
      // in reprojectRoster's change guard whatever order the object held.
      xq: Object.keys(p.quals || {}).filter(k => p.quals[k]).sort(),
      // A SANS body only reaches here when includeSans is on (dropped above
      // otherwise). Carry the flag so the display can draw them in their own
      // group at the foot (owner, 3 Sep 26); manning never reads it.
      san: !!p.san,
    })
  }
  return out
}

/** The headings Raptor's own Quals page gives its built-in columns. A copy of
 *  those labels rather than an import: the page is a component and this is a
 *  state file, and a heading is display vocabulary — a drifted label mislabels
 *  a chip, never a count. A key with no entry (a column the squadron added)
 *  shows as its key upper-cased, which is the key's own heading minus spaces. */
const QUAL_LABELS: Record<string, string> = {
  san: 'SANS', sxo: 'SXO', sched: 'Scheduler', scDay: 'SC DAY', scNight: 'SC NIGHT',
  daar: 'DAAR', naar: 'NAAR', nvg: 'NVG', imc: 'IMC', tf: 'TF',
}

/**
 * The qualification chips the counter form offers: every key any Raptor body
 * carries (`deriveQuals` writes the full built-in set onto every aircrew, so
 * the ten standard columns are always here; a squadron-added column joins as
 * soon as anyone is ticked). Known keys first in the Quals page's own order,
 * additions after, alphabetically — a stable list, so the chips never jump.
 */
export function qualCatalogue(): QualDef[] {
  const keys = new Set<string>()
  for (const p of Object.values<any>(PEOPLE)) {
    if (p.special || p.archived) continue
    for (const k of Object.keys(p.quals || {})) keys.add(k)
  }
  const known = Object.keys(QUAL_LABELS).filter(k => keys.has(k))
  const extra = [...keys].filter(k => !(k in QUAL_LABELS)).sort()
  return [...known, ...extra].map(k => ({ k, label: QUAL_LABELS[k] ?? k.toUpperCase() }))
}
