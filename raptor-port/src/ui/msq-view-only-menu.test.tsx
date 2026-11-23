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
import { describe, it, expect, afterEach, vi } from 'vitest'
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
import { setWarWindowsProbe } from '../state/typing-hold'

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
/* a finger's or a mouse's click counts its presses (detail 1); a keyboard's click counts none (detail 0) — the menu spares
   only a pointer's click after the press that closed the list */
const TAP = { detail: 1 }

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

/* THE READS OF 23 Nov 26 (docs/superpowers/briefs/2026-11-23-msq-view-only-read-{opus,astra}.md) — red first */
describe('the reads\' findings', () => {
  afterEach(() => { setWarWindowsProbe(null) })
  it('Opus F1: an open Leave War window holds the landing until it closes, then View-only Sched', () => {
    give(ACCT.hunter, 'u149', 'plan')
    signInAs('hunter')
    act(() => { void pickSquadron('u149') })
    act(() => { setPage('leavewar'); notify() })
    setWarWindowsProbe(() => 1)
    act(() => { switchRoleView() })
    expect(CURPAGE, 'the window and his words stay in sight').toBe('leavewar')
    setWarWindowsProbe(() => 0)
    act(() => { notify() })
    expect(CURPAGE, 'the window closed: the landing runs').toBe('viewsched')
  })
  it('F2 (both): one tap on the surround closes the list only, the menu still open', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    render(<Drawer />)
    openDrawer()
    fireEvent.click(markBtn()!)
    const shade = document.getElementById('drawer')!
    act(() => { fireEvent.pointerDown(shade); fireEvent.click(shade, TAP) })
    expect(document.querySelector('#drawerSqnList'), 'the list closed').toBeNull()
    expect(DRAWER, 'the menu still open').toBe(true)
    act(() => { fireEvent.pointerDown(shade); fireEvent.click(shade, TAP) })
    expect(DRAWER, 'a second tap closes the menu').toBe(false)
  })
  /* The fix rounds' read of 23 Nov 26 (Astra 2), a repeat of F2 above: the first fix knew the press's own click by the
     clock (700 ms), so a press held about a second closed the list AND the menu. Known by the press itself now, however
     long it is held. Red first. */
  it('one slow press on the surround, held a second, closes the list only; the next closes the menu', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    render(<Drawer />)
    openDrawer()
    fireEvent.click(markBtn()!)
    expect(document.querySelector('#drawerSqnList')).not.toBeNull()
    const shade = document.getElementById('drawer')!
    const t0 = Date.now()
    const clock = vi.spyOn(Date, 'now')
    try {
      act(() => { fireEvent.pointerDown(shade) })
      clock.mockReturnValue(t0 + 1000)
      act(() => { fireEvent.pointerUp(shade); fireEvent.click(shade, TAP) })
      expect(document.querySelector('#drawerSqnList'), 'the list closed').toBeNull()
      expect(DRAWER, 'the menu stays open').toBe(true)
      act(() => { fireEvent.pointerDown(shade); fireEvent.pointerUp(shade); fireEvent.click(shade, TAP) })
      expect(DRAWER, 'a second press closes the menu').toBe(false)
    } finally { clock.mockRestore() }
  })
  /* a press that closed the list but brought no click to the surround (a finger that slid: the browser cancels it) must
     not save the menu from the NEXT press's click */
  it('a press that closed the list and never clicked does not spare the menu from the next press', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    render(<Drawer />)
    openDrawer()
    fireEvent.click(markBtn()!)
    const shade = document.getElementById('drawer')!
    act(() => { fireEvent.pointerDown(shade); fireEvent.pointerCancel(shade) })
    expect(document.querySelector('#drawerSqnList'), 'the list closed').toBeNull()
    expect(DRAWER).toBe(true)
    act(() => { fireEvent.pointerDown(shade); fireEvent.pointerUp(shade); fireEvent.click(shade, TAP) })
    expect(DRAWER, 'the next press closes the menu').toBe(false)
  })
  /* The re-walk of 23 Nov 26 (chat 151, N1): with the list open under the mark, a finger on a page line below it closed the
     list at the touch, every line moved up ~98 points, and the click landed on the line that slid under the finger — a tap
     on Inputs opened the Leave War; Help and Logout seemed dead. By D2384 that press closes the list first, the menu still
     open: its click opens nothing, wherever it lands. Red first. */
  it('a press on a page line below the open list closes the list only — no page opens, the menu stays open', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    act(() => { setPage('viewsched'); notify() })
    render(<Drawer />)
    openDrawer()
    fireEvent.click(markBtn()!)
    const line = (p: string) => document.querySelector<HTMLElement>(`#drawerNav a[data-page="${p}"]`)!
    /* the press on Inputs; the click, after the lines moved up, on the Leave War */
    act(() => { fireEvent.pointerDown(line('inputs')); fireEvent.pointerUp(line('leavewar')); fireEvent.click(line('leavewar'), TAP) })
    expect(document.querySelector('#drawerSqnList'), 'the list closed').toBeNull()
    expect(CURPAGE, 'no page opened').toBe('viewsched')
    expect(DRAWER, 'the menu still open').toBe(true)
    /* the list closed, a tap on a line opens it */
    act(() => { fireEvent.pointerDown(line('inputs')); fireEvent.pointerUp(line('inputs')); fireEvent.click(line('inputs'), TAP) })
    expect(CURPAGE).toBe('inputs')
    expect(DRAWER).toBe(false)
  })
  it('the same for Logout: a press on it with the list open closes the list only', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    render(<Drawer />)
    openDrawer()
    fireEvent.click(markBtn()!)
    const out = document.getElementById('drawerLogout')!
    act(() => { fireEvent.pointerDown(out); fireEvent.pointerUp(out); fireEvent.click(out, TAP) })
    expect(document.querySelector('#drawerSqnList'), 'the list closed').toBeNull()
    expect(DRAWER, 'still open, still signed in').toBe(true)
  })
  /* The read of that fix (23 Nov 26, the fresh Opus reader and Astra alike): a press that closed the list with no click of
     its own — a right press, a finger that slid — left the note set, and the menu's click capture then swallowed the next
     KEYBOARD click (Enter or Space on a button: a click with no press before it). Only a pointer's click is spared now.
     Red first. */
  it('a right press closes the list; Enter on the mark after it opens the list at once', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    render(<Drawer />)
    openDrawer()
    fireEvent.click(markBtn()!)
    const inputs = document.querySelector<HTMLElement>('#drawerNav a[data-page="inputs"]')!
    act(() => { fireEvent.pointerDown(inputs, { button: 2 }); fireEvent.pointerUp(inputs, { button: 2 }) })
    expect(document.querySelector('#drawerSqnList'), 'the list closed').toBeNull()
    act(() => { fireEvent.click(markBtn()!, { detail: 0 }) })
    expect(document.querySelector('#drawerSqnList'), 'Enter on the mark opens the list').not.toBeNull()
  })
  it('a finger that slid closes the list; Enter on Logout after it signs out at once', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    render(<Drawer />)
    openDrawer()
    fireEvent.click(markBtn()!)
    const help = document.querySelector<HTMLElement>('#drawerNav a[data-page="help"]')!
    act(() => { fireEvent.pointerDown(help); fireEvent.pointerCancel(help) })
    expect(document.querySelector('#drawerSqnList')).toBeNull()
    act(() => { fireEvent.click(document.getElementById('drawerLogout')!, { detail: 0 }) })
    expect(DRAWER, 'Enter on Logout acts: the menu closes').toBe(false)
  })
  it('F3 (both): Arrow Down on the mark opens the list; focus leaving the list closes it', () => {
    give(ACCT.ranger, 'u149', 'view')
    signInAs('ranger')
    render(<Drawer />)
    openDrawer()
    fireEvent.keyDown(markBtn()!, { key: 'ArrowDown' })
    expect(document.querySelector('#drawerSqnList'), 'Arrow Down opens it').not.toBeNull()
    const row = document.querySelector<HTMLElement>('#drawerSqnList .sqm-row')!
    fireEvent.blur(row, { relatedTarget: document.querySelector('#drawerNav a') })
    expect(document.querySelector('#drawerSqnList'), 'Tab out closes it').toBeNull()
  })
})

describe('the roles table (D2381)', () => {
  it('View no longer opens Logic: its cell is "—"', () => {
    expect(ROLES_TABLE.find(r => r.page === 'logic')!.cells.view.mark).toBe('no')
  })
})
