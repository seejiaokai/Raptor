/* WHAT A LOCKED WEEK SAYS — ONE SOURCE, SEVEN DOORS (owner D837, 14 Oct 26 — the passing note N7 and its twin; the words
   of record: docs/superpowers/briefs/2026-10-13-wording-recheck.md, List 1 and "For the builder").

   The sentence stood as a typed copy at each of seven doors: state/store.ts once (the input funnel's backstop),
   ui/inputedit.tsx four times (an input on a locked date; a medical save; the two medical plans checked before a save),
   engine/publish.ts twice (the "amended here" twin — a first publish and an amendment, both refused). Seven copies is
   how a rewording reaches six and leaves the seventh saying the old words: the third read of the wording found the
   record itself listing three of them.

   So the words live ONCE (engine/publish.ts LOCKED_WEEK_NOTE, lockedDayNote), and this file holds three things:
   the words, to the letter; that the two engine doors say them; and that every one of the seven doors reads the one
   source — a scan of the three files, with the count the record gives, and of every source file for a typed copy that
   has crept back. The four doors of the input editor are also pressed for real, with these words, in
   ui/audit-guards-inputs.test.tsx and leavewar/quarantine-medical-ui-pile1.test.tsx. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { initStore } from '../state/store'
import { DAYS } from './data'
import { HOOKS } from './hooks'
import { LOCKED_WEEK_NOTE, SCHED, lockedDayNote, protectedWeek, publishALDay, resetSched, setDayApproved, signOf, dayApproved } from './publish'

const SRC = join(__dirname, '..')
const read = (rel: string) => readFileSync(join(SRC, rel), 'utf8')
const count = (text: string, piece: string) => text.split(piece).length - 1

describe('the words (D837 — N7 and its twin)', () => {
  it('the week: a full stop after the fact, "of the app", and "so" for the reason', () => {
    expect(LOCKED_WEEK_NOTE).toBe('This week is locked. It was published by an older version of the app, so it can’t be edited.')
  })
  it('the day: the same sentence, about the day, "amended here"', () => {
    expect(lockedDayNote('Monday')).toBe('Monday is locked. It was published by an older version of the app, so it can’t be amended here.')
  })
  it('a day with no name is "This day"', () => {
    expect(lockedDayNote(undefined)).toBe('This day is locked. It was published by an older version of the app, so it can’t be amended here.')
  })
})

describe('the two engine doors say it', () => {
  let said: string[] = []
  const realToast = HOOKS.toast
  /* flip the LOADED book to a pre-Phase-2 (unsupported → read-only) shape, as engine/quarantine-schedule.test.tsx does */
  const protect = () => { SCHED.amV = undefined; SCHED.cur = { ...(SCHED.cur || {}), 0: SCHED.cur?.[0] ?? 'orig' } }
  beforeEach(() => { initStore(); resetSched(); said = []; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any })
  afterEach(() => { HOOKS.toast = realToast; SCHED.amV = 1 })

  it('a first publish refused on a locked week', () => {
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    protect()
    expect(protectedWeek()).toBe(true)
    setDayApproved(0, true)
    expect(dayApproved(0), 'nothing was published').toBe(false)
    expect(said).toEqual([`${DAYS[0].dow} is locked. It was published by an older version of the app, so it can’t be amended here.`])
  })
  it('an amendment refused on a locked week', () => {
    protect()
    publishALDay(0)
    expect(said).toEqual([`${DAYS[0].dow} is locked. It was published by an older version of the app, so it can’t be amended here.`])
  })
})

describe('every one of the seven doors reads the one source', () => {
  const DOORS: [string, string, number][] = [
    ['state/store.ts', 'HOOKS.toast(LOCKED_WEEK_NOTE', 1],
    ['ui/inputedit.tsx', 'HOOKS.toast(LOCKED_WEEK_NOTE', 4],
    ['engine/publish.ts', 'toast(lockedDayNote(', 2],
  ]
  it.each(DOORS)('%s says it through %s — %i door(s)', (file, call, n) => {
    expect(count(read(file), call)).toBe(n)
  })
  it('seven in all', () => {
    expect(DOORS.reduce((sum, d) => sum + d[2], 0)).toBe(7)
  })
  it('and no source file carries a typed copy of either sentence — only the two lines that define them', () => {
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
        /* the sentence, in its old words or its new: "… is locked" then "published by an older version" on one line */
        if (/is locked\b.*published by an older version/.test(line)) typed.push(`${relative(SRC, p).replace(/\\/g, '/')}:${i + 1}`)
      })
    }
    expect(typed.map(t => t.replace(/:\d+$/, ''))).toEqual(['engine/publish.ts', 'engine/publish.ts'])
  })
})
