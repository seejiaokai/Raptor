// ONE KIND OF HAND-GIVEN OIL ([OIL-AWARD-IS-A-GRANT], 29 Sep 26 — the owner's D400, D401, D402).
//
// Every OIL an admin gives by hand — the bid sheet's +OIL panel on the grid, the OIL tracker, the figures bar — is ONE
// record: a positive OIL ledger entry, drawn on the war grid on its date. What this file pins is what the move ADDED
// (the older rulings it had to keep are pinned where they always were — `oil-award-add.test.ts`, `awardclear.test.tsx`,
// `ownaward.test.tsx`, `movestandard.test.ts`): the tracker's award on the grid (D402), the grid redrawn at once, the
// ledger in small pieces for undo, the Delete that takes only what its confirm named, a deleted man's future awards,
// who entered each award and when (D200 (2)), and a day holding several.
// Plan and both reviewers' rounds: `docs/superpowers/plans/2026-09-29-oil-award-one-kind-plan.md`.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { onCommit } from '../command'
import type { CommitEnvelope } from '../command/types'
import { FIGURES, figureParts } from './engine'
import {
  awardShown, awardsIn, awardsOnDay, clearCells, editAward, figureCtxOf, forgetPersonFrom, getState, grantOil, grantTo,
  initStore, lwHistInit, lwRedo, lwUndo, rawState, setDayAward, setPeople, setRole, setViewer, updateLedgerEntry,
} from './state/store'
import { memoryBackend, type StorageBackend } from './state/storage'

const TUE = '2026-01-13'
const WED = '2026-01-14'
let backend: StorageBackend

beforeEach(() => {
  backend = memoryBackend()
  initStore(backend)
  lwHistInit()
  setRole('admin')
})
afterEach(() => { setViewer(null) })

const view = (p: string, d: string) => getState().wars.find(w => w.period.start <= d && d <= w.period.end)?.views[p]?.[d]

describe('D402 — every hand award shows on the grid on its date, wherever it was given', () => {
  it('a credit from the OIL TRACKER draws as FO on its day, at once — no other change needed', () => {
    expect(view('slammed', TUE)).toBeUndefined()
    expect(grantOil(['slammed'], 2, TUE, 'Exercise recovery', 'OC Ops')).toBeNull()
    const v = view('slammed', TUE)!
    expect(v.code).toBe('FO')
    expect(v.main).toMatchObject({ kind: 'credit', note: 'Exercise recovery', givenBy: 'OC Ops', days: 2 })
    expect(v.main!.auto).toBeUndefined()        // an award, not the schedule's
    expect(v.earnsOil).toBe(0)                  // …and awarded, not earned (D400)
  })

  it('half a day draws HO; a correction is never drawn; a date in no war is on no cell', () => {
    grantOil(['slammed'], 0.5, TUE, 'SIM')
    expect(view('slammed', TUE)!.code).toBe('HO')
    grantOil(['slammed'], -0.5, WED, 'Correction')
    expect(view('slammed', WED)).toBeUndefined()
    const noWar = '2029-06-05'
    expect(getState().wars.some(w => w.period.start <= noWar && noWar <= w.period.end)).toBe(false)
    expect(grantOil(['slammed'], 1, noWar, 'Far off')).toBeNull()
    expect(view('slammed', noWar)).toBeUndefined()
    expect(awardsOnDay('slammed', noWar)).toHaveLength(1)                   // stored, and in the balance
  })

  it('an award only another person gained leaves every other row’s merged picture untouched (the cache)', () => {
    const before = getState().wars[0]!.views.ramp
    grantOil(['slammed'], 1, TUE, 'x')
    expect(getState().wars[0]!.views.ramp).toBe(before)          // the same object — ramp was not re-merged
    expect(getState().wars[0]!.views.slammed?.[TUE]?.code).toBe('FO')
  })

  it('Undo takes the tracker credit off the grid at once, Redo puts it back', () => {
    grantOil(['slammed'], 1, TUE, 'x')
    expect(view('slammed', TUE)?.code).toBe('FO')
    lwUndo()
    expect(view('slammed', TUE)).toBeUndefined()
    lwRedo()
    expect(view('slammed', TUE)?.code).toBe('FO')
  })
})

describe('the ledger in small pieces — one record per entry (both plan reads, F6 / F11)', () => {
  let seen: CommitEnvelope[] = []
  let off: (() => void) | null = null
  beforeEach(() => { seen = []; off = onCommit(env => { seen.push(env) }) as any })
  afterEach(() => { if (typeof off === 'function') off() })

  it('an award is its own command record, run as an award (the permissions table’s award row)', () => {
    expect(setDayAward('slammed', TUE, 1)).toBeNull()
    const id = awardsOnDay('slammed', TUE)[0]!.id
    const env = seen.at(-1)!
    expect(env.type).toBe('lw.award')
    expect(env.changes.filter(c => c.collection === 'lw.ledger').map(c => c.id)).toEqual([id])
    expect(env.changes.some(c => c.collection === 'lw.ledger' && c.id === 'all')).toBe(false)
  })

  it('a batch credit to two men is ONE command with TWO entries; a correction runs as a ledger write', () => {
    grantOil(['slammed', 'ramp'], 1, TUE, 'Det')
    const env = seen.at(-1)!
    expect(env.type).toBe('lw.award')
    expect(env.changes.filter(c => c.collection === 'lw.ledger')).toHaveLength(2)
    grantTo(['ramp'], 'ccl', 2, TUE, '')
    expect(seen.at(-1)!.type).toBe('lw.ledger')
  })

  it('a clear that takes a bid AND an award is one command, run as a clear naming the award', () => {
    setDayAward('slammed', TUE, 1)
    const r = clearCells([{ personId: 'slammed', date: TUE }])
    expect(r.written).toBe(1)
    const env = seen.at(-1)!
    expect(env.type).toBe('lw.clear')
    expect(awardsOnDay('slammed', TUE)).toHaveLength(0)
  })

  it('ids are never re-minted: an undone award’s id is not handed to the next one (R2-03)', () => {
    setDayAward('slammed', TUE, 1)
    const first = awardsOnDay('slammed', TUE)[0]!.id
    lwUndo()
    setDayAward('slammed', TUE, 1)
    expect(awardsOnDay('slammed', TUE)[0]!.id).not.toBe(first)
  })
})

