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
   reports' half of R1 and R8's additions on his answers. K1c (the third) writes R4 — the Tracker's list, and its frames,
   which R3 leaves to it — R7's planted cases for R4, R1's and R8's Tracker additions, and the last test, which proves that
   `TO_COME` holds nothing a pass of K1 owes. */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename } from 'node:path'
import { withThird } from '../test-support/msq-world'
import { GUARD_ROWS, GUARD_ORDER, FLOAT_WHERE, trackerWindowUp, TRACKER_SHOWS, type GuardRow } from './guard'
import { trackerAsking } from '../tracker/role.js'
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
/* (K1c, the last pass of part A, built R4, the Tracker's rows and the Tracker's frames — held in R4's own census, below —
   and took them off; what is left is owed by a later step by name. K2b built the row addperson — the "Add a person"
   form's report, held by R1 and R3 like every other — and took it off) */
export const TO_COME: { what: string; pass: 'after S2\'s U1 fix merges'; why: string }[] = [
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
  /* K1c: the Tracker's bridge (tracker/role.js) — what its own table says is open, read through ui/guard.ts's three
     readers of it (the last test of R1 reads that they read the bridge) */
  'tracker/role.js': [trackerWindowUp, trackerAsking, ...Object.values(TRACKER_SHOWS)],
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
  it('(K1c) the Tracker\'s rows read its bridge: ui/guard.ts takes what is open from tracker/role.js, never from core.js, and each Tracker row\'s open() is one of those readers', () => {
    const src = read('ui/guard.ts')
    expect(/import\s*\{[^}]*\btrackerWindowsOpen\b[^}]*\btrackerAsking\b[^}]*\}\s*from\s*'\.\.\/tracker\/role\.js'/.test(src), 'ui/guard.ts imports the bridge').toBe(true)
    expect(/from\s*'[^']*tracker\/app\//.test(src), 'ui/guard.ts never imports the Tracker\'s engine').toBe(false)
    const bridge = ALLOWED_OPEN['tracker/role.js']!
    const trkRows = GUARD_ROWS.filter(r => r.id.startsWith('trk'))
    expect(trkRows.map(r => r.id).sort()).toEqual(['trk', 'trkask', 'trkdown', 'trkfail', 'trkinfo', 'trkpop'])
    for (const r of trkRows) expect(bridge.includes(r.open), `${r.id} reads the Tracker's bridge`).toBe(true)
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
  'ui/UsersPanel.tsx': ['in addperson'],
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
  /* K1c, the Tracker — one row a window, each with the ruling that lets it */
  trkinfo: 'D2597 — a Tracker event\'s details (the ⓘ bubble) only shows things',
  trkpop: 'D2654 E2 — the Tracker\'s marking window closes, as today',
  trkdown: 'D2654 E4 — the Info panel\'s Down days close by themselves, in sight or behind the Flow chart tab',
  trkfail: 'D2654 E4 — the Info panel\'s Failures close by themselves, in sight or behind the Flow chart tab',
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
    /* (K1a planted this as `trkinfo`, which K1c builds: a made-up id stands in) */
    expect(closesProblems(GUARD_ROWS, { ...RULED_CLOSES, trknew: 'D2597' })).toEqual(['trknew: ruled to close by itself, but no "closes" row'])
  })
  it('R4\'s scans (K1c): a new state reset in endSession, a second window drawn in Modals.jsx, an Info-panel window without its mark, a window of the table no frame draws and a closing state with no row are each reported', () => {
    const core = read(TRK_CORE)
    const reset = core.replace('  sessionSerial++;\n', '  sessionSerial++;\n  newWin = null;\n')
    expect(reset, 'the premise: planted').not.toBe(core)
    expect(unlistedResets(reset)).toEqual(['newWin'])
    const files = TRK_FILES()
    expect(trkFrameProblems({ ...files, 'tracker/components/Modals.jsx': files['tracker/components/Modals.jsx'] + '\nconst X = () => <div className="modal" id="newModal" />\n' }, TRK_FRAMES, trkTable(core)))
      .toEqual(['tracker/components/Modals.jsx: 9 frame(s), the census maps 8 — give the new one an id in core.js TRK_WINDOWS, or name it here with its reason'])
    const unmarked = core.replace(`{ id: 'lullCopy', open: () => !!lullCopy, counts: 'window', panel: 'info' }`, `{ id: 'lullCopy', open: () => !!lullCopy, counts: 'window' }`)
    expect(unmarked, 'the premise: planted').not.toBe(core)
    expect(trkFrameProblems(files, TRK_FRAMES, trkTable(unmarked))).toEqual(['tracker/components/SidePanel.jsx #2: lullCopy is drawn in the Info panel and carries no panel: \'info\''])
    const added = core.replace(`  { id: 'arrangeMode',`, `  { id: 'newBox', open: () => false, counts: 'window' },\n  { id: 'arrangeMode',`)
    expect(trkFrameProblems(files, TRK_FRAMES, trkTable(added))).toEqual(['newBox: a window of TRK_WINDOWS no frame the census maps draws'])
    const closing = core.replace(`{ id: 'editId', open: () => editId != null, counts: 'window' }`, `{ id: 'editId', open: () => editId != null, counts: 'closes' }`)
    expect(trkClosesProblems(trkTable(closing))).toEqual(['editId: a Tracker window that closes by itself has no row of its own in ui/guard.ts with his ruling'])
  })
})

