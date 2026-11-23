// @vitest-environment jsdom
/* A SQUADRON HE ONLY VIEWS, AND THE ☰ MENU'S SQUADRON DROP-DOWN (his D2381 — "View only and help"; D2382 — the TALON mark
   as the drop-down; D2383 — a grey line saying his access; D2384 — version D built as drawn: the list opens under the mark
   inside the menu, the menu stays open after a pick, the line shows with one squadron too; the drawing
   docs/mock/2026-11-23-view-only-tabs/d1–d5).
   - With a squadron he only views picked — a View holder, or a Plan holder or master admin in the member view (D2253) —
     the top bar and the ☰ menu offer its View-only Sched and Help alone; his own squadron picked brings every page back.
   - A pick of it from a page it does not offer lands on its View-only Sched; opening one of his own pages from elsewhere
     (the bell, a link) brings his own squadron back into view, the page opened.
   - The ☰ menu opens with the TALON mark: two squadrons or more, a button reading "149 ▾" whose list (the Schedules
     menu's own rows) opens under it in the menu; a pick switches and the menu stays open; under the mark the grey line
     "149 · View only". One squadron: the mark alone, no ▾, the line "142 · Your squadron".
   Red first: before the change every page was offered and the menu had no squadron at its head. */
import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup, act, fireEvent } from '@testing-library/react'
import { useMsqWorld, signInAs, ACCT } from '../test-support/msq-world'
import { saveAccess } from '../state/accounts'
import { viewOnlyPick, pageOffered } from '../state/perms'
import { switchRoleView, setPage, notify } from '../state/store'
import { pickSquadron } from '../state/pick'
import { UNIT } from '../engine/unitview'
import { CURPAGE } from '../state/view'
import { DRAWER, setDrawer } from './pops'
import { Drawer } from './Drawer'
import { ROLES_TABLE } from './rolestable'

useMsqWorld()
afterEach(() => { cleanup(); setDrawer(false) })

function give(acct: string, unit: string, level: 'plan' | 'view'): void {
  signInAs('saber')
  expect(saveAccess(acct, { grants: { [unit]: level } }), `${level} of ${unit} given`).toBeNull()
}
const drawerPages = () => [...document.querySelectorAll<HTMLElement>('#drawerNav a[data-page]')].map(a => a.dataset.page)
const markBtn = () => document.querySelector<HTMLButtonElement>('#drawerSqnBtn')
const markNum = () => document.querySelector('#drawer .drawer-sqn .mark .k')?.textContent
const line = () => document.querySelector('#drawerSqnLine')?.textContent
const listRows = () => [...document.querySelectorAll<HTMLElement>('#drawerSqnList .sqm-row')].map(r =>
  `${r.querySelector('.sqm-num')!.textContent} ${r.querySelector('.sqm-lbl')!.textContent}${r.getAttribute('aria-checked') === 'true' ? ' ✓' : ''}`)
function openDrawer() { act(() => { setDrawer(true); notify() }) }

describe('the pages a squadron he only views offers (D2381)', () => {
  it('Ranger with View of 149: 149 picked offers View-only Sched and Help alone; 142 every page', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    expect(viewOnlyPick()).toBe(false)
    act(() => { void pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    expect(viewOnlyPick()).toBe(true)
    expect(['viewsched', 'help', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'admin', 'editsched'].filter(pageOffered)).toEqual(['viewsched', 'help'])
    act(() => { void pickSquadron('u142') })
    expect(viewOnlyPick()).toBe(false)
    expect(['viewsched', 'help', 'inputs', 'quals', 'logic', 'leavewar', 'tracker'].every(pageOffered)).toBe(true)
  })
  it('Hunter, 142\'s admin with View of 149: his Admin goes too; with Plan of 149 every page stays; in the member view 149 is view only (D2253)', () => {
    give(ACCT.hunter, 'u149', 'view')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    expect(pageOffered('admin')).toBe(false)
    give(ACCT.hunter, 'u149', 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    expect(viewOnlyPick()).toBe(false)
    expect(pageOffered('admin')).toBe(true)
    act(() => { switchRoleView() })
    expect(viewOnlyPick()).toBe(true)
    expect(pageOffered('inputs')).toBe(false)
  })
  it('the ☰ menu offers only View-only Sched and Help with 149 picked, every page with 142', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    render(<Drawer />)
    openDrawer()
    expect(drawerPages()).toEqual(['viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help'])
    act(() => { void pickSquadron('u149') })
    expect(drawerPages()).toEqual(['viewsched', 'help'])
  })
})

describe('where he lands', () => {
  it('a pick of 149 from the Leave War lands on 149\'s View-only Sched', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    act(() => { setPage('leavewar'); notify() })
    act(() => { void pickSquadron('u149') })
    expect(UNIT).toBe('u149')
    expect(CURPAGE).toBe('viewsched')
  })
  it('Help stays where it is on a pick of 149', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    act(() => { setPage('help'); notify() })
    act(() => { void pickSquadron('u149') })
    expect(CURPAGE).toBe('help')
  })
  it('his own page opened from elsewhere (a bell line, a link) with 149 picked brings 142 back, the page opened', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    act(() => { void pickSquadron('u149') })
    act(() => { setPage('inputs'); notify() })
    expect(UNIT).toBe('u142')
    expect(CURPAGE).toBe('inputs')
  })
  it('a Plan holder on 149\'s Inputs switching to the member view lands on 149\'s View-only Sched', () => {
    give(ACCT.hunter, 'u149', 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    act(() => { setPage('inputs'); notify() })
    expect(UNIT).toBe('u149')
    act(() => { switchRoleView() })
    expect(UNIT).toBe('u149')
    expect(CURPAGE).toBe('viewsched')
  })
})

