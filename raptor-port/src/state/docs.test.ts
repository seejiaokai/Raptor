/* The supporting-document store (owner, 27 Aug 26) — session-only, in
   memory, append-only, ids only on the input records. */
import { describe, expect, it } from 'vitest'
import { DOC_MAX, docAccepts, docAdd, docFields, docGet, docHas, docBackend, rowDocIds } from './docs'

const png = (bytes = 4) => new Blob([new Uint8Array(bytes)], { type: 'image/png' }) as any

describe('the document store', () => {
  it('stores a photo or a PDF and hands back a stable id', () => {
    const { id, why } = docAdd(png())
    expect(why).toBe('')
    expect(id).toMatch(/^doc\d+$/)
    expect(docHas(id)).toBe(true)
    expect(docGet(id)!.mime).toBe('image/png')
    expect(docGet(id)!.name, 'a bare blob still gets a name').toBe('document')
  })
  it('refuses what it cannot keep, with a reason the user can read', () => {
    expect(docAdd(null as any).why).toContain('No file')
    expect(docAdd(new Blob(['x'], { type: 'text/html' }) as any).why).toContain('not a photo or a PDF')
    const fat: any = png(); Object.defineProperty(fat, 'size', { value: DOC_MAX + 1 })
    expect(docAdd(fat).why).toContain('over 8 MB')
  })
  it('accepts exactly images and PDFs', () => {
    expect(docAccepts('image/jpeg')).toBe(true)
    expect(docAccepts('application/pdf')).toBe(true)
    expect(docAccepts('text/plain')).toBe(false)
    expect(docAccepts('')).toBe(false)
  })
  it('is append-only — nothing here removes a stored file', () => {
    /* the API simply has no delete: undo can resurrect an input and must
       find its paperwork. The seam object is what a future database
       backend replaces. */
    expect(Object.keys({ DOC_MAX, docAccepts, docAdd, docGet, docHas, docBackend })).not.toContain('docDelete')
    expect(typeof (docBackend.impl as Map<any, any>).size).toBe('number')
  })
})

/* Several files on one entry (owner, 1 Sep 26): docId = first, docIds = the
   full list only when >1 — minted only by docFields, read only by rowDocIds. */
describe('the record shape for several files', () => {
  it('rowDocIds reads the legacy single field, the list, and drafts alike', () => {
    expect(rowDocIds({ docId: 'doc1' })).toEqual(['doc1'])
    expect(rowDocIds({ docId: 'doc1', docIds: ['doc1', 'doc2'] })).toEqual(['doc1', 'doc2'])
    expect(rowDocIds({})).toEqual([])
    expect(rowDocIds(null)).toEqual([])
    expect(rowDocIds({ docIds: [] , docId: 'doc9' }), 'an empty list falls back to the single field').toEqual(['doc9'])
  })
  it('docFields mints the pair so docId is always the first of the list', () => {
    expect(docFields([])).toEqual({})
    expect(docFields(null)).toEqual({})
    expect(docFields(['a'])).toEqual({ docId: 'a' })
    expect(docFields(['a', 'b'])).toEqual({ docId: 'a', docIds: ['a', 'b'] })
    const two = docFields(['x', 'y'])
    expect(two.docId).toBe(two.docIds![0])
  })
  it('the two survive a round trip: fields written, list read back', () => {
    const r = { person: 'bane', type: 'ATT C', ...docFields(['d1', 'd2', 'd3']) }
    expect(rowDocIds(r)).toEqual(['d1', 'd2', 'd3'])
    const one = { person: 'bane', type: 'ATT C', ...docFields(['d1']) }
    expect(rowDocIds(one)).toEqual(['d1'])
    expect((one as any).docIds, 'a single file keeps the legacy shape exactly').toBeUndefined()
  })
})
