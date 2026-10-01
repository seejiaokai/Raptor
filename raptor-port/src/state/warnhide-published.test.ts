// @vitest-environment jsdom
/* [WARN-HIDE-KEPT] (owner D471, 1 Oct 26 — "2. Waits · 3. Yes") — A WARNING HIDDEN ON A DAY ALREADY PUBLISHED WAITS FOR THE
   NEXT AMENDMENT, like every other change to a published day; and the published schedule drops the hidden item's flag
   too — once that amendment is out. Driven through the app's own doors on a real saved store (the harness of
   weekrows-store.test.ts), on the demo Tuesday: Saint's clash and brief, Outlaw's crew rest (a warning that stays LIVE
   on a published face, D185), Static's long work day (one that FREEZES).
   Named for the plan (docs/superpowers/plans/2026-10-01-warn-hide-kept-plan.md §3.4) and its red team's findings:
   - EVERY authority agrees after a hide: the comparison, the day's count, the To go out list, the sign-offs, the publish
     button, the amendment's own item count, the load's confirm (Fable F1 = Astra 4) — and all read nothing after the
     flag-again (D98);
   - a hide is never also "Warnings on this day changed" (Fable F7);
   - the sign-offs made over a pending hide survive a rename of the man it names (Fable F3b); a hide of a warning the
     working copy no longer raises pends nothing (Fable F3a);
   - the issued face keeps its flag until the amendment goes out, then shows the line struck and the puck plain; with
     nothing published, and for a draft day beside a published one, the face follows the working hides (Fable F4);
   - Unpublish, Load onto working copy, a look at an older version (D101, D98, D187);
   - a hide alone draws no "new once signed" / "goes away once signed" row (Astra 3);
   - the change history says who hid what (Astra 5);
   - Sunday's "Breaks Monday" mark follows next Monday's own hide, and nothing else's (Astra 2, Fable F2). */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { INPUTS } from '../engine/inputs'
import { PEOPLE, ID_BY_CS } from '../engine/people'
import { DAYS } from '../engine/data'
import { CURWEEK } from '../engine/waves'
import { HOOKS, storeBackend } from '../engine/hooks'
import { stashClear } from '../engine/weekstash'
import { SCHED, setSign, dayCurVer, daySnapOf, dayDelta, dayPendingItems, dayShownPendCount, dayHasChanges, daySigned, dayDiscardCount, itemCounts } from '../engine/publish'
import { validate, workingWarn, rawWarn, officialWarn, withOfficialWarn, versionFaceWarn, sevOf, chipOf, traceOf } from '../engine/validate'
import { loadVersionToWorkingCopy } from '../engine/drafts'
import { setSlotVal } from '../engine/slots'
import { ELOG } from '../engine/editlog'
import { shownWarns, hideDetail } from '../engine/warnhide'
import { PLANPUCKS, DAYRMK } from './plan'
import { initStore, weekStashSnap, weekDirty, loadWeek } from './store'
import { commitSetDayApproved, commitPublishALDay, commitUnpublish, schedWrite, schedWriteValue, SCHED_TYPES } from './sched-commit'
import { setSession } from './auth'
import { hydrate, wirePersist } from './persist'
import { registerChangeLines } from './changelines'
import { bootStorage } from '../storage/boot'
import { settingsAdapter } from '../storage/adapters'
import { MemoryBackend } from '../storage/memory'
import { SCHEMA_VERSION } from '../storage/reset'
import { globalUndo } from '../undo'
import { _resetTimeline, undoState } from '../undo/timeline'
import { installGlobalUndo } from './undo-wire'
import { _resetDisclosure } from './disclosure'
import * as view from './view'
import { pendListHTML } from '../ui/pendlist'
import { dayWarnHTML } from '../ui/html'
import { peekWeekHTML } from '../ui/peek'
import { jumpToChange } from '../ui/interactions'
import { pendItemWords } from '../ui/pendlist'
import { nextMondayHides } from '../engine/weekctx'
import { elogWho } from '../engine/editlog'
import { ensureRowIds } from '../engine/rowids'

const ISNAP = JSON.stringify(INPUTS)
const PSNAP = JSON.stringify(PEOPLE)
const DSNAP = JSON.stringify(DAYS)
const W1 = '13/07/2026', W2 = '20/07/2026'
const MON = 0, TUE = 1, SUN = 6

