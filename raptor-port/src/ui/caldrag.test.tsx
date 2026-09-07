// @vitest-environment jsdom
/* caldrag.ts — the Inputs month calendar's chip-drag machine and its commit.

   commitChipMove is pure decision logic (no DOM), so most of this file drives
   it directly with hand-built entries/dates — that is where the delta math,
   the gates and the toasts actually live, and where a regression would be
   silent otherwise. The gesture machine itself gets lighter coverage: a bare
   DOM (two `[data-icday]` cells and a chip), because jsdom has no layout and
   proving the STATE transitions (armed/not, tap-vs-drag, teardown) is what
   matters here — pixel placement is a geometry question for e2e. */
import { beforeAll, beforeEach, afterEach, describe, expect, it } from 'vitest'
import { initStore, setSession, undo, writeInputs, histInit } from '../state/store'
import { setMe } from '../state/auth'
import { INPUTS, inpId } from '../engine/inputs'
import { PLANPUCKS, addPlanPuck, addPuckRow, togglePuckPerson } from '../state/plan'
import { HOOKS } from '../engine/hooks'
import { commitChipMove, initCalDrag } from './caldrag'
import { markLand, pendingLand } from './lift'

/* jsdom 30 (this repo's version, verified directly) constructs a full
   PointerEvent — clientX/clientY, pointerId, pointerType and isPrimary all
   round-trip. The fallback below is kept anyway for an older/other jsdom: a
   plain MouseEvent with the four pointer-only fields patched on via
   defineProperty, since the machine only ever READS those four off the event
   and cannot tell the difference. */
const HAS_POINTER_EVENT = typeof (globalThis as any).PointerEvent === 'function'
function ptr(type: string, x: number, y: number, opts: { id?: number, kind?: string, primary?: boolean } = {}): Event {
  const { id = 1, kind = 'mouse', primary = true } = opts
  if (HAS_POINTER_EVENT) {
    return new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: id, pointerType: kind, isPrimary: primary })
  }
  const e: any = new MouseEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y })
  Object.defineProperty(e, 'pointerId', { value: id })
  Object.defineProperty(e, 'pointerType', { value: kind })
  Object.defineProperty(e, 'isPrimary', { value: primary })
  return e
}

/* jsdom ships no layout engine at all — document.elementFromPoint is not
   even defined, so every armed move/drop has to be told what is "under the
   pointer" by hand. This stub is swapped per test; EFP_TARGET null means
   "nothing there", matching a drop off any cell. */
let EFP_TARGET: Element | null = null
beforeAll(() => { (document as any).elementFromPoint = () => EFP_TARGET })

const ISNAP = JSON.stringify(INPUTS)
let said: [string, string?][] = []
const realToast = HOOKS.toast

beforeAll(() => { initStore() })

beforeEach(() => {
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((i: any) => INPUTS.push(i))
  PLANPUCKS.length = 0
  setSession({ user: 'a', role: 'admin' } as any)
  setMe('bane')
  said = []
  HOOKS.toast = ((m: any, k?: any) => { said.push([String(m), k]) }) as any
  /* rebase the undo stack on this test's own starting state — otherwise a
     later test's undo() would walk back into an earlier test's history */
  histInit()
  document.body.innerHTML = ''
  EFP_TARGET = null
})
afterEach(() => { HOOKS.toast = realToast })

const said_ = () => said.map(s => s[0])

describe('commitChipMove — puck moves', () => {
  it('moves a plan puck and toasts "Note moved"; undo restores its old date', () => {
    let added = false
    writeInputs(() => { added = addPlanPuck('2026-07-10', 'Check quals') })
    expect(added).toBe(true)
    const pid = PLANPUCKS[0].id

    const ok = commitChipMove({ kind: 'puck', pid }, '2026-07-10', '2026-07-12')
    expect(ok).toBe(true)
    expect(PLANPUCKS.find(p => p.id === pid)?.date).toBe('2026-07-12')
    expect(said_()).toContain('Note moved')

    undo()
    expect(PLANPUCKS.find(p => p.id === pid)?.date).toBe('2026-07-10')
  })

  it('a pucks-row section moves the same way and says what it is', () => {
    writeInputs(() => { addPuckRow('2026-07-10') })
    const sec = PLANPUCKS.find((p: any) => p.kind === 'pucks')!
    writeInputs(() => { togglePuckPerson(sec.id, 'bane') })

    const ok = commitChipMove({ kind: 'puck', pid: sec.id }, '2026-07-10', '2026-07-12')
    expect(ok).toBe(true)
    expect(sec.date).toBe('2026-07-12')
    expect(sec.ids, 'its people ride the move').toEqual(['bane'])
    expect(said_()).toContain('Pucks row moved')
  })

  it('a non-scheduler is refused with the planning-section toast, and nothing moves', () => {
    writeInputs(() => { addPlanPuck('2026-07-10', 'Check quals') })
    const pid = PLANPUCKS[0].id
    setSession({ user: 'user', role: 'main' } as any)

    const ok = commitChipMove({ kind: 'puck', pid }, '2026-07-10', '2026-07-12')
    expect(ok).toBe(false)
    expect(PLANPUCKS.find(p => p.id === pid)?.date).toBe('2026-07-10')
    expect(said_()).toContain('Only a scheduler can move planning sections')
  })
})

