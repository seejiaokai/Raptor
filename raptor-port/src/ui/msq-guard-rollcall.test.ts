/* THE GUARD RAIL'S ROLL-CALL TESTS — they read the source; no app is mounted (the guard rail's plan,
   docs/superpowers/plans/2026-11-25-msq-pick-guard-build1.md §3.4). Step 0 (K0) writes R9 alone; R1–R8 are written red
   first in the steps that build what they hold (§3.4's table).

   R9 "every test file of the guard and of part V sets up three squadrons" (his D2630; §10 step 0 (b); §21's ranges
   table): every test file under src/ whose name starts `msq-guard-`, `msq-s2-` or `msq-s3-` — those three prefixes
   EXACTLY, never a looser match, which would catch the eight existing `msq-users-*` and `msq-bell-*` files that stay on
   two squadrons — calls `withThird()` (test-support/msq-world.ts) in its set-up: a line of its own, at the start of the
   line, not inside a comment. `msq-s4-` (the posting sheet) has its own set-up (§21.4) and is not read here.
   This file is one of those it reads, so it calls `withThird()` itself.

   K1a (the first of the three passes of part A, chat 198) writes R1, R2, R8 and R7's planted cases for R1's and R2's
   scans. K1b (the second) writes R3 (every frame counted, per file, outside the Tracker), its planted cases in R7, the
   reports' half of R1 and R8's additions on his answers. R4 (the Tracker's list) is K1c's — `TO_COME` below names it,
   with the pass that owes it; K1c's last test proves the list empty. */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename } from 'node:path'
import { withThird } from '../test-support/msq-world'
import { GUARD_ROWS, GUARD_ORDER, FLOAT_WHERE, type GuardRow } from './guard'
import * as DRAWN from './windrawn'
import { forward, gone, _resetFloatWins } from './winorder'
import { saveRefused } from '../storage/savewait'
import { warSheetOpen, warShowOpen } from '../state/guard'

withThird()

const SRC = join(__dirname, '..')
export const R9_PREFIXES = ['msq-guard-', 'msq-s2-', 'msq-s3-'] as const

function testFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { if (name !== 'node_modules') testFiles(p, out) }
    else if (/\.test\.tsx?$/.test(name)) out.push(p)
  }
  return out
}
/* the files R9 reads: a test file whose own name starts with one of the three prefixes */
export const r9Caught = (file: string): boolean => R9_PREFIXES.some(px => basename(file).startsWith(px))
/* a call of withThird() on a line of its own — not a mention in a comment or a string */
export const callsWithThird = (src: string): boolean => /^withThird\(\)/m.test(src)

describe('R9 — every test file of the guard and of part V sets up three squadrons', () => {
  it('each msq-guard-, msq-s2- and msq-s3- test file calls withThird() in its set-up', () => {
    const caught = testFiles(SRC).filter(r9Caught)
    expect(caught.length, 'the guard\'s own files are found (this one among them)').toBeGreaterThan(0)
    const missing = caught.filter(f => !callsWithThird(readFileSync(f, 'utf8'))).map(f => f.slice(SRC.length + 1).replace(/\\/g, '/'))
    expect(missing, 'a test file of the guard rail or part V that does not set up the third squadron — add withThird() (his D2630)').toEqual([])
  })
  it('the match is the three prefixes exactly: the eight two-squadron files (msq-users-*, msq-bell-*) are not caught', () => {
    const two = testFiles(SRC).filter(f => /^msq-(users|bell)-/.test(basename(f)))
    expect(two.length, 'the eight existing files').toBe(8)
    expect(two.filter(r9Caught)).toEqual([])
    /* …nor a name that only contains a prefix, nor the posting sheet's own */
    for (const n of ['x-msq-guard-a.test.ts', 'msq-guardian.test.ts', 'msq-s4-posting.test.tsx', 'msq-s20-a.test.ts', 'msq-users-x.test.tsx'])
      expect(r9Caught(join(SRC, 'ui', n)), n).toBe(false)
    for (const n of ['msq-guard-a.test.ts', 'msq-s2-users.test.tsx', 'msq-s3-bell.test.tsx'])
      expect(r9Caught(join(SRC, 'ui', n)), n).toBe(true)
  })
  it('a mention in a comment is not a call', () => {
    expect(callsWithThird('/* withThird() */\nuseMsqWorld()\n')).toBe(false)
    expect(callsWithThird('import { withThird } from "x"\n// withThird()\n')).toBe(false)
    expect(callsWithThird('import { withThird } from "x"\n\nwithThird()\n')).toBe(true)
  })
})

