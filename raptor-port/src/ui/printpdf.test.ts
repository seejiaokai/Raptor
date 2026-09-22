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
  it('is a complete standalone report, grouped by day, carrying every flying line', () => {
    const rows = schedRows()
    const html = schedPrintHTML(rows, 'wk')
    expect(html.startsWith('<!doctype')).toBe(true)
    expect(html.endsWith('</html>')).toBe(true)
    expect(html).toContain('142 — Flying Programme')
    expect(html).toContain('wk')
    expect(html).toContain('RESTRICTED')                 // the agency-report marking (owner, 16 Sep 26)
    expect(html).toContain('<th>Remarks</th>')           // the report's own column headers
    expect(html).toContain('<th>Stores</th>')
    /* one tbody <tr> per flying line (every schedRows row except the header),
       spread across the per-day tables */
    const bodyTrs = (html.match(/<tbody>[\s\S]*?<\/tbody>/g) || []).join('').match(/<tr>/g) || []
    expect(bodyTrs.length).toBe(rows.length - 1)
  })

  it('escapes every cell — markup in a remark prints as text, never runs', () => {
    const html = schedPrintHTML([['A'], ['<b>x</b>']], 'w')
    expect(html).toContain('&lt;b&gt;')
    expect(html).not.toContain('<b>x')
  })
})
