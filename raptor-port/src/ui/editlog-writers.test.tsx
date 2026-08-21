// @vitest-environment jsdom
/* THE WRITE PATHS THE EDIT LOG USED TO MISS (11 Aug 26).

   markEdit/noteChange log a value change only when the caller hands over BOTH
   values (engine/editlog.ts) — the one rule that keeps the log free of the
   bare epilogue that fires after every mutation. Six write paths satisfied
   neither half: the five fields that live outside the txt-key grammar and
   write the model themselves (stores chips, the bombs box, area, area time,
   in-times, traffic), and three whole ACTIONS that reach markEdit with no key
   at all (accepting an input, cancelling with a reason, rolling a day back).
   Every one of them still marked its cell as edited, so History put a
   `cursor:help` on a detail and then had nothing to say about it.

   These drive the real gestures rather than calling logEdit, because the bug
   was never in the log — it was in what the callers passed it. A test that
   called markEdit with two values by hand would have passed throughout. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { initStore, setSession, notify } from '../state/store'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { INPUTS, isUnavail } from '../engine/inputs'
import { inpKey, setSlotVal, unacceptInput } from '../engine/slots'
import { DATES } from '../engine/inputs'
import { ELOG, elogRows, elogFor, elogClear, keyLabel } from '../engine/editlog'
import { HOOKS } from '../engine/hooks'
import { setAirKey } from './pops'
import { askCx, cxCommit, openScheduler } from './board'
import * as view from '../state/view'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const $ = (sel: string) => document.querySelector(sel) as HTMLElement
const $$ = (sel: string) => [...document.querySelectorAll(sel)] as HTMLElement[]
const click = async (el: Element | null) => {
  expect(el, 'click target exists').toBeTruthy()
  await act(async () => { (el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true })) })
}
const blur = async (el: Element) => {
  await act(async () => { el.dispatchEvent(new FocusEvent('focusout', { bubbles: true })) })
  await act(async () => { await new Promise(r => setTimeout(r, 5)) })
}
const goEdit = async () =>
  click($$('.nav a[data-page]').find(a => a.dataset.page === 'editsched')!)
/* the newest row, whatever it is about — every test here makes exactly one
   change, so this is the row it made */
const newest = () => elogRows()[0]

beforeAll(async () => {
  initStore()
  HOOKS.isPhone = () => false
  const host = document.createElement('div')
  document.body.appendChild(host)
  await act(async () => { createRoot(host).render(<App />) })
  await act(async () => { setSession({ user: 'a', role: 'admin' }); notify() })
})

beforeEach(() => { elogClear() })

