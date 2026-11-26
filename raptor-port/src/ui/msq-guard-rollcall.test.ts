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
   scans. R3 (every frame counted, per file) is K1b's, R4 (the Tracker's list) K1c's — `TO_COME` below names each, with
   the pass that owes it; K1c's last test proves the list empty. */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, basename } from 'node:path'
import { withThird } from '../test-support/msq-world'
import { GUARD_ROWS, GUARD_ORDER, FLOAT_WHERE, type GuardRow } from './guard'
import * as DRAWN from './windrawn'
import { forward, gone, _resetFloatWins } from './winorder'
import { saveRefused } from '../storage/savewait'
import { warWindowOpen } from '../state/typing-hold'

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
export const TO_COME: { what: string; pass: 'K1b' | 'K1c'; why: string }[] = [
  { what: 'R3', pass: 'K1b', why: 'every frame counted, per file — the component-state windows are K1b\'s rows' },
  { what: 'R4', pass: 'K1c', why: 'the Tracker\'s list is whole — TRK_WINDOWS is K1c\'s' },
  { what: 'row oilrevise', pass: 'K1b', why: 'the OIL question from a row of the Inputs list — useGuardWork, the page\'s own state' },
  { what: 'row holimport', pass: 'K1b', why: 'a holiday sheet read in, not yet added — the Calendar family on his E1 answer' },
  { what: 'row qualsnew', pass: 'K1b', why: 'words typed in Quals\' "Add qualification" (D2729 Q2)' },
  { what: 'row lwshow', pass: 'K1b', why: 'the Leave War\'s two show-only sheets (D2740) — Sheet.tsx\'s showOnly mark' },
  { what: 'rows of Admin\'s typed work (PersonEditor, ArchivedEditor, Waiting, NewSquadron, MoveEditor, PlaceEditor)', pass: 'K1b', why: 'useGuardWork reports, D2595, D2598' },
  { what: 'the E1 shape of days, inputsset, sansset, everywd, holiday, inputsday (closes with dirty)', pass: 'K1b', why: 'D2654 E1 — plain window rows in K1a' },
  { what: 'the two edit modes\' end() (lgedit, qedit)', pass: 'K1b', why: 'D2627 A4 — §18.1; plain no rows in K1a' },
  { what: 'rows trk, trkask, trkinfo; trkinfo in R8\'s ruled list (D2597)', pass: 'K1c', why: 'the Tracker\'s bridge' },
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
  'state/typing-hold.ts': [warWindowOpen],
}
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
  it('each counting row\'s open() is a function of ui/windrawn.ts, storage/savewait.ts or state/typing-hold.ts — or a movable window\'s own place in the order', () => {
    const allowed = Object.values(ALLOWED_OPEN).flat()
    for (const r of GUARD_ROWS) {
      if (r.counts === 'no') continue
      if (r.id in FLOAT_WHERE) continue          // the next test proves these read winUp
      expect(allowed.includes(r.open), `${r.id}: open() must be the very predicate its window is drawn from — a function of ui/windrawn.ts the component calls (§3.1), never a raw flag`).toBe(true)
    }
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

/* R8's list: the windows that close by themselves, each with the ruling that lets it (D2596, D2597). An id joins only in
   the commit that cites his answer. `trkinfo` is K1c's (TO_COME). */
const RULED_CLOSES: Record<string, string> = {
  avail: 'D2596 — "Who\'s available" only shows things',
  chg: 'D2596 — Changes only shows things',
  insights: 'D2597 — Insights only shows things',
  sansday: 'D2597 — a SANS day only shows things',
  lwday: 'D2597 — the Leave War\'s day panel only shows things',
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
  it('R8\'s check: a "closes" row not ruled, a closer on a refusing row, and a ruled id with no row are each reported', () => {
    const rows = [...GUARD_ROWS, { id: 'newshow', counts: 'closes' as const, close: () => {} }]
    expect(closesProblems(rows as any, RULED_CLOSES)).toEqual(['newshow: a window closes by itself only on his ruling'])
    const withCloser = GUARD_ROWS.map(r => r.id === 'days' ? { ...r, close: () => {} } : r)
    expect(closesProblems(withCloser, RULED_CLOSES)).toEqual(['days: only a "closes" row carries a closer'])
    expect(closesProblems(GUARD_ROWS, { ...RULED_CLOSES, trkinfo: 'D2597' })).toEqual(['trkinfo: ruled to close by itself, but no "closes" row'])
  })
})
