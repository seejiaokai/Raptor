// @vitest-environment jsdom
/* caldrag.ts — the Inputs month calendar's chip-drag machine and its commit.

   commitChipMove is pure decision logic (no DOM), so most of this file drives
   it directly with hand-built entries/dates — that is where the delta math,
   the gates and the toasts actually live, and where a regression would be
   silent otherwise. The gesture machine itself gets lighter coverage: a bare
   DOM (two `[data-icday]` cells and a chip), because jsdom has no layout and
   proving the STATE transitions (armed/not, tap-vs-drag, teardown) is what
   matters here — pixel placement is a geometry question for e2e. */
import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { initStore, setSession, undo, writeInputs, histInit } from '../state/store'
import { setMe } from '../state/auth'
import { INPUTS, inpId, mintInpIds , remarksShown } from '../engine/inputs'
import { PLANPUCKS, addPlanPuck } from '../state/plan'
import { PEOPLE } from '../engine/people'
import { HOOKS } from '../engine/hooks'
import { commitChipMove, initCalDrag } from './caldrag'
import { TURN_AGAIN, TURN_HOLD } from './edgescroll'
import { markLand, pendingLand } from './lift'
import { stashClear, stashPut } from '../engine/weekstash'
import { weekBundle } from '../engine/weeks-data'
import { OILASK, setOilAsk } from './pops'
import { OILWAIT, OILBAR, setOilWait, setOilBar } from '../state/view'
import { answerOilWait, leaveOilWait } from './oilwait'

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
  /* stamp the reloaded inputs' ids BEFORE the baseline (histInit below), as the app's
     boot does: otherwise the first command stamps everyone's and — since [ACCOUNTS] —
     a member's command that changed other people's inputs is rolled back */
  mintInpIds()
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

  /* one kind of section since D684 (9 Oct 26): a note of people and no words is a note, and says so */
  it('a note of people and no words moves the same way, its people with it', () => {
    writeInputs(() => { addPlanPuck('2026-07-10', '', ['bane']) })
    const sec = PLANPUCKS.find((p: any) => p.date === '2026-07-10' && !p.text)!

    const ok = commitChipMove({ kind: 'puck', pid: sec.id }, '2026-07-10', '2026-07-12')
    expect(ok).toBe(true)
    expect(sec.date).toBe('2026-07-12')
    expect(sec.ids, 'its people ride the move').toEqual(['bane'])
    expect(said_()).toContain('Note moved')
  })

  /* ASTRA'S READ (the day-window check, 9 Oct 26). D299: a delete takes a man out of today and the future; the past keeps
     its record of him. A note from BEFORE his delete, dragged to a day on or after it, carried him onto that day. */
  it('a note holding a deleted man cannot be moved to a day on or after his delete; before it, it moves freely', () => {
    writeInputs(() => { addPlanPuck('2026-07-08', 'Past briefing', ['bane', 'yeti']) })
    const sec = PLANPUCKS.find((p: any) => p.text === 'Past briefing')!
    const was = { ...PEOPLE.bane }
    try {
      Object.assign(PEOPLE.bane, { deleted: true, deletedFrom: '2026-07-10', archived: true })
      expect(commitChipMove({ kind: 'puck', pid: sec.id }, '2026-07-08', '2026-07-10'), 'onto the day he was deleted from').toBe(false)
      expect(commitChipMove({ kind: 'puck', pid: sec.id }, '2026-07-08', '2026-07-14'), 'or any day after').toBe(false)
      expect(sec.date).toBe('2026-07-08'); expect(sec.ids).toEqual(['bane', 'yeti']); expect(sec.text).toBe('Past briefing')
      expect(said_().join(' | '), 'and it says who, and what to do').toMatch(new RegExp(`${PEOPLE.bane.cs}.*take him off the note`))
      expect(commitChipMove({ kind: 'puck', pid: sec.id }, '2026-07-08', '2026-07-09'), 'a day before his delete is still the past').toBe(true)
      expect(sec.date).toBe('2026-07-09'); expect(sec.ids).toEqual(['bane', 'yeti'])
    } finally { for (const k of Object.keys(PEOPLE.bane)) delete (PEOPLE.bane as any)[k]; Object.assign(PEOPLE.bane, was) }
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

  /* THE REMARK'S DATE TOKEN FOLLOWS A DRAG (the absence-record re-test's final code reads — Fable F1, Astra 3, 26 Sep
     26): the form and the edit window write "till <last day>" into the remark as the dates are picked, and every other
     date-moving door rewrites it (D189; AB3's cut) — the drag carried the old one, so a leave moved to 19–21 Jul still
     said "till 17 Jul" on the Inputs page, the week, the board, the print and the export. */
  it('a drag rewrites the remark’s "till" / "on", keeps the rest of the words, and leaves a remark with none alone', () => {
    const a: any = { person: 'bane', date: 'Jul 15', endDate: 'Jul 17', allday: true, type: 'LL', remarks: 'Bali till 17 Jul', mod: 'now' }
    const b: any = { person: 'bane', date: 'Jul 6', allday: true, type: 'LL', remarks: 'on 6 Jul', mod: 'now' }
    const c: any = { person: 'bane', date: 'Jul 1', allday: true, type: 'OL', remarks: 'Bali', mod: 'now' }
    for (const r of [a, b, c]) { inpId(r); INPUTS.unshift(r) }
    expect(commitChipMove({ kind: 'input', iid: a.iid }, '2026-07-15', '2026-07-19')).toBe(true)
    /* since D948 the words are kept and the date printed from the moved dates — a saved date in the remark is dropped */
    expect([a.remarks, remarksShown(a)]).toEqual(['Bali', 'Bali till 21 Jul'])
    expect(commitChipMove({ kind: 'input', iid: b.iid }, '2026-07-06', '2026-07-08')).toBe(true)
    expect([b.remarks, remarksShown(b)], 'the war’s one-day "on 6 Jul" was its own date').toEqual(['', 'till 8 Jul'])
    expect(commitChipMove({ kind: 'input', iid: c.iid }, '2026-07-01', '2026-07-02')).toBe(true)
    expect([c.remarks, remarksShown(c)]).toEqual(['Bali', 'Bali till 2 Jul'])
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

  /* [OIL-ASK-NOTIFY] — the break tests of 13 Oct 26 found this wire bare: a move that WAITS on its OIL question lands
     nothing, and the landing flash is made when the answer comes and the move is made (ui/oilwait.ts oilWaitThen). */
  it('a move that waits on its OIL question marks no landing — the chip is marked in the day it lands in when the answer comes', () => {
    markLand('')
    const row: any = { person: 'bane', date: 'Jul 18', allday: true, type: 'Duty', remarks: '', mod: 'now', yr: 2026, oil: { '2026-07-18': 1 } }
    inpId(row)
    INPUTS.unshift(row)
    const { root, cellA, cellB, chip } = buildCalDom(row.iid)
    cellA.setAttribute('data-icday', '2026-07-18'); cellB.setAttribute('data-icday', '2026-07-19')
    EFP_TARGET = cellB
    const live = () => INPUTS.find((x: any) => x.iid === row.iid) as any
    const off = initCalDrag(root, { onTap: () => {} })
    try {
      armDrag(chip)
      chip.dispatchEvent(ptr('pointerup', 20, 10))
      expect(live().date, 'not moved yet').toBe('Jul 18')
      expect(OILWAIT && OILWAIT.kind, 'the question waits').toBe('move')
      expect(pendingLand(), 'and nothing has landed').toBeNull()
      expect(answerOilWait({ '2026-07-19': 1 })).toBe(true)
      expect(live().date).toBe('Jul 19')
      expect(pendingLand()!.sel, 'the landing flash, now').toBe(`[data-icday="2026-07-19"] [data-iid="${row.iid}"]`)
    } finally { off(); setOilWait(null); setOilBar(null); markLand('') }
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

  /* CARRIED TO THE MONTH'S SIDE (owner D897, D898): a lifted chip held at the month's side turns the month that way —
     the right to the next, again while held — and a mouse that leaves the month, or a release, stops it. The month is
     the root, 350 px wide; jsdom lays nothing out, so its rect is lent to it and the clock is faked. */
  describe('carried to the month\'s side', () => {
    const lendRect = (root: HTMLElement) => {
      root.getBoundingClientRect = () => ({ top: 0, bottom: 300, left: 0, right: 350, width: 350, height: 300, x: 0, y: 0, toJSON() {} }) as DOMRect
    }
    afterEach(() => { vi.useRealTimers() })

    it('held at the right side, the month turns forward — again while held — and a release stops it', () => {
      vi.useFakeTimers()
      const { root, chip } = buildCalDom('side-row'); lendRect(root)
      const turns: number[] = []
      const off = initCalDrag(root, { onTap: () => {}, onTurn: d => turns.push(d) })
      try {
        armDrag(chip)
        chip.dispatchEvent(ptr('pointermove', 345, 100))
        vi.advanceTimersByTime(TURN_HOLD)
        expect(turns).toEqual([1])
        vi.advanceTimersByTime(TURN_AGAIN)
        expect(turns).toEqual([1, 1])
        chip.dispatchEvent(ptr('pointercancel', 345, 100))
        vi.advanceTimersByTime(TURN_AGAIN * 3)
        expect(turns).toEqual([1, 1])
      } finally { off() }
    })

    it('a mouse that leaves the month while lifted stops the turns', () => {
      vi.useFakeTimers()
      const { root, chip } = buildCalDom('leave-row'); lendRect(root)
      const turns: number[] = []
      const off = initCalDrag(root, { onTap: () => {}, onTurn: d => turns.push(d) })
      try {
        armDrag(chip)
        chip.dispatchEvent(ptr('pointermove', 345, 100))
        vi.advanceTimersByTime(TURN_HOLD)
        root.dispatchEvent(ptr('pointerleave', 360, 100))
        vi.advanceTimersByTime(TURN_AGAIN * 3)
        expect(turns).toEqual([1])
        chip.dispatchEvent(ptr('pointercancel', 360, 100))
      } finally { off() }
    })

    /* SAFARI (§7.9): after the month turned the chip away, the finger's release goes to the chip, out of the page —
       it must still end the gesture (the ghost down, the turns stopped), never leave the drag hanging */
    it('Safari: a release sent to the chip after the month drew it away still ends the drag', () => {
      vi.useFakeTimers()
      const { root, chip } = buildCalDom('safari-row'); lendRect(root)
      const turns: number[] = []
      const off = initCalDrag(root, { onTap: () => {}, onTurn: d => { turns.push(d); chip.remove() } })
      try {
        chip.dispatchEvent(ptr('pointerdown', 10, 10, { kind: 'touch' }))
        vi.advanceTimersByTime(200)                              // the chip's hold (180 ms): lifted
        expect(document.body.classList.contains('ic-dragging')).toBe(true)
        chip.dispatchEvent(ptr('pointermove', 345, 100, { kind: 'touch' }))
        vi.advanceTimersByTime(TURN_HOLD)
        expect(turns).toEqual([1]); expect(chip.isConnected).toBe(false)
        chip.dispatchEvent(ptr('pointerup', 345, 100, { kind: 'touch' }))
        expect(document.body.classList.contains('ic-dragging'), 'the drag has ended').toBe(false)
        expect(document.querySelector('.ic-ghost')).toBeFalsy()
        vi.advanceTimersByTime(TURN_AGAIN * 3)
        expect(turns).toEqual([1])
      } finally { off() }
    })

    /* the night's code read, F4: a mouse has no capture — a release off the month reached nothing, the chip stayed lifted
       under a free mouse and the side turned the month by itself */
    it('a mouse let go OFF the month ends the drag, moves nothing, and nothing turns after', () => {
      vi.useFakeTimers()
      const row: any = { person: 'bane', date: 'Jul 20', allday: true, type: 'LL', remarks: '', mod: 'now' }
      inpId(row); INPUTS.unshift(row)
      const { root, chip } = buildCalDom(row.iid); lendRect(root)
      const turns: number[] = []
      const off = initCalDrag(root, { onTap: () => {}, onTurn: d => turns.push(d) })
      try {
        armDrag(chip)
        expect(document.body.classList.contains('ic-dragging')).toBe(true)
        EFP_TARGET = null                                          // nothing of the month under the pointer
        window.dispatchEvent(ptr('pointerup', 175, -40))           // let go above the month: only the window hears it
        expect(document.body.classList.contains('ic-dragging'), 'the drag has ended').toBe(false)
        expect(row.date).toBe('Jul 20')
        root.dispatchEvent(ptr('pointermove', 345, 100))           // back over the month's side, no button held
        vi.advanceTimersByTime(TURN_HOLD * 3)
        expect(turns).toEqual([])
      } finally { off() }
    })

    /* his find on his iPhone (15 Oct 26): Safari cancels the gone chip's pointer after a turn — set aside; the finger's
       touch events carry the drag on and end it */
    it('Safari: after a turn the gone chip\'s pointer cancel is set aside, and its touch end ends the drag', () => {
      vi.useFakeTimers()
      const { root, chip } = buildCalDom('safari2-row'); lendRect(root)
      const turns: number[] = []
      const off = initCalDrag(root, { onTap: () => {}, onTurn: d => { turns.push(d); chip.remove() } })
      try {
        chip.dispatchEvent(ptr('pointerdown', 10, 10, { kind: 'touch' }))
        vi.advanceTimersByTime(200)
        chip.dispatchEvent(ptr('pointermove', 345, 100, { kind: 'touch' }))
        vi.advanceTimersByTime(TURN_HOLD)
        expect(turns).toEqual([1])
        chip.dispatchEvent(ptr('pointercancel', 345, 100, { kind: 'touch' }))
        expect(document.body.classList.contains('ic-dragging'), 'still lifted').toBe(true)
        const end = new Event('touchend', { bubbles: true }); Object.defineProperty(end, 'changedTouches', { value: [{ clientX: 175, clientY: 100 }] })
        chip.dispatchEvent(end)
        expect(document.body.classList.contains('ic-dragging'), 'the touch end ended it').toBe(false)
      } finally { off() }
    })

    it('a chip that does not lift never turns the month', () => {
      vi.useFakeTimers()
      const { root, chip } = buildCalDom('nolift-row'); lendRect(root)
      const turns: number[] = []
      const off = initCalDrag(root, { onTap: () => {}, onTurn: d => turns.push(d) })
      try {
        chip.dispatchEvent(ptr('pointerdown', 345, 100))
        vi.advanceTimersByTime(TURN_HOLD * 3)
        chip.dispatchEvent(ptr('pointerup', 345, 100))
        expect(turns).toEqual([])
      } finally { off() }
    })
  })
})

/* CODEX RANK 5 (22 Sep 26) — the calendar drag is a THIRD door onto job 1's
   bug. It goes straight to commitInputEdit, so nothing raises the OIL question
   when the move leaves a covered day unanswered: a Saturday answered Yes,
   dragged to the Sunday, keeps the Saturday answer (which the row no longer
   covers, so it is inert) and arrives on a Sunday nobody has answered for. The
   day pays nothing until somebody notices the member's bell. The drag-reassign
   door was closed this way; this one was not. */
describe('the calendar drag raises the OIL question when the move leaves a day unanswered', () => {
  const answered = () => {
    const row: any = { person: 'bane', date: 'Jul 18', allday: true, type: 'Duty', remarks: '', mod: 'now', yr: 2026, oil: { '2026-07-18': 1 } }
    inpId(row); INPUTS.unshift(row); return row
  }

  afterEach(() => { setOilAsk(null); setOilWait(null); setOilBar(null) })

  /* A NAMED RULING CHANGED THIS CASE (owner D780 — "…holds at every door"; D783, 12 Oct 26: a change that raises the OIL
     question "is NOT MADE until the question is answered"; the plan's reading R1). It pinned "it did move — and the
     question came up for it, there and then": the move made, the question after it, a Cancel leaving it moved and
     unanswered. Now the question is put FIRST: not answered, it is not moved and a bar says so; answered, the move and
     the answer are one step. */
  it('(ON9) a request answered for the Saturday, dragged to the Sunday, asks about the Sunday FIRST — moved only on an answer (Codex rank 5; D783)', () => {
    const row = answered()
    const live = () => INPUTS.find((x: any) => x.iid === row.iid) as any
    setOilAsk(null)
    expect(commitChipMove({ kind: 'input', iid: row.iid }, '2026-07-18', '2026-07-19'), 'nothing moved yet').toBe(false)
    expect(live().date, 'it did NOT move').toBe('Jul 18')
    expect(OILASK, 'no window of the input is opened for it').toBe(null)
    expect(OILWAIT && OILWAIT.kind, 'the question waits').toBe('move')
    expect(OILWAIT!.gate.plan.map(p => p.iso), 'and it is about the Sunday').toEqual(['2026-07-19'])
    leaveOilWait()
    expect(live().date, 'not answered: not moved').toBe('Jul 18')
    expect(OILBAR && OILBAR.text).toBe('Not moved — OIL not answered')
    setOilBar(null)
    expect(commitChipMove({ kind: 'input', iid: row.iid }, '2026-07-18', '2026-07-19')).toBe(false)
    expect(answerOilWait({ '2026-07-19': 1 }), 'answered: moved, with its answer').toBe(true)
    expect(live().date).toBe('Jul 19')
    expect(live().oil).toEqual({ '2026-07-19': 1 })
  })

  /* the break tests of 13 Oct 26: the door's own save is TRIED before anyone is asked (Fable's read of the plan, A2). A
     move the save would refuse — here onto a week the app holds locked — is refused, and no question is put for it. */
  it('a move the save would refuse is refused — nobody is asked an OIL question for it first', () => {
    const row = answered()
    const live = () => INPUTS.find((x: any) => x.iid === row.iid) as any
    stashPut('20/07/2026', JSON.stringify({ d: weekBundle('20/07/2026').days, o: { 0: { d: {}, c: {} } }, cv: { 0: 'orig' } }))
    try {
      expect(commitChipMove({ kind: 'input', iid: row.iid }, '2026-07-18', '2026-07-25'), 'onto the Saturday of a locked week').toBe(false)
      expect(OILWAIT, 'no question for a move that cannot be made').toBe(null)
      expect(OILBAR).toBe(null)
      expect(live().date, 'and it did not move').toBe('Jul 18')
    } finally { stashClear() }
  })

  it('THE CONTROL — a move that leaves nothing to ask about is silent', () => {
    /* an ordinary weekday to another weekday: no covered day can earn, so
       there is no question and the drag must not interrupt anybody */
    const row: any = { person: 'bane', date: 'Jul 14', allday: true, type: 'Duty', remarks: '', mod: 'now', yr: 2026 }
    inpId(row); INPUTS.unshift(row)
    setOilAsk(null)
    expect(commitChipMove({ kind: 'input', iid: row.iid }, '2026-07-14', '2026-07-15')).toBe(true)
    expect(OILASK).toBe(null)
  })

  it('THE OTHER CONTROL — a type that never asks is never asked about', () => {
    const row: any = { person: 'bane', date: 'Jul 17', allday: true, type: 'LL', remarks: '', mod: 'now', yr: 2026 }
    inpId(row); INPUTS.unshift(row)
    setOilAsk(null)
    expect(commitChipMove({ kind: 'input', iid: row.iid }, '2026-07-17', '2026-07-18')).toBe(true)
    expect(OILASK).toBe(null)
  })
})
