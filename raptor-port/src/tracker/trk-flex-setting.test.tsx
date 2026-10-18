// @vitest-environment jsdom
/* THE TRACKER'S FLEX SETTINGS (owner D1006, D1014, D1018 — 18 Oct 26, approved "as recommended" on the pictures
   docs/img/handpass/2026-10-18-trk-flex-legend/02-, 03-, 04-, 06-, 08-). jsdom has no layout, so where the claim is
   about what a person SEES (the window under its ⚙, the currency bar the full width) the browser walk carries it;
   these pin the rules underneath:
   - the defaults are the bands flexFor always had (7, 14, 21, 31, 60, 120);
   - an admin changes a From day in the window and flexFor follows; Cancel keeps nothing;
   - a member cannot: the setter refuses him, the command gate refuses him even past the screen, and his window is
     read-only — the figures as plain numbers, no Save (D1018);
   - six whole numbers, each 1 or more, each above the one before — anything else is refused, nothing written;
   - flex off takes the Info panel's flex bar, "Days since syllabus" and the flex sentence, and the Legend's flex part;
   - the setting is one stored row, read back at boot, and a backup of every chart carries it through export → import
     (an older file without it changes nothing). */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import * as core from './app/core.js'
import * as FMT from './app/fileFormat.js'
import { storage } from './storage.js'
import { setTrackerAdmin, trackerIsAdmin } from './role.js'
import { wireTrackerPeople, trackerAdminForTracker } from './peoplewire'
import { initStore, resetSession } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
const DEF = [7, 14, 21, 31, 60, 120]
const $ = (sel: string) => document.querySelector(sel) as HTMLElement | null
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting for the app') }
const press = (el: Element) => act(async () => { (el as HTMLElement).click(); await tick() })
const key = (el: Element, k: string) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })) })
/* a typed value React hears: the native setter, then the input event */
const type = (el: HTMLInputElement, v: string) => act(async () => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, v)
  el.dispatchEvent(new Event('input', { bubbles: true }))
})
const box = (i: number) => $(`[data-testid=trk-flex-from-${i}]`) as HTMLInputElement
const stored = async () => { const r = await storage.get('v3:master:flex'); return r ? JSON.parse(r.value) : null }
/* the rule flexFor carried before the settings, written out here independently of core.js */
const OLD = (d: number) => d < 7 ? 'Current — no flex required' : d <= 13 ? '1 Optional Flex' : d <= 20 ? '1 Mando Flex (Convertible)'
  : d <= 30 ? '2 Mando Flex (1 Mando, 1 Convertible)' : d <= 59 ? '2 Mando Flex (2 Mando)' : d <= 119 ? 'Short Refresher Course' : 'Re-course'
const asAdmin = () => act(async () => { resetSession({ user: 'ad', role: 'admin' }); await tick() })
const asMember = () => act(async () => { resetSession({ user: 'us', role: 'member' }); await tick() })
const backToDefaults = async () => { await asAdmin(); expect((await C.setFlexSetting({ on: true, from: DEF })).ok).toBe(true) }

let host: HTMLElement, root: any
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  /* Raptor's side of the bridge, as TrackerPage.tsx wires it: "is he an admin?" asked of state/perms.ts */
  wireTrackerPeople()
  const { default: App } = await import('./App.jsx')
  host = document.createElement('div')
  host.innerHTML = '<section class="page on" id="page-tracker"></section>'
  document.body.appendChild(host)
  root = createRoot(host.querySelector('#page-tracker')!)
  await act(async () => { root.render(<App active={true} />) })
  await act(async () => { await C.whenLoaded(); await new Promise(r => setTimeout(r, 50)) })
})
afterAll(async () => { await act(async () => { root.unmount() }); host.remove() })

describe('D1018 — the defaults and the ⚙ in the bar', () => {
  it('the defaults are today\'s bands: on, From 7 · 14 · 21 · 31 · 60 · 120, and flexFor gives what it always gave', () => {
    expect(C.flexSetting()).toEqual({ on: true, from: DEF })
    expect(C.flexOn()).toBe(true)
    for (let d = 0; d <= 400; d++) expect(C.flexFor(d).txt, `day ${d}`).toBe(OLD(d))
    expect(C.flexFor(null).txt).toBe('No flight date set')
    expect(C.flexBands().map((b: any) => [b.from, b.to])).toEqual([[0, 6], [7, 13], [14, 20], [21, 30], [31, 59], [60, 119], [120, null]])
  })
  it('the ⚙ sits after Find event, right before the bar\'s Hide, for everyone (as drawn)', async () => {
    const cog = $('#page-tracker header .controls #flexBtn')
    expect(cog, 'the cog in the bar').toBeTruthy()
    expect(cog!.textContent).toBe('⚙')
    expect($('#barHideBtn')!.previousElementSibling, 'right before Hide').toBe(cog)
    expect(cog!.getAttribute('aria-expanded')).toBe('false')
    await asMember()
    expect($('#flexBtn'), 'a member has it too').toBeTruthy()
    await asAdmin()
  })
  it('nobody wired is the standalone Tracker — everyone; wired, the answer is Raptor\'s', async () => {
    setTrackerAdmin(null)
    expect(trackerIsAdmin()).toBe(true)
    setTrackerAdmin(trackerAdminForTracker)
    await asMember(); expect(trackerIsAdmin()).toBe(false)
    await asAdmin(); expect(trackerIsAdmin()).toBe(true)
  })
})

