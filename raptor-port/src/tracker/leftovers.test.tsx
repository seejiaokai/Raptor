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

/* ---------- D372: a pace, end-date or lull change is an undo step ---------- */
let added = 0
async function threeStudents() {
  for (let k = 0; k < 3 && C.roster.length < 3; k++) {
    const p = C.addStudent(); await until(() => C.dlg); C.dlgClose('LO STU ' + (++added)); await p; await C.whenLoaded()
  }
  expect(C.roster.length, 'the premise: three students').toBeGreaterThanOrEqual(3)
  return C.roster.map((r: any) => r.id)
}
const ctrlZ = () => C.handleUndoKey({ ctrlKey: true, metaKey: false, altKey: false, shiftKey: false, key: 'z', target: document.body, preventDefault() {} })

describe('D372 — ↶ and Ctrl+Z take back a pace, an end date and a lull period', () => {
  it('Ctrl+Z right after a pace change takes back the pace, not an older mark; keystrokes within two seconds are one step', async () => {
    const s = await pickStudent()
    const ev = await freshEvent(s, 3)
    C.openPop(ev, { clientX: 5, clientY: 5 }); await C.popGrade('dco')
    const was = C.paceOf(s).epw
    await C.setEpw(s, '3'); await C.setEpw(s, '3.5')
    expect(C.undoWhat(), 'the ↶ tooltip names the pace').toBe('the pace for ' + C.nameOf(s))
    ctrlZ(); await tick(); await tick()
    expect(C.paceOf(s).epw, 'the pace goes back, both keystrokes as one').toBe(was)
    expect(C.gradeOf(s, ev), 'the older mark is untouched').toBe('dco')
    await C.doRedo()
    expect(C.paceOf(s).epw, '↷ puts it again').toBe('3.5')
  })

  it('End date A and End date B are each a step', async () => {
    const s = await pickStudent()
    const a0 = C.paceOf(s).target, b0 = C.paceOf(s).target2
    await C.setTarget(s, '2027-01-15')
    await C.setTarget2(s, '2027-02-20')
    expect(C.undoWhat()).toBe('End date B for ' + C.nameOf(s))
    await C.doUndo()
    expect(C.paceOf(s).target2 || null).toBe(b0 || null)
    expect(C.paceOf(s).target).toBe('2027-01-15')
    await C.doUndo()
    expect(C.paceOf(s).target || null).toBe(a0 || null)
  })

  it('a lull period set, changed and removed: each a step, each taken back', async () => {
    const s = await pickStudent()
    const n0 = (C.lulls[s] || []).length
    C.openLullPicker(s); await C.lullDayClick('2026-10-05'); await C.lullDayClick('2026-10-09')
    expect((C.lulls[s] || []).length, 'set').toBe(n0 + 1)
    expect(C.undoWhat()).toBe('the lull periods for ' + C.nameOf(s))
    await C.doUndo()
    expect((C.lulls[s] || []).length, 'set, taken back').toBe(n0)
    await C.doRedo()
    const at = C.lulls[s].findIndex((l: any) => l.start === '2026-10-05')
    C.openLullPicker(s, at); await C.lullDayClick('2026-10-06'); await C.lullDayClick('2026-10-12')
    await C.doUndo()
    expect(C.lulls[s].some((l: any) => l.start === '2026-10-05' && l.end === '2026-10-09'), 'changed, taken back').toBe(true)
    const rm = C.removeLull(s, at); await until(() => C.dlg); C.dlgClose(true); await rm
    expect(C.lulls[s].some((l: any) => l.start === '2026-10-05'), 'removed (it asked first)').toBe(false)
    await C.doUndo()
    expect(C.lulls[s].some((l: any) => l.start === '2026-10-05'), 'removed, taken back').toBe(true)
  })

  it('Copy to… is ONE step for every student ticked: ↶ takes all of them back, ↷ puts all of them again', async () => {
    const [a, b, c] = await threeStudents()
    C.setActive(a)
    C.openLullPicker(a); await C.lullDayClick('2026-11-02'); await C.lullDayClick('2026-11-06')
    const bWas = JSON.stringify(C.lulls[b] || []), cWas = JSON.stringify(C.lulls[c] || [])
    C.openLullCopy(a); C.toggleLullCopy(b, true); C.toggleLullCopy(c, true); await C.applyLullCopy()
    expect(JSON.stringify(C.lulls[b])).toBe(JSON.stringify(C.lulls[a]))
    expect(C.undoWhat(), 'one step, named for both').toBe('the lull periods for 2 students')
    await C.doUndo()
    expect(JSON.stringify(C.lulls[b] || []), 'b back').toBe(bWas)
    expect(JSON.stringify(C.lulls[c] || []), 'c back').toBe(cWas)
    expect(C.active, 'the picker stays on the student copying').toBe(a)
    await C.doRedo()
    expect(JSON.stringify(C.lulls[c])).toBe(JSON.stringify(C.lulls[a]))
  })
})

