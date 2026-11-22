// @vitest-environment jsdom
/* FABLE'S READ OF THE INPUTS AREA (22 Nov 26) — the LATE chip.
   F3: an input of several people under Unavailable, on time, to which one man was added after the cut-off: his row wears
       the LATE chip (his own date), and a scheduler's tap on it changes nothing while the note says "LATE mark shown". */
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { commitInput, commitInputEdit, draftOf } from './inputedit'
import { DAYS } from '../engine/data'
import { INPUTS, facesOf, isLateInput } from '../engine/inputs'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { initStore, notify, writeInputs } from '../state/store'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { setSession, setMe } from '../state/auth'
import { setPage, lateShown } from '../state/view'
import { lateChip } from './html'
import { routeClick } from './interactions'

const ADMIN = 'stiff'
let days0: string, inputs0: string
const said: string[] = []
const realToast = HOOKS.toast
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const asAdmin = () => { setSession({ user: ADMIN, role: 'admin' } as any); setMe(ADMIN) }
const crew = () => Object.keys(PEOPLE).filter(id => !PEOPLE[id].archived && !PEOPLE[id].deleted && !PEOPLE[id].special && !PEOPLE[id].san && !PEOPLE[id].pers && id !== ADMIN)
const T0 = new Date('2026-06-01T08:00:00.000Z').getTime()
/* a scheduler's tap on the chip the row draws */
const tap = (html: string) => {
  const host = document.createElement('div'); host.innerHTML = html
  const b = host.querySelector('[data-lateoff]') as HTMLElement
  expect(b, 'the row draws the LATE chip').toBeTruthy()
  document.body.appendChild(b)
  try { routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() }
}

beforeAll(() => { initStore(); asAdmin(); days0 = JSON.stringify(DAYS); inputs0 = JSON.stringify(INPUTS) })
beforeEach(() => {
  DAYS.length = 0; JSON.parse(days0).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  asAdmin(); setPage('editsched')
  _resetTimeline(); installGlobalUndo()
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
})
afterEach(() => { HOOKS.toast = realToast; _resetTimeline(); asAdmin() })

describe('F4 — the input changed late is late for everyone in it', () => {
  afterEach(() => { vi.useRealTimers() })
  it('a man added on time, then the input’s time changed after the cut-off: his row reads LATE as the others’ do', () => {
    const [b, c] = crew()
    vi.useFakeTimers({ toFake: ['Date'] })
    /* filed on time, 1 Jun, for the week of 13 Jul */
    vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0))
    expect(commitInput(null, { person: b, type: 'Meeting', allday: false, start: '2026-07-14', end: '', sTime: '09:00', eTime: '10:00', remarks: 'fbl-f4', title: null }, [b])).toBe(true)
    const iid = (INPUTS.find((r: any) => r.remarks === 'fbl-f4') as any).iid
    /* c put in on 5 Jun in the input's own window — still on time; he gets a date of his own */
    vi.setSystemTime(new Date(2026, 5, 5, 9, 0, 0))
    expect(commitInput(live(iid), draftOf(live(iid)), [b, c])).toBe(true)
    expect(facesOf(live(iid)).some((f: any) => isLateInput(f)), 'nobody is late yet').toBe(false)
    /* 13 Jul, after the cut-off: its hours are changed in its own window */
    vi.setSystemTime(new Date(2026, 6, 13, 9, 0, 0))
    expect(commitInput(live(iid), { ...draftOf(live(iid)), sTime: '13:00', eTime: '14:00' }, [b, c])).toBe(true)
    const face = (p: string) => facesOf(live(iid)).find((f: any) => String(f.person) === String(p))
    expect(isLateInput(live(iid)), 'the input itself reads LATE').toBe(true)
    expect(isLateInput(face(b)), 'and so does the first man’s row').toBe(true)
    expect(isLateInput(face(c)), 'and the row of the man added on 5 Jun — the change was to his input too').toBe(true)
  })
})

describe('the LATE chip', () => {
  it('control: an ordinary late input — a tap drops the mark for everyone, and Undo brings it back', () => {
    const r: any = { iid: 'fbl-l0', type: 'Other', acc: 'u', date: 'Jul 14', yr: 2026, allday: true, s: 0, e: 1439, remarks: 'x', mod: '2026-07-13', by: ADMIN, at: T0, people: [{ p: crew()[0], by: ADMIN, at: T0 }] }
    expect(writeInputs(() => { INPUTS.push(r) })).toBe(true); notify()
    expect(isLateInput(live('fbl-l0'))).toBe(true)
    tap(lateChip(facesOf(live('fbl-l0'))[0]))
    expect(live('fbl-l0').lateOff, 'dropped').toBe(true)
    globalUndo(); notify()
    expect(live('fbl-l0').lateOff, 'Undo puts the mark back').toBeUndefined()
  })
  it('control: a member’s own change takes the drop off (D1620), and HIS Undo puts back his words and the drop', () => {
    const m = 'bane'
    const r: any = { iid: 'fbl-l2', type: 'Meeting', date: 'Jul 14', yr: 2026, allday: false, s: 600, e: 660, remarks: 'was', mod: '2026-07-12', by: m, at: T0, lateOff: true, people: [{ p: m, by: m, at: T0 }] }
    expect(writeInputs(() => { INPUTS.push(r) })).toBe(true); notify()
    _resetTimeline(); installGlobalUndo()
    setSession({ user: m, role: 'main' } as any); setMe(m)
    expect(commitInputEdit(live('fbl-l2'), { ...draftOf(live('fbl-l2')), remarks: 'now' })).toBe(true)
    expect(live('fbl-l2').lateOff, 'his change takes the drop off').toBeUndefined()
    expect(isLateInput(live('fbl-l2')) && lateShown(live('fbl-l2')), 'LATE shows again').toBe(true)
    globalUndo(); notify()
    expect(live('fbl-l2').remarks, 'his Undo puts his words back').toBe('was')
    expect(live('fbl-l2').lateOff, 'and the scheduler’s drop with them').toBe(true)
  })
  it('F3: a man added late to an on-time shared input under Unavailable — the tap on his LATE chip drops it', () => {
    const [b, c] = crew()
    /* filed on time for b (1 Jun); c put in on 13 Jul, after the cut-off for the week of 13 Jul — his own date (commitInput) */
    const r: any = { iid: 'fbl-l1', type: 'Other', acc: 'u', date: 'Jul 14', yr: 2026, allday: true, s: 0, e: 1439, remarks: 'det', mod: '2026-06-01', by: ADMIN, at: T0,
      people: [{ p: b, by: ADMIN, at: T0 }, { p: c, by: ADMIN, at: T0 + 1, mod: '2026-07-13' }] }
    expect(writeInputs(() => { INPUTS.push(r) })).toBe(true); notify()
    const face = facesOf(live('fbl-l1')).find((f: any) => String(f.person) === String(c))
    expect(isLateInput(face), 'his row reads LATE by his own date').toBe(true)
    expect(isLateInput(facesOf(live('fbl-l1'))[0]), 'the first man’s row does not').toBe(false)
    const chip = lateChip(face)
    expect(chip, 'his row draws the chip, lit').toContain('aria-pressed="false"')
    tap(chip)
    const after = facesOf(live('fbl-l1')).find((f: any) => String(f.person) === String(c))
    expect(lateShown(after), `the mark is dropped (the note said: ${said.join(' | ') || 'nothing'})`).toBe(false)
  })
})