function resetWorld() {
  if (CURWEEK !== W1) loadWeek(W1)
  INPUTS.length = 0; JSON.parse(ISNAP).forEach((r: any) => INPUTS.push(r))
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(PSNAP))
  for (const k of Object.keys(ID_BY_CS)) delete ID_BY_CS[k]
  for (const id of Object.keys(PEOPLE)) ID_BY_CS[PEOPLE[id].cs.toLowerCase()] = id
  PLANPUCKS.length = 0; for (const k of Object.keys(DAYRMK)) delete DAYRMK[k]
  DAYS.length = 0; JSON.parse(DSNAP).forEach((d: any) => DAYS.push(d))
  SCHED.pending = {}; SCHED.changes = {}; SCHED.added = {}; SCHED.als = []
  SCHED.al = 0; SCHED.dayOK = {}; SCHED.sign = {}; SCHED.orig = {}; SCHED.cur = {}
  SCHED.signBind = {}; SCHED.drafts = {}; SCHED.curDraft = {}; SCHED.retired = {}; SCHED.correcting = {}
  view.WARNOFF.clear(); ELOG.rows.length = 0
  stashClear()
}
async function boot(be: MemoryBackend) {
  if (!be.peek('settings', 'schema')) be.seed({ settings: { schema: JSON.stringify(SCHEMA_VERSION) } })
  const p = bootStorage(be)
  await vi.advanceTimersByTimeAsync(be.latency)
  const { wb } = await p
  storeBackend.impl = settingsAdapter(wb)
  hydrate(wb)
  initStore()
  wirePersist(wb, { weekSnap: weekStashSnap, weekDirty })
  _resetDisclosure()
  _resetTimeline(); installGlobalUndo(); registerChangeLines()
  setSession({ user: 'ad', role: 'admin' })
  return wb
}
/* through the one signing door (publish.ts setSign), so each signature is BOUND to what it signed (D103) */
const sign = (di: number) => { setSign(di, 'cur', 'ignite'); setSign(di, 'sked', 'bane'); setSign(di, 'plan', 'stiff'); setSign(di, 'appr', 'pump') }
const publish = (di: number) => { sign(di); expect((commitSetDayApproved(di, true) as any).ok, 'published').not.toBe(false) }
const amend = (di: number) => { sign(di); expect((commitPublishALDay(di) as any).ok, 'amendment out').not.toBe(false) }
const warns = (di: number) => (workingWarn().byDay[di] || {}).warns || []
const byCode = (di: number, code: string, id?: string) => warns(di).find((w: any) => w.code === code && (!id || (w.who || []).includes(id)))
/* the ✕ / ↺ on a line, as ui/interactions.ts runs it */
function tap(w: any) {
  const key = view.warnMuteKey(w), names = (w.who || []).map((id: any) => PEOPLE[id] ? PEOPLE[id].cs : id).join(', ')
  schedWriteValue(SCHED_TYPES.warnMute, () => view.toggleWarnOff(key), { key: hideDetail(!w.off, w.di, `${names}${names ? ' — ' : ''}${w.msg || ''}`) })
  HOOKS.histPush()
}
const face = (di: number) => (officialWarn().byDay[di] || {}).warns || []
const kinds = (di: number) => dayDelta(di).map((e: any) => e.kind)

beforeEach(() => { vi.useFakeTimers(); resetWorld() })
afterEach(() => { _resetTimeline(); vi.useRealTimers(); resetWorld(); setSession(null); storeBackend.impl = null })

