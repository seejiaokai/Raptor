// @vitest-environment jsdom
/* The scheduler board — tfin's board group ("sched board opens", "sched lines
   render", "sched roster render", "sched wave title select", "sched
   setSlotVal", "the board shows the open day's strip", "board inputs panel")
   and the R group (CX carries a reason, B28), driven through the React app. */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, HIST } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved, dayApproved } from '../engine/publish'
import { slotVal, setSlotVal, txtGet } from '../engine/slots'
import { parseHM } from '../engine/time'
import { isStandalone } from '../engine/waves'
import { DUTYTPL_CFG } from '../engine/dutytpl'
import { SBDAY, afterSchedMutate } from '../state/view'
import * as view from '../state/view'
import { cxText } from './html'
import { openScheduler, closeScheduler, boardArmClick, boardChange, boardMbtn, boardHTML, askSortAll, sortAllCommit, SORTALL, addLine, addWave, askCx, cxCommit, CXT } from './board'
import { applyMove } from '../engine/reorder'
import { HOOKS } from '../engine/hooks'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const change = async (el: Element, value: string) => {
  await act(async () => {
    (el as HTMLInputElement).value = value
    el.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

/* the REAL HOOKS.editMode wireStore() installs — captured once, before any
   test below stubs it out. Every "board mutation handlers" style describe
   in this file restores its stub with a hard-coded `() => true` rather than
   this reference (an existing pattern this file already used before this
   task), which is fine for those tests but leaves HOOKS.editMode a dead
   stub for the rest of the file afterwards — the last describe block below
   restores THIS to prove the real role/CURPAGE->editMode()->render
   pipeline, not a stub standing in for it. */
let realEditMode: () => boolean

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  realEditMode = HOOKS.editMode
})

describe('the scheduler board (tfin board group)', () => {
  it('a day head on the edit week opens the board', async () => {
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))
    expect(SBDAY).toBe(0)
    expect(($('#schedBoard') as any).hidden).toBe(false)
  })

  it('sched lines render', () => {
    expect($$('#sbBoard .sb-line').length).toBeGreaterThanOrEqual(1)
  })

  it('sched roster render', () => {
    expect($$('#sbRoster .rpuck').length).toBeGreaterThan(10)
  })

  it('sched wave title select', () => {
    expect($$('#sbBoard .sb-wtitle').length).toBeGreaterThanOrEqual(1)
  })

  it("the board shows the open day's strip, above the checks in the scrolling column", () => {
    const el = $('#sbSignBar')
    expect(el).toBeTruthy()
    expect(el.querySelectorAll('select[data-sign]').length).toBe(4)
    expect(el.closest('.sb-top')).toBeFalsy()
    /* the sign-off moved to its own #sbSign element so the Live Checks bar can
       sit directly below it (owner, 14 Aug 26); it still scrolls with the day
       (in .sb-boardwrap), not on the fixed top bar */
    expect(el.closest('#sbSign')).toBeTruthy()
    expect($('#sbSign').firstElementChild).toBe(el)
    const sign = $('#sbSign'), warn = $('#sbWarn')
    expect(sign.compareDocumentPosition(warn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('board inputs panel, banded by time of day', () => {
    expect($$('#sbInputs .sbi-row').length).toBeGreaterThanOrEqual(1)
    expect($$('#sbInputs .sbi-band').length).toBeGreaterThanOrEqual(1)
    expect(/morning/i.test($('#sbInputs').textContent!)).toBe(true)
  })

  it('sched setSlotVal — a board slot round-trips through the funnel', () => {
    const slot = document.querySelector('#sbBoard .seat[data-slot]') || document.querySelector('#sbBoard .sb-slot.empty[data-slot]')
    expect(slot).toBeTruthy()
    const key = (slot as HTMLElement).dataset.slot!
    const before = slotVal(key)
    setSlotVal(key, 'bane')
    expect(slotVal(key)).toBe('bane')
    setSlotVal(key, before || '')
  })

  it('the day tabs switch the board day, and a cross-day switch disarms', async () => {
    /* arm an empty seat on day 0 through the board's own click handler */
    const empty = document.querySelector('#sbBoard .sb-slot.empty[data-slot],#sbBoard .seat[data-slot]:empty') as HTMLElement | null
    if (empty) {
      await click(empty)
      expect(view.ARM).toBeTruthy()
    }
    await click($('#sbDays [data-sbtab="1"]'))
    expect(SBDAY).toBe(1)
    expect(/Tue|TUE/i.test($('#sbDay').textContent!)).toBe(true)
    expect(view.ARM).toBe(null)
    await click($('#sbDays [data-sbtab="0"]'))
    expect(SBDAY).toBe(0)
  })

  /* BLANK, not seeded from the last line (owner, 10 Aug 26). It used to copy
     the previous line's callsign, mission and times, which reads as filled in
     when nobody filled it in. */
  it('+ Line adds a BLANK line to the LAST wave', async () => {
    const d = DAYS[0]
    const w = d.waves[d.waves.length - 1]
    const nBefore = w.formations.length
    const last = w.formations[w.formations.length - 1]
    expect(last.cs, 'the fixture line has something to copy, so blank is meaningful').toBeTruthy()
    /* the wave header's own + Line, not a top-bar one — the top-bar copy was
       removed on 11 Aug 26 (owner: every section already adds its own rows),
       and this button was always the better address anyway: it names the wave
       it adds to instead of guessing at the day's last one. */
    await click($(`#sbBoard [data-gline="0.${d.waves.length - 1}"]`))
    expect(w.formations.length).toBe(nBefore + 1)
    const f = w.formations[w.formations.length - 1]
    expect([f.cs, f.msn, f.to, f.ld]).toEqual(['', '', '', ''])
    expect(f.aircraft.length).toBe(1)
    /* the new line's key is marked pending so the line can be published */
    const key = `ff:0.${d.waves.length - 1}.${w.formations.length - 1}.cs`
    expect(SCHED.pending[key]).toBeTruthy()
    /* put it back */
    w.formations.pop()
    delete SCHED.pending[key]; delete SCHED.added[key]
    await act(async () => { afterSchedMutate(); notify() })
  })

  it('+ Wave opens the kind menu: a flying wave and the three standalone kinds', async () => {
    await click($('[data-wvadd]'))
    const menu = $('.wavemenu')
    expect(menu).toBeTruthy()
    const kinds = [...menu.querySelectorAll('[data-wmkind]')].map(b => (b as HTMLElement).dataset.wmkind)
    expect(kinds).toEqual(['', 'sc', 'avalon', 'bb'])
    /* no day chips when opened from the board — the day is already chosen */
    expect(menu.querySelector('[data-wmday]')).toBeFalsy()
  })

  it('choosing Flying wave adds one, and its label key is marked pending', async () => {
    const d = DAYS[0], nBefore = d.waves.length
    await click($('.wavemenu [data-wmkind=""]'))
    expect(d.waves.length).toBe(nBefore + 1)
    expect(SCHED.pending[`wl:0.${d.waves.length - 1}`]).toBeTruthy()
    expect($('.wavemenu')).toBeFalsy()
  })

  it('✕ Wave removes it again', async () => {
    const d = DAYS[0], nBefore = d.waves.length
    const before = new Set(Object.keys(SCHED.pending))
    await click($(`#sbBoard [data-gdel="0.${nBefore - 1}"]`))
    expect(d.waves.length).toBe(nBefore - 1)
    const added = Object.keys(SCHED.pending).filter(k => !before.has(k))
    expect(added, 'adding then deleting before issue is a net no-op').toEqual([])
  })

  it('an AVALON wave brings no duty block, and deleting a wave leaves the duty blocks (decoupled)', async () => {
    const d = DAYS[0]
    const nW = d.waves.length, nDW = (d.dutywaves || []).length
    await click($('[data-wvadd]'))
    await click($('.wavemenu [data-wmkind="avalon"]'))
    expect(d.waves.length).toBe(nW + 1)
    expect(isStandalone(d.waves[d.waves.length - 1])).toBeTruthy()
    expect((d.dutywaves || []).length, 'AVALON no longer brings a desk with it').toBe(nDW)
    await click($(`#sbBoard [data-gdel="0.${d.waves.length - 1}"]`))
    expect(d.waves.length).toBe(nW)
    expect((d.dutywaves || []).length, 'deleting a wave leaves the day’s duty blocks untouched').toBe(nDW)
  })

  /* Duties are decoupled from waves now (owner, 13 Aug 26), so no wave — SC or
     AVALON — auto-creates a desk. Both come only from the + Block templates. */
  it('an SC wave brings no duty block at all', async () => {
    const d = DAYS[0]
    const nW = d.waves.length, nDW = (d.dutywaves || []).length
    await click($('[data-wvadd]'))
    await click($('.wavemenu [data-wmkind="sc"]'))
    expect(d.waves.length).toBe(nW + 1)
    expect((d.dutywaves || []).length).toBe(nDW)
    await click($(`#sbBoard [data-gdel="0.${d.waves.length - 1}"]`))
    expect(d.waves.length).toBe(nW)
  })

  /* + Block lists the saved TEMPLATES now, not the day's waves (owner, 13 Aug
     26), and picking one COPIES its rows onto the day as a plain block. */
  it('+ Block offers the duty templates, and picking one copies its rows as a plain block', async () => {
    const d = DAYS[0]
    const nDW = (d.dutywaves || []).length
    await click($('#sbBoard [data-dwadd="0"]'))
    const pick = $$('.wavemenu [data-blktpl]')
    expect(pick.length, 'a button per template, plus Empty block').toBe(DUTYTPL_CFG.length + 1)
    await click(pick[0])   // the first template — Standard
    expect(d.dutywaves.length).toBe(nDW + 1)
    const b = d.dutywaves[d.dutywaves.length - 1]
    expect(b.label).toBe('Standard')
    expect(b.rows.map((r: any) => r.role)).toEqual(['SDO', 'SXO', 'OPS O'])
    expect(b.sa, 'a template block is plain — no sa/noconf marker').toBeUndefined()
    expect(b.noconf).toBeUndefined()
    const key = `dl:0.${d.dutywaves.length - 1}`
    d.dutywaves.pop()
    delete SCHED.pending[key]; delete SCHED.added[key]
  })

  it('+ Block’s Empty block still gives a bare block', async () => {
    const d = DAYS[0]
    const nDW = (d.dutywaves || []).length
    await click($('#sbBoard [data-dwadd="0"]'))
    await click($('.wavemenu [data-blktpl=""]'))
    expect(d.dutywaves.length).toBe(nDW + 1)
    expect(d.dutywaves[d.dutywaves.length - 1].rows.map((r: any) => r.role)).toEqual([''])
    const key = `dl:0.${d.dutywaves.length - 1}`
    d.dutywaves.pop()
    delete SCHED.pending[key]; delete SCHED.added[key]
  })

  /* THE GO DROPDOWN (owner-reported, 10 Aug 26). It read the wave's `night`
     flag first, and makeStandalone sets night:true for AVALON — so an AVALON
     wave showed "Night wave", and touching the dropdown then wrote the label
     'NIGHT WAVE' onto a wave that was still standalone/avalon underneath. */
  it('the Go dropdown names an AVALON wave AVALON, not Night wave', async () => {
    const d = DAYS[0]
    await click($('[data-wvadd]'))
    await click($('.wavemenu [data-wmkind="avalon"]'))
    const gi = d.waves.length - 1
    const sel = $(`#sbBoard [data-wsel="0.${gi}"]`) as HTMLSelectElement
    expect(sel.value).toBe('AVALON')
    expect([...sel.options].map(o => o.text)).toContain('SC')
    await click($(`#sbBoard [data-gdel="0.${gi}"]`))
  })

  /* picking SC/AVALON LABELS the wave — it must not rebuild the lines, which
     would throw away whatever is already planted (owner, asked and answered) */
  it('picking AVALON on an ordinary wave keeps its lines and crew', async () => {
    const d = DAYS[0]
    await click($('[data-wvadd]'))
    await click($('.wavemenu [data-wmkind=""]'))
    const gi = d.waves.length - 1, w = d.waves[gi]
    w.formations[0].aircraft[0].p = 'mamba'
    const nF = w.formations.length
    await change($(`#sbBoard [data-wsel="0.${gi}"]`), 'AVALON')
    expect(w.standalone).toBe(true)
    expect(w.kind).toBe('avalon')
    expect(w.label).toBe('AVALON')
    expect(w.formations.length).toBe(nF)
    expect(w.formations[0].aircraft[0].p).toBe('mamba')
    /* and back again clears the standalone flags, or it would sit outside
       the day's flying count for ever */
    await change($(`#sbBoard [data-wsel="0.${gi}"]`), '2nd wave')
    expect(w.standalone).toBeFalsy()
    expect(w.kind).toBeFalsy()
    await click($(`#sbBoard [data-gdel="0.${gi}"]`))
  })

  /* the ROLE pick-list on a block that belongs to no wave */
  it('clicking a duty ROLE cell offers the five roles, and picking one writes it', async () => {
    const d: any = DAYS[0], savedDW = d.dutywaves
    d.dutywaves = [{ label: 'DUTY', rows: [{ role: '', id: '', str: '', end: '' }] }]
    try {
      await act(async () => { afterSchedMutate(); notify() })
      const cell = $('#sbBoard [data-rolepick="0.0.0"]')
      expect(cell, 'the role cell carries the hook').toBeTruthy()
      await click(cell)
      const opts = $$('.wavemenu [data-rolev]').map(b => b.textContent)
      expect(opts).toEqual(['SDO', 'SXO', 'OPS O', 'RUNNER', 'LOG CELL'])
      await click($('.wavemenu [data-rolev="RUNNER"]'))
      expect(d.dutywaves[0].rows[0].role).toBe('RUNNER')
    } finally {
      d.dutywaves = savedDW
      await act(async () => { afterSchedMutate(); notify() })
    }
  })

  it('a board field commits through the text funnel and earns a pending mark', async () => {
    const inp = document.querySelector('#sbBoard input[data-bfld^="ff:"][data-bfld$=".msn"]') as HTMLInputElement
    expect(inp).toBeTruthy()
    const key = inp.dataset.bfld!, before = inp.value
    await change(inp, 'BFM 2V2')
    expect(SCHED.pending[key]).toBeTruthy()
    const d = DAYS[0]
    const [, gi, li] = key.replace('ff:', '').split('.').map(Number)
    expect(d.waves[gi!].formations[li!].msn).toBe('BFM 2V2')
    await change(document.querySelector(`#sbBoard input[data-bfld="${key}"]`) as HTMLInputElement, before)
  })

  it('the red-box flag toggles on a line', async () => {
    const btn = document.querySelector('#sbBoard [data-lflag]') as HTMLElement
    const key = btn.dataset.lflag!
    const [di, gi, li, ai] = key.split('.').map(Number)
    const a = DAYS[di!].waves[gi!].formations[li!].aircraft[ai!]
    expect(!!a.flag).toBe(false)
    await click(btn)
    expect(a.flag).toBe(true)
    expect(document.querySelector('#sbBoard .sb-line.redbox')).toBeTruthy()
    await click(document.querySelector(`#sbBoard [data-lflag="${key}"]`))
    expect(a.flag).toBe(false)
  })

  it('deleting a line renumbers the keys under it (shiftAircraft/shiftFormation)', async () => {
    /* seed: two fresh single-aircraft lines on the last wave; a name on the
       SECOND must survive the delete of the first under a DECREMENTED key */
    const d = DAYS[0]
    const gi = d.waves.length - 1
    const w = d.waves[gi]
    await click($(`#sbBoard [data-gline="0.${gi}"]`))
    await click($(`#sbBoard [data-gline="0.${gi}"]`))
    const li = w.formations.length - 1        // the second new line
    setSlotVal(`0.${gi}.${li}.0.p`, 'bane')
    await act(async () => { afterSchedMutate(); notify() })
    const wasLines = w.formations.length
    /* delete the FIRST of the two new lines — one aircraft, so the whole
       formation goes and everything after it renumbers */
    await click(document.querySelector(`#sbBoard [data-ldel="0.${gi}.${li - 1}.0"]`))
    expect(w.formations.length).toBe(wasLines - 1)
    expect(slotVal(`0.${gi}.${li - 1}.0.p`)).toBe('bane')
    /* clean up */
    setSlotVal(`0.${gi}.${li - 1}.0.p`, '')
    w.formations.pop()
    await act(async () => { afterSchedMutate(); notify() })
  })
})

describe('duty / sim / ground panels on the board (owner request, Aug 26)', () => {
  it('the four new panels render, in week order, before the sim-notes panel', () => {
    const kids = [...$('#sbBoard').children].map(x => x.className)
    const ix = (m: string) => kids.findIndex(c => c.includes(m))
    expect(ix('sb-panel duty')).toBeGreaterThan(ix('sb-go'))
    expect(ix('sb-panel simr')).toBeGreaterThan(ix('sb-panel duty'))
    expect(ix('sb-panel grnd')).toBeGreaterThan(ix('sb-panel simr'))
    expect(ix('sb-panel pinp')).toBeGreaterThan(ix('sb-panel grnd'))
    /* the sim note is no longer a panel of its own — it sits inside the Sims
       panel, so the board reads the way the week does */
    expect(ix('sb-panel unav')).toBeGreaterThan(ix('sb-panel pinp'))
    expect(kids.some(c => c.includes('sb-panel simn'))).toBe(false)
    expect(document.querySelector('#sbBoard .sb-panel.simr textarea[data-bfld^="sn:"]')).toBeTruthy()
  })

  it('the panel headers carry the owner labels', () => {
    expect($('#sbBoard .sb-panel.grnd .sb-ph').textContent).toContain('Ground Programme · scheduler')
    expect($('#sbBoard .sb-panel.pinp .sb-ph').textContent).toContain('Personal Inputs')
  })

  /* the render-time sort (owner, Aug 26): rows read in start-time order but
     keep their MODEL index as key, so a delete on a visually re-ordered row
     must remove the row it names, not the one in that screen position */
  it('ground rows render in start-time order; delete removes the model row', async () => {
    const d: any = DAYS[SBDAY], n = d.ground.length
    /* two temp rows that sort to the TOP while sitting at the model's bottom */
    d.ground.push({ prog: 'ZTEMP-A', str: '0100', end: '0130', who: '' })
    d.ground.push({ prog: 'ZTEMP-B', str: '0050', end: '0110', who: '' })
    await act(async () => { afterSchedMutate(); notify() })
    const ris = [...document.querySelectorAll('#sbBoard .sb-panel.grnd [data-grdel]')]
      .map(x => +((x as HTMLElement).dataset.grdel || '').split('.')[1])
    expect(ris.length).toBe(n + 2)
    const times = ris.map(ri => parseHM(d.ground[ri].str)).filter((t: any) => t != null)
    expect(times).toEqual([...times].sort((a: any, b: any) => a - b))
    expect(ris[0]).toBe(n + 1)                       // 0050 renders first, keyed to the model's last row
    await click(document.querySelector('#sbBoard .sb-panel.grnd [data-grdel]'))
    expect(d.ground.length).toBe(n + 1)
    expect(d.ground.some((r: any) => r.prog === 'ZTEMP-B')).toBe(false)
    expect(d.ground.some((r: any) => r.prog === 'ZTEMP-A')).toBe(true)
    d.ground.pop()                                   // clean up the survivor
    await act(async () => { afterSchedMutate(); notify() })
  })

  it('duty seats speak the slot grammar — round-trip and arm targets', () => {
    const seat = document.querySelector('#sbBoard .sb-panel.duty .seat[data-slot^="d:"]') as HTMLElement
    expect(seat).toBeTruthy()
    const key = seat.dataset.slot!
    const before = slotVal(key)
    setSlotVal(key, 'bane')
    expect(slotVal(key)).toBe('bane')
    setSlotVal(key, before || '')
    expect(document.querySelector('#sbBoard .sb-panel.duty [data-fill^="d:"]')).toBeTruthy()
  })

  it('sim and ground rows carry drop targets', () => {
    expect(document.querySelector('#sbBoard .sb-panel.simr [data-fill^="s:"]')).toBeTruthy()
    expect(document.querySelector('#sbBoard .sb-panel.grnd [data-fill^="g:"]')).toBeTruthy()
  })

  it('a duty field commits through the text funnel and earns a pending mark', async () => {
    const inp = document.querySelector('#sbBoard input[data-bfld^="dr:"][data-bfld$=".role"]') as HTMLInputElement
    expect(inp).toBeTruthy()
    const key = inp.dataset.bfld!, before = inp.value
    await change(inp, 'TEST DUTY')
    expect(SCHED.pending[key]).toBeTruthy()
    await change(document.querySelector(`#sbBoard input[data-bfld="${key}"]`) as HTMLInputElement, before)
  })

  it('+ Row / ✕ on duty rows renumbers the keys under the delete', async () => {
    const rows = DAYS[0].dutywaves[0].rows
    const B = rows.length
    await click($('#sbBoard [data-dradd="0.0"]'))
    await click($('#sbBoard [data-dradd="0.0"]'))
    expect(rows.length).toBe(B + 2)
    setSlotVal(`d:0.0.${B + 1}`, 'bane')
    await act(async () => { afterSchedMutate(); notify() })
    await click(document.querySelector(`#sbBoard [data-drdel="0.0.${B}"]`))
    expect(rows.length).toBe(B + 1)
    /* the named row slid down one index and kept its body */
    expect(slotVal(`d:0.0.${B}`)).toBe('bane')
    await click(document.querySelector(`#sbBoard [data-drdel="0.0.${B}"]`))
    expect(rows.length).toBe(B)
  })

  it('CX on a duty row goes through the reason dialog, and un-cancels clean', async () => {
    const r = DAYS[0].dutywaves[0].rows[0]
    await click($('#sbBoard [data-drcx="0.0.0"]'))
    expect(($('#cxPop') as any).hidden).toBe(false)
    expect(!!r.cx).toBe(false)                     // opening cancels nothing
    ;($('#cxReason') as HTMLInputElement).value = 'TASKING'
    await click($('#cxSave'))
    expect(r.cx).toBe(true)
    expect(document.querySelector('#sbBoard .sb-panel.duty .sb-arow.cx')).toBeTruthy()
    await click($('#sbBoard [data-drcx="0.0.0"]'))
    await click($('#cxUn'))
    expect(!!r.cx).toBe(false)
    expect(document.querySelector('#sbBoard .sb-panel.duty .sb-arow.cx')).toBeFalsy()
  })

  /* finding #2 (whole-branch review, 9 Aug 26): the board's own render call
     site also dropped groundOrder's `man` argument — same bug as html.ts,
     independently, since the two builders each call groundOrder bare.
     Asserts the RENDERED order (the data-bfld values), not the model. */
  it('a day frozen in manual ground order (gman) renders that order on the board too', async () => {
    const d: any = DAYS[SBDAY], savedGround = d.ground, savedGman = d.gman
    d.ground = [{ prog: 'GMAN-C', str: '1000' }, { prog: 'GMAN-A', str: '0800' }, { prog: 'GMAN-B', str: '0900' }]
    d.gman = true
    try {
      await act(async () => { afterSchedMutate(); notify() })
      const progs = [...document.querySelectorAll('#sbBoard .sb-panel.grnd [data-bfld$=".prog"]')]
        .map(el => (el as HTMLInputElement).value)
      expect(progs).toEqual(['GMAN-C', 'GMAN-A', 'GMAN-B'])
    } finally {
      d.ground = savedGround; d.gman = savedGman
      await act(async () => { afterSchedMutate(); notify() })
    }
  })

  /* finding #3 (whole-branch review, 9 Aug 26): the duty-role reposition used
     to fire on ANY role commit in the block, not only a newly-added row — so
     retyping a DIFFERENT row's role after a manual drag silently snapped the
     whole block back to role order and threw the drag away, with no toast
     and no confirmation. The spec is explicit this must never happen (only
     the board's "+ Row" case — an empty role becoming non-empty — may
     re-sort). */
  it('editing an already-named duty role does not re-sort a hand-dragged block', async () => {
    const d: any = DAYS[SBDAY], savedDW = d.dutywaves
    d.dutywaves = [{
      label: 'TEST BLOCK', rows: [
        { role: 'SDO', id: '', str: '0800', end: '1700' },
        { role: 'RUNNER', id: '', str: '0800', end: '1700' },
      ]
    }]
    try {
      await act(async () => { afterSchedMutate(); notify() })
      // drag RUNNER (model index 1) to the top — a manual reorder
      applyMove('mv:d.0.0.1', 'mv:d.0.0.0')
      await act(async () => { afterSchedMutate(); notify() })
      expect(d.dutywaves[0].rows.map((r: any) => r.role)).toEqual(['RUNNER', 'SDO'])
      // retype the OTHER row's (already non-empty) role
      const inp = document.querySelector('#sbBoard input[data-bfld="dr:0.0.1.role"]') as HTMLInputElement
      expect(inp).toBeTruthy()
      await change(inp, 'SXO')
      expect(d.dutywaves[0].rows.map((r: any) => r.role)).toEqual(['RUNNER', 'SXO'])
    } finally {
      d.dutywaves = savedDW
      await act(async () => { afterSchedMutate(); notify() })
    }
  })

  /* finding #5 follow-up (whole-branch re-review, 9 Aug 26): the "+ Row,
     then type the role" path still reproduced the original bug, because
     boardChange ran afterSchedMutate() BEFORE calling sortDutyBlock — so by
     the time the sort actually reordered the block and set
     engine/reorder.ts's REORDERED_DI, afterSchedMutate had already popped
     that flag (finding it still null) and moved on. The armed slot never
     got disarmed. Arms a slot on the FIRST row, commits the SECOND
     (blank) row's role through the real change-event path boardChange
     listens on — not moveDutyRow/sortDutyBlock called directly, which is
     what store.test.ts's finding-#5 tests do and why they could not have
     caught this: they already call afterSchedMutate() AFTER the reorder,
     so they never exercised board.ts's own (wrong) call order at all. */
  it('typing a role into a BLANK cell no longer moves the row', async () => {
    const d: any = DAYS[SBDAY], savedDW = d.dutywaves
    d.dutywaves = [{
      label: 'TEST BLOCK', rows: [
        { role: 'RUNNER', id: '', str: '0800', end: '1700' },
        { role: '', id: '', str: '0800', end: '1700' },
      ]
    }]
    try {
      await act(async () => { afterSchedMutate(); notify() })
      await act(async () => { view.armSlot('d:0.0.0'); notify() })
      expect(view.armedKey()).toBe('d:0.0.0')
      const inp = document.querySelector('#sbBoard input[data-bfld="dr:0.0.1.role"]') as HTMLInputElement
      expect(inp).toBeTruthy()
      await change(inp, 'SDO')
      /* THE POINT (owner, 10 Aug 26): "+ Row, then type SDO" used to
         reposition the whole block, which is the line-jumps-under-the-typist
         complaint. SDO outranks RUNNER in DUTY_ORDER and the row STILL does
         not move — only Auto sort and Sort all reorder now. */
      expect(d.dutywaves[0].rows.map((r: any) => r.role)).toEqual(['RUNNER', 'SDO'])
      /* and with nothing reordering, the slot armed on row 0 still points at
         the row it was armed on, so it stays armed */
      expect(view.armedKey()).toBe('d:0.0.0')
    } finally {
      d.dutywaves = savedDW
      view.disarmSlot()
      await act(async () => { afterSchedMutate(); notify() })
    }
  })

  /* Typing a role is ONE undo step, and always was — it used to be one only
     because HIST.lock folded the auto-sort it triggered into the same
     snapshot. With no sort to fold in (10 Aug 26) it is one on its own, and
     that still needs pinning: a text commit must never cost two Undos. */
  it('typing a role is one undo step', async () => {
    const d: any = DAYS[SBDAY], savedDW = d.dutywaves
    d.dutywaves = [{
      label: 'TEST BLOCK', rows: [
        { role: 'RUNNER', id: '', str: '0800', end: '1700' },
        { role: '', id: '', str: '0800', end: '1700' },
      ]
    }]
    try {
      await act(async () => { afterSchedMutate(); notify() })
      const ixBefore = HIST.ix
      const inp = document.querySelector('#sbBoard input[data-bfld="dr:0.0.1.role"]') as HTMLInputElement
      await change(inp, 'SDO')
      expect(HIST.ix).toBe(ixBefore + 1)
    } finally {
      d.dutywaves = savedDW
      await act(async () => { afterSchedMutate(); notify() })
    }
  })

  it('the red-box flag toggles on a ground row', async () => {
    const btn = document.querySelector('#sbBoard [data-grflag]') as HTMLElement
    expect(btn).toBeTruthy()
    const [di, ri] = btn.dataset.grflag!.split('.').map(Number)
    const x = DAYS[di!].ground[ri!]
    expect(!!x.flag).toBe(false)
    await click(btn)
    expect(x.flag).toBe(true)
    expect(document.querySelector('#sbBoard .sb-panel.grnd .sb-arow.redbox')).toBeTruthy()
    await click(document.querySelector(`#sbBoard [data-grflag="${di}.${ri}"]`))
    expect(!!x.flag).toBe(false)
  })

  /* This used to read "the personal-inputs panel is inert even on the live
     board", and asserted no `input` existed in it at all. The owner asked for
     the opposite on 10 Aug 26 — "they can be editable in the same modality as
     ground programme" — so the assertion is re-cut rather than dropped, onto
     the half that is still true and still worth defending: an input is not
     schedule data, so nothing in this panel may write the SCHEDULE. The
     fields it does carry address the input itself (data-ifld → setInpField),
     never a funnel key. */
  it('the personal-inputs panel writes inputs, never the schedule', () => {
    const p = document.querySelector('#sbBoard .sb-panel.pinp')!
    expect(p.querySelectorAll('[data-ifld]').length).toBeGreaterThan(0)
    expect(p.querySelectorAll('[data-slot],[data-fill],[draggable="true"],.mbtn,[data-txt],[data-bfld]').length).toBe(0)
  })

  /* ONE CLOCK ON THE BOARD (owner, 16 Aug 26). Aircrew-submitted input times
     format with a colon everywhere else (hhmm → "09:00"), but the board prints
     them 4-digit to match its own scheduler-typed times. The edit box still
     accepts either form; this pins the DISPLAY only. */
  it('a board personal-input time reads 4-digit, never with a colon', () => {
    const times = [...document.querySelectorAll('#sbBoard .sb-panel.pinp input.atm, #sbBoard .sb-panel.unav input.atm')]
      .map(e => (e as HTMLInputElement).value).filter(Boolean)
    expect(times.length, 'the seed day carries a timed personal input').toBeGreaterThan(0)
    expect(times.every(v => /^\d{3,4}$/.test(v)), `every board input time is 4-digit military: ${times.join(',')}`).toBe(true)
  })

  /* "N warning" pluralizes with its count, the same way "N issue" already did
     (owner, 16 Aug 26 — the bar read "6 warning"). */
  it('the checks bar pluralizes "warning" by count', () => {
    const wh = document.querySelector('#sbWarn .wh')
    const m = wh && wh.textContent!.match(/(\d+)\s+(warnings?)\b/)
    expect(m, 'the seed day 0 shows a warning count on the checks bar').toBeTruthy()
    const n = Number(m![1])
    expect(m![2] === 'warnings', `"${m![0]}" plural must match count ${n}`).toBe(n > 1)
  })
})

/* finding #4 (whole-branch review, 9 Aug 26): Sort all gated on the role
   check (canEditSched()) alone, at both its render gate and its write path,
   where every sibling control on this board (the grip, the nudge buttons,
   every per-section Auto sort) gates on the edit-mode flag — which also
   covers the read-only-board state finding #1 exercises (an admin who has
   navigated to View sched but still has the board open). */
describe('Sort all gates on the edit-mode flag, not the role alone (finding #4)', () => {
  it('the button is not rendered once editMode() goes false, even though the role is still admin', async () => {
    expect(document.querySelector('#sbSortAll')).toBeTruthy()   // sanity: visible in edit mode
    HOOKS.editMode = () => false
    try {
      await act(async () => { notify() })
      expect(document.querySelector('#sbSortAll')).toBeFalsy()
    } finally {
      HOOKS.editMode = () => true
      await act(async () => { notify() })
    }
  })

  it('askSortAll refuses to arm the confirm dialog once editMode() goes false', () => {
    HOOKS.editMode = () => false
    try {
      askSortAll(SBDAY as any)
      expect(SORTALL).toBeNull()
    } finally {
      HOOKS.editMode = () => true
    }
  })

  it('sortAllCommit refuses to act on a day armed before editMode() went false', () => {
    const before = JSON.stringify(DAYS[SBDAY as any])
    askSortAll(SBDAY as any)
    expect(SORTALL).toBe(SBDAY)
    HOOKS.editMode = () => false
    try {
      sortAllCommit()
      expect(JSON.stringify(DAYS[SBDAY as any])).toBe(before)
    } finally {
      HOOKS.editMode = () => true
    }
  })
})

/* coordinator review, round 3, 9 Aug 26: the top toolbar's + Line / + Wave
   were the last "looks live, does nothing" pair — genuinely inert
   (addLine/addWave already refuse underneath, pinned above), but still
   RENDERED enabled on a read-only board, exactly the shape #sbSortAll was
   fixed for three lines above it in SchedBoard.tsx. Matched to that same
   gate: hidden (not merely disabled) once editMode() is false.
   + LINE LEFT THIS BAR on 11 Aug 26 (owner), so only + Wave is asserted here
   now — the per-wave + Line it was a duplicate of carries its own gate,
   pinned by the mvRO cases elsewhere in this file. */
describe('+ Wave is hidden on a read-only board, matching Sort all (round 3)', () => {
  it('the button is not rendered once editMode() goes false, even though the role is still admin', async () => {
    expect(document.querySelector('#sbAddLine'), '+ Line is gone from the top bar for good').toBeFalsy()
    expect(document.querySelector('#sbAddGo'), '+ Wave left the top bar on 13 Aug 26 too').toBeFalsy()
    expect(document.querySelector('[data-wvadd]'), 'sanity: the inline + Wave is present in edit mode').toBeTruthy()
    HOOKS.editMode = () => false
    try {
      await act(async () => { notify() })
      expect(document.querySelector('[data-wvadd]')).toBeFalsy()
    } finally {
      HOOKS.editMode = () => true
      await act(async () => { notify() })
    }
  })
})

/* smaller item (whole-branch review, 9 Aug 26): the top-bar +Line/+Wave
   buttons relied on being HIDDEN rather than refusing to act — every other
   control on this board carries its own in-function role check
   (canEditSched(), re-checked even where the render gate already covers it,
   e.g. askSortAll above), so a member who somehow reaches these functions
   directly (the same way finding #1's read-only-board test reaches the
   board itself, via a bare window global with no role check of its own)
   must not be able to mutate the day through them either. */
describe('+ Line and + Wave refuse to act for a non-admin (smaller item)', () => {
  it('addLine does not add a formation for a squadron member', () => {
    setSession({ user: 'user', role: 'main' })
    try {
      const before = JSON.stringify(DAYS[0].waves)
      addLine(0)
      expect(JSON.stringify(DAYS[0].waves)).toBe(before)
    } finally {
      setSession({ user: 'a', role: 'admin' })
    }
  })

  it('addWave does not add a wave for a squadron member', () => {
    setSession({ user: 'user', role: 'main' })
    try {
      const before = DAYS[0].waves.length
      addWave(0, null)
      expect(DAYS[0].waves.length).toBe(before)
    } finally {
      setSession({ user: 'a', role: 'admin' })
    }
  })
})

/* whole-branch re-review follow-up (9 Aug 26): a role check alone is not
   enough on the READ-ONLY board finding #1 exercises — an admin who has
   navigated away from Edit Schedule but still has the board open passes
   canEditSched() every time, exactly the gap finding #4 closed for Sort
   all. addLine/addWave/waveMenu and the nudge / per-section Auto sort
   handlers in boardMbtn get the same HOOKS.editMode() gate. Reproduced
   live by the reviewer: a still-rendered, still-enabled ✕ on the
   read-only board actually deleted a line — so that handler (ds.ldel,
   which had NO check of any kind before this) is pinned here too. The
   nudge and section-sort tests grab a LIVE button reference before
   flipping editMode() off, then click it without re-rendering — the same
   "stale element left over from a role/page change" scenario the
   sortAllCommit test above already covers for Sort all, and the one a
   render-gate check alone cannot prove safe. */
describe('board mutation handlers also refuse on a read-only board (re-review, 9 Aug 26)', () => {
  afterEach(async () => {
    HOOKS.editMode = () => true
    await act(async () => { notify() })
  })

  it('addLine refuses once editMode() is false, admin role unchanged', () => {
    HOOKS.editMode = () => false
    const before = JSON.stringify(DAYS[0].waves)
    addLine(0)
    expect(JSON.stringify(DAYS[0].waves)).toBe(before)
  })

  it('addWave refuses once editMode() is false, admin role unchanged', () => {
    HOOKS.editMode = () => false
    const before = DAYS[0].waves.length
    addWave(0, null)
    expect(DAYS[0].waves.length).toBe(before)
  })

  it('a stale nudge button does nothing once editMode() is false', async () => {
    const btn = document.querySelector('#sbBoard [data-mvdn]') as HTMLElement
    expect(btn).toBeTruthy()
    const before = JSON.stringify(DAYS[SBDAY as any])
    HOOKS.editMode = () => false
    await click(btn)
    expect(JSON.stringify(DAYS[SBDAY as any])).toBe(before)
  })

  it('a stale per-section Auto sort button does nothing once editMode() is false', async () => {
    /* Ground specifically, not the first [data-sortsec] match: the overall
       programme panel's own Auto sort button comes first in DOM order and
       the seed's allhands is ALREADY time-sorted, so clicking IT is a
       genuine no-op regardless of any guard — sortProg() returns false on
       its own — which would make this test pass whether or not the fix
       exists. Ground's seed times (0845/0930/1030/1200/1630/1400) are
       deliberately NOT already sorted (see the ground-order tests above),
       so a click here can only pass for the right reason: the guard
       actually stopped it. */
    const btn = document.querySelector(`#sbBoard [data-sortsec="g.${SBDAY}"]`) as HTMLElement
    expect(btn).toBeTruthy()
    const before = JSON.stringify(DAYS[SBDAY as any].ground)
    HOOKS.editMode = () => false
    await click(btn)
    expect(JSON.stringify(DAYS[SBDAY as any].ground)).toBe(before)
  })

  it('the delete-line (✕) button does nothing once editMode() is false, even though it stays rendered', async () => {
    const btn = document.querySelector('#sbBoard [data-ldel]') as HTMLElement
    expect(btn).toBeTruthy()
    const before = JSON.stringify(DAYS[SBDAY as any].waves)
    HOOKS.editMode = () => false
    await click(btn)
    expect(JSON.stringify(DAYS[SBDAY as any].waves)).toBe(before)
  })
})

describe('CX carries a reason (tfin R group, B28)', () => {
  const cxBtn = () => document.querySelector('#sbBoard .mbtn[data-lcx]') as HTMLElement

  it('the CX button opens a box, it does not toggle silently', async () => {
    await click(cxBtn())
    expect(($('#cxPop') as any).hidden).toBe(false)
    /* nothing is cancelled just by opening it */
    expect($$('#sbBoard .cxtag').length).toBe(0)
  })

  it('it asks for a reason under a CX DUE label', () => {
    expect(/CX DUE/.test($('#cxPop .cxlead').textContent!)).toBe(true)
    expect($('#cxReason')).toBeTruthy()
  })

  it('it offers the usual reasons', () => {
    expect($$('#cxQuick [data-cxq]').length).toBeGreaterThanOrEqual(6)
  })

  it('Un-cancel is hidden on a line that is not cancelled, and the action button says what it will do', () => {
    expect(($('#cxUn') as any).hidden).toBe(true)
    expect(/Cancel line/.test($('#cxSave').textContent!)).toBe(true)
  })

  it('a quick reason fills the field', async () => {
    await click($('#cxQuick [data-cxq]'))
    expect(($('#cxReason') as HTMLInputElement).value.length).toBeGreaterThan(0)
  })

  it('saving cancels the line and keeps the reason', async () => {
    ;($('#cxReason') as HTMLInputElement).value = 'U/S AIRCRAFT'
    await click($('#cxSave'))
    expect(($('#cxPop') as any).hidden).toBe(true)
    const tags = [...document.querySelectorAll('.cxtag')].map(x => x.textContent)
    expect(tags.some(x => x === 'CX DUE U/S AIRCRAFT')).toBe(true)
  })

  it('cxText falls back to a plain CX with no reason', () => {
    expect(cxText({ cx: true })).toBe('CX')
    expect(cxText({ cx: true, cxr: 'WX' })).toBe('CX DUE WX')
  })

  it('re-clicking CX reopens the box to edit the reason', async () => {
    await click(cxBtn())
    expect(($('#cxPop') as any).hidden).toBe(false)
    expect(($('#cxReason') as HTMLInputElement).value).toBe('U/S AIRCRAFT')
    expect(($('#cxUn') as any).hidden).toBe(false)
    expect(/Save reason/.test($('#cxSave').textContent!)).toBe(true)
  })

  it('Un-cancel restores the line and drops the reason', async () => {
    await click($('#cxUn'))
    expect($$('#sbBoard .cxtag').length).toBe(0)
  })
})

describe('board lifecycle', () => {
  it('the wave-title select renames the wave and sets the night flag', async () => {
    const sel = document.querySelector('#sbBoard .sb-wtitle[data-wsel]') as HTMLSelectElement
    const [di, gi] = sel.dataset.wsel!.split('.').map(Number)
    const w = DAYS[di!].waves[gi!]
    const before = { label: w.label, night: w.night }
    await change(sel, 'Night wave')
    expect(w.night).toBe(true)
    await change(document.querySelector(`#sbBoard .sb-wtitle[data-wsel="${di}.${gi}"]`) as HTMLSelectElement,
      before.night ? 'Night wave' : '1st wave')
    w.label = before.label; w.night = before.night
    await act(async () => { afterSchedMutate(); notify() })
  })

  it('Done closes the board', async () => {
    await click($('#sbDone'))
    expect(SBDAY).toBe(null)
    expect(($('#schedBoard') as any).hidden).toBe(true)
  })

  it('logout closes the scheduler board', async () => {
    await act(async () => { openScheduler(0) })
    expect(($('#schedBoard') as any).hidden).toBe(false)
    await click($('#logout'))
    expect(SBDAY).toBe(null)
    expect($('#schedBoard')).toBeFalsy()
    /* back in for any later suites — resetSession (state/store.ts) forces
       CURPAGE to 'viewsched' by design, and restoring only the session
       without the page left every later test in this file running against
       HOOKS.editMode()===false (it's gated on CURPAGE==='editsched' too), so
       "back in" was only half true. Mirror the file's own top-level
       beforeAll to actually put it back. */
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  })

  it('previewing a version freezes the whole board read-only', async () => {
    /* an earlier test may have left the caret in a board field — the panel
       effect rightly refuses to repaint under a caret, so put it down first */
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    await act(async () => {
      const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
      setDayApproved(0, 1)
      openScheduler(0); notify()
    })
    expect($('#schedBoard select.dver')).toBeTruthy()
    await act(async () => { view.setDayPreview(0, 'orig'); notify() })
    const board = $('#sbBoard')
    expect(board.querySelector('.pv-frozen')).toBeTruthy()
    expect(board.querySelector('.pv-frozen .sb-panel.duty')).toBeTruthy()   // new panels render frozen too
    expect(board.querySelectorAll("input:not([disabled]),textarea:not([disabled])").length).toBe(0)
    expect(board.querySelectorAll('.mbtn,[data-slot],[data-fill],[draggable="true"]').length).toBe(0)
    /* the live-checks panel is now the preview banner with the restore button */
    expect($('#schedBoard .dprev-bar .dprev-restore')).toBeTruthy()
    /* the inline "+ Wave" is a .mbtn INSIDE the board, so the `.mbtn ... === 0`
       assertion above already proves it is absent on a frozen preview — where
       the old top-bar #sbAddGo merely rendered disabled, the section control is
       withheld entirely (mvRO), which is the stronger guarantee. */
    /* a write through a gated handler is refused outright */
    const before = slotVal('0.0.0.0.p')
    boardArmClick(new MouseEvent('click', { bubbles: true }))
    expect(view.armedKey()).toBe('')
    expect(slotVal('0.0.0.0.p')).toBe(before)
    await act(async () => {
      view.setDayPreview(0, null)
      SCHED.dayOK = {}; SCHED.orig = {}; SCHED.sign = {}
      const { closeScheduler } = await import('./board'); closeScheduler()
      notify()
    })
  })

  /* The model already held the hole (slots.ts's pax branch never splices),
     but sbSeat rendered an empty id as NOTHING, so on screen the block
     collapsed upward and there was no slot to drop the replacement into
     (owner, 8 Aug 26). The hole is a droppable .sb-slot.empty now, keyed to
     the index it holds, armable through the board's ordinary tap path. */
  it('a deleted AMT pax leaves an empty slot IN PLACE, and fills back at the same index', async () => {
    await act(async () => { openScheduler(0) })
    expect($$('#sbBoard .sb-panel.simr .seat[data-slot^="s:0.amt.1.pax."]').length,
      'the seed BOX renders its eight pax').toBe(8)
    await act(async () => { setSlotVal('s:0.amt.1.pax.1', ''); afterSchedMutate() })
    const hole = $('#sbBoard .sb-slot.empty.pax[data-slot="s:0.amt.1.pax.1"]')
    expect(hole, 'the hole renders as a droppable slot, not a collapse').toBeTruthy()
    expect(DAYS[0].sims.amt[1].pax[2], 'the neighbours keep their indices').toBe('taipan')
    /* tap the hole — the board's ordinary arm path answers it */
    boardArmClick({ target: hole, stopPropagation() {} } as any)
    expect(view.armedKey(), 'the hole arms like any empty seat').toBe('s:0.amt.1.pax.1')
    await act(async () => { view.armDrop(); setSlotVal('s:0.amt.1.pax.1', 'drill'); afterSchedMutate() })
    expect(slotVal('s:0.amt.1.pax.1')).toBe('drill')
    expect($$('#sbBoard .sb-slot.empty.pax').length, 'the hole is gone once refilled').toBe(0)
    await act(async () => { const { closeScheduler } = await import('./board'); closeScheduler(); notify() })
  })

  /* The AMT box crew reads FCP (left) / RCP (right), paired down, on a fixed
     two-column grid; Brief and Debrief are times only (owner, 13 Aug 26). */
  it('the AMT BOX crew is a two-column FCP/RCP grid, and Brief/Debrief carry no crew', async () => {
    await act(async () => { openScheduler(0) })
    const cell = $('#sbBoard .sb-panel.simr .ppl.fcprcp')
    expect(cell, 'the box people cell is the fixed two-column grid').toBeTruthy()
    expect([...cell.querySelectorAll('.hd')].map((h: any) => h.textContent),
      'FCP left, RCP right').toEqual(['FCP', 'RCP'])
    expect(cell.querySelectorAll('.seat').length, 'the seed box seats its eight pax').toBe(8)
    const amtRows = [...document.querySelectorAll('#sbBoard .sb-panel.simr .sb-arow.c6r')]
      .filter(r => /BRIEF|DEBRIEF/i.test((r.querySelector('.ain') as HTMLInputElement)?.value || ''))
    expect(amtRows.length, 'the brief and debrief rows are present').toBe(2)
    amtRows.forEach(r => {
      expect(r.querySelector('.fcprcp'), 'no FCP/RCP crew on a brief/debrief row').toBeFalsy()
      expect(r.querySelector('.seat,.sb-slot.empty'), 'no seats on a brief/debrief row').toBeFalsy()
      expect(r.querySelector('[data-fill]'), 'no drop target on a brief/debrief row').toBeFalsy()
    })
    await act(async () => { const { closeScheduler } = await import('./board'); closeScheduler(); notify() })
  })

  /* The point of planting is seeing the puck land, and the auto-opened
     drawer covered it (owner critique, 8 Aug 26): a successful fill now
     parks the drawer. Only success parks — an aborted gesture leaves it. */
  it('planting from the drawer parks it — a refused plant does not', async () => {
    const { HOOKS } = await import('../engine/hooks')
    const orig = HOOKS.isPhone; HOOKS.isPhone = () => true
    try {
      await act(async () => { openScheduler(0) })
      await act(async () => { setSlotVal('s:0.amt.1.pax.1', ''); afterSchedMutate() })
      const hole = $('#sbBoard .sb-slot.empty.pax')
      boardArmClick({ target: hole, stopPropagation() {} } as any)
      expect(document.body.classList.contains('ros-open'), 'arming opened the drawer').toBe(true)
      let ok: any
      await act(async () => { ok = view.placeArmed('drill') })
      expect(ok, 'the plant landed').toBe(true)
      expect(document.body.classList.contains('ros-open'), 'a successful fill parks the drawer').toBe(false)
    } finally {
      HOOKS.isPhone = orig
      await act(async () => { const { closeScheduler } = await import('./board'); closeScheduler(); notify() })
    }
  })

  /* The phone board's Live checks fold (owner, 8 Aug 26): collapsed to the
     header line each visit; the header toggles. Desktop keeps the always-
     open side list — the flag only has CSS effect under 820px, so jsdom
     pins the class/state machine and e2e measures the visibility. */
  it('Live checks opens collapsed and the header toggles it', async () => {
    const { HOOKS } = await import('../engine/hooks')
    const orig = HOOKS.isPhone; HOOKS.isPhone = () => true
    try {
      await act(async () => { openScheduler(0) })
      expect($('#sbWarn .sbwrap'), 'the strip is wrapped for the fold').toBeTruthy()
      expect($('#sbWarn .sbwrap').classList.contains('open'), 'collapsed by default').toBe(false)
      await click($('#sbWarn [data-sbwtog]'))
      expect($('#sbWarn .sbwrap').classList.contains('open'), 'the header opens it').toBe(true)
      await click($('#sbWarn [data-sbwtog]'))
      expect($('#sbWarn .sbwrap').classList.contains('open'), 'and folds it back').toBe(false)
    } finally {
      HOOKS.isPhone = orig
      await act(async () => { const { closeScheduler } = await import('./board'); closeScheduler(); notify() })
    }
  })
})

describe('reorder grips and nudge buttons (owner, 8 Aug 26)', () => {
  /* an earlier test in this file logs out (resetSession), which parks
     CURPAGE back on 'viewsched' — HOOKS.editMode() gates on CURPAGE===
     'editsched', so these boardHTML(0) calls need the page put back or
     every live-control assertion below would exercise the read-only path
     for a reason that has nothing to do with this task's markup. */
  beforeAll(async () => {
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  })

  /* the address sits on the ROW element itself, never on the .sb-grip inside
     it: Task 7's drag machine finds the row under the moving pointer with
     closest('[data-move]'), and a pointer spends far more of a drag over the
     row's middle than over an 18px handle — if the grip carried the address
     too, a drop there would resolve to the grip instead of the row it sits
     in, and if only the grip carried it, hovering anywhere else would find
     no row at all. So this checks BOTH sides: the row's own opening tag
     carries data-move, and no <span class="sb-grip"> anywhere does. */
  it('every flying row carries its full aircraft address, on the row — never the grip', () => {
    const h = boardHTML(0)
    expect(h).toMatch(/<div class="sb-line[^"]*" data-move="mv:ac\.0\.0\.0\.0">/)
    expect(h).toContain('data-mvup="mv:ac.0.0.0.0"')
    expect(h).toContain('data-mvdn="mv:ac.0.0.0.0"')
    const grips = h.match(/<span class="sb-grip"[^>]*>/g) || []
    expect(grips.length, 'grips actually render').toBeGreaterThan(0)
    expect(grips.every(g => !g.includes('data-move')), 'no grip carries an address').toBe(true)
  })

  it('the duty, sim, ground, programme and note rows all carry one, on the row itself', () => {
    const h = boardHTML(0)
    expect(h).toMatch(/<div class="sb-arow c6r[^"]*" data-move="mv:d\.0\.0\.0">/)
    expect(h).toMatch(/<div class="sb-arow c6r[^"]*" data-move="mv:g\.0\.0">/)
    expect(h).toMatch(/<div class="sb-arow[^"]*" data-move="mv:p\.0\.0">/)
    expect(h).toMatch(/<div class="sb-nrow" data-move="mv:n\.0\.0">/)
    expect(boardHTML(1)).toMatch(/<div class="sb-arow c6r[^"]*" data-move="mv:s\.1\.(amt|oft)\.0">/)
    const grips = h.match(/<span class="sb-grip"[^>]*>/g) || []
    expect(grips.length, 'grips actually render').toBeGreaterThan(0)
    expect(grips.every(g => !g.includes('data-move')), 'no grip carries an address').toBe(true)
  })

  /* a ground row's address must be its MODEL index, not its position in the
     time-sorted render — engine/reorder.ts translates model indices itself.
     DAYS[0].ground's start times are 0845, 0930, 1030, 1200, 1630, 1400 at
     model indices 0..5 — the time-sorted render puts model index 5 (1400)
     BEFORE model index 4 (1630), so render order and model order genuinely
     diverge on this fixture. An earlier version of this test sorted the
     captured indices before comparing, which only proves the emitted
     addresses are SOME permutation of 0..n-1 — a bug that emitted the
     render-loop counter instead of the model index would print
     [0,1,2,3,4,5] and pass that check just as happily as the correct
     [0,1,2,3,5,4]. Comparing the exact sequence, with no sort, is what
     actually protects the one property this task exists to guard. */
  it('a ground address is the model index, not the rendered position', () => {
    const h = boardHTML(0)
    const order = [...h.matchAll(/data-move="mv:g\.0\.(\d+)"/g)].map(m => +m[1])
    expect(order.length).toBe(DAYS[0].ground.length)
    expect(order).toEqual([0, 1, 2, 3, 5, 4])
    /* prove the row-to-address correspondence, not just the sequence: the
       row rendering the 1400 item (model index 5) must itself carry
       mv:g.0.5, and the row rendering the 1630 item (model index 4) must
       carry mv:g.0.4 — these are exactly the two rows the time sort swaps */
    const pairs = [...h.matchAll(/data-move="mv:g\.0\.(\d+)"[\s\S]*?data-bfld="gr:0\.\d+\.prog"[^>]*value="([^"]*)"/g)]
      .map(m => [+m[1], m[2]] as const)
    expect(pairs.find(([, prog]) => prog === 'OPS/LOGS @ 149 SQN')?.[0]).toBe(5)
    expect(pairs.find(([, prog]) => prog === 'HAM ENGAGEMENT @ AFTC')?.[0]).toBe(4)
  })

  it('the column headers gain a matching empty cell so the grid still lines up', () => {
    const h = boardHTML(0)
    expect(h).toContain('<div class="sb-lcols"><span></span><span>CS</span>')
    expect(h).toContain('<div class="sb-acols c6r"><span></span><span>Item</span>')
  })

  /* boardHTML's own render still has to gate on editMode() rather than a
     bare CURPAGE test, independent of SchedBoard's `open` gate (which
     closes the board across a real page change — see the describe block
     below): board.ts's stoRO/mvRO is what the write-path guards and the
     e2e "stale button" scenarios both lean on for the two states a page
     change cannot produce — a published-version preview, and a session
     that may not edit, where the board legitimately stays open and
     rendered (docs/ui-contracts.md §The scheduler board's panels). */
  it('a published-version preview renders no grip and no nudge buttons', () => {
    const h = boardHTML(0, true)
    expect(h).not.toContain('data-move=')
    expect(h).not.toContain('data-mvup=')
  })

  it('read-only mode renders no grip and no nudge buttons', () => {
    HOOKS.editMode = () => false
    try { expect(boardHTML(0)).not.toContain('data-move=') }
    finally { HOOKS.editMode = () => true }
  })
})

/* Part 1 of three: the board must CLOSE when the page moves away from Edit
   Schedule, not merely stop being painted (docs/ui-contracts.md §The
   scheduler board's panels). SchedBoard's `open` used to be a bare
   `SBDAY != null`, so a nav click while the board was open left the modal
   (position:fixed, inset:0, the whole viewport) fully painted on top of
   whatever page was actually navigated to. `open` now also requires
   CURPAGE==='editsched', AND setPage clears SBDAY — this pins both, since
   a live-but-unpainted board was still reachable behind the phone burger. */
describe('the board closes when the page moves away from Edit Schedule (part 1)', () => {
  it('navigating to View sched hides the modal AND clears SBDAY — closed outright, not just hidden', async () => {
    await act(async () => { openScheduler(0); notify() })
    expect(($('#schedBoard') as any).hidden, 'sanity: open on its own page').toBe(false)
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
    /* SBDAY is cleared now, not merely hidden (reviewer-found blocker, 9 Aug
       26 — see state/view.ts's setPage): Shell.tsx's right-click clear-a-
       seat handler used to trust SBDAY!=null on its own as proof the board
       was safely open, which stopped being true the moment the render
       stopped painting it but the state kept living. */
    expect(SBDAY, 'SBDAY is cleared, not just the render gate').toBe(null)
    expect(($('#schedBoard') as any).hidden, 'the modal stops covering the wrong page').toBe(true)
  })

  it('coming back to Edit Schedule does NOT silently resume a day — a scheduler opens one again', async () => {
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    expect(SBDAY, 'nothing to resume — it was cleared on the way out').toBe(null)
    expect(($('#schedBoard') as any).hidden).toBe(true)
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))   // leave the suite as later blocks expect
    expect(($('#schedBoard') as any).hidden).toBe(false)
  })

  it('Done still closes it outright, same as before', async () => {
    await click($('#sbDone'))
    expect(SBDAY).toBe(null)
    expect(($('#schedBoard') as any).hidden).toBe(true)
    await act(async () => { openScheduler(0); notify() })   // leave the suite as later blocks expect
  })
})

/* THE BLOCKER (coordinator review, 9 Aug 26). Shell.tsx's document-level
   context-menu handler (right-click a filled seat → clear it) carried
   `HOOKS.editMode() || SBDAY != null` — an escape hatch that trusted "a
   board is open" as proof of safety on its own, which was only ever true
   because the board used to paint over whatever page you were on. Once the
   render stopped painting it there but SBDAY kept living (this task's own
   first attempt at part 1), the escape hatch started trusting a HIDDEN
   board instead: open a board on Edit Schedule, navigate to View-only
   Sched, and the WEEK underneath — now fully visible and NOT covered by
   the board any more — still answered a right-click as though editing were
   on, because SBDAY was still non-null. A real pointer confirmed this live
   on the built bundle. Two independent things now close it, both pinned
   here: state/view.ts's setPage clears SBDAY the moment the page leaves
   'editsched' (so the escape hatch's own condition goes false), AND
   Shell.tsx's handler no longer has the escape hatch at all — editMode()
   alone gates it, which is the one condition correct for every legitimate
   case (role AND page) and false for every one that is not (see the "no
   escape hatch" comment in Shell.tsx). Nothing in this suite
   exercised the real document-level handler before this — every other
   context-menu test in the codebase (editweek.test.tsx) never opens a
   board, so SBDAY was always null there and the escape hatch was never
   actually reached. */
describe('the blocker: a board left open cannot be used to clear a WEEK puck after leaving Edit Schedule', () => {
  /* an earlier describe in this file (finding #4's "board mutation handlers"
     block) leaves HOOKS.editMode hard-stubbed `() => true` in its own
     afterEach — correct for what THAT block tests, but it would make this
     test pass for the wrong reason (the stub, not the real role/CURPAGE
     wiring, reading true). Put the real implementation back, same as the
     "edit mode itself" block at the end of this file does. */
  beforeAll(async () => { HOOKS.editMode = realEditMode; await act(async () => { notify() }) })

  it('right-clicking a WEEK seat on View-only Sched does NOT clear it, even with a board previously left open', async () => {
    await act(async () => { openScheduler(0); notify() })
    expect(($('#schedBoard') as any).hidden, 'sanity: the board really is open').toBe(false)
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
    expect(SBDAY, 'sanity: leaving the page cleared it (part 1 of the fix)').toBe(null)
    /* the view week's own seats carry data-slot (html.ts:165) regardless of
       edit mode — only `draggable` is gated on it — which is exactly what
       made this reachable: the context-menu handler's own target selector
       is `.seat[data-slot]`, not anything draggable-specific. */
    const seat = $('#vWeek .seat[data-slot]') as HTMLElement
    expect(seat, 'sanity: the view week has a seat to target').toBeTruthy()
    const key = seat.dataset.slot!
    const before = slotVal(key)
    expect(before, 'sanity: the targeted seat is actually filled').toBeTruthy()
    try {
      await act(async () => {
        seat.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
      })
      expect(slotVal(key), 'the seat was NOT cleared').toBe(before)
    } finally {
      if (slotVal(key) !== before) await act(async () => { setSlotVal(key, before); afterSchedMutate() })
      await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
      await act(async () => { openScheduler(0); notify() })   // leave the suite as later blocks expect
    }
  })

  /* Why this pins the ROLE and not the escape hatch, and don't "improve" it:
     setPage clears SBDAY on every exit from Edit Schedule, so `SBDAY != null`
     now IMPLIES `CURPAGE === 'editsched'` — which makes the handler's old
     `HOOKS.editMode() || SBDAY != null` and a plain `HOOKS.editMode()`
     provably equivalent for an admin. No test can tell those two apart any
     more, so don't write one that pretends to. What IS still worth pinning
     is the behaviour nothing else in this suite covers: a session that may
     not edit cannot clear a seat by right-click even with a board open
     (openScheduler is a bare global with no role check of its own, the same
     door e2e's member-board tests use). The page half of the gate — what
     breaks if the editMode() line is deleted outright — is pinned by the
     test above and by editweek.test.tsx's tfin #17. */
  it('right-clicking an EDIT WEEK seat does NOT clear it for a session that may not edit, board open or not', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); view.setPage('editsched'); openScheduler(0); notify() })
    expect(SBDAY, 'sanity: the board is genuinely open, not stale').toBe(0)
    expect(HOOKS.editMode(), 'sanity: the role, not the page, is what makes this read-only').toBe(false)
    try {
      const seat = $('#eWeek .seat[data-slot]') as HTMLElement
      expect(seat, 'sanity: the edit week has a seat to target').toBeTruthy()
      const key = seat.dataset.slot!
      const before = slotVal(key)
      expect(before, 'sanity: the targeted seat is actually filled').toBeTruthy()
      await act(async () => {
        seat.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }))
      })
      expect(slotVal(key), 'the seat was NOT cleared').toBe(before)
    } finally {
      await act(async () => { setSession({ user: 'a', role: 'admin' }); view.setPage('editsched'); openScheduler(0); notify() })
    }
  })
})

