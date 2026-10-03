/* HIDING A WARNING — THE LISTS AND THE COUNTS ([WARN-HIDE-KEPT], owner D469 / D472 / D475, 1 Oct 26; the approved picture
   is docs/mock/warn-hide.html). Rewritten with that build: the file used to pin the Aug 26 rule it replaces ("drops a
   muted check out of the list into a 'N hidden' reveal, header count unchanged"; "view-only … shows every check, even a
   muted one").
   - "it shouldn't totally disappear, it should just show a strike out and it's darker. Ready to be reactivated again":
     the hidden line stays at its place in the list, wearing `.hid`, its ✕ become ↺ — no "N hidden" fold;
   - "If there are 3 issues initially and a scheduler clicks 1 to hide it should just show 2 issues": the count, the
     "N warning" and the bar's colour read what is shown, and the count line says nothing about a hidden one;
   - every issue hidden: the week keeps a quiet "✓ No issues" bar; the board's heading reads "No conflicts flagged";
   - View-only Sched draws the same struck line with NO button (D475); the board and the week share one set of hides
     (owner, 29 Aug 26 — "both are in sync"); the ⓘ popup counts and strikes the same way.
   Every case renders the REAL builders over the REAL validator's demo Tuesday — Saint's clash and brief, Outlaw's crew
   rest, Static's long work day — and hides through the ✕'s own write path. */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { DAYS } from '../engine/data'
import { dayWarnHTML, dayInfoHTML } from './html'
import { boardWarnHTML } from './board'
import { validate, workingWarn } from '../engine/validate'
import { DWOPEN, WARNOFF, warnMuteKey, toggleWarnOff, selDrop } from '../state/view'
import { setSession } from '../state/auth'
import { HOOKS } from '../engine/hooks'
// This warning-hide fixture deliberately contains the four unrelated Tuesday checks.

const DSNAP = JSON.stringify(DAYS)
const TUE = 1
let realEdit: any
const warns = (di: number) => (workingWarn().byDay[di] || {}).warns || []
const ixOf = (di: number, code: string) => warns(di).findIndex((w: any) => w.code === code)
const hideAt = (di: number, ix: number) => toggleWarnOff(warnMuteKey(warns(di)[ix]))   // the ✕ / ↺'s own write
const hideAll = (di: number) => warns(di).forEach((_: any, i: number) => hideAt(di, i))
const rowsOf = (h: string, cls: string) => [...h.matchAll(new RegExp(`<div class="${cls} ([^"]*)" data-wdi="\\d+" data-wix="(\\d+)"`, 'g'))].map(m => ({ cls: m[1]!, ix: +m[2]! }))

beforeEach(() => {
  realEdit = HOOKS.editMode
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  setSession({ user: 'a', role: 'admin' } as any)
  selDrop(); WARNOFF.clear(); validate()
  DWOPEN.clear(); DWOPEN.add(TUE)
})
afterEach(() => { HOOKS.editMode = realEdit; WARNOFF.clear(); DWOPEN.clear(); DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d)); validate() })