describe('the five fields that write their own model', () => {
  it('the bombs box says what the jet was carrying and what it carries now', async () => {
    await goEdit()
    const bo = $('#eWeek .bombs[data-bombs]')
    expect(bo, 'a bombs box renders on the edit week').toBeTruthy()
    bo.textContent = '2 X GBU-38'
    await blur(bo)

    const row = elogFor('st:' + bo.dataset.bombs!)
    expect(row, 'the change reached the log').toBeTruthy()
    expect(row!.to, 'and the new load names the bombs').toContain('2 X GBU-38')
    /* the WHOLE load, not just the box that was typed in: the chips and this
       box share one address, so a row naming half of it would carry the same
       label as a chip toggle and contradict it */
    expect(row!.lbl).toContain('stores')
  })

  it('the AREA cell records the value it was showing before, derived or typed', async () => {
    await goEdit()
    const ar = $('#eWeek .areacell[data-area]')
    expect(ar, 'an area cell renders on the edit week').toBeTruthy()
    const [di, gi, li] = ar.dataset.area!.split('.')
    const f = DAYS[+di!].waves[+gi!].formations[+li!]
    const was = f.area
    ar.textContent = 'D99X'
    await blur(ar)

    const row = elogFor(`ar:${di}.${gi}.${li}`)
    expect(row, 'the change reached the log').toBeTruthy()
    expect(row!.to).toBe('D99X')
    /* the "before" is what the CELL was showing. Until a scheduler types over
       it that is derived off the aircraft, not the (null) model field — the
       same rule the commit itself compares against, so the two cannot
       disagree about whether anything changed. */
    expect(row!.from, 'and the before is never blank when the cell was not').not.toBe('')
    f.area = was
  })

  it('the AREA TIME cell does the same', async () => {
    await goEdit()
    const at = $('#eWeek .timecell[data-atime]')
    const [di, gi, li] = at.dataset.atime!.split('.')
    const f = DAYS[+di!].waves[+gi!].formations[+li!]
    const was = f.atime
    at.textContent = '0900-1000'
    await blur(at)

    const row = elogFor(`at:${di}.${gi}.${li}`)
    expect(row, 'the change reached the log').toBeTruthy()
    expect(row!.to).toBe('0900-1000')
    f.atime = was
  })

  it('the IN-TIMES strip records the list either side (per-line since 21 Aug 26)', async () => {
    await goEdit()
    const line = $('#eWeek .intimes[data-intimes] [data-itline]')
    expect(line, 'each in-time line is its own editable span on the edit week').toBeTruthy()
    const [di, gi] = line.dataset.itline!.split('|')
    const w = DAYS[+di!].waves[+gi!]
    const was = (w.intimes || []).slice()
    line.textContent = '1200H: TEST LINE'
    await blur(line)

    const row = elogFor(`it:${di}.${gi}`)
    expect(row, 'the change reached the log').toBeTruthy()
    expect(row!.to).toContain('1200H: TEST LINE')
    expect(row!.to, 'the untouched second line rides the list').toContain(was[1])
    w.intimes = was
  })

  it('a stores chip on the BOARD raises a bubble, which it never could before', async () => {
    await goEdit()
    await act(async () => { openScheduler(0) })
    await act(async () => { view.setHistMode(true); notify() })

    const chip = $$('.sb-boardwrap [data-store]')[0]!
    expect(chip, 'the board renders stores chips').toBeTruthy()
    const addr = chip.dataset.store!.split('.').slice(0, 4).join('.')
    const label = chip.textContent!.trim()
    await click(chip)                       // a chip click removes that store

    const row = elogFor('st:' + addr)
    expect(row, 'the toggle reached the log').toBeTruthy()
    expect(row!.from, 'the load before it names the store just removed').toContain(label)
    expect(row!.to, 'and the load after it does not').not.toContain(label)

    /* and the bubble — the whole point. It could never appear on one of these
       cells, because elogFor had nothing to return for an `st:` key. */
    const cell = $$('.sb-boardwrap [data-bombs]').find(e => e.dataset.bombs === addr)!
    expect(cell, 'the jet still has a stores cell to hover').toBeTruthy()
    await act(async () => { cell.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })) })
    const bub = document.querySelector('.histbub')
    expect(bub, 'a bubble came up on a stores cell').toBeTruthy()
    expect(bub!.textContent).toContain('stores')

    await act(async () => { view.setHistMode(false); notify() })
  })

  it('the traffic list records what it was, from a popup that writes in place', async () => {
    await goEdit()
    await act(async () => { setAirKey('0|0'); notify() })
    const w = DAYS[0].waves[0]
    const was = (w.traffic || []).slice()

    await click($('#airAdd'))
    const row = elogFor('tr:0.0')
    expect(row, 'adding a traffic row reached the log').toBeTruthy()
    /* the "before" cannot be read back at commit time — the three handlers all
       write `traffic` in place first, because a React-controlled list would
       repaint under the caret — so it is snapshotted when the popup opens */
    expect(row!.from).toBe(was.length ? was.join(' · ') : '—')
    expect(row!.to).not.toBe(row!.from)

    w.traffic = was
    await act(async () => { setAirKey(null); notify() })
  })
})