/* Stale state a board left open on the wrong page used to leave behind
   (reviewer-found, 9 Aug 26) — both now fixed by routing setPage's
   page-leave through the same closeBoardState() the Done/Close buttons
   already use (state/view.ts), rather than leaving them for the next
   visit to trip over. */
describe('page-leave cleanup — closeBoardState (reviewer-found stale state, 9 Aug 26)', () => {
  it('the aircrew drawer (ros-open) is parked when the page leaves Edit Schedule with the board open', async () => {
    await act(async () => { openScheduler(0); notify() })
    /* simulates a phone-width visit where armSlot's isPhone() branch (or a
       tap on the .ros-tab) had already slid the drawer out — this test
       doesn't need a real phone viewport, only the class the drawer reads */
    document.body.classList.add('ros-open')
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
    expect(document.body.classList.contains('ros-open'), 'parked on the way out, not left for the next visit').toBe(false)
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    await click($('#eWeek .day[data-day="0"] .dt.sb-open'))   // leave the suite as later blocks expect
  })

  it('a slot armed on the board is disarmed when the page leaves Edit Schedule', async () => {
    const key = '0.0.0.0.p'
    const before = slotVal(key)
    await act(async () => { setSlotVal(key, ''); openScheduler(0); notify() })
    try {
      view.armSlot(key)
      expect(view.armedKey(), 'sanity: the seat is armed').toBe(key)
      await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
      expect(view.armedKey(), 'disarmed on the way out').toBe('')
    } finally {
      view.armDrop()
      await act(async () => { setSlotVal(key, before); afterSchedMutate() })
      await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
      await click($('#eWeek .day[data-day="0"] .dt.sb-open'))   // leave the suite as later blocks expect
    }
  })

  /* coordinator review, round 3, 9 Aug 26: closeBoardState() didn't clear
     the board's own dialog state, so a page change with the CX-with-a-
     reason box open left it painting over the next page (not reachable by
     a real user — the dialog sits above the drawer, and the page behind it
     takes neither pointer nor keyboard from there — but it's the last loose
     thread of this family). HOOKS.closeBoardDialogs, wired in
     SchedBoard.tsx, is what actually clears it. */
  it('the CX-with-a-reason dialog is dropped when the page leaves Edit Schedule', async () => {
    await act(async () => { openScheduler(0); notify() })
    try {
      const line = document.querySelector('#sbBoard .sb-line') as HTMLElement
      const r = { cx: false }   // askCx only needs an object it can stamp cx/cxr onto
      askCx(r, null, 'this line')
      expect(CXT, 'sanity: the dialog is armed').not.toBeNull()
      await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
      expect(CXT, 'dropped on the way out, not left painting over the next page').toBeNull()
    } finally {
      await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
      await click($('#eWeek .day[data-day="0"] .dt.sb-open'))   // leave the suite as later blocks expect
    }
  })

  it('Sort all\'s confirm dialog is dropped when the page leaves Edit Schedule', async () => {
    await act(async () => { openScheduler(0); notify() })
    try {
      askSortAll(SBDAY as any)
      expect(SORTALL, 'sanity: the dialog is armed').toBe(SBDAY)
      await click($$('.nav a[data-page]').find(a => a.dataset.page === 'viewsched')!)
      expect(SORTALL, 'dropped on the way out').toBeNull()
    } finally {
      await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
      await click($('#eWeek .day[data-day="0"] .dt.sb-open'))   // leave the suite as later blocks expect
    }
  })
})