describe("Edit Schedule's list", () => {
  it('nothing hidden: a ✕ on every line, no struck line, no "hidden" word anywhere', () => {
    HOOKS.editMode = () => true
    const h = dayWarnHTML(TUE)
    expect(h).toContain('⚠ 4 issues')
    expect((h.match(/data-woff=/g) || []).length).toBe(4)
    expect(h).toContain('>✕</button>')
    expect(h).not.toContain('↺')
    expect(h).not.toMatch(/ hid"/)
    expect(h).not.toContain('data-wmtog')
    expect(h).not.toMatch(/\d+ hidden/)
  })

  it('WH4, WH5 (D469 / D472): the hidden line stays in its place, struck out, with ↺ — and the count drops to 3 and says nothing of it', () => {
    HOOKS.editMode = () => true
    const ix = ixOf(TUE, 'LONGDAY')
    expect(ix, "Static's long work day is the last of Tuesday's four").toBe(3)
    hideAt(TUE, ix)
    const h = dayWarnHTML(TUE)
    expect(h, 'the count without it').toContain('⚠ 3 issues')
    expect(h).not.toContain('4 issues')
    expect(h, 'the count line says nothing about a hidden one (D472)').not.toMatch(/\d+ hidden/)
    expect(h).not.toContain('data-wmtog')
    const rows = rowsOf(h, 'witem')
    expect(rows.map(r => r.ix), 'four lines, in the same order').toEqual([0, 1, 2, 3])
    expect(rows[3]!.cls, 'the hidden one is struck').toMatch(/\bhid\b/)
    expect(rows.slice(0, 3).some(r => /\bhid\b/.test(r.cls))).toBe(false)
    expect(h, 'its button is the flag-again').toMatch(/data-woff="1\.3" title="Flag this again">↺</)
    expect(h, 'the others keep their ✕').toMatch(/data-woff="1\.0"[^>]*>✕</)
    expect(h).toContain('has a long work day')
  })

  it('the bar\'s colour and the "N warning" follow what is shown: hide the two red ones and the bar turns amber', () => {
    HOOKS.editMode = () => true
    expect(dayWarnHTML(TUE)).toMatch(/class="daywarn hard"[^>]*><b>⚠ 4 issues<\/b> · 2 warning/)
    warns(TUE).map((w: any, i: number) => w.sev === 'hard' ? i : -1).filter((i: number) => i >= 0).forEach((i: number) => hideAt(TUE, i))
    const h = dayWarnHTML(TUE)
    expect(h).toMatch(/class="daywarn adv"[^>]*><b>⚠ 2 issues<\/b> · <span/)
    expect(h).not.toContain('warning ·')
    const rows = rowsOf(h, 'witem')
    expect(rows.filter(r => /\bhid\b/.test(r.cls)).map(r => r.ix), 'the two hard lines stay at the top, struck').toEqual([0, 1])
  })

  it('↺ flags it again: the count and the line are back as they were', () => {
    HOOKS.editMode = () => true
    const before = dayWarnHTML(TUE)
    hideAt(TUE, 3); hideAt(TUE, 3)
    expect(dayWarnHTML(TUE)).toBe(before)
  })

  it('WH6 (D475) — every issue of a day hidden: a quiet "✓ No issues" bar that still opens the list, the struck line under it', () => {
    HOOKS.editMode = () => true
    hideAll(TUE)
    const h = dayWarnHTML(TUE)
    expect(h).toMatch(/class="daywarn calm" data-daywarn="1"/)
    expect(h).toContain('<b>✓ No issues</b>')
    expect(h).not.toContain('⚠')
    const rows = rowsOf(h, 'witem')
    expect(rows.length, 'all four lines are still there').toBe(4)
    expect(rows.every(r => /\bhid\b/.test(r.cls)), 'every one struck').toBe(true)
    expect((h.match(/↺/g) || []).length, 'each with its flag-again').toBe(4)
    expect(h).not.toMatch(/\d+ hidden/)
  })
})

describe('WH7 — View-only Sched (D475): the same struck line, no button', () => {
  it('draws no ✕ and no ↺, counts 3, and strikes the hidden line', () => {
    HOOKS.editMode = () => true
    hideAt(TUE, 3)
    HOOKS.editMode = () => false
    const h = dayWarnHTML(TUE)
    expect(h).not.toContain('witem-mute')
    expect(h).not.toContain('data-woff')
    expect(h).toContain('⚠ 3 issues')
    const rows = rowsOf(h, 'witem')
    expect(rows.length).toBe(4)
    expect(rows[3]!.cls).toMatch(/\bhid\b/)
  })
})

describe("the board's panel — one set of hides, both surfaces (29 Aug 26)", () => {
  it('a hide made on the week shows on the board: 3 issues, the line struck in place with ↺', () => {
    HOOKS.editMode = () => true
    expect(boardWarnHTML(TUE)).toContain('⚠ 4 issues')
    hideAt(TUE, 3)
    const b = boardWarnHTML(TUE)
    expect(b).toContain('⚠ 3 issues')
    expect(b).toContain('2 warnings')
    expect(b).not.toMatch(/\d+ hidden/)
    expect(b).not.toContain('data-wmtog')
    const rows = rowsOf(b, 'wln')
    expect(rows.map(r => r.ix)).toEqual([0, 1, 2, 3])
    expect(rows[3]!.cls).toMatch(/\bhid\b/)
    expect(b).toMatch(/data-woff="1\.3" title="Flag this again">↺</)
  })

  it('a look at a version draws no button, struck or not (D187)', () => {
    hideAt(TUE, 3)
    const b = boardWarnHTML(TUE, true)
    expect(b).not.toContain('data-woff')
    expect(rowsOf(b, 'wln')[3]!.cls).toMatch(/\bhid\b/)
  })

  it('every issue hidden: the heading reads "No conflicts flagged", the struck line still under it', () => {
    hideAll(TUE)
    const b = boardWarnHTML(TUE)
    expect(b).toMatch(/class="wh ok"/)
    expect(b).toContain('No conflicts flagged for')
    expect(rowsOf(b, 'wln').every(r => /\bhid\b/.test(r.cls))).toBe(true)
    expect(rowsOf(b, 'wln').length).toBe(4)
    expect(b, 'not the empty day\'s own "no conflicts" row as well').not.toContain('class="wln ok"')
  })
})

describe('the day-info popup (ⓘ)', () => {
  it('counts what is shown and strikes the hidden line', () => {
    const before = dayInfoHTML(TUE)
    expect(before).toContain('1 note')
    hideAt(TUE, 3)
    const h = dayInfoHTML(TUE)
    expect(h, 'the note is no longer counted').not.toContain('1 note')
    expect(h).toContain('2 warning')
    expect(h).toMatch(/class="witem note hid" data-adv="1\.3"/)
  })
  it('every issue hidden: "Nothing flagged", and the struck line listed', () => {
    hideAll(TUE)
    const h = dayInfoHTML(TUE)
    expect(h).toContain('Nothing flagged')
    expect(h).not.toContain('dip-sev')
    expect((h.match(/ hid" data-adv="1\.\d"/g) || []).length).toBe(4)
  })
})
