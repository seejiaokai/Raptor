// [S4-BUGHUNT] — the scenario hunt over section 3's untested ground (20 Sep 26).
// Plan: docs/superpowers/plans/2026-09-20-s4-bughunt-plan.md (Fable + Codex,
// merged). Rules of record: specs/2026-09-20-arch-stack-4-clash-check.md
// (B1–B9, H1–H6, owner answers A–D, and the owner's 20 Sep ruling on medical
// times recorded in this file's first describe).
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { DAYS } from '../engine/data'
import { SCHED, setDayApproved, signOf } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore, writeInputs } from '../state/store'
import { setSession, setMe } from '../state/auth'
import { projectPeople } from './state/raptorRoster'
import {
  cellProblem, clearRaptorCell, getState, ingestDutyCredit, lwEditLists, initStore as lwInitStore, lwHistInit, rawState, setCell, setCellNote, setPeople, setRole, setViewer,
} from './state/store'
import { memoryBackend } from './state/storage'
import { runOilPass, wireLeaveWarSync } from './sync'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { balanceOf, countsFor } from './engine'

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

/* RECORDED WORK, the only kind that still flags a day off (owner, 20 Sep 26).
   A hand-typed credit is an AWARD now and contradicts nothing, so a test whose
   subject is a man who ACTUALLY WORKED has to make the work real: publish the
   seed Saturday and let the OIL pass mint the credit off it, the same way the
   running app does. Day 5 is that Saturday; PLASMA stands its SDO desk
   08:00–18:00, so he is the man the published day credits. An `auto` credit
   the schedule does NOT back is swept by the same pass moments later, which is
   why it cannot simply be written by hand here. */
