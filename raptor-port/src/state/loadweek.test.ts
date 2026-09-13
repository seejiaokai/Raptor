/* @vitest-environment jsdom */
/* THE WEEK SELECTOR ACTUALLY SWITCHES WEEKS (owner, 21 Aug 26). loadWeek swaps
   the loaded week's DAYS and DATES and resets everything keyed to the old week
   (publish/AL state, history baseline). The two things that would be silent
   corruption if they regressed are pinned here: no per-day publish state may
   bleed from one week onto the next's identical indices, and Undo may not cross
   a week boundary.
   INPUTS is GLOBAL since 22 Aug 26 (owner — "show all inputs regardless of which
   week I am selected on"): it is NOT swapped with the week, so every week's
   inputs stay present; each week's SCHEDULE still shows only its own because the
   day builders match by date. That global-ness is pinned below too. */
import { beforeEach, describe, expect, it } from 'vitest'
import { initStore, loadWeek, weekStashSnap } from './store'
import { DAYS } from '../engine/data'
import { DATES, INPUTS, inputCoversDate } from '../engine/inputs'
import { autoAcceptInput, unacceptInput, inpId, acceptInput } from '../engine'
import { reconcileDayFiling, acceptedDay } from '../engine/slots'
import { stashClear, stashPut } from '../engine/weekstash'
import { weekBundle } from '../engine/weeks-data'
import { SCHED, signOf, setDayApproved, dayHasChanges } from '../engine/publish'
import { HIST } from './history'

/* is this input's ground row currently sitting on some day of the loaded week? */
const landed = (inp: any) =>
  DAYS.some((d: any) => ((d && d.ground) || []).some((g: any) => g.src === inpId(inp)))

/* INPUTS and the week stash are BOTH module-level session state, and neither
   initStore nor loadWeek wipes them — a real reload discards the module, which
   a test can't. Clear the stash and drop any rows a prior test pushed so each
   test starts from the true first-boot state, not a neighbour's leftovers. */
beforeEach(() => {
  stashClear()
  for (let i = INPUTS.length - 1; i >= 0; i--) if ((INPUTS[i] as any)._t) INPUTS.splice(i, 1)
  initStore()
  loadWeek('13/07/2026')
})

