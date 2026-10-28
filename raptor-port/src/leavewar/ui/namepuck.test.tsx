/* The Leave War's names drawn as the schedule's own puck (his D1468–D1471, D1476 — 28 Oct 26, [LW-NAME-PUCKS]):
   the name and its chip are ONE puck — `.puck` holding `.nm` and the chip as its `.role` square end — in the schedule's
   seat colours (a WSO's puck `.r`, ground personnel's `.pers`); an OCU man's chip reads "O", ground personnel's "G".
   The chip keeps its own colour and its tap that lists his qualifications; the name still opens his window. Both places
   the grid draws a name — the row and the phone's frozen copy of it — draw the same puck. */
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { addGroup, getState, initStore, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

beforeEach(() => {
  initStore(memoryBackend())
  const st = getState() as any
  const base = st.people[0]
  st.people.push({ ...base, id: 'ocu_t', callsign: 'NEWBIE', q: 'OCU', seat: 'pilot', sxo: false, pers: false })
  st.people.push({ ...base, id: 'wso_t', callsign: 'BACKSEAT', q: 'C', seat: 'wso', sxo: false, pers: false })
  st.people.push({ ...base, id: 'gnd_t', callsign: 'RIGGER', pers: true, seat: 'gnd', sxo: false, scd: false, scn: false, xq: [] })
})

const puckOf = (id: string) => within(screen.getByTestId(`row-${id}`)).getByTestId(`person-${id}`).querySelector('.puck') as HTMLElement

describe('the Leave War grid draws each name as the schedule\'s puck (D1468, D1471)', () => {
  it('the name and its chip are one puck: the name its .nm, the chip its .role end', () => {
    render(<Matrix />)
    const pk = puckOf('tata')
    expect(pk).toBeTruthy()
    expect(pk.querySelector('.nm')!.textContent).toBe('TATA')
    const chip = within(screen.getByTestId('row-tata')).getByTestId('cat-tata')
    expect(chip.parentElement).toBe(pk)
    expect(chip.classList.contains('role')).toBe(true)
    expect(chip.textContent).toBe('IP')
    // the old separate bar and badge are gone
    expect(screen.getByTestId('row-tata').querySelector('.cs')).toBeNull()
    expect(screen.getByTestId('row-tata').querySelector('.catchip')).toBeNull()
  })

  it('a pilot\'s puck is the schedule\'s plain puck, a WSO\'s is `.r`, ground personnel\'s is `.pers` (D1476)', () => {
    render(<Matrix />)
    expect(puckOf('tata').className).toBe('puck')
    expect(puckOf('wso_t').classList.contains('r')).toBe(true)
    expect(puckOf('gnd_t').classList.contains('pers')).toBe(true)
  })

  it('an OCU man\'s chip reads "O" in the OCU colour (D1469)', () => {
    render(<Matrix />)
    const chip = within(screen.getByTestId('row-ocu_t')).getByTestId('cat-ocu_t')
    expect(chip.textContent).toBe('O')
    expect(chip.classList.contains('q-ocu')).toBe(true)
  })

  it('ground personnel\'s chip reads "G" (D1470)', () => {
    render(<Matrix />)
    const chip = within(screen.getByTestId('row-gnd_t')).getByTestId('cat-gnd_t')
    expect(chip.textContent).toBe('G')
    expect(chip.classList.contains('q-pers')).toBe(true)
  })

  it('the chip keeps its colour and its tap that lists his qualifications; the name still opens his window', () => {
    setRole('admin')
    addGroup({ id: 'q:scDay', kind: 'qual', k: 'scDay' })
    render(<Matrix />)
    expect(within(screen.getByTestId('row-ramp')).getByTestId('cat-ramp').classList.contains('q-sxo')).toBe(true)
    const chip = within(screen.getByTestId('row-tata')).getByTestId('cat-tata')
    fireEvent.click(chip)
    expect(screen.getByTestId('qualpop').textContent).toContain('SC DAY')
    expect(screen.queryByTestId('person-figures')).toBeNull()
    fireEvent.click(chip)   // a second tap closes it
    expect(screen.queryByTestId('qualpop')).toBeNull()
    fireEvent.click(puckOf('tata').querySelector('.nm')!)
    expect(screen.queryByTestId('qualpop')).toBeNull()
    expect(screen.getByTestId('person-figures'), 'the name opens his window').toBeTruthy()
  })

  it('the phone\'s frozen copy of a row draws the same puck', () => {
    // the frozen copy is drawn on a phone only (frozencols.test.tsx's way of saying "a phone")
    const was = window.matchMedia
    window.matchMedia = ((q: string) => ({ matches: q === '(max-width: 700px)', media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false } })) as unknown as typeof window.matchMedia
    try {
      render(<Matrix />)
      const band = document.querySelector('[data-band-id="ocu_t"]')
      expect(band, 'the frozen copy drew the OCU man').toBeTruthy()
      const pk = band!.querySelector('.puck')!
      expect(pk.querySelector('.nm')!.textContent).toBe('NEWBIE')
      expect(pk.querySelector('.role')!.textContent).toBe('O')
      expect(band!.querySelector('.cs, .catchip')).toBeNull()
    } finally { window.matchMedia = was }
  })
})
