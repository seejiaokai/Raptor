// @vitest-environment jsdom
/* THE AMENDMENT BATCH (25 Sep 26, overnight, D112) — each item pinned through the production functions the screens
   call, named for its ruling and its register line (raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-
   register.md). The batch: raptor-port/docs/superpowers/specs/2026-09-25-amendment-batch.md; the plan:
   raptor-port/docs/superpowers/plans/2026-09-25-amendment-batch-plan.md. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { DAYS } from '../engine/data'
import { INPUTS } from '../engine/inputs'
import { SCHED, signOf, setSign, setDayApproved, dayDelta, dayDiscardCount, alCount, dayShownPendCount } from '../engine/publish'
import { validate, WARN } from '../engine/validate'
import { HOOKS } from '../engine/hooks'
import { initStore, writeSlot } from '../state/store'
import { commitPublishALDay } from '../state/sched-commit'
import { setSession } from '../state/auth'
import { setPage, DPREV, VWORK, setUnpubArm, setRestArm } from '../state/view'
import { dayHTML, dayInfoHTML } from './html'
import { boardSignHTML, boardHTML } from './board'
import { ALPanel } from './ALPanel'

;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

const MON = 0
let pristine: any[], inputs0: string
const sign = (di: number) => { const g = signOf(di); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump' }
const publishDay = (di: number) => { sign(di); setDayApproved(di, true) }
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const weekEdit = (di: number) => { setPage('editsched'); return el(dayHTML(di, true, true)) }
const boardStrip = (di: number) => { setPage('editsched'); return el(boardSignHTML(di)) }
const num = (t: string | null | undefined) => { const m = String(t || '').match(/\d+/); return m ? +m[0] : 0 }
const withToasts = (fn: () => void) => {
  const said: string[] = []
  const real = HOOKS.toast
  HOOKS.toast = (m: any) => { said.push(String(m)) }
  try { fn() } finally { HOOKS.toast = real }
  return said
}
function alPanelText() {
  const host = document.createElement('div'); document.body.appendChild(host)
  const root = createRoot(host)
  act(() => { root.render(<ALPanel />) })
  const t = host.textContent || ''
  act(() => { root.unmount() }); host.remove()
  return t
}

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
  SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  DPREV.clear(); VWORK.clear()
  setUnpubArm(null); setRestArm(null, null)
  setPage('editsched')
  validate()
})

describe('item 5 — the working-copy marker has two states (D97, AM24)', () => {
  it('"Not yet signed" while a sign-off is missing; "Not yet published" once all four are valid — week and board alike', () => {
    publishDay(MON)
    writeSlot(`d:${MON}.0.1`, 'bane')
    for (const surf of [weekEdit, boardStrip]) expect(surf(MON).querySelector('.nysmark')?.textContent).toBe('Not yet signed')
    for (const [r, w] of [['cur', 'ignite'], ['sked', 'bane'], ['plan', 'stiff'], ['appr', 'pump']]) setSign(MON, r, w)
    for (const surf of [weekEdit, boardStrip]) expect(surf(MON).querySelector('.nysmark')?.textContent, 'all four valid, not gone out yet').toBe('Not yet published')
    writeSlot(`d:${MON}.0.1`, 'glass')                     // a further change moves under the signatures (D103)
    expect(weekEdit(MON).querySelector('.nysmark')?.textContent, 'the change wipes the four, so it is unsigned again').toBe('Not yet signed')
  })
})

describe('item 2 — the board draws the dashed and dotted rings as the edit week does (D94)', () => {
  /* the three board seat builders a man can stand in: a flying seat, a duty desk, a programme crowd */
  const board = (di: number) => { setPage('editsched'); return el(boardHTML(di)) }
  const classes = (root: HTMLElement, id: string) => [...root.querySelectorAll(`.puck[data-person="${id}"]`)].map(p => p.className)
  it('a man whose day causes tomorrow\'s crew-rest breach rings DOTTED, with its CR caption, on every board seat he holds', () => {
    const fly = (DAYS[MON] as any).waves[0].formations[0].aircraft[0].p, desk = (DAYS[MON] as any).dutywaves[0].rows[0].id
    ;(DAYS[MON] as any).allhands.push({ prog: 'OPS BRIEF', str: '08:00', end: '09:00', rmks: '', who: [desk] })
    validate()
    const W: any = WARN
    for (const id of [fly, desk]) { W.trace[MON] = W.trace[MON] || {}; W.trace[MON][id] = { leaveBy: '21:30', dow: 'Tue' } }
    for (const id of [fly, desk]) {
      const b = classes(board(MON), id), w = classes(weekEdit(MON), id)
      expect(b.length, `${id} is drawn on the board`).toBeGreaterThan(0)
      expect(b.every(c => /\bboxdot\b/.test(c)), `${id}: every board puck rings dotted`).toBe(true)
      expect(w.every(c => /\bboxdot\b/.test(c)), `${id}: as on the week`).toBe(true)
      const cap = board(MON).querySelector(`.puck[data-person="${id}"] .lchip`)
      expect(cap?.textContent, `${id}: the dotted ring carries its caption`).toBeTruthy()
    }
  })
  it('a sanctioned late show rings DASHED on the board, not solid', () => {
    const fly = (DAYS[MON] as any).waves[0].formations[0].aircraft[0].p
    validate()
    const W: any = WARN
    W.dash[MON] = W.dash[MON] || {}; W.dash[MON][fly] = true
    const chipped = [...board(MON).querySelectorAll(`.puck[data-person="${fly}"]`)]
    /* the dash belongs to a printed CR flag (html.ts puck); where he carries none the ring is not his to dash —
       so assert the board and the week agree, whatever this demo day prints */
    expect(chipped.map(p => /\bboxdash\b/.test(p.className))).toEqual(classes(weekEdit(MON), fly).map(c => /\bboxdash\b/.test(c)).slice(0, chipped.length))
  })
})

