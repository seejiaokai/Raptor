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

   THE ENGINE RULE WAS PINNED AHEAD OF THE DOOR, AND THE DOOR HAS OPENED (step 3 of the build, 12 Oct 26 — owner D750,
   D753, D755, D757). In step 2 the doors still refused a placeholder beside named people ("filed on its own"), so
   these fixtures put the record straight into INPUTS, its row written as the row's own body writes it (overlay.ts
   requestRowFields). That stays this file's method for the RULE — a fixture names exactly the record a case is
   about. What step 3 adds is the last two describes: the record the DOORS make (ui/inputedit.tsx commitInput,
   ui/reqdoor.ts rowPut / rowTake) is the very record these fixtures put in, and earns the same; and the cases only
   real hands can make — a switch stamped by the app's own writers while people and ALL AVAIL come and go. */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, inpId, idsOf } from './inputs'
import { HOOKS } from './hooks'
import { SCHED, dayApproved, setDayApproved, signOf, dayCurVer, daySnapOf } from './publish'
import { ensureRowIds } from './rowids'
import { envMin, uniformOil, inputItemKey } from './oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, landedExtras, spanDefault, claimDefault, earnsFrom, projectOilInputs, oilEvidenceKey, type OilEvidence } from './oilev'
import { requestRowFields } from './overlay'
import { putPerson, takePerson } from './inputown'
import { initStore } from '../state/store'
import { setSession, setMe, DEFAULT_ME } from '../state/auth'
import { commitInput, draftOf } from '../ui/inputedit'
import { rowPut, rowTake } from '../ui/reqdoor'
import { toggleOilPerson } from '../ui/oilmode'
import { setOilAsk, setInpEdit } from '../ui/pops'

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

  /* SECOND PASS, WITH STEP 3 — the placeholder itself arrives, or goes, AFTER the day went out. The issued day is the
     record (D44, D48, D142): it credits the people it was issued with until it goes out again, and what would go out
     is no longer what went out (D45 — the pending mark; its count is ui/phmember.test.tsx's). */
  it('ALL AVAIL put into the input AFTER the Saturday was published: the issued day still credits the named man alone', () => {
    landed(['bane'])
    publish(SAT)
    const issued = () => { const d = (daySnapOf(SAT, dayCurVer(SAT)) as any).d; return oilEvidenceOf(SAT, d) }
    const was = oilEvidenceKey(issued())
    expect(paidNames(SAT)).toEqual(['bane'])
    expect(putPerson(INPUTS[0], 'allavail')).toBe(true)
    expect(paidNames(SAT), 'nobody behind the puck is credited by a day that went out without it').toEqual(['bane'])
    expect(figure(SAT, 'stiff')).toBe(null)
    expect(oilEvidenceKey(issued()), 'the issued record has not moved').toBe(was)
    expect(Object.keys(oilEarnedWork(DAYS[SAT], oilEvidence(SAT))).sort(), 'the working copy shows what WILL go out').toEqual(['bane', 'plasma', 'stiff'])
    expect(oilEvidenceKey(oilEvidence(SAT)), 'and that differs from what went out — a change waiting').not.toBe(was)
  })

  it('…and ALL AVAIL TAKEN OUT after it was published: the issued day still credits the crowd it went out with', () => {
    landed()
    publish(SAT)
    expect(takePerson(INPUTS[0], 'allavail')).toBe(true)
    expect(paidNames(SAT), 'the issued record is what they are owed against').toEqual(['bane', 'plasma', 'stiff'])
    expect(Object.keys(oilEarnedWork(DAYS[SAT], oilEvidence(SAT))), 'the working copy: the named man alone').toEqual(['bane'])
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

  /* SECOND PASS, WITH STEP 3 — the answer changes under switches already made. A switch is the scheduler's own word on
     the day; the input's answer is only the DEFAULT it is read over (D762: "the scheduler's refusal on the day still
     wins"; D28). So a new answer moves everyone who has no switch, and nobody who has one. */
  it('the answer changed from Yes to No, and back, with a deny and an allow already made: each switch still decides its own man', () => {
    landed()
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'deny', [`bane|${ITEM}`]: 'deny' } }
    expect(paidNames(SAT), 'on the Yes: everyone but the two refused').toEqual(['plasma'])
    INPUTS[0].oil = NO
    expect(paidNames(SAT), 'the No is for everyone').toEqual([])
    ;(DAYS[SAT] as any).oild.people[`plasma|${ITEM}`] = 'allow'
    expect(paidNames(SAT), 'one man credited over the No').toEqual(['plasma'])
    INPUTS[0].oil = YES
    expect(paidNames(SAT), 'back on Yes: the two refusals still stand; the allow has become the default').toEqual(['plasma'])
    expect(oilEarnedWork(DAYS[SAT], oilEvidence(SAT)).plasma.length, 'and he is credited once').toBe(1)
  })

  /* SECOND PASS — WHOSE HOLDING A SWITCH IS READ AGAINST (the plan §4.7; engine/inputown.ts: "nobody's switch moves when
     someone ELSE joins or leaves"). The people are put in and taken out by the input's own writers, so the stamps are
     the app's; a switch carries the holding it was made under, as ui/oilmode.ts toggleOilPerson writes it. */
  it('a NAMED man\'s switch does not move when ALL AVAIL joins, or leaves', () => {
    landed(['bane'])
    ;(DAYS[SAT] as any).oild = { people: { [`bane|${ITEM}`]: 'deny' }, pa: { [`bane|${ITEM}`]: Number(INPUTS[0].hand || 0) } }
    expect(paidNames(SAT)).toEqual([])
    expect(putPerson(INPUTS[0], 'allavail')).toBe(true)
    expect((oilEvidence(SAT).d.people || {})[`bane|${ITEM}`], 'still his, beside the placeholder').toBe('deny')
    expect(paidNames(SAT), 'the crowd earns on the Yes; he does not — as himself, or as one of the crowd he would be in').toEqual(['plasma', 'stiff'])
    expect(takePerson(INPUTS[0], 'allavail')).toBe(true)
    expect((oilEvidence(SAT).d.people || {})[`bane|${ITEM}`], 'and still his when it has gone').toBe('deny')
    expect(paidNames(SAT)).toEqual([])
  })

  it('a CROWD man\'s switch does not move when a named person joins, or leaves (D750, D757 step 4: "its switch-offs intact")', () => {
    landed()
    ;(DAYS[SAT] as any).oild = { people: { [`plasma|${ITEM}`]: 'deny' }, pa: { [`plasma|${ITEM}`]: Number(INPUTS[0].hand || 0) } }
    expect(putPerson(INPUTS[0], 'divot')).toBe(true)
    expect(paidNames(SAT), 'divot joins on the Yes; plasma is still off').toEqual(['bane', 'divot', 'stiff'])
    expect(takePerson(INPUTS[0], 'bane')).toBe(true)
    expect(oilEvidence(SAT).sent[ITEM], 'the man taken out is free now: one of the crowd (D757 step 4: "the count rises by one")').toEqual(['bane', 'stiff', 'plasma'])
    expect(paidNames(SAT), 'plasma is STILL off').toEqual(['bane', 'divot', 'stiff'])
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

/* ---- THROUGH THE DOORS (step 3 of the one-rule build, 12 Oct 26 — owner D750, D753, D755, D757) ---------------------
   Until this step no door could make the record the fixtures above put in. Now the input's one writer files it
   (ui/inputedit.tsx commitInput) and the row's door changes it (ui/reqdoor.ts rowPut / rowTake) — and a switch made
   between two such hands is stamped by the app itself (ui/oilmode.ts toggleOilPerson), not by a fixture's guess at
   the stamp. Kept LAST in the file: the store is wired here, and nothing above needs it. */
describe('THE DOORS make the record these fixtures put in — and it earns the same (step 3; D753, D755, D762)', () => {
  const toast = HOOKS.toast
  let SAID: string[] = []
  beforeAll(() => { initStore() })
  beforeEach(() => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff'); SAID = []; HOOKS.toast = (m: any) => { SAID.push(String(m)) } })
  afterEach(() => { HOOKS.toast = toast; setOilAsk(null); setInpEdit(null); setSession(null); setMe(DEFAULT_ME) })

  /* a Training on the Saturday 0900–1700, FILED for `ppl` — its row lands from it */
  const file = (ppl: string[], oil: Record<string, number> | null = YES): any => {
    const had = new Set((INPUTS as any[]).map(r => String(inpId(r))))
    expect(commitInput(null, draftOf({ person: ppl[0], type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 9 * 60, e: 17 * 60, remarks: '' }), ppl, oil ? { oil } : undefined), 'filed').toBe(true)
    const made = (INPUTS as any[]).filter(r => !had.has(String(inpId(r))))
    expect(made, 'ONE record').toHaveLength(1)
    return made[0]
  }
  const rowOf = (r: any) => (DAYS[SAT].ground || []).find((g: any) => g && String(g.src) === String(inpId(r)))
  const keyOf = (r: any, who?: string) => {
    const ri = (DAYS[SAT].ground || []).indexOf(rowOf(r)), row = rowOf(r)
    if (who == null) return `g:${SAT}.${ri}.+`
    if (String(row.who) === who) return `g:${SAT}.${ri}`
    const n = (row.more || []).indexOf(who)
    expect(n, `${who} is on the row`).toBeGreaterThanOrEqual(0)
    return `g:${SAT}.${ri}.x${n}`
  }
  const itemOf = (r: any) => inputItemKey(String(inpId(r)))
  const paidNow = () => Object.keys(oilEarnedWork(DAYS[SAT], oilEvidence(SAT))).sort()

  it('filed for a named man and ALL AVAIL in one go: one record, one claim that names nobody twice, the crowd without him', () => {
    const r = file(['bane', 'allavail'])
    expect(idsOf(r).map(String)).toEqual(['bane', 'allavail'])
    expect('person' in r, 'the new shape: its people, no one `person`').toBe(false)
    const c: any = projectOilInputs(SAT_ISO).find(i => i.iid === String(inpId(r)))
    expect({ people: c.people, ph: c.ph, ans: c.ans, stand: c.stand, win: c.win }, 'the claim the fixtures above project').toEqual({ people: ['bane'], ph: 'allavail', ans: 1, stand: 'active', win: [9 * 60, 17 * 60] })
    expect('person' in c).toBe(false)
    expect([rowOf(r).who, rowOf(r).more], 'its row is the copy the row\'s own body writes').toEqual([requestRowFields(r).who, requestRowFields(r).more])
    expect([rowOf(r).who, rowOf(r).more]).toEqual(['bane', ['allavail']])
    expect(oilEvidence(SAT).sent[itemOf(r)]).toEqual(['stiff', 'plasma'])
    expect(paidNow()).toEqual(['bane', 'plasma', 'stiff'])
    expect(oilEarnedWork(DAYS[SAT], oilEvidence(SAT)).bane.length, 'once').toBe(1)
  })

  it('…and ALL AVAIL dropped on a one-man request\'s row ends at the same record — whichever came first (D755 reading (a))', () => {
    const r = file(['bane'])
    expect(paidNow()).toEqual(['bane'])
    expect(rowPut(keyOf(r), 'allavail')).toBe('done')
    expect(idsOf(r).map(String)).toEqual(['bane', 'allavail'])
    expect(SAID.join(' | ')).toContain('ALL AVAIL added to')
    expect(paidNow()).toEqual(['bane', 'plasma', 'stiff'])
    expect(oilEvidence(SAT).sent[itemOf(r)]).toEqual(['stiff', 'plasma'])
  })

  it('ALL beside a named man, filed and dropped: the same people earn (D753 — "ALL AVAIL or ALL")', () => {
    const r = file(['bane', 'all'])
    expect(paidNow()).toEqual(['bane', 'plasma', 'stiff'])
    expect(rowTake(keyOf(r, 'all'))).toBe('done')
    expect(paidNow()).toEqual(['bane'])
    expect(rowPut(keyOf(r), 'all')).toBe('done')
    expect(paidNow()).toEqual(['bane', 'plasma', 'stiff'])
    expect(oilEarnedWork(DAYS[SAT], oilEvidence(SAT)).all, 'the placeholder is in nobody\'s work').toBeUndefined()
  })

  it('an input filed with NO answer: nobody earns, the crowd is gathered all the same — and answered Yes, everyone does', () => {
    const r = file(['bane', 'allavail'], null)
    expect(r.oil == null || r.oil[SAT_ISO] == null, 'unanswered').toBe(true)
    expect(paidNow()).toEqual([])
    expect(oilEvidence(SAT).sent[itemOf(r)], 'who is behind the puck is a scheduling fact (D27)').toEqual(['stiff', 'plasma'])
    expect(commitInput(r, draftOf(r), ['bane', 'allavail'], { oil: YES })).toBe(true)
    expect(paidNow()).toEqual(['bane', 'plasma', 'stiff'])
  })

  it('the scheduler\'s switches, made with the app\'s own hand, across people and ALL AVAIL coming and going', () => {
    const r = file(['bane'])
    toggleOilPerson(SAT, 'bane', itemOf(r))
    expect(paidNow(), 'bane switched off on his own request').toEqual([])
    expect(rowPut(keyOf(r), 'allavail')).toBe('done')
    expect(paidNow(), 'ALL AVAIL beside him: the crowd earns, he is still off').toEqual(['plasma', 'stiff'])
    toggleOilPerson(SAT, 'plasma', itemOf(r))
    expect(paidNow()).toEqual(['stiff'])
    expect(rowPut(keyOf(r), 'divot')).toBe('done')
    expect(paidNow(), 'a named man joins on the Yes; nobody else\'s switch moved').toEqual(['divot', 'stiff'])
    expect(rowTake(keyOf(r, 'divot'))).toBe('done')
    expect(paidNow(), 'and leaves again: the same').toEqual(['stiff'])
  })
})

/* A SWITCH ACROSS THE LINE BETWEEN "NAMED" AND "ONE OF THE CROWD" — new ground with step 3: only now can one man be
   both, one after the other, on one input. The plan's own words are the measure (§4.7): "the switch-offs of a person
   who leaves are dropped by the existing prune (by his `h`)", and a switch made under an earlier holding "does not
   silently come back" (Fable F11) — the stamp is what stops a revival. And D755 reading (a): two routes to the same
   people give the same OIL rule; only the history may differ.
   THESE CASES SAY WHAT SHOULD HAPPEN BY THOSE WORDS. Where one fails, it is REPORTED as a product fault with this
   re-expression, not adjusted to pass. */
describe('a switch does not cross between a man NAMED in the input and the same man as one of its crowd (the plan §4.7; D755 reading (a))', () => {
  const toast = HOOKS.toast
  beforeAll(() => { initStore() })
  /* bane is free on the Saturday (CROWD names him): taken out of the input he is one of the men behind ALL AVAIL */
  beforeEach(() => { setSession({ user: 'ad', role: 'admin', name: 'ad' }); setMe('stiff'); HOOKS.toast = () => {} })
  afterEach(() => { HOOKS.toast = toast; setOilAsk(null); setInpEdit(null); setSession(null); setMe(DEFAULT_ME) })
  const file = (ppl: string[]): any => {
    const had = new Set((INPUTS as any[]).map(r => String(inpId(r))))
    expect(commitInput(null, draftOf({ person: ppl[0], type: 'Training', date: 'Jul 18', yr: 2026, allday: false, s: 9 * 60, e: 17 * 60, remarks: '' }), ppl, { oil: YES })).toBe(true)
    return (INPUTS as any[]).find(r => !had.has(String(inpId(r))))
  }
  const place = (r: any, who?: string) => {
    const row = (DAYS[SAT].ground || []).find((g: any) => g && String(g.src) === String(inpId(r))), ri = (DAYS[SAT].ground || []).indexOf(row)
    if (who == null) return `g:${SAT}.${ri}.+`
    return String(row.who) === who ? `g:${SAT}.${ri}` : `g:${SAT}.${ri}.x${(row.more || []).indexOf(who)}`
  }
  const paidNow = () => Object.keys(oilEarnedWork(DAYS[SAT], oilEvidence(SAT))).sort()

  /* the same four hands in two orders, ending at the same people: divot and ALL AVAIL in the input, bane taken out of
     it and free — one of the crowd — having been switched OFF by the scheduler while he was named in it */
  const route = (switchFirst: boolean) => {
    const r = file(['bane', 'divot'])
    const item = inputItemKey(String(inpId(r)))
    if (switchFirst) toggleOilPerson(SAT, 'bane', item)
    expect(rowPut(place(r), 'allavail')).toBe('done')
    if (!switchFirst) toggleOilPerson(SAT, 'bane', item)
    expect(paidNow(), 'while he is named: off, either way').toEqual(['divot', 'plasma', 'stiff'])
    expect(rowTake(place(r, 'bane'))).toBe('done')
    expect(idsOf(r).map(String)).toEqual(['divot', 'allavail'])
    expect(oilEvidence(SAT).sent[item], 'he is one of the crowd now').toEqual(['bane', 'stiff', 'plasma'])
    return paidNow()
  }
  it('a named man switched off, then taken out of an input that holds ALL AVAIL: what he earns as one of its crowd does not depend on WHEN ALL AVAIL was dropped on', () => {
    const a = route(true)
    /* the second route on a clean day */
    DAYS[SAT].ground = []; (DAYS[SAT] as any).oild = undefined
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((x: any) => INPUTS.push(x))
    const b = route(false)
    expect(b, 'two routes to the same people: the same OIL (D755 reading (a))').toEqual(a)
    /* …and by the plan's words it is THIS: "the switch-offs of a person who leaves are dropped" — he left, so he
       follows the input's Yes like any man behind the puck */
    expect(a, 'switched off BEFORE ALL AVAIL joined').toEqual(['bane', 'divot', 'plasma', 'stiff'])
    expect(b, 'switched off AFTER ALL AVAIL joined').toEqual(['bane', 'divot', 'plasma', 'stiff'])
  })

  it('a crowd man switched off, then NAMED in (his switch is void — a new holding), then taken out again: the void switch does not come back', () => {
    const r = file(['divot', 'allavail'])
    const item = inputItemKey(String(inpId(r)))
    toggleOilPerson(SAT, 'plasma', item)
    expect(paidNow(), 'plasma, one of the crowd, switched off').toEqual(['bane', 'divot', 'stiff'])
    expect(rowPut(place(r), 'plasma')).toBe('done')
    expect(paidNow(), 'put in by name he follows the input\'s Yes — "nothing is written for him" (the plan §4.4)').toEqual(['bane', 'divot', 'plasma', 'stiff'])
    expect(rowTake(place(r, 'plasma'))).toBe('done')
    expect(oilEvidence(SAT).sent[item]).toEqual(['bane', 'stiff', 'plasma'])
    expect(paidNow(), 'taken out again he is one of the crowd, on the input\'s Yes — a switch the app had already voided does not silently come back (F11)').toEqual(['bane', 'divot', 'plasma', 'stiff'])
  })
})
