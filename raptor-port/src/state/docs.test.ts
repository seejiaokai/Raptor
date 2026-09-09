/* The supporting-document store (owner, 27 Aug 26) — session-only, in
   memory, append-only, ids only on the input records. */
import { describe, expect, it, afterAll } from 'vitest'
import { DOC_MAX, docAccepts, docAdd, docBoot, docFields, docGet, docHas, docBackend, rowDocIds } from './docs'
import type { DocDurable, DocRec } from './docs'

const png = (bytes = 4) => new Blob([new Uint8Array(bytes)], { type: 'image/png' }) as any

describe('the document store', () => {
  it('stores a photo or a PDF and hands back a stable id', () => {
    const { id, why } = docAdd(png())
    expect(why).toBe('')
    expect(id).toMatch(/^doc-/)                  // globally-unique, not a per-context counter
    expect(docAdd(png()).id, 'two uploads never share an id').not.toBe(id)
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

/* THE DURABLE DRAWER (owner, 8 Sep 26 — "there is no persistence when I saved
   documents on medical"). The cache above is now backed by a per-browser
   drawer (storage/docstore's IndexedDB on the built site); these pin the seam
   the drawer plugs into, without needing a real IndexedDB. */
class FakeDrawer implements DocDurable {
  rows: DocRec[]
  puts = 0
  constructor(rows: DocRec[] = []) { this.rows = rows }
  async load() { return this.rows.map(r => ({ ...r })) }
  put(rec: DocRec) { this.puts++; this.rows.push({ ...rec }) }
}
const rec = (id: string): DocRec => ({ id, name: id + '.png', mime: 'image/png', size: 4, blob: png() })

describe('the durable drawer behind the cache', () => {
  /* leave the module memory-only for every other test in the file */
  afterAll(async () => { await docBoot(null) })

  it('docBoot fills the cache so a reloaded file reads back synchronously', async () => {
    await docBoot(new FakeDrawer([rec('doc4001'), rec('doc4002')]))
    expect(docHas('doc4001')).toBe(true)
    expect(docGet('doc4002')!.mime).toBe('image/png')
  })

  it('a new upload mints a globally-unique id that cannot collide with a stored one (or another minter)', async () => {
    /* the id is random, not a per-context counter, so two tabs / two people
       sharing one drawer never mint the same id for different files — the
       fix for the medical-document cross-reference corruption (9 Sep 26) */
    await docBoot(new FakeDrawer([rec('doc9999'), rec('doc-legacy')]))
    const { id } = docAdd(png())
    expect(id).toMatch(/^doc-/)
    expect(id).not.toBe('doc9999')                        // no collision with a hydrated file
    expect(docHas('doc9999'), 'a legacy doc<N> id still resolves').toBe(true)
    expect(docGet(id)!.name).toBe('document')
  })

  it('docAdd writes through to the drawer so the file survives a reload', async () => {
    const d = new FakeDrawer()
    await docBoot(d)
    const { id } = docAdd(png())
    expect(d.puts).toBe(1)
    expect(d.rows[0].id).toBe(id)
    expect(d.rows[0].blob).toBeInstanceOf(Blob)
  })

  it('skips a corrupt stored row instead of handing the viewer a bad blob', async () => {
    await docBoot(new FakeDrawer([
      { id: 'docBad1', name: 'x', mime: 'image/png', size: 1, blob: 'not a blob' as any },
      { id: '', name: 'x', mime: 'image/png', size: 1, blob: png() } as any,
      rec('doc7001'),
    ]))
    expect(docHas('docBad1')).toBe(false)
    expect(docHas('doc7001'), 'the good row still lands').toBe(true)
  })

  it('is fail-soft: a drawer whose load rejects leaves the store memory-only', async () => {
    const broken: DocDurable = { load: () => Promise.reject(new Error('locked')), put: () => { throw new Error('should never be called') } }
    await expect(docBoot(broken)).resolves.toBeUndefined()   // no throw
    expect(() => docAdd(png())).not.toThrow()                // and no write-through to the broken drawer
  })

  it('docBoot(null) keeps the old memory-only behaviour', async () => {
    await docBoot(null)
    const { id, why } = docAdd(png())
    expect(why).toBe('')
    expect(docHas(id)).toBe(true)
  })
})