describe('WH8 (D471) — a hide on a published day is ONE pending change, on every count', () => {
  it('the comparison, the count, the list, the sign-offs, the publish button and the load\'s confirm all say one — and none after the flag-again', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    expect(dayDelta(TUE), 'nothing pending as it goes out').toEqual([])
    sign(TUE)   // the four, signed on the day as published — bound to "nothing pending"
    expect(daySigned(TUE)).toBe(true)
    tap(byCode(TUE, 'LONGDAY'))
    expect(kinds(TUE), 'one entry, a hide — never "warnings changed" beside it (Fable F7)').toEqual(['hide'])
    expect(dayDelta(TUE)[0]!.addr, 'addressed by a fingerprint of the warning, never its place or its words (Fable F3)').toMatch(/^hide:1\.[0-9a-z]+$/)
    expect([dayDelta(TUE)[0]!.from, dayDelta(TUE)[0]!.to]).toEqual(['shown', 'hidden'])
    expect(dayPendingItems(TUE).map((x: any) => x.kind), 'the counting list has it too (Fable F1)').toEqual(['hide'])
    expect(dayShownPendCount(TUE), 'the day head reads 1 pending').toBe(1)
    expect(dayHasChanges(TUE), 'the publish button lights').toBe(true)
    expect(daySigned(TUE), 'the four fall (D103)').toBe(false)
    expect(itemCounts(dayPendingItems(TUE)), 'counted under "changes" in the Amendments panel').toMatchObject({ total: 1, chg: 1, hide: 1, warn: 0 })
    expect(dayDiscardCount(TUE), 'the load\'s confirm counts it').toBe(1)
    const list = pendListHTML(TUE)
    expect(list).toContain('1 change')
    expect(list).toContain('Warning · Static')
    expect(list).toMatch(/<s>flagged<\/s> → <b>hidden<\/b>/)
    /* …and it says who hid it, and when — the change history knows (D99; D469 "until another person unhides it";
       Fable's final read F2: the line was blank where the All changes tab beside it named him) */
    const words = pendItemWords(TUE, dayPendingItems(TUE)[0] as any)
    const hist = [...ELOG.rows].reverse().find((r: any) => r.sect === 'day' && String(r.lbl).indexOf('Warning · Static') === 0)!
    expect(words.who, 'the To go out line names who hid it').toBe(elogWho(hist))
    expect(words.who).not.toBe('')
    expect(words.when, 'and when').not.toBe('')
    /* …and back (D98) */
    tap(byCode(TUE, 'LONGDAY'))
    expect(dayDelta(TUE)).toEqual([])
    expect(dayPendingItems(TUE)).toEqual([])
    expect(dayShownPendCount(TUE)).toBe(0)
    expect(daySigned(TUE), 'the four are valid again').toBe(true)
    expect(dayDiscardCount(TUE)).toBe(0)
  })

  /* THE WALK'S FINDING (walker B, scenario 40, 1 Oct 26): the pending line carried the warning's SEAT for its tap, so a
     warning with no seat of its own (a long work day) could not be tapped at all — under a foot reading "Tap a change to
     go to it" — and one with a seat lit the seat and left the day's list shut. D99: a tap takes the view to the change;
     the change IS the line in the day's list. The item now carries the warning itself, and the tap opens the list on it. */
  it('a tap on the pending line opens the day\'s list on that warning\'s line — a warning with no seat of its own included (D99)', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    const key = view.warnMuteKey(byCode(TUE, 'LONGDAY'))
    tap(byCode(TUE, 'LONGDAY'))
    const item: any = dayPendingItems(TUE)[0]
    expect(item.jump, 'the item names the warning, whatever seat it has or has not').toEqual([`warnline:${key}`])
    expect(pendListHTML(TUE), 'so its line is a button').toMatch(/<button class="pl-item" data-plix="0"/)
    view.DWOPEN.clear(); view.clearWarnFocus()
    jumpToChange(item.jump, TUE)
    expect(view.DWOPEN.has(TUE), 'the day\'s list is open').toBe(true)
    const ix = warns(TUE).findIndex((w: any) => w.code === 'LONGDAY')
    expect(view.WFOCUS, 'on the struck line, its crew lit').toMatchObject({ di: TUE, ix, ids: ['wolf'] })
    expect(warns(TUE)[ix].off, 'still hidden — a tap looks, it changes nothing').toBe(true)
    expect(dayDelta(TUE).map((e: any) => e.kind)).toEqual(['hide'])
    view.clearWarnFocus(); view.DWOPEN.clear()       // the view is module state: leave it as the next test expects it
  })

  it('the amendment that carries it counts one item, stores the hide, and nothing is pending after', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    tap(byCode(TUE, 'LONGDAY'))
    amend(TUE)
    const al = SCHED.als[SCHED.als.length - 1]
    expect(al.units, 'the amendment says 1 item, not 0').toBe(1)
    expect(al.diff.map((e: any) => e.kind)).toEqual(['hide'])
    expect(dayDelta(TUE)).toEqual([])
    const w: any = daySnapOf(TUE, dayCurVer(TUE)).w
    expect(w.wo.length, 'the version keeps the key of what it went out hiding').toBe(1)
    expect(w.sev.wolf, 'its stored marks stay RAW — the comparison\'s basis').toBe('note')
    expect((w.shown.sev || {}).wolf, 'and the marks it went out SHOWING have no ring for him').toBeFalsy()
    expect(w.byDay.warns.some((x: any) => x.off), 'the stored list carries no off flag').toBe(false)
  })

  it('a hide of a LIVE warning (Outlaw\'s crew rest, D185) waits too', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    tap(byCode(TUE, 'CREW_REST'))
    expect(kinds(TUE)).toEqual(['hide'])
    expect(withOfficialWarn(() => sevOf(TUE, 'casper')), 'the published face keeps the ring until the amendment').toBe('hard')
    amend(TUE)
    expect(withOfficialWarn(() => sevOf(TUE, 'casper')), 'and drops it once it is out').toBeFalsy()
    expect(withOfficialWarn(() => traceOf(MON, 'casper')), 'the dotted mark on the day before goes with it (D475)').toBeNull()
  })

  it('two hides are two changes; one flag-again leaves one', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    tap(byCode(TUE, 'LONGDAY')); tap(byCode(TUE, 'NO_BRIEF'))
    expect(dayShownPendCount(TUE)).toBe(2)
    tap(byCode(TUE, 'NO_BRIEF'))
    expect(dayShownPendCount(TUE)).toBe(1)
  })
})

