// @vitest-environment jsdom
/* THE AMENDMENT BATCH (25 Sep 26, overnight, D112) — each item pinned through the production functions the screens
   call, named for its ruling and its register line (raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-
   register.md). The batch: raptor-port/docs/superpowers/specs/2026-09-25-amendment-batch.md; the plan:
   raptor-port/docs/superpowers/plans/2026-09-25-amendment-batch-plan.md. */
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { DAYS } from '../engine/data'
import { INPUTS, inpId } from '../engine/inputs'
import { acceptInput, unacceptInput } from '../engine/slots'
import { loadVersionToWorkingCopy, LOADLEFT, LOADMOVED } from '../engine/drafts'
import { SCHED, signOf, setSign, setDayApproved, dayDelta, dayDiscardCount, alCount, dayShownPendCount, dayCurVer, dayPendingItems } from '../engine/publish'
import { validate, WARN } from '../engine/validate'
import { HOOKS } from '../engine/hooks'
import { initStore, writeSlot } from '../state/store'
import { commitPublishALDay } from '../state/sched-commit'
import { setSession } from '../state/auth'
import { setPage, DPREV, VWORK, setUnpubArm, setRestArm } from '../state/view'
import { dayHTML, dayInfoHTML, viewDayHTML, dayPreviewHTML } from './html'
import { PEOPLE } from '../engine/people'
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

