// @vitest-environment jsdom
/* THE LATE MARK IS DISMISSED PER INPUT (owner, 21 Aug 26 — "show a late tag
   beside the applicable inputs … when I click on the late orange icon beside
   the line, it will remove the late icon, if I click the same area again it
   will show"). This replaced the 20 Aug global "Hide LATE marks" switch.

   What this pins is the SHAPE of the answer, which is the part a later pass
   could get wrong:
     - each late input carries its OWN clickable chip on the board's live rows,
       and tapping it is reversible by tapping the same spot again (the chip
       stays, as a ghost) — not a one-way delete;
     - it is a UI gate, so `isLateInput` goes on answering and the mark stays
       what §Stable decisions says it is — a mark, never a warning;
     - dropping one hides it on the board AND the week (both read `lateShown`),
       but leaves every OTHER late input showing;
     - the Inputs page keeps its own mark — that page is the paperwork record;
     - a member cannot drop it, on their own late input or anyone else's.

   The seed carries four genuinely late inputs, all on Jul 14 (day 1), and the
   deadline is derived from CURWEEK rather than the clock — so this is
   deterministic whatever day it is run on. */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify, resetSession } from '../state/store'
import { INPUTS, isLateInput, inpId } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { onCommit } from '../command'
import { resyncSchedBaseline } from '../state/sched-commit'
import * as view from '../state/view'
import { openScheduler } from './board'
import { sbInputsGroupPanel } from './board-html'
import { lateTag, lateChip, dayHTML } from './html'
import { DAYS } from '../engine/data'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

let host: HTMLDivElement
let root: Root
const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
/* Jul 14 — the day the seed's late inputs sit on */
const LATE_DI = 1
const lateSeeds = () => INPUTS.filter((i: any) => isLateInput(i))

let TOASTS: string[] = []

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  /* the board's controls are gated on HOOKS.editMode(), which is
     canEditSched() AND being on Edit Schedule — a duty crew who left the page
     with a board open must not get live controls */
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})

/* Unmount before the file ends: a render task left queued by the last test
   would otherwise fire after vitest tears jsdom down and die with "window is
   not defined" — an unhandled error that fails the job while every test
   passed (the teardown race closed across the suite, 10 Sep 26). */
afterAll(async () => {
  await act(async () => { root.unmount() })
  host.remove()
})
beforeEach(async () => {
  TOASTS = []
  view.PIOPEN.add(LATE_DI)   // Personal Inputs folds by default now — expand the day this file drives so its rows render
  /* the tests set the mark straight on the records (a fixture, not a command), so the command layer's baseline is put back
     level with them — or a later tap that writes the same value as a stale baseline would record no change */
  await act(async () => { clearDrops(); resyncSchedBaseline(); notify() })
})

/* the drop is the input's own mark since D1586 — the tests set and clear it on the live records, as the command does */
const drop = (inp: any) => { (INPUTS.find((i: any) => inpId(i) === inpId(inp)) as any).lateOff = true }
const clearDrops = () => { for (const i of INPUTS as any[]) delete i.lateOff }

