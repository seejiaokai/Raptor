// @vitest-environment jsdom
/* THE WAITING MARK ON AN UNAVAILABLE ROW (owner D1784, 8 Nov 26 — "All as recommended", the pictures round's question 5,
   "A waiting mark on Unavailable"): an input filed, changed or moved after its day was published wears, on its
   Unavailable row, the same waiting mark a Ground Programme row wears — on the week its name underlined dotted in the
   amendment's colour, on the board its name box outlined dotted — until the day's next amendment goes out. No new words,
   no new look: the mark is the attribute pair every other waiting change carries (` data-alp="1" data-aln="<n>"`, n the
   amendment it will go out as — engine/publish.ts nextSeq), and the stylesheet draws it.

   The mark and the day's count read ONE list (engine/publish.ts dayPendingItems, through pendingInputIds), so every
   input the count names wears it: a leave filed since, one whose details changed, one re-dated onto the day, a request
   moved off the Ground Programme under Unavailable ("→ Unavail", an Other's "Goes to"), a man split out of a shared
   input (his own new record), both inputs of a man moved between two, and a man's record replaced by another of his.
   Never on a draft day, a look at a version, the issued face, in OIL Earn (where the Ground name wears none either —
   measured below first), under Personal Inputs, or on an input untouched since the day went out.

   Driven through the doors the screens call (the input window's commitNewInput / commitInputEdit / commitInput /
   setInpField / removeInput, the accept buttons' acceptInput / unacceptInput, publishing through setDayApproved /
   publishALDay) and read off the week's and the board's own builders. */
import { beforeAll, beforeEach, afterEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, inpId, idsOf } from '../engine/inputs'
import { acceptInput, unacceptInput, txtSet } from '../engine/slots'
import { SCHED, signOf, setSign, setDayApproved, dayPendingItems, dayShownPendCount, nextSeq, publishALDay, pendingInputIds, dayCurVer } from '../engine/publish'
import { validate } from '../engine/validate'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage, DPREV, VWORK, setUnpubArm, setRestArm } from '../state/view'
import { dayHTML, dayIssuedHTML, dayPreviewHTML, withDaySnap } from './html'
import { boardHTML } from './board'
import { commitNewInput, commitInputEdit, commitInput, draftOf, removeInput, setInpField } from './inputedit'
import { toggleOilMode, oilModeOn } from './oilmode'

const MON = 0, WED = 2, THU = 3
let pristine: any[], inputs0: string
const FOUR: Array<[string, string]> = [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]
const sign = (di: number) => { const g = signOf(di); for (const [r, w] of FOUR) (g as any)[r] = w }
const publishDay = (di: number) => { sign(di); setDayApproved(di, true); validate() }
/* a pending change wipes the sign-offs (D103): an amendment is signed again, against what it carries, before it goes out */
const publishAL = (di: number) => { validate(); for (const [r, w] of FOUR) setSign(di, r, w); publishALDay(di); validate() }
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const leaveDraft = (person: string, iso: string, remarks: string, type = 'LL') =>
  ({ person, type, allday: true, half: '', start: iso, end: '', sTime: '06:00', eTime: '18:00', remarks, sans: null, docIds: [] })
const byRemark = (t: string) => INPUTS.find((r: any) => r.remarks === t)!
const taipanOL = () => INPUTS.find((r: any) => r.person === 'taipan' && r.type === 'OL')!   // seed: Wed 15 Jul, all day
const pikeOD = () => INPUTS.find((r: any) => r.person === 'pike' && r.type === 'OD')!         // seed: Wed 15 – Fri 17 Jul

/* the week's Unavailable names (Edit Schedule), each with its waiting mark — by the input's id */
const weekUnav = (di: number) => { setPage('editsched'); return el(dayHTML(di, true, true)).querySelector('.sec-unav') as HTMLElement }
const weekName = (di: number, iid: string) => weekUnav(di)?.querySelector(`button.inpedit[data-inpedit="${iid}"]`) as HTMLElement | null
/* the board's Unavailable panel and its name pills */
const boardUnav = (di: number) => { setPage('editsched'); return el(boardHTML(di)).querySelector('.sb-panel.unav') as HTMLElement }
const boardName = (di: number, iid: string) => boardUnav(di)?.querySelector(`.sbi-ty[data-inpedit="${iid}"]`) as HTMLElement | null
const aln = (e: Element | null | undefined) => (e ? e.getAttribute('data-aln') : 'NO ELEMENT')
/* every mark under a surface's Unavailable list */
const marksIn = (root: Element | null) => Array.from(root ? root.querySelectorAll('[data-aln]') : [])

