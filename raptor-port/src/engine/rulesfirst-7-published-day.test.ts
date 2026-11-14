// @vitest-environment jsdom
/* RULES-FIRST REVIEW, family 7 — the published day, amendments and what a frozen day reads (W68–W78)
   ([ENGINE-RULES-REVIEW], D1983, 11 Nov 26). One test per worklist item where no existing test already holds the ruling
   whole (those are named in the review's results, not repeated here), each led by the ruling's own words, on a small
   made-up week through the app's own doors: the write funnel (setSlotVal), validate(), the published book (setSign,
   setDayApproved, publishALDay, unpublishDay), the Quals record (PEOPLE) and the Logic settings (VCONF); read through
   the issued face (officialWarn — what View-only Sched draws), the detector (officialRaw), the pending comparison
   (dayDelta) and the four sign-offs (daySigned). Harness: the earlier families' (every day emptied, the inputs cleared,
   the book reset, the roster and the hooks restored). */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from './data'
import { INPUTS } from './inputs'
import { SCHED, setSign, setDayApproved, publishALDay, unpublishDay, dayDelta, daySigned, dayCurVer, dayALs, daySnapOf, dayApproved } from './publish'
import { verSeq } from './verid'
import { VCONF } from './rules'
import { PEOPLE } from './people'
import { HOOKS } from './hooks'
import { validate, workingWarn, officialWarn, officialRaw } from './validate'
import { setSlotVal } from './slots'
import { withFaceAttrs, briefLeadShown, personShown } from './faceattrs'
import { setSession } from '../state/auth'
import { lgSettings } from '../ui/logic-html'

const saved = { d: JSON.stringify(DAYS), i: JSON.stringify(INPUTS), book: JSON.stringify(SCHED), v: { ...VCONF }, p: JSON.stringify(PEOPLE), earn: HOOKS.oilEarningDay }
const MON = 0, TUE = 1
const day = (di: number): any => DAYS[di]
const ac = (p = '', w = '', rmks = '') => ({ p, w, rmks, area: '', opts: {} })
const form = (o: any = {}) => ({ cs: 'VL', msn: 'BFM', to: '12:00', ld: '13:00', br: '', rl: '', aircraft: [ac('bane')], ...o })
const wave = (forms: any[] = [form()], o: any = {}) => ({ label: 'WAVE 1', night: false, intimes: [], traffic: [], formations: forms, ...o })
const ws = (b: any, di: number) => (((b.byDay || [])[di] || {}).warns || []) as any[]
const has = (b: any, di: number, code: string, id?: string) => ws(b, di).some((w: any) => w.code === code && (!id || (w.who || []).includes(id)))
const sign = (di: number) => { setSign(di, 'cur', 'ignite'); setSign(di, 'sked', 'bane'); setSign(di, 'plan', 'stiff'); setSign(di, 'appr', 'pump') }
/* published, then the four signed again on the day as published — bound to "nothing pending", as the app's own sign-off of
   a published day is (a publish uses up the signatures it went out on) */
const publish = (di: number) => { validate(); sign(di); setDayApproved(di, true); validate(); sign(di) }
const snapOf = (di: number): any => daySnapOf(di, dayCurVer(di))

beforeEach(() => {
  Object.assign(VCONF, { briefLead: 140, step: 60, dekit: 30, reportLead: 180, debrief: 120, crewRest: 720, longDay: 720, maxRun: 6, tightTurn: 60 })
  DAYS.forEach((d: any) => Object.assign(d, { waves: [], sims: { amt: [], oft: [] }, ground: [], allhands: [], dutywaves: [] }))
  INPUTS.splice(0); Object.assign(SCHED, { orig: {}, cur: {}, als: [], pending: {}, changes: {}, added: {}, dayOK: {}, sign: {}, signBind: {}, retired: {}, correcting: {}, drafts: {}, curDraft: {} })
  setSession({ user: 'ad', role: 'admin' } as any)
})
afterEach(() => {
  HOOKS.oilEarningDay = saved.earn
  DAYS.splice(0, DAYS.length, ...JSON.parse(saved.d)); INPUTS.splice(0, INPUTS.length, ...JSON.parse(saved.i))
  Object.keys(SCHED).forEach(k => delete (SCHED as any)[k]); Object.assign(SCHED, JSON.parse(saved.book)); Object.assign(VCONF, saved.v)
  const p0 = JSON.parse(saved.p); Object.keys(PEOPLE).forEach(k => { if (!(k in p0)) delete (PEOPLE as any)[k] }); Object.keys(p0).forEach(k => { (PEOPLE as any)[k] = p0[k] })
  validate(); setSession(null)
})

