// @vitest-environment jsdom
/* The Logic tab — the tfin B50/B52 page assertions, driven through React:
   read-only rendering from the live engine objects, the documentation
   guards, search, the filter, and the admin edit flow.
   REWRITTEN 15 Oct 26 with the page (owner D928 — built as drawn; D929-D933): a Settings part and a Checks part. The
   guards keep their purpose in the new shape: every setting is on the page or named as left off it (LG_HIDDEN); every
   warning code is a check row (data-code); every number follows its setting (D932). Two guards went with what they
   guarded: the absence-type list (it lives on the Inputs page's "?" legend, whose own guard in inputs.test stays) and
   "a setting quoted on two rows" (the duplicates went, D928). */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { VCONF, SHIFT_HARD, RULE_SPEC, RULE_STD, ruleFmt, rulesReset } from '../engine/rules'
import { WCODE, validate, lgFired } from '../engine/validate'
import { WAVE_BUILTIN, kindNote } from '../engine/wavetpl'
import { setLgEdit } from '../state/auth'
import { LG_HIDDEN } from './logic-html'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => host.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...host.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const text = () => $('#lgBody').textContent || ''
const setRow = (k: string) => $$('#lgBody .lgset').find(r => (r.dataset.lgkey || '').split(' ').includes(k))!

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'logic')!)
})

/* Unmount before the file ends: a render task left queued by the last test
   would otherwise fire after vitest tears jsdom down and die with "window is
   not defined" — an unhandled error that fails the job while every test
   passed (the teardown race closed across the suite, 10 Sep 26). */
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})

