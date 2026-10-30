/* [LW-HALF-DAY-WORDS-LEFT] (30 Oct 26) — WHAT IS PRINTED FOR AN OIL THE APP CREDITED, AND FOR A HALF DAY, READS AS THE GRID'S
   BOX DRAWS IT. His D1306: an FO or HO the published schedule credited keeps its star as a letter after its code ("FO*",
   "HO*"); D1160 / D1246: a half day is drawn by its box's half. Two places printed the STORED grammar instead — the clash
   note (desktop line and phone list, one `clashWhat`) read a morning credit "*HO" and a credited FO "FO" with no star, and a
   half-day leave "*LL"; the "OIL the app credited" sheet's title read "FO · approved", "<HO · approved". Both now print the
   code as the box does, its half in words (engine/codes.ts codeInWords). The stored grammar itself is untouched: a send-back
   still builds its request's code from it (the scenario list's S2-9 — pinned below).

   Same harness as clashwayout.test.tsx: both real stores, headless, the seed Saturday (plasma stands SDO 0800–1800, so the
   published Saturday credits him a whole day — an FO); bane works a ground row of three hours that Saturday, so it credits him
   half a day — an HO, in the half his work fell in. */
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore as raptorInitStore } from '../state/store'
import { setPage } from '../state/view'
import { setInpEdit } from '../ui/pops'
import { projectPeople } from './state/raptorRoster'
import { getState, initStore as lwInitStore, recordsAt, setBidState, setBidStates, setCell, setPeople, setRole, takeFocusOpen } from './state/store'
import { memoryBackend } from './state/storage'
import { getClashes, installAbsenceDoor, runOilPass } from './sync'
import { StageBar, clashWhat } from './ui/Chrome'
import { RaptorSheet } from './ui/BidPicker'
import { codeInWords } from './engine'

const ISNAP = JSON.stringify(INPUTS)
const DSNAP = JSON.stringify(DAYS)
const SAT = '2026-07-18'

beforeEach(() => {
  INPUTS.length = 0
  JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  DAYS.length = 0
  JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  stashClear()
  raptorInitStore()
  lwInitStore(memoryBackend())
  setPeople(projectPeople())
  installAbsenceDoor()
  setRole('admin')
  setInpEdit(null); setPage('leavewar')
  takeFocusOpen('')
})
afterEach(() => { cleanup() })