describe('commitChipMove — inputs', () => {
  it('slides a multi-day span by the drag distance, grabbed from a MIDDLE day (not its start)', () => {
    // grabbed on the 16th (day 2 of a 15-17 span), dropped on the 20th: a
    // +4-day drag, applied to BOTH ends so the span's own length survives
    const row: any = { person: 'bane', date: 'Jul 15', endDate: 'Jul 17', allday: true, type: 'LL', remarks: '', mod: 'now' }
    inpId(row)
    INPUTS.unshift(row)

    const ok = commitChipMove({ kind: 'input', iid: row.iid }, '2026-07-16', '2026-07-20')
    expect(ok).toBe(true)
    expect(row.date).toBe('Jul 19')
    expect(row.endDate).toBe('Jul 21')
    expect(said_()).toContain('Moved to 19 Jul')
  })

  it('rolls the year forward, and the labels pick up the trailing year (baseYear 2026)', () => {
    const row: any = { person: 'bane', date: 'Dec 30', endDate: 'Dec 31', allday: true, type: 'LL', remarks: '', mod: 'now' }
    inpId(row)
    INPUTS.unshift(row)

    const ok = commitChipMove({ kind: 'input', iid: row.iid }, '2026-12-30', '2027-01-04')
    expect(ok).toBe(true)
    expect(row.date).toBe('Jan 4 2027')
    expect(row.endDate).toBe('Jan 5 2027')
  })

  it('a drop back on the cell it was grabbed from is a no-op — false, untouched, silent', () => {
    const before = JSON.stringify(INPUTS)
    const ok = commitChipMove({ kind: 'input', iid: INPUTS[0]?.iid || 'x' }, '2026-07-16', '2026-07-16')
    expect(ok).toBe(false)
    expect(JSON.stringify(INPUTS)).toBe(before)
    expect(said.length).toBe(0)
  })

  it('an input deleted mid-gesture is refused silently — false, no toast', () => {
    const ok = commitChipMove({ kind: 'input', iid: 'no-such-iid' }, '2026-07-01', '2026-07-05')
    expect(ok).toBe(false)
    expect(said.length).toBe(0)
  })

  it('a span with no end date stays end-less after the move', () => {
    const row: any = { person: 'bane', date: 'Jul 5', allday: true, type: 'LL', remarks: '', mod: 'now' }
    inpId(row)
    INPUTS.unshift(row)

    const ok = commitChipMove({ kind: 'input', iid: row.iid }, '2026-07-05', '2026-07-08')
    expect(ok).toBe(true)
    expect(row.date).toBe('Jul 8')
    expect(row.endDate).toBeUndefined()
  })

  describe('page-rights parity (a member moves their own inputs, not anyone else\'s)', () => {
    beforeEach(() => { setSession({ user: 'user', role: 'main' } as any) })

    it('refuses to move someone else\'s input', () => {
      const row: any = { person: 'stiff', date: 'Jul 20', allday: true, type: 'LL', remarks: '', mod: 'now' }
      inpId(row)
      INPUTS.unshift(row)

      const ok = commitChipMove({ kind: 'input', iid: row.iid }, '2026-07-20', '2026-07-25')
      expect(ok).toBe(false)
      expect(row.date).toBe('Jul 20')
      expect(said_()).toContain("Only a scheduler can move someone else's input")
    })

    it('moves their OWN input (person === ME) without a scheduler', () => {
      const row: any = { person: 'bane', date: 'Jul 20', allday: true, type: 'LL', remarks: '', mod: 'now' }
      inpId(row)
      INPUTS.unshift(row)

      const ok = commitChipMove({ kind: 'input', iid: row.iid }, '2026-07-20', '2026-07-25')
      expect(ok).toBe(true)
      expect(row.date).toBe('Jul 25')
    })
  })
})

/* ---------------------------------------------------------------------------
   THE GESTURE MACHINE — lighter coverage over a bare DOM, no App mounted.
   --------------------------------------------------------------------------- */
function buildCalDom(rowIid: string) {
  document.body.innerHTML = `
    <div id="root">
      <div class="ic-day" data-icday="2026-07-20"><div class="ic-chip" data-icdrag data-iid="${rowIid}">chip</div></div>
      <div class="ic-day" data-icday="2026-07-21">B</div>
    </div>
  `
  const root = document.getElementById('root')!
  const cellA = root.children[0] as HTMLElement
  const cellB = root.children[1] as HTMLElement
  const chip = cellA.querySelector('[data-icdrag]') as HTMLElement
  return { root, cellA, cellB, chip }
}

