/* THE GUARD: EVERY "MAY HE EDIT" IS ASKED OF THE RIGHT SQUADRON (step A of batch 1's second half — the plan
   docs/superpowers/plans/2026-11-22-multi-sqn-b1-second-half.md §2 items 1–2; the inventory, by kind, in
   docs/data-schema.md §Edit rights by squadron).

   Once the Schedules menu (step B) lets a person pick a squadron he holds only View of, a control that asks "is he an
   admin?" — the role alone — would offer him that squadron's edit controls. So every caller of the edit questions is one
   of four kinds, each with its own question (state/perms.ts, the block above mayEditOwnPage):
     schedule — the schedule in view: canEditSched, lgCanEdit, HOOKS.editMode (→ perms.ts maySchedEditPage);
     own      — his own squadron's page: canEditOwn (→ perms.ts mayEditOwnPage);
     named    — a squadron of its own (a settings window, a cut-off, the OIL list, a calendar lent): adminOfUnit(u);
     role     — a question about the person, not a squadron: isAdmin / mayEditSched, each with its reason below.
   The guard counts calls, not files: each file's count of each question must equal its entry, exactly. A new caller —
   a second one in a listed file too — turns it red until it is listed here with its kind and reason (and in the
   inventory); an entry no longer used turns it red as well. */
import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { countAll, countIn } from '../testing/enumguard'