describe('the sign-offs are bound to WHICH warning, not to where it sits or what it is called', () => {
  it('signed over a pending hide, a rename of the man it names keeps the four (Fable F3b; a rename is a label)', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    tap(byCode(TUE, 'LONGDAY'))
    sign(TUE)
    expect(daySigned(TUE), 'signed over the pending hide').toBe(true)
    const was = PEOPLE.wolf.cs
    try {
      PEOPLE.wolf.cs = 'Statik'; validate()
      expect(kinds(TUE), 'still the one hide').toEqual(['hide'])
      expect(daySigned(TUE), 'the four stand').toBe(true)
    } finally { PEOPLE.wolf.cs = was; validate() }
  })

  it('a hide of a warning the working copy no longer raises pends nothing of its own (Fable F3a)', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    const clash = warns(TUE).find((w: any) => w.sev === 'hard' && (w.who || []).includes('salsa'))
    expect(clash && clash.key, "Saint's clash names his seat").toBeTruthy()
    tap(clash)
    expect(kinds(TUE)).toEqual(['hide'])
    /* take Saint off that seat: the working copy stops raising the warning; the hide's key stays behind, inert */
    schedWrite(SCHED_TYPES.slot, () => { setSlotVal(String(clash.key), ''); view.afterSchedMutate() })
    expect(warns(TUE).some((w: any) => w.code === clash.code && (w.who || []).includes('salsa')), 'the warning is gone from the working copy').toBe(false)
    expect(kinds(TUE).includes('hide'), 'no hide line for a warning that is not there').toBe(false)
    expect(dayShownPendCount(TUE), 'only the seat change is pending').toBeGreaterThan(0)
    expect(dayPendingItems(TUE).some((x: any) => x.kind === 'hide')).toBe(false)
  })
})

