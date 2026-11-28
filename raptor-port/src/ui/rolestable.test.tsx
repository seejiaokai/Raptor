// @vitest-environment jsdom
/* "WHAT EACH ROLE ALLOWS" — THE TABLE CAN NEVER DRIFT FROM THE APP (batch 1's second half §4 item 6; his D2302, D2305 —
   the table built as drawn, picture k2; D200's rule: what the screen says a role may do is what the app lets it do).

   A person of each role is signed in — Member: Ranger (142); Admin: Hunter (142); View: Hunter holding View of 149 with
   149 picked; Plan: Hunter holding Plan of 149 with 149 picked; Master admin: Saber with 149 picked — and for each of the
   eight pages the app's OWN readers are asked, of the squadron the column is about (his own for Member and Admin, 149
   for the other three — the roles brief §2):
     does the page open on that squadron? (its tab shown — ui/Shell.tsx, ui/Drawer.tsx — and the page following that
       squadron: perms.ts pageUnit('schedule') for the schedule pages and Logic, pageUnit('own') for his own pages, the
       Leave War loaded for it)  — no: "—";
     are its controls offered? (the very questions each page asks before it draws one)  — yes: "✓", no: "read".
   Each cell of ui/rolestable.ts must equal that answer. A drawn cell the app answers otherwise is NOT changed to pass:
   it is listed in KNOWN below with both answers and put to him (D2305 — the table as he approved it), and the test
   holds that the difference is still there, so it is never forgotten once the app or the table moves.
   And each note's "what a tick leaves out" is asked of the app too.
   Red first: before the change there was no table and no fold. */
import { describe, it, expect, afterEach } from 'vitest'
import { act, cleanup, fireEvent, render } from '@testing-library/react'
import { useMsqWorld, signInAs, PID, ACCT } from '../test-support/msq-world'
import { saveAccess } from '../state/accounts'
import { addUnit, placeOfOn, homeOn, todayIso } from '../state/units'
import { canEditSched, canEditOwn } from '../state/auth'
import {
  pageUnit, isAdmin, me, roleOf, allows, T, mayFileInputFor, mayEditQualsOf, mayManageAccounts, mayRenameCallsign,
  mayTickManagement, mayTickScheduler, mayDecideBids, mayEditSettings, pageOffered, type Who,
} from '../state/perms'
import { pickSquadron } from '../state/pick'
import { notify } from '../state/store'
import { setPage, CURPAGE } from '../state/view'
import { HOOKS } from '../engine/hooks'
import { rosterOf } from '../engine/roster'
import { getState, worldUnit } from '../leavewar/state/store'
import { canEditRow } from '../leavewar/engine/access'
import { ROLES_TABLE, TABLE_ROLES, ROLES_LABEL, ROLES_KEY, ROLES_NOTES, MARK_WORD, type Mark, type RolePage, type TableRole } from './rolestable'
import { UsersPanel } from './UsersPanel'

useMsqWorld()
afterEach(() => cleanup())

