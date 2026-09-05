/* THE DROP DELTA (owner, 5 Sep 26 — "it also needs to show flagging
   realtime"). A drop or a palette plant already runs the whole validator in
   its epilogue, and the validator already reaches across the week: crew rest
   reads yesterday's end against today's report, the seven-day run counts the
   week seeded from last week, crew pairing reads the OTHER seat. What the
   scheduler did not get was told: the breach chip lands on the day the rule
   crosses — Sunday for a run started on Monday, tomorrow for a late landing
   today — which on a phone board showing one day is off-screen, and the only
   drop-time voice was slotBar's, an oracle that judges one man against one
   slot and cannot see the other seat, the rest of the week or tomorrow.

   THE DELTA IS THE VOICE. Keep WARN as it stood before the write, let the
   epilogue's one validate() rebuild it, and the warnings present after but
   not before are exactly what this drop caused — every rule at once, no
   second copy of any rule's arithmetic, so the standing "picker and warning
   list may not drift" rule holds by construction. The first new warning is
   toasted in the validator's own words, prefixed with its DAY whenever that
   is not the day dropped on (the reach is the point), and every puck the new
   warnings name is pulsed on its own day for a moment after the repaint
   (highlights.ts hangs .flagnew off NEWFLAGS, so the pulse survives the
   per-block swap that gives the breach day fresh nodes).

   Notes (grey — the long-day count) are left out of the toast: the chip says
   it, and a toast for a 12h05 day on every drop would drown the breaches.
   The old slotBar toast stays as the FALLBACK when the delta is empty —
   the two agree by contract, so this is belt-and-braces, not a second rule. */
import { WARN, RANK } from '../engine/validate'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'

/* The chip each warning code prints — the markChip pairings in validate.ts,
   listed here ONLY to order the toast: a drop that raises three things at
   once leads with the one the puck itself shows (RANK picks the printed
   chip; a WSO on a front seat wears Q, not the C his double seat also
   earns). Ordering only — a code missing here still toasts, after the rest. */
const CHIP_OF: any = {
  QUAL: 'Q', SC_QUAL: 'Q', AAR_QUAL: 'Q',
  DOUBLE_BOOK: 'C', DNIF_FLY: 'C', LEAVE_FLY: 'C', INPUT_FLY: 'C',
  ILLEGAL_CREW: 'CPH', NO_IR: 'CPH', AAR_INSTR: 'CPH',
  DAYS_RUN: 'RUN', CREW_REST: 'CR',
  CREW_SOLO: 'CP', CO_APPROVAL: 'CP', OCU_NO_IP: 'CP', PAX_CREW: 'CP',
  NO_BRIEF: 'NB', DEBRIEF: 'DB', SIM_BRIEF: 'SB', SIM_DEBRIEF: 'SD',
  SHIFT_SOFT: 'A', SANS_AVAIL: 'A', SC_INTIME: 'A', TURN: 'TT', CREW_TIGHT: 'TT', DT_SUM: 'DT',
}
const rankOf = (w: any) => (w.sev === 'hard' ? 100 : 0) + (RANK[CHIP_OF[w.code]] ?? -1)

/* one warning's identity — the validator's own dedupe key plus the day, so
   the same breach re-raised on the same day is "unchanged" and the same man
   flagged on a different day is "new" */
export const warnKey = (w: any) => `${w.code}|${w.di}|${(w.who || []).join(',')}|${w.msg}`

/* warnings in `after` that `before` did not carry — hard and advisory only.
   A `before` that was never validated (byDay empty) cannot say what is new,
   so it answers nothing rather than reading the whole week as fresh. */
export function warnDelta(before: any, after: any): any[] {
  if (!before || !after || !Array.isArray(after.all)) return []
  if (!Array.isArray(before.byDay) || !before.byDay.length) return []
  const seen = new Set((before.all || []).map(warnKey))
  return after.all.filter((w: any) => w && w.sev !== 'note' && !seen.has(warnKey(w)))
    .map((w: any, i: number) => [w, i]).sort((a: any, b: any) => (rankOf(b[0]) - rankOf(a[0])) || (a[1] - b[1])).map((x: any) => x[0])
}

/* pucks to pulse after the next repaint: "di:id" → expiry (ms epoch). Read
   by highlights.ts; entries outlive the animation harmlessly and are dropped
   on the next read past their expiry. */
export const NEWFLAGS: Map<string, number> = new Map()
const PULSE_MS = 3000
export function isNewFlag(di: any, id: any) {
  const k = `${di}:${id}`, t = NEWFLAGS.get(k)
  if (t == null) return false
  if (t < Date.now()) { NEWFLAGS.delete(k); return false }
  return true
}

/* The toast line: the validator's message, the day in front when it is not
   the day dropped on, the callsign in front when the message does not already
   open with it (a few clash messages name the two events, not the man). */
export function flagLine(w: any, dropDi: any) {
  const id = (w.who || [])[0]
  const cs = id && PEOPLE[id] ? PEOPLE[id].cs : ''
  let m = String(w.msg || '')
  if (cs && m.indexOf(cs) !== 0) m = `${cs} — ${m}`
  if (w.di != null && w.di !== dropDi && w.day) m = `${String(w.day).slice(0, 3)} · ${m}`
  return m
}

/* Called AFTER the epilogue's validate(). Returns true when it spoke, so the
   caller can hold its own fallback toast. `after` defaults to the live WARN;
   tests hand in fixtures. */
export function flagDrop(before: any, dropDi: any, after: any = WARN): boolean {
  const d = warnDelta(before, after)
  if (!d.length) return false
  const w = d[0]
  const more = d.length > 1 ? ` (+${d.length - 1} more)` : ''
  HOOKS.toast(flagLine(w, dropDi) + more, w.sev === 'hard' ? 'hard' : 'warn')
  const until = Date.now() + PULSE_MS
  d.forEach((x: any) => (x.who || []).forEach((id: any) => { if (x.di != null) NEWFLAGS.set(`${x.di}:${id}`, until) }))
  return true
}
