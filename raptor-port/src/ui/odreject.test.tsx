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
import { dayOff } from '../engine/avail'
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
  it('his bell says it as a filing: taken out of, and filed under, Unavailable', () => {
    const before = { ...od() }
    const out = { ...before, acc: 'r' }
    expect(noticeParts(before, out, 'pike').map((n: any) => n.k)).toContain('unavoff')
    expect(noticeParts(out, { ...out, acc: 'u' }, 'pike').map((n: any) => n.k)).toContain('unav')
  })
})