/* ---------- [TRK-SESSION-PICK] + D376: each person reopens on their own course and student ---------- */
describe('[TRK-SESSION-PICK] D376 — each person reopens the Tracker on their own place', () => {
  const ADMIN = { user: 'ad', role: 'admin', pid: 'stiff' }, MEMBER = { user: 'us', role: 'main', pid: 'bane' }
  let wire: any, bridge: any
  beforeAll(async () => {
    wire = await import('./peoplewire')
    bridge = await import('./people.js')
    bridge.setWhoamiId(wire.whoamiIdForTracker)
  })
  const signIn = async (who: any) => {
    resetSession(null); resetSession(who)
    C.resumeForPerson(); await C.whenLoaded(); await tick(); await tick()
  }

  it('with nobody signed in the Tracker’s person is NOBODY — never the headless default (a real member’s id)', () => {
    resetSession(null)
    expect(wire.whoamiIdForTracker(), 'no session → nobody').toBe('')
    resetSession(ADMIN)
    expect(wire.whoamiIdForTracker()).toBe('stiff')
  })

  it('the admin’s pick is his; the member signing in next opens on HER own place; the admin comes back to his', async () => {
    await signIn(ADMIN)
    if (C.COURSES.length < 2) { const p = C.addCourse(); await until(() => C.dlg); C.dlgClose('LO SECOND'); await p; await C.whenLoaded() }
    expect(C.COURSES.length, 'the premise: two courses').toBeGreaterThanOrEqual(2)
    const second = C.COURSES[1].id
    await C.switchCourse(second); await C.whenLoaded()
    if (C.roster.length < 2) { const p = C.addStudent(); await until(() => C.dlg); C.dlgClose('LO PICK B'); await p; await C.whenLoaded() }
    const b = C.roster[C.roster.length - 1].id
    C.setActive(b, { land: false })
    expect(localStorage.getItem('ocuLocal:who:stiff:lastCourse'), 'remembered under HIS name').toBe(second)

    await signIn(MEMBER)
    expect(C.course, 'the member does not land on the admin’s course').toBe(C.COURSES[0].id)
    expect(C.course).not.toBe(second)
    const mine = C.roster[0] && C.roster[0].id
    if (mine) C.setActive(mine, { land: false })

    await signIn(ADMIN)
    expect(C.course, 'the admin is back on his course').toBe(second)
    expect(C.active, 'and his student').toBe(b)
    expect(C.resumeForPerson(), 'the same person again: nothing reloads').toBe(false)
  })

  it('while the Tracker reloads for the next person, a press on a ball grades nobody', async () => {
    resetSession(null); resetSession(MEMBER)
    expect(C.resumeForPerson(), 'a different person: it reloads').toBe(true)
    expect(C.resuming).toBe(true)
    C.ballTap(C.SYL[0].id, { clientX: 5, clientY: 5, target: document.body })
    expect(C.pop, 'no pop-up on the last person’s chart').toBeNull()
    await C.whenLoaded(); await tick(); await tick()
    expect(C.resuming).toBe(false)
    await signIn(ADMIN)
  })

  it('+ Add remembers the student it picks, for this person', async () => {
    await signIn(ADMIN)
    const p = C.addStudent(); await until(() => C.dlg); C.dlgClose('LO ADDED'); await p; await C.whenLoaded()
    expect(localStorage.getItem('ocuLocal:who:stiff:lastCrew:' + C.course), 'the added student is the remembered pick').toBe(C.active)
  })

  it('an unsaved chart edit is never replaced: the reload waits until it is saved', async () => {
    await signIn(ADMIN)
    const course = C.course
    ;(window as any).__markDirtyForTests()
    try {
      resetSession(null); resetSession(MEMBER)
      expect(C.resumeForPerson(), 'no reload over an unsaved edit').toBe(false)
      expect(C.course).toBe(course)
      expect(C.sylDirty).toBe(true)
    } finally { if (C.sylDirty) await C.saveChangesClick(); await signIn(ADMIN) }
  })

  it('the standalone Tracker (nobody wired) keeps the browser’s one place, as before', async () => {
    bridge.setWhoamiId(null)
    try {
      await C.switchCourse(C.COURSES[0].id); await C.whenLoaded()
      expect(localStorage.getItem('ocuLocal:lastCourse')).toBe(C.COURSES[0].id)
    } finally { bridge.setWhoamiId(wire.whoamiIdForTracker) }
  })
})

