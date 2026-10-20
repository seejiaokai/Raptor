// @vitest-environment jsdom
/* [AMEND-SMALL-SEEN] 1 (28 Sep 26) — ONE PRESS, ONE MESSAGE. The toast is a single element whose text is replaced, so a
   weekend publish that then raised the OIL check's warning showed only the warning: "Published AL1 · 14 items on Sat
   only" was never seen (the amendment re-test's walker W1). The publish command now says both, in one line
   (ui/toast.ts toastBatch through HOOKS.toastBatch, state/sched-commit.ts commitPublish). Scoped: every other toast keeps
   "the last one wins" — a rolled-back save must never read "… removed · That did not save" (Astra 03). */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { toast, toastBatch, clearToast } from './toast'
import { HOOKS } from '../engine/hooks'
import { noteUnlessSeen, SEEN_FIRST_MS } from './seen'
import { INPUTS } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, signOf } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore } from '../state/store'
import { setSession } from '../state/auth'
import { commitSetDayApproved } from '../state/sched-commit'
import { setPublishGate } from '../state/inputgate-hook'

const face = () => (document.getElementById('toastEl') as HTMLElement | null)
const text = () => face()?.textContent || ''
const tint = () => face()?.style.color || ''

describe('toastBatch — the toast module', () => {
  afterEach(() => clearToast())
  it('joins every message said inside it, in order, into ONE line, when it returns', () => {
    toastBatch(() => { toast('Published AL1 · 3 items on Sat only', undefined); toast('the SXO desk has no usable times', 'warn') })
    expect(text()).toBe('Published AL1 · 3 items on Sat only · the SXO desk has no usable times')
  })
  it('says a repeat once, and keeps the strongest colour any message asked for', () => {
    toastBatch(() => { toast('A', undefined); toast('B', 'warn'); toast('A', undefined) })
    expect(text()).toBe('A · B')
    expect(tint(), 'amber, because one of them was a warning').toBe('var(--adv)')
    toastBatch(() => { toast('C', 'warn'); toast('D', 'hard') })
    expect(tint(), 'red beats amber').toBe('var(--hard)')
  })
  it('a throw inside drops what was said (the command rolled back — none of it is true) and the error goes on', () => {
    toast('before', undefined)
    expect(() => toastBatch(() => { toast('Published AL1', undefined); throw new Error('rolled back') })).toThrow('rolled back')
    expect(text(), 'the rolled-back publish never speaks').toBe('before')
  })
  it('OUTSIDE a batch nothing changes: the last message still wins', () => {
    toast('first', undefined); toast('second', 'warn')
    expect(text()).toBe('second')
  })
  it('a batch inside a batch is the outer one\'s', () => {
    toastBatch(() => { toast('outer', undefined); toastBatch(() => toast('inner', undefined)); toast('after', undefined) })
    expect(text()).toBe('outer · inner · after')
  })
  it('a batch with nothing said leaves the toast alone', () => {
    toast('earlier', undefined)
    toastBatch(() => 1)
    expect(text()).toBe('earlier')
  })
})

/* TWO NOTES ABOUT ONE DAY NAME IT ONCE (owner D837, 14 Oct 26 — the passing note N1; the words of record:
   docs/superpowers/briefs/2026-10-13-wording-recheck.md). A note may say which day it names at its head and what it says
   of it (the third argument). Two such notes about the same day, one after the other, are said as one: the day once, in
   the fuller name, each note's words a sentence. Everything else in a batch is joined by the dot, as before — which is
   what keeps an amendment's receipt, the OIL line's other form and the lines that ride behind it exactly as they were.
   The real pair, through the real publish: leavewar/publishdoor.test.ts. */
