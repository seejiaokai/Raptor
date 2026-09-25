// @vitest-environment jsdom
/* A PUBLISHED DAY KEEPS WHAT IT WENT OUT WITH ([LEAVE-LATE-PUBLISHED], 25 Sep 26 — the owner's D177, D178, D179):
     · D177 ("Question 2 yes") — a leave filed after a day is published reads "1 pending", the four sign-offs fall, and
       the published face keeps what it was issued with until the next AL;
     · D178 — EVERY member input change after publishing (filed, edited, deleted, moved) is pending for the admin;
     · D179 ("freeze everything for now", provisional) — medical and qualifications freeze too;
     · D183, D184, D185 (26 Sep 26) — except what stays LIVE on the face: the dotted next-day crew-rest mark, a crew-rest
       breach and the 7-day run on the day itself, and a lapsed qualification (not stored, not compared — so they alone
       make nothing pending). A medical downchit stays frozen ("1 frozen still").
   Pinned through the production doors the screens call (the Inputs page's commitNewInput / commitInputEdit /
   removeInput, the reassign drag, the Quals change on PEOPLE, publishing through setDayApproved / publishALDay /
   unpublishDay) and read through every count the screens show — the week, the board, the ⓘ panel, the pending list —
   and through the issued face itself (View-only Sched's dayIssuedHTML). The plan:
   docs/superpowers/plans/2026-09-25-late-published-plan.md; the scenarios: docs/handpass/2026-09-25-late-pub-*-scenarios.md. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { ALPanel } from './ALPanel'
import { readFileSync } from 'fs'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { acceptInput, renameCallsign, setSlotVal } from '../engine/slots'
import { loadVersionToWorkingCopy, inputsLeftSaid } from '../engine/drafts'
import { SCHED, signOf, setSign, setDayApproved, dayDelta, dayDiscardCount, dayShownPendCount, dayCurVer, daySigned, dayPendingItems, publishALDay, unpublishDay } from '../engine/publish'
import { validate, officialWarn, officialRaw, WARN, LIVE_ON_FACE } from '../engine/validate'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV, VWORK, setUnpubArm, setRestArm } from '../state/view'
import { dayHTML, dayInfoHTML, dayIssuedHTML } from './html'
import { PEOPLE } from '../engine/people'
import { boardSignHTML } from './board'
import { pendListHTML } from './pendlist'
import { commitNewInput, commitInputEdit, removeInput, draftOf } from './inputedit'
import { schedRows, publishedDays } from './export'
import { makeStandalone } from '../engine/waves'
import { VCONF } from '../engine/rules'

const MON = 0, WED = 2
let pristine: any[], inputs0: string
const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const sign = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w }
const publishDay = (di: number) => { sign(di); setDayApproved(di, true); validate() }
/* the four, bound to what they signed (setSign — the Shell's one write path), so a change can take them down */
const signBound = (di: number) => { for (const [r, w] of FOUR) setSign(di, r, w) }
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const weekEdit = (di: number) => { setPage('editsched'); return el(dayHTML(di, true, true)) }
const boardStrip = (di: number) => { setPage('editsched'); return el(boardSignHTML(di)) }
const issuedFace = (di: number) => { setPage('viewsched'); try { return el(dayIssuedHTML(di)) } finally { setPage('editsched') } }
const num = (t: string | null | undefined) => { const m = String(t || '').match(/\d+/); return m ? +m[0] : 0 }
const counts = (di: number) => ({
  engine: dayShownPendCount(di),
  week: num(weekEdit(di).querySelector('.dpend')?.textContent),
  board: num(boardStrip(di).querySelector('.dpend')?.textContent),
  info: num(el(dayInfoHTML(di)).querySelector('.dip-pend')?.textContent),
  list: el(pendListHTML(di)).querySelectorAll('.pl-item').length,
})
const listText = (di: number) => el(pendListHTML(di)).querySelector('.pl-list')!.textContent || ''
/* the Amendments panel as it renders (the same React component the Edit Schedule page mounts) */
const alPanelText = () => {
  const host = document.createElement('div'); document.body.appendChild(host)
  const root = createRoot(host)
  act(() => { root.render(<ALPanel />) })
  const t = host.textContent || ''
  act(() => { root.unmount() }); host.remove()
  return t
}
const leaveDraft = (person: string, iso: string, remarks: string, type = 'LL') =>
  ({ person, type, allday: true, half: '', start: iso, end: '', sTime: '06:00', eTime: '18:00', remarks, sans: null, docIds: [] })
const taipanOL = () => INPUTS.find((r: any) => r.person === 'taipan' && r.type === 'OL')!   // seed: Wed 15 Jul, all day

beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = JSON.parse(JSON.stringify(DAYS))
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(JSON.stringify(pristine)).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear()
  setUnpubArm(null); setRestArm(null, null)
  setPage('editsched')
  validate()
})

