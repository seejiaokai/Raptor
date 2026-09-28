// @vitest-environment jsdom
/* The Tracker leftovers, 28 Sep 26 — [TRK-DLG-LEFTOVERS], [TRK-SESSION-PICK], [TRK-RETEST-NOTES],
   [TRK-EDIT-SIDEWAYS] and his answers D370–D376. The plan and why each test exists:
   docs/superpowers/plans/2026-09-28-tracker-leftovers-plan.md (§2, and §6 where the two reviewers
   changed it). Each test was run RED on the unfixed code first.

   Its own file so the Tracker engine boots fresh (vitest gives every file its own module
   instance) — the same shape as retest.test.tsx. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act, useState, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import * as core from './app/core.js'
import { DlgModal } from './components/Modals.jsx'
import Header from './components/Header.jsx'
import ShowAllPanel from './components/ShowAllPanel.jsx'
import Pop from './components/Pop.jsx'
import SidePanel from './components/SidePanel.jsx'
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

/* ---------- [TRK-RETEST-NOTES] C5 + D374: the date boxes ---------- */
const dayAfter = (iso: string, n: number) => { const [y, m, d] = iso.split('-').map(Number); const t = new Date(Date.UTC(y, m - 1, d + n)); return t.toISOString().slice(0, 10) }
const depth = () => (window as any).__undoForTests().undo
async function pickStudent() {
  if (C.sylDirty) await C.saveChangesClick()
  if (!C.active && C.roster.length) C.setActive(C.roster[0].id)
  expect(C.active, 'the premise: a student is picked').toBeTruthy()
  return C.active
}

