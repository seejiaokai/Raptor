// @vitest-environment jsdom
/* [DRAFT-PENDING] — THE DEFECTS FABLE'S SCENARIO DESIGN PREDICTED (28 Sep 26, docs/handpass/2026-09-28-draft-pending.md §8),
   each pinned red first through the app's own code before its fix.

   P1  the OG tag follows its ROW after a reorder (it was kept by position, so a row dragged above another handed the
       tag to whoever slid into the old place)
   P3  a member's tap on a line about a published day, on View-only Sched, goes to the day's working draft (the issued
       face draws nothing to land on; the tap said "open it on the board" — a member has none)
   P4  a look at a saved plan or an older version wears no OG tag (a preview reads a document, not your news)
   P5  the board's Unavailable rows carry the input's address, so an absence line lands there too (Astra DP-08)
   P6  a Quals change on "To go out" names who made it and when (review log F5)
   P7  the ⓘ day panel on a day not yet published speaks the chip's words, never the raw count (D118)
   P9  "Discard marks" is a line
   P12 a door's reason never outlives the command it was handed in for */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { storeBackend, HOOKS } from '../engine/hooks'
import { DAYS } from '../engine/data'
import { PEOPLE } from '../engine/people'
import { INPUTS, inpId } from '../engine/inputs'
import { ELOG, elogClear } from '../engine/editlog'
import { SCHED, signOf, setDayApproved, dayApproved, alAttr } from '../engine/publish'
import { setSlotVal, slotVal } from '../engine/slots'
import { moveDutyRow } from '../engine/reorder'
import { ensureRowIds } from '../engine/rowids'
import { draftDup } from '../engine/drafts'
import { initStore, resetSession, writeInputs, commitDiscardPending } from '../state/store'
import { signIn, sessionFor } from '../state/accounts'
import { changesLoad } from '../state/changes'
import { updatePersonField } from '../state/quals-write'
import { elogReason } from '../state/changelines'
import { setPage, VWORK } from '../state/view'
import { dayInfoHTML, withDaySnap } from './html'
import { sbUnavailPanel } from './board-html'
import { pendListHTML } from './pendlist'
import { jumpToChange } from './interactions'
import './changesmodel'

const fake = new Map<string, string>()
const as = (u: string, p: string) => resetSession(sessionFor(signIn(u, p) as any))   // ad = Saber (admin), us = Ranger (member)
let DAYS0 = '', INP0 = '', SCHED0 = ''
beforeAll(() => {
  storeBackend.impl = { getItem: k => (fake.has(k) ? fake.get(k)! : null), setItem: (k, v) => { fake.set(k, v) } }
  initStore()
  ensureRowIds(DAYS)
  DAYS0 = JSON.stringify(DAYS); INP0 = JSON.stringify(INPUTS); SCHED0 = JSON.stringify(SCHED)
})
afterAll(() => { storeBackend.impl = null })
beforeEach(() => {
  JSON.parse(DAYS0).forEach((d: any, i: number) => { (DAYS as any)[i] = d })
  INPUTS.length = 0; JSON.parse(INP0).forEach((r: any) => INPUTS.push(r))
  Object.assign(SCHED, JSON.parse(SCHED0))
  fake.delete('sqn142_changeseen'); changesLoad()
  elogClear()
  setPage('editsched')
})
const el = (html: string) => { const d = document.createElement('div'); d.innerHTML = html; return d }
const draftDay = () => { for (let i = 0; i < 7; i++) if (!dayApproved(i) && ((DAYS as any)[i].dutywaves?.[0]?.rows?.length || 0) >= 2) return i; throw new Error('no draft day with two duty rows') }
const someoneNot = (v: any) => Object.keys(PEOPLE).find(k => k !== v && !(PEOPLE as any)[k].pers && !(PEOPLE as any)[k].special)!
/* Ranger puts a man on a duty desk of a day not yet published; Saber is the one looking */
function rangerFills(di: number, ri: number) {
  as('us', 'us')
  const key = `d:${di}.0.${ri}`
  const who = someoneNot(slotVal(key))
  setSlotVal(key, who)
  as('ad', 'a')
  return who
}

describe('P1 — the OG tag follows its row, not its place', () => {
  it('a duty row dragged below the next keeps its tag; the man who slid into the old place gets none', () => {
    const di = draftDay()
    const who = rangerFills(di, 0)
    expect(alAttr(`d:${di}.0.0`), 'the new-to-you desk wears the tag').toContain('data-og')
    moveDutyRow(di, 0, 0, 1)
    expect((DAYS as any)[di].dutywaves[0].rows[1].id, 'the row moved').toBe(who)
    expect(alAttr(`d:${di}.0.1`), 'the tag went with it').toContain('data-og')
    expect(alAttr(`d:${di}.0.0`), 'and the desk that slid up is not new to anyone').not.toContain('data-og')
  })
})

