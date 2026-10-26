// @vitest-environment jsdom
/* AN OVERSEAS DUTY HAS A WAY OUT OF UNAVAILABLE (his D1393, 26 Oct 26 — "an overseas duty has no Reject button on the
   schedule … add one"; the night's walk, picture n5-1). It sits under Unavailable by its kind, with no mark; a scheduler
   now takes it out as he takes out a course: Reject parks it in Personal Inputs, → Ground puts its row on the Ground
   Programme, → Unavail puts it back. Taken out, the crew list counts him in, as the Leave War already did (D1390) — the
   two ask one question (engine/inputs.ts odOut). The seed's overseas duty: Pike, Wed 15 – Fri 17 Jul. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, isAway, odOut, listedPersonal, listedUnavail } from '../engine/inputs'
import { SCHED } from '../engine/publish'
import { acceptInput, unacceptInput } from '../engine/slots'
import { validate } from '../engine/validate'
import { dayOff, slotBar } from '../engine/avail'
import { filingRestorePlan, dayFilingFingerprint, dayDiscardCount, dayPendingItems, signOf, setDayApproved } from '../engine/publish'
import { routeClick } from './interactions'
import { availableFor } from '../leavewar/sync'
import { PEOPLE } from '../engine/people'
import { initStore, writeInputs } from '../state/store'
import { setSession } from '../state/auth'
import { setPage } from '../state/view'
import { warCounts } from '../leavewar/absences'
import { dayHTML, accCtl } from './html'
import { sbInputsGroupPanel, sbUnavailPanel } from './board-html'
import { common as noticeParts } from '../state/notices'
import { inputsLeftSaid, loadVersionToWorkingCopy } from '../engine/drafts'
import { dayCurVer, daySnapOf } from '../engine/publish'
import { schedWrite, SCHED_TYPES } from '../state/sched-commit'
import { afterSchedMutate } from '../state/view'
import { baseReset, rederive } from '../state/holderbase'

const WED = 2
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
let pristine: any[] = [], inputs0 = ''
const od = () => INPUTS.find((i: any) => i.type === 'OD' && i.person === 'pike') as any

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
  setPage('editsched')
  validate()
})

describe('an overseas duty under Unavailable by its kind (D1393)', () => {
  it('is away, listed under Unavailable, and offers Reject on the week and the board', () => {
    const x = od()
    expect(x.acc).toBeUndefined()
    expect(isAway(x)).toBe(true)
    expect(dayOff(DAYS[WED]).has('pike')).toBe(true)
    expect(listedUnavail(x) && !listedPersonal(x)).toBe(true)
    expect(el(accCtl(WED, x)).textContent).toBe('Reject')
    const unav = el(sbUnavailPanel(DAYS[WED], WED))
    expect(unav.querySelector('[data-acc="x"]'), 'the board\'s Unavailable row carries Reject').toBeTruthy()
    const wk = el(dayHTML(WED, true, true)).querySelector('.sec-unav') as HTMLElement
    expect(wk.querySelector('[data-acc="x"]'), 'the week\'s Unavailable row carries Reject').toBeTruthy()
  })
})

describe('Reject, then → Ground or → Unavail, as a course has (D1393)', () => {
  it('Reject parks it in Personal Inputs: counted in, → Ground · → Unavail offered', () => {
    const x = od()
    expect(el(sbInputsGroupPanel(DAYS[WED], WED)).textContent).not.toContain('1 input')
    expect(unacceptInput(WED, x)).toBe(true)
    expect(x.acc).toBe('r')
    expect(odOut(x)).toBe(true)
    expect(isAway(x)).toBe(false)
    validate()
    expect(dayOff(DAYS[WED]).has('pike'), 'the crew list counts him in').toBe(false)
    expect(warCounts(x), 'and so does the Leave War').toBe(false)
    expect(listedPersonal(x) && !listedUnavail(x)).toBe(true)
    expect(el(accCtl(WED, x)).textContent).toBe('→ Ground→ Unavail')
    /* the board's Personal Inputs panel (folded, it keeps its count) now holds it */
    expect(el(sbInputsGroupPanel(DAYS[WED], WED)).textContent).toContain('1 input')
  })
  it('→ Ground puts its row on the Ground Programme and keeps it there by a mark; Reject takes it off again', () => {
    const x = od()
    unacceptInput(WED, x)
    expect(acceptInput(WED, x, 'g')).toBe(true)
    expect(x.acc).toBe('g')
    expect(x.odGround).toBe(true)
    expect(DAYS.some((d: any) => (d.ground || []).some((g: any) => g && g.src === x.iid))).toBe(true)
    expect(isAway(x)).toBe(false)
    /* the 'g' a week works out for itself is cleared on every week load; the mark keeps him in (the course's F1) */
    delete x.acc
    expect(isAway(x), 'no mark but the Ground Programme\'s: still in').toBe(false)
    expect(warCounts(x)).toBe(false)
    x.acc = 'g'
    expect(el(accCtl(WED, x)).textContent).toMatch(/^Reject/)
    expect(unacceptInput(WED, x)).toBe(true)
    expect(x.acc).toBe('r')
    expect(x.odGround).toBeUndefined()
    expect(DAYS.some((d: any) => (d.ground || []).some((g: any) => g && g.src === x.iid))).toBe(false)
  })
  it('→ Unavail puts it back: away again, on both', () => {
    const x = od()
    unacceptInput(WED, x)
    expect(acceptInput(WED, x, 'u')).toBe(true)
    expect(x.acc).toBe('u')
    expect(isAway(x)).toBe(true)
    expect(warCounts(x)).toBe(true)
    expect(listedUnavail(x)).toBe(true)
    expect(el(accCtl(WED, x)).textContent).toBe('Reject')
  })
  /* THE FRESH CODE READ'S FINDS (26 Oct 26) — an overseas duty on the Ground Programme everywhere a course there is read */
  const oneDayOD = (who: string, extra: any = {}) => {
    const r: any = { iid: 'od-mon-' + who, person: who, type: 'OD', date: 'Jul 13', yr: 2026, allday: true, remarks: '', mod: '', ...extra }
    INPUTS.unshift(r); return r
  }
  const freeOnMon = () => Object.keys(PEOPLE).find(id => !PEOPLE[id].special && !PEOPLE[id].archived && !(PEOPLE[id] as any).pers
    && !INPUTS.some((i: any) => i.date === 'Jul 13' && (i.person === id || (i.people || []).some((x: any) => x.p === id)))) as string
  it('F1: a version loaded back puts it where the version had it — its Ground mark is its filing', () => {
    const r = oneDayOD(freeOnMon(), { odGround: true })
    const plan = filingRestorePlan(0, {})
    expect(plan.put.find(p => p.inp === r), 'under Unavailable in the version: the load puts it back there').toMatchObject({ want: '' })
  })
  it('N2: the published filing record reads its Ground mark — a week that does not hold its row still records "on the programme"', () => {
    const r = oneDayOD(freeOnMon(), { odGround: true })
    expect(dayFilingFingerprint(0)[r.iid]).toBe('g')
    delete r.odGround
    expect(dayFilingFingerprint(0)[r.iid], 'with no mark: under Unavailable, as before').toBe('')
  })
  it('F2: on the Ground Programme he is kept out of the ALL AVAIL crowd, as a course there keeps him', () => {
    const who = freeOnMon()
    expect(availableFor('2026-07-13', [600, 660])).toContain(who)
    oneDayOD(who, { acc: 'g', odGround: true })
    expect(availableFor('2026-07-13', [600, 660])).not.toContain(who)
  })
  it('F3: the crew picker says he is already on it, as the warning list flags it', () => {
    const who = freeOnMon()
    oneDayOD(who, { acc: 'g', odGround: true })
    validate()
    expect(slotBar(who, '0.0.0.0.' + (PEOPLE[who].seat === 'RCP' ? 'w' : 'p'))).toContain('already on')
  })
  it('his bell says it as a filing: taken out of, and filed under, Unavailable', () => {
    const before = { ...od() }
    const out = { ...before, acc: 'r' }
    expect(noticeParts(before, out, 'pike').map((n: any) => n.k)).toContain('unavoff')
    expect(noticeParts(out, { ...out, acc: 'u' }, 'pike').map((n: any) => n.k)).toContain('unav')
  })
})