describe('[TRK-RETEST-NOTES] C5 — a date box saves when you leave it, never a half-typed day', () => {
  it('typing "1", a pause, then "7" saves only the 17th, as ONE step, when the box is left', async () => {
    const { DateBox } = await import('./components/DateBox.jsx')
    const saved: string[] = []
    /* the box's owner keeps the saved day, as the side panel's store does */
    function Owner() { const [v, setV] = useState('2026-09-20'); return <DateBox id="dbx" value={v} onCommit={(x: string) => { saved.push(x); setV(x) }} /> }
    const { host, root } = await render(<Owner />)
    try {
      const box = host.querySelector('#dbx') as HTMLInputElement
      const type = (v: string) => act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(box, v)
        box.dispatchEvent(new Event('input', { bubbles: true }))
      })
      await type('2026-09-01'); await type('2026-09-17')
      expect(saved, 'nothing saved while typing — the 1st on the way to the 17th is not a day').toEqual([])
      expect(box.value, 'the box shows what is typed').toBe('2026-09-17')
      await act(async () => { box.dispatchEvent(new FocusEvent('blur')); box.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
      expect(saved, 'leaving the box saves the day typed').toEqual(['2026-09-17'])
      await type('0202-09-17')
      await act(async () => { box.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
      expect(saved, 'a half-typed year is never saved').toEqual(['2026-09-17'])
      expect(box.value, 'and the box goes back to the saved day').toBe('2026-09-17')
      await type('2026-09-17')
      await act(async () => { box.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
      expect(saved, 'the same day retyped saves nothing').toEqual(['2026-09-17'])
      await type('2026-09-18')
      await key(box, 'Enter')
      expect(saved, 'Enter saves too').toEqual(['2026-09-17', '2026-09-18'])
      await type('')
      await act(async () => { box.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
      expect(saved, 'a box emptied on purpose saves the empty').toEqual(['2026-09-17', '2026-09-18', ''])
    } finally { await act(async () => { root.unmount() }); host.remove() }
  })

  it('Last Flown, Upchit and the end dates save once per day typed — the undo history gets one step, and none for the same day', async () => {
    const s = await pickStudent()
    const before = depth()
    const r1 = await C.setUpchit(s, '2026-09-10')
    expect(r1 || '', 'accepted').toBe('')
    expect(depth()).toBe(before + 1)
    await C.setUpchit(s, '2026-09-10')
    expect(depth(), 'the same day again makes no step').toBe(before + 1)
    await C.setTarget(s, '2026-12-01'); await C.setTarget(s, '2026-12-01')
    expect(C.paceOf(s).target).toBe('2026-12-01')
  })
})

describe('[TRK-RETEST-NOTES] C8 + D374 — a day after today is refused in Done on, Failed on and both Last Flown boxes', () => {
  it('both Last Flown boxes refuse tomorrow and say why; Upchit and the end dates take it', async () => {
    const s = await pickStudent()
    const tomorrow = dayAfter(C.isoToday(), 1)
    const was = { ...C.dates[s] }
    expect(await C.setLastSyll(s, tomorrow), 'Last Flown (Syllabus) says why').toBe(C.NOT_YET)
    expect(await C.setLastCurr(s, tomorrow), 'Last Flown (Currency) says why').toBe(C.NOT_YET)
    expect(C.dates[s].lastSyll || null).toBe(was.lastSyll || null)
    expect(C.dates[s].lastCurr || null).toBe(was.lastCurr || null)
    expect(await C.setLastCurr(s, C.isoToday()) || '', 'today is fine').toBe('')
    expect(await C.setUpchit(s, tomorrow) || '', 'Upchit is a planned day').toBe('')
    expect(C.dates[s].upchit).toBe(tomorrow)
    expect(await C.setTarget2(s, tomorrow) || '', 'an end date is a planned day').toBe('')
    expect(C.paceOf(s).target2).toBe(tomorrow)
  })

  it('the grading pop-up: a future Done on is refused and put back; a slowly typed day re-dates the flight once, when the box is left', async () => {
    const s = await pickStudent()
    const f = C.SYL.find((e: any) => e.type === 'flight').id
    C.openPop(f, { clientX: 5, clientY: 5 })
    await C.popGrade('dco')
    const today = C.isoToday()
    expect(C.marks[s][f].d, 'graded today').toBe(today)
    C.openPop(f, { clientX: 5, clientY: 5 })
    const before = depth()
    C.popDoneChanged(dayAfter(today, -27)); C.popDoneChanged(dayAfter(today, -11))
    expect(C.marks[s][f].d, 'nothing re-dated while the day is typed').toBe(today)
    expect(await C.popDoneCommit() || '').toBe('')
    expect(C.marks[s][f].d, 'leaving the box re-dates it').toBe(dayAfter(today, -11))
    expect(depth(), 'one step').toBe(before + 1)
    C.popDoneChanged(dayAfter(today, 1))
    expect(await C.popDoneCommit(), 'tomorrow is refused, and says why').toBe(C.NOT_YET)
    expect(C.popDoneDate, 'the box goes back to the day the mark has').toBe(dayAfter(today, -11))
    expect(C.marks[s][f].d).toBe(dayAfter(today, -11))
    C.closePop()
  })

  it('a grade pressed on a future Done on, and a failure + on a future Failed on, are refused; a half-typed Failed on records today', async () => {
    const s = await pickStudent()
    const ev = C.SYL.filter((e: any) => e.type === 'flight')[1].id
    const today = C.isoToday()
    C.openPop(ev, { clientX: 5, clientY: 5 })
    C.popDoneChanged(dayAfter(today, 2))
    await C.popGrade('dco')
    expect(C.gradeOf(s, ev), 'no grade on a day that has not come').toBe(0)
    expect(C.pop, 'the pop-up stays to be answered').toBeTruthy()
    C.popFailDateChanged(dayAfter(today, 1))
    const n = C.failOf(s, ev)
    await C.popFail(1)
    expect(C.failOf(s, ev), 'no failure on a day that has not come').toBe(n)
    C.popFailDateChanged('0202-09-17')
    await C.popFail(1)
    expect(C.failDates(s, ev).slice(-1)[0], 'a half-typed year is never a day: today').toBe(today)
    await C.popFail(-1)
    C.closePop()
  })
})

describe('[TRK-RETEST-NOTES] C5 + D374 — the grading pop-up’s boxes on screen', () => {
  it('a future Done on shows its one line; Escape keeps a day typed as it closes the pop-up', async () => {
    const s = await pickStudent()
    const f = C.SYL.filter((e: any) => e.type === 'flight')[2].id
    C.openPop(f, { clientX: 5, clientY: 5 }); await C.popGrade('dco')
    C.openPop(f, { clientX: 5, clientY: 5 })
    const { host, root } = await render(<Live draw={() => <Pop />} />)
    try {
      const box = host.querySelector('#popDoneDate') as HTMLInputElement
      const type = (v: string) => act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(box, v)
        box.dispatchEvent(new Event('input', { bubbles: true }))
      })
      await type(dayAfter(C.isoToday(), 3))
      await act(async () => { box.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
      expect(host.querySelector('#popDoneWarn')?.textContent, 'the refusal says why, under the box').toBe(C.NOT_YET)
      await type(dayAfter(C.isoToday(), -2))
      expect(host.querySelector('#popDoneWarn'), 'the line goes with the next change').toBeNull()
      await key(box, 'Escape')
      expect(C.marks[s][f].d, 'Escape keeps the day typed').toBe(dayAfter(C.isoToday(), -2))
    } finally { C.closePop(); await act(async () => { root.unmount() }); host.remove() }
  })
})

/* ---------- D371 and D370: a student's failures ---------- */
async function freshEvent(s: string, k: number) {
  /* an event with no grade and no failures for this student, for a clean start */
  const ev = C.SYL.filter((e: any) => !C.gradeOf(s, e.id) && !C.failOf(s, e.id))[k].id
  return ev
}
async function fail(s: string, ev: string, day: string) { C.openPop(ev, { clientX: 5, clientY: 5 }); C.popFailDateChanged(day); await C.popFail(1); C.closePop() }

describe('D371 — failures take their X by DAY; − takes back the latest day', () => {
  it('a failure recorded today, then one back-dated: the earlier DAY is the plain code', async () => {
    const s = await pickStudent(); const ev = await freshEvent(s, 0)
    const today = C.isoToday(), before = dayAfter(today, -10)
    await fail(s, ev, today); await fail(s, ev, before)
    expect(C.failDates(s, ev), 'oldest day first').toEqual([before, today])
    const list = C.failList(s).filter((x: any) => x.id === ev)
    expect(list.map((x: any) => x.label + '@' + x.date), 'the full list reads the same').toEqual([ev + '@' + before, ev + 'X@' + today])
    expect(C.markHtml(s, ev), 'the details bubble too: the plain code is the earlier day').toContain(ev + ' ' + C.fmt(C.parseD(before)) + ' · ' + ev + 'X ' + C.fmt(C.parseD(today)))
    C.openPop(ev, { clientX: 5, clientY: 5 }); await C.popFail(-1); C.closePop()
    expect(C.failDates(s, ev), '− takes back the one with the latest day').toEqual([before])
    await C.doUndo()
    expect(C.failDates(s, ev), '↶ brings it back in its place').toEqual([before, today])
  })

  it('re-dating a failure re-orders them; an undated failure sorts after the dated; − never takes the undated first', async () => {
    const s = await pickStudent(); const ev = await freshEvent(s, 1)
    const today = C.isoToday(), a = dayAfter(today, -20), b = dayAfter(today, -5)
    await fail(s, ev, a); await fail(s, ev, b)
    await C.setFailDate(s, ev, 0, dayAfter(today, -1))
    expect(C.failDates(s, ev), 'the re-dated one moves after the other').toEqual([b, dayAfter(today, -1)])
    await C.setFailDate(s, ev, 0, '')
    expect(C.failDates(s, ev), 'emptied: undated, last').toEqual([dayAfter(today, -1), null])
    C.openPop(ev, { clientX: 5, clientY: 5 }); await C.popFail(-1); C.closePop()
    expect(C.failDates(s, ev), '− took the latest DATED one').toEqual([null])
    C.openPop(ev, { clientX: 5, clientY: 5 }); await C.popFail(-1); C.closePop()
    expect(C.failDates(s, ev), 'all undated: the last recorded').toEqual([])
  })
})

describe('D370 — the Failures card leaves out an N.A. event’s failures, as the ball does', () => {
  it('two failures, then N.A.: gone from the card, its total and the full list; back with their days when graded again; the pop-up and the bubble keep them', async () => {
    const s = await pickStudent(); const ev = await freshEvent(s, 2)
    const today = C.isoToday(), d1 = dayAfter(today, -3)
    await fail(s, ev, d1); await fail(s, ev, today)
    const { host, root } = await render(<Live draw={() => <SidePanel zoom={1} />} />)
    try {
      const chips = () => [...host.querySelectorAll('#failChips .failchip')].filter(c => (c as HTMLElement).dataset.ev === ev).length
      const total = () => Number((host.querySelector('#failTotal')?.textContent || '0').match(/\d+/)?.[0] || 0)
      expect(chips(), 'the premise: two chips').toBe(2)
      const t0 = total()
      C.openPop(ev, { clientX: 5, clientY: 5 }); await C.popGrade('na')
      await act(async () => { await tick() })
      expect(chips(), 'no chips while N.A.').toBe(0)
      expect(total(), 'not in the total').toBe(t0 - 2)
      expect(C.failList(s).filter((x: any) => x.id === ev), 'not in the full list').toEqual([])
      expect(C.failOf(s, ev), 'kept: the count the pop-up shows').toBe(2)
      expect(C.markHtml(s, ev), 'kept: the details bubble').toMatch(/Failed/)
      C.openPop(ev, { clientX: 5, clientY: 5 }); await C.popGrade('marg')
      await act(async () => { await tick() })
      expect(chips(), 'back when graded again').toBe(2)
      expect(C.failDates(s, ev), 'with their days').toEqual([d1, today])
    } finally { C.closePop(); await act(async () => { root.unmount() }); host.remove() }
  })
})