describe('the ☰ menu\'s TALON mark as the squadron drop-down (D2382–D2384)', () => {
  it('Ranger with 149 picked: "149 ▾", the line "149 · View only"; a tap lists his squadrons under it', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    act(() => { void pickSquadron('u149') })
    render(<Drawer />)
    openDrawer()
    expect(markBtn()).not.toBeNull()
    expect(markNum()).toBe('149')
    expect(document.querySelector('#drawer .drawer-sqn .mark.menu'), 'the ▾ is drawn by .mark.menu').not.toBeNull()
    expect(line()).toBe('149 · View only')
    expect(document.querySelector('#drawerSqnList')).toBeNull()
    expect(markBtn()!.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(markBtn()!)
    expect(markBtn()!.getAttribute('aria-expanded')).toBe('true')
    expect(listRows()).toEqual(['142 Your squadron', '149 View only ✓'])
  })
  it('a pick in the list switches the squadron; the list closes, the menu stays open and its pages come back', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    act(() => { void pickSquadron('u149') })
    render(<Drawer />)
    openDrawer()
    fireEvent.click(markBtn()!)
    fireEvent.click(document.querySelector<HTMLElement>('#drawerSqnList .sqm-row[data-unit="u142"]')!)
    expect(UNIT).toBe('u142')
    expect(DRAWER, 'the menu stays open').toBe(true)
    expect(document.querySelector('#drawerSqnList'), 'the list closes').toBeNull()
    expect(markNum()).toBe('142')
    expect(line()).toBe('142 · Your squadron')
    expect(drawerPages()).toEqual(['viewsched', 'inputs', 'quals', 'logic', 'leavewar', 'tracker', 'help'])
  })
  it('Escape closes the list first, the menu still open', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    render(<Drawer />)
    openDrawer()
    fireEvent.click(markBtn()!)
    expect(document.querySelector('#drawerSqnList')).not.toBeNull()
    act(() => { fireEvent.keyDown(document, { key: 'Escape' }) })
    expect(document.querySelector('#drawerSqnList')).toBeNull()
    expect(DRAWER).toBe(true)
  })
  it('one squadron: the mark alone, no ▾, the line "142 · Your squadron" (D2384)', () => {
    signInAs('ranger')
    render(<Drawer />)
    openDrawer()
    expect(markBtn()).toBeNull()
    expect(document.querySelector('#drawer .drawer-sqn .mark')).not.toBeNull()
    expect(document.querySelector('#drawer .drawer-sqn .mark.menu')).toBeNull()
    expect(markNum()).toBe('142')
    expect(line()).toBe('142 · Your squadron')
  })
  it('Saber, a master admin: the list his squadrons, 149 "Full access"', () => {
    signInAs('saber')
    render(<Drawer />)
    openDrawer()
    fireEvent.click(markBtn()!)
    expect(listRows()).toEqual(['142 Your squadron ✓', '149 Full access'])
    expect(line()).toBe('142 · Your squadron')
  })
})

describe('the roles table (D2381)', () => {
  it('View no longer opens Logic: its cell is "—"', () => {
    expect(ROLES_TABLE.find(r => r.page === 'logic')!.cells.view.mark).toBe('no')
  })
})
