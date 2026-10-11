/* OIL FOR AN INPUT THAT HOLDS A PLACEHOLDER — filed for "ALL AVAIL" or "ALL" (`[INPUT-ALL-AVAIL]`), AS THE ONE-RULE
   BUILD LEFT IT ([ALL-AVAIL-AS-MEMBER] step 2 (d), 12 Oct 26; the plan
   docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.7).

   Owner, D702 (9 Oct 26): "on a weekend or holiday the filer answers the OIL question once for everyone". D711 (1):
   "the filer answers the OIL question once and the scheduler may switch any one man — a man behind it does not change
   his own answer". Both stand, and are the first half of this file, unchanged in substance.

   WHAT CHANGED. Until the one-rule build a man the SCHEDULER typed onto such a row (its name box, or under it) defaulted
   YES whatever the filer answered (D18, D470), and a man both typed and in the crowd counted "as typed" (the plan §3.7
   of docs/superpowers/plans/2026-10-09-input-all-avail-plan.md). Since then:
   · D755 (11 Oct 26) — "a row that came from an input IS the input: whoever stands on it … is in the input". A man put
     on the row beside the placeholder is one of the input's PEOPLE, not the scheduler's own extra.
   · D762 — the OIL question has ONE answer, for everyone in the input; only the scheduler leaves one person out.
   · D753 — the men behind ALL AVAIL / ALL follow the answer given for the input; an input takes ALL or ALL AVAIL, never
     both.
   So there is ONE default for everybody the input reaches — its named people and the men behind its placeholder: the
   input's answer for the day, more than 0 or not (oilev.ts claimDefault). A named man is never also in the crowd.

   THE RULE, for an input that holds a placeholder:
   · the placeholder itself is never credited;
   · every NAMED person in it, and every man of the CROWD who is not named in it, follows the input's answer for that
     day — more than 0: he earns by default; 0 or no answer yet: he does not;
   · the scheduler's own switch for one man stays over the top (D28, D43);
   · an answer of 0.5 is not a cap: a positive answer admits the work and the day's hours decide the amount.

   ONE BODY decides it — `claimDefault` — read by the credit (oilEarnedWork) and by each man's switch (spanDefault), so
   the screen and the credit cannot answer it two ways (both first-round plan readers' finding 1).

   A DAY THAT HAS ALREADY GONE OUT KEEPS WHAT IT WENT OUT WITH (D48, D142): a block frozen before the build — a claim
   whose one `person` is the placeholder — is still read by "typed: yes; crowd: the filer's answer", off that day's own
   frozen row (oilev.ts legacyClaim / legacyDefault / legacyEarned). The last describe pins that.

   In this step of the build the doors still refuse a placeholder beside named people (inputs.ts placeholderProblem —
   the door opens in step 3), so a fixture that needs one puts the record straight into INPUTS. */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS, shapeProblem } from './inputs'
import { HOOKS } from './hooks'
import { SCHED, dayApproved, setDayApproved, signOf, dayCurVer, daySnapOf } from './publish'
import { ensureRowIds } from './rowids'
import { envMin, uniformOil, inputItemKey } from './oil'
import { oilEvidence, oilEvidenceOf, oilEarnedWork, spanDefault, claimDefault, earnsFrom, projectOilInputs, landedExtras, type OilEvidence } from './oilev'
import { requestRowFields } from './overlay'

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

/* a weekend Duty, filed by bane, landed on the Saturday 0900–1200 (three hours: half a day) — ONE record HOLDING `ids`
   in the order they joined: ALL AVAIL alone unless said. Its row is the copy of it the row's own body writes (D755). */