describe('the Logic tab, read-only (tfin B50)', () => {
  it('the Logic page exists and renders its two parts: the settings, then the checks', () => {
    expect($('#page-logic')).toBeTruthy()
    const parts = $$('#lgBody .lgpart')
    expect(parts.map(p => p.id)).toEqual(['lgSettings', 'lgChecks'])
    expect($$('#lgSettings .lgset').length).toBeGreaterThanOrEqual(15)
    expect($$('#lgChecks .lgchk').length).toBeGreaterThanOrEqual(40)
    expect($$('#lgBody .lggrp').length).toBeGreaterThanOrEqual(9)
  })

  it('it is read-only — nothing but the search box takes input', () => {
    expect($$('#page-logic input:not(#lgSearch), #page-logic select, #page-logic [contenteditable]').length).toBe(0)
  })

  it('the thresholds are read from the live VCONF, not copied', async () => {
    expect(/\b12h\b/.test(text())).toBe(true)
    const was = VCONF.crewRest
    await act(async () => { VCONF.crewRest = 600; notify() })
    expect(/\b10h\b/.test(text())).toBe(true)
    await act(async () => { VCONF.crewRest = was; notify() })
    expect(/\b12h\b/.test(text())).toBe(true)
  })

  /* D932 (owner, 15 Oct 26 — "crew rest is written 12 hours in the info but to be honest it's editable"): every number
     in the page's words that is an editable setting is READ from it. Every setting the words quote is moved off its
     standard at once; not one standard value may be left anywhere in the page's text. */
  it('D932 every number in the words follows its setting — none of the standard values is left once each is changed', async () => {
    const keys = ['crewRest', 'longDay', 'reportLead', 'briefLead', 'debrief', 'tightTurn', 'step', 'dekit', 'epBrief', 'simDebrief', 'amtDebrief', 'simLen', 'openEnd', 'oilFullMin', 'scDayFrom', 'scDayTo']
    const std = keys.map(k => ruleFmt(k, RULE_STD.v[k]))
    await act(async () => { for (const k of keys) VCONF[k] = RULE_STD.v[k] + 7; VCONF.maxRun = 9; validate(); notify() })
    try {
      /* the one place a standard value is MEANT to be written: a changed setting's own "Standard 12h" mark */
      const body = $('#lgBody').cloneNode(true) as HTMLElement
      body.querySelectorAll('.lgstd').forEach(e => e.remove())
      expect($$('#lgBody .lgstd').length, 'every changed setting carries its mark').toBeGreaterThanOrEqual(keys.length - 1)
      const t = body.textContent || ''
      for (const [i, s] of std.entries()) {
        const at = new RegExp(`(^|[^\\w:])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\w:]|$)`).exec(t)
        expect(at, `${keys[i]}'s standard ${s} is still written: …${at ? t.slice(Math.max(0, at.index - 60), at.index + 30) : ''}…`).toBeNull()
      }
      expect(t, 'the days in a row follow theirs').toContain('more than 9 days in a row')
      expect(t, 'and the new crew rest is what the crew-rest line says').toContain(`at least ${ruleFmt('crewRest', VCONF.crewRest)}`)
    } finally {
      await act(async () => { rulesReset(); validate(); notify() })
    }
  })

  it('every SETTING the engine carries is on the page, or named as left off it', () => {
    const shown = new Set($$('#lgBody .lgset').flatMap(r => (r.dataset.lgkey || '').split(' ').filter(Boolean)))
    const missing = Object.keys(VCONF).filter(k => !shown.has(k) && !LG_HIDDEN[k])
    expect(missing, missing.join(',')).toEqual([])
    /* and the two left off (D928) are not drawn */
    for (const k of Object.keys(LG_HIDDEN)) expect(shown.has(k), k).toBe(false)
  })

  it('the clash grading is read from SHIFT_HARD', () => {
    expect(Object.keys(SHIFT_HARD).filter(k => SHIFT_HARD[k]).length).toBe(4)
    expect(Object.keys(SHIFT_HARD).length).toBe(6)
    const kinds = $$('#lgBody .lgkinds .lgk')
    expect(kinds).toHaveLength(6)
    expect(kinds.filter(k => k.classList.contains('hard')).length).toBe(4)
    expect(/a flight/.test(text()) && /a ground event/.test(text())).toBe(true)
  })

  it('every warning code the engine can raise is a check, named as the warning list names it', () => {
    const shown = $$('#lgBody .lgchk[data-code]').map(x => x.dataset.code)
    const missing = Object.keys(WCODE).filter(c => shown.indexOf(c) < 0)
    expect(missing, missing.join(',')).toEqual([])
    const crew = $('#lgBody .lgchk[data-code="CREW_REST"] .lgnm')
    expect(crew.textContent).toContain('Crew rest (<12h)')
  })

  it('every wave kind carries its one-line summary, from the same wavetpl.kindNote the picker uses', () => {
    /* the drift seam the owner flagged (30 Aug 26): the "+ Wave" picker note and
       this page must not tell different stories. Both render engine/wavetpl.ts
       kindNote, so this guard fails a gate the moment the Logic wiring is dropped. */
    const t = text()
    const missing = WAVE_BUILTIN.filter(b => t.indexOf(kindNote(b.key)) < 0).map(b => b.label)
    expect(missing, missing.join(',')).toEqual([])
  })

  it('exactly four checks carry a folded "How it works" (D928): crew rest, days in a row, the order of times, OIL', () => {
    expect($$('#lgBody details.lghow').map(d => d.closest('.lgchk')!.getAttribute('data-chk'))).toEqual(['crewrest', 'daysrun', 'reportorder', 'oil'])
    expect($$('#lgBody details.lghow[open]')).toHaveLength(0)
  })

  it('a fold the reader opened stays open when the page repaints', async () => {
    const d = $('#lgBody details[data-how="crewrest"]') as HTMLDetailsElement
    await act(async () => { d.open = true; d.dispatchEvent(new Event('toggle')) })
    await act(async () => { VCONF.crewRest = 660; notify() })
    expect(($('#lgBody details[data-how="crewrest"]') as HTMLDetailsElement).open).toBe(true)
    const again = $('#lgBody details[data-how="crewrest"]') as HTMLDetailsElement
    await act(async () => { again.open = false; again.dispatchEvent(new Event('toggle')); VCONF.crewRest = 720; notify() })
    expect(($('#lgBody details[data-how="crewrest"]') as HTMLDetailsElement).open).toBe(false)
  })

  it('[REST-BLANK-LINE] the crew-rest fold says what a line with no times does — and does not deny a typed landing', () => {
    /* Astra's final read, 6 Oct 26: the first wording said a line with "no take-off" is "not the end of the day
       before", while the engine (rightly) still ends the day on a landing typed alone — restblank.test.ts
       "LEFT AS IT WAS: a landing typed with no take-off is still the end of his Monday". Reworded for the reader
       (D928), the same facts. */
    const t = text()
    expect(t).toContain('A flying line with no times yet is not measured')
    expect(t).toContain('a typed brief, in-time or landing on it still counts')
    expect(t, 'the withdrawn wording').not.toContain('not the end of the day before')
    expect(t).not.toContain('no take-off yet is not measured')
  })

  it('[BLANK-TIMES-ABSENCE] the leave group says what a seat with no times does — the whole day yes, part of a day not yet (D605)', () => {
    const row = $('#lgBody .lgchk[data-chk="notimes"]')
    expect(row.textContent).toContain('A seat with no times')
    expect(row.textContent).toContain('Still checked against an absence covering the whole day')
    expect(row.textContent).toContain('a part-day absence waits until the seat has times')
  })

  it('no row carries a "fired" count or an engine name any more (D928)', () => {
    expect($$('#lgBody .lgfired, #lgBody .lgsrc, #lgBody .code')).toHaveLength(0)
    expect(text()).not.toMatch(/VCONF\.|fired \d+×|not fired this week/)
    /* and no broken value: a slip that joined two strings with a stray "+" once printed NaN and 0 into every row */
    expect(text()).not.toMatch(/NaN|undefined|\[object/)
    expect($$('#lgBody .lgchk').filter(r => r.dataset.chk !== 'puck' && /\d$/.test(r.textContent || '')).map(r => r.dataset.chk)).toEqual([])
  })

  it('the filter: Fired this week shows only checks the live WARN raised, and counts them', async () => {
    validate()
    const fired = Object.keys(lgFired())
    expect(fired.length).toBeGreaterThan(0)
    await click($('#lgFilterBtn'))
    const item = $('#lgFilters [data-lgf="fired"]')
    expect(item.textContent).toContain(`(${fired.length})`)
    await click(item)
    expect($('#lgFilters')).toBeNull()
    expect($('#lgFilterBtn').textContent).toBe('Fired this week')
    expect($('#lgSettings'), 'a filter is about the checks').toBeNull()
    const shown = $$('#lgBody .lgchk').map(r => r.dataset.code)
    expect(shown.length).toBeGreaterThan(0)
    expect(shown.every(c => c && fired.includes(c))).toBe(true)
    await click($('#lgFilterBtn')); await click($('#lgFilters [data-lgf="hard"]'))
    expect($$('#lgBody .lgchk').every(r => r.classList.contains('hard'))).toBe(true)
    await click($('#lgFilterBtn')); await click($('#lgFilters [data-lgf="all"]'))
    expect($('#lgFilterBtn').textContent).toBe('Filter')
    expect($('#lgSettings')).toBeTruthy()
  })

  it('the filter menu closes on a press outside it and on Escape, the keyboard back on its button', async () => {
    await click($('#lgFilterBtn'))
    expect($('#lgFilters')).toBeTruthy()
    await act(async () => { document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) })
    expect($('#lgFilters')).toBeNull()
    await click($('#lgFilterBtn'))
    await act(async () => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })) })
    expect($('#lgFilters')).toBeNull()
    expect(document.activeElement).toBe($('#lgFilterBtn'))
  })

  it('search narrows both parts and clears back', async () => {
    const all = () => $$('#lgBody .lgchk, #lgBody .lgset').length
    const n0 = all()
    const inp = $('#lgSearch') as HTMLInputElement
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    await act(async () => { setter.call(inp, 'crew rest'); inp.dispatchEvent(new Event('input', { bubbles: true })) })
    const n1 = all()
    expect($$('#lgBody .lgset').length, 'the Crew rest setting is found').toBeGreaterThan(0)
    await act(async () => { setter.call(inp, ''); inp.dispatchEvent(new Event('input', { bubbles: true })) })
    expect(n1).toBeGreaterThan(0)
    expect(n1).toBeLessThan(n0)
    expect(all()).toBe(n0)
  })
})