describe('W68 — nothing on a published schedule changes without the scheduler acknowledging it: a change shows as pending, any pending change wipes the four, putting it back restores them (D45, D44, D103)', () => {
  it('D103 / D45: Ranger taken off published Tuesday\'s VL and Piston put on — one change waiting, the four fall; Ranger put back — nothing waits and the four stand again (AM11)', () => {
    day(TUE).waves.push(wave([form()]))
    publish(TUE)
    expect([dayDelta(TUE).length, daySigned(TUE)], 'the premise: published, nothing waiting, signed').toEqual([0, true])
    expect(setSlotVal(`${TUE}.0.0.0.p`, 'pump'), 'the write funnel').toBe(true); validate()
    expect(dayDelta(TUE).length, '"a later change shows as pending"').toBeGreaterThan(0)
    expect(daySigned(TUE), '"any change that shows as pending wipes the four sign-offs"').toBe(false)
    expect(setSlotVal(`${TUE}.0.0.0.p`, 'bane')).toBe(true); validate()
    expect(dayDelta(TUE), 'back to what was published: nothing waits (D98)').toEqual([])
    expect(daySigned(TUE), '"putting it back restores them"').toBe(true)
  })
})

describe('W69 / W70 — everything on a published day freezes, except what stays live on its face; the live warnings never make the day pending by themselves (D179, D183, D184, D185, D188)', () => {
  /* Tuesday published: VL 12:00–13:00, Ranger in front, a blank brief (09:40 at a 140-minute lead). Monday a draft. */
  function tuesdayPublished() {
    day(TUE).waves.push(wave([form()]))
    publish(TUE)
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane') || has(officialWarn(), TUE, 'CREW_TIGHT', 'bane'), 'the premise: Tuesday clean').toBe(false)
  }
  it('D185 (e) / D188: the crew-rest check\'s tight-turn note is live beside its breach — Monday\'s draft line turns Tuesday tight, then into a breach, then back: the published face follows each at once, and Tuesday never reads pending', () => {
    tuesdayPublished()
    /* Monday 18:30–19:30 + 2h debrief ends 21:30, clear of crew rest at 09:30: Tuesday's 09:40 brief is clear, but the
       nominal report (T/O 12:00 less 3h = 09:00) falls inside it — the tight turn */
    day(MON).waves.push(wave([form({ cs: 'LATE', to: '18:30', ld: '19:30' })])); validate()
    expect(has(officialWarn(), TUE, 'CREW_TIGHT', 'bane'), 'the tight-turn note shows on the published face at once').toBe(true)
    expect([dayDelta(TUE), daySigned(TUE)], 'never pending by itself').toEqual([[], true])
    /* an hour later: clear at 10:30, after the 09:40 brief — a breach */
    Object.assign(day(MON).waves[0].formations[0], { to: '19:30', ld: '20:30' }); validate()
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'the breach shows at once').toBe(true)
    expect(has(officialWarn(), TUE, 'CREW_TIGHT', 'bane'), 'and no frozen tight note is left beside it').toBe(false)
    expect([dayDelta(TUE), daySigned(TUE)]).toEqual([[], true])
    day(MON).waves.splice(0); validate()
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane') || has(officialWarn(), TUE, 'CREW_TIGHT', 'bane'), 'put back: gone').toBe(false)
  })
  it('D185 (d) / D188: the crew-pairing warnings stay FROZEN — Hex (CAT C WSO, behind Torch, CAT C) made an OCU after Tuesday went out: the face keeps the day as issued, and the change reads pending', () => {
    day(TUE).waves.push(wave([form({ aircraft: [ac('ignite', 'rocky')] })]))     // Torch (CAT C pilot) and Hex (CAT C WSO)
    const p: any = PEOPLE, was = p.rocky.q
    validate()
    expect(has(workingWarn(), TUE, 'ILLEGAL_CREW'), 'the premise: no pairing warning at publish').toBe(false)
    publish(TUE)
    p.rocky.q = 'OCU'                                                            // Hex goes back to the OCU: CAT C + OCU WSO
    try {
      validate()
      const pair = (b: any) => ws(b, TUE).some((w: any) => ['ILLEGAL_CREW', 'CREW_SOLO', 'CO_APPROVAL'].includes(w.code))
      expect(pair(officialRaw()), 'today\'s judgement of the issued day raises a pairing warning').toBe(true)
      expect(pair(officialWarn()), '"the crew-pairing warnings stay frozen" — not on the published face').toBe(false)
      expect(dayDelta(TUE).length, '…and the change reads pending').toBeGreaterThan(0)
      expect(daySigned(TUE)).toBe(false)
    } finally { p.rocky.q = was }
  })
  it('as built (7.U2, a question for him): the six OIL advisories are live on the face too, beyond the page\'s list — a published WEEKDAY made a holiday afterwards shows the RED "no usable times" warning on its published face', () => {
    /* Tuesday: a flying line with Ranger on it and no times — on a weekday, OIL is not read, so nothing is raised */
    day(TUE).waves.push(wave([form({ to: '', ld: '' })]))
    publish(TUE)
    expect(has(officialWarn(), TUE, 'OIL_NO_TIMES'), 'published as a working day: no OIL warning').toBe(false)
    /* the Leave War now calls Tuesday a public holiday (the hook the war installs) */
    HOOKS.oilEarningDay = ((di: number) => di === TUE) as any
    validate()
    const t = ws(officialWarn(), TUE).find((w: any) => w.code === 'OIL_NO_TIMES')
    expect(t && t.sev, 'AS BUILT: a red warning appears on the published face at once (LIVE_ON_FACE)').toBe('hard')
    /* never stored with the version, so never compared: whether the day reads pending is the OIL block's business (family
       8) — with the engine's own hooks here, nothing waits and the four stand while the red line shows */
    expect((snapOf(TUE).w.byDay?.warns || []).some((w: any) => w.code === 'OIL_NO_TIMES'), 'the version holds no such warning').toBe(false)
    expect([dayDelta(TUE), daySigned(TUE)], 'AS BUILT, in this fixture: nothing pending, the four stand').toEqual([[], true])
  })
})

