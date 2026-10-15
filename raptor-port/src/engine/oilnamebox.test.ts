/* [OIL-REQ-NAMEBOX] — WHO STANDS IN THE NAME BOX OF A REQUEST'S ROW, AND WHAT HE EARNS — AS THE ONE-RULE BUILD LEFT IT
   ([ALL-AVAIL-AS-MEMBER] step 2 (b)–(d), 12 Oct 26; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.3,
   §4.7).

   WHAT THIS FILE PINNED UNTIL THEN (owner, D470, 1 Oct 26 — [DB-READINESS] group A, phase 7; and D18 before it): a man
   the SCHEDULER put in the name box of another man's request row, in place of the member, earned from it as ordinary
   scheduled work — default yes, his own switch — while THE MEMBER WHO FILED STILL EARNED ON HIS OWN ANSWER, his name off
   the row or not. And the box was the scheduler's: it survived the member's own edit of his request (Fable F1).

   WHAT HE RULED SINCE:
   · D755 (11 Oct 26) — "a row that came from an input IS the input: whoever stands on it … is in the input, and the
     schedule and the Inputs calendar always show the same people, time and remark". The name box holds the FIRST of
     the input's people, the rest stand under it in the order they joined, and the row is re-made WHOLE from the input
     (overlay.ts requestRowFields, reconcile rule 6). Nobody on such a row is "the scheduler's own man" any more — and
     nobody is in the input while off its row.
   · D762 — the OIL question has ONE answer, for everyone in the input; only the scheduler leaves one person out, in
     OIL Earn on the day.
   So D470's "default yes for the man in the box, the member on his own answer" is gone for live data. A man in the name
   box is in the input and earns on its one answer, like everyone else in it; a man a stored row still shows who is NOT
   in the input earns nothing from it and comes off the row at its next re-make.

   EVERY SITUATION THE OLD FILE COVERED IS HERE, RE-EXPRESSED: the request's own day, a Yes, a No, no answer, an all-day
   request, one man decided alone, a refusal surviving the read, one man once, the controls, the row re-made after the
   member's edit, and a decision about a man as people leave and join.

   AND A DAY THAT HAS ALREADY GONE OUT KEEPS WHAT IT WENT OUT WITH (D48, D142): a block frozen before the build is still
   read by D470 and D18 as they stood, off that day's own frozen row (oilev.ts legacyClaim / legacyEarned /
   landedExtras) — the last describe. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, idsOf, shapeProblem } from './inputs'
import { putPerson, takePerson, swapPerson } from './inputown'
import { HOOKS } from './hooks'
import { SCHED } from './publish'
import { ensureRowIds } from './rowids'
import { envMin, uniformOil, inputItemKey } from './oil'
import { oilEvidence, oilEarnedWork, landedExtras, oilSentOf, spanDefault, type OilEvidence } from './oilev'
import { viewOfWeek, srcvOf, requestRowFields } from './overlay'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
const ITEM = inputItemKey('rq1')

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.correcting = {}
  Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => []
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

/* ONE INPUT — a Training for the Saturday, 09:00–17:00, answered Yes — HOLDING `ids` in the order they joined; it lands
   a row, written as the row's own body writes it: the first of them in the name box, the rest under it (D755). `row`
   overrides what the stored row carries, for a row that has not been re-made yet. */
const YES = { [SAT_ISO]: 1 }, NO = { [SAT_ISO]: 0 }
const landed = (ids: string[] = ['bane'], over: any = {}, row: any = {}) => {
  INPUTS.unshift({ iid: 'rq1', type: 'Training', date: 'Jul 18', yr: 2026, acc: 'g',
    allday: false, s: 9 * 60, e: 17 * 60, remarks: '', mod: '2026-07-01', by: 'bane', oil: YES, people: ids.map(p => ({ p })), ...over })
  ;(DAYS[SAT] as any).ground = [{ ...requestRowFields(INPUTS[0]), src: 'rq1', srcv: srcvOf(INPUTS[0]), ...row }]
  ensureRowIds(DAYS)
}
const row = () => (DAYS[SAT] as any).ground.find((g: any) => g && g.src === 'rq1')
const work = () => oilEarnedWork(DAYS[SAT], oilEvidence(SAT))
const figure = (person: string) => {
  const v = uniformOil(envMin((work()[person] || []).map((w: any) => [w.s, w.e] as [number, number])))
  return v === 1 ? 'FO' : v === 0.5 ? 'HO' : null
}
const earners = () => Object.keys(work()).sort()