const WORKED_SAT = '2026-07-18'
const WORKED_MAN = 'plasma'
const publishTheSaturday = () => {
  const g = signOf(5)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  setDayApproved(5, true)
  runOilPass()
}

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

  it('straddling noon: the leave keeps the hours the medical does not cover', () => {
    /* Owner, 20 Sep 26: "keep leave from 2pm". A 09:00-14:00 medical is five
       hours, so the six-hour rule DRAWS it as a morning and the medical takes
       the morning. Its real hours run to 14:00, so the afternoon the leave
       keeps starts at 14:00, not at 12:01 -- otherwise the door would hand
       back a piece its own clash rule refuses. */
    file('casper', 'LL', 'Feb 12')
    expect(file('casper', 'ATT C', 'Feb 12', timed(at(9), at(14))).ok).toBe(true)
    expect(rowsOf('casper')).toEqual(['ATT C Feb 12 540-840', 'LL Feb 12 840-1439'])
    const v = view('casper', '2026-02-12')!
    expect(v.amber).toBe(false)                                 // the two no longer meet
    expect(v.all).toHaveLength(2)
    // the medical is drawn as a morning; the leave pays its own afternoon
    expect(v.charges).toEqual([expect.objectContaining({ amount: 0.5, half: 'pm' })])
    expect(v.away).toBe(1)                                      // morning medical + afternoon leave
  })

  it('a medical that really covers both halves still takes the whole leave day', () => {
    file('bruise', 'LL', 'Feb 13')
    expect(file('bruise', 'ATT C', 'Feb 13').ok).toBe(true)     // all day
    // (this person carries seed leave on other dates, so read only this one)
    expect(rowsOf('bruise').filter(r => r.includes('Feb 13'))).toEqual(['ATT C Feb 13'])
  })

  it('a medical filling the half it takes leaves the clean half preset', () => {
    // 08:00-10:00 is a morning and ends well before noon, so the afternoon
    // the leave keeps is the ordinary PM half, not a trimmed window
    file('ammo', 'LL', 'Feb 14')
    expect(file('ammo', 'ATT C', 'Feb 14', timed(at(8), at(10))).ok).toBe(true)
    expect(rowsOf('ammo')).toEqual(['ATT C Feb 14 480-600', 'LL Feb 14 pm721-1439'])
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

  it('is re-written to the hours it now has, and the day is flagged', () => {
    // an afternoon leave, and a morning duty that misses it — the credit lands
    file('dj', 'LL', 'Jul 18', { allday: false, half: 'pm', s: 721, e: 1439 })
    const row = duty('dj', at(8), at(12))
    runOilPass()
    expect(credit('dj')?.spans).toEqual([[at(8), at(12)]])
    expect(view('dj', SAT)!.amber).toBe(false)                  // nothing meets

    /* The duty is re-timed into the afternoon, where the leave is. Owner,
       20 Sep 26: the credit is still banked, and the day is flagged until
       someone resolves it. What must NEVER survive is the OLD morning — the
       man did not work it. */
    writeInputs(() => { row.s = at(13); row.e = at(17) })
    runOilPass()
    expect(credit('dj')?.spans).toEqual([[at(13), at(17)]])
    expect(view('dj', SAT)!.amber).toBe(true)
  })

  it('filing the leave the other way round is flagged too, not refused (owner, 20 Sep 26)', () => {
    /* The owner reversed the old refusal on the app's own doctrine: the
       schedule allows planning through a clash and flags it, so leave does
       too. Both orders now give the same picture — credit banked, leave
       filed, day amber — which is the whole point of the ruling. */
    const row = duty('casper', at(8), at(12))
    runOilPass()
    expect(credit('casper')).toBeDefined()
    expect(row.oil[SAT]).toBe(0.5)

    expect(file('casper', 'LL', 'Jul 18', { allday: false, half: 'am', s: 0, e: 720 }).ok).toBe(true)
    expect(said.some(m => m.includes('recorded as working'))).toBe(true)
    expect(said.some(m => m.includes('flagged for someone to resolve'))).toBe(true)
    expect(credit('casper')).toBeDefined()
    expect(view('casper', SAT)!.amber).toBe(true)
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

/* ====================================================================== */
/*  H6 — an overnight MEDICAL counts on the second date too               */
/* ====================================================================== */
/* H6: "overnight records count on the second date for overlap". Leave,
   courses and overseas duty always did; the medical branch of the window
   reader returned no tail, so a medical running past midnight let the next
   morning's leave through as if nothing were there (rules-first red team,
   20 Sep 26). The tail only ever clashes — it is never shown and never
   charged on the second date. */
describe('a medical running past midnight (H6)', () => {
  it('blocks leave on the next morning that its hours really cover', () => {
    file('ammo', 'HL', 'Feb 09', timed(at(20), at(2)))          // 20:00 → 02:00
    expect(file('ammo', 'LL', 'Feb 10', { allday: false, half: 'am', s: 0, e: 720 }).ok).toBe(false)
    expect(said.join(' ')).toMatch(/leave can't go over a medical/)
  })

  it('cuts a next-morning leave that was already there', () => {
    file('dj', 'LL', 'Feb 10', { allday: false, half: 'am', s: 0, e: 720 })
    expect(file('dj', 'HL', 'Feb 09', timed(at(20), at(2))).ok).toBe(true)
    expect(rowsOf('dj')).toEqual(['HL Feb 09 1200-120'])
  })

  it('leaves the next AFTERNOON alone, and is neither shown nor charged there', () => {
    expect(file('casper', 'HL', 'Feb 09', timed(at(20), at(2))).ok).toBe(true)
    expect(file('casper', 'LL', 'Feb 10', { allday: false, half: 'pm', s: 721, e: 1439 }).ok).toBe(true)
    // the tail is spill-only: 10 Feb shows the leave alone, no medical, no mark
    const v = view('casper', '2026-02-10')!
    expect(v.all).toHaveLength(1)
    expect(v.code).toBe('LL*')
    expect(v.mark).toBe('')
  })
})

/* ====================================================================== */
/*  Noon belongs to the AFTERNOON (owner, 20 Sep 26)                      */
/* ====================================================================== */
/* "12:00 — afternoon, half a day." The minute 720 sat on the boundary and the
   app answered two ways about it: the clash test said a window starting there
   did not touch the morning, while the box, the charge and the manning count
   said it did. So an OL 12:00–14:00 read as a WHOLE day, cost a whole day of
   balance and removed a whole person from manning — while a morning bid was
   still allowed beside it. */
describe('leave starting at exactly 12:00', () => {
  it('is an afternoon, and costs half a day', () => {
    file('ammo', 'OL', 'Feb 09', timed(at(12), at(14)))
    const v = view('ammo', '2026-02-09')!
    expect(v.code).toBe('OL*')                                  // not a bare full-day OL
    expect(v.away).toBe(0.5)                                    // half a man, not a whole one
    expect(v.charges).toEqual([expect.objectContaining({ counter: 'annual', amount: 0.5, half: 'pm' })])
  })

  it('leaves the morning free for a separate leave, charged on its own', () => {
    file('dj', 'OL', 'Feb 09', timed(at(12), at(14)))
    expect(file('dj', 'LL', 'Feb 09', { allday: false, half: 'am', s: 0, e: 720 }).ok).toBe(true)
    const v = view('dj', '2026-02-09')!
    expect(v.all).toHaveLength(2)
    expect(v.amber).toBe(false)
    expect(v.away).toBe(1)                                      // both halves covered now
    expect(v.charges.map(c => c.amount).sort()).toEqual([0.5, 0.5])
  })

  it('a window ENDING at 12:00 is still a morning', () => {
    file('casper', 'LL', 'Feb 09', timed(at(9), at(12)))
    const v = view('casper', '2026-02-09')!
    expect(v.code).toBe('*LL')
    expect(v.away).toBe(0.5)
  })
})

/* ====================================================================== */
/*  A refused bid must SAY so ([S4-BUGHUNT], 20 Sep 26)                   */
/* ====================================================================== */
/* Found by walking the workflow screen by screen: the bid sheet called the
   write, threw the answer away and closed as though it had worked. No leave,
   no message, nothing. Four review passes had missed it, because on every
   axis they checked the app was behaving correctly — the write SHOULD have
   been refused. Nobody asked what reached the person. */
describe('a bid the war refuses', () => {
  it('gives a reason for every door it can be refused at', () => {
    /* Recorded work is NOT here: the owner ruled on 20 Sep 26 that it never
       refuses a write on any screen, so there is no reason to give. What is
       refused is the SAME fact twice — another leave on the same hours — and
       leave over a medical. */
    // a medical
    file('ammo', 'ATT C', 'Feb 09')
    expect(cellProblem('ammo', '2026-02-09', 'LL')).toMatch(/can't go over a medical/)

    // another leave on the same time
    file('dj', 'LL', 'Feb 09')
    expect(cellProblem('dj', '2026-02-09', 'OL')).toMatch(/already taken by LL/)

    // and a write that WOULD go through says nothing at all
    expect(cellProblem('casper', '2026-02-09', 'LL')).toBeNull()
  })

  it('names the same reason the write acts on — the two can never disagree', () => {
    // refused: the same morning already holds leave
    file('bruise', 'LL', 'Feb 09')
    expect(cellProblem('bruise', '2026-02-09', 'OL')).not.toBeNull()
    expect(setCell('bruise', '2026-02-09', 'OL')).toBe(false)
    // allowed: nothing in the way
    expect(cellProblem('casper', '2026-02-09', 'LL')).toBeNull()
    expect(setCell('casper', '2026-02-09', 'LL')).toBe(true)
    // allowed: recorded work flags the day, it does not refuse (owner, 20 Sep 26)
    publishTheSaturday()
    expect(cellProblem(WORKED_MAN, WORKED_SAT, 'LL')).toBeNull()
    expect(setCell(WORKED_MAN, WORKED_SAT, 'LL')).toBe(true)
    expect(view(WORKED_MAN, WORKED_SAT)!.amber).toBe(true)
  })
})

/* ====================================================================== */
/*  Work lands on a leave day whichever way it arrives (owner, 20 Sep 26)  */
/* ====================================================================== */
describe('a hand-typed credit on a day that already holds leave', () => {
  it('lands beside the leave, and does NOT flag it — an award says nothing about where he was', () => {
    /* Two owner rulings meet here, both 20 Sep 26. The first: work arriving on
       a leave day must LAND whichever way it arrives — it was refused, and
       refused silently, so the two facts were kept or lost depending on which
       was entered first. The second, later the same day: a HAND-TYPED credit
       is an AWARD. It says a man is owed a day, not that he was at work, so it
       cannot contradict the leave and the day must not go amber for it. The
       credit is still banked — the OIL is still earned. */
    file('ammo', 'LL', 'Feb 14', timed(at(9), at(11)))
    expect(cellProblem('ammo', '2026-02-14', 'FO')).toBeNull()
    expect(setCell('ammo', '2026-02-14', 'FO')).toBe(true)
    const v = view('ammo', '2026-02-14')!
    expect(v.all.some(c => c.kind === 'credit')).toBe(true)
    expect(v.all.some(c => c.code === 'LL')).toBe(true)
    expect(v.amber).toBe(false)
    expect(v.earnsOil).toBe(1)
  })

  it('…but the SCHEDULE earning one on the same day still flags it', () => {
    /* The other half of the ruling, and the reason the exemption is narrow: a
       credit the app worked out off the published schedule DOES say he was at
       work, so it still contradicts the leave and still sends an admin to
       look. Same two facts as the case above, one of them recorded instead of
       awarded, and the day goes the other way. */
    file(WORKED_MAN, 'LL', 'Jul 18')
    publishTheSaturday()
    const v = view(WORKED_MAN, WORKED_SAT)!
    expect(v.all.some(c => c.kind === 'credit' && c.auto)).toBe(true)
    expect(v.amber).toBe(true)
  })
})

describe("an admin's hand-typed credit the schedule later agrees with", () => {
  const D = '2026-02-17'                                   // an ordinary Tuesday
  const credOf = (p: string) => (rawState().wars.find(w => D >= w.period.start && D <= w.period.end)
    ?.recs[p]?.[D] ?? []).find((r: any) => r.kind === 'credit') as any

  it('is never destroyed — it is handed back, not deleted', () => {
    /* Design §18 OA3-003: the pass never takes a hand-typed credit away. It
       used to take it over in place and turn it `auto`, and the reverse pass
       — which may clear `auto` — then deleted it outright. An admin's record
       of a call-out vanished because the schedule later happened to earn a
       credit on the same day (Codex review, 20 Sep 26).
       Asserted as an END STATE on purpose: the pass runs on every change, so
       a takeover and a hand-back can both happen before anything is read.
       What must hold, whatever order they run in, is that the squadron's own
       record and its words are still there. */
    setCell('dj', D, 'HO')
    setCellNote('dj', D, 'called out for the recovery')
    lwEditLists([{ personId: 'dj', date: D, drop: [], add: [] }])   // settle
    const mine = credOf('dj')
    expect(mine.oil).toBe('manual')
    // give the admin's credit its own hours, as the hours box will
    lwEditLists([{ personId: 'dj', date: D, drop: [mine.id], add: [{ ...mine, spans: [[at(6), at(9)]] }] }])

    // the schedule now earns a DIFFERENT credit that day: taken over in place
    ingestDutyCredit('dj', D, 'FO', 'Duty', [[at(8), at(12)]])

    const after = credOf('dj')
    expect(after).toBeDefined()                                  // never deleted
    // either still the schedule's, carrying the snapshot home, or handed back
    expect(after.oil === 'manual' || after.manual?.code === 'HO').toBe(true)

    /* And what comes back is EXACTLY what the admin typed — his code, his
       hours, his words. A boolean flag was not enough: the schedule's FO and
       its own hours had overwritten the admin's HO, so the hand-back returned
       the SCHEDULE's credit wearing a manual label (Codex review, 20 Sep 26). */
    clearRaptorCell('dj', D)
    const end = credOf('dj')
    expect(end).toBeDefined()
    expect(end.oil).toBe('manual')
    expect(end.code).toBe('HO')                                  // not the schedule's FO
    expect(end.spans).toEqual([[at(6), at(9)]])                  // not the schedule's hours
    expect(end.note).toBe('called out for the recovery')
    expect(end.manual).toBeUndefined()                           // the snapshot is spent
  })

  it('a credit the schedule ALONE earned is still removed outright', () => {
    /* The other half of the same rule: with nothing hand-typed underneath,
       there is nothing to hand back. Nothing on this Tuesday earns a credit,
       so the pass clears it as soon as it sees it — which is the behaviour,
       not a race. */
    ingestDutyCredit('casper', D, 'FO', 'Duty', [[at(8), at(12)]])
    clearRaptorCell('casper', D)
    expect(credOf('casper')).toBeUndefined()
  })
})

/* ====================================================================== */
/*  Manning must not count a man on leave as present (20 Sep 26)          */
/* ====================================================================== */
/* A second-order consequence of the credit now landing on a leave day,
   found by the rules-first review. A credit means AT WORK, so a duty day
   counts its man as present even though he is off the flying programme
   (owner, 19 Aug 26). Before the ruling a credit was never placed on a leave
   day, so the two could not meet. Now they can — and counting him present
   would man a duty weekend with someone who is on leave. */
describe('a man with both a credit and leave on one day', () => {
  const SAT = '2026-07-18'
  const dutyCount = () => countsFor(getState().people as any, getState().grid as any,
    getState().states as any, SAT, getState().views as any).duty

  it('is not counted on duty when the leave takes his whole day', () => {
    setRole('admin')
    const before = dutyCount()
    publishTheSaturday()                                         // the schedule records the work
    const worked = dutyCount()
    expect(worked).toBeGreaterThan(before)                       // he is at work
    expect(view('plasma', SAT)!.duty).toBe(true)

    // now he is also on leave all that day: the day is flagged, and he mans nothing
    file('plasma', 'LL', 'Jul 18')
    expect(view('plasma', SAT)!.amber).toBe(true)
    expect(dutyCount()).toBe(worked - 1)
  })

  it('still counts when only half the day is leave', () => {
    setRole('admin')
    publishTheSaturday()
    const worked = dutyCount()
    file('plasma', 'LL', 'Jul 18', { allday: false, half: 'pm', s: 721, e: 1439 })
    expect(dutyCount()).toBe(worked)                             // still at work that morning
  })
})