/* ---- R4 — THE TRACKER'S LIST IS WHOLE (§3.4; K1c) ----
   The Tracker's windows are module state in tracker/app/core.js, read by ui/guard.ts on the bridge (tracker/role.js) from
   one read-only table, TRK_WINDOWS. Read from the source: (a) every module-level name endSession()'s body resets is an id of
   the table, or in this test's own list of what is not a window, with its reason — and an id it ends without naming
   (its questions, the bubble) is ended there by the call named; (b) every frame drawn under src/tracker/ — R3's marks, and
   the Tracker's own `.pop`, `.lullcal` and the Show All panel — is counted per file and mapped to an id (R3's census leaves
   src/tracker/ out: the Tracker's frames are held here, with its list); (c) each id drawn inside SidePanel.jsx — the Info
   panel — carries `panel: 'info'`, and no other does; (d) each window of the table is drawn by a frame the census maps,
   but the bubble, which core.js draws itself; (e) each id that closes by itself has its row in ui/guard.ts (R8 cites the
   ruling). */
const TRK_CORE = 'tracker/app/core.js'
type TrkWin = { id: string; counts: string; panel?: string }
/** the table, read from core.js's source: each `{ id: '…', open: …, counts: '…'(, panel: '…')? }` line of TRK_WINDOWS */
export function trkTable(src: string): TrkWin[] {
  const at = src.indexOf('export const TRK_WINDOWS = Object.freeze([')
  if (at < 0) return []
  const body = src.slice(at, src.indexOf(']);', at))
  return [...body.matchAll(/\{ id: '(\w+)', open: [^\n]*?, counts: '(\w+)'(?:, panel: '(\w+)')? \}/g)].map(m => ({ id: m[1]!, counts: m[2]!, ...(m[3] ? { panel: m[3] } : {}) }))
}
/** the names endSession()'s body assigns (`name = …`, `name++`), its comments left out */
export function endSessionResets(src: string): string[] {
  const at = src.indexOf('function endSession() {')
  if (at < 0) return ['(no endSession() found)']
  let i = src.indexOf('{', at), depth = 0, end = i
  for (; end < src.length; end++) { if (src[end] === '{') depth++; else if (src[end] === '}' && --depth === 0) break }
  const body = src.slice(i + 1, end).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')
  return [...new Set([...body.matchAll(/(?<![\w$.])([A-Za-z_$][\w$]*)\s*(?:=(?![=>])|\+\+|--)/g)].map(m => m[1]!))]
}
/* THE STATES endSession() RESETS THAT ARE NO WINDOW, each with its reason */
const NOT_A_TRK_WINDOW: Record<string, string> = {
  sessionSerial: 'the session\'s own counter — a job of the last session stops at its next question',
  undoStack: 'the chart editor\'s Undo list — the person leaving\'s', redoStack: 'its Redo list',
  popDoneDate: 'the marking window\'s "Done on" day — part of `pop`', popFailDate: 'its "Failed on" day — part of `pop`',
  popMsg: 'its one line of refusal — part of `pop`, cleared with it',
  kbdShown: 'the keyboard\'s ring on the chart', popByKey: 'the marking window opened from the keyboard — part of `pop`',
  infoByKey: 'the details editor opened from the keyboard — part of `infoId`', kbdCame: 'where the keyboard came from on the chart',
  saveStat: 'the bar\'s save words', arrangeFlips: 'a counter of Edit chart layout\'s turns',
  connectSrc: 'Edit chart layout\'s half-made link — inside the mode', drawing: 'its line being drawn — inside the mode',
  selBalls: 'its selection — inside the mode', tool: 'its tool', view: 'its canvas\'s pan and zoom',
  hintFlash: 'a passing hint line over the chart', searchHit: 'the search\'s ring', searchQ: 'the search\'s words',
  searchCount: 'the search\'s count', searchAt: 'the search\'s place', searchHits: 'the search\'s finds',
}
/* the ids endSession() ends without naming them, and the call it ends each by */
const ENDED_BY_CALL: Record<string, string> = { dlg: 'dlgCancelAll()', bubble: 'hideDetailBubble()' }
export const unlistedResets = (src: string): string[] => {
  const ids = new Set(trkTable(src).map(w => w.id))
  return endSessionResets(src).filter(n => !ids.has(n) && !(n in NOT_A_TRK_WINDOW))
}
/* the frame marks of the Tracker: R3's, and the Tracker's own pop-up classes */
const TRK_FRAME_RE = new RegExp(FRAME_RE.source + '|className="pop"|className="lullcal|id="showAllPanel"', 'g')
const trkFramesIn = (src: string): string[] => [...src.matchAll(TRK_FRAME_RE)].map(m => m[0].trim().replace(/\($/, ''))
/* THE TRACKER'S FRAMES, per file, in source order: `trk <id>` — drawn from that TRK_WINDOWS state; `no <reason>` */
const TRK_FRAMES: Record<string, string[]> = {
  'tracker/components/FlexSettings.jsx': ['trk flexWinOpen', 'trk flexWinOpen'],
  'tracker/components/Legend.jsx': ['no the Legend — a list, a press outside closes it (§3.2 (g))'],
  'tracker/components/Modals.jsx': ['trk dlg', 'trk dlg', 'trk dlg', 'trk editId', 'trk infoId', 'trk sylModalOpen', 'trk ordMode', 'trk copyOpen'],
  'tracker/components/Pop.jsx': ['trk pop', 'trk pop'],
  'tracker/components/ShowAllPanel.jsx': ['trk showAllOpen'],
  'tracker/components/SidePanel.jsx': ['trk lullPick', 'trk lullCopy', 'trk failLog', 'trk downLog', 'trk downLog'],
}
const PANEL_FILE = 'tracker/components/SidePanel.jsx'
/* drawn by core.js itself, never by a component: the bubble's one element on the page body (showDetailBubble) */
const DRAWN_BY_CORE = ['bubble']
export function trkFrameProblems(files: Record<string, string>, census: Record<string, string[]>, table: TrkWin[]): string[] {
  const out: string[] = []
  const byId = new Map(table.map(w => [w.id, w]))
  const drawn = new Set<string>()
  for (const [f, src] of Object.entries(files)) {
    const got = trkFramesIn(src)
    if (!got.length) { if (f in census) out.push(`${f}: the census names a file with no frame`); continue }
    const want = census[f]
    if (!want) { out.push(`${f}: ${got.length} frame(s) no census entry maps — give each an id in core.js TRK_WINDOWS, or name it here with its reason`); continue }
    if (want.length !== got.length) { out.push(`${f}: ${got.length} frame(s), the census maps ${want.length} — give the new one an id in core.js TRK_WINDOWS, or name it here with its reason`); continue }
    want.forEach((w, i) => {
      const [kind, ...rest] = w.split(' ')
      const what = rest.join(' ')
      if (kind === 'trk') {
        const win = byId.get(what)
        if (!win) { out.push(`${f} #${i + 1} (${got[i]}): "${what}" is no id of TRK_WINDOWS`); return }
        drawn.add(what)
        if (f === PANEL_FILE && win.panel !== 'info') out.push(`${f} #${i + 1}: ${what} is drawn in the Info panel and carries no panel: 'info'`)
        if (f !== PANEL_FILE && win.panel === 'info') out.push(`${f} #${i + 1}: ${what} carries panel: 'info' but is drawn outside the Info panel`)
      } else if (kind !== 'no' || !what) out.push(`${f} #${i + 1} (${got[i]}): "${w}" is neither an id nor a reason`)
    })
  }
  for (const f of Object.keys(census)) if (!(f in files)) out.push(`${f}: the census names a file that is gone`)
  /* (read only once every file maps: a file whose count moved maps none of its frames) */
  if (!out.length) for (const w of table) if (w.counts !== 'no' && !drawn.has(w.id) && !DRAWN_BY_CORE.includes(w.id)) out.push(`${w.id}: a window of TRK_WINDOWS no frame the census maps draws`)
  return out
}
/* each TRK_WINDOWS state that closes by itself, and its row in ui/guard.ts (R8's list cites the ruling) */
const TRK_CLOSE_ROW: Record<string, string> = { bubble: 'trkinfo', pop: 'trkpop', downLog: 'trkdown', failLog: 'trkfail' }
export function trkClosesProblems(table: TrkWin[]): string[] {
  const out: string[] = []
  for (const w of table) {
    const rowId = TRK_CLOSE_ROW[w.id]
    if (w.counts === 'closes' && !(rowId && GUARD_ROWS.some(r => r.id === rowId && r.counts === 'closes') && rowId in RULED_CLOSES))
      out.push(`${w.id}: a Tracker window that closes by itself has no row of its own in ui/guard.ts with his ruling`)
    if (w.counts !== 'closes' && rowId) out.push(`${w.id}: has a closing row but its table counts it '${w.counts}'`)
  }
  for (const id of Object.keys(TRK_CLOSE_ROW)) if (!table.some(w => w.id === id)) out.push(`${id}: a closing row for a state the table no longer has`)
  return out
}
const TRK_FILES = (): Record<string, string> => Object.fromEntries(srcFiles(join(SRC, 'tracker'))
  .map(f => [f.slice(SRC.length + 1).replace(/\\/g, '/'), readFileSync(f, 'utf8')] as const))

describe('R4 — the Tracker\'s list is whole (K1c)', () => {
  it('the table is read from core.js: one id each, every count a known one; its modes are Edit chart layout, Details mode and the tools set', () => {
    const t = trkTable(read(TRK_CORE))
    expect(t.length, 'TRK_WINDOWS read from the source').toBeGreaterThan(10)
    expect(new Set(t.map(w => w.id)).size).toBe(t.length)
    for (const w of t) expect(['window', 'closes', 'no'], w.id).toContain(w.counts)
    expect(t.filter(w => w.counts === 'no').map(w => w.id)).toEqual(['arrangeMode', 'showDetails', 'toolsOpen'])
  })
  it('every module-level name endSession() resets is an id of TRK_WINDOWS or named in this test\'s list with its reason; an id ended by a call is ended there by that call', () => {
    const core = read(TRK_CORE)
    expect(unlistedResets(core), 'a state endSession() resets that is neither a TRK_WINDOWS id nor named here as no window — give it an id in core.js TRK_WINDOWS, or name it here with its reason').toEqual([])
    const resets = endSessionResets(core)
    expect(Object.keys(NOT_A_TRK_WINDOW).filter(n => !resets.includes(n)), 'a name in the list endSession() no longer resets').toEqual([])
    const lets = new Set([...core.matchAll(/(?:^|;[ \t]*)(?:export )?let ([^;\n]+)/gm)].flatMap(m => [...m[1]!.matchAll(/(?:^|,)\s*([A-Za-z_$][\w$]*)\s*(?==|,|$)/g)].map(x => x[1]!)))
    expect(resets.filter(n => !lets.has(n)), 'each is a module-level `let`').toEqual([])
    const t = trkTable(core)
    for (const w of t) {
      if (resets.includes(w.id)) continue
      expect(ENDED_BY_CALL[w.id], `${w.id}: endSession() neither resets it by name nor names the call that ends it`).toBeTruthy()
      expect(core.slice(core.indexOf('function endSession() {'), core.indexOf('function endSession() {') + 3000)).toContain(ENDED_BY_CALL[w.id]!)
    }
  })
  it('every frame under src/tracker/ is counted per file and mapped to a TRK_WINDOWS id or a reason; the Info panel\'s ids carry panel: \'info\', no other does; every window of the table is drawn', () => {
    expect(trkFrameProblems(TRK_FILES(), TRK_FRAMES, trkTable(read(TRK_CORE)))).toEqual([])
    expect(trkTable(read(TRK_CORE)).filter(w => w.panel === 'info').map(w => w.id).sort()).toEqual(['downLog', 'failLog', 'lullCopy', 'lullPick'])
  })
  it('R3 and R4 between them read every source file: the files R3\'s census leaves out are exactly src/tracker/\'s, which R4 reads', () => {
    const all = srcFiles(SRC).map(f => f.slice(SRC.length + 1).replace(/\\/g, '/'))
    const r3 = new Set(Object.keys(SRC_NOT_TRACKER())), r4 = new Set(Object.keys(TRK_FILES()))
    expect(all.filter(f => !r3.has(f) && !r4.has(f))).toEqual([])
    expect([...r4].every(f => f.startsWith('tracker/') && !r3.has(f))).toBe(true)
  })
  it('each Tracker window that closes by itself has its own row in ui/guard.ts, and R8\'s list cites his ruling for it', () => {
    expect(trkClosesProblems(trkTable(read(TRK_CORE)))).toEqual([])
    expect(trkTable(read(TRK_CORE)).filter(w => w.counts === 'closes').map(w => w.id)).toEqual(['pop', 'bubble', 'downLog', 'failLog'])
  })
})

/* ================= R5 (b), (c), (d) — THE PAGE DOOR AND THE BELL'S KINDS (step K6 — the plan §4.5) =================
   Read from the source, as R1–R4 are. (b) no file but state/store.ts reaches the page change past its door. (c) every call
   of the door has its kind, written here with its reason — a forgotten `then` (a window opened after the door answered
   no), a forgotten ask-first line, or a new caller nobody weighed fails here. (d) every notice kind has a tap written for
   it in ui/topstate.ts LINE_KINDS. */
const SRC_EXT = /\.(ts|tsx|js|jsx)$/
function doorSrcFiles(dir: string = SRC, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) { if (name !== 'node_modules' && name !== 'test-support') doorSrcFiles(p, out) }
    else if (SRC_EXT.test(name) && !/\.test\.|\.spec\.|\.d\.ts$/.test(name)) out.push(p)
  }
  return out
}
const relOf = (abs: string) => abs.slice(SRC.length + 1).split('\\').join('/')
/* comments blanked, line breaks kept (a call in a comment is not a call) */
const uncomment = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')
/* the module an import names, as a path under src/ with no extension */
function importsOf(rel: string, src: string): { names: string[]; ns: string | null; mod: string }[] {
  const out: { names: string[]; ns: string | null; mod: string }[] = []
  const dir = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/')) : ''
  const resolve = (spec: string) => {
    if (!spec.startsWith('.')) return spec
    const parts = (dir ? dir.split('/') : [])
    for (const seg of spec.split('/')) { if (seg === '..') parts.pop(); else if (seg !== '.') parts.push(seg) }
    return parts.join('/').replace(SRC_EXT, '')
  }
  for (const m of src.matchAll(/(?:import|export)\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g)) {
    out.push({ names: m[1]!.split(',').map(x => x.trim().split(/\s+as\s+/)[0]!.replace(/^type\s+/, '')).filter(Boolean), ns: null, mod: resolve(m[2]!) })
  }
  for (const m of src.matchAll(/import\s*\*\s*as\s*(\w+)\s*from\s*['"]([^'"]+)['"]/g)) out.push({ names: [], ns: m[1]!, mod: resolve(m[2]!) })
  return out
}
/** R5 (b): what in this file reaches state/view.ts setPage — a named import of it, or a call through a namespace */
export function viewSetPageReaches(rel: string, raw: string): string[] {
  if (rel === 'state/store.ts' || rel === 'state/view.ts') return []
  const src = uncomment(raw)
  const hits: string[] = []
  for (const im of importsOf(rel, src)) {
    if (im.mod !== 'state/view') continue
    if (im.names.includes('setPage')) hits.push(`${rel}: imports setPage from state/view`)
    if (im.ns && new RegExp(`\\b${im.ns}\\.setPage\\b`).test(src)) hits.push(`${rel}: calls ${im.ns}.setPage`)
  }
  return hits
}