describe('whoever stands in the request row\'s NAME BOX is IN the input, and earns on its ONE answer (D755, D762 — D470 as changed)', () => {
  it('the first to join stands in the box; he earns the request\'s own day, as the man under him does (D18 as changed)', () => {
    landed(['stiff', 'bane'])
    expect([row().who, row().more], 'the row is the input, whole').toEqual(['stiff', ['bane']])
    expect(earners(), 'both are in the input, and it was answered Yes').toEqual(['bane', 'stiff'])
    expect(figure('stiff')).toBe('FO')
    expect(figure('bane')).toBe('FO')
  })

  it('A MAN OFF THE ROW IS OUT OF THE INPUT — replaced in the box (D755 (2)), he earns nothing from it', () => {
    /* until the one-rule build "the member who filed still earns on his own answer — his name off the row changes
       nothing for him": the request kept him while the row showed another man. The row and the input hold the same
       people now, so there is no such state. */
    landed(['bane'])
    expect(swapPerson(INPUTS[0], 'bane', 'stiff')).toBe(true)
    expect(idsOf(INPUTS[0])).toEqual(['stiff'])
    expect(earners(), 'the input is the new man\'s').toEqual(['stiff'])
  })

  it('the input\'s No is for BOTH: the man in the box does not earn, and neither does the man under him', () => {
    /* until the one-rule build the man in the box earned here ("ordinary work, default yes" — D470) */
    landed(['stiff', 'bane'], { oil: NO })
    expect(earners()).toEqual([])
  })

  it('an UNANSWERED input: neither earns until it is answered', () => {
    /* …and here too: "the man in the box still earns, the member not until he answers" */
    landed(['stiff', 'bane'], { oil: {} })
    expect(earners()).toEqual([])
    INPUTS[0].oil = YES
    expect(earners(), 'answered once, for everyone in it').toEqual(['bane', 'stiff'])
  })

  it('his span is the input\'s — its own address, its own window, and the input\'s answer as its default', () => {
    landed(['stiff', 'bane'])
    const w = work().stiff[0] as any
    expect(w.item).toBe(ITEM)
    expect(w.via, 'through the input, not the schedule\'s walk').toBe('input')
    expect(w.dflt, 'the default that decided it: the input\'s Yes').toBe(true)
    expect([w.s, w.e], 'the request\'s own window').toEqual([9 * 60, 17 * 60])
    expect(work().bane[0], 'the same span for everyone in it').toEqual(w)
  })

  it('an ALL-DAY request: the row carries no times, and he earns over the request\'s window all the same', () => {
    landed(['stiff', 'bane'], { allday: true, s: 0, e: 1439 })
    expect([row().str, row().end]).toEqual(['', ''])
    expect(figure('stiff')).toBe('FO')
  })
})

describe('each person in the input is decided on his own — only the scheduler leaves one out (D762)', () => {
  it('the man in the box can be taken off alone — the other keeps earning', () => {
    landed(['stiff', 'bane'])
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'deny' } }
    expect(earners()).toEqual(['bane'])
  })

  it('…and switched ON alone over the input\'s No', () => {
    landed(['stiff', 'bane'], { oil: NO })
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'allow' } }
    expect(earners()).toEqual(['stiff'])
    expect((work().stiff[0] as any).dflt, 'the span says the default was No — the switch decided it').toBe(false)
  })

  it('his refusal is not thrown away as a stale one — he is in the input (the hand-over prune keeps it)', () => {
    landed(['stiff', 'bane'])
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'deny' } }
    expect(oilEvidence(SAT).d.people, 'the decision survives the read').toEqual({ [`stiff|${ITEM}`]: 'deny' })
  })

  it('a decision about a man who is NOT in the input decides nothing — nobody on the row is the scheduler\'s own any more', () => {
    landed(['bane'])
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'allow' } }
    expect(oilEvidence(SAT).d.people, 'dropped on the read').toBeUndefined()
    expect(earners(), 'an allow cannot put him into an input he is not in').toEqual(['bane'])
  })

  it('a man in the box AND two under the row all earn, each once', () => {
    landed(['stiff', 'bane', 'plasma'])
    expect(earners()).toEqual(['bane', 'plasma', 'stiff'])
    for (const p of ['bane', 'plasma', 'stiff']) expect(work()[p].length, p).toBe(1)
  })

  it('one man is in an input ONCE (D271): in the box and again under the row is refused at the write', () => {
    landed(['stiff', 'bane'])
    expect(shapeProblem({ ...INPUTS[0], people: [{ p: 'stiff' }, { p: 'bane' }, { p: 'stiff' }] })).toMatch(/already on this input/i)
    expect(putPerson(INPUTS[0], 'stiff'), 'and the writer does not put him in twice').toBe(false)
    expect(work().stiff.length).toBe(1)
  })
})

