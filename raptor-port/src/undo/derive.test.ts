/* [ARCH-STACK] Step 3 — the pure-derivation unit tests: contexts, ownership, the
   inverse, and the weekstash key-family (§4.3/§5/§8.1). */
import { describe, it, expect } from 'vitest'
import {
  deriveContexts, deriveOwners, invertChange, invertClosure, sharesKeys, recordKey, weekOf, warOf, courseOf,
} from './derive'
import type { Change } from '../command'

const put = (collection: any, id: string, before: unknown, after: unknown): Change =>
  ({ op: 'put', collection, id, before, after })
const create = (collection: any, id: string, after: unknown): Change =>
  ({ op: 'put', collection, id, after })
const del = (collection: any, id: string, before: unknown): Change =>
  ({ op: 'delete', collection, id, before })

describe('record → week/war/course parsing', () => {
  it('reads the week from every scheduler-week key shape', () => {
    expect(weekOf('days', 'W12#3')).toBe('W12')
    expect(weekOf('sched.book', 'W12')).toBe('W12')
    expect(weekOf('sched.orig', 'W12:3')).toBe('W12')
    expect(weekOf('sched.als', 'W12:v-2026-01-05-1')).toBe('W12')
    expect(weekOf('sched.retired', 'W12:v-2026-01-05-1~2')).toBe('W12')
    expect(weekOf('weekstash', 'W09')).toBe('W09')
    expect(weekOf('inputs', 'i1')).toBeNull()
  })
  it('reads the war from lw ids (warId may not be split from the left)', () => {
    expect(warOf('lw.war', 'war-2026')).toBe('war-2026')
    expect(warOf('lw.cell', 'war-2026:p7:2026-03-01')).toBe('war-2026')
    expect(warOf('lw.ledger', 'all')).toBeNull()
  })
  it('reads the course only from course-scoped tracker keys', () => {
    expect(courseOf('trk.marks', 'v3:C1:S1:m:ST-02')).toBe('C1')
    expect(courseOf('trk.roster', 'v3:C1:roster')).toBe('C1')
    expect(courseOf('trk.courses', 'v3:courses')).toBeNull()
    expect(courseOf('trk.catalogue', 'v3:sylcat')).toBeNull()
  })
})

describe('deriveContexts', () => {
  it('collects and dedups every context the closure touched', () => {
    const ctx = deriveContexts([
      put('days', 'W12#3', {}, {}),
      put('sched.book', 'W12', {}, {}),
      create('sched.orig', 'W12:3', {}),
      put('lw.cell', 'war-1:p3:2026-01-01', 'LL', 'AL'),
      put('trk.marks', 'v3:C1:S1:m:ST-02', {}, {}),
      put('inputs', 'i9', {}, {}),
    ])
    expect(ctx).toContainEqual({ kind: 'week', weekId: 'W12' })
    expect(ctx).toContainEqual({ kind: 'war', warId: 'war-1' })
    expect(ctx).toContainEqual({ kind: 'course', courseId: 'C1' })
    expect(ctx).toContainEqual({ kind: 'page', module: 'inputs' })
    // W12 appears three times but is deduped
    expect(ctx.filter(c => c.kind === 'week').length).toBe(1)
  })
})

describe('deriveOwners (§5)', () => {
  it('parses the pid from lw.cell/bid from the right; owner-less classes are null', () => {
    const owners = deriveOwners([
      put('lw.cell', 'war-1:p3:2026-01-01', 'LL', 'AL'),
      put('days', 'W12#3', {}, {}),
      put('sched.book', 'W12', {}, {}),
    ])
    expect(owners.find(o => o.key === 'lw.cell/war-1:p3:2026-01-01')!.person).toBe('p3')
    expect(owners.find(o => o.key === 'days/W12#3')!.person).toBeNull()
    expect(owners.find(o => o.key === 'sched.book/W12')!.person).toBeNull()
  })
  it('reads an input owner from after, or before on a delete; people owns itself', () => {
    const owners = deriveOwners([
      create('inputs', 'i1', { person: 'pA' }),
      del('inputs', 'i2', { person: 'pB' }),
      put('people', 'pC', {}, {}),
    ])
    expect(owners.find(o => o.key === 'inputs/i1')!.person).toBe('pA')
    expect(owners.find(o => o.key === 'inputs/i2')!.person).toBe('pB')
    expect(owners.find(o => o.key === 'people/pC')!.person).toBe('pC')
  })
  it('inputs/__order carries the UNION of the closure input owners (one entry each)', () => {
    const owners = deriveOwners([
      create('inputs', 'i1', { person: 'pA' }),
      del('inputs', 'i2', { person: 'pB' }),
      put('inputs', '__order', ['i2', 'i1'], ['i1', 'i2']),
    ])
    const orderOwners = owners.filter(o => o.key === 'inputs/__order').map(o => o.person).sort()
    expect(orderOwners).toEqual(['pA', 'pB'])
  })
})

describe('invert (§3.2)', () => {
  it('inverts create→delete, delete→create, edit→edit', () => {
    expect(invertChange(create('days', 'W1#0', { v: 2 }))).toEqual({ op: 'delete', collection: 'days', id: 'W1#0', before: { v: 2 } })
    expect(invertChange(del('days', 'W1#0', { v: 1 }))).toEqual({ op: 'put', collection: 'days', id: 'W1#0', after: { v: 1 } })
    expect(invertChange(put('days', 'W1#0', { v: 1 }, { v: 2 }))).toEqual({ op: 'put', collection: 'days', id: 'W1#0', before: { v: 2 }, after: { v: 1 } })
  })
  it('reverses order and never coalesces a doubly-touched record (R2-14)', () => {
    const forward = [put('days', 'W1#0', { v: 1 }, { v: 2 }), put('days', 'W1#0', { v: 2 }, { v: 3 })]
    const inv = invertClosure(forward)
    expect(inv.length).toBe(2)
    // reversed: undo the second edit first (3→2), then the first (2→1)
    expect((inv[0].after as any).v).toBe(2)
    expect((inv[1].after as any).v).toBe(1)
  })
})

describe('sharesKeys — weekstash key-family (§8.1)', () => {
  const keys = (...cs: Change[]) => new Set(cs.map(recordKey))
  it('shares on an exact key', () => {
    expect(sharesKeys(keys(put('days', 'W1#0', {}, {})), keys(put('days', 'W1#0', {}, {})))).toBe(true)
  })
  it('does NOT share different exact keys', () => {
    expect(sharesKeys(keys(put('days', 'W1#0', {}, {})), keys(put('days', 'W1#1', {}, {})))).toBe(false)
  })
  it('weekstash/<wk> shares with any same-week scheduler key, both directions', () => {
    const stash = keys(put('weekstash', 'W1', {}, {}))
    const dayKey = keys(put('days', 'W1#5', {}, {}))
    expect(sharesKeys(stash, dayKey)).toBe(true)
    expect(sharesKeys(dayKey, stash)).toBe(true)
  })
  it('weekstash of a DIFFERENT week does not share', () => {
    expect(sharesKeys(keys(put('weekstash', 'W2', {}, {})), keys(put('days', 'W1#5', {}, {})))).toBe(false)
  })
})
