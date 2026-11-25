I found six issues that need fixing before this change is accepted.

I reviewed the exported after-code and FIX-DIFF.patch independently. The brief identifies the base as f292ab846; the export does not identify its final source commit and contains no Git repository. I did not read another reviewer’s report or a walk report.

I reproduced the failures through the app’s actual save, permission, reading and HTML-building functions, using isolated in-memory data. Seven regression assertions failed as described below. These were focused execution probes, not a Vitest run or a browser walk.

1. High priority: a shared filing still shows a man whose day is no longer SANS.

Reproduction:
- On Wed 15 Jul 2026, Saber saves SANS postings for Hex and Ranger from Fri 17 Jul.
- Saber files one shared Fly commitment for both on Sat 18 Jul.
- Saber moves Hex’s posting to Fri 24 Jul.

Actual result:
- Hex is correctly considered not SANS on Sat 18.
- Nevertheless, his availability lookup returns the shared filing.
- Edit Schedule’s SANS section and the Scheduler Board both include Hex.
- A newly made frozen input snapshot still contains both Hex and Ranger.
- Comparing the old and new input snapshots reports no input-detail change.

D2341 requires Hex’s commitment to disappear on that day while Ranger’s remains. An already published copy should retain its original contents under D44/D45; a new issue must freeze the corrected membership.

Cause:
- raptor-port/src/engine/inputs.ts: sansShownOn keeps the entire record when any named person is SANS.
- sansAvailOn, linesOf and facesOf then read all its people.
- raptor-port/src/ui/html.ts: sansSectionHTML and raptor-port/src/ui/board-html.ts: sbSansPanel expand those unfiltered faces.
- raptor-port/src/engine/publish.ts: dayInputsFrozen freezes that same full membership.
- frozenInputMatch compares unchanged full records.

Fix:
- Introduce one date-specific reading of a SANS record’s visible people.
- Use it for individual lookups, schedule faces, new frozen input snapshots and their comparison.
- Keep the stored record intact so hidden commitments return automatically.
- Preserve an existing frozen copy’s membership without consulting today’s live posting.
- Extend the shared-record test beyond the SANS calendar to the week, board and publication paths.

The calendar’s own per-person filtering already handles this case; the other readers disagree with it. I am not claiming the overall pending count is necessarily zero: another comparison, such as the roster comparison, can still detect the posting change.

2. High priority: an ordinary input command can erase the take-back notice.

Reproduction:
- Saber posts Hex as SANS from Fri 17 Jul.
- Saber files Hex’s Sat 18 commitment, then moves his posting to Fri 24.
- The correct hidden-days notice is created.
- An ordinary writeInputsBatch command removes that notice from NOTICES, without changing any posting.

Actual result: the command succeeds and Hex’s notice disappears.

This is a command-boundary failure, not a claimed visible “delete notice” button. The brief explicitly requires checking whether an unrelated command can forge or erase these notices.

Cause:
- raptor-port/src/state/perms.ts: ownershipViolation applies the war-writer and WAR_OWED checks to the after-image.
- A deletion has no after-image. An admin’s deletion of his own squadron’s notice passes the remaining ownership checks.

Fix:
- Check deletion and replacement of existing war notices as well as creation.
- Require a corresponding authorised retraction, recipient-lifecycle operation or verified replay.
- Refuse and roll back an ordinary input command that removes the notice.
- Preserve the legitimate posting and Undo/Redo cases with explicit tests.

3. The final save boundary accepts availability before the SANS date.

Reproduction:
- Saber saves Hex’s SANS posting from Fri 17 Jul.
- Hex signs in.
- A normal input batch inserts a new, correctly shaped SANS commitment belonging to Hex for Thu 16 Jul.

Actual result: writeInputsBatch returns true and retains the new record. The editor’s ordinary new-input path refuses the same date.

D2340 requires eligibility to follow the day being filed. D200 requires the final permission boundary to uphold that rule too.

Cause:
- raptor-port/src/ui/inputedit.tsx: sansRefusal checks dates at the editor layer.
- The final input-write checks in raptor-port/src/state/store.ts and raptor-port/src/state/perms.ts do not enforce the equivalent SANS date rule.

Fix:
- Put the date-and-person eligibility decision in one shared validation function.
- Call it from the editor and the final command check.
- Compare before and after records, so an existing hidden commitment can remain stored while newly added ineligible people or days are rejected.
- Test direct command writes and rollback, alongside the calendar, paste and editor routes.

The member ownership check itself held: Hex could not file Ranger’s SANS availability through either the ordinary editor path or the direct batch probe.