describe('toastBatch — two notes about the same day are said as one', () => {
  afterEach(() => clearToast())
  const pub = { day: 0, head: 'Monday', body: 'published and approved' }
  const oil = { day: 0, head: 'Monday 13 Jul', body: 'the Common Programme has no usable times, so nobody on it earns OIL' }
  const OIL_ALONE = 'Monday 13 Jul: the common programme has no usable times, so nobody on it earns OIL'
  it('the day is named once, at the head, with its date; the join adds the capital and the full stops', () => {
    toastBatch(() => { toast('Monday published and approved', undefined, pub); toast(OIL_ALONE, 'warn', oil) })
    expect(text()).toBe('Monday 13 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL.')
    expect(tint(), 'still in the warning\'s colour').toBe('var(--adv)')
  })
  it('a note shown alone keeps its own words and takes no full stop — in a batch or out of one', () => {
    toastBatch(() => { toast('Monday published and approved', undefined, pub) })
    expect(text()).toBe('Monday published and approved')
    toast(OIL_ALONE, 'warn', oil)
    expect(text()).toBe(OIL_ALONE)
  })
  it('what the second note carried behind its first line rides behind the pair, joined by the dot as it always was', () => {
    const after = 'Plasma\'s LL bid on 13 Jul now sits on published work — the day is flagged, the bid is still live'
    toastBatch(() => { toast('Monday published and approved', undefined, pub); toast(`${OIL_ALONE} · ${after}`, 'warn', { ...oil, after }) })
    expect(text()).toBe(`Monday 13 Jul published and approved. The Common Programme has no usable times, so nobody on it earns OIL. · ${after}`)
  })
  it('after a note that names no day — an amendment\'s receipt — the OIL line keeps its own day and the dot', () => {
    toastBatch(() => { toast('Published AL2 · 3 items on Monday only · approved by Saber', undefined); toast(OIL_ALONE, 'warn', oil) })
    expect(text()).toBe(`Published AL2 · 3 items on Monday only · approved by Saber · ${OIL_ALONE}`)
  })
  it('a second note with no day of its own — the OIL line\'s other form — is joined by the dot, word for word', () => {
    const other = 'Monday 13 Jul earned nobody any OIL — the common programme has no usable times'
    toastBatch(() => { toast('Monday published and approved', undefined, pub); toast(other, 'warn') })
    expect(text()).toBe(`Monday published and approved · ${other}`)
  })
  it('two notes about DIFFERENT days are never said as one', () => {
    toastBatch(() => { toast('Monday published and approved', undefined, pub); toast('Tuesday 14 Jul: the SDO desk has no usable times, so nobody on it earns OIL', 'warn', { day: 1, head: 'Tuesday 14 Jul', body: 'the SDO desk has no usable times, so nobody on it earns OIL' }) })
    expect(text()).toBe('Monday published and approved · Tuesday 14 Jul: the SDO desk has no usable times, so nobody on it earns OIL')
  })
  it('…nor two whose heads are not one day\'s two names, nor two with another note between them', () => {
    toastBatch(() => { toast('Monday published and approved', undefined, pub); toast('Mon 13 Jul: x', 'warn', { day: 0, head: 'Mon 13 Jul', body: 'x' }) })
    expect(text()).toBe('Monday published and approved · Mon 13 Jul: x')
    toastBatch(() => { toast('Monday published and approved', undefined, pub); toast('Saved', undefined); toast(OIL_ALONE, 'warn', oil) })
    expect(text()).toBe(`Monday published and approved · Saved · ${OIL_ALONE}`)
  })
})

describe('the publish says what it published AND what the OIL check found — one line', () => {
  const ISNAP = JSON.stringify(INPUTS), DSNAP = JSON.stringify(DAYS)
  const keep = { toast: HOOKS.toast, batch: HOOKS.toastBatch }
  beforeEach(() => {
    INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
    DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
    SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
    SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
    stashClear()
    setSession({ user: 'ad', role: 'admin' })
    initStore()
    HOOKS.toast = toast; HOOKS.toastBatch = toastBatch   // as main.tsx wires them
  })
  afterEach(() => { setPublishGate(null); HOOKS.toast = keep.toast; HOOKS.toastBatch = keep.batch; clearToast() })
  const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }

  it('Publish day on Saturday, with the check raising a warning: both facts are on the screen', () => {
    setPublishGate(() => HOOKS.toast('Saturday 18 Jul: the SXO desk has no usable times, so nobody on it earns OIL', 'warn'))
    sign(5)
    commitSetDayApproved(5, true)
    expect(SCHED.dayOK[5], 'the day was published').toBeTruthy()
    const t = text()
    expect(t, 'the publish is still said').toMatch(/Saturday|Sat/)
    expect(t, 'what it published').not.toBe('Saturday 18 Jul: the SXO desk has no usable times, so nobody on it earns OIL')
    expect(t, 'and the warning beside it').toContain('nobody on it earns OIL')
    expect(tint(), 'in the warning\'s colour').toBe('var(--adv)')
  })
  it('with nothing for the check to say, the publish reads as it always did', () => {
    setPublishGate(() => {})
    sign(5)
    commitSetDayApproved(5, true)
    expect(text()).not.toContain(' · nobody')
    expect(text().length).toBeGreaterThan(0)
  })
})

