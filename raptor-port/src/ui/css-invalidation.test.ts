/* THE STYLESHEET MAY NOT RESTYLE THE WHOLE PAGE ON A DRAG (3 Sep 26, the
   slow-computer cut). Measured on the built app by toggling each body class
   alone: `body.tdrag{touch-action:none;user-select:none}` made Blink recompute
   the style of EVERY element on the page (8,952 — a quarter-second on a slow
   laptop) at arm AND at drop, and `body.mdrag{cursor:grabbing}` half of it
   (4,822) — an inherited property set on body is re-resolved down the whole
   tree, wildcard or not. Both classes are JS state markers now with no
   declarations of their own (a class nothing matches costs nothing to
   toggle); the mouse cursor rides on the ghost. This pins the shape:
   · no `body.<state> *` / `html.<state> *` selector anywhere;
   · `body.tdrag` / `body.mdrag` never appear as a bare subject, only as the
     ancestor of a NAMED descendant (`body.tdrag .hscroll`);
   · the mouse ghost is the thing that carries the grabbing cursor. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('./scheduler.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')                       // comments explain the rule; only rules count

/* every rule as [selector, body], selectors split on commas */
const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ sels: m[1].split(',').map(s => s.trim()).filter(Boolean), body: m[2] }))
const selectors = rules.flatMap(r => r.sels)

describe('no root-class rule restyles every element', () => {
  it('has no `body.<class> *` or `html.<class> *` selector', () => {
    const bad = selectors.filter(s => /(?:^|\s)(?:body|html)\.[\w-]+(?:\.[\w-]+)*\s*(?:>\s*)?\*(?![\w-])/.test(s))
    expect(bad, 'universal-descendant rules keyed on a root class').toEqual([])
  })
  it('the drag state classes carry no declarations of their own', () => {
    const bare = selectors.filter(s => /^body\.(tdrag|mdrag)(?:[.:[][^\s]*)?$/.test(s))
    expect(bare, 'body.tdrag / body.mdrag as a bare subject').toEqual([])
    const asAncestor = selectors.filter(s => /^body\.(tdrag|mdrag)\s/.test(s))
    for (const s of asAncestor) expect(s, 'a drag-state rule names its descendant').toMatch(/^body\.(tdrag|mdrag)\s+[.#[\w]/)
  })
  it('the mouse ghost carries the grabbing cursor and is hit-testable', () => {
    /* the belt block lists .dragimg too (user-drag:none); the ghost's OWN rule is the one with the cursor */
    const ghost = rules.filter(r => r.sels.includes('.dragimg')).map(r => r.body)
    expect(ghost.length, '.dragimg rules').toBeGreaterThan(0)
    expect(ghost.some(b => /cursor:\s*grabbing/.test(b) && /pointer-events:\s*auto/.test(b)), 'hit-testable, grabbing cursor').toBe(true)
  })
})
