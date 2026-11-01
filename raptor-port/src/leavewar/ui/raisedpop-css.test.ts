// @vitest-environment node — reads stylesheets off disk; under the project's jsdom default `import.meta.url` is not a file: URL
/* THE APP'S POP-UPS STAND ABOVE A RAISED LEAVE WAR WINDOW (the fresh read of his find of 2 Nov 26, finding 1 — the document
   viewer's Close). A blocking Leave War window opened while a window that leaves the grid working is up (the person window,
   the Inputs "Calendar") is RAISED above it (Sheet.tsx `over`: its veil at 480, the window at 481 — bidpicker.css). The app's
   pop-ups — the document viewer its document chip opens (460), the OIL question and its kin (470), "No document" (472) —
   were drawn UNDER it: the viewer half hidden behind the bid window, and its Close, pressed, landing on the veil, which closed
   the bid window and left the viewer up (walked: `lw-nb-docclose.mjs` R9, red on the build before). While a raised window is
   up they stand above it, each keeping its order among the others. jsdom cannot stack layers, so this pins the stylesheet's
   half (as boxcorners-css.test.ts does); the walk measures what stands under the Close's middle. */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const strip = (s: string) => s.replace(/\r\n/g, '\n').replace(/\/\*[\s\S]*?\*\//g, '')
const lw = strip(readFileSync(new URL('./bidpicker.css', import.meta.url), 'utf8'))
const app = strip(readFileSync(new URL('../../ui/scheduler/08-windows-tools.css', import.meta.url), 'utf8')) + strip(readFileSync(new URL('../../ui/scheduler/14-input-editors.css', import.meta.url), 'utf8'))

const zOf = (css: string, sel: string): number | null => {
  const re = new RegExp(`(?:^|[}\\s,])${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^{}]*)\\}`, 'm')
  const m = css.match(re)
  const z = m && m[1]!.match(/z-index\s*:\s*(\d+)/)
  return z ? Number(z[1]) : null
}
/* the Leave War's file wraps everything in `#page-leavewar { … }` (native nesting); a pop-up lives on <body>, outside that
   page, so its rule must stand OUTSIDE the wrapper — inside, it would read `#page-leavewar body:has(…) .airpop` and match nothing */
const outsideWrapper = (sel: string): boolean => {
  const at = lw.indexOf(sel)
  if (at < 0) return false
  let depth = 0
  for (let i = 0; i < at; i++) { if (lw[i] === '{') depth++; else if (lw[i] === '}') depth-- }
  return depth === 0
}

describe('the app’s pop-ups over a raised Leave War window', () => {
  const raisedWin = zOf(lw, '.bidsheet.raised')!
  it('reads the raised window’s own layer (481) and the pop-ups’ own (460, 470, 472)', () => {
    expect(raisedWin).toBe(481)
    expect(zOf(app, '.airpop')).toBe(460)
    expect(zOf(app, '.airpop.upconf-pop')).toBe(470)
    expect(zOf(app, '.airpop.docconf-pop')).toBe(472)
  })
  it('while a raised window is up, every pop-up stands above it, in the same order among themselves', () => {
    const v = zOf(lw, 'body:has(.bidsheet.raised) .airpop')
    const q = zOf(lw, 'body:has(.bidsheet.raised) .airpop.upconf-pop')
    const d = zOf(lw, 'body:has(.bidsheet.raised) .airpop.docconf-pop')
    expect(v, 'the document viewer and every plain pop-up').toBeGreaterThan(raisedWin)
    expect(q!).toBeGreaterThan(v!)
    expect(d!).toBeGreaterThan(q!)
  })
  it('the rules stand outside the page’s wrapper, where a pop-up on <body> can match them', () => {
    expect(outsideWrapper('body:has(.bidsheet.raised) .airpop')).toBe(true)
  })
})
