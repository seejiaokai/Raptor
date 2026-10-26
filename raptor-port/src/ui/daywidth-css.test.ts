/* ON A PHONE THE OPENED DAY RUNS EDGE TO EDGE (his D1385, D1396 — 26 Oct 26; [INP-DAY-WIDTH]): the Inputs calendar's day,
   and the SANS calendar's alike, lose the window's side gaps and borders, its list padded as the Inputs list's cards (8px),
   so the cards stand where the list's do. The measure on a phone is the walk's; this pins the two rules. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = (f: string) => readFileSync(`src/ui/scheduler/${f}`, 'utf8').replace(/\r\n/g, '\n')
const phoneBlock = (s: string, cls: string) => {
  const at = s.lastIndexOf(`.floatwin.${cls}.rests{left:0;right:0`)
  return at < 0 ? '' : s.slice(s.lastIndexOf('@media (max-width:620px){', at), s.indexOf('\n}', at))
}

describe('the opened day edge to edge on a phone (D1385)', () => {
  for (const [file, cls] of [['25-inputs-calendar.css', 'inputsday'], ['24-sans-calendar.css', 'sansday']] as const) {
    it(`${cls}: no side gap or border, the list padded 8px`, () => {
      const b = phoneBlock(css(file), cls)
      expect(b, 'inside the phone rule').toContain('@media (max-width:620px){')
      expect(b).toContain('max-width:none;border-left-width:0;border-right-width:0')
      expect(b).toContain(`.${cls} .sd-list{padding-left:8px;padding-right:8px}`)
    })
  }
})