beforeAll(() => {
  initStore()
  setSession({ user: 'ad', role: 'admin' } as any)
  pristine = structuredClone(DAYS)
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  DAYS.length = 0; structuredClone(pristine).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.signBind = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear()
  setUnpubArm(null); setRestArm(null, null)
  setPage('editsched')
  validate()
})
afterEach(() => { for (const di of [MON, WED, THU]) if (oilModeOn(di)) toggleOilMode(di) })

describe('D1784 — an input changed after its day was published wears the waiting mark on its Unavailable row', () => {
  it('a leave FILED after publishing: its name on the week and on the board carry the next amendment, the count names it, and the amendment clears it', () => {
    publishDay(MON)
    expect(commitNewInput(leaveDraft('bane', '2026-07-13', 'LATE LEAVE D1784'))).toBe(true)
    validate()
    const id = String(inpId(byRemark('LATE LEAVE D1784')))
    expect(dayShownPendCount(MON), 'the day counts it').toBe(1)
    expect(pendingInputIds(MON).has(id), 'the one list the count reads names it').toBe(true)
    expect(nextSeq(MON), 'it goes out as AL1').toBe(1)
    expect(aln(weekName(MON, id)), 'the week: its name').toBe('1')
    expect(weekName(MON, id)!.getAttribute('data-alp')).toBe('1')
    expect(weekName(MON, id)!.getAttribute('title'), 'its own title stays — no second one').toMatch(/^Edit this input/)
    expect(aln(boardName(MON, id)), 'the board: its name box').toBe('1')
    expect(marksIn(weekUnav(MON)), 'only that row of the list').toHaveLength(1)
    publishAL(MON)
    expect(dayShownPendCount(MON), 'gone out').toBe(0)
    expect(aln(weekName(MON, id)), 'the mark goes with it (week)').toBe(null)
    expect(aln(boardName(MON, id)), 'the mark goes with it (board)').toBe(null)
  })

  it('the next amendment after AL1 is AL2, and the mark says so', () => {
    publishDay(MON)
    expect(commitNewInput(leaveDraft('bane', '2026-07-13', 'FIRST'))).toBe(true)
    publishAL(MON)
    expect(dayShownPendCount(MON), 'AL1 went out').toBe(0)
    expect(commitNewInput(leaveDraft('split', '2026-07-13', 'SECOND'))).toBe(true)
    validate()
    expect(aln(weekName(MON, String(inpId(byRemark('SECOND')))))).toBe('2')
    expect(aln(weekName(MON, String(inpId(byRemark('FIRST'))))), 'the one already out wears nothing waiting').toBe(null)
  })

  it('its details changed after publishing (the remark, then the times): marked', () => {
    publishDay(WED)
    const inp = taipanOL(), id = String(inpId(inp))
    expect(aln(weekName(WED, id)), 'untouched since publishing: no mark').toBe(null)
    expect(commitInputEdit(inp, { ...draftOf(inp), remarks: 'EDITED AFTER PUBLISH' })).toBeTruthy()
    validate()
    expect(aln(weekName(WED, id))).toBe('1')
    expect(aln(boardName(WED, id))).toBe('1')
  })

  it('re-dated onto the published day: marked there', () => {
    publishDay(WED)
    expect(commitNewInput(leaveDraft('split', '2026-07-16', 'MOVES ONTO WED'))).toBe(true)
    const inp = byRemark('MOVES ONTO WED'), id = String(inpId(inp))
    expect(commitInputEdit(inp, { ...draftOf(inp), start: '2026-07-15' })).toBeTruthy()
    validate()
    expect(dayShownPendCount(WED)).toBe(1)
    expect(aln(weekName(WED, id))).toBe('1')
    expect(aln(boardName(WED, id))).toBe('1')
  })

  it('"→ Unavail" of a request the issued day had on the Ground Programme: marked under Unavailable', () => {
    const inp = INPUTS.find((r: any) => r.person === 'bane' && r.type === 'Appointment')!   // Thu 16 Jul
    if (inp.acc !== 'g') expect(acceptInput(THU, inp, 'g')).toBe(true)
    expect(inp.acc, 'on the Ground Programme when the day goes out').toBe('g')
    publishDay(THU)
    const id = String(inpId(inp))
    expect(unacceptInput(THU, inp)).toBe(true)
    expect(acceptInput(THU, inp, 'u'), 'filed under Unavailable').toBe(true)
    validate()
    expect(dayPendingItems(THU).some((it: any) => it.inp), 'the one change pairs the row and its filing (D114)').toBe(true)
    expect(aln(weekName(THU, id))).toBe('1')
    expect(aln(boardName(THU, id))).toBe('1')
  })

  it('an Other whose "Goes to" moves it from the programme to Unavailable after publishing: marked', () => {
    expect(commitNewInput({ ...leaveDraft('split', '2026-07-15', 'AN OTHER', 'Other'), allday: false, sTime: '09:00', eTime: '10:00', goes: 'g' })).toBe(true)
    const inp = byRemark('AN OTHER'), id = String(inpId(inp))
    if (inp.acc !== 'g') expect(acceptInput(WED, inp, 'g')).toBe(true)
    publishDay(WED)
    expect(aln(weekName(WED, id)), 'not under Unavailable yet').toBe('NO ELEMENT')
    expect(commitInputEdit(inp, { ...draftOf(inp), goes: 'u' })).toBeTruthy()
    validate()
    expect(byRemark('AN OTHER').acc).toBe('u')
    expect(aln(weekName(WED, id))).toBe('1')
    expect(aln(boardName(WED, id))).toBe('1')
  })

  it('a man split out of a shared input after publishing: his own new record wears the mark too (Astra, required)', () => {
    expect(commitInput(null, draftOf({ person: 'bane', type: 'OD', date: 'Jul 15', yr: 2026, allday: true, remarks: 'Exercise X' }), ['bane', 'split', 'rocky'])).toBe(true)
    publishDay(WED)
    const od = INPUTS.find((r: any) => r.remarks === 'Exercise X' && r.type === 'OD')!
    expect(setInpField(od, 'rmks', 'Exercise X — back Thursday', 'rocky'), 'typed on Rocky’s own row').toBe(true)
    validate()
    const now = INPUTS.filter((r: any) => r.type === 'OD' && /^Exercise X/.test(String(r.remarks || '')))
    expect(now.map((r: any) => idsOf(r).map(String)), 'Rocky has a record of his own').toEqual([['bane', 'split'], ['rocky']])
    expect(dayShownPendCount(WED), 'one change (the input’s)').toBe(1)
    for (const r of now) expect(aln(weekName(WED, String(inpId(r)))), `${idsOf(r).join('+')}’s row`).toBe('1')
    for (const r of now) expect(aln(boardName(WED, String(inpId(r)))), `${idsOf(r).join('+')}’s row (board)`).toBe('1')
  })

  it('a man moved between two inputs: the input he left wears it as well as the one he joined (Astra)', () => {
    expect(commitInput(null, draftOf({ person: 'bane', type: 'OD', date: 'Jul 15', yr: 2026, allday: true, remarks: 'Exercise A' }), ['bane', 'split'])).toBe(true)
    expect(commitInput(null, draftOf({ person: 'rocky', type: 'OD', date: 'Jul 15', yr: 2026, allday: true, remarks: 'Exercise B' }), ['rocky'])).toBe(true)
    publishDay(WED)
    const A = INPUTS.find((r: any) => r.remarks === 'Exercise A')!, B = INPUTS.find((r: any) => r.remarks === 'Exercise B')!
    const a = String(inpId(A)), b = String(inpId(B))
    expect(commitInput(A, draftOf(A), ['bane'])).toBe(true)
    expect(commitInput(B, draftOf(B), ['rocky', 'split'])).toBe(true)
    validate()
    const items = dayPendingItems(WED)
    expect(items.some((it: any) => it.pp && it.pp.role === 'move'), 'one move (D109): the input he left rides it').toBe(true)
    expect(aln(weekName(WED, a)), 'the input he left').toBe('1')
    expect(aln(weekName(WED, b)), 'the input he joined').toBe('1')
    expect(aln(boardName(WED, a))).toBe('1')
    expect(aln(boardName(WED, b))).toBe('1')
  })

  it('a man’s record replaced by another of his (deleted, then a new one filed of the same type): the new row wears it', () => {
    publishDay(WED)
    const old = taipanOL()
    expect(removeInput(old)).toBeTruthy()
    expect(commitNewInput(leaveDraft('taipan', '2026-07-15', 'NEW OL', 'OL'))).toBe(true)
    validate()
    const nw = byRemark('NEW OL'), id = String(inpId(nw))
    expect(dayShownPendCount(WED), 'one edit (inputs.ts frozenInputMatch, step 4)').toBe(1)
    expect(aln(weekName(WED, id))).toBe('1')
    expect(aln(boardName(WED, id))).toBe('1')
  })
})

