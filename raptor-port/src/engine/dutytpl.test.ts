import { describe, it, expect, beforeEach } from 'vitest'
import { storeBackend } from './hooks'
import {
  DUTYTPL_STD, DUTYTPL_CFG, tplAreStandard,
  addTpl, delTpl, renameTpl, moveTpl,
  addTplRow, delTplRow, setTplRow, moveTplRow,
  blockFromTpl, dutyTplSave, dutyTplLoad, dutyTplReset, tplTime, setTplWave,
} from './dutytpl'

/* storeBackend.impl is null headless — wire a fake, never real localStorage */
const mem: Record<string, string> = {}
const fake = {
  getItem: (k: string) => (k in mem ? mem[k]! : null),
  setItem: (k: string, v: string) => { mem[k] = v },
}

beforeEach(() => {
  Object.keys(mem).forEach(k => delete mem[k])
  storeBackend.impl = fake
  dutyTplReset()
})

describe('the seeded library', () => {
  it('opens on Standard / SC Shift / AVALON, from the current duty shapes', () => {
    expect(DUTYTPL_CFG.map(t => t.title)).toEqual(['Standard', 'SC Shift', 'AVALON'])
    expect(DUTYTPL_CFG[0]!.rows.map(r => r.role)).toEqual(['SDO', 'SXO', 'OPS O'])
    expect(DUTYTPL_CFG[1]!.rows.map(r => r.role)).toEqual(['SXO AM', 'OPS O AM', 'SXO PM', 'OPS O PM'])
    expect(DUTYTPL_CFG[2]!.rows.map(r => r.role)).toEqual(['SXO', 'OPS O', 'RUNNER', 'LOG CELL'])
    expect(DUTYTPL_CFG[2]!.rows[0]).toEqual({ role: 'SXO', str: '19:00', end: '07:00' })
    expect(tplAreStandard()).toBe(true)
  })
  it('DUTYTPL_STD cannot be mutated through the live library', () => {
    addTplRow(DUTYTPL_CFG[0]!.id)
    setTplRow(DUTYTPL_CFG[0]!.id, 0, 'role', 'HACKED')
    expect(DUTYTPL_STD[0]!.rows.length).toBe(3)
    expect(DUTYTPL_STD[0]!.rows[0]!.role).toBe('SDO')
  })
})

describe('editing the library', () => {
  it('adds, renames, deletes and reorders a template', () => {
    const t = addTpl('IRT')
    expect(t && t.title).toBe('IRT')
    expect(DUTYTPL_CFG.length).toBe(4)
    expect(t!.rows).toEqual([{ role: '', str: '', end: '' }])   // a new one opens with one blank row
    renameTpl(t!.id, 'IRT Desk')
    expect(DUTYTPL_CFG.find(x => x.id === t!.id)!.title).toBe('IRT Desk')
    moveTpl(3, 0)
    expect(DUTYTPL_CFG[0]!.title).toBe('IRT Desk')
    expect(delTpl(t!.id)).toBe(true)
    expect(DUTYTPL_CFG.map(t => t.title)).toEqual(['Standard', 'SC Shift', 'AVALON'])
  })
  it('adds, edits, deletes and reorders a row', () => {
    const id = DUTYTPL_CFG[0]!.id
    addTplRow(id)
    expect(DUTYTPL_CFG[0]!.rows.length).toBe(4)
    setTplRow(id, 3, 'role', 'RUNNER'); setTplRow(id, 3, 'str', '0700'); setTplRow(id, 3, 'end', '1300')
    expect(DUTYTPL_CFG[0]!.rows[3]).toEqual({ role: 'RUNNER', str: '0700', end: '1300' })
    moveTplRow(id, 3, 0)
    expect(DUTYTPL_CFG[0]!.rows[0]!.role).toBe('RUNNER')
    delTplRow(id, 0)
    expect(DUTYTPL_CFG[0]!.rows.map(r => r.role)).toEqual(['SDO', 'SXO', 'OPS O'])
  })
})

