// @vitest-environment jsdom
/* D550–D556: mounted key/commit/caret regressions. jsdom proves wiring and
   model effects; schedule-tab.spec.ts proves real visibility and native change. */
import { beforeAll, beforeEach, afterAll, afterEach, describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, notify, setSession, resetSession, undo } from '../state/store'
import { histInit, HIST } from '../state/history'
import { DAYS } from '../engine/data'
import { validate } from '../engine/validate'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { txtGet } from '../engine/slots'
import { DPREV, setPage, setBoardDay, PIOPEN, DWOPEN } from '../state/view'
import { openScheduler } from './board'
import { atimeText } from './html'
import { editingText } from './textedit'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
let root: Root, host: HTMLDivElement, seed: any
const editableDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'isContentEditable')
const $ = (s: string) => {
  const el = host.querySelector(s) as HTMLElement
  expect(el, s).toBeTruthy()
  return el
}
const tick = () => act(async () => { await new Promise(r => setTimeout(r, 15)) })
const focus = (el: HTMLElement) => act(async () => { el.focus() })
const tab = async (el: HTMLElement, extra: KeyboardEventInit = {}) => {
  const e = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true, ...extra })
  await act(async () => { el.dispatchEvent(e) })
  return e
}
const board = () => act(async () => { openScheduler(0); notify() })
const week = (key: string) => $(`#eWeek .day[data-day="0"] [data-txt="${key}"]`)
const box = (key: string, n = 0) => [...host.querySelectorAll(`#sbBoard [data-bfld="${key}"]`)][n] as HTMLInputElement
beforeAll(() => {
  // jsdom does not implement this browser property. Supply its standard
  // inherited-attribute reading here; real geometry/native focus is browser-tested.
  Object.defineProperty(HTMLElement.prototype, 'isContentEditable', { configurable: true, get() {
    let el: HTMLElement | null = this
    while (el) { if (el.hasAttribute('contenteditable')) return el.getAttribute('contenteditable') !== 'false'; el = el.parentElement }
    return false
  } })
  initStore()
  seed = JSON.parse(JSON.stringify({ d: DAYS, i: INPUTS, s: SCHED }))
})
afterAll(() => {
  if (editableDescriptor) Object.defineProperty(HTMLElement.prototype, 'isContentEditable', editableDescriptor)
  else delete (HTMLElement.prototype as any).isContentEditable
})
beforeEach(async () => {
  DAYS.splice(0, DAYS.length, ...structuredClone(seed.d))
  INPUTS.splice(0, INPUTS.length, ...structuredClone(seed.i))
  Object.keys(SCHED).forEach(k => delete (SCHED as any)[k])
  Object.assign(SCHED, structuredClone(seed.s))
  DPREV.clear(); PIOPEN.clear(); setBoardDay(null)
  setSession({ user: 'a', role: 'admin' }); setPage('viewsched'); histInit()
  host = document.createElement('div'); document.body.append(host); root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setPage('editsched'); notify() })
})
afterEach(async () => {
  await act(async () => { (document.activeElement as HTMLElement)?.blur(); await new Promise(r => setTimeout(r, 20)); root.unmount() })
  host.remove(); vi.restoreAllMocks()
})

/* The narrow read of the fix round (19 Oct 26, N1 — and F1's own suggested test): a finger that lands on a week box and
   then scrolls holds the week's redraw only until the press is cancelled; the redraw it held is then drawn, without the
   whole app's notify. */
describe('a held week redraw is drawn once a pressed box is let go', () => {
  it('a change while a finger is on a box waits, and shows the moment the press is cancelled', async () => {
    const press = (el: Element, type: string) => el.dispatchEvent(Object.assign(new Event(type, { bubbles: true }), { pointerType: 'touch' }))
    await act(async () => { (document.activeElement as HTMLElement)?.blur() })
    const msn = week('ff:0.0.0.msn'), was = msn.textContent
    press(msn, 'pointerdown')
    expect(editingText(), 'the pressed box counts as the caret').toBe(true)
    await act(async () => { DAYS[0].waves[0].formations[0].msn = 'HELD-THEN-SHOWN'; notify() }); await tick()
    expect(week('ff:0.0.0.msn').textContent, 'held while the finger is down').toBe(was)
    await act(async () => { press(msn, 'pointercancel') }); await tick()
    expect(editingText()).toBe(false)
    expect(week('ff:0.0.0.msn').textContent, 'drawn once the press is let go').toBe('HELD-THEN-SHOWN')
  })
  it('the same on the Scheduler Board: its panel waits, and is drawn the moment the press is cancelled', async () => {
    const press = (el: Element, type: string) => el.dispatchEvent(Object.assign(new Event(type, { bubbles: true }), { pointerType: 'touch' }))
    await board(); await tick()
    await act(async () => { (document.activeElement as HTMLElement)?.blur() })
    const msn = box('ff:0.0.0.msn'), was = msn.value
    press(msn, 'pointerdown')
    expect(editingText(), 'the pressed box counts as the caret').toBe(true)
    await act(async () => { DAYS[0].waves[0].formations[0].msn = 'HELD-THEN-SHOWN'; notify() }); await tick()
    expect(box('ff:0.0.0.msn').value, 'held while the finger is down').toBe(was)
    await act(async () => { press(msn, 'pointercancel') }); await tick()
    expect(editingText()).toBe(false)
    expect(box('ff:0.0.0.msn').value, 'drawn once the press is let go').toBe('HELD-THEN-SHOWN')
  })
})

/* The re-walk of the fix round (19 Oct 26, walk G — re-walk F's surprise; the same on `main`): a time typed, the caret
   still in its block (Tab to the next box), then Undo — the stored value went back, and the box kept showing the typed
   time for good. The held block was remembered as what it last showed BEFORE the typing, so once Undo put the value back
   to that, the paint saw "nothing changed" and never rewrote the box. A held block is now remembered as owed. */