describe('D1784 — where the mark never shows', () => {
  it('a draft (unpublished) day: no mark, as on the Ground Programme (a draft day shows none)', () => {
    expect(commitNewInput(leaveDraft('bane', '2026-07-13', 'DRAFT DAY LEAVE'))).toBe(true)
    validate()
    const id = String(inpId(byRemark('DRAFT DAY LEAVE')))
    expect(weekName(MON, id), 'the row is there').toBeTruthy()
    expect(aln(weekName(MON, id))).toBe(null)
    expect(aln(boardName(MON, id))).toBe(null)
    expect(pendingInputIds(MON).size).toBe(0)
  })

  it('an input untouched since publishing, beside one that changed: only the changed one', () => {
    publishDay(WED)
    expect(commitNewInput(leaveDraft('split', '2026-07-15', 'NEW ON WED'))).toBe(true)
    validate()
    expect(aln(weekName(WED, String(inpId(taipanOL()))))).toBe(null)
    expect(aln(weekName(WED, String(inpId(pikeOD()))))).toBe(null)
    expect(marksIn(weekUnav(WED))).toHaveLength(1)
    expect(marksIn(boardUnav(WED))).toHaveLength(1)
  })

  it('a look at the Original: no mark, on the week or the board (the look shows what went out)', () => {
    publishDay(WED)
    const inp = taipanOL(), id = String(inpId(inp))
    expect(commitInputEdit(inp, { ...draftOf(inp), remarks: 'EDITED, THEN LOOKED BACK' })).toBeTruthy()
    validate()
    expect(aln(weekName(WED, id)), 'the working copy wears it').toBe('1')
    const ver = dayCurVer(WED)
    setPage('editsched')
    const week = el(dayPreviewHTML(WED, ver, true)), unav = week.querySelector('.sec-unav')
    expect(unav && unav.textContent, 'the look draws his row as it went out').toContain('Overseas leave')
    expect(marksIn(unav), 'the week look').toHaveLength(0)
    const board = el(withDaySnap(WED, ver, () => boardHTML(WED, true)))
    expect(board.querySelector('.sb-panel.unav')!.textContent).toContain('OL')
    expect(marksIn(board.querySelector('.sb-panel.unav')), 'the board look').toHaveLength(0)
  })

  it('the issued face (View-only Sched, what a member reads): no mark, as the Ground row has none', () => {
    publishDay(WED)
    expect(commitInputEdit(taipanOL(), { ...draftOf(taipanOL()), remarks: 'MEMBER SEES NOT' })).toBeTruthy()
    validate()
    setPage('viewsched')
    try { expect(marksIn(el(dayIssuedHTML(WED)).querySelector('.sec-unav'))).toHaveLength(0) } finally { setPage('editsched') }
  })

  it('Personal Inputs rows: no mark (Unavailable only)', () => {
    publishDay(WED)
    expect(commitNewInput({ ...leaveDraft('split', '2026-07-15', 'A MEETING', 'Meeting'), allday: false, sTime: '09:00', eTime: '10:00' })).toBe(true)
    validate()
    expect(dayShownPendCount(WED), 'it is waiting').toBeGreaterThan(0)
    setPage('editsched')
    expect(marksIn(el(dayHTML(WED, true, true)).querySelector('.sec-inp'))).toHaveLength(0)
    expect(marksIn(el(boardHTML(WED)).querySelector('.sb-panel.pinp'))).toHaveLength(0)
  })

  it('OIL Earn: the Ground name wears no mark in the mode (measured), and neither does either kind of Unavailable name — an OIL claim’s cell or a plain name', () => {
    publishDay(WED)
    /* the Ground name first: a row's name changed after publishing wears the mark outside the mode, none inside */
    const ri = ((DAYS[WED] as any).ground || []).findIndex((g: any) => g && !g.src)
    expect(ri, 'a scheduler’s own Ground row').toBeGreaterThanOrEqual(0)
    txtSet(`gr:${WED}.${ri}.prog`, 'RENAMED AFTER PUBLISH')
    expect(commitInputEdit(taipanOL(), { ...draftOf(taipanOL()), remarks: 'PLAIN NAME CHANGED' })).toBeTruthy()
    expect(commitInputEdit(pikeOD(), { ...draftOf(pikeOD()), remarks: 'OD CLAIM CHANGED' })).toBeTruthy()
    validate()
    const ground = (root: Element) => root.querySelector(`[data-bfld="gr:${WED}.${ri}.prog"]`)
    setPage('editsched')
    const out = el(boardHTML(WED))
    expect(aln(ground(out)), 'outside the mode the Ground name is marked').toBe('1')
    expect(aln(out.querySelector(`.sb-panel.unav .sbi-ty[data-inpedit="${inpId(taipanOL())}"]`)), 'and so is the plain Unavailable name').toBe('1')
    expect(aln(out.querySelector(`.sb-panel.unav .sbi-ty[data-inpedit="${inpId(pikeOD())}"]`)), 'and the OD claim’s').toBe('1')
    toggleOilMode(WED)
    const inMode = el(boardHTML(WED))
    expect(inMode.textContent, 'the Ground row is drawn').toContain('RENAMED AFTER PUBLISH')
    expect(ground(inMode), 'in the mode the Ground name is the item’s switch, not the box').toBe(null)
    expect(marksIn(inMode.querySelector('.sb-panel.unav')), 'no Unavailable name is marked in the mode, of either kind').toHaveLength(0)
    expect(inMode.querySelector('.sb-panel.unav')!.textContent).toContain('OD')
  })
})
