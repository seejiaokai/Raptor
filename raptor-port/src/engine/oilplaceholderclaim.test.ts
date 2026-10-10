/* OIL FOR A REQUEST HELD BY A PLACEHOLDER — an input filed for "ALL AVAIL" or "ALL" (`[INPUT-ALL-AVAIL]`).

   Owner, D702 (9 Oct 26): "on a weekend or holiday the filer answers the OIL question once for everyone". D711 (1):
   "the filer answers the OIL question once and the scheduler may switch any one man — a man behind it does not change
   his own answer".

   THE RULE, for a request whose holder is a placeholder (the plan §3.7 — docs/superpowers/plans/2026-10-09-input-all-avail-plan.md):
   · the placeholder itself is never credited;
   · a man the SCHEDULER typed onto the row (the name box, or under it) defaults YES — D18, D470, unchanged;
   · a man who is there only as one of the CROWD follows the FILER's answer for that day — more than 0: he earns by
     default; 0 or no answer yet: he does not;
   · a man who is both counts once, as typed;
   · the scheduler's own switch for one man stays over the top (D28, D43);
   · an answer of 0.5 is not a cap: a positive answer admits the work and the day's hours decide the amount.

   WHY THIS IS A CHANGE AND NOT ALREADY SO. Until this, everyone on a request's row who was not its holder defaulted
   YES whatever was answered (D46 — right for a placeholder the SCHEDULER dropped on a named man's row, and still so:
   oilclaimcrowd.test.ts pins that half and is not touched). For a request the placeholder itself holds, that default
   would credit the whole crowd over the filer's own No.

   ONE BODY decides it — `claimDefault` — read by the credit (oilEarnedWork) and by each man's switch (spanDefault), so
   the screen and the credit cannot answer it two ways (both first-round plan readers' finding 1). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { HOOKS } from './hooks'
import { SCHED, dayApproved, setDayApproved, signOf, dayCurVer, daySnapOf } from './publish'
import { ensureRowIds } from './rowids'
import { envMin, uniformOil, inputItemKey } from './oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, spanDefault, claimDefault, earnsFrom } from './oilev'

const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const SAT = 5, SAT_ISO = '2026-07-18'
const earningDay = HOOKS.oilEarningDay, dayISO = HOOKS.oilDayISO, sentinel = HOOKS.oilSentinel
/* who is free for the placeholder. `bane` FILES the input in every fixture and is deliberately inside the list: the
   filer is one of the crowd like anyone else, and follows his own answer. */
const CROWD = ['bane', 'stiff', 'plasma']
const ITEM = inputItemKey('rq1')

