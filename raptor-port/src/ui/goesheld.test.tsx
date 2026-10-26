// @vitest-environment jsdom
/* ONCE A SCHEDULER HAS MOVED A MEMBER'S INPUT, ONLY A SCHEDULER CHANGES WHERE IT GOES ([LW-OTHER-GOES-TO-LOCK] — his
   D1388, 26 Oct 26, "all as recommended"; the M3 evidence sheet's Q4, pictures
   docs/img/handpass/2026-10-25-lw-m3-build/look/look-q4-*). Written before the build, red first.

   What it pins:
   (1) every door by which a scheduler moves an input — Reject, → Ground, → Unavail on the schedule; removing its row from
       the Ground Programme; the Goes to of his own window on a member's Other — marks it moved by a scheduler, in the same
       one Undo step as the move; filing one for a member is not a move;
   (2) the member's window then shows where it stands and offers no Goes to; a scheduler's keeps both;
   (3) the member's save leaves where it stands alone: a Goes to in a hand-made draft is not applied, and a retype keeps
       it where the scheduler put it — into an Attach (which lands under Unavailable by itself), out of a rejected one, off
       Unavailable into another commitment; a retype into a kind that cannot stand there (a leave on the programme) is
       refused with its reason; putting ALL AVAIL into one held under Unavailable is refused (it would take it off);
   (4) the member's own Goes to, on an input no scheduler has moved, works as before;
   (5) the commit gate refuses a member's command that moves a held input, or sets or clears the mark. */
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { initStore, notify, writeInputs } from '../state/store'
import { globalUndo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import { installGlobalUndo } from '../state/undo-wire'
import { setSession, setMe } from '../state/auth'
import { ownershipViolation } from '../state/perms'
import { setPage } from '../state/view'
import { commitInput, commitInputEdit, draftOf, InputEditor } from './inputedit'
import { accCtl } from './html'
import { routeClick } from './interactions'
import { boardMbtn } from './board'
import { setInpEdit } from './pops'
import { _resetFloatWins } from './FloatWindow'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const MON = 0, ADMIN = 'stiff', MEMBER = 'bane'
let days0: string, inputs0: string
const said: string[] = []
const realToast = HOOKS.toast
const live = (iid: string) => INPUTS.find((r: any) => r.iid === iid) as any
const asAdmin = () => { setSession({ user: ADMIN, role: 'admin' } as any); setMe(ADMIN) }
const asMember = () => { setSession({ user: MEMBER, role: 'main' } as any); setMe(MEMBER) }
let n = 0
/* the member's own Other on the demo week's Monday, filed by him; `over` sets where it stands */
const other = (over: any = {}) => {
  const row = { iid: 'gh' + (++n), person: MEMBER, by: MEMBER, at: '2026-07-01T08:00:00.000Z', type: 'Other', date: 'Jul 13', yr: 2026,
    allday: true, remarks: 'Why', mod: '2026-07-01', ...over }
  expect(writeInputs(() => { INPUTS.push(row) }), 'the fixture is a legal record').toBe(true)
  notify()
  return row.iid
}
/* a scheduler's press of a schedule button (Reject 'x', → Ground 'g', → Unavail 'u') on the input's card */
const press = (iid: string, dest: 'x' | 'g' | 'u') => {
  const host = document.createElement('div'); host.innerHTML = accCtl(MON, live(iid))
  const b = host.querySelector(`[data-acc="${dest}"]`) as HTMLElement
  expect(b, `the "${dest}" button is offered`).toBeTruthy()
  document.body.appendChild(b)
  try { routeClick({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() }
}
const place = (iid: string) => { const r = live(iid); return r.acc === 'u' ? 'u' : r.acc === 'r' ? 'r' : 'g' }

beforeAll(() => {
  initStore()
  asAdmin()
  days0 = JSON.stringify(DAYS)
  inputs0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  DAYS.length = 0; JSON.parse(days0).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(inputs0).forEach((i: any) => INPUTS.push(i))
  asAdmin(); setPage('editsched')
  _resetTimeline(); installGlobalUndo()
  said.length = 0; HOOKS.toast = ((m: any) => { said.push(String(m)) }) as any
})
afterEach(() => { HOOKS.toast = realToast; _resetTimeline(); asAdmin() })

describe('(1) a scheduler\'s move marks it — every door; filing is not a move', () => {
  it('Reject marks it; the mark goes with the move in one Undo', () => {
    const id = other()
    expect(place(id)).toBe('g')
    expect(live(id).schedPlaced, 'filed by its man: not held').toBeFalsy()
    press(id, 'x')
    expect(live(id).acc).toBe('r')
    expect(live(id).schedPlaced, 'Reject: held').toBe(true)
    globalUndo()
    expect(live(id).acc).not.toBe('r')
    expect(live(id).schedPlaced, 'the one Undo takes the mark back too').toBeFalsy()
  })
  it('→ Unavail and → Ground mark it', () => {
    const a = other({ acc: 'r' })
    press(a, 'u')
    expect(live(a)).toMatchObject({ acc: 'u', schedPlaced: true })
    const b = other({ acc: 'r' })
    press(b, 'g')
    expect(place(b)).toBe('g')
    expect(live(b).schedPlaced).toBe(true)
  })
  it('removing its row from the Ground Programme marks it', () => {
    const id = other()
    const ri = DAYS[MON].ground.findIndex((g: any) => g && g.src === inpId(live(id)))
    expect(ri, 'its row stands on Monday').toBeGreaterThanOrEqual(0)
    const b = document.createElement('button'); b.className = 'mbtn'; b.dataset.grdel = `${MON}.${ri}`
    document.body.appendChild(b)
    try { boardMbtn({ target: b, stopPropagation() {}, preventDefault() {} } as any) } finally { b.remove() }
    expect(live(id)).toMatchObject({ acc: 'r', schedPlaced: true })
  })
  it('a scheduler\'s Goes to in his own window, on a member\'s Other, marks it', () => {
    const id = other()
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), goes: 'u' })).toBe(true)
    expect(live(id)).toMatchObject({ acc: 'u', schedPlaced: true })
  })
  it('a scheduler filing an Other for a member, under Unavailable, is not a move: the member may still pick', () => {
    const before = new Set(INPUTS.map((r: any) => r.iid))
    expect(commitInput(null, { person: MEMBER, type: 'Other', allday: true, start: '2026-07-13', end: '', sTime: '06:00', eTime: '18:00', remarks: 'Why', title: null, goes: 'u' }, [MEMBER])).toBe(true)
    const r: any = INPUTS.find((x: any) => !before.has(x.iid))
    expect(r.acc).toBe('u')
    expect(r.schedPlaced).toBeFalsy()
    asMember()
    expect(commitInputEdit(r, { ...draftOf(r), goes: 'g' })).toBe(true)
    expect(live(r.iid).acc).not.toBe('u')
  })
})