4. An existing record’s exemption also admits a newly added, now-ineligible man.

Reproduction:
- Hex and Ranger both have SANS postings from Fri 17 Jul.
- Saber files Ranger alone for Sat 18.
- An edit is prepared to add Hex to that record.
- Before that edit saves, Hex’s posting moves to Fri 24.
- The held edit saves with Ranger and Hex selected.

Actual result: commitInput succeeds and adds Hex.

The exception for preserving an already stored hidden commitment must not authorise a new commitment for someone who was never in that record.

Cause:
- raptor-port/src/ui/inputedit.tsx: sansRefusal accepts a non-SANS day whenever except covers that date.
- It does not establish that this same person already held a SANS commitment in except.

Fix:
- Limit the exception to an existing SANS record, the same existing person and an already covered day.
- Recheck every newly added person against the current posting at Save.
- Apply the same distinction at the final command boundary.
- Also test changing an ordinary input into SANS availability; a non-SANS record must not supply this exemption.

5. A valid past SANS day is offered for filing but refused at Save.

Reproduction:
- Hex’s posting starts on Fri 17 Jul and runs.
- On Mon 20 Jul, Saber unticks Hex’s SANS qualification.
- Hex opens Sat 18 Jul, when he was SANS, and files availability.

Actual result:
- sansOn correctly returns true for Sat 18.
- maySansAdd permits the action; the date-specific people picker offers Hex.
- Save fails with “SANS Availability is for SANS aircrew only”.

D2340 makes filing depend on the filed day. D2313 preserves the earlier SANS days when a tick is removed.

Cause:
- raptor-port/src/ui/inputedit.tsx: sansRefusal first requires sansFiler.
- raptor-port/src/engine/people.ts: sansFiler recognises a current SANS tick or an upcoming SANS posting, but not an ended SANS period.
- That preliminary check rejects the request before its valid date is examined.

Fix:
- When dates are supplied, judge eligibility from those dates, including recorded past SANS periods.
- Keep any date-free eligibility check separate from the dated save decision.
- Test both a new past commitment and an edit of an existing one after unticking.

6. The bell strikes words the person never read.

I reproduced two forms.

First:
- Hex has no planned, unfiled day and therefore no reminder.
- Saber files Sat 18, then moves Hex’s posting from Fri 17 to Fri 24.
- The hidden-days notice correctly appears, but it also shows “You’re SANS from Fri 17 Jul.” struck through, followed by “taken back”.

There was no reminder to strike.

Second:
- Hex reads a reminder naming Sat 18.
- Saber subsequently plans Hex on Sun 19.
- Hex does not reopen his bell.
- Saber moves the posting to Fri 24.
- The withdrawn notice strikes both Sat 18 and Sun 19.

Hex never read the Sunday wording.

D1693/D1699 distinguish a read notice from one the person never read. The brief specifically asks for this case.

Causes:
- raptor-port/src/state/notices.ts: noticeWords unconditionally supplies a struck heading and “taken back” for sansback, even when its struck-days list is empty.
- raptor-port/src/state/noticeseen.ts records the reminder’s identity, not the contents read.
- raptor-port/src/leavewar/sansunfiled.ts: sansTakeBack combines that old read identity with the current reminder’s days.

Fix:
- For a hidden-only notice, show the hidden-days sentence without an invented struck reminder.
- Preserve the reminder contents acknowledged when it was read, and use those contents when retracting it.
- Keep the intended live shrinking behaviour separate from the historical words eligible to be struck.
- Test no reminder, unread reminder, read reminder, and changed contents after reading.

The existing hidden-only test currently expects the struck heading. That expectation needs correcting.

The remaining reader and behaviour checks were as follows:

- SANS calendar counts and opened-day groups: per-person date filtering is present; it excluded Hex in the shared-record probe.
- Leave War’s SANS contribution: reaches sansCommittedOn through sansFlyOf, which checks each person’s date. I found no separate count failure there.
- Warnings: validate and sansGate check whether the person is SANS on the relevant date before requiring availability. I found no separate warning failure from the shared-record scenario.
- Insights: reads issuedWorld for published days. I found no additional direct SANS-availability enumeration; publication membership still needs the regression coverage described in finding 1.
- Frozen copies and change history: existing copies intentionally bypass live hiding. Newly frozen membership and the input comparison have finding 1’s defect.
- Export: the schedule export reads published schedule content where available. It does not independently export SANS commitments; the Inputs export has been removed. I found no separate export defect.
- Calendar drag, keyboard and new-editor saves: converge on the dated opening/save checks. The failures are the stale shared edit, historical-date refusal and missing final enforcement above.
- Fade: the source restricts it to the member’s own pre-SANS days while the posting date is ahead, leaves admin views unchanged, and supplies the accessibility wording. I found no additional logic fault. I did not verify its rendered appearance.
- Bell scope and lifecycle: the source contains recipient/squadron checks, saved-week scanning, duplicate-line checks, exact hidden-day checking, and a new reminder identity after restoration. I found no additional failure in those paths. This is not a browser or cross-squadron runtime pass.
- Global Undo: this patch does not introduce a replacement for the posting sheet’s own take-back operation. A normal Undo regression should remain in the host’s checks.

