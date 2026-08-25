/* The SANS Availability CARD GRID (owner rework, 14 Aug 26) — one shared
   builder, sansCardsHTML in ui/html.ts, backs both the week's SANS group
   (sansSectionHTML) and the board's SANS panel (sbSansPanel in
   ui/board-html.ts). This file pins the shape both surfaces draw from it:
   ordering, the click-target's data-inpedit address, the empty state, and
   the ro/view-only carve-outs. String assertions only, same reason as
   palette.test.ts — jsdom has no layout engine in this repo. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { inpKey } from '../engine/slots'
import { esc } from '../state/view'
import { sansCardsHTML, sansSectionHTML } from './html'
import { sbSansPanel } from './board-html'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
})

const dt = () => DAYS[0].dt
/* a card wrapper's own opening tag — distinct from "sanscard-top" / "-l" /
   "-t" / "-r", which all share the "sanscard" prefix */
const cardCount = (html: string) => (html.match(/class="sanscard"/g) || []).length

describe('sansCardsHTML — the shared SANS card grid', () => {
  it('renders one card per record, on the week and the board, from the same records', () => {
    const rows = [
      { person: 'ipman', date: dt(), allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' },
      { person: 'romeo', date: dt(), allday: false, half: 'am', type: 'SANS Availability', sans: { o: true }, mod: 'now' },
    ]
    rows.forEach(r => INPUTS.push(r))
    const week = sansSectionHTML(DAYS[0], 0, true)
    const board = sbSansPanel(DAYS[0], 0)
    expect(cardCount(week)).toBe(2)
    expect(cardCount(board)).toBe(2)
    // both wear their own accent shell, but the card grid itself is identical markup
    expect(week).toContain('sec-sans')
    expect(board).toContain('sansav')
    expect(week).toContain('class="sanscards"')
    expect(board).toContain('class="sanscards"')
  })

  it('orders a bounded window first (earliest start), then all-day records by combo (F/O/A, F/O, F/A, O/A, F, O, A)', () => {
    INPUTS.push(
      // timed, out of input order on purpose — start times 600, 0 (AM), 721 (PM)
      { person: 'nick', date: dt(), allday: false, s: 600, e: 660, type: 'SANS Availability', sans: { f: true }, mod: 'now' },
      { person: 'waldo', date: dt(), allday: false, half: 'am', type: 'SANS Availability', sans: { o: true }, mod: 'now' },
      { person: 'bullet', date: dt(), allday: false, half: 'pm', type: 'SANS Availability', sans: { a: true }, mod: 'now' },
      // all-day, deliberately out of combo order
      { person: 'wrangler', date: dt(), allday: true, type: 'SANS Availability', sans: { o: true }, mod: 'now' },
      { person: 'cards', date: dt(), allday: true, type: 'SANS Availability', sans: { f: true, o: true, a: true }, mod: 'now' },
      { person: 'badger', date: dt(), allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' },
    )
    const rows = INPUTS.filter(i => i.type === 'SANS Availability')
    const html = sansCardsHTML(rows, 0)
    const order = [...html.matchAll(/data-person="([a-z_]+)"/g)].map(m => m[1])
    expect(order).toEqual(['waldo', 'nick', 'bullet', 'cards', 'badger', 'wrangler'])
  })

  it('a card carries the exact data-inpedit address inpEditLabel uses (esc(inpKey(inp)))', () => {
    const rec = { person: 'ipman', date: dt(), allday: true, type: 'SANS Availability', sans: { f: true }, remarks: 'keen', mod: 'now' }
    const html = sansCardsHTML([rec], 0)
    expect(html).toContain(`data-inpedit="${esc(inpKey(rec))}"`)
    expect(html).toContain('<button class="sanscard"')
  })

  it('ro cards carry no data-inpedit and render as a plain, non-interactive div', () => {
    const rec = { person: 'romeo', date: dt(), allday: true, type: 'SANS Availability', sans: { a: true }, mod: 'now' }
    const html = sansCardsHTML([rec], 0, true)
    expect(html).not.toContain('data-inpedit')
    expect(html).not.toContain('<button')
    expect(html).toContain('<div class="sanscard">')
  })

  it('an empty rows list renders nothing at all', () => {
    expect(sansCardsHTML([], 0)).toBe('')
  })
})

describe('sansSectionHTML — the week wrapper', () => {
  it('view-only (ed=false) renders no SANS section, even with records filed', () => {
    INPUTS.push({ person: 'ipman', date: dt(), allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' })
    expect(sansSectionHTML(DAYS[0], 0, false)).toBe('')
  })

  it('ed with no records filed renders nothing either — same as inGrp used to', () => {
    expect(sansSectionHTML(DAYS[0], 0, true)).toBe('')
  })

  it('ed with a record filed draws the accented section and a card', () => {
    INPUTS.push({ person: 'ipman', date: dt(), allday: true, type: 'SANS Availability', sans: { f: true }, mod: 'now' })
    const html = sansSectionHTML(DAYS[0], 0, true)
    expect(html).toContain('sec-sans')
    expect(html).toContain('SANS Avail')
    expect(cardCount(html)).toBe(1)
  })
})

describe("sbSansPanel — the board's SANS panel", () => {
  it("the empty state renders with zero records, no C6 header, no cards", () => {
    const html = sbSansPanel(DAYS[0], 0, [])
    expect(html).toContain('No SANS availability filed for this day.')
    expect(html).not.toContain('sb-acols c6r')
    expect(cardCount(html)).toBe(0)
  })

  it('draws the panel even with nothing filed — unlike the week, the board always shows a state', () => {
    const html = sbSansPanel(DAYS[0], 0, [])
    expect(html).toContain('sb-panel sansav')
    expect(html).toContain('SANS Avail')
  })

  it('editable panel points at pressing a card; read-only panel carries no such hint', () => {
    const ed = sbSansPanel(DAYS[0], 0, [])
    const ro = sbSansPanel(DAYS[0], 0, [], true)
    expect(ed).toContain('press a card to edit')
    expect(ro).not.toContain('press a card to edit')
  })
})