describe('(3) the member\'s save leaves where it stands alone', () => {
  it('a Goes to in his draft is not applied to one a scheduler moved under Unavailable', () => {
    const id = other({ acc: 'r' }); press(id, 'u')
    asMember()
    commitInputEdit(live(id), { ...draftOf(live(id)), goes: 'g', remarks: 'Changed' })
    expect(live(id).acc, 'still under Unavailable').toBe('u')
  })
  it('a held one under Unavailable, retyped to a Meeting or an Attach, stays under Unavailable', () => {
    const id = other({ acc: 'r' }); press(id, 'u')
    asMember()
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), type: 'Meeting' })).toBe(true)
    expect(live(id)).toMatchObject({ type: 'Meeting', acc: 'u' })
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), type: 'Attach' })).toBe(true)
    expect(live(id)).toMatchObject({ type: 'Attach', acc: 'u' })
  })
  it('a held rejected one, retyped to an Attach or a Meeting, stays rejected', () => {
    const id = other(); press(id, 'x')
    asMember()
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), type: 'Attach' })).toBe(true)
    expect(live(id)).toMatchObject({ type: 'Attach', acc: 'r' })
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), type: 'Meeting' })).toBe(true)
    expect(live(id)).toMatchObject({ type: 'Meeting', acc: 'r' })
  })
  it('a held one on the Ground Programme, retyped to an Attach, stays on the programme', () => {
    const id = other({ acc: 'r' }); press(id, 'g')
    asMember()
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), type: 'Attach' })).toBe(true)
    expect(live(id).type).toBe('Attach')
    expect(place(id), 'not sent under Unavailable').toBe('g')
  })
  it('a held one on the Ground Programme, retyped to a leave, is refused with its reason; nothing changes', () => {
    const id = other({ acc: 'r' }); press(id, 'g')
    asMember()
    said.length = 0
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), type: 'LL' })).toBe(false)
    expect(live(id).type).toBe('Other')
    expect(said.join(' ')).toMatch(/scheduler/i)
  })
  it('ALL AVAIL put into a held one under Unavailable is refused (it would take it off Unavailable)', () => {
    const id = other({ acc: 'r' }); press(id, 'u')
    asMember()
    expect(commitInput(live(id), { ...draftOf(live(id)) }, [MEMBER, 'allavail'])).toBe(false)
    expect(live(id).acc).toBe('u')
    expect(said.join(' ')).toMatch(/scheduler/i)
  })
  it('a scheduler\'s own window still moves a held one, both ways', () => {
    const id = other({ acc: 'r' }); press(id, 'u')
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), goes: 'g' })).toBe(true)
    expect(live(id).acc).not.toBe('u')
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), goes: 'u' })).toBe(true)
    expect(live(id).acc).toBe('u')
  })
})