beforeEach(() => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.correcting = {}
  /* stripped, as oilclaimcrowd.test.ts strips it: the seed Saturday carries work of its own */
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
const claim = (r: any) => { INPUTS.unshift({ remarks: '', mod: 'now', yr: 2026, ...r }); return INPUTS[0] }
const groundRow = (di: number, r: any) => {
  DAYS[di].ground = (DAYS[di].ground || []).concat([r]); ensureRowIds(DAYS)
  return DAYS[di].ground[DAYS[di].ground.length - 1]
}
/* the day as the CREDIT reads it: the issued snapshot once it has gone out, the working copy before */
const dayAndEv = (di: number) => {
  const snap: any = dayApproved(di) ? daySnapOf(di, dayCurVer(di)) : null
  const d = snap && snap.d ? snap.d : DAYS[di]
  return { d, ev: oilEvidenceOf(di, d) }
}
const figure = (di: number, person: string) => {
  const { d, ev } = dayAndEv(di)
  const work = oilEarnedWork(d, ev)
  const v = uniformOil(envMin((work[person] || []).map((w: any) => [w.s, w.e] as [number, number])))
  return v === 1 ? 'FO' : v === 0.5 ? 'HO' : null
}
const paidNames = (di: number) => { const { d, ev } = dayAndEv(di); return Object.keys(oilEarnedWork(d, ev)).sort() }

/* a weekend Duty for ALL AVAIL, filed by bane, landed on the Saturday 0900–1200 (three hours: half a day) */
const YES = { [SAT_ISO]: 0.5 }, NO = { [SAT_ISO]: 0 }
const landed = (over: any = {}, row: any = {}) => {
  claim({ iid: 'rq1', person: 'allavail', by: 'bane', type: 'Duty', date: 'Jul 18', acc: 'g',
    allday: false, s: 9 * 60, e: 12 * 60, oil: YES, ...over })
  return groundRow(SAT, { prog: 'Duty', str: '0900', end: '1200', who: over.person || 'allavail', src: 'rq1', ...row })
}

describe('D702 / D711 (1) — the crowd follows the FILER\'s answer', () => {
  it('YES: every man of the crowd earns from it', () => {
    landed({ oil: YES })
    expect(paidNames(SAT)).toEqual(['bane', 'plasma', 'stiff'])
    expect(figure(SAT, 'stiff')).toBe('HO')
    expect(figure(SAT, 'bane'), 'the filer is one of the crowd, on his own answer').toBe('HO')
  })

  it('NO: nobody of the crowd earns by default', () => {
    landed({ oil: NO })
    expect(paidNames(SAT), 'the filer said No for everyone').toEqual([])
  })

  it('NOT ANSWERED YET: nobody of the crowd earns until it is', () => {
    landed({ oil: {} })
    expect(paidNames(SAT)).toEqual([])
    landed({ iid: 'rq1b', oil: undefined })
    expect(paidNames(SAT)).toEqual([])
  })

  it('ALL reads exactly as ALL AVAIL does', () => {
    landed({ person: 'all', oil: YES })
    expect(paidNames(SAT)).toEqual(['bane', 'plasma', 'stiff'])
    INPUTS[0].oil = NO
    expect(paidNames(SAT)).toEqual([])
  })

  it('THE PLACEHOLDER ITSELF IS IN NOBODY\'S WORK — it is not a man, and is never credited', () => {
    landed({ oil: YES })
    const { d, ev } = dayAndEv(SAT)
    const work = oilEarnedWork(d, ev)
    expect(work.allavail, 'no span is ever put under the placeholder').toBeUndefined()
    expect(work.all).toBeUndefined()
  })

  it('an answer of 0.5 is NOT a cap — a positive answer admits the work, the hours decide the amount', () => {
    /* eight hours on the record with a standing half-day answer: the crowd earns the day the hours give */
    landed({ s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: 0.5 } }, { end: '1700' })
    expect(figure(SAT, 'plasma')).toBe('FO')
  })
})

describe('D18, D470 — a man the scheduler typed onto the row earns whatever the filer answered', () => {
  for (const [name, oil] of [['Yes', YES], ['No', NO], ['no answer', {}]] as Array<[string, any]>) {
    it(`under the row, the filer's answer being ${name}`, () => {
      landed({ oil }, { more: ['divot'] })
      expect(figure(SAT, 'divot'), 'typed there by the scheduler: ordinary work, default yes').toBe('HO')
    })
  }

  it('a man who is BOTH typed and in the crowd counts once, as typed — he earns on a No', () => {
    landed({ oil: NO }, { more: ['stiff'] })
    expect(paidNames(SAT), 'only the typed man; the rest of the crowd follows the No').toEqual(['stiff'])
    const { d, ev } = dayAndEv(SAT)
    expect(oilEarnedWork(d, ev).stiff.length, 'one span, not two').toBe(1)
  })

  it('the NAME BOX replaced by a named man: he earns (D470); there is no crowd left', () => {
    landed({ oil: NO }, { who: 'divot' })
    expect(paidNames(SAT)).toEqual(['divot'])
    expect(oilEvidence(SAT).sent[ITEM], 'no placeholder on the row, so no crowd is written down').toBeUndefined()
    INPUTS[0].oil = YES
    expect(paidNames(SAT), 'the filer\'s Yes cannot conjure a crowd the row no longer stands for').toEqual(['divot'])
  })

  it('the last placeholder taken off the row and nobody typed: nobody earns', () => {
    landed({ oil: YES }, { who: '' })
    expect(paidNames(SAT)).toEqual([])
  })
})

describe('D28, D43 — the scheduler can still switch any one man, both ways', () => {
  it('after a NO, an allow for one man credits him and only him', () => {
    landed({ oil: NO })
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'allow' } }
    expect(paidNames(SAT)).toEqual(['stiff'])
  })
  it('after a YES, a deny for one man takes him off and leaves the rest', () => {
    landed({ oil: YES })
    ;(DAYS[SAT] as any).oild = { people: { [`stiff|${ITEM}`]: 'deny' } }
    expect(paidNames(SAT)).toEqual(['bane', 'plasma'])
  })
  it('a deny on a TYPED man takes him off on any answer', () => {
    landed({ oil: NO }, { more: ['divot'] })
    ;(DAYS[SAT] as any).oild = { people: { [`divot|${ITEM}`]: 'deny' } }
    expect(paidNames(SAT)).toEqual([])
  })
  it('the day blanket still stops everyone', () => {
    landed({ oil: YES }, { more: ['divot'] })
    ;(DAYS[SAT] as any).oild = { blanket: 1 }
    expect(paidNames(SAT)).toEqual([])
  })
})

