/* [OIL-SEATS-CAN-EARN] STEP 6 — a placeholder on an ACCEPTED REQUEST row.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 6,
   §2 (D46), §3 "three routes the original plan did not know about".

   WHY THIS IS ITS OWN STEP. A request that has been accepted lands a row on the
   Ground Programme, and that row is the ONE row the day's work walk skips whole
   — the money for it comes down a separate route, from the request itself. So
   step 5's expansion never reaches it: a placeholder dropped in the request
   row's name box or under it counted nobody and offered nothing, and step 5 did
   not change that by a line.

   D46 (owner, 22 Sep 26): a placeholder IS allowed on a request row and credits
   by default, like anywhere else — no carve-outs. Both reviewers wanted it
   refused there and the owner took the no-exceptions answer after checking that
   removing the puck removes the crediting.

   BOTH PLACES, NOT ONE (Codex OSE-R2-04 — the first rewrite covered only the
   extras). A placeholder can sit in the request row's NAME BOX as well as the
   extras line under it.

   AND NOT BY REMOVING THE SKIP. Feeding a request row through the ordinary work
   walk would put the REQUESTER through it too, where the default is yes — which
   overrides his own No and pays him twice, once as plain scheduled work and
   again as his answered request. The requester stays on his own answer; the
   crowd is ordinary work on the same address.

   THE WINDOW IS THE REQUEST'S, NOT THE ROW'S (Fable M6, the same trap as D18's
   extras): an all-day request lands a row with no times at all, so reading the
   row would leave its crowd unresolved on exactly the request that covers the
   most of the day. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED, dayApproved, setDayApproved, signOf, dayCurVer, daySnapOf } from './publish'
import { ensureRowIds } from './rowids'
import { envMin, uniformOil, inputItemKey } from './oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, landedExtras } from './oilev'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
/* who the placeholder stands for. `bane` FILES the request in every fixture
   below and is deliberately inside this list: a crowd that swept him up would
   pay him twice and bury his own answer. */
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
const claim = (r: any) => { INPUTS.unshift({ allday: true, s: 0, e: 1439, remarks: '', mod: 'now', yr: 2026, ...r }); return INPUTS[0] }
const groundRow = (di: number, r: any) => {
  DAYS[di].ground = (DAYS[di].ground || []).concat([r]); ensureRowIds(DAYS)
  return DAYS[di].ground[DAYS[di].ground.length - 1]
}
/* THE FIGURE AS THE MONEY SEES IT: off the ISSUED snapshot once the day has
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

/* a request bane filed, accepted and landed on the Saturday, 0900–1700 */
const landed = (over: any = {}, row: any = {}) => {
  claim({ iid: 'rq1', person: 'bane', type: 'Training', date: 'Jul 18', acc: 'g',
    allday: false, s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: 1 }, ...over })
  return groundRow(SAT, { prog: 'Training', str: '0900', end: '1700', who: 'bane', src: 'rq1', ...row })
}

describe('a placeholder on a request row credits the people it stands for (D46)', () => {
  it('IN THE EXTRAS LINE under the row', () => {
    landed({}, { more: ['allavail'] })
    expect(paidNames(SAT), 'the requester, and the crowd beside him').toEqual(['bane', 'plasma', 'stiff'])
    expect(figure(SAT, 'stiff'), 'the crowd earns the request\'s own day').toBe('FO')
  })

  it('IN THE NAME BOX itself (Codex OSE-R2-04)', () => {
    /* the requester's name has been replaced by the puck on the row; his
       REQUEST still names him, so he is still paid from it */
    landed({}, { who: 'allavail' })
    expect(paidNames(SAT)).toEqual(['bane', 'plasma', 'stiff'])
    expect(figure(SAT, 'bane'), 'his own request still pays him').toBe('FO')
  })

  it('and ALL reads the same as ALL AVAIL', () => {
    landed({}, { more: ['all'] })
    expect(paidNames(SAT)).toEqual(['bane', 'plasma', 'stiff'])
  })
})

describe('the requester keeps his own answer (the split, not the skip)', () => {
  it('he is never paid TWICE, even though the crowd names him', () => {
    landed({}, { more: ['allavail'] })
    const work = oilEarnedWork(DAYS[SAT], oilEvidence(SAT))
    expect(work.bane.length, 'one span, from his request — not a second as part of the crowd').toBe(1)
  })

  it('his own NO stands while the crowd still earns', () => {
    landed({ oil: { [SAT_ISO]: 0 } }, { more: ['allavail'] })
    expect(figure(SAT, 'bane'), 'he said No for himself and that stands').toBe(null)
    expect(figure(SAT, 'stiff'), 'the scheduler put the crowd there; it is ordinary work').toBe('FO')
  })

  it('an UNANSWERED request pays nobody but still gathers the crowd', () => {
    landed({ oil: {} }, { more: ['allavail'] })
    expect(figure(SAT, 'bane'), 'he has not answered, so nothing for him yet').toBe(null)
    expect(figure(SAT, 'plasma'), 'the crowd does not wait on his answer').toBe('FO')
  })
})

