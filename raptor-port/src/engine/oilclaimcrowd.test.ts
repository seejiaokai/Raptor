/* [OIL-SEATS-CAN-EARN] STEP 6 — a placeholder on a request's row — AS THE ONE-RULE BUILD LEFT IT
   ([ALL-AVAIL-AS-MEMBER] step 2 (d), 12 Oct 26; the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.7).

   WHAT THIS FILE PINNED UNTIL THEN (docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 6, §2 — D46,
   22 Sep 26): a placeholder the SCHEDULER dropped on a named man's accepted request row — in its name box or under it
   — credited the crowd it stood for BY DEFAULT YES, whatever the man had answered for himself; the man stayed on his
   own answer ("the split, not the skip").

   WHAT HE RULED SINCE, and why half of that is gone for live data:
   · D755 (11 Oct 26) — "a row that came from an input IS the input: whoever stands on it — a named person or ALL AVAIL
     / ALL, whoever put them there … — is in the input". So the placeholder is ONE OF THE INPUT'S OWN PEOPLE, and nobody
     on such a row is "the scheduler's own" any more.
   · D753 — where ALL AVAIL / ALL is one of an input's own people, the men behind it follow the OIL answer given for the
     input, and the scheduler may still switch any one man.
   · D762 — the OIL question has ONE answer, for everyone in the input; only the scheduler leaves one person out, in
     OIL Earn on the day.
   So the crowd no longer earns over the input's No, or before it is answered: every named person, and every man of the
   crowd who is not himself named in it, earns through the input's own address when its answer for the day is more
   than 0 — unless the scheduler's switch for him says otherwise (oilev.ts oilEarnedWork, claimDefault).

   WHAT SURVIVES, and is pinned here on the one record:
   · the crowd is written down under the input's own address, over the INPUT's window and never the row's (Fable M6:
     an all-day request lands a row with no times at all), and an issued day keeps the people it went out with (D44);
   · a man NAMED in the input is never in its crowd, so nobody is credited twice;
   · the scheduler still decides man by man, and that decision is not swept away as a handed-over request's;
   · a cancelled, information-only or taken-off row credits nobody.

   AND A DAY THAT HAS ALREADY GONE OUT KEEPS WHAT IT WENT OUT WITH (D48, D142): a block frozen before the build — a
   claim that names one `person` and no `people` — is still read by D46 as it stood, off that day's own frozen row
   (oilev.ts legacyClaim / legacyEarned / landedExtras). The last describe pins that.

   THE ENGINE RULE IS PINNED AHEAD OF THE DOOR. In this step of the build the doors still refuse a placeholder beside
   named people (inputs.ts placeholderProblem — the door opens in step 3), so these fixtures put the record straight
   into INPUTS; its row is written as the row's own body writes it (overlay.ts requestRowFields). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED, dayApproved, setDayApproved, signOf, dayCurVer, daySnapOf } from './publish'
import { ensureRowIds } from './rowids'
import { envMin, uniformOil, inputItemKey } from './oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, landedExtras, spanDefault, claimDefault, earnsFrom, type OilEvidence } from './oilev'
import { requestRowFields } from './overlay'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
/* who the placeholder stands for. `bane` is NAMED in the input in every fixture below and is deliberately inside this
   list: a crowd that swept him up would credit him twice. */
const CROWD = ['bane', 'stiff', 'plasma']
const ITEM = inputItemKey('rq1')

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.correcting = {}
  /* stripped: the seed Saturday carries flying, duty and sim work of its own,
     and an assertion of the form "only these three are paid" would pass on its
     back */
  Object.assign(DAYS[SAT] as any, { waves: [], dutywaves: [], sims: {}, ground: [], allhands: [], oild: undefined })
  ensureRowIds(DAYS)
  HOOKS.oilEarningDay = (di: number) => di === SAT
  HOOKS.oilDayISO = (di: number) => (di === SAT ? SAT_ISO : '2026-07-15')
  HOOKS.oilSentinel = () => CROWD.slice()
})
afterEach(() => { HOOKS.oilEarningDay = earningDay; HOOKS.oilDayISO = dayISO; HOOKS.oilSentinel = sentinel })

