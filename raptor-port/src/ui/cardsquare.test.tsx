// @vitest-environment jsdom
/* EACH INPUT CARD'S SQUARE IN ITS KIND'S COLOUR (his D1384, D1396 — 26 Oct 26; [INP-CARD-SQUARE-COLOURS]). The square at the
   left of a card — on the Inputs calendar's opened day, the Inputs list and the OIL day list, all one InputCard — takes the
   colour the month's bar and the Leave War's box wear for that kind (inputscal-model colourOf): an absence filled, a duty or
   other commitment outlined. Before, every absence was red and every commitment amber. */
import { render } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { cardOf } from './inputcard-model'
import { InputCard } from './InputCard'

const sq = (type: string) => {
  const r = { iid: 'q-' + type, person: 'bane', type, date: 'Jul 13', yr: 2026, allday: true, remarks: '' }
  const { container } = render(<InputCard id={r.iid} tid="t" facts={cardOf([r])} when="all day" late="" onOpen={() => {}} />)
  return container.querySelector('.icard-sq')!.className
}

describe('the card square wears its kind’s colour (D1384)', () => {
  it('an absence filled in its kind’s colour — the same names the bars use', () => {
    expect(sq('OL')).toBe('icard-sq kd k-ol')
    expect(sq('LL')).toBe('icard-sq kd k-ll')
    expect(sq('ATT C')).toBe('icard-sq kd k-med')
    expect(sq('CSE')).toBe('icard-sq kd k-cse')
    expect(sq('OD')).toBe('icard-sq kd k-od')
  })
  it('a duty or other commitment outlined, as its bar is (D1321)', () => {
    expect(sq('Training')).toBe('icard-sq duty')
    expect(sq('Meeting')).toBe('icard-sq duty')
  })
  it('the stylesheet paints each from the one set of kind colours, after the old red and amber', () => {
    const css = readFileSync('src/ui/scheduler/25-inputs-calendar.css', 'utf8').replace(/\r\n/g, '\n')
    const at = css.indexOf('.icard .icard-sq.kd{'), old = css.indexOf('.icard.red .icard-sq{')
    expect(at).toBeGreaterThan(old)
    for (const k of ['ll', 'ol', 'oilt', 'care', 'med', 'cse', 'od']) expect(css).toContain(`.icard .icard-sq.k-${k}{--kc:var(--k-${k})}`)
  })
})