describe('minting a block from a template', () => {
  it('copies the rows onto a block that carries the template\'s WAVE as its sa marker, id blank, independent of the library', () => {
    const blk = blockFromTpl(DUTYTPL_CFG[1]!.id)   // SC Shift
    expect(blk.label).toBe('SC Shift')
    /* an SC desk is checked like any duty row (no noconf) but the marker is
       what lets the SC-spare rule see it (owner, 7 Sep 26) */
    expect(blk.sa).toBe('sc')
    expect(blk.noconf).toBeUndefined()
    /* the seed stores compact ('0700'); the mint folds to hh:mm, the app's one
       time form (owner, 30 Aug 26) — so a placed block always reads 07:00 */
    expect(blk.rows).toEqual([
      { role: 'SXO AM', id: '', str: '07:00', end: '13:00' },
      { role: 'OPS O AM', id: '', str: '07:00', end: '13:00' },
      { role: 'SXO PM', id: '', str: '13:00', end: '19:00' },
      { role: 'OPS O PM', id: '', str: '13:00', end: '19:00' },
    ])
    /* editing the placed block must not reach back into the library */
    blk.rows[0]!.role = 'CHANGED'
    expect(DUTYTPL_CFG[1]!.rows[0]!.role).toBe('SXO AM')
  })
  it('returns null for an unknown id', () => {
    expect(blockFromTpl('nope')).toBeNull()
  })

  /* GUARD RAILS ON THE TIMES (owner, 16 Aug 26 — "no guard rails on duty
     templates timings": the editor took `2500` as a start). The editor refuses
     on commit (DutyTplModal); these two choke points are the silent net, so a
     value from stale storage or a pre-fix session can never reach the schedule.
     A malformed time drops to '' (a duty role with no start is legal); a valid
     one canonicalises to hh:mm, the app's one time form (owner, 30 Aug 26). */
  it('minting drops a malformed time and canonicalises a valid one', () => {
    const t = addTpl('Nights')!
    setTplRow(t.id, 0, 'str', '2500')     // not a clock time
    setTplRow(t.id, 0, 'end', '700')      // valid, but typed without the colon
    const blk = blockFromTpl(t.id)
    expect(blk.rows[0].str).toBe('')      // nonsense cleared
    expect(blk.rows[0].end).toBe('07:00') // 700 → 07:00, the colon appears on its own
  })

  it('tplTime is the shared fold: clock time or nothing, hh:mm form', () => {
    expect(tplTime('0700')).toBe('07:00')
    expect(tplTime('7:00')).toBe('07:00')
    expect(tplTime('700')).toBe('07:00')
    expect(tplTime('2400')).toBe('24:00') // the midnight tail hmOK allows, as on the schedule
    expect(tplTime('2500')).toBe('')      // hour out of range
    expect(tplTime('0961')).toBe('')      // minute out of range
    expect(tplTime('morning')).toBe('')   // not a time at all
    expect(tplTime('')).toBe('')
  })
})

