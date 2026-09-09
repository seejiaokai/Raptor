// @vitest-environment jsdom
/* The Tracker tab's seam into Raptor (7 Sep 26, the Tracker merge).
   Three things this pins, none of which the vendored smoke suite
   (scripts/tracker/smoke.mjs) can see because it always drives as the admin:
   · the FILE LOCK rides the Raptor session — a member login (and a logout)
     locks the file portion, an admin login unlocks it, and the admin's
     view-as-member toggle flips it both ways (state/store.ts resetSession /
     toggleRole → tracker/role.js);
   · the lock is enforced at the WRITE PATH in core.js, not only at the
     affordance — Open, Import and Save a copy refuse a locked caller — while
     everything else (marking, edit mode, the editors, students, dates) stays
     open to everyone (owner, 7 Sep 26: "allowed for both admin and member
     for all access, except the file portion which is admin only");
   · the affordance half matches: the header hides only the File menu for a
     member and keeps every other control.
   The flag lives in role.js so Raptor can write it WITHOUT loading the chart
   engine — a regression there would put ~280 KB of syllabus data back into
   Raptor's first download; the last test guards that by construction. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { isFileLocked, setFileLocked } from './role.js'
import * as core from './app/core.js'
import Header from './components/Header.jsx'
import { initStore, resetSession, toggleRole } from '../state/store'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel)

describe('the file lock rides the Raptor session (store.ts → tracker/role.js)', () => {
  beforeEach(() => { initStore() })

  it('a member login locks the file portion, an admin login unlocks it, a logout locks it', () => {
    resetSession({ user: 'us', role: 'main' })
    expect(isFileLocked()).toBe(true)
    expect(core.fileLocked).toBe(true)
    resetSession({ user: 'ad', role: 'admin' })
    expect(isFileLocked()).toBe(false)
    expect(core.fileLocked).toBe(false)
    resetSession(null)
    expect(isFileLocked()).toBe(true)
  })

  it("the admin's view-as-member toggle flips it both ways", () => {
    resetSession({ user: 'ad', role: 'admin' })
    expect(core.fileLocked).toBe(false)
    toggleRole()
    expect(core.fileLocked).toBe(true)
    toggleRole()
    expect(core.fileLocked).toBe(false)
  })
})

describe('only the file portion is locked, at the write path (core.js)', () => {
  beforeEach(() => { setFileLocked(false) })

  it('a member still grades, edits and manages — the pop-up and the editors open', () => {
    setFileLocked(true)
    core.openPop('ST-01', { clientX: 10, clientY: 10 })
    expect(core.pop).toEqual({ id: 'ST-01', x: 10, y: 10 })
    core.closePop()
    core.openInfo('ST-01'); expect(core.infoId).toBe('ST-01'); core.closeInfo?.()
    core.openModal(); expect(core.sylModalOpen).toBe(true); core.closeModal()
    core.openOrdCrew(); expect(core.ordMode).toBe('crew'); core.closeOrd?.()
    core.openLullCopy('STUDENT A'); expect(core.lullCopy).toEqual({ from: 'STUDENT A', picked: [] }); core.closeLullCopy()
  })

  it('Save a copy refuses a member and opens for the admin', () => {
    setFileLocked(true)
    core.openCopy()
    expect(core.copyOpen).toBe(false)
    setFileLocked(false)
    core.openCopy()
    expect(core.copyOpen).toBe(true)
    core.closeCopy()
  })

  it('locking mid-session closes an open Save a copy dialog', () => {
    core.openCopy()
    expect(core.copyOpen).toBe(true)
    setFileLocked(true)
    expect(core.copyOpen).toBe(false)
  })

  it('Import and Export are guarded at their entry points', () => {
    const src = readFileSync(join(__dirname, 'app/core.js'), 'utf8')
    for (const fn of ['importClick', 'openCopy', 'saveCopyClick'])
      expect(src, fn).toMatch(new RegExp(`export (async )?function ${fn}\\([^)]*\\) \\{ if \\(fileLocked\\) return;`))
    /* and nothing else is — the standalone app's other writes are everyone's */
    expect((src.match(/if \(fileLocked\) return;/g) || []).length).toBe(3)
  })
})

