// @vitest-environment jsdom
/* [WARN-HIDE-KEPT] (owner D469 / D472, 1 Oct 26) — THE READERS THAT DO NOT GO THROUGH THE PUCK MAPS. The plan's roll-call
   (docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md §5) marks seven readers "S" or "C": each works a flag, a
   count or a list out FROM THE WARNING LIST ITSELF, so the engine's filtered maps do not reach it and it has to skip a
   hidden warning on its own. One case per reader — a test of a mark walks every KIND of place, by name (bug-check order
   §8.1): a reader missing here is a puck that keeps its flag, or a count that keeps its number, after the hide.
   - row 4: the ALL AVAIL window's reason under a man's puck (`personWarnMsgs`)                       — WH3
   - row 5: an exempt duty desk's own ring (`exemptDeskOwn`)                                          — WH3
   - row 6: an exempt flying line's own ring (the AVALON seat's `own`)                                — WH3
   - row 9: the days a tap on a man's puck opens (`selectPerson`), and the list narrowed to him       — WH3, WH4
   - row 14: Insights' week total, "by type" and "by day"                                             — WH5
   - row 16: the names lit while a day's box is open; a TAPPED hidden line still lights its crew      — WH3
   - row 17: the message after a drop (`dropflag.warnDelta`)                                          — WH3 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { validate, workingWarn, rawWarn, sevOf } from '../engine/validate'
import { computeInsights } from '../engine/insights'
import { personWarns } from '../engine/avail'
import { makeStandalone } from '../engine/waves'
import { blockFromTpl, dutyTplReset } from '../engine/dutytpl'
import { ensureRowIds } from '../engine/rowids'
import { HOOKS } from '../engine/hooks'
import { dayHTML, dayWarnHTML, exemptDeskOwn, personWarnMsgs } from './html'
import { sbSlot } from './board-html'
import { warnDelta } from '../state/dropflag'
import * as view from '../state/view'
import { setSession } from '../state/auth'
// Isolate the existing warning-hide readers from the new reporting-order checks.

const DSNAP = JSON.stringify(DAYS)
const MON = 0, TUE = 1
const el = (h: string) => { const d = document.createElement('div'); d.innerHTML = h; return d }
const warns = (di: number) => (workingWarn().byDay[di] || {}).warns || []
const hide = (w: any) => { view.WARNOFF.add(view.warnMuteKey(w)); validate() }
const flagAgain = (w: any) => { view.WARNOFF.delete(view.warnMuteKey(w)); validate() }
let realEdit: any

beforeEach(() => {
  realEdit = HOOKS.editMode
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  setSession({ user: 'a', role: 'admin' } as any)
  view.selDrop(); view.WARNOFF.clear(); dutyTplReset(); validate()
})
afterEach(() => { HOOKS.editMode = realEdit; view.selDrop(); view.WARNOFF.clear(); dutyTplReset(); DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d)); validate() })

describe('roll-call rows 4, 9, 14, 16, 17 — the list-readers skip a hidden warning (WH3, WH5)', () => {
  const longDay = () => warns(TUE).find((w: any) => w.code === 'LONGDAY')

  it("row 4 — the ALL AVAIL window's reason for a man: none while his warning is hidden", () => {
    expect(personWarnMsgs(TUE, 'wolf').length, 'his long day is his reason').toBe(1)
    hide(longDay())
    expect(personWarnMsgs(TUE, 'wolf'), 'no reason, no flag').toEqual([])
    flagAgain(longDay())
    expect(personWarnMsgs(TUE, 'wolf').length).toBe(1)
  })

  it('row 9 — a tap on his puck no longer opens that day as flagged; the list narrowed to him still shows the line, struck', () => {
    view.selectPerson('wolf', true)
    expect(view.PFOCUS && view.PFOCUS.days, 'before: Tuesday is one of his flagged days').toContain(TUE)
    view.selDrop()
    hide(longDay())
    view.selectPerson('wolf', true)
    expect(!!(view.PFOCUS && view.PFOCUS.days.includes(TUE)), 'hidden: his clean puck does not open Tuesday').toBe(false)
    view.selDrop()
    /* the narrowed list (another man focused it, or the box was open) keeps the line, struck — never drops it */
    expect(personWarns(TUE, 'wolf').map((x: any) => !!x.w.off)).toEqual([true])
  })

  it('row 14 — Insights: the day and the week count what is shown', () => {
    const tueBefore = computeInsights().dayStats[TUE].warns, typeBefore = computeInsights().byType.LONGDAY
    hide(longDay())
    const I = computeInsights()
    expect(I.dayStats[TUE].warns, 'Tuesday reads one fewer').toBe(tueBefore - 1)
    expect(I.byType.LONGDAY || 0, 'and so does its rule').toBe(typeBefore - 1)
  })

  it('row 16 — an open day box lights the men its SHOWN warnings name; a tapped hidden line still lights its crew', () => {
    view.DWOPEN.add(TUE)
    expect(view.warnFocusMap()!.map.get(TUE).ids.has('wolf')).toBe(true)
    hide(longDay())
    view.DWOPEN.add(TUE)
    expect(view.warnFocusMap()!.map.get(TUE).ids.has('wolf'), 'hidden: he is not lit').toBe(false)
    expect(view.warnFocusMap()!.map.get(TUE).ids.has('salsa'), 'Saint still is').toBe(true)
    /* the tap on the struck line */
    const ix = warns(TUE).findIndex((w: any) => w.code === 'LONGDAY')
    view.focusWarn(TUE, ix)
    const m = view.warnFocusMap()
    expect(m && m.map.get(TUE).ids.has('wolf'), 'a tapped hidden line lights its crew, so what was hidden can be found').toBe(true)
  })

  it('row 17 — a warning that arrives already hidden says nothing after a drop', () => {
    const before = { byDay: [{}], all: [] as any[] }
    const fresh = { code: 'DOUBLE_BOOK', di: 1, who: ['bane'], msg: 'A & B clash', sev: 'hard' }
    expect(warnDelta(before, { all: [fresh] }).length, 'a new warning speaks').toBe(1)
    expect(warnDelta(before, { all: [{ ...fresh, off: true }] }), 'a hidden one does not').toEqual([])
  })
})