const SRC = join(__dirname, '..')
const Q: Record<string, RegExp> = {
  canEditSched: /\bcanEditSched\s*\(/, lgCanEdit: /\blgCanEdit\s*\(/, editMode: /\bHOOKS\.editMode\s*\(/,
  canEditOwn: /\bcanEditOwn\s*\(/, adminOfUnit: /\badminOfUnit\s*\(/, mayWriteCal: /\bmayWriteCal\s*\(/,
  isAdmin: /\bisAdmin\s*\(/, mayEditSched: /\bmayEditSched\s*\(/,
  mayEditOwnPage: /\bmayEditOwnPage\s*\(/, maySchedEditPage: /\bmaySchedEditPage\s*\(/,
}
type Kind = 'schedule' | 'own' | 'named' | 'role' | 'the rule itself'
const SCHED = 'a control on the schedule in view'
const INVENTORY: Record<string, { n: Partial<Record<keyof typeof Q, number>>; kind: Kind[]; why: string }> = {
  /* ---- the rule itself ---- */
  'state/auth.ts': { n: { canEditSched: 1, canEditOwn: 1, mayEditOwnPage: 1, maySchedEditPage: 2 }, kind: ['the rule itself'], why: 'the three names the callers use, each one line over perms.ts' },
  'state/perms.ts': { n: { mayEditSched: 4, isAdmin: 4, adminOfUnit: 1 }, kind: ['the rule itself', 'role'], why: 'the questions themselves (mayEditOwnPage, adminOfUnit, maySchedEditPage over mayEditSched); isAdmin in the Quals rules (an admin\'s rename and ticks — the Quals page is his own squadron\'s, and its gate rules judge the row\'s squadron)' },
  /* ---- schedule: the schedule in view ---- */
  'state/mission-roles.ts': { n: { canEditSched: 3 }, kind: ['schedule'], why: `${SCHED}: the mission-role copy and its creation on Edit Schedule` },
  'state/sched-commit.ts': { n: { canEditSched: 1 }, kind: ['schedule'], why: `${SCHED}: Unpublish of a day` },
  'state/view.ts': { n: { canEditSched: 4 }, kind: ['schedule'], why: `${SCHED}: the LATE mark from the board, a warning muted, a note made public, a slot armed` },
  'state/store.ts': { n: { canEditSched: 3, isAdmin: 6, maySchedEditPage: 1 }, kind: ['schedule', 'role'], why: `${SCHED} (a section moved or reordered, edit mode itself); the landing (D8: Edit Schedule left for View-only Sched where maySchedEditPage fails, an admin only); isAdmin — the role in force set on the Leave War and the member-view switch, a question about the person` },
  'state/undo-wire.ts': { n: { canEditSched: 2, isAdmin: 4 }, kind: ['schedule', 'role'], why: 'which page an Undo lands on (Edit Schedule only where he edits the schedule in view); isAdmin with the account\'s own level in the step\'s squadron (stepStuck, the master\'s press, a restore\'s admin) — the role beside a squadron already named' },
  'ui/AdminPage.tsx': { n: { canEditSched: 5, isAdmin: 1 }, kind: ['schedule', 'role'], why: 'Admin → Squadron config\'s section and wave defaults follow the schedule in view (D2317); isAdmin — which Admin tabs show' },
  'ui/AvailWindow.tsx': { n: { canEditSched: 1 }, kind: ['schedule'], why: `${SCHED}: switching a man off earning in the ALL AVAIL window` },
  'ui/ChangesWindow.tsx': { n: { canEditSched: 1 }, kind: ['schedule'], why: `${SCHED}: the changes window's member form for anyone who may not edit it` },
  'ui/DayTplModal.tsx': { n: { canEditSched: 1 }, kind: ['schedule'], why: 'the day templates — the schedule in view\'s (D2317)' },
  'ui/DutyTplModal.tsx': { n: { canEditSched: 1 }, kind: ['schedule'], why: 'the duty templates — the schedule in view\'s (D2317)' },
  'ui/WaveTplModal.tsx': { n: { canEditSched: 2 }, kind: ['schedule'], why: 'the wave templates — the schedule in view\'s (D2317)' },
  'ui/DraftsModal.tsx': { n: { canEditSched: 1 }, kind: ['schedule'], why: 'the saved plans of the schedule in view' },
  'ui/Modals.tsx': { n: { canEditSched: 1 }, kind: ['schedule'], why: `${SCHED}: the aircraft box on Edit Schedule` },
  'ui/EditWeek.tsx': { n: { canEditSched: 3, editMode: 2 }, kind: ['schedule'], why: `${SCHED}: Edit Schedule's week` },
  'ui/SchedBoard.tsx': { n: { canEditSched: 1, editMode: 4 }, kind: ['schedule'], why: `${SCHED}: the Scheduler Board` },
  'ui/SecDefaultSnackbar.tsx': { n: { canEditSched: 2 }, kind: ['schedule'], why: `${SCHED}: "set as default?" after a section drag` },
  'ui/Shell.tsx': { n: { canEditSched: 2, isAdmin: 1, editMode: 1 }, kind: ['schedule', 'role'], why: 'Edit Schedule\'s tab, its clock and its changes door, a seat\'s right-click; isAdmin — the Admin and Logic tabs and the role chip, questions about the person' },
  'ui/LogicPage.tsx': { n: { canEditSched: 7, lgCanEdit: 4 }, kind: ['schedule'], why: 'Logic is the schedule in view\'s rules: a View holder reads it as a member does' },
  'ui/board-html.ts': { n: { canEditSched: 1 }, kind: ['schedule'], why: `${SCHED}: the board's markup` },
  'ui/board.ts': { n: { canEditSched: 12, editMode: 13 }, kind: ['schedule'], why: `${SCHED}: the board's handlers` },
  'ui/drag.ts': { n: { canEditSched: 1, editMode: 1 }, kind: ['schedule'], why: `${SCHED}: a puck dragged on the week` },
  'ui/highlights.ts': { n: { editMode: 1 }, kind: ['schedule'], why: `${SCHED}: the highlight's edit affordance` },
  'ui/html.ts': { n: { canEditSched: 11, editMode: 1 }, kind: ['schedule'], why: `${SCHED}: the week's markup` },
  'ui/interactions.ts': { n: { canEditSched: 30, editMode: 10 }, kind: ['schedule'], why: `${SCHED}: the week's handlers` },
  'ui/mission-role-offer.ts': { n: { canEditSched: 4 }, kind: ['schedule'], why: `${SCHED}: the mission-role offer on Edit Schedule` },
  'ui/peek.ts': { n: { editMode: 1 }, kind: ['schedule'], why: `${SCHED}: the next-week peek` },
  'ui/rowdrag.ts': { n: { canEditSched: 1 }, kind: ['schedule'], why: `${SCHED}: a row dragged` },
  'ui/schedule-tab.ts': { n: { canEditSched: 2, editMode: 2 }, kind: ['schedule'], why: `${SCHED}: Edit Schedule's tab state` },
  'ui/textedit.ts': { n: { canEditSched: 3 }, kind: ['schedule'], why: `${SCHED}: the typed boxes of the week and board` },
  'probe-bridge.ts': { n: { editMode: 1 }, kind: ['schedule'], why: 'the developer\'s test bridge reads edit mode for the browser tests' },
  /* ---- own: his own squadron's page ---- */
  'ui/inputedit.tsx': { n: { canEditSched: 2, canEditOwn: 11 }, kind: ['own', 'schedule'], why: 'the Inputs window\'s scheduler powers are his own squadron\'s page\'s (the save door then judges each man\'s squadron); Admin → Data\'s two clears act on the schedule in view\'s planning notes and change history (R-O5) — schedule' },
  'ui/InputWindow.tsx': { n: { canEditOwn: 6, adminOfUnit: 1 }, kind: ['own', 'named'], why: 'the Inputs window, his own squadron\'s page; an input of a squadron he is not an admin of opens read only (adminOfUnit of its squadron)' },
  'ui/InputsCal.tsx': { n: { canEditOwn: 1 }, kind: ['own'], why: 'the Inputs calendar, his own squadron\'s page' },
  'ui/InputsPage.tsx': { n: { isAdmin: 3, canEditOwn: 1 }, kind: ['own', 'role'], why: 'the Inputs page\'s person filter; isAdmin — its gear (the window it opens asks adminOfUnit of its squadron)' },
  'ui/caldrag.ts': { n: { canEditOwn: 3 }, kind: ['own'], why: 'the Inputs calendar\'s drag, his own squadron\'s page' },
  'ui/reqdoor.ts': { n: { canEditOwn: 6 }, kind: ['own'], why: 'an input\'s place on a row — the input\'s own door (the save door judges each man\'s squadron)' },
  'ui/DocViewer.tsx': { n: { canEditOwn: 1 }, kind: ['own'], why: 'an input\'s documents, his own squadron\'s page' },
  'ui/peoplepick-model.ts': { n: { canEditOwn: 4 }, kind: ['own'], why: 'whom an input is filed for (each man then by the who-rule)' },
  'ui/PeoplePick.tsx': { n: { canEditOwn: 1 }, kind: ['own'], why: 'the Inputs people picker\'s switch' },
  'leavewar/sync.ts': { n: { canEditOwn: 1 }, kind: ['own'], why: 'the OIL list raised after filing — his own squadron\'s' },
  'ui/QualsPage.tsx': { n: { isAdmin: 1 }, kind: ['role'], why: 'the Quals page is pageUnit(\'own\')\'s (a View holder\'s home; a Plan holder\'s or master\'s pick, where he is an admin): the role answers it; each row\'s write is judged by its man\'s squadron (mayEditQualsOf)' },
  'ui/SansCal.tsx': { n: { isAdmin: 1 }, kind: ['role'], why: 'the SANS calendar\'s gear (its window asks adminOfUnit of its squadron)' },
  'ui/SansDay.tsx': { n: { isAdmin: 1 }, kind: ['role'], why: 'the SANS day\'s "Calendar…" door (its window asks adminOfUnit of its squadron)' },
  'ui/sansadd.ts': { n: { isAdmin: 1 }, kind: ['role'], why: 'who may add on the SANS calendar — his own squadron\'s page; the role answers it' },
  /* ---- named: a squadron of its own ---- */
  'state/cutoff.ts': { n: { adminOfUnit: 1 }, kind: ['named'], why: 'the late cut-off of the squadron named' },
  'state/roster-add.ts': { n: { adminOfUnit: 1 }, kind: ['named'], why: 'the Home squadron Add a person names: an admin of THAT squadron (batch 1\'s second half §4 item 7)' },
  'state/plan.ts': { n: { adminOfUnit: 1, mayWriteCal: 9 }, kind: ['named'], why: 'the planning calendar\'s verbs write the calendar lent to them (ui/owncal.ts), else the loaded one: an admin of THAT squadron' },
  'ui/DaysWindow.tsx': { n: { adminOfUnit: 1 }, kind: ['named'], why: 'the Calendar window edits the squadron it opened on' },
  'ui/InputsSettings.tsx': { n: { adminOfUnit: 1 }, kind: ['named'], why: 'the Inputs settings window edits the squadron it opened on' },
  'ui/SansSettings.tsx': { n: { adminOfUnit: 1 }, kind: ['named'], why: 'the SANS settings window edits the squadron it opened on' },
  'ui/oilday.ts': { n: { adminOfUnit: 1 }, kind: ['named'], why: 'the OIL list of the squadron it lists' },
  /* ---- role: a question about the person ---- */
  'state/accounts.ts': { n: { isAdmin: 1 }, kind: ['role'], why: 'who may answer access requests at all (each request then by its squadron — step D)' },
  'state/notices.ts': { n: { mayEditSched: 2 }, kind: ['role'], why: 'the bell\'s own reads (the admin lines\' audience is the squadron\'s — step F)' },
  'state/reports.ts': { n: { isAdmin: 1 }, kind: ['role'], why: 'the bug reports\' new-mark is an admin\'s' },
  'ui/Drawer.tsx': { n: { isAdmin: 1 }, kind: ['role'], why: 'the drawer\'s admin entries' },
  'ui/HelpPage.tsx': { n: { isAdmin: 1 }, kind: ['role'], why: 'the help page\'s admin sections' },
}

const counts: Record<string, Record<string, number>> = {}
for (const [k, re] of Object.entries(Q)) for (const [f, n] of Object.entries(countAll(SRC, re))) (counts[f] ??= {})[k] = n

describe('every "may he edit" is one of the four kinds, listed with its reason (step A)', () => {
  it('each file asks each question exactly as often as listed — no more, no fewer', () => {
    const listed = Object.fromEntries(Object.entries(INVENTORY).map(([f, e]) => [f, e.n]))
    expect(counts, 'a caller of an edit question outside the inventory: list it here with its kind and reason (and in docs/data-schema.md §Edit rights by squadron), or ask the question its kind asks').toEqual(listed)
  })
  it('every entry says why, and names its kind', () => {
    for (const [f, e] of Object.entries(INVENTORY)) {
      expect(e.why.length, f).toBeGreaterThan(20)
      expect(e.kind.length, f).toBeGreaterThan(0)
    }
  })
  it('the counter sees a call however it is spaced, and never a comment or a quoted name', () => {
    const n = (s: string) => countIn(s, Q.canEditSched!)
    expect(n('if (!canEditSched()) return')).toBe(1)
    expect(n('x = canEditSched ()')).toBe(1)
    expect(n('/* canEditSched() */ y()')).toBe(0)
    expect(n("t('canEditSched()')")).toBe(0)
  })
  it('red-proven: a caller added outside the inventory is seen', () => {
    const extra = { ...counts, 'ui/NewPage.tsx': { canEditSched: 1 } }
    const listed = Object.fromEntries(Object.entries(INVENTORY).map(([f, e]) => [f, e.n]))
    expect(extra).not.toEqual(listed)
  })
})
