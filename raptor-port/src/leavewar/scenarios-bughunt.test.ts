// [S4-BUGHUNT] — the scenario hunt over section 3's untested ground (20 Sep 26).
// Plan: docs/superpowers/plans/2026-09-20-s4-bughunt-plan.md (Fable + Codex,
// merged). Rules of record: specs/2026-09-20-arch-stack-4-clash-check.md
// (B1–B9, H1–H6, owner answers A–D, and the owner's 20 Sep ruling on medical
// times recorded in this file's first describe).
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { setSession, setMe } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import {
  getState, initStore as lwInitStore, lwHistInit, rawState, setCell, setPeople, setRole, setViewer,
} from './state/store'
import { memoryBackend } from './state/storage'
import { runOilPass, wireLeaveWarSync } from './sync'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { balanceOf } from './engine'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const toast = HOOKS.toast
let said: string[] = []

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  setSession({ user: 'ad', role: 'admin' })
  raptorInitStore(); lwInitStore(memoryBackend()); setPeople(projectPeople()); wireLeaveWarSync()
  _resetTimeline(); lwHistInit(); installGlobalUndo()
  setRole('admin')
  said = []; HOOKS.toast = (m: any) => { said.push(String(m)) }
})
afterEach(() => { HOOKS.toast = toast; _resetTimeline(); setSession(null); setMe('bane'); setViewer(null) })

let n = 0
const file = (person: string, type: string, date: string, extra: Record<string, any> = {}) => {
  const row: any = { iid: `bh${++n}`, person, type, date, yr: 2026, allday: true, remarks: '', mod: '2026-02-01', ...extra }
  if (row.allday === false) delete row.allday
  const ok = writeInputs(() => { INPUTS.unshift(row) })
  return { ok, row }
}
/** a custom-time row: minutes from midnight, inclusive */
const timed = (s: number, e: number) => ({ allday: false, s, e })
const at = (h: number, m = 0) => h * 60 + m

const grid = (p: string, d: string) => getState().grid[p]?.[d]
const view = (p: string, d: string) => getState().views[p]?.[d]
const rowsOf = (p: string) => INPUTS.filter((r: any) => r.person === p)
  .map((r: any) => `${r.type} ${r.date}${r.endDate ? '–' + r.endDate : ''}${r.allday ? '' : ` ${r.half ?? ''}${r.s}-${r.e}`}`).sort()
const bal = (p: string, c: any) => balanceOf(getState().openings, getState().ledger, getState().wars as any, p, c)

/* ====================================================================== */
/*  A medical recorded with REAL TIMES (owner, 20 Sep 26)                  */
/* ====================================================================== */
/* The owner's answer on H3 (overruled) says leave vs leave AND leave vs
   medical overlap is judged on REAL TIMES; H2 governs only the STEP SIZE of a
   cut once they do overlap, and the war's own bookkeeping (what the box
   shows, what manning removes, what the medical total counts) still runs in
   halves by the six-hour rule. Confirmed by the owner on 20 Sep 26 when this
   hunt put the two readings to him:
     "Allow both — judge on real times."
   So a medical's real window decides every CLASH and every REPLACEMENT; its
   half window decides every FIGURE and every DISPLAY. */