describe('WH9 — what the published face shows (D471, D475)', () => {
  it('a working-copy hide changes NOTHING on the face until the amendment; then the line is struck and the puck plain', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    const ix = warns(TUE).findIndex((w: any) => w.code === 'LONGDAY')
    tap(warns(TUE)[ix])
    expect(sevOf(TUE, 'wolf'), 'the working copy: no ring').toBeFalsy()
    expect(warns(TUE)[ix].off).toBe(true)
    expect(face(TUE).some((w: any) => w.off), 'the face: no line struck yet').toBe(false)
    expect(withOfficialWarn(() => sevOf(TUE, 'wolf')), 'the face: his ring still drawn').toBe('note')
    expect(withOfficialWarn(() => chipOf(TUE, 'wolf'))).toBe('LD')
    amend(TUE)
    const f = face(TUE).find((w: any) => w.code === 'LONGDAY')
    expect(f.off, 'the face: the line struck').toBe(true)
    expect(shownWarns(face(TUE)).length, 'and not counted').toBe(face(TUE).length - 1)
    expect(withOfficialWarn(() => sevOf(TUE, 'wolf'))).toBeFalsy()
    expect(withOfficialWarn(() => chipOf(TUE, 'wolf'))).toBeFalsy()
    expect(withOfficialWarn(() => sevOf(TUE, 'salsa')), "Saint's ring is untouched").toBe('hard')
  })

  it('with nothing published, View-only Sched follows the working hides (Fable F4)', async () => {
    await boot(new MemoryBackend())
    tap(byCode(TUE, 'LONGDAY'))
    expect(face(TUE).find((w: any) => w.code === 'LONGDAY').off).toBe(true)
    expect(withOfficialWarn(() => sevOf(TUE, 'wolf'))).toBeFalsy()
  })

  it('a published Monday beside a draft Tuesday: Tuesday follows the working hides, Monday its own issued ones', async () => {
    await boot(new MemoryBackend())
    publish(MON)
    tap(byCode(TUE, 'LONGDAY'))
    expect(face(TUE).find((w: any) => w.code === 'LONGDAY').off, 'the draft day on the face').toBe(true)
    expect(withOfficialWarn(() => sevOf(TUE, 'wolf'))).toBeFalsy()
    const m = byCode(MON, 'LONGDAY')
    const who = m.who[0]
    tap(m)
    expect(face(MON).some((w: any) => w.off), 'the published day: nothing struck on its face').toBe(false)
    expect(withOfficialWarn(() => sevOf(MON, who)), 'and its flags as issued').toBeTruthy()
    expect(dayShownPendCount(MON)).toBe(1)
  })

  it('a hide alone draws no "new once signed" or "goes away once signed" row (Astra 3)', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    tap(byCode(TUE, 'LONGDAY'))
    const realEdit = HOOKS.editMode
    try {
      HOOKS.editMode = () => true
      view.DWOPEN.add(TUE)
      const h = dayWarnHTML(TUE)
      expect(h).not.toContain('once signed')
      expect(h).toContain('⚠ 3 issues')
      expect(h).toMatch(/class="witem note hid"/)
    } finally { HOOKS.editMode = realEdit; view.DWOPEN.clear() }
  })
})