/* Astra's scenario design, its "missing call site" 2 (1 Oct 26): the days a focused man is flagged on were worked out
   when his puck was tapped and never again — so with his box still narrowed, hiding his only warning on a day left
   "also flagged on Thu" standing, and ↺ did not bring it back. The ✕ / ↺ now re-reads them. */
describe('row 9, live — "also flagged on" follows the ✕ and the ↺ while a man is focused (WH3)', () => {
  const THU = 3, WHO = 'bane'   // Ranger: flagged on the demo Monday and Thursday
  const his = (di: number) => warns(di).filter((w: any) => (w.who || []).includes(WHO))
  it('hiding every warning that names him on Thursday takes Thursday out of the echo at once; ↺ puts it back', () => {
    HOOKS.editMode = () => true
    view.selectPerson(WHO, true)
    expect(view.PFOCUS!.days, 'tapped: Monday and Thursday open as his flagged days').toEqual(expect.arrayContaining([MON, THU]))
    expect(dayWarnHTML(MON), 'Monday\'s box says so').toMatch(/is also flagged on [^<]*Thu/)
    his(THU).forEach((w: any) => view.toggleWarnOff(view.warnMuteKey(w)))     // the ✕'s own write, on each of his Thursday lines
    expect(view.PFOCUS!.days.includes(THU), 'Thursday is no longer one of his flagged days').toBe(false)
    expect(dayWarnHTML(MON)).not.toMatch(/is also flagged on [^<]*Thu/)
    view.toggleWarnOff(view.warnMuteKey(his(THU)[0]))                         // ↺ on one of them
    expect(view.PFOCUS!.days.includes(THU), 'flagged again: Thursday is back').toBe(true)
    expect(dayWarnHTML(MON)).toMatch(/is also flagged on [^<]*Thu/)
  })
})

