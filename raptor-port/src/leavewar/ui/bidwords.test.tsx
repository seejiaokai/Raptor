// A LEAVE REQUEST'S DOCUMENT AND REMARKS ON THE BID WINDOWS (owner D1210, D1226, D1150, D1159; M3 5.9, 5.10, 5.11).
// The store's half (words written with a bid, a re-typed bid keeping them, lw.reqmeta, the closed-day commit, approval
// carrying them) is pinned in leavewar/reqwords.test.ts; this file pins what the windows draw and send.
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { closeDates, initStore, recordsAt, setCell, setRole, setViewer } from '../state/store'
import type { RequestRec } from '../engine'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

const reqs = (pid: string, date: string) => recordsAt(pid, date).filter((r): r is RequestRec => r.kind === 'request')
const testids = (el: HTMLElement) => [...el.querySelectorAll('[data-testid]')].map(e => e.getAttribute('data-testid')!)
/** the window on an empty day, its approve tick off — what is placed stays a bid to read back */
function openEmpty(pid = 'dusk', date = '2026-02-11') {
  render(<Matrix />)
  fireEvent.click(screen.getByTestId(`cell-${pid}-${date}`))
  const sheet = screen.getByTestId('bid-picker')
  const tick = within(sheet).queryByTestId('bid-approve-tick')
  if (tick && (tick as HTMLInputElement).checked) fireEvent.click(tick)
  return sheet
}

describe('the rows on an empty day (5.9, 5.10)', () => {
  it('Date, Duration, Document, Remarks, Which leave — in that order', () => {
    const sheet = openEmpty()
    const labs = [...sheet.querySelectorAll('.bidsheet-row > .lab')].map(l => l.textContent)
    const at = (w: string) => labs.indexOf(w)
    expect(at('Date')).toBeLessThan(at('Duration'))
    expect(at('Duration')).toBeLessThan(at('Document'))
    expect(at('Document')).toBeLessThan(at('Remarks'))
    expect(at('Remarks')).toBeLessThan(at('Which leave'))
  })

  it('the box is empty, and the grey "till" date stands after it, ticked', () => {
    const sheet = openEmpty()
    expect((within(sheet).getByTestId('bid-remarks') as HTMLInputElement).value).toBe('')
    expect(within(sheet).getByTestId('bid-tilldate').textContent).toMatch(/^till 11 Feb/)
    expect((within(sheet).getByTestId('bid-till') as HTMLInputElement).checked).toBe(true)
  })

  it('unticked, the date is struck through; the bid placed carries the words and the tick', () => {
    const sheet = openEmpty()
    fireEvent.change(within(sheet).getByTestId('bid-remarks'), { target: { value: 'awaiting the form' } })
    fireEvent.click(within(sheet).getByTestId('bid-till'))
    expect(within(sheet).getByTestId('bid-tilldate').className).toContain('off')
    fireEvent.click(within(sheet).getByTestId('bid-LL'))
    expect(reqs('dusk', '2026-02-11')[0]).toMatchObject({ code: 'LL', remarks: 'awaiting the form', till: false })
  })

  it('a file picked first goes onto the bid; one dropped before the tap does not', () => {
    const sheet = openEmpty()
    const pick = sheet.querySelector('.docfield input[type="file"]') as HTMLInputElement
    const f = new File(['%PDF-1.4'], 'leave-form.pdf', { type: 'application/pdf' })
    fireEvent.change(pick, { target: { files: [f] } })
    expect(within(sheet).getByText('leave-form.pdf')).toBeTruthy()
    fireEvent.click(within(sheet).getByTestId('bid-LL'))
    expect(reqs('dusk', '2026-02-11')[0]?.docIds).toHaveLength(1)
  })

  it('a file dropped (✕) before the tap is not written', () => {
    const sheet = openEmpty('dusk', '2026-02-12')
    const pick = sheet.querySelector('.docfield input[type="file"]') as HTMLInputElement
    fireEvent.change(pick, { target: { files: [new File(['x'], 'a.pdf', { type: 'application/pdf' })] } })
    fireEvent.click(within(sheet).getByLabelText('Remove a.pdf'))
    fireEvent.click(within(sheet).getByTestId('bid-LL'))
    expect(reqs('dusk', '2026-02-12')[0]?.docIds).toBeUndefined()
  })
})

