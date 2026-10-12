// @vitest-environment jsdom
/* AUDIT E — commitInputEdit / removeInput machinery, driven at the engine
   level (no React mount needed: the commit runs through writeInputsBatch and
   the accept machinery in engine/slots.ts, and initStore wires every hook it
   touches). Targets the HANDOFF-listed gaps: the keep / "moved outside the
   programmed week" branch, reassigning an ACCEPTED input to another person,
   moving it to another date, shortening and extending a span, an endDate past
   the last DATES entry, and delete-then-undo coherence for accepted inputs.

   CHANGED BY THE ONE-RULE BUILD ([ALL-AVAIL-AS-MEMBER] step 2 — owner D755, D756; D271 kept; D734 widened; D745 set
   aside): three cases at the foot of this file pinned "extras on the row are the scheduler's own and survive an input
   edit" — crew written into the row's `more`, in no input, carried across the relink and de-duplicated against a new
   holder. A row that came from an input is a whole copy of the input now, and a hand puts a person on it only through
   the door (ui/reqdoor.ts), which puts him IN the input. The three are re-expressed on that, each block saying which
   case it replaces: he and the row's red box survive an edit; a person already in the input is refused a second place
   (D271); a one-person request handed to another is the new person's alone. Who an input is for is read through
   idsOf / onlyNamed (engine/inputs.ts), never off `record.person` — a record carries its people. */
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { initStore, setSession, undo, writeInputs } from '../state/store'
import { INPUTS, DATES, inpId, idsOf, onlyNamed } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED } from '../engine/publish'
import { acceptInput, acceptedDay, unacceptInput } from '../engine/slots'
import { commitInputEdit, commitNewInput, reassignInput, removeInput, setInpField, draftOf } from './inputedit'
import { rowPut, rowMark } from './reqdoor'
import { HOOKS } from '../engine/hooks'
import { afterSchedMutate } from '../state/view'
import { setMe, DEFAULT_ME } from '../state/auth'

let TOASTS: string[] = []
const groundRows = () => DAYS.flatMap((d: any, di: number) => (d.ground || []).map((r: any) => ({ di, row: r })))
const rowsFor = (inp: any) => groundRows().filter(g => g.row.src === inpId(inp))

beforeAll(() => {
  initStore()
  HOOKS.toast = (m: any) => { TOASTS.push(String(m)) }
})
beforeEach(() => { TOASTS = [] })

/* plant through the real write so history has a baseline to undo to */
const plant = (r: any) => { writeInputs(() => { inpId(r); INPUTS.unshift(r) }); return r }
const scrap = (r: any) => { const i = INPUTS.indexOf(r); if (i >= 0) removeInput(r) }
/* [DB-READINESS] phase 6 (c): an activity request is on the programme the moment it is filed â€” its row worked out on read
   (state/holderbase.ts). Filing it under Unavailable, or Accepting it onto another day, is what the app's own card does
   then: âœ• first (take it off), then the filing â€” never a filing onto an unplaced request, which no longer exists. */
const place = (di: number, inp: any, dest: any) => { if (inp.acc === 'g') unacceptInput(acceptedDay(inp), inp); return acceptInput(di, inp, dest) }

