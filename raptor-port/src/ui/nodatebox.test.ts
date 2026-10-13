/* NO DATE BOX OF THE PHONE'S OWN IS LEFT IN THE APP — the roll-call of [ONE-DATE-CALENDAR] step one, kept as a test.

   Owner, D786 (13 Oct 26): the "Every <weekday>" From box "is too wide and it doesn't fit the phone screen width" — the
   box was the phone's own date box, to which an iPhone gives a width of its own. D796, D797: every date box that was
   still the phone's own opens the app's one calendar instead (ui/DateBox.tsx).

   A roll-call written once is true on the day it is written. This walks the SOURCE, so the next form that reaches for
   `<input type="date">` fails here, by name, on the day it is written — not on his iPhone a month later.

   NONE IS LEFT. The last were the Tracker's (its own date box, and "Done on" and "Failed on" in its marking pop-up):
   the design of 13 Oct never named the Tracker; he ruled them in the same night (D801 — a tap picks, no tick) and they
   were built on a branch of their own. */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..')
const STILL_THE_PHONES_OWN: string[] = []

function files(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) files(p, out)
    else if (/\.(tsx?|jsx?)$/.test(name) && !/\.test\.[tj]sx?$/.test(name)) out.push(p)
  }
  return out
}
/* a date box written as markup or made by hand: type="date", type='date', type: 'date', .type = 'date' */
const NATIVE = /type\s*[=:]\s*\{?\s*["'`]date["'`]/

describe('the phone’s own date box', () => {
  const hits = files(SRC)
    .filter(f => readFileSync(f, 'utf8').split('\n').some(line => NATIVE.test(line) && !/^\s*(\/\/|\/?\*)/.test(line)))
    .map(f => relative(SRC, f).replace(/\\/g, '/'))
    .sort()

  it('is drawn nowhere in the app — the Tracker’s were the last (D801)', () => {
    expect(hits).toEqual(STILL_THE_PHONES_OWN)
  })
  it('the search can see one when there is one', () => {
    /* a pattern that matched nothing would pass the test above with an empty list on both sides — and so would a walk
       that read no file: the walk must have read the two components that own a date box */
    const read = files(SRC).map(f => relative(SRC, f).replace(/\\/g, '/'))
    expect(read).toContain('ui/DateBox.tsx'); expect(read).toContain('tracker/components/DateBox.jsx')
    expect(NATIVE.test('<input type="date" id="x" />')).toBe(true)
    expect(NATIVE.test("el.type = 'date'")).toBe(true)
    expect(NATIVE.test('<input type="text" data-kind="date" />')).toBe(false)
  })
})
