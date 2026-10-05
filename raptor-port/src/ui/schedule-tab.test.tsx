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

describe('D556 schedule Tab production wiring', () => {
  it('week uses B, empty Brief, each aircraft Remarks/stores, then Area/time and reverse', async () => {
    const keys = ['ff:0.0.0.cs','ff:0.0.0.msn','ff:0.0.0.br','ff:0.0.0.to','ff:0.0.0.ld','fr:0.0.0.0']
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
    expect(route.length).toBe(14)
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
    await tab(mission); expect(document.activeElement).toBe(week('ff:0.0.0.to'))
  })
  it('ignores modified Tab and composing events, preserving ordinary non-text navigation', async () => {
    const cs = week('ff:0.0.0.cs'); await focus(cs)
    for (const extra of [{ ctrlKey: true }, { altKey: true }, { metaKey: true }, { isComposing: true }]) {
      expect((await tab(cs, extra)).defaultPrevented).toBe(false); expect(document.activeElement).toBe(cs)
    }
    const button = $('[data-daytplopen="0"]'); await focus(button)
    expect((await tab(button)).defaultPrevented).toBe(false)
  })
  it('first reverse exits to the same-day sign control; final forward blurs without entering Tuesday', async () => {
    const fields = [...host.querySelectorAll<HTMLElement>('#eWeek > .day[data-day="0"] [contenteditable="true"]')]
      .filter(el => el.matches('[data-txt],[data-inp],[data-itline],[data-bombs],[data-area],[data-atime]'))
    await focus(fields[0]!); await tab(fields[0]!, { shiftKey: true })
    expect((document.activeElement as HTMLElement).dataset.signday).toBe('0')
    await focus(fields.at(-1)!); expect((await tab(fields.at(-1)!)).defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(document.body)
    expect((await tab(document.body)).defaultPrevented).toBe(false)
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
   route stops when the save it caused asks for a window, never walks while one is up, and the window takes the keys. */
describe('W12 a save that opens a window stops the Tab route there', () => {
  it('Tab out of a weekend duty request’s time: the OIL question opens, the caret is not behind it, and the window holds the keys', async () => {
    const pops = await import('./pops')
    const { inpId } = await import('../engine/inputs')
    const row: any = { ...structuredClone(INPUTS.find((r: any) => r.person === 'bane' && r.s != null)!), iid: 'iw12duty', type: 'Duty', date: 'Jul 18', remarks: 'w12', s: 480, e: 720 }
    delete row.acc; delete row.oil; delete row.endDate
    await act(async () => { INPUTS.push(row); PIOPEN.add(5); histInit(); notify() })
    const start = $(`#eWeek .day[data-day="5"] [data-inp="${inpId(row)}.str"]`)
    await focus(start); start.textContent = '0900'
    const e = await tab(start); await tick()
    expect(e.defaultPrevented).toBe(true)
    expect(INPUTS.find((r: any) => r.iid === 'iw12duty')!.s, 'the time was saved once').toBe(540)
    expect(pops.INPEDIT, 'the request’s window was asked for').toBeTruthy()
    const sheet = document.querySelector<HTMLElement>('[data-testid="oilconf"]')
    expect(sheet, 'the OIL question is up').toBeTruthy()
    expect(editingText(), 'no caret in a schedule box behind the window').toBe(false)
    expect(sheet!.contains(document.activeElement), 'the window holds the keyboard').toBe(true)
    /* a text box behind an open window is not on the route: a Tab there goes back INTO the window (RF2 — the sheet
       keeps the keyboard), never on to the next schedule box */
    const behind = week('ff:0.0.0.cs')
    await focus(behind)
    await tab(behind)
    expect(sheet!.contains(document.activeElement), 'a Tab behind the window comes back into it').toBe(true)
    expect(editingText(), 'and never on to the next schedule box').toBe(false)
    await act(async () => { (document.activeElement as HTMLElement)?.blur(); pops.setInpEdit(null); notify() }); await tick()
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