describe('commitInputEdit — the keep branch and the moved-outside-week branch', () => {
  it('an edit that still covers the accepted day KEEPS the row on that day', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 15', endDate: 'Jul 17', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'keep me', mod: '' })
    expect(place(4, inp, 'g'), 'accepted on the LAST day of the span').toBe(true)
    afterSchedMutate()
    expect(acceptedDay(inp)).toBe(4)
    const d = draftOf(inp); d.remarks = 'keep me — edited'
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(inp.remarks).toBe('keep me — edited')
    expect(acceptedDay(inp), 'the row stayed on the day it was accepted on').toBe(4)
    expect(rowsFor(inp).length, 'exactly one row').toBe(1)
    expect(TOASTS.join('|')).not.toMatch(/Moved outside/i)
    scrap(inp)
  })

  /* [DB-READINESS] phase 6 (c) (plan §8 item 7): the request goes on the programme of the week it moved to when that week
     is read — "Moved outside the programmed week — it is no longer accepted" is no longer true, and no longer said */
  it('moving the whole input outside the programmed week drops the row from this week, and says nothing false', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 14', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'leaving', mod: '' })
    expect(place(1, inp, 'g')).toBe(true)
    afterSchedMutate()
    const key = inpId(inp)
    const d = draftOf(inp); d.start = '2026-07-25'; d.end = ''
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(inp.date).toBe('Jul 25')
    expect(inp.acc, 'no longer accepted').toBeUndefined()
    expect(groundRows().some(g => g.row.src === key), 'no orphan row on any day').toBe(false)
    expect(rowsFor(inp).length).toBe(0)
    expect(TOASTS.join('|')).not.toMatch(/Moved outside the programmed week|no longer accepted/i)
    writeInputs(() => INPUTS.splice(INPUTS.indexOf(inp), 1))
  })

  it('moving an accepted input to another DATE inside the week moves its row there', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'moving day', mod: '' })
    expect(place(0, inp, 'g')).toBe(true)
    afterSchedMutate()
    const d = draftOf(inp); d.start = '2026-07-16'
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(acceptedDay(inp), 'the row followed the date').toBe(3)
    expect(rowsFor(inp).length).toBe(1)
    expect((DAYS[0].ground || []).some((r: any) => r.src === inpId(inp)), 'nothing left on Monday').toBe(false)
    scrap(inp)
  })

  it('shortening a span so the accepted day falls off moves the row to the new start', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 14', endDate: 'Jul 17', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'shrinking', mod: '' })
    expect(place(4, inp, 'g'), 'accepted on Jul 17').toBe(true)
    afterSchedMutate()
    const d = draftOf(inp); d.end = '2026-07-15'
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(inp.endDate).toBe('Jul 15')
    const rows = rowsFor(inp)
    expect(rows.length, 'exactly one row — no orphan on Jul 17').toBe(1)
    expect(rows[0].di, 'moved to the start date').toBe(1)
    scrap(inp)
  })

  it('extending endDate past the last loaded DATES entry neither throws nor moves the row', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 18', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'long tail', mod: '' })
    expect(place(5, inp, 'g')).toBe(true)
    afterSchedMutate()
    const d = draftOf(inp); d.end = '2026-07-30'      // 11 days past the last DATES entry
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(inp.endDate).toBe('Jul 30')
    expect(acceptedDay(inp)).toBe(5)
    expect(rowsFor(inp).length).toBe(1)
    scrap(inp)
  })
})

describe('commitInputEdit — reassigning an ACCEPTED input to another person', () => {
  /* re-personing is a SCHEDULER act since 22 Aug 26 (commitInputEdit's own
     write-path gate — a member files and keeps inputs for the view-as person
     only), so this drives the call under the session the real gesture has */
  beforeEach(() => setSession({ user: 'a', role: 'admin' }))
  afterEach(() => setSession(null))
  it('relinks the ground row to the new person, keeping its stable id', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'handover', mod: '' })
    expect(place(0, inp, 'g')).toBe(true)
    afterSchedMutate()
    const id = inpId(inp)
    const d = draftOf(inp); d.person = 'stiff'
    expect(commitInputEdit(inp, d)).toBe(true)
    expect(idsOf(inp), 'the request is the new person’s, and his alone').toEqual(['stiff'])
    /* the input's stable id does NOT change when the person is reassigned (person
       was part of the old content key, so re-personing used to orphan the row and
       mint a fresh one). The row is now relinked in place: one row, src unchanged,
       who updated to the new person's stable ID (1C; the renderers resolve id→cs). */
    const rows = rowsFor(inp)
    expect(rows.length, 'still exactly one row, under the unchanged id').toBe(1)
    expect(rows[0].row.src, 'src is the input\'s stable id, unchanged by the re-person').toBe(id)
    expect(rows[0].row.who, 'who is the new person\'s stable id').toBe('stiff')
    scrap(inp)
  })
})

