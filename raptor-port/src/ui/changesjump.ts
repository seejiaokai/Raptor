/* WHERE A TAP ON A LINE OF THE CHANGES WINDOW TAKES THE SCHEDULE — moved whole, word for word, out of ui/ChangesWindow.tsx
   (3 Nov 26 — React Doctor's only-export-components: the window's file hands out its parts alone, so it can be swapped in
   place while the app is being built). The window asks it for every line (may it go, and where); the tests ask it too. */
import { DAYS } from '../engine/data'
import { INPUTS, inpId, inputCoversDate, idsOf, holds } from '../engine/inputs'
import { posKey } from '../engine/rowids'
import { standsOn } from '../engine/overlay'
import type { CLine } from './changesmodel'

/* where a tap on a line takes the schedule, and on which day of the loaded week — null when it has nowhere to go */
export function jumpOf(l: CLine, days: string[], pick: string | null): { keys: string[]; di: number } | null {
  const inWeek = (d: string | null | undefined) => d != null && days.includes(d)
  const di0 = pick && days.includes(pick) ? days.indexOf(pick) : days.findIndex(d => l.rows.some(r => r.date === d || (r.date && r.end && r.date <= d && d <= r.end)))
  if (l.iid) {
    const inp: any = INPUTS.find((x: any) => inpId(x) === l.iid)
    if (!inp) return null
    const keys: string[] = []
    /* an accepted request: its row on the programme first (Astra DP-08), then its row under Unavailable. Its STANDING row
       only — a dead kept row (a version's row on a day the request no longer covers, D363) carries its id but is not its
       row, and a line never goes there ([DB-READINESS] phase 6 (c), the FULL check: Astra's scenario design §3 C) */
    /* …and a line about ONE man (the history files it under him — `one`, `sub`) goes to HIS place on that row first, the
       row's name box after it: the tap on "Tally · Range brief · added" lit the first man on the row (the one-rule job's
       walk, share C, C11 — 12 Oct 26) */
    const man = l.rows && l.rows[0] && (l.rows[0] as any).one ? String((l.rows[0] as any).sub || '') : ''
    DAYS.forEach((d: any, di: number) => { const g = standsOn(d, l.iid, inp); const ri = g ? (d.ground || []).indexOf(g) : -1; if (ri < 0) return
      const n = man && g.who !== man ? (g.more || []).indexOf(man) : -1
      if (n >= 0) keys.push(`g:${di}.${ri}.x${n}`)
      keys.push(`g:${di}.${ri}`) })
    /* the day it goes to is a day its row is DRAWN on now — its programme row's day, or a day its dates cover (under
       Unavailable or Personal Inputs) — the chosen day only when it is one of them: a line shown on a day by the days the
       input LEFT goes to where it is now (Astra's read of the fixes, 03); drawn on no day of this week, the line is listed,
       not a button (Fable's final read, F5) */
    const on = new Set<number>()
    DAYS.forEach((d: any, di: number) => {
      if (di >= days.length) return
      if (standsOn(d, l.iid, inp) || (d.dt && inputCoversDate(inp, d.dt))) on.add(di)
    })
    if (!on.size) return null
    /* one man's row of an input that holds several is named with him (engine/keys.ts iuParts) — the line's own man */
    /* (HIS NAME IS ON THE LINE'S ROW — the window's own line carries no `sub` (ui/changesmodel.ts CLine); the change
       history files a line about one man put in or taken out under him, and a line about the input under its first to
       join (state/changelines.ts). Read off the line alone, the tap went to the bare `iu:<iid>` and fell back to the
       FIRST row of an absence filed for several — the one-rule job's walk, share J, J2, 12 Oct 26.) */
    { const sub = String((l as any).sub || (l.rows && l.rows[0] && (l.rows[0] as any).sub) || ''); if (sub && idsOf(inp).length > 1 && holds(inp, sub)) keys.push(`iu:${l.iid}~${sub}`) }
    keys.push(`iu:${l.iid}`)
    const pi = pick ? days.indexOf(pick) : -1
    const di = on.has(pi) ? pi : on.has(di0) ? di0 : Math.min(...on)
    return { keys, di }
  }
  if (!l.key || !inWeek(l.date)) return null
  const pk = posKey(l.key, DAYS)
  return { keys: [String(pk == null ? l.key : pk)], di: days.indexOf(l.date!) }
}
