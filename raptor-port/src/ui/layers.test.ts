/* THE THREE RULES THAT KEEP THE DESKTOP EDIT WEEK AT ~105 COMPOSITOR LAYERS
   (5 Sep 26 — docs/performance.md ledger 22; ui-contracts.md §Compositor
   layers). jsdom cannot count layers; this reads the stylesheet the way
   css-invalidation.test.ts does and pins the declarations the layer census
   found to matter: a filter on a palette puck (59 layers), an opacity on a
   preview day (47), and the roster aside stacking below the week's z-indexed
   pucks (44) each put the layers straight back. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./scheduler.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sels: m[1].split(',').map(s => s.trim()).filter(Boolean), body: m[2] }))
const withSel = (re: RegExp) => rules.filter(r => r.sels.some(s => re.test(s)))
const declares = (body: string, prop: string) => new RegExp('(^|[;\\s])' + prop + '\\s*:').test(body)

describe('compositor layers on the desktop edit week', () => {
  it('no palette-puck rule carries a filter (a filtered element can never share a layer)', () => {
    const bad = withSel(/\.rpuck/).filter(r => declares(r.body, 'filter'))
    expect(bad.map(r => r.sels.join(','))).toEqual([])
  })
  it('the faded palette pucks desaturate by a saturation blend instead', () => {
    for (const sel of ['.rpuck.busy .puck', '.rpuck.no .puck']) {
      const r = rules.filter(r => r.sels.includes(sel))
      expect(r.some(x => /background-blend-mode\s*:\s*saturation/.test(x.body)), sel).toBe(true)
    }
  })
  it('no preview-day rule carries an opacity (a translucent group can never share a layer); a veil dims it', () => {
    const self = withSel(/^\.day\.peek(:[a-z-]+(\([^)]*\))?)*$/)
    expect(self.filter(r => declares(r.body, 'opacity')).map(r => r.sels.join(','))).toEqual([])
    const veil = rules.filter(r => r.sels.includes('.day.peek::after'))
    expect(veil.some(r => /position\s*:\s*absolute/.test(r.body) && /pointer-events\s*:\s*none/.test(r.body))).toBe(true)
  })
  it('the sticky roster aside stacks above the week\'s z-indexed pucks', () => {
    const r = rules.filter(r => r.sels.includes('.edit-board .eroster') && /position\s*:\s*sticky/.test(r.body))
    expect(r.length).toBe(1)
    expect(/z-index\s*:\s*5(?![\d])/.test(r[0].body)).toBe(true)
  })
})