describe('on a day holding a bid — the rows speak for that bid, saved as they change', () => {
  it('shows its words, saves a changed remark when the box is left, the tick at once; Document then Remarks before Duration', () => {
    setCell('dusk', '2026-02-11', 'LL', { remarks: 'Bali' })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    const sheet = screen.getByTestId('bid-picker')
    const labs = [...sheet.querySelectorAll('.bidsheet-row > .lab')].map(l => l.textContent)
    expect(labs.indexOf('Selected')).toBeLessThan(labs.indexOf('Document'))
    expect(labs.indexOf('Remarks')).toBeLessThan(labs.indexOf('Duration'))
    const box = within(sheet).getByTestId('bid-remarks') as HTMLInputElement
    expect(box.value).toBe('Bali')
    fireEvent.change(box, { target: { value: 'Bali, then Lombok' } })
    expect(reqs('dusk', '2026-02-11')[0]?.remarks).toBe('Bali')          // nothing saved while typing
    fireEvent.blur(box)
    expect(reqs('dusk', '2026-02-11')[0]?.remarks).toBe('Bali, then Lombok')
    fireEvent.click(within(sheet).getByTestId('bid-till'))
    expect(reqs('dusk', '2026-02-11')[0]?.till).toBe(false)
  })

  it('re-typing the bid keeps its words (5.11)', () => {
    setCell('dusk', '2026-02-11', 'LL', { remarks: 'Tokyo', docIds: ['doc-x'] })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    const sheet = screen.getByTestId('bid-picker')
    const tick = within(sheet).queryByTestId('bid-approve-tick')
    if (tick && (tick as HTMLInputElement).checked) fireEvent.click(tick)
    fireEvent.click(within(sheet).getByTestId('bid-OL'))
    expect(reqs('dusk', '2026-02-11')[0]).toMatchObject({ code: 'OL', remarks: 'Tokyo', docIds: ['doc-x'] })
  })
})

describe('the member’s closed day (D1150, D1225)', () => {
  it('his own pending bid there offers Document and Remarks, and a remark saves on Enter', () => {
    setRole('member'); setViewer('dusk')
    setCell('dusk', '2026-02-11', 'LL')
    act(() => { setRole('admin'); closeDates('2026-01-01', '2026-12-31') })
    act(() => { setRole('member'); setViewer('dusk') })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    const sheet = screen.getByTestId('closed-note')
    expect(testids(sheet)).toContain('closed-doc-row')
    const box = within(sheet).getByTestId('closed-remarks')
    fireEvent.change(box, { target: { value: 'form attached' } })
    fireEvent.keyDown(box, { key: 'Enter' })
    expect(reqs('dusk', '2026-02-11')[0]).toMatchObject({ code: 'LL', state: 'pending', remarks: 'form attached' })
  })
  it('with nothing of his there, no rows', () => {
    act(() => { closeDates('2026-01-01', '2026-12-31') })
    act(() => { setRole('member'); setViewer('dusk') })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    expect(within(screen.getByTestId('closed-note')).queryByTestId('closed-doc-row')).toBeNull()
  })
})

describe('the drag-selection window', () => {
  it('one person: Document and Remarks, written with the fill; several: none', async () => {
    const { SelectSheet } = await import('./SelectSheet')
    const one = { people: ['dusk'], from: '2026-02-10', to: '2026-02-11', cells: [
      { personId: 'dusk', date: '2026-02-10' }, { personId: 'dusk', date: '2026-02-11' }] }
    const { unmount } = render(<SelectSheet sel={one as any} people={() => 'Dusk'} role="admin" canDecide={false}
      onDone={() => {}} onMove={() => {}} onClose={() => {}} />)
    const tick = screen.queryByTestId('sel-approve-tick')
    if (tick && (tick as HTMLInputElement).checked) fireEvent.click(tick)
    expect(screen.getByTestId('sel-tilldate').textContent).toMatch(/^till 11 Feb/)
    fireEvent.change(screen.getByTestId('sel-remarks'), { target: { value: 'Perth' } })
    fireEvent.click(screen.getByTestId('sel-LL'))
    expect(reqs('dusk', '2026-02-10')[0]?.remarks).toBe('Perth')
    expect(reqs('dusk', '2026-02-11')[0]?.remarks).toBe('Perth')
    unmount()
    const two = { people: ['dusk', 'ammo'], from: '2026-02-12', to: '2026-02-12', cells: [
      { personId: 'dusk', date: '2026-02-12' }, { personId: 'ammo', date: '2026-02-12' }] }
    render(<SelectSheet sel={two as any} people={id => id} role="admin" canDecide={false}
      onDone={() => {}} onMove={() => {}} onClose={() => {}} />)
    expect(screen.queryByTestId('sel-remarks')).toBeNull()
    expect(screen.queryByTestId('sel-doc-row')).toBeNull()
  })
})

describe('the day\u2019s list — each bid line carries its documents (7.3)', () => {
  it('a file picked on one bid\u2019s line is saved on that bid alone', () => {
    setCell('dusk', '2026-02-11', '*LL')
    setCell('dusk', '2026-02-11', 'OL*')
    render(<Matrix />)
    fireEvent.click(screen.getByTestId('cell-dusk-2026-02-11'))
    const sheet = screen.getByTestId('daylist-sheet')
    const [am, pm] = reqs('dusk', '2026-02-11')
    const box = within(sheet).getByTestId(`dl-doc-${am!.id}`)
    fireEvent.change(box.querySelector('input[type="file"]')!, { target: { files: [new File(['x'], 'form.pdf', { type: 'application/pdf' })] } })
    const now = reqs('dusk', '2026-02-11')
    expect(now.find(r => r.id === am!.id)?.docIds).toHaveLength(1)
    expect(now.find(r => r.id === pm!.id)?.docIds).toBeUndefined()
  })
})