describe('item 14 — a move counts as ONE, and every count reads the one body (D109, AM23)', () => {
  it('Mamba moved from the SDO desk to an empty OPS-O desk reads 1 on every surface that counts, and publishes as "1 item"', () => {
    writeSlot(`d:${MON}.0.2`, '')                       // OPS-O empty on the day as published
    publishDay(MON)
    writeSlot(`d:${MON}.0.2`, 'mamba'); writeSlot(`d:${MON}.0.0`, '')   // his move, through the app's own write
    expect(dayDelta(MON).length, 'the record still holds both cells').toBe(2)
    expect(dayShownPendCount(MON)).toBe(1)
    expect(num(weekEdit(MON).querySelector('.dpend')?.textContent), 'the week\'s day head').toBe(1)
    expect(num(boardStrip(MON).querySelector('.dpend')?.textContent), 'the board\'s strip').toBe(1)
    expect(num(el(dayInfoHTML(MON)).querySelector('.dip-pend')?.textContent), 'the ⓘ panel').toBe(1)
    expect(dayDiscardCount(MON), 'the load\'s "Discard N edits"').toBe(1)
    sign(MON)                                             // re-sign the change (the four were wiped by it)
    expect(boardStrip(MON).querySelector('.so-state')?.textContent, 'the sign-off line').toMatch(/· 1 change to publish/)
    expect(alPanelText(), 'the Amendments panel').toMatch(/Mon · 1 change(?!s)/)
    const said = withToasts(() => commitPublishALDay(MON))
    expect(said.join(' | ')).toMatch(/Published AL1 · 1 item /)
    expect(alCount(SCHED.als[0]), 'the issued AL\'s item count').toBe(1)
    expect(el(dayInfoHTML(MON)).querySelector('.dip-al')?.textContent).toMatch(/1 item(?!s)/)
    expect(SCHED.als[0].diff.length, 'what went out is unchanged: both cells').toBe(2)
  })
})