function give(acct: string, unit: string, level: 'view' | 'plan'): void {
  signInAs('saber')
  expect(saveAccess(acct, { grants: { [unit]: level } }), `${level} of ${unit} given`).toBeNull()
}
/* sign a person of the role in, the squadron the column is about in view; returns that squadron */
function become(role: TableRole): string {
  switch (role) {
    case 'member': signInAs('ranger'); return 'u142'
    case 'admin': signInAs('hunter'); return 'u142'
    case 'view': give(ACCT.hunter, 'u149', 'view'); signInAs('hunter'); act(() => { pickSquadron('u149') }); return 'u149'
    case 'plan': give(ACCT.hunter, 'u149', 'plan'); signInAs('hunter'); act(() => { pickSquadron('u149') }); return 'u149'
    case 'master': signInAs('saber'); act(() => { pickSquadron('u149') }); return 'u149'
  }
}
const mark = (opens: boolean, changes: boolean): Mark => (!opens ? 'no' : changes ? 'yes' : 'read')
const onPage = (p: string): void => { act(() => { setPage(p); notify() }) }
/* the app's own answer for one page, of squadron `sq` */
function answer(page: RolePage, sq: string): Mark {
  const sched = pageUnit('schedule') === sq, own = pageUnit('own') === sq
  const who: Who = roleOf()
  /* a squadron he only views picked: the top bar and the ☰ menu offer its View-only Sched and Help alone, and a page it
     does not offer is landed off (his D2381 — perms.ts pageOffered, store.ts landOnOfferedPage) */
  if (!pageOffered(page)) return 'no'
  switch (page) {
    /* the top bar shows Edit Schedule's tab to whoever may edit the schedule in view (Shell.tsx `hidden={!schedEdit}`);
       an admin who may not is landed on View-only Sched (store.ts landOffEditSched); its controls are edit mode */
    case 'editsched': { onPage('editsched'); return mark(canEditSched() && sched && CURPAGE === 'editsched', HOOKS.editMode()) }
    /* View-only Sched: open to all (Drawer.tsx), never in edit mode */
    case 'viewsched': { onPage('viewsched'); return mark(sched, HOOKS.editMode()) }
    /* Logic: open to all; its ✎ Edit offered only to whoever may edit the schedule in view (LogicPage.tsx #lgEdit) */
    case 'logic': return mark(sched, canEditSched())
    /* Inputs: his own squadron's page; an admin of it files anyone's, a member his own (perms.ts mayFileInputFor) */
    case 'inputs': return mark(own, canEditOwn() || mayFileInputFor(me()))
    /* Quals: his own squadron's page; a row offered where perms.ts mayEditQualsOf says so — his own, or as its admin */
    case 'quals': return mark(own, [me(), ...rosterOf(sq, todayIso())].some(pid => !!pid && homeOn(pid, todayIso()) === sq && mayEditQualsOf(pid)))
    /* the Leave War: the war of his own page is loaded; his own row (a member) or every row (an admin) — access.ts canEditRow */
    case 'leavewar': { const s: any = getState(); return mark(worldUnit() === sq, canEditRow(s.role, s.viewer ?? null, String(me()))) }
    /* the Tracker: his own squadron's page; the matrix's Tracker row (a member changes it as an admin does — D121) */
    case 'tracker': return mark(own, who === 'admin' || who === 'member' ? allows(who, T.tracker, 'U', null, null) : false)
    /* Admin: the tab an admin's (Shell.tsx, Drawer.tsx); Users follows his own page, Squadron config the schedule in view
       (D2317) — each changed only as an admin of that squadron */
    case 'admin': return mark(isAdmin() && (own || sched), (own && mayManageAccounts() && canEditOwn()) || (sched && canEditSched()))
  }
}

/* DRAWN CELLS THE APP ANSWERS OTHERWISE — put to him, never changed here to pass (D2305) */
/* (none since his D2381, 23 Nov 26: the one there was — an admin of 142 holding View of 149, with 149 picked, still had
   his Admin tab — answered by it: with 149 picked he is offered its View-only Sched and Help alone) */
const KNOWN: { page: RolePage; role: TableRole; drawn: Mark; app: Mark; why: string }[] = []

describe('every cell of the table is the app\'s own answer (D200, D2302)', () => {
  for (const role of TABLE_ROLES) {
    it(`${role}: each page opens, or not, and offers its controls, or not, as the table says`, () => {
      const sq = become(role)
      const got = Object.fromEntries(ROLES_TABLE.map(r => [r.page, answer(r.page, sq)]))
      const want = Object.fromEntries(ROLES_TABLE.map(r => {
        const k = KNOWN.find(x => x.page === r.page && x.role === role)
        expect(r.cells[role].mark, `${r.page}: KNOWN names the drawn cell as it is`).toBe(k ? k.drawn : r.cells[role].mark)
        return [r.page, k ? k.app : r.cells[role].mark]
      }))
      expect(got).toEqual(want)
    })
  }
})

