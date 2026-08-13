import { describe, it, expect, beforeEach } from 'vitest'
import { storeBackend } from './hooks'
import {
  DUTYTPL_STD, DUTYTPL_CFG, tplAreStandard,
  addTpl, delTpl, renameTpl, moveTpl,
  addTplRow, delTplRow, setTplRow, moveTplRow,
  blockFromTpl, dutyTplSave, dutyTplLoad, dutyTplReset,
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
    expect(DUTYTPL_CFG[2]!.rows[0]).toEqual({ role: 'SXO', str: '1900', end: '0700' })
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
  it('copies the rows onto a PLAIN block — no sa/noconf, id blank, independent of the library', () => {
    const blk = blockFromTpl(DUTYTPL_CFG[1]!.id)   // SC Shift
    expect(blk.label).toBe('SC Shift')
    expect(blk.sa).toBeUndefined()
    expect(blk.noconf).toBeUndefined()
    expect(blk.rows).toEqual([
      { role: 'SXO AM', id: '', str: '0700', end: '1300' },
      { role: 'OPS O AM', id: '', str: '0700', end: '1300' },
      { role: 'SXO PM', id: '', str: '1300', end: '1900' },
      { role: 'OPS O PM', id: '', str: '1300', end: '1900' },
    ])
    /* editing the placed block must not reach back into the library */
    blk.rows[0]!.role = 'CHANGED'
    expect(DUTYTPL_CFG[1]!.rows[0]!.role).toBe('SXO AM')
  })
  it('returns null for an unknown id', () => {
    expect(blockFromTpl('nope')).toBeNull()
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
      { role: 'SDO', str: '0700', end: '1300' },
      { role: '', str: '', end: '' },   // {role:42} coerced to a blank-role row
    ])
  })
  it('a non-array blob resets to the seed', () => {
    mem['sqn142_dutytpl'] = JSON.stringify({ nope: true })
    dutyTplLoad()
    expect(DUTYTPL_CFG.map(t => t.title)).toEqual(['Standard', 'SC Shift', 'AVALON'])
  })
})