describe('what it does NOT change', () => {
  it('THE CONTROL: an input of one person — he stands in his own box and earns once, on his answer', () => {
    landed()
    expect(row().who).toBe('bane')
    expect('more' in row(), 'nobody under him').toBe(false)
    expect(earners()).toEqual(['bane'])
    expect(work().bane.length).toBe(1)
    INPUTS[0].oil = NO
    expect(earners()).toEqual([])
  })

  /* (1) THE RULE SURVIVES, on a rebuilt fixture (step 4 of the one-rule build, 12 Oct 26 — owner D760: "a CX the
     scheduler puts on a row that came from an input cancels the input itself", reading 1: "a cancelled input earns
     nobody OIL"). The case wrote the CX and the information-only mark on the ROW alone; they are the INPUT's now, so
     the fixture puts them on the record and the row is the copy `requestRowFields` writes of it — as `landed` already
     builds it. Both marks off, everyone earns again. */
  it('a CANCELLED or information-only row earns nobody — the man in the box included', () => {
    landed(['stiff', 'bane'], { cx: true, cxr: 'WX' })
    expect([row().cx, row().cxr], 'the row is the copy of its input').toEqual([true, 'WX'])
    expect(earners()).toEqual([])
    const remake = () => { const r = row(); delete r.cx; delete r.cxr; delete r.info; Object.assign(r, requestRowFields(INPUTS[0])) }
    INPUTS[0].cx = false; delete INPUTS[0].cxr; INPUTS[0].info = true; remake()
    expect([!!row().cx, row().info]).toEqual([false, true])
    expect(earners()).toEqual([])
    delete INPUTS[0].info; remake()
    expect(earners(), 'neither mark: both earn again').toEqual(['bane', 'stiff'])
  })

  it('a request that never asks (Personal) earns nobody anything, whoever is in its box', () => {
    landed(['stiff'], { type: 'Personal', oil: undefined })
    expect(row().who).toBe('stiff')
    expect(earners()).toEqual([])
  })

  it('a placeholder in the box is still the crowd, never a named man (D753 — D46 as changed)', () => {
    HOOKS.oilSentinel = () => ['plasma', 'stiff']
    landed(['allavail', 'bane'])
    expect(row().who).toBe('allavail')
    expect(earners(), 'the named man, and the men behind the puck — on the input\'s Yes').toEqual(['bane', 'plasma', 'stiff'])
    INPUTS[0].oil = NO
    expect(earners(), 'and none of them on its No').toEqual([])
  })

  it('A STORED ROW\'S WORDS ARE NOT THE INPUT: a name left in its box, or a man left under it, that the input does not hold earns nobody', () => {
    /* a row as a day stored before the build can still carry it, not yet re-made: free text in the box (a name the
       roster does not hold), and a man the scheduler once put under the row (D18 as it stood). The credit reads the
       input, never the row. */
    landed(['bane'], {}, { who: 'Visitor', more: ['stiff'] })
    expect(earners()).toEqual(['bane'])
    expect(spanDefault(DAYS[SAT], oilEvidence(SAT), 'bane', ITEM)).toBe(true)
  })

  it('a day that cannot earn stays at nothing', () => {
    HOOKS.oilEarningDay = () => false
    landed(['stiff', 'bane'])
    expect(earners()).toEqual([])
  })
})

/* THE ROW IS RE-MADE WHOLE FROM THE INPUT (overlay.ts, rule 6 — D755; the plan §4.3). A request's row is worked out
   from the request whenever its day is read: its id, its place and the marks only a scheduler makes (the red box, CX,
   information only) are kept; its name, times, remark and EVERYONE on it are written over the stored row.
   Until the one-rule build the name box was "the scheduler's when it holds someone other than the holder" and survived
   the member's edit (Fable's final read, F1 — phase 7), and so did the men under the row. They survive now because
   they are IN the input — and a man the stored row shows who is not in it comes off (the plan's R6). */