describe('P4 — a look at a plan wears no OG tag', () => {
  it('the saved plan of the day, previewed, shows none — even on the desk that is new to you live', () => {
    const di = draftDay()
    rangerFills(di, 0)
    expect(alAttr(`d:${di}.0.0`)).toContain('data-og')
    const dr: any = draftDup(di)
    const id = dr && (dr.id ?? dr)
    const inLook = withDaySnap(di, 'd:' + id, (ok: any) => { expect(ok, 'the plan resolves').toBe(true); return alAttr(`d:${di}.0.0`) })
    expect(inLook, 'a preview reads a document').not.toContain('data-og')
  })
})

describe('P7 — the ⓘ panel on a day not yet published speaks the chip\'s words', () => {
  it('"1 new", never "N unpublished edits"', () => {
    const di = draftDay()
    rangerFills(di, 0)
    const t = el(dayInfoHTML(di)).textContent || ''
    expect(t).not.toMatch(/unpublished edit/)
    expect(t).toMatch(/1\s+new/)
  })
})

describe('P5 — the board\'s Unavailable rows carry the input\'s address', () => {
  it('a leave on the day: its board row is where an absence line lands', () => {
    as('ad', 'a')
    const d: any = (DAYS as any)[0]
    const r: any = { person: 'bane', date: d.dt, yr: 2026, allday: true, type: 'LL', remarks: '', acc: 'u' }
    inpId(r); INPUTS.unshift(r)
    expect(sbUnavailPanel(d, 0)).toContain(`data-inprow="${r.iid}"`)
  })
})

describe('P6 — a Quals change on "To go out" says who and when', () => {
  it('a CAT changed after Monday went out names the admin who changed it', () => {
    as('ad', 'a')
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(0, true)
    const man = (DAYS as any)[0].waves[0].formations[0].aircraft[0].p
    const p: any = (PEOPLE as any)[man]
    const q0 = p.q
    try {
      expect(updatePersonField(man, { cat: q0 === 'C' ? 'B' : 'C' })).toBeNull()
      const who = [...el(pendListHTML(0)).querySelectorAll('.pl-who')].map(e => e.textContent || '').join('|')
      expect(who, 'the To go out line names who changed it').toContain('Saber')
    } finally { p.q = q0 }
  })

  it('…and when the item lists several things at once, it still names who', () => {
    as('ad', 'a')
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(0, true)
    /* two men flying Monday have their CAT changed — the day's "what it shows" item lists both (the walk met the same
       shape with a CAT change and the warning it raised) */
    const onMon: string[] = []
    ;(DAYS as any)[0].waves.forEach((w: any) => (w.formations || []).forEach((f: any) => (f.aircraft || []).forEach((a: any) => { for (const id of [a.p, a.w]) if (id && !onMon.includes(id)) onMon.push(id) })))
    const two = onMon.filter(id => (PEOPLE as any)[id] && !(PEOPLE as any)[id].special).slice(0, 2)
    const q0 = two.map(id => (PEOPLE as any)[id].q)
    try {
      two.forEach((id, i) => expect(updatePersonField(id, { cat: q0[i] === 'C' ? 'B' : 'C' })).toBeNull())
      const html = el(pendListHTML(0))
      const multi = html.querySelector('.pl-multi')
      expect(multi, 'several things on one item').toBeTruthy()
      expect(multi!.querySelector('.pl-who')?.textContent || '').toContain('Saber')
    } finally { two.forEach((id, i) => { (PEOPLE as any)[id].q = q0[i] }) }
  })
})

describe('P3 — a member taps a line about a published day on View-only Sched', () => {
  it('the day switches to its working draft, where the change is', () => {
    as('ad', 'a')
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(0, true)
    as('us', 'us')
    setPage('viewsched')
    VWORK.delete(0)
    try {
      jumpToChange('d:0.0.0', 0)
      expect(VWORK.has(0)).toBe(true)
    } finally { VWORK.delete(0); setPage('editsched') }
  })
})

describe('P9 — Discard marks is a line', () => {
  it('clearing the marks on a day not yet published leaves a line on that day', () => {
    const di = draftDay()
    as('ad', 'a')
    const key = `d:${di}.0.0`
    setSlotVal(key, someoneNot(slotVal(key)))
    elogClear()
    expect((commitDiscardPending() as any).ok).toBe(true)
    const l = ELOG.rows.find(r => /draft marks cleared/i.test(r.lbl))
    expect(l, 'a line says the marks were cleared').toBeTruthy()
    expect(l!.di).toBe(di)
  })
})

describe('P12 — a door\'s reason never outlives its command', () => {
  it('a reason handed in with no command after it does not reach a later, unrelated edit', async () => {
    as('ad', 'a')
    const r: any = { person: 'bane', date: 'Aug 1', yr: 2026, allday: true, type: 'LL', remarks: '' }
    writeInputs(() => { inpId(r); INPUTS.unshift(r) })
    elogReason(r.iid, 'cut by a medical')          // …and the door is then refused: no command follows
    await Promise.resolve()
    elogClear()
    writeInputs(() => { r.date = 'Aug 3' })          // a later, ordinary move of its dates (a reason rides a dates line)
    expect(ELOG.rows.some(x => /dates/.test(x.lbl)), 'the move is a line').toBe(true)
    expect(ELOG.rows.map(x => x.lbl).join('|')).not.toContain('cut by a medical')
  })
})

void HOOKS
