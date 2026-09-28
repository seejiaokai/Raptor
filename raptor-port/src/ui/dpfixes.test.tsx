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
import { ELOG, elogClear, elogFlush, elogLoad, logAction } from '../engine/editlog'
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
import { dayInfoHTML, withDaySnap, dayHTML } from './html'
import { sbUnavailPanel } from './board-html'
import { pendListHTML } from './pendlist'
import { jumpToChange } from './interactions'
import { jumpOf } from './ChangesWindow'
import { PIOPEN } from '../state/view'
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

  /* …and the WEEK's twin (Astra DP-08), which the break tests found no unit test watching (§5 B9 — only the walk's A8) */
  it('the same leave on the edit week: its row carries the address too', () => {
    as('ad', 'a')
    const d: any = (DAYS as any)[0]
    const r: any = { person: 'bane', date: d.dt, yr: 2026, allday: true, type: 'LL', remarks: '', acc: 'u' }
    inpId(r); INPUTS.unshift(r)
    expect(dayHTML(0, true, true)).toContain(`data-inprow="${r.iid}"`)
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
    } finally { updatePersonField(man, { cat: q0 }) }
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
    } finally { two.forEach((id, i) => { updatePersonField(id, { cat: q0[i] }) }) }
  })

  /* [HIST-PHONE-HIDE] + [CHG-BY-ITEM], Astra's final read (FR-01): a man posted out (archived) or made SANS BY A POSTING —
     its own Quals lines are left unsaid inside the posting's command (one act, one line), so To go out found no line for
     "posted out" / "SANS" and named nobody. The posting line now keeps whose it is and that it is a posting (sub, fld),
     so it is the provenance of the two details a posting makes. (The posting pass that runs it on its date makes no line
     — it is not a person's act — so the change here stands in for it.) */
  it('a man posted out by a posting: To go out names who set the posting', () => {
    as('ad', 'a')
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(0, true)
    const man = (DAYS as any)[0].waves[0].formations[0].aircraft[0].p
    const p: any = (PEOPLE as any)[man]
    const was = p.archived
    try {
      logAction(null, `Leave War · ${p.cs} · posting out 13 Jul · Overseas Sqn`, { date: '2026-07-13', sect: 'abs', sub: man, fld: 'posting' })
      p.archived = true
      const who = [...el(pendListHTML(0)).querySelectorAll('.pl-who')].map(e => e.textContent || '').join('|')
      expect(who, 'the To go out line names who set the posting').toContain('Saber')
    } finally { p.archived = was }
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

/* ---- Astra's final read ---- */
const publishMon = () => { const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'; setDayApproved(0, true) }

describe('ASTRA-DP-FINAL-02 — an input changed after the day went out: To go out names who and when, newest first', () => {
  it('a member files a leave on published Monday after an older admin edit: his line names him, and comes first', () => {
    as('ad', 'a')
    publishMon()
    const key = `d:0.0.0`
    setSlotVal(key, someoneNot(slotVal(key)))                          // an older edit of Saber's
    ELOG.rows.forEach(r => { r.t -= 3600_000 })                        // …an hour ago
    as('us', 'us')
    const d: any = (DAYS as any)[0]
    const r: any = { person: 'bane', date: d.dt, yr: 2026, allday: true, type: 'LL', remarks: '' }
    writeInputs(() => { inpId(r); INPUTS.unshift(r) })
    as('ad', 'a')
    const items = [...el(pendListHTML(0)).querySelectorAll('.pl-item')]
    const mine = items.findIndex(x => /Ranger · LL|LL \(leave\)|Ranger/.test(x.querySelector('.pl-where')?.textContent || '') && /filed/.test(x.textContent || ''))
    expect(mine, 'the leave is on the list').toBeGreaterThanOrEqual(0)
    expect(items[mine]!.querySelector('.pl-who')?.textContent || '', 'it names who filed it').toContain('Ranger')
    expect(mine, 'and, being the newest, it comes first').toBe(0)
  })
})

describe('ASTRA-DP-FINAL-03 — a Quals change on To go out keeps its who across a rename', () => {
  it('CAT changed, then the man renamed: the line still names who changed the CAT; and the history keeps whose it was over a reload', () => {
    as('ad', 'a')
    publishMon()
    /* someone flying Monday who is NOT the admin doing it (the who would then follow his own new name) */
    const onMon: string[] = []
    ;(DAYS as any)[0].waves.forEach((w: any) => (w.formations || []).forEach((f: any) => (f.aircraft || []).forEach((a: any) => { for (const id of [a.p, a.w]) if (id) onMon.push(id) })))
    const man = onMon.find(id => id !== 'stiff' && id !== 'bane' && (PEOPLE as any)[id] && !(PEOPLE as any)[id].special)!
    const p: any = (PEOPLE as any)[man], q0 = p.q, cs0 = p.cs
    try {
      expect(updatePersonField(man, { cat: q0 === 'C' ? 'B' : 'C' })).toBeNull()
      expect(updatePersonField(man, { callsign: 'ZZRENAMED' })).toBeNull()
      const who = [...el(pendListHTML(0)).querySelectorAll('.pl-item')].filter(x => /CAT/.test(x.textContent || '')).map(x => x.querySelector('.pl-who')?.textContent || '').join('|')
      expect(who, 'the CAT line still names Saber after the rename').toContain('Saber')
      elogFlush(); elogLoad()
      const row: any = ELOG.rows.find(r => r.sect === 'quals' && /CAT/.test(r.lbl))
      expect(row && row.sub, 'whose CAT it was, kept by his id').toBe(man)
      expect(row && row.fld).toBe('q')
    } finally { updatePersonField(man, { callsign: cs0 }); updatePersonField(man, { cat: q0 }) }
  })
})

/* ---- Fable's final read, F5: an absence line that is a button must land somewhere ---- */
describe('F5 — an input line lands, or is not a button', () => {
  it('a request waiting under Personal Inputs carries the address of the input on the edit week, and a tap opens that panel', async () => {
    as('ad', 'a')
    const d: any = (DAYS as any)[0]
    const r: any = { person: 'bane', date: d.dt, yr: 2026, allday: false, s: 600, e: 660, type: 'MEETING', remarks: '' }
    inpId(r); INPUTS.unshift(r)
    PIOPEN.delete(0)
    jumpToChange([`iu:${r.iid}`], 0)
    expect(PIOPEN.has(0), 'the tap opens Personal Inputs on that day').toBe(true)
    expect(dayHTML(0, true, true)).toContain(`data-inprow="${r.iid}"`)
    PIOPEN.delete(0)
  })
  it('a line about an input whose dates are all outside the loaded week (moved away) goes nowhere — it is not a button', () => {
    const r: any = { person: 'bane', date: 'Aug 20', yr: 2026, allday: true, type: 'LL', remarks: '' }
    inpId(r); INPUTS.unshift(r)
    const days = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
    const l: any = { iid: r.iid, key: '', rows: [{ date: '2026-08-20', wdate: '2026-07-14', iid: r.iid }] }
    expect(jumpOf(l, days, null)).toBeNull()
  })
})

/* Astra's read of the fixes (ASTRA-FIX-03): a line shown on Monday by the day an input LEFT goes to where the input is now */
describe('an input moved from Monday to Tuesday, its line opened on Monday', () => {
  it('goes to Tuesday, where its row is drawn', () => {
    as('ad', 'a')
    const d1: any = (DAYS as any)[1]
    const r: any = { person: 'bane', date: d1.dt, yr: 2026, allday: true, type: 'LL', remarks: '', acc: 'u' }
    inpId(r); INPUTS.unshift(r)
    const days = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17', '2026-07-18', '2026-07-19']
    const l: any = { iid: r.iid, key: '', rows: [{ date: '2026-07-14', wdate: '2026-07-13', iid: r.iid }] }
    const j = jumpOf(l, days, '2026-07-13')
    expect(j, 'still a button').not.toBeNull()
    expect(j!.di, 'on Tuesday').toBe(1)
  })
})
