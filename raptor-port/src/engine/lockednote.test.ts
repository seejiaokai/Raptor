/* WHAT A READ-ONLY WEEK SAYS — ONE SOURCE, EVERY DOOR (owner D837, 14 Oct 26 — the passing note N7 and its twin; D1785,
   8 Nov 26 — "All as recommended", the pictures round's question 6, "A week that cannot be read"; D1667–D1669 — every
   refusal of one change opens with "Blocked:" in the app's grey note).

   A loaded or saved week is read-only in two cases, and since D1785 each says its own reason:
   - its saved copy will NOT READ (a damaged row — state/persist.ts keeps it as it is and stores a record with no days):
     "Blocked: this week’s saved copy could not be read, so it can’t be edited. Nothing was saved. Report it with
     “Report a problem” on the Help page." — never again the words that blamed "an older version of the app";
   - it reads, but an older version of the app published it (a book this app will not edit — only data already stored
     can hold one, D56): "Blocked: this week was published by an older version of the app, so it can’t be edited.
     Nothing was saved." — D837's reason, in D1667's "Blocked:" form.
   Both are said in the grey note (the toast's 'blocked' face). The publish refusal ("<day> is locked … amended here")
   keeps its words and its look for an older book, and says the unreadable refusal, grey, when the LOADED week's saved
   copy will not read.

   The words live ONCE (engine/publish.ts), and this file holds four things: the words, to the letter; why a week is
   read-only (engine/quarantine.ts weekLockReason); that the two engine doors say them; and that every door reads the
   one source — a scan of the three files, with its count, and of every source file for a typed copy that has crept
   back. The input editor's doors are also pressed for real in ui/audit-guards-inputs.test.tsx and
   leavewar/quarantine-medical-ui-pile1.test.tsx. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { initStore, loadWeek } from '../state/store'
import { DAYS } from './data'
import { HOOKS } from './hooks'
import { BOOT_WEEK, CURWEEK } from './waves'
import { stashClear, stashPut, setPreservedBlob, clearPreservedBlob } from './weekstash'
import { weekBundle } from './weeks-data'
import { weekLockReason, anyUnreadableWeek } from './quarantine'
import { LOCKED_WEEK_NOTE, UNREADABLE_WEEK_NOTE, SCHED, lockedDayNote, lockedWeekNote, protectedWeek, publishALDay, resetSched, setDayApproved, signOf, dayApproved } from './publish'

const SRC = join(__dirname, '..')
const read = (rel: string) => readFileSync(join(SRC, rel), 'utf8')
const count = (text: string, piece: string) => text.split(piece).length - 1
const W1 = '13/07/2026', W2 = '20/07/2026'
/* the record state/persist.ts stores for a week whose saved rows will not read (readStoredWeek's UNREADABLE) */
const DAMAGED = '{"unreadable":true}'
/* a stashed week an older version published: publication content and no format stamp (amFormatOf 'unsupported') */
const older = (key: string) => JSON.stringify({ d: weekBundle(key).days, o: { 0: { d: {}, c: {} } }, cv: { 0: 'orig' } })
/* flip the LOADED book to a pre-Phase-2 (unsupported → read-only) shape, as engine/quarantine-schedule.test.tsx does */
const protectOlder = () => { SCHED.amV = undefined; SCHED.cur = { ...(SCHED.cur || {}), 0: SCHED.cur?.[0] ?? 'orig' } }
/* back to the boot week, nothing stored: the loaded week outlives initStore, and a later loadWeek of the week already
   loaded would stash it over the damaged record the case laid down */
const home = () => {
  for (const k of [W1, W2]) clearPreservedBlob(k)
  if (CURWEEK !== BOOT_WEEK) loadWeek(BOOT_WEEK)
  stashClear(); initStore(); resetSched()
}

describe('the words (D1785, D837 in D1667’s "Blocked:" form)', () => {
  it('a week whose saved copy will not read', () => {
    expect(UNREADABLE_WEEK_NOTE).toBe('Blocked: this week’s saved copy could not be read, so it can’t be edited. Nothing was saved. Report it with “Report a problem” on the Help page.')
  })
  it('a week an older version of the app published', () => {
    expect(LOCKED_WEEK_NOTE).toBe('Blocked: this week was published by an older version of the app, so it can’t be edited. Nothing was saved.')
  })
  it('the day, published by an older version: the same sentence as before, "amended here"', () => {
    expect(lockedDayNote('Monday')).toBe('Monday is locked. It was published by an older version of the app, so it can’t be amended here.')
    expect(lockedDayNote(undefined)).toBe('This day is locked. It was published by an older version of the app, so it can’t be amended here.')
  })
})