describe('WH7, WH8 — Unpublish, Load onto working copy, a look at an older version', () => {
  it('Unpublish falls back to the version before: the hide reads pending again (D101)', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    tap(byCode(TUE, 'LONGDAY'))
    amend(TUE)
    expect(dayDelta(TUE)).toEqual([])
    expect((commitUnpublish(TUE) as any).ok).not.toBe(false)
    expect(kinds(TUE), 'the Original went out with it flagged; the working copy still hides it').toEqual(['hide'])
    expect(withOfficialWarn(() => sevOf(TUE, 'wolf')), 'and the face is the Original\'s again').toBe('note')
  })

  it('Load onto working copy puts the day\'s hides back to the version\'s: nothing pending (D98)', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    tap(byCode(TUE, 'LONGDAY'))
    expect(dayDiscardCount(TUE)).toBe(1)
    schedWrite(SCHED_TYPES.mutate, () => { expect(loadVersionToWorkingCopy(TUE, dayCurVer(TUE))).toBe(true); view.afterSchedMutate() })
    expect(view.warnShown(rawWarn().byDay[TUE].warns.find((w: any) => w.code === 'LONGDAY')), 'flagged again by the load').toBe(true)
    expect(dayDelta(TUE)).toEqual([])
    expect(sevOf(TUE, 'wolf')).toBe('note')
  })

  /* Astra's scenario design, its "missing call site" 3 (1 Oct 26): the load's confirm counted the pending hide against
     the CURRENT version whichever version was being loaded — so loading an OLDER version whose hides the working copy
     already matches said "Discard 1 edit" and discarded nothing. It counts against the version being loaded. */
  it('the load\'s confirm counts the hides THAT version will change, not the current one\'s (D98)', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    const orig = dayCurVer(TUE)
    tap(byCode(TUE, 'LONGDAY')); amend(TUE)          // AL1 goes out with it hidden
    const al1 = dayCurVer(TUE)
    tap(byCode(TUE, 'LONGDAY'))                      // flagged again on the working copy: 1 pending against AL1
    expect(kinds(TUE)).toEqual(['hide'])
    expect(dayDiscardCount(TUE, al1), 'loading AL1 would hide it again — one edit replaced').toBe(1)
    expect(dayDiscardCount(TUE, orig), 'loading the Original changes no hide: the working copy already matches it').toBe(0)
    expect(dayDiscardCount(TUE), 'unnamed, it is the current version, as before').toBe(1)
    schedWrite(SCHED_TYPES.mutate, () => { expect(loadVersionToWorkingCopy(TUE, orig)).toBe(true); view.afterSchedMutate() })
    expect(kinds(TUE), 'and after that load the one difference from AL1 is still pending').toEqual(['hide'])
  })

  /* THE WALK'S FINDING (walker B, scenarios 3c / 3d / 43, 1 Oct 26): counted against the version being loaded, the load's
     confirm — and the "N pending" chip a look at that version wears — took every hide that DIFFERS between the working
     copy and that version for "your unpublished edit", a hide already PUBLISHED included: with nothing pending, a look
     at the Original read "1 pending" and "Discard 1 edit & load" where a typed remark read nothing. What a load
     discards is an UNPUBLISHED change it will undo: a pending hide whose state the loaded version does not share. */
  it('the load\'s confirm never counts a hide that is already published (D98, WH8)', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    const orig = dayCurVer(TUE)
    tap(byCode(TUE, 'LONGDAY')); amend(TUE)          // AL1 goes out with Static's long day hidden
    const al1 = dayCurVer(TUE)
    expect(dayDelta(TUE), 'nothing pending').toEqual([])
    expect(dayDiscardCount(TUE, orig), '3d — nothing is pending, so a load of the Original discards nothing').toBe(0)
    expect(dayDiscardCount(TUE, al1)).toBe(0)
    /* 3c — one pending hide (Saint's clash) on top */
    const clash = () => warns(TUE).find((w: any) => w.sev === 'hard' && (w.who || []).includes('salsa'))
    tap(clash())
    expect(dayShownPendCount(TUE), 'one pending').toBe(1)
    expect(dayDiscardCount(TUE, orig), '3c — a load of the Original discards that one, not two').toBe(1)
    expect(dayDiscardCount(TUE, al1), 'and so does a load of AL1').toBe(1)
    /* 43 — AL2 flags the long day again; the pending hide of the clash is still the only unpublished edit */
    tap(clash())                                     // back: nothing pending
    tap(byCode(TUE, 'LONGDAY')); amend(TUE)          // AL2: flagged again
    tap(clash())                                     // one pending hide
    expect(dayShownPendCount(TUE)).toBe(1)
    expect(dayDiscardCount(TUE, al1), '43 — a look at AL1 reads 1 pending, not 2').toBe(1)
    expect(dayDiscardCount(TUE, orig)).toBe(1)
    expect(dayDiscardCount(TUE)).toBe(1)
  })

  it('a look at an older version shows the hides IT went out with (D187)', async () => {
    await boot(new MemoryBackend())
    publish(TUE)
    const orig = dayCurVer(TUE)
    tap(byCode(TUE, 'LONGDAY')); amend(TUE)
    const al1 = dayCurVer(TUE)
    tap(byCode(TUE, 'LONGDAY')); amend(TUE)
    const long = (b: any) => b.byDay[TUE].warns.find((w: any) => w.code === 'LONGDAY')
    expect(!!long(versionFaceWarn(TUE, orig)).off, 'the Original: flagged').toBe(false)
    expect(versionFaceWarn(TUE, orig).sev[TUE].wolf).toBe('note')
    expect(long(versionFaceWarn(TUE, al1)).off, 'AL1: struck').toBe(true)
    expect((versionFaceWarn(TUE, al1).sev[TUE] || {}).wolf).toBeFalsy()
    expect(!!long(officialWarn()).off, 'AL2, the face today: flagged again').toBe(false)
  })
})