describe('an Other filed under Unavailable, edited in place', () => {
  it('a remark typed in place does not silently unfile an input whose start date precedes the week', () => {
    /* the input STARTS before the loaded Monday but still covers loaded days —
       exactly the shape inWindow/inputCoversDate exist to keep visible */
    const inp: any = plant({ person: 'bane', date: 'Jul 12', endDate: 'Jul 15', allday: true, s: 0, e: 1439, type: 'Other', remarks: 'errand', mod: '' })
    expect(place(0, inp, 'u'), 'filed under Unavailable').toBe(true)
    afterSchedMutate()
    expect(inp.acc).toBe('u')
    TOASTS = []
    expect(setInpField(inp, 'rmks', 'errand — updated')).toBe(true)
    expect(inp.remarks).toBe('errand — updated')
    /* nothing moved: the dates are untouched and the input still covers
       Jul 13–15. The filing must survive, and no "moved outside the
       programmed week" refusal belongs on a remark edit. */
    expect(TOASTS.join('|')).not.toMatch(/Moved outside the programmed week/i)
    expect(inp.acc, 'the Unavailable filing survives a remark edit').toBe('u')
    writeInputs(() => INPUTS.splice(INPUTS.indexOf(inp), 1))
  })

  it('the same edit on an in-week start date keeps the filing (control case)', () => {
    const inp: any = plant({ person: 'bane', date: 'Jul 13', endDate: 'Jul 15', allday: true, s: 0, e: 1439, type: 'Other', remarks: 'errand2', mod: '' })
    expect(place(0, inp, 'u')).toBe(true)
    afterSchedMutate()
    expect(setInpField(inp, 'rmks', 'errand2 — updated')).toBe(true)
    expect(inp.acc).toBe('u')
    writeInputs(() => INPUTS.splice(INPUTS.indexOf(inp), 1))
  })
})

describe('removeInput — filed copies and undo coherence', () => {
  it('deleting an accepted input removes the row, and ONE undo brings both back', () => {
    const inp: any = plant({ person: 'stiff', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'undo me', mod: '' })
    expect(place(0, inp, 'g')).toBe(true)
    afterSchedMutate()
    const key = inpId(inp)
    expect(removeInput(inp)).toBe(true)
    expect(INPUTS.indexOf(inp)).toBe(-1)
    expect(groundRows().some(g => g.row.src === key), 'row gone with it').toBe(false)
    undo()
    /* histApply rebuilds the arrays from JSON, so find by content */
    const back: any = INPUTS.find((r: any) => r.remarks === 'undo me')
    expect(back, 'the input is back').toBeTruthy()
    expect(back.acc, 'still accepted').toBe('g')
    expect(groundRows().some(g => g.row.src === key), 'and so is its ground row').toBe(true)
    /* clean up through the real path */
    removeInput(back)
  })

  /* [DB-READINESS] group A, phase 6 (b): no `inp:` mark is written for a filing any more — the filing axis counts it
     (publish.ts filingDelta), and a delete of the request reads from the request being gone. What stays pinned: the
     delete goes through, and it leaves no mark on any day it spanned. */
  it('deleting a multi-day Unavailable filing marks no day it spans (phase 6 (b))', () => {
    const inp: any = plant({ person: 'stiff', date: 'Jul 14', endDate: 'Jul 16', allday: true, s: 0, e: 1439, type: 'Other', remarks: 'span file', mod: '' })
    expect(place(1, inp, 'u')).toBe(true)
    afterSchedMutate()
    const token = inp.iid
    const keys = () => Object.keys(SCHED.pending).filter(k => k.startsWith('inp:') && k.endsWith('.' + token))
    expect(keys(), 'the filing marks no day').toEqual([])
    expect(removeInput(inp)).toBe(true)
    expect(keys(), 'nor does its delete').toEqual([])
    expect(INPUTS.indexOf(inp)).toBe(-1)
  })
})

/* WHO STANDS ON THE ROW IS IN THE INPUT — SO AN EDIT OF THE INPUT KEEPS HIM (owner D755, 11 Oct 26 — "a row that came
   from an input IS the input: whoever stands on it … is in the input"; D756 — one record with the list of its people;
   the plan docs/superpowers/plans/2026-10-11-one-rule-plan.md §4.3, §4.4, §4.9).

   REPLACES "the relink preserves scheduler additions (fixed 12 Aug 26)" — `extra crew and the red flag on the promoted
   row survive an input edit` — which pinned that crew a scheduler wrote onto the row as the ROW'S OWN (`more`, in no
   input) were carried across an edit of the source input. Nobody on such a row is the row's own any more: a hand puts
   him there through the door (ui/reqdoor.ts), which puts him IN the input, and the row is a whole copy of the input,
   re-made in place. He survives an edit because he is in what is edited.
   THE RED BOX — re-expressed at step 4 of the one-rule build (12 Oct 26; owner D760: "the red box and 'information
   only' go with the input too"). These cases wrote it on the ROW (`row.flag = 1`) and pinned that the re-make KEPT it
   (D468: what the scheduler added to the row was the row's). It is the input's now: a mark written on the row alone
   comes off at the next re-make, the input never having carried it. Choice (1) of the four — THE RULE SURVIVES on a
   rebuilt fixture: the red box is set as a scheduler sets it, through the row's door (ui/reqdoor.ts rowMark), and it
   is still there after the edit, on the input and on its row (`true`, as the door writes it, where the hand-written
   fixture said `1`).
   What D755 (3) changed with it: once a scheduler has put someone in beside him, the member's own change of the
   request for everyone ends — the edit that used to throw the scheduler's work away is now refused. */