describe('the row after the member\'s own edit of his request: everyone in the input, in the order they joined (D755 — Fable F1 as changed)', () => {
  const view = () => viewOfWeek('13/07/2026', DAYS as any[], { loaded: true, issued: () => null })

  it('the man in the box: still there after the remarks are edited, and still earning', () => {
    landed(['stiff', 'bane'])
    ;(INPUTS[0] as any).remarks = 'bring the checklist'
    view()
    expect(row().rmks, 'the edit reached the row').toBe('bring the checklist till 18 Jul')
    expect(row().who, 'the first to join is still in the box').toBe('stiff')
    expect(row().more).toEqual(['bane'])
    expect(earners()).toEqual(['bane', 'stiff'])
  })

  it('…and after the times are changed', () => {
    landed(['stiff', 'bane'])
    ;(INPUTS[0] as any).s = 10 * 60
    view()
    expect(row().who).toBe('stiff')
    expect(row().str, 'the row follows the input\'s time').toBe(requestRowFields(INPUTS[0]).str)
    expect(figure('stiff'), 'he earns over the request\'s new window').toBe('FO')
    expect((work().stiff[0] as any).s).toBe(10 * 60)
  })

  it('a placeholder in the box survives it too — its crowd is still written down (D753)', () => {
    HOOKS.oilSentinel = () => ['plasma']
    landed(['allavail', 'bane'])
    ;(INPUTS[0] as any).remarks = 'bring the checklist'
    view()
    expect(row().who).toBe('allavail')
    expect(row().more).toEqual(['bane'])
    expect(oilSentOf(oilEvidence(SAT), ITEM).state).toBe('resolved')
  })

  it('a man REPLACED in the input gives way in the box (D755 (2))', () => {
    landed(['bane'])
    expect(swapPerson(INPUTS[0], 'bane', 'plasma')).toBe(true)
    view()
    expect(row().who, 'the input\'s new man').toBe('plasma')
    expect('more' in row()).toBe(false)
  })

  it('THE CONTROL: a man under the row who is IN the input is kept by an edit…', () => {
    landed(['bane', 'stiff'])
    ;(INPUTS[0] as any).remarks = 'bring the checklist'
    view()
    expect(row().who).toBe('bane')
    expect(row().more, 'in the input, so on the row').toEqual(['stiff'])
    expect(row().rmks).toBe('bring the checklist till 18 Jul')
  })

  it('…and one who is NOT in it comes off at the re-make, with a name the box should not hold (the plan\'s R6)', () => {
    /* until the one-rule build these were "the extras kept, as always" and "the scheduler's man in the box" */
    landed(['bane'], {}, { who: 'stiff', more: ['plasma'] })
    ;(INPUTS[0] as any).remarks = 'bring the checklist'
    view()
    expect(row().who, 'the input\'s own person').toBe('bane')
    expect('more' in row(), 'nobody under him').toBe(false)
    expect(earners()).toEqual(['bane'])
  })

  it('a stored row in another order is re-made in the order they joined — nobody is taken off his own row by an edit', () => {
    landed(['stiff', 'bane'], {}, { who: 'bane', more: ['stiff'] })
    ;(INPUTS[0] as any).remarks = 'bring the checklist'
    view()
    expect(row().who).toBe('stiff')
    expect(row().more).toEqual(['bane'])
  })
})

/* A DECISION ABOUT A MAN, AS PEOPLE JOIN AND LEAVE (Astra's final read of phase 7, gap 3 — as it reads on the one
   record). The rule was phase 6 (a)'s for an extra: a decision about a man is kept while he is on the row or holds the
   request, and is void once the request has LEFT him since it was made. On the one record that is his own entry's
   stamp: a decision is made under the input's holding count (`oild.pa`), his entry carries the count at which he was
   put in (`h`), and a decision older than his entry reads as nothing (oilev.ts pruneHandedOverDecisions;
   inputown.ts). Nobody's stamp moves when someone ELSE joins or leaves. */
describe('a decision about the man in the name box, as the others leave and he is replaced (Astra, gap 3 — on the one record)', () => {
  const view = () => viewOfWeek('13/07/2026', DAYS as any[], { loaded: true, issued: () => null })
  const KEY = `stiff|${ITEM}`
  /* bane's request; the scheduler puts stiff in, then switches him off — under the holding he was put in at */
  const refused = () => {
    landed(['bane'])
    expect(putPerson(INPUTS[0], 'stiff')).toBe(true)
    ;(DAYS[SAT] as any).oild = { people: { [KEY]: 'deny' }, pa: { [KEY]: INPUTS[0].hand } }
  }

  it('the first man leaves and the input is HIS alone: the tap-off still stands, and nobody earns twice', () => {
    refused()
    expect(takePerson(INPUTS[0], 'bane')).toBe(true)
    view()
    expect(row().who, 'the box holds the input\'s man').toBe('stiff')
    expect(oilEvidence(SAT).d.people, 'it never left him: the tap-off is kept').toEqual({ [KEY]: 'deny' })
    expect(earners(), 'so he earns nothing, and the man who left is off the row').toEqual([])
  })

  it('…and it stands while ANOTHER man joins and leaves', () => {
    refused()
    expect(putPerson(INPUTS[0], 'plasma')).toBe(true)
    expect(oilEvidence(SAT).d.people).toEqual({ [KEY]: 'deny' })
    expect(earners()).toEqual(['bane', 'plasma'])
    expect(takePerson(INPUTS[0], 'plasma')).toBe(true)
    expect(oilEvidence(SAT).d.people).toEqual({ [KEY]: 'deny' })
  })

  it('…and when HE is replaced: the decision made while he was in it is void, and he is off the row', () => {
    refused()
    takePerson(INPUTS[0], 'bane')
    expect(swapPerson(INPUTS[0], 'stiff', 'plasma')).toBe(true)
    view()
    expect(row().who, 'the man replaced gives way').toBe('plasma')
    expect(oilEvidence(SAT).d.people, 'the stale decision decides nothing').toBeUndefined()
    expect(earners()).toEqual(['plasma'])
  })

  it('…and when he is taken out and PUT BACK: a new holding — the old tap-off does not come back with him', () => {
    refused()
    takePerson(INPUTS[0], 'stiff')
    expect(putPerson(INPUTS[0], 'stiff')).toBe(true)
    expect(oilEvidence(SAT).d.people).toBeUndefined()
    expect(earners()).toEqual(['bane', 'stiff'])
  })
})