describe('the header hides only the File menu for a member', () => {
  const render = async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    await act(async () => { createRoot(host).render(<Header />) })
    return host
  }
  beforeEach(() => { document.body.innerHTML = '' })

  const EVERYONE = ['activeSel', 'showAllBtn', 'hSearchBtn', 'courseSel', 'courseMenuBtn', 'sylSel', 'sylMenuBtn', 'arrangeBtn', 'detailsBtn', 'trUndoBtn', 'trRedoBtn', 'saveStat']

  it('admin: every control including the File menu', async () => {
    setFileLocked(false)
    await render()
    for (const id of [...EVERYONE, 'fileMenuBtn']) expect($('#' + id), id).toBeTruthy()
  })

  it('member: everything but the File menu', async () => {
    setFileLocked(true)
    await render()
    for (const id of EVERYONE) expect($('#' + id), id).toBeTruthy()
    expect($('#fileMenuBtn')).toBeNull()
    expect($('#importFileBtn')).toBeNull()
    expect($('#exportBtn')).toBeNull()
  })

  /* 9 Sep 26 (owner: "I thought it should be auto synced … isn't it
     duplicating"): the file is a format, not a store. The Save button watches
     flow edits only and the File menu is three one-way moves. */
  it('the File menu is ONE Import and ONE Export — nothing binds or names a file', async () => {
    setFileLocked(false)
    await render()
    for (const id of ['importFileBtn', 'exportBtn']) expect($('#' + id), id).toBeTruthy()
    for (const id of ['openFileBtn', 'saveCopyBtn', 'importSylBtn', 'restoreBtn', 'openFileName', 'lastSaved', 'optCharts', 'optStudents'])
      expect($('#' + id), id + ' is gone').toBeNull()
  })

  /* 9 Sep 26 reorder (owner): the wide "Course ▾" / "Syllabus ▾" menus became ✎
     pencils beside their dropdowns; the standalone Edit button folded into the
     Syllabus pencil as its first item; Details mode became a compact ⓘ icon. */
  it('Edit chart folds into the Syllabus pencil; Course/Syllabus are ✎ icons; Details is an ⓘ icon', async () => {
    setFileLocked(false)
    await render()
    /* Edit chart layout is the FIRST item inside the Syllabus pencil menu... */
    const sylPanel = $('#sylMenuPanel')!
    expect(sylPanel, 'syllabus menu panel exists').toBeTruthy()
    expect(sylPanel.querySelector('button')!.id, 'first item is Edit chart').toBe('arrangeBtn')
    /* ...and NOT a bar control any more */
    const bar = document.querySelector('header .controls')!
    expect([...bar.children].some(e => (e as HTMLElement).id === 'arrangeBtn'), 'arrange is not a bar button').toBe(false)
    /* the menu buttons are glyph pencils, the info toggle a lone ⓘ */
    expect($('#courseMenuBtn')!.textContent!.trim()).toBe('✎')
    expect($('#sylMenuBtn')!.textContent!.trim()).toBe('✎')
    expect($('#detailsBtn')!.textContent!.trim()).toBe('ⓘ')
  })

  it('Save changes watches flow edits only, and no longer touches a file', () => {
    const src = readFileSync(join(__dirname, 'app/core.js'), 'utf8')
    const hdr = readFileSync(join(__dirname, 'components/Header.jsx'), 'utf8')
    expect(hdr).toMatch(/const dirty = core\.sylDirty;/)
    expect(src).toMatch(/export async function saveChangesClick\(\) \{ await persistSyl\(\); \}/)
    for (const gone of ['fileDirty', 'markFileDirty', 'fileHandle', 'saveToFileClick', 'openFileClick', 'ensureWritable'])
      expect(src, gone + ' is gone').not.toContain(gone)
  })
})