describe('persistence, like the stores list', () => {
  it('the standard library writes nothing, and a divergence survives a reload', () => {
    dutyTplSave()
    expect('sqn142_dutytpl' in mem ? JSON.parse(mem['sqn142_dutytpl']!) : 'unset').toBe(null)
    renameTpl(DUTYTPL_CFG[0]!.id, 'Weekend Desk')
    addTpl('IRT')
    dutyTplSave()
    /* a live edit AFTER the save must be thrown away by a reload, proving load
       replaces the library from storage rather than merging into it */
    addTpl('SCRATCH')
    dutyTplLoad()
    expect(DUTYTPL_CFG.map(t => t.title)).toEqual(['Weekend Desk', 'SC Shift', 'AVALON', 'IRT'])
  })
  it('garbage in storage falls back to the seed, dropping bad rows', () => {
    mem['sqn142_dutytpl'] = JSON.stringify([
      { id: 'x', title: 'Ok', rows: [{ role: 'SDO', str: '0700', end: '1300' }, 'junk', { role: 42 }] },
      'not a template',
      { title: 'no rows' },
    ])
    dutyTplLoad()
    expect(DUTYTPL_CFG.map(t => t.title)).toEqual(['Ok'])
    expect(DUTYTPL_CFG[0]!.rows).toEqual([
      { role: 'SDO', str: '07:00', end: '13:00' },  // load folds to hh:mm
      { role: '', str: '', end: '' },   // {role:42} coerced to a blank-role row
    ])
  })
  it('a non-array blob resets to the seed', () => {
    mem['sqn142_dutytpl'] = JSON.stringify({ nope: true })
    dutyTplLoad()
    expect(DUTYTPL_CFG.map(t => t.title)).toEqual(['Standard', 'SC Shift', 'AVALON'])
  })

  it('a malformed stored time is dropped on load, a valid one canonicalised', () => {
    /* untrusted storage from a pre-guard session could hold a nonsense time —
       load is the second net under the editor, so it never reaches a block */
    mem['sqn142_dutytpl'] = JSON.stringify([
      { id: 'x', title: 'Ok', rows: [{ role: 'SDO', str: '2500', end: '7:00' }] },
    ])
    dutyTplLoad()
    expect(DUTYTPL_CFG[0]!.rows[0]).toEqual({ role: 'SDO', str: '', end: '07:00' })
  })

  it('an id-less entry does not mint a uN a later entry already claims', () => {
    /* bug sweep, 18 Aug 26: the first entry has no id (it mints one inside the
       loop) and the second is 'u1'. The pre-scan advances SEQ past 'u1' BEFORE
       minting, so the two get distinct ids and both stay reachable to
       rename/delete rather than colliding on 'u1'. */
    mem['sqn142_dutytpl'] = JSON.stringify([
      { title: 'A', rows: [{ role: 'SDO', str: '0700', end: '1300' }] },
      { id: 'u1', title: 'B', rows: [{ role: 'SDO', str: '0700', end: '1300' }] },
    ])
    dutyTplLoad()
    const ids = DUTYTPL_CFG.map(t => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

/* WHICH WAVE A DESK BELONGS TO (owner, 7 Sep 26 — "a duty role that falls under
   AVALON will not have any warning … unless OL, HL, OML, ATT C, OD", "sc duties
   desk … not allowed … the same time as main or spare"). The engine already
   knew an `sa`-marked desk; nothing minted one since the 13 Aug decoupling.
   The template now names its wave, and the mint carries it onto the block. */
describe('a template names the wave its desk serves', () => {
  it('the seed library: Standard is nobody\'s, SC Shift is SC\'s, AVALON is AVALON\'s', () => {
    expect(DUTYTPL_STD.map(t => t.wave)).toEqual(['', 'sc', 'avalon'])
    expect(DUTYTPL_CFG.map(t => t.wave)).toEqual(['', 'sc', 'avalon'])
  })
  it('an AVALON template mints an exempt desk (sa + noconf); an ordinary one mints a PLAIN block', () => {
    const av = blockFromTpl('avalon')
    expect(av.sa).toBe('avalon')
    expect(av.noconf).toBe(true)
    const std = blockFromTpl('std')
    expect(std).toEqual({ label: 'Standard', rows: std.rows })
    expect('sa' in std).toBe(false)
    expect('noconf' in std).toBe(false)
  })
  it('setTplWave writes one of the three values and refuses anything else', () => {
    const t = addTpl('Nights')!
    expect(t.wave).toBe('')
    expect(setTplWave(t.id, 'avalon')).toBe(true)
    expect(blockFromTpl(t.id).sa).toBe('avalon')
    expect(setTplWave(t.id, 'bogus' as any)).toBe(false)
    expect(DUTYTPL_CFG.find(x => x.id === t.id)!.wave).toBe('avalon')
    expect(setTplWave(t.id, '')).toBe(true)
    expect('sa' in blockFromTpl(t.id)).toBe(false)
    expect(setTplWave('nope', 'sc')).toBe(false)
  })
  it('the wave survives a save / load round trip', () => {
    const t = addTpl('Nights')!
    setTplWave(t.id, 'avalon')
    dutyTplSave()
    dutyTplLoad()
    expect(DUTYTPL_CFG.find(x => x.id === t.id)!.wave).toBe('avalon')
  })
  it('untrusted storage: a nonsense wave drops to none; a pre-7-Sep library keeps the seed desks\' waves by id', () => {
    mem['sqn142_dutytpl'] = JSON.stringify([
      { id: 'u1', title: 'Bad', wave: 'moon', rows: [{ role: 'SDO', str: '', end: '' }] },
      { id: 'u2', title: 'None', rows: [{ role: 'SDO', str: '', end: '' }] },
      { id: 'avalon', title: 'AVALON', rows: [{ role: 'SXO', str: '19:00', end: '07:00' }] },
      { id: 'sc', title: 'SC Shift', rows: [{ role: 'SXO AM', str: '07:00', end: '13:00' }] },
    ])
    dutyTplLoad()
    expect(DUTYTPL_CFG.map(t => [t.id, t.wave])).toEqual([['u1', ''], ['u2', ''], ['avalon', 'avalon'], ['sc', 'sc']])
  })
  it('an explicit null wave on a seed desk reads as "unset" too — the seed wave comes back, never a silent plain desk', () => {
    mem['sqn142_dutytpl'] = JSON.stringify([
      { id: 'avalon', title: 'AVALON', wave: null, rows: [{ role: 'SXO', str: '19:00', end: '07:00' }] },
      { id: 'u1', title: 'Mine', wave: null, rows: [{ role: 'SDO', str: '', end: '' }] },
    ])
    dutyTplLoad()
    expect(DUTYTPL_CFG.map(t => [t.id, t.wave])).toEqual([['avalon', 'avalon'], ['u1', '']])
  })
})
