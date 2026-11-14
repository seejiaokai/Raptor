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
/* the app's fixed mark at the layout's top (ui/kbscroll.ts screenBox): 0 where a phone gives boxes from the window's top,
   minus the visible screen's pan where it gives them from the visible top (his ?kbdebug recordings) */
let markTop = 0
let winH = 874
let docH = 1341
const rect = (top: number, h: number) => ({ top, bottom: top + h, left: 0, right: 402, width: 402, height: h, x: 0, y: top, toJSON() {} }) as DOMRect
function stage(page = 'page-quals') {
  document.body.innerHTML = `<div id="shell"><div class="topbar"></div><section class="page on" id="${page}"></section></div><div data-kbprobe></div>`
  const bar = document.querySelector<HTMLElement>('#shell > .topbar')!
  bar.getBoundingClientRect = () => rect(barTop, 52)
  document.querySelector<HTMLElement>('[data-kbprobe]')!.getBoundingClientRect = () => rect(markTop, winH)
}
/* one line of the panel, by its first word */
const line = (first: string) => (panel()?.textContent ?? '').split('\n').find(l => l.trim().startsWith(first)) ?? ''
/* a pinned row in the page, drawn (client rects) or not, at `top` */
function pinRow(top: number, opts: { where?: string, drawn?: boolean } = {}) {
  const host = opts.where ? document.querySelector(opts.where)! : document.querySelector('#shell > .page.on')!
  host.insertAdjacentHTML('beforeend', '<div data-testid="qsticky-head"></div>')
  const row = host.querySelector<HTMLElement>('[data-testid="qsticky-head"]')!
  row.getBoundingClientRect = () => rect(top, 24)
  row.getClientRects = () => (opts.drawn === false ? [] : [rect(top, 24)]) as unknown as DOMRectList
  return row
}

