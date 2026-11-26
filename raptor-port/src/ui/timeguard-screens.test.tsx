// @vitest-environment jsdom
/* [END-TIME-GUARD] step 5 — WHAT THE SCHEDULER SEES (his D2853, D2854, D2734, D2855 E1; the approved try-out
   docs/mock/2026-11-25-endtime-tryout/). Driven through the real App on Edit Schedule and the Scheduler Board:
   - the outline: a thin line inside each empty time box the rule names — grey while drafting, red once a press is
     refused, until the time is typed; only on a box that can be typed in, so never on View-only Sched (D2853);
   - Edit Schedule's sign-off line: "N items missing a time · N to sign" (D2854); the board's the same, with the names of
     the boxes still to sign back only once the last time is typed (D2734). A tap on Edit Schedule's line goes to each
     empty box in turn (D2854); the board's line stays words (Q19);
   - a sign-off box that is refused without its list opening (the try-out), and the greyed Publish day that takes a press
     and says the note (D2855 E1).
   Thursday (day 3) and Monday (day 0) have every time typed in the remade demo week; each case empties one. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED, protectedWeek } from '../engine/publish'
import { txtSet } from '../engine/slots'
import * as view from '../state/view'
import { HOOKS } from '../engine/hooks'
import { openScheduler, closeScheduler } from './board'
import { resetTimeRed } from './timegap-paint'
import { histInit, undo } from '../state/history'
import { applyMove } from '../engine/reorder'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const THU = 3
let DSNAP = ''
let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const key = async (el: Element | null, k: string) => {
  expect(el, 'key target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })) })
}
const edit = async (path: string, v: string) => { await act(async () => { expect(txtSet(path, v), `typed ${path}`).toBe(true); view.afterSchedMutate(); notify() }) }
let said: Array<[string, any]> = []
const realToast = HOOKS.toast
const blocked = () => said.filter(([, k]) => k === 'blocked').map(([m]) => m)
const weekBox = (k: string) => $(`#eWeek [data-txt="${k}"]`)
const boardBox = (k: string) => $(`#schedBoard [data-bfld="${k}"]`)
const missIn = (scope: string) => $$(`${scope} .tg-miss`).map(e => e.getAttribute('data-txt') || e.getAttribute('data-bfld'))
const sgnOf = (role: string) => ($(`#eWeek .day[data-day="${THU}"] select[data-sign="${role}"]`) as HTMLElement).closest('.sgn') as HTMLElement
const weekLine = (di: number) => $(`#eWeek .day[data-day="${di}"] .signoff.day-sign .so-state`)

beforeAll(async () => {
  initStore(); DSNAP = JSON.stringify(DAYS)
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
})
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove(); HOOKS.toast = realToast
})
beforeEach(async () => {
  await act(async () => { (document.activeElement as HTMLElement | null)?.blur?.(); closeScheduler() })   // a box the count tap gave the caret
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.drafts = {}; SCHED.curDraft = {}
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}; SCHED.signBind = {}; SCHED.correcting = {}
  view.DPREV.clear(); view.VWORK.clear()
  resetTimeRed()
  said = []
  HOOKS.toast = ((m: any, k: any) => { said.push([String(m), k]) }) as any
  await act(async () => { notify() })
})

describe('the outline on Edit Schedule (D2853)', () => {
  it('the remade demo week shows no outline anywhere', () => {
    expect(missIn('#eWeek')).toEqual([])
  })

  it('an emptied END is outlined grey — that box only', async () => {
    await edit('dr:3.0.0.end', '')
    expect(missIn('#eWeek')).toEqual(['dr:3.0.0.end'])
    expect(weekBox('dr:3.0.0.end').classList.contains('tg-red')).toBe(false)
  })

  it('a refused press turns the outlined boxes red; typing the time takes the outline away', async () => {
    await edit('dr:3.0.0.end', ''); await edit('gr:3.0.str', '')
    await click($(`#eWeek .day[data-day="${THU}"] .sgn.tg-block`))
    expect(blocked()).toEqual(['Blocked: 2 items are missing a time, each outlined in red. Type the missing times, then sign.'])
    expect(weekBox('dr:3.0.0.end').classList.contains('tg-red')).toBe(true)
    expect(weekBox('gr:3.0.str').classList.contains('tg-red')).toBe(true)
    await edit('dr:3.0.0.end', '13:00')
    expect(weekBox('dr:3.0.0.end').className).not.toMatch(/tg-(miss|red)/)
    expect(weekBox('gr:3.0.str').classList.contains('tg-red'), 'the other stays red until its time is typed').toBe(true)
  })

  /* RED FOLLOWS THE ROW, NOT ITS PLACE (D2853 "staying red until the time is typed"; the two Opus reads' F2, Astra's 1) */
  const red = (k: string) => weekBox(k).classList.contains('tg-red')
  const refuseThu = async () => { await click($(`#eWeek .day[data-day="${THU}"] .sgn.tg-block`)) }
  it('deleting a row above keeps the right boxes red; Undo puts them back red where they were (F2)', async () => {
    expect(DAYS[THU].dutywaves[0].rows.length).toBeGreaterThanOrEqual(3)
    await act(async () => { histInit(); notify() })   // the reset above swaps the week under the history: start it afresh
    await edit('dr:3.0.1.end', ''); await edit('dr:3.0.2.end', '')
    await refuseThu()
    expect([red('dr:3.0.1.end'), red('dr:3.0.2.end')]).toEqual([true, true])
    await act(async () => { openScheduler(THU) })
    await click($('#schedBoard [data-drdel="3.0.0"]'))
    await act(async () => { closeScheduler() })
    expect(missIn('#eWeek')).toEqual(['dr:3.0.0.end', 'dr:3.0.1.end'])
    expect([red('dr:3.0.0.end'), red('dr:3.0.1.end')], 'both gapped rows, now one place up, still red').toEqual([true, true])
    /* the history's own step back (the top bar's Undo is greyed in this harness: the week is swapped under it) */
    await act(async () => { undo(); notify() })
    expect(missIn('#eWeek')).toEqual(['dr:3.0.1.end', 'dr:3.0.2.end'])
    expect([red('dr:3.0.0.end'), red('dr:3.0.1.end'), red('dr:3.0.2.end')], 'the row put back is plain; the two gapped rows red').toEqual([false, true, true])
  })

  it('a row dragged to the top keeps its red; the row it passed stays plain (F2, Astra\'s 1)', async () => {
    await edit('dr:3.0.2.end', '')
    await refuseThu()
    expect(red('dr:3.0.2.end')).toBe(true)
    await act(async () => { expect(applyMove('mv:d.3.0.2', 'mv:d.3.0.0')).toBeTruthy(); view.afterSchedMutate(); notify() })
    expect(missIn('#eWeek')).toEqual(['dr:3.0.0.end'])
    expect(red('dr:3.0.0.end'), 'the dragged row, now first, still red').toBe(true)
  })

  /* RED STAYS WITH ITS PLAN when the plan list changes round it, the plan's content unchanged (D2853; the walk's C62,
     Astra's 2). Plans → + Alt Plan turns the live copy into Plan A (the copy, Plan B, is a new plan: grey until its own
     refused press — the plan's R3 recommendation, two plans never sharing a colour); deleting down to one plan turns the
     survivor back into the plain working copy. */
  const planMenu = async () => { await click($(`#eWeek .day[data-day="${THU}"] .dhtpl [data-planmenu]`)) }
  it('refused on the working copy, + Alt Plan, the time typed in Plan B, back to Plan A: A is still red (C62)', async () => {
    await edit('dr:3.0.0.end', '')
    await refuseThu()
    expect(red('dr:3.0.0.end')).toBe(true)
    await planMenu(); await click($('.wavemenu [data-plandup]'))
    const [a, b] = (SCHED.drafts as any)[THU]
    expect((SCHED.curDraft as any)[THU]).toBe(b.id)
    expect(red('dr:3.0.0.end'), 'Plan B, a copy: grey until its own refused press').toBe(false)
    await edit('dr:3.0.0.end', '13:00')
    await planMenu(); await click($(`.wavemenu [data-plansel="${a.id}"]`))
    expect((SCHED.curDraft as any)[THU]).toBe(a.id)
    expect(red('dr:3.0.0.end'), 'Plan A\'s box was never typed').toBe(true)
  })
  it('refused on Plan B, Plan A deleted: the surviving working copy is still red (Astra\'s 2)', async () => {
    await planMenu(); await click($('.wavemenu [data-plandup]'))
    const [a] = (SCHED.drafts as any)[THU]
    await edit('dr:3.0.0.end', '')
    await refuseThu()
    expect(red('dr:3.0.0.end')).toBe(true)
    await planMenu(); await click($('.wavemenu [data-planmanage]'))
    await click($$('#draftsModal .tpl-tab').find(x => x.textContent!.startsWith(a.name))!)
    await click($('#draftsModal .modal-foot .abtn.danger'))
    expect((SCHED.drafts as any)[THU], 'down to one plan: the plans are gone').toBeUndefined()
    await click($('#draftsClose'))
    expect(red('dr:3.0.0.end'), 'the box was never typed').toBe(true)
  })

  it('View-only Sched never shows it (D2853)', async () => {
    await edit('dr:3.0.0.end', '')
    await act(async () => { view.setPage('viewsched'); notify() })
    expect($$('#vWeek .tg-miss')).toEqual([])
    await act(async () => { view.setPage('editsched'); notify() })
  })
})