const live = (inp: any): any => INPUTS.find((r: any) => r.iid === inp.iid)
const keyOfRow = (inp: any) => { const g = groundRows().find(x => x.row.src === inpId(inp))!; return `g:${g.di}.${DAYS[g.di].ground.indexOf(g.row)}` }
const onRow = (inp: any) => { const r = rowsFor(inp)[0].row; return [r.who, ...(r.more || [])].filter(Boolean) }
const scheduler = () => { setSession({ user: 'a', role: 'admin' }); setMe('prowler') }     // Hunter, a scheduler
const member = (p: string) => { setSession({ user: 'us', role: 'main', name: 'us' }); setMe(p) }

describe('a person put on the row through the door is in the input — he and the row’s red box survive an edit of it (D755)', () => {
  afterEach(() => { setSession(null); setMe(DEFAULT_ME) })
  it('an edit of the input keeps him: the remark lands, he is still in the input and on the SAME row, the red box kept', () => {
    const inp: any = plant({ person: 'stiff', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'probe', mod: '' })
    expect(place(0, inp, 'g')).toBe(true)
    afterSchedMutate()
    scheduler()
    expect(rowPut(`${keyOfRow(inp)}.+`, 'bane'), 'Ranger put on the row’s "+ add"').toBe('done')
    expect(idsOf(live(inp)), 'he is IN the input').toEqual(['stiff', 'bane'])
    const rid = rowsFor(inp)[0].row.rid
    expect(rowMark(keyOfRow(inp), 'flag', true), 'the red box, by the row’s door — the input’s own (D760)').toBe('done')
    expect([live(inp).flag, rowsFor(inp)[0].row.flag], 'on the input, and on its row').toEqual([true, true])
    setSession(null); setMe(DEFAULT_ME)                         // the edit itself, as every commitInputEdit case above drives it
    const d = draftOf(live(inp)); d.remarks = 'probe — retouched'
    expect(commitInputEdit(live(inp), d)).toBe(true)
    const fresh = rowsFor(inp)[0].row
    expect(fresh.rmks, 'the edit itself landed').toBe('probe — retouched')
    expect(idsOf(live(inp)), 'the person the door put in is still in the input').toEqual(['stiff', 'bane'])
    expect([fresh.who, fresh.more], 'and on its row, under the first to join').toEqual(['stiff', ['bane']])
    expect([live(inp).flag, fresh.flag], 'the red box is still the input’s, and on its re-made row').toEqual([true, true])
    expect(fresh.rid, 're-made in place: the same row').toBe(rid)
    expect(rowsFor(inp).length, 'exactly one row').toBe(1)
    scrap(live(inp))
  })

  it('the member’s own edit of the request he filed, once a scheduler has put someone in beside him, is refused — nothing changes and nobody is taken off (D755 (3))', () => {
    member('bane')
    expect(commitNewInput(draftOf({ person: 'bane', type: 'Meeting', date: 'Jul 13', yr: 2026, allday: false, s: 600, e: 660, remarks: 'mine' }))).toBe(true)
    const inp: any = INPUTS.find((r: any) => r.remarks === 'mine')
    expect([onlyNamed(inp), rowsFor(inp).length], 'his own request, on the programme').toEqual(['bane', 1])
    /* while it is his alone, his own edit goes through — as it always did */
    let d = draftOf(inp); d.remarks = 'mine — first'
    expect(commitInputEdit(inp, d), 'his own request: his to change').toBe(true)
    expect(rowsFor(inp)[0].row.rmks).toBe('mine — first')
    scheduler()
    expect(rowPut(`${keyOfRow(inp)}.+`, 'boosh'), 'the scheduler puts Havoc on its row').toBe('done')
    expect(rowMark(keyOfRow(inp), 'flag', true), 'and red-boxes it — the input’s own mark (D760)').toBe('done')
    member('bane')
    TOASTS = []
    d = draftOf(live(inp)); d.remarks = 'mine — retouched'
    expect(commitInputEdit(live(inp), d), 'the request is no longer wholly his').toBe(false)
    expect(TOASTS.length, 'and he is told').toBeGreaterThan(0)
    expect(live(inp).remarks, 'nothing was saved').toBe('mine — first')
    expect(idsOf(live(inp)), 'Havoc is still in the input').toEqual(['bane', 'boosh'])
    expect(onRow(inp), 'and on its row').toEqual(['bane', 'boosh'])
    expect([live(inp).flag, rowsFor(inp)[0].row.flag], 'the red box is where it was').toEqual([true, true])
    scheduler()
    scrap(live(inp))
  })
})