describe('D1014 / D1018 — an admin changes the From days', () => {
  it('the window: the switch, six From days (the first fixed at 0), each To from the next row, the band words fixed', async () => {
    await press($('#flexBtn')!)
    const win = $('[data-testid=trk-flex]')!
    expect(win, 'the window').toBeTruthy()
    expect(win.getAttribute('role')).toBe('dialog')
    expect(win.querySelector('.tflex-ttl')!.textContent).toBe('Flex settingsadmins only')
    expect(win.querySelector('.tflex-hint')!.textContent).toBe('Off: the flex bar and the Legend\'s flex part go, for everyone.')
    expect(win.querySelector('.tflex-sec')!.textContent).toBe('Days since the last syllabus flight')
    expect(($('[data-testid=trk-flex-on]') as HTMLInputElement).checked).toBe(true)
    expect(box(0).tagName, 'From 0 is not typed').toBe('SPAN')
    expect([1, 2, 3, 4, 5, 6].map(i => box(i).value)).toEqual(DEF.map(String))
    expect([0, 1, 2, 3, 4, 5, 6].map(i => $(`[data-testid=trk-flex-to-${i}]`)!.textContent)).toEqual(['6', '13', '20', '30', '59', '119', 'and over'])
    expect([...win.querySelectorAll('.tflex-bar')].map(e => e.textContent)).toEqual([0, 7, 14, 21, 31, 60, 120].map(OLD))
    expect(document.activeElement, 'the keyboard is in the window').toBe($('[data-testid=trk-flex-on]'))
  })
  it('a From day typed moves the To above it; Save keeps it and flexFor follows', async () => {
    await type(box(1), '10')
    expect($('[data-testid=trk-flex-to-0]')!.textContent, 'Current now runs to 9').toBe('9')
    expect(C.flexSetting().from[0], 'nothing kept before Save').toBe(7)
    await press($('[data-testid=trk-flex-save]')!)
    expect($('[data-testid=trk-flex]'), 'Save closes it').toBeNull()
    expect(document.activeElement, 'the keyboard back on the ⚙').toBe($('#flexBtn'))
    expect(C.flexSetting().from).toEqual([10, 14, 21, 31, 60, 120])
    expect(C.flexFor(9).txt).toBe('Current — no flex required')
    expect(C.flexFor(10).txt).toBe('1 Optional Flex')
    expect(await stored(), 'one stored row').toEqual({ on: true, from: [10, 14, 21, 31, 60, 120] })
    await backToDefaults()
  })
  it('Cancel, Escape and a tap outside keep nothing, and give the keyboard back to the ⚙', async () => {
    for (const how of ['cancel', 'escape', 'outside']) {
      await press($('#flexBtn')!)
      await type(box(2), '15')
      if (how === 'cancel') await press($('[data-testid=trk-flex-cancel]')!)
      else if (how === 'escape') await key(document.activeElement || document.body, 'Escape')
      else await press($('[data-testid=trk-flex-scrim]')!)
      expect($('[data-testid=trk-flex]'), how).toBeNull()
      expect(document.activeElement, how).toBe($('#flexBtn'))
      expect(C.flexSetting().from, how).toEqual(DEF)
    }
  })
  it('bad figures are refused with a reason, and nothing is written', async () => {
    const before = await stored()
    for (const bad of [[7, 7, 21, 31, 60, 120], [0, 14, 21, 31, 60, 120], [7.5, 14, 21, 31, 60, 120], [7, 14, 21, 31, 60], [14, 7, 21, 31, 60, 120], ['7', 14, 21, 31, 60, 120]]) {
      const r = await C.setFlexSetting({ on: true, from: bad })
      expect(r.ok, JSON.stringify(bad)).toBe(false)
      expect(r.message).toBeTruthy()
    }
    await press($('#flexBtn')!)
    await type(box(3), '12')
    await press($('[data-testid=trk-flex-save]')!)
    expect($('[data-testid=trk-flex-err]')!.textContent).toBe('Each From day must be later than the one above it.')
    expect($('[data-testid=trk-flex]'), 'the window stays open').toBeTruthy()
    await type(box(3), 'x')
    await press($('[data-testid=trk-flex-save]')!)
    expect($('[data-testid=trk-flex-err]')!.textContent).toBe('Each From day is a whole number, 1 or more.')
    await press($('[data-testid=trk-flex-cancel]')!)
    expect(C.flexSetting().from).toEqual(DEF)
    expect(await stored()).toEqual(before)
  })
})