/* A NOTE IS TOLD TO A SCREEN READER ([BATCH-14OCT-LEFTOVERS] (f), 21 Oct 26 — found by the leftovers' own walk, 14 Oct
   26: the note's box was a plain box, so where a note was shown a reader heard nothing). Every note's words go to the
   one polite region the just-added mark already tells (ui/seen.ts), whole; the box the eye reads is hidden from a
   reader, so nothing is heard twice; and a save the screen shows tells its words once — never a note and the words. */
describe('the passing note is told to a screen reader', () => {
  beforeEach(() => { vi.useFakeTimers() })
  afterEach(() => { clearToast(); vi.useRealTimers(); document.body.innerHTML = '' })
  const region = () => document.getElementById('srSay')
  /* every time the region is FILLED (an emptying is not read) — what a reader would hear */
  const heard = () => {
    const got: string[] = []
    const mo = new MutationObserver(() => { const t = region()?.textContent || ''; if (t) got.push(t) })
    return { got, watch: () => mo.observe(region()!, { childList: true, characterData: true, subtree: true }), stop: () => mo.disconnect() }
  }

  it('a note shown is told, politely and whole, from a region of its own; the box the eye reads is hidden from a reader', () => {
    toast('Monday published', undefined)
    const r = region()!
    expect(r, 'the region is made').toBeTruthy()
    expect([r.getAttribute('role'), r.getAttribute('aria-live'), r.getAttribute('aria-atomic')]).toEqual(['status', 'polite', 'true'])
    vi.advanceTimersByTime(40)
    expect(r.textContent).toBe('Monday published')
    expect(face()!.getAttribute('aria-hidden'), 'the box itself is not read as well').toBe('true')
    expect(face()!.textContent, 'and the eye still reads it').toBe('Monday published')
  })
  it('a long note — a published day with its OIL line — is told whole, not cut', () => {
    const long = 'Saturday 18 Jul published. The SXO desk has no usable times, so nobody on it earns OIL · ' + 'Published AL1 · 14 items on Sat only · '.repeat(6)
    toast(long, 'warn')
    vi.advanceTimersByTime(40)
    expect(region()!.textContent).toBe(long)
  })
  it('the same words twice running are told twice; a batch is told once, as the one line the eye reads', async () => {
    toast('Input added', undefined); vi.advanceTimersByTime(40)
    const h = heard(); h.watch()
    toast('Input added', undefined)
    expect(region()!.textContent, 'emptied first, so a reader hears the same words again').toBe('')
    vi.advanceTimersByTime(40); await Promise.resolve()
    toastBatch(() => { toast('Published AL1 · 3 items on Sat only', undefined); toast('the SXO desk has no usable times', 'warn') })
    vi.advanceTimersByTime(40); await Promise.resolve()
    h.stop()
    expect(h.got).toEqual(['Input added', 'Published AL1 · 3 items on Sat only · the SXO desk has no usable times'])
  })
  it('a save the screen shows tells its words once, and raises no note; one it cannot show raises the note, told once', async () => {
    const was = HOOKS.toast
    HOOKS.toast = toast as any
    try {
      /* laid out, the saved input's card in view: the mark is the sign, and the words are told */
      const card = document.createElement('div'); card.setAttribute('data-fresh', 'x1'); document.body.appendChild(card)
      const rect = (r: any) => () => ({ ...r, right: r.left + r.width, bottom: r.top + r.height, x: r.left, y: r.top, toJSON() {} })
      ;(card as any).getBoundingClientRect = rect({ top: 100, left: 20, width: 300, height: 40 })
      ;(document.documentElement as any).getBoundingClientRect = rect({ top: 0, left: 0, width: 390, height: 844 })
      ;(document as any).elementFromPoint = () => card
      noteUnlessSeen('x1', 'Input added')
      const h = heard(); h.watch()
      vi.advanceTimersByTime(SEEN_FIRST_MS + 60); await Promise.resolve()
      expect(h.got, 'in view: told once').toEqual(['Input added'])
      expect(text(), 'and no note raised').toBe('')
      /* nothing wears the mark: the note is raised, and told once — not the note AND the words */
      noteUnlessSeen('x2', 'Input updated')
      vi.advanceTimersByTime(SEEN_FIRST_MS + 60); await Promise.resolve()
      h.stop()
      expect(text(), 'the note is shown').toBe('Input updated')
      expect(h.got, 'and told once').toEqual(['Input added', 'Input updated'])
    } finally {
      HOOKS.toast = was
      delete (document as any).elementFromPoint
      delete (document.documentElement as any).getBoundingClientRect
    }
  })
  it('a sign-in or sign-out takes the words down with the note', () => {
    toast('viper@mail can sign in now', undefined); vi.advanceTimersByTime(40)
    clearToast()
    expect(region()!.textContent).toBe('')
  })
})