describe('the Delete takes only the awards its confirm named (Astra’s round-2 read, R2-02)', () => {
  it('an award given on the day after the confirm stays', () => {
    grantOil(['slammed'], 1, TUE, 'first')
    const named = awardsIn([{ personId: 'slammed', date: TUE }]).map(a => a.id)
    expect(named).toHaveLength(1)
    grantOil(['slammed'], 2, TUE, 'given after the confirm')
    clearCells([{ personId: 'slammed', date: TUE }], named)
    expect(awardsOnDay('slammed', TUE).map(e => e.reason)).toEqual(['given after the confirm'])
  })

  it('the confirm names the award by what it is WORTH — never worked back from its label (F05)', () => {
    grantOil(['slammed'], 3, TUE, 'x')
    expect(awardsIn([{ personId: 'slammed', date: TUE }]).map(a => a.days)).toEqual([3])
  })
})

describe('a day holding SEVERAL awards', () => {
  it('the +OIL panel changes none of them — it says so; the tap list changes each by its own id', () => {
    grantOil(['slammed'], 1, TUE, 'one')
    grantOil(['slammed'], 2, TUE, 'two')
    expect(setDayAward('slammed', TUE, 5)).toContain('holds 2 OIL awards')
    expect(awardsOnDay('slammed', TUE).map(e => e.amount)).toEqual([1, 2])
    const two = awardsOnDay('slammed', TUE)[1]!.id
    expect(editAward(two, { days: 2.5 })).toBeNull()
    expect(awardsOnDay('slammed', TUE).map(e => e.amount)).toEqual([1, 2.5])
    expect(view('slammed', TUE)!.all.filter(c => c.kind === 'credit')).toHaveLength(2)
  })
})

describe('the reason rule — two doors, one record (§2.2)', () => {
  it('the grid never asks a reason; the tracker always does; an award given with none is corrected without inventing one', () => {
    expect(setDayAward('slammed', TUE, 1)).toBeNull()
    expect(grantOil(['slammed'], 1, WED, '  ')).toBe('Give a reason')
    const id = awardsOnDay('slammed', TUE)[0]!.id
    expect(updateLedgerEntry(id, { amount: 1.5 })).toBeNull()
    expect(awardsOnDay('slammed', TUE)[0]!.amount).toBe(1.5)
  })
})

describe('who ENTERED it and when (owner, D200 (2))', () => {
  it('stamped from the signed-in person, kept through a reload and an edit, drawn by his LIVE callsign', () => {
    setViewer('ramp')
    expect(setDayAward('slammed', TUE, 1, { givenBy: 'OC Ops' })).toBeNull()
    const e = awardsOnDay('slammed', TUE)[0]!
    expect(e.enteredBy).toBe('ramp')
    expect(Number.isNaN(Date.parse(e.enteredAt!))).toBe(false)

    initStore(backend)                                   // the reload
    setRole('admin'); setViewer('dusk')
    expect(awardsOnDay('slammed', TUE)[0]).toMatchObject({ enteredBy: 'ramp', givenBy: 'OC Ops' })
    expect(updateLedgerEntry(e.id, { amount: 2 })).toBeNull()
    expect(awardsOnDay('slammed', TUE)[0]).toMatchObject({ enteredBy: 'ramp', enteredAt: e.enteredAt })  // an edit keeps them

    /* his rename follows on every read-back — the id is stored, never the callsign */
    expect(awardShown(awardsOnDay('slammed', TUE)[0]!).enteredName).toBe('RAMP')
    setPeople(getState().people.map(p => (p.id === 'ramp' ? { ...p, callsign: 'RAMPART' } : p)))
    expect(awardShown(awardsOnDay('slammed', TUE)[0]!).enteredName).toBe('RAMPART')
    const oil = FIGURES.find(f => f.id === 'oil')!
    expect(figureParts(oil, figureCtxOf(), 'slammed').find(p => p.label === 'awarded')!.value).toBe(2)
  })
})

describe('a man deleted (D299) — his awards from the cutoff go, his past stays', () => {
  it('forgetPersonFrom drops his future awards only; his past award and his correction stay', () => {
    grantOil(['slammed'], 1, '2026-01-05', 'past')
    grantOil(['slammed'], 2, '2026-03-02', 'future')
    grantOil(['slammed'], -0.5, '2026-03-03', 'future correction')
    forgetPersonFrom('slammed', '2026-02-01')
    const mine = rawState().ledger.filter(e => e.personId === 'slammed')
    expect(mine.map(e => e.reason).sort()).toEqual(['future correction', 'past'])
  })
})