/* ---- WHAT A LATER PASS OF PART A OWES (K1a's list — the brief's "One explicit list, TO_COME") ----
   Each row id, flag or test that K1b or K1c adds, with the pass that owes it, so that R1's "every flag has a row" and
   A2's "a row with no entry in the map fails" hold now for everything else. K1c's last test proves the list empty. */
export const TO_COME: { what: string; pass: 'K1c' | 'K2b' | 'after S2\'s U1 fix merges'; why: string }[] = [
  { what: 'R4', pass: 'K1c', why: 'the Tracker\'s list is whole — TRK_WINDOWS is K1c\'s' },
  { what: 'rows trk, trkask, trkinfo; trkinfo in R8\'s ruled list (D2597)', pass: 'K1c', why: 'the Tracker\'s bridge' },
  { what: 'R3 for src/tracker/', pass: 'K1c', why: 'the Tracker\'s frames are R4\'s, counted with its list' },
  { what: 'row addperson ("Add a person" — useGuardWork(\'addperson\', …))', pass: 'K2b', why: 'the form\'s report, after K1 (§21.1)' },
  { what: 'the short row\'s report — UsersPanel.tsx ForeignEditor (its `unsaved`, `data-unsaved` on the row), counted with the opened row', pass: 'after S2\'s U1 fix merges', why: 'the Admin → Users section\'s editor, not in this branch yet (the orchestrator, chat 204)' },
]

/* ---- the scans, each a function of the source text, so R7 can run them on a made-up source ---- */
/* every module flag a file declares — `export let NAME` at the start of a line (pops.test.ts's own reading) */
export const flagsOf = (src: string): string[] => [...src.matchAll(/^export let (\w+)/gm)].map(m => m[1]!)
/* the flags no row reads and the census does not name */
export function unlistedFlags(src: string, rows: readonly GuardRow[], census: Record<string, string>): string[] {
  const read = new Set(rows.flatMap(r => r.flags || []))
  return flagsOf(src).filter(f => !read.has(f) && !(f in census))
}
/* every movable window's id in a source: `<FloatWin … id="x"` — read up to the tag's first child (the next `<`), and a
   `bystander` (pull request 840's speed readout, which never joins the order — §9) left out */
export function floatIdsIn(src: string): string[] {
  const out: string[] = []
  for (const m of src.matchAll(/<FloatWin\b([^<]*)/g)) {
    const attrs = m[1]!
    if (/\bbystander\b/.test(attrs)) continue
    const id = /\bid="([^"]+)"/.exec(attrs)
    out.push(id ? id[1]! : '(an id that is not a plain string)')
  }
  return out
}
function srcFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { if (name !== 'node_modules') srcFiles(p, out) }
    else if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.(tsx?|jsx?)$/.test(name)) out.push(p)
  }
  return out
}
const read = (rel: string) => readFileSync(join(SRC, rel), 'utf8')

/* THE FLAGS THAT ARE NO WINDOW, each with its reason (R1's census — the shape of pops.test.ts's check against POPS_RESET).
   A flag a row reads is never here. */