describe('loadWeek', () => {
  it('loads the authored second week (Jul 20)', () => {
    loadWeek('20/07/2026')
    expect(DAYS.length).toBe(7)
    expect(DAYS[0].dt).toBe('Jul 20')
    expect(DATES[0]).toBe('Jul 20')
    expect(DATES[6]).toBe('Jul 26')
    // week-2's own inputs land on it — the Thu medical downchit
    expect(INPUTS.some((r: any) => r.person === 'bruise' && r.type === 'OML')).toBe(true)
  })

  it('a filed-unavailable input keeps its "u" state across navigation — no phantom amendment (P2-IMPL-05)', () => {
    const inp: any = { person: 'divot', type: 'Training', date: 'Jul 13', allday: true, remarks: '', mod: 'now', yr: 2026, _t: 1 }
    INPUTS.push(inp)
    expect(acceptInput(0, inp, 'u')).toBe(true)          // file the person unavailable for it
    expect(inp.acc).toBe('u')
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(0, true)                                // the issued fingerprint freezes acc='u'
    expect(dayHasChanges(0)).toBe(false)
    /* navigate away and back — the acc-clear must NOT wipe the filing decision */
    loadWeek('20/07/2026')
    loadWeek('13/07/2026')
    expect(inp.acc, 'the filed-unavailable state survived navigation').toBe('u')
    expect(dayHasChanges(0), 'no amendment appears from navigation alone').toBe(false)
  })

  it('a SPANNING accepted input keeps its "g" landing across navigation, even when its start is in another week (P2-REREVIEW-07)', () => {
    // a two-day input starting the prior Sunday (Jul 12), landed on Monday (Jul 13)
    const inp: any = { person: 'divot', type: 'Meeting', date: 'Jul 12', endDate: 'Jul 13', allday: true, remarks: '', mod: 'now', yr: 2026, _t: 1 }
    INPUTS.push(inp)
    expect(acceptInput(0, inp, 'g')).toBe(true)          // lands a ground row on day 0 (Jul 13)
    expect(inp.acc).toBe('g')
    const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
    setDayApproved(0, true)                                // fingerprint freezes acc='g'
    expect(dayHasChanges(0)).toBe(false)
    loadWeek('20/07/2026')
    loadWeek('13/07/2026')
    expect(inp.acc, 'the ground landing survived navigation despite a foreign start date').toBe('g')
    expect(dayHasChanges(0), 'no phantom amendment from navigation').toBe(false)
  })

  /* P2-REV2-05: a recovery / draft-switch / template-apply can drop the ground row
     an input was filed 'g' onto while leaving inp.acc='g' dangling. Left unreconciled
     it lies in the AL filing fingerprint and a later navigation flips it into a
     phantom amendment. reconcileDayFiling (run at every whole-day replacement site,
     approved or not — P2-QREV-07) unfiles a 'g' with no row, and re-files one whose
     row a replacement restored (the round-2 regression). */
  describe("a dropped ground row reconciles the 'g' filing (P2-REV2-05)", () => {
    it('reconcileDayFiling clears a DANGLING g but keeps a live g, a u, and a multi-day g landed elsewhere', () => {
      const live: any = { person: 'divot', type: 'Meeting', date: 'Jul 13', allday: true, remarks: '', mod: 'now', yr: 2026, _t: 1 }
      INPUTS.push(live); expect(acceptInput(0, live, 'g')).toBe(true)         // real row on day 0
      const dangling: any = { person: 'ranger', type: 'Meeting', date: 'Jul 13', allday: true, remarks: '', mod: 'now', yr: 2026, _t: 1 }
      INPUTS.push(dangling); expect(acceptInput(0, dangling, 'g')).toBe(true)
      // simulate a recovery content-replace that drops ONLY the dangling row
      const ix = DAYS[0].ground.findIndex((r: any) => r.src === inpId(dangling))
      DAYS[0].ground.splice(ix, 1)
      const filed: any = { person: 'bane', type: 'Meeting', date: 'Jul 13', allday: true, remarks: '', mod: 'now', yr: 2026, _t: 1 }
      INPUTS.push(filed); expect(acceptInput(0, filed, 'u')).toBe(true)       // a 'u' filing decision — no row
      reconcileDayFiling(0)
      expect(dangling.acc, 'the dangling g was unfiled — its row is gone').toBeUndefined()
      expect(live.acc, 'a g whose row still exists is untouched').toBe('g')
      expect(filed.acc, "a 'u' filing decision is untouched").toBe('u')
    })

    it('RE-DERIVES g when a replacement restores the row — the round-2 regression (P2-QREV/Fable-2)', () => {
      const inp: any = { person: 'divot', type: 'Meeting', date: 'Jul 13', allday: true, remarks: '', mod: 'now', yr: 2026, _t: 1 }
      INPUTS.push(inp); expect(acceptInput(0, inp, 'g')).toBe(true)
      const key = inpId(inp)
      const rowIx = DAYS[0].ground.findIndex((r: any) => r.src === key)
      const rowCopy = DAYS[0].ground[rowIx]
      // a draft switch AWAY drops the row → reconcile unfiles (correct)
      DAYS[0].ground.splice(rowIx, 1)
      reconcileDayFiling(0)
      expect(inp.acc, 'unfiled when the row is gone').toBeUndefined()
      // a draft switch BACK restores the row → reconcile must RE-FILE, not strand it
      DAYS[0].ground.push(rowCopy)
      reconcileDayFiling(0)
      expect(inp.acc, 're-filed when the row is back — the old delete-only form left it stranded').toBe('g')
    })

    it('a recovery-style replacement + navigation raises NO phantom: the filing state is stable', () => {
      const inp: any = { person: 'divot', type: 'Meeting', date: 'Jul 13', allday: true, remarks: '', mod: 'now', yr: 2026, _t: 1 }
      INPUTS.push(inp); expect(acceptInput(0, inp, 'g')).toBe(true)
      const g = signOf(0); g.cur = 'ignite'; g.sked = 'bane'; g.plan = 'stiff'; g.appr = 'pump'
      setDayApproved(0, true)
      // recovery-style: the replacement drops the row; without the fix acc='g' dangles
      const ix = DAYS[0].ground.findIndex((r: any) => r.src === inpId(inp))
      DAYS[0].ground.splice(ix, 1)
      reconcileDayFiling(0)                                  // now runs at every replacement site (P2-QREV-07), not only in rebaseDayPending
      expect(inp.acc, 'reconciled — no dangling g to freeze').toBeUndefined()
      const before = dayHasChanges(0)
      loadWeek('20/07/2026'); loadWeek('13/07/2026')
      expect(dayHasChanges(0), 'navigation did not silently change the amendment state').toBe(before)
      expect(acceptedDay(inp), 'still no ground row after navigation').toBe(-1)
    })
  })

  /* P2-QREV-02: filing (acceptInput/unacceptInput) is a GLOBAL input write that
     bypassed the round-1 funnel and checked only the loaded week. A multi-day
     input spanning the supported loaded week AND a stashed protected week must be
     refused — filing it changes the protected input's global acc. */
  it('filing a multi-day input that spans a stashed PROTECTED week is refused (P2-QREV-02)', () => {
    // Jul 20 is a stashed unsupported (protected) week; the loaded Jul 13 week is supported
    stashPut('20/07/2026', JSON.stringify({ d: weekBundle('20/07/2026').days, o: { 0: { d: {}, c: {} } }, cv: { 0: 'orig' } }))
    const inp: any = { person: 'divot', type: 'Meeting', date: 'Jul 18', endDate: 'Jul 20', allday: true, remarks: '', mod: 'now', yr: 2026, _t: 1 }
    INPUTS.push(inp)
    // it covers no loaded day for a ground landing on day 0, so use a day it does cover:
    inp.date = 'Jul 13'; inp.endDate = 'Jul 20'          // spans loaded Jul 13 → protected Jul 20
    expect(acceptInput(0, inp, 'g'), 'accept refused — the input spans a protected week').toBe(false)
    expect(inp.acc, 'no filing landed').toBeUndefined()
    // and a pre-existing 'g' cannot be unfiled either
    inp.acc = 'g'
    expect(unacceptInput(0, inp), 'unaccept refused too').toBe(false)
    expect(inp.acc, 'the filing decision is untouched').toBe('g')
    stashClear()
  })

  it('a non-authored chip loads a blank, editable seven-day week', () => {
    loadWeek('29/06/2026')
    expect(DAYS.length).toBe(7)
    expect(DAYS[0].dt).toBe('Jun 29')
    expect(DAYS[6].dt).toBe('Jul 5')
    expect(DAYS.every((d: any) => (d.waves || []).length === 0)).toBe(true)
    // INPUTS is global, so it is NOT emptied — but none of its rows fall on this
    // blank week's dates, so the week itself shows no personal input
    expect(INPUTS.length).toBeGreaterThan(0)
    expect(INPUTS.some((r: any) => DATES.some((dt: any) => inputCoversDate(r, dt)))).toBe(false)
  })

  it('personal inputs are GLOBAL — every week\'s inputs are present whichever week is loaded', () => {
    // week 1's divot and week 2's Vapor both sit in INPUTS on the seed week…
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(true)
    expect(INPUTS.some((r: any) => r.person === 'vegas')).toBe(true)
    // …and still both after switching to week 2 and to a blank week
    loadWeek('20/07/2026')
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(true)
    expect(INPUTS.some((r: any) => r.person === 'vegas')).toBe(true)
    loadWeek('29/06/2026')
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(true)
    expect(INPUTS.some((r: any) => r.person === 'vegas')).toBe(true)
  })

  it('the seed week reloads clean, its dates tracking it', () => {
    loadWeek('20/07/2026')
    loadWeek('13/07/2026')
    expect(DAYS[0].dt).toBe('Jul 13')
    expect(DATES[0]).toBe('Jul 13')
    expect(INPUTS.some((r: any) => r.person === 'divot')).toBe(true)   // a seed-week row
  })

  it('no publish state bleeds across a switch (day-index keyed)', () => {
    loadWeek('20/07/2026')
    SCHED.dayOK[0] = true            // approve Monday on week 2
    SCHED.pending['x'] = 1
    loadWeek('13/07/2026')
    expect(SCHED.dayOK[0]).toBeFalsy()
    expect(Object.keys(SCHED.pending).length).toBe(0)
    expect(SCHED.als.length).toBe(0)
  })

  it('history re-baselines on a switch — Undo cannot cross weeks', () => {
    loadWeek('20/07/2026')
    expect(HIST.stack.length).toBe(1)
    expect(HIST.ix).toBe(0)
  })

  /* A MODERN (rid-keyed) BOOK IS NOT RE-KEY-MIGRATED ON LOAD (Fable RID-REV2-03).
     migrateBookKeys runs only on an actual legacy upgrade, never every boot: a
     positional-fallback key left in a modern book must stay positional, or on a
     later load it would silently RE-BIND to whatever row now sits at that index.
     Plant a modern book (ridV present) carrying a positional changes key that
     WOULD resolve against a live wave, reload it, and assert it was left alone. */
  it('a modern book\'s positional key is not silently re-bound on reload', () => {
    const W = '20/07/2026'
    loadWeek(W)
    const di = DAYS.findIndex((d: any) => (d.waves || []).length > 0)
    expect(di).toBeGreaterThanOrEqual(0)
    const rid0 = DAYS[di].waves[0].rid
    /* capture W's modern book WHILE on it, then leave (W is clean, so loadWeek
       does not auto-stash it), then plant the edited book — planting before the
       leave would be clobbered when leaving re-stashes W. */
    const snap = JSON.parse(weekStashSnap())
    expect(snap.v).toBe(2)                                   // the book is modern (schedFields' `v`)
    loadWeek('13/07/2026')
    snap.c = { [`wl:${di}.0`]: 3 }                           // a positional changes key that WOULD resolve to wave 0
    stashPut(W, JSON.stringify(snap))
    loadWeek(W)                                              // restore the planted book
    expect(SCHED.changes[`wl:${di}.0`]).toBe(3)              // left POSITIONAL — no re-key on a modern boot
    expect(SCHED.changes[`wl:${di}.${rid0}`]).toBeUndefined()// NOT re-bound to the live rid
  })

  /* A DELIBERATELY UNACCEPTED INPUT STAYS OFF THE GROUND ACROSS A WEEK ROUND-TRIP
     (review fix, 24 Aug 26). A personal activity input auto-lands; a scheduler
     may unaccept it. INPUTS is global and not stashed, so the return-to-week
     auto-land pass used to silently re-land exactly what was removed. The stash
     now remembers which in-week personal rows were left unaccepted and the
     restore skips them. */
  it('an unaccepted personal input does not reappear after leaving the week and coming back', () => {
    // a fresh personal (activity) input on the seed week's Monday, landed on ground
    const inp: any = { person: 'divot', date: 'Jul 13', type: 'Training', allday: false, s: 540, e: 660, _t: true }
    INPUTS.push(inp)
    expect(autoAcceptInput(inp)).toBe(true)
    expect(landed(inp)).toBe(true)
    // the scheduler removes it from the ground programme
    unacceptInput(0, inp)
    expect(landed(inp)).toBe(false)
    // leave the week and come back
    loadWeek('20/07/2026')
    loadWeek('13/07/2026')
    // it must STILL be off the ground — the removal survived the round-trip
    expect(landed(inp), 'the unaccepted row must not be silently re-landed').toBe(false)
    /* and still DORMANT (owner, 26 Aug 26): the 'r' mark rides the round-trip
       (loadWeek's acc-clear skips it; the stash's un set re-parks the legacy
       shape), so it goes on flagging nothing until a scheduler re-accepts it */
    expect(inp.acc, 'the removal mark itself survives').toBe('r')
    // and the row itself is still a personal input (it was removed from the ground, not deleted)
    expect(INPUTS.some((r: any) => r.person === 'divot' && r.type === 'Training')).toBe(true)
  })

  /* the same round-trip must still LAND a personal input that is brand new since
     the week was last open — the fix skips only rows that were unaccepted here,
     never a row that never had the chance to be. */
  it('a personal input added while away still lands when its week loads', () => {
    // dirty the seed week first so leaving it stashes it — forces the RESTORE
    // path (not the pure-seed path) on return, where the un-guard actually runs
    const kept: any = { person: 'divot', date: 'Jul 13', type: 'Training', allday: false, s: 540, e: 660, _t: true }
    INPUTS.push(kept); autoAcceptInput(kept)
    expect(landed(kept)).toBe(true)
    loadWeek('20/07/2026')                       // leave — week 13 is now stashed
    const inp: any = { person: 'divot', date: 'Jul 13', type: 'Meeting', allday: false, s: 600, e: 720, _t: true }
    INPUTS.push(inp)                             // added while on a different week
    loadWeek('13/07/2026')                       // return via the restore path
    expect(landed(inp), 'a never-unaccepted new input lands on return').toBe(true)
    expect(landed(kept), 'the input already landed here stays landed').toBe(true)
  })

  /* A NEVER-LANDED INPUT MUST NOT COME BACK DORMANT (26 Aug 26 bug pass). An
     input filed onto a PUBLISHED day is refused by auto-accept and sits
     acc-less — which is not a removal, and it correctly still counts. The un
     set used to record it anyway (acc-less + unlanded read as "unaccepted"),
     so after a week round-trip the restore re-parked it acc:'r': an input no
     scheduler ever removed silently stopped flagging. unacceptedKeys now
     records only the explicit 'r' mark.
     Phase 2 removed the reopen take-back (setDayApproved(di,false) is a no-op),
     so the round-trip now happens with the day STILL published — the input
     stays refused (never lands) and must still never be parked dormant. */
  it('an input filed onto a published day is not parked dormant after a week round-trip', () => {
    SCHED.dayOK[0] = 1                           // Monday published (mark set directly — the sign-off gate is not under test)
    const inp: any = { person: 'divot', date: 'Jul 13', type: 'Training', allday: false, s: 540, e: 660, _t: true }
    INPUTS.push(inp)
    expect(autoAcceptInput(inp), 'a published day refuses the landing').toBe(false)
    expect(inp.acc).toBeUndefined()
    loadWeek('20/07/2026')                       // leave — the week stashes (publish state changed)
    loadWeek('13/07/2026')                       // return via the restore path
    expect(inp.acc, 'never removed → never dormant').not.toBe('r')
    expect(landed(inp), 'still refused by the published day — not landed, but not removed either').toBe(false)
    expect(INPUTS.some((r: any) => r.person === 'divot' && r.type === 'Training' && (r as any)._t),
      'still a live personal input that will land once its day is a draft again').toBe(true)
  })
})
