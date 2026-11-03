// @vitest-environment jsdom
/* [TALON-CLAW-PAGES] (D1607, D1610, D1611): the loading claw over a slow page is the start-up claw itself — the same
   three claws in the same windows, drawn by index.html's own rules — laid over the page area from the tap, and it goes
   the moment its page arrives (a 0.2 s fade) or at once when he leaves first. How it moves on a real phone is walked frame by frame in real
   browsers (scripts/handpass/talon-page-blank.mjs and the walk); this pins the pieces. */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BOOTCLAW_FADE_MS } from './bootclaw'
import { PAGECLAW_PATHS, PAGECLAW_QUICK_MS, PAGECLAW_WAIT_MAX_MS, PageClaw, dismissPageClaw, dismissWhenDrawn, raisePageClaw } from './pageclaw'
import { setPage } from '../state/view'

const page = readFileSync(join(__dirname, '../../index.html'), 'utf8')
const at = page.indexOf('THE LOADING CLAW')
const css = page.slice(page.indexOf('<style>', at), page.indexOf('</style>', at))

describe('the page claw is the start-up claw', () => {
  it('draws the logo\'s same three claws, in the same order as the start-up claw', () => {
    const boot = [...page.slice(page.indexOf('id="bootclaw"'), page.indexOf('id="root"')).matchAll(/<path class="c" d="([^"]+)"/g)].map(m => m[1])
    expect(PAGECLAW_PATHS).toEqual(boot)
  })
  it('shares every one of the start-up claw\'s rules — one definition, nothing more to download', () => {
    for (const sel of ['.mk', '.cs', '.w', '.w svg', '.c']) expect(css).toContain(`#bootclaw ${sel},.pgclaw ${sel}{`)
    for (const i of [0, 1, 2]) {
      expect(css).toContain(`#bc-w${i},.pgclaw .pw${i}{`)
      expect(css).toContain(`#bc-w${i} svg,.pgclaw .pw${i} svg{`)
    }
    expect(css).toContain('#bootclaw.gone,.pgclaw.gone{')
    expect(css).toContain('.pgclaw .cs,.pgclaw .w,.pgclaw .w svg,#bootclaw .cs,#bootclaw .w,#bootclaw .w svg{animation:none}')
  })
  it('covers the page area under the top bar and draws from the tap, with no 0.3 s wait (D1611), and fades', () => {
    const rule = css.match(/\.pgclaw\{([^}]*)\}/)![1]
    expect(rule).toContain('top:var(--topbar-h')
    expect(rule).not.toContain('bc-wait')
    expect(rule).toContain('transition:opacity .2s ease-out')
    // the shared rules start every animation 0.2 s into its round, for both claws (D1611, D1615), so the left claw is
    // already 66% drawn in the first frame (his iPhone recording, 3 Nov 26: from the very start it drew almost nothing for
    // 0.1 s, a dark page); no separate rule for the page claw, no wait for either
    expect(css.match(/1\.77s linear -\.2s infinite/g)).toHaveLength(7)
    expect(css).not.toMatch(/animation-delay/)
    expect(css).not.toContain('pgclaw.now')
    // under the top bar (z-index 60), so the bar stays in view and in reach
    expect(Number(rule.match(/z-index:(\d+)/)![1])).toBeLessThan(60)
  })
  it('is built with the same windows, one a claw', () => {
    const el = raisePageClaw('leavewar')
    expect(el.querySelectorAll('.w')).toHaveLength(3)
    expect([0, 1, 2].map(i => el.querySelector(`.pw${i} path`)!.getAttribute('d'))).toEqual(PAGECLAW_PATHS)
    expect(el.getAttribute('aria-label')).toBe('TALON is loading')
    el.remove()
  })
})