const NOT_A_WINDOW: Record<string, string> = {
  // ui/pops.ts — the one-shot hand-offs and the second half of a pair whose first half has its row
  INSIGHTS_ALL: 'Insights\' "show all" choice inside an open Insights — the insights row reads INSIGHTS',
  AIRRID: 'the Traffic window\'s wave id, set and cleared with AIRKEY — the airpop row reads AIRKEY',
  INPEDIT_REFOUND: 'a hand-off: the same record found again after a refused save — the Input rows read INPEDIT',
  OILASK: 'a one-shot hand-off: the OIL question to open as the editor mounts — consumed at once',
  OILOWN: 'set and cleared with OILASK — a hand-off, no window',
  BELLAT: 'which bell the list hangs under, set with BELLLIST — the belllist row reads BELLLIST',
  // state/view.ts — view state, a page's own choices, reveals and selections: none is a window
  BOARDREV: 'a redraw counter of the board', CURPAGE: 'the page shown — rowReachable reads it, no window',
  ROSDAY: 'the crew panel\'s day', INPVIEW: 'the Inputs page\'s tab', INPMODE: 'the Inputs calendar\'s member / SANS mode',
  MEDASOF: 'the Medical view\'s date', CALMONTH: 'the Inputs and SANS calendars\' month',
  SANSHL: 'the SANS calendar\'s highlighted person — a way of looking',
  SANSDAYASK: 'an ask: the SANS day to open as the calendar mounts — spent at once (§9)',
  INPREVEAL: 'a reveal, spent by the calendar as it reads it', PLANREVEAL: 'a reveal, spent as read',
  MEDREVEAL: 'a reveal, spent as read', HISTMODE: 'History on — a mode of the schedule; the Changes window has its own row',
  HLOPEN: 'the highlight strip\'s phone fold — a fold, no window', HLGROUP: 'which highlight group is unfolded',
  CARRYDAY: 'the day carried between the two schedule pages', WEEKJUMP: 'a week-jump hand-off',
  PEEKLAND: 'the next-week peek\'s landing', BACKPROMPT: 'the "he\'s back" prompts on Admin → Users — a list on a page',
  QUALSFOCUS: 'a Quals row to bring into view — read once', ADMINOPEN: 'a request to open Admin → Users — read once',
  AVAILWIN_FOOT: 'ALL AVAIL\'s foot line, inside the avail window', AVAILWIN_FOOTID: 'the same foot line\'s id',
  AVAILWIN_BOX: 'where ALL AVAIL was left', CHGWIN_BOX: 'where the Changes window was left',
  SELID: 'the puck selection', SELPREV: 'the selection before', SELSEEN: 'the selection\'s seen counter',
  SEARCH: 'the search term', WFOCUS: 'a warning focused', PFOCUS: 'a person focused',
}

/* the files whose module flags R1 reads (§3.4 R1: "each `export let` of `ui/pops.ts` and of `state/view.ts`") */
const FLAG_FILES = ['ui/pops.ts', 'state/view.ts']
/* the modules a counting row's open() may be (§3.4 R1), besides the movable windows' own winUp and the K1b reports */
const ALLOWED_OPEN: Record<string, (() => boolean)[]> = {
  'ui/windrawn.ts': Object.values(DRAWN) as (() => boolean)[],
  'storage/savewait.ts': [saveRefused],
  'state/guard.ts': [warSheetOpen, warShowOpen],
}
/* a component's report (ui/guard.ts useGuardWork) or a closer it hands over (useGuardCloses): the call, in its frame */
const reportsIn = (src: string, hook: 'useGuardWork' | 'useGuardCloses'): string[] =>
  [...src.matchAll(new RegExp(`\\b${hook}\\('([a-z]+)'`, 'g'))].map(m => m[1]!)
const drawnName = (f: () => boolean): string | null => Object.entries(DRAWN).find(([, g]) => g === f)?.[0] ?? null