describe('the three actions that carried no key at all', () => {
  it('accepting an input onto the ground programme is a line in the list', async () => {
    await goEdit()
    /* activity inputs AUTO-LAND on the ground now (Aug 26), so make one
       available to accept BY HAND: take an accepted one, unaccept it, and
       expand the (now folded) Personal Inputs block so its Accept control
       renders. The manual accept path itself is unchanged — that is what this
       test still pins. */
    const inp = INPUTS.find((i: any) => i.acc === 'g' && !isUnavail(i.type))!
    expect(inp, 'the demo week has an accepted activity input').toBeTruthy()
    await act(async () => { unacceptInput(DATES.indexOf(inp.date), inp); view.PIOPEN.add(DATES.indexOf(inp.date)); notify() })

    /* the real control, wherever it renders — the week and the board share it.
       The DAY comes off the button, not from the input: a multi-day input
       renders an Accept on every day it spans, so which one it lands on is
       whichever control was pressed. */
    const btn = $$('[data-acc]').find(b => b.dataset.acck === inpKey(inp) && b.dataset.acc === 'g')
    expect(btn, 'an Accept control renders for it').toBeTruthy()
    const di = +btn!.dataset.accd!
    const before = DAYS[di].ground.length
    await click(btn!)

    expect(DAYS[di].ground.length, 'a real ground row appeared').toBe(before + 1)
    const row = newest()
    expect(row, 'and so did a line in the changes list').toBeTruthy()
    expect(row!.lbl).toContain('ground programme')
    expect(row!.di, 'filed against the day it landed on').toBe(di)
    /* a sentence, not a value pair — there is no "before" for a row that did
       not exist a moment ago, which is exactly why this path needed one */
    expect(row!.key).toBe('')
  })

  it('cancelling with a reason carries the reason', async () => {
    await goEdit()
    await act(async () => { openScheduler(0) })
    const a = DAYS[0].waves[0].formations[0].aircraft[0]
    await act(async () => { askCx(a, 'fr:0.0.0.0', 'this line') })
    await act(async () => { cxCommit(true, 'weather') })

    expect(a.cx, 'the line really was cancelled').toBe(true)
    const row = newest()
    expect(row, 'and it reached the list').toBeTruthy()
    expect(row!.lbl).toContain('weather')
    expect(row!.lbl).toContain('this line')
    expect(row!.di, 'filed against the day it happened on').toBe(0)

    await act(async () => { cxCommit(false, '') })   // leave the demo day alone
  })

  it('loading a version onto the working copy is a line in the list', async () => {
    await goEdit()
    const di = 2
    SCHED.orig = SCHED.orig || {}
    SCHED.orig[di] = { d: JSON.parse(JSON.stringify(DAYS[di])), c: {} }
    const wasCs = DAYS[di].waves[0].formations[0].cs
    DAYS[di].waves[0].formations[0].cs = 'ZULU'
    SCHED.pending[`ff:${di}.0.0.cs`] = 1

    await act(async () => { view.setDayPreview(di, 'orig'); notify() })
    const rst = $$('button[data-restore]').find(b => b.dataset.restore === String(di))
    expect(rst, 'the preview offers Load onto working copy').toBeTruthy()
    /* a pending edit is on the day, so the load confirms: first tap arms, the
       second (re-queried after the repaint) loads (owner, 16 Aug 26) */
    await click(rst!)
    const rst2 = $$('button[data-restore]').find(b => b.dataset.restore === String(di))
    expect(rst2!.textContent, 'first tap arms the confirm').toContain('Discard')
    await click(rst2!)

    expect(DAYS[di].waves[0].formations[0].cs, 'the working copy took the loaded content').toBe(wasCs)
    const row = newest()
    expect(row, 'and it reached the list').toBeTruthy()
    expect(row!.lbl).toContain('loaded onto the working copy')
    expect(row!.di).toBe(di)
  })
})