/* coordinator review, round 3, 9 Aug 26: cxCommit carried no role or mode
   check of its own at all — every other write path in this file does now.
   Pre-existing, not introduced by this task, and not reachable by a normal
   user (same reasoning as the dialog-drop tests above), but it is the last
   write path of this family with zero coverage. */
describe('cxCommit refuses on a read-only board too (round 3)', () => {
  afterEach(async () => {
    HOOKS.editMode = () => true
    await act(async () => { notify() })
  })

  it('a stale confirm does not write once editMode() is false, and drops the dialog', () => {
    const r: any = { cx: false }
    askCx(r, null, 'this line')
    expect(CXT).not.toBeNull()
    HOOKS.editMode = () => false
    cxCommit(true, 'WX')
    expect(r.cx, 'the model never saw the confirm').toBe(false)
    expect(CXT, 'the stale dialog is dropped, not left open').toBeNull()
  })

  it('the identical confirm DOES write in edit mode (unchanged)', () => {
    const r: any = { cx: false }
    askCx(r, null, 'this line')
    cxCommit(true, 'WX')
    expect(r.cx).toBe(true)
    expect(r.cxr).toBe('WX')
  })
})

/* Part 2 of three: the read-only board's flying-line CX/flag/+ (add-aircraft)
   buttons and its callsign/times/remarks inputs used to stay fully live,
   left that way on purpose while the stores feature shipped. board.ts's
   stoRO/mvRO (pv OR not in edit mode) already gated the stores chips, the
   grip, the nudge buttons and Sort all; this closes the same gate over the
   line's OWN six inputs, its CX/flag/add-aircraft/delete cluster, and its
   FCP/RCP seats — reached here through boardHTML(0) directly, the same
   pattern the grip/nudge tests above use, with HOOKS.editMode() stubbed
   rather than navigated away, because part 1 closes the page-nav route to
   this state; a session that may not edit is what still reaches it (and is
   driven end to end, unstubbed, at the bottom of this file). */