describe('(4) on one no scheduler has moved, his own Goes to and retype work as before', () => {
  it('Goes to moves it in and out; a retype off Unavailable lands where the kind lands', () => {
    const id = other()
    asMember()
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), goes: 'u' })).toBe(true)
    expect(live(id).acc).toBe('u')
    expect(live(id).schedPlaced, 'his own pick is not a scheduler\'s move').toBeFalsy()
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), goes: 'g' })).toBe(true)
    expect(live(id).acc).not.toBe('u')
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), goes: 'u' })).toBe(true)
    expect(commitInputEdit(live(id), { ...draftOf(live(id)), type: 'Training' })).toBe(true)
    expect(live(id).acc).not.toBe('u')
  })
})

describe('(5) the commit gate: a member\'s command never moves a held input, nor sets or clears the mark', () => {
  const env = (before: any, after: any) => ({ type: 'inputs.batch', actor: { id: 'us', role: 'member', personId: MEMBER },
    changes: [{ op: 'put', collection: 'inputs', id: 'gx', before, after }] }) as any
  const base = { iid: 'gx', person: MEMBER, by: MEMBER, at: '2026-07-01T08:00:00.000Z', type: 'Other', date: 'Jul 13', yr: 2026, allday: true, remarks: 'Why', mod: '2026-07-01' }
  it('a held one moved off Unavailable, or out of a Reject: refused', () => {
    expect(ownershipViolation(env({ ...base, acc: 'u', schedPlaced: true }, { ...base, schedPlaced: true }))).toBeTruthy()
    expect(ownershipViolation(env({ ...base, acc: 'r', schedPlaced: true }, { ...base, acc: 'u', schedPlaced: true }))).toBeTruthy()
  })
  it('the mark set or cleared by a member: refused', () => {
    expect(ownershipViolation(env({ ...base, acc: 'u', schedPlaced: true }, { ...base, acc: 'u' }))).toBeTruthy()
    expect(ownershipViolation(env({ ...base }, { ...base, schedPlaced: true }))).toBeTruthy()
    expect(ownershipViolation(env(null, { ...base, schedPlaced: true }))).toBeTruthy()
  })
  it('his words changed on a held one, where it stands untouched: allowed; and the programme\'s own mark comes and goes', () => {
    expect(ownershipViolation(env({ ...base, acc: 'u', schedPlaced: true }, { ...base, acc: 'u', schedPlaced: true, remarks: 'New' }))).toBeNull()
    expect(ownershipViolation(env({ ...base, acc: 'g', schedPlaced: true }, { ...base, schedPlaced: true, remarks: 'New' }))).toBeNull()
  })
  it('his own Other, not held, moved by its Goes to: allowed', () => {
    expect(ownershipViolation(env({ ...base }, { ...base, acc: 'u' }))).toBeNull()
  })
})

describe('(2) the window', () => {
  let host: HTMLDivElement, root: Root
  beforeEach(async () => {
    setPage('inputs')
    host = document.createElement('div'); document.body.append(host); root = createRoot(host)
    await act(async () => { root.render(<InputEditor />) })
  })
  afterEach(async () => { await act(async () => { root.unmount(); setInpEdit(null) }); host.remove(); _resetFloatWins() })
  const open = async (iid: string) => act(async () => { setInpEdit(live(iid)); notify() })
  const btn = (k: 'g' | 'u') => document.querySelector(`[data-testid="inpEdit-goes-${k}"]`) as HTMLButtonElement
  const line = () => document.querySelector('[data-testid="inpEdit-goes-line"]')?.textContent || ''
  it('the member\'s window on one a scheduler moved: where it stands, picked; neither button pressable; the line says a scheduler moved it', async () => {
    const id = other({ acc: 'r' }); press(id, 'u')
    await act(async () => { asMember(); notify() })
    await open(id)
    expect(btn('u').getAttribute('aria-pressed')).toBe('true')
    expect(btn('u').disabled && btn('g').disabled, 'no Goes to for him').toBe(true)
    expect(line()).toMatch(/scheduler moved it/i)
    expect(line()).toMatch(/away on the Leave War/i)
  })
  it('a scheduler\'s window on the same keeps both buttons', async () => {
    const id = other({ acc: 'r' }); press(id, 'u')
    await open(id)
    expect(btn('u').disabled || btn('g').disabled).toBe(false)
  })
  it('the member\'s window on his own Other no scheduler moved keeps both', async () => {
    const id = other({ acc: 'u' })
    await act(async () => { asMember(); notify() })
    await open(id)
    expect(btn('u').disabled || btn('g').disabled).toBe(false)
    expect(line()).not.toMatch(/scheduler/i)
  })
})
