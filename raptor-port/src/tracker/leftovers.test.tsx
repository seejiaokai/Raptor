// @vitest-environment jsdom
/* The Tracker leftovers, 28 Sep 26 — [TRK-DLG-LEFTOVERS], [TRK-SESSION-PICK], [TRK-RETEST-NOTES],
   [TRK-EDIT-SIDEWAYS] and his answers D370–D376. The plan and why each test exists:
   docs/superpowers/plans/2026-09-28-tracker-leftovers-plan.md (§2, and §6 where the two reviewers
   changed it). Each test was run RED on the unfixed code first.

   Its own file so the Tracker engine boots fresh (vitest gives every file its own module
   instance) — the same shape as retest.test.tsx. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import * as core from './app/core.js'
import { DlgModal } from './components/Modals.jsx'
import Header from './components/Header.jsx'
import ShowAllPanel from './components/ShowAllPanel.jsx'
import { initStore, resetSession } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const C: any = core
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting for the app') }
async function render(el: any) {
  const host = document.createElement('div'); host.className = 'host'; document.body.appendChild(host)
  const root = createRoot(host)
  await act(async () => { root.render(el) })
  return { host, root }
}
/* the Tracker's own components read core's module state; App subscribes for them in
   the app, so a test that mounts one alone subscribes the same way */
function Live({ draw }: { draw: () => any }) { useSyncExternalStore(C.subscribe, C.getVersion); return draw() }
const key = (el: Element, k: string, extra: any = {}) => act(async () => { el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...extra })) })
/* answer every question still up, oldest first — a test that fails mid-way must not
   leave one waiting for the next */
const clearQuestions = async () => { for (let i = 0; i < 20 && C.dlg; i++) { C.dlgClose(C.dlg.input ? null : false); await tick() } }

let board: HTMLElement
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await C.init()
})
afterAll(() => { board.remove(); document.querySelectorAll('.host').forEach(h => h.remove()) })

describe('[TRK-DLG-LEFTOVERS] B1 — a second question never strands the first', () => {
  it('a question asked while one is up WAITS for it, then shows; the first is answered by the person, never for them', async () => {
    const a = C.uiPrompt('first?', 'A')
    const b = C.uiPrompt('second?', 'B')
    await tick()
    expect(C.dlg && C.dlg.msg, 'the first question stays on screen').toBe('first?')
    let aSaid: any = 'pending'; a.then((v: any) => { aSaid = v })
    await tick()
    expect(aSaid, 'the first is not answered behind the person’s back').toBe('pending')
    C.dlgClose('x'); await tick()
    expect(aSaid).toBe('x')
    expect(C.dlg && C.dlg.msg, 'then the second one shows').toBe('second?')
    C.dlgClose('y')
    expect(await b).toBe('y')
    expect(C.dlg).toBeNull()
  })

  it('order holds across kinds, and a question the first one’s job asks next waits behind the one already waiting', async () => {
    const order: string[] = []
    const job = (async () => {
      const r = await C.uiChoice('chart 1 already exists', 'Replace it', 'Add as new')
      order.push('chart1:' + r)
      const r2 = await C.uiConfirm('chart 2 already exists')
      order.push('chart2:' + r2)
    })()
    await tick()
    const other = C.uiPrompt('someone else?').then((v: any) => { order.push('other:' + v) })
    await tick()
    expect(C.dlg.msg).toBe('chart 1 already exists')
    C.dlgClose(true); await tick(); await tick()
    expect(C.dlg.msg, 'the question that was already waiting goes next').toBe('someone else?')
    C.dlgClose('z'); await tick(); await tick()
    expect(C.dlg.msg, 'then the job’s own next question').toBe('chart 2 already exists')
    C.dlgClose(true)
    await job; await other
    expect(order, 'nobody’s answer was invented').toEqual(['chart1:ok', 'other:z', 'chart2:true'])
  })

  it('the end of a session answers the question on screen AND every waiting one as cancelled — none reaches the next person', async () => {
    const a = C.uiChoice('a?', 'Yes', 'No')
    const b = C.uiConfirm('b?')
    const c = C.uiPrompt('c?')
    await tick()
    resetSession(null)
    resetSession({ user: 'ad', role: 'admin' })
    expect(await a).toBe('cancel')
    expect(await b).toBeFalsy()
    expect(await c).toBeNull()
    await tick()
    expect(C.dlg, 'nothing left on screen for the next person').toBeNull()
  })
})