const publish = (di: number) => {
  const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
  setDayApproved(di, true)
}
const groundRow = (di: number, r: any) => {
  DAYS[di].ground = (DAYS[di].ground || []).concat([r]); ensureRowIds(DAYS)
  return DAYS[di].ground[DAYS[di].ground.length - 1]
}
/* THE FIGURE AS THE CREDIT SEES IT: off the ISSUED snapshot once the day has
   gone out, off the working copy before it has — the choice leavewar/sync.ts
   makes. */
const figure = (di: number, person: string) => {
  const snap: any = dayApproved(di) ? daySnapOf(di, dayCurVer(di)) : null
  const d = snap && snap.d ? snap.d : DAYS[di]
  const work = oilEarnedWork(d, oilEvidenceOf(di, d))
  const v = uniformOil(envMin((work[person] || []).map((w: any) => [w.s, w.e] as [number, number])))
  return v === 1 ? 'FO' : v === 0.5 ? 'HO' : null
}
const paidNames = (di: number) => {
  const snap: any = dayApproved(di) ? daySnapOf(di, dayCurVer(di)) : null
  const d = snap && snap.d ? snap.d : DAYS[di]
  return Object.keys(oilEarnedWork(d, oilEvidenceOf(di, d))).sort()
}

/* ONE INPUT — a Training on the Saturday, 0900–1700, answered Yes — HOLDING `ids` in the order they joined (bane and
   ALL AVAIL unless said), landed on the day: its row is the copy of it the row's own body writes (D755) */
const YES = { [SAT_ISO]: 1 }, NO = { [SAT_ISO]: 0 }
const landed = (ids: string[] = ['bane', 'allavail'], over: any = {}, row: any = {}) => {
  INPUTS.unshift({ iid: 'rq1', type: 'Training', date: 'Jul 18', yr: 2026, acc: 'g', allday: false, s: 9 * 60, e: 17 * 60,
    remarks: '', mod: 'now', by: 'bane', oil: YES, people: ids.map(p => ({ p })), ...over })
  return groundRow(SAT, { ...requestRowFields(INPUTS[0]), src: 'rq1', ...row })
}

describe('ALL AVAIL / ALL as one of an input\'s own people: on the input\'s Yes the people it stands for earn (D753, D755 — D46 as changed)', () => {
  it('beside a named man — he stands in the name box, the placeholder under him', () => {
    const row = landed()
    expect([row.who, row.more], 'the row is the input, whole').toEqual(['bane', ['allavail']])
    expect(paidNames(SAT), 'the named man, and the crowd beside him').toEqual(['bane', 'plasma', 'stiff'])
    expect(figure(SAT, 'stiff'), 'the crowd earns the input\'s own day').toBe('FO')
  })

  it('FIRST of the list, in the name box itself (Codex OSE-R2-04) — the order they joined in changes nothing', () => {
    const row = landed(['allavail', 'bane'])
    expect(row.who, 'the first to join stands in the name box').toBe('allavail')
    expect(paidNames(SAT)).toEqual(['bane', 'plasma', 'stiff'])
    expect(figure(SAT, 'bane'), 'he is named in the input: it credits him').toBe('FO')
  })

  it('and ALL reads the same as ALL AVAIL', () => {
    landed(['bane', 'all'])
    expect(paidNames(SAT)).toEqual(['bane', 'plasma', 'stiff'])
  })

  it('THE PLACEHOLDER ITSELF IS IN NOBODY\'S WORK — it is not a man', () => {
    landed()
    const work = oilEarnedWork(DAYS[SAT], oilEvidence(SAT))
    expect(work.allavail).toBeUndefined()
    expect(work.all).toBeUndefined()
  })
})