describe('Undo with the caret still in the block puts the box back on screen too', () => {
  it('the week: a B typed, Tab, Undo, the caret leaves — the box shows what is stored', async () => {
    const br = week('ff:0.0.0.br'), was = br.textContent
    await focus(br); br.textContent = '0830'; await tab(br); await tick()
    expect(txtGet('ff:0.0.0.br')).toBe('08:30')
    expect((document.activeElement as HTMLElement).dataset.txt, 'the caret went on in the same line').toBe('ff:0.0.0.to')
    await act(async () => { undo() }); await tick()
    expect(txtGet('ff:0.0.0.br'), 'the stored B is back').toBe('')
    await act(async () => { (document.activeElement as HTMLElement).blur() }); await tick(); await tick()
    expect(week('ff:0.0.0.br').textContent, 'and the box shows it').toBe(was)
  })
  it('the Scheduler Board: the same', async () => {
    await board(); await tick()
    const br = box('ff:0.0.0.br'), was = br.value
    await focus(br)
    await act(async () => { br.value = '08:30'; br.dispatchEvent(new Event('input', { bubbles: true })); box('ff:0.0.0.to').focus(); br.dispatchEvent(new Event('change', { bubbles: true })) }); await tick()
    expect(txtGet('ff:0.0.0.br')).toBe('08:30')
    await act(async () => { undo() }); await tick()
    expect(txtGet('ff:0.0.0.br'), 'the stored B is back').toBe('')
    await act(async () => { (document.activeElement as HTMLElement).blur() }); await tick(); await tick()
    expect(box('ff:0.0.0.br').value, 'and the box shows it').toBe(was)
  })
})

