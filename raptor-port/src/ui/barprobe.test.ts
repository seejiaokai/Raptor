// @vitest-environment jsdom
/* THE TOP BAR'S READINGS ON SCREEN, A TRIAL SWITCH ([TOPBAR-LOOSE-APPROVALS-QUALS], his D2025, 13 Nov 26): a tab opened
   with `?barprobe` in the address shows, in a corner, the numbers his phone gives the page while he scrolls — the window's
   height, the visible screen's height and place, the page's scroll and height, where the top bar and the pinned row stand —
   and the worst gap seen between the bar and the visible top, held with that frame's numbers, cleared on a page change.
   Without the switch nothing is drawn and nothing listens: the app is exactly as it was (D1666's ?savefail pattern). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { installBarProbe, barProbeOn } from './barprobe'

let frames: FrameRequestCallback[] = []
let clock = 1000
const flush = () => { const f = frames; frames = []; f.forEach(cb => cb(clock)) }
const panel = () => document.querySelector<HTMLElement>('[data-testid="barprobe"]')

let vv: EventTarget & { height: number, offsetTop: number }
let scrollY = 0
let barTop = 0
function stage(page = 'page-quals') {
  document.body.innerHTML = `<div id="shell"><div class="topbar"></div><section class="page on" id="${page}"></section></div>`
  const bar = document.querySelector<HTMLElement>('#shell > .topbar')!
  bar.getBoundingClientRect = () => ({ top: barTop, bottom: barTop + 52, left: 0, right: 402, width: 402, height: 52, x: 0, y: barTop, toJSON() {} }) as DOMRect
}

beforeEach(() => {
  frames = []; clock = 1000; scrollY = 0; barTop = 0
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { frames.push(cb); return frames.length })
  vi.stubGlobal('cancelAnimationFrame', () => { frames = [] })
  vi.spyOn(performance, 'now').mockImplementation(() => clock)
  vv = Object.assign(new EventTarget(), { height: 874, offsetTop: 0 })
  Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true })
  Object.defineProperty(window, 'scrollY', { get: () => scrollY, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: 874, configurable: true })
  stage()
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); document.body.innerHTML = '' })

describe('the ?barprobe trial switch (D2025)', () => {
  it('without the switch: nothing drawn, no listener, no frame asked for', () => {
    const onWin = vi.spyOn(window, 'addEventListener')
    const onDoc = vi.spyOn(document, 'addEventListener')
    const onVv = vi.spyOn(vv, 'addEventListener')
    for (const q of ['', '?savefail', '?barprobex', '?xbarprobe', '?x=barprobe']) {
      const off = installBarProbe(q)
      expect(barProbeOn(q), q).toBe(false)
      expect(panel(), q).toBeNull()
      off()
    }
    expect(onWin).not.toHaveBeenCalled()
    expect(onDoc).not.toHaveBeenCalled()
    expect(onVv).not.toHaveBeenCalled()
    expect(frames).toHaveLength(0)
  })

  it('with it: a panel in a corner that takes no presses, its readings updated as the page moves', () => {
    for (const q of ['?barprobe', '?barprobe=1', '?x=1&barprobe']) expect(barProbeOn(q), q).toBe(true)
    const off = installBarProbe('?barprobe')
    flush()
    const el = panel()!
    expect(el).not.toBeNull()
    expect(el.style.position).toBe('fixed')
    expect(el.style.pointerEvents).toBe('none')
    expect(el.style.top).toBe('')   // never at the top, over the bar
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(el.textContent).toContain('scroll 0')
    scrollY = 512
    window.dispatchEvent(new Event('scroll'))
    flush()
    expect(el.textContent).toContain('scroll 512')
    off()
  })

  it('holds the worst gap with that frame’s numbers, and clears it on a page change', () => {
    const off = installBarProbe('?barprobe')
    flush()
    const el = panel()!
    expect(el.textContent).toMatch(/WORST 0\b/)
    /* the bar drawn 29 below the visible top while the visible screen is 845 tall */
    barTop = 29; vv.height = 845
    vv.dispatchEvent(new Event('resize'))
    flush()
    expect(el.textContent).toMatch(/WORST 29\b/)
    expect(el.textContent).toMatch(/vis 845/)
    /* the bar back in place: the worst stays, with its own frame's numbers */
    barTop = 0; vv.height = 874
    window.dispatchEvent(new Event('scroll'))
    flush()
    expect(el.textContent).toMatch(/WORST 29\b/)
    expect(el.textContent?.split('\n').slice(-1)[0]).toMatch(/vis 845/)
    /* another page: cleared */
    document.querySelector('#page-quals')!.classList.remove('on')
    document.querySelector('#shell')!.insertAdjacentHTML('beforeend', '<section class="page on" id="page-inputs"></section>')
    document.dispatchEvent(new Event('click'))
    flush()
    expect(el.textContent).toMatch(/WORST 0\b/)
    expect(el.textContent).toContain('page-inputs')
    off()
  })

  it('keeps reading every frame for a while after the last movement, then stops asking for frames', () => {
    const off = installBarProbe('?barprobe')
    flush()
    window.dispatchEvent(new Event('scroll'))
    for (let i = 0; i < 10; i++) { clock += 16; flush(); expect(frames.length, 'still reading at ' + i).toBe(1) }
    clock += 5000; flush()
    expect(frames).toHaveLength(0)
    off()
  })

  it('taken down: the panel goes and nothing listens any more', () => {
    const off = installBarProbe('?barprobe')
    flush()
    off()
    expect(panel()).toBeNull()
    scrollY = 300
    window.dispatchEvent(new Event('scroll'))
    expect(frames).toHaveLength(0)
  })
})