describe('initCalDrag — the pointer machine', () => {
  it('a plain tap (no meaningful movement) calls onTap and arms nothing', () => {
    const { root, chip } = buildCalDom('tap-row')
    let tapped: any = null
    const off = initCalDrag(root, { onTap: (e: any) => { tapped = e } })
    try {
      chip.dispatchEvent(ptr('pointerdown', 10, 10))
      chip.dispatchEvent(ptr('pointerup', 10, 10))
      expect(tapped).toBeTruthy()
      expect(tapped.kind).toBe('input')
      expect(tapped.iid).toBe('tap-row')
      expect(document.body.classList.contains('ic-dragging')).toBe(false)
    } finally { off() }
  })

  it('a mouse drag past MOUSE_SLOP arms, and dropping on another cell moves the chip', () => {
    const row: any = { person: 'bane', date: 'Jul 20', allday: true, type: 'LL', remarks: '', mod: 'now' }
    inpId(row)
    INPUTS.unshift(row)
    const { root, cellB, chip } = buildCalDom(row.iid)
    EFP_TARGET = cellB
    const off = initCalDrag(root, { onTap: () => {} })
    try {
      chip.dispatchEvent(ptr('pointerdown', 10, 10))
      expect(document.body.classList.contains('ic-dragging')).toBe(false) // not armed yet — movement is still under MOUSE_SLOP
      chip.dispatchEvent(ptr('pointermove', 20, 10)) // 10px > MOUSE_SLOP (4)
      expect(document.body.classList.contains('ic-dragging')).toBe(true)
      expect(document.querySelector('.ic-ghost')).toBeTruthy()
      expect(cellB.classList.contains('ic-over')).toBe(true) // elementFromPoint stubbed to cellB throughout
      chip.dispatchEvent(ptr('pointerup', 20, 10))
      expect(row.date).toBe('Jul 21') // '2026-07-20' -> '2026-07-21' is a +1 day delta
      expect(document.body.classList.contains('ic-dragging')).toBe(false)
      expect(document.querySelector('.ic-ghost')).toBeFalsy()
      expect(cellB.classList.contains('ic-over')).toBe(false)
    } finally { off() }
  })

  /* ONE LIFT, EVERY DRAG (owner, 6 Sep 26 — "the thing u are grabbing glows
     evenly … once I drop the item, it should flash to show where the new item
     ended up"). The chip's ghost is one element, so it wears the shared `.lift`
     class directly. The landing is deferred through lift.ts's mark: a real move
     rewrites the whole month, so the address of the chip IN ITS NEW DAY is
     marked before the write and InputsCal's own paintLand() pass flashes it.
     A drop back on the day it came from is still a landing — nothing is written
     and nothing re-renders, so that one flashes the chip where it stands. */
  const chipGhost = () => document.querySelector('.ic-ghost') as HTMLElement | null
  const armDrag = (chip: HTMLElement) => {
    chip.dispatchEvent(ptr('pointerdown', 10, 10))
    chip.dispatchEvent(ptr('pointermove', 20, 10))     // > MOUSE_SLOP
  }

  it('the ghost wears the shared lift', () => {
    const { root, chip } = buildCalDom('ghost-row')
    const off = initCalDrag(root, { onTap: () => {} })
    try {
      armDrag(chip)
      expect(chipGhost(), 'the ghost is up').toBeTruthy()
      expect(chipGhost()!.classList.contains('lift'), 'and wears the one recipe').toBe(true)
      chip.dispatchEvent(ptr('pointercancel', 20, 10))
    } finally { off() }
  })

  /* the ghost is a COPY of the chip, so a chip re-grabbed inside its own 600ms
     landing flash handed `lift-land` to a clone with no timer to end it */
  it('a chip re-grabbed inside its own landing flash does not hand it to the ghost', () => {
    const { root, chip } = buildCalDom('regrab-row')
    chip.classList.add('lift-land')
    const off = initCalDrag(root, { onTap: () => {} })
    try {
      armDrag(chip)
      expect(chipGhost()!.classList.contains('lift')).toBe(true)
      expect(chipGhost()!.classList.contains('lift-land'), 'not also landing').toBe(false)
      chip.dispatchEvent(ptr('pointercancel', 20, 10))
    } finally { off() }
  })

  it('a move to another day marks the chip in the day it landed in', () => {
    markLand('')
    const row: any = { person: 'bane', date: 'Jul 20', allday: true, type: 'LL', remarks: '', mod: 'now' }
    inpId(row)
    INPUTS.unshift(row)
    const { root, cellB, chip } = buildCalDom(row.iid)
    EFP_TARGET = cellB
    const off = initCalDrag(root, { onTap: () => {} })
    try {
      armDrag(chip)
      chip.dispatchEvent(ptr('pointerup', 20, 10))
      expect(row.date, 'sanity: it moved').toBe('Jul 21')
      expect(pendingLand()!.sel).toBe(`[data-icday="2026-07-21"] [data-iid="${row.iid}"]`)
    } finally { off() }
  })

  /* a planning section carries its own id, not an input's — the calendar draws
     it as [data-pid] (InputsCal's `.ic-pks` / `.ic-chip.plan`) */
  it('a plan puck is marked by its own id', () => {
    markLand('')
    let added = false
    writeInputs(() => { added = addPlanPuck('2026-07-20', 'Check quals') })
    expect(added).toBe(true)
    const pid = PLANPUCKS[0].id
    document.body.innerHTML = `
      <div id="root">
        <div class="ic-day" data-icday="2026-07-20"><div class="ic-chip plan" data-icdrag data-pid="${pid}">note</div></div>
        <div class="ic-day" data-icday="2026-07-21">B</div>
      </div>`
    const root = document.getElementById('root')!
    const chip = root.querySelector('[data-icdrag]') as HTMLElement
    EFP_TARGET = root.children[1] as HTMLElement
    const off = initCalDrag(root, { onTap: () => {} })
    try {
      armDrag(chip)
      chip.dispatchEvent(ptr('pointerup', 20, 10))
      expect(PLANPUCKS[0].date, 'sanity: it moved').toBe('2026-07-21')
      expect(pendingLand()!.sel).toBe(`[data-icday="2026-07-21"] [data-pid="${pid}"]`)
    } finally { off() }
  })

  it('dropped back on the day it came from, the chip flashes where it stands — nothing is marked', () => {
    markLand('')
    const row: any = { person: 'bane', date: 'Jul 20', allday: true, type: 'LL', remarks: '', mod: 'now' }
    inpId(row)
    INPUTS.unshift(row)
    const { root, cellA, chip } = buildCalDom(row.iid)
    EFP_TARGET = cellA
    const off = initCalDrag(root, { onTap: () => {} })
    try {
      armDrag(chip)
      chip.dispatchEvent(ptr('pointerup', 20, 10))
      expect(row.date, 'nothing moved').toBe('Jul 20')
      expect(chip.classList.contains('lift-land'), 'the chip flashed in place').toBe(true)
      expect(pendingLand(), 'and no address was marked — nothing rebuilds').toBeNull()
    } finally { off() }
  })

  it('let go over no day at all, nothing flashes and nothing is marked', () => {
    markLand('')
    const row: any = { person: 'bane', date: 'Jul 20', allday: true, type: 'LL', remarks: '', mod: 'now' }
    inpId(row)
    INPUTS.unshift(row)
    const { root, chip } = buildCalDom(row.iid)
    EFP_TARGET = null
    const off = initCalDrag(root, { onTap: () => {} })
    try {
      armDrag(chip)
      chip.dispatchEvent(ptr('pointerup', 20, 10))
      expect(row.date).toBe('Jul 20')
      expect(chip.classList.contains('lift-land')).toBe(false)
      expect(pendingLand()).toBeNull()
    } finally { off() }
  })

  it('a cancelled drag shows nothing either', () => {
    markLand('')
    const { root, cellB, chip } = buildCalDom('cancel-row')
    EFP_TARGET = cellB
    const off = initCalDrag(root, { onTap: () => {} })
    try {
      armDrag(chip)
      chip.dispatchEvent(ptr('pointercancel', 20, 10))
      expect(chip.classList.contains('lift-land')).toBe(false)
      expect(pendingLand()).toBeNull()
    } finally { off() }
  })

  it('pointercancel tears the drag down with no commit', () => {
    const row: any = { person: 'bane', date: 'Jul 20', allday: true, type: 'LL', remarks: '', mod: 'now' }
    inpId(row)
    INPUTS.unshift(row)
    const { root, cellB, chip } = buildCalDom(row.iid)
    EFP_TARGET = cellB
    const off = initCalDrag(root, { onTap: () => {} })
    try {
      chip.dispatchEvent(ptr('pointerdown', 10, 10))
      chip.dispatchEvent(ptr('pointermove', 20, 10))
      expect(document.body.classList.contains('ic-dragging')).toBe(true)
      chip.dispatchEvent(ptr('pointercancel', 20, 10))
      expect(document.body.classList.contains('ic-dragging')).toBe(false)
      expect(document.querySelector('.ic-ghost')).toBeFalsy()
      expect(row.date).toBe('Jul 20') // untouched — a cancelled gesture commits nothing
    } finally { off() }
  })
})