describe('a medical recorded with real times', () => {
  it('leave beside it at times that do not overlap is allowed, either order', () => {
    // medical first, then the leave half an hour after it ends
    expect(file('ammo', 'ATT C', 'Feb 09', timed(at(8), at(10))).ok).toBe(true)
    expect(file('ammo', 'LL', 'Feb 09', timed(at(10, 30), at(11, 30))).ok).toBe(true)
    expect(said.join(' ')).not.toMatch(/can't go over a medical/)
    expect(rowsOf('ammo')).toEqual(['ATT C Feb 09 480-600', 'LL Feb 09 630-690'])

    // and the other way round: the medical must NOT cut a leave it misses
    expect(file('dj', 'LL', 'Feb 09', timed(at(10, 30), at(11, 30))).ok).toBe(true)
    const before = bal('dj', 'lve')
    expect(file('dj', 'ATT C', 'Feb 09', timed(at(8), at(10))).ok).toBe(true)
    expect(said.join(' ')).not.toMatch(/is cut for the ATT C/)
    expect(rowsOf('dj')).toEqual(['ATT C Feb 09 480-600', 'LL Feb 09 630-690'])
    expect(bal('dj', 'lve')).toBe(before)
  })

  it('both records show on the day, and the morning is charged once', () => {
    file('ammo', 'ATT C', 'Feb 09', timed(at(8), at(10)))
    file('ammo', 'LL', 'Feb 09', timed(at(10, 30), at(11, 30)))
    const v = view('ammo', '2026-02-09')!
    expect(v.all).toHaveLength(2)
    expect(v.amber).toBe(false)
    expect(v.mark).toBe('+1')
    // the ladder puts leave above sick, and both are mornings
    expect(v.code).toBe('*LL')
    // one half, charged once (owner answer D)
    expect(v.charges.map(c => c.amount)).toEqual([0.5])
  })

  it('still reads as a HALF for the box, for manning and for the medical total', () => {
    // H2's six-hour rule is untouched: a two-hour ATT C is half a day's absence
    file('dj', 'ATT C', 'Feb 09', timed(at(8), at(10)))
    const v = view('dj', '2026-02-09')!
    expect(v.code).toBe('*ATTC')
    expect(v.away).toBe(0.5)
  })

  it('leave that REALLY overlaps it is still refused, and is still cut in half-day steps', () => {
    // genuinely overlapping: 09:00–11:00 runs into the medical's 08:00–10:00
    file('ammo', 'ATT C', 'Feb 10', timed(at(8), at(10)))
    expect(file('ammo', 'LL', 'Feb 10', timed(at(9), at(11))).ok).toBe(false)
    expect(said.join(' ')).toMatch(/leave can't go over a medical/)

    // and filed the other way round the leave is cut, in HALVES (H2)
    file('dj', 'LL', 'Feb 11')                                   // all day
    expect(file('dj', 'ATT C', 'Feb 11', timed(at(8), at(10))).ok).toBe(true)
    expect(said.join(' ')).toMatch(/is cut for the ATT C/)
    // the morning goes, the afternoon stays — never a 08:00–10:00 hole
    expect(rowsOf('dj')).toEqual(['ATT C Feb 11 480-600', 'LL Feb 11 pm721-1439'])
  })

  it('a medical straddling noon takes the whole leave day, but still counts as a half', () => {
    /* 09:00–14:00 is five hours, so the six-hour rule DRAWS it as a morning —
       that is what the box shows and what manning removes. But its real hours
       run into the afternoon, so as far as LEAVE is concerned it covers both
       halves and the whole day's leave goes. Cutting by the drawn half instead
       left an afternoon leave standing that the invariant then refused: the
       door would have cut a leave into a piece it would not accept. */
    file('casper', 'LL', 'Feb 12')
    expect(file('casper', 'ATT C', 'Feb 12', timed(at(9), at(14))).ok).toBe(true)
    expect(rowsOf('casper')).toEqual(['ATT C Feb 12 540-840'])
    const v = view('casper', '2026-02-12')!
    expect(v.code).toBe('*ATTC')                                // drawn as a morning (H2)
    expect(v.away).toBe(0.5)                                    // and costs a half of manning
  })

  it('an undecided bid is replaced only where the medical really overlaps it', () => {
    // an afternoon bid, and a medical that really ends at 10:00 — the bid stands
    setCell('ammo', '2026-02-16', 'LL*')
    expect(rawState().wars[0]!.recs['ammo']?.['2026-02-16']?.some(r => r.kind === 'request')).toBe(true)
    file('ammo', 'ATT C', 'Feb 16', timed(at(8), at(10)))
    const still = rawState().wars[0]!.recs['ammo']?.['2026-02-16'] ?? []
    expect(still.filter(r => r.kind === 'request')).toHaveLength(1)
    expect(still.filter(r => r.kind === 'notice')).toHaveLength(0)

    // a MORNING bid on the same day would be replaced
    setCell('dj', '2026-02-17', '*LL')
    file('dj', 'ATT C', 'Feb 17', timed(at(8), at(10)))
    const gone = rawState().wars[0]!.recs['dj']?.['2026-02-17'] ?? []
    expect(gone.filter(r => r.kind === 'request')).toHaveLength(0)
    expect(gone.filter(r => r.kind === 'notice')).toHaveLength(1)
  })

  it('the refusal names the medical\'s real hours, not the whole half', () => {
    file('bruise', 'ATT C', 'Feb 18', timed(at(8), at(10)))
    file('bruise', 'LL', 'Feb 18', timed(at(9), at(11)))
    // "00:00–12:00" would be a lie about a two-hour appointment
    expect(said.join(' ')).not.toMatch(/00:00–12:00/)
  })
})

/* ====================================================================== */
/*  OIL — a credit must never outlive the hours that earned it (B4)        */
/* ====================================================================== */
/* B4: "refuse only when the work overlaps the absence's time; otherwise the
   credit is stored beside it. Overlap → no credit". The forward pass refuses
   to PLACE a clashing credit and writes nothing; the reverse pass then skips
   the address, because the address is still wanted. Between them, a credit
   already sitting there — earned under evidence that has since changed — has
   nothing to remove it, and goes on claiming hours the person did not work. */
describe('an OIL credit whose hours have changed', () => {
  const SAT = '2026-07-18'                           // the seed Saturday
  const credit = (p: string) => (rawState().wars.find(w => SAT >= w.period.start && SAT <= w.period.end)
    ?.recs[p]?.[SAT] ?? []).find((r: any) => r.kind === 'credit') as any

  /** a duty the person answered "yes, credit it" on the Saturday */
  const duty = (person: string, s: number, e: number) => {
    const row: any = {
      iid: `oil${++n}`, person, type: 'Duty', date: 'Jul 18', yr: 2026,
      allday: false, s, e, remarks: '', mod: '2026-07-01', oil: { [SAT]: 0.5 },
    }
    writeInputs(() => { INPUTS.unshift(row) })
    return row
  }

  it('is not left standing with the hours it used to have', () => {
    // an afternoon leave, and a morning duty that misses it — the credit lands
    file('dj', 'LL', 'Jul 18', { allday: false, half: 'pm', s: 721, e: 1439 })
    const row = duty('dj', at(8), at(12))
    runOilPass()
    expect(credit('dj')?.spans).toEqual([[at(8), at(12)]])

    // the duty is re-timed into the afternoon, where the leave is. B4 says the
    // work now overlaps the absence, so there must be NO credit — and above all
    // not one still claiming a morning nobody worked.
    writeInputs(() => { row.s = at(13); row.e = at(17) })
    runOilPass()
    expect(credit('dj')?.spans).not.toEqual([[at(8), at(12)]])
    expect(credit('dj')).toBeUndefined()
  })

  it('cannot be reached by filing leave over the hours instead — the door refuses that (B4)', () => {
    // the other way a credit and a leave could come to share hours: file the
    // leave second. The inputs door refuses it outright (§26.3), so the pair
    // never arises that way, and the clash above is the only route to it.
    const row = duty('casper', at(8), at(12))
    runOilPass()
    expect(credit('casper')).toBeDefined()
    expect(row.oil[SAT]).toBe(0.5)

    expect(file('casper', 'LL', 'Jul 18', { allday: false, half: 'am', s: 0, e: 720 }).ok).toBe(false)
    expect(said.join(' ')).toMatch(/recorded as working/)
    expect(credit('casper')).toBeDefined()
  })

  it("an admin's own hand-typed credit is never removed by the pass", () => {
    // design §18 OA3-003 — only an admin takes a manual credit away. Nothing
    // published earns this one, so the reverse pass sees it unwanted; it must
    // still survive, because the reverse pass only ever clears `auto`.
    setCell('bruise', SAT, 'FO')
    expect(credit('bruise')?.oil).toBe('manual')
    runOilPass()
    expect(credit('bruise')?.oil).toBe('manual')
  })
})
