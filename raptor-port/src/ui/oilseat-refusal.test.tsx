// @vitest-environment jsdom
/* [OIL-SEATS-CAN-EARN] STEP 2, THE DOORS — every way a placeholder can reach a
   cockpit, refused with its reason on screen.
   Plan: docs/superpowers/specs/2026-09-22-oil-seats-can-earn-plan.md §5 step 2.

   The engine half (the preflight body, the writers' belt, the words, the money
   belt) is engine/oilseat-refusal.test.ts. This file walks the DOORS, because a
   rule that exists in the engine and is not wired to a door is exactly the class
   of defect the standing order was written after: three of the owner's finds on
   21 Sep 26 were surfaces the feature was never connected to.

   THE DOORS, from the roll-call: drag from the roster · drag as a SWAP, whose
   BOTH ends must be judged before either write (Codex OSE-04) · armed placement
   from the palette · and the palette's own placeholder row, which must say the
   reason BEFORE the tap, not after it. */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { PEOPLE, SPECIALS } from '../engine/people'
import { INPUTS } from '../engine/inputs'
import { HOOKS } from '../engine/hooks'
import { SCHED } from '../engine/publish'
import { ensureRowIds } from '../engine/rowids'
import { slotVal, SENTINEL_JET_BAR } from '../engine/slots'
import * as view from '../state/view'
import { applyDrop, setDrag } from './drag'
import { specialRowHTML } from './palette-html'
import { elogClear, elogRows } from '../engine/editlog'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}

let host: HTMLDivElement
let root: Root
const DSNAP = JSON.stringify(DAYS)
const ISNAP = JSON.stringify(INPUTS)
const BOTH = SPECIALS
let toasts: string[] = []
const origToast = HOOKS.toast

beforeAll(async () => {
  initStore()
  host = document.createElement('div')
  document.body.appendChild(host)
  root = createRoot(host)
  await act(async () => { root.render(<App />) })
  await act(async () => { setSession({ user: 'ad', role: 'admin' }); notify() })
  await click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
  HOOKS.toast = (m: any) => { toasts.push(String(m)) }
})
afterAll(async () => {
  HOOKS.toast = origToast
  await act(async () => { root.unmount() })
  host.remove()
})

beforeEach(async () => {
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.dayOK = {}
  ensureRowIds(DAYS)
  elogClear()
  toasts = []
  /* the day-preview registry is view state, not day content, so it survives the
     day reset above — and a day listed in it is read-only, which silently
     refuses every arm below */
  view.DPREV.clear()
  await act(async () => { view.disarmSlot(); notify() })
})
afterEach(async () => { await act(async () => { view.disarmSlot() }) })

/* a real cockpit seat off the loaded week, found rather than invented */
function aCockpit(): { key: string; di: number } {
  for (let di = 0; di < DAYS.length; di++) {
    const waves = (DAYS[di] as any).waves || []
    for (let gi = 0; gi < waves.length; gi++) {
      const fs = waves[gi].formations || []
      for (let li = 0; li < fs.length; li++) {
        const acs = fs[li].aircraft || []
        for (let ai = 0; ai < acs.length; ai++) return { key: `${di}.${gi}.${li}.${ai}.p`, di }
      }
    }
  }
  throw new Error('no flying line in the seed week')
}

describe('the armed-placement door (state/view placeArmed)', () => {
  it('refuses the placeholder, says why, and leaves no trace on the day', async () => {
    const { key } = aCockpit()
    const was = slotVal(key)
    for (const id of BOTH) {
      toasts = []; elogClear()
      /* armed and tapped in ONE pass, the way a scheduler does it: tap the seat,
         tap the name. Split across two render flushes the arm does not survive
         in this harness, which is a property of the test bed, not of the door. */
      let took = true; let stillArmed = ''
      await act(async () => {
        view.armSlot(key)
        took = view.placeArmed(id)
        stillArmed = view.armedKey()
      })
      expect(took, `${PEOPLE[id].cs} is not planted`).toBe(false)
      expect(slotVal(key), 'the seat is untouched').toBe(was)
      expect(toasts.join(' | '), 'and the refusal says why').toContain(SENTINEL_JET_BAR)
      expect(Object.keys(SCHED.pending).length, 'no amendment mark').toBe(0)
      expect(elogRows(0).length + elogRows(1).length, 'and no history step').toBe(0)
      /* THE SLOT STAYS ARMED. A refusal is not a completed placement, so
         disarming would make the scheduler re-arm the seat to try a real man —
         punishing him for the app's own rule. */
      expect(stillArmed, 'the seat is still armed for the next try').toBe(key)
      await act(async () => { view.disarmSlot() })
    }
  })

  it('a NAMED man still plants into the very same armed seat', async () => {
    const { key } = aCockpit()
    const man = Object.keys(PEOPLE).find(id => !PEOPLE[id].special && PEOPLE[id].seat === 'FCP')!
    let took = false
    await act(async () => { view.armSlot(key); took = view.placeArmed(man) })
    expect(took, 'the door is open to a person').toBe(true)
    expect(slotVal(key)).toBe(man)
  })

  it('and the placeholder still plants on an armed GROUND row (D43)', async () => {
    const di = 5
    ;(DAYS[di] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: '' }]
    ensureRowIds(DAYS)
    for (const id of BOTH) {
      let took = false
      await act(async () => { view.armSlot(`g:${di}.0`); took = view.placeArmed(id) })
      expect(took, `${PEOPLE[id].cs} lands on a ground row`).toBe(true)
      expect(slotVal(`g:${di}.0`)).toBe(id)
      ;(DAYS[di] as any).ground[0].who = ''
    }
  })
})