describe('the per-input LATE dismissal', () => {
  it('the seed really does carry late inputs, so the rest of this file is not vacuous', () => {
    expect(lateSeeds().length, 'late inputs in the seed').toBeGreaterThan(0)
    expect(lateSeeds().some((i: any) => i.date === 'Jul 14'), 'some on the day this file drives').toBe(true)
  })

  it('a live board input row carries a clickable LATE chip; the old header switch is gone', () => {
    const live = sbInputsGroupPanel(DAYS[LATE_DI], LATE_DI)  // ro undefined → live
    expect(live, 'no global switch any more').not.toContain('data-latetog')
    expect(live, 'the chip rides the row instead').toContain('data-lateoff')
    const ro = sbInputsGroupPanel(DAYS[LATE_DI], LATE_DI, true)
    expect(ro, 'a read-only preview shows the passive badge, no chip').not.toContain('data-lateoff')
  })

  it('the chip is solid while the mark shows and a pressed ghost once dropped', () => {
    const inp = lateSeeds().find((i: any) => i.date === 'Jul 14')!
    const on = lateChip(inp)
    expect(on).toContain('data-lateoff')
    expect(on).toContain('aria-pressed="false"')
    expect(on, 'not ghosted while showing').not.toContain('latechip off')

    drop(inp)
    const off = lateChip(inp)
    expect(off).toContain('aria-pressed="true"')
    expect(off, 'ghosted once dropped').toContain('latechip off')
    clearDrops()
  })

  it('dropping one mark clears only that input, and pressing its spot again brings it back', async () => {
    await act(async () => { openScheduler(LATE_DI); notify() })
    const chips = $$('#schedBoard [data-lateoff]')
    expect(chips.length, 'a late day draws a chip per late row').toBeGreaterThan(0)
    /* asserted PER INPUT since 22 Aug 26 — the board's read-only "Inputs ·
       day" summary band, which the old board-wide `.latetag` count read, was
       removed, and a raw badge count was never quite the claim anyway: an
       auto-landed activity input legitimately draws its badge on BOTH its
       Personal Inputs row and its promoted Ground row, so "one input
       dropped" can be two badges fewer. lateTag IS the one gate every
       passive surface prints through, so reading it per input is exact. */
    const dropped: any = INPUTS.find((i: any) => inpId(i) === chips[0].getAttribute('data-lateoff'))
    expect(dropped, 'the chip addresses a real input').toBeTruthy()
    const others = lateSeeds().filter((i: any) => i.date === 'Jul 14' && i !== dropped)

    await click(chips[0])
    expect(lateTag(dropped), 'the dropped input stops showing').toBe('')
    for (const o of others) expect(lateTag(o), `${o.person}'s mark stays`).not.toBe('')
    expect($$('#schedBoard [data-lateoff]').length, 'the chip itself stays, as a ghost').toBe(chips.length)
    expect(TOASTS.join(' '), 'and it says where it still is').toContain('Inputs page')

    await click($('#schedBoard [data-lateoff]'))
    expect(lateTag(dropped), 'pressing the same spot is the way back').not.toBe('')
  })

  it('the week is covered by the same read — one gate, every schedule surface', () => {
    const inp = lateSeeds().find((i: any) => i.date === 'Jul 14')!
    expect(dayHTML(LATE_DI, true), 'the week draws it').toContain('latetag')
    drop(inp)
    // the dropped input's badge is gone from the week too; others may remain,
    // so assert on the specific input via lateTag rather than the whole day.
    expect(lateTag(inp), 'the dropped one stops on the week as well').toBe('')
    clearDrops()
  })

  /* The mark is a display of an engine fact, not the fact itself. Turning the
     display off must not change what the engine says an input IS — that is
     what keeps the Inputs page (which reads `isLateInput` straight) still
     telling a member their input was filed late, and what keeps this from
     quietly becoming a rule change. */
  it('the engine is untouched — the input is still late, it is only unprinted', () => {
    const inp = lateSeeds()[0]
    drop(inp)
    expect(isLateInput(inp), 'the engine still answers').toBe(true)
    expect(lateTag(inp), 'the passive badge prints nothing').toBe('')
    clearDrops()
    expect(lateTag(inp)).toContain('LATE')
  })

  it('a member cannot drop it, even with a hand-made chip', async () => {
    await act(async () => { openScheduler(LATE_DI); notify() })
    const inp = lateSeeds().find((i: any) => i.date === 'Jul 14')!
    await act(async () => { setSession({ user: 'user', role: 'main' }); notify() })
    const bait = document.createElement('button')
    bait.setAttribute('data-lateoff', inpId(inp))
    document.body.appendChild(bait)
    await click(bait)
    expect(!!(INPUTS.find((i: any) => inpId(i) === inpId(inp)) as any).lateOff, 'the mark stays').toBe(false)
    expect(TOASTS.join(' ')).toContain('Only a scheduler')
    bait.remove()
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
  })

  /* D1586 (owner, 3 Nov 26 — "everyone, so the whole squadron sees one answer"): the drop is saved on the input, so a
     sign-out and a sign-in keep it — it used to be a session-only view set the next user never inherited. */
  it('a session change keeps a dropped mark dropped (D1586)', async () => {
    const inp = lateSeeds()[0]
    drop(inp)
    await act(async () => { resetSession(null); notify() })
    await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
    expect(lateTag(inp), 'still dropped for the next person signed in').toBe('')
    clearDrops()
  })

  it('the tap is one saved command on the input: it marks the record and stamps no change time (D1586)', async () => {
    /* the session test above signed out and in again, which leaves Edit Schedule — come back to it */
    await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
    await act(async () => { openScheduler(LATE_DI); notify() })
    const chip = $('#schedBoard [data-lateoff]')!
    const rec: any = INPUTS.find((i: any) => inpId(i) === chip.getAttribute('data-lateoff'))
    const modBefore = rec.mod
    const seen: any[] = []
    const off = onCommit(env => { seen.push(env) })
    try { await click(chip) } finally { off() }
    expect(rec.lateOff, 'kept on the input itself').toBe(true)
    expect(rec.mod, 'a mark, not a change of the input: the late rule still reads the same stamp').toBe(modBefore)
    expect(isLateInput(rec), 'still late').toBe(true)
    /* one command of its own type, whose change is the input's record — so it is saved, shared and one Undo step */
    const env = seen.find(e => e.type === 'inputs.lateOff')
    expect(env, 'its own command').toBeTruthy()
    expect(env.changes.some((c: any) => c.collection === 'inputs' && c.id === rec.iid && c.after && c.after.lateOff === true), 'the input record changed').toBe(true)
    await click($('#schedBoard [data-lateoff]'))
    expect(!!rec.lateOff, 'the same spot brings it back').toBe(false)
  })
})