/* 9 Sep 26 (owner: "undo and redo … for all users … not only isolated to
   under edit"): ONE history of two kinds of step — chart edits, and one
   student's marks + dates — behind the bar's ↶ ↷, with the weird cases walked:
   the picker follows an undone mark to its student, a removed student's steps
   are skipped, typing into a date box is one step, and a shortcut inside a
   text box is the box's own. */
describe('undo / redo on the bar, for everyone (core.js)', () => {
  const drain = async () => { while (core.canUndo()) await core.doUndo(); while (core.canRedo()) await core.doRedo(); while (core.canUndo()) await core.doUndo() }
  const grade = (s: string, id: string) => (((core.marks as any)[s] || {})[id] || {}).g || 0
  beforeEach(async () => { await drain(); core.setActive('STUDENT Z') })

  it('a grade is one undo step, greyed-out state and tooltip included; redo puts it back', async () => {
    expect(core.canUndo()).toBe(false); expect(core.canRedo()).toBe(false)
    core.openPop('ST-01', { clientX: 1, clientY: 1 }); await core.popGrade('dco')
    expect(grade('STUDENT Z', 'ST-01')).toBe('dco')
    expect(core.canUndo()).toBe(true)
    expect(core.undoWhat()).toBe('the mark on ST-01 for STUDENT Z')
    await core.doUndo()
    expect(grade('STUDENT Z', 'ST-01')).toBe(0)
    expect(core.canUndo()).toBe(false); expect(core.canRedo()).toBe(true)
    expect(core.redoWhat()).toBe('the mark on ST-01 for STUDENT Z')
    await core.doRedo()
    expect(grade('STUDENT Z', 'ST-01')).toBe('dco')
  })

  it('a failure count is its own step, and a mark and a chart edit share one history in order', async () => {
    core.openPop('ST-02', { clientX: 1, clientY: 1 }); await core.popGrade('marg')
    core.openPop('ST-02', { clientX: 1, clientY: 1 }); await core.popFail(1)
    expect((core.marks as any)['STUDENT Z']['ST-02'].f).toBe(1)
    expect(core.undoWhat()).toBe('the failure count on ST-02 for STUDENT Z')
    await core.doUndo()
    expect((core.marks as any)['STUDENT Z']['ST-02'].f).toBe(0)
    expect(grade('STUDENT Z', 'ST-02')).toBe('marg')
    expect(core.undoWhat()).toBe('the mark on ST-02 for STUDENT Z')
  })

  it('the crew picker follows an undone mark to the student it belonged to', async () => {
    core.openPop('ST-03', { clientX: 1, clientY: 1 }); await core.popGrade('dco')
    core.setActive('STUDENT Y')
    expect(core.active).toBe('STUDENT Y')
    await core.doUndo()
    expect(core.active).toBe('STUDENT Z')
    expect(grade('STUDENT Z', 'ST-03')).toBe(0)
    expect(core.pop).toBeNull()
  })

  it("a student who is gone leaves no live step — Undo skips it rather than marking nobody's chart", async () => {
    core.setActive('STUDENT GONE')
    core.openPop('ST-04', { clientX: 1, clientY: 1 }); await core.popGrade('dco')
    expect(core.canUndo()).toBe(true)
    delete (core.marks as any)['STUDENT GONE']
    expect(core.canUndo()).toBe(false)
    expect(await core.doUndo()).toBe(false)
  })

  it('keystrokes into one date box within two seconds are ONE step', async () => {
    ;(core.dates as any)['STUDENT Z'] = { lastSyll: null, lastCurr: null }
    await core.setLastCurr('STUDENT Z', '2026-01-0'); await core.setLastCurr('STUDENT Z', '2026-01-05')
    expect(core.undoWhat()).toBe('Last Flown (Currency) for STUDENT Z')
    await core.doUndo()
    expect((core.dates as any)['STUDENT Z'].lastCurr).toBeNull()
    expect(core.canUndo()).toBe(false)
    /* …but a different box is a different step */
    await core.setDownDays('STUDENT Z', '3'); await core.setUpchit('STUDENT Z', '2026-02-01')
    await core.doUndo()
    expect((core.dates as any)['STUDENT Z'].upchit).toBeUndefined()
    expect((core.dates as any)['STUDENT Z'].downDays).toBe('3')
  })

  it('Ctrl+Z undoes, Ctrl+Y / Ctrl+Shift+Z redo — never from inside a text box or under a question', async () => {
    core.openPop('ST-05', { clientX: 1, clientY: 1 }); await core.popGrade('dco')
    const key = (k: string, extra: any = {}) => {
      const e: any = { ctrlKey: true, key: k, target: { tagName: 'DIV' }, preventDefault: () => { e.prevented = true }, ...extra }
      core.handleUndoKey(e); return e
    }
    expect(key('z', { target: { tagName: 'INPUT' } }).prevented).toBeUndefined()
    await new Promise(r => setTimeout(r, 0))
    expect(grade('STUDENT Z', 'ST-05')).toBe('dco')
    expect(key('z').prevented).toBe(true)
    await new Promise(r => setTimeout(r, 0))
    expect(grade('STUDENT Z', 'ST-05')).toBe(0)
    key('y'); await new Promise(r => setTimeout(r, 0))
    expect(grade('STUDENT Z', 'ST-05')).toBe('dco')
    key('z'); await new Promise(r => setTimeout(r, 0))
    expect(grade('STUDENT Z', 'ST-05')).toBe(0)
    key('z', { shiftKey: true }); await new Promise(r => setTimeout(r, 0))
    expect(grade('STUDENT Z', 'ST-05')).toBe('dco')
    /* no modifier, or Alt, is not the shortcut */
    expect(key('z', { ctrlKey: false }).prevented).toBeUndefined()
    expect(key('z', { altKey: true }).prevented).toBeUndefined()
  })
})