const YES = { [SAT_ISO]: 0.5 }, NO = { [SAT_ISO]: 0 }
const landed = (over: any = {}, ids: string[] = ['allavail']) => {
  INPUTS.unshift({ iid: 'rq1', by: 'bane', type: 'Duty', date: 'Jul 18', yr: 2026, acc: 'g',
    allday: false, s: 9 * 60, e: 12 * 60, remarks: '', mod: 'now', oil: YES, people: ids.map(p => ({ p })), ...over })
  return groundRow(SAT, { ...requestRowFields(INPUTS[0]), src: String(INPUTS[0].iid) })
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
    landed({ oil: YES }, ['all'])
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
    landed({ s: 9 * 60, e: 17 * 60, oil: { [SAT_ISO]: 0.5 } })
    expect(figure(SAT, 'plasma')).toBe('FO')
  })

  it('ONE claim for the input — it names nobody, and carries its placeholder', () => {
    landed({ oil: YES })
    const c: any = projectOilInputs(SAT_ISO).find(i => i.iid === 'rq1')
    expect(c.people).toEqual([])
    expect(c.ph).toBe('allavail')
    expect('person' in c, 'a claim made since the build never names one `person`').toBe(false)
  })
})

describe('a man put on the row beside the placeholder is IN the input, and follows its ONE answer (D755, D762 — D18 and D470 as changed)', () => {
  /* until the one-rule build: "a man the scheduler typed onto the row earns whatever the filer answered" — typed there
     by the scheduler, ordinary work, default yes. He is one of the input's people now. */
  for (const [name, oil, got] of [['Yes', YES, 'HO'], ['No', NO, null], ['no answer', {}, null]] as Array<[string, any, any]>) {
    it(`under the row, the input's answer being ${name}: ${got ? 'he earns' : 'he does not'}`, () => {
      const row = landed({ oil }, ['allavail', 'divot'])
      expect([row.who, row.more], 'the row is the input, whole').toEqual(['allavail', ['divot']])
      expect(figure(SAT, 'divot'), 'named in the input: the input\'s answer, like everyone it reaches').toBe(got)
    })
  }

  it('a man who is BOTH named in it and free that day counts ONCE, as himself — and on a No he does not earn', () => {
    /* until the one-rule build he counted "as typed" and earned on a No */
    landed({ oil: NO }, ['allavail', 'stiff'])
    expect(oilEvidence(SAT).sent[ITEM], 'a man named in the input is never in its crowd').toEqual(['bane', 'plasma'])
    expect(paidNames(SAT), 'the No is for everyone').toEqual([])
    INPUTS[0].oil = YES
    expect(paidNames(SAT)).toEqual(['bane', 'plasma', 'stiff'])
    const { d, ev } = dayAndEv(SAT)
    expect(oilEarnedWork(d, ev).stiff.length, 'one span, not two').toBe(1)
  })

  it('the placeholder REPLACED by a named man: the input is his — no crowd is left, on a No or on a Yes', () => {
    /* until the one-rule build "he earns (D470)" on the filer's No. The input's answer is his answer now. */
    landed({ oil: NO }, ['divot'])
    expect(paidNames(SAT)).toEqual([])
    expect(oilEvidence(SAT).sent[ITEM], 'no placeholder in the input, so no crowd is written down').toBeUndefined()
    INPUTS[0].oil = YES
    expect(paidNames(SAT), 'a Yes cannot conjure a crowd the input no longer stands for').toEqual(['divot'])
  })

  it('the last placeholder taken out and nobody put in: there is no such input — refused at the write, and it would credit nobody', () => {
    /* until the one-rule build a row could be left with an empty name box under a request that still stood */
    expect(shapeProblem({ iid: 'rq1', type: 'Duty', date: 'Jul 18', yr: 2026, people: [] })).toMatch(/at least one person/i)
    landed({ oil: YES }, [])
    expect(projectOilInputs(SAT_ISO).some(i => i.iid === 'rq1'), 'it projects no claim').toBe(false)
    expect(paidNames(SAT)).toEqual([])
  })

  it('an input takes ALL or ALL AVAIL, never both (D753)', () => {
    expect(shapeProblem({ iid: 'rq1', type: 'Duty', date: 'Jul 18', yr: 2026, people: [{ p: 'allavail' }, { p: 'all' }] })).not.toBe('')
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
  it('a deny on a man NAMED beside the placeholder takes him off alone; an allow on a No credits him alone', () => {
    landed({ oil: YES }, ['allavail', 'divot'])
    ;(DAYS[SAT] as any).oild = { people: { [`divot|${ITEM}`]: 'deny' } }
    expect(paidNames(SAT)).toEqual(['bane', 'plasma', 'stiff'])
    INPUTS[0].oil = NO
    ;(DAYS[SAT] as any).oild = { people: { [`divot|${ITEM}`]: 'allow' } }
    expect(paidNames(SAT)).toEqual(['divot'])
  })
  it('the day blanket still stops everyone', () => {
    landed({ oil: YES }, ['allavail', 'divot'])
    ;(DAYS[SAT] as any).oild = { blanket: 1 }
    expect(paidNames(SAT)).toEqual([])
  })
})

describe('the row\'s own state decides before any answer (R-2, §3.3)', () => {
  it('a cancelled row credits nobody', () => { const r = landed({ oil: YES }, ['allavail', 'divot']); r.cx = true; expect(paidNames(SAT)).toEqual([]) })
  it('an information-only row credits nobody', () => { const r = landed({ oil: YES }, ['allavail', 'divot']); r.info = true; expect(paidNames(SAT)).toEqual([]) })
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
  it('spanDefault answers for each man exactly what the credit applies — a named man and a crowd man alike', () => {
    for (const [oil, dflt] of [[YES, true], [NO, false], [{}, false]] as Array<[any, boolean]>) {
      DAYS[SAT].ground = []
      for (let i = INPUTS.length - 1; i >= 0; i--) if (INPUTS[i].iid === 'rq1') INPUTS.splice(i, 1)
      landed({ oil }, ['allavail', 'divot'])
      const ev = oilEvidence(SAT), d = DAYS[SAT]
      expect(spanDefault(d, ev, 'stiff', ITEM), `a crowd man, answer ${JSON.stringify(oil)}`).toBe(dflt)
      expect(spanDefault(d, ev, 'divot', ITEM), 'a man named in it: the same answer — no "typed man: always yes" any more').toBe(dflt)
      const work = oilEarnedWork(d, ev)
      for (const p of ['stiff', 'plasma', 'bane', 'divot'])
        expect(!!work[p], `${p}: credited exactly when his default says so`).toBe(earnsFrom(ev, p, ITEM, spanDefault(d, ev, p, ITEM)))
    }
  })

  it('claimDefault is that body, and reads only the claim\'s own answer', () => {
    landed({ oil: NO }, ['allavail', 'divot'])
    let ev = oilEvidence(SAT)
    const d = DAYS[SAT]
    let c = ev.inputs.find(i => i.iid === 'rq1')!
    expect(claimDefault(d, ev, c, 'stiff')).toBe(false)
    expect(claimDefault(d, ev, c, 'divot'), 'named in it: the input\'s No is his too').toBe(false)
    INPUTS[0].oil = YES
    ev = oilEvidence(SAT); c = ev.inputs.find(i => i.iid === 'rq1')!
    expect(claimDefault(d, ev, c, 'stiff')).toBe(true)
    expect(claimDefault(d, ev, c, 'divot')).toBe(true)
  })

  it('A NAMED MAN\'S INPUT WITH ALL AVAIL BESIDE HIM IS THE SAME RULE — one answer for him, the crowd and anyone else in it (D762; D46 as changed)', () => {
    /* until the one-rule build: "his own answer for him, yes for everyone else on his row (D46)" — on his No the crowd
       and the man the scheduler added still earned. */
    landed({ type: 'Training', oil: NO }, ['bane', 'allavail', 'divot'])
    let ev = oilEvidence(SAT)
    const d = DAYS[SAT]
    for (const p of ['bane', 'stiff', 'divot']) expect(spanDefault(d, ev, p, ITEM), `${p}: the input's No`).toBe(false)
    expect(paidNames(SAT)).toEqual([])
    INPUTS[0].oil = YES
    ev = oilEvidence(SAT)
    for (const p of ['bane', 'stiff', 'divot']) expect(spanDefault(d, ev, p, ITEM), `${p}: the input's Yes`).toBe(true)
    expect(paidNames(SAT)).toEqual(['bane', 'divot', 'plasma', 'stiff'])
  })
})

/* THE OLD RULE, WHERE IT IS STILL TRUE. A day published before the one-rule build carries a block whose claim names
   one `person` — here the placeholder that held the request — and a frozen row on which a man the scheduler typed
   really was the scheduler's own. That day went out under "typed: yes (D18, D470); crowd: the filer's answer
   (D711 (1)); both: once, as typed", and it is read by that, from its own record. Built by hand — no door of this
   build can make one. */
describe('a day issued before the one-rule build keeps the OIL it went out with (D48, D142)', () => {
  const frozenDay = (row: any = {}) => ({ ...JSON.parse(JSON.stringify(DAYS[SAT])),
    ground: [{ rid: 'rold', prog: 'DUTY', str: '0900', end: '1200', who: 'allavail', src: 'rq1', ...row }] })
  const frozenEv = (ans: number | null, person = 'allavail', sent: any = { [ITEM]: CROWD.slice() }): OilEvidence => ({ iso: SAT_ISO, earns: true, d: {},
    inputs: [{ iid: 'rq1', person, type: 'Duty', asks: true, acc: 'g', stand: 'active', win: [9 * 60, 12 * 60], ans }],
    sent, mem: 1 })
  const paid = (day: any, ev: OilEvidence) => Object.keys(oilEarnedWork(day, ev)).sort()

  it('a man the scheduler TYPED onto the placeholder\'s row earned whatever the filer answered; the crowd followed the answer', () => {
    for (const [ans, crowd] of [[0.5, true], [0, false], [null, false]] as Array<[number | null, boolean]>) {
      const day = frozenDay({ more: ['divot'] }), ev = frozenEv(ans), c = ev.inputs[0]
      expect(claimDefault(day, ev, c, 'divot'), `typed, answer ${ans}: yes`).toBe(true)
      expect(spanDefault(day, ev, 'divot', ITEM)).toBe(true)
      expect(claimDefault(day, ev, c, 'stiff'), `crowd, answer ${ans}`).toBe(crowd)
      expect(spanDefault(day, ev, 'stiff', ITEM)).toBe(crowd)
      expect(paid(day, ev)).toEqual(crowd ? ['bane', 'divot', 'plasma', 'stiff'] : ['divot'])
    }
  })

  it('a man BOTH typed and in the crowd counted once, as typed — he earned on a No', () => {
    const day = frozenDay({ more: ['stiff'] }), ev = frozenEv(0)
    expect(landedExtras(day, 'rq1', 'allavail'), 'the typed men, off the frozen row').toEqual(['stiff'])
    expect(paid(day, ev)).toEqual(['stiff'])
    expect(oilEarnedWork(day, ev).stiff.length).toBe(1)
  })

  it('the name box replaced by a named man: he earned (D470), and with no placeholder on the row there was no crowd', () => {
    const day = frozenDay({ who: 'divot' })
    expect(paid(day, frozenEv(0, 'allavail', {}))).toEqual(['divot'])
    expect(paid(day, frozenEv(0.5, 'allavail', {})), 'the filer\'s Yes conjures nobody').toEqual(['divot'])
    expect(paid(frozenDay({ who: '' }), frozenEv(0.5, 'allavail', {})), 'an empty box and nobody typed: nobody').toEqual([])
  })

  it('a NAMED man\'s request: his own answer for him, yes for everyone else on his row (D46 as it stood)', () => {
    const day = frozenDay({ prog: 'TRAINING', who: 'bane', more: ['allavail', 'divot'] }), ev = frozenEv(0, 'bane')
    expect(spanDefault(day, ev, 'bane', ITEM), 'the holder: his own No').toBe(false)
    expect(spanDefault(day, ev, 'stiff', ITEM), 'the crowd of a placeholder the scheduler dropped: yes').toBe(true)
    expect(spanDefault(day, ev, 'divot', ITEM)).toBe(true)
    expect(paid(day, ev)).toEqual(['divot', 'plasma', 'stiff'])
  })
})