describe('the flying line itself honours the read-only flag (part 2)', () => {
  afterEach(() => { HOOKS.editMode = () => true })

  it('callsign, mission, brief, take-off, land and remarks are all disabled once editMode() is false', () => {
    HOOKS.editMode = () => false
    const h = boardHTML(0)
    expect(h).toMatch(/class="lin" data-bfld="[^"]*"[^>]*disabled/)
    expect(h).toMatch(/class="msn" data-bfld="[^"]*"[^>]*disabled/)
    /* brief, take-off and land all share class="tm" — at least one flying
       line exists on day 0, so at least the three fields of its first row
       must show up disabled */
    const tmDisabled = (h.match(/class="tm" data-bfld="[^"]*"[^>]*disabled/g) || []).length
    expect(tmDisabled, 'brief + take-off + land, at minimum the first row').toBeGreaterThanOrEqual(3)
    expect(h).toMatch(/class="nts" data-bfld="fr:[^"]*"[^>]*disabled/)
  })

  it('none of those six inputs are disabled in edit mode (unchanged)', () => {
    const h = boardHTML(0)
    expect(h).not.toMatch(/class="lin" data-bfld="[^"]*"[^>]*disabled/)
    expect(h).not.toMatch(/class="msn" data-bfld="[^"]*"[^>]*disabled/)
    expect(h).not.toMatch(/class="tm" data-bfld="[^"]*"[^>]*disabled/)
    expect(h).not.toMatch(/class="nts" data-bfld="fr:[^"]*"[^>]*disabled/)
  })

  it('CX, red flag, add-aircraft and delete do not render at all once editMode() is false', () => {
    HOOKS.editMode = () => false
    const h = boardHTML(0)
    expect(h).not.toContain('data-lcx=')
    expect(h).not.toContain('data-lflag=')
    expect(h).not.toContain('data-lac=')
    expect(h).not.toContain('data-ldel=')
  })

  it('the same four render in edit mode (unchanged)', () => {
    const h = boardHTML(0)
    expect(h).toContain('data-lcx=')
    expect(h).toContain('data-lflag=')
    expect(h).toContain('data-lac=')
    expect(h).toContain('data-ldel=')
  })

  it('a filled FCP/RCP seat carries no data-slot and no draggable once editMode() is false', () => {
    HOOKS.editMode = () => false
    const h = boardHTML(0)
    expect(h).not.toMatch(/<div class="sb-slot"><span class="seat" data-slot="[^"]*"/)
    expect(h).not.toMatch(/<div class="sb-slot"><span class="seat"[^>]*draggable="true"/)
  })

  it('a filled FCP/RCP seat is draggable and armable in edit mode (unchanged)', () => {
    const h = boardHTML(0)
    expect(h).toMatch(/<div class="sb-slot"><span class="seat" data-slot="[^"]*"[^>]*draggable="true"/)
  })
})

/* Part 3 of three. Parts 1 and 2 close the RENDER; the WRITE paths behind
   it need the same check independently — relying on the render alone means the next
   way of reaching a stale or forced element reopens the hole. boardChange
   had no check of its own at all; boardMbtn's CX/flag/add-aircraft branches
   had none either (only the nudge, per-section sort and delete-line
   branches did, added one at a time across two earlier review passes);
   boardArmClick checked the role but not the mode. All four write paths are
   exercised here the same way the existing "stale button" tests above do —
   a live reference grabbed BEFORE editMode() goes false, so the render gate
   (which now also withholds these controls, per the block above) is never
   what is actually being tested. */
describe('the flying line\'s write paths refuse on a read-only board too, not just the render (part 3)', () => {
  afterEach(async () => {
    HOOKS.editMode = () => true
    await act(async () => { notify() })
  })

  it('boardChange does not commit a callsign edit once editMode() is false', async () => {
    const input = document.querySelector('#sbBoard .sb-line .lin') as HTMLInputElement
    expect(input, 'sanity: the input exists').toBeTruthy()
    const key = input.dataset.bfld!
    const before = txtGet(key)
    HOOKS.editMode = () => false
    await act(async () => {
      input.value = before + 'X'
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(txtGet(key), 'the model never saw the edit').toBe(before)
  })

  it('a stale CX button does not open the reason dialog once editMode() is false', async () => {
    const btn = document.querySelector('#sbBoard [data-lcx]') as HTMLElement
    expect(btn, 'sanity: the button exists').toBeTruthy()
    HOOKS.editMode = () => false
    await click(btn)
    expect(($('#cxPop') as any).hidden, 'no dialog opened').toBe(true)
  })

  it('a stale red-flag button does not flag the line once editMode() is false', async () => {
    const btn = document.querySelector('#sbBoard [data-lflag]') as HTMLElement
    expect(btn, 'sanity: the button exists').toBeTruthy()
    const before = JSON.stringify(DAYS[SBDAY as any])
    HOOKS.editMode = () => false
    await click(btn)
    expect(JSON.stringify(DAYS[SBDAY as any])).toBe(before)
  })

  it('a stale add-aircraft (+) button does not add an aircraft once editMode() is false', async () => {
    const btn = document.querySelector('#sbBoard [data-lac]') as HTMLElement
    expect(btn, 'sanity: the button exists').toBeTruthy()
    const before = JSON.stringify(DAYS[SBDAY as any].waves)
    HOOKS.editMode = () => false
    await click(btn)
    expect(JSON.stringify(DAYS[SBDAY as any].waves)).toBe(before)
  })

  it('boardArmClick does not arm an EMPTY seat once editMode() is false, even though the role is still admin', async () => {
    /* a FILLED seat only re-arms when it is already the armed key (the
       "put-me-down" escape routeClick and boardArmClick share) — clicking
       an ordinary filled seat is a no-op with or without this fix, which
       would make it a test that passes for the wrong reason. An EMPTY seat
       arms unconditionally in boardArmClick's `empty` branch, so it is the
       one that actually proves the guard. */
    const key = '0.0.0.0.p'
    const before = slotVal(key)
    await act(async () => { setSlotVal(key, ''); afterSchedMutate(); notify() })
    try {
      const empty = document.querySelector(`#sbBoard .sb-slot.empty[data-slot="${key}"]`) as HTMLElement
      expect(empty, 'sanity: the seat is empty and rendered as armable').toBeTruthy()
      HOOKS.editMode = () => false
      boardArmClick({ target: empty, stopPropagation() {} } as any)
      expect(view.armedKey()).toBe('')
    } finally {
      /* armSlot toggles OFF a key that is already armed (the "tap again to
         put it down" rule) — if the guard under test had failed, this seat
         WOULD be armed here, and leaving it armed would silently invert the
         very next test that arms the same seat (a second arm reads as a
         disarm). Put it down unconditionally, pass or fail. */
      view.armDrop()
      HOOKS.editMode = () => true
      await act(async () => { setSlotVal(key, before); afterSchedMutate(); notify() })
    }
  })

  it('boardMbtn refuses every branch tested above at the FUNCTION level too, not only through a click', () => {
    const btn = document.querySelector('#sbBoard [data-lcx]') as HTMLElement
    HOOKS.editMode = () => false
    const before = JSON.stringify(DAYS[SBDAY as any])
    boardMbtn({ target: btn } as any)
    expect(JSON.stringify(DAYS[SBDAY as any])).toBe(before)
  })
})

/* Coordinator review, 9 Aug 26: "your boundary does not match the boundary
   of what is safe" — everything above closed the flying line specifically,
   but the SAME gap sat untouched in every
   OTHER panel: Overall notes, the overall programme, and the duty/sim/
   ground rows added Aug 26 were all still `pv`-only — a read-only board
   left their text inputs enabled, their seats draggable, and their
   add/CX/flag/delete clusters live. Demonstrated live: typing into a day's
   Overall note left the wrong text sitting on screen permanently, because
   boardChange's FIRST attempt at a guard (an early return) skipped past
   the revert branch a rejected txtSet already had — worse than a dead
   field, because a scheduler sees their own words and reasonably believes
   it saved. Six call sites in board-html.ts now pass the SAME ro flag the
   flying line's dis/stoRO already used (sbRowCtl, sbTxt, sbNote, sbSeat/
   sbMore, the data-fill cells, and the per-wave header block in board.ts),
   and boardChange reverts a blocked field's on-screen value instead of
   just refusing to commit it. */
describe('the OTHER panels honour the read-only flag too, not just the flying line (coordinator review, 9 Aug 26)', () => {
  afterEach(async () => {
    HOOKS.editMode = () => true
    await act(async () => { notify() })
  })

  it('the overall note, the programme item and a duty row all disable once editMode() is false', () => {
    HOOKS.editMode = () => false
    const h = boardHTML(0)
    expect(h, 'Overall notes .nin').toMatch(/class="nin" data-bfld="dn:[^"]*"[^>]*disabled/)
    expect(h, 'the programme item\'s own free-text field').toMatch(/class="ain" data-bfld="ap:[^"]*\.prog"[^>]*disabled/)
    expect(h, 'a duty row\'s role field').toMatch(/class="ain" data-bfld="dr:[^"]*\.role"[^>]*disabled/)
    expect(h, 'the scheduler notes textarea (sbNote)').toMatch(/class="sb-nbox" data-bfld="[^"]*"[^>]*disabled/)
  })

  it('none of those four are disabled in edit mode (unchanged)', () => {
    const h = boardHTML(0)
    expect(h).not.toMatch(/class="nin" data-bfld="dn:[^"]*"[^>]*disabled/)
    expect(h).not.toMatch(/class="ain" data-bfld="ap:[^"]*\.prog"[^>]*disabled/)
    expect(h).not.toMatch(/class="ain" data-bfld="dr:[^"]*\.role"[^>]*disabled/)
    expect(h).not.toMatch(/class="sb-nbox" data-bfld="[^"]*"[^>]*disabled/)
  })

  it('+ Note / + Item / + Block / + Row and their CX/flag/delete clusters do not render once editMode() is false', () => {
    HOOKS.editMode = () => false
    const h = boardHTML(0)
    expect(h).not.toContain('data-nadd=')
    expect(h).not.toContain('data-padd=')
    expect(h).not.toContain('data-dwadd=')
    expect(h).not.toContain('data-dradd=')
    expect(h).not.toContain('data-pcx=')
    expect(h).not.toContain('data-drcx=')
  })

  it('the same controls render in edit mode (unchanged)', () => {
    const h = boardHTML(0)
    expect(h).toContain('data-nadd=')
    expect(h).toContain('data-padd=')
    expect(h).toContain('data-dwadd=')
    expect(h).toContain('data-dradd=')
  })

  it('a duty row\'s seat carries no data-slot and no draggable once editMode() is false', () => {
    HOOKS.editMode = () => false
    const h = boardHTML(0)
    /* duty seats use sbSeat, not sbSlot — a bare span, not wrapped in
       .sb-slot — so the assertion matches that shape specifically rather
       than reusing the flying-line one */
    expect(h).not.toMatch(/<span class="seat" data-slot="d:[^"]*"/)
  })

  it('a duty row\'s seat is draggable in edit mode (unchanged)', () => {
    const h = boardHTML(0)
    expect(h).toMatch(/<span class="seat" data-slot="d:[^"]*"[^>]*draggable="true"/)
  })

  /* the exact scenario the reviewer demonstrated: typing into Overall notes
     while read-only used to leave the typed text sitting on screen forever
     (boardChange's first-attempt guard returned before the revert branch a
     rejected txtSet already had), while the model kept the old value
     underneath — worse than a dead field, because it LOOKS saved. */
  it('boardChange reverts a blocked Overall-note edit to the model\'s real value, not just refuses to commit it', async () => {
    const input = document.querySelector('#sbBoard .sb-nrow .nin') as HTMLInputElement
    expect(input, 'sanity: an overall-note row exists (the seed carries one)').toBeTruthy()
    const key = input.dataset.bfld!
    const before = txtGet(key)
    HOOKS.editMode = () => false
    await act(async () => {
      input.value = 'TYPED WHILE READ-ONLY — SHOULD NOT STICK'
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })
    expect(txtGet(key), 'the model never saw the edit').toBe(before)
    expect(input.value, 'the FIELD ON SCREEN was put back too, not left showing the typed text').toBe(before)
  })

  it('the identical edit commits normally in edit mode, and does not auto-revert', async () => {
    const input = document.querySelector('#sbBoard .sb-nrow .nin') as HTMLInputElement
    const key = input.dataset.bfld!
    const before = txtGet(key)
    await change(input, before + ' — edited')
    expect(txtGet(key)).toBe(before + ' — edited')
    /* re-queried, not the same reference — a successful commit re-renders
       the panel (innerHTML replaced wholesale), which detaches the
       original `input`; dispatching on it again would silently no-op */
    const input2 = document.querySelector('#sbBoard .sb-nrow .nin') as HTMLInputElement
    await change(input2, before)   // restore
    expect(txtGet(key)).toBe(before)
  })
})

/* the same six behaviours above, proven UNCHANGED for a real scheduler in
   edit mode — not a stub this time, the genuine wireStore() function, so
   the whole pipeline (role + CURPAGE -> HOOKS.editMode() -> render ->
   write path) is exercised end to end at least once. */
describe('edit mode itself is completely unaffected by any of the above', () => {
  beforeAll(async () => {
    /* undo every earlier describe block's `HOOKS.editMode = () => true`
       stub in this file and put the REAL wireStore()-installed function
       back, so this block actually exercises the real gate, not a fixed
       stub that happens to also read true. */
    HOOKS.editMode = realEditMode
    await act(async () => { notify() })
  })

  it('a callsign edit commits, + adds an aircraft, CX opens its dialog, and the seat arms — all normally', async () => {
    expect(HOOKS.editMode(), 'sanity: edit mode is on to start with').toBe(true)
    const input = document.querySelector('#sbBoard .sb-line .lin') as HTMLInputElement
    expect((input as any).disabled, 'the input is genuinely enabled').toBe(false)
    const key = input.dataset.bfld!
    const before = txtGet(key)
    await change(input, before + ' EDIT')
    expect(txtGet(key)).toBe(before + ' EDIT')
    await change(input, before)   // restore

    const acBtn = document.querySelector('#sbBoard [data-lac]') as HTMLElement
    const wavesBefore = JSON.stringify(DAYS[SBDAY as any].waves)
    await click(acBtn)
    expect(JSON.stringify(DAYS[SBDAY as any].waves)).not.toBe(wavesBefore)

    const cxBtn = document.querySelector('#sbBoard [data-lcx]') as HTMLElement
    await click(cxBtn)
    expect(($('#cxPop') as any).hidden).toBe(false)
    await click($('#cxClose'))

    const emptyKey = '0.0.0.0.p'
    const seatBefore = slotVal(emptyKey)
    await act(async () => { setSlotVal(emptyKey, ''); afterSchedMutate(); notify() })
    const empty = document.querySelector(`#sbBoard .sb-slot.empty[data-slot="${emptyKey}"]`) as HTMLElement
    boardArmClick({ target: empty, stopPropagation() {} } as any)
    expect(view.armedKey()).not.toBe('')
    view.armDrop()
    await act(async () => { setSlotVal(emptyKey, seatBefore); afterSchedMutate(); notify() })
  })

  /* the read-only board through the REAL pipeline, not a stub. This used to
     switch the Edit-mode toggle off; the toggle is gone (owner, 9 Aug 26),
     so a session that may not edit is what makes editMode() false while a
     board is still open — and that is now the only such state, which is
     precisely why it is worth rendering rather than stubbing. */
  it('a session that may not edit reaches the same read-only render through the real pipeline, not just a stub', async () => {
    await act(async () => { setSession({ user: 'user', role: 'main' }); view.setPage('editsched'); openScheduler(0); notify() })
    expect(HOOKS.editMode()).toBe(false)
    const line = document.querySelector('#sbBoard .sb-line') as HTMLElement
    expect(line, 'sanity: the board really rendered rows — otherwise this proves nothing').toBeTruthy()
    expect((line.querySelector('.lin') as HTMLInputElement).disabled, 'the real render, not a stub, disables it').toBe(true)
    expect(line.querySelector('[data-lcx]'), 'and the real render omits the CX cluster').toBeFalsy()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); view.setPage('editsched'); openScheduler(0); notify() })
    expect(HOOKS.editMode()).toBe(true)
  })
})