/* ONE PERSON, ONCE PER ROW (owner, D271, 27 Sep 26 — "Q1 refused"). REPLACES "the relink never leaves a man on the row
   twice" — `re-pointing the request to a man already an extra on its row keeps him once, as its holder, and says so` —
   which pinned the relink de-duplicating a request handed to a man who ALREADY stood on its row as the scheduler's
   extra, with its "already on this row as an extra · kept once" note. With the row a copy of the input there is no
   extra to collide with: a person is in the list once (engine/inputown.ts — putPerson and swapPerson refuse someone
   already in it), and each door that could put him there a second time refuses and says so. */
describe('a person already in the input is never on its row twice (D271)', () => {
  beforeEach(() => scheduler())
  afterEach(() => { setSession(null); setMe(DEFAULT_ME) })
  /* Saber's request with Ranger and Havoc put on its row by the scheduler — three in the input */
  const three = (remarks: string) => {
    const inp: any = plant({ person: 'stiff', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks, mod: '' })
    expect(place(0, inp, 'g')).toBe(true)
    afterSchedMutate()
    for (const p of ['bane', 'boosh']) expect(rowPut(`${keyOfRow(inp)}.+`, p), p).toBe('done')
    expect(onRow(inp)).toEqual(['stiff', 'bane', 'boosh'])
    TOASTS = []
    return inp
  }
  it('put on the row again, or swapped in for another of its people: refused, in words — and nothing changes', () => {
    const inp = three('twice')
    const was = JSON.stringify([live(inp), rowsFor(inp)[0].row])
    expect(rowPut(keyOfRow(inp), 'bane'), 'Ranger dropped on the name box').toBe('refused')
    expect(rowPut(`${keyOfRow(inp)}.+`, 'boosh'), 'Havoc dropped on "+ add"').toBe('refused')
    expect(reassignInput(inp.iid, 'bane'), 'the row’s swap: Ranger for Saber').toBe(false)
    expect(TOASTS).toEqual(['Ranger is already on this input', 'Havoc is already on this input', 'Ranger is already on this input'])
    expect(JSON.stringify([live(inp), rowsFor(inp)[0].row]), 'nothing changed').toBe(was)
    expect(onRow(inp).filter((v: any) => v === 'bane').length, 'Ranger once on the row').toBe(1)
    scrap(live(inp))
  })
  it('one of its people swapped for a man NOT in it: the newcomer takes his place in the list — the others, the row and its red box stay', () => {
    const inp = three('swap')
    const rid = rowsFor(inp)[0].row.rid
    /* (1) the rule survives on a rebuilt fixture (D760): the red box is the input's, set by the row's door */
    expect(rowMark(keyOfRow(inp), 'flag', true)).toBe('done')
    expect(reassignInput(inp.iid, 'pike'), 'Nomad for Saber, the first to join').toBe(true)
    expect(idsOf(live(inp))).toEqual(['pike', 'bane', 'boosh'])
    const fresh = rowsFor(inp)[0].row
    expect([fresh.who, fresh.more, fresh.rid, fresh.flag]).toEqual(['pike', ['bane', 'boosh'], rid, true])
    expect(live(inp).flag, 'and the input carries it still').toBe(true)
    expect(rowsFor(inp).length, 'still exactly one row').toBe(1)
    expect(TOASTS.join('|')).not.toMatch(/kept once/)
    scrap(live(inp))
  })
})

/* REPLACES `a hand-over to a man NOT on the row keeps every extra, and says nothing about it`: a one-person request
   handed to another person has nobody else on its row to keep — whoever a scheduler put there is IN the input, and an
   input of several is not handed over (who is in it is changed through its list). What is left of the case is the
   hand-over itself, by both doors, for a record in the old shape (`person`) and one that carries its people. */
