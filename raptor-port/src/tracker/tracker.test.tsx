// @vitest-environment jsdom
/* The Tracker tab's seam into Raptor (7 Sep 26, the Tracker merge).
   Three things this pins, none of which the vendored smoke suite
   (scripts/tracker/smoke.mjs) can see because it always drives as the admin:
   · the ROLE rides the Raptor session — a member login (and a logout) makes
     the tab read-only, an admin login makes it editable, and the admin's
     view-as-member toggle flips it both ways (state/store.ts resetSession /
     toggleRole → tracker/role.js);
   · the read-only shape is enforced at the WRITE PATH in core.js, not only at
     the affordance — the grading pop-up, edit mode and every student/date
     write refuse a read-only caller;
   · the affordance half matches: the header hides the Course/Syllabus/File
     menus, Edit and Details for a viewer and keeps the pickers, Show All and
     the search.
   The flag lives in role.js so Raptor can write it WITHOUT loading the chart
   engine — a regression there would put ~280 KB of syllabus data back into
   Raptor's first download; the last test guards that by construction. */
import { beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { isReadOnly, setReadOnly } from './role.js'
import * as core from './app/core.js'
import Header from './components/Header.jsx'
import { initStore, resetSession, toggleRole } from '../state/store'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true
const $ = (sel: string) => document.querySelector(sel)

describe('the role rides the Raptor session (store.ts → tracker/role.js)', () => {
  beforeEach(() => { initStore() })

  it('a member login is read-only, an admin login is not, a logout is read-only', () => {
    resetSession({ user: 'us', role: 'main' })
    expect(isReadOnly()).toBe(true)
    expect(core.readOnly).toBe(true)
    resetSession({ user: 'ad', role: 'admin' })
    expect(isReadOnly()).toBe(false)
    expect(core.readOnly).toBe(false)
    resetSession(null)
    expect(isReadOnly()).toBe(true)
  })

  it("the admin's view-as-member toggle flips it both ways", () => {
    resetSession({ user: 'ad', role: 'admin' })
    expect(core.readOnly).toBe(false)
    toggleRole()
    expect(core.readOnly).toBe(true)
    toggleRole()
    expect(core.readOnly).toBe(false)
  })

  it('a viewer is always in Details mode — a ball click reads the brief, never grades', () => {
    resetSession({ user: 'ad', role: 'admin' })
    expect(core.showDetails).toBe(false)
    resetSession({ user: 'us', role: 'main' })
    expect(core.showDetails).toBe(true)
  })

  it('a member who logged in before ever opening the tab still gets Details mode on first open', async () => {
    /* the flag was set while core.js was not loaded, so only its initial
       mirror saw it — init() has to settle Details itself (core.js init) */
    resetSession({ user: 'us', role: 'main' })
    expect(core.readOnly).toBe(true)
    const host = document.createElement('div')
    host.innerHTML = '<div id="page-tracker"><div class="tr-root"><div class="board" id="board"></div></div></div>'
    document.body.appendChild(host)
    await core.init()
    expect(core.showDetails).toBe(true)
    host.remove()
  })
})

describe('read-only is enforced at the write path (core.js)', () => {
  beforeEach(() => { setReadOnly(false) })

  it('the grading pop-up does not open for a viewer, and does for the admin', () => {
    setReadOnly(true)
    core.openPop('ST-01', { clientX: 10, clientY: 10 })
    expect(core.pop).toBeNull()
    setReadOnly(false)
    core.openPop('ST-01', { clientX: 10, clientY: 10 })
    expect(core.pop).toEqual({ id: 'ST-01', x: 10, y: 10 })
    core.closePop()
  })

  it('edit mode, the editors and the student/date writes all refuse a viewer', async () => {
    setReadOnly(true)
    core.toggleArrange()
    expect(core.arrangeMode).toBe(false)
    core.openInfo('ST-01'); expect(core.infoId).toBeNull()
    core.openModal(); expect(core.sylModalOpen).toBe(false)
    core.openOrdCrew(); expect(core.ordMode).toBeNull()
    core.openCopy(); expect(core.copyOpen).toBe(false)
    core.openLullCopy('STUDENT A'); expect(core.lullCopy).toBeNull()
    /* every async writer returns without touching state — the roster is the
       cheapest witness: an add that went through would prompt for a name */
    const before = JSON.stringify([core.roster, core.dates, core.pace, core.lulls])
    await core.addStudent()
    await core.setLastSyll('STUDENT A', '2026-01-01')
    await core.setEpw('STUDENT A', '3')
    await core.lullDayClick('2026-01-01')
    expect(JSON.stringify([core.roster, core.dates, core.pace, core.lulls])).toBe(before)
  })

  it('switching to read-only closes whatever editing state was open', () => {
    core.openPop('ST-01', { clientX: 1, clientY: 1 })
    core.openInfo('ST-01')
    expect(core.pop).not.toBeNull()
    setReadOnly(true)
    expect(core.pop).toBeNull()
    expect(core.infoId).toBeNull()
    expect(core.arrangeMode).toBe(false)
  })
})

describe('the header shows a viewer only the choosing controls', () => {
  const render = async () => {
    const host = document.createElement('div')
    document.body.appendChild(host)
    await act(async () => { createRoot(host).render(<Header />) })
    return host
  }
  beforeEach(() => { document.body.innerHTML = '' })

  it('admin: every menu and mode button is drawn', async () => {
    setReadOnly(false)
    await render()
    for (const id of ['activeSel', 'showAllBtn', 'hSearchBtn', 'courseSel', 'courseMenuBtn', 'sylSel', 'sylMenuBtn', 'fileMenuBtn', 'arrangeBtn', 'detailsBtn'])
      expect($('#' + id), id).toBeTruthy()
  })

  it('viewer: the pickers, Show All and the search stay; the menus, Edit, Details and the save slot go', async () => {
    setReadOnly(true)
    await render()
    for (const id of ['activeSel', 'showAllBtn', 'hSearchBtn', 'courseSel', 'sylSel'])
      expect($('#' + id), id).toBeTruthy()
    for (const id of ['courseMenuBtn', 'sylMenuBtn', 'fileMenuBtn', 'arrangeBtn', 'detailsBtn', 'saveChanges', 'saveStat'])
      expect($('#' + id), id).toBeNull()
  })
})

describe('the seam stays light', () => {
  it('Raptor writes the role through role.js, never by importing core.js', () => {
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