describe('W73 — a man\'s CAT on his puck and a blank line\'s suggested brief stay as published; a callsign rename shows at once; the published brief lead is the one printed value kept, the rulebook unversioned (D186)', () => {
  it('a CAT changed after publishing: the face draws the CAT it went out with and the day reads pending; a rename beside it is a label — the face reads the new callsign', () => {
    day(TUE).waves.push(wave([form()]))
    const p: any = PEOPLE, q0 = p.bane.q, cs0 = p.bane.cs
    publish(TUE)
    p.bane.q = q0 === 'A' ? 'B' : 'A'
    try {
      validate()
      expect(withFaceAttrs(snapOf(TUE), () => personShown('bane').q), 'the puck on the published face keeps the CAT it was issued with').toBe(q0)
      expect(dayDelta(TUE).length, '"a change to either reading pending"').toBeGreaterThan(0)
      expect(daySigned(TUE), '"and taking the four down"').toBe(false)
      p.bane.q = q0; validate()
      expect([dayDelta(TUE), daySigned(TUE)], 'put back: nothing waits').toEqual([[], true])
      p.bane.cs = cs0 + 'X'; validate()
      expect(withFaceAttrs(snapOf(TUE), () => personShown('bane').cs), 'a callsign rename updates the published schedule at once').toBe(cs0 + 'X')
      expect([dayDelta(TUE), daySigned(TUE)], '…and reads nothing pending').toEqual([[], true])
    } finally { p.bane.q = q0; p.bane.cs = cs0 }
  })
  /* D1991 (11 Nov 26) over the as-built 7.U1 — "the published schedule should not be changed by the change of logic and
     start flagging things. Same goes for F1" — and D2005 (12 Nov 26, its reach: every Logic setting, the wider build a
     later job): a published day's crew rest is measured to the brief it PRINTED; the new setting reaches it from its next
     amendment. The working copy (Edit Schedule) previews that amendment, so it reads today's setting — the agent's reading
     of D2005 ("the working copy of a published day, once edited, is checked by today's settings"), pinned here. */
  it('D1991 (7.U1 answered): the brief lead raised on the Logic page after publishing — the published face prints 09:40 and its live crew-rest check measures to that 09:40: no breach; the next amendment brings the 08:40 brief and its breach', () => {
    /* Monday (a draft): Ranger's LATE line 18:00–19:00 + 2h debrief ends 21:00, clear of crew rest at 09:00; Tuesday's VL
       12:00 with a blank brief — at the 140-minute lead the brief is 09:40, clear */
    day(MON).waves.push(wave([form({ cs: 'LATE', to: '18:00', ld: '19:00' })]))
    day(TUE).waves.push(wave([form()]))
    publish(TUE)
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'the premise: published clean — 21:00 to a 09:40 brief is 12h40').toBe(false)
    VCONF.briefLead = 200                                  // the suggested brief is now 08:40: 11h40 from Monday's 21:00
    validate()
    expect(withFaceAttrs(snapOf(TUE), () => briefLeadShown()), 'the face prints the brief with the lead it went out with (D186)').toBe(140)
    expect(dayDelta(TUE).length, 'the changed printed value reads pending (D186)').toBeGreaterThan(0)
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'D1991: measured to the 09:40 it prints — no breach on the published face').toBe(false)
    expect(has(officialRaw(), TUE, 'CREW_REST', 'bane'), '…nor in the official pass itself').toBe(false)
    validate()
    expect(officialWarn().trace?.[MON]?.bane, 'no dotted "breaks tomorrow\'s crew rest" mark on Monday from the published Tuesday').toBeUndefined()
    expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'the working copy previews the next amendment: today\'s 08:40 (the agent\'s reading of D2005)').toBe(true)
    sign(TUE); publishALDay(TUE); validate()
    expect(withFaceAttrs(snapOf(TUE), () => briefLeadShown()), 'the amendment prints the new lead').toBe(200)
    expect(ws(officialWarn(), TUE).find((w: any) => w.code === 'CREW_REST')?.msg, 'from the next amendment the new setting applies').toContain('told to report 08:40')
  })
  it('D1991 / D2005 (the agent\'s reading, told to him): a Logic change does not clear a published day\'s crew-rest flag either — the brief lead lowered after publishing leaves the breach measured to the printed brief', () => {
    /* Monday ends 21:00 → clear 09:00. Tuesday published with the lead at 200: B 08:40, a breach. */
    VCONF.briefLead = 200
    day(MON).waves.push(wave([form({ cs: 'LATE', to: '18:00', ld: '19:00' })]))
    day(TUE).waves.push(wave([form()]))
    publish(TUE)
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'the premise: published with a breach to 08:40').toBe(true)
    VCONF.briefLead = 140; validate()                      // today's suggested brief 09:40 would clear
    expect(ws(officialWarn(), TUE).find((w: any) => w.code === 'CREW_REST')?.msg, 'still measured to the printed 08:40').toContain('told to report 08:40')
    expect(has(workingWarn(), TUE, 'CREW_REST', 'bane'), 'the working copy reads today\'s 09:40: clear').toBe(false)
  })
  it('D1991: a typed B is the brief the day prints whatever the setting — the change of lead moves nothing on a published day whose B is typed', () => {
    day(MON).waves.push(wave([form({ cs: 'LATE', to: '18:00', ld: '19:00' })]))
    day(TUE).waves.push(wave([form({ br: '09:40' })]))
    publish(TUE)
    VCONF.briefLead = 200; validate()
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'typed 09:40: clear').toBe(false)
    expect([dayDelta(TUE), daySigned(TUE)], 'nothing printed changed: nothing waits').toEqual([[], true])
  })
  // RULES-FIRST FINDING 7.1 (11 Nov 26, [ENGINE-RULES-REVIEW]), fixed by D1991 (11 Nov 26, [RULES-CHECK-FIXES]): the Logic page's "Brief before take-off" line says crew rest counts to this B and a published day keeps its B — now true on a published day too.
  it('7.1 — the Logic line read as written (D932: every line correct for whatever the settings are): on a published day crew rest counts to the B it keeps, so raising the brief lead after publishing raises no crew-rest breach measured to a B the day does not print', () => {
    const line = lgSettings().flatMap((g: any) => g.items).find((s: any) => s.name === 'Brief before take-off')!.line()
    expect(line, 'the premise: the line\'s two claims').toMatch(/crew rest counts to this B\. A published day keeps its B until it is published again\./)
    day(MON).waves.push(wave([form({ cs: 'LATE', to: '18:00', ld: '19:00' })]))
    day(TUE).waves.push(wave([form()]))
    publish(TUE)
    VCONF.briefLead = 200; validate()
    expect(withFaceAttrs(snapOf(TUE), () => briefLeadShown()), 'the B Tuesday keeps: 09:40').toBe(140)
    expect(has(officialWarn(), TUE, 'CREW_REST', 'bane'), 'counted to the kept 09:40 B, Ranger has 12h40 — no breach').toBe(false)
  })
})