describe('each note says what the tick leaves out — asked of the app', () => {
  it('1 · a member files his own inputs, and for others only duties and commitments while the admin allows it', () => {
    signInAs('ranger')
    expect(mayFileInputFor(PID.ranger, 'LL')).toBe(true)
    expect(mayFileInputFor(PID.hunter, 'Meeting')).toBe(true)
    expect(mayFileInputFor(PID.hunter, 'LL')).toBe(false)
  })
  it('2 · a member\'s own Quals row only, never the callsign, the Management or the Scheduler tick', () => {
    signInAs('ranger')
    expect(mayEditQualsOf(PID.ranger)).toBe(true)
    expect(mayEditQualsOf(PID.hunter)).toBe(false)
    expect([mayRenameCallsign(), mayTickManagement(), mayTickScheduler()]).toEqual([false, false, false])
  })
  it('3 · a member bids for his own leave only; deciding is an admin\'s', () => {
    signInAs('ranger')
    const s: any = getState()
    expect(canEditRow(s.role, s.viewer ?? null, PID.ranger)).toBe(true)
    expect(canEditRow(s.role, s.viewer ?? null, PID.hunter)).toBe(false)
    expect(mayDecideBids()).toBe(false)
  })
  it('4 · a member changes the Tracker but its flex settings (a setting — an admin\'s)', () => {
    signInAs('ranger')
    expect(allows('member', T.tracker, 'U', null, null)).toBe(true)
    expect(mayEditSettings()).toBe(false)
  })
  it('5 · an admin, and a Plan holder, does not make a squadron; a master admin does', () => {
    const place = () => placeOfOn('u142', todayIso())!.id
    signInAs('hunter')
    expect(addUnit('150', place(), ACCT.hunter)).toMatchObject({ ok: false })
    give(ACCT.hunter, 'u149', 'plan'); signInAs('hunter')
    expect(addUnit('150', place(), ACCT.hunter)).toMatchObject({ ok: false })
    signInAs('saber')
    expect(addUnit('150', place(), ACCT.hunter)).toMatchObject({ ok: true })
  })
})

describe('the fold on a person\'s opened row (picture k2)', () => {
  it('under the squadron lines, closed, "What each role allows"; inside the label, the grid as the table, the key and five notes', async () => {
    signInAs('saber')
    const page = render(<UsersPanel shown />)
    const $ = (sel: string) => page.container.querySelector(sel) as HTMLElement | null
    await act(async () => { fireEvent.click($(`#accList [data-person="${PID.hunter}"] .acc-tap`)!) })
    const fold = $('[data-testid="acc-roles"]') as HTMLDetailsElement
    expect(fold).not.toBeNull()
    expect(fold.open).toBe(false)
    expect(fold.previousElementSibling?.getAttribute('data-testid'), 'right under the squadron lines').toBe('acc-sq')
    expect(fold.querySelector('summary')!.textContent).toBe('What each role allows')
    expect(fold.querySelector('.acc-rt-lab')!.textContent).toBe(ROLES_LABEL)
    expect([...fold.querySelectorAll('thead th')].map(t => t.textContent)).toEqual(['Member', 'Admin', 'View', 'Plan', 'Master admin'])
    const grid = [...fold.querySelectorAll('tbody tr')].map(tr => [tr.querySelector('th')!.textContent, ...[...tr.querySelectorAll('td')].map(td => td.textContent)])
    expect(grid).toEqual(ROLES_TABLE.map(r => [r.name, ...TABLE_ROLES.map(k => MARK_WORD[r.cells[k].mark] + (r.cells[k].note ?? ''))]))
    expect(grid.map(g => g[0])).toEqual(['Edit Schedule', 'View-only Sched', 'Logic', 'Inputs', 'Quals', 'Leave War', 'Tracker', 'Admin'])
    expect(fold.querySelector('.acc-rt-key')!.textContent).toBe(ROLES_KEY)
    expect([...fold.querySelectorAll('.acc-rt-notes li')].map(l => l.textContent)).toEqual(ROLES_NOTES)
    expect(ROLES_NOTES).toHaveLength(5)
  })
  it('the grid as drawn (draw-roles.mjs TABLE): eight rows, the ticks, reads and dashes, notes 1–5 on the cells drawn', () => {
    const drawn = [
      ['Edit Schedule', '—', '✓', '—', '✓', '✓'],
      ['View-only Sched', 'read', 'read', 'read', 'read', 'read'],
      /* View's cell redrawn "—" by his D2381 (docs/mock/2026-11-23-view-only-tabs/7b) */
      ['Logic', 'read', '✓', '—', '✓', '✓'],
      ['Inputs', '✓1', '✓', '—', '✓', '✓'],
      ['Quals', '✓2', '✓', '—', '✓', '✓'],
      ['Leave War', '✓3', '✓', '—', '✓', '✓'],
      ['Tracker', '✓4', '✓', '—', '✓', '✓'],
      ['Admin', '—', '✓5', '—', '✓5', '✓'],
    ]
    expect(ROLES_TABLE.map(r => [r.name, ...TABLE_ROLES.map(k => MARK_WORD[r.cells[k].mark] + (r.cells[k].note ?? ''))])).toEqual(drawn)
  })
})