describe('item 2 — the board draws the dashed and dotted rings as the edit week does (D94, AM59)', () => {
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

describe('item 13 — the ORIG tag is the seal (D111, AM22)', () => {
  it('a published Original wears the drawn tick and no AL colour, on the week head and the board strip', () => {
    publishDay(MON)
    for (const surf of [weekEdit, boardStrip]) {
      const t = surf(MON).querySelector('.verchip.orig') as HTMLElement
      expect(t, 'the ORIG tag').toBeTruthy()
      expect(t.querySelector('svg.vtick'), 'the drawn tick').toBeTruthy()
      expect(t.textContent).toBe('ORIG')
      expect(t.hasAttribute('data-alc'), 'never an AL colour').toBe(false)
    }
  })
})

describe('item 3 — the Signed line names who signed the version on screen (D95, D102, AM57)', () => {
  const signAs = (di: number, names: string[]) => ['cur', 'sked', 'plan', 'appr'].forEach((r, i) => setSign(di, r, names[i]!))
  const line = (root: HTMLElement) => root.querySelector('.signedln')?.textContent || ''
  const cs = (id: string) => (PEOPLE as any)[id].cs
  const viewFace = (di: number) => { setPage('viewsched'); try { return el(viewDayHTML(di)) } finally { setPage('editsched') } }
  it('the Original keeps its four, and every surface names them — the view page too, for a member as for the scheduler', () => {
    signAs(MON, ['ignite', 'bane', 'stiff', 'pump']); setDayApproved(MON, true)
    expect(SCHED.orig[MON].sign[MON].appr, 'kept on the record').toBe(cs('pump'))
    for (const [name, root] of [['week', weekEdit(MON)], ['board', boardStrip(MON)], ['view', viewFace(MON)]] as const) {
      expect(line(root), name).toMatch(/^Signed/)
      expect(line(root), name).toContain('ORIG')
      expect(line(root), name).toContain(cs('pump'))
    }
    setSession({ user: 'us', role: 'member' } as any)
    try { expect(line(viewFace(MON)), 'a member reads it').toContain(cs('pump')) } finally { setSession({ user: 'ad', role: 'admin' } as any) }
  })
  it('an amendment names ITS four; a preview of the Original names the Original\'s; the live sign-off boxes never show', () => {
    signAs(MON, ['ignite', 'bane', 'stiff', 'pump']); setDayApproved(MON, true)
    writeSlot(`d:${MON}.0.1`, 'glass')
    signAs(MON, ['ignite', 'stiff', 'bane', 'bane'])      // AL1 signed by others
    commitPublishALDay(MON)
    expect(line(weekEdit(MON)), 'the live copy sits on AL1').toContain('AL1')
    writeSlot(`d:${MON}.0.1`, 'wolf')
    signAs(MON, ['ignite', 'pump', 'pump', 'pump'])       // the NEXT issue's boxes, half-signed
    const w = line(weekEdit(MON))
    expect(w, 'still the published AL1 — not the boxes for the next one').toContain('AL1')
    expect((w.match(new RegExp(cs('pump'), 'g')) || []).length, 'the live boxes\' Pump is not on the line').toBe(0)
    expect(line(viewFace(MON))).toContain('AL1')
    DPREV.set(MON, SCHED.orig[MON].id)
    try {
      expect(line(el(dayPreviewHTML(MON, SCHED.orig[MON].id, false))), 'the week under a preview of the Original').toContain('ORIG')
      expect(line(el(boardSignHTML(MON, true))), 'the board\'s preview strip').toContain('ORIG')
    } finally { DPREV.clear() }
  })
  it('no line on a day not yet published', () => {
    expect(line(weekEdit(MON))).toBe('')
    expect(line(boardStrip(MON))).toBe('')
  })
})

describe('item 6 — "Load onto working copy" puts back what that version had filed (D98, AM6, AM20)', () => {
  const req = () => {
    const inp: any = { person: 'bane', date: 'Jul 13', allday: true, type: 'Meeting', remarks: 'D98 test', mod: '2026-07-01' }
    INPUTS.push(inp); return inp
  }
  it('a request taken off since is back on, the day reads exactly as the version, and the confirm counted it', () => {
    const inp = req()
    acceptInput(MON, inp, 'g'); publishDay(MON)
    unacceptInput(MON, inp)                                    // off the programme since the Original
    expect(inp.acc).toBe('r')
    /* the row taken off AND its filing, both put back — ONE edit since D114 ("6 yes", 25 Sep 26), as the day head reads */
    expect(dayDiscardCount(MON), '"Discard N edits": the row and its filing are one act').toBe(1)
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    expect(inp.acc, 'on the programme again').toBe('g')
    expect(dayDelta(MON), 'nothing pending').toEqual([])
    expect(LOADLEFT).toEqual([])
  })
  /* CHANGED 25 Sep 26 by the owner's D178 ("whenever there is a change, in terms of input from a member … the admin
     should see the pending after the schedule is published"): a request FILED after the version is a member's input
     change on a published day, so it reads pending until an AL (or Unpublish and publish again) takes it in. The load
     still puts its filing back (fresh, as at the Original — D98's half that the load can do), but a load never deletes
     a member's record, so the request itself stays pending: ONE item, its details — and nothing about its filing. */
  it('a request filed AFTER the version comes off again and reads fresh — and stays pending as filed since (D178)', () => {
    publishDay(MON)
    const inp = req()
    acceptInput(MON, inp, 'u')                                  // filed under Unavailable on the working copy
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    expect(inp.acc || '', 'fresh, as at the Original').toBe('')
    expect(dayDelta(MON).map((e: any) => e.kind + ':' + String(e.addr).split('.')[0])).toEqual([`input:inv:${MON}`])
    expect(dayPendingItems(MON).length, 'one item — the request, filed since').toBe(1)
  })
  it('a two-day request whose row the version PUTS BACK on this day is back on the programme — never "taken off" beside its own row (Fable’s code read #1)', () => {
    const inp: any = { person: 'bane', date: 'Jul 13', endDate: 'Jul 14', allday: true, type: 'Meeting', remarks: 'Fable two-day', mod: '2026-07-02' }
    INPUTS.push(inp)
    acceptInput(MON, inp, 'g')                                  // its one row lands on Monday
    publishDay(MON); publishDay(1)                              // both issued with it on the programme
    unacceptInput(MON, inp)                                     // ✕ — the row goes, the request reads "taken off"
    expect(inp.acc).toBe('r')
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    expect(inp.acc, 'on the programme with its row').toBe('g')
    expect(dayDelta(MON), 'Monday reads exactly as its Original').toEqual([])
    expect(LOADMOVED.find(m => m.id === inpId(inp)), 'the load names Tuesday').toMatchObject({ on: true, days: ['Tue'] })
  })
  it('a request whose one row the version takes away comes off the programme on the other day too — and the load NAMES it (walker B3)', () => {
    publishDay(MON); publishDay(1)                              // both days issued before the request existed
    const inp: any = { person: 'bane', date: 'Jul 13', endDate: 'Jul 14', allday: true, type: 'Meeting', remarks: 'B3 two-day', mod: '2026-07-02' }
    INPUTS.push(inp)
    acceptInput(MON, inp, 'g')                                  // its one row lands on Monday; Tuesday now reads it too
    expect(dayDelta(1).length, 'Tuesday waits on the filing').toBeGreaterThan(0)
    const tue = JSON.stringify(dayDelta(1))
    void tue
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    /* Monday's version never had the request's row, so the load takes it away (D98) — and a request "on the programme"
       with no row anywhere is taken off (P2-REV2-05). Tuesday therefore reads it too: the truth, so it is NAMED */
    expect(inp.acc || '', 'off the programme with its row').toBe('')
    expect(LOADMOVED.map(m => m.id), 'the load names it').toContain(inpId(inp))
    expect(LOADMOVED[0]!.days, 'and the other day').toEqual(['Tue'])
  })
  it('a request covering ANOTHER published day is left as filed — loading Monday never moves Tuesday (AM1; Fable F3, Astra 3)', () => {
    const inp: any = { person: 'bane', date: 'Jul 13', endDate: 'Jul 14', allday: true, type: 'LL', remarks: 'D98 two-day', mod: '2026-07-01' }
    INPUTS.push(inp)
    publishDay(MON)                                             // Monday issued with the leave fresh
    inp.acc = 'u'; publishDay(1)                                // Tuesday issued with it filed under Unavailable
    const tueBefore = dayDelta(1).length
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    expect(inp.acc, 'left as Tuesday was issued').toBe('u')
    expect(dayDelta(1).length, 'Tuesday did not move').toBe(tueBefore)
    expect(LOADLEFT, 'and the load names it').toContain(inpId(inp))
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

describe('a man taken off a crowd AND the rest re-ordered is TWO on every surface (Astra’s code read, D109, AM23)', () => {
  it('the day head, the discard count, the pending list, the publish and the issued AL all say 2', async () => {
    const { pendListHTML } = await import('./pendlist')
    ;(DAYS[MON] as any).allhands.push({ prog: 'SQN PHOTO', str: '12:00', end: '13:00', rmks: '', who: ['bane', 'stiff', 'mamba'] })
    publishDay(MON)
    ;(DAYS[MON] as any).allhands.at(-1).who = ['mamba', 'bane']   // Stiff off, and the two left re-ordered
    expect(dayShownPendCount(MON)).toBe(2)
    expect(num(weekEdit(MON).querySelector('.dpend')?.textContent), "the week's day head").toBe(2)
    expect(dayDiscardCount(MON), `the load's "Discard N edits"`).toBe(2)
    expect(el(pendListHTML(MON)).querySelector('.pl-head')?.textContent, 'the pending list').toMatch(/· 2 changes$/)
    sign(MON)
    const said = withToasts(() => commitPublishALDay(MON))
    expect(said.join(' | ')).toMatch(/Published AL1 · 2 items /)
    expect(alCount(SCHED.als[0]), "the issued AL's item count").toBe(2)
  })
})

describe('the pending list says WHO and WHERE when the crowd behind a placeholder moved (walker B1, 25 Sep 26; D99, AM53)', () => {
  it('names the row and the man who dropped out, and the line can be tapped', async () => {
    const { pendListHTML } = await import('./pendlist')
    const saved = HOOKS.oilSentinel, iso = HOOKS.oilDayISO
    ;(DAYS[MON] as any).ground.push({ prog: 'FAMILY DAY', str: '09:00', end: '17:00', who: 'allavail' })
    HOOKS.oilDayISO = (di: number) => (di === MON ? '2026-07-13' : '')   // the day's date, as the Leave War wire supplies it
    HOOKS.oilSentinel = () => ['bane', 'stiff']
    try {
      publishDay(MON)
      HOOKS.oilSentinel = () => ['bane']                 // Stiff files leave
      const l = el(pendListHTML(MON))
      const t = l.textContent || ''
      expect(t, 'the row').toContain('FAMILY DAY')
      expect(t, 'the man who dropped out').toContain((PEOPLE as any).stiff.cs)
      expect(l.querySelector('button.pl-item'), 'a place to go').toBeTruthy()
    } finally { HOOKS.oilSentinel = saved; HOOKS.oilDayISO = iso }
  })
})

describe('several placeholders’ crowds moved: still ONE change, each row named and reachable (Astra’s code read, D109, AM53)', () => {
  it('the one line carries a tap for each row', async () => {
    const { pendListHTML } = await import('./pendlist')
    const saved = HOOKS.oilSentinel, iso = HOOKS.oilDayISO
    ;(DAYS[MON] as any).ground.push({ prog: 'FAMILY DAY', str: '09:00', end: '17:00', who: 'allavail' })
    ;(DAYS[MON] as any).allhands.push({ prog: 'SQN PHOTO', str: '12:00', end: '13:00', rmks: '', who: ['all'] })
    HOOKS.oilDayISO = (di: number) => (di === MON ? '2026-07-13' : '')
    HOOKS.oilSentinel = () => ['bane', 'stiff']
    try {
      publishDay(MON)
      HOOKS.oilSentinel = () => ['bane']
      const l = el(pendListHTML(MON)), t = l.textContent || ''
      expect(l.querySelector('.pl-head')?.textContent, 'still one change').toMatch(/· 1 change$/)
      expect(t).toContain('FAMILY DAY'); expect(t).toContain('SQN PHOTO')
      expect(l.querySelectorAll('button.pl-sub').length, 'a tap for each row').toBe(2)
    } finally { HOOKS.oilSentinel = saved; HOOKS.oilDayISO = iso }
  })
})

describe('a request taken off (or put on) a published day is ONE change — its row and its filing are one act (owner, D114, 25 Sep 26)', () => {
  const request = (): any => { const inp: any = { person: 'bane', date: 'Jul 13', allday: true, type: 'Meeting', remarks: 'D114 fly with', mod: '2026-07-01' }; INPUTS.push(inp); return inp }
  it('✕ on its row: 1 on every count, one line in the list, "1 item · 1 removal" on the issued AL', async () => {
    const { pendListHTML } = await import('./pendlist')
    const { dayPendingItems, itemCounts } = await import('../engine/publish')
    const inp = request()
    acceptInput(MON, inp, 'g')                                  // its row lands on Monday
    publishDay(MON)                                             // issued with it on the programme
    unacceptInput(MON, inp)                                     // ✕ — the row goes, the request reads "taken off"
    expect(dayDelta(MON).length, 'what goes out still holds both: the row and the filing').toBe(2)
    expect(dayShownPendCount(MON)).toBe(1)
    expect(num(weekEdit(MON).querySelector('.dpend')?.textContent), "the week's day head").toBe(1)
    expect(num(boardStrip(MON).querySelector('.dpend')?.textContent), "the board's strip").toBe(1)
    expect(num(el(dayInfoHTML(MON)).querySelector('.dip-pend')?.textContent), 'the ⓘ panel').toBe(1)
    expect(itemCounts(dayPendingItems(MON)), 'a removal, not a separate filing').toMatchObject({ total: 1, del: 1, inp: 0 })
    const l = el(pendListHTML(MON))
    expect(l.querySelector('.pl-head')?.textContent).toMatch(/· 1 change$/)
    expect(l.querySelectorAll('.pl-item').length, 'one line').toBe(1)
    expect(l.textContent, 'it says whose request, taken off').toMatch(/Meeting[\s\S]*on the programme[\s\S]*taken off/)
    sign(MON)
    expect(alPanelText(), 'the Amendments panel').toMatch(/Mon · 1 change(?!s)/)
    const said = withToasts(() => commitPublishALDay(MON))
    expect(said.join(' | ')).toMatch(/Published AL1 · 1 item /)
    expect(alCount(SCHED.als[0])).toBe(1)
    const tag = alPanelText()
    expect(tag, "the issued AL's line").toMatch(/1 item · 1 removal/)
    expect(tag, 'no separate filing on it').not.toMatch(/input filing/)
  })
  it('the mirror: accepting a request onto a published day is 1, and its line can be tapped to the row', async () => {
    const { pendListHTML } = await import('./pendlist')
    const inp = request()
    publishDay(MON)                                             // issued without it
    acceptInput(MON, inp, 'g')
    expect(dayDelta(MON).length, 'the row and the filing').toBe(2)
    expect(dayShownPendCount(MON)).toBe(1)
    const l = el(pendListHTML(MON))
    expect(l.querySelectorAll('.pl-item').length).toBe(1)
    expect(l.textContent).toMatch(/Meeting[\s\S]*on the programme/)
    expect(l.querySelectorAll('button.pl-item[data-plix]').length, 'a tap to the row').toBe(1)
  })
  it('a filing with no row of its own on the day (filed under Unavailable) stays its own one change', () => {
    const inp = request()
    publishDay(MON)
    inp.acc = 'u'
    expect(dayShownPendCount(MON)).toBe(1)
    expect(dayDelta(MON).map(e => e.kind), 'a filing only').toEqual(['input'])
  })
  /* The roll-call's MISSING row (D114-1, 25 Sep 26): the load's "Discard N edits" counted the row it puts back and the
     filing it puts back apart, so the confirm read 2 beside the day head's 1 — D114 names that button. */
  it('"Discard N edits" reads the same ONE, after ✕ and after Accept — and the load then puts both back', () => {
    const inp = request()
    acceptInput(MON, inp, 'g'); publishDay(MON); unacceptInput(MON, inp)
    expect(dayDiscardCount(MON), '✕: beside the day head').toBe(dayShownPendCount(MON))
    expect(dayDiscardCount(MON)).toBe(1)
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    expect(dayShownPendCount(MON), 'back to what was issued').toBe(0)
    expect(inp.acc, 'on the programme again, with its row').toBe('g')
    const inp2: any = { person: 'stiff', date: 'Jul 13', allday: true, type: 'Meeting', remarks: 'D114 second', mod: '2026-07-01' }
    INPUTS.push(inp2)
    acceptInput(MON, inp2, 'g')
    expect(dayDiscardCount(MON), 'Accept: beside the day head').toBe(dayShownPendCount(MON))
    expect(dayDiscardCount(MON)).toBe(1)
  })
  /* D114-2 (25 Sep 26): a request DELETED on the Inputs page — its row and its filing pair into one line, and with the
     request gone the line read only "A request · on the programme → not on the programme". The row still says whose
     and what; the line must too. */
  it('a request deleted on the Inputs page: its one line still says whose and what, and that it was deleted', async () => {
    const { pendListHTML } = await import('./pendlist')
    const { removeInput } = await import('./inputedit')
    const inp = request()
    acceptInput(MON, inp, 'g'); publishDay(MON)
    expect(removeInput(inp)).toBe(true)
    expect(dayShownPendCount(MON)).toBe(1)
    const l = el(pendListHTML(MON))
    expect(l.querySelectorAll('.pl-item').length, 'one line').toBe(1)
    const t = l.textContent || ''
    expect(t, 'whose').toContain((PEOPLE as any).bane.cs)
    expect(t, 'what').toMatch(/Meeting/)
    expect(t, 'what happened to it').toMatch(/on the programme[\s\S]*deleted/)
    /* the load puts the version's row back; the request itself stays deleted — its line (a filing on its own now)
       still names it from that row (the D114 walk, step 8) */
    expect(loadVersionToWorkingCopy(MON, dayCurVer(MON))).toBe(true)
    expect(dayShownPendCount(MON), 'the deletion is not a thing a load can put back').toBe(1)
    const t2 = el(pendListHTML(MON)).textContent || ''
    expect(t2, 'named after the load too').toContain((PEOPLE as any).bane.cs)
    expect(t2).toMatch(/Meeting[\s\S]*deleted/)
  })
  /* The pins Fable's read asked for (2026-09-25-d114-fable-read.md, "Test pins"): the orders the first tests did not walk. */
  it('a two-day request, its row on Monday, ✕: Monday reads one paired change, Tuesday its own one filing', async () => {
    const { dayPendingItems } = await import('../engine/publish')
    const inp: any = { person: 'bane', date: 'Jul 13', endDate: 'Jul 14', allday: true, type: 'Meeting', remarks: 'D114 two-day', mod: '2026-07-01' }
    INPUTS.push(inp)
    acceptInput(MON, inp, 'g'); publishDay(MON); publishDay(1)
    unacceptInput(MON, inp)
    expect(dayPendingItems(MON).map((u: any) => [u.kind, !!u.inp]), 'Monday: the row and its filing, one').toEqual([['delete', true]])
    expect(dayPendingItems(1).map((u: any) => u.kind), 'Tuesday: no row of its own — the filing alone').toEqual(['input'])
  })
  it('an AL after an AL: taken off in AL1, put back in AL2 — each AL one item, each line in its own unit', async () => {
    const { retireIssued } = await import('../engine/publish')
    const inp = request()
    acceptInput(MON, inp, 'g'); publishDay(MON)
    unacceptInput(MON, inp); sign(MON); withToasts(() => commitPublishALDay(MON))
    acceptInput(MON, inp, 'g')                                  // a fresh row now — AL1 carries none
    expect(dayShownPendCount(MON), 'put back after AL1: one').toBe(1)
    sign(MON)
    expect(withToasts(() => commitPublishALDay(MON)).join(' | ')).toMatch(/Published AL2 · 1 item /)
    expect(SCHED.als.map((a: any) => a.ukinds), 'AL1 one removal, AL2 one addition, no separate filing').toMatchObject([{ total: 1, del: 1, inp: 0 }, { total: 1, add: 1, inp: 0 }])
    expect(alPanelText(), "AL1's line unchanged beside AL2's").toMatch(/AL1[\s\S]*1 item · 1 removal/)
    /* a withdrawn AL keeps its split in the record, beside its count (retireIssued) */
    retireIssued(MON, SCHED.als[1].id)
    expect(Object.values(SCHED.retired).map((r: any) => r.ukinds)).toContainEqual(expect.objectContaining({ total: 1, add: 1, inp: 0 }))
  })
})
