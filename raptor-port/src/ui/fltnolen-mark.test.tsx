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
import { peekDayHTML } from './peek'

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

/* AND THE TAP HAS TO SHOW SOMETHING, not only move the page (the walk's own
   words: "tapping that warning does nothing, where every other warning lights
   the man and scrolls to him"). Making the scroll work is half of it — on a
   line that is already on screen, a scroll that has nowhere to go leaves the
   press with no visible answer at all, which is the complaint over again.
   This warning names the LINE and deliberately no crew (the times are the
   scheduler's to fix and no pilot's fault), so there is no puck to light. The
   box the warning addresses lights instead, in the same `wfoc`/`advf` vocabulary
   every lit puck uses, so the two cannot drift into different languages. */
describe('the warning lights the box it names, as every other warning lights its man', () => {
  const paint = async (key: string | null) => {
    const view = await import('../state/view')
    const { refreshHighlights } = await import('./highlights')
    document.body.innerHTML = boardHTML(SAT)
    view.setWarnFocus(key ? { di: SAT, ix: 0, ids: [], sev: 'adv', key, code: 'FLT_NO_LEN' } as any : null)
    refreshHighlights()
    return [...document.querySelectorAll('.badtm')] as HTMLElement[]
  }

  it('the marked boxes light when the warning is the focus', async () => {
    onlyLine(SAT, '10:00', '10:00')
    const m = await paint(warnKey(SAT))
    expect(m.length, 'the two boxes are there to light').toBe(2)
    expect(m.every(x => x.classList.contains('wfoc')), 'both of them light').toBe(true)
    expect(m.every(x => x.classList.contains('advf')), 'in the advisory colour — the line is not refused').toBe(true)
  })

  it('and go out again when the focus is cleared', async () => {
    onlyLine(SAT, '10:00', '10:00')
    const m = await paint(null)
    expect(m.some(x => x.classList.contains('wfoc')), 'nothing is lit with no focus').toBe(false)
  })

  it('a DIFFERENT warning does not light them', async () => {
    onlyLine(SAT, '10:00', '10:00')
    const m = await paint('ff:99.0.0.ld')
    expect(m.some(x => x.classList.contains('wfoc')), 'only the box the key names').toBe(false)
  })
})

/* A SHIFT'S MARKED BOXES SAY THE SHIFT SENTENCE (the independent code read,
   22 Sep 26, F1). The mark is right on a standalone wave — the times are still
   plainly wrong — but its WORDS were the sortie's: "the day still earns from
   the report and debrief", which a shift has not got. A scheduler reads the box,
   not the engine, so a box that says the opposite of what the day pays is the
   whole defect. All three renderers pass the same fact to the same sentence, so
   they cannot say different things about one line. */
describe('a nought-minute SHIFT is marked, and says what is true of a shift', () => {
  const scLine = (to: string, ld: string, crew = 'bane') => {
    Object.assign(DAYS[SAT] as any, {
      waves: [{ label: 'SC', kind: 'sc', standalone: true,
        formations: [{ cs: 'SC', msn: 'AM', to, ld, aircraft: [{ p: crew, w: '' }] }] }],
      dutywaves: [], sims: {}, ground: [], allhands: [],
    })
    ensureRowIds(DAYS)
    validate()
  }
  const says = (html: string) => marked(html).map(x => x.getAttribute('title') || '')

  /* FOUR surfaces, not three (the follow-up code read, G5). The roll-call names
     the peek as the fourth place a flying line's times are drawn, and the loop
     walked three — so the shift sentence was unpinned on exactly the surface
     that was missed once already. */
  it('every surface: the shift sentence, never the sortie one', () => {
    scLine('08:00', '08:00')
    for (const html of [dayHTML(SAT, true), dayHTML(SAT, false), boardHTML(SAT), peekDayHTML(DAYS[SAT], 0, false)]) {
      const t = says(html)
      expect(t.length, 'both boxes are marked').toBe(2)
      for (const s of t) {
        expect(s, 'it earns nobody, so it must not promise a report and debrief')
          .not.toContain('still earns from the report and debrief')
        expect(s).toMatch(/earns nobody/i)
      }
    }
  })

  it('THE CONTROL: an ordinary line keeps the sortie sentence, on every surface', () => {
    onlyLine(SAT, '10:00', '10:00')
    for (const html of [dayHTML(SAT, true), dayHTML(SAT, false), boardHTML(SAT), peekDayHTML(DAYS[SAT], 0, false)])
      for (const s of says(html))
        expect(s, 'D49 — he reported and debriefed').toContain('still earns from the report and debrief')
  })
})

/* A FROZEN VERSION PREVIEW IS A DOCUMENT, NOT A LIVE DAY (the follow-up code
   read, G2). The highlight pass deliberately refuses to decorate a `.pv-frozen`
   preview — WARN is live and the preview is what the squadron was given, so
   putting today's focus on last week's paper would be a lie — and `anchorEl`'s
   own comment says a preview emits no address for a warning to resolve into.
   `data-warnkey` was emitted on every paint, preview included, which broke both:
   a focused live warning lit a box inside a frozen page, and the tap could
   scroll into one.
   The MARK stays on the preview — a line that went out with two identical times
   went out that way, and saying so on the issued page is honest. Only the
   ADDRESS is withheld. */