describe('ONE answer for everyone in the input — the named man and the crowd alike (D762; D46\'s default-yes for the crowd is gone)', () => {
  it('a man named in it is never credited TWICE, even though the crowd would name him', () => {
    landed()
    const ev = oilEvidence(SAT)
    expect(ev.sent[ITEM], 'he is not in the crowd that is written down').not.toContain('bane')
    expect(oilEarnedWork(DAYS[SAT], ev).bane.length, 'one span, as himself — not a second as part of the crowd').toBe(1)
  })

  it('the input\'s NO is for everyone: the named man does not earn, and neither does the crowd', () => {
    /* until the one-rule build the crowd earned here — "the scheduler put the crowd there; it is ordinary work" (D46).
       The placeholder is one of the input's people now, and the input has one answer (D753, D762). */
    landed(undefined, { oil: NO })
    expect(figure(SAT, 'bane')).toBe(null)
    expect(figure(SAT, 'stiff'), 'the men behind ALL AVAIL follow the input\'s answer').toBe(null)
    expect(paidNames(SAT)).toEqual([])
  })

  it('an UNANSWERED input credits nobody — and still gathers the crowd', () => {
    /* until the one-rule build "the crowd does not wait on his answer"; it waits now, with everyone else in it */
    landed(undefined, { oil: {} })
    expect(figure(SAT, 'bane'), 'not answered, so nothing for him yet').toBe(null)
    expect(figure(SAT, 'plasma'), 'nor for the crowd').toBe(null)
    expect(oilEvidence(SAT).sent[ITEM], 'who is behind the puck is a scheduling fact: written down all the same (D27)').toEqual(['stiff', 'plasma'])
  })

  it('an answer of a half day is no cap — it admits the work, and the hours decide the amount', () => {
    landed(undefined, { oil: { [SAT_ISO]: 0.5 } })
    expect(figure(SAT, 'bane')).toBe('FO')
    expect(figure(SAT, 'plasma')).toBe('FO')
  })
})

describe('what the crowd is resolved against, and what holds it still', () => {
  it('the INPUT\'s window, not the row\'s times — an all-day input\'s row has none (Fable M6)', () => {
    let asked: any = null
    HOOKS.oilSentinel = (_iso: string, win: [number, number]) => { asked = win; return CROWD.slice() }
    const row = landed(undefined, { allday: true, s: 0, e: 1439 })
    expect([row.str, row.end], 'the row carries no times at all').toEqual(['', ''])
    expect(figure(SAT, 'stiff'), 'the input carries the day').toBe('FO')
    expect(asked, 'and the crowd was worked out over it').toEqual([0, 1439])
  })

  it('the day WRITES THE CROWD DOWN under the input\'s own address — never a man who is named in it', () => {
    landed()
    expect(oilEvidence(SAT).sent[ITEM], 'or an issued day could not hold its people still').toEqual(['stiff', 'plasma'])
  })

  it('AN ISSUED DAY KEEPS THE PEOPLE IT WENT OUT WITH (D44)', () => {
    landed()
    publish(SAT)
    expect(figure(SAT, 'plasma'), 'he was on it when it was issued').toBe('FO')
    /* somebody files leave and drops out of the crowd — the issued day must not
       quietly stop crediting him */
    HOOKS.oilSentinel = () => ['stiff']
    expect(figure(SAT, 'plasma'), 'the issued record is what he is owed against').toBe('FO')
    expect(oilEvidence(SAT).sent[ITEM], 'while the working copy shows today\'s crowd').toEqual(['stiff'])
  })

  it('…and the ANSWER it went out with (D142): changed to No since, the issued credit stands until it goes out again', () => {
    landed()
    publish(SAT)
    INPUTS[0].oil = NO
    expect(figure(SAT, 'plasma')).toBe('FO')
    expect(Object.keys(oilEarnedWork(DAYS[SAT], oilEvidence(SAT))), 'the working copy already reads the No').toEqual([])
  })
})