describe('the thresholds are editable, and only by an admin (tfin B52)', () => {
  const setField = async (input: HTMLInputElement, v: string) => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
    await act(async () => {
      setter.call(input, v)
      input.dispatchEvent(new Event('change', { bubbles: true }))
      await new Promise(r => setTimeout(r, 5))
    })
  }

  it('Edit opens live fields, a change reaches the engine, and the stamp goes up', async () => {
    await click($('#lgEdit'))
    const f = $('#lgBody input[data-lgset="crewRest"]') as HTMLInputElement
    expect(f).toBeTruthy()
    await setField(f, '10h')
    expect(VCONF.crewRest).toBe(600)
    expect(document.body.classList.contains('page-rules-off')).toBe(true)
    /* the changed value says so on its own row: its standard, and its own Reset while editing */
    expect(setRow('crewRest').classList.contains('off')).toBe(true)
    expect(setRow('crewRest').querySelector('.lgstd')!.textContent).toContain('Standard 12h')
  })

  it('a value outside its bounds is refused', async () => {
    const f = $('#lgBody input[data-lgset="crewRest"]') as HTMLInputElement
    await setField(f, '3h')
    expect(VCONF.crewRest).toBe(600)         // unchanged — refused, not written
    expect(RULE_SPEC.crewRest.lo).toBeGreaterThan(180)
  })

  it('one setting\'s own Reset puts it back to standard, and only it', async () => {
    await setField($('#lgBody input[data-lgset="debrief"]') as HTMLInputElement, '1h30')
    expect(VCONF.debrief).toBe(90)
    await click(setRow('crewRest').querySelector('[data-lgreset]'))
    expect(VCONF.crewRest).toBe(720)
    expect(VCONF.debrief, 'the other change stays').toBe(90)
    expect(setRow('crewRest').classList.contains('off')).toBe(false)
    await click(setRow('debrief').querySelector('[data-lgreset]'))
    expect(VCONF.debrief).toBe(120)
  })

  it('review D2: a bounded text setting, its markup displayed literally', async () => {
    const field = () => $('#lgBody input[data-lgset="reportText"]') as HTMLInputElement
    expect(field()).toBeTruthy(); expect(field().maxLength).toBe(60)
    await setField(field(), '<b>RALLY</b> "&')
    expect(VCONF.reportText).toBe('<b>RALLY</b> "&'); expect(field().value).toBe(VCONF.reportText)
    expect(field().closest('.lgset')!.querySelector('b')).toBeNull()
    expect(field().getAttribute('value')).toBe('<b>RALLY</b> "&')
    await setField(field(), '   '); expect(VCONF.reportText).toBe('IN TIME + WX/NOTAMS')
  })

  it('a setting has ONE box now (D928 — the duplicates went), and a change to it moves the checks that read it', async () => {
    expect($$('#lgBody input[data-lgset="reportLead"]')).toHaveLength(1)
    expect($$('#lgBody input[data-lgset="step"]')).toHaveLength(1)
    await setField($('#lgBody input[data-lgset="reportLead"]') as HTMLInputElement, '2h30')
    expect(VCONF.reportLead).toBe(150)
    expect($('#lgBody .lgchk[data-code="CREW_TIGHT"]').textContent).toContain('2h30')
    await setField($('#lgBody input[data-lgset="reportLead"]') as HTMLInputElement, '3h')
    expect(VCONF.reportLead).toBe(180)
  })

  it('the promoted settings render boxes and take the squadron spellings', async () => {
    /* every edit repaints the built markup, so the box is re-queried before
       each write — the old node is off the DOM the moment the toast fires */
    const box = (k: string) => $(`#lgBody input[data-lgset="${k}"]`) as HTMLInputElement
    /* a clock field takes the squadron's own spellings, H suffix included */
    await setField(box('scDayTo'), '2000H')
    expect(VCONF.scDayTo).toBe(1200)
    await setField(box('scDayTo'), '19:00')
    expect(VCONF.scDayTo).toBe(1140)
    expect(box('simLen'), 'the sim length is editable now').toBeTruthy()
    await setField(box('simLen'), '2h')
    expect(VCONF.simLen).toBe(120)
    await setField(box('simLen'), '5')              // under the floor — refused
    expect(VCONF.simLen).toBe(120)
    expect(box('simLen').value, 'the refused box shows the live value again').toBe('2h')
    await setField(box('simLen'), '90')
    expect(VCONF.simLen).toBe(90)
  })

  it('the clash grading toggles write SHIFT_HARD', async () => {
    const c = $('#lgBody input[data-lgkind="ground"]') as HTMLInputElement
    expect(c).toBeTruthy()
    await act(async () => { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })) })
    expect(SHIFT_HARD.ground).toBe(true)
  })

  it('reset restores the standard exactly', async () => {
    await setField($('#lgBody input[data-lgset="crewRest"]') as HTMLInputElement, '10h')
    await click($('#lgReset'))
    expect(VCONF.crewRest).toBe(720)
    expect(SHIFT_HARD.ground).toBe(false)
    expect(document.body.classList.contains('page-rules-off')).toBe(false)
    await click($('#lgDone'))
  })

  it('a member never renders an editable field', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); setLgEdit(true); notify() })
    expect($$('#lgBody [data-lgset], #lgBody [data-lgkind], #lgBody [data-lgreset]').length).toBe(0)
    expect(($('#lgEdit') as HTMLElement).hidden).toBe(true)
    await act(async () => { setSession({ user: 'a', role: 'admin' }); setLgEdit(false); notify(); rulesReset() })
  })
})