/* 9 Sep 26 (owner: "a drop down menu on the prediction of the syllabus related
   to the typed text"): the box exposes every match, not just a count, and the
   list under it is walked and picked from. */
/* 9 Sep 26 (owner): "Failures will also track the date in which the student
   fails … Indicate each failure individually, so when someone fails twice, it
   should show ST-01, ST01X … the details portion will reflect the date
   accomplished automatically as the date updated. But the user can also
   manually change the date after. And make sure it shows the right data for
   each student separately." The record is marks[s][id]: f the count, fd one day
   per failure, d the day the event was done. */
describe('dated failures and the day an event was done (core.js)', () => {
  const drain = async () => { while (core.canUndo()) await core.doUndo(); while (core.canRedo()) await core.doRedo(); while (core.canUndo()) await core.doUndo() }
  const at = { clientX: 1, clientY: 1 }
  const today = core.isoToday()
  /* The full list walks the CHART (chart order), so the engine has to have
     booted — the same one-off boot the crew-picker tests do; init() guards
     against a second run. */
  let board: HTMLElement
  beforeAll(async () => { board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board); await core.init() })
  afterAll(() => board.remove())
  beforeEach(async () => { await drain(); core.setActive('STUDENT Z') })
  afterEach(async () => { core.closePop(); await drain() })

  it('+ records a failure on the pop-up’s day — today unless changed — and − takes the latest back', async () => {
    core.openPop('ST-01', at)
    expect(core.popFailDate).toBe(today)
    await core.popFail(1)
    core.popFailDateChanged('2026-08-02')
    await core.popFail(1)
    expect(((core.marks as any)['STUDENT Z']['ST-01']).f, 'the count the ball’s ticks read').toBe(2)
    expect(core.failDates('STUDENT Z', 'ST-01')).toEqual([today, '2026-08-02'])
    expect(core.failList('STUDENT Z').map(x => x.label), 'each failure its own entry').toEqual(['ST-01', 'ST-01X'])
    await core.popFail(-1)
    expect(core.failDates('STUDENT Z', 'ST-01')).toEqual([today])
    expect(core.failDates('STUDENT Y', 'ST-01'), 'the other student’s record is untouched').toEqual([])
  })

  it('a count from before days were kept reads as that many undated failures; the notation adds an X per failure', () => {
    ;(core.marks as any)['STUDENT Z']['ST-03'] = { g: 0, f: 2 }
    expect(core.failDates('STUDENT Z', 'ST-03')).toEqual([null, null])
    expect(core.failList('STUDENT Z').filter(x => x.id === 'ST-03').map(x => x.label)).toEqual(['ST-03', 'ST-03X'])
    expect(core.failLabel('ST-03', 2)).toBe('ST-03XX')
    delete (core.marks as any)['STUDENT Z']['ST-03']
  })

  it('re-dating one failure from the full list is one step per box and leaves the others alone', async () => {
    core.openPop('ST-02', at); await core.popFail(1); await core.popFail(1); core.closePop()
    await core.setFailDate('STUDENT Z', 'ST-02', 0, '2026-07-01')
    await core.setFailDate('STUDENT Z', 'ST-02', 0, '2026-07-02')
    expect(core.failDates('STUDENT Z', 'ST-02')).toEqual(['2026-07-02', today])
    expect(core.undoWhat()).toBe('the date of ST-02 for STUDENT Z')
    await core.doUndo()
    expect(core.failDates('STUDENT Z', 'ST-02'), 'both keystrokes were one step').toEqual([today, today])
  })

  it('a grade is dated the day it is pressed; the box re-dates it afterwards; Not done drops the day', async () => {
    core.openPop('ST-01', at)
    expect(core.popDoneDate).toBe(today)
    await core.popGrade('dco')
    expect(core.doneDate('STUDENT Z', 'ST-01')).toBe(today)
    core.openPop('ST-01', at)
    await core.popDoneChanged('2026-08-10')
    expect(core.doneDate('STUDENT Z', 'ST-01')).toBe('2026-08-10')
    expect(core.undoWhat()).toBe('the date on ST-01 for STUDENT Z')
    core.closePop()
    expect(core.doneDate('STUDENT Y', 'ST-01'), 'per student').toBeNull()
    core.openPop('ST-01', at)
    expect(core.popDoneDate, 'the box opens on the day already recorded').toBe('2026-08-10')
    await core.popGrade('0')
    expect(core.doneDate('STUDENT Z', 'ST-01')).toBeNull()
  })

  it('the details bubble carries the student’s own record, and nothing for a student with none', async () => {
    core.openPop('ST-02', at); await core.popFail(1)
    core.openPop('ST-02', at); await core.popGrade('dpco')
    const html = core.markHtml('STUDENT Z', 'ST-02')
    expect(html).toContain('STUDENT Z')
    expect(html).toContain('DPCO on')
    expect(html).toContain('Failed')
    expect(core.markHtml('STUDENT Y', 'ST-02')).toBe('')
  })
})