describe('D556 schedule Tab production wiring', () => {
  it('week uses B, empty Brief, each aircraft Remarks/stores, then Area/time and reverse', async () => {
    const keys = ['ff:0.0.0.cs','ff:0.0.0.msn','ff:0.0.0.rl','ff:0.0.0.br','ff:0.0.0.to','ff:0.0.0.ld','fr:0.0.0.0']   // the R box before B (D1026, D554's route)
    const route = [...keys.map(week), $('[data-bombs="0.0.0.0"]'), week('fr:0.0.0.1'), $('[data-bombs="0.0.0.1"]'), $('[data-area="0.0.0"]'), $('[data-atime="0.0.0"]')]
    const before = JSON.stringify({ d: DAYS, s: SCHED }), h = HIST.stack.length
    await focus(route[0]!)
    for (let i = 1; i < route.length; i++) {
      expect((await tab(route[i-1]!)).defaultPrevented).toBe(true)
      expect(document.activeElement).toBe(route[i])
    }
    for (let i = route.length-2; i >= 0; i--) { await tab(route[i+1]!, { shiftKey: true }); expect(document.activeElement).toBe(route[i]) }
    expect(JSON.stringify({ d: DAYS, s: SCHED })).toBe(before)
    expect(HIST.stack.length).toBe(h)
  })
  it('Board repeats all flight fields for each aircraft and preserves a native text caret', async () => {
    await board()
    const route: HTMLElement[] = []
    for (const row of [...host.querySelectorAll('#sbBoard .sb-line')].slice(0, 2))
      route.push(...row.querySelectorAll<HTMLElement>('[data-bfld],[data-bombs]'))
    expect(route.length).toBe(16)   // eight a line since D1026 (the R box)
    await focus(route[0]!)
    for (let i = 1; i < route.length; i++) { await tab(route[i-1]!); expect(document.activeElement).toBe(route[i]) }
    await tab(route.at(-1)!, { shiftKey: true }); expect(document.activeElement).toBe(route.at(-2))
    expect(document.activeElement?.closest('#sbBoard')).toBeTruthy()
  })
  it.each(['prog','waves','duty','sims','ground','inputs','unav'])('D555 %s text and its next section follow full displayed order without no-op writes', async section => {
    await act(async () => { $('[data-pitog="0"]').dispatchEvent(new MouseEvent('click', { bubbles: true })) })
    const candidates = [...host.querySelectorAll<HTMLElement>('#eWeek > .day[data-day="0"] [contenteditable="true"]')]
      .filter(el => el.matches('[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]'))
    expect(candidates.length).toBeGreaterThan(40)
    const indices = candidates.map((el,i) => el.closest('[data-secmove]')?.getAttribute('data-secmove') === `0.${section}` ? i : -1).filter(i => i >= 0)
    expect(indices.length, section).toBeGreaterThan(0)
    const before = JSON.stringify({ d: DAYS, i: INPUTS, s: SCHED })
    await focus(candidates[indices[0]!]!)
    for (const i of indices) {
      expect(document.activeElement).toBe(candidates[i]); await tab(candidates[i]!)
      if (candidates[i+1]) expect(document.activeElement).toBe(candidates[i+1])
    }
    expect(JSON.stringify({ d: DAYS, i: INPUTS, s: SCHED })).toBe(before)
  })
  it('does not open pickers or include hidden, readonly, disabled or role-dialog boxes', async () => {
    const cs = week('ff:0.0.0.cs'), mission = week('ff:0.0.0.msn'), brief = week('ff:0.0.0.br')
    const trap = document.createElement('input'); trap.dataset.txt = 'fr:0.0.0.0'; trap.disabled = true
    const readonly = trap.cloneNode() as HTMLInputElement; readonly.disabled = false; readonly.readOnly = true
    const role = document.createElement('div'); role.dataset.roleUi = 'fixture'; role.append(trap.cloneNode())
    const closed = document.createElement('div'); closed.hidden = true; const hidden = trap.cloneNode() as HTMLInputElement; hidden.disabled = false; closed.append(hidden)
    cs.after(trap, readonly, role, closed); const click = vi.fn(); mission.addEventListener('click', click)
    brief.style.display = 'none'
    await focus(cs); await tab(cs); expect(document.activeElement).toBe(mission); expect(click).not.toHaveBeenCalled()
    await tab(mission); expect(document.activeElement).toBe(week('ff:0.0.0.rl'))   // the R box (D1026)
    await tab(week('ff:0.0.0.rl')); expect(document.activeElement).toBe(week('ff:0.0.0.to'))
  })
  it('ignores modified Tab and composing events, preserving ordinary non-text navigation', async () => {
    const cs = week('ff:0.0.0.cs'); await focus(cs)
    for (const extra of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true }]) {
      expect((await tab(cs, extra)).defaultPrevented).toBe(false); expect(document.activeElement).toBe(cs)
    }
    const button = $('[data-daytplopen="0"]'); await focus(button)
    expect((await tab(button)).defaultPrevented).toBe(false)
  })
  /* D597 (owner, 6 Oct 26 — narrows D553): the day has no button below its last box, so the final forward Tab keeps the
     caret in that box. Until then this test pinned "blurs" — the caret on nothing, the stack check's W14. */
  it('first reverse exits to the same-day sign control; final forward keeps the caret in the last box, never Tuesday (D597)', async () => {
    const fields = [...host.querySelectorAll<HTMLElement>('#eWeek > .day[data-day="0"] [contenteditable="true"]')]
      .filter(el => el.matches('[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]'))
    await focus(fields[0]!); await tab(fields[0]!, { shiftKey: true })
    expect((document.activeElement as HTMLElement).dataset.signday).toBe('0')
    const last = fields.at(-1)!
    await focus(last); expect((await tab(last)).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(last)
    expect((await tab(last)).defaultPrevented).toBe(true); expect(document.activeElement).toBe(last)   // and again: it stays
    expect((document.activeElement as HTMLElement).closest('#eWeek > .day')!.getAttribute('data-day')).toBe('0')
    expect((await tab(last, { shiftKey: true })).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(fields.at(-2))                                                // Shift+Tab goes back
  })
  it('a single available text box exits once instead of looping, then a day with none leaves ordinary Tab alone', async () => {
    const root=$('#eWeek > .day[data-day="0"]'),cs=week('ff:0.0.0.cs')
    root.querySelectorAll<HTMLElement>('[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]').forEach(el=>{if(el!==cs)el.hidden=true})
    const before=JSON.stringify(DAYS);await focus(cs);expect((await tab(cs)).defaultPrevented).toBe(true)
    expect(document.activeElement).not.toBe(cs);expect(JSON.stringify(DAYS)).toBe(before)
    cs.hidden=true;const button=$('[data-daytplopen="0"]');await focus(button);expect((await tab(button)).defaultPrevented).toBe(false)
  })
  it('ignores text after a preview guard or loss of edit permission', async () => {
    const cs = week('ff:0.0.0.cs'); await focus(cs)
    DPREV.set(0, 'not-an-existing-issued-version')
    expect((await tab(cs)).defaultPrevented).toBe(false); DPREV.clear()
    setSession({ user: 'us', role: 'member' })
    expect((await tab(cs)).defaultPrevented).toBe(false)
  })
  it('commits a valid time once via native blur; unreadable time heals and still moves', async () => {
    const to = week('ff:0.0.0.to'), ld = week('ff:0.0.0.ld'), old = txtGet('ff:0.0.0.to')
    await focus(to); to.textContent = '1255'; await tab(to)
    expect(txtGet('ff:0.0.0.to')).toBe('12:55'); expect(document.activeElement).toBe(ld)
    await focus(to); to.textContent = 'unreadable'; await tab(to)
    expect(txtGet('ff:0.0.0.to')).toBe('12:55'); expect(to.textContent).toBe('12:55')
    await act(async () => { ld.blur(); undo() }); expect(txtGet('ff:0.0.0.to')).toBe(old)
  })
  it.each([0, 1])('clear in-time %i readdresses its surviving neighbour before that neighbour saves', async ix => {
    const lines = [...host.querySelectorAll<HTMLElement>('#eWeek .day[data-day="0"] [data-itline^="0|0|"]')]
    expect(lines.length).toBe(2)
    const deleted = lines[ix]!, survivor = lines[1-ix]!, original = [...DAYS[0].waves[0].intimes]
    await focus(deleted); deleted.textContent = ''
    await act(async () => { survivor.focus() }) // ordinary focus invokes the real deletion path
    expect(survivor.dataset.itline).toBe('0|0|0')
    survivor.textContent = '11:00 NEW RALLY'; await tab(survivor)
    expect(DAYS[0].waves[0].intimes).toEqual(['11:00 NEW RALLY'])
    await act(async () => { (document.activeElement as HTMLElement)?.blur(); undo() })
    expect(DAYS[0].waves[0].intimes).toEqual([original[1-ix]])
  })
  it('Board input-owned fields defer unrelated redraw while typing', async () => {
    await board()
    const input = $('#sbBoard [data-ifld]') as HTMLInputElement
    await focus(input); expect(editingText()).toBe(true)
    input.value = 'UNSAVED CARET'; const key = input.dataset.ifld
    await act(async () => { DAYS[0].waves[0].formations[0].cs = 'CHANGED'; notify() })
    expect(input.isConnected).toBe(true); expect(document.activeElement).toBe(input)
    expect(($(`#sbBoard [data-ifld="${key}"]`) as HTMLInputElement).value).toBe('UNSAVED CARET')
  })
  it('clearing a middle in-time uses the surviving next line and reverse Tab saves that exact line', async () => {
    await act(async()=>{DAYS[0].waves[0].intimes.push('12:00 THIRD RALLY');notify()})
    histInit();const original=[...DAYS[0].waves[0].intimes],middle=$('[data-itline="0|0|1"]')
    await focus(middle);middle.textContent='';await tab(middle)
    const survivor=$('[data-itline="0|0|1"]');expect(document.activeElement).toBe(survivor)
    survivor.textContent='11:00 MIDDLE SURVIVOR';await tab(survivor,{shiftKey:true})
    expect((document.activeElement as HTMLElement).dataset.itline).toBe('0|0|0')
    expect(DAYS[0].waves[0].intimes).toEqual([original[0],'11:00 MIDDLE SURVIVOR'])
    await act(async()=>{(document.activeElement as HTMLElement).blur();undo()})
    expect(DAYS[0].waves[0].intimes).toEqual([original[0],original[2]])
  })
  it('TO change refreshes the destination derived Area time without freezing an override', async () => {
    const to = week('ff:0.0.0.to'), area = $('[data-atime="0.0.0"]'), f = DAYS[0].waves[0].formations[0]
    const had = f.atime; await focus(to); to.textContent = '1255'
    let current = to
    for (let i = 0; i < 12 && current !== area; i++) { await tab(current); current = document.activeElement as HTMLElement }
    expect(document.activeElement).toBe(area); expect(area.textContent).toBe(atimeText(f))
    await tab(area); expect(f.atime).toBe(had)
  })
  it('Board refreshes repeated flight fields from a prior row commit before focus', async () => {
    await board(); const first = box('ff:0.0.0.cs'), repeated = box('ff:0.0.0.cs', 1)
    expect(repeated).toBeTruthy(); await focus(first)
    first.value = 'NEW CALLSIGN'
    first.addEventListener('blur', () => first.dispatchEvent(new Event('change', { bubbles: true })), { once: true })
    let current: HTMLElement = first
    for (let i = 0; i < 10 && current !== repeated; i++) { await tab(current); current = document.activeElement as HTMLElement }
    expect(document.activeElement).toBe(repeated); expect(repeated.value).toBe('NEW CALLSIGN')
  })
  it('final unchanged Board blur repaints dependent fields after a saved text edit', async () => {
    await board(); const first = box('ff:0.0.0.cs'), repeated = box('ff:0.0.0.cs', 1), last = box('ff:0.0.0.msn')
    await focus(first); first.value = 'SETTLED'
    first.addEventListener('blur', () => first.dispatchEvent(new Event('change', { bubbles: true })), { once: true })
    await act(async () => { last.focus() }); expect(repeated.value).not.toBe('SETTLED')
    await act(async () => { last.blur() }); await tick()
    expect(box('ff:0.0.0.cs', 1).value).toBe('SETTLED')
  })
  it.each(['Enter','ordinary blur','final Tab'])('week settles derived display after saved TO → unchanged Landing → %s', async exit => {
    const to=week('ff:0.0.0.to'),ld=week('ff:0.0.0.ld'),f=DAYS[0].waves[0].formations[0],h=HIST.stack.length
    await focus(to);to.textContent='1255';await tab(to);await tick()
    expect(document.activeElement).toBe(ld);expect(ld.isConnected).toBe(true)
    expect(txtGet('ff:0.0.0.to')).toBe('12:55');expect(HIST.stack.length).toBe(h+1)
    if(exit==='Enter')await act(async()=>{ld.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}))})
    else if(exit==='ordinary blur')await act(async()=>{ld.blur()})
    else {
      const fields=[...host.querySelectorAll<HTMLElement>('#eWeek > .day[data-day="0"] [contenteditable="true"]')]
        .filter(el=>el.matches('[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]'))
      await focus(fields.at(-1)!);await tab(fields.at(-1)!)
    }
    await tick()
    expect($('[data-atime="0.0.0"]').textContent).toBe(atimeText(f))
    expect(week('ff:0.0.0.to').textContent).toBe('12:55')
    expect(f.atime??null).toBe(null);expect(HIST.stack.length).toBe(h+1)
  })
  /* Sol's read of the third round (6 Oct 26): the catch-up at the last box's Tab must also hold when the stale box and
     the day's last box are in the SAME section — Flying dragged to the foot of the day. The first build asked for the
     redraw after the caret was back, when that section was the one being held for it. */
  it("D597 with Flying last on the day, the last box's Tab still shows an earlier take-off's new area time and keeps the caret", async () => {
    await act(async () => { (DAYS[0] as any).secOrder = ['notes','prog','duty','sims','ground','inputs','avail','sans','unav','waves']; notify() }); await tick()
    const to = week('ff:0.0.0.to'), f = DAYS[0].waves[0].formations[0], h = HIST.stack.length
    await focus(to); to.textContent = '1255'; await tab(to); await tick()
    expect(txtGet('ff:0.0.0.to')).toBe('12:55')
    const fields = () => [...host.querySelectorAll<HTMLElement>('#eWeek > .day[data-day="0"] [contenteditable="true"]')]
      .filter(el => el.matches('[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]'))
    const last = fields().at(-1)!, marks = (el: HTMLElement) => el.tagName + JSON.stringify({ ...el.dataset })
    expect(last.closest('[data-secmove="0.waves"],.wv-sech,.go,.wave') || last.matches('[data-area],[data-atime],[data-bombs],[data-txt^="f"]'), "the day's last box is a flying one").toBeTruthy()
    const was = marks(last)
    await focus(last); await tab(last); await tick()
    expect(marks(document.activeElement as HTMLElement), 'the caret is in the last box').toBe(was)
    expect($('[data-atime="0.0.0"]').textContent, "and the first line's area time is the new one").toBe(atimeText(f))
    expect(f.atime ?? null).toBe(null); expect(HIST.stack.length).toBe(h + 1)
  })
  /* Astra's re-read (6 Oct 26, F1): the redraw carried through at that Tab can REPLACE the whole day on screen — the
     week does when the day's shape changes (its first warning appears, its last one goes: ui/dayswap.ts). The check
     that followed the redraw asked for the ORIGINAL day element, found it gone, and left the caret on nothing — D597's
     fault back by another road. The day is looked up again and the box's twin takes the caret. */
  it('D597 when the redraw at that Tab replaces the whole day on screen, the caret still goes back into the last box', async () => {
    /* Friday of the demo week carries no warning, so its first one adds a block to the day and the whole day is replaced */
    const day = () => host.querySelector<HTMLElement>('#eWeek > .day[data-day="4"]')!
    const fields = () => [...day().querySelectorAll<HTMLElement>('[contenteditable="true"]')]
      .filter(el => el.matches('[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]'))
    const marks = (el: HTMLElement) => el.tagName + JSON.stringify({ ...el.dataset })
    const last = fields().at(-1)!, was = marks(last), first = day()
    /* his save brings the day its first warning: here, a wave arriving with one man in two of its jets, with that blur */
    expect(day().querySelector('.warnbar,.wbar,[data-warnday]'), 'Friday starts with no warning block').toBeNull()
    last.addEventListener('blur', () => {
      const wave = JSON.parse(JSON.stringify(DAYS[0].waves[0], (k, v) => k === 'rid' ? undefined : v))
      wave.formations[1].aircraft[0].p = wave.formations[0].aircraft[0].p
      ;(DAYS[4] as any).waves = [wave]; validate(); notify()
    }, { once: true })
    await focus(last); expect((await tab(last)).defaultPrevented).toBe(true); await tick()
    expect(first.isConnected, 'the day on screen really was replaced (or this test proves nothing)').toBe(false)
    expect(document.activeElement, 'the caret is not left on the page').not.toBe(document.body)
    expect(marks(document.activeElement as HTMLElement), 'it is in the last box\u2019s twin').toBe(was)
    expect((document.activeElement as HTMLElement).closest('#eWeek > .day')!.getAttribute('data-day')).toBe('4')
  })
  /* [TAB-LAST-BOX-TEST-GAPS] (Astra's owed read of D597, 6 Oct 26 — no defect, three things its tests did not cover). */
  const friday = () => host.querySelector<HTMLElement>('#eWeek > .day[data-day="4"]')!
  const boxesOf = (day: HTMLElement) => [...day.querySelectorAll<HTMLElement>('[contenteditable="true"]')]
    .filter(el => el.matches('[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]'))
  const marksOf = (el: HTMLElement) => el.tagName + JSON.stringify({ ...el.dataset })
  const clash = () => { const wave = JSON.parse(JSON.stringify(DAYS[0].waves[0], (k, v) => k === 'rid' ? undefined : v)); wave.formations[1].aircraft[0].p = wave.formations[0].aircraft[0].p; return wave }
  /* a day of the demo week with no warning; given one, his save at the Tab takes it back to how it was */
  /* the warnings are worked out afresh first: what an earlier test left in the warning list must not choose the day */
  async function quietDay(ok: (d: HTMLElement) => boolean = () => true) {
    await act(async () => { validate(); notify() }); await tick()
    const di = [0, 1, 2, 3, 4, 5, 6].find(i => { const d = host.querySelector<HTMLElement>(`#eWeek > .day[data-day="${i}"]`); return d && !d.querySelector('.dwbox') && DAYS[i] && ok(d) })
    expect(di, 'the demo week has a day with no warning (or this test needs another way in)').toBeDefined()
    return di!
  }
  async function warnedThenCleared(di: number, last: () => HTMLElement) {
    const day = () => host.querySelector<HTMLElement>(`#eWeek > .day[data-day="${di}"]`)!
    const quiet = (DAYS[di] as any).waves
    await act(async () => { (DAYS[di] as any).waves = [...quiet, clash()]; validate(); notify() }); await tick()
    expect(day().querySelector('.dwbox'), 'the day has its one warning block').toBeTruthy()
    const box = last(), first = day()
    box.addEventListener('blur', () => { (DAYS[di] as any).waves = quiet; validate(); notify() }, { once: true })
    await focus(box); expect((await tab(box)).defaultPrevented).toBe(true); await tick()
    expect(day().querySelector('.dwbox'), 'the warning block went').toBeNull()
    expect(first.isConnected, 'the day on screen really was replaced (or this test proves nothing)').toBe(false)
    return { box, day }
  }
  /* (1) the reverse of the test above: the day's LAST warning goes at that Tab — its block leaves, the day is replaced */
  it("D597 when the save at the last box's Tab clears the day's only warning, the caret still goes back into the last box", async () => {
    const di = await quietDay()
    /* a request of his on that day, so its remarks are the day's last box with no button below (D597's case) */
    await act(async () => { INPUTS.push({ iid: 'tab-last-box', person: 'bane', date: DAYS[di].dt, allday: true, type: 'LL', remarks: 'D597', mod: '2026-07-01' } as any); notify() }); await tick()
    const lastBox = () => boxesOf(host.querySelector<HTMLElement>(`#eWeek > .day[data-day="${di}"]`)!).at(-1)!
    expect(lastBox().dataset.inp, 'the request’s remarks are the last box').toBe('tab-last-box.rmks')
    const was = marksOf(lastBox())
    const { day } = await warnedThenCleared(di, lastBox)
    expect(marksOf(document.activeElement as HTMLElement), 'the caret is in the last box’s twin').toBe(was)
    expect((document.activeElement as HTMLElement).closest('#eWeek > .day')).toBe(day())
  })
  /* (1b) found by (1)'s first draft (18 Oct 26): where a control DOES follow the day's last box — a weekend's Ground
     Programme note, with the crew after it — the Tab goes on to that control (D553). When the save there replaced the
     whole day, the redraw came a moment after the focus had moved and took the control away: the focus was on nothing. */
  it("Tab from the last box onto the control after it, when the save replaces the whole day: that control has the focus", async () => {
    const di = await quietDay(d => /^gn:/.test(boxesOf(d).at(-1)?.dataset.txt || ''))
    const dayEl = () => host.querySelector<HTMLElement>(`#eWeek > .day[data-day="${di}"]`)!
    const lastBox = () => boxesOf(dayEl()).at(-1)!
    /* the route's own reading of "a control": a button, a box or anything the keyboard is let into, not a text box */
    const next = [...dayEl().querySelectorAll<HTMLElement>('button,input,textarea,select,a[href],[tabindex]')]
      .find(b => !b.matches('[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]') && b.tabIndex >= 0 && !(b as HTMLButtonElement).disabled && !!(lastBox().compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING))
    expect(next, 'a control follows that day’s last box (or this test proves nothing)').toBeTruthy()
    const want = marksOf(next!) + next!.textContent
    const { day } = await warnedThenCleared(di, lastBox)
    const a = document.activeElement as HTMLElement
    expect(a, 'the focus is not left on the page').not.toBe(document.body)
    expect(marksOf(a) + a.textContent, 'it is on the control after the box').toBe(want)
    expect(a.closest('#eWeek > .day')).toBe(day())
  })
  /* (2) the box has no twin after the redraw (its row went with the save): the caret falls back to the day's last box */
  it("D597 when the last box itself is gone after that Tab's redraw, the caret goes into the day's new last box", async () => {
    const last = boxesOf(friday()).at(-1)!, was = marksOf(last)
    /* the day's last box is a request's remarks: the blur takes the request away, and its row with it */
    const iid = String(last.dataset.inp || '').split('.')[0]
    expect(iid, "Friday's last box is a request's (or this test needs another way to lose it)").toBeTruthy()
    last.addEventListener('blur', () => {
      const at = INPUTS.findIndex((x: any) => x.iid === iid); expect(at).toBeGreaterThanOrEqual(0)
      INPUTS.splice(at, 1); validate(); notify()
    }, { once: true })
    await focus(last); expect((await tab(last)).defaultPrevented).toBe(true); await tick()
    expect(last.isConnected, 'the box went from the screen').toBe(false)
    const now = boxesOf(friday())
    expect(now.some(el => marksOf(el) === was), 'the box has no twin left (or this test proves nothing)').toBe(false)
    expect(now.length).toBeGreaterThan(0)
    expect(document.activeElement, 'the caret is in the day’s last box').toBe(now.at(-1))
  })
  /* (3) the day is replaced DURING the box's own blur — before the route looks again. The route's first check after the
     blur (the same page, the same day still standing) then stops it: the caret is left where the blur left it and
     nothing else happens. Pinned as it is — a boundary of what the route covers, not a fault a person has met. */
  it("D597 a day replaced during the last box's own blur stops the route there: nothing is focused, nothing written", async () => {
    const day = $('#eWeek > .day[data-day="0"]'), last = boxesOf(day).at(-1)!, h = HIST.stack.length
    last.addEventListener('blur', () => { day.replaceWith(day.cloneNode(true)) }, { once: true })
    await focus(last); expect((await tab(last)).defaultPrevented).toBe(true); await tick()
    expect(day.isConnected).toBe(false)
    expect(document.activeElement === document.body || !document.activeElement, 'the route placed no caret').toBe(true)
    expect(HIST.stack.length).toBe(h)
  })
  it.each(['page','Board day','admin session'])('source blur changing %s does not focus its stale destination',async transition=>{
    if(transition==='Board day')await board()
    const source=transition==='Board day'?box('ff:0.0.0.cs'):week('ff:0.0.0.cs')
    const destination=transition==='Board day'?box('ff:0.0.0.msn'):week('ff:0.0.0.msn'),h=HIST.stack.length
    source.addEventListener('blur',()=>{
      if(transition==='page')setPage('viewsched')
      else if(transition==='Board day')setBoardDay(1)
      else {resetSession({user:'another-admin',role:'admin'});setPage('editsched')}
      notify()
    },{once:true})
    await focus(source);await tab(source);await tick()
    expect(document.activeElement).not.toBe(destination);expect(HIST.stack.length).toBe(h)
  })
  it.each(['detach','dialog'])('source blur with a %s destination change leaves new focus alone',async transition=>{
    const source=week('ff:0.0.0.cs'),destination=week('ff:0.0.0.msn'),h=HIST.stack.length
    let dialogInput:HTMLInputElement|undefined
    source.addEventListener('blur',()=>{
      if(transition==='detach')destination.remove()
      else {const dialog=document.createElement('div');dialog.setAttribute('role','dialog');dialogInput=document.createElement('input');dialog.append(dialogInput);host.append(dialog);dialogInput.focus()}
    },{once:true})
    await focus(source);await tab(source);await tick()
    expect(document.activeElement).not.toBe(destination)
    if(dialogInput)expect(document.activeElement).toBe(dialogInput)
    expect(HIST.stack.length).toBe(h)
  })
  it.each(['page','day','session','unmount'].flatMap(transition=>['week','Board'].map(surface=>({transition,surface}))))('pending $surface paint cancelled by $transition cannot replace new dialog focus',async({transition,surface})=>{
    if(surface==='Board')await board()
    const to=surface==='Board'?box('ff:0.0.0.to'):week('ff:0.0.0.to'),h=HIST.stack.length
    await focus(to)
    if(to instanceof HTMLInputElement){to.value='1255';to.addEventListener('blur',()=>to.dispatchEvent(new Event('change',{bubbles:true})),{once:true})}
    else to.textContent='1255'
    await tab(to);await tick();expect(HIST.stack.length).toBe(h+1)
    const dialog=document.createElement('div'),input=document.createElement('input');dialog.setAttribute('role','dialog');dialog.append(input);document.body.append(dialog)
    try{
      await act(async()=>{
        if(transition==='page')setPage('viewsched')
        else if(transition==='day')setBoardDay(1)
        else if(transition==='session')resetSession({user:'another-admin',role:'admin'})
        else root.render(null)
        input.focus();notify()
      })
      await tick();expect(document.activeElement).toBe(input);expect(input.isConnected).toBe(true);expect(HIST.stack.length).toBe(h+1)
    }finally{dialog.remove()}
  })
})