/* THE OLD RULE, WHERE IT IS STILL TRUE. A day published before the one-rule build carries a block whose claims name
   one `person` — the member who filed — and a frozen row on which the scheduler's man really did stand in the box in
   his place. That day went out under D470 and D18, and it is read by them: the holder on his own answer, every other
   named man on the frozen row on an ordinary yes. Built by hand — no door of this build can make one. */
describe('a day issued before the one-rule build keeps the OIL it went out with (D48, D142)', () => {
  const frozenDay = (r: any) => ({ ...JSON.parse(JSON.stringify(DAYS[SAT])),
    ground: [{ rid: 'rold', prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'rq1', ...r }] })
  const frozenEv = (ans: number | null, d: any = {}, sent: any = {}): OilEvidence => ({ iso: SAT_ISO, earns: true, d,
    inputs: [{ iid: 'rq1', person: 'bane', type: 'Training', asks: true, acc: 'g', stand: 'active', win: [9 * 60, 17 * 60], ans }],
    sent, mem: 1 })
  const paid = (day: any, ev: OilEvidence) => Object.keys(oilEarnedWork(day, ev)).sort()

  it('D470 as it stood: a named man in the box earns by default, whatever the member answered — who earns on his own answer', () => {
    expect(paid(frozenDay({ who: 'stiff' }), frozenEv(1)), 'a Yes: both').toEqual(['bane', 'stiff'])
    expect(paid(frozenDay({ who: 'stiff' }), frozenEv(0)), 'the member\'s own No: the man in the box alone').toEqual(['stiff'])
    expect(paid(frozenDay({ who: 'stiff' }), frozenEv(null)), 'not answered: the same').toEqual(['stiff'])
    const w = oilEarnedWork(frozenDay({ who: 'stiff', str: '', end: '' }), frozenEv(0)).stiff[0] as any
    expect([w.item, w.dflt, w.s, w.e], 'ordinary work on the request\'s address, over the claim\'s window — the row has no times').toEqual([ITEM, true, 9 * 60, 17 * 60])
  })

  it('the men on the frozen row, each once: the box and the extras (D18), the holder never among them', () => {
    expect(landedExtras(frozenDay({ who: 'stiff', more: ['stiff', 'plasma'] }), 'rq1', 'bane')).toEqual(['stiff', 'plasma'])
    expect(landedExtras(frozenDay({}), 'rq1', 'bane'), 'the member in his own box is not an extra').toEqual([])
    const work = oilEarnedWork(frozenDay({ who: 'stiff', more: ['stiff', 'plasma'] }), frozenEv(1))
    expect(Object.keys(work).sort()).toEqual(['bane', 'plasma', 'stiff'])
    expect(work.stiff.length).toBe(1)
    expect(paid(frozenDay({ who: 'Visitor' }), frozenEv(1)), 'free text in the box earns nobody').toEqual(['bane'])
  })

  it('a refusal frozen with the day takes the man in the box off alone; a placeholder in the box is the crowd', () => {
    expect(paid(frozenDay({ who: 'stiff' }), frozenEv(1, { people: { [`stiff|${ITEM}`]: 'deny' } }))).toEqual(['bane'])
    expect(paid(frozenDay({ who: 'allavail' }), frozenEv(0, {}, { [ITEM]: ['plasma', 'stiff'] })), 'D46 as it stood').toEqual(['plasma', 'stiff'])
  })
})