describe('the Find box lists its predictions (core.js + Header.jsx)', () => {
  const SYL3 = [{ id: 'ST-01', type: 'flight' }, { id: 'ST-02', type: 'flight' }, { id: 'ACG-01', type: 'acad' }]
  beforeEach(async () => {
    expect(await core.saveSylText(JSON.stringify(SYL3))).toBeNull()
    core.clearSearch()
    document.body.innerHTML = ''
  })

  it('runSearch exposes the hits in order; ↑ ↓ walk them, a pick lands on one, clearing empties them', () => {
    core.runSearch('ST', false)
    expect(core.searchHits).toEqual(['ST-01', 'ST-02'])
    expect(core.searchAt).toBe(0)
    core.searchStep(1); expect(core.searchAt).toBe(1)
    core.searchStep(1); expect(core.searchAt).toBe(0)
    core.searchStep(-1); expect(core.searchAt).toBe(1)
    core.searchGo(0); expect(core.searchAt).toBe(0)
    expect(core.searchHit).toBe('ST-01')
    core.runSearch('ZZZ', false)
    expect(core.searchHits).toEqual([])
    core.clearSearch()
    expect(core.searchHits).toEqual([]); expect(core.searchHit).toBeNull()
  })

  it('the list shows while the box has focus and something matches; the ringed hit is lit; blur hides it', async () => {
    const host = document.createElement('div'); document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => { root.render(<Header />) })
    const input = $('#hSearch') as HTMLInputElement
    const list = $('#hSearchList')!
    expect(list.classList.contains('on')).toBe(false)
    core.runSearch('ST', false)
    await act(async () => { input.focus() })
    expect(list.classList.contains('on')).toBe(true)
    const rows = [...list.querySelectorAll('.findrow')]
    expect(rows.map(r => (r as HTMLElement).dataset.id)).toEqual(['ST-01', 'ST-02'])
    expect(rows[0].classList.contains('on')).toBe(true)
    expect(rows[1].classList.contains('on')).toBe(false)
    await act(async () => { input.blur() })
    expect(list.classList.contains('on')).toBe(false)
    await act(async () => { root.unmount() })
  })
})