describe('taking the page claw away', () => {
  afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); vi.unstubAllGlobals(); setPage('viewsched') })

  it('fades over the page that has arrived, then goes', () => {
    vi.useFakeTimers()
    const el = raisePageClaw('leavewar')
    vi.advanceTimersByTime(PAGECLAW_QUICK_MS + 50)
    dismissPageClaw(el, true)
    expect(el.classList.contains('gone')).toBe(true)
    expect(el.isConnected).toBe(true)
    vi.advanceTimersByTime(BOOTCLAW_FADE_MS)
    expect(el.isConnected).toBe(false)
  })
  it('goes at once, no fade, when its page arrives within its first 0.2 s — no dark veil over a quick page', () => {
    vi.useFakeTimers()
    const el = raisePageClaw('tracker')
    vi.advanceTimersByTime(PAGECLAW_QUICK_MS - 50)
    dismissPageClaw(el, true)
    expect(el.isConnected).toBe(false)
  })
  it('goes at once when he left before the page arrived, or asked for less motion', () => {
    vi.useFakeTimers()
    const a = raisePageClaw('leavewar')
    vi.advanceTimersByTime(PAGECLAW_QUICK_MS + 50)
    dismissPageClaw(a, false)
    expect(a.isConnected).toBe(false)
    vi.stubGlobal('matchMedia', (q: string) => ({ matches: q === '(prefers-reduced-motion: reduce)' }))
    const b = raisePageClaw('leavewar')
    vi.advanceTimersByTime(PAGECLAW_QUICK_MS + 50)
    dismissPageClaw(b, true)
    expect(b.isConnected).toBe(false)
  })
  it("a page that draws after it appears (the Tracker's chart) keeps the claw until that drawing is there", async () => {
    vi.useFakeTimers()
    setPage('tracker')
    const el = raisePageClaw('tracker')
    vi.advanceTimersByTime(PAGECLAW_QUICK_MS + 50)
    dismissWhenDrawn(el, 'tracker', '#board *')
    vi.advanceTimersByTime(100)
    expect(el.isConnected && !el.classList.contains('gone')).toBe(true)
    document.body.insertAdjacentHTML('beforeend', '<div id="board"><svg></svg></div>')
    await Promise.resolve()   // the page's drawing is noticed the moment it is added, no timer needed
    expect(el.classList.contains('gone')).toBe(true)
    vi.advanceTimersByTime(BOOTCLAW_FADE_MS)
    expect(el.isConnected).toBe(false)
  })
  it('never waits longer than its cap, and goes at once if he leaves meanwhile', () => {
    vi.useFakeTimers()
    setPage('tracker')
    const a = raisePageClaw('tracker')
    vi.advanceTimersByTime(PAGECLAW_QUICK_MS + 50)
    dismissWhenDrawn(a, 'tracker', '#never-drawn')
    vi.advanceTimersByTime(PAGECLAW_WAIT_MAX_MS - 50)
    expect(a.classList.contains('gone')).toBe(false)
    vi.advanceTimersByTime(150)   // the cap is looked at every 0.1 s
    expect(a.classList.contains('gone')).toBe(true)
    const b = raisePageClaw('tracker')
    vi.advanceTimersByTime(PAGECLAW_QUICK_MS + 50)
    dismissWhenDrawn(b, 'tracker', '#never-drawn')
    setPage('inputs')
    vi.advanceTimersByTime(120)
    expect(b.isConnected).toBe(false)
  })
  it('stands while its placeholder is shown and goes with it: fading if its page is on screen, at once if not', async () => {
    vi.useFakeTimers()
    const host = document.createElement('div'); document.body.appendChild(host)
    const root = createRoot(host)
    setPage('leavewar')
    await act(async () => { root.render(<PageClaw page="leavewar" />) })
    const el = document.querySelector('.pgclaw') as HTMLElement
    expect(el).not.toBeNull()
    vi.advanceTimersByTime(PAGECLAW_QUICK_MS + 50)
    await act(async () => { root.render(<></>) })
    expect(el.classList.contains('gone')).toBe(true)
    vi.advanceTimersByTime(BOOTCLAW_FADE_MS)
    expect(document.querySelector('.pgclaw')).toBeNull()

    await act(async () => { root.render(<PageClaw page="leavewar" />) })
    setPage('inputs')
    await act(async () => { root.render(<></>) })
    expect(document.querySelector('.pgclaw')).toBeNull()
    await act(async () => { root.unmount() })
  })
})