describe('R1 — every flag has a row, and every row reads what its window is drawn from', () => {
  it('each `export let` of ui/pops.ts and state/view.ts is read by a row, or named in the census with its reason', () => {
    for (const f of FLAG_FILES)
      expect(unlistedFlags(read(f), GUARD_ROWS, NOT_A_WINDOW), `${f}: a module flag no row of ui/guard.ts GUARD_ROWS reads — give its window a row, or name it in this test's census as not a window, with the reason`).toEqual([])
  })
  it('the census and the rows name only flags that exist, and no flag is in both', () => {
    /* a row may also read a flag of state/auth.ts (Logic's edit mode, LGEDIT) — R1's roll-call is of the two files above */
    const all = new Set([...FLAG_FILES, 'state/auth.ts'].flatMap(f => flagsOf(read(f))))
    expect(Object.keys(NOT_A_WINDOW).filter(f => !all.has(f)), 'a census entry for a flag that is gone').toEqual([])
    const rowFlags = GUARD_ROWS.flatMap(r => r.flags || [])
    expect(rowFlags.filter(f => !all.has(f)), 'a row reads a flag that is gone').toEqual([])
    expect(rowFlags.filter(f => f in NOT_A_WINDOW), 'a flag a row reads is not "no window"').toEqual([])
  })
  it('row ids are one each, and GUARD_ORDER holds every row once', () => {
    const ids = GUARD_ROWS.map(r => r.id)
    expect(new Set(ids).size, 'no id twice').toBe(ids.length)
    expect([...GUARD_ORDER].sort()).toEqual([...ids].sort())
  })
  it('each counting row\'s open() is a function of ui/windrawn.ts, storage/savewait.ts or state/guard.ts — or a movable window\'s own place in the order, or its component\'s own report', () => {
    const allowed = Object.values(ALLOWED_OPEN).flat()
    for (const r of GUARD_ROWS) {
      if (r.counts === 'no') continue
      if (r.id in FLOAT_WHERE) continue          // the next test proves these read winUp
      if (r.report) continue                     // the test after it proves these are their frame's own report
      expect(allowed.includes(r.open), `${r.id}: open() must be the very predicate its window is drawn from — a function of ui/windrawn.ts the component calls (§3.1), never a raw flag`).toBe(true)
    }
  })
  it('a reported row, a changed window (`dirty`) and a mode\'s end: its frame makes that very call, and no frame reports a row the table lacks', () => {
    const ids = new Set(GUARD_ROWS.map(r => r.id))
    for (const r of GUARD_ROWS) {
      const src = read(r.frame)
      if (r.report) expect(reportsIn(src, 'useGuardWork'), `${r.frame} reports ${r.id} (useGuardWork('${r.id}', …))`).toContain(r.id)
      if (r.dirty) expect(reportsIn(src, 'useGuardWork'), `${r.frame} reports what is changed in ${r.id} (useGuardWork('${r.id}', …))`).toContain(r.id)
      if (r.end) expect(reportsIn(src, 'useGuardCloses'), `${r.frame} hands over ${r.id}'s end (useGuardCloses('${r.id}', …))`).toContain(r.id)
    }
    /* every report and every closer in the source names a row of the table (the hook's type says so too; this reads it) */
    for (const f of srcFiles(SRC)) {
      const src = readFileSync(f, 'utf8')
      for (const id of [...reportsIn(src, 'useGuardWork'), ...reportsIn(src, 'useGuardCloses')])
        expect(ids.has(id as any), `${f.slice(SRC.length + 1)}: a report for "${id}", which is no row`).toBe(true)
    }
    /* the `holds` of the Calendar reads exactly its two forms and the sheet read in */
    expect(GUARD_ROWS.filter(r => r.holds).map(r => r.id)).toEqual(['days'])
  })
  it('a movable window\'s row follows the order of windows that are up, and nothing else', () => {
    _resetFloatWins()
    for (const id of Object.keys(FLOAT_WHERE)) {
      const r = GUARD_ROWS.find(x => x.id === id)!
      expect(r, `${id} has its row`).toBeTruthy()
      expect(r.open(), `${id}: not up`).toBe(false)
      forward(id)
      expect(r.open(), `${id}: up`).toBe(true)
      gone(id)
      expect(r.open(), `${id}: gone`).toBe(false)
    }
    _resetFloatWins()
  })
  it('each function of ui/windrawn.ts is read by a row, and the file that draws that window imports it and calls it', () => {
    const used = new Set<string>()
    for (const r of GUARD_ROWS) {
      const name = drawnName(r.open)
      if (!name) continue
      used.add(name)
      const src = read(r.frame)
      expect(new RegExp(`import\\s*\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*'\\./windrawn'`).test(src), `${r.frame} imports ${name} from './windrawn'`).toBe(true)
      expect(new RegExp(`\\b${name}\\(\\)`).test(src.replace(/import[^;\n]*\n/g, '')), `${r.frame} calls ${name}() for its early return or its hidden`).toBe(true)
    }
    expect(Object.keys(DRAWN).filter(n => !used.has(n)), 'a drawn predicate no row reads').toEqual([])
  })
  it('a "no" row carries its reason; a counting row carries the selector of its own box (read by tests only)', () => {
    for (const r of GUARD_ROWS) {
      if (r.counts === 'no') expect(r.why, `${r.id}: a "no" row says why`).toBeTruthy()
      else expect(r.sel, `${r.id}: its box's selector`).toBeTruthy()
    }
  })
})

