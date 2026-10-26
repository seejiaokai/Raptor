/* ONE ENTRY OVER SEVERAL DAYS IS ONE JOINED BAR (his D1359, 25 Oct 26): next-door boxes of one entry carry `jr` (joined to the
   next day) and `jl` (to the day before); two next-door bids with different words stay two; a middle day holding a second
   entry breaks the bar; a half-day run joins top to top. Red first. */
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, setCell, setCellRange, setRole } from '../state/store'
import { memoryBackend } from '../state/storage'
import { Matrix } from './Matrix'

const P = 'dusk'
const box = (d: string) => screen.getByTestId(`cell-${P}-${d}`).querySelector('.c') as HTMLElement
const cls = (d: string) => ` ${box(d).className} `
beforeEach(() => { initStore(memoryBackend()); setRole('admin') })

describe('the joined bar (D1359)', () => {
  it('a three-day bid run: the first joins right, the middle both ways, the last left; the code once', () => {
    setCellRange(P, '2026-02-10', '2026-02-12', 'LL')
    render(<Matrix />)
    expect(cls('2026-02-10')).toContain(' jr ')
    expect(cls('2026-02-10')).not.toContain(' jl ')
    expect(cls('2026-02-11')).toMatch(/ jl .* jr | jr .* jl | jl jr /)
    expect(cls('2026-02-12')).toContain(' jl ')
    expect(cls('2026-02-12')).not.toContain(' jr ')
  })
  it('two next-door bids with different words stay two entries', () => {
    setCell(P, '2026-02-10', 'LL', { remarks: 'Wedding' })
    setCell(P, '2026-02-11', 'LL', { remarks: 'Family' })
    render(<Matrix />)
    expect(cls('2026-02-10')).not.toContain(' jr ')
    expect(cls('2026-02-11')).not.toContain(' jl ')
  })
  it('a half-day run joins top to top', () => {
    setCellRange(P, '2026-02-10', '2026-02-11', '*LL')
    render(<Matrix />)
    expect(cls('2026-02-10')).toContain(' top ')
    expect(cls('2026-02-10')).toContain(' jr ')
    expect(cls('2026-02-11')).toContain(' jl ')
  })
  it('a lone day joins nothing', () => {
    setCell(P, '2026-02-10', 'LL')
    render(<Matrix />)
    expect(cls('2026-02-10')).not.toMatch(/ j[lr] /)
  })
})