/* W11 (the Codex stack check, 5 Oct 26; D103, D529): a box whose stored words hold a doubled space (a request's remark
   as filed, a template's text — writers that do not fold spaces) was "changed" by merely passing through it: the save
   folds runs of spaces, the folded words differed from the stored ones, and it wrote them — a history line whose before
   and after look the same, and on a published day "1 pending" and the four sign-offs gone. A whole-day Tab pass makes
   that the normal case. A difference that is only spacing is no change. */
describe('W11 a Tab pass through a box holding a doubled space changes nothing', () => {
  it('week: no write, no pending mark, no history step; a real edit still saves, folded', async () => {
    const { commandStream } = await import('../command')
    const { txtSet } = await import('../engine/slots')
    await act(async () => { DAYS[0].waves[0].formations[0].aircraft[0].rmks = 'Dental review.  Back by 1400'; histInit(); notify() })
    const rm = week('fr:0.0.0.0')
    expect(rm.textContent).toBe('Dental review.  Back by 1400')
    const cmds = commandStream().length, steps = HIST.stack.length, pending = JSON.stringify(SCHED.pending)
    await focus(rm); await tab(rm); await tick()
    expect(document.activeElement, 'the route still moves on').not.toBe(rm)
    expect(commandStream().length, 'no command').toBe(cmds)
    expect(HIST.stack.length, 'no Undo step').toBe(steps)
    expect(JSON.stringify(SCHED.pending), 'no pending mark').toBe(pending)
    expect(DAYS[0].waves[0].formations[0].aircraft[0].rmks, 'the stored words are untouched').toBe('Dental review.  Back by 1400')
    await act(async () => { (document.activeElement as HTMLElement)?.blur() }); await tick()
    /* the funnel itself: spacing alone is no change, in either direction; other words are */
    expect(txtSet('fr:0.0.0.0', ' Dental review. Back   by 1400 ')).toBe(false)
    expect(txtSet('fr:0.0.0.0', 'Dental review. Back by 1500')).toBe(true)
    expect(txtGet('fr:0.0.0.0')).toBe('Dental review. Back by 1500')
  })
})