describe('WH11 — the change history says who hid what (D469 — "until another person unhides it")', () => {
  it('one line per hide and per flag-again, led by the warning, under the day; Undo names it in the app\'s words', async () => {
    await boot(new MemoryBackend())
    tap(byCode(TUE, 'LONGDAY'))
    const row = ELOG.rows[ELOG.rows.length - 1]!
    expect(row.lbl).toBe(`Warning · ${PEOPLE.wolf.cs} — ${byCode(TUE, 'LONGDAY').msg}`)
    expect([row.from, row.to]).toEqual(['flagged', 'hidden'])
    expect(row.di).toBe(TUE)
    expect(undoState().undoLabel, 'the Undo step').toBe('hiding a warning')
    tap(byCode(TUE, 'LONGDAY'))
    const again = ELOG.rows[ELOG.rows.length - 1]!
    expect([again.from, again.to]).toEqual(['hidden', 'flagged again'])
    expect(undoState().undoLabel).toBe('flagging a warning again')
    expect(globalUndo().ok).toBe(true)
    expect(view.warnShown(byCode(TUE, 'LONGDAY')), 'Undo of the flag-again hides it again').toBe(false)
    /* judged on what every surface READS, not only on the set (Fable's final read F4): the bundle as shown */
    await vi.advanceTimersByTimeAsync(0)
    expect(byCode(TUE, 'LONGDAY').off, 'the line is struck').toBe(true)
    expect(sevOf(TUE, 'wolf'), 'and his puck plain').toBeFalsy()
    expect(globalUndo().ok, 'Undo of the hide itself').toBe(true)
    await vi.advanceTimersByTimeAsync(0)
    expect(!!byCode(TUE, 'LONGDAY').off, 'flagged: the line plain').toBe(false)
    expect(sevOf(TUE, 'wolf'), 'and his puck flagged').toBe('note')
  })
})