describe('the scheduler can still decide man by man (D753, D762 — "only the scheduler leaves one person out")', () => {
  it('one man is taken off the crowd and the rest are untouched', () => {
    landed()
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'deny' } }
    expect(figure(SAT, 'stiff'), 'taken off').toBe(null)
    expect(figure(SAT, 'plasma'), 'the other man in the crowd is untouched').toBe('FO')
    expect(figure(SAT, 'bane'), 'and so is the man named in it').toBe('FO')
  })

  it('…and switched ON over the input\'s No: he earns, and only he', () => {
    landed(undefined, { oil: NO })
    ;(DAYS[SAT] as any).oild = { people: { [`plasma|${ITEM}`]: 'allow' } }
    expect(paidNames(SAT)).toEqual(['plasma'])
  })

  it('THAT DECISION SURVIVES — it is not swept away as a handed-over request', () => {
    /* the tidy-up that drops a decision naming a man who is no longer in the input must not read a crowd member as an
       impostor: he has no entry of his own, and never will. If it did, his refusal would be deleted on the way out and
       he would be credited anyway. */
    landed()
    ;(DAYS[SAT] as any).oild = { people: { [`plasma|${ITEM}`]: 'deny' } }
    const ev = oilEvidence(SAT)
    expect((ev.d.people || {})[`plasma|${ITEM}`], 'the scheduler\'s decision is kept').toBe('deny')
    expect(figure(SAT, 'plasma')).toBe(null)
  })

  it('…while he is busy that day too: a decision is never thrown away because the man it names is not free today', () => {
    landed()
    ;(DAYS[SAT] as any).oild = { people: { [`plasma|${ITEM}`]: 'deny' } }
    HOOKS.oilSentinel = () => ['stiff']
    expect((oilEvidence(SAT).d.people || {})[`plasma|${ITEM}`], 'or he would be credited in silence the day he is free again').toBe('deny')
  })

  it('…but NOT a new holding of the placeholder: ALL AVAIL taken off and dropped back does not bring an old switch back (Fable F11)', () => {
    /* the decision was made under the input's first holding (no stamp = 0); the placeholder was put back in under its
       second (`h`) */
    landed()
    INPUTS[0].hand = 2
    INPUTS[0].people[1].h = 2
    ;(DAYS[SAT] as any).oild = { people: { [`plasma|${ITEM}`]: 'deny' } }
    expect(oilEvidence(SAT).d.people, 'read against the placeholder\'s own holding').toBeUndefined()
    expect(figure(SAT, 'plasma')).toBe('FO')
    /* …and one made under the holding it stands in now does decide */
    ;(DAYS[SAT] as any).oild = { people: { [`plasma|${ITEM}`]: 'deny' }, pa: { [`plasma|${ITEM}`]: 2 } }
    expect(figure(SAT, 'plasma')).toBe(null)
  })

  it('switching the whole input off stops the crowd as well', () => {
    landed()
    ;(DAYS[SAT] as any).oild = { items: { [ITEM]: 0 } }
    expect(paidNames(SAT), 'nobody earns from it').toEqual([])
  })
})

describe('the screen and the credit ask the SAME body', () => {
  it('each man\'s switch starts where his credit does — the named man and the crowd, on a Yes, a No and no answer', () => {
    /* until the one-rule build the screen asked `landedExtras` for the crowd on a named man's row; it asks the one
       default every claim has now (spanDefault → claimDefault) */
    for (const [oil, dflt] of [[YES, true], [NO, false], [{}, false]] as Array<[any, boolean]>) {
      DAYS[SAT].ground = []
      for (let i = INPUTS.length - 1; i >= 0; i--) if (INPUTS[i].iid === 'rq1') INPUTS.splice(i, 1)
      landed(undefined, { oil })
      const ev = oilEvidence(SAT), d = DAYS[SAT]
      const c = ev.inputs.find(i => i.iid === 'rq1')!
      const work = oilEarnedWork(d, ev)
      for (const p of ['bane', 'stiff', 'plasma']) {
        expect(spanDefault(d, ev, p, ITEM), `${p}, answer ${JSON.stringify(oil)}`).toBe(dflt)
        expect(claimDefault(d, ev, c, p), `${p}: the one body`).toBe(dflt)
        expect(!!work[p], `${p}: credited exactly when his default says so`).toBe(earnsFrom(ev, p, ITEM, spanDefault(d, ev, p, ITEM)))
      }
    }
  })

  it('a second NAMED man beside the crowd is kept, not replaced by it — each of them once', () => {
    HOOKS.oilSentinel = () => [...CROWD, 'divot']
    landed(['bane', 'divot', 'allavail'])
    expect(paidNames(SAT)).toEqual(['bane', 'divot', 'plasma', 'stiff'])
    const ev = oilEvidence(SAT), work = oilEarnedWork(DAYS[SAT], ev)
    expect(ev.sent[ITEM], 'neither named man is in the crowd').toEqual(['stiff', 'plasma'])
    for (const p of ['bane', 'divot', 'plasma', 'stiff']) expect(work[p].length, p).toBe(1)
  })
})

