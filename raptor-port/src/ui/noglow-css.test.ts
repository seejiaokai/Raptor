// @vitest-environment node — reads the stylesheets off disk (the glowoff-css.test.ts shape)
/* NO MARK IN THIS APP GLOWS (owner D880–D882, D887, 15 Oct 26 — the design guide, `docs/design-practices.md` §4). A
   roll-call over EVERY stylesheet under src/, not a list of places: the version-3 read of the guide's wording found two
   glows the place-by-place list had missed, so the witness here is the whole set. Each `box-shadow` layer and each
   `filter: drop-shadow(…)` is read, and a layer is a glow when it lights its own colour round a thing:
     · blurred (a blur radius above 0) in a colour that is not near-black — a dark shadow that lifts a window, a menu or a
       dragged thing is depth, and stays;
     · or an outer, spread-only band in a see-through colour (a halo, blurred or not — D882's Rearrange halo, D887's
       bands) — an inset band, or an opaque one, is a line drawn as a shadow.
   The guide's one exception, the app's own sign (D887): the claw logo on the sign-in and access screens (`.lb-glyph`).
   The pan-time Tracker rules (`svg.perf …`) set `filter: none` and are not glows. jsdom paints nothing, so the files
   are the witness; the walk saw each place on screen. */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'

const SRC = fileURLToPath(new URL('..', import.meta.url))
const cssFiles = (dir: string): string[] => readdirSync(dir).flatMap(n => {
  const p = join(dir, n)
  return statSync(p).isDirectory() ? cssFiles(p) : n.endsWith('.css') ? [p] : []
})
const FILES = cssFiles(SRC)

type Rule = { file: string, sels: string, body: string }
const RULES: Rule[] = FILES.flatMap(file => {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m => ({ file: file.slice(SRC.length).replace(/\\/g, '/'), sels: m[1]!.trim().replace(/\s+/g, ' '), body: m[2]!.replace(/\s+/g, ' ') }))
})

/** the colour of a layer: [r, g, b, a], or null for a var()/keyword the scan cannot resolve */
function colourOf(layer: string): [number, number, number, number] | null {
  const rgba = layer.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)/)
  if (rgba) return [+rgba[1]!, +rgba[2]!, +rgba[3]!, rgba[4] === undefined ? 1 : +rgba[4]]
  const hex = layer.match(/#([0-9a-f]{3,8})\b/i)
  if (hex) {
    let h = hex[1]!
    if (h.length <= 4) h = [...h].map(c => c + c).join('')
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1]
  }
  return null
}
const nearBlack = (c: [number, number, number, number]) => Math.max(c[0], c[1], c[2]) <= 40
/** lengths of a layer, colours and keywords taken out: [x, y, blur, spread] */
const lengthsOf = (layer: string) => (layer.replace(/rgba?\([^)]*\)|#[0-9a-f]{3,8}\b|var\([^)]*\)/gi, '').replace(/\binset\b|!important/g, '')
  .match(/-?\d*\.?\d+(px|em|rem)?/g) || []).map(parseFloat)
const layersOf = (value: string) => value.split(/,(?![^(]*\))/).map(s => s.trim()).filter(Boolean)

const EXCEPT = new Set(['.lb-glyph']) // the app's own sign (D887)