describe('D177 / D178 — an input change after publishing waits for the admin', () => {
  it('a leave FILED after publishing: 1 pending everywhere, the four fall, the issued face does not show it; deleting it puts all back', () => {
    publishDay(MON); signBound(MON)
    expect(daySigned(MON), 'signed before').toBe(true)
    expect(commitNewInput(leaveDraft('bane', '2026-07-13', 'LATE LEAVE D177'))).toBe(true)
    validate()
    expect(counts(MON)).toEqual({ engine: 1, week: 1, board: 1, info: 1, list: 1 })
    expect(listText(MON)).toMatch(/filed/)
    expect(daySigned(MON), 'the four fall (D103)').toBe(false)
    expect(weekEdit(MON).textContent, 'the working copy shows it').toContain('LATE LEAVE D177')
    expect(issuedFace(MON).textContent, 'the issued face keeps what it went out with').not.toContain('LATE LEAVE D177')
    /* the Amendments panel names it as what it is — an input change, not a "filing" (Fable's code read F6) */
    expect(alPanelText()).toMatch(/Mon · 1 change · 1 input change(?!s)/)
    const inp = INPUTS.find((r: any) => r.remarks === 'LATE LEAVE D177')!
    expect(removeInput(inp)).toBeTruthy()
    validate()
    expect(counts(MON)).toEqual({ engine: 0, week: 0, board: 0, info: 0, list: 0 })
    expect(daySigned(MON), 'put back — the four stand again (AM11)').toBe(true)
  })

  it('a leave EDITED after publishing: 1 pending, the list says what moved, the issued face keeps the old words', () => {
    publishDay(WED); signBound(WED)
    const inp = taipanOL()
    expect(commitInputEdit(inp, { ...draftOf(inp), remarks: 'EDITED AFTER PUBLISH' })).toBeTruthy()
    validate()
    expect(counts(WED)).toEqual({ engine: 1, week: 1, board: 1, info: 1, list: 1 })
    expect(listText(WED)).toMatch(/EDITED AFTER PUBLISH/)
    expect(daySigned(WED)).toBe(false)
    expect(issuedFace(WED).textContent).not.toContain('EDITED AFTER PUBLISH')
    expect(issuedFace(WED).textContent, 'the issued remark is still there').toContain('off island')
    /* times this time: all day → 09:00–12:00, one change still (the same input) */
    expect(commitInputEdit(inp, { ...draftOf(inp), allday: false, sTime: '09:00', eTime: '12:00' })).toBeTruthy()
    validate()
    expect(dayPendingItems(WED).length).toBe(1)
    expect(listText(WED)).toMatch(/all day/)
    expect(listText(WED)).toMatch(/09:00/)
  })

  it('a leave DELETED after publishing: 1 pending, "deleted", and the issued face still shows it', () => {
    publishDay(WED)
    expect(removeInput(taipanOL())).toBeTruthy()
    validate()
    expect(dayShownPendCount(WED)).toBe(1)
    expect(listText(WED)).toMatch(/deleted/)
    expect(issuedFace(WED).textContent).toContain('off island')
  })

  it('a leave replaced by an identical one (a Leave War move re-files under a new id) reads 0 — the face did not change', () => {
    publishDay(WED)
    const inp = taipanOL(), copy = draftOf(inp)
    expect(removeInput(inp)).toBeTruthy()
    expect(commitNewInput({ ...copy, person: inp.person })).toBe(true)
    validate()
    expect(INPUTS.find((r: any) => r.person === 'taipan' && r.type === 'OL')!.iid, 'a new record').not.toBe(inp.iid)
    expect(dayDelta(WED), 'nothing pending').toEqual([])
  })

  it('a leave filed after publishing goes out with the next AL, and that AL keeps it after a later edit', () => {
    publishDay(MON)
    expect(commitNewInput(leaveDraft('bane', '2026-07-13', 'INTO AL1'))).toBe(true)
    validate(); signBound(MON)
    publishALDay(MON); validate()
    expect(dayDelta(MON), 'AL1 took it in').toEqual([])
    expect(issuedFace(MON).textContent, 'the face now shows it').toContain('INTO AL1')
    const inp = INPUTS.find((r: any) => r.remarks === 'INTO AL1')!
    expect(commitInputEdit(inp, { ...draftOf(inp), remarks: 'AFTER AL1' })).toBeTruthy()
    validate()
    expect(dayShownPendCount(MON)).toBe(1)
    expect(issuedFace(MON).textContent, 'AL1 keeps what it went out with').toContain('INTO AL1')
    expect(issuedFace(MON).textContent).not.toContain('AFTER AL1')
  })

  it('Unpublish, then publish again, takes the change in with no AL number (D178\'s other door)', () => {
    publishDay(MON)
    expect(commitNewInput(leaveDraft('bane', '2026-07-13', 'VIA REPUBLISH'))).toBe(true)
    validate()
    expect(dayShownPendCount(MON)).toBe(1)
    unpublishDay(MON); validate()
    publishDay(MON)
    expect(SCHED.als.length, 'no AL').toBe(0)
    expect(dayDelta(MON)).toEqual([])
    expect(issuedFace(MON).textContent).toContain('VIA REPUBLISH')
  })

  it('"Load onto working copy" leaves a member\'s late leave alone: it stays pending, and "Discard N edits" does not count it', () => {
    publishDay(MON)
    expect(commitNewInput(leaveDraft('bane', '2026-07-13', 'KEEP ON LOAD'))).toBe(true)
    validate()
    expect(dayDiscardCount(MON), 'nothing of the scheduler\'s to discard').toBe(0)
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    validate()
    expect(INPUTS.some((r: any) => r.remarks === 'KEEP ON LOAD'), 'the member\'s record is his').toBe(true)
    expect(dayShownPendCount(MON)).toBe(1)
    /* …and the load's sentence says why the day still reads pending (Fable's code read F5; the plan's layer 1) */
    expect(inputsLeftSaid(MON)).toMatch(/1 member input changed since stays pending/)
  })

  it('an accepted request edited after publishing is ONE change — its re-landed row folds into it', () => {
    const inp: any = { person: 'bane', date: 'Jul 13', allday: false, s: 540, e: 600, type: 'Meeting', remarks: 'REQ ROW', mod: '2026-07-01' }
    INPUTS.push(inp); inpId(inp)
    acceptInput(MON, inp, 'g')
    publishDay(MON)
    expect(commitInputEdit(inp, { ...draftOf(inp), sTime: '10:00', eTime: '11:00' })).toBeTruthy()
    validate()
    expect(dayPendingItems(MON).length, 'one act').toBe(1)
    expect(counts(MON).list).toBe(1)
    /* the one line takes the view to the re-landed row (Fable's code read F4 — it was drawn "still") */
    expect(el(pendListHTML(MON)).querySelector('button.pl-item'), 'a line that can be tapped').toBeTruthy()
  })
})