describe('the drag door (ui/drag applyDrop)', () => {
  const dropOn = async (targetKey: string) => {
    /* the drop hit-tests a live element carrying the slot address, the same way
       a finger does */
    const el = document.createElement('div')
    el.className = 'seat'                       // applyDrop hit-tests '.sb-slot,.seat[data-slot]'
    el.setAttribute('data-slot', targetKey)
    document.body.appendChild(el)
    let ok: any
    await act(async () => { ok = applyDrop(el) })
    el.remove()
    return ok
  }

  it('a roster drag onto a cockpit is refused and says why', async () => {
    const { key } = aCockpit()
    const was = slotVal(key)
    for (const id of BOTH) {
      toasts = []
      setDrag({ kind: 'roster', id })
      await dropOn(key)
      expect(slotVal(key), 'nothing was written').toBe(was)
      expect(toasts.join(' | '), 'and the reason is on screen').toContain(SENTINEL_JET_BAR)
    }
  })

  it('A SWAP IS REFUSED WHOLE — neither end is written, and nobody is duplicated', async () => {
    /* Codex OSE-04, and it is the reason the refusal is preflighted rather than
       thrown from inside the writer. A swap is TWO independent writes: refusing
       only the one aimed at the cockpit still ran the other, so the man in the
       jet was COPIED onto the ground row while the placeholder vanished, and the
       drop reported success. Both ends are judged before either is written. */
    const { key, di } = aCockpit()
    const man = Object.keys(PEOPLE).find(id => !PEOPLE[id].special && PEOPLE[id].seat === 'FCP')!
    for (const id of BOTH) {
      ;(DAYS[di] as any).waves[+key.split('.')[1]].formations[+key.split('.')[2]]
        .aircraft[+key.split('.')[3]][key.split('.')[4]] = man
      ;(DAYS[di] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: id }]
      ensureRowIds(DAYS)
      const gkey = `g:${di}.0`
      toasts = []
      setDrag({ kind: 'slot', key: gkey, id })
      await dropOn(key)
      expect(slotVal(key), 'the jet keeps its pilot').toBe(man)
      expect(slotVal(gkey), 'and the ground row keeps its puck').toBe(id)
      expect(toasts.join(' | '), 'with the reason said once').toContain(SENTINEL_JET_BAR)
    }
  })

  it('a swap of the placeholder between two ALLOWED seats still works', async () => {
    const di = 5
    for (const id of BOTH) {
      ;(DAYS[di] as any).ground = [
        { prog: 'FAMILY DAY', str: '0900', end: '1700', who: id },
        { prog: 'MORNING BRIEF', str: '0700', end: '0800', who: '' },
      ]
      ensureRowIds(DAYS)
      setDrag({ kind: 'slot', key: `g:${di}.0`, id })
      await dropOn(`g:${di}.1`)
      expect(slotVal(`g:${di}.1`), `${PEOPLE[id].cs} moved between ground rows`).toBe(id)
      expect(slotVal(`g:${di}.0`), 'and left the row it came from').toBe('')
    }
  })
})

describe('the palette says it BEFORE the tap, not after', () => {
  it('with a cockpit armed, the placeholder row is struck out and prints the reason', async () => {
    const { key } = aCockpit()
    await act(async () => { view.armSlot(key) })
    const html = specialRowHTML(key.split('.')[0])
    for (const id of BOTH) {
      expect(html, `${PEOPLE[id].cs} is drawn`).toContain(`data-person="${id}"`)
    }
    expect(html, 'struck out, the way a barred name is').toMatch(/class="rpuck no/)
    expect(html, 'and the reason is PRINTED, because a phone has no hover')
      .toContain(SENTINEL_JET_BAR)
  })

  it('with a ground row armed, the same row is ordinary again', async () => {
    const di = 5
    ;(DAYS[di] as any).ground = [{ prog: 'FAMILY DAY', str: '0900', end: '1700', who: '' }]
    ensureRowIds(DAYS)
    await act(async () => { view.armSlot(`g:${di}.0`) })
    const html = specialRowHTML(di)
    expect(html, 'nothing struck out').not.toMatch(/class="rpuck no/)
    expect(html, 'and no reason printed').not.toContain(SENTINEL_JET_BAR)
  })

  it('with nothing armed it is the everyday row it always was', async () => {
    const html = specialRowHTML(5)
    expect(html, 'the placeholders are offered').toContain('data-drag="1"')
    expect(html).not.toMatch(/class="rpuck no/)
  })
})
