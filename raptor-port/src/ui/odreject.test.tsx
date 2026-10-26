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
import { filingRestorePlan } from '../engine/publish'
import { availableFor } from '../leavewar/sync'
import { PEOPLE } from '../engine/people'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { setPage } from '../state/view'
import { warCounts } from '../leavewar/absences'
import { dayHTML, accCtl } from './html'
import { sbInputsGroupPanel, sbUnavailPanel } from './board-html'
import { common as noticeParts } from '../state/notices'

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
