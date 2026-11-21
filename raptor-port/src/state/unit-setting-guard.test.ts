/* THE GUARD: A UNIT'S SETTING IS READ OR WRITTEN BY ITS PLAIN NAME ONLY ON THE SCHEDULE PAGES (the reshape plan
   docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md §3.2 A-ii, "Own-page settings"; §3.4).

   A plain name (`store.get('qualcols', …)`) means the squadron IN VIEW — the pick (engine/hooks.ts storedKey). That is
   right on the schedule pages and Logic, which follow the pick (D2132); on an own page (Inputs and its calendars, Quals,
   Medical, the SANS calendar, the OIL answer list, the Leave War, the Tracker, Admin → Users) it is the fault B4 found —
   a man who only views 149 would read, and write, 149's setting. So outside the schedule pages' files every read and
   write of a unit's setting names its squadron: `unitSetting(unit, name, …)`, `store.set(unitSettingKey(unit, name), …)`,
   `store.keys(qualify(unit, prefix))` — the loaded squadron's own cache naming `UNIT` itself.

   What it reads: each source file's code (comments out, quoted strings kept), for a store call whose FIRST argument is a
   unit setting's name or row prefix written out (storage/keyowner.ts UNIT_SETTINGS / UNIT_SETTING_PREFIXES). A name
   reached through a variable is out of its reach — that is what the behaviour tests are for (ui/reshape-b04-own-pages,
   state/flyplan-own-unit). Each file it allows says why; a file allowed and no longer calling turns it red too, so the
   list never outlives what it excuses. */
import { describe, it, expect } from 'vitest'
import { join, relative } from 'node:path'
import { readFileSync } from 'node:fs'
import { code, sourceFiles } from '../testing/enumguard'
import { UNIT_SETTINGS, UNIT_SETTING_PREFIXES } from '../storage/keyowner'

const SRC = join(__dirname, '..')
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const NAME = [
  ...UNIT_SETTINGS.map(n => `${esc(n)}['"\`]`),
  ...UNIT_SETTING_PREFIXES.map(p => esc(p)),
].join('|')
const PLAIN = new RegExp(`\\bstore\\.(?:get|set|keys|group)\\(\\s*['"\`](?:${NAME})`, 'g')

/* THE SCHEDULE PAGES' FILES — Logic and the templates, the board's lists and switches, the change history: each is the
   picked squadron's on purpose, and reads its settings by their plain names */
const SCHEDULE = 'a schedule page\'s own setting (Edit Schedule, View-only Sched, the Board, Logic, Admin\'s squadron settings): it follows the pick, so its plain name is the squadron in view\'s by design'
const ALLOWED: Record<string, string> = {
  'engine/rules.ts': SCHEDULE + ' — Logic',
  'engine/cxreasons.ts': SCHEDULE + ' — the cancel reasons',
  'engine/daytpl.ts': SCHEDULE + ' — the day templates',
  'engine/dutytpl.ts': SCHEDULE + ' — the duty templates',
  'engine/wavetpl.ts': SCHEDULE + ' — the wave templates and their hide set',
  'engine/order.ts': SCHEDULE + ' — the house order of the sections',
  'engine/reorder.ts': SCHEDULE + ' — the house wave order',
  'engine/stores.ts': SCHEDULE + ' — the stores list',
  'engine/insights-config.ts': SCHEDULE + ' — Logic\'s "Track blue/red sorties"',
  /* (state/accounts.ts — Admin → Users' guest switch — stood here until the guest view was removed in the reshape's
     phase 3, D2239, the plan §8, and with it its read and write) */
}

function hits(): Record<string, number> {
  const out: Record<string, number> = {}
  for (const p of sourceFiles(SRC)) {
    const n = [...code(readFileSync(p, 'utf8')).matchAll(PLAIN)].length
    if (n) out[relative(SRC, p).replace(/\\/g, '/')] = n
  }
  return out
}

describe('a unit setting read or written by its plain name only on the schedule pages (the reshape plan §3.2 A-ii)', () => {
  it('every file that reads or writes a unit setting by its plain name is allowed here, and every allowance is used', () => {
    expect(Object.keys(hits()).sort(), 'a plain-name read or write of a unit setting outside the schedule pages\' files: name its squadron (unitSetting / unitSettingKey / qualify), or, for a schedule page\'s file, allow it here with its reason').toEqual(Object.keys(ALLOWED).sort())
  })
  it('every allowance says why', () => {
    for (const [f, why] of Object.entries(ALLOWED)) expect(why.length, f).toBeGreaterThan(20)
  })
  it('the scan catches the forms it claims to, and none it does not', () => {
    const n = (s: string) => [...code(s).matchAll(PLAIN)].length
    expect(n("store.get('qualcols', null)")).toBe(1)
    expect(n('store.set("lookahead", v)')).toBe(1)
    expect(n("store.keys('flyday:')")).toBe(1)
    expect(n('store.keys(`flyrun:`)')).toBe(1)
    expect(n("store.group('wavetpl', fn)")).toBe(1)
    expect(n("store.get('rulesx', null)"), 'another name that only starts like one').toBe(0)
    expect(n("store.get(unitSettingKey(u, 'qualcols'), null)"), 'a qualified name').toBe(0)
    expect(n("store.keys(qualify(u, 'flyday:'))"), 'a qualified prefix').toBe(0)
    expect(n("store.get('account:' + id, null)"), 'a community row').toBe(0)
    expect(n("// store.get('qualcols', null)"), 'a comment').toBe(0)
  })
})