describe('D1014 — a member cannot change them', () => {
  it('the setter refuses him and nothing changes', async () => {
    await asMember()
    expect(C.mayChangeFlex()).toBe(false)
    const r = await C.setFlexSetting({ on: false, from: [8, 14, 21, 31, 60, 120] })
    expect(r).toEqual({ ok: false, message: 'Only an admin can change the flex settings.' })
    expect(C.flexSetting()).toEqual({ on: true, from: DEF })
    await asAdmin()
  })
  it('the command gate refuses him too, even past the screen\'s answer (the record is a Setting — perms.ts)', async () => {
    await asMember()
    const before = await stored()
    setTrackerAdmin(() => true)        /* the screen fooled: only the command gate is left */
    try {
      const r = await C.setFlexSetting({ on: false, from: [8, 14, 21, 31, 60, 120] })
      expect(r.ok, 'refused').toBe(false)
      expect(C.flexSetting(), 'the setting unchanged').toEqual({ on: true, from: DEF })
      expect(await stored(), 'nothing stored').toEqual(before)
    } finally { setTrackerAdmin(trackerAdminForTracker) }
    await asAdmin()
  })
  it('his window is read-only: the figures as plain numbers, the switch as it stands, no Save', async () => {
    await asMember()
    await press($('#flexBtn')!)
    const win = $('[data-testid=trk-flex]')!
    expect(win.querySelector('.tflex-ttl')!.textContent).toBe('Flex settingsonly an admin can change these')
    expect(win.querySelectorAll('input'), 'nothing to type in').toHaveLength(0)
    expect($('[data-testid=trk-flex-save]'), 'no Save').toBeNull()
    expect($('[data-testid=trk-flex-on]')!.getAttribute('aria-disabled')).toBe('true')
    expect($('[data-testid=trk-flex-on]')!.getAttribute('aria-checked')).toBe('true')
    expect([0, 1, 2, 3, 4, 5, 6].map(i => box(i).textContent)).toEqual(['0', ...DEF.map(String)])
    await key(document.activeElement || document.body, 'Escape')
    expect($('[data-testid=trk-flex]')).toBeNull()
    await asAdmin()
  })
  it('a sign-out shuts a window left open', async () => {
    await press($('#flexBtn')!)
    expect($('[data-testid=trk-flex]')).toBeTruthy()
    await asMember()
    expect($('[data-testid=trk-flex]'), 'the next person never meets it').toBeNull()
    await asAdmin()
  })
})

describe('D1006 / D1018 — flex off', () => {
  it('the Info panel loses the flex bar, "Days since syllabus" and the flex sentence; the Legend loses its flex part', async () => {
    const card = () => $('#page-tracker .c-curr')!
    expect(card().querySelector('[data-testid=trk-flexbar]'), 'on: the flex bar').toBeTruthy()
    expect(card().textContent).toContain('Days since syllabus')
    await press($('#flexBtn')!)
    await act(async () => { ($('[data-testid=trk-flex-on]') as HTMLInputElement).click() })
    await press($('[data-testid=trk-flex-save]')!)
    expect(C.flexOn()).toBe(false)
    expect(await stored()).toEqual({ on: false, from: DEF })
    expect(card().querySelector('h3')!.textContent).toBe('Currency')
    expect(card().querySelector('[data-testid=trk-flexbar]'), 'off: no flex bar').toBeNull()
    expect(card().querySelectorAll('.flexbar'), 'the currency bar alone').toHaveLength(1)
    expect(card().querySelector('.flexPair')!.classList.contains('one'), 'and it takes the whole width').toBe(true)
    expect(card().textContent).not.toContain('Days since syllabus')
    expect(card().textContent).toContain('Days since currency')
    expect(card().textContent).not.toMatch(/Flex requirement/)
    await press($('#legendBtn')!)
    expect($('[data-testid=trk-legend]')).toBeTruthy()
    expect($('[data-testid=trk-legend-flex]'), 'the Legend\'s flex part goes').toBeNull()
    await press($('[data-testid=trk-legend-scrim]')!)
    await backToDefaults()
    expect(card().querySelector('[data-testid=trk-flexbar]'), 'back on').toBeTruthy()
  })
  it('the Legend\'s flex rows follow the From days', async () => {
    expect((await C.setFlexSetting({ on: true, from: [5, 14, 21, 31, 60, 2000] })).ok).toBe(true)
    await press($('#legendBtn')!)
    const rows = [...document.querySelectorAll('[data-testid=trk-legend-flex] .tleg-sw')].map(e => e.textContent)
    expect(rows).toEqual(['0–4', '5–13', '14–20', '21–30', '31–59', '60–1999', '2000 +'])
    await press($('[data-testid=trk-legend-scrim]')!)
    await backToDefaults()
  })
})