describe("the marks that cross the week's edge follow next Monday's own hide (Astra 2, Fable F2)", () => {
  it('Sunday\'s "Breaks Monday" mark stays while anything ELSE is hidden, goes when Monday\'s breach is hidden, and returns', async () => {
    await boot(new MemoryBackend())
    /* the owner's own case (crewrest-ui.test.ts): bane flies next Monday's first wave; a Sunday duty till 23:00 busts it */
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[SUN] as any).dutywaves[0].rows.push({ role: 'Duty', id: 'bane', str: '1300', end: '2300' }); view.afterSchedMutate() })
    expect(traceOf(SUN, 'bane'), 'the forward mark').toBeTruthy()
    expect(traceOf(SUN, 'bane').di).toBeNull()
    /* an unrelated hide on this week must not touch it (v1's replay would have dropped it) */
    tap(byCode(TUE, 'LONGDAY'))
    expect(traceOf(SUN, 'bane'), 'still there beside an unrelated hide').toBeTruthy()
    /* next week: Monday raises the breach itself; hide it there */
    loadWeek(W2)
    const cr = byCode(MON, 'CREW_REST', 'bane')
    expect(cr, "next Monday's own crew-rest warning").toBeTruthy()
    tap(cr)
    loadWeek(W1)
    expect(traceOf(SUN, 'bane'), 'hidden on Monday → no mark on Sunday').toBeNull()
    expect(rawWarn().trace[SUN].bane, 'the raw pass still has it (the pre-drop probe reads this)').toBeTruthy()
    /* flag it again there: the mark returns */
    loadWeek(W2); tap(byCode(MON, 'CREW_REST', 'bane')); loadWeek(W1)
    expect(traceOf(SUN, 'bane')).toBeTruthy()
  })

  /* Fable's final read F1 (1 Oct 26): the answer was worked out again — next week's whole saved copy parsed from text — on
     every ask for the face (per published day drawn, per ALL AVAIL chip, per open list), where main read that copy once a
     validate. It is remembered against the saved copy itself: the same copy gives the same answer object. */
  it("next Monday's hides are read once per saved copy, not once per ask (Fable's final read F1)", async () => {
    await boot(new MemoryBackend())
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[SUN] as any).dutywaves[0].rows.push({ role: 'Duty', id: 'bane', str: '1300', end: '2300' }); view.afterSchedMutate() })
    loadWeek(W2); tap(byCode(MON, 'CREW_REST', 'bane')); loadWeek(W1)
    const a = nextMondayHides(W1), b = nextMondayHides(W1)
    expect(a.size, 'one hide in force on next Monday').toBe(1)
    expect(b, 'asked again of the same saved copy: the same answer, not a second parse').toBe(a)
    loadWeek(W2); tap(byCode(MON, 'CREW_REST', 'bane')); loadWeek(W1)
    const c = nextMondayHides(W1)
    expect(c, 'the saved copy changed: a new answer').not.toBe(a)
    expect(c.size).toBe(0)
  })

  /* Fable's final read F3: the run's forward mark was promised (plan §3.2) and neither tested nor walked. Saint works the
     demo Tuesday and Thursday; put on Wednesday and Friday to Sunday he has six days running (the limit), and next
     Monday is the seventh — every day of this week's run wears the dotted run mark pointing across the edge. */
  it("WH12 — the 7-day run's forward dotted mark follows next Monday's hide as well (Fable's final read F3)", async () => {
    await boot(new MemoryBackend())
    const WHO = 'salsa'
    schedWrite(SCHED_TYPES.mutate, () => { for (const di of [2, 4, 5, 6]) (DAYS[di] as any).dutywaves[0].rows.push({ role: 'Duty', id: WHO, str: '0900', end: '1000' }); view.afterSchedMutate() })
    loadWeek(W2)
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[MON] as any).dutywaves[0].rows.push({ role: 'Duty', id: WHO, str: '0900', end: '1000' }); view.afterSchedMutate() })
    const said = byCode(MON, 'DAYS_RUN', WHO)
    expect(said, 'next Monday is his seventh day running').toBeTruthy()
    const words = String(said.msg)
    loadWeek(W1)
    expect(traceOf(SUN, WHO) && traceOf(SUN, WHO).run, 'this week wears the forward run mark').toBeTruthy()
    expect(traceOf(SUN, WHO).run.di).toBeNull()
    const tr = (rawWarn().traces as any[]).find((x: any) => x.id === WHO && x.w.di == null && x.w.code === 'DAYS_RUN')
    expect(tr.w.msg, "the mark carries next Monday's own sentence, word for word — the key the two must share").toBe(words)
    loadWeek(W2); tap(byCode(MON, 'DAYS_RUN', WHO)); loadWeek(W1)
    expect((traceOf(SUN, WHO) || {}).run, 'hidden on Monday → the run mark goes').toBeUndefined()
    expect((traceOf(TUE, WHO) || {}).run, 'on every day of the run').toBeUndefined()
    expect(rawWarn().trace[SUN][WHO].run, 'the raw pass keeps it').toBeTruthy()
    loadWeek(W2); tap(byCode(MON, 'DAYS_RUN', WHO)); loadWeek(W1)
    expect(traceOf(SUN, WHO).run, 'flagged again → back').toBeTruthy()
  })

  it('WH12 — when next Monday is PUBLISHED, a hide made there since waits for its amendment here too (D471)', async () => {
    await boot(new MemoryBackend())
    schedWrite(SCHED_TYPES.mutate, () => { (DAYS[SUN] as any).dutywaves[0].rows.push({ role: 'Duty', id: 'bane', str: '1300', end: '2300' }); view.afterSchedMutate() })
    loadWeek(W2)
    publish(MON)                                   // goes out with the breach flagged
    tap(byCode(MON, 'CREW_REST', 'bane'))          // hidden on its working copy: pending there
    expect(kinds(MON)).toEqual(['hide'])
    loadWeek(W1)
    expect(traceOf(SUN, 'bane'), "Monday's published face still flags it, so Sunday's mark stands").toBeTruthy()
    loadWeek(W2); amend(MON); loadWeek(W1)
    expect(traceOf(SUN, 'bane'), 'the amendment is out: the mark goes').toBeNull()
  })

  it('WH12 — the next-week preview drops the amber time box of a nought-minute line whose warning is hidden there (Astra 1)', async () => {
    await boot(new MemoryBackend())
    const marks = () => { const d = document.createElement('div'); d.innerHTML = peekWeekHTML(); return d.querySelectorAll('[data-peek-day="0"] .badtm').length }
    loadWeek(W2)
    /* a line on next week's Monday that takes off and lands at the same minute */
    schedWrite(SCHED_TYPES.mutate, () => {
      (DAYS[MON] as any).waves.push({ label: 'WAVE 9', formations: [{ cs: 'RAP 9', msn: 'X', to: '10:00', ld: '10:00', aircraft: [{ p: 'bane', w: '' }] }] })
      ensureRowIds(DAYS); view.afterSchedMutate() })
    const w = byCode(MON, 'FLT_NO_LEN')
    expect(w, 'the warning is raised there').toBeTruthy()
    loadWeek(W1)
    expect(marks(), 'the preview marks its two time boxes').toBe(2)
    loadWeek(W2); tap(byCode(MON, 'FLT_NO_LEN')); loadWeek(W1)
    expect(marks(), 'hidden there → no red box here').toBe(0)
    loadWeek(W2); tap(byCode(MON, 'FLT_NO_LEN')); loadWeek(W1)
    expect(marks(), 'flagged again → back').toBe(2)
  })
})
