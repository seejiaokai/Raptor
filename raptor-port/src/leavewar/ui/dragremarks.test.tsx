/* THE DRAG WINDOW'S REMARKS OVER SEPARATE ENTRIES (his D1347, D1362 — "A grey line each", 25 Oct 26; drawn in
   docs/img/handpass/2026-10-25-lw-drawings/drag-remarks/): over one man's days holding separate entries with different
   remarks, each entry's remark is a grey line with its dates above an empty box; an entry with no remark is not listed;
   over one entry the box shows its words. Red first. */
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, setCell, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { SelectSheet } from './SelectSheet'

const P = 'dusk'
const sel = (dates: string[]) => ({ people: [P], from: dates[0]!, to: dates[dates.length - 1]!, cells: dates.map(date => ({ personId: P, date })) })
const mount = (dates: string[]) => render(<SelectSheet sel={sel(dates)} people={id => id} role="admin" canDecide onDone={() => {}} onMove={() => {}} onClose={() => {}} />)

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

describe('the drag window over separate entries (D1362)', () => {
  it('two entries with different remarks: a grey line each, with its dates, and the box empty', () => {
    setCell(P, '2026-02-09', 'LL', { remarks: 'Wedding' })
    setCell(P, '2026-02-10', 'LL', { remarks: 'Wedding' })
    setCell(P, '2026-02-11', 'LL', { remarks: 'Family' })
    mount(['2026-02-09', '2026-02-10', '2026-02-11'])
    expect(screen.getAllByTestId('sel-remark-line').map(e => e.textContent)).toEqual(['“Wedding” · 9–10 Feb', '“Family” · 11 Feb'])
    expect((screen.getByTestId('sel-remarks') as HTMLTextAreaElement).value).toBe('')
  })
  it('an entry with no remark is not listed', () => {
    setCell(P, '2026-02-09', 'LL', { remarks: 'Wedding' })
    setCell(P, '2026-02-11', 'OL')
    mount(['2026-02-09', '2026-02-10', '2026-02-11'])
    expect(screen.getAllByTestId('sel-remark-line').map(e => e.textContent)).toEqual(['“Wedding” · 9 Feb'])
  })
  it('over one entry the box shows its words, and no line is drawn', () => {
    setCell(P, '2026-02-09', 'LL', { remarks: 'Wedding' })
    setCell(P, '2026-02-10', 'LL', { remarks: 'Wedding' })
    mount(['2026-02-09', '2026-02-10'])
    expect(screen.queryByTestId('sel-remarks-list')).toBeNull()
    expect((screen.getByTestId('sel-remarks') as HTMLTextAreaElement).value).toBe('Wedding')
  })
  /* the M3 code read's Q11 (25 Oct 26): two separate entries with the SAME words drew no grey line (D1362 lists different
     remarks) and an empty box — the words were nowhere. They are one set of words, so the box shows them, as over one entry */
  it('two separate entries with the same words: the box shows them, and no line is drawn', () => {
    setCell(P, '2026-02-09', 'LL', { remarks: 'Wedding' })
    setCell(P, '2026-02-11', 'OL', { remarks: 'Wedding' })
    mount(['2026-02-09', '2026-02-10', '2026-02-11'])
    expect(screen.queryByTestId('sel-remarks-list')).toBeNull()
    expect((screen.getByTestId('sel-remarks') as HTMLTextAreaElement).value).toBe('Wedding')
  })
})