describe('R2 — every movable window has a row', () => {
  it('every <FloatWin id> in a non-test file under src/ is a key of FLOAT_WHERE, and the map names no id the source lacks', () => {
    const inSrc = new Set(srcFiles(SRC).flatMap(f => floatIdsIn(readFileSync(f, 'utf8'))))
    const keys = Object.keys(FLOAT_WHERE)
    expect([...inSrc].filter(id => !keys.includes(id)), 'a movable window with no row — give it a row in ui/guard.ts FLOAT_WHERE').toEqual([])
    expect(keys.filter(id => !inSrc.has(id)), 'FLOAT_WHERE names a window the source no longer draws').toEqual([])
  })
  it('ALL AVAIL and Changes are not keys of it — their rows are their own (§3.2 (b))', () => {
    expect(Object.keys(FLOAT_WHERE)).not.toContain('avail')
    expect(Object.keys(FLOAT_WHERE)).not.toContain('chg')
  })
})

/* ---- R3 — EVERY FRAME IS COUNTED, ONE BY ONE (§3.4; K1b) ----
   In every non-test file under src/ but the Tracker's (R4's, K1c): each frame's mark — role="dialog", aria-modal,
   className="airpop…", className="modal", a <Sheet call — each call of the hooks a window is closed by (useSheetFocus,
   useEscClose, useEscWindow, escCloses, useFloatWin, useBarFree), so a window drawn as a plain box is seen by its keys,
   and each use of the five question components. The census pins, per file, every occurrence in the order it stands in the
   source, each mapped: `row <id>` — the frame of that row; `in <id>` — a part of that row's window, or a question
   standing over it; `no <reason>` — not a frame (a comment, a selector, the hook's own body, a component's own file whose
   uses are counted where it is drawn). A Leave War <Sheet call is `row lwshow` exactly when it carries the show-only mark
   (his D2740 — two calls), every other `row lwsheet`. */