const publishSat = () => {
  const g = signOf(5)
  g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  setDayApproved(5, true)
  runOilPass()
}
/* bane works a ground row on the Saturday: three hours, so half a day of OIL — in the half the work falls in */
const baneWorks = (str: string, end: string) => DAYS[5].ground.push({ prog: 'Range brief', str, end, who: 'bane', rmks: '' } as any)
const clashOf = (p: string) => { const l = getClashes().filter(c => c.person === p && c.date === SAT); expect(l, `one clash for ${p}`).toHaveLength(1); return l[0]! }
const flat = (el: Element | null | undefined) => (el?.textContent || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim()
/** the desktop strip's line for one man's Saturday */
const stripLine = (cs: string) => {
  const { container, unmount } = render(<StageBar />)
  const row = [...container.querySelectorAll('[data-testid="sync-clashes"] .row')].map(flat).find(t => t.startsWith(`${cs} · Sat 18 Jul · `))
  unmount()
  return row ?? ''
}
const cs = (id: string) => getState().people.find(p => p.id === id)!.callsign

describe('codeInWords — one form for a code in a sentence', () => {
  it('a credited code wears its star after it; a half is named in words; the stored stars are never printed', () => {
    expect(codeInWords('FO', true)).toBe('FO*')
    expect(codeInWords('*HO', true)).toBe('HO* (AM)')
    expect(codeInWords('HO*', true)).toBe('HO* (PM)')
    expect(codeInWords('HO', false)).toBe('HO')                    // a hand-given HO stays starless (the star is the app's)
    expect(codeInWords('*LL')).toBe('LL (AM)')
    expect(codeInWords('LL*')).toBe('LL (PM)')
    expect(codeInWords('LL')).toBe('LL')
    expect(codeInWords('*ATTC')).toBe('C (AM)')               // the box's own letters (the owner's C)
    expect(codeInWords('*FO', true, null)).toBe('FO*')              // an FO is drawn whole: its half is never named
    expect(codeInWords('HO', true, 'pm')).toBe('HO* (PM)')
  })
})

describe('the clash note prints each code as its box draws it (S2-1, S2-2, S2-3)', () => {
  it('a credited whole day: "earns FO*" — the star after its code, as the box (D1306)', () => {
    setCell('plasma', SAT, 'LL'); setBidState('plasma', SAT, 'approved')
    publishSat()
    const c = clashOf('plasma')
    expect(clashWhat(c)).toBe('Weekend/PH work earns FO*, but the day holds approved LL')
    expect(stripLine(cs('plasma'))).toBe(`${cs('plasma')} · Sat 18 Jul · Weekend/PH work earns FO*, but the day holds approved LL. Change the approved leave ›`)
  })
  it('a credited morning: "HO* (AM)", never "*HO"', () => {
    setCell('bane', SAT, 'OL')
    baneWorks('09:00', '12:00')
    publishSat()
    const c = clashOf('bane')
    expect(c.inputCode, 'the stored notation is kept on the clash, for its key').toBe('*HO')
    expect(clashWhat(c)).toBe('Weekend/PH work earns HO* (AM), but the day holds OL')
  })
  it('a credited afternoon: "HO* (PM)" — the star no longer means "afternoon"', () => {
    setCell('bane', SAT, 'OL')
    baneWorks('13:00', '16:00')
    publishSat()
    expect(clashWhat(clashOf('bane'))).toBe('Weekend/PH work earns HO* (PM), but the day holds OL')
  })
  it('the leave side, half a day: "OL (AM)", never "*OL"', () => {
    setCell('bane', SAT, '*OL')
    baneWorks('09:00', '12:00')
    publishSat()
    expect(clashWhat(clashOf('bane'))).toBe('Weekend/PH work earns HO* (AM), but the day holds OL (AM)')
  })
})

describe('the "OIL the app credited" sheet’s title reads as the box (S2-4)', () => {
  const title = () => screen.getByTestId('raptor-sheet').querySelector('.bidsheet-hd .cur')!.textContent
  it('a credited FO: "FO* · approved"', () => {
    render(<RaptorSheet callsign="Fable" date={SAT} code="FO" creditShown={{ code: 'FO', days: 1 }} onClose={() => {}} />)
    expect(title()).toBe('FO* · approved')
  })
  it('a credited morning HO: "HO* (AM) · approved", never "<HO · approved"', () => {
    render(<RaptorSheet callsign="Ranger" date={SAT} code="*HO" creditShown={{ code: 'HO', days: 0.5, half: 'am' }} onClose={() => {}} />)
    expect(title()).toBe('HO* (AM) · approved')
  })
  it('a morning leave filed on the Inputs page: "LL (AM) · approved", no arrow', () => {
    render(<RaptorSheet callsign="Ranger" date={SAT} code="*LL" onClose={() => {}} />)
    expect(title()).toBe('LL (AM) · approved')
  })
})

describe('the stored grammar stays — a send-back lands a morning bid (S2-9)', () => {
  it('an approved morning LL sent back is a pending MORNING request: its stored code "*LL"', () => {
    const D = '2026-02-10'
    expect(setCell('bane', D, '*LL')).toBe(true)
    expect(setBidStates([{ personId: 'bane', date: D }], 'approved').decided, 'approved').toBe(1)
    expect(setBidStates([{ personId: 'bane', date: D }], 'pending').decided, 'sent back (the second tap — D1330)').toBe(1)
    const r = recordsAt('bane', D).filter(x => x.kind === 'request')
    expect(r.map(x => (x as any).code)).toEqual(['*LL'])
  })
})

/* an FO is drawn whole whatever half its work fell in (MatrixRows placeOf): its half is never named, in the note or the sheet */
describe('an FO earned in one half of the day still reads whole', () => {
  it('the clash note: six and a half hours of morning work earns "FO*", never "FO* (AM)"', () => {
    setCell('bane', SAT, 'OL')
    baneWorks('05:00', '11:30')
    publishSat()
    const c = clashOf('bane')
    expect(c.inputCode, 'its stored notation carries the morning').toBe('*FO')
    expect(clashWhat(c)).toBe('Weekend/PH work earns FO*, but the day holds OL')
  })
  it('the sheet: a morning FO reads "FO* · approved"', () => {
    render(<RaptorSheet callsign="Ranger" date={SAT} code="*FO" creditShown={{ code: 'FO', days: 1, half: 'am' }} onClose={() => {}} />)
    expect(screen.getByTestId('raptor-sheet').querySelector('.bidsheet-hd .cur')!.textContent).toBe('FO* · approved')
  })
})