/* 9 Sep 26 (owner, with a screenshot): ST-01 done for student A; pick student
   B and the chart still lit ACG-01 as B's next event, when B has done nothing
   and their next event is ST-01. The yellow rings are baked into the chart for
   the picked student, and the Crew picker was the one way of moving the picker
   that did not draw the chart again. */
describe('the Crew picker redraws the chart for the student it picks', () => {
  const ringed = () => [...document.querySelectorAll('#board #flowSvg .ball')]
    .filter(g => g.querySelector('circle.avail')).map(g => (g as HTMLElement).dataset.id)
  let board: HTMLElement, A: string, B: string
  beforeEach(async () => {
    board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
    /* The chart engine boots once (App.jsx does this on the tab's first mount);
       the seeded roster is two placeholder students on the first syllabus. */
    await core.init()
    while (core.canUndo()) await core.doUndo()
    ;[A, B] = core.roster as string[]
    expect(A && B, 'the seed carries two students').toBeTruthy()
    core.setActive(A)
  })

  it("the rings follow the picked student, not the last one's marks", async () => {
    expect(ringed(), 'nothing done: the first event is the one to plan').toContain('ST-01')
    core.openPop('ST-01', { clientX: 1, clientY: 1 }); await core.popGrade('dco')
    expect(ringed()).not.toContain('ST-01')
    expect(ringed(), 'ST-01 done: what follows it lights up').toContain('ACG-01')

    core.setActive(B)
    expect(core.active).toBe(B)
    expect(ringed(), B + ' has done nothing — ST-01 is theirs to plan').toContain('ST-01')
    expect(ringed(), 'ACG-01 was ' + A + "'s next event, not " + B + "'s").not.toContain('ACG-01')

    core.setActive(A)
    expect(ringed()).toContain('ACG-01')
    expect(ringed()).not.toContain('ST-01')
  })

  it('an open grading pop-up closes, so its buttons cannot grade the wrong student', () => {
    core.openPop('ST-02', { clientX: 1, clientY: 1 })
    expect(core.pop).not.toBeNull()
    core.setActive(B)
    expect(core.pop).toBeNull()
  })

  /* 9 Sep 26 (owner): the ring on every ball is a second crew picker — one
     wedge per student. Tapping somebody else's wedge picks them (and every
     ball edges that wedge in cyan); tapping the selected student's wedge, or
     the centre, opens the details as before. */
  const tap = (sel: string) => {
    const el = document.querySelector(sel)!
    expect(el, sel).toBeTruthy()
    el.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 5, clientY: 5 }))
  }
  const mine = () => [...document.querySelectorAll('#board #flowSvg .ball')]
    .map(g => g.querySelector('path.mine')?.getAttribute('data-wi') ?? null)
  it("a tap on another student's wedge picks them and opens nothing", () => {
    expect(mine().every(w => w === '0'), 'every ball edges the first student').toBe(true)
    tap('#board .ball[data-id="ST-01"] .wedge[data-wi="1"]')
    expect(core.active).toBe(B)
    expect(core.pop).toBeNull()
    expect(mine().every(w => w === '1'), 'every ball now edges the second student').toBe(true)
  })
  it("a tap on the selected student's own wedge, or the centre, opens the details", () => {
    tap('#board .ball[data-id="ST-01"] .wedge[data-wi="0"]')
    expect(core.active).toBe(A)
    expect((core.pop as any)?.id).toBe('ST-01')
    core.closePop()
    tap('#board .ball[data-id="ST-02"] .core')
    expect((core.pop as any)?.id).toBe('ST-02')
    core.closePop()
  })

  afterEach(async () => { while (core.canUndo()) await core.doUndo(); board.remove() })
})