describe('why a week is read-only — weekLockReason (D1785)', () => {
  beforeEach(home)
  afterEach(() => { SCHED.amV = 1; home() })

  it('an ordinary week: not read-only, and no week is unreadable', () => {
    expect(weekLockReason(CURWEEK)).toBe(null)
    expect(anyUnreadableWeek()).toBe(false)
    expect(lockedWeekNote(), 'the older words are the default').toBe(LOCKED_WEEK_NOTE)
  })
  it('the LOADED week whose saved copy will not read (a damaged row, loaded as persist keeps it) → unreadable', () => {
    stashPut(W2, DAMAGED)
    loadWeek(W2)
    expect(protectedWeek(), 'read-only').toBe(true)
    expect(weekLockReason(W2)).toBe('unreadable')
    expect(anyUnreadableWeek()).toBe(true)
    expect(lockedWeekNote()).toBe(UNREADABLE_WEEK_NOTE)
    expect(lockedDayNote('Monday'), 'a publish refused says the same').toBe(UNREADABLE_WEEK_NOTE)
  })
  it('a blob that is not even JSON reads as unreadable, and never throws out of the reader', () => {
    setPreservedBlob(CURWEEK, 'x')
    expect(() => weekLockReason(CURWEEK)).not.toThrow()
    expect(weekLockReason(CURWEEK)).toBe('unreadable')
  })
  it('the LOADED week an older version published → older, and the words that say so', () => {
    protectOlder()
    expect(weekLockReason(CURWEEK)).toBe('older')
    expect(anyUnreadableWeek()).toBe(false)
    expect(lockedWeekNote()).toBe(LOCKED_WEEK_NOTE)
    expect(lockedDayNote('Monday')).toBe('Monday is locked. It was published by an older version of the app, so it can’t be amended here.')
  })
  it('a whole-week old record that still reads (preserved, with its days) → older, not unreadable', () => {
    setPreservedBlob(CURWEEK, JSON.stringify({ d: weekBundle(CURWEEK).days }))
    expect(weekLockReason(CURWEEK)).toBe('older')
  })
  it('a STASHED (not loaded) week whose saved copy will not read → unreadable, from any loaded week', () => {
    loadWeek(W2)
    stashPut(W1, DAMAGED)
    expect(protectedWeek(), 'the loaded week is ordinary').toBe(false)
    expect(weekLockReason(W1)).toBe('unreadable')
    expect(anyUnreadableWeek()).toBe(true)
    expect(lockedWeekNote()).toBe(UNREADABLE_WEEK_NOTE)
  })
  it('the JSON texts null / false / 0 are damaged, not absent (P2-QREV-06) → unreadable', () => {
    for (const bad of ['null', 'false', '0', '']) {
      stashPut(W2, bad)
      expect(weekLockReason(W2), JSON.stringify(bad)).toBe('unreadable')
    }
  })
  it('a STASHED week an older version published → older', () => {
    stashPut(W2, older(W2))
    expect(weekLockReason(W2)).toBe('older')
    expect(anyUnreadableWeek()).toBe(false)
    expect(lockedWeekNote()).toBe(LOCKED_WEEK_NOTE)
  })
  it('a week with no saved copy at all is not read-only', () => {
    expect(weekLockReason('27/07/2026')).toBe(null)
  })
})

describe('the two engine doors say it', () => {
  type Said = [string, any]
  let said: Said[] = []
  const realToast = HOOKS.toast
  beforeEach(() => { home(); said = []; HOOKS.toast = ((m: any, k?: any) => { said.push([String(m), k]) }) as any })
  afterEach(() => { HOOKS.toast = realToast; SCHED.amV = 1; home() })

  it('a first publish refused on a week an older version published — its words and look as before', () => {
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    protectOlder()
    expect(protectedWeek()).toBe(true)
    setDayApproved(0, true)
    expect(dayApproved(0), 'nothing was published').toBe(false)
    expect(said).toEqual([[`${DAYS[0].dow} is locked. It was published by an older version of the app, so it can’t be amended here.`, undefined]])
  })
  it('an amendment refused on a week an older version published', () => {
    protectOlder()
    publishALDay(0)
    expect(said).toEqual([[`${DAYS[0].dow} is locked. It was published by an older version of the app, so it can’t be amended here.`, undefined]])
  })
  it('on a loaded week whose saved copy will not read: the unreadable refusal, in the grey note', () => {
    stashPut(W2, DAMAGED)
    loadWeek(W2)
    said = []
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(0, true)
    expect(dayApproved(0), 'nothing was published').toBe(false)
    publishALDay(0)
    expect(said).toEqual([[UNREADABLE_WEEK_NOTE, 'blocked'], [UNREADABLE_WEEK_NOTE, 'blocked']])
  })
})

describe('every door reads the one source', () => {
  const DOORS: [string, string, number][] = [
    ['state/store.ts', "HOOKS.toast(lockedWeekNote(), 'blocked')", 1],
    ['ui/inputedit.tsx', "HOOKS.toast(lockedWeekNote(), 'blocked')", 4],
    ['engine/publish.ts', 'refuseLockedDay(', 2],
  ]
  it.each(DOORS)('%s says it through %s — %i door(s)', (file, call, n) => {
    expect(count(read(file), call)).toBe(n)
  })
  it('seven in all, and no door keeps the old amber note', () => {
    expect(DOORS.reduce((sum, d) => sum + d[2], 0)).toBe(7)
    for (const f of ['state/store.ts', 'ui/inputedit.tsx']) expect(read(f), f).not.toContain('LOCKED_WEEK_NOTE')
  })
  it('and no source file carries a typed copy of any of the sentences — only the lines that define them', () => {
    const files = (dir: string, out: string[] = []): string[] => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f)
        if (statSync(p).isDirectory()) files(p, out)
        else if (/\.(ts|tsx|js|jsx)$/.test(f) && !/\.test\.|\.spec\./.test(f)) out.push(p)
      }
      return out
    }
    const typed: string[] = []
    for (const p of files(SRC)) {
      readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
        /* the day's sentence, the older week's, the unreadable refusal and the unreadable notice */
        if (/is locked\b.*published by an older version|this week was published by an older version|saved copy could not be read, so it can’t be (edited|shown)/.test(line))
          typed.push(`${relative(SRC, p).replace(/\\/g, '/')}:${i + 1}`)
      })
    }
    expect(typed.map(t => t.replace(/:\d+$/, '')).sort()).toEqual(['engine/publish.ts', 'engine/publish.ts', 'engine/publish.ts', 'ui/html.ts'])
  })
})