describe('the row\'s own state decides before any answer (R-2, §3.3)', () => {
  it('a cancelled row credits nobody', () => { const r = landed({ oil: YES }, { more: ['divot'] }); r.cx = true; expect(paidNames(SAT)).toEqual([]) })
  it('an information-only row credits nobody', () => { const r = landed({ oil: YES }, { more: ['divot'] }); r.info = true; expect(paidNames(SAT)).toEqual([]) })
  it('a request taken off the programme credits nobody', () => {
    landed({ oil: YES, acc: 'r' })
    expect(paidNames(SAT)).toEqual([])
  })
})

describe('D44, D45, D142 — an issued day keeps the answer and the crowd it went out with', () => {
  it('the filer changes his answer after publication: the issued credit stands', () => {
    landed({ oil: YES })
    publish(SAT)
    expect(figure(SAT, 'plasma')).toBe('HO')
    INPUTS[0].oil = NO
    expect(figure(SAT, 'plasma'), 'the issued record is what he is owed against').toBe('HO')
    expect(Object.keys(oilEarnedWork(DAYS[SAT], oilEvidence(SAT))), 'while the working copy already reads the No').toEqual([])
  })
  it('a man drops out of the crowd after publication: the issued day still credits him', () => {
    landed({ oil: YES })
    publish(SAT)
    HOOKS.oilSentinel = () => ['stiff']
    expect(figure(SAT, 'plasma')).toBe('HO')
  })
  it('published on a NO, the answer changed to YES since: nobody is credited until it goes out', () => {
    landed({ oil: NO })
    publish(SAT)
    INPUTS[0].oil = YES
    expect(paidNames(SAT)).toEqual([])
  })
})

describe('ONE BODY — the switch\'s default is the credit\'s default', () => {
  it('spanDefault answers for each man exactly what the credit applies', () => {
    for (const [oil, crowdDflt] of [[YES, true], [NO, false], [{}, false]] as Array<[any, boolean]>) {
      DAYS[SAT].ground = []
      for (let i = INPUTS.length - 1; i >= 0; i--) if (INPUTS[i].iid === 'rq1') INPUTS.splice(i, 1)
      landed({ oil }, { more: ['divot'] })
      const ev = oilEvidence(SAT), d = DAYS[SAT]
      expect(spanDefault(d, ev, 'stiff', ITEM), `a crowd man, answer ${JSON.stringify(oil)}`).toBe(crowdDflt)
      expect(spanDefault(d, ev, 'divot', ITEM), 'a typed man: always yes').toBe(true)
      const work = oilEarnedWork(d, ev)
      for (const p of ['stiff', 'plasma', 'bane', 'divot'])
        expect(!!work[p], `${p}: credited exactly when his default says so`).toBe(earnsFrom(ev, p, ITEM, spanDefault(d, ev, p, ITEM)))
    }
  })

  it('claimDefault is that body, and reads only the day and its own evidence', () => {
    landed({ oil: NO }, { more: ['divot'] })
    const ev = oilEvidence(SAT), d = DAYS[SAT]
    const c = ev.inputs.find(i => i.iid === 'rq1')!
    expect(claimDefault(d, ev, c, 'stiff')).toBe(false)
    expect(claimDefault(d, ev, c, 'divot')).toBe(true)
  })

  it('A NAMED MAN\'S REQUEST IS UNTOUCHED — his own answer for him, yes for everyone else on his row (D46)', () => {
    claim({ iid: 'rq1', person: 'bane', type: 'Training', date: 'Jul 18', acc: 'g', allday: false, s: 9 * 60, e: 12 * 60, oil: NO })
    groundRow(SAT, { prog: 'Training', str: '0900', end: '1200', who: 'bane', src: 'rq1', more: ['allavail', 'divot'] })
    const ev = oilEvidence(SAT), d = DAYS[SAT]
    expect(spanDefault(d, ev, 'bane', ITEM), 'the holder: his own No').toBe(false)
    expect(spanDefault(d, ev, 'stiff', ITEM), 'the crowd of a placeholder the SCHEDULER dropped: yes, as before').toBe(true)
    expect(spanDefault(d, ev, 'divot', ITEM)).toBe(true)
    expect(paidNames(SAT)).toEqual(['divot', 'plasma', 'stiff'])
  })
})
