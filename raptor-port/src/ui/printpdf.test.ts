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

/* RB6 — the printed PDF carries a Rally column before Brief: the typed rally, never the default (D1026's requirement 6) */
describe('RB6 — the PDF prints the rally', () => {
  it('a Rally heading before Brief, and the typed rally in its cell', () => {
    const head = ['Day', 'Date', 'Wave', 'CS', 'Mission', 'Rally', 'Brief', 'TO', 'Land', 'FCP', 'FCP lvl', 'RCP', 'RCP lvl', 'Area', 'Area time', 'Rmks', 'Stores']
    const row = ['Mon', '13/07/2026', 'WAVE 1', 'VL', 'BFM', '10:10', '10:20', '12:40', '14:05', 'Saber', 'IP', 'Echo', 'IW', '', '', '', '']
    const html = schedPrintHTML([head, row], 'wk')
    expect(html).toMatch(/<th>CS \/ Mission<\/th><th>Rally<\/th><th>Brief<\/th>/)
    expect(html).toMatch(/<td class="t">10:10<\/td><td class="t">10:20<\/td><td class="t">12:40<\/td>/)
  })
})