describe('W77 — an archived man: a published day\'s ALL AVAIL crowd stays as it went out with nothing pending, but a published day he is NAMED on reads pending (D327, D321 (7))', () => {
  it('Ranger named in published Tuesday\'s front seat, then archived: Tuesday reads pending and the four fall; restored: nothing waits', () => {
    day(TUE).waves.push(wave([form()]))
    publish(TUE)
    const p: any = PEOPLE
    p.bane.archived = true
    try {
      validate()
      expect(dayDelta(TUE).length, '"a day he is NAMED on (a seat, a desk) still reads pending"').toBeGreaterThan(0)
      expect(daySigned(TUE)).toBe(false)
    } finally { delete p.bane.archived }
    validate()
    expect([dayDelta(TUE), daySigned(TUE)]).toEqual([[], true])
  })
})

describe('W78 — no "Reissue AL1": after an Unpublish the withdrawn amendment\'s changes stay on the working copy as pending, and "Publish AL1" brings the day back; amendment numbers are per day (D101, D98)', () => {
  it('Tuesday ORIG → AL1 → AL2 on its own track while Monday\'s first amendment is its own AL1; AL2 withdrawn: the day falls back to AL1 with AL2\'s change pending again; republished it goes out as AL2 again', () => {
    day(MON).waves.push(wave([form()])); day(TUE).waves.push(wave([form()]))
    publish(MON); publish(TUE)
    setSlotVal(`${TUE}.0.0.0.p`, 'pump'); validate(); sign(TUE); publishALDay(TUE); validate()
    setSlotVal(`${MON}.0.0.0.p`, 'pump'); validate(); sign(MON); publishALDay(MON); validate()
    setSlotVal(`${TUE}.0.0.0.p`, 'stiff'); validate(); sign(TUE); publishALDay(TUE); validate()
    expect([dayALs(MON), dayALs(TUE)], 'per-day numbering: Monday AL1, Tuesday AL1 and AL2 — never week-wide').toEqual([[1], [1, 2]])
    expect(verSeq(dayCurVer(TUE)), 'Tuesday stands at AL2').toBe(2)
    expect(unpublishDay(TUE), 'Unpublish takes AL2 off').toBeTruthy(); validate()
    expect(dayApproved(TUE), 'the day stays published').toBe(true)
    expect(verSeq(dayCurVer(TUE)), '…at AL1').toBe(1)
    expect(dayDelta(TUE).length, '"the withdrawn amendment\'s changes stay on the working copy as pending"').toBeGreaterThan(0)
    expect(day(TUE).waves[0].formations[0].aircraft[0].p, 'the working copy still has Stiff').toBe('stiff')
    sign(TUE); publishALDay(TUE); validate()
    expect(dayALs(TUE), '"Publish AL1" (here AL2) brings the day back under the same number').toEqual([1, 2])
    expect(dayDelta(TUE), 'nothing waits').toEqual([])
    expect(dayALs(MON), 'Monday untouched').toEqual([1])
  })
})
