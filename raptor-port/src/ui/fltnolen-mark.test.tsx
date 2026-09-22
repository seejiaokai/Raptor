// @vitest-environment jsdom
/* D49's MARK, ON THE LINE — the 22 Sep 26 walk's rules-sweep FAIL 3.
   Sheet: docs/handpass/parts/2026-09-22-oil-seats-rules-sweep.md.

   The ruling (D49, owner 22 Sep 26 — "It should still earn — leave it as it
   is") has two halves. The money half — a flying line typed with the SAME
   take-off and landing still pays the man — is pinned by
   engine/oilflighttimes.test.ts and is NOT re-tested here. The other half is
   that the day must SAY the times cannot be right, and the walk found it said
   so only in the list on the right: the line's own boxes were byte-for-byte
   identical to a correct line's, on the board at both widths and on the edit
   week, and tapping the warning moved nothing — where every other warning
   lights its man and scrolls the board to him.

   Three surfaces and one gesture, which is why this file exists beside the
   engine's. The engine test asserted that the warning CARRIES a key ending
   `.ld` and stopped there; a key nothing resolves is not a gesture, and that
   gap is exactly what the walk paid for. Here the key is resolved against the
   real markup of each surface, through the same body the app's own warning tap
   uses. */
import { beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { validate } from '../engine/validate'
import { setSession } from '../state/store'
import { dayHTML } from './html'
import { boardHTML } from './board'
import { anchorEl } from './highlights'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.als = []; SCHED.dayOK = {}
  setSession({ user: 'ad', role: 'admin' })
})

/* ONE flying line on an otherwise stripped day, so anything marked can only be
   this line. Built the way the app builds one, and given its row id, because a
   line with no id is a row the app could never have made. */
const onlyLine = (di: number, to: string, ld: string, crew = 'bane') => {
  Object.assign(DAYS[di] as any, {
    waves: [{ label: 'WAVE 1', formations: [{ cs: 'RAP 1', msn: 'X', to, ld, aircraft: [{ p: crew, w: '' }] }] }],
    dutywaves: [], sims: {}, ground: [], allhands: [],
  })
  ensureRowIds(DAYS)
  validate()
  return (DAYS[di] as any).waves[0].formations[0]
}
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const marked = (html: string) => [...el(html).querySelectorAll('.badtm')]
const warnKey = (di: number) =>
  String(((validate().byDay[di]?.warns ?? []).find((w: any) => w.code === 'FLT_NO_LEN') || {}).key || '')

describe('the line itself says the times cannot be right — not only the list on the right', () => {
  it('the EDIT WEEK marks the take-off box and the landing box, and nothing else', () => {
    onlyLine(SAT, '10:00', '10:00')
    const m = marked(dayHTML(SAT, true))
    expect(m.length, 'exactly the two boxes one of which is wrong').toBe(2)
    expect(m.every(x => x.className.includes('fcell')), 'they are the line\'s own time cells').toBe(true)
    expect(m.map(x => x.className.includes('bto') || x.className.includes('ld')).every(Boolean)).toBe(true)
  })

  it('the VIEW WEEK marks them too — a published day is read here', () => {
    onlyLine(SAT, '10:00', '10:00')
    expect(marked(dayHTML(SAT, false)).length).toBe(2)
  })

  it('the BOARD marks its two time boxes', () => {
    onlyLine(SAT, '10:00', '10:00')
    const m = marked(boardHTML(SAT))
    expect(m.length, 'the take-off box and the landing box').toBe(2)
    expect(m.every(x => x.tagName === 'INPUT'), 'the board\'s boxes are the typed ones').toBe(true)
  })

  it('every marked box says WHY, in words, without opening the list', () => {
    onlyLine(SAT, '10:00', '10:00')
    for (const html of [dayHTML(SAT, true), dayHTML(SAT, false), boardHTML(SAT)])
      for (const x of marked(html))
        expect(x.getAttribute('title') || '', 'the mark explains itself where it sits')
          .toMatch(/same time|one of the two/i)
  })

  it('THE CONTROL: an ordinary line, an overnight line and a line with no times are untouched', () => {
    for (const [to, ld] of [['09:00', '11:00'], ['23:00', '01:00'], ['', '']]) {
      onlyLine(SAT, to, ld)
      expect(marked(dayHTML(SAT, true)).length, `${to || 'blank'}–${ld || 'blank'} is not this fault`).toBe(0)
      expect(marked(boardHTML(SAT)).length).toBe(0)
    }
  })

  it('a line NOBODY is on is not marked — the mark follows the warning exactly', () => {
    onlyLine(SAT, '10:00', '10:00', '')
    expect(warnKey(SAT), 'no crew, no warning').toBe('')
    expect(marked(dayHTML(SAT, true)).length, 'so no mark either').toBe(0)
    expect(marked(boardHTML(SAT)).length).toBe(0)
  })
})

describe('tapping the warning lands on the line it names', () => {
  it('the key the warning carries resolves on the board', () => {
    onlyLine(SAT, '10:00', '10:00')
    const key = warnKey(SAT)
    expect(key, 'the warning names the landing box').toContain('.ld')
    expect(anchorEl(el(boardHTML(SAT)), key), 'and something on the board answers to it').toBeTruthy()
  })

  it('and on the edit week and the view week alike', () => {
    onlyLine(SAT, '10:00', '10:00')
    const key = warnKey(SAT)
    expect(anchorEl(el(dayHTML(SAT, true)), key), 'the edit week').toBeTruthy()
    expect(anchorEl(el(dayHTML(SAT, false)), key), 'the view week — where a published day is read').toBeTruthy()
  })

  it('what it resolves to IS the marked box, so the scroll lands on the fault', () => {
    onlyLine(SAT, '10:00', '10:00')
    const a = anchorEl(el(boardHTML(SAT)), warnKey(SAT)) as HTMLElement
    expect(a.classList.contains('badtm'), 'not merely somewhere on the row').toBe(true)
  })
})