/* [LW-OD-DISCARD-COUNT] — the M3 batch's third code read (26 Oct 26, PLAUSIBLE, filed): an overseas duty published under
   Unavailable, then Reject and → Ground on that day, read "1 pending" while "Load onto working copy" offered "Discard 2
   edits". One change waiting is one edit discarded (D109, D114). Red first; a course, which has the same way out (D1381,
   D1389), miscounted the same way. */
describe("the load's count for a request moved onto the Ground Programme after publishing ([LW-OD-DISCARD-COUNT])", () => {
  const MON = 0
  const press = (di: number, r: any, dest: 'x' | 'g' | 'u') => {
    const b = el(accCtl(di, r)).querySelector(`[data-acc="${dest}"]`) as HTMLElement
    expect(b, `the "${dest}" button`).toBeTruthy()
    document.body.appendChild(b)
    try { routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() }
  }
  const publish = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(di, true) }
  const oneDay = (type: string) => {
    const who = Object.keys(PEOPLE).find(id => !PEOPLE[id].special && !PEOPLE[id].archived && !(PEOPLE[id] as any).pers
      && !INPUTS.some((i: any) => i.date === 'Jul 13' && (i.person === id || (i.people || []).some((x: any) => x.p === id)))) as string
    const row: any = { iid: 'dc-' + type, person: who, type, date: 'Jul 13', yr: 2026, allday: true, remarks: '', mod: '', ...(type === 'CSE' ? { acc: 'u' } : {}) }
    expect(writeInputs(() => { INPUTS.unshift(row) })).toBe(true)
    return () => INPUTS.find((x: any) => x.iid === row.iid) as any
  }
  for (const type of ['OD', 'CSE']) {
    it(`a one-day ${type} published under Unavailable, then Reject and → Ground: 1 pending, and the load discards 1 edit`, () => {
      const r = oneDay(type)
      publish(MON)
      expect(dayPendingItems(MON).length, 'nothing waiting once published').toBe(0)
      press(MON, r(), 'x'); press(MON, r(), 'g')
      expect(DAYS[MON].ground.filter((x: any) => x && x.src === r().iid).length, 'its one row on the programme').toBe(1)
      expect(dayPendingItems(MON).length, 'the day head: 1 pending').toBe(1)
      expect(dayDiscardCount(MON), 'the load: Discard 1 edit').toBe(1)
    })
  }
})