There are two speed concerns, not measured performance failures:
- sansShownAny can walk up to 400 dates for every SANS record examined.
- wireSansBackBefore runs at command start and calls sansFiledShown separately for every saved SANS posting. Each call scans INPUTS and expands matching date ranges. This adds work even to unrelated commands.

Prefer one indexed pass over relevant commitments, with invalidation tied to input, posting and SANS-history changes. Keep live and frozen readings separate. Measure a busy month and repeated board edits before calling performance unchanged. The 400-day limits also need explicit long-range correctness tests.

One documentation discrepancy needs resolving: D2340’s full row records an agent reading that a span with at least one SANS day is accepted, whereas this brief, implementation and tests require every newly filed day to qualify. None of the failures above depends on that mixed-span disagreement.

The following is a standalone regression file for the host to copy to raptor-port/src/leavewar/sans-review-regressions.test.ts. I have not created it. Its seven failing assertions were reproduced against this export using the in-memory execution harness; the host should run it through the repository’s normal Vitest setup.

```ts
import {
  afterAll, afterEach, beforeAll, beforeEach,
  describe, expect, it, vi,
} from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOn } from '../engine/people'
import { INPUTS, idsOf, sansAvailOn } from '../engine/inputs'
import { DAYS } from '../engine/data'
import { SCHED, dayInputsFrozen } from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import {
  initStore, notify, resetSession, writeInputsBatch,
} from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { afterSchedMutate } from '../state/view'
import { NOTICES, noticesFor, noticeWords } from '../state/notices'
import { markAllNoticesRead } from '../state/noticeseen'
import { updatePersonField } from '../state/quals-write'
import {
  commitInput, commitNewInput, draftOf,
} from '../ui/inputedit'
import { maySansAdd } from '../ui/sansadd'
import { sansSectionHTML } from '../ui/html'
import { sbSansPanel } from '../ui/board-html'
import { initStore as warInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import {
  postOut, runPoOutcomes, wireLeaveWarSync,
} from './sync'

const FRI = '2026-07-17'
const SAT = '2026-07-18'
const LATER = '2026-07-24'
let people0 = '', days0 = '', inputs0 = ''
const mem: Record<string, string> = {}
const oldToast = HOOKS.toast

const login = (name: string, pass = 'x') => {
  resetSession(sessionFor(signIn(name, pass)))
  notify()
}
const date = (day: number) =>
  vi.setSystemTime(new Date(2026, 6, day, 9))

const posting = (id: string, day = FRI) => {
  expect(postOut(id, day, 'sans')).toBe(true)
  notify()
}
const draft = (person = 'rocky', start = SAT) => ({
  _new: true, person, type: 'SANS Availability', start,
  allday: true, s: 360, e: 1080, sans: { f: true },
})
const offer = () =>
  expect(commitNewInput(draft())).toBe(true)

const backs = () =>
  noticesFor('rocky').filter(n => n.what[0]?.k === 'sansback')

const plan = (di: number) => {
  (DAYS[di] as any).ground.push({
    prog: 'BRIEFING', str: '1600', end: '1700', who: 'rocky',
  })
  afterSchedMutate()
}

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  people0 = JSON.stringify(PEOPLE)
  days0 = JSON.stringify(DAYS)
  inputs0 = JSON.stringify(INPUTS)
})

beforeEach(() => {
  date(15)
  for (const k of Object.keys(mem)) delete mem[k]
  storeBackend.impl = {
    getItem: k => mem[k] ?? null,
    setItem: (k, v) => { mem[k] = v },
  }

  for (const k of Object.keys(PEOPLE)) delete (PEOPLE as any)[k]
  Object.assign(PEOPLE, JSON.parse(people0))
  indexCallsigns()
  DAYS.length = 0
  DAYS.push(...JSON.parse(days0))
  INPUTS.length = 0
  INPUTS.push(...JSON.parse(inputs0))
  NOTICES.length = 0

  Object.assign(SCHED, {
    pending: {}, changes: {}, added: {}, als: [], al: 0,
    dayOK: {}, sign: {}, orig: {}, cur: {}, signBind: {},
    drafts: {}, curDraft: {}, retired: {}, correcting: {},
  })

  stashClear()
  warInit(memoryBackend())
  initStore()
  accountsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  login('ad', 'a')
  HOOKS.toast = () => {}
})

afterEach(() => {
  HOOKS.toast = oldToast
  resetSession(null)
  vi.restoreAllMocks()
})

afterAll(() => {
  vi.useRealTimers()
  storeBackend.impl = null
})

describe('Independent SANS review regressions', () => {
  it('hides only Hex from a shared Saturday offer', () => {
    posting('rocky')
    posting('bane')
    expect(commitInput(null, draft(), ['rocky', 'bane'])).toBe(true)
    posting('rocky', LATER)

    expect(sansOn('rocky', SAT)).toBe(false)
    expect(sansAvailOn('rocky', (DAYS[5] as any).dt)).toBeNull()
    expect(sansSectionHTML(DAYS[5], 5, true))
      .not.toContain('data-person="rocky"')
    expect(sbSansPanel(DAYS[5], 5))
      .not.toContain('data-person="rocky"')

    const frozen = Object.values(dayInputsFrozen(5))
      .filter((r: any) => r.type === 'SANS Availability')
    expect(frozen.flatMap(idsOf)).not.toContain('rocky')
    expect(frozen.flatMap(idsOf)).toContain('bane')
  })

  it('refuses a new early day at the final save boundary', () => {
    posting('rocky')
    login('hex')

    const ok = writeInputsBatch(() => {
      INPUTS.unshift({
        iid: 'review-early',
        people: [{ p: 'rocky', by: 'rocky' }],
        by: 'rocky',
        type: 'SANS Availability',
        date: 'Jul 16', yr: 2026,
        allday: true, s: 360, e: 1080, sans: { f: true },
      })
    })

    expect(ok).toBe(false)
    expect(INPUTS.some(r => r.iid === 'review-early')).toBe(false)
  })

  it('rechecks a newly added man when a shared editor saves', () => {
    posting('rocky')
    posting('bane')
    expect(commitNewInput(draft('bane'))).toBe(true)

    const rec = INPUTS.find(r =>
      r.type === 'SANS Availability' && idsOf(r).includes('bane'))!
    const heldDraft = { ...draftOf(rec), sans: { f: true } }

    posting('rocky', LATER)
    expect(commitInput(rec, heldDraft, ['bane', 'rocky'])).toBe(false)
    expect(idsOf(rec)).not.toContain('rocky')
  })

  it('accepts a past SANS day after the current tick is removed', () => {
    posting('rocky')
    date(17)
    runPoOutcomes()
    notify()

    date(20)
    expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
    notify()
    login('hex')

    expect(sansOn('rocky', SAT)).toBe(true)
    expect(maySansAdd(SAT)).toBe(true)
    expect(commitNewInput(draft())).toBe(true)
  })

  it('does not invent a struck reminder for hidden-only news', () => {
    posting('rocky')
    offer()
    posting('rocky', LATER)

    expect(backs()).toHaveLength(1)
    expect(noticeWords(backs()[0]!).nameStruck).not.toBe(true)
  })

  it('does not strike a newly added day Hex never read', () => {
    plan(5)
    posting('rocky')
    login('hex')
    expect(markAllNoticesRead()).toBe(true)

    login('ad', 'a')
    plan(6)
    notify()
    posting('rocky', LATER)

    expect(backs()).toHaveLength(1)
    expect(noticeWords(backs()[0]!).struck).not.toContain('Sun 19')
  })

  it('refuses erasing a take-back through an input command', () => {
    posting('rocky')
    offer()
    posting('rocky', LATER)

    const n = backs()[0]!
    expect(n).toBeTruthy()
    const ok = writeInputsBatch(() => {
      NOTICES.splice(NOTICES.findIndex(x => x.id === n.id), 1)
    })

    expect(ok).toBe(false)
    expect(backs()).toHaveLength(1)
  })
})
```

Further coverage needed after these fixes: shared membership through actual publication and amendment, frozen-face stability, the resulting change-history words, paste and keyboard saves after a posting changes, rollback of forbidden notice deletion, and reload of the exact reminder contents previously read.

Walk: NOT DONE — this was the assigned independent code read, with focused in-memory probes.
Files changed: none. No commit or push.
Rulings: none.