describe('roll-call rows 5, 6 — the exempt rows that ring by their OWN rule (WH3)', () => {
  /* Vector is medically down on the demo Monday */
  const DOWN = 'divot'

  it('row 5 — an AVALON duty desk holding a man who is medically down rings red; hide THAT warning and it does not', () => {
    const d: any = DAYS[MON], desk: any = blockFromTpl('avalon')
    d.dutywaves = d.dutywaves || []; d.dutywaves.push(desk)
    desk.rows[0].id = DOWN
    ensureRowIds(DAYS); validate()
    const dwi = d.dutywaves.length - 1, key = `d:${MON}.${dwi}.0`
    const w = (rawWarn().byDay[MON].warns as any[]).find(x => (x.who || []).includes(DOWN) && (x.key === key || x.also === key))
    expect(w, 'the desk raises its own warning for him').toBeTruthy()
    expect(exemptDeskOwn(MON, key, DOWN), 'and rings').toBe('C')
    hide(w)
    expect(exemptDeskOwn(MON, key, DOWN), 'hidden: the desk copy is clean').toBeNull()
    expect(sevOf(MON, DOWN), 'his OTHER warning (the flying line) still rings him elsewhere').toBe('hard')
  })

  it('row 6 — an AVALON flying seat holding him rings by its own rule; with every warning of THAT seat hidden it is plain', () => {
    const d: any = DAYS[MON], wv: any = makeStandalone('avalon')
    d.waves.push(wv)
    wv.formations[0].aircraft[0].p = DOWN
    ensureRowIds(DAYS); validate()
    const gi = d.waves.length - 1, fkey = `${MON}.${gi}.0`
    const mine = (x: any) => (x.who || []).includes(DOWN) && (String(x.key || '').indexOf(fkey) === 0 || String(x.also || '').indexOf(fkey) === 0)
    /* a WSO who is down, put in an AVALON front seat, raises three there: down, not current, the wrong seat */
    const own = () => (rawWarn().byDay[MON].warns as any[]).filter(mine)
    expect(own().length, 'the AVALON seat raises its own warnings for him').toBeGreaterThan(1)
    HOOKS.editMode = () => true
    const seat = (h: string) => [...el(h).querySelectorAll(`[data-slot^="${fkey}."] .puck[data-person="${DOWN}"], .puck[data-person="${DOWN}"]`)]
      .filter(p => { const s = p.closest('[data-slot]') as HTMLElement | null; return !!s && String(s.dataset.slot).indexOf(fkey + '.') === 0 })
    const before = seat(dayHTML(MON, true))
    expect(before.length, 'his puck sits on that line').toBe(1)
    expect(/\bwarn\b/.test(before[0]!.className), 'ringed').toBe(true)
    hide(own()[0])
    expect(/\bwarn\b/.test(seat(dayHTML(MON, true))[0]!.className), 'one hidden, the others of that seat still showing: still ringed').toBe(true)
    own().forEach(hide)
    const after = seat(dayHTML(MON, true))
    expect(/\bwarn\b/.test(after[0]!.className), 'all of that seat\'s hidden: plain — ' + after[0]!.className).toBe(false)
    expect(after[0]!.querySelector('.lchip'), 'no chip').toBeNull()
    expect(sevOf(MON, DOWN), 'his warning on the other flying line still rings him there').toBe('hard')
  })

  /* THE WALK'S FINDING 1 (walker A, scenario 8, 1 Oct 26): the BOARD drew an exempt flying seat with the man's whole-day
     flag — the week's "its own rules and nothing else" (owner, 11 Aug 26; D94: "exempt-seat pucks keep their own rules")
     was never wired into the board's cockpit seat. So with every warning of the AVALON seat hidden the week went plain
     and the board stayed ringed red C, off his clash elsewhere; and a man flagged elsewhere, on an AVALON seat that
     raises nothing for him, was red on the board and plain on the week. One body now — html.ts exemptLineOwn. */
  it('row 6, the BOARD — the same seat on the scheduler board follows the same rule: its own warnings, and nothing from elsewhere', () => {
    const d: any = DAYS[MON], wv: any = makeStandalone('avalon')
    d.waves.push(wv)
    wv.formations[0].aircraft[0].p = DOWN
    ensureRowIds(DAYS); validate()
    const gi = d.waves.length - 1, fkey = `${MON}.${gi}.0`, key = `${fkey}.0.p`
    const mine = (x: any) => (x.who || []).includes(DOWN) && (String(x.key || '').indexOf(fkey) === 0 || String(x.also || '').indexOf(fkey) === 0)
    const own = () => (rawWarn().byDay[MON].warns as any[]).filter(mine)
    const pk = () => el(sbSlot(MON, key, 'p', DOWN)).querySelector(`.puck[data-person="${DOWN}"]`) as HTMLElement
    expect(/\bwarn\b/.test(pk().className), 'ringed while the seat\'s own warnings show').toBe(true)
    own().forEach(hide)
    expect(sevOf(MON, DOWN), 'he is still flagged elsewhere that day').toBe('hard')
    expect(/\bwarn\b/.test(pk().className), 'all of that seat\'s hidden: plain on the board too — ' + pk().className).toBe(false)
    expect(pk().querySelector('.lchip'), 'no chip').toBeNull()
    own().forEach(flagAgain)
    expect(/\bwarn\b/.test(pk().className), 'flagged again: ringed again').toBe(true)
  })

  it('row 6, the BOARD, nothing hidden — a man flagged elsewhere sits plain on an AVALON seat that raises nothing for him', () => {
    /* Saint clashes on the demo Tuesday (a hard warning of his own, elsewhere) */
    const d: any = DAYS[TUE], wv: any = makeStandalone('avalon')
    d.waves.push(wv)
    wv.formations[0].aircraft[0].p = 'salsa'
    ensureRowIds(DAYS); validate()
    const gi = d.waves.length - 1, fkey = `${TUE}.${gi}.0`, key = `${fkey}.0.p`
    const here = (rawWarn().byDay[TUE].warns as any[]).filter((x: any) => (x.who || []).includes('salsa')
      && (String(x.key || '').indexOf(fkey) === 0 || String(x.also || '').indexOf(fkey) === 0))
    expect(here, 'the AVALON seat raises nothing of its own for him').toEqual([])
    expect(sevOf(TUE, 'salsa'), 'he is flagged elsewhere').toBe('hard')
    HOOKS.editMode = () => true
    const wk = [...el(dayHTML(TUE, true)).querySelectorAll(`.puck[data-person="salsa"]`)]
      .filter(p => { const sl = p.closest('[data-slot]') as HTMLElement | null; return !!sl && String(sl.dataset.slot).indexOf(fkey + '.') === 0 })
    expect(wk.length).toBe(1)
    expect(/\bwarn\b/.test(wk[0]!.className), 'plain on the week').toBe(false)
    const bd = el(sbSlot(TUE, key, 'p', 'salsa')).querySelector('.puck[data-person="salsa"]') as HTMLElement
    expect(/\bwarn\b/.test(bd.className), 'and plain on the board — ' + bd.className).toBe(false)
  })
})

describe('the two lists agree with the readers above', () => {
  it('with his warning hidden the day list counts one fewer and names no "hidden" in its bar', () => {
    HOOKS.editMode = () => true
    view.DWOPEN.add(TUE)
    hide(warns(TUE).find((w: any) => w.code === 'LONGDAY'))
    view.DWOPEN.add(TUE)
    const h = dayWarnHTML(TUE)
    expect(h).toContain('⚠ 3 issues')
    expect(h).toContain(PEOPLE.wolf.cs)
  })
})
