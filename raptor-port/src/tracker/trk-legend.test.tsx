// @vitest-environment jsdom
/* THE TRACKER'S LEGEND (owner D1007, D1018 — 18 Oct 26, approved "as recommended" on the pictures
   docs/img/handpass/2026-10-18-trk-flex-legend/). jsdom has no layout, so where the claim is about what a person SEES
   (the pop-out under its button, the bar still one row on a desktop, the scroll on a phone) the browser walk carries
   it; these pin the rules underneath:
   - "Legend" sits beside ☰ Show All in the Tracker's bar (D1018);
   - a press opens the pop-out with its three parts — the balls, currency & IP, flex (D1007) — and the balls are the
     chart's own drawing;
   - Escape closes it and gives the keyboard back to the button; Tab stays inside; a tap outside and a second press
     of the button close it (design guide §2);
   - the flex part is one row per band of core.flexFor, read off it, never typed twice — and the currency part the
     same off core.landingCurrency;
   - the colour strip that sat under the bar is gone (D1018: it moved into the pop-out). */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import * as core from './app/core.js'
import { initStore, resetSession } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const key = (el: Element, k: string, extra: any = {}) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra })) })
const press = (el: Element) => act(async () => { (el as HTMLElement).click() })
/* the bands as the bar's own rule gives them, walked here independently of the Legend's reader */
function bandsOf(fn: (d: number) => { txt: string }) {
  const out: { from: number, txt: string }[] = []
  for (let d = 0; d <= 1000; d++) { const t = fn(d).txt; if (!out.length || out[out.length - 1]!.txt !== t) out.push({ from: d, txt: t }) }
  return out
}

let host: HTMLElement, root: any
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  const { default: App } = await import('./App.jsx')
  host = document.createElement('div')
  host.innerHTML = '<section class="page on" id="page-tracker"></section>'
  document.body.appendChild(host)
  root = createRoot(host.querySelector('#page-tracker')!)
  await act(async () => { root.render(<App active={true} />) })
  await act(async () => { await C.whenLoaded(); await new Promise(r => setTimeout(r, 50)) })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })

describe('D1018 — the Legend button and the strip it replaced', () => {
  it('"Legend" sits right after ☰ Show All in the Tracker\'s bar', () => {
    const btn = $('#page-tracker header .controls #legendBtn')
    expect(btn, 'the Legend button in the bar').toBeTruthy()
    expect(btn!.textContent).toBe('Legend')
    expect($('#showAllBtn')!.nextElementSibling, 'beside Show All').toBe(btn)
    expect(btn!.getAttribute('aria-expanded')).toBe('false')
  })
  it('the colour strip under the bar is gone — no ".legend" left in the Tracker', () => {
    expect(document.querySelector('#page-tracker .legend')).toBeNull()
    expect(document.querySelector('#page-tracker .sw')).toBeNull()
  })
})