/* A MEMBER NEVER SETS OR CLEARS THE DROP (D1586, §11's own-row note: "its LATE mark dropped … never mine to set or clear,
   on my own input too"). The bug check of 3 Nov 26: the commit gate compared the cancel, the red box and information
   only, not the new mark — so his own save of an input could take a scheduler's drop off, or put one on. */
describe('the commit gate: a member\'s command never sets or clears a dropped LATE mark', () => {
  it('his own input: the drop set or cleared by him is refused; his words changed with the drop kept are not', async () => {
    const { ownershipViolation } = await import('../state/perms')
    const env = (before: any, after: any) => ({ type: 'inputs.batch', actor: { id: 'us', role: 'member', personId: 'bane' },
      changes: [{ op: 'put', collection: 'inputs', id: 'lx', before, after }] }) as any
    const base = { iid: 'lx', person: 'bane', by: 'bane', at: '2026-07-01T08:00:00.000Z', type: 'Training', date: 'Jul 14', yr: 2026, allday: true, remarks: 'Why', mod: '2026-07-10' }
    expect(ownershipViolation(env({ ...base, lateOff: true }, { ...base })), 'a drop taken off by him').toBeTruthy()
    expect(ownershipViolation(env({ ...base }, { ...base, lateOff: true })), 'a drop put on by him').toBeTruthy()
    expect(ownershipViolation(env({ ...base, lateOff: true }, { ...base, lateOff: true, remarks: 'New' })), 'his words, the drop kept').toBeNull()
  })

  /* D1620 (owner, 3 Nov 26 — "as recommended"): his own later change takes the drop off. The gate lets him clear it only in
     a save that writes his input a new change date — the date the mark measures — and never lets him set it. */
  it('D1620: he may clear the drop in a save that writes a new change date, never in one that does not', async () => {
    const { ownershipViolation } = await import('../state/perms')
    const env = (before: any, after: any) => ({ type: 'inputs.write', actor: { id: 'us', role: 'member', personId: 'bane' },
      changes: [{ op: 'put', collection: 'inputs', id: 'lx', before, after }] }) as any
    const base = { iid: 'lx', person: 'bane', by: 'bane', at: '2026-07-01T08:00:00.000Z', type: 'Training', date: 'Jul 14', yr: 2026, allday: true, remarks: 'Why', mod: '2026-07-10' }
    expect(ownershipViolation(env({ ...base, lateOff: true }, { ...base, date: 'Jul 15', mod: '2026-07-12' })), 'a new change, the drop gone with it').toBeNull()
    expect(ownershipViolation(env({ ...base, lateOff: true }, { ...base, date: 'Jul 15' })), 'no new change date: still his to keep').toBeTruthy()
    expect(ownershipViolation(env({ ...base }, { ...base, lateOff: true, mod: '2026-07-12' })), 'never his to put on').toBeTruthy()
  })

  /* The security read of 3 Nov 26 (finding 1): a NEW record of his — an MC over his own leave — was compared with the marks
     of whatever other record of his the same command changed, so the leave's dropped LATE mark refused his MC. A new record
     takes marks only from the record it is a piece of: the one it was cut from, which hands it its filer and filing time. */
  it('his own MC over his own leave whose LATE mark was dropped is not refused', async () => {
    const { ownershipViolation } = await import('../state/perms')
    const actor = { id: 'us', role: 'member', personId: 'bane' }
    const L: any = { iid: 'll', person: 'bane', by: 'bane', at: '2026-07-01T08:00:00.000Z', type: 'LL', date: 'Jul 14', endDate: 'Jul 18', yr: 2026, allday: true, mod: '2026-07-10', lateOff: true }
    const MC: any = { iid: 'mc', person: 'bane', by: 'bane', at: '2026-07-15T08:00:00.000Z', type: 'MC', date: 'Jul 16', endDate: 'Jul 18', yr: 2026, allday: true, mod: '2026-07-15' }
    expect(ownershipViolation({ type: 'inputs.batch', actor, changes: [
      { op: 'put', collection: 'inputs', id: 'll', before: L, after: { ...L, endDate: 'Jul 15' } },
      { op: 'put', collection: 'inputs', id: 'mc', before: null, after: MC },
    ] } as any), 'the leave cut back').toBeNull()
    expect(ownershipViolation({ type: 'inputs.batch', actor, changes: [
      { op: 'delete', collection: 'inputs', id: 'll', before: L, after: null },
      { op: 'put', collection: 'inputs', id: 'mc', before: null, after: { ...MC, date: 'Jul 14' } },
    ] } as any), 'the leave wholly covered').toBeNull()
  })

  /* …and its twin (finding 2): a brand-new input of his borrowed another record's marks, so a scheduler's drop — or a cancel —
     could be put on a new filing beside a trivial change to an input that carries one. A true piece still carries its own. */
  it('a new input of his never borrows another input\'s scheduler marks; a true piece keeps its own', async () => {
    const { ownershipViolation } = await import('../state/perms')
    const actor = { id: 'us', role: 'member', personId: 'bane' }
    const A0: any = { iid: 'la', person: 'bane', by: 'bane', at: '2026-07-01T08:00:00.000Z', type: 'Training', date: 'Jul 14', yr: 2026, allday: true, remarks: 'Why', mod: '2026-07-10', lateOff: true }
    const B0: any = { iid: 'lb', person: 'bane', by: 'bane', at: '2026-07-12T08:00:00.000Z', type: 'LL', date: 'Jul 20', yr: 2026, allday: true, mod: '2026-07-12' }
    const pair = (a: any, b: any) => ({ type: 'inputs.batch', actor, changes: [
      { op: 'put', collection: 'inputs', id: 'la', before: a, after: { ...a, remarks: 'Why.' } },
      { op: 'put', collection: 'inputs', id: 'lb', before: null, after: b },
    ] }) as any
    expect(ownershipViolation(pair(A0, { ...B0, lateOff: true })), 'a LATE drop borrowed').toBeTruthy()
    const A1 = { ...A0, cx: true, cxr: 'Weather' }; delete A1.lateOff
    expect(ownershipViolation(pair(A1, { ...B0, cx: true, cxr: 'Weather' })), 'a cancel borrowed').toBeTruthy()
    expect(ownershipViolation(pair(A0, { ...B0, at: A0.at, lateOff: true })), 'a piece cut from it').toBeNull()
  })
})

/* Undo names the input whose LATE mark it takes back (D1582 — "by its person and kind"; the bug check of 3 Nov 26) */
describe('Undo\'s words for a LATE mark', () => {
  it('name the input: "the LATE mark on Nasty’s LL"', async () => {
    const { describeEntry, setDescribeNames } = await import('../undo/describe')
    const { PEOPLE } = await import('../engine/people')
    /* the app wires the names at boot (state/undo-wire.ts) */
    setDescribeNames((pid) => ((PEOPLE as any)[pid] ? String((PEOPLE as any)[pid].cs) : null))
    const rec = { iid: 'lw1', person: 'nasty', type: 'LL', date: 'Jul 14', yr: 2026, allday: true }
    const e = { type: 'inputs.lateOff', forward: [{ op: 'put', collection: 'inputs', id: 'lw1', before: rec, after: { ...rec, lateOff: true } }], inverse: [] } as any
    expect(describeEntry(e)).toBe('the LATE mark on Quill’s LL')
  })
})