/* ---------- C6, C7, C11, C14 ---------- */
describe('[TRK-RETEST-NOTES] C6 — a press on another student’s red failure tick picks THAT student', () => {
  it('B’s tick picks B and opens nothing; the picked student’s own tick opens grading', async () => {
    const [a, b] = await threeStudents()
    const ev = C.SYL.filter((e: any) => !C.gradeOf(b, e.id) && !C.failOf(b, e.id) && !C.gradeOf(a, e.id) && !C.failOf(a, e.id))[0].id
    C.setActive(b, { land: false }); await fail(b, ev, C.isoToday())
    C.setActive(a, { land: false }); await fail(a, ev, C.isoToday())
    C.renderBoard()
    const ball = [...document.querySelectorAll('#board .ball')].find(g => (g as HTMLElement).dataset.id === ev)!
    const bi = C.roster.findIndex((r: any) => r.id === b), ai = C.roster.findIndex((r: any) => r.id === a)
    const tickOf = (i: number) => ball.querySelector('.ftick[data-wi="' + i + '"]')
    expect(tickOf(bi), 'the premise: B’s tick is drawn, and says whose it is').toBeTruthy()
    C.ballTap(ev, { clientX: 5, clientY: 5, target: tickOf(bi) })
    expect(C.active, 'B is picked').toBe(b)
    expect(C.pop, 'no grading opened for anyone').toBeNull()
    C.setActive(a, { land: false }); C.renderBoard()
    const ball2 = [...document.querySelectorAll('#board .ball')].find(g => (g as HTMLElement).dataset.id === ev)!
    C.ballTap(ev, { clientX: 5, clientY: 5, target: ball2.querySelector('.ftick[data-wi="' + ai + '"]') })
    expect(C.pop && C.pop.id, 'A’s own tick opens A’s grading').toBe(ev)
    C.closePop()
  })
})

describe('[TRK-RETEST-NOTES] C7 — + Set lull period opens on THIS month', () => {
  it('after changing a period in another month, a new period opens on today’s month (the squadron’s day)', async () => {
    const s = await pickStudent()
    C.openLullPicker(s); await C.lullDayClick('2027-03-02'); await C.lullDayClick('2027-03-04')
    const at = C.lulls[s].findIndex((l: any) => l.start === '2027-03-02')
    C.openLullPicker(s, at)
    expect(C.calView.getMonth(), 'changing a period opens on its own month').toBe(2)
    C.calNext(); C.calNext(); C.closeLullPicker()
    C.openLullPicker(s)
    const [y, m] = C.isoToday().split('-').map(Number)
    expect([C.calView.getFullYear(), C.calView.getMonth() + 1], 'a new period opens on this month').toEqual([y, m])
    C.closeLullPicker()
  })
})

describe('[TRK-RETEST-NOTES] C11 — the + Add list follows the roster while it is open', () => {
  it('a person added while the box is open appears in it; one taken off leaves it', async () => {
    const bridge: any = await import('./people.js')
    bridge.setPeople([{ id: 'p1', cs: 'ALPHA', seat: 'FCP', q: 'OCU', sxo: false }])
    const { host, root } = await render(<Live draw={() => <div className="tr-root"><DlgModal /></div>} />)
    try {
      const p = C.addStudent()
      await act(async () => { await until(() => C.dlg) })
      const rows = () => [...host.querySelectorAll('#dlgList .dlg-item .dlg-lbl')].map(x => x.textContent)
      expect(rows()).toEqual(['ALPHA'])
      await act(async () => { bridge.setPeople([{ id: 'p1', cs: 'ALPHA', seat: 'FCP', q: 'OCU', sxo: false }, { id: 'p2', cs: 'ZULU9', seat: 'FCP', q: 'OCU', sxo: false }]) })
      expect(rows(), 'the new person is there without closing the box').toEqual(['ALPHA', 'ZULU9'])
      await act(async () => { bridge.setPeople([{ id: 'p2', cs: 'ZULU9', seat: 'FCP', q: 'OCU', sxo: false }]) })
      expect(rows(), 'and one taken off the roster is gone').toEqual(['ZULU9'])
      C.dlgClose(null); await p
    } finally { bridge.setPeople([]); await clearQuestions(); await act(async () => { root.unmount() }); host.remove() }
  })
})