describe('D1007 — the pop-out', () => {
  it('a press opens it with its three parts: the balls, currency & IP, flex', async () => {
    await press($('#legendBtn')!)
    const box = $('[data-testid=trk-legend]')
    expect(box, 'the pop-out').toBeTruthy()
    expect(box!.getAttribute('role')).toBe('dialog')
    expect($('#legendBtn')!.getAttribute('aria-expanded')).toBe('true')
    const secs = [...box!.querySelectorAll('.tleg-sec')].map(e => e.textContent)
    expect(secs).toEqual([
      'The centre — the kind of event',
      'The ring — one slice per student',
      'Currency — days since the last flight',
      'Flex — days since the last syllabus flight',
    ])
    expect(box!.querySelector('.tleg-hd')!.textContent).toBe('What the chart is telling you')
    const tiles = [...box!.querySelectorAll('.tleg-tile .tleg-t')].map(e => e.textContent)
    expect(tiles).toEqual(['Flight', 'Acad / Spec', 'Test', 'Sim', 'CFT / IAT / EPT', 'DCO', 'DPCO', 'Marginal', 'N.A.', 'Not done'])
    const marks = [...box!.querySelectorAll('.tleg-ballrow .tleg-t')].map(e => e.textContent)
    expect(marks).toEqual(['A failure — one red tick each', 'Blue edge — the student picked in Crew', 'Gold ring — can be flown next', 'Turquoise ring — found by Find event'])
    expect(box!.querySelector('.tleg-note')!.textContent).toBe('Any syllabus flight counts, or a non-syllabus flight put in Last Flown (Currency).')
  })

  it('its balls are the chart\'s own drawing: the kind\'s centre shape, the grade\'s fill, and each mark', () => {
    const box = $('[data-testid=trk-legend]')!
    const tile = (sel: string) => box.querySelector(sel)!
    expect(tile('[data-kind=flight] .core path'), 'the flight centre is the jet').toBeTruthy()
    expect(tile('[data-kind=sim] .core ellipse'), 'the sim centre is the oval').toBeTruthy()
    expect(tile('[data-kind=device] .core polygon'), 'CFT / IAT / EPT is the hexagon').toBeTruthy()
    for (const g of ['dco', 'dpco', 'marg', 'na'] as const)
      expect(tile(`[data-grade=${g}] .wedge`).getAttribute('fill'), g).toBe(C.GRADE_FILL[g])
    expect(tile('[data-grade=none] .wedge').getAttribute('fill')).toBe('#ffffff')
    const rows = [...box.querySelectorAll('.tleg-ballrow')]
    expect(rows[0]!.querySelectorAll('.ftick')).toHaveLength(1)
    expect(rows[0]!.querySelector('.ftick')!.getAttribute('stroke')).toBe(C.PAL.fail)
    expect(rows[1]!.querySelector('.mine')!.getAttribute('stroke')).toBe(C.PAL.accent)
    expect(rows[2]!.querySelector('.avail')).toBeTruthy()
    expect(rows[3]!.querySelector('.found')).toBeTruthy()
    /* a legend picture never answers the chart's handlers, which look for .ball */
    expect(box.querySelector('.ball')).toBeNull()
  })

  it('the flex part is one row per band of core.flexFor, in its words and day ranges', () => {
    const want = bandsOf(C.flexFor)
    const rows = [...document.querySelectorAll('[data-testid=trk-legend-flex] .tleg-row')]
    expect(rows).toHaveLength(want.length)
    expect(rows.map(r => r.querySelector('.tleg-t')!.textContent)).toEqual(want.map(b => b.txt))
    const ranges = rows.map(r => r.querySelector('.tleg-sw')!.textContent)
    expect(ranges.map(r => parseInt(r!, 10))).toEqual(want.map(b => b.from))
    expect(ranges[0]).toBe('0–6')
    expect(ranges[ranges.length - 1]).toBe(want[want.length - 1]!.from + ' +')
    /* each chip wears its bar's own colour and ink (D982) */
    const first = C.flexFor(0)
    expect((rows[0]!.querySelector('.tleg-sw') as HTMLElement).style.background).toBe(first.color)
    expect((rows[0]!.querySelector('.tleg-sw') as HTMLElement).style.color).toBe(first.ink)
  })

  it('the currency part is read the same way off core.landingCurrency', () => {
    const want = bandsOf(C.landingCurrency)
    const box = $('[data-testid=trk-legend]')!
    const all = [...box.querySelectorAll('.tleg-row:not(.tleg-ballrow)')].filter(r => !r.closest('[data-testid=trk-legend-flex]'))
    expect(all.map(r => r.querySelector('.tleg-t')!.textContent)).toEqual(want.map(b => b.txt))
    expect(all.map(r => r.querySelector('.tleg-sw')!.textContent)).toEqual(['0–6', '7 +'])
  })

  it('the keyboard is inside it; Tab stays inside; Escape closes it and gives the keyboard back to the button', async () => {
    const body = $('[data-testid=trk-legend] .tleg-body')!
    expect(document.activeElement, 'the keyboard goes into the pop-out').toBe(body)
    await key(body, 'Tab')
    expect(document.activeElement, 'Tab stays inside').toBe(body)
    await key(body, 'Escape')
    expect($('[data-testid=trk-legend]'), 'closed').toBeNull()
    expect(document.activeElement, 'back on the button').toBe($('#legendBtn'))
    expect($('#legendBtn')!.getAttribute('aria-expanded')).toBe('false')
  })

  it('a tap outside closes it (and nothing under it is pressed); the button opens and closes it', async () => {
    await press($('#legendBtn')!)
    expect($('[data-testid=trk-legend]')).toBeTruthy()
    await press($('[data-testid=trk-legend-scrim]')!)
    expect($('[data-testid=trk-legend]'), 'a tap outside').toBeNull()
    await press($('#legendBtn')!)
    expect($('[data-testid=trk-legend]')).toBeTruthy()
    /* the button itself, reached by the keyboard (Enter on it is a click) */
    await act(async () => { ($('#legendBtn') as HTMLButtonElement).click() })
    expect($('[data-testid=trk-legend]'), 'the button again').toBeNull()
  })

  it('with the Tracker tab not on screen, Escape is left to the page that is', async () => {
    await press($('#legendBtn')!)
    const pg = $('#page-tracker')!
    pg.className = 'page doze'
    await key(document.body, 'Escape')
    expect($('[data-testid=trk-legend]'), 'still open behind the other tab').toBeTruthy()
    pg.className = 'page on'
    await key(document.body, 'Escape')
    expect($('[data-testid=trk-legend]')).toBeNull()
  })
})
