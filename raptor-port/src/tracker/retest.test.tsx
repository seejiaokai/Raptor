// @vitest-environment jsdom
/* [HUMAN-RETEST] the Tracker, 23 Sep 26 — every defect the hands-on walk found,
   pinned so it cannot come back. The F-numbers are the rows of the evidence
   sheet, docs/handpass/2026-09-23-tracker.md, where each one's picture and the
   walk that found it live. Each test was run RED on the unfixed code first.

   Its own file (not tracker.test.tsx) so the Tracker engine boots fresh here:
   vitest gives every file its own module instance, and these tests switch
   charts, add courses and import files. */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { act, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import * as core from './app/core.js'
import * as FMT from './app/fileFormat.js'
import Header from './components/Header.jsx'
import ShowAllPanel from './components/ShowAllPanel.jsx'
import { InfoModal } from './components/Modals.jsx'
import { initStore, resetSession } from '../state/store'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
/* core.js is plain JS; TypeScript infers its `let`s from their initialisers, so
   these tests read it untyped, as the vendored code itself does */
const C: any = core
const at = { clientX: 5, clientY: 5 }
const tick = () => new Promise(r => setTimeout(r, 0))
const until = async (f: () => any) => { for (let i = 0; i < 800; i++) { if (f()) return; await tick() } throw new Error('timed out waiting for the app') }
const answer = async (v: any) => { await until(() => C.dlg); C.dlgClose(v) }
const grade = (s: string, id: string) => (((C.marks as any)[s] || {})[id] || {}).g || 0
const drain = async () => { while (C.canUndo()) await C.doUndo(); while (C.canRedo()) await C.doRedo(); while (C.canUndo()) await C.doUndo() }
async function render(el: any) {
  const host = document.createElement('div'); host.className = 'host'; document.body.appendChild(host)
  await act(async () => { createRoot(host).render(el) })
  return host
}
/* Import a file through the File menu's own entry point, answering "Replace it"
   for every chart already here, then the closing report. */
async function importFile(charts: any) {
  ;(window as any).__pickOpenForTests = async () => ({ name: 'backup.json', text: JSON.stringify(FMT.buildFile({ savedAt: '2026-09-23T00:00:00Z', charts })) })
  try {
    const p = C.importClick()
    for (;;) {
      await until(() => C.dlg)
      if (/already exists/.test(C.dlg.msg)) { C.dlgClose(true); await tick(); continue }
      C.dlgClose(true); break                     /* the closing report */
    }
    await p
  } finally { delete (window as any).__pickOpenForTests }
  await C.whenLoaded()
}

let board: HTMLElement
beforeAll(async () => {
  initStore()
  resetSession({ user: 'ad', role: 'admin' })
  board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
  await C.init()
})
afterAll(() => { board.remove(); document.querySelectorAll('.host').forEach(h => h.remove()) })

describe('[HUMAN-RETEST] the Tracker — what the walk found', () => {
  it('F1 — the Students card key ball names the course, never its hidden code', () => {
    const html = C.renderKeyBall()
    expect(C.course, 'the course is an id since 13 Sep 26').toMatch(/^c[0-9a-z]+$/)
    expect(html, 'the course name is in the centre').toContain('>' + C.curCourseName() + '<')
    expect(html, 'the hidden code is not').not.toContain(C.course)
  })

  it('F2/F3 — the Syllabus menu says what Duplicate and Add syllabus really do', async () => {
    const host = await render(<Header />)
    const dup = host.querySelector('#dupSyl')!.getAttribute('title') || ''
    const add = host.querySelector('#addSyl')!.getAttribute('title') || ''
    /* 13 Sep 26 ("keep charts, reset marks"): a duplicate is the flow and layout
       with NO students; + Add syllabus is an empty sheet */
    expect(dup, 'Duplicate does not promise marks').not.toMatch(/including every student/i)
    expect(dup, 'Duplicate says the copy starts without students').toMatch(/no students/i)
    expect(add, 'Add syllabus does not claim the current structure').not.toMatch(/current structure/i)
    expect(add, 'Add syllabus says it is empty').toMatch(/empty/i)
    host.remove()
  })

  it('F3 — after + Add syllabus the guidance names the control that exists ("Edit chart layout")', async () => {
    const back = C.curSylId()
    const p = C.addSyl(); await answer('F3 BLANK'); await p; await C.whenLoaded()
    expect(C.hintFlash || '', 'the guidance is there').toMatch(/Edit chart layout/)
    expect(C.hintFlash || '', 'no stale "✎ Edit" button').not.toMatch(/hit “✎ Edit”/)
    const d = C.delSyl(); await answer(true); await d; await C.whenLoaded()
    await C.switchSyllabus(back); await C.whenLoaded()
  })

  it('F4 — Details mode never points at an Edit details button it does not have', async () => {
    /* an event with no details: one the user adds */
    C.toggleArrange()
    const p = C.addModule('acad'); await answer('NODET-1'); await p
    C.toggleArrange()
    if (C.sylDirty) await C.saveChangesClick()
    expect(C.byid['NODET-1'], 'the new event is on the chart').toBeTruthy()
    /* the grading pop-up's copy of the text sits right above its own ✎ Edit
       details button, so there it may say so */
    expect(C.infoHtml('NODET-1')).toMatch(/Edit details/)
    const el = document.createElement('div'); document.body.appendChild(el)
    C.toggleDetails()
    try {
      C.showEventBubble('NODET-1', el)
      const b = document.getElementById('detailBubble')!
      expect(b.style.display).toBe('block')
      expect(b.textContent, 'no "tap Edit details" where there is nothing to tap').not.toMatch(/tap Edit details/)
      expect(b.textContent, 'it says how to get there').toMatch(/turn ⓘ off/)
    } finally { C.toggleDetails(); el.remove() }
  })

  it("F5 — the chart editor's ball box on the SHORT course leaves another chart's event details alone", async () => {
    const y26 = C.sylIdOf('2026'), tx = C.sylIdOf('Tx 2026')
    await C.switchSyllabus(y26); await C.whenLoaded()
    const longCrew = C.infoFor('BFM-3').crew
    await C.switchSyllabus(tx); await C.whenLoaded()
    const txInfo = C.infoFor('BFM-3')
    expect(txInfo.crew, 'the premise: the short course has its own crew wording').not.toBe(longCrew)
    C.toggleArrange()
    C.openEdit('BFM-3')
    const ev = C.byid['BFM-3']
    /* the box is pre-filled from the chart on screen — change ONLY the text */
    const err = await C.saveEdit({ text: 'BFM-3 t', type: ev.type, num: '', crew: txInfo.crew || '', pre: txInfo.pre || '', links: (ev.prereqs || []).join(', ') })
    expect(err).toBeNull()
    C.toggleArrange()
    if (C.sylDirty) await C.saveChangesClick()
    expect(C.byid['BFM-3'].label, 'the text change landed on Tx').toBe('BFM-3 t')
    await C.switchSyllabus(y26); await C.whenLoaded()
    expect(C.infoFor('BFM-3').crew, "2026's BFM-3 keeps its own crew wording").toBe(longCrew)
  })

  it('F7 — a built-in brought back exactly as shipped is not marked "✎ edited"', async () => {
    const id = C.sylIdOf('A/G - A/A 2026')
    expect(C.sylHasOwnDef(id), 'the premise: untouched').toBe(false)
    await importFile(await C.collectCharts([id]))
    expect(C.sylHasOwnDef(id), 'still untouched after the round trip').toBe(false)
  })

  it('F6 — importing a whole backup puts the charts back in the order the file saved (D120)', async () => {
    const ids = C.orderedSylIds()
    expect(ids.length).toBeGreaterThan(2)
    const charts = await C.collectCharts(ids)
    const wanted = [...ids].reverse()
    charts.order = wanted
    await importFile(charts)
    expect(C.orderedSylIds(), 'the file’s order').toEqual(wanted)
    /* put the default order back for the tests after this one */
    await C.saveOrderList(ids.map((id: string) => C.sylName(id))); await C.whenLoaded()
    expect(C.orderedSylIds()).toEqual(ids)
  })

  it('F6 — a file carrying ONE chart (a chart handed over) leaves the order of everything else alone', async () => {
    const ids = C.orderedSylIds()
    const last = ids[ids.length - 1]
    await importFile(await C.collectCharts([last]))
    expect(C.orderedSylIds()).toEqual(ids)
  })

  it('F9 — on a course with no students, a tap on a ball opens no dead marking pop-up, and says why', async () => {
    const home = C.course
    const p = C.addCourse(); await answer('EMPTY NINE'); await p; await C.whenLoaded()
    try {
      expect(C.roster.length, 'the premise: nobody on the course').toBe(0)
      C.ballTap('ST-01', { ...at, target: { closest: () => null } })
      expect(C.pop, 'no pop-up whose buttons do nothing').toBeNull()
      expect(C.hintFlash || '', 'the reason is on screen').toMatch(/add one with \+ Add/i)
    } finally {
      if (C.pop) C.closePop()
      const d = C.delCourse(); await answer(true); await d; await C.whenLoaded()
      if (C.course !== home) { await C.switchCourse(home); await C.whenLoaded() }
    }
  })

  it('F10 — a logout ends the Tracker session: the next person cannot undo the last one’s mark, and no mode or window carries over', async () => {
    if (C.sylDirty) await C.saveChangesClick()
    await C.switchSyllabus(C.sylIdOf('2026')); await C.whenLoaded()
    if (!C.active && C.roster.length) C.setActive(C.roster[0].id)
    await drain()
    const s = C.active
    expect(s, 'the premise: a student is picked').toBeTruthy()
    C.openPop('ST-06', at); await C.popGrade('dco')
    expect(C.canUndo()).toBe(true)
    C.toggleDetails(); C.openShowAll(); C.openPop('ST-07', at)
    expect(C.showDetails).toBe(true)
    resetSession(null)                                  /* the logout */
    resetSession({ user: 'us', role: 'main' })          /* someone else signs in */
    expect(C.canUndo(), 'no undo of the previous session').toBe(false)
    expect(C.canRedo()).toBe(false)
    expect(C.showDetails, 'Details mode did not carry over').toBe(false)
    expect(C.showAllOpen, 'Show All did not carry over').toBe(false)
    expect(C.pop, 'no pop-up carried over').toBeNull()
    expect(grade(s, 'ST-06'), 'the mark itself is saved data — it stays').toBe('dco')
    resetSession({ user: 'ad', role: 'admin' })
  })

  it('F10 — chart editing ends with the session; an unsaved chart edit is not silently thrown away', async () => {
    C.toggleArrange()
    const p = C.addModule('test'); await answer('UNSAVED-10'); await p
    expect(C.arrangeMode).toBe(true); expect(C.sylDirty).toBe(true)
    try {
      resetSession(null)
      resetSession({ user: 'us', role: 'main' })
      expect(C.arrangeMode, 'the next person is not dropped into chart editing').toBe(false)
      expect(C.sylDirty, 'the edit is still there to save or drop (never lost without a word)').toBe(true)
    } finally {
      if (C.arrangeMode) C.toggleArrange()
      if (C.sylDirty) await C.saveChangesClick()
      resetSession({ user: 'ad', role: 'admin' })
    }
  })

  it('F11 — both event-details editors carry the same Type/format hint (D64)', async () => {
    const D64 = 'e.g. Lecture, OFT/AMT, 2 x F-15'
    /* the details window */
    C.openInfo('ACG-01')
    const a = await render(<InfoModal />)
    expect(a.querySelector('#ifFmt')!.getAttribute('placeholder')).toBe(D64)
    C.closeInfo(); a.remove()
    /* Show All's own inline editor */
    C.openShowAll()
    const b = await render(<ShowAllPanel />)
    const edit = [...b.querySelectorAll('button')].find(x => x.textContent === 'Edit') as HTMLButtonElement
    expect(edit, 'a row offers Edit').toBeTruthy()
    await act(async () => { edit.click() })
    const fmt = [...b.querySelectorAll('.saedit label')].find(l => /Type \/ format/.test(l.textContent || ''))!.querySelector('input')!
    expect(fmt.getAttribute('placeholder')).toBe(D64)
    C.closeShowAll(); b.remove()
  })

  it('F13 — switching chart closes an open marking pop-up (a keyboard switch has no outside press to do it)', async () => {
    if (C.arrangeMode) C.toggleArrange()
    if (C.sylDirty) await C.saveChangesClick()
    const back = C.curSylId()
    C.openPop('ST-01', at)
    expect(C.pop).not.toBeNull()
    const other = C.orderedSylIds().find((id: string) => id !== back)
    await C.switchSyllabus(other); await C.whenLoaded()
    expect(C.pop, 'the pop-up belonged to the chart that is gone').toBeNull()
    await C.switchSyllabus(back); await C.whenLoaded()
  })
})

describe('[HUMAN-RETEST] the Tracker — the Export window (round two)', () => {
  it('Fable #6 — a question raised from inside the Export window is drawn ON TOP of it', async () => {
    const { CopyModal, DlgModal } = await import('./components/Modals.jsx')
    C.openCopy()
    C.setCopyOpt('charts', false); C.setCopyOpt('students', false)
    const p = C.saveCopyClick()                         /* "Tick charts, students, or both." */
    await until(() => C.dlg)
    const host = await render(<><CopyModal /><DlgModal /></>)
    const z = (sel: string) => Number((host.querySelector(sel) as HTMLElement).style.zIndex)
    expect(z('#dlgOverlay'), 'the question\u2019s shade is above the Export window').toBeGreaterThan(z('#copyModal'))
    expect(z('#dlgModal'), 'and the question above its own shade').toBeGreaterThan(z('#dlgOverlay'))
    C.dlgClose(true); await p; C.closeCopy(); host.remove()
  })

  it('Fable #5 — the Export window can tick every chart at once, and untick them all (D120: the backup carries every chart)', async () => {
    const { CopyModal } = await import('./components/Modals.jsx')
    /* the app redraws on every store change through App's subscription; this
       stands in for it, so the ticks are read off a REDRAWN window */
    const Live = () => { useSyncExternalStore(C.subscribe, C.getVersion); return <CopyModal /> }
    C.openCopy()
    const ids = C.orderedSylIds()
    expect(ids.filter((id: string) => C.copyPick[id]).length, 'it still opens on the chart on screen only (R18)').toBe(1)
    const host = await render(<Live />)
    await act(async () => { (host.querySelector('#copyTickAll') as HTMLButtonElement).click() })
    expect(ids.every((id: string) => C.copyPick[id]), 'All ticks every chart').toBe(true)
    expect([...host.querySelectorAll('#copySylList input')].every(i => (i as HTMLInputElement).checked)).toBe(true)
    await act(async () => { (host.querySelector('#copyTickNone') as HTMLButtonElement).click() })
    expect(ids.some((id: string) => C.copyPick[id]), 'None unticks them').toBe(false)
    C.closeCopy(); host.remove()
  })
})

describe('[HUMAN-RETEST] the Tracker — event details belong to their chart (round three: D126, D122, W1-8, W1-9, w3-F4)', () => {
  const y26 = () => C.sylIdOf('2026'), tx = () => C.sylIdOf('Tx 2026'), ag = () => C.sylIdOf('A/G - A/A 2026')
  async function on(id: string) { if (C.sylDirty) await C.saveChangesClick(); if (C.curSylId() !== id) { await C.switchSyllabus(id); await C.whenLoaded() } }
  async function put(id: string, ev: string, f: Record<string, string>) { await on(id); await C.saveInfoFor(ev, { ...C.infoFor(ev), ...f }) }
  async function read(id: string, ev: string) { await on(id); return C.infoFor(ev) }
  async function unset(id: string, ev: string) { await on(id); await C.resetInfoFor(ev) }

  it('D126 / W1-8 — a detail typed on Tx stays on Tx, and one typed on 2026 stays on 2026', async () => {
    await put(tx(), 'BFM-5', { name: 'TX NAME FIVE' })
    expect((await read(y26(), 'BFM-5')).name, "2026's BFM-5 keeps its own name").not.toBe('TX NAME FIVE')
    await put(y26(), 'BFM-5', { hrs: '7.7 Hrs' })
    const t = await read(tx(), 'BFM-5')
    expect(t.name, 'Tx keeps what was typed on Tx').toBe('TX NAME FIVE')
    expect(t.hrs, "2026's hours never reach Tx").not.toBe('7.7 Hrs')
    await unset(tx(), 'BFM-5'); await unset(y26(), 'BFM-5')
  })

  it('D122 / W1-9 — importing ONE chart leaves every other chart’s typed details alone', async () => {
    await put(y26(), 'BFM-3', { name: 'A-SIDE NAME' })
    const file = await C.collectCharts([y26()])
    await put(tx(), 'BFM-3', { name: 'B-SIDE NAME' })
    await put(ag(), 'DAAR', { name: 'AG ONLY EDIT' })
    await on(y26()); await importFile(file)
    expect((await read(tx(), 'BFM-3')).name, "Tx's own edit survives an import of 2026").toBe('B-SIDE NAME')
    expect((await read(ag(), 'DAAR')).name, 'an event not on the imported chart is never touched').toBe('AG ONLY EDIT')
    expect((await read(y26(), 'BFM-3')).name, 'the imported chart has the file’s detail').toBe('A-SIDE NAME')
    await unset(tx(), 'BFM-3'); await unset(ag(), 'DAAR'); await unset(y26(), 'BFM-3')
  })

  it('D122 — the imported chart takes the file’s detail edits and keeps a detail typed here that the file does not speak to', async () => {
    await put(y26(), 'BFM-3', { name: 'FILE NAME' })
    const file = await C.collectCharts([y26()])
    await put(y26(), 'BFM-3', { name: 'LOCAL NAME' })
    await put(y26(), 'BFM-4', { hrs: '9.9 Hrs' })
    await importFile(file)
    expect((await read(y26(), 'BFM-3')).name, 'the file’s edit comes in').toBe('FILE NAME')
    expect((await read(y26(), 'BFM-4')).hrs, 'a typed detail the file does not carry is never wiped').toBe('9.9 Hrs')
    await unset(y26(), 'BFM-3'); await unset(y26(), 'BFM-4')
  })

  it('D122 — a file written before D126 (one table for every chart) brings its details onto the imported chart only', async () => {
    const file: any = await C.collectCharts([y26()])
    delete file.eventInfoBySyl
    file.eventInfo = { 'BFM-3': { name: 'FLAT NAME' } }
    await on(y26()); await importFile(file)
    expect((await read(y26(), 'BFM-3')).name).toBe('FLAT NAME')
    expect((await read(tx(), 'BFM-3')).name, 'Tx, not in the file, is untouched').not.toBe('FLAT NAME')
    await unset(y26(), 'BFM-3')
  })

  it('D126 — a duplicate reads exactly as the chart it was copied from, details included', async () => {
    await put(tx(), 'BFM-5', { name: 'TX DUP NAME' })
    const shipCrew = (await read(tx(), 'BFM-3')).crew
    const p = C.dupSyl(); await answer('TX DUP'); await p; await C.whenLoaded()
    expect(C.curSylName()).toBe('TX DUP')
    expect(C.infoFor('BFM-5').name, 'the typed detail came with the copy').toBe('TX DUP NAME')
    expect(C.infoFor('BFM-3').crew, "and Tx's own shipped wording, not the long course's").toBe(shipCrew)
    const d = C.delSyl(); await answer(true); await d; await C.whenLoaded()
    await unset(tx(), 'BFM-5')
  })

  it('w3-F4 — "Reset to doc" is offered only where there IS a doc, fills the boxes, and saves nothing until Save', async () => {
    await on(y26())
    const doc = C.infoFor('ACG-01').name
    await C.saveInfoFor('ACG-01', { ...C.infoFor('ACG-01'), name: 'MY OWN NAME' })
    C.openInfo('ACG-01')
    const a = await render(<InfoModal />)
    const reset = a.querySelector('#ifReset') as HTMLButtonElement
    expect(reset, 'a shipped event offers Reset to doc').toBeTruthy()
    await act(async () => { reset.click() })
    expect((a.querySelector('#ifName') as HTMLInputElement).value, 'the box shows the doc again').toBe(doc)
    expect(C.infoFor('ACG-01').name, 'but nothing is saved yet').toBe('MY OWN NAME')
    await act(async () => { (a.querySelector('#ifCancel') as HTMLButtonElement).click() })
    expect(C.infoFor('ACG-01').name, 'Cancel keeps what was there').toBe('MY OWN NAME')
    a.remove()
    await C.resetInfoFor('ACG-01')
    /* a ball the user made has no source document: no button promising one */
    C.toggleArrange()
    const p = C.addModule('acad'); await answer('MY-01'); await p
    C.toggleArrange(); await C.saveChangesClick()
    C.openInfo('MY-01')
    const b = await render(<InfoModal />)
    expect(b.querySelector('#ifReset'), 'no Reset to doc where there is no doc').toBeNull()
    C.closeInfo(); b.remove()
    C.openShowAll()
    const sa = await render(<ShowAllPanel />)
    const row = [...sa.querySelectorAll('.sarow')].find(r => (r.querySelector('.sid') || {}).textContent === 'MY-01')!
    await act(async () => { (row.querySelector('button.sedit') as HTMLButtonElement).click() })
    expect([...sa.querySelectorAll('.saedit button')].some(x => /Reset to doc/.test(x.textContent || '')), "nor in Show All's editor").toBe(false)
    C.closeShowAll(); sa.remove()
  })

  it('W1-3 (D120) — balls never dragged are exported where the board draws them, on screen or off, never stacked in one corner', async () => {
    await on(y26())
    /* what the board draws, read off the drawn chart */
    const drawn = () => Object.fromEntries([...document.querySelectorAll('#flowSvg .ball')].map(g => {
      const m = /translate\(([-\d.]+),([-\d.]+)\)/.exec(g.getAttribute('transform') || '')!
      return [(g as HTMLElement).dataset.id, { x: Math.round(+m[1] + 29), y: Math.round(+m[2] + 29) }]
    }))
    /* the board prints each place to a tenth of a pixel, off the ball's corner: within 1px is the same place */
    const far = (lay: any, want: any) => Object.keys(want).filter(id => !lay[id] || Math.abs(lay[id].x - want[id].x) > 1 || Math.abs(lay[id].y - want[id].y) > 1)
    /* 1 — a chart filled through the event list, nothing dragged */
    const p = C.addSyl(); await answer('SKETCH W13'); await p; await C.whenLoaded()
    const sk = C.curSylId()
    expect(await C.saveSylText(JSON.stringify([{ id: 'SK-01', type: 'acad' }, { id: 'SK-02', type: 'flight', prereqs: ['SK-01'] }]))).toBeNull()
    await C.saveChangesClick()
    const onScreen = drawn()
    await on(y26())
    const off = (await C.collectCharts([sk])).layouts[sk]
    expect(off['SK-01'], 'not both in one corner').not.toEqual(off['SK-02'])
    expect(far(off, { 'SK-01': onScreen['SK-01'], 'SK-02': onScreen['SK-02'] }), 'exported off screen = where the board drew them').toEqual([])
    await on(sk); const d1 = C.delSyl(); await answer(true); await d1; await C.whenLoaded()
    /* 2 — a copy of 2026 put back to the course map with ↺ Reset layout */
    await on(y26())
    const q = C.dupSyl(); await answer('RESET W13'); await q; await C.whenLoaded()
    const rc = C.curSylId()
    C.toggleArrange(); const r = C.resetLayoutClick(); await answer(true); await r; C.toggleArrange()
    if (C.sylDirty) await C.saveChangesClick()
    const board = drawn()
    const live = (await C.collectCharts([rc])).layouts[rc]
    expect(far(live, board), 'on screen: the file holds the course map the board shows, not the automatic layout').toEqual([])
    await on(y26())
    const away = (await C.collectCharts([rc])).layouts[rc]
    expect(far(away, board), 'off screen: the same').toEqual([])
    await on(rc); const d2 = C.delSyl(); await answer(true); await d2; await C.whenLoaded()
  })

  it('re-walk R-1 — Save changes after a fonts-only edit does not mark an untouched built-in "✎ edited" (the F7 rule at its second writer)', async () => {
    await on(ag())
    expect(C.sylHasOwnDef(ag()), 'the premise: untouched').toBe(false)
    C.toggleArrange(); C.setFont(10); C.toggleArrange()
    expect(C.sylDirty).toBe(true)
    await C.saveChangesClick()
    expect(C.sylHasOwnDef(ag()), 'its events are exactly the shipped ones').toBe(false)
    expect(C.currentFont(), 'the font change is kept').toBe(10)
  })
})

describe('[HUMAN-RETEST] the Tracker — marking, Last Flown, deleting a ball, lulls (round three: D123, D124, W2-F2..F6)', () => {
  const lf = (s: string) => ({ syll: (C.dates[s] || {}).lastSyll || null, curr: (C.dates[s] || {}).lastCurr || null })
  const dayOf = (s: string, id: string) => (((C.marks as any)[s] || {})[id] || {}).d || null
  async function setup() {
    if (C.arrangeMode) C.toggleArrange()
    if (C.sylDirty) await C.saveChangesClick()
    if (C.curSylId() !== C.sylIdOf('2026')) { await C.switchSyllabus(C.sylIdOf('2026')); await C.whenLoaded() }
    if (!C.active && C.roster.length) C.setActive(C.roster[0].id)
    const s = C.active
    for (const id of ['TR-2', 'TR-3', 'TR-4', 'AHC-1']) if (C.gradeOf(s, id)) { C.openPop(id, at); await C.popGrade('0') }
    await C.setLastSyll(s, ''); await C.setLastCurr(s, '')
    await drain()
    return s
  }
  async function grade(id: string, day: string, g = 'dco') { C.openPop(id, at); C.popDoneChanged(day); await C.popGrade(g) }

  it('the premise: TR-2, TR-3, TR-4 and AHC-1 are flights on 2026', async () => {
    await setup()
    for (const id of ['TR-2', 'TR-3', 'TR-4', 'AHC-1']) expect(C.byid[id] && C.byid[id].type, id).toBe('flight')
  })

  it('W2-F2 — a "Done on" box left empty for a moment while a day is retyped is not a day flown', async () => {
    const s = await setup()
    await grade('TR-2', '2026-09-15')
    expect(lf(s).syll).toBe('2026-09-15')
    C.openPop('TR-2', at)
    await C.popDoneChanged('')                    /* the box, mid-typing */
    expect(dayOf(s, 'TR-2'), 'the flight keeps its day').toBe('2026-09-15')
    expect(lf(s).syll, 'Last Flown is not today').toBe('2026-09-15')
    await C.popDoneChanged('2026-09-17')
    expect(dayOf(s, 'TR-2')).toBe('2026-09-17')
    expect(lf(s)).toEqual({ syll: '2026-09-17', curr: '2026-09-17' })
    C.closePop()
  })

  it('D123 / W2-F3 — Last Flown is the latest day actually flown, whatever order the flights were entered', async () => {
    const s = await setup()
    await grade('TR-2', '2026-09-23')
    await grade('TR-3', '2026-09-21')
    expect(lf(s).syll, 'an older flight entered after a newer one does not drag it back (R50)').toBe('2026-09-23')
    C.openPop('TR-2', at); await C.popDoneChanged('2026-09-20'); C.closePop()
    expect(lf(s), 'correcting the newer flight to an earlier day pulls it back to the latest flown').toEqual({ syll: '2026-09-21', curr: '2026-09-21' })
    C.openPop('TR-3', at); await C.popGrade('0')
    expect(lf(s).syll, 'un-marking a flight pulls it back to the latest flight still flown').toBe('2026-09-20')
    await grade('TR-4', '2026-09-24')
    expect(lf(s).syll).toBe('2026-09-24')
    C.openPop('TR-4', at); await C.popGrade('na')
    expect(lf(s).syll, 'a future day taken back comes back down').toBe('2026-09-20')
    C.openPop('TR-2', at); await C.popGrade('0')
    expect(lf(s), 'nothing flown — nothing to show').toEqual({ syll: null, curr: null })
  })

  it('D123 — a Last Flown typed by hand still stands until a later flight moves it (left as it is today)', async () => {
    const s = await setup()
    await C.setLastSyll(s, '2026-09-30')
    await grade('TR-3', '2026-09-21')
    expect(lf(s).syll, 'an older flight leaves the typed day').toBe('2026-09-30')
    await grade('TR-2', '2026-10-02')
    expect(lf(s).syll, 'a later flight moves it').toBe('2026-10-02')
    C.openPop('TR-2', at); await C.popDoneChanged('2026-09-25'); C.closePop()
    expect(lf(s).syll, 'and from then on it is worked out from the flights').toBe('2026-09-25')
    await setup()
  })

  it('W2-F6 — ↶ and ↷ keep the chart where it is, as grading does (R62)', async () => {
    const s = await setup()
    const board = document.getElementById('board')!
    board.scrollTop = 900; board.scrollLeft = 40
    C.openPop('ACG-05', at); await C.popGrade('dco')
    expect(board.scrollTop, 'the premise: grading keeps the view').toBe(900)
    await C.doUndo()
    expect(board.scrollTop, 'undo keeps it').toBe(900)
    await C.doRedo()
    expect(board.scrollTop, 'redo keeps it').toBe(900)
    expect(C.gradeOf(s, 'ACG-05')).toBe('dco')
    C.openPop('ACG-05', at); await C.popGrade('0'); await drain()
  })

  it('D124 / W2-F7 — deleting a ball and saving wipes its marks, so a new ball with that code starts ungraded', async () => {
    const s = await setup()
    const other = C.roster.find((r: any) => r.id !== s)?.id
    C.openPop('ACG-03', at); await C.popFail(1); await C.popGrade('dco')
    if (other) { C.setActive(other); C.openPop('ACG-03', at); await C.popGrade('dpco'); C.setActive(s) }
    expect(C.gradeOf(s, 'ACG-03')).toBe('dco')
    C.toggleArrange()
    /* the ball editor's own Delete ball (the production route) */
    C.openEdit('ACG-03')
    const d = C.deleteFromEditModal()
    await until(() => C.dlg); expect(C.dlg.msg, 'the question says the marks go').toMatch(/marks/i)
    C.dlgClose(true); await d
    await C.doUndo()
    expect(C.byid['ACG-03'], 'undo before saving brings the ball back').toBeTruthy()
    expect(C.gradeOf(s, 'ACG-03'), '…with its marks, as it was').toBe('dco')
    C.openEdit('ACG-03'); const d2 = C.deleteFromEditModal(); await answer(true); await d2
    C.toggleArrange(); await C.saveChangesClick()
    C.toggleArrange()
    const p = C.addModule('acad'); await answer('ACG-03'); await p
    C.toggleArrange(); await C.saveChangesClick()
    expect(C.gradeOf(s, 'ACG-03'), 'the new ball is not graded').toBe(0)
    expect(((C.marks[s] || {})['ACG-03'] || {}).f || 0, 'and carries no failure').toBe(0)
    if (other) { expect(C.gradeOf(other, 'ACG-03'), "nor for the other student").toBe(0) }
    /* put 2026 back to its shipped events for the tests after this one */
    const d3 = C.delSyl(); await until(() => C.dlg); C.dlgClose('__alt__'); await d3; await C.whenLoaded()
    expect(C.sylHasOwnDef(C.sylIdOf('2026'))).toBe(false)
  })

  it('W2-F4 — a lull period is removed only after a question', async () => {
    const s = await setup()
    /* the lull calendar's own two clicks */
    C.openLullPicker(s); await C.lullDayClick('2026-10-20'); await C.lullDayClick('2026-10-31')
    expect(C.lulls[s].length, 'the premise: one period').toBe(1)
    const p = C.removeLull(s, 0)
    await until(() => C.dlg); expect(C.dlg.msg).toMatch(/20\/10\/26/)
    C.dlgClose(false); await p
    expect(C.lulls[s].length, 'No keeps it').toBe(1)
    const q = C.removeLull(s, 0); await answer(true); await q
    expect(C.lulls[s].length, 'Yes removes it').toBe(0)
  })

  it('W2-F5 — Copy to… has a "select all" row (the 7 Aug approved design)', async () => {
    const s = await setup()
    /* a course of three, so there are two others to tick (the + Add route) */
    let added: string | null = null
    if (C.roster.length < 3) { const p = C.addStudent(); await answer('LULL THREE'); await p; added = C.roster.find((r: any) => r.name === 'LULL THREE')?.id || null; C.setActive(s) }
    expect(C.roster.length, 'the premise: three on the course').toBeGreaterThanOrEqual(3)
    const { default: SidePanel } = await import('./components/SidePanel.jsx')
    const Live = () => { useSyncExternalStore(C.subscribe, C.getVersion); return <SidePanel /> }
    C.openLullCopy(s)
    const host = await render(<Live />)
    const all = host.querySelector('#lullCopyAll') as HTMLInputElement
    expect(all, 'a select-all box').toBeTruthy()
    await act(async () => { all.click() })
    const others = C.roster.filter((r: any) => r.id !== s).map((r: any) => r.id)
    expect([...C.lullCopy.picked].sort(), 'it ticks everyone else').toEqual([...others].sort())
    C.closeLullCopy(); host.remove()
    if (added) { const r = C.removeStudent(added); await answer(true); await r }
  })
})

describe('[HUMAN-RETEST] the Tracker — unsaved chart edits are never dropped or left out without a word (round two)', () => {
  /* a structure edit that waits for ✓ Save changes: a ball added in edit mode */
  async function dirty(name: string) {
    if (!C.arrangeMode) C.toggleArrange()
    const p = C.addModule('acad'); await answer(name); await p
    C.toggleArrange()
    expect(C.sylDirty, 'the premise: an unsaved flow edit').toBe(true)
  }
  async function clean() { if (C.sylDirty) await C.saveChangesClick() }

  it('Fable #2 — Export asks to save first, and the file then carries the unsaved ball (D120)', async () => {
    await clean(); await dirty('LATE-2')
    const p = C.openCopy()
    await until(() => C.dlg && /unsaved flow edits/.test(C.dlg.msg))
    C.dlgClose(true)                                   /* Save, then export */
    await p
    expect(C.sylDirty, 'saved').toBe(false)
    expect(C.copyOpen, 'the Export window opens').toBe(true)
    const f = await C.collectCharts([C.curSylId()])
    expect(f.syllabi[C.curSylId()].some((e: any) => e.id === 'LATE-2'), 'the file has the ball').toBe(true)
    C.closeCopy()
  })

  it('Fable #3 — + Add syllabus asks before dropping unsaved edits; No keeps them', async () => {
    await clean(); await dirty('LATE-3A')
    const n = C.SYLS.length
    const p = C.addSyl()
    await until(() => C.dlg); expect(C.dlg.msg).toMatch(/unsaved flow edits/)
    C.dlgClose(false); await p
    expect(C.SYLS.length, 'nothing added').toBe(n)
    expect(C.sylDirty, 'the edit is still there').toBe(true)
    await clean()
  })

  it('Fable #3 — Duplicate asks, and "save them on both" keeps the edit on the original too', async () => {
    await clean(); await dirty('LATE-3B')
    const src = C.curSylId()
    const p = C.dupSyl()
    await until(() => C.dlg); expect(C.dlg.msg).toMatch(/unsaved flow edits/)
    C.dlgClose(true)                                   /* save them on both */
    await answer('DUP THREE'); await p; await C.whenLoaded()
    expect(C.curSylName()).toBe('DUP THREE')
    expect(C.byid['LATE-3B'], 'the copy has it').toBeTruthy()
    const orig = await C.collectCharts([src])
    expect(orig.syllabi[src].some((e: any) => e.id === 'LATE-3B'), 'and so does the original').toBe(true)
    const d = C.delSyl(); await answer(true); await d; await C.whenLoaded()
    await C.switchSyllabus(src); await C.whenLoaded()
  })

  it('Fable #3 — Import asks before a file reloads the chart over unsaved edits; No brings nothing in', async () => {
    await clean(); await dirty('LATE-3C')
    const before = JSON.stringify(C.orderedSylIds())
    const charts = await C.collectCharts(C.orderedSylIds())
    ;(window as any).__pickOpenForTests = async () => ({ name: 'b.json', text: JSON.stringify(FMT.buildFile({ savedAt: 'x', charts })) })
    try {
      const p = C.importClick()
      await until(() => C.dlg); expect(C.dlg.msg).toMatch(/unsaved flow edits/)
      C.dlgClose(false); await p
    } finally { delete (window as any).__pickOpenForTests }
    expect(C.sylDirty, 'the edit is still there').toBe(true)
    expect(C.byid['LATE-3C']).toBeTruthy()
    expect(JSON.stringify(C.orderedSylIds())).toBe(before)
    await clean()
  })
})