/* W12 (the Codex stack check, 5 Oct 26): a save that opens a window. Changing a weekend duty request's start time on
   Edit Schedule and pressing Tab saved it and opened the OIL question — and the route had already put the caret in
   the next box BEHIND that window, where typed characters and further Tabs went on editing the schedule unseen. The
   route stops when the save it caused asks for a window, never walks while one is up, and the window takes the keys.
   REWRITTEN TO HIS RULING, 11 Oct 26 (D739 reading 4, D740 reading 4 — the shared-row job's step 1): hours typed on a
   row of the schedule open NO question — an unanswered day stays unanswered, for its own bell — so the save that used
   to raise this window no longer does, and the Tab simply moves on. The guard itself is kept and still pinned: a text
   box behind a window that IS up is not on the route (the window opened here by its own door, as the bell opens it). */
describe('W12 the Tab route and the OIL question', () => {
  it('Tab out of a weekend duty request’s time saves it and opens NO question (D739 (4)); a box behind a window that is up is not on the route', async () => {
    const pops = await import('./pops')
    const { inpId } = await import('../engine/inputs')
    const row: any = { ...structuredClone(INPUTS.find((r: any) => r.person === 'bane' && r.s != null)!), iid: 'iw12duty', type: 'Duty', date: 'Jul 18', remarks: 'w12', s: 480, e: 720 }
    delete row.acc; delete row.oil; delete row.endDate
    await act(async () => { INPUTS.push(row); PIOPEN.add(5); histInit(); notify() })
    const start = $(`#eWeek .day[data-day="5"] [data-inp="${inpId(row)}.str"]`)
    await focus(start); start.textContent = '0900'
    /* the caret must never even touch the next schedule box on its way (the route stops before focusing it) */
    let touched = 0
    const spy = (ev: Event) => { const t = ev.target as HTMLElement; if (t !== start && t.closest && t.closest('#eWeek [data-inp], #eWeek [data-txt]')) touched++ }
    document.addEventListener('focusin', spy, true)
    const e = await tab(start); await tick()
    document.removeEventListener('focusin', spy, true)
    expect(e.defaultPrevented).toBe(true)
    const saved: any = INPUTS.find((r: any) => r.iid === 'iw12duty')!
    expect(saved.s, 'the time was saved once').toBe(540)
    expect(saved.oil, 'the day nobody answered stays unanswered').toBeUndefined()
    expect(pops.INPEDIT, 'no window was asked for').toBeFalsy()
    expect(document.querySelector('[data-testid="oilconf"]'), 'no OIL question on the schedule').toBeNull()
    expect(touched, 'the route moved on to the next box').toBeGreaterThan(0)
    await act(async () => { (document.activeElement as HTMLElement)?.blur() }); await tick()
    /* the question, opened by its own door — the way the bell opens it */
    await act(async () => { pops.setOilAsk('iw12duty'); pops.setInpEdit(saved); notify() }); await tick()
    const sheet = document.querySelector<HTMLElement>('[data-testid="oilconf"]')
    expect(sheet, 'the OIL question is up').toBeTruthy()
    await act(async () => { (sheet!.querySelector('button, [tabindex]') as HTMLElement)?.focus() })
    expect(editingText(), 'no caret in a schedule box behind the window').toBe(false)
    expect(sheet!.contains(document.activeElement), 'the window holds the keyboard').toBe(true)
    /* a text box behind an open window is not on the route: a Tab there goes back INTO the window (RF2 — the sheet
       keeps the keyboard), never on to the next schedule box */
    const behind = week('ff:0.0.0.cs')
    await focus(behind)
    await tab(behind)
    expect(sheet!.contains(document.activeElement), 'a Tab behind the window comes back into it').toBe(true)
    expect(editingText(), 'and never on to the next schedule box').toBe(false)
    await act(async () => { (document.activeElement as HTMLElement)?.blur(); pops.setOilAsk(null); pops.setInpEdit(null); notify() }); await tick()
    /* and with the window closed the route is back */
    await focus(behind)
    expect((await tab(behind)).defaultPrevented).toBe(true)
  })
})