describe('what the crowd is resolved against, and what holds it still', () => {
  it('the REQUEST\'s window, not the row\'s times — an all-day request has none (Fable M6)', () => {
    landed({ allday: true, s: 0, e: 1439 }, { str: '', end: '', more: ['allavail'] })
    expect(figure(SAT, 'stiff'), 'the row carries no times at all; the request carries the day').toBe('FO')
  })

  it('the day WRITES THE CROWD DOWN under the request\'s own address', () => {
    landed({}, { more: ['allavail'] })
    expect(oilEvidence(SAT).sent[ITEM], 'or an issued day could not hold its people still').toEqual(CROWD)
  })

  it('AN ISSUED DAY KEEPS THE PEOPLE IT WENT OUT WITH (D44)', () => {
    landed({}, { more: ['allavail'] })
    publish(SAT)
    expect(figure(SAT, 'plasma'), 'he was on it when it was issued').toBe('FO')
    /* somebody files leave and drops out of the crowd — the issued day must not
       quietly stop paying him */
    HOOKS.oilSentinel = () => ['stiff']
    expect(figure(SAT, 'plasma'), 'the issued record is what he is owed against').toBe('FO')
  })
})

describe('the scheduler can still decide man by man', () => {
  it('one man is taken off the crowd and the rest are untouched', () => {
    landed({}, { more: ['allavail'] })
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'deny' } }
    expect(figure(SAT, 'stiff'), 'taken off').toBe(null)
    expect(figure(SAT, 'plasma'), 'the other man in the crowd is untouched').toBe('FO')
    expect(figure(SAT, 'bane'), 'and so is the requester').toBe('FO')
  })

  it('THAT DECISION SURVIVES — it is not swept away as a handed-over request', () => {
    /* the tidy-up that drops overrides naming a man who no longer holds the
       request must not read a crowd member as an impostor. If it did, his
       refusal would be deleted on the way out and he would be paid anyway —
       the exact shape D18's own fix had to close. */
    landed({}, { more: ['allavail'] })
    ;(DAYS[SAT] as any).oild = { people: { [`plasma|${ITEM}`]: 'deny' } }
    const ev = oilEvidence(SAT)
    expect((ev.d.people || {})[`plasma|${ITEM}`], 'the scheduler\'s decision is kept').toBe('deny')
    expect(figure(SAT, 'plasma')).toBe(null)
  })

  it('switching the whole request off stops the crowd as well', () => {
    landed({}, { more: ['allavail'] })
    ;(DAYS[SAT] as any).oild = { items: { [ITEM]: 0 } }
    expect(paidNames(SAT), 'nobody earns from it').toEqual([])
  })
})

describe('the screen and the money ask the SAME body', () => {
  it('landedExtras returns the crowd, so whatever draws the row draws them too', () => {
    landed({}, { more: ['allavail'] })
    const ev = oilEvidence(SAT)
    expect(landedExtras(DAYS[SAT], 'rq1', 'bane', ev.sent[ITEM]).sort())
      .toEqual(['plasma', 'stiff'])
  })

  it('a NAMED man beside the crowd is kept, not replaced by it', () => {
    landed({}, { more: ['divot', 'allavail'] })
    expect(paidNames(SAT)).toEqual(['bane', 'divot', 'plasma', 'stiff'])
  })
})

describe('the controls', () => {
  it('a CANCELLED request row pays nobody — not the requester, not the crowd', () => {
    const row = landed({}, { more: ['allavail'] })
    row.cx = true
    expect(paidNames(SAT)).toEqual([])
  })

  it('an INFORMATION-ONLY row is the same answer', () => {
    const row = landed({}, { more: ['allavail'] })
    row.info = true
    expect(paidNames(SAT)).toEqual([])
  })

  it('D28 — a request row with no placeholder on it is untouched', () => {
    landed({}, { more: ['divot'] })
    expect(paidNames(SAT), 'exactly as before this step').toEqual(['bane', 'divot'])
  })

  it('and a placeholder on an UNACCEPTED request row is not a claim at all', () => {
    claim({ iid: 'rq2', person: 'bane', type: 'Training', date: 'Jul 18', acc: 'r',
      allday: false, s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: 1 } })
    groundRow(SAT, { prog: 'Training', str: '0900', end: '1700', who: 'bane', src: 'rq2', more: ['allavail'] })
    expect(paidNames(SAT), 'a refused request earns nobody anything').toEqual([])
  })
})
