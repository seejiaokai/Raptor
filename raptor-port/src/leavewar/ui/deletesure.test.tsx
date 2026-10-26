/* "DELETE — SURE?" ON TWO LINES INSIDE ITS BUTTON (his D1387, D1395 C — 26 Oct 26; [LW-DELETE-SURE-FIT]). The one Delete
   chip every Leave War window draws (SheetActions.tsx): asking, its words are two lines, "Delete —" over "sure?", the
   button growing taller, never wider. The fit itself is measured in a real browser by the walk (an iPhone's letters). */
import { render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { DeleteChip } from './SheetActions'

describe('the asking Delete (D1395 C)', () => {
  it('asking: two lines, its words whole', () => {
    render(<DeleteChip testid="d" armed onClick={() => {}} />)
    const b = screen.getByTestId('d')
    expect(b.classList.contains('armed')).toBe(true)
    expect([...b.querySelectorAll('.del-l')].map(s => s.textContent)).toEqual(['Delete —', 'sure?'])
    expect(b.textContent).toBe('Delete — sure?')
  })
  it('at rest: the one word, one line', () => {
    render(<DeleteChip testid="d" onClick={() => {}} />)
    expect(screen.getByTestId('d').classList.contains('armed')).toBe(false)
    expect(screen.getByTestId('d').textContent).toBe('Delete')
  })
  it('the sheet draws each half a block and lets the words wrap, in every window', () => {
    const css = readFileSync('src/leavewar/ui/bidpicker.css', 'utf8').replace(/\r\n/g, '\n')
    expect(css).toMatch(/\.bidsheet \.dchip\.del\.armed \{[^}]*white-space: normal/)
    expect(css).toMatch(/\.bidsheet \.dchip\.del\.armed \.del-l \{ display: block; \}/)
  })
})