describe('a second mount redraws the chart (logout → login)', () => {
  it('the board is drawn again on a fresh #board after the engine already booted', async () => {
    /* ui/App.tsx swaps the whole Shell for the login screen on logout, so the
       next login mounts the Tracker again with a new, empty #board while
       core.init() — guarded against a second run — has nothing to do. Found
       by the 7 Sep 26 bug sweep: no chart after logging back in. */
    const { default: App } = await import('./App.jsx')
    const mount = async () => {
      const host = document.createElement('div')
      host.innerHTML = '<div id="page-tracker"></div>'
      document.body.appendChild(host)
      const root = createRoot(host.querySelector('#page-tracker')!)
      await act(async () => { root.render(<App active={true} />) })
      await act(async () => { await new Promise(r => setTimeout(r, 50)) })
      return { host, root }
    }
    const first = await mount()
    expect(document.querySelector('#page-tracker #board #flowSvg'), 'first mount draws').toBeTruthy()
    await act(async () => { first.root.unmount() }); first.host.remove()
    const second = await mount()
    expect(document.querySelector('#page-tracker #board #flowSvg .ball'), 'second mount draws again').toBeTruthy()
    await act(async () => { second.root.unmount() }); second.host.remove()
  })
})

describe('the seam stays light', () => {
  it('Raptor writes the lock through role.js, never by importing core.js', () => {
    const store = readFileSync(join(__dirname, '../state/store.ts'), 'utf8')
    expect(store).toMatch(/from '\.\.\/tracker\/role\.js'/)
    expect(store).not.toMatch(/from '[^']*tracker\/app\//)
    /* and role.js itself imports nothing — the whole point */
    const role = readFileSync(join(__dirname, 'role.js'), 'utf8')
    expect(role).not.toMatch(/^\s*import /m)
  })

  it('the two undo ids Raptor already owns were renamed — and the pair lives on the bar now', () => {
    const tools = readFileSync(join(__dirname, 'components/ArrangeTools.jsx'), 'utf8')
    const hdr = readFileSync(join(__dirname, 'components/Header.jsx'), 'utf8')
    expect(tools).not.toMatch(/id="(undoBtn|redoBtn|trUndoBtn|trRedoBtn)"/)
    expect(hdr).not.toMatch(/id="(undoBtn|redoBtn)"/)
    expect(hdr).toMatch(/id="trUndoBtn"/)
    expect(hdr).toMatch(/id="trRedoBtn"/)
  })
})
