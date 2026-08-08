// @vitest-environment jsdom
/* The scheduler board — tfin's board group ("sched board opens", "sched lines
   render", "sched roster render", "sched wave title select", "sched
   setSlotVal", "the board shows the open day's strip", "board inputs panel")
   and the R group (CX carries a reason, B28), driven through the React app. */
import { beforeAll, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED, signOf, setDayApproved } from '../engine/publish'
import { slotVal, setSlotVal } from '../engine/slots'
import { parseHM } from '../engine/time'
import { isStandalone } from '../engine/waves'
import { SBDAY, afterSchedMutate } from '../state/view'
import * as view from '../state/view'
import { cxText } from './html'
import { openScheduler, boardArmClick } from './board'

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

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})

describe('the scheduler board (tfin board group)', () => {
  it('a day head on the edit week opens the board', async () => {
    await click($('#eWeek .day[data-day="0"] .dow.sb-open'))
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

  it("the board shows the open day's strip, inside the scrolling board", () => {
    const el = $('#sbSignBar')
    expect(el).toBeTruthy()
    expect(el.querySelectorAll('select[data-sign]').length).toBe(4)
    expect(el.closest('.sb-top')).toBeFalsy()
    expect(el.closest('#sbBoard')).toBeTruthy()
    /* B27 — the strip is the board's FIRST child so it scrolls with the day */
    expect($('#sbBoard').firstElementChild).toBe(el)
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

  it('+ Line seeds the new line from the last one on the LAST wave', async () => {
    const d = DAYS[0]
    const w = d.waves[d.waves.length - 1]
    const nBefore = w.formations.length
    const last = w.formations[w.formations.length - 1]
    await click($('#sbAddLine'))
    expect(w.formations.length).toBe(nBefore + 1)
    const f = w.formations[w.formations.length - 1]
    expect(f.to).toBe(last.to)
    expect(f.cs).toBe(last.cs)
    expect(f.aircraft.length).toBe(1)
    /* the seed key is marked pending so the line can be published */
    expect(SCHED.pending[`ff:0.${d.waves.length - 1}.${w.formations.length - 1}.cs`]).toBeTruthy()
    /* put it back */
    w.formations.pop()
    await act(async () => { afterSchedMutate(); notify() })
  })

  it('+ Wave opens the kind menu: a flying wave and the three standalone kinds', async () => {
    await click($('#sbAddGo'))
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
    await click($(`#sbBoard [data-gdel="0.${nBefore - 1}"]`))
    expect(d.waves.length).toBe(nBefore - 1)
  })

  it('an AVALON wave arrives complete WITH its duty block, and deleting it removes both', async () => {
    const d = DAYS[0]
    const nW = d.waves.length, nDW = (d.dutywaves || []).length
    await click($('#sbAddGo'))
    await click($('.wavemenu [data-wmkind="avalon"]'))
    expect(d.waves.length).toBe(nW + 1)
    expect(isStandalone(d.waves[d.waves.length - 1])).toBeTruthy()
    expect(d.dutywaves.length).toBe(nDW + 1)
    await click($(`#sbBoard [data-gdel="0.${d.waves.length - 1}"]`))
    expect(d.waves.length).toBe(nW)
    expect(d.dutywaves.length).toBe(nDW)
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
    await click($('#sbAddLine'))
    await click($('#sbAddLine'))
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

  it('the personal-inputs panel is inert even on the live board', () => {
    const p = document.querySelector('#sbBoard .sb-panel.pinp')!
    expect(p.querySelectorAll('input,textarea,.mbtn,[data-slot],[data-fill],[draggable="true"]').length).toBe(0)
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
    /* back in for any later suites */
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
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
    expect(($('#sbAddLine') as HTMLButtonElement).disabled).toBe(true)
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