describe('Edit Schedule\'s sign-off line (D2854)', () => {
  it('one item: "1 item missing a time · 4 to sign"', async () => {
    await edit('dr:3.0.0.end', '')
    expect(weekLine(THU).textContent).toBe('1 item missing a time · 4 to sign')
  })
  it('a tap on the line goes to each empty box in turn, from the first again after the last (D2854)', async () => {
    expect(weekLine(THU).tagName, 'words while nothing is missing').toBe('SPAN')
    await edit('dr:3.0.0.end', ''); await edit('gr:3.0.end', '')
    expect(weekLine(THU).tagName).toBe('BUTTON')
    expect(weekLine(THU).getAttribute('title'), 'no hover words until his answer (Q-W4)').toBe(null)
    const at = () => document.activeElement && document.activeElement.getAttribute('data-txt')
    await click(weekLine(THU)); expect(at()).toBe('dr:3.0.0.end')
    await click(weekLine(THU)); expect(at()).toBe('gr:3.0.end')
    await click(weekLine(THU)); expect(at(), 'round again').toBe('dr:3.0.0.end')
    await edit('dr:3.0.0.end', '13:00')
    await click(weekLine(THU)); expect(at(), 'a typed box drops out of the turn').toBe('gr:3.0.end')
  })
  /* "in turn" is on from the last box the tap went to, in page order (the re-walk's N2): that box typed since, the next
     tap goes to the one after it, never back to the first */
  it('the box the last tap went to typed since: the next tap goes on to the box after it, wrapping after the last (N2)', async () => {
    await edit('ap:3.1.end', ''); await edit('dr:3.0.1.end', ''); await edit('sr:3.oft.0.end', '')
    const at = () => document.activeElement && document.activeElement.getAttribute('data-txt')
    await click(weekLine(THU)); expect(at()).toBe('ap:3.1.end')
    await click(weekLine(THU)); expect(at()).toBe('dr:3.0.1.end')
    await edit('dr:3.0.1.end', '16:00')
    await click(weekLine(THU)); expect(at(), 'on to the box after the typed one').toBe('sr:3.oft.0.end')
    await edit('sr:3.oft.0.end', '10:30')
    await click(weekLine(THU)); expect(at(), 'the last typed: round to the first').toBe('ap:3.1.end')
  })
  /* ONE TAP SAVES AND GOES (the re-walk's N3): the caret still in a time box, the press takes it out, the box saves, and the
     redraw puts a new count line under the finger ("2 items…" → "1 item…") — the browser's click reaches no copy of the
     button. The press is given to the new line (textedit.ts, the same as a button pressed straight after a changed box). */
  it('the line pressed while the caret is in a typed box: the time saves and the caret goes on to the next empty box (N3)', async () => {
    await edit('ap:3.1.end', ''); await edit('dr:3.0.1.end', '')
    await click(weekLine(THU))
    const box = document.activeElement as HTMLElement, first = box.getAttribute('data-txt')
    expect(['ap:3.1.end', 'dr:3.0.1.end']).toContain(first)
    const other = first === 'ap:3.1.end' ? 'dr:3.0.1.end' : 'ap:3.1.end'
    const old = weekLine(THU), efp = document.elementFromPoint
    const ptr = (type: string, el: Element) => { const ev = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: 5, clientY: 5 }); Object.defineProperty(ev, 'pointerType', { value: 'mouse' }); el.dispatchEvent(ev) }
    try {
      await act(async () => {
        box.textContent = '1700'
        ptr('pointerdown', old)
        box.blur()                                              // the press takes the caret out: the box saves
        await new Promise(r => setTimeout(r, 0))
      })
      expect(weekLine(THU).textContent, 'the time saved').toBe('1 item missing a time · 4 to sign')
      expect(old.isConnected, 'the save drew a new line').toBe(false)
      document.elementFromPoint = (() => weekLine(THU)) as any
      await act(async () => {
        ptr('pointerup', document.body)
        document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))   // the browser's click, to no copy of the line
        await new Promise(r => setTimeout(r, 20))
      })
      expect(document.activeElement && document.activeElement.getAttribute('data-txt'), 'the caret on in the next empty box').toBe(other)
    } finally { document.elementFromPoint = efp }
  })
  it('the board\'s line stays words — its tap waits on his answer Q19', async () => {
    await edit('dr:3.0.0.end', '')
    await act(async () => { openScheduler(THU) })
    expect($('#sbSignBar .so-state').tagName).toBe('SPAN')
  })
  it('three items: "3 items missing a time · 4 to sign"; back to "4 to sign" once typed', async () => {
    await edit('dr:3.0.0.end', ''); await edit('dr:3.0.1.str', ''); await edit('gr:3.0.end', '')
    expect(weekLine(THU).textContent).toBe('3 items missing a time · 4 to sign')
    await edit('dr:3.0.0.end', '13:00'); await edit('dr:3.0.1.str', '06:00'); await edit('gr:3.0.end', '12:30')
    expect(weekLine(THU).textContent).toBe('4 to sign')
  })
})

