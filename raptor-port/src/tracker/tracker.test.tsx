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

  it('Open and Import are guarded at their entry points', () => {
    const src = readFileSync(join(__dirname, 'app/core.js'), 'utf8')
    for (const fn of ['openFileClick', 'importSyllabusClick', 'openCopy', 'saveCopyClick'])
      expect(src, fn).toMatch(new RegExp(`export (async )?function ${fn}\\([^)]*\\) \\{ if \\(fileLocked\\) return;`))
    /* and nothing else is — the standalone app's other writes are everyone's */
    expect((src.match(/if \(fileLocked\) return;/g) || []).length).toBe(4)
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

  const EVERYONE = ['activeSel', 'showAllBtn', 'hSearchBtn', 'courseSel', 'courseMenuBtn', 'sylSel', 'sylMenuBtn', 'arrangeBtn', 'detailsBtn', 'saveStat']

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
    expect($('#openFileBtn')).toBeNull()
    expect($('#importSylBtn')).toBeNull()
    expect($('#saveCopyBtn')).toBeNull()
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

  it('the two arrange-strip ids Raptor already owns were renamed', () => {
    const tools = readFileSync(join(__dirname, 'components/ArrangeTools.jsx'), 'utf8')
    expect(tools).not.toMatch(/id="(undoBtn|redoBtn)"/)
    expect(tools).toMatch(/id="trUndoBtn"/)
  })
})