describe('a hand-over of a one-person request to a person not on it', () => {
  beforeEach(() => scheduler())
  afterEach(() => { setSession(null); setMe(DEFAULT_ME) })
  it('by its Person field or by the row’s swap: the request is the new person’s alone — the same one row, and nothing is said about anyone "kept once"', async () => {
    const old: any = plant({ person: 'stiff', date: 'Jul 13', allday: false, s: 600, e: 660, type: 'Meeting', remarks: 'once — old shape', mod: '' })
    expect(place(0, old, 'g')).toBe(true)
    afterSchedMutate()
    expect(commitNewInput(draftOf({ person: 'stiff', type: 'Meeting', date: 'Jul 13', yr: 2026, allday: false, s: 720, e: 780, remarks: 'once — its people' }))).toBe(true)
    const listed: any = INPUTS.find((r: any) => r.remarks === 'once — its people')
    for (const inp of [old, listed]) {
      const rid = rowsFor(inp)[0].row.rid, id = inpId(inp)
      TOASTS = []
      const d = draftOf(live(inp)); d.person = 'bane'               // the request handed to Ranger, in its own window
      expect(commitInputEdit(live(inp), d)).toBe(true)
      expect([idsOf(live(inp)), onlyNamed(live(inp))], 'Ranger’s, and his alone').toEqual([['bane'], 'bane'])
      expect(onRow(inp), 'the row is his').toEqual(['bane'])
      expect(reassignInput(id, 'boosh'), 'and on to Havoc, by the row’s swap').toBe(true)
      expect(idsOf(live(inp))).toEqual(['boosh'])
      expect(onRow(inp)).toEqual(['boosh'])
      expect(rowsFor(inp).length, 'still exactly one row').toBe(1)
      expect([rowsFor(inp)[0].row.rid, rowsFor(inp)[0].row.src], 'the same row, under the unchanged id').toEqual([rid, id])
      expect(reassignInput(id, 'boosh'), 'dropped back on himself: nothing to do').toBe(false)
      await Promise.resolve()
      expect(TOASTS.join('|'), 'the swap said who replaced whom').toMatch(/Havoc.*instead of Ranger/)
      expect(TOASTS.join('|'), 'and nothing about anyone "kept once"').not.toMatch(/kept once/)
      scrap(live(inp))
    }
  })
})

/* A 'u' FILING SURVIVES AN OFF-WEEK EDIT (P2-REV2-06). 'u' (filed unavailable)
   is a GLOBAL filing DECISION on the input itself, not a per-week ground landing
   — it has no DAYS row to relink. Keeping acc='u' across a week load (the
   P2-IMPL-05 fix) exposed an off-week loss: editing only the REMARKS of a 'u'
   input whose dates are NOT in the loaded week captured wasAcc='u', unaccepted
   it, found no covered day in the loaded DATES, reported "Moved outside the
   programmed week" and deleted the parked 'r' — silently turning a filed-
   unavailable input into a fresh, flagging one. The fix: an off-week 'u' edit
   restores the filing rather than dropping it. */
describe("a 'u' filing survives an off-week remarks edit (P2-REV2-06)", () => {
  it('editing only the remarks of a filed-unavailable input on another week keeps it filed', () => {
    // a Meeting filed 'u' (unavailable) for a date NOT in the loaded week
    const offDate = DATES.some((d: string) => d === 'Sep 4') ? 'Sep 5' : 'Sep 4'
    const inp: any = plant({ person: 'bane', date: offDate, allday: true, type: 'Meeting', acc: 'u', yr: 2026, remarks: 'AWOL cover', mod: '' })
    expect(DATES.some((d: string) => d === offDate), 'the date is genuinely off the loaded week').toBe(false)
    const d = draftOf(inp); d.remarks = 'AWOL cover — updated'
    expect(commitInputEdit(inp, d), 'the edit is accepted').toBe(true)
    expect(inp.remarks, 'the remark landed').toBe('AWOL cover — updated')
    expect(inp.acc, 'still filed unavailable — not silently turned fresh').toBe('u')
    expect(TOASTS.join('|'), 'no false "moved outside" toast — nothing was in the loaded week to move out of').not.toMatch(/Moved outside/i)
    scrap(inp)
  })
})
