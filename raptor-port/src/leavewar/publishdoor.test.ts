// THE PUBLISH DOOR ([ARCH-STACK] step 4).
//
// REWRITTEN 20 Sep 26 to the owner's answer on the last of the three open
// questions: publishing a weekend / PH day no longer THROWS AWAY an undecided
// leave bid it overlaps — it flags the day and says so. It used to remove the
// clashing part and leave a "the schedule took your bid" notice, while a bid
// placed AFTER the publish was kept and flagged: the same two facts, opposite
// outcomes decided only by which came first. Owner: "keep the bid and flag the
// day, both ways."
//
// So this file now pins the OPPOSITE of what it pinned this morning, and that
// is the point — the old expectations WERE the rule, and they move with it.
// Sets aside the second half of clash check B5 ("publishing is the door that
// replaces an undecided bid, so undo of the publish brings the bid back");
// with nothing removed there is nothing to bring back.
//
// The amber is not built here: the OIL credit lands on the day regardless, and
// a credit overlapping an undecided bid is already a forbidden pair. Weekday
// work still never reaches the war.
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { HOOKS } from '../engine/hooks'
import { PEOPLE } from '../engine/people'
import { toast as uiToast, toastBatch, clearToast } from '../ui/toast'
import { SCHED, signOf } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { commitSetDayApproved, commitPublishALDay } from '../state/sched-commit'
import { setSession } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, lwHistInit, rawState, setBidState, setCell, setPeople, setRole } from './state/store'
import { memoryBackend } from './state/storage'
import { runOilPass, wireLeaveWarSync } from './sync'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const SAT = '2026-07-18'   // the seed Saturday: plasma stands SDO 0800–1800
const MON = '2026-07-13'
const toast = HOOKS.toast
let said: string[] = []

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0
  JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  said = []
  HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null) })

const publish = (di: number) => {
  const g = signOf(di)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  return commitSetDayApproved(di, true)
}
const recs = (p: string, d: string) => rawState().wars[0]!.recs[p]?.[d] ?? []

