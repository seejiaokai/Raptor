// @vitest-environment jsdom
/* A PUBLISHED DAY KEEPS WHAT IT WENT OUT WITH ([LEAVE-LATE-PUBLISHED], 25 Sep 26 — the owner's D177, D178, D179):
     · D177 ("Question 2 yes") — a leave filed after a day is published reads "1 pending", the four sign-offs fall, and
       the published face keeps what it was issued with until the next AL;
     · D178 — EVERY member input change after publishing (filed, edited, deleted, moved) is pending for the admin;
     · D179 ("freeze everything for now", provisional) — medical and qualifications freeze too.
   Pinned through the production doors the screens call (the Inputs page's commitNewInput / commitInputEdit /
   removeInput, the reassign drag, the Quals change on PEOPLE, publishing through setDayApproved / publishALDay /
   unpublishDay) and read through every count the screens show — the week, the board, the ⓘ panel, the pending list —
   and through the issued face itself (View-only Sched's dayIssuedHTML). The plan:
   docs/superpowers/plans/2026-09-25-late-published-plan.md; the scenarios: docs/handpass/2026-09-25-late-pub-*-scenarios.md. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { acceptInput, renameCallsign } from '../engine/slots'
import { loadVersionToWorkingCopy } from '../engine/drafts'
import { SCHED, signOf, setSign, setDayApproved, dayDelta, dayDiscardCount, dayShownPendCount, dayCurVer, daySigned, dayPendingItems, publishALDay, unpublishDay } from '../engine/publish'
import { validate, officialWarn } from '../engine/validate'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV, VWORK, setUnpubArm, setRestArm } from '../state/view'
import { dayHTML, dayInfoHTML, dayIssuedHTML } from './html'
import { PEOPLE } from '../engine/people'
import { boardSignHTML } from './board'
import { pendListHTML } from './pendlist'
import { commitNewInput, commitInputEdit, removeInput, draftOf } from './inputedit'

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
  })
})

describe('D179 — medical and qualifications freeze too (provisional)', () => {
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

  it('a qualification change on a published day: the issued face keeps its warnings, the day reads "warnings changed"; put back → 0', () => {
    publishDay(MON); signBound(MON)
    const pilot = ((DAYS[MON] as any).waves[0].formations[0].aircraft[0].p) as string
    expect(pilot, 'a pilot in Monday\'s first front seat').toBeTruthy()
    const was = (PEOPLE as any)[pilot].pers
    ;(PEOPLE as any)[pilot].pers = true                        // now ground crew — cannot fly a front seat
    try {
      validate()
      expect(dayPendingItems(MON).some((x: any) => x.kind === 'warn'), 'one "warnings changed" item').toBe(true)
      expect(listText(MON)).toMatch(/Warning/)
      expect(daySigned(MON), 'the four fall').toBe(false)
      const qual = (b: any) => ((b.byDay[MON] && b.byDay[MON].warns) || []).some((w: any) => w.code === 'QUAL' && (w.who || []).includes(pilot))
      expect(qual(officialWarn()), 'the issued face keeps the warnings it went out with').toBe(false)
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