/* W2 (the Codex stack check, 5 Oct 26): the button's WORDS are a squadron's wording preference (D511), not a rule
   any check reads — so they never light the RULES MODIFIED stamp or the "schedule is checked against them" strip;
   the row's own mark and Reset to standard still know them. */
describe('W2 the words the + In-time / Rally button fills in are not a modified RULE', () => {
  it('words alone: no stamp, no strip, Reset still offered; a number brings both back', async () => {
    const { VCONF, rulesReset } = await import('../engine/rules')
    await click($$('.nav a[data-page]').find(a=>a.dataset.page==='logic')!)
    await act(async () => { rulesReset(); VCONF.reportText = 'RALLY'; notify() })
    expect(document.body.classList.contains('page-rules-off')).toBe(false)
    expect(($('#lgOff') as HTMLElement).hidden).toBe(true)
    expect(($('#lgReset') as HTMLElement).hidden).toBe(false)
    expect(setRow('reportText').classList.contains('off')).toBe(true)
    await click($$('.nav a[data-page]').find(a=>a.dataset.page==='viewsched')!)
    expect(document.body.classList.contains('page-rules-off')).toBe(false)
    expect($('#vBanner').classList.contains('rules-off')).toBe(false)
    await act(async () => { VCONF.crewRest = 600; notify() })
    expect(document.body.classList.contains('page-rules-off')).toBe(true)
    expect($('#vBanner').classList.contains('rules-off')).toBe(true)
    await click($$('.nav a[data-page]').find(a=>a.dataset.page==='logic')!)
    expect(($('#lgOff') as HTMLElement).hidden).toBe(false)
    expect($('#lgOff').textContent).toContain('1 setting changed')
    /* the strip's old "not the published ones" was untrue (D928): a published day keeps its printed B and its OIL */
    expect($('#lgOff').textContent).toContain('A published day keeps its printed B and its OIL until it is published again')
    await act(async () => { rulesReset(); notify() })
    expect(document.body.classList.contains('page-rules-off')).toBe(false)
  })
})

