/* [ARCH-STACK] Step 2 — the derived record registry + logical->blob map (§3.1). */
import { describe, it, expect, beforeEach } from 'vitest'
import { LOGICAL_TO_BLOB, registerRecord, recordEntries } from './index'
import { _resetRegistry } from './registry'
import { invariants, defineInvariant, _resetInvariants } from './harness'

beforeEach(() => { _resetRegistry(); _resetInvariants() })

describe('LOGICAL_TO_BLOB', () => {
  it('maps every logical collection to a non-empty physical blob', () => {
    const cols = Object.keys(LOGICAL_TO_BLOB)
    expect(cols.length).toBeGreaterThan(20)
    for (const c of cols) expect(LOGICAL_TO_BLOB[c as keyof typeof LOGICAL_TO_BLOB]).toBeTruthy()
  })
  it('keeps the scheduler issued records in the weeks collection', () => {
    expect(LOGICAL_TO_BLOB['sched.issuance']).toBe('weeks')
    expect(LOGICAL_TO_BLOB['sched.retraction']).toBe('weeks')
    expect(LOGICAL_TO_BLOB['sched.week']).toBe('weeks')
  })
  /* [DB-READINESS] group A, phase 3: every war record is a row of the war's own collection — the cell record is still
     cell-granular for undo (R4-005), and lands in one row per record there (leavewar/state/rows.ts) */
  it('keeps every Leave War record in the war\'s own collection, and no stale name', () => {
    for (const c of ['lw.cell', 'lw.war', 'lw.ledger', 'lw.opening', 'lw.oilpolicy', 'lw.postouts', 'lw.label', 'lw.current', 'lw.config'] as const) {
      expect(LOGICAL_TO_BLOB[c], c).toBe('leavewar')
    }
    expect(Object.keys(LOGICAL_TO_BLOB)).not.toContain('lw.bid')
    expect(Object.keys(LOGICAL_TO_BLOB)).not.toContain('lw.balances')
  })
})

describe('the registry', () => {
  it('a record entry must name its collection', () => {
    expect(() => registerRecord({ key: 'k', cls: 'record', module: 'm' })).toThrow()
    expect(() => registerRecord({ key: 'k2', cls: 'record', collection: 'settings', module: 'm' })).not.toThrow()
    expect(recordEntries().map(e => e.key)).toContain('k2')
  })
  it('idempotent on identical re-register, throws on a conflicting one', () => {
    registerRecord({ key: 'dup', cls: 'view-preference', module: 'm' })
    expect(() => registerRecord({ key: 'dup', cls: 'view-preference', module: 'm' })).not.toThrow()
    expect(() => registerRecord({ key: 'dup', cls: 'record', collection: 'settings', module: 'm' })).toThrow()
  })
})

describe('the invariant harness classification (SEQ-001)', () => {
  it('classifies invariants and exposes only the requested class', () => {
    defineInvariant({ id: 'h1', cls: 'hard', check: () => null })
    defineInvariant({ id: 'a1', cls: 'advisory', check: () => null })
    defineInvariant({ id: 'f1', cls: 'frozen', check: () => null })
    expect(invariants('hard').map(i => i.id)).toEqual(['h1'])
    expect(invariants('advisory').map(i => i.id)).toEqual(['a1'])
    expect(invariants('frozen').map(i => i.id)).toEqual(['f1'])
  })
})
