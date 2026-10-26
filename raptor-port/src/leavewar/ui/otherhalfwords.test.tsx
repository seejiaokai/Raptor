/* WORDS GO TO THE BID THEY WERE TYPED FOR ([LW-NIGHT1025-OLDER] (a), the night's walker 2, INC-1, 25 Oct 26): on a day
   holding a pending MORNING bid with words, the one-day window opens on AM with those words in its box. PM pressed, words
   typed, a leave placed — the words landed on the morning bid ("Am" became "AmPm") and the new afternoon bid had none.
   The box speaks for the held bid only while Duration covers its half; on the other half it holds the new bid's words. */
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, rawState, setCell, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

const P = 'dusk'
const D = '2026-02-11'
const sheet = () => screen.getByTestId('bid-picker')
const reqs = () => (rawState().wars[0]!.recs[P]?.[D] ?? []).filter((x: any) => x.kind === 'request') as any[]
const offSwitch = () => { const t = within(sheet()).queryByTestId('bid-approve-tick'); if (t?.getAttribute('aria-checked') === 'true') fireEvent.click(t) }

beforeEach(() => {
  try { localStorage.clear() } catch { /* none */ }
  initStore(memoryBackend()); setRole('admin')
})

describe('the one-day window on a day holding a morning bid', () => {
  it('opens on AM with the morning bid’s words; PM pressed, the box is the new bid’s, empty', () => {
    expect(setCell(P, D, '*LL', { remarks: 'Am' })).toBe(true)
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    const box = () => within(sheet()).getByTestId('bid-remarks') as HTMLTextAreaElement
    expect(box().value).toBe('Am')
    fireEvent.click(within(sheet()).getByTestId('portion-pm'))
    expect(box().value, 'the afternoon’s box starts empty').toBe('')
  })

  it('words typed for the afternoon go with the afternoon bid; the morning keeps its own', () => {
    setCell(P, D, '*LL', { remarks: 'Am' })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    offSwitch()
    fireEvent.click(within(sheet()).getByTestId('portion-pm'))
    fireEvent.change(within(sheet()).getByTestId('bid-remarks'), { target: { value: 'Pm' } })
    fireEvent.click(within(sheet()).getByTestId('bid-OL'))
    const morning = reqs().find(r => r.code === '*LL'), afternoon = reqs().find(r => r.code === 'OL*')
    expect(morning?.remarks).toBe('Am')
    expect(afternoon?.remarks).toBe('Pm')
  })

  it('words typed on the morning, then PM pressed, stay on the morning bid', () => {
    setCell(P, D, '*LL', { remarks: 'Am' })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    fireEvent.change(within(sheet()).getByTestId('bid-remarks'), { target: { value: 'Am early' } })
    fireEvent.click(within(sheet()).getByTestId('portion-pm'))
    expect(reqs().find(r => r.code === '*LL')?.remarks).toBe('Am early')
  })

  it('Whole day still speaks for the morning bid (a whole day replaces it, its words carried)', () => {
    setCell(P, D, '*LL', { remarks: 'Am' })
    render(<Matrix />)
    fireEvent.click(screen.getByTestId(`cell-${P}-${D}`))
    fireEvent.click(within(sheet()).getByTestId('portion-full'))
    expect((within(sheet()).getByTestId('bid-remarks') as HTMLTextAreaElement).value).toBe('Am')
  })
})