describe('the stamp does not need the Logic page (audit2 #6)', () => {
  it('a modified rule stamps the body from the banner path, on any page', async () => {
    const { VCONF } = await import('../engine/rules')
    const was = VCONF.crewRest
    await act(async () => { VCONF.crewRest = 600; notify() })
    expect(document.body.classList.contains('page-rules-off')).toBe(true)
    await act(async () => { VCONF.crewRest = was; notify() })
    expect(document.body.classList.contains('page-rules-off')).toBe(false)
  })
})

/* D561: local clearance updates without recreating search; listeners stop on leave. */
it('D561 observes the topbar size and releases its observer/listener on leaving Logic', async () => {
  await click($$('.nav a[data-page]').find(a=>a.dataset.page==='viewsched')!)
  const top=$('.topbar'), old=top.getBoundingClientRect, original=globalThis.ResizeObserver
  let height=61, resize:()=>void=()=>{}, disconnected=false, observed:Element|null=null
  top.getBoundingClientRect=()=>({height} as DOMRect)
  globalThis.ResizeObserver=class { constructor(callback:()=>void){resize=callback} observe(e:Element){observed=e} disconnect(){disconnected=true} unobserve(){} } as any
  try {
    await click($$('.nav a[data-page]').find(a=>a.dataset.page==='logic')!)
    const bar=$('.lgbar'), search=$('#lgSearch')
    expect(observed).toBe(top);expect(bar.style.top).toBe('61px')
    height=93;resize();expect(bar.style.top).toBe('93px');expect($('#lgSearch')).toBe(search)
    height=75;window.dispatchEvent(new Event('resize'));expect(bar.style.top).toBe('75px')
    await click($$('.nav a[data-page]').find(a=>a.dataset.page==='viewsched')!)
    expect(disconnected).toBe(true);height=120;window.dispatchEvent(new Event('resize'));expect(bar.style.top).toBe('75px')
  } finally {globalThis.ResizeObserver=original;top.getBoundingClientRect=old}
})