describe('the frozen version preview wears the mark but answers to no warning', () => {
  const previewHTML = async () => {
    const { withDaySnap } = await import('./html')
    const { setSign, setDayApproved, dayCurVer, daySnapOf } = await import('../engine/publish')
    onlyLine(SAT, '10:00', '10:00')
    /* signed through the sanctioned path, then published — a day cannot be
       issued unsigned, and an unsigned `setDayApproved` silently does nothing */
    for (const [role, who] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']])
      setSign(SAT, role, who)
    setDayApproved(SAT, true)
    const ver = dayCurVer(SAT)
    /* the preview only exists if the day was really issued — without this the
       call falls through to a LIVE render and the test proves nothing */
    expect(daySnapOf(SAT, ver), 'the day was published, so there is a frozen copy').toBeTruthy()
    let frozen = false
    const html = withDaySnap(SAT, ver, (ok: any) => { frozen = !!ok; return dayHTML(SAT, false) })
    expect(frozen, 'and the render really went through it').toBe(true)
    return html
  }

  it('the two boxes still say the times cannot be right', async () => {
    const html = await previewHTML()
    expect(marked(html).length, 'the issued page tells the truth about what went out').toBe(2)
  })

  it('but nothing in it answers to the live warning', async () => {
    const html = await previewHTML()
    onlyLine(SAT, '10:00', '10:00')
    const key = warnKey(SAT)
    expect(key).toBeTruthy()
    expect(anchorEl(el(html), key), 'a live warning must not resolve into a frozen document').toBeFalsy()
  })
})

/* DOING WHAT THE WARNING ASKS MUST NOT KILL THE SCREEN (the follow-up code
   read, G3; measured in the running app before it was believed).

   Tap the nought-minute warning: two boxes light, eighty pucks dim — correct.
   Now CORRECT THE LANDING TIME, which is the one thing the warning asks for.
   The warning leaves the list, the boxes lose their mark — and the week stays
   dimmed with NOTHING lit and nothing on screen saying why. Measured: lit 2 →
   0, dimmed 80 → 80.

   `warnFocusMap` returned a map for `WFOCUS` without ever asking whether that
   warning still exists, so a focus outlived its cause and went on dimming the
   week. The shape is not new — any warning could be fixed while focused — but
   this one makes the loop natural: the gesture that reveals the fault is one
   tap away from the gesture that repairs it.

   The guard is GENERAL, not about D49: a focus whose warning no longer exists
   lights nothing, so it dims nothing. Matched on the warning's CODE and KEY,
   never its index — `validate()` rebuilds the list wholesale and an index means
   a different warning a moment later. */
describe('a focus whose warning has gone stops dimming the week', () => {
  const focusOn = async (di: number, code: string) => {
    const view = await import('../state/view')
    const w = (validate().byDay[di]?.warns ?? []).find((x: any) => x.code === code)
    expect(w, `there is a ${code} to focus`).toBeTruthy()
    view.setWarnFocus({ di, ix: 0, ids: (w!.who || []).slice(), sev: w!.sev, key: w!.key, code: w!.code } as any)
    return view
  }

  it('while the fault is there, the focus owns the highlight', async () => {
    onlyLine(SAT, '10:00', '10:00')
    const view = await focusOn(SAT, 'FLT_NO_LEN')
    expect(view.warnFocusMap(), 'the week dims around the fault').toBeTruthy()
  })

  it('correct the times and the dimming goes with the warning', async () => {
    onlyLine(SAT, '10:00', '10:00')
    const view = await focusOn(SAT, 'FLT_NO_LEN')
    onlyLine(SAT, '10:00', '11:30')          // the scheduler does what it asked
    expect(view.warnFocusMap(), 'nothing left to light, so nothing left to dim').toBeNull()
  })

  it('it is GENERAL — the same holds for a warning that has nothing to do with this one', async () => {
    onlyLine(SAT, '', '')                    // a line with no times at all
    const view = await focusOn(SAT, 'OIL_NO_TIMES')
    expect(view.warnFocusMap()).toBeTruthy()
    onlyLine(SAT, '09:00', '11:00')          // fixed
    expect(view.warnFocusMap(), 'any focus that outlives its cause lets go').toBeNull()
  })

  it('THE CONTROL: a focus whose warning is still there keeps its grip', async () => {
    onlyLine(SAT, '10:00', '10:00')
    const view = await focusOn(SAT, 'FLT_NO_LEN')
    validate()                                // an unrelated revalidate must not drop it
    expect(view.warnFocusMap(), 'the fault is still on the day').toBeTruthy()
  })
})

/* THE BOARD'S OWN FROZEN PREVIEW, same rule as the week's (the follow-up code
   read). `boardHTML(di, pv)` renders an issued version inside `.pv-frozen`; it
   keeps the mark, because the line went out with two identical times, and it
   answers to no live warning. */
describe('the board\'s frozen preview wears the mark but answers to no warning', () => {
  it('marked, and unaddressed', () => {
    onlyLine(SAT, '10:00', '10:00')
    const html = boardHTML(SAT, true)
    expect(marked(html).length, 'the issued board page still says the times are wrong').toBe(2)
    expect(anchorEl(el(html), warnKey(SAT)), 'but a live warning cannot resolve into it').toBeFalsy()
  })

  it('THE CONTROL: the live board is still addressed', () => {
    onlyLine(SAT, '10:00', '10:00')
    expect(anchorEl(el(boardHTML(SAT)), warnKey(SAT))).toBeTruthy()
  })
})