describe('publishing weekend work FLAGS a clashing leave bid (owner, 20 Sep 26)', () => {
  it('the bid stays live, no notice is left, the OIL credit lands, and the day flags (AM48c)', () => {
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    publish(5)
    runOilPass()
    const list = recs('plasma', SAT)
    // The bid is untouched — that is the whole ruling.
    expect(list.filter(r => r.kind === 'request')).toHaveLength(1)
    // Nothing was taken, so there is nothing to tell the person they lost.
    expect(list.some(r => r.kind === 'notice')).toBe(false)
    expect(list.some(r => r.kind === 'credit')).toBe(true)
    // …and the day carries the amber, which is what an admin acts on.
    const v = getState().views['plasma']?.[SAT]
    expect(v?.amber).toBe(true)
    expect(v?.conflicts.length).toBeGreaterThan(0)
  })

  it('the admin is told at the moment of publishing, in words that say the bid is still live (AM48c)', () => {
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    publish(5)
    const msg = said.find(m => m.includes('bid on 18 Jul'))
    expect(msg).toBeDefined()
    expect(msg).toContain('still live')
    expect(msg).not.toMatch(/replac/i)
  })

  it('undo and redo of the publish leave the bid exactly where it was', () => {
    // B5's other half goes with the first: nothing is removed, so there is
    // nothing for an undo to bring back.
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    publish(5)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(globalUndo().ok).toBe(true)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(globalRedo().ok).toBe(true)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
  })

  it('an acknowledged bid is kept too; a refused one is neither touched nor mentioned', () => {
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    expect(setCell('rocky', SAT, 'OL')).toBe(true)
    // the admin decides at any time — no stage to close first (D1177; D418 narrowed)
    setBidState('plasma', SAT, 'acknowledged')
    setBidState('rocky', SAT, 'refused')
    said = []
    publish(5)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(recs('rocky', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    // A refused bid blocks nothing and is nobody's decision to make again.
    expect(said.join(' ')).not.toContain('rocky')
  })

  it('a bid placed AFTER the publish lands the same way — that symmetry is the point', () => {
    setRole('admin')
    publish(5)
    runOilPass()
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    expect(recs('plasma', SAT).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(getState().views['plasma']?.[SAT]?.amber).toBe(true)
  })

  it('weekday work still never reaches the war', () => {
    setRole('admin')
    // whoever stands Monday's desk: bid them LL that day
    const sdo = String(DAYS[0].dutywaves[0].rows[0].id ?? '')
    expect(sdo).not.toBe('')
    expect(setCell(sdo, MON, 'LL')).toBe(true)
    said = []
    publish(0)
    expect(recs(sdo, MON).filter(r => r.kind === 'request')).toHaveLength(1)
    expect(said.join(' ')).not.toContain('bid on')
  })
})

/* ====================================================================== */
/*  A PUBLISHED DAY THAT EARNS NOBODY ANYTHING SAYS SO (owner, 20 Sep 26) */
/* ====================================================================== */
/* His own case, in the app: a man on the SDO desk for a Sunday, the day
   published, and no OIL. The desk had no start and no end, so it measured
   nothing and minted nothing — correct, and completely silent. A man's leave
   balance short with no screen admitting it. */
describe('publishing a weekend nobody earns OIL for', () => {
  const blankTheSaturdayDesks = () => {
    for (const dw of (DAYS[5] as any).dutywaves ?? []) for (const r of dw.rows ?? []) { r.str = ''; r.end = '' }
  }

  it('says the day earned nobody anything, and names the desk (AM48d)', () => {
    setRole('admin')
    blankTheSaturdayDesks()
    publish(5)
    const spoke = said.find(m => m.includes('earned nobody any OIL'))
    expect(spoke).toBeTruthy()
    expect(spoke).toContain('Saturday 18 Jul')
    expect(spoke).toContain('SDO')
    expect(spoke).toContain('no usable times')
  })

  it('says NOTHING when the desks are properly timed — the seed Saturday earns', () => {
    setRole('admin')
    publish(5)
    expect(said.some(m => m.includes('OIL'))).toBe(false)
  })

  it('says nothing on a WEEKDAY: a blank desk on a Monday is ordinary', () => {
    setRole('admin')
    for (const dw of (DAYS[0] as any).dutywaves ?? []) for (const r of dw.rows ?? []) { r.str = ''; r.end = '' }
    publish(0)
    expect(said.some(m => m.includes('earns OIL') || m.includes('earned nobody'))).toBe(false)
  })

  it('does not LOSE the warning behind the bid-clash message', () => {
    /* Astra, 21 Sep 26. The strip at the foot of the screen is one element
       whose text is REPLACED, so publishing a day that had BOTH a blank desk
       and a bid sitting on published work said the second thing only — and the
       one swallowed was the silent-OIL warning, the whole point of the ruling.
       Both facts now arrive in one message. */
    setRole('admin')
    const wave = ((DAYS[5] as any).dutywaves ?? [])[0]
    wave.rows.push({ role: 'SXO', id: 'plasma', str: '0800', end: '1800' })   // someone still earns
    wave.rows[0].str = ''; wave.rows[0].end = ''                              // and a desk is blank
    expect(setCell('plasma', SAT, 'LL')).toBe(true)                           // …on a live bid
    publish(5)
    const spoke = said.find(m => m.includes('no usable times'))
    expect(spoke).toBeTruthy()
    expect(spoke).toContain('still live')
  })

  it('still speaks when SOMEBODY earns but a desk is blank — the man on it gets nothing', () => {
    setRole('admin')
    // The seed Saturday carries ONE desk, so the mixed case has to be built:
    // a second desk properly timed beside the blank one.
    const wave = ((DAYS[5] as any).dutywaves ?? [])[0]
    wave.rows.push({ role: 'SXO', id: 'dj', str: '0800', end: '1800' })
    wave.rows[0].str = ''; wave.rows[0].end = ''
    publish(5)
    const spoke = said.find(m => m.includes('earns OIL'))
    expect(spoke).toBeTruthy()
    expect(spoke).toContain('SDO')
    expect(spoke).not.toContain('SXO')
    expect(spoke).toContain('no usable times')
  })
})

/* ====================================================================== */
/*  THE PUBLISH NOTE AND THE DAY'S OIL LINE NAME THE DAY ONCE (D837, N1)  */
/* ====================================================================== */
/* Owner, 14 Oct 26 (D837 — the passing note N1; the words of record:
   docs/superpowers/briefs/2026-10-13-wording-recheck.md, List 1 and "For the builder"). Publishing a day says "Monday
   published and approved" — no dash, no capitals, and no full stop while it stands alone. Where the same day's OIL line
   follows it, the app says the two as one: the day once, at the head, with its date, and each a sentence.

   THE REAL NOTE, THROUGH THE REAL PUBLISH: the app's own toast and its own join are wired here as main.tsx wires them,
   and what is read is the note on the screen — every test above listens to the pieces, which is not what a scheduler
   sees.

   AND WHAT MUST NOT MOVE. The OIL line's other form ("… earned nobody any OIL — …"), the bid line and the "no leave war
   period" line are not on his list of 13 Oct 26: their words and their dot are pinned here as they were. After an
   amendment's receipt the OIL line keeps its own day, joined by the dot, as before. */
describe('the note on the screen after a publish (N1)', () => {
  const text = () => (document.getElementById('toastEl') as HTMLElement | null)?.textContent || ''
  const keepBatch = HOOKS.toastBatch
  beforeEach(() => { HOOKS.toast = uiToast; HOOKS.toastBatch = toastBatch })
  afterEach(() => { HOOKS.toastBatch = keepBatch; clearToast(); document.getElementById('toastEl')?.remove() })
  const satDesks = () => ((DAYS[5] as any).dutywaves ?? [])[0]
  const BID = `${String((PEOPLE as any).plasma.cs)}'s LL bid on 18 Jul now sits on published work — the day is flagged, the bid is still live`

  it('shown alone: "Monday published and approved" — no full stop', () => {
    setRole('admin')
    publish(0)
    expect(text()).toBe('Monday published and approved')
  })

  it('with the same day\'s OIL line: the day once, with its date, and two sentences', () => {
    setRole('admin')
    satDesks().rows.push({ role: 'SXO', id: 'dj', str: '0800', end: '1800' })   // someone still earns
    satDesks().rows[0].str = ''; satDesks().rows[0].end = ''                    // and the SDO desk is blank
    publish(5)
    expect(text()).toBe('Saturday 18 Jul published and approved. The SDO desk has no usable times, so nobody on it earns OIL.')
  })

  it('the Common Programme wears its heading\'s capitals in that sentence, as his wording has it', () => {
    setRole('admin')
    ;(DAYS[5] as any).allhands = [{ prog: 'OPS BRIEF', str: '', end: '', who: ['bane'] }]   // named, no times; the SDO desk earns
    publish(5)
    expect(text()).toBe('Saturday 18 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL.')
  })

  it('the bid line rides behind the pair, its own words and its dot unchanged', () => {
    setRole('admin')
    satDesks().rows.push({ role: 'SXO', id: 'plasma', str: '0800', end: '1800' })
    satDesks().rows[0].str = ''; satDesks().rows[0].end = ''
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    publish(5)
    expect(text()).toBe(`Saturday 18 Jul published and approved. The SDO desk has no usable times, so nobody on it earns OIL. · ${BID}`)
  })

  it('NOT CHANGED — the bid line alone behind the publish note: the dot, and its words as they were', () => {
    setRole('admin')
    expect(setCell('plasma', SAT, 'LL')).toBe(true)
    publish(5)
    expect(text()).toBe(`Saturday published and approved · ${BID}`)
  })

  it('NOT CHANGED — the OIL line\'s other form: its own day, its dash and the dot, word for word', () => {
    setRole('admin')
    for (const dw of (DAYS[5] as any).dutywaves ?? []) for (const r of dw.rows ?? []) { r.str = ''; r.end = '' }
    publish(5)
    expect(text()).toBe('Saturday published and approved · Saturday 18 Jul earned nobody any OIL — the SDO desk has no usable times')
  })

  it('after an amendment\'s receipt the OIL line keeps its own day, joined by the dot as before', () => {
    setRole('admin')
    publish(5)
    expect(text(), 'the seed Saturday earns: the publish note alone').toBe('Saturday published and approved')
    satDesks().rows.push({ role: 'SXO', id: 'dj', str: '0800', end: '1800' })
    satDesks().rows[0].str = ''; satDesks().rows[0].end = ''
    const g = signOf(5); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    commitPublishALDay(5)
    expect(text()).toMatch(/^Published AL1 · .+ · Saturday 18 Jul: the SDO desk has no usable times, so nobody on it earns OIL$/)
    expect(text()).not.toContain('published and approved')
  })
})
