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
import { getPeople, setPeople, setWhoami } from './people.js'
import { projectForTracker, wireTrackerPeople } from './peoplewire'
import * as core from './app/core.js'
import * as FMT from './app/fileFormat.js'
import { storage } from './storage.js'
import Header from './components/Header.jsx'
import SidePanel from './components/SidePanel.jsx'
import { DlgModal } from './components/Modals.jsx'
import { initStore, notify as raptorNotify, resetSession, toggleRole } from '../state/store'
import { PEOPLE } from '../engine/people'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { useSyncExternalStore } from 'react'

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
    /* a student is an enrolment id since 10 Sep 26; this runs before the chart
       engine boots, so there is no roster to look one up on — the point of the
       check is that the panel opens for a member, whoever it is opened on */
    core.openLullCopy('sSTUDENTA'); expect(core.lullCopy).toEqual({ from: 'sSTUDENTA', picked: [] }); core.closeLullCopy()
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
  /* 10 Sep 26: a student IS an enrolment id and the name is a label on the
     roster entry, so the two the tooltips name sit on the roster for these
     checks — the pins below still read "for STUDENT Z", off that entry. */
  const Z = 'sTESTZ', Y = 'sTESTY'
  const seat = () => {
    for (const [id, name] of [[Z, 'STUDENT Z'], [Y, 'STUDENT Y']])
      if (!core.byName(name)) (core.roster as any).push({ id, name })
  }
  const unseat = () => {
    for (const id of [Z, Y]) { const i = core.roster.findIndex((r: any) => r.id === id); if (i >= 0) (core.roster as any).splice(i, 1) }
  }
  const drain = async () => { while (core.canUndo()) await core.doUndo(); while (core.canRedo()) await core.doRedo(); while (core.canUndo()) await core.doUndo() }
  const grade = (s: string, id: string) => (((core.marks as any)[s] || {})[id] || {}).g || 0
  beforeEach(async () => { await drain(); seat(); core.setActive(Z) })
  afterAll(unseat)

  it('a grade is one undo step, greyed-out state and tooltip included; redo puts it back', async () => {
    expect(core.canUndo()).toBe(false); expect(core.canRedo()).toBe(false)
    core.openPop('ST-01', { clientX: 1, clientY: 1 }); await core.popGrade('dco')
    expect(grade(Z, 'ST-01')).toBe('dco')
    expect(core.canUndo()).toBe(true)
    expect(core.undoWhat()).toBe('the mark on ST-01 for STUDENT Z')
    await core.doUndo()
    expect(grade(Z, 'ST-01')).toBe(0)
    expect(core.canUndo()).toBe(false); expect(core.canRedo()).toBe(true)
    expect(core.redoWhat()).toBe('the mark on ST-01 for STUDENT Z')
    await core.doRedo()
    expect(grade(Z, 'ST-01')).toBe('dco')
  })

  it('a failure count is its own step, and a mark and a chart edit share one history in order', async () => {
    core.openPop('ST-02', { clientX: 1, clientY: 1 }); await core.popGrade('marg')
    core.openPop('ST-02', { clientX: 1, clientY: 1 }); await core.popFail(1)
    expect((core.marks as any)[Z]['ST-02'].f).toBe(1)
    expect(core.undoWhat()).toBe('the failure count on ST-02 for STUDENT Z')
    await core.doUndo()
    expect((core.marks as any)[Z]['ST-02'].f).toBe(0)
    expect(grade(Z, 'ST-02')).toBe('marg')
    expect(core.undoWhat()).toBe('the mark on ST-02 for STUDENT Z')
  })

  it('the crew picker follows an undone mark to the student it belonged to', async () => {
    core.openPop('ST-03', { clientX: 1, clientY: 1 }); await core.popGrade('dco')
    core.setActive(Y)
    expect(core.active).toBe(Y)
    await core.doUndo()
    expect(core.active).toBe(Z)
    expect(grade(Z, 'ST-03')).toBe(0)
    expect(core.pop).toBeNull()
  })

  it("a student who is gone leaves no live step — Undo skips it rather than marking nobody's chart", async () => {
    core.setActive('sGONE')
    core.openPop('ST-04', { clientX: 1, clientY: 1 }); await core.popGrade('dco')
    expect(core.canUndo()).toBe(true)
    delete (core.marks as any)['sGONE']
    expect(core.canUndo()).toBe(false)
    expect(await core.doUndo()).toBe(false)
  })

  it('keystrokes into one date box within two seconds are ONE step', async () => {
    ;(core.dates as any)[Z] = { lastSyll: null, lastCurr: null }
    await core.setLastCurr(Z, '2026-01-0'); await core.setLastCurr(Z, '2026-01-05')
    expect(core.undoWhat()).toBe('Last Flown (Currency) for STUDENT Z')
    await core.doUndo()
    expect((core.dates as any)[Z].lastCurr).toBeNull()
    expect(core.canUndo()).toBe(false)
    /* …but a different box is a different step */
    await core.setDownDays(Z, '3'); await core.setUpchit(Z, '2026-02-01')
    await core.doUndo()
    expect((core.dates as any)[Z].upchit).toBeUndefined()
    expect((core.dates as any)[Z].downDays).toBe('3')
  })

  it('Ctrl+Z undoes, Ctrl+Y / Ctrl+Shift+Z redo — never from inside a text box or under a question', async () => {
    core.openPop('ST-05', { clientX: 1, clientY: 1 }); await core.popGrade('dco')
    const key = (k: string, extra: any = {}) => {
      const e: any = { ctrlKey: true, key: k, target: { tagName: 'DIV' }, preventDefault: () => { e.prevented = true }, ...extra }
      core.handleUndoKey(e); return e
    }
    expect(key('z', { target: { tagName: 'INPUT' } }).prevented).toBeUndefined()
    await new Promise(r => setTimeout(r, 0))
    expect(grade(Z, 'ST-05')).toBe('dco')
    expect(key('z').prevented).toBe(true)
    await new Promise(r => setTimeout(r, 0))
    expect(grade(Z, 'ST-05')).toBe(0)
    key('y'); await new Promise(r => setTimeout(r, 0))
    expect(grade(Z, 'ST-05')).toBe('dco')
    key('z'); await new Promise(r => setTimeout(r, 0))
    expect(grade(Z, 'ST-05')).toBe(0)
    key('z', { shiftKey: true }); await new Promise(r => setTimeout(r, 0))
    expect(grade(Z, 'ST-05')).toBe('dco')
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
  /* students are enrolment ids (10 Sep 26); these two ride the roster so the
     details bubble below can read their NAME off the entry */
  const Z = 'sTESTZ', Y = 'sTESTY'
  const seat = () => {
    for (const [id, name] of [[Z, 'STUDENT Z'], [Y, 'STUDENT Y']])
      if (!core.byName(name)) (core.roster as any).push({ id, name })
  }
  beforeAll(async () => { board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board); await core.init(); seat() })
  afterAll(() => {
    for (const id of [Z, Y]) { const i = core.roster.findIndex((r: any) => r.id === id); if (i >= 0) (core.roster as any).splice(i, 1) }
    board.remove()
  })
  beforeEach(async () => { await drain(); seat(); core.setActive(Z) })
  afterEach(async () => { core.closePop(); await drain() })

  it('+ records a failure on the pop-up’s day — today unless changed — and − takes the latest back', async () => {
    core.openPop('ST-01', at)
    expect(core.popFailDate).toBe(today)
    await core.popFail(1)
    core.popFailDateChanged('2026-08-02')
    await core.popFail(1)
    expect(((core.marks as any)[Z]['ST-01']).f, 'the count the ball’s ticks read').toBe(2)
    expect(core.failDates(Z, 'ST-01')).toEqual([today, '2026-08-02'])
    expect(core.failList(Z).map(x => x.label), 'each failure its own entry').toEqual(['ST-01', 'ST-01X'])
    await core.popFail(-1)
    expect(core.failDates(Z, 'ST-01')).toEqual([today])
    expect(core.failDates(Y, 'ST-01'), 'the other student’s record is untouched').toEqual([])
  })

  it('a count from before days were kept reads as that many undated failures; the notation adds an X per failure', () => {
    ;(core.marks as any)[Z]['ST-03'] = { g: 0, f: 2 }
    expect(core.failDates(Z, 'ST-03')).toEqual([null, null])
    expect(core.failList(Z).filter(x => x.id === 'ST-03').map(x => x.label)).toEqual(['ST-03', 'ST-03X'])
    expect(core.failLabel('ST-03', 2)).toBe('ST-03XX')
    delete (core.marks as any)[Z]['ST-03']
  })

  it('re-dating one failure from the full list is one step per box and leaves the others alone', async () => {
    core.openPop('ST-02', at); await core.popFail(1); await core.popFail(1); core.closePop()
    await core.setFailDate(Z, 'ST-02', 0, '2026-07-01')
    await core.setFailDate(Z, 'ST-02', 0, '2026-07-02')
    expect(core.failDates(Z, 'ST-02')).toEqual(['2026-07-02', today])
    expect(core.undoWhat()).toBe('the date of ST-02 for STUDENT Z')
    await core.doUndo()
    expect(core.failDates(Z, 'ST-02'), 'both keystrokes were one step').toEqual([today, today])
  })

  it('a grade is dated the day it is pressed; the box re-dates it afterwards; Not done drops the day', async () => {
    core.openPop('ST-01', at)
    expect(core.popDoneDate).toBe(today)
    await core.popGrade('dco')
    expect(core.doneDate(Z, 'ST-01')).toBe(today)
    core.openPop('ST-01', at)
    await core.popDoneChanged('2026-08-10')
    expect(core.doneDate(Z, 'ST-01')).toBe('2026-08-10')
    expect(core.undoWhat()).toBe('the date on ST-01 for STUDENT Z')
    core.closePop()
    expect(core.doneDate(Y, 'ST-01'), 'per student').toBeNull()
    core.openPop('ST-01', at)
    expect(core.popDoneDate, 'the box opens on the day already recorded').toBe('2026-08-10')
    await core.popGrade('0')
    expect(core.doneDate(Z, 'ST-01')).toBeNull()
  })

  it('the details bubble carries the student’s own record, and nothing for a student with none', async () => {
    core.openPop('ST-02', at); await core.popFail(1)
    core.openPop('ST-02', at); await core.popGrade('dpco')
    const html = core.markHtml(Z, 'ST-02')
    expect(html).toContain('STUDENT Z')
    expect(html).toContain('DPCO on')
    expect(html).toContain('Failed')
    expect(core.markHtml(Y, 'ST-02')).toBe('')
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
  let board: HTMLElement, A: string, B: string, AN: string, BN: string
  beforeEach(async () => {
    board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board)
    /* The chart engine boots once (App.jsx does this on the tab's first mount);
       the seeded roster is two placeholder students on the first syllabus.
       A student is an enrolment id since 10 Sep 26 — the name is the label on
       the entry, kept here only for the assertion messages. */
    await core.init()
    while (core.canUndo()) await core.doUndo()
    const [ra, rb] = core.roster as any[]
    expect(ra && rb, 'the seed carries two students').toBeTruthy()
    A = ra.id; B = rb.id; AN = ra.name; BN = rb.name
    core.setActive(A)
  })

  it("the rings follow the picked student, not the last one's marks", async () => {
    expect(ringed(), 'nothing done: the first event is the one to plan').toContain('ST-01')
    core.openPop('ST-01', { clientX: 1, clientY: 1 }); await core.popGrade('dco')
    expect(ringed()).not.toContain('ST-01')
    expect(ringed(), 'ST-01 done: what follows it lights up').toContain('ACG-01')

    core.setActive(B)
    expect(core.active).toBe(B)
    expect(ringed(), BN + ' has done nothing — ST-01 is theirs to plan').toContain('ST-01')
    expect(ringed(), 'ACG-01 was ' + AN + "'s next event, not " + BN + "'s").not.toContain('ACG-01')

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

/* 9 Sep 26 (owner: "a person is also linked to the tracker and can be
   selected to be placed in a course"): Raptor's PEOPLE id is the person id
   app-wide. The squadron roster crosses into the Tracker through a third
   no-import bridge (people.js), the + Add dialog offers it above the text
   box, and a pick records a LINK (course → student name → person id) beside
   the student — additive, so a typed name still adds an unlinked student and
   nothing else on screen changes. Same round: a colon is refused in every
   name (it is a storage-key separator), and every mark and date write stamps
   who and when. Spec: docs/superpowers/specs/2026-09-09-schema-hardening-design.md */
describe('the person bridge and the link (peoplewire.ts → people.js → core.js)', () => {
  /* core.js and fileFormat.js are plain JS; TypeScript infers `dlg` as null
     and `course` as never-assigned from their initialisers, so these tests
     read them untyped, as the vendored code itself does */
  const C: any = core, F: any = FMT
  const COLON = "A name can't contain a colon (:), because the app uses it to file the record."
  const at = { clientX: 1, clientY: 1 }
  const tick = () => new Promise(r => setTimeout(r, 0))
  /* dialogs raised after an await (a course rename asks about unsaved edits
     first) come up a microtask later; a file export runs its collectors first */
  const until = async (f: () => any) => { for (let i = 0; i < 500; i++) { if (f()) return; await tick() } throw new Error('timed out waiting for a dialog') }
  const answer = async (v: any) => { await until(() => C.dlg); C.dlgClose(v) }
  const P = [
    { id: 'p1', cs: 'Ranger', seat: 'FCP', q: 'OCU', sxo: false },
    { id: 'p2', cs: 'Bravo', seat: 'RCP', q: 'D', sxo: true },
  ]
  let board: HTMLElement
  beforeAll(async () => {
    board = document.createElement('div'); board.id = 'board'; document.body.appendChild(board); await C.init()
    /* the Find-box tests above leave a flow edit unsaved; a course or syllabus
       rename would ask about it first, and these tests answer ONE question */
    if (C.sylDirty) await C.saveChangesClick()
  })
  afterAll(() => board.remove())
  beforeEach(() => { setPeople(P); setWhoami(null); setFileLocked(false); document.body.querySelectorAll('.host').forEach(h => h.remove()) })

  it('the projection: OCU first, pilots before WSOs, then callsign — no archived, sentinel or ground body, five fields each', () => {
    const l = projectForTracker(PEOPLE)
    expect(l.length).toBeGreaterThan(10)
    for (const p of l) {
      const src = PEOPLE[p.id]
      expect(!!(src.archived || src.special || src.pers || src.seat === 'GND'), p.id + ' should not be offered').toBe(false)
      expect(Object.keys(p)).toEqual(['id', 'cs', 'seat', 'q', 'sxo'])
      expect(p.q, 'q is always a string').toBe(src.q || '')
      expect(p.sxo, 'sxo is always a boolean').toBe(!!src.sxo)
    }
    expect(l.filter(p => p.q === 'OCU').length, 'the demo roster has trainees').toBeGreaterThan(0)
    const rank = (p: any) => [p.q === 'OCU' ? 0 : 1, p.seat === 'FCP' ? 0 : 1]
    for (let i = 1; i < l.length; i++) {
      const a = rank(l[i - 1]), b = rank(l[i])
      const cmp = (a[0] - b[0]) || (a[1] - b[1]) || l[i - 1].cs.localeCompare(l[i].cs)
      expect(cmp, l[i - 1].cs + ' before ' + l[i].cs).toBeLessThanOrEqual(0)
    }
    expect(l[0].q).toBe('OCU'); expect(l[0].seat).toBe('FCP')
    /* an explicit fixture proves each filter on its own */
    const fx = { z: { cs: 'Z', seat: 'RCP', q: 'OCU' }, a: { cs: 'A', seat: 'FCP', q: 'A' }, g: { cs: 'G', seat: 'GND', pers: true, q: '' }, x: { cs: 'X', seat: 'FCP', q: 'A', archived: true }, s: { cs: 'S', seat: 'FCP', q: 'A', special: true, archived: true }, o: { cs: 'O', seat: 'FCP', q: 'OCU', sxo: true } }
    expect(projectForTracker(fx).map(p => p.id)).toEqual(['o', 'z', 'a'])
  })

  it('+ Add offers the roster with the production copy; a pick adds under the callsign, upper-cased, links, and is saved', async () => {
    const p = C.addStudent()
    expect(C.dlg).toMatchObject({ msg: 'Add a crew member', input: true, filter: true, placeholder: 'Or type a callsign', listTitle: 'From the squadron roster' })
    expect(C.dlg.list).toEqual([{ key: 'p1', label: 'Ranger', sub: 'Pilot · OCU' }, { key: 'p2', label: 'Bravo', sub: 'WSO · D' }])
    C.dlgClose({ pick: 'p1' }); await p
    expect(C.roster.map((r: any) => r.name)).toContain('RANGER')
    const r = C.byName('RANGER')!
    expect(C.active).toBe(r.id)
    expect(r.pid, 'the person rides the entry now, not a separate record').toBe('p1')
    expect(C.pidOf(r.id)).toBe('p1')
    expect(C.linkedPerson(r.id)).toEqual(P[0])
    const stored = JSON.parse((await storage.get(`v3:${C.course}:${C.curSyl()}:roster`))!.value)
    expect(stored.find((e: any) => e.name === 'RANGER')).toEqual(r)
    expect(await storage.get('v3:links'), 'no separate links record is written').toBeNull()
    /* picking somebody already here is the silent dedupe of old — one entry */
    const n = C.roster.length
    const q = C.addStudent(); C.dlgClose({ pick: 'p1' }); await q
    expect(C.roster.length).toBe(n)
  })

  it('a + Add pressed while a syllabus switch is still loading lands on the new syllabus, not in the bin', async () => {
    /* CI, 9 Sep 26: loadCourse reads a dozen records with an await between
       each and then replaces the roster array. An add during that window
       pushed onto the OLD array, which the load threw away — a slow runner
       showed it as two adds, one student. Loads are serial now and the roster
       writers wait for them. */
    if (C.sylDirty) await C.saveChangesClick()
    const orig = C.curSyl(); const other = (C.allSylNames() as string[]).find(n => n !== orig)
    expect(other, 'two syllabi to switch between').toBeTruthy()
    /* The unit store answers in a microtask, so an un-slowed load is over
       before anything else runs; in the browser every read crosses the storage
       seam and takes real time. The losing order is: the load has FETCHED the
       new roster, the user finishes + Add (push, save), then the load applies
       the stale roster it fetched — so that is the order staged here. */
    const rosterKey = `v3:${C.course}:${other}:roster`
    const realGet = storage.get; let staged = false
    storage.get = async function (k: string) {
      const r = await realGet.call(storage, k)
      if (!staged && k === rosterKey) { staged = true; C.dlgClose('RACER'); await tick(); await tick(); await tick() }
      return r
    } as any
    try {
      const sw = C.switchSyllabus(other!)          /* NOT awaited: the load is in flight */
      const p = C.addStudent()                     /* the dialog is up; the wrapper answers it */
      await Promise.all([sw, p])
    } finally { storage.get = realGet }
    expect(staged, 'the load read the new roster while the dialog was up').toBe(true)
    expect(C.curSyl()).toBe(other)
    expect(C.roster.map((r: any) => r.name), 'on screen').toContain('RACER')
    const stored = await storage.get(`v3:${C.course}:${other}:roster`)
    expect(JSON.parse(stored!.value).map((e: any) => e.name), 'in the store, under the new syllabus').toContain('RACER')
    /* leave things as the tests around this one expect them */
    const rm = C.removeStudent(C.byName('RACER')!.id); await tick(); C.dlgClose(true); await rm
    expect(C.byName('RACER')).toBeNull()
    await C.switchSyllabus(orig)
    expect(C.curSyl()).toBe(orig)
  })

  it("a syllabus switch that STARTS during a + Add's tail saves the add under the syllabus it began on", async () => {
    /* review, 9 Sep 26: the gate was one-way. The add had passed the gate,
       then a switch flipped the syllabus name mid-tail and the add's later
       saves (marks, dates) keyed on the NEW syllabus while its roster entry
       sat under the OLD one. Loads and roster writes share one queue now. */
    if (C.sylDirty) await C.saveChangesClick()
    const orig = C.curSyl(), other = (C.allSylNames() as string[]).find(n => n !== orig)!
    const rosterKey = `v3:${C.course}:${orig}:roster`
    const realSet = storage.set; let fired = false; let sw: Promise<any> | null = null
    storage.set = async function (k: string, v: string) {
      const r = await realSet.call(storage, k, v)
      if (!fired && k === rosterKey) { fired = true; sw = C.switchSyllabus(other); await tick(); await tick(); await tick() }
      return r
    } as any
    try { const p = C.addStudent(); await tick(); C.dlgClose('RACER'); await p; await sw } finally { storage.set = realSet }
    expect(fired, 'the switch started inside the add').toBe(true)
    const val = async (k: string) => (await storage.get(k))?.value ?? null
    /* the add landed as an ENTRY on the old syllabus; every key below is its id */
    const saved = JSON.parse((await val(rosterKey))!)
    const racer = saved.find((e: any) => e.name === 'RACER')
    expect(racer, 'roster, old syllabus').toBeTruthy()
    expect(await val(`v3:${C.course}:${orig}:m:${racer.id}`), 'marks, old syllabus').toBe('{}')
    expect(JSON.parse((await val(`v3:${C.course}:${orig}:d:${racer.id}`))!), 'dates, old syllabus').toEqual({ lastSyll: null, lastCurr: null })
    expect(await val(`v3:${C.course}:${other}:m:${racer.id}`), 'no marks strayed under the new syllabus').toBeNull()
    expect(JSON.parse((await val(`v3:${C.course}:${other}:roster`)) || '[]').map((e: any) => e.name)).not.toContain('RACER')
    expect(C.curSyl(), 'the switch landed afterwards').toBe(other)
    expect(C.byName('RACER')).toBeNull()
    /* leave things as the tests around this one expect them */
    await C.switchSyllabus(orig)
    const rm = C.removeStudent(C.byName('RACER')!.id); await tick(); C.dlgClose(true); await rm
    expect(C.byName('RACER')).toBeNull()
  })

  it("the by-stamp is omitted when Raptor's whoami is its 'Unknown' placeholder", async () => {
    /* review, 9 Sep 26: HOOKS.whoami defaults to the literal 'Unknown' with no
       session; the bridge contract is '' = omit, so a logged-out mark was
       stamped with a name that names nobody */
    const { HOOKS } = await import('../engine/hooks')
    const { whoamiForTracker } = await import('./peoplewire')
    const real = HOOKS.whoami
    try {
      HOOKS.whoami = () => 'Unknown'; expect(whoamiForTracker()).toBe('')
      HOOKS.whoami = () => 'Bane'; expect(whoamiForTracker()).toBe('Bane')
    } finally { HOOKS.whoami = real }
  })

  it('with no roster handed over — the standalone app — + Add is the old "Student callsign:" prompt, byte for byte', async () => {
    /* owner, 9 Sep 26: the Tracker goes back out to its standalone repo, where
       a student is created by typing a name and nothing feeds people.js. An
       empty list must not draw an empty roster section, a search box or a
       "nobody matches" line over the text box — the dialog is the old prompt */
    setPeople([])
    const Live = () => { useSyncExternalStore(C.subscribe, C.getVersion); return <DlgModal /> }
    const host = document.createElement('div'); host.className = 'host'; document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => { root.render(<Live />) })
    const p = C.addStudent()
    await act(async () => { await tick() })
    expect(C.dlg).toMatchObject({ msg: 'Student callsign:', input: true, filter: false, listTitle: '' })
    expect(C.dlg.list ?? null).toBeNull()
    expect($('#dlgInput')).toBeTruthy(); expect($('#dlgFilter')).toBeNull(); expect($('#dlgList')).toBeNull()
    expect($('#dlgModal')!.textContent).not.toContain('roster')
    expect(($('#dlgInput') as HTMLInputElement).getAttribute('placeholder')).toBeNull()
    await act(async () => { C.dlgClose('solo') }); await p
    expect(C.byName('SOLO'), 'a typed name mints an entry with no person on it').toEqual({ id: expect.stringMatching(/^s/), name: 'SOLO' })
    expect(C.pidOf(C.byName('SOLO')!.id)).toBeNull()
    await act(async () => { root.unmount() }); host.remove()
  })

  it('a corrupt leftover links record cannot break the conversion — the roster survives and the next pick still lands on the entry', async () => {
    /* was the 9 Sep 26 finding that a course whose links value is not a map
       made the next pick throw. That record is retired (10 Sep 26 — the person
       rides the entry), so what has to hold now is that a corrupt one left in
       the store cannot stop the once-per-course conversion or a pick's save. */
    const bad = { [C.course]: 'x', NUM: 7, ARR: ['p1'], OK: { KEEP: 'p2', EMPTY: '', NOTSTR: 3 } }
    await storage.set('v3:links', JSON.stringify(bad))
    await storage.delete(`v3:${C.course}:idmig`)        /* make the migration run again */
    const before = C.roster.map((r: any) => ({ ...r }))
    await C.loadCourse(C.course); await C.whenLoaded()
    expect(C.roster, 'every entry kept its id and its person').toEqual(before)
    expect((await storage.get(`v3:${C.course}:idmig`))!.value, 'and the course is flagged done again').toBe('1')
    const p = C.addStudent(); C.dlgClose({ pick: 'p2' }); await p; await C.whenLoaded()
    expect(C.byName('BRAVO')!.pid).toBe('p2')
    const stored = JSON.parse((await storage.get(`v3:${C.course}:${C.curSyl()}:roster`))!.value)
    expect(stored.find((e: any) => e.name === 'BRAVO')).toEqual(C.byName('BRAVO'))
    /* leave the store as the tests around this one expect it */
    await storage.delete('v3:links')
  })

  it('the dialog draws the search box and the list above the text box, narrows on typing, and a click picks', async () => {
    const Live = () => { useSyncExternalStore(C.subscribe, C.getVersion); return <DlgModal /> }
    const host = document.createElement('div'); host.className = 'host'; document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => { root.render(<Live />) })
    expect($('#dlgModal')).toBeNull()
    /* a plain question is byte-for-byte the old prompt: no list, no filter, no placeholder */
    let p: Promise<any> = C.uiPrompt('Student callsign:')
    await act(async () => { await tick() })
    expect($('#dlgInput')).toBeTruthy(); expect($('#dlgFilter')).toBeNull(); expect($('#dlgList')).toBeNull()
    expect(($('#dlgInput') as HTMLInputElement).getAttribute('placeholder')).toBeNull()
    await act(async () => { C.dlgClose(null) }); await p
    p = C.addStudent()
    await act(async () => { await tick() })
    expect($('#dlgFilter')).toBeTruthy(); expect($('#dlgList')).toBeTruthy(); expect($('#dlgInput')).toBeTruthy()
    expect(($('#dlgInput') as HTMLInputElement).placeholder).toBe('Or type a callsign')
    expect($('#dlgModal')!.textContent).toContain('From the squadron roster')
    const order = [...$('#dlgModal')!.querySelectorAll('#dlgList, #dlgInput')].map(e => e.id)
    expect(order, 'list above the text box').toEqual(['dlgList', 'dlgInput'])
    const items = () => [...document.querySelectorAll('#dlgList button.dlg-item')].map(b => (b as HTMLElement).dataset.key)
    expect(items()).toEqual(['p1', 'p2'])
    expect($('#dlgList .dlg-item[data-key="p2"]')!.textContent).toContain('Bravo')
    expect($('#dlgList .dlg-item[data-key="p2"]')!.textContent).toContain('WSO · D')
    const { fireEvent } = await import('@testing-library/react')
    await act(async () => { fireEvent.change($('#dlgFilter')!, { target: { value: 'bra' } }) })
    expect(items()).toEqual(['p2'])
    await act(async () => { ($('#dlgList .dlg-item[data-key="p2"]') as HTMLElement).click() })
    expect(await p).toBeUndefined()
    expect(C.roster.map((r: any) => r.name)).toContain('BRAVO')
    expect(C.pidOf(C.byName('BRAVO')!.id)).toBe('p2')
    expect($('#dlgModal')).toBeNull()
    await act(async () => { root.unmount() }); host.remove()
  })

  it("a linked student's chip says so; an unlinked one is untouched", async () => {
    const host = document.createElement('div'); host.className = 'host'; document.body.appendChild(host)
    const root = createRoot(host)
    await act(async () => { root.render(<SidePanel zoom={1} />) })
    const chip = $('.c-students .chip.linked') as HTMLElement
    expect(chip).toBeTruthy()
    expect(chip.title).toBe('On the squadron roster as Ranger')
    expect(chip.textContent).toContain('RANGER')
    expect(document.querySelectorAll('.c-students .chip.linked').length).toBe(2)
    const plain = [...document.querySelectorAll('.c-students .chip:not(.linked)')] as HTMLElement[]
    expect(plain.length).toBeGreaterThan(0)
    for (const c of plain) expect(c.getAttribute('title')).toBeNull()
    await act(async () => { root.unmount() }); host.remove()
  })

  it('a typed callsign still adds an unlinked crew member, exactly as before', async () => {
    const n = C.roster.length
    const p = C.addStudent(); C.dlgClose('  visitor '); await p
    expect(C.roster.map((r: any) => r.name)).toContain('VISITOR'); expect(C.roster.length).toBe(n + 1)
    const v = C.byName('VISITOR')!
    expect(v.pid).toBeUndefined()
    expect(C.pidOf(v.id)).toBeNull()
    expect(C.linkedPerson(v.id)).toBeNull()
    const q = C.addStudent(); C.dlgClose(null); await q
    expect(C.roster.length, 'cancel adds nobody').toBe(n + 1)
  })

  it('a colon is still refused for a course and a syllabus — but a student name is only a label now', async () => {
    /* 10 Sep 26: a student's name stopped being a segment of the storage key
       (the enrolment id is), so a colon in it is accepted and files nothing
       anywhere odd. Course and syllabus names ARE still key segments, and are
       still refused at every typing point with the one message. */
    const p: Promise<any> = C.addStudent(); await answer('A:B'); await p; await C.whenLoaded()
    const ab = C.byName('A:B')!
    expect(ab, 'a colon in a student name is a label, not a key').toBeTruthy()
    expect((await storage.get(`v3:${C.course}:${C.curSyl()}:m:${ab.id}`))!.value, 'their marks file under the id').toBe('{}')
    const seen: string[] = []
    const refuse = async (start: () => Promise<any>, typed: string) => {
      const q = start(); await answer(typed)
      await until(() => C.dlg); seen.push(C.dlg.msg); expect(C.dlg.cancel, 'an alert, not a question').toBe(false)
      C.dlgClose(true); await q
    }
    const course = C.course, courses = C.COURSES.slice()
    await refuse(C.addCourse, '26:X'); expect(C.COURSES).toEqual(courses)
    await refuse(C.renCourse, '26:X'); expect(C.course).toBe(course); expect(C.COURSES).toEqual(courses)
    const syl = C.curSyl(), syls = C.allSylNames().slice()
    await refuse(C.addSyl, 'New:syl'); expect(C.allSylNames()).toEqual(syls)
    await refuse(C.renSyl, 'x:y'); expect(C.curSyl()).toBe(syl); expect(C.allSylNames()).toEqual(syls)
    expect(seen).toEqual([COLON, COLON, COLON, COLON])
    /* leave the roster as the tests around this one expect it */
    const rm = C.removeStudent(ab.id); await answer(true); await rm
  })

  it('Duplicate syllabus and Import “Add as new” refuse a colon too', async () => {
    /* review, 9 Sep 26: the two syllabus-creating paths the colon guard missed —
       a colon name written here made the user's own Export refuse the store */
    const syls = C.allSylNames().slice(), seen: string[] = []
    const alert = async () => { await until(() => C.dlg && C.dlg.cancel === false); seen.push(C.dlg.msg); C.dlgClose(true) }
    const q = C.dupSyl(); await answer('dup:x'); await alert(); await q
    expect(C.allSylNames()).toEqual(syls)
    /* a chart whose name is already here asks replace / add as new; the new name carries the colon */
    const name = C.curSyl()
    const charts: any = { order: [name], syllabi: { [name]: [{ id: 'ST-01', type: 'acad', prereqs: [] }] }, layouts: {}, eventInfo: {} }
    ;(window as any).__pickOpenForTests = async () => ({ name: 'x.json', text: JSON.stringify(FMT.buildFile({ savedAt: 'x', charts })) })
    try {
      const p = C.importClick()
      await until(() => C.dlg && /already exists/.test(C.dlg.msg)); C.dlgClose('__alt__')     /* Add as new */
      await answer('new:x')
      await alert()                                                                          /* the refusal … */
      await until(() => C.dlg); seen.push(C.dlg.msg); C.dlgClose(true); await p              /* … then the closing report */
    } finally { delete (window as any).__pickOpenForTests }
    expect(C.allSylNames()).toEqual(syls)
    expect(seen).toEqual([COLON, COLON, 'Nothing was brought in.'])
  })

  it('a student rename changes only the label — the enrolment id, the person link and the id-keyed records stay put', async () => {
    /* 10 Sep 26: the whole point of the enrolment id is that the name is just
       a label. A rename must move nothing in storage but the roster entry's
       own name; every record still files under the id. */
    let p: Promise<any> = C.addStudent(); C.dlgClose({ pick: 'p1' }); await p; await C.whenLoaded()
    const before = C.byName('RANGER')!                 /* on the course, linked to p1 */
    const markKey = `v3:${C.course}:${C.curSyl()}:m:${before.id}`
    const marksVal = (await storage.get(markKey))!.value
    p = C.renameStudent(before.id); await answer('viper'); await p; await C.whenLoaded()
    const after = C.byName('VIPER')!
    expect(C.byName('RANGER'), 'the old label is gone').toBeNull()
    expect(after.id, 'the same enrolment id').toBe(before.id)
    expect(after.pid, 'still linked to the same person').toBe('p1')
    expect(C.linkedPerson(after.id)).toEqual(P[0])
    const stored = JSON.parse((await storage.get(`v3:${C.course}:${C.curSyl()}:roster`))!.value)
    expect(stored.find((r: any) => r.id === before.id).name, 'the roster carries the new label under the same id').toBe('VIPER')
    expect((await storage.get(markKey))!.value, 'the id-keyed mark record is untouched').toBe(marksVal)
    expect(await storage.get(`v3:${C.course}:${C.curSyl()}:m:VIPER`), 'nothing is filed under the label').toBeNull()
    /* rename back so the neighbouring tests still find RANGER */
    p = C.renameStudent(after.id); await answer('ranger'); await p; await C.whenLoaded()
    expect(C.byName('RANGER')!.id).toBe(before.id)
  })

  it('a rename is refused when another student on the course already has that name', async () => {
    /* two enrolments sharing a name is the ambiguity + Add refuses — byName and
       the dropdown would resolve one of them at random. Checked course-wide. */
    let p: Promise<any> = C.addStudent(); await answer('renalpha'); await p; await C.whenLoaded()
    p = C.addStudent(); await answer('renbravo'); await p; await C.whenLoaded()
    const a = C.byName('RENALPHA')!, b = C.byName('RENBRAVO')!
    p = C.renameStudent(a.id); await answer('renbravo')
    await until(() => C.dlg && C.dlg.cancel === false)
    expect(C.dlg.msg, 'an alert, not a question').toMatch(/already on this course/)
    C.dlgClose(true); await p; await C.whenLoaded()
    expect(C.byName('RENALPHA')!.id, 'the rename was refused; the old name stands').toBe(a.id)
    expect(C.byName('RENBRAVO')!.id, 'and the other student is untouched').toBe(b.id)
    let rm = C.removeStudent(a.id); await answer(true); await rm
    rm = C.removeStudent(b.id); await answer(true); await rm
  })

  it('a student rename may carry a colon (a label, not a key); blank, unchanged and cancelled are no-ops', async () => {
    let p: Promise<any> = C.addStudent(); await answer('rentemp'); await p; await C.whenLoaded()
    const t = C.byName('RENTEMP')!
    p = C.renameStudent(t.id); await answer('a:b'); await p; await C.whenLoaded()   /* colon accepted */
    expect(C.byName('A:B')!.id, 'a colon in a student label is fine').toBe(t.id)
    for (const v of [null, '   ', 'A:B', 'a:b']) { p = C.renameStudent(t.id); await answer(v); await p; await C.whenLoaded() }
    expect(C.roster.filter((r: any) => r.id === t.id).length, 'still exactly one entry').toBe(1)
    expect(C.byName('A:B')!.id, 'unchanged').toBe(t.id)
    const rm = C.removeStudent(t.id); await answer(true); await rm
  })

  it('a rename is NOT admin-gated — it works while the file portion is locked (everyone edits)', async () => {
    let p: Promise<any> = C.addStudent(); await answer('renlock'); await p; await C.whenLoaded()
    const l = C.byName('RENLOCK')!
    setFileLocked(true)
    p = C.renameStudent(l.id); await answer('renfree'); await p; await C.whenLoaded()
    expect(C.byName('RENFREE')!.id, 'the file lock gates Import/Export, not editing students').toBe(l.id)
    setFileLocked(false)
    const rm = C.removeStudent(l.id); await answer(true); await rm
  })

  it('a rename keeps every chart of the course in step — one enrolment reads one label on all its syllabi', async () => {
    /* findEnrolment relies on every chart agreeing on the name; a person can be
       on several syllabi under one id, so a rename must reach them all. */
    const origSyl = C.curSyl()
    let p: Promise<any> = C.addStudent(); await answer('rensync'); await p; await C.whenLoaded()
    const id = C.byName('RENSYNC')!.id
    p = C.dupSyl(); await answer(origSyl + ' copy'); await p; await C.whenLoaded()
    expect(C.curSyl(), 'now on the copy').toBe(origSyl + ' copy')
    expect(C.byName('RENSYNC')!.id, 'the same enrolment rode across to the copy').toBe(id)
    p = C.renameStudent(id); await answer('rensynced'); await p; await C.whenLoaded()
    const labelOn = (k: string) => storage.get(`v3:${C.course}:${k}:roster`).then((v: any) => JSON.parse(v.value).find((r: any) => r.id === id)?.name)
    expect(await labelOn(origSyl + ' copy'), 'the visible chart').toBe('RENSYNCED')
    expect(await labelOn(origSyl), 'and the other syllabus the id sits on').toBe('RENSYNCED')
    p = C.delSyl(); await answer(true); await p; await C.whenLoaded()      /* drop the copy, back to the source */
    expect(C.curSyl()).toBe(origSyl)
    const rm = C.removeStudent(id); await answer(true); await rm
  })

  it('removing the student takes their entry with them; renaming the course carries the id and the person on it', async () => {
    const ranger = C.byName('RANGER')!, bravo = C.byName('BRAVO')!
    let p: Promise<any> = C.removeStudent(ranger.id); await answer(true); await p
    expect(C.roster.map((r: any) => r.name)).not.toContain('RANGER')
    expect(C.byName('RANGER')).toBeNull()
    const old = C.course
    p = C.renCourse(); await answer('LINKTEST'); await p
    expect(C.course).toBe('LINKTEST')
    /* the moved keys carry the ID, and the person survives on the entry */
    expect(C.byName('BRAVO')!.id, 'the same enrolment, under the new course name').toBe(bravo.id)
    expect(C.byName('BRAVO')!.pid).toBe('p2')
    expect((await storage.get(`v3:LINKTEST:${C.curSyl()}:m:${bravo.id}`)), 'their marks moved under the id').toBeTruthy()
    expect(C.linkedPerson(bravo.id)).toEqual(P[1])
    p = C.renCourse(); await answer(old); await p
    expect(C.course).toBe(old)
    expect(C.byName('BRAVO')!.pid).toBe('p2')
    expect(await storage.get('v3:links'), 'and no separate links record was ever written back').toBeNull()
  })

  it('every mark and date write stamps who and when; undo restores the earlier stamp verbatim', async () => {
    const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
    while (C.canUndo()) await C.doUndo()
    setWhoami(() => 'Tester')
    const B = C.byName('BRAVO')!.id           /* a student is an enrolment id */
    C.setActive(B)
    C.openPop('ST-01', at); await C.popGrade('dco')
    const m1 = { ...(C.marks as any)[B]['ST-01'] }
    expect(m1.by).toBe('Tester'); expect(m1.at).toMatch(ISO)
    await new Promise(r => setTimeout(r, 5))
    setWhoami(() => 'Second')
    C.openPop('ST-01', at); await C.popFail(1)
    const m2 = (C.marks as any)[B]['ST-01']
    expect(m2.by).toBe('Second'); expect(m2.at).toMatch(ISO); expect(m2.at).not.toBe(m1.at)
    await C.doUndo()
    expect((C.marks as any)[B]['ST-01']).toEqual(m1)
    await C.doRedo()
    expect((C.marks as any)[B]['ST-01']).toEqual(m2)
    /* the two date writers on the mark, then the four on the dates record */
    await C.setDoneDate(B, 'ST-01', '2026-08-10')
    expect((C.marks as any)[B]['ST-01'].by).toBe('Second')
    await C.setFailDate(B, 'ST-01', 0, '2026-08-11')
    expect((C.marks as any)[B]['ST-01'].at).not.toBe(m2.at)
    ;(C.dates as any)[B] = { lastSyll: null, lastCurr: null }
    await C.setLastCurr(B, '2026-01-05')
    expect((C.dates as any)[B]).toMatchObject({ lastCurr: '2026-01-05', by: 'Second' })
    expect((C.dates as any)[B].at).toMatch(ISO)
    /* nobody wired: `by` is omitted, never an empty name */
    setWhoami(null)
    await C.setDownDays(B, '2')
    expect((C.dates as any)[B].downDays).toBe('2')
    expect('by' in (C.dates as any)[B]).toBe(false)
    expect((C.dates as any)[B].at).toMatch(ISO)
    await C.setUpchit(B, '2026-02-01'); await C.setLastSyll(B, '2026-01-06')
    expect((C.dates as any)[B]).toMatchObject({ upchit: '2026-02-01', lastSyll: '2026-01-06', lastCurr: '2026-01-06' })
    while (C.canUndo()) await C.doUndo()
  })

  it('Export carries the person on the entry; a LEGACY file’s string roster and links block import as entries with a pid', async () => {
    let text = ''
    ;(window as any).__pickSaveForTests = async (name: string) => ({ name, createWritable: async () => ({ write: async (t: string) => { text = t }, close: async () => {} }) })
    C.openCopy(); C.setCopyOpt('students', true)
    let p: Promise<any> = C.saveCopyClick(); await answer(true); await p
    let f = JSON.parse(text)
    expect(f.contains).toEqual({ charts: true, students: true, links: false })
    expect('links' in f, 'the separate links record is gone from the file').toBe(false)
    const syl = C.curSyl()
    const out = f.students.byCourse[C.course].bySyllabus[syl].roster
    expect(out.find((e: any) => e.name === 'BRAVO')).toEqual({ id: C.byName('BRAVO')!.id, name: 'BRAVO', pid: 'p2' })
    /* charts only: no names, no people */
    C.openCopy(); p = C.saveCopyClick(); await answer(true); await p
    f = JSON.parse(text)
    expect(f.contains.students).toBe(false); expect(f.contains.links).toBe(false); expect('students' in f).toBe(false)
    delete (window as any).__pickSaveForTests

    /* a file written BEFORE stable ids: a string roster and a links block
       beside it. The converter lands both as entries carrying their pid —
       and drops a link naming somebody who is on no roster of that course. */
    const students = { courses: ['LINKIMP'], byCourse: { LINKIMP: { plan: { sylName: syl }, lulls: {}, pace: {}, bySyllabus: { [syl]: { roster: ['ALPHA'], marks: {}, dates: {} } } } } }
    const links = { LINKIMP: { ALPHA: 'p1', GHOST: 'p2' } }
    const feed = () => { (window as any).__pickOpenForTests = async () => ({ name: 'x.json', text: JSON.stringify(F.buildFile({ students, links, savedAt: 'x' })) }) }
    feed(); p = C.importClick()
    await until(() => C.dlg && /students and marks/.test(C.dlg.msg)); C.dlgClose(false)
    await until(() => C.dlg && /Nothing was brought in/.test(C.dlg.msg)); C.dlgClose(true); await p
    expect(C.COURSES).not.toContain('LINKIMP')
    expect(await storage.get(`v3:LINKIMP:${syl}:roster`), 'nothing was written on the "no" path').toBeNull()
    feed(); p = C.importClick()
    await until(() => C.dlg && /students and marks/.test(C.dlg.msg)); C.dlgClose(true)
    await until(() => C.dlg && /restored/.test(C.dlg.msg)); C.dlgClose(true); await p
    expect(C.COURSES).toContain('LINKIMP')
    const r = JSON.parse((await storage.get(`v3:LINKIMP:${syl}:roster`))!.value)
    expect(r, 'GHOST is on no roster of that course').toEqual([{ id: expect.stringMatching(/^s/), name: 'ALPHA', pid: 'p1' }])
    expect((await storage.get('v3:LINKIMP:idmig'))!.value, 'the imported course is already id-keyed').toBe('1')
    delete (window as any).__pickOpenForTests
  })

  it('TrackerPage wires the bridge once; an unrelated Raptor notify is a no-op; the chunk never imports the engine', () => {
    wireTrackerPeople()
    const first = getPeople()
    expect(first).toEqual(projectForTracker(PEOPLE))
    let n = 0
    const off = C.subscribe(() => { n++ })
    raptorNotify()
    expect(getPeople(), 'same roster, same array').toBe(first)
    expect(n, 'and the Tracker was not told').toBe(0)
    wireTrackerPeople(); raptorNotify()
    expect(n, 'a second wire is not a second subscriber').toBe(0)
    off()
    const page = readFileSync(join(__dirname, 'TrackerPage.tsx'), 'utf8')
    expect(page).toMatch(/from '\.\/peoplewire'/)
    expect(page).toMatch(/wireTrackerPeople\(\)/)
    /* people.js is import-free like role.js, and the lazy chunk reaches Raptor
       through it alone — nothing under app/ or components/ imports the wire,
       the engine or the store */
    expect(readFileSync(join(__dirname, 'people.js'), 'utf8')).not.toMatch(/^\s*import /m)
    for (const dir of ['app', 'components']) {
      for (const f of readdirSync(join(__dirname, dir))) {
        if (!/\.(jsx?|tsx?)$/.test(f) || /\.test\./.test(f)) continue
        const src = readFileSync(join(__dirname, dir, f), 'utf8')
        expect(src, dir + '/' + f).not.toMatch(/from '[^']*(peoplewire|\/engine\/|\/state\/)/)
      }
    }
  })

  /* 10 Sep 26: the enrolment belongs to the COURSE, and a chart being hidden
     does not un-enrol anybody. + Add looked at the VISIBLE syllabi only, so a
     student sitting on a hidden chart earned a second id — and their pace and
     lull periods, which hang off the course, would have split away from it. */
  it('+ Add reuses the enrolment of somebody who is only on a HIDDEN chart, rather than minting a second id', async () => {
    setPeople(P)
    const syl = C.curSyl()
    const other = (C.allSylNames() as string[]).find((n: string) => n !== syl)!
    const entry = { id: 'sHIDDENONE', name: 'RANGER', pid: 'p1' }
    await storage.set(`v3:${C.course}:${other}:roster`, JSON.stringify([entry]))
    ;(C.SYL_HIDDEN as string[]).push(other)
    try {
      const n = C.roster.length
      const p = C.addStudent(); C.dlgClose({ pick: 'p1' }); await p; await C.whenLoaded()
      const r = C.byName('RANGER')!
      expect(r.id, 'the same enrolment, not a second one').toBe(entry.id)
      expect(C.roster.length, 'one new row on this chart, one enrolment across the course').toBe(n + 1)
      expect(C.active).toBe(entry.id)
    } finally {
      ;(C.SYL_HIDDEN as string[]).splice((C.SYL_HIDDEN as string[]).indexOf(other), 1)
      await storage.delete(`v3:${C.course}:${other}:roster`)
      const rm = C.removeStudent(entry.id); await answer(true); await rm
    }
  })

  it('+ Add mints an entry: a typed name has no pid, a picked person carries theirs; same name or same person is not added twice', async () => {
    setPeople(P)
    let p = C.addStudent(); C.dlgClose({ pick: 'p1' }); await p; await C.whenLoaded()
    const r = C.byName('RANGER')!
    expect(r).toEqual({ id: expect.stringMatching(/^s/), name: 'RANGER', pid: 'p1' })
    expect(C.active).toBe(r.id); expect(C.linkedPerson(r.id)).toEqual(P[0])
    p = C.addStudent(); C.dlgClose('solo'); await p; await C.whenLoaded()
    expect(C.byName('SOLO')).toEqual({ id: expect.stringMatching(/^s/), name: 'SOLO' })
    const n = C.roster.length
    p = C.addStudent(); C.dlgClose({ pick: 'p1' }); await p; await C.whenLoaded()
    p = C.addStudent(); C.dlgClose('SOLO'); await p; await C.whenLoaded()
    expect(C.roster.length).toBe(n)
    expect((await storage.get('v3:' + C.course + ':' + C.curSyl() + ':m:' + r.id))!.value).toBe('{}')
    expect(await storage.get('v3:' + C.course + ':' + C.curSyl() + ':m:RANGER')).toBeNull()
  })

  /* 10 Sep 26, the stable-ids round: a student is no longer their typed name.
     A roster entry is { id, name, pid? } and every per-student record files
     under the id, so a browser that already holds name-keyed data has to be
     converted — once per course, at the load — and the old links record folds
     into the entry's pid. */
  it('existing data converts once per course: names become entries, records re-file under the id, links fold into pid, old keys go', async () => {
    const c = 'MIGR'
    /* MIGR is a fixture course, and loading it rewrites module state the tests
       after this one read: it goes onto COURSES, its own custom chart is
       ADOPTED into the GLOBAL customs store (loadCourseNow copies v3:MIGR:syls
       into v3:master:syls), and the course list in the store is replaced. Put
       all four back in a finally — a phantom course or a phantom chart
       inherited by a later test is a failure nobody would read as this one's. */
    const prevCourse = C.course, prevCourses = (C.COURSES as string[]).slice()
    const prevHidden = (C.SYL_HIDDEN as string[]).slice()
    const prevList = (await storage.get('v3:courses'))?.value ?? null
    const prevCustoms = (await storage.get('v3:master:syls'))?.value ?? null
    /* the fixture writes a links record and migrateIds delKeys it again */
    const prevLinks = (await storage.get('v3:links'))?.value ?? null
    try {
      await storage.set('v3:courses', JSON.stringify([c]))
      await storage.set('v3:' + c + ':rostermig', '1')
      await storage.set('v3:' + c + ':plan', JSON.stringify({ sylName: '2026', custom: false }))
      await storage.set('v3:' + c + ':2026:roster', JSON.stringify(['ALPHA', 'BRAVO']))
      await storage.set('v3:' + c + ':2026:m:ALPHA', JSON.stringify({ 'ST-01': { g: 'dco' } }))
      await storage.set('v3:' + c + ':2026:d:BRAVO', JSON.stringify({ lastSyll: '2026-01-02', lastCurr: null }))
      await storage.set('v3:' + c + ':pace:ALPHA', JSON.stringify({ epw: '4' }))
      await storage.set('v3:' + c + ':lulls:ALPHA', JSON.stringify([{ start: '2026-03-01', end: '2026-03-02' }]))
      await storage.set('v3:' + c + ':last:ALPHA', JSON.stringify({ syl: '2026', event: 'ST-01' }))
      await storage.set('v3:' + c + ':lastStudent', 'BRAVO')   /* the SECOND entry, so a fallback to the first cannot pass */
      await storage.set('v3:links', JSON.stringify({ [c]: { ALPHA: 'p1' } }))
      /* Two charts the LIVE module state cannot see at init: a custom one that
         only exists in this course's own store (CUSTOMS is empty until a course
         is opened) and a built-in somebody has hidden (allSylNames drops it).
         Both carry crew, and the course is flagged converted for good — so if
         the migration reads anything but the store, their names are lost. */
      const hidden = (C.SYL_NAMES as string[]).find((n: string) => n !== '2026')!
      ;(C.SYL_HIDDEN as string[]).push(hidden)
      await storage.set('v3:' + c + ':syls', JSON.stringify({ 'CUSTOM CHART': [{ id: 'ST-01', type: 'acad', prereqs: [] }] }))
      await storage.set('v3:' + c + ':CUSTOM CHART:roster', JSON.stringify(['CHARLIE']))
      await storage.set('v3:' + c + ':CUSTOM CHART:m:CHARLIE', JSON.stringify({ 'ST-01': { g: 'dpco' } }))
      await storage.set('v3:' + c + ':' + hidden + ':roster', JSON.stringify(['DELTA']))
      await storage.set('v3:' + c + ':' + hidden + ':m:DELTA', JSON.stringify({ 'ST-01': { g: 'marg' } }))
      /* the init path, verbatim: a course in the list that this boot has never
         opened, so nothing of its own is in memory */
      ;(C.COURSES as string[]).push(c)
      await C.migrateAllCourses()
      const entryOn = async (syl: string, name: string) => {
        const r = JSON.parse((await storage.get(`v3:${c}:${syl}:roster`))!.value)
        return r.find((e: any) => e && e.name === name) || null
      }
      const ch = await entryOn('CUSTOM CHART', 'CHARLIE')
      expect(ch, 'a chart only the store knows about converts too').toEqual({ id: expect.stringMatching(/^s/), name: 'CHARLIE' })
      expect((await storage.get(`v3:${c}:CUSTOM CHART:m:${ch.id}`))!.value).toContain('dpco')
      expect(await storage.get(`v3:${c}:CUSTOM CHART:m:CHARLIE`)).toBeNull()
      const de = await entryOn(hidden, 'DELTA')
      expect(de, 'a hidden built-in chart converts too').toEqual({ id: expect.stringMatching(/^s/), name: 'DELTA' })
      expect((await storage.get(`v3:${c}:${hidden}:m:${de.id}`))!.value).toContain('marg')
      expect(await storage.get(`v3:${c}:${hidden}:m:DELTA`)).toBeNull()
      ;(C.SYL_HIDDEN as string[]).splice((C.SYL_HIDDEN as string[]).indexOf(hidden), 1)
      await C.loadCourse(c); await C.whenLoaded()
      const a = C.byName('ALPHA')!, b = C.byName('BRAVO')!
      expect(a).toEqual({ id: expect.stringMatching(/^s/), name: 'ALPHA', pid: 'p1' }); expect(b).toEqual({ id: expect.stringMatching(/^s/), name: 'BRAVO' })
      expect(C.gradeOf(a.id, 'ST-01')).toBe('dco'); expect(C.dates[b.id].lastSyll).toBe('2026-01-02')
      expect(C.paceOf(a.id).epw).toBe('4'); expect(C.lulls[a.id].length).toBe(1)
      expect((await storage.get('v3:' + c + ':2026:m:' + a.id))!.value).toContain('dco')
      for (const k of ['2026:m:ALPHA', '2026:d:BRAVO', 'pace:ALPHA', 'lulls:ALPHA', 'last:ALPHA']) expect(await storage.get('v3:' + c + ':' + k), k).toBeNull()
      expect((await storage.get('v3:' + c + ':lastStudent'))!.value).toBe(b.id)
      expect((await storage.get('v3:' + c + ':idmig'))!.value).toBe('1')
      expect(JSON.parse((await storage.get('v3:links'))?.value || '{}')[c]).toBeUndefined()
      expect(C.active, 'the migrating load lands on the last-graded student, not the top of the list').toBe(b.id)
    } finally {
      ;(C.SYL_HIDDEN as string[]).splice(0, (C.SYL_HIDDEN as string[]).length, ...prevHidden)
      ;(C.COURSES as string[]).splice(0, (C.COURSES as string[]).length, ...prevCourses)
      if (prevList == null) await storage.delete('v3:courses'); else await storage.set('v3:courses', prevList)
      if (prevCustoms == null) await storage.delete('v3:master:syls'); else await storage.set('v3:master:syls', prevCustoms)
      if (prevLinks == null) await storage.delete('v3:links'); else await storage.set('v3:links', prevLinks)
      /* the reload is what puts CUSTOMS, the roster, the marks and the undo
         history back to the course the tests around this one work on */
      await C.loadCourse(prevCourse); await C.whenLoaded()
    }
  })

  /* 10 Sep 26, the stable-ids round, the remaining pins. The enrolment id is
     the record's key everywhere a student is filed, and the name is a label
     read off the roster entry — so these walk the surfaces where the two used
     to be the same thing: one mark and its undo step, a removal, a course
     rename, a syllabus duplicate, a second load, a legacy file coming in, an
     interrupted conversion, a course nobody has opened since the upgrade, and
     the one-enrolment-per-person-per-course rule. */
  it('a mark files under the id, never the name; undo carries the id and the tooltip reads the name', async () => {
    let r = C.byName('SOLO')
    if (!r) { const p = C.addStudent(); C.dlgClose('solo'); await p; await C.whenLoaded(); r = C.byName('SOLO')! }
    C.setActive(r.id); C.openPop('ST-01', { clientX: 0, clientY: 0 }); await C.popGrade('dco')
    expect(C.gradeOf(r.id, 'ST-01')).toBe('dco')
    expect(JSON.parse((await storage.get(`v3:${C.course}:${C.curSyl()}:m:${r.id}`))!.value)['ST-01'].g).toBe('dco')
    expect(await storage.get(`v3:${C.course}:${C.curSyl()}:m:SOLO`), 'nothing is filed under the name').toBeNull()
    expect(C.undoWhat(), 'the step carries the id; the tooltip reads the name off the entry').toMatch(/for SOLO$/)
    await C.doUndo(); expect(C.gradeOf(r.id, 'ST-01')).toBe(0)
  })

  it('removing a student drops the id-keyed records and prunes their undo steps', async () => {
    const r = C.byName('SOLO')!; C.setActive(r.id)
    /* this pin owns its own precondition rather than inheriting an empty stack
       from the one above it: drain first, so the only step in the history when
       the removal runs is the one this test just made for this student */
    while (C.canUndo()) await C.doUndo()
    C.openPop('ST-01', { clientX: 0, clientY: 0 }); await C.popGrade('dco')
    expect(C.canUndo(), 'a step to prune').toBe(true)
    const p = C.removeStudent(r.id); C.dlgClose(true); await p; await C.whenLoaded()
    expect(C.byName('SOLO')).toBeNull(); expect((C.marks as any)[r.id]).toBeUndefined()
    /* the store deletes for real here (storage.js has its own delete), so a
       dropped record reads back as null rather than as delKey's '' tombstone */
    for (const k of [C.curSyl() + ':m:' + r.id, C.curSyl() + ':d:' + r.id, 'pace:' + r.id, 'lulls:' + r.id, 'last:' + r.id])
      expect(await storage.get('v3:' + C.course + ':' + k), k).toBeNull()
    expect(C.canUndo(), 'their step went with them — an Undo cannot mark nobody’s chart').toBe(false)
  })

  it('a course rename and a syllabus duplicate move and copy the id-keyed records; the pid rides along', async () => {
    if (C.sylDirty) await C.saveChangesClick()   /* these tests answer ONE question per dialog */
    let p: Promise<any> = C.addStudent(); C.dlgClose({ pick: 'p2' }); await p; await C.whenLoaded()
    const b = C.byName('BRAVO')!; C.setActive(b.id)
    C.openPop('ST-01', { clientX: 0, clientY: 0 }); await C.popGrade('dco')
    const old = C.course, syl = C.curSyl()
    p = C.renCourse(); await answer('IDTEST'); await p; await C.whenLoaded()
    expect(C.course).toBe('IDTEST')
    expect(C.byName('BRAVO')).toEqual(b)                                   // same id, same pid, on the renamed course
    expect(C.gradeOf(b.id, 'ST-01')).toBe('dco')
    expect((await storage.get('v3:IDTEST:' + syl + ':m:' + b.id))!.value).toContain('dco')
    expect(await storage.get('v3:' + old + ':' + syl + ':m:' + b.id), 'a rename MOVES the record, it does not leave a copy behind').toBeNull()
    expect((await storage.get('v3:IDTEST:idmig'))!.value).toBe('1')
    p = C.dupSyl(); await answer(syl + ' copy'); await p; await C.whenLoaded()
    expect(C.curSyl()).toBe(syl + ' copy')
    expect(C.byName('BRAVO')).toEqual(b); expect(C.gradeOf(b.id, 'ST-01')).toBe('dco')
    expect((await storage.get('v3:IDTEST:' + syl + ' copy:m:' + b.id))!.value).toContain('dco')
    p = C.delSyl(); await answer(true); await p; await C.whenLoaded()
    /* delSyl lands on firstSylName(), which is the source chart here but is not
       promised to be — put the picker back on it so the checks below read the
       roster this test built */
    if (C.curSyl() !== syl) { await C.switchSyllabus(syl); await C.whenLoaded() }
    p = C.renCourse(); await answer(old); await p; await C.whenLoaded()
    expect(C.course).toBe(old); expect(C.byName('BRAVO')).toEqual(b)
  })

  it('the migration is a no-op on a second load, and an entry roster written by an import is left alone', async () => {
    const before = JSON.stringify(C.roster); await C.loadCourse(C.course); await C.whenLoaded()
    expect(JSON.stringify(C.roster)).toBe(before)
  })

  it('a legacy export (string roster + links block) imports as entries with pids; a new export carries no links block', async () => {
    await C.applyStudents({ courses: ['LEG'], byCourse: { LEG: { plan: { sylName: '2026' }, lulls: {}, pace: {}, bySyllabus: { '2026': { roster: ['ALPHA'], marks: { ALPHA: { 'ST-01': { g: 'dco' } } }, dates: {} } } } } }, { LEG: { ALPHA: 'p1' } })
    await C.loadCourse('LEG'); await C.whenLoaded()
    const a = C.byName('ALPHA')!; expect(a.pid).toBe('p1'); expect(C.gradeOf(a.id, 'ST-01')).toBe('dco')
    const out = await C.collectStudents()
    expect(out.byCourse.LEG.bySyllabus['2026'].roster[0]).toEqual(a)
    expect(Object.keys(out.byCourse.LEG.bySyllabus['2026'].marks)).toEqual([a.id])
    expect(FMT.buildFile({ students: out, savedAt: 'x' }).contains.links, 'the separate links block is retired').toBe(false)
  })

  it('an interrupted migration loses nothing and finishes on the next load (review finding 1)', async () => {
    const c = 'HALF'
    ;(C.COURSES as string[]).push(c); await storage.set('v3:courses', JSON.stringify(C.COURSES))
    await storage.set('v3:' + c + ':rostermig', '1'); await storage.set('v3:' + c + ':plan', JSON.stringify({ sylName: '2026', custom: false }))
    await storage.set('v3:' + c + ':2026:roster', JSON.stringify(['ALPHA', 'BRAVO']))
    await storage.set('v3:' + c + ':2026:m:ALPHA', JSON.stringify({ 'ST-01': { g: 'dco' } }))
    await storage.set('v3:' + c + ':2026:m:BRAVO', JSON.stringify({ 'ST-02': { g: 'dpco' } }))
    await storage.set('v3:' + c + ':pace:BRAVO', JSON.stringify({ epw: '5' }))
    /* the storage refuses a write PARTWAY THROUGH the run — the marks have
       moved, the pace has not — the way sSet swallows one on the "local only"
       path. Named by key rather than by ordinal so it stays the middle of the
       run whatever else the routine writes. */
    const realSet = storage.set; let refused = 0
    storage.set = (async (k: string, v: string) => { if (k.startsWith('v3:' + c + ':pace:')) { refused++; throw new Error('disk full') } return realSet.call(storage, k, v) }) as any
    try { await C.loadCourse(c); await C.whenLoaded() } finally { storage.set = realSet }
    expect(refused, 'a write really was refused').toBeGreaterThan(0)
    expect(await storage.get('v3:' + c + ':idmig'), 'not finished, so the next load runs it again').toBeNull()
    const rosterRaw = (await storage.get('v3:' + c + ':2026:roster'))!.value
    /* every mark is still reachable and nothing was duplicated: two records,
       whatever key each of them currently sits under */
    const mkeys = (await storage.list('v3:' + c + ':')).keys.filter((k: string) => k.includes(':m:'))
    expect(mkeys.length).toBe(2)
    const grades: string[] = []
    for (const k of mkeys) for (const m of Object.values(JSON.parse((await storage.get(k))!.value) as any)) grades.push((m as any).g)
    expect(grades.sort()).toEqual(['dco', 'dpco'])
    expect(JSON.parse((await storage.get('v3:' + c + ':pace:BRAVO'))!.value).epw, 'the refused move left its source alone').toBe('5')
    const parked = JSON.parse(rosterRaw)
    expect(parked.length, 'the roster is still there to be judged').toBe(2)
    expect(parked.every((e: any) => typeof e === 'string') || parked.every((e: any) => typeof e === 'object'), 'never half a converted roster').toBe(true)
    await C.loadCourse(c); await C.whenLoaded()                                              // the retry
    expect((await storage.get('v3:' + c + ':idmig'))!.value).toBe('1')
    const a = C.byName('ALPHA')!, b = C.byName('BRAVO')!
    expect(C.gradeOf(a.id, 'ST-01')).toBe('dco'); expect(C.gradeOf(b.id, 'ST-02')).toBe('dpco'); expect(C.paceOf(b.id).epw).toBe('5')
    for (const k of ['2026:m:ALPHA', '2026:m:BRAVO', 'pace:BRAVO', 'idmap']) expect(await storage.get('v3:' + c + ':' + k), k).toBeNull()
  })

  it('a course whose conversion cannot finish goes read-only rather than losing the names still on its roster', async () => {
    const c = 'STUCK', rosterKey = 'v3:' + c + ':2026:roster'
    /* a fixture course goes on COURSES and into the stored list; both come off
       again in the finally, with the course this pin started on reloaded, so
       nothing after it runs on STUCK or sees it listed */
    const prevCourse = C.course, prevCourses = (C.COURSES as string[]).slice()
    const prevList = (await storage.get('v3:courses'))?.value ?? null
    try {
      ;(C.COURSES as string[]).push(c); await storage.set('v3:courses', JSON.stringify(C.COURSES))
      await storage.set('v3:' + c + ':rostermig', '1'); await storage.set('v3:' + c + ':plan', JSON.stringify({ sylName: '2026', custom: false }))
      await storage.set(rosterKey, JSON.stringify(['MIKE', 'NOVEMBER']))
      await storage.set('v3:' + c + ':2026:m:MIKE', JSON.stringify({ 'ST-01': { g: 'dco' } }))
      await storage.set('v3:' + c + ':2026:m:NOVEMBER', JSON.stringify({ 'ST-02': { g: 'marg' } }))
      /* the ROSTER write is the one refused, so the conversion cannot finish
         however often it retries and the roster is left holding names */
      const realSet = storage.set
      storage.set = ((k: string, v: string) => (k === rosterKey ? Promise.reject(new Error('disk full')) : realSet.call(storage, k, v))) as any
      try { await C.loadCourse(c); await C.whenLoaded() } finally { storage.set = realSet }
      expect(await storage.get('v3:' + c + ':idmig')).toBeNull()
      expect(JSON.parse((await storage.get(rosterKey))!.value), 'the names are still the roster').toEqual(['MIKE', 'NOVEMBER'])
      expect(C.roster, 'half a converted roster is not shown').toEqual([])
      expect(C.rosterHeld, 'so every roster write is refused until it converts').toBe(true)
      /* + Add is where this used to be lost: it wrote the one entry on screen
         over a roster still holding both names */
      const p: Promise<any> = C.addStudent()
      expect(C.dlg.cancel, 'a notice, not a question').toBe(false)
      expect(C.dlg.msg).toMatch(/cannot be changed yet/)
      C.dlgClose(true); await p; await C.whenLoaded()
      expect(C.roster).toEqual([])
      expect(JSON.parse((await storage.get(rosterKey))!.value), 'both names untouched').toEqual(['MIKE', 'NOVEMBER'])
      /* the next load, with the store taking writes again, finishes the job —
         and every mark is under the id the interrupted run had already used */
      await C.loadCourse(c); await C.whenLoaded()
      expect(C.rosterHeld).toBe(false)
      expect((await storage.get('v3:' + c + ':idmig'))!.value).toBe('1')
      const m = C.byName('MIKE')!, n = C.byName('NOVEMBER')!
      expect(C.gradeOf(m.id, 'ST-01')).toBe('dco'); expect(C.gradeOf(n.id, 'ST-02')).toBe('marg')
      for (const k of ['2026:m:MIKE', '2026:m:NOVEMBER', 'idmap']) expect(await storage.get('v3:' + c + ':' + k), k).toBeNull()
    } finally {
      ;(C.COURSES as string[]).splice(0, (C.COURSES as string[]).length, ...prevCourses)
      if (prevList == null) await storage.delete('v3:courses'); else await storage.set('v3:courses', prevList)
      await C.loadCourse(prevCourse); await C.whenLoaded()
    }
  })

  it('an import into a half-converted course finishes the conversion instead of sealing it, and the syllabus the file did not carry converts too', async () => {
    const c = 'IMPHELD', sylA = '2026', sylB = '2024'
    /* same fixture shape as the pin above: the course and the stored list come
       back off, with the course this pin started on reloaded */
    const prevCourse = C.course, prevCourses = (C.COURSES as string[]).slice()
    const prevList = (await storage.get('v3:courses'))?.value ?? null
    try {
      ;(C.COURSES as string[]).push(c); await storage.set('v3:courses', JSON.stringify(C.COURSES))
      await storage.set('v3:' + c + ':rostermig', '1'); await storage.set('v3:' + c + ':plan', JSON.stringify({ sylName: sylA, custom: false }))
      await storage.set('v3:' + c + ':' + sylA + ':roster', JSON.stringify(['ALPHA']))
      await storage.set('v3:' + c + ':' + sylB + ':roster', JSON.stringify(['BRAVO']))
      await storage.set('v3:' + c + ':' + sylA + ':m:ALPHA', JSON.stringify({ 'ST-01': { g: 'dco' } }))
      await storage.set('v3:' + c + ':' + sylB + ':m:BRAVO', JSON.stringify({ 'ST-02': { g: 'marg' } }))
      /* interrupt the conversion the way the store's own "local only" path
         does: every write of a record under an ID is refused, so not one
         record moves and BOTH rosters are left holding names */
      const realSet = storage.set
      storage.set = ((k: string, v: string) => (k.startsWith('v3:' + c + ':') && /:m:s/.test(k) ? Promise.reject(new Error('disk full')) : realSet.call(storage, k, v))) as any
      try { await C.loadCourse(c); await C.whenLoaded() } finally { storage.set = realSet }
      expect(await storage.get('v3:' + c + ':idmig'), 'the conversion did not finish').toBeNull()
      expect(C.rosterHeld, 'so the course is read-only').toBe(true)
      expect(JSON.parse((await storage.get('v3:' + c + ':' + sylA + ':roster'))!.value)).toEqual(['ALPHA'])
      expect(JSON.parse((await storage.get('v3:' + c + ':' + sylB + ':roster'))!.value)).toEqual(['BRAVO'])
      /* the user restores a backup that carries only ONE of the two syllabi.
         Stamping the flag on the strength of it sealed the other one's names
         out of the conversion for good. */
      await C.applyStudents({
        courses: [c],
        byCourse: { [c]: { plan: { sylName: sylA, custom: false }, lulls: {}, pace: {}, bySyllabus: { [sylA]: { roster: [{ id: 'sIMPA1', name: 'ALPHA' }], marks: { sIMPA1: { 'ST-01': { g: 'dco' } } }, dates: {} } } } },
      }, null)
      await C.loadCourse(c); await C.whenLoaded()
      expect((await storage.get('v3:' + c + ':idmig'))!.value, 'the conversion ran and finished').toBe('1')
      expect(C.rosterHeld, 'so the crew list takes writes again').toBe(false)
      /* the syllabus the file carried: the imported entry, with its own id */
      const a = C.byName('ALPHA')!
      expect(a.id).toBe('sIMPA1'); expect(C.gradeOf(a.id, 'ST-01')).toBe('dco')
      expect(JSON.parse((await storage.get('v3:' + c + ':' + sylA + ':roster'))!.value)).toEqual([{ id: 'sIMPA1', name: 'ALPHA' }])
      /* and the one it did NOT: BRAVO is an entry now, the mark is under the
         id on that entry, and nothing is left filed under the name */
      const rb = JSON.parse((await storage.get('v3:' + c + ':' + sylB + ':roster'))!.value)
      expect(rb.length).toBe(1)
      expect(rb[0], 'a string here would be a name the next + Add overwrites').toEqual({ id: expect.stringMatching(/^s/), name: 'BRAVO' })
      expect(JSON.parse((await storage.get('v3:' + c + ':' + sylB + ':m:' + rb[0].id))!.value)['ST-02'].g).toBe('marg')
      expect(await storage.get('v3:' + c + ':' + sylB + ':m:BRAVO'), 'the name key is gone').toBeNull()
      expect(await storage.get('v3:' + c + ':idmap'), 'the scratch mapping is cleared with the flag').toBeNull()
    } finally {
      ;(C.COURSES as string[]).splice(0, (C.COURSES as string[]).length, ...prevCourses)
      if (prevList == null) await storage.delete('v3:courses'); else await storage.set('v3:courses', prevList)
      await C.loadCourse(prevCourse); await C.whenLoaded()
    }
  })

  it('a rename that cannot carry everything keeps the old course listed, with the records it left behind', async () => {
    if (C.sylDirty) await C.saveChangesClick()
    const c = 'CARRY', id = 'sCARRY1', mk = 'v3:' + c + ':2026:m:' + id, rk = 'v3:' + c + ':2026:roster'
    /* same shape as the pin above: the fixture course and the course list go
       back, and the rename leaves C.course on CARRIED without it */
    const prevCourse = C.course, prevCourses = (C.COURSES as string[]).slice()
    const prevList = (await storage.get('v3:courses'))?.value ?? null
    try {
      ;(C.COURSES as string[]).push(c); await storage.set('v3:courses', JSON.stringify(C.COURSES))
      await storage.set('v3:' + c + ':rostermig', '1'); await storage.set('v3:' + c + ':idmig', '1')
      await storage.set('v3:' + c + ':plan', JSON.stringify({ sylName: '2026', custom: false }))
      await storage.set(rk, JSON.stringify([{ id, name: 'CARLA' }]))
      await storage.set(mk, JSON.stringify({ 'ST-01': { g: 'dco' } }))
      await C.loadCourse(c); await C.whenLoaded()
      expect(C.byName('CARLA')!.id).toBe(id)
      /* the store refuses the copy of CARLA's marks to the new name */
      const realSet = storage.set
      storage.set = ((k: string, v: string) => (k === 'v3:CARRIED:2026:m:' + id ? Promise.reject(new Error('disk full')) : realSet.call(storage, k, v))) as any
      try { const p: Promise<any> = C.renCourse(); await answer('CARRIED'); await answer(true); await p; await C.whenLoaded() }
      finally { storage.set = realSet }
      expect(C.course).toBe('CARRIED')
      expect(C.COURSES).toContain('CARRIED')
      expect(C.COURSES, 'the half-carried course stays on the list — off it, nothing could reach it again').toContain(c)
      expect(C.saveStat.cls, 'the toolbar says it went wrong').toBe('err')
      expect(C.saveStat.text).toContain(c)
      /* and the old course is left WHOLE, not stripped of the keys that did
         copy — a course with its marks but no crew list would show nobody and
         export nothing, which is not "the complete one" the alert promises */
      const oldRoster = await storage.get(rk)
      expect(oldRoster, 'its crew list is still there — a course with marks but no crew list shows nobody').not.toBeNull()
      expect(JSON.parse(oldRoster!.value)).toEqual([{ id, name: 'CARLA' }])
      expect(JSON.parse((await storage.get(mk))!.value)['ST-01'].g, 'and so are the marks').toBe('dco')
      await C.loadCourse(c); await C.whenLoaded()
      expect(C.byName('CARLA')!.id, 'so opening it again shows the crew').toBe(id)
      expect(C.gradeOf(id, 'ST-01'), 'with their marks').toBe('dco')
    } finally {
      ;(C.COURSES as string[]).splice(0, (C.COURSES as string[]).length, ...prevCourses)
      if (prevList == null) await storage.delete('v3:courses'); else await storage.set('v3:courses', prevList)
      await C.loadCourse(prevCourse); await C.whenLoaded()
    }
  })

  it('a second course nobody opened since the upgrade: its links survive an export and a global syllabus rename moves its marks (review finding 3)', async () => {
    const c = 'SHUT'
    /* the init path: a course sitting in the list that this boot has never
       opened. loadCourses() is module-private, so the list is pushed the way
       the migration test above pushes its own. */
    ;(C.COURSES as string[]).push(c); await storage.set('v3:courses', JSON.stringify(C.COURSES))
    /* renSyl below renames the current BUILT-IN globally and back, and that is
       not symmetrical: on the way out it hides the built-in and tombstones the
       name, on the way back it re-creates the name as a CUSTOM chart — and it
       persists all of that (the four v3:master prefs, the global custom store
       and every course's legacy syls key). Snapshot and restore, the way the
       migration test above does, so a later test does not inherit a built-in
       that is now a custom override of itself. */
    const prevHidden = (C.SYL_HIDDEN as string[]).slice(), prevOrder = (C.SYL_ORDER as string[]).slice()
    const prevAlias = { ...(C.SYL_ALIAS as any) }, prevTomb = { ...(C.SYL_TOMB as any) }
    const sylKeys = ['v3:master:syls', 'v3:master:sylhidden', 'v3:master:sylalias', 'v3:master:syltomb', 'v3:master:sylorder',
      'v3:SYLLABUS EDIT:syls', ...(C.COURSES as string[]).map((n: string) => `v3:${n}:syls`)]
    const prevSyl = new Map<string, string | null>()
    for (const k of sylKeys) prevSyl.set(k, (await storage.get(k))?.value ?? null)
    const prevLinks = (await storage.get('v3:links'))?.value ?? null
    const prevCourse = C.course
    try {
      await storage.set('v3:' + c + ':rostermig', '1'); await storage.set('v3:' + c + ':plan', JSON.stringify({ sylName: C.curSyl(), custom: false }))
      await storage.set('v3:' + c + ':' + C.curSyl() + ':roster', JSON.stringify(['ZULU']))
      await storage.set('v3:' + c + ':' + C.curSyl() + ':m:ZULU', JSON.stringify({ 'ST-01': { g: 'dco' } }))
      await storage.set('v3:links', JSON.stringify({ [c]: { ZULU: 'p2' } }))
      await C.migrateAllCourses()                                      // what init does
      const out = await C.collectStudents()
      const z = out.byCourse[c].bySyllabus[C.curSyl()].roster[0]
      expect(z).toEqual({ id: expect.stringMatching(/^s/), name: 'ZULU', pid: 'p2' })
      expect(out.byCourse[c].bySyllabus[C.curSyl()].marks[z.id]['ST-01'].g).toBe('dco')
      const from = C.curSyl(), p: Promise<any> = C.renSyl(); await answer(from + ' R'); await p; await C.whenLoaded()
      expect((await storage.get('v3:' + c + ':' + from + ' R:m:' + z.id))!.value).toContain('dco')
      expect(await storage.get('v3:' + c + ':' + from + ':m:' + z.id)).toBeNull()
      const q: Promise<any> = C.renSyl(); await answer(from); await q; await C.whenLoaded()   // put the name back for the tests after
      expect(C.curSyl()).toBe(from)
    } finally {
      ;(C.SYL_HIDDEN as string[]).splice(0, (C.SYL_HIDDEN as string[]).length, ...prevHidden)
      ;(C.SYL_ORDER as string[]).splice(0, (C.SYL_ORDER as string[]).length, ...prevOrder)
      for (const o of [[C.SYL_ALIAS, prevAlias], [C.SYL_TOMB, prevTomb]] as any[][]) {
        for (const k of Object.keys(o[0])) delete o[0][k]
        Object.assign(o[0], o[1])
      }
      for (const [k, val] of prevSyl) { if (val == null) await storage.delete(k); else await storage.set(k, val) }
      if (prevLinks == null) await storage.delete('v3:links'); else await storage.set('v3:links', prevLinks)
      await C.loadCourse(prevCourse); await C.whenLoaded()   /* re-reads CUSTOMS off the restored store */
    }
  })

  it('the same student on a second chart of the course reuses the enrolment id; a callsign already on the course under another person is refused (review finding 4)', async () => {
    let p: Promise<any> = C.addStudent(); C.dlgClose({ pick: 'p1' }); await p; await C.whenLoaded()
    const r = C.byName('RANGER')!; await C.setEpw(r.id, '7')
    const first = C.curSyl(), other = (C.allSylNames() as string[]).find((n: string) => n !== first)!
    await C.switchSyllabus(other); await C.whenLoaded()
    expect(C.byName('RANGER')).toBeNull()
    p = C.addStudent(); C.dlgClose({ pick: 'p1' }); await p; await C.whenLoaded()
    expect(C.byName('RANGER')).toEqual(r); expect(C.paceOf(r.id).epw).toBe('7')             // one enrolment, one pace
    p = C.addStudent(); C.dlgClose('ranger'); await p; await C.whenLoaded()
    expect(C.roster.filter((x: any) => x.name === 'RANGER').length).toBe(1)                 // typed again: the same entry
    /* a different person on the roster whose callsign collides */
    setPeople([...P, { id: 'p3', cs: 'Ranger', seat: 'FCP', q: 'A', sxo: false }])
    let seen = ''; p = C.addStudent(); C.dlgClose({ pick: 'p3' }); await until(() => C.dlg); seen = C.dlg.msg; C.dlgClose(true); await p
    expect(seen).toMatch(/already on this course, linked to a different person/)
    expect(C.roster.filter((x: any) => x.name === 'RANGER').length).toBe(1)
    setPeople(P); await C.switchSyllabus(first); await C.whenLoaded()
  })
})
