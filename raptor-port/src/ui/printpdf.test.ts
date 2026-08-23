// @vitest-environment jsdom
/* The PDF export's printable document. Only schedPrintHTML is pinned — the
   csvText precedent: the text is testable, the download half (the hidden
   iframe and the print dialog) is not, because jsdom implements no print
   machinery at all. No App render either — schedPrintHTML is pure over
   schedRows(), so initStore's seed is the whole boot it needs. */
import { beforeAll, describe, expect, it } from 'vitest'
import { initStore } from '../state/store'
import { schedRows } from './export'
import { schedPrintHTML } from './printpdf'

beforeAll(() => { initStore() })

describe('schedPrintHTML', () => {
  it('is a complete standalone document carrying every schedule row', () => {
    const rows = schedRows()
    const html = schedPrintHTML(rows, 'wk')
    expect(html.startsWith('<!doctype')).toBe(true)
    expect(html.endsWith('</html>')).toBe(true)
    expect(html).toContain('142 SQN — Flying Programme')
    expect(html).toContain('wk')
    /* header cells ride a <thead>, one <tr> per schedRows() row overall */
    expect(html).toContain('<th>Day</th>')
    expect(html).toContain('<th>Stores</th>')
    expect((html.match(/<tr/g) || []).length).toBe(rows.length)
  })

  it('escapes every cell — markup in a remark prints as text, never runs', () => {
    const html = schedPrintHTML([['A'], ['<b>x</b>']], 'w')
    expect(html).toContain('&lt;b&gt;')
    expect(html).not.toContain('<b>x')
  })
})