/* W15 + W16 (the Codex stack check, 5 Oct 26; D509 "shows in the warning list"): during a Tab run the day did not
   redraw at all — "never repaint under the caret" was kept by repainting NOTHING — so a warning made or cleared by a
   Tab commit was missing from, or left in, the day's list and count until he left the text boxes, and a wave's header
   kept its old In-time / Rally clock. Now everything that does not hold the caret is written at once, and the wave
   header inside the caret's own block is corrected in place. */
describe('W15 W16 the day keeps up while he tabs', () => {
  const words = (sel: string) => (host.querySelector(sel) as HTMLElement).textContent!.replace(/\s+/g, ' ')
  const BOX = '#eWeek .day[data-day="0"] [data-dwbox="0"]'
  const shown = async () => {
    const { WARN } = await import('../engine/validate')
    const { shownWarns } = await import('../engine/warnhide')
    return shownWarns((WARN.byDay[0] && WARN.byDay[0].warns) || []) as any[]
  }
  /* an in-time typed later than the suggested brief of its formation: a red timing warning the day did not have (D509) */
  const LATE = () => { const f = DAYS[0].waves[0].formations[0]; return `${f.to}H: ${f.cs} IN TIME` }
  it('week: a Tab commit that makes a warning updates the bar of the day at once, the caret staying in the next box', async () => {
    await act(async () => { DWOPEN.add(0); notify() })   // the list of the day, open, as a scheduler keeps it
    const boxWas = words(BOX)
    expect(boxWas).not.toContain('is later than')
    const line = $('#eWeek .day[data-day="0"] [data-itline="0|0|0"]'), block = line.closest('.dsec')!
    await focus(line); line.textContent = LATE(); await tab(line); await tick()
    const at = document.activeElement as HTMLElement
    expect(editingText(), 'the caret is in the next box').toBe(true)
    expect(at.isConnected && at.closest('.dsec') === block, 'and that box was never redrawn — same block, same node').toBe(true)
    const now = await shown()
    expect(now.some((w: any) => w.code === 'REPORT_ORDER'), 'the edit really made the timing warning').toBe(true)
    expect(words(BOX), 'the list names it while he is still typing').toContain('is later than')
    expect(words(BOX), 'and its count is the count now').toContain(`${now.length} issue`)
    await act(async () => { at.blur(); undo() }); await tick()
    expect(words(BOX)).toBe(boxWas)
    DWOPEN.delete(0)
  })
  it('week: the wave header follows an In-time / Rally line changed on the way through (W16)', async () => {
    await act(async () => {
      DAYS[0].waves[0].formations.forEach((x: any) => { x.to = '00:30'; x.ld = '01:30'; x.br = '' })
      DAYS[0].waves[0].intimes = ['21:30H: IN TIME + WX/NOTAMS']; histInit(); notify()
    })
    const HEAD = '#eWeek .day[data-day="0"] .go .go-tab .asd'
    expect(words(HEAD)).toContain('In-time / Rally 21:30 (prev day)')
    const line = $('#eWeek .day[data-day="0"] [data-itline="0|0|0"]')
    await focus(line); line.textContent = '22:30H: IN TIME + WX/NOTAMS'; await tab(line); await tick()
    expect(editingText(), 'still in a text box').toBe(true)
    expect(DAYS[0].waves[0].intimes).toEqual(['22:30H: IN TIME + WX/NOTAMS'])
    expect(words(HEAD), 'the header beside the line agrees with it').toContain('In-time / Rally 22:30 (prev day)')
    expect(words(HEAD)).not.toContain('21:30')
  })
  it('Board: the warning list of the day follows a Tab commit; the boxes of the board are not redrawn under the caret', async () => {
    await board()
    const listWas = words('#sbWarn')
    expect(listWas).not.toContain('is later than')
    const line = $('#sbBoard [data-itline="0|0|0"]'), first = box('ff:0.0.0.cs')
    await focus(line); line.textContent = LATE(); await tab(line); await tick()
    const at = document.activeElement as HTMLElement
    expect(editingText(), 'the caret is in the next box').toBe(true)
    expect(at.isConnected && box('ff:0.0.0.cs') === first, 'the boxes of the board are the same nodes').toBe(true)
    const now = await shown()
    expect(now.some((w: any) => w.code === 'REPORT_ORDER')).toBe(true)
    expect(words('#sbWarn'), 'the list names it while he is still in the boxes').toContain('is later than')
    await act(async () => { at.blur(); undo() }); await tick()
    expect(words('#sbWarn')).toBe(listWas)
  })
})

