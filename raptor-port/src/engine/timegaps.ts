/* [END-TIME-GUARD] — WHICH ITEMS OF A DAY ARE MISSING A TIME: the ONE place the rule is decided (port-only, not a port of
   the original app). Every refusal and every screen asks this; none counts by itself.

   His rulings: D2852 (26 Nov 26) — before a sign-off, Publish day or Publish AL, every item with someone on it needs its
   start and its end, and a row with a start needs its end even with nobody on it; an empty start counts as an empty end
   does; left out: a row from an input with All day ticked, a cancelled or information-only item, the AMT block's BRIEF
   and DEBRIEF while nobody is on them, a blank row with nobody on it. "Someone on it": a person, ALL or ALL AVAIL, or a
   callsign typed in its people box; a desk showing only its role is nobody. D2612 (25 Nov): the day is never published
   or signed off while one stands. D2790: a typed row never gets all day — both boxes empty with someone on it is two
   missing times. D2855: a "TBD" time counts as empty.

   WHAT NO RULING SETTLES KEEPS WHAT THE APP DID BEFORE — NEVER REFUSED (his D2611: a builder's reading is never built
   on). Each is a question put to him (docs/superpowers/plans/2026-11-27-end-time-guard-plan.md §R5), pinned by a skipped
   test in timegaps.test.ts:
   - R1: only the end typed, nobody on it — not counted;
   - R2: a word other than "TBD" in a time box (from an older saved week; the writer refuses one) — neither a missing
     box nor a typed start;
   - R7: a line with aircraft, every one cancelled — not counted;
   - R8: a sim row's free-text label (`who`, the demo's "EXT SQN") — not someone (a start typed still counts it);
   - Q16: which AMT rows are the block's BRIEF and DEBRIEF — the engine's own label test (events.ts isB / isD), the wider
     one, so a label the ruling may not mean is never refused until he answers.

   "Someone" is read from TRIMMED, NON-EMPTY entries only: the delete blanks seats and list entries to '' in place
   (overlay.ts stripPersonFromDay), and a typed box may hold spaces (the fresh Opus red-team read, 3c).

   Box keys are the ones the week and the board name their time boxes by (ui/html.ts ted(), ui/board.ts), listed in the
   week's page order: Common Programme, flying lines, duty desks, sims, ground programme. */
import { parseHM } from './time'
import { inputOnAny } from './inputs'
import { DAYS } from './data'

export type TimeGaps = { items: number; boxes: string[] }

type Box = 'empty' | 'clock' | 'word'
/** what a time box holds: nothing (or "TBD", any case — D2855), a clock time the engine reads, or some other word (R2) */
export function boxHolds(v: any): Box {
  const s = String(v == null ? '' : v).trim()
  if (!s || /^tbd$/i.test(s)) return 'empty'
  return parseHM(s) != null ? 'clock' : 'word'
}
const has = (v: any) => String(v == null ? '' : v).trim() !== ''
const anyIn = (xs: any) => Array.isArray(xs) && xs.some(has)
/* the AMT block's own header rows, by the engine's label test (events.ts — Q16) */
const isBrief = (r: any) => /^\s*BRIEF/i.test(String((r && r.label) || ''))
const isDebrief = (r: any) => /DEBRIEF/i.test(String((r && r.label) || ''))
/* a ground or programme row standing for an input with All day ticked (D2852); a row the input left behind (`kept`) is
   the scheduler's own typed row. inputOnAny reads the copy a frozen version holds while one is drawn. */
const fromAllDayInput = (r: any) => { if (!r || !r.src || r.kept) return false; const inp = inputOnAny(r.src); return !!(inp && inp.allday) }

export function dayTimeGaps(d: any, di: number): TimeGaps {
  const out: TimeGaps = { items: 0, boxes: [] }
  if (!d) return out
  const item = (someone: boolean, st: any, en: any, sKey: string, eKey: string) => {
    const s = boxHolds(st), e = boxHolds(en)
    const miss: string[] = []
    if (someone) { if (s === 'empty') miss.push(sKey); if (e === 'empty') miss.push(eKey) }
    else if (s === 'clock' && e === 'empty') miss.push(eKey)
    if (miss.length) { out.items++; out.boxes.push(...miss) }
  }
  ;((d.allhands || []) as any[]).forEach((x: any, ri: number) => {
    if (!x || x.cx || x.info || fromAllDayInput(x)) return
    const who = Array.isArray(x.who) ? anyIn(x.who) : has(x.who)
    item(who || anyIn(x.more), x.str, x.end, `ap:${di}.${ri}.str`, `ap:${di}.${ri}.end`)
  })
  ;((d.waves || []) as any[]).forEach((w: any, gi: number) => ((w && w.formations) || []).forEach((f: any, li: number) => {
    if (!f || f.cx) return
    const acs = ((f.aircraft || []) as any[]).filter(Boolean)
    const live = acs.filter((a: any) => !a.cx)
    if (acs.length && !live.length) return            // R7: every aircraft cancelled — as before, never refused
    const someone = live.some((a: any) => has(a.p) || has(a.w) || anyIn(a.more))
    item(someone, f.to, f.ld, `ff:${di}.${gi}.${li}.to`, `ff:${di}.${gi}.${li}.ld`)
  }))
  ;((d.dutywaves || []) as any[]).forEach((dw: any, wi: number) => ((dw && dw.rows) || []).forEach((r: any, ri: number) => {
    if (!r || r.cx || r.info) return
    item(has(r.id) || anyIn(r.more), r.str, r.end, `dr:${di}.${wi}.${ri}.str`, `dr:${di}.${wi}.${ri}.end`)
  }))
  for (const kind of ['amt', 'oft']) ((((d.sims || {}) as any)[kind] || []) as any[]).forEach((r: any, ri: number) => {
    if (!r || r.cx || r.info) return
    const someone = has(r.p) || has(r.w) || anyIn(r.pax) || anyIn(r.more)   // not the free-text `who` (R8)
    if (kind === 'amt' && !someone && (isBrief(r) || isDebrief(r))) return
    item(someone, r.str, r.end, `sr:${di}.${kind}.${ri}.str`, `sr:${di}.${kind}.${ri}.end`)
  })
  ;((d.ground || []) as any[]).forEach((g: any, ri: number) => {
    if (!g || g.cx || g.info || fromAllDayInput(g)) return
    item(has(g.who) || anyIn(g.more), g.str, g.end, `gr:${di}.${ri}.str`, `gr:${di}.${ri}.end`)
  })
  return out
}

/** the loaded week's day `di` */
export function timeGapsOf(di: number): TimeGaps { return dayTimeGaps(DAYS[+di], +di) }