describe('the controls', () => {
  it('a CANCELLED row credits nobody — not the named man, not the crowd', () => {
    const row = landed()
    row.cx = true
    expect(paidNames(SAT)).toEqual([])
  })

  it('an INFORMATION-ONLY row is the same answer', () => {
    const row = landed()
    row.info = true
    expect(paidNames(SAT)).toEqual([])
  })

  it('D28 — an input with no placeholder among its people gathers no crowd', () => {
    landed(['bane', 'divot'])
    expect(paidNames(SAT), 'its two people, and nobody who merely happens to be free').toEqual(['bane', 'divot'])
    expect(oilEvidence(SAT).sent[ITEM], 'and nothing is written down for it').toBeUndefined()
  })

  it('and an input TAKEN OFF the programme is not a claim at all, placeholder or no', () => {
    landed(undefined, { acc: 'r' })
    expect(paidNames(SAT), 'a refused request earns nobody anything').toEqual([])
    expect(oilEvidence(SAT).sent[ITEM], 'and no crowd is gathered for it').toBeUndefined()
  })
})

/* THE OLD RULE, WHERE IT IS STILL TRUE. A day published before the one-rule build carries a block whose claims name
   one `person`; on such a day the placeholder really was the scheduler's own drop on the man's row, and D46 was the
   rule the day went out under. The block is the record: it is read by that rule, off that day's own frozen row, and
   nothing made since reaches it. Built by hand — no door of this build can make one. */
describe('a day issued before the one-rule build keeps the OIL it went out with (D48, D142)', () => {
  const frozenDay = (row: any) => ({ ...JSON.parse(JSON.stringify(DAYS[SAT])),
    ground: [{ rid: 'rold', prog: 'TRAINING', str: '0900', end: '1700', who: 'bane', src: 'rq1', ...row }] })
  const frozenEv = (ans: number | null, d: any = {}): OilEvidence => ({ iso: SAT_ISO, earns: true, d,
    inputs: [{ iid: 'rq1', person: 'bane', type: 'Training', asks: true, acc: 'g', stand: 'active', win: [9 * 60, 17 * 60], ans }],
    sent: { [ITEM]: CROWD.slice() }, mem: 1 })
  const paid = (day: any, ev: OilEvidence) => Object.keys(oilEarnedWork(day, ev)).sort()

  it('D46 as it stood: the crowd of a placeholder dropped on a named man\'s row earns by default — under the row, or in its name box', () => {
    expect(paid(frozenDay({ more: ['allavail'] }), frozenEv(1))).toEqual(['bane', 'plasma', 'stiff'])
    expect(paid(frozenDay({ who: 'allavail' }), frozenEv(1)), 'his request still names him').toEqual(['bane', 'plasma', 'stiff'])
    expect(paid(frozenDay({ more: ['all'] }), frozenEv(1))).toEqual(['bane', 'plasma', 'stiff'])
  })

  it('the man\'s own No, or no answer, stood for him alone — the crowd earned all the same, and he never twice', () => {
    for (const ans of [0, null]) {
      const day = frozenDay({ more: ['allavail'] }), ev = frozenEv(ans)
      expect(paid(day, ev), `answer ${ans}`).toEqual(['plasma', 'stiff'])
      const c = ev.inputs[0]
      expect(claimDefault(day, ev, c, 'bane'), 'the holder: his own answer').toBe(false)
      expect(claimDefault(day, ev, c, 'stiff'), 'the crowd: yes').toBe(true)
      expect(spanDefault(day, ev, 'stiff', ITEM)).toBe(true)
    }
    expect(oilEarnedWork(frozenDay({ more: ['allavail'] }), frozenEv(1)).bane.length).toBe(1)
  })

  it('the row\'s people are read off the frozen row — the crowd, and a named man beside it', () => {
    const day = frozenDay({ more: ['divot', 'allavail'] }), ev = frozenEv(1)
    expect(landedExtras(day, 'rq1', 'bane', ev.sent[ITEM]).sort()).toEqual(['divot', 'plasma', 'stiff'])
    expect(paid(day, ev)).toEqual(['bane', 'divot', 'plasma', 'stiff'])
  })

  it('a decision frozen with the day still takes one man off, and a row with no placeholder on it gathers no crowd', () => {
    expect(paid(frozenDay({ more: ['allavail'] }), frozenEv(1, { people: { [`stiff|${ITEM}`]: 'deny' } }))).toEqual(['bane', 'plasma'])
    expect(paid(frozenDay({ more: ['divot'] }), frozenEv(1)), 'D28').toEqual(['bane', 'divot'])
  })
})