/* RF2 (Sol's read of the fix round, 6 Oct 26): the board's cancel-reason and Sort all dialogs are windows over the
   schedule too — the Tab route must not walk the boxes behind them. */
describe('RF2 the board\u2019s own dialogs stop the Tab route', () => {
  it('Sort all open: Tab in a board box behind it is not routed, and comes back into the dialog; closed: the route is back', async () => {
    const { askSortAll, cancelSortAll } = await import('./board')
    await board()
    const cs = box('ff:0.0.0.cs')
    await focus(cs)
    expect((await tab(cs)).defaultPrevented, 'the route works before').toBe(true)
    await act(async () => { (document.activeElement as HTMLElement)?.blur(); askSortAll(0); notify() }); await tick()
    const pop = document.querySelector('#sortAllPop') as HTMLElement
    expect(pop.hidden, 'the dialog is up (Monday is day 0)').toBe(false)
    expect(pop.contains(document.activeElement), 'it took the keyboard').toBe(true)
    await focus(cs)
    await tab(cs); await tick()
    expect(pop.contains(document.activeElement), 'a Tab from a box behind it lands inside the dialog').toBe(true)
    expect(box('ff:0.0.0.msn')).not.toBe(document.activeElement)
    await act(async () => { cancelSortAll(); notify() }); await tick()
    await focus(cs)
    expect((await tab(cs)).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(box('ff:0.0.0.msn'))
  })
})

/* P2-F2 (the Tab-route reader's second pass, 6 Oct 26): Tab refreshed the box it arrived in; a CLICK did not. After a
   take-off saved by Tab (the caret in Landing, the formation's block held for it), a click into that formation's Area
   time found the OLD derived window still showing, and leaving the cell stored it as if typed — the window frozen and
   wrong, a history line, a pending change on a published day. Every arrival refreshes the box now, however he got there. */
describe('P2-F2 a box entered by a click is brought up to date too', () => {
  it('take-off by Tab, then a click into Area time and away: the window follows, nothing is stored', async () => {
    const { commandStream } = await import('../command')
    const f = DAYS[0].waves[0].formations[0]
    const to = week('ff:0.0.0.to'), at = $('#eWeek .day[data-day="0"] [data-atime="0.0.0"]')
    await focus(to); to.textContent = '1255'; await tab(to); await tick()
    expect(txtGet('ff:0.0.0.to')).toBe('12:55')
    const n = commandStream().length
    await act(async () => { at.focus(); at.dispatchEvent(new FocusEvent('focusin', { bubbles: true })) })
    expect(at.textContent, 'the cell shows the window as it now is').toBe(atimeText(f))
    await act(async () => { at.blur(); at.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) }); await tick()
    expect(f.atime == null || f.atime === '', 'no typed override was stored').toBe(true)
    expect(commandStream().length, 'and no command').toBe(n)
    expect(atimeText(f)).toMatch(/^1255-/)
    await act(async () => { undo() })
  })
})
