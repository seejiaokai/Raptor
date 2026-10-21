/* THE APP'S ONE PENCIL (owner D1134, 21 Oct 26 — "can u make sure u use the same icon designs i like this pencil
   better"): every pencil a person presses is the one drawing in ui/pen.ts (the Tracker's copy in Glyphs.jsx), never a
   typed ✎ or the ✏ emoji. Two places keep the typed ✎ on purpose — inside a sentence of help text and after an edited
   chart's name in the Tracker's Syllabus list (a list's option holds text only) — and neither sits right after a tag. */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PEN_INNER, penSvg } from './pen'

const src = (f: string) => readFileSync(join(__dirname, f), 'utf8')
/* the source without its comments (which name the old marks freely), and without the one kept on purpose: the ✎ after an
   edited chart's name in the Tracker's Syllabus list (an <option> holds text only — D1134) */
const KEPT = "(core.sylHasOwnDef(id) ? ' ✎' : '')"
const code = (f: string) => src(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').split(KEPT).join('')
/* a typed pencil printed as a button's own mark: right after a tag's ">" (JSX or a markup string), or the escaped one —
   or opening a quoted label ('✎ Text', '✎ Edit chart layout': the forms a ternary or a tool list printed, the code read of
   21 Oct 26, finding 4) */
const PRINTED = />\s*(?:[✎✏]|\\u270[ef])|['"`]\s*[✎✏]/u

describe('one pencil (D1134)', () => {
  it('is solid and turned so its tip points to the bottom right (D1133)', () => {
    expect(PEN_INNER).toContain('rotate(-45 12 12)')
    expect(PEN_INNER).toContain('fill="currentColor"')
    expect(PEN_INNER, 'no stroke: a filled pencil, not a line drawing').not.toMatch(/stroke/)
    expect(penSvg()).toContain('class="pen-ic"')
    expect(penSvg(true)).toContain('class="pen-ic solo"')
  })
  it('no screen prints a typed ✎ or ✏ as a button\'s mark', () => {
    for (const f of ['board.ts', 'interactions.ts', 'QualsPage.tsx', 'LogicPage.tsx', 'SchedBoard.tsx', 'InputsPage.tsx',
      'InputsCal.tsx', 'inputedit.tsx', '../tracker/components/Header.jsx', '../tracker/components/Pop.jsx',
      '../tracker/components/SidePanel.jsx', '../tracker/components/ArrangeTools.jsx', '../tracker/App.jsx'])
      expect(PRINTED.test(code(f)), f + ' prints no typed pencil').toBe(false)
  })
  it('the Tracker draws the same pencil as the rest of the app', () => {
    const shapes = (s: string) => [...s.matchAll(/<(rect|path)\b[^>]*?\/?>/g)].map(m => m[0].replace(/\s*\/?>$/, '').replace(/\s+/g, ' '))
    const glyphs = src('../tracker/components/Glyphs.jsx')
    const tracker = glyphs.slice(glyphs.indexOf('export const PenGlyph'), glyphs.indexOf('export const ReorderGlyph'))
    expect(shapes(tracker)).toEqual(shapes(PEN_INNER))
    expect(tracker).toContain('rotate(-45 12 12)')
  })
})