function glowsIn(rule: Rule): string[] {
  if (EXCEPT.has(rule.sels)) return []
  const found: string[] = []
  for (const m of rule.body.matchAll(/box-shadow:\s*([^;]+)/g)) {
    for (const layer of layersOf(m[1]!)) {
      if (/^(none|var\(|inherit|initial|unset)/.test(layer)) continue
      const [, , blur = 0, spread = 0] = lengthsOf(layer), c = colourOf(layer), inset = /\binset\b/.test(layer)
      if (!c) continue
      if (blur > 0 && !nearBlack(c) && !inset) found.push(`blurred light "${layer}"`)
      else if (blur > 0 && !nearBlack(c) && inset && blur > 2) found.push(`light into it "${layer}"`)
      /* a halo is a BAND: 3px or wider (the ruled ones were 3–4px — Rearrange's, the docked panels', the dots'); a 1–2px
         see-through ring is a thin line drawn as a shadow (the picked list rows, the bid sheet's switch, an event chip),
         and a keyframe's fully transparent end is nothing at all — the line his D888 ("Leave them") settled */
      else if (!inset && blur === 0 && spread >= 3 && c[3] > 0 && c[3] < 0.5 && !nearBlack(c)) found.push(`a halo "${layer}"`)
    }
  }
  for (const m of rule.body.matchAll(/drop-shadow\(([^)]*\)?[^)]*)\)/g)) {
    const c = colourOf(m[1]!), [, , blur = 0] = lengthsOf(m[1]!)
    if (c && blur > 0 && !nearBlack(c)) found.push(`a drop-shadow "${m[1]}"`)
  }
  return found
}

describe('no mark in this app glows (D880–D882, D887)', () => {
  it('reads every stylesheet under src/', () => {
    expect(FILES.length, 'the scan found the stylesheets').toBeGreaterThan(30)
  })
  it('no rule lights its own colour round a thing — blurred, or as a see-through band', () => {
    const bad = RULES.flatMap(r => glowsIn(r).map(g => `${r.file} — ${r.sels}: ${g}`))
    expect(bad, bad.join('\n')).toEqual([])
  })
  it('the one exception is the app\'s own sign, and it still has its light', () => {
    expect(RULES.find(r => r.sels === '.lb-glyph')?.body ?? '').toMatch(/drop-shadow/)
  })
  it('the Rearrange button and Show SANS switch show "on" by the filter chip\'s look (D882)', () => {
    const on = RULES.filter(r => r.file.endsWith('leavewar/ui/matrix.css') && r.sels === '.rtbtn.on').map(r => r.body).join(' ')
    expect(on).toMatch(/background: rgba\(59, 198, 232, \.16\)/)
    expect(on).toMatch(/border-color: rgba\(59, 198, 232, \.6\)/)
    expect(on).toMatch(/color: var\(--accent\)/)
    expect(on).not.toMatch(/box-shadow/)
  })
  it('each place keeps its line (D881, D882, D887)', () => {
    const body = (file: string, sel: string) => RULES.filter(r => r.file.endsWith(file) && r.sels.split(',').map(s => s.trim()).includes(sel)).map(r => r.body).join(' ')
    expect(body('03-week.css', '.oktake')).toMatch(/outline:2px solid var\(--ok\)/)
    expect(body('matrix.css', '.mx-wrap .lw-bidbox')).toMatch(/border: 2px solid rgba\(74, 140, 100, \.80\)/)
    expect(body('matrix.css', '.mx tbody tr.me .who .whoedit .cs')).toMatch(/box-shadow: inset 0 0 0 1px var\(--accent\)/)
    expect(body('tracker.css', '.avail') + body('tracker.css', '.found')).not.toMatch(/drop-shadow/)
    expect(body('03-week.css', '.day.today')).toMatch(/border-color:rgba\(59,198,232,\.45\)/)
    expect(body('04-pucks-sections.css', '.puck.san::after')).toMatch(/linear-gradient[\s\S]*box-shadow:inset 0 0 1px #fff/)
    expect(body('matrix.css', '.mx tbody tr.dragover .who')).toMatch(/box-shadow: inset 0 3px 0 var\(--accent\);?\s*$/)
    expect(body('matrix.css', '.balbar')).toMatch(/border: 1\.5px solid var\(--accent\)[\s\S]*box-shadow: 0 18px 44px rgba\(0, 0, 0, \.7\)/)
    expect(body('02-shell.css', '.fastsync.on .dot')).toMatch(/background:var\(--ok\)/)
    expect(body('postout.css', '#page-admin .od-c i.g')).toMatch(/background:var\(--ok\)/)
  })
  it('the leftover Calendar-button style is gone (place 9)', () => {
    expect(RULES.filter(r => r.sels.includes('.calview'))).toEqual([])
  })
})