describe('[TRK-DLG-LEFTOVERS] B1 — the door behind the question is shut', () => {
  it('while a question is up, the rest of the Tracker page is inert, and Tab / Shift+Tab stay inside the box', async () => {
    const { host, root } = await render(<Live draw={() =>
      <div className="tr-root">
        <header id="behindBar"><button id="behindBtn">+ Add</button></header>
        <div id="behindLayout"><button id="behindBall">ball</button></div>
        <DlgModal />
      </div>} />)
    try {
      const p = C.uiPrompt('Rename course “X” to:', 'X')
      await act(async () => { await tick() })
      const box = host.querySelector('#dlgModal')!
      expect(box.getAttribute('role')).toBe('dialog')
      expect(box.getAttribute('aria-modal')).toBe('true')
      expect(host.querySelector('#behindBar')!.hasAttribute('inert'), 'the bar behind the shade').toBe(true)
      expect(host.querySelector('#behindLayout')!.hasAttribute('inert'), 'the chart behind the shade').toBe(true)
      expect(host.querySelector('#dlgModal')!.hasAttribute('inert'), 'never the question itself').toBe(false)
      const ok = host.querySelector('#dlgOk') as HTMLElement, input = host.querySelector('#dlgInput') as HTMLElement
      ok.focus(); await key(ok, 'Tab')
      expect(document.activeElement, 'Tab from the last control goes to the first').toBe(input)
      await key(input, 'Tab', { shiftKey: true })
      expect(document.activeElement, 'Shift+Tab from the first goes to the last').toBe(ok)
      C.dlgClose(null); await p
      await act(async () => { await tick() })
      expect(host.querySelector('#behindBar')!.hasAttribute('inert'), 'the page comes back when the question goes').toBe(false)
      expect(host.querySelector('#behindLayout')!.hasAttribute('inert')).toBe(false)
    } finally { await clearQuestions(); await act(async () => { root.unmount() }); host.remove() }
  })
})

describe('[TRK-DLG-LEFTOVERS] B2 — Enter while a phone keyboard is still composing is not an answer', () => {
  it('the question box’s text box: a composing Enter does nothing; a plain Enter answers', async () => {
    const { host, root } = await render(<Live draw={() => <div className="tr-root"><DlgModal /></div>} />)
    try {
      const p = C.uiPrompt('Student callsign:', '')
      await act(async () => { await tick() })
      const input = host.querySelector('#dlgInput') as HTMLInputElement
      await key(input, 'Enter', { isComposing: true })
      expect(C.dlg, 'still open while the word is being composed').toBeTruthy()
      await key(input, 'Enter', { keyCode: 229 })
      expect(C.dlg, 'the older browsers’ composing signal too').toBeTruthy()
      await key(input, 'Enter')
      expect(await p, 'a plain Enter answers').toBe('')
    } finally { await clearQuestions(); await act(async () => { root.unmount() }); host.remove() }
  })

  it('the + Add search: a composing Enter neither picks the one left nor adds the name typed', async () => {
    const { host, root } = await render(<Live draw={() => <div className="tr-root"><DlgModal /></div>} />)
    try {
      const p = C.uiPick('Add a crew member', [{ key: 'p1', label: 'ALPHA', sub: 'Pilot' }, { key: 'p2', label: 'BRAVO', sub: 'WSO' }], { input: true })
      await act(async () => { await tick() })
      const filter = host.querySelector('#dlgFilter') as HTMLInputElement
      const setVal = (v: string) => act(async () => {
        const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
        set.call(filter, v); filter.dispatchEvent(new Event('input', { bubbles: true }))
      })
      await setVal('alp')
      await key(filter, 'Enter', { isComposing: true })
      expect(C.dlg, 'the one match is not picked mid-word').toBeTruthy()
      await setVal('zulu')
      await key(filter, 'Enter', { isComposing: true })
      expect(C.dlg, 'the typed name is not added mid-word').toBeTruthy()
      await key(filter, 'Enter')
      expect(await p, 'a plain Enter adds it, as D191 has it').toBe('zulu')
    } finally { await clearQuestions(); await act(async () => { root.unmount() }); host.remove() }
  })

  it('the Find event box: a composing Enter does not step to the next match', async () => {
    const { host, root } = await render(<Header />)
    try {
      C.runSearch('ST-0', false)
      const at = C.searchAt
      expect(C.searchCount, 'the premise: several matches').toBeGreaterThan(1)
      const box = host.querySelector('#hSearch') as HTMLInputElement
      await key(box, 'Enter', { isComposing: true })
      expect(C.searchAt, 'no step mid-word').toBe(at)
      await key(box, 'Enter')
      expect(C.searchAt, 'a plain Enter steps').not.toBe(at)
    } finally { C.clearSearch(); await act(async () => { root.unmount() }); host.remove() }
  })

  it('Show All’s editor: a composing Ctrl+Enter does not save', async () => {
    C.openShowAll()
    const { host, root } = await render(<ShowAllPanel />)
    try {
      const edit = host.querySelector('.sedit') as HTMLElement
      await act(async () => { edit.click() })
      const name = host.querySelector('.saedit input') as HTMLInputElement
      await key(name, 'Enter', { ctrlKey: true, isComposing: true })
      expect(host.querySelector('.saedit'), 'the editor is still open mid-word').toBeTruthy()
      await key(name, 'Enter', { ctrlKey: true })
      await act(async () => { await tick() })
      expect(host.querySelector('.saedit'), 'a plain Ctrl+Enter saves and closes it').toBeNull()
    } finally { C.closeShowAll(); await act(async () => { root.unmount() }); host.remove() }
  })
})