beforeEach(() => {
  frames = []; clock = 1000; scrollY = 0; barTop = 0; markTop = 0; winH = 874; docH = 1341
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => { frames.push(cb); return frames.length })
  vi.stubGlobal('cancelAnimationFrame', () => { frames = [] })
  vi.spyOn(performance, 'now').mockImplementation(() => clock)
  vv = Object.assign(new EventTarget(), { height: 874, offsetTop: 0 })
  Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true })
  Object.defineProperty(window, 'scrollY', { get: () => scrollY, configurable: true })
  Object.defineProperty(window, 'innerHeight', { get: () => winH, configurable: true })
  Object.defineProperty(document, 'scrollingElement', { get: () => document.documentElement, configurable: true })
  Object.defineProperty(document.documentElement, 'scrollHeight', { get: () => docH, configurable: true })
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
    const ls = el.textContent!.split('\n')
    expect(ls[ls.findIndex(l => l.startsWith('WORST')) + 1]).toMatch(/vis 845/)   // the line under WORST: its own frame
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
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(frames).toHaveLength(0)
  })

  /* the readings themselves (both blind reads, 15 Nov 26): each would read wrong in a broken version */
  it('bar: the bar’s top against the visible top, +N drawn N low, whichever way the phone measures boxes', () => {
    const off = installBarProbe('?barprobe')
    const at = (mark: number, pan: number, top: number) => {
      markTop = mark; vv.offsetTop = pan; barTop = top
      window.dispatchEvent(new Event('scroll')); flush()
      return line('bar')
    }
    /* boxes measured from the layout's top (a desktop, Chromium, the older phones): the mark at 0 */
    expect(at(0, 0, 0)).toMatch(/^bar 0\b/)
    expect(at(0, 0, 29)).toMatch(/^bar 29\b/)          // drawn 29 below the visible top: his fault's look
    expect(at(0, 29, 0)).toMatch(/^bar -29\b/)         // the visible screen panned 29 down: the bar 29 above it, hidden
    /* boxes measured from the visible top (his iPhone with the screen panned, ?kbdebug of 29 Oct 26): the mark at −pan */
    expect(at(-29, 29, -29)).toMatch(/^bar -29\b/)     // the same bar at the layout's top, 29 above the visible top
    expect(at(-29, 29, 0)).toMatch(/^bar 0\b/)         // at the visible top: in place
    expect(at(-29, 29, 29)).toMatch(/^bar 29\b/)       // 29 below it: loose
    /* the raw numbers beside it: the bar's own top and the mark's */
    expect(line('bar')).toMatch(/top 29\b/)
    expect(line('bar')).toMatch(/mark -29\b/)
    expect(line('win')).toMatch(/@29\b/)
    off()
  })

  it('past: how far the page is sprung past its top (negative) or its foot (positive), 0 between', () => {
    const off = installBarProbe('?barprobe')
    const at = (y: number) => { scrollY = y; window.dispatchEvent(new Event('scroll')); flush(); return line('scroll') }
    expect(at(-12)).toMatch(/past -12\b/)
    docH = 1402
    expect(at(540)).toMatch(/past 12\b/)               // 1402 − 874 = 528 is the foot
    expect(at(528)).toMatch(/past 0\b/)
    expect(at(300)).toMatch(/past 0\b/)
    off()
  })

  it('row: the pinned row’s top against the bar’s foot, 0 in place', () => {
    const row = pinRow(52)
    const off = installBarProbe('?barprobe')
    flush()
    expect(line('bar')).toMatch(/row 0\b/)
    row.getBoundingClientRect = () => rect(81, 24)
    window.dispatchEvent(new Event('scroll')); flush()
    expect(line('bar')).toMatch(/row 29\b/)
    /* hidden by its opacity (the browser shows it only once the page passes its place — D1870): no row */
    row.style.opacity = '0'
    window.dispatchEvent(new Event('scroll')); flush()
    expect(line('bar')).not.toMatch(/row/)
    off()
  })

  it('row: a pinned-row copy not on screen is never read as the row', () => {
    /* a sleeping page's copy, a copy not drawn, a copy the browser says is not visible — ahead of the real one */
    document.querySelector('#shell')!.insertAdjacentHTML('beforeend', '<section class="page" id="page-leavewar"></section>')
    pinRow(300, { where: '#page-leavewar' })
    const off = installBarProbe('?barprobe')
    flush()
    expect(line('bar')).not.toMatch(/row/)
    document.querySelector('#page-leavewar [data-testid="qsticky-head"]')!.remove()
    pinRow(300, { drawn: false })
    window.dispatchEvent(new Event('scroll')); flush()
    expect(line('bar')).not.toMatch(/row/)
    document.querySelector('#page-quals [data-testid="qsticky-head"]')!.remove()
    const hid = pinRow(300)
    Object.assign(hid, { checkVisibility: () => false })
    window.dispatchEvent(new Event('scroll')); flush()
    expect(line('bar')).not.toMatch(/row/)
    /* the real one after the phantom: read */
    const real = document.createElement('div')
    real.dataset.testid = 'sticky-head'
    real.getBoundingClientRect = () => rect(52, 24)
    real.getClientRects = () => [rect(52, 24)] as unknown as DOMRectList
    document.querySelector('#page-quals')!.appendChild(real)
    window.dispatchEvent(new Event('scroll')); flush()
    expect(line('bar')).toMatch(/row 0\b/)
    off()
  })

  it('RANGE: the extremes since the page opened, the foot’s with its own numbers; cleared on a page change', () => {
    const off = installBarProbe('?barprobe')
    const step = (f: () => void) => { f(); window.dispatchEvent(new Event('scroll')); flush() }
    flush()
    step(() => { winH = 845; vv.height = 845 })                       // the toolbar grows
    step(() => { winH = 874; vv.height = 874; vv.offsetTop = 29 })    // back, the visible screen panned 29
    step(() => { vv.offsetTop = 0; scrollY = -12 })                   // sprung past the top
    step(() => { docH = 1402; scrollY = 560 })                        // sprung 32 past the foot
    step(() => { scrollY = 300 })                                     // back inside: the extremes stay
    const text = panel()!.textContent!.split('\n')
    const i = text.findIndex(l => l.startsWith('RANGE'))
    expect(i, text.join('\n')).toBeGreaterThan(-1)
    expect(text[i]).toMatch(/win 845-874\b/)
    expect(text[i]).toMatch(/vis 845\+/)
    expect(text[i]).toMatch(/@29\b/)
    expect(text[i + 1]).toMatch(/top -12\b/)
    expect(text[i + 1]).toMatch(/foot 32 s560 p1402 w874\b/)
    document.querySelector('#page-quals')!.classList.remove('on')
    document.querySelector('#shell')!.insertAdjacentHTML('beforeend', '<section class="page on" id="page-inputs"></section>')
    step(() => {})
    const again = panel()!.textContent!.split('\n')
    const j = again.findIndex(l => l.startsWith('RANGE'))
    expect(again[j]).toMatch(/win 874-874\b/)
    expect(again[j + 1]).toMatch(/top 0\b/)
    off()
  })

  it('RANGE’s spring line: the window’s height only over the frames the page is sprung, and the frame before; cleared on a page change', () => {
    const off = installBarProbe('?barprobe')
    const step = (f: () => void) => { f(); window.dispatchEvent(new Event('scroll')); flush() }
    const spring = () => panel()!.textContent!.split('\n').map(l => l.trim()).find(l => l.startsWith('spring')) ?? ''
    flush()
    /* an ordinary flick: Chrome folds and unfolds its toolbars, the page never sprung — the whole range moves, the spring's does not */
    step(() => { winH = 845; scrollY = 200 })
    step(() => { winH = 874; scrollY = 300 })
    expect(line('RANGE')).toMatch(/win 845-874\b/)
    expect(spring()).toMatch(/^spring —$/)
    /* sprung past the foot (page 1341, window 874: the foot at 467) while the window changes: read */
    step(() => { scrollY = 467 })                       // the frame before the spring, window 874
    step(() => { winH = 845; scrollY = 500 })           // sprung: foot now 1341 − 845 = 496, past 4
    step(() => { winH = 860; scrollY = 490 })           // still sprung: foot 481, past 9
    step(() => { winH = 874; scrollY = 300 })           // back inside
    expect(spring()).toMatch(/^spring win 845-874$/)
    /* another page: cleared */
    document.querySelector('#page-quals')!.classList.remove('on')
    document.querySelector('#shell')!.insertAdjacentHTML('beforeend', '<section class="page on" id="page-inputs"></section>')
    step(() => {})
    expect(spring()).toMatch(/^spring —$/)
    off()
  })

  it('stands above Approvals’ slim bar while it shows, back in the corner when it goes', () => {
    const off = installBarProbe('?barprobe')
    flush()
    const el = panel()!
    expect(el.style.bottom).toBe('0px')
    document.body.insertAdjacentHTML('beforeend', '<div data-testid="appr-slim"></div>')
    const slim = document.querySelector<HTMLElement>('[data-testid="appr-slim"]')!
    slim.getBoundingClientRect = () => rect(790, 62)
    slim.getClientRects = () => [rect(790, 62)] as unknown as DOMRectList
    document.dispatchEvent(new Event('click')); flush()
    expect(el.style.bottom).toBe('90px')                // 874 − 790, and 6 clear
    /* measured from the visible top on his phone: the same place */
    markTop = -29; slim.getBoundingClientRect = () => rect(761, 62)
    window.dispatchEvent(new Event('scroll')); flush()
    expect(el.style.bottom).toBe('90px')
    slim.remove()
    document.dispatchEvent(new Event('click')); flush()
    expect(el.style.bottom).toBe('0px')
    off()
  })

  it('a page changed by the keys after the readings went quiet clears the old page’s worst', () => {
    const off = installBarProbe('?barprobe')
    flush()
    barTop = 29
    window.dispatchEvent(new Event('scroll')); flush()
    expect(panel()!.textContent).toMatch(/WORST 29\b/)
    barTop = 0
    clock += 5000; flush()
    expect(frames).toHaveLength(0)                      // quiet
    document.querySelector('#page-quals')!.classList.remove('on')
    document.querySelector('#shell')!.insertAdjacentHTML('beforeend', '<section class="page on" id="page-inputs"></section>')
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(frames).toHaveLength(1)
    flush()
    expect(panel()!.textContent).toContain('page-inputs')
    expect(panel()!.textContent).toMatch(/WORST 0\b/)
    off()
  })
})