/* [LW-LOAD-RELAND-RID] (found building [LW-OD-DISCARD-COUNT], 26 Oct 26): a request covering three days, Wednesday
   published with it under Unavailable, then Reject and → Ground. The load of the Original read "Discard 2 edits". Two faults
   made the 2. (1) → Ground gave the row a fresh hidden name while the working-out gives a request's row `r` + its id, so the
   count, which compares rows by that name, read a row the working-out lands again as one row taken off and one added.
   (2) The count's dry run of the load landed the row again from the request's filing as it stands, but the load's reconcile
   first takes a request off the programme when the version holds no row for it (slots.ts reconcileDayFiling) — and an
   overseas duty unfiled so is under Unavailable again and does not land. So: the overseas duty's load takes its row away
   (1 edit), and a course's load lands it again, fresh, under the same name (nothing to throw away). */
describe("a load over a request moved onto the Ground Programme across three days ([LW-LOAD-RELAND-RID])", () => {
  const press = (di: number, r: any, dest: 'x' | 'g' | 'u') => {
    const b = el(accCtl(di, r)).querySelector(`[data-acc="${dest}"]`) as HTMLElement
    expect(b, `the "${dest}" button`).toBeTruthy()
    document.body.appendChild(b)
    try { routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() }
  }
  const publish = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(di, true) }
  const rowsOf = (r: any) => DAYS.flatMap((d: any) => (d.ground || []).filter((x: any) => x && x.src === r.iid))
  const load = () => schedWrite(SCHED_TYPES.mutate, () => { loadVersionToWorkingCopy(WED, dayCurVer(WED)); afterSchedMutate() })
  const moved = (r: () => any) => {
    baseReset(); rederive({ live: false })   // the week as loaded: worked out after every command, as on screen
    publish(WED)
    expect(dayPendingItems(WED).length, 'nothing waiting once published').toBe(0)
    press(WED, r(), 'x'); press(WED, r(), 'g')
    const rows = rowsOf(r())
    expect(rows.length, 'its one row on the programme').toBe(1)
    expect(rows[0].rid, 'the row → Ground puts down carries the name the working-out gives a request row').toBe('r' + r().iid)
    expect(dayPendingItems(WED).length, 'the day head: 1 pending').toBe(1)
    expect(filingRestorePlan(WED, (daySnapOf(WED, dayCurVer(WED)) as any).fil).left, 'its filing covers Thursday and Friday too: the plan leaves it').toContain(r().iid)
    return rows[0].rid
  }
  it("the seed's overseas duty: the load takes it back under Unavailable, so it discards 1 edit, not 2", () => {
    moved(od)
    expect(dayDiscardCount(WED), '"Discard 1 edit & load"').toBe(1)
    load()
    expect(rowsOf(od()).length, 'its row went with the load').toBe(0)
    expect([od().acc, od().odGround], 'back under Unavailable by its kind, on all three days').toEqual([undefined, undefined])
    expect(dayPendingItems(WED).length, 'nothing pending: the day is back to the Original').toBe(0)
  })
  it('a three-day course: it lands again, fresh, under the same name — the load throws nothing away', () => {
    const who = Object.keys(PEOPLE).find(id => !PEOPLE[id].special && !PEOPLE[id].archived && !(PEOPLE[id] as any).pers
      && !INPUTS.some((i: any) => ['Jul 15', 'Jul 16', 'Jul 17'].includes(i.date) && (i.person === id || (i.people || []).some((x: any) => x.p === id)))) as string
    expect(writeInputs(() => { INPUTS.unshift({ iid: 'cse3', person: who, type: 'CSE', date: 'Jul 15', endDate: 'Jul 17', yr: 2026, allday: true, remarks: '', mod: '', acc: 'u' }) })).toBe(true)
    const cse = () => INPUTS.find((x: any) => x.iid === 'cse3') as any
    const rid0 = moved(cse)
    expect(dayDiscardCount(WED), 'no "Discard 2 edits": nothing to throw away').toBe(0)
    /* finding nothing to throw away, the load button says the day is already at the Original and why it still reads 1 —
       never "filed since publishing": it was on the day when it went out, and was moved onto the programme since */
    expect(inputsLeftSaid(WED)).toBe(' 1 input moved onto the programme since publishing stays there, pending.')
    load()
    expect(rowsOf(cse()).map((x: any) => x.rid), 'its one row, under the name it had').toEqual([rid0])
    expect(dayPendingItems(WED).length, 'still 1 pending').toBe(1)
    expect(dayDiscardCount(WED), 'and still nothing to throw away').toBe(0)
  })
})