const FRAME_RE = /role="dialog"|aria-modal|className="airpop|className="modal"|<Sheet\s|\buseSheetFocus\(|\buseEscClose\(|\buseEscWindow\(|\bescCloses\(|\buseFloatWin\(|\buseBarFree\(|<OilConfirm\b|<UpchitConfirm\b|<MedClashConfirm\b|<DocConfirm\b|<AskCard\b/g
/** the frame marks in a source, in order: the mark, and the rest of its line */
export const framesIn = (src: string): { mark: string; line: string }[] =>
  [...src.matchAll(FRAME_RE)].map(m => ({ mark: m[0].trim().replace(/\($/, ''), line: src.slice(m.index!, src.indexOf('\n', m.index!) < 0 ? undefined : src.indexOf('\n', m.index!)) }))
const rep = (n: number, label: string): string[] => Array.from({ length: n }, () => label)
const DEF = 'no the hook\'s own definition'
const OWN = 'no the question component\'s own file — each use is counted where it is drawn'
const FRAMES: Record<string, string[]> = {
  'leavewar/ui/BidPicker.tsx': ['row lwsheet', 'in lwsheet', 'row lwshow', 'row lwshow', 'row lwsheet', 'in lwsheet', 'row lwsheet'],
  'leavewar/ui/Chrome.tsx': ['no the under-manned list — a list over its own scrim, a tap outside closes it (§3.2 (f))', 'no the Legend — a list over its own scrim, a tap outside closes it (§3.2 (f), H2)'],
  'leavewar/ui/ClosedNoteSheet.tsx': ['row lwsheet'],
  'leavewar/ui/CounterForm.tsx': ['row lwsheet'],
  'leavewar/ui/DayList.tsx': ['row lwsheet'],
  'leavewar/ui/EventSheet.tsx': ['row lwsheet', 'row lwsheet'],
  'leavewar/ui/EventsSheet.tsx': ['row lwsheet'],
  'leavewar/ui/FlyRows.tsx': ['no the flying working-out — a peek a press outside closes (§3.2 (f))'],
  'leavewar/ui/GradesSheet.tsx': ['row lwsheet'],
  'leavewar/ui/ManningSheet.tsx': ['row lwsheet'],
  'leavewar/ui/Matrix.tsx': ['no a comment', 'no a selector — what counts as a window over the page', 'no an event\'s peek — a press outside closes it (§3.2 (f))'],
  'leavewar/ui/OilTracker.tsx': ['row lwsheet', 'row lwsheet'],
  'leavewar/ui/OpenDatesSheet.tsx': ['row lwsheet'],
  'leavewar/ui/PersonWindow.tsx': ['row lwsheet'],
  'leavewar/ui/RemarksSheet.tsx': ['row lwsheet'],
  'leavewar/ui/ReqNameForm.tsx': ['row lwsheet'],
  'leavewar/ui/ReqPanel.tsx': ['row lwsheet'],
  'leavewar/ui/SelectSheet.tsx': ['row lwsheet', 'in lwsheet'],
  'leavewar/ui/SettingsSheet.tsx': ['row lwsheet'],
  'leavewar/ui/Sheet.tsx': ['no a comment', 'row lwsheet'],
  'leavewar/ui/WarSheet.tsx': ['row lwsheet'],
  'leavewar/ui/select.ts': ['no a selector — what a press may start on'],
  'ui/AskCard.tsx': ['no a selector — the frames a card hangs in'],
  'ui/AvailWindow.tsx': rep(3, 'row avail'),
  'ui/ChangesWindow.tsx': rep(4, 'row chg'),
  'ui/DateBox.tsx': rep(2, 'row datecal'),
  'ui/DayTplModal.tsx': rep(4, 'row daytpl'),
  'ui/DocConfirm.tsx': rep(6, OWN),
  'ui/DocViewer.tsx': rep(7, 'row docview'),
  'ui/DraftsModal.tsx': rep(4, 'row drafts'),
  'ui/Drawer.tsx': ['row drawer', 'row sqnlist'],
  'ui/DutyTplModal.tsx': rep(4, 'row dutytpl'),
  'ui/FloatWindow.tsx': ['no a comment', 'no a comment', ...rep(4, 'no the movable windows\' frame — each window its own row, by its id (R2)')],
  'ui/InputWindow.tsx': ['row inputdlg', 'in inputdlg', 'in inputedit', 'in inputedit', 'in inputdlg', 'in inputedit', 'in inputedit', 'in inputedit', 'in inputedit', 'in inputedit', 'row inputdlg', 'row inputdlg', 'row inputdlg'],
  'ui/InputsCal.tsx': ['in inputsday', 'row icpick', 'row icpick'],
  'ui/InputsPage.tsx': ['row oilrevise'],
  'ui/MedClashConfirm.tsx': rep(6, OWN),
  'ui/MedMoveConfirm.tsx': rep(3, 'row medmove'),
  'ui/MedicalView.tsx': ['row medcal'],
  'ui/Modals.tsx': [...rep(8, 'row daypop'), ...rep(8, 'row airpop'), ...rep(4, 'row insights')],
  'ui/OilConfirm.tsx': rep(6, OWN),
  'ui/OilWaitSheet.tsx': ['row oilwait'],
  'ui/SchedBoard.tsx': ['row boardmenus', ...rep(5, 'row cxdlg'), ...rep(7, 'row sortall')],
  'ui/ScheduleInsightsMenu.tsx': ['row insmenu'],
  'ui/SquadronMenu.tsx': ['row sqnlist'],
  'ui/UpchitConfirm.tsx': rep(6, OWN),
  'ui/UsersFilter.tsx': ['no the filter\'s tick boxes on Admin → Users — a list a press outside closes'],
  'ui/UsersPanel.tsx': ['no the "Add a person" form\'s Escape — its report is step K2b\'s (TO_COME)'],
  'ui/WaveTplModal.tsx': rep(4, 'row wavetpl'),
  'ui/WeekCal.tsx': rep(8, 'row weekcal'),
  'ui/barfree.ts': [DEF],
  'ui/floatwin.ts': [DEF],
  'ui/schedule-tab.ts': ['no a selector — what Tab passes over', 'no a selector — what Tab passes over'],
  'ui/sheetfocus.ts': [DEF, DEF, DEF, 'no inside the hook\'s own body', 'no inside the hook\'s own body', 'no inside the hook\'s own body', DEF],
}
/** what is wrong between the source's frames and a census: a file not in it, a count that moved, a label naming no row,
 *  a Leave War sheet whose label and show-only mark disagree, a file the census names that has no frame */
export function frameProblems(files: Record<string, string>, census: Record<string, string[]>, ids: ReadonlySet<string>): string[] {
  const out: string[] = []
  for (const [f, src] of Object.entries(files)) {
    const got = framesIn(src)
    if (!got.length) { if (f in census) out.push(`${f}: the census names a file with no frame`); continue }
    const want = census[f]
    if (!want) { out.push(`${f}: ${got.length} frame(s) no census entry maps — give each a row in ui/guard.ts GUARD_ROWS, or name it here with its reason`); continue }
    if (want.length !== got.length) { out.push(`${f}: ${got.length} frame(s), the census maps ${want.length} — give the new one a row in ui/guard.ts GUARD_ROWS, or name it here with its reason`); continue }
    got.forEach((g, i) => {
      const [kind, ...rest] = want[i]!.split(' ')
      const what = rest.join(' ')
      if (kind === 'row' || kind === 'in') { if (!ids.has(what)) out.push(`${f} #${i + 1} (${g.mark}): "${what}" is no row`) }
      else if (kind !== 'no' || !what) out.push(`${f} #${i + 1} (${g.mark}): "${want[i]}" is neither a row nor a reason`)
      if (g.mark === '<Sheet' && kind === 'row' && (what === 'lwshow') !== /\bshowOnly\b/.test(g.line))
        out.push(`${f} #${i + 1}: a Leave War sheet is lwshow exactly when it carries showOnly (D2740)`)
    })
  }
  for (const f of Object.keys(census)) if (!(f in files)) out.push(`${f}: the census names a file that is gone`)
  return out
}
const SRC_NOT_TRACKER = (): Record<string, string> => Object.fromEntries(srcFiles(SRC)
  .map(f => [f.slice(SRC.length + 1).replace(/\\/g, '/'), f] as const)
  .filter(([rel]) => !rel.startsWith('tracker/'))
  .map(([rel, f]) => [rel, readFileSync(f, 'utf8')]))

describe('R3 — every frame is counted, one by one (outside the Tracker)', () => {
  it('each frame mark, closing hook and question component in a non-test file is mapped, per file, to a row, the window it stands in, or a reason', () => {
    expect(frameProblems(SRC_NOT_TRACKER(), FRAMES, new Set(GUARD_ROWS.map(r => r.id)))).toEqual([])
  })
  it('exactly two Leave War sheets carry the show-only mark — a leave filed on the Inputs page and an OIL award (D2740)', () => {
    const marked = Object.entries(SRC_NOT_TRACKER()).flatMap(([f, src]) => framesIn(src).filter(g => g.mark === '<Sheet' && /\bshowOnly\b/.test(g.line)).map(g => `${f} ${/testid="([^"]+)"/.exec(g.line)?.[1]}`))
    expect(marked).toEqual(['leavewar/ui/BidPicker.tsx raptor-sheet', 'leavewar/ui/BidPicker.tsx award-sheet'])
  })
})

/* R8's list: the windows that close by themselves, each with the ruling that lets it (D2596, D2597). An id joins only in
   the commit that cites his answer. `trkinfo` is K1c's (TO_COME). */
const RULED_CLOSES: Record<string, string> = {
  avail: 'D2596 — "Who\'s available" only shows things',
  chg: 'D2596 — Changes only shows things',
  insights: 'D2597 — Insights only shows things',
  sansday: 'D2597 — a SANS day only shows things',
  lwday: 'D2597 — the Leave War\'s day panel only shows things',
  /* K1b, on his answers */
  days: 'D2654 E1 — the Calendar closes at a pick unless a form of it is half done',
  inputsset: 'D2654 E1 — an unchanged settings window beside the Calendar closes too',
  sansset: 'D2654 E1 — an unchanged settings window beside the Calendar closes too',
  lwshow: 'D2740 — of the Leave War\'s windows a leave filed on Inputs and an OIL award close by themselves',
}
export function closesProblems(rows: readonly Pick<GuardRow, 'id' | 'counts' | 'close'>[], ruled: Record<string, string>): string[] {
  const out: string[] = []
  for (const r of rows) {
    if (r.counts === 'closes' && !r.close) out.push(`${r.id}: a "closes" row carries its closer`)
    if (r.counts !== 'closes' && r.close) out.push(`${r.id}: only a "closes" row carries a closer`)
    if (r.counts === 'closes' && !(r.id in ruled)) out.push(`${r.id}: a window closes by itself only on his ruling`)
  }
  for (const id of Object.keys(ruled)) if (!rows.some(r => r.id === id && r.counts === 'closes')) out.push(`${id}: ruled to close by itself, but no "closes" row`)
  return out
}

describe('R8 — a window closes by itself only on his ruling', () => {
  it('every "closes" row carries a close, no other row carries one, and the "closes" rows are exactly those his rulings name', () => {
    expect(closesProblems(GUARD_ROWS, RULED_CLOSES)).toEqual([])
  })
})

describe('R7 — the scans catch a planted window', () => {
  it('R1\'s scan: a new `export let` in state/view.ts is reported', () => {
    const planted = read('state/view.ts') + '\nexport let NEWWIN: any = null\n'
    expect(unlistedFlags(planted, GUARD_ROWS, NOT_A_WINDOW)).toEqual(['NEWWIN'])
  })
  it('R1\'s scan: a new `export let` in ui/pops.ts is reported', () => {
    const planted = read('ui/pops.ts') + '\nexport let SECONDWIN = false\n'
    expect(unlistedFlags(planted, GUARD_ROWS, NOT_A_WINDOW)).toEqual(['SECONDWIN'])
  })
  it('R2\'s scan: a second <FloatWin> in a listed file is reported; a bystander is not', () => {
    const planted = read('ui/DaysWindow.tsx') + '\nconst X = () => <FloatWin id="newwin" title="New" onClose={() => {}}><p>x</p></FloatWin>\n'
    const ids = floatIdsIn(planted)
    expect(ids).toContain('newwin')
    expect(ids.filter(id => !(id in FLOAT_WHERE))).toEqual(['newwin'])
    expect(floatIdsIn('<FloatWin id="timing" bystander title="t" onClose={() => {}}><i /></FloatWin>')).toEqual([])
    expect(floatIdsIn('<FloatWin id={someId} title="t" onClose={() => {}}><i /></FloatWin>'), 'an id R2 cannot read is reported, never skipped').toEqual(['(an id that is not a plain string)'])
  })
  it('R3\'s scan: a second dialog in Modals.tsx, a second <OilConfirm in a page file, a sheet marked show-only without his ruling and a new file with a frame are each reported', () => {
    const files = SRC_NOT_TRACKER()
    const ids = new Set(GUARD_ROWS.map(r => r.id))
    const plant = (f: string, extra: string) => frameProblems({ ...files, [f]: files[f] + extra }, FRAMES, ids)
    expect(plant('ui/Modals.tsx', '\nconst X = () => <div className="modal" id="newModal" />\n'))
      .toEqual(['ui/Modals.tsx: 21 frame(s), the census maps 20 — give the new one a row in ui/guard.ts GUARD_ROWS, or name it here with its reason'])
    expect(plant('ui/InputsPage.tsx', '\nconst Y = () => <OilConfirm who="x" />\n'))
      .toEqual(['ui/InputsPage.tsx: 2 frame(s), the census maps 1 — give the new one a row in ui/guard.ts GUARD_ROWS, or name it here with its reason'])
    const marked = files['leavewar/ui/BidPicker.tsx']!.replace('<Sheet testid="postin-sheet"', '<Sheet showOnly testid="postin-sheet"')
    expect(frameProblems({ ...files, 'leavewar/ui/BidPicker.tsx': marked }, FRAMES, ids))
      .toEqual(['leavewar/ui/BidPicker.tsx #7: a Leave War sheet is lwshow exactly when it carries showOnly (D2740)'])
    expect(frameProblems({ ...files, 'ui/NewPop.tsx': 'export const P = () => <div role="dialog" />\n' }, FRAMES, ids))
      .toEqual(['ui/NewPop.tsx: 1 frame(s) no census entry maps — give each a row in ui/guard.ts GUARD_ROWS, or name it here with its reason'])
  })
  it('R8\'s check: a "closes" row not ruled, a closer on a refusing row, and a ruled id with no row are each reported', () => {
    const rows = [...GUARD_ROWS, { id: 'newshow', counts: 'closes' as const, close: () => {} }]
    expect(closesProblems(rows as any, RULED_CLOSES)).toEqual(['newshow: a window closes by itself only on his ruling'])
    /* (a refusing row given a closer — K1a planted it on `days`, which closes by itself since K1b on his D2654 E1) */
    const withCloser = GUARD_ROWS.map(r => r.id === 'everywd' ? { ...r, close: () => {} } : r)
    expect(closesProblems(withCloser, RULED_CLOSES)).toEqual(['everywd: only a "closes" row carries a closer'])
    expect(closesProblems(GUARD_ROWS, { ...RULED_CLOSES, trkinfo: 'D2597' })).toEqual(['trkinfo: ruled to close by itself, but no "closes" row'])
  })
})
