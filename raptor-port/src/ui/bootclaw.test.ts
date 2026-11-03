// @vitest-environment jsdom
/* [TALON-LOADING-CLAW] (D1591, D1605) and [TALON-RENAME] (D1590, D1606). The claw itself — that it draws left, middle,
   right along each claw's own line, keeps moving while the app's code starts, and fades as the app arrives — is proved
   in real browsers, frame by frame, by scripts/handpass/talon-claw-build-frames.mjs; this pins the page that carries it
   and the way it is taken away. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOOTCLAW_FADE_MS, dismissBootClaw } from './bootclaw'

const page = readFileSync(join(__dirname, '../../index.html'), 'utf8')
const at = page.indexOf('THE LOADING CLAW')
const css = page.slice(page.indexOf('<style>', at), page.indexOf('</style>', at))

describe('the first page (index.html)', () => {
  it('carries the claw before the app, drawn from itself alone: no script, no outside file', () => {
    const claw = page.indexOf('id="bootclaw"'), root = page.indexOf('id="root"')
    expect(claw).toBeGreaterThan(0)
    expect(claw).toBeLessThan(root)
    const block = page.slice(claw, root)
    expect(block).not.toMatch(/<script|<img|<link|href=|src=/)
    // the logo's own three claws (ui/Login.tsx), each in its own window laid along it
    for (const d of ['M3 8 Q4.9 38.3 24 62 Q11.5 35.8 3 8 Z', 'M16 0 Q17.4 35.0 42 60 Q26.6 31.0 16 0 Z', 'M31 -2 Q36.4 23.5 58 38 Q42.9 19.1 31 -2 Z'])
      expect(block).toContain(d)
    expect(block.match(/class="w" id="bc-w\d"/g)).toHaveLength(3)
  })
  it('keeps the ruled timing: a 1.77 s round, shown from its first moment 0.2 s into it (D1615), still for less motion', () => {
    // every one of its seven animations starts 0.2 s into the round, so the first frame already shows two-thirds of the
    // left claw (the order's lesson 22); no 0.3 s wait hides it on a quick start any more (D1615 narrowing D1605)
    expect(css.match(/1\.77s linear -\.2s infinite/g)).toHaveLength(7)
    expect(css).not.toMatch(/linear \.3s/)
    expect(css).not.toContain('bc-wait')
    expect(css.match(/#bootclaw\{([^}]*)\}/)![1]).not.toContain('animation')
    expect(css).toMatch(/@media \(prefers-reduced-motion:reduce\)\{[\s\S]*#bootclaw \.cs,#bootclaw \.w,#bootclaw \.w svg\{animation:none\}/)
  })
  it('moves only by sliding and fading, which a browser keeps running while the app starts', () => {
    const frames = [...css.matchAll(/@keyframes [\w-]+\{([\s\S]*?)\}\}/g)].map(m => m[1])
    expect(frames).toHaveLength(7)   // three claws × (window, claw inside) and the fade; the 0.3 s wait's went with D1615
    const props = new Set(frames.flatMap(f => [...f.matchAll(/([a-z-]+):/g)].map(x => x[1])))
    props.delete('animation-timing-function')
    expect(props).toEqual(new Set(['opacity', 'transform']))
  })
  it('names the app TALON in the tab and under a home-screen icon', () => {
    expect(page).toContain('<title>TALON — 142 Flying Programme</title>')
    expect(page).toContain('<meta name="apple-mobile-web-app-title" content="TALON" />')
    expect(page).not.toMatch(/RAPTOR/)
  })
})

describe('taking the claw away', () => {
  afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); vi.unstubAllGlobals() })
  const mount = () => { document.body.innerHTML = '<div id="bootclaw"></div><div id="root"></div>'; return document.getElementById('bootclaw')! }

  it('fades it, then removes it, without waiting for its round', () => {
    vi.useFakeTimers()
    const el = mount()
    dismissBootClaw()
    expect(el.classList.contains('gone')).toBe(true)
    expect(document.getElementById('bootclaw')).not.toBeNull()
    vi.advanceTimersByTime(BOOTCLAW_FADE_MS)
    expect(document.getElementById('bootclaw')).toBeNull()
  })
  it('removes it at once for a reader who asked for less motion', () => {
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q === '(prefers-reduced-motion: reduce)' }))
    mount()
    dismissBootClaw()
    expect(document.getElementById('bootclaw')).toBeNull()
  })
  it('is safe twice, and with no claw on the page', () => {
    vi.useFakeTimers()
    mount()
    dismissBootClaw(); dismissBootClaw()
    vi.advanceTimersByTime(BOOTCLAW_FADE_MS)
    expect(document.getElementById('bootclaw')).toBeNull()
    expect(() => dismissBootClaw()).not.toThrow()
  })
})