describe('the sign-off box refuses without opening its list (the try-out)', () => {
  it('while a time is missing the list cannot open or take the keys; the box itself takes the press', async () => {
    const sgn = () => sgnOf("cur")
    expect(sgn().classList.contains('tg-block')).toBe(false)
    expect((sgn().querySelector('select') as HTMLSelectElement).disabled).toBe(false)
    await edit('dr:3.0.0.end', '')
    const s = sgn().querySelector('select') as HTMLSelectElement
    expect(sgn().classList.contains('tg-block')).toBe(true)
    expect(s.disabled, 'the list cannot open').toBe(true)
    expect(s.tabIndex, 'nor take the keys').toBe(-1)
    expect(sgn().getAttribute('role')).toBe('button')
    expect(sgn().getAttribute('aria-disabled')).toBe('true')
    expect(sgn().tabIndex).toBe(0)
  })
  /* the Fable-seat read's F3: a refusing box on a protected week skipped the quarantine's own first word. The week draws
     no sign-off box on a protected week (html.ts dayUnsupportedHTML); the board's sign-off bar is still drawn, and there
     a press said the time note. */
  it('on a protected week the board\'s sign-off box is not locked for the time, and a press says no time note (the Fable-seat read, F3)', async () => {
    await edit('dr:3.0.0.end', '')
    const amV = SCHED.amV, cur = SCHED.cur
    try {
      await act(async () => { SCHED.amV = undefined; SCHED.cur = { ...(SCHED.cur || {}), 0: (SCHED.cur || {})[0] ?? 'orig' }; notify() })
      expect(protectedWeek()).toBe(true)
      expect($$('#eWeek .sgn'), 'the week draws none').toEqual([])
      await act(async () => { openScheduler(THU) })
      const sgn = $$('#schedBoard .sgn')[0]!
      expect(sgn, 'the board draws its bar').toBeTruthy()
      expect(sgn.classList.contains('tg-block'), 'not drawn as refusing for the time').toBe(false)
      await click(sgn); await key(sgn, 'Enter')
      expect(blocked().filter(m => /missing a time/.test(m))).toEqual([])
    } finally {
      await act(async () => { closeScheduler(); SCHED.amV = amV; SCHED.cur = cur; notify() })
    }
  })
  it('Enter or Space on the box says the note', async () => {
    await edit('dr:3.0.0.end', '')
    await key(sgnOf("sked"), 'Enter')
    await key(sgnOf("plan"), ' ')
    expect(blocked()).toEqual(Array(2).fill('Blocked: 1 item is missing a time, outlined in red. Type the missing time, then sign.'))
  })
})

