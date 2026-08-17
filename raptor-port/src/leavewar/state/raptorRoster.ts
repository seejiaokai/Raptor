// Wire 0 of the Leave War ⇄ Raptor sync (docs/superpowers/specs/
// leavewar-sync.md): ONE roster. Leave War's people are a PROJECTION of
// Raptor's own PEOPLE, computed at boot and installed through setPeople —
// never stored, so the two rosters cannot drift. `categoryOf` derives the
// category from seat + band, which is precisely what lets Raptor's roster
// drop in without a migration.

import { PEOPLE, isInstr } from '../../engine/people'
import type { Person } from '../engine'

/**
 * Raptor's aircrew as Leave War people.
 *
 * - Ground crew (`pers: true`, seat `GND`) are excluded — Leave War is
 *   aircrew-only today and the owner has not asked otherwise.
 * - Sentinel bodies (`special`, e.g. ALL AVAIL) are excluded too: they are
 *   slot fillers, not people, and a leave row for one would be nonsense.
 *   (The spec names only ground crew; the sentinel exclusion follows from
 *   the same rule — Raptor itself keeps them out of every roster surface.)
 * - `band` reads off the CAT ladder exactly as Raptor's own `isInstr` does:
 *   the instructor CATs (IW / IP / IR / FI) are 'instructor', the rest
 *   (OCU → D → C → B → A) are 'ops'.
 * - `from`/`to` are null: Raptor has no posting dates. The demo overlay in
 *   state/demoworld.ts is the one thing that sets them, and only on the
 *   demo crew.
 */
export function projectPeople(): Person[] {
  const out: Person[] = []
  for (const [id, p] of Object.entries<any>(PEOPLE)) {
    if (p.pers || p.seat === 'GND') continue
    if (p.special) continue
    out.push({
      id,
      callsign: p.cs,
      seat: p.seat === 'FCP' ? 'pilot' : 'wso',
      band: isInstr(p.q) ? 'instructor' : 'ops',
      sxo: !!p.sxo,
      from: null,
      to: null,
    })
  }
  return out
}