describe('D179 — medical freezes (D185: "1 frozen still"); a qualification is live (D185)', () => {
  it('a downchit filed after publishing: the issued face shows no row and no DNIF; the working copy does; 1 pending', () => {
    publishDay(WED)
    const who = ((DAYS[WED] as any).waves?.[0]?.formations?.[0]?.aircraft?.[0]?.p) || 'stiff'
    expect(commitNewInput({ ...leaveDraft(who, '2026-07-15', 'DOWN AFTER PUBLISH', 'ATT C') })).toBe(true)
    validate()
    expect(dayShownPendCount(WED)).toBe(1)
    expect(weekEdit(WED).textContent).toContain('DOWN AFTER PUBLISH')
    expect(issuedFace(WED).textContent).not.toContain('DOWN AFTER PUBLISH')
    const dnif = (b: any) => ((b.byDay[WED] && b.byDay[WED].warns) || []).some((w: any) => w.code === 'DNIF_FLY' && (w.who || []).includes(who))
    expect(dnif(officialWarn()), 'the issued face flags no DNIF').toBe(false)
  })

  it('a posting change on a published day: the illegal seat shows on the face at once (D185); the posting reads pending; put back → 0', () => {
    publishDay(MON); signBound(MON)
    const pilot = ((DAYS[MON] as any).waves[0].formations[0].aircraft[0].p) as string
    expect(pilot, 'a pilot in Monday\'s first front seat').toBeTruthy()
    const was = (PEOPLE as any)[pilot].pers
    ;(PEOPLE as any)[pilot].pers = true                        // now ground crew — cannot fly a front seat
    try {
      validate()
      expect(dayPendingItems(MON).some((x: any) => x.kind === 'warn'), 'one "what this day shows" item — his posting').toBe(true)
      expect(listText(MON), 'the list names what moved — the man and his posting').toMatch(/ground crew/i)
      expect(daySigned(MON), 'the four fall').toBe(false)
      const qual = (b: any) => ((b.byDay[MON] && b.byDay[MON].warns) || []).some((w: any) => w.code === 'QUAL' && (w.who || []).includes(pilot))
      expect(qual(officialWarn()), 'the illegal seat is live on the issued face (D185)').toBe(true)
      expect(issuedFace(MON).querySelector(`.puck[data-person="${pilot}"]`)?.className, 'his puck rings red on the face').toMatch(/boxred/)
    } finally { (PEOPLE as any)[pilot].pers = was }
    validate()
    expect(dayDelta(MON), 'put back — nothing pending').toEqual([])
    expect(daySigned(MON), 'and the four stand again').toBe(true)
  })

  it('an unchanged published day reads 0 across repeated validates and a publish of the day beside it', () => {
    publishDay(MON)
    validate(); validate()
    expect(dayDelta(MON)).toEqual([])
    publishDay(1)
    expect(dayDelta(MON), 'publishing Tuesday as it stands moves nothing on Monday').toEqual([])
    expect(dayDelta(1)).toEqual([])
  })
})