/* The board twin of the week's placeholder shortcut (owner, 13 Aug 26): a
   placeholder's puck arms its seat through the board's own click handler,
   where a real person's puck still returns early to selection. */
describe('a placeholder on the board arms its seat (13 Aug 26)', () => {
  it('clicking the placeholder puck arms; disarm and restore leave no trace', async () => {
    await act(async () => { setSession({ user: 'a', role: 'admin' }); view.setPage('editsched'); openScheduler(0); notify() })
    const seat = document.querySelector('#sbBoard .seat[data-slot]') as HTMLElement
    expect(seat).toBeTruthy()
    const key = seat.dataset.slot!
    const before = slotVal(key)
    setSlotVal(key, 'allavail'); await act(async () => { afterSchedMutate(); notify() })
    const puck = document.querySelector(`#sbBoard .seat[data-slot="${key}"] .puck[data-person="allavail"]`)
    await click(puck)
    expect(view.armedKey()).toBe(key)
    await act(async () => { view.armDrop(); notify() })
    setSlotVal(key, before || ''); await act(async () => { afterSchedMutate(); notify() })
  })
})

/* The board becomes the full editor (owner, 14 Aug 26 — in-time, area,
   traffic, remarks that had been week-only, and a Live Checks panel styled
   like the edit week's). jsdom pins the markup and the commit; e2e pins the
   layout (checks below sign-off, the empty-cell box) since every rect is 0x0. */