describe('the greyed Publish day takes a press while a time is missing (D2855 E1)', () => {
  const beak = () => $(`#eWeek .day[data-day="${THU}"] button[data-beak]`) as HTMLButtonElement
  it('unsigned, nothing missing: greyed and disabled as before', () => {
    expect(beak().disabled).toBe(true)
  })
  it('unsigned, a time missing: still greyed, pressable, the press refused with the note and the box red', async () => {
    await edit('dr:3.0.0.end', '')
    expect(beak().disabled).toBe(false)
    expect(beak().getAttribute('aria-disabled')).toBe('true')
    expect(beak().classList.contains('locked')).toBe(true)
    await click(beak())
    expect(blocked()).toEqual(['Blocked: 1 item is missing a time, outlined in red. Thursday was not published.'])
    expect(weekBox('dr:3.0.0.end').classList.contains('tg-red')).toBe(true)
  })
})

describe('the Scheduler Board (D2853, D2734)', () => {
  it('its time boxes carry the outline — a desk, a flying line\'s take-off and landing, a Common Programme row', async () => {
    await edit('dr:0.0.0.end', ''); await edit('ff:0.0.0.ld', ''); await edit('ap:0.1.end', '')
    await act(async () => { openScheduler(0) })
    expect([...new Set(missIn('#schedBoard'))].sort()).toEqual(['ap:0.1.end', 'dr:0.0.0.end', 'ff:0.0.0.ld'])
    expect($$('#schedBoard input[data-bfld="ff:0.0.0.ld"]').every(e => e.classList.contains('tg-miss')), 'every copy of the line\'s landing box, one an aircraft row').toBe(true)
  })
  it('its sign-off line reads only the count and "N to sign" while a time is missing; the names come back after', async () => {
    await edit('dr:3.0.0.end', '')
    await act(async () => { openScheduler(THU) })
    expect($('#sbSignBar .so-state').textContent).toBe('1 item missing a time · 4 to sign')
    await edit('dr:3.0.0.end', '13:00')
    expect($('#sbSignBar .so-state').textContent).toMatch(/^4 to sign · CUR CK/)
  })
})

describe('kept for his answers (the plan §R5)', () => {
  it.todo('a box emptied after a refused press: red or grey — waits on his answer R3 (built: grey until the next refused press)')
  it.todo('the board\'s count line tapped goes to each empty box in turn — waits on his answer Q19 (today: plain words)')
  it.todo('the desktop Amendments panel\'s Publish AL greyed but pressable — waits on his answer R6 (today: disabled until signed)')
})