describe('the reviews\' cases (Astra and Fable on the plan, 26 Sep 26)', () => {
  it('ONE reader: no schedule surface or validator reads "the inputs on a date" from the live records directly', () => {
    for (const f of ['engine/events.ts', 'engine/avail.ts', 'engine/validate.ts', 'ui/html.ts', 'ui/board.ts', 'ui/board-html.ts']) {
      const src = readFileSync(new URL('../' + f, import.meta.url), 'utf8')
      expect(src, f + ' reads through inputsOn(dt)').not.toMatch(/INPUTS\.(?:filter|find|forEach|some)\([^\n]{0,160}inputCoversDate/)
    }
  })

  it('an accepted request edited four ways at once — person, type, times, remarks — is ONE change (Astra #4)', () => {
    const inp: any = { person: 'bane', date: 'Jul 13', allday: false, s: 540, e: 600, type: 'Meeting', remarks: 'FOUR WAYS', mod: '2026-07-01' }
    INPUTS.push(inp); inpId(inp)
    acceptInput(MON, inp, 'g')
    publishDay(MON)
    expect(commitInputEdit(inp, { ...draftOf(inp), person: 'stiff', type: 'Appointment', sTime: '13:00', eTime: '14:30', remarks: 'FOUR WAYS EDITED' })).toBeTruthy()
    validate()
    expect(dayPendingItems(MON).length, 'one act').toBe(1)
    expect(counts(MON)).toEqual({ engine: 1, week: 1, board: 1, info: 1, list: 1 })
  })

  it('Unpublish keeps the issued copies on the withdrawn version: its inputs and its warnings (Astra #5)', () => {
    publishDay(MON)
    const orig: any = (SCHED.orig as any)[MON]
    expect(orig.inp, 'the Original froze its inputs').toBeTruthy()
    expect(orig.w, 'and its warnings').toBeTruthy()
    unpublishDay(MON); validate()
    const kept: any = Object.values((SCHED as any).retired || {}).flat().find((r: any) => r && r.snap && r.snap.d && r.snap.d.dt === (DAYS[MON] as any).dt)
    expect(kept && kept.snap.inp, 'the withdrawn Original keeps its inputs').toBeTruthy()
    expect(kept && kept.snap.w, 'and its warnings').toBeTruthy()
  })

  it('a callsign renamed on a published day is a label: nothing pending, the four stand (Astra #6)', () => {
    publishDay(MON); signBound(MON)
    const pilot = ((DAYS[MON] as any).waves[0].formations[0].aircraft[0].p) as string
    const was = (PEOPLE as any)[pilot].cs
    try {
      renameCallsign(pilot, was + 'X')
      validate()
      expect(dayDelta(MON), 'a label moves nothing').toEqual([])
      expect(daySigned(MON)).toBe(true)
    } finally { renameCallsign(pilot, was); validate() }
  })
})

describe('Astra\'s code read (26 Sep 26): the face beyond the warnings freezes too (D179)', () => {
  it('a man\'s CAT changed on the Quals side: the issued face\'s puck keeps the CAT it went out with; the day reads pending; put back → 0', () => {
    publishDay(MON)
    const pilot = ((DAYS[MON] as any).waves[0].formations[0].aircraft[0].p) as string
    const was = (PEOPLE as any)[pilot].q, other = was === 'A' ? 'B' : 'A'
    const chip = () => { const p = issuedFace(MON).querySelector(`.puck[data-person="${pilot}"] .role`); return p ? p.textContent : '' }
    const c0 = chip()
    ;(PEOPLE as any)[pilot].q = other
    try {
      validate()
      expect(chip(), 'the issued face draws the CAT it went out with').toBe(c0)
      expect(dayPendingItems(MON).some((x: any) => x.kind === 'warn'), 'Monday reads pending').toBe(true)
      expect(listText(MON)).toMatch(/CAT/)
    } finally { (PEOPLE as any)[pilot].q = was }
    validate()
    expect(dayDelta(MON)).toEqual([])
  })

  it('a man only on the Unavailable list is covered too: his CAT changed reads pending (Astra #2\'s worse variant)', () => {
    /* the demo Monday has no such man (every one of its inputs' men is on its content too), so file one through the
       Inputs page before publishing: Salsa flies Tuesday and is nowhere on Monday */
    const onlyInput = 'salsa'
    expect(JSON.stringify(DAYS[MON]).includes(`"${onlyInput}"`), 'Salsa is nowhere in Monday\'s content').toBe(false)
    expect(commitNewInput(leaveDraft(onlyInput, '2026-07-13', 'ONLY UNAVAILABLE'))).toBe(true)
    validate(); publishDay(MON)
    expect(issuedFace(MON).textContent, 'the issued face draws him under Unavailable').toContain('ONLY UNAVAILABLE')
    const was = (PEOPLE as any)[onlyInput!].q
    ;(PEOPLE as any)[onlyInput!].q = was === 'A' ? 'B' : 'A'
    try { validate(); expect(dayShownPendCount(MON)).toBe(1) } finally { (PEOPLE as any)[onlyInput!].q = was }
    validate()
    expect(dayDelta(MON)).toEqual([])
  })

  it('the brief lead changed on the Logic side: a published blank brief keeps the time it printed — on the face and in the CSV; the day reads pending', () => {
    const f: any = (DAYS[MON] as any).waves[0].formations[0]
    f.br = ''                                                   // a blank B before publishing
    validate(); publishDay(MON)
    const briefOf = () => { const r = schedRows(publishedDays()).find((x: any) => x[0] === (DAYS[MON] as any).dow && x[3] === f.cs); return r ? r[5] : null }
    const b0 = briefOf()
    const was = (VCONF as any).briefLead
    ;(VCONF as any).briefLead = was + 30
    try {
      validate()
      expect(briefOf(), 'the published CSV keeps the brief it went out with').toBe(b0)
      expect(dayPendingItems(MON).some((x: any) => x.kind === 'warn'), 'Monday reads pending').toBe(true)
      expect(listText(MON)).toMatch(/suggested lead/)
    } finally { (VCONF as any).briefLead = was }
    validate()
    expect(dayDelta(MON)).toEqual([])
  })

  it('a rename beside a real warning change: the list names only the real change (Astra #3)', () => {
    /* Monday's first pilot (Stiff) carries frozen warnings that name him (a double booking, a missed brief, a long day,
       double turning). He is renamed; the REAL change beside it only ADDS warnings — the long-day limit lowered on the
       Logic page — so any "cleared" row, or a "new" row that is not a long day, is the rename leaking. (The first
       version of this pin flipped his posting instead, which genuinely clears warnings — a ground-crewman carries no
       brief or turning rules — so its "cleared" rows were real, not the rename.) */
    publishDay(MON)
    const pilot = ((DAYS[MON] as any).waves[0].formations[0].aircraft[0].p) as string
    const cs0 = (PEOPLE as any)[pilot].cs, ld = (VCONF as any).longDay
    expect(((officialWarn().byDay[MON] || {}).warns || []).filter((w: any) => (w.who || []).includes(pilot)).length, 'his frozen warnings name him').toBeGreaterThan(1)
    try {
      renameCallsign(pilot, cs0 + 'X')
      ;(VCONF as any).longDay = 6 * 60
      validate()
      expect(dayPendingItems(MON).filter((x: any) => x.kind === 'warn').length, 'one item').toBe(1)
      const t = listText(MON)
      expect(t, 'no warning reads cleared merely because a callsign changed').not.toMatch(/cleared/)
      expect(t, 'something new is named').toMatch(/long work day/)
      expect(t.split('new').length - 1, 'every new row is a long day').toBe((t.match(/long work day/g) || []).length)
    } finally { (VCONF as any).longDay = ld; renameCallsign(pilot, cs0); validate() }
  })
})

/* WHAT STAYS LIVE ON A PUBLISHED FACE (owner, 26 Sep 26): D183 the dotted "breaks tomorrow's crew rest" mark; D184 the
   7-day run warning "as well" — and, by the agent's reading, a crew-rest breach on the day itself; D185 "2 & 3 make it
   live" — a lapsed qualification too, a medical downchit frozen still. Live means: drawn on the issued face from today's
   judgement (the official pass), with its ring and flag, the moment it happens; NOT stored with the version and NOT
   compared — so it alone never makes the day pending and never takes its four down. Each through a production door:
   the schedule's write funnel (setSlotVal) on the draft day beside it, a Logic-page rule (VCONF), a Quals-page tick. */
describe('D184 / D185 — a crew-rest breach, the 7-day run and a lapsed qualification stay live on a published face', () => {
  const TUE = 1
  const warnOn = (b: any, di: number, code: string, id: string) => ((b.byDay[di] && b.byDay[di].warns) || []).some((w: any) => w.code === code && (w.who || []).includes(id))
  const puckCls = (di: number, id: string) => issuedFace(di).querySelector(`.puck[data-person="${id}"]`)?.className || ''

  it('a late duty put on the DRAFT day before breaks a published day\'s crew rest: its face shows it at once, 0 pending, the four stand; put back → gone', () => {
    /* Rocky flies Tuesday's first wave (08:40) — clear of Monday, where he is not on the programme */
    publishDay(TUE); signBound(TUE)
    expect(warnOn(officialWarn(), TUE, 'CREW_REST', 'rocky'), 'baseline: no breach').toBe(false)
    const issues = () => num((issuedFace(TUE).textContent || '').match(/(\d+) issues?/)?.[0])
    const n0 = issues()
    const was = String((DAYS[MON] as any).dutywaves[1].rows[0].id)
    expect(setSlotVal('d:0.1.0', 'rocky'), 'Monday\'s evening SDO desk (13:00–21:30) — through the write funnel').toBe(true)
    validate()
    expect(warnOn(officialWarn(), TUE, 'CREW_REST', 'rocky'), 'Tuesday\'s issued face shows the breach at once (D184)').toBe(true)
    expect(officialWarn().sev[TUE]?.rocky, 'with its red ring').toBe('hard')
    expect(officialWarn().chip[TUE]?.rocky, 'and its CR flag').toBe('CR')
    expect(puckCls(TUE, 'rocky'), 'his puck on View-only Sched rings red').toMatch(/boxred/)
    expect(issues(), 'the face\'s warning summary counts it').toBe(n0 + 1)
    expect(dayShownPendCount(TUE), 'nothing pending on Tuesday — the breach is Monday\'s change').toBe(0)
    expect(daySigned(TUE), 'Tuesday\'s four stand').toBe(true)
    expect(setSlotVal('d:0.1.0', was)).toBe(true)
    validate()
    expect(warnOn(officialWarn(), TUE, 'CREW_REST', 'rocky'), 'put back — the breach is gone from the face').toBe(false)
    expect(officialWarn().sev[TUE]?.rocky, 'and his ring with it').toBeFalsy()
  })

  it('the same late duty on a PUBLISHED day before: pending there; Tuesday\'s face shows the breach once Monday\'s AL goes out — never pending on Tuesday', () => {
    publishDay(MON); publishDay(TUE); signBound(TUE)
    expect(setSlotVal('d:0.1.0', 'rocky')).toBe(true)
    validate()
    expect(dayShownPendCount(MON), 'Monday reads its own change').toBe(1)
    expect(warnOn(officialWarn(), TUE, 'CREW_REST', 'rocky'), 'Tuesday is judged against Monday as ISSUED — no breach yet').toBe(false)
    expect(warnOn(WARN, TUE, 'CREW_REST', 'rocky'), 'the working copy shows it').toBe(true)
    signBound(MON); publishALDay(MON); validate()
    expect(warnOn(officialWarn(), TUE, 'CREW_REST', 'rocky'), 'Monday\'s AL1 out — Tuesday\'s face shows the breach').toBe(true)
    expect(dayShownPendCount(TUE), 'and Tuesday still reads nothing pending').toBe(0)
    expect(daySigned(TUE)).toBe(true)
  })

  it('the 7-day run: a lowered limit (the Logic page) shows the warning on a published day at once, 0 pending', () => {
    publishDay(TUE); signBound(TUE)
    const was = (VCONF as any).maxRun
    ;(VCONF as any).maxRun = 1                                  // Monday and Tuesday in a row is now over the limit
    try {
      validate()
      const run = ((officialWarn().byDay[TUE] || {}).warns || []).filter((w: any) => w.code === 'DAYS_RUN')
      expect(run.length, 'Tuesday\'s face shows the 7-day warning at once (D184)').toBeGreaterThan(0)
      const id = run[0].who[0]
      expect(officialWarn().chip[TUE]?.[id], 'with the RUN flag').toBe('RUN')
      expect(puckCls(TUE, id), 'and the red ring on View-only Sched').toMatch(/boxred/)
      expect(dayPendingItems(TUE).some((x: any) => x.kind === 'warn'), 'not compared — nothing pending for it').toBe(false)
      expect(daySigned(TUE)).toBe(true)
    } finally { (VCONF as any).maxRun = was }
    validate()
    expect(((officialWarn().byDay[TUE] || {}).warns || []).some((w: any) => w.code === 'DAYS_RUN'), 'put back — gone').toBe(false)
  })

  it('a lapsed AAR currency (the Quals page) shows on a published day at once, with its Q flag; 0 pending', () => {
    const ac: any = (DAYS[TUE] as any).waves[0].formations[0].aircraft[0]
    ac.rmks = 'AAR'                                             // a day-AAR sortie before publishing — Nact is DAAR current
    validate(); publishDay(TUE); signBound(TUE)
    expect(warnOn(officialWarn(), TUE, 'AAR_QUAL', ac.p), 'current at publish').toBe(false)
    const q: any = (PEOPLE as any)[ac.p].quals, was = q.daar
    q.daar = false                                              // his DAAR lapses
    try {
      validate()
      expect(warnOn(officialWarn(), TUE, 'AAR_QUAL', ac.p), 'the face shows it at once (D185)').toBe(true)
      expect(officialWarn().chip[TUE]?.[ac.p], 'with the Q flag').toBe('Q')
      expect(puckCls(TUE, ac.p)).toMatch(/boxred/)
      expect(dayShownPendCount(TUE), 'a currency tick is no part of what the day went out with — 0 pending').toBe(0)
      expect(daySigned(TUE)).toBe(true)
    } finally { q.daar = was }
    validate()
    expect(warnOn(officialWarn(), TUE, 'AAR_QUAL', ac.p), 'ticked again — gone').toBe(false)
  })

  it('a lapsed SC currency shows on a published day at once; a warning that FREEZES still reads pending (the unchanged half)', () => {
    ;(DAYS[TUE] as any).waves.push(makeStandalone('sc'))
    const gi = (DAYS[TUE] as any).waves.length - 1
    const man = 'bane'                                          // SC DAY current
    expect(setSlotVal(`1.${gi}.0.0.p`, man)).toBe(true)
    validate(); publishDay(TUE); signBound(TUE)
    const scq = () => warnOn(officialWarn(), TUE, 'SC_QUAL', man)
    expect(scq(), 'current at publish').toBe(false)
    const q: any = (PEOPLE as any)[man].quals, was = { d: q.scDay, n: q.scNight }
    q.scDay = false; q.scNight = false
    const ld = (VCONF as any).longDay
    try {
      validate()
      expect(scq(), 'the lapsed SC currency is on the face at once (D185)').toBe(true)
      expect(dayShownPendCount(TUE), 'and nothing is pending for it').toBe(0)
      /* a LONG DAY is not one of the live warnings: a rule change that raises one keeps the face as issued and reads
         pending (D179 holds for it) */
      ;(VCONF as any).longDay = 60
      validate()
      const faceLong = ((officialWarn().byDay[TUE] || {}).warns || []).filter((w: any) => w.code === 'LONGDAY').length
      const nowLong = ((officialRaw().byDay[TUE] || {}).warns || []).filter((w: any) => w.code === 'LONGDAY').length
      expect(nowLong, 'today\'s judgement raises more long days').toBeGreaterThan(faceLong)
      expect(dayPendingItems(TUE).some((x: any) => x.kind === 'warn'), 'which freeze — "what this day shows" reads pending').toBe(true)
      expect(daySigned(TUE), 'and the four fall').toBe(false)
    } finally { q.scDay = was.d; q.scNight = was.n; (VCONF as any).longDay = ld }
  })

  it('every ring a live warning raises is filed live, and a man whose only warnings are live has no frozen ring (break test for the class tags)', () => {
    /* a day carrying every live kind at once: the demo Tuesday's crew-rest breach (Casper), a ground-crew man in a front
       seat (QUAL), a lapsed DAAR (AAR_QUAL) and a lowered run limit (DAYS_RUN) */
    const ac: any = (DAYS[TUE] as any).waves[0].formations[0].aircraft[0]
    ac.rmks = 'AAR'
    const pilot2 = (DAYS[TUE] as any).waves[1].formations[0].aircraft[0].p as string
    const q: any = (PEOPLE as any)[ac.p].quals, daar = q.daar, pers = (PEOPLE as any)[pilot2].pers, run = (VCONF as any).maxRun
    q.daar = false; (PEOPLE as any)[pilot2].pers = true; (VCONF as any).maxRun = 1
    try {
      const b = validate()
      const seen = new Set<string>()
      b.byDay.forEach((g: any, di: number) => {
        const byMan: Record<string, string[]> = {}
        ;((g && g.warns) || []).forEach((w: any) => (w.who || []).forEach((id: string) => { (byMan[id] = byMan[id] || []).push(w.code) }))
        Object.entries(byMan).forEach(([id, codes]) => {
          codes.filter(c => LIVE_ON_FACE.has(c)).forEach(c => {
            seen.add(c)
            if (c === 'CREW_TIGHT') expect(b.lv.chip[di]?.[id], `${c} on ${id} (day ${di}) flags in the live class`).toBeTruthy()
            else if (c !== 'OIL_NO_PERIOD') expect(b.lv.sev[di]?.[id], `${c} on ${id} (day ${di}) rings in the live class`).toBeTruthy()
          })
          if (codes.every(c => LIVE_ON_FACE.has(c))) expect(b.fz.sev[di]?.[id], `${id} (day ${di}) has only live warnings — no frozen ring`).toBeFalsy()
        })
      })
      for (const c of ['CREW_REST', 'DAYS_RUN', 'QUAL', 'AAR_QUAL']) expect(seen.has(c), `the fixture raised ${c}`).toBe(true)
    } finally { q.daar = daar; (PEOPLE as any)[pilot2].pers = pers; (VCONF as any).maxRun = run }
  })
})

/* FABLE'S CODE READ (26 Sep 26), F1–F3: what a member's input change does on the days it did NOT change. */
describe('Fable\'s code read: an input change reads pending only where the day\'s face moves', () => {
  const TUE = 1, THU = 3, FRI = 4
  /* a man on none of Monday–Friday's content and with no input that week — a clean slate for his own records */
  const loner = () => Object.keys(PEOPLE).find((id: string) => !(PEOPLE as any)[id].special && !(PEOPLE as any)[id].pers
    && [0, 1, 2, 3, 4].every(d => !JSON.stringify(DAYS[d]).includes(`"${id}"`)) && !INPUTS.some((r: any) => r.person === id))!

  it('F1: a Mon–Tue leave stretched to Wednesday — Monday and Tuesday read nothing (their faces did not move); Wednesday reads it filed', () => {
    const who = loner()
    expect(who, 'a man free all week').toBeTruthy()
    expect(commitNewInput({ ...leaveDraft(who, '2026-07-13', 'STRETCH ME'), end: '2026-07-14' })).toBe(true)
    validate()
    for (const d of [MON, TUE, WED]) publishDay(d)
    signBound(MON); signBound(TUE)
    const inp = INPUTS.find((r: any) => r.remarks === 'STRETCH ME')!
    expect(commitInputEdit(inp, { ...draftOf(inp), end: '2026-07-15' })).toBeTruthy()
    validate()
    expect(dayDelta(MON), 'Monday — the same leave on its face').toEqual([])
    expect(dayDelta(TUE), 'Tuesday — the same').toEqual([])
    expect(daySigned(MON) && daySigned(TUE), 'their four stand').toBe(true)
    expect(dayPendingItems(WED).length, 'Wednesday reads it').toBe(1)
    expect(listText(WED)).toMatch(/filed/)
    expect(issuedFace(WED).textContent, 'Wednesday\'s face keeps what it went out with').not.toContain('STRETCH ME')
  })

  it('F1: an upchit trims a Mon–Fri downchit to Wednesday — Monday and Wednesday read only the note it adds ("till …"), never the dates; Thursday and Friday lose it', () => {
    const who = loner()
    expect(commitNewInput({ ...leaveDraft(who, '2026-07-13', 'LONG DOWN', 'ATT C'), end: '2026-07-17' })).toBe(true)
    validate()
    for (const d of [MON, WED, THU, FRI]) publishDay(d)
    expect(commitNewInput({ ...leaveDraft(who, '2026-07-16', 'FIT AGAIN', 'Upchit') })).toBe(true)
    validate()
    const down = INPUTS.find((r: any) => r.person === who && r.type === 'ATT C')!
    expect(down.endDate, 'the downchit now ends Wednesday').toBe('Jul 15')
    /* the trim writes "till 15 Jul" into the downchit's remarks, and the Unavailable block prints the remarks — so the
       face's words DO move on Monday and Wednesday: one change each, worded as the remark alone (the dates are the
       membership's business, Fable F1). Whether the app's own "till …" note should count is put to him (look card). */
    for (const d of [MON, WED]) {
      expect(dayPendingItems(d).length, `day ${d} — one change`).toBe(1)
      const t = listText(d)
      expect(t, 'the remark it gained').toMatch(/LONG DOWN till 15 Jul/)
      expect(t, 'never the far end').not.toMatch(/Jul 13 –|Jul 17/)
    }
    expect(dayPendingItems(THU).length, 'Thursday lost it').toBe(1)
    expect(listText(THU)).toMatch(/moved off this day/)
    expect(dayPendingItems(FRI).length, 'Friday lost it').toBe(1)
  })

  it('F2: a medical takeover in the middle of a downchit is ONE change on the tail\'s published day, worded as one edit', () => {
    const who = loner()
    expect(commitNewInput({ ...leaveDraft(who, '2026-07-13', 'LONG DOWNCHIT', 'ATT C'), end: '2026-07-17' })).toBe(true)
    validate(); publishDay(WED)
    expect(commitNewInput({ ...leaveDraft(who, '2026-07-14', 'MO OML', 'OML') })).toBe(true)   // the MO, Tuesday
    validate()
    const downs = INPUTS.filter((r: any) => r.person === who && r.type === 'ATT C')
    expect(downs.length, 'the cascade trimmed the head and minted a tail').toBe(2)
    const items = dayPendingItems(WED)
    expect(items.length, 'one status change for one man on Wednesday').toBe(1)
    const t = listText(WED)
    expect(t, 'one edit — not "moved off" and "filed"').not.toMatch(/moved off|filed/)
    expect(t).toMatch(/LONG DOWNCHIT/)
  })
})
