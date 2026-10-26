import { describe, expect, it } from 'vitest'
import { MAX_CARRIED_REMARK, MAX_REQ_DOCS, readRec, requestWords } from './warrecs'

/* A REQUEST'S OWN WORDS AND PAPERS (owner D1210, D1226, D1150; M3 7.1): remarks, the till tick, documents — read back
   from storage, capped, junk dropped, and an older saved shape (its remark in `carried`) still loads (D401). */

const base = { id: 'r1', kind: 'request', code: 'LL', state: 'pending' }

describe('a request’s words and papers, stored', () => {
  it('round-trips remarks, the till tick and the documents', () => {
    const r = readRec({ ...base, remarks: 'awaiting approval', till: false, docIds: ['d1', 'd2'] })
    expect(r).toMatchObject({ remarks: 'awaiting approval', till: false, docIds: ['d1', 'd2'] })
  })

  it('caps them and drops junk', () => {
    const many = Array.from({ length: 40 }, (_, i) => `d${i}`)
    const r = readRec({ ...base, remarks: 'x'.repeat(500), till: 'no', docIds: ['a', 3, '', 'a', 'y'.repeat(200), ...many] }) as any
    expect(r.remarks.length).toBe(MAX_CARRIED_REMARK)
    expect(r.till).toBeUndefined()
    expect(r.docIds[0]).toBe('a')
    expect(r.docIds.length).toBe(MAX_REQ_DOCS)
    expect(new Set(r.docIds).size).toBe(r.docIds.length)
    expect(r.docIds.some((d: string) => d.length > 120)).toBe(false)
  })

  it('an older saved request’s carried remark loads as its remarks; the moved marks stay carried', () => {
    const r = readRec({ ...base, carried: { remarks: 'old words', lwMoved: { '2026-02-11': '2026-02-10' } } }) as any
    expect(r.remarks).toBe('old words')
    expect(r.carried).toEqual({ lwMoved: { '2026-02-11': '2026-02-10' } })
  })

  it('a request with none of them stores none', () => {
    const r = readRec({ ...base }) as any
    expect(r.remarks).toBeUndefined()
    expect(r.till).toBeUndefined()
    expect(r.docIds).toBeUndefined()
  })

  it('requestWords copies only what is there', () => {
    expect(requestWords({})).toEqual({})
    expect(requestWords({ remarks: 'a', till: true, docIds: ['d'] })).toEqual({ remarks: 'a', till: true, docIds: ['d'] })
    expect(requestWords({ till: false })).toEqual({ till: false })
  })
})