describe('naming a seat when the line flies more than one jet', () => {
  it('tells the two jets apart, and leaves a single-ship alone', () => {
    const f = DAYS[0].waves[0].formations[0]
    expect(f.aircraft.length, 'the demo Monday opens with a two-ship').toBeGreaterThan(1)
    /* both used to print identically, so a two-ship's two front seats were
       indistinguishable in the list. The bubble was always right — it matches
       on the key — but the list is the surface you read after the fact. */
    expect(keyLabel('0.0.0.0.p')).not.toBe(keyLabel('0.0.0.1.p'))
    expect(keyLabel('0.0.0.0.p')).toContain('#1')
    expect(keyLabel('0.0.0.1.p')).toContain('#2')

    /* fr: and st: address one AIRCRAFT too — they had the same fault, and the
       stores bubble is where it was actually seen: the demo Monday's first
       wave is two "VL BFM" lines of two jets each, so "VL · stores" named four
       different cells. ff:/ar:/at: address the FORMATION and take no number. */
    expect(keyLabel('st:0.0.0.0')).toContain('#1')
    expect(keyLabel('st:0.0.0.1')).toContain('#2')
    expect(keyLabel('fr:0.0.0.0')).not.toBe(keyLabel('fr:0.0.0.1'))
    expect(keyLabel('ar:0.0.0'), 'the area is the whole line').not.toContain('#')

    const single = { cs: 'SOLO', msn: 'FCF', aircraft: [{ p: '', w: '' }] }
    DAYS[0].waves[0].formations.push(single as any)
    const li = DAYS[0].waves[0].formations.length - 1
    expect(keyLabel(`0.0.${li}.0.p`), 'no number where there is nothing to tell apart').toBe('SOLO FCF · FCP')
    DAYS[0].waves[0].formations.pop()
  })
})

describe('the log still refuses what it always refused', () => {
  it('a mark with no values, and a mark with no key, leave no row', async () => {
    const { markEdit } = await import('../engine/publish')
    elogClear()
    markEdit()                       // afterSchedMutate's bare epilogue
    markEdit('ff:0.0.0.cs')          // a structural mark after an add — no "before"
    expect(ELOG.rows.length, 'neither is a value change').toBe(0)
  })
})

describe('deletions carry what they held (12 Aug 26)', () => {
  it('a removed note carries its own words, clipped once they run long', async () => {
    await goEdit()
    await act(async () => { openScheduler(0) })
    const notes = DAYS[0].notes
    const ni = notes.length
    const long = 'This note is deliberately typed long enough to run straight through the sixty character budget the toast allows it to spend'
    notes.push(long)
    await act(async () => { view.afterSchedMutate(); notify() })

    await click($(`#sbBoard [data-ndel="0.${ni}"]`))

    const row = newest()
    expect(row, 'the deletion reached the log').toBeTruthy()
    expect(row!.lbl).toContain('Note removed')
    /* the toast says the same sentence, so a note this long has to clip —
       the clipped words end in the ellipsis, not the whole sentence */
    expect(row!.lbl, 'the clip leaves a trailing ellipsis').toMatch(/…$/)
    expect(row!.lbl.length, 'shorter than the note it came from').toBeLessThan(long.length)
  })

  it('a removed duty row carries its role and its man', async () => {
    await goEdit()
    await act(async () => { openScheduler(0) })
    const rows = DAYS[0].dutywaves[0].rows
    const B = rows.length
    await click($(`#sbBoard [data-dradd="0.0"]`))
    rows[B].role = 'TEST ROLE'
    setSlotVal(`d:0.0.${B}`, 'bane')
    await act(async () => { view.afterSchedMutate(); notify() })

    await click($(`#sbBoard [data-drdel="0.0.${B}"]`))

    const row = newest()
    expect(row, 'the deletion reached the log').toBeTruthy()
    expect(row!.lbl).toContain('Duty row removed')
    expect(row!.lbl).toContain('TEST ROLE')
    expect(row!.lbl).toContain('Ranger')
  })

  it('a removed flying line carries its callsign and its crew', async () => {
    await goEdit()
    await act(async () => { openScheduler(0) })
    const d = DAYS[0]
    const gi = d.waves.length - 1
    const w = d.waves[gi]
    /* a fresh single-aircraft line, deleted whole — net zero on the model,
       so the test needs no teardown of its own */
    await click($(`#sbBoard [data-gline="0.${gi}"]`))
    const li = w.formations.length - 1
    const f = w.formations[li]
    f.cs = 'ZULU'; f.msn = 'TEST RUN'
    setSlotVal(`0.${gi}.${li}.0.p`, 'bane')
    await act(async () => { view.afterSchedMutate(); notify() })

    await click(document.querySelector(`#sbBoard [data-ldel="0.${gi}.${li}.0"]`))

    const row = newest()
    expect(row, 'the deletion reached the log').toBeTruthy()
    expect(row!.lbl).toContain('Line removed')
    expect(row!.lbl).toContain('ZULU')
    expect(row!.lbl).toContain('Ranger')
  })
})