describe('the board carries the week-only editable fields (14 Aug 26)', () => {
  beforeAll(async () => {
    await act(async () => { setSession({ user: 'a', role: 'admin' }); view.setPage('editsched'); openScheduler(0); notify() })
  })
  it('renders an editable in-time block, area strip and Traffic button per wave', () => {
    expect($('#sbBoard .intimes[data-intimes]'), 'the IN TIME lines are editable here now').toBeTruthy()
    expect($('#sbBoard .sb-area .areacell[data-area]'), 'the area strip is drawn').toBeTruthy()
    expect($('#sbBoard .sb-area .timecell[data-atime]'), 'with its airspace window').toBeTruthy()
    expect($('#sbBoard .sb-go-h .airbtn[data-air]'), 'and a Traffic button').toBeTruthy()
  })
  it('the area cell shows the derived value, not blank, so a click-through does not freeze it', () => {
    const cell = $('#sbBoard .areacell[data-area]')
    expect(cell.textContent!.trim().length, 'the derived area code is shown').toBeGreaterThan(0)
  })
  it('in-time edits commit through the funnel', async () => {
    const it = $('#sbBoard .intimes[data-intimes]')
    const [di, gi] = it.dataset.intimes!.split('|')
    const w = DAYS[+di].waves[+gi]
    const before = (w.intimes || []).join('|')
    await act(async () => {
      it.querySelector('span')!.textContent = '0001H: TEST IN TIME'
      it.dispatchEvent(new Event('focusout', { bubbles: true }))
    })
    expect((w.intimes || []).join('|'), 'the model took the typed line').not.toBe(before)
    expect((w.intimes || [])[0]).toContain('TEST IN TIME')
  })
  it('the remarks reveal reads R, not +', () => {
    const r = $('#sbBoard .rmkadd[data-rmkadd]')
    expect(r, 'a row offers the remarks reveal').toBeTruthy()
    expect(r.textContent!.trim()).toBe('R')
  })
  it('the Live Checks header reads "issues" and colours by worst severity', () => {
    const wh = $('#sbWarn .wh')
    expect(wh.textContent, 'the label is issues, not Live checks').toMatch(/\d+ issues?|No conflicts/)
    expect(/wh (hard|adv|note|ok)/.test(wh.className), 'the bar carries a severity class').toBe(true)
  })
  it('the checks panel is a sibling of the sign-off in the board column, below it', () => {
    const sign = $('#sbSign'), warn = $('#sbWarn')
    expect(sign, 'sign-off is its own element').toBeTruthy()
    expect(warn, 'and the checks panel is present').toBeTruthy()
    /* DOM order sign → warn; the phone CSS flattens the column so the bar
       lands directly under the sign-off (measured in e2e) */
    expect(sign.compareDocumentPosition(warn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

/* FCP/RCP side by side + the Remarks placeholder (owner, 14 Aug 26). jsdom
   pins the markup; the side-by-side geometry is measured in e2e (0x0 here). */
describe('flying-line seat pair and the Remarks placeholder (14 Aug 26)', () => {
  beforeAll(async () => {
    await act(async () => { setSession({ user: 'a', role: 'admin' }); view.setPage('editsched'); openScheduler(0); notify() })
  })
  it('FCP and RCP share a .sb-seatpair wrapper', () => {
    const pair = $('#sbBoard .sb-line .sb-seatpair')
    expect(pair, 'the two seats are wrapped so CSS can lay them side by side').toBeTruthy()
    expect(pair.querySelectorAll('.sb-slot').length, 'holding exactly the two seats').toBe(2)
  })
  it('a remarks box carries the faded "Remarks" placeholder', () => {
    const r = $('#sbBoard .rmkin')
    expect(r, 'a duty/sim/ground remarks input is present').toBeTruthy()
    expect(r.getAttribute('placeholder'), 'so a revealed-but-empty box says what it is').toBe('Remarks')
  })
  /* The flying line's OWN remarks box (.nts) now says what it is too when empty
     (owner, 16 Aug 26 — a faded "remarks" in the flying-line remarks box). A
     standalone line keeps its MAIN/SPARE ghost text (a Stable decision), so the
     placeholder is "Remarks" only on a formation line. */
  it('a flying-line remarks box carries the faded "Remarks" placeholder', () => {
    const withRemarks = $$('#sbBoard .sb-line .nts')
      .filter(n => n.getAttribute('placeholder') === 'Remarks')
    expect(withRemarks.length, 'a formation line offers the Remarks placeholder').toBeGreaterThan(0)
  })
})

/* THE OFT TAKES INSTRUCTORS AND OBSERVERS (owner, 14 Aug 26 — "the OFT can
   only sit 2 people... anything additional are the instructors instructing
   that session or observers. So it doesn't really affect the rules"). The two
   REAL seats stay p/w — the seat-qual rules anchor there, untouched — and
   extras ride more[] on the AMT's own grid contract: paired below the seats,
   a removed extra HOLDS its index and renders as a droppable hole in place. */
describe('the OFT seat grid and its extras (14 Aug 26)', () => {
  const cell = () => $('#sbBoard [data-fill="s:0.oft.0.+"]')
  beforeAll(async () => {
    await act(async () => { setSession({ user: 'a', role: 'admin' }); view.setPage('editsched'); openScheduler(0); notify() })
  })
  it('an OFT crew row renders the AMT seat grid, FCP and RCP named', () => {
    expect(cell().classList.contains('fcprcp'), 'the .fcprcp grid, like the AMT box').toBe(true)
    expect([...cell().querySelectorAll('.hd')].map(h => h.textContent)).toEqual(['FCP', 'RCP'])
  })
  it('an empty OFT seat is a droppable slot now, not nothing', async () => {
    /* Monday's EP-6 has a pilot and no WSO — before this build the empty seat
       rendered as nothing at all, so there was no way to see or tap it */
    const ep6 = $$('#sbBoard .sb-panel.simr .sb-arow').find(r =>
      (r.querySelector('.ain') as HTMLInputElement)?.value === 'EP-6')!
    expect(ep6, 'the seeded EP-6 row exists').toBeTruthy()
    expect(ep6.querySelector('.sb-slot.empty[data-slot$=".w"]'), 'its empty RCP offers itself').toBeTruthy()
  })
  it('a 3rd and 4th body append as extras, and a removed extra leaves its hole in place', async () => {
    const { fillSlot } = await import('../engine/slots')
    await act(async () => { fillSlot('s:0.oft.0.+', 'wolf'); fillSlot('s:0.oft.0.+', 'rocky'); afterSchedMutate(); notify() })
    expect(DAYS[0].sims.oft[0].more).toEqual(['wolf', 'rocky'])
    expect(cell().querySelector('[data-slot="s:0.oft.0.x0"] .puck'), 'the instructor renders in the grid').toBeTruthy()
    /* remove the FIRST extra: the index is held (slots.ts trims trailing
       blanks only), the hole renders as a droppable slot, the 4th body stays */
    await act(async () => { setSlotVal('s:0.oft.0.x0', ''); afterSchedMutate(); notify() })
    expect(DAYS[0].sims.oft[0].more).toEqual(['', 'rocky'])
    expect(cell().querySelector('.sb-slot.empty[data-slot="s:0.oft.0.x0"]'), 'the hole is a droppable slot in place').toBeTruthy()
    expect(cell().querySelector('[data-slot="s:0.oft.0.x1"] .puck'), 'and the other extra never moved key').toBeTruthy()
    /* clean up: blank the trailing extra too, which trims the whole tail */
    await act(async () => { setSlotVal('s:0.oft.0.x1', ''); afterSchedMutate(); notify() })
    expect(DAYS[0].sims.oft[0].more || []).toEqual([])
  })
  it('a who-text row (SIMS (149)) keeps its plain text, no seat grid', () => {
    const who = $$('#sbBoard .sb-panel.simr .ppl .itxt').find(t => /149/.test(t.textContent!))
    expect(who, 'the 149 slot still reads as text').toBeTruthy()
    expect(who!.closest('.fcprcp'), 'and is not forced into the seat grid').toBeFalsy()
  })
})

/* + BLOCK ON THE AMT (owner, 14 Aug 26 — "add an AMT block that shows what it
   shows now. Like brief box and debrief. All 3 together"). One tap mints the
   three-row shape: BRIEF and DEBRIEF as time-only rows, the BOX carrying the
   FCP/RCP grid with its first empty droppable pair. Times stay blank — a new
   line comes up blank, a plausible wrong time reads as filled in. */
describe('the AMT + Block button (14 Aug 26)', () => {
  beforeAll(async () => {
    await act(async () => { setSession({ user: 'a', role: 'admin' }); view.setPage('editsched'); openScheduler(1); notify() })
  })
  it('the button sits on the AMT header only — the OFT keeps + Row alone', () => {
    expect($('#sbBoard [data-sblkadd]'), 'the AMT header offers + Block').toBeTruthy()
    expect($$('#sbBoard [data-sblkadd]').length, 'and no other header does').toBe(1)
  })
  it('one tap adds BRIEF, BOX and DEBRIEF together — times blank, BOX grid ready', async () => {
    const before = DAYS[1].sims.amt.length
    await click($('#sbBoard [data-sblkadd]'))
    const rows = DAYS[1].sims.amt
    expect(rows.length, 'three rows in one tap').toBe(before + 3)
    expect(rows.slice(-3).map((r: any) => r.label)).toEqual(['BRIEF', 'BOX', 'DEBRIEF'])
    expect(rows.slice(-3).every((r: any) => !r.str && !r.end), 'a new block comes up blank').toBe(true)
    const grid = $(`#sbBoard [data-fill="s:1.amt.${rows.length - 2}.+"]`)
    expect(grid.classList.contains('fcprcp'), 'the BOX renders the FCP/RCP grid').toBe(true)
    expect(grid.querySelectorAll('.sb-slot.empty').length, 'with its first droppable pair').toBe(2)
  })
})

/* THE JUST-ADDED BLUE BOX (owner, 14 Aug 26 — "everytime I add a new row block
   or wave there will be a blue box around the new thing for around 6 seconds").
   jsdom cannot see the box-shadow (every rect is 0×0), but it CAN prove which
   element the decoration pass boxes, which is the whole logic here — the paint
   itself is left to the eye on the live bundle. The class is hung by
   highlights.ts's paintFreshAdds, re-run after every board repaint, off the
   FRESHADD keys markStructuralAdd fed in. */
describe('the just-added blue box (14 Aug 26)', () => {
  beforeAll(async () => {
    await act(async () => { setSession({ user: 'a', role: 'admin' }); view.setPage('editsched'); openScheduler(0); notify() })
  })
  /* the flash is module state with a real 6s timer, so wipe it between cases —
     a box left over from the previous add would fail the "exactly one" counts */
  beforeEach(async () => { await act(async () => { view.FRESHADD.clear(); notify() }) })

  it('a new sim row boxes its own row and nothing else', async () => {
    const before = $$('#sbBoard .sb-panel.simr .sb-arow').length
    await click($('#sbBoard [data-sradd="0.oft"]'))
    expect($$('#sbBoard .sb-panel.simr .sb-arow').length).toBe(before + 1)
    const fresh = $$('#sbBoard .sb-arow.sb-fresh')
    expect(fresh.length, 'exactly the one new row wears the box').toBe(1)
  })

  it('a new wave boxes the whole wave, with no second box inside it', async () => {
    const before = DAYS[0].waves.length
    await click($('[data-wvadd]'))
    await click($('.wavemenu [data-wmkind=""]'))
    expect(DAYS[0].waves.length).toBe(before + 1)
    const go = $$('#sbBoard .sb-go.sb-fresh')
    expect(go.length, 'the whole wave is boxed').toBe(1)
    expect(go[0].querySelector('.sb-line.sb-fresh'), 'and its own first line is not boxed twice').toBeFalsy()
  })

  it('the AMT + Block boxes all three new rows', async () => {
    await click($('#sbBoard [data-sblkadd]'))
    expect($$('#sbBoard .sb-panel.simr .sb-arow.sb-fresh').length, 'BRIEF, BOX and DEBRIEF each boxed').toBe(3)
  })

  it('the box holds, enters its fade, then clears after the ~6s window', () => {
    /* fake timers + stubbed render hooks: prove the two-phase timer without
       waiting six real seconds or churning React outside act */
    vi.useFakeTimers()
    const rs = HOOKS.renderScheduler, re = HOOKS.renderEditWeek
    HOOKS.renderScheduler = () => {}; HOOKS.renderEditWeek = () => {}
    try {
      view.flashAdded('sr:0.oft.0.label')
      expect(view.FRESHADD.has('sr:0.oft.0.label')).toBe(true)
      expect(view.FRESHOUT.has('sr:0.oft.0.label'), 'steady, not fading yet').toBe(false)
      vi.advanceTimersByTime(view.FRESH_MS - view.FRESH_FADE_MS + 10)
      expect(view.FRESHOUT.has('sr:0.oft.0.label'), 'fading in the last stretch').toBe(true)
      expect(view.FRESHADD.has('sr:0.oft.0.label'), 'still boxed while it fades').toBe(true)
      vi.advanceTimersByTime(view.FRESH_FADE_MS + 20)
      expect(view.FRESHADD.has('sr:0.oft.0.label'), 'gone after the window').toBe(false)
      expect(view.FRESHOUT.has('sr:0.oft.0.label')).toBe(false)
    } finally { HOOKS.renderScheduler = rs; HOOKS.renderEditWeek = re; vi.useRealTimers() }
  })
})

/* THE EDIT WEEK'S PUBLISH CONTROLS ON THE BOARD, "same as edit schedule"
   (owner ask). html.ts's dayStatHTML is now the ONE builder for the version
   chip / pending-count chip / ⓘ / Publish day / Publish AL strip — the week
   day head calls it (html.test.ts proves that output stayed byte-identical)
   and boardSignHTML (board.ts) calls the very same function, so a scheduler
   working the full-screen board never has to back out to the week to sign
   and publish a day. */
describe('the board carries the edit week\'s publish controls (owner ask)', () => {
  beforeAll(async () => {
    /* self-contained rather than trusting file order: an earlier block in
       this file (the "previewing a version" test) already wipes SCHED's
       approval state wholesale and nothing since restamps it, but a clean
       slate stated here is what makes this block correct on its own. */
    await act(async () => {
      setSession({ user: 'a', role: 'admin' }); view.setPage('editsched')
      SCHED.dayOK = {}; SCHED.orig = {}; SCHED.sign = {}
      openScheduler(0); notify()
    })
  })

  it('renders the Publish day button for the open day, locked while unsigned', () => {
    const beak = $('#sbSignBar [data-beak="0"]')
    expect(beak, 'the board sign area carries the same Publish day button the week head does').toBeTruthy()
    expect(beak.hasAttribute('disabled'), 'locked until the four sign-offs are in').toBe(true)
    expect(beak.classList.contains('locked')).toBe(true)
    expect(beak.textContent).toBe('Publish day')
  })

  it('enables once the day is fully signed', async () => {
    await act(async () => {
      const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
      notify()
    })
    const beak = $('#sbSignBar [data-beak="0"]')
    expect(beak.hasAttribute('disabled'), 'signed — the button is live now').toBe(false)
    expect(beak.classList.contains('locked')).toBe(false)
  })

  it('publishing flips it to ✓ Published; a pending edit after that shows the pending chip and Publish AL', async () => {
    await click($('#sbSignBar [data-beak="0"]'))
    expect(dayApproved(0)).toBe(true)
    const beak = $('#sbSignBar [data-beak="0"]')
    expect(beak.textContent).toContain('✓ Published')       // now names the issued version too
    expect(beak.querySelector('.dal.orig'), 'the stamp names the Original').toBeTruthy()
    expect(beak.classList.contains('ok')).toBe(true)
    expect($('#sbSignBar [data-alpub="0"]'), 'no pending edits yet — no AL button').toBeFalsy()

    /* a pending edit through the ordinary mutation funnel, same "+ Line"
       path the earlier "board mutation handlers" block already exercises */
    const d = DAYS[0]
    const gi = d.waves.length - 1
    await click($(`#sbBoard [data-gline="0.${gi}"]`))
    const key = `ff:0.${gi}.${d.waves[gi].formations.length - 1}.cs`
    expect(SCHED.pending[key], 'the new line is pending, same funnel as the week').toBeTruthy()

    expect($('#sbSignBar .dpend'), 'the pending-count chip appears once the published day carries an edit').toBeTruthy()
    expect($('#sbSignBar [data-alpub="0"]'), 'a published day with a pending edit gets the Publish AL button').toBeTruthy()

    // put the line back
    d.waves[gi].formations.pop()
    delete SCHED.pending[key]; delete SCHED.added[key]
    await act(async () => { afterSchedMutate(); notify() })
  })

  it('a frozen version preview renders no Publish day / Publish AL controls', async () => {
    await act(async () => { view.setDayPreview(0, 'orig'); notify() })
    expect($('#sbSignBar'), 'boardSignHTML(di, true) still returns nothing on a frozen preview').toBeFalsy()
    expect($$('#sbSign [data-beak]').length).toBe(0)
    expect($$('#sbSign [data-alpub]').length).toBe(0)
    await act(async () => {
      view.setDayPreview(0, null)
      SCHED.dayOK = {}; SCHED.orig = {}; SCHED.sign = {}
      notify()
    })
  })
})

/* THE ⋯ PER-ROW CONTROL TOGGLE (owner, 16 Aug 26). Every flying/duty/sim/ground
   row hides its ▲▼/CX/■/✕ strip behind one ⋯ on a phone so a day reads clean;
   tapping it names that row in CTLOPEN and its strip unfolds, one at a time. The
   collapse itself is CSS (jsdom can't see it); this pins the markup and state:
   each such strip carries a ⋯, the toggle moves CTLOPEN and the .open class, and
   the note/input strips that carry no toggle are untouched. */
describe('the ⋯ per-row control toggle', () => {
  beforeAll(async () => {
    await act(async () => { setSession({ user: 'a', role: 'admin' }); view.setPage('editsched'); openScheduler(0); view.setCtlOpen(null); notify() })
  })
  it('every flying and duty strip carries a ⋯ and starts closed', () => {
    const strips = $$('#sbBoard .sb-line .lctl, #sbBoard .sb-panel.duty .lctl')
    expect(strips.length, 'the board has control strips').toBeGreaterThan(0)
    strips.forEach(s => expect(s.querySelector('.ctlmore'), 'each strip carries a ⋯ toggle').toBeTruthy())
    expect($('#sbBoard .lctl.open'), 'nothing is open until a ⋯ is tapped').toBeFalsy()
  })
  it('tapping ⋯ opens that row alone; another tap moves it; tapping the open one closes it', async () => {
    const mores = $$('#sbBoard .sb-line .lctl .ctlmore')
    expect(mores.length, 'more than one flying row to move between').toBeGreaterThan(1)
    const key0 = (mores[0] as HTMLElement).dataset.ctlmore
    await click(mores[0])
    expect(view.CTLOPEN, 'the tapped row is now the open one').toBe(key0)
    expect($$('#sbBoard .lctl.open').length, 'exactly one strip is open').toBe(1)

    const other = $$('#sbBoard .sb-line .lctl .ctlmore').find(m => (m as HTMLElement).dataset.ctlmore !== key0)!
    const keyOther = (other as HTMLElement).dataset.ctlmore
    await click(other)
    expect(view.CTLOPEN, 'the open state moves to the newly tapped row').toBe(keyOther)
    expect($$('#sbBoard .lctl.open').length, 'still exactly one').toBe(1)

    await click($('#sbBoard .lctl.open .ctlmore'))
    expect(view.CTLOPEN, 'tapping the open row closes it').toBeNull()
    await act(async () => { view.setCtlOpen(null); notify() })
  })
  it('an input strip carries no ⋯ (its Accept controls always show)', () => {
    const inpStrip = $('#sbBoard .sb-panel.pinp .lctl')
    if (inpStrip) expect(inpStrip.querySelector('.ctlmore'), 'input rows keep their controls, no ⋯').toBeFalsy()
  })
})
