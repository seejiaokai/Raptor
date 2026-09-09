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
import { beforeEach, describe, expect, it } from 'vitest'
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