describe('[TRK-RETEST-NOTES] C14 — while ✓ Save changes shows, the words beside it step aside, whatever a background save says', () => {
  it('a structure edit: no words beside the button; a mark saved meanwhile does not put “saved” there; after Save the words come back', async () => {
    const s = await pickStudent()
    const { host, root } = await render(<Live draw={() => <Header />} />)
    try {
      ;(window as any).__markDirtyForTests()
      await act(async () => { await tick() })
      const stat = () => (host.querySelector('#saveStat')?.textContent || '').trim()
      expect(stat(), 'the button says it; no cut-off words beside it').toBe('')
      expect(host.querySelector('#saveChanges'), 'the button is there').toBeTruthy()
      await C.setUpchit(s, dayAfter(C.isoToday(), -40)); await act(async () => { await tick(); await tick() })
      expect(stat(), 'a background save does not claim the chart is saved').toBe('')
      await C.saveChangesClick(); await act(async () => { await tick() })
      expect(stat(), 'saved: the words are back').not.toBe('')
    } finally { if (C.sylDirty) await C.saveChangesClick(); await act(async () => { root.unmount() }); host.remove() }
  })
})

/* ---------- [TRK-EDIT-SIDEWAYS] + D373: on a short screen the edit tools fold ---------- */
describe('[TRK-EDIT-SIDEWAYS] D373 — the folded tool row and its Tools ▾', () => {
  it('the folded row names the tool in use with its hint, Fit and Tools ▾; Tools ▾ opens the whole set; each way out closes it', async () => {
    const { default: ArrangeTools } = await import('./components/ArrangeTools.jsx')
    if (C.sylDirty) await C.saveChangesClick()
    C.toggleArrange()
    const { host, root } = await render(<Live draw={() => <div className="tr-root"><ArrangeTools /></div>} />)
    try {
      const fold = host.querySelector('.arrfold')!
      expect(fold, 'the folded row is drawn').toBeTruthy()
      expect(fold.querySelector('#foldTool')!.textContent, 'the tool in use').toMatch(/Move/)
      expect(fold.querySelector('#foldHint')!.textContent, 'its one-line hint').toMatch(/drag/i)
      expect(fold.querySelector('#foldFit'), 'Fit').toBeTruthy()
      const open = fold.querySelector('#foldTools') as HTMLElement
      await act(async () => { open.click() })
      expect(host.querySelector('#arrTools')!.classList.contains('open'), 'Tools ▾ opens the whole set').toBe(true)
      expect(open.getAttribute('aria-expanded')).toBe('true')
      /* choosing a tool closes it, and the row then names that tool */
      const connect = [...host.querySelectorAll('#arrTools button')].find(b => /Connect/.test(b.textContent || '')) as HTMLElement
      await act(async () => { connect.click() })
      expect(host.querySelector('#arrTools')!.classList.contains('open')).toBe(false)
      expect(fold.querySelector('#foldTool')!.textContent).toMatch(/Connect/)
      /* Escape closes it before anything else */
      await act(async () => { open.click() })
      C.handleEscapeKey({ key: 'Escape', preventDefault() {} })
      await act(async () => { await tick() })
      expect(host.querySelector('#arrTools')!.classList.contains('open'), 'Escape').toBe(false)
      expect(C.arrangeMode, 'and nothing else').toBe(true)
      /* a press outside closes it */
      await act(async () => { open.click() })
      await act(async () => { document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) })
      expect(host.querySelector('#arrTools')!.classList.contains('open'), 'a press outside').toBe(false)
      /* a flash message shows in the folded row, where the hint line is hidden */
      C.flashHint('That link already exists.')
      await act(async () => { await tick() })
      expect(fold.querySelector('#foldHint')!.textContent).toBe('That link already exists.')
      /* leaving Edit chart layout closes it */
      await act(async () => { open.click() })
      await act(async () => { C.toggleArrange() })
      expect(C.toolsOpen, 'leaving edit mode').toBe(false)
    } finally { if (C.arrangeMode) C.toggleArrange(); if (C.sylDirty) await C.saveChangesClick(); await act(async () => { root.unmount() }); host.remove() }
  })
})