type DoorKind = 'last' | 'then' | 'answer' | 'asks first'
/* every call of the page door outside state/store.ts, as built (the plan §4.5's table — sixteen calls of setPage and the
   holiday line's ownSquadronFirst). `at` — words of the call's own line that find it; `fn` — for 'asks first', the
   function that sets a mark before the page and must ask first */
const DOOR_CENSUS: { file: string; at: string; kind: DoorKind; fn?: string; why: string }[] = [
  { file: 'ui/Shell.tsx', at: 'const nav = (p: string) => { setPage(p)', kind: 'last', why: 'a tab: only the pages the squadron in view offers are drawn (row 14)' },
  { file: 'ui/Drawer.tsx', at: 'const go = () => { setPage(p)', kind: 'last', why: 'a ☰ page: only offered pages are drawn; the menu closed after' },
  { file: 'ui/Login.tsx', at: 'setPage(back)', kind: 'last', why: 'his home just entered at the sign-in: every page of it is offered' },
  { file: 'ui/logout.ts', at: "setPage('tracker')", kind: 'last', why: 'guarded by pageOffered on the same line' },
  { file: 'probe-bridge.ts', at: 'w.setPage = (p: string) => { setPage(p)', kind: 'last', why: 'the developer\'s browser tests only' },
  { file: 'ui/topstate.ts', at: "setPage('help')", kind: 'last', why: 'the bell\'s bug alert: Help is always offered' },
  { file: 'ui/interactions.ts', at: "setPage('leavewar'); notify()", kind: 'last', why: '"make a period" needs canEditSched(), false on a squadron he only views, so its page is always offered' },
  { file: 'leavewar/sync.ts', at: "if (CURPAGE !== 'inputs') setPage('inputs')", kind: 'last', why: 'openInputsPage: nothing after the page but a redraw' },
  { file: 'ui/WelcomeBack.tsx', at: "focusQualsRow(id); setPage('quals')", kind: 'last', why: 'the card is drawn only on his own squadron (§18.5), where Quals is offered: its gate stands before the call (checked below)' },
  { file: 'ui/topstate.ts', at: "setPage('inputs', opts, waited =>", kind: 'then', why: 'openInputOnPage: the Input window opens on the door\'s then' },
  { file: 'leavewar/sync.ts', at: "setPage('inputs', {}, () =>", kind: 'then', why: 'openInputWindow: the clash note\'s window on the door\'s then' },
  { file: 'ui/topstate.ts', at: "ownSquadronFirst({ door: 'line', ...o }, () =>", kind: 'then', why: 'a holiday\'s line: the OIL list once his own squadron is in view' },
  { file: 'ui/topstate.ts', at: "setPage('inputs', { door: 'line', ...o })", kind: 'asks first', fn: 'openNotice', why: 'his SANS reminder: the tab, month and day set before the page — openNotice asks first' },
  { file: 'ui/adminopen.ts', at: "setPage('admin')", kind: 'asks first', fn: 'openAdminUsers', why: 'the Users intent set before the page' },
  { file: 'leavewar/sync.ts', at: "askRing({ personId: onGrid ? pid : '', date: iso }); setPage('leavewar')", kind: 'asks first', fn: 'openWarAt', why: 'the war selected, Approvals and Balances put away, the ring asked for before the page' },
  { file: 'leavewar/sync.ts', at: "if (CURPAGE !== 'leavewar') setPage('leavewar')", kind: 'asks first', fn: 'openNewPeriod', why: 'the new-period ask left before the page' },
  { file: 'state/undo-wire.ts', at: "setPage(land.primary) !== 'went'", kind: 'answer', why: 'snapView: the landing\'s then only on went (row 13 — no road reaches it)' },
]
/** R5 (c): every call of the page door (setPage, ownSquadronFirst imported from state/store) in a file, by its line */
export function doorCalls(rel: string, raw: string): string[] {
  if (rel === 'state/store.ts') return []
  const src = uncomment(raw)
  const names = new Set<string>()
  for (const im of importsOf(rel, src)) if (im.mod === 'state/store') for (const n of im.names) if (n === 'setPage' || n === 'ownSquadronFirst') names.add(n)
  if (!names.size) return []
  const re = new RegExp(`(^|[^.\\w])(${[...names].join('|')})\\(`)
  return src.split('\n').filter(l => !/^\s*(import|export)\b/.test(l) && re.test(l)).map(l => l.trim())
}
/* the body of a function declared in `src`, its braces included (null where none) */
function fnBody(src: string, name: string): string | null {
  const at = src.search(new RegExp(`function\\s+${name}\\s*\\(`))
  if (at < 0) return null
  let i = src.indexOf('(', at), depth = 0
  for (; i < src.length; i++) { if (src[i] === '(') depth++; else if (src[i] === ')' && --depth === 0) break }
  let b = src.indexOf('{', i)
  /* (a return type in braces is not the body: none of the functions read here has one) */
  const start = b
  for (depth = 0; b < src.length; b++) { if (src[b] === '{') depth++; else if (src[b] === '}' && --depth === 0) break }
  return src.slice(start, b + 1)
}
const firstStatement = (body: string) => body.slice(1).trim().split('\n')[0]!.trim()
function censusProblems(files: Record<string, string>): string[] {
  const out: string[] = []
  const found: { file: string; line: string }[] = []
  for (const [rel, raw] of Object.entries(files)) for (const line of doorCalls(rel, raw)) found.push({ file: rel, line })
  for (const f of found) {
    const hits = DOOR_CENSUS.filter(c => c.file === f.file && f.line.includes(c.at))
    if (hits.length !== 1) out.push(`${f.file}: "${f.line}" — ${hits.length ? 'matched twice' : 'not in the census: say its kind'}`)
  }
  for (const c of DOOR_CENSUS) {
    const hits = found.filter(f => f.file === c.file && f.line.includes(c.at))
    if (hits.length !== 1) { out.push(`census "${c.at}" (${c.file}) — ${hits.length} calls found`); continue }
    const line = hits[0]!.line
    const after = line.slice(line.indexOf(c.at) + c.at.length)
    if (c.kind === 'then' && !/=>/.test(c.at + after)) out.push(`${c.file}: "${c.at}" hands the door no then`)
    if (c.kind === 'answer' && !/(!==|===)\s*'went'/.test(line)) out.push(`${c.file}: "${c.at}" does not test the door's answer`)
    if (c.kind === 'asks first') {
      const body = fnBody(uncomment(files[c.file] ?? ''), c.fn!)
      if (!body) { out.push(`${c.file}: no function ${c.fn}`); continue }
      if (c.fn === 'openNotice') {
        /* the ask before the list is closed and before any line is read — but the read of a kind LINE_KINDS does not know,
           which opens nothing (its own line, before the ask) */
        const ask = body.search(/ownPageRefused\(page, 'line', o, again\)/), close = body.search(/setBellList\(/)
        const readsBefore = ask < 0 ? [] : body.slice(0, ask).split('\n').filter(l => /markNoticeRead\(/.test(l) && !/!LINE_KINDS\[kindOf\(n\)\]/.test(l))
        if (ask < 0 || close < 0 || ask > close || readsBefore.length) out.push(`${c.file}: ${c.fn} does not ask the page door before it marks a line read`)
      } else if (!/^if \(ownPageRefused\('[a-z]+'\)\) return\b/.test(firstStatement(body))) {
        out.push(`${c.file}: ${c.fn}'s first statement is not its ownPageRefused line ("${firstStatement(body)}")`)
      }
    }
  }
  return out
}
const allSrc = (): Record<string, string> => Object.fromEntries(doorSrcFiles().map(p => [relOf(p), readFileSync(p, 'utf8')]))

describe('R5 (b) — no file but state/store.ts reaches the page change past its door', () => {
  it('no non-test file imports setPage from state/view or calls it through a namespace of state/view (the test kit aside)', () => {
    expect(Object.entries(allSrc()).flatMap(([rel, raw]) => viewSetPageReaches(rel, raw))).toEqual([])
  })
  it('(the scanner\'s own check, true on any code) the scan catches a planted reach: a named import, an aliased one, a namespace call; a comment is not one', () => {
    expect(viewSetPageReaches('ui/x.tsx', "import { notify } from '../state/store'\nimport { CURPAGE, setPage } from '../state/view'")).toHaveLength(1)
    expect(viewSetPageReaches('ui/x.tsx', "import { setPage as go } from '../state/view'")).toHaveLength(1)
    expect(viewSetPageReaches('state/y.ts', "import * as v from './view'\nv.setPage('x')")).toHaveLength(1)
    expect(viewSetPageReaches('ui/x.tsx', "import * as view from '../state/view'\n/* view.setPage('x') */ view.CURPAGE")).toEqual([])
    expect(viewSetPageReaches('ui/x.tsx', "import { setPage } from '../state/store'")).toEqual([])
  })
})

describe('R5 (c) — every call of the page door, with its kind (the plan §4.5\'s table)', () => {
  it('each call outside state/store.ts is in the census once; each then-call hands a then, the answer-call tests went, each asks-first function asks first', () => {
    expect(censusProblems(allSrc())).toEqual([])
  })
  it('sixteen calls of setPage and the holiday line\'s ownSquadronFirst', () => {
    const calls = Object.entries(allSrc()).flatMap(([rel, raw]) => doorCalls(rel, raw))
    expect(calls.filter(l => /ownSquadronFirst\(/.test(l)).length).toBe(1)
    expect(calls.length).toBe(17)
  })
  it('the "Welcome back" card\'s own gate (his own squadron in view) stands before its call of the door', () => {
    const src = uncomment(read('ui/WelcomeBack.tsx'))
    const gate = src.search(/if \(UNIT !== homeOn\(id, todayIso\(\)\)\) return null/), call = src.search(/setPage\('quals'\)/)
    expect(gate, 'the gate').toBeGreaterThan(-1)
    expect(gate < call, 'before the call').toBe(true)
  })
  it('the bell\'s access request asks the page door before Admin → Users opens and before its toast', () => {
    const body = fnBody(uncomment(read('state/belltap.ts')), 'openBellRequest')!
    const ask = body.search(/ownPageRefused\('admin', 'bell'/), open = body.search(/\bopen\(\)/)
    expect(ask > -1 && ask < open).toBe(true)
  })
  it('the scan catches a planted caller, a then dropped, an answer not tested and an ask-first line gone', () => {
    const files = allSrc()
    expect(censusProblems({ ...files, 'ui/new.tsx': "import { setPage } from '../state/store'\nsetPage('admin')" })).toEqual(['ui/new.tsx: "setPage(\'admin\')" — not in the census: say its kind'])
    const noThen = files['ui/topstate.ts']!.split("setPage('inputs', opts, waited =>").join("setPage('inputs', opts); (waited =>")
    expect(censusProblems({ ...files, 'ui/topstate.ts': noThen }).length).toBeGreaterThan(0)
    const noAnswer = files['state/undo-wire.ts']!.split("setPage(land.primary) !== 'went'").join("setPage(land.primary) !== 'gone'")
    expect(censusProblems({ ...files, 'state/undo-wire.ts': noAnswer }).length).toBeGreaterThan(0)
    const noAsk = files['ui/adminopen.ts']!.split("if (ownPageRefused('admin')) return").join('')
    expect(censusProblems({ ...files, 'ui/adminopen.ts': noAsk })).toEqual(['ui/adminopen.ts: openAdminUsers\'s first statement is not its ownPageRefused line ("requestAdminUsers(!!opts.newPerson, opts.person)")'])
  })
})

/* the kinds a notice is written with: the NoticePart union of state/notices.ts, read from its source */
export function noticeKinds(src: string): string[] {
  const at = src.indexOf('export type NoticePart =')
  const end = src.indexOf('\nexport ', at + 1)
  return [...new Set([...uncomment(src.slice(at, end)).matchAll(/\{\s*k:\s*'(\w+)'/g)].map(m => m[1]!))]
}
/* the kinds LINE_KINDS names in ui/topstate.ts, read from its source */
export function lineKindKeys(src: string): string[] {
  const s = uncomment(src)
  const at = s.indexOf('export const LINE_KINDS')
  const body = s.slice(s.indexOf('{', s.indexOf('=', at)), s.indexOf('\n}', at) + 2)
  return [...body.matchAll(/(?:^|[\s,{])(\w+):\s/g)].map(m => m[1]!)
}
describe('R5 (d) — every notice kind has a tap written for it (ui/topstate.ts LINE_KINDS)', () => {
  it('each kind of state/notices.ts NoticePart is a key of LINE_KINDS, and LINE_KINDS names no kind the union lacks', () => {
    const kinds = noticeKinds(read('state/notices.ts')), keys = lineKindKeys(read('ui/topstate.ts'))
    expect(kinds.length, 'the premise: the union read').toBeGreaterThan(20)
    expect(kinds.filter(k => !keys.includes(k)).map(k => `${k}: say what a tap on this line opens`)).toEqual([])
    expect(keys.filter(k => !kinds.includes(k)).map(k => `${k}: no notice is written with this kind`)).toEqual([])
  })
  it('the scan catches a planted kind', () => {
    const src = read('state/notices.ts').split("  | { k: 'acct';").join("  | { k: 'plan'; who: string }\n  | { k: 'acct';")
    const keys = lineKindKeys(read('ui/topstate.ts'))
    expect(noticeKinds(src).filter(k => !keys.includes(k))).toEqual(['plan'])
  })
})

describe('TO_COME — what is left is owed by a later step, by name, never by a pass of K1', () => {
  it('only the short row\'s report is left, owed "after S2\'s U1 fix merges" — none names K1a, K1b, K1c or K2b', () => {
    expect(TO_COME.filter(t => t.pass !== 'after S2\'s U1 fix merges' || /\bK(1[abc]?|2b)\b/.test(t.pass)).map(t => t.what)).toEqual([])
    expect(TO_COME.map(t => t.pass)).toEqual(['after S2\'s U1 fix merges'])
  })
})