describe('D462 / D120 — kept: one stored row, read at boot, carried by a whole backup', () => {
  it('the setting is read back from the store when the Tracker boots', async () => {
    await storage.set('v3:master:flex', JSON.stringify({ on: false, from: [9, 14, 21, 31, 60, 120] }))
    C.resetInitForTests()
    await act(async () => { await C.init(); await C.whenLoaded(); await tick() })
    expect(C.flexSetting()).toEqual({ on: false, from: [9, 14, 21, 31, 60, 120] })
    /* a damaged row reads as the defaults */
    await storage.set('v3:master:flex', JSON.stringify({ on: true, from: [9, 9] }))
    C.resetInitForTests()
    await act(async () => { await C.init(); await C.whenLoaded(); await tick() })
    expect(C.flexSetting()).toEqual({ on: true, from: DEF })
    await backToDefaults()
  })
  const importFile = async (file: any) => {
    ;(window as any).__pickOpenForTests = async () => ({ name: 'b.json', text: JSON.stringify(file) })
    let closing = ''
    try {
      const p = C.importClick()
      for (;;) { await until(() => C.dlg); if (/already exists/.test(C.dlg.msg)) { C.dlgClose(true); await tick(); continue } closing = C.dlg.msg; C.dlgClose(true); break }
      await p
    } finally { delete (window as any).__pickOpenForTests }
    await C.whenLoaded()
    return closing
  }
  it('export → import of every chart brings the setting home; a file of some charts carries none', async () => {
    const mine = { on: false, from: [6, 13, 20, 30, 59, 119] }
    expect((await C.setFlexSetting(mine)).ok).toBe(true)
    const ids = C.orderedSylIds()
    const charts = await C.collectCharts(ids, { deleted: true })
    expect(charts.flex, 'a whole backup carries it').toEqual(mine)
    if (ids.length > 1) expect((await C.collectCharts(ids.slice(0, 1), { deleted: false })).flex, 'a handover does not').toBeUndefined()
    const file = FMT.buildFile({ savedAt: '2026-10-18T00:00:00Z', charts })
    expect(FMT.readFile(JSON.parse(JSON.stringify(file))).charts!.flex).toEqual(mine)
    await backToDefaults()
    let closing = ''
    await act(async () => { closing = await importFile(file) })
    expect(C.flexSetting(), 'brought home').toEqual(mine)
    expect(closing).toMatch(/flex settings restored/i)
    /* an older file, written before the setting, changes nothing */
    const older = FMT.buildFile({ savedAt: '2026-10-01T00:00:00Z', charts: { ...charts, flex: undefined } })
    delete ((older as any).charts as any).flex
    await act(async () => { closing = await importFile(older) })
    expect(C.flexSetting(), 'unchanged by an older file').toEqual(mine)
    expect(closing).not.toMatch(/flex/i)
    /* a member's import leaves them as they are, and says so */
    await backToDefaults()
    await asMember()
    await act(async () => { closing = await importFile(file) })
    expect(C.flexSetting(), 'a member\'s import changes nothing').toEqual({ on: true, from: DEF })
    expect(closing).toMatch(/Flex settings not brought in: only an admin can change them\./)
    await asAdmin()
  })
  it('a file whose flex settings are damaged is refused before anything is written', () => {
    for (const flex of [{ on: true, from: [7, 14] }, { on: 'yes', from: DEF }, [1, 2], { on: true, from: [7, 7, 21, 31, 60, 120] }]) {
      const f = FMT.buildFile({ savedAt: null as any, charts: { order: [], syllabi: {}, layouts: {}, sylcat: [], flex } as any })
      expect(() => FMT.readFile(f), JSON.stringify(flex)).toThrow('The flex settings in that file are damaged, so it has not been opened.')
    }
  })
})
