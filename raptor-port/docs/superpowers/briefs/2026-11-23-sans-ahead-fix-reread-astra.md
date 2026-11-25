The fixes do not close every door. I found four concrete faults, reproduced by five failing tests. No files were changed.

The three supplied suites passed: 21 ordinary passes, three expected failures and one skipped test. I excluded the owner’s unresolved bell-wording questions.

I ran the additional tests through an in-memory Vitest transform using this copy’s source. The complete test file below reproduces the five failures. These are engine/command and generated-HTML checks, not a browser walk.

1. A member’s SANS tick cannot reliably be undone or redone after midnight.

State and steps:
- On Wed 15 Jul, Hex (`rocky`, signed in as `hex`) ticks his own SANS column.
- It saves with `sanFrom = 2026-07-15`.
- Without signing out, advance to Thu 16 Jul and press Undo.
- Alternatively, Undo on Wednesday, then Redo on Thursday.

Actual: both next-day operations return `ok: false`. The Undo reports “That couldn’t be completed just now.”

Required: D149 permits his own Quals change; D2313 dates it from the day made. The Person row of data-model.md §11 explicitly permits verified Undo/Redo to restore the recorded SANS days.

Cause:
- state/perms.ts:3524, ownershipChecks, compares the restored row with a fresh tick/untick calculated for today.
- Its exception calls REPLAY.
- undo/timeline.ts:709, verifiedReplay, does not include `people` in its supported collections. It therefore never vouches for this Person change.
- The supplied same-day test passes because that particular replay happens to match a fresh same-day tick. It does not exercise the exception.

Fix:
- Extend verifiedReplay to verify Person rows against the actual applying timeline step, retaining its actor, command, sequence and exact-image checks.
- Keep the own-row and admin-only-field restrictions.
- Add next-day Undo and Redo tests, plus a negative test for a fabricated restore envelope.

Adding `people` to the verifier in memory made both report tests pass.

2. The board filters an issued SANS panel using live posting state.

State and steps:
- On Wed 15 Jul, Saber (`ad` / `a`) gives Hex and Ranger (`bane`) SANS postings from Fri 17 Jul.
- File one shared offer for Sat 18 Jul.
- Publish Saturday with both men included.
- Move Hex’s posting to Fri 24 Jul.
- View the previously issued Saturday on the board.

Actual:
- The frozen input lookup still finds Hex’s offer.
- The frozen board’s SANS panel displays Ranger only.
- Hex disappears from the issued panel without an amendment.

Required: D2341 hides Hex in the working copy. D44/D45/D178 preserve the issued face and report the change as pending.

Cause:
- engine/inputs.ts:97, sansFaceShown, always calls sansOnP on live PEOPLE.
- ui/board-html.ts:878, sbSansPanel, applies that predicate even inside withDaySnap.
- withDaySnap installs frozen inputs and face attributes; it does not replace PEOPLE.
- sansAvailOn correctly recognises the frozen-input context, but sansFaceShown does not.

Fix:
- When inputsFrozenOn(at) is true, retain the faces already present in that frozen input.
- Apply the live SANS-day filter only to working inputs.
- Test the actual issued-board renderer after a posting moves.

Adding that frozen-context exception in memory made the report test pass. The observed failure is on the board; the ordinary published week does not display its editable SANS section.

3. Both filing checks silently approve the unchecked tail after day 400.

State and steps:
- Create fresh history through the normal doors: Saber ticks Hex SANS on 1 Jan 2025 and files availability through 14 Jul 2026.
- On Wed 15 Jul 2026, Saber unticks him. July 14 remains SANS; July 15 onward does not.
- Extend that existing filing through Thu 16 Jul.

Actual: commitInput returns true. The newly added non-SANS days save.

Required: D2340 and the Input row of §11 require newly covered days to be checked. The grandfathering allowance covers days the record already held, not this extension.

Cause:
- ui/inputedit.tsx:315, sansRefusal, stops after 400 days.
- engine/inputs.ts:128, sansNewDayProblem, does the same.
- Both count from the record’s original start, including unchanged days. This example exhausts the allowance before reaching the new extension, then returns success.
- No corresponding maximum-span refusal exists in normalizeInputDraft.

Fix:
- Never interpret an exhausted checking limit as approval.
- Check the newly covered intervals directly; for newly added people, check their whole requested interval.
- Prefer comparing date intervals against the person’s SANS intervals, avoiding a long daily loop.
- Share the eligibility calculation between the window and final gate.

Removing the two authorization-loop limits in memory made the report test reject the extension. This is fresh data created through current writers, not a D56 legacy-data finding.

4. The final gate blocks deleting a person when it must preserve his hidden part of a shared offer.

State and steps:
- Saber gives Hex and Ranger SANS postings from Fri 17 Jul.
- File their shared offer for Sat 18–Mon 20 Jul.
- Move Hex’s posting to Fri 24 Jul, hiding his part.
- On Sun 19 Jul, delete Hex through the normal person-delete writer.

Actual: deletePerson returns “That did not save”; the deletion rolls back.

Required:
- D299 preserves past inputs and removes the person from today and the future.
- D2341 keeps the hidden filing underneath.
- Preserving Hex’s existing Saturday slice adds no availability day.

Cause:
- state/person-delete.ts:260, applyDelete, calls ownInputOf to split Hex’s past portion from Ranger’s continuing record.
- engine/inputown.ts:118, ownInputOf, gives that preserved portion a new ID.
- state/perms.ts:3349, sansDayViolation, sees the new row without a before-image.
- sansNewDayProblem treats its already-held Saturday as a new filing and rejects it because Hex is now hidden that day.

Fix:
- Recognise an authorized preservation split within the same changeset.
- Verify its source before-image, person, retained dates and source change; exempt only the coverage actually preserved.
- Continue rejecting genuinely added people or days.
- Document this narrow preservation case beside the Input rule. Do not exempt all deletes or all system commands.

Suppressing this particular gate during the diagnostic delete made the operation and all preservation assertions pass. That suppression was a cause check, not the proposed fix.

The other requested paths

The hidden-at-publication sequence passed: publish Saturday while Hex is hidden, restore his Friday posting, and the working input includes him again while the original version excludes him. Pending appears; signing and publishing an amendment clears it, and the amendment includes him. Unpublish retained the live availability. I found no perpetual-pending or never-pending fault in that tested sequence.

These additional cases also passed:
- Saber changes the remarks of a shared offer whose Hex portion is hidden.
- Hex withdraws himself from that shared offer.
- Ordinary member filing Undo/Redo.
- Saber’s filing Undo/Redo after a posting change hides the filing.
- The SANS posting runs on its date.
- The posting sheet’s “Undo post out”.
- A squadron move with a hidden offer.
- The supplied rejection tests for forged SANS history, early filings and unrelated deletion of a sansback notice.

Global Undo/Redo of posting commands remains intentionally unavailable under D350, enforced by undo/timeline.ts. The sheet’s “Undo post out” is the supported posting reversal; this patch does not make postings ordinary timeline steps.

For member-written `san`, `sanFrom` and `sanWas`, I found no additional legitimate forward writer beyond the Quals path and no demonstrated bypass of the new date check. The legitimate door missed is verified Person replay, described in finding 1.

Speed

The patch adds work in the requested hot paths:
- Week/board rendering: an extra sansOnP lookup for each SANS face.
- Publication and pending comparison: sansDayView filters each shared offer’s people, allocating a filtered array.
- Every command: two additional scans of its changes. SANS input puts additionally walk each named person’s span, currently up to 400 days even when all those days were already held.
- Each sansback deletion searches the changes again for its posting; multiple deletions can therefore produce quadratic changeset scanning.
- sansOnP may scan pending postings and ended SANS stretches, so these are not invariably constant-time lookups.

I did not measure a visible slowdown. The useful optimization is to skip unchanged coverage immediately and validate only newly covered intervals. Removing the 400-day correctness defect should not simply introduce an unbounded per-day loop.

Missing regression coverage

Keep the five failing cases below. Also retain positive tests for hidden-record editing, withdrawal with another person hidden, filing replay after hiding, posting execution and sheet reversal, squadron moves, and both directions of the publish/hide/restore/amend sequence. The supplied snapshot tests do not establish that the issued board renders correctly, and their same-day Quals replay does not establish that verified Person replay works.

Copy the following into raptor-port/src/leavewar/sans-c154-reread.test.ts. All five tests failed at their intended assertions against this copy.

```ts
import {
  afterAll, afterEach, beforeAll, beforeEach, expect, it, vi,
} from 'vitest'
import { HOOKS, storeBackend } from '../engine/hooks'
import { PEOPLE, indexCallsigns, sansOnP } from '../engine/people'
import {
  INPUTS, holds, inputCoversDate, idsOf, sansAvailOn,
} from '../engine/inputs'
import { DAYS } from '../engine/data'
import {
  SCHED, signOf, setDayApproved, dayApproved, dayCurVer,
} from '../engine/publish'
import { stashClear } from '../engine/weekstash'
import { initStore, notify, resetSession } from '../state/store'
import { accountsLoad, signIn, sessionFor } from '../state/accounts'
import { unitsLoad } from '../state/units'
import { NOTICES } from '../state/notices'
import { updatePersonField } from '../state/quals-write'
import { deletePerson } from '../state/person-delete'
import { installGlobalUndo } from '../state/undo-wire'
import { globalUndo, globalRedo } from '../undo'
import { _resetTimeline } from '../undo/timeline'
import {
  commitInput, commitNewInput, draftOf, fmt,
} from '../ui/inputedit'
import { withDaySnap } from '../ui/html'
import { sbSansPanel } from '../ui/board-html'
import { initStore as warInit, setPeople } from './state/store'
import { memoryBackend } from './state/storage'
import { projectPeople } from './state/raptorRoster'
import { postOut, wireLeaveWarSync } from './sync'

const FRI = '2026-07-17'
const SAT = '2026-07-18'
const LATER = '2026-07-24'
const mem: Record<string, string> = {}
let p0 = '', d0 = '', i0 = ''
const toast0 = HOOKS.toast
const messages: string[] = []

const at = (y: number, m: number, d: number) =>
  vi.setSystemTime(new Date(y, m - 1, d, 9))

const login = (name: string, pass = 'x') => {
  resetSession(sessionFor(signIn(name, pass)))
  notify()
}
const posting = (id: string, day = FRI) => {
  expect(postOut(id, day, 'sans'), messages.join('|')).toBe(true)
  notify()
}
const draft = (person: string, start: string, end = '') => ({
  _new: true, person, type: 'SANS Availability', start, end,
  allday: true, sTime: '06:00', eTime: '18:00',
  remarks: '', sans: { f: true },
})
const record = (person: string, day = SAT): any =>
  INPUTS.find(r => r.type === 'SANS Availability'
    && holds(r, person) && inputCoversDate(r, fmt(day)))

const shared = (end = '') => {
  posting('rocky')
  posting('bane') // Hex and Ranger
  expect(
    commitInput(null, draft('bane', SAT, end), ['bane', 'rocky']),
    messages.join('|'),
  ).toBe(true)
}
const sign = () => Object.assign(signOf(5), {
  cur: 'ignite', sked: 'bane', plan: 'stiff', appr: 'pump',
})

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  p0 = JSON.stringify(PEOPLE)
  d0 = JSON.stringify(DAYS)
  i0 = JSON.stringify(INPUTS)
})
beforeEach(() => {
  at(2026, 7, 15)
  for (const k of Object.keys(mem)) delete mem[k]
  storeBackend.impl = {
    getItem: k => mem[k] ?? null,
    setItem: (k, v) => { mem[k] = v },
    keys: () => Object.keys(mem),
  }
  for (const k of Object.keys(PEOPLE)) delete PEOPLE[k]
  Object.assign(PEOPLE, JSON.parse(p0))
  indexCallsigns()
  DAYS.length = 0
  DAYS.push(...JSON.parse(d0))
  INPUTS.length = 0
  INPUTS.push(...JSON.parse(i0))
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
  unitsLoad()
  setPeople(projectPeople())
  wireLeaveWarSync()
  login('ad', 'a')
  _resetTimeline()
  installGlobalUndo()
  messages.length = 0
  HOOKS.toast = m => { messages.push(String(m)) }
})
afterEach(() => {
  HOOKS.toast = toast0
  resetSession(null)
  _resetTimeline()
  vi.restoreAllMocks()
})
afterAll(() => {
  vi.useRealTimers()
  storeBackend.impl = null
})

it('R1a: Hex can Undo yesterday\'s own SANS tick', () => {
  login('hex')
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(PEOPLE.rocky.sanFrom).toBe('2026-07-15')

  at(2026, 7, 16)
  expect(globalUndo().ok).toBe(true)
  expect(sansOnP(PEOPLE.rocky, '2026-07-15')).toBe(false)
})

it('R1b: next-day Redo restores the original SANS start', () => {
  login('hex')
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(globalUndo().ok).toBe(true)

  at(2026, 7, 16)
  expect(globalRedo().ok).toBe(true)
  expect(PEOPLE.rocky.sanFrom).toBe('2026-07-15')
})

it('R2: the issued board keeps Hex after his posting moves', () => {
  shared()
  sign()
  setDayApproved(5, true)
  expect(dayApproved(5)).toBe(true)
  const version = dayCurVer(5)

  posting('rocky', LATER)
  expect(sansAvailOn('rocky', DAYS[5].dt)).toBeNull()
  expect(withDaySnap(5, version,
    () => sansAvailOn('rocky', DAYS[5].dt))).toBeTruthy()

  const html = withDaySnap(5, version,
    () => sbSansPanel(DAYS[5], 5, undefined, true))
  expect(html).toContain('data-person="bane"')
  expect(html).toContain('data-person="rocky"')
})

it('R3: an extension after day 400 cannot add non-SANS days', () => {
  at(2025, 1, 1)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(
    commitNewInput(draft('rocky', '2025-01-01', '2026-07-14')),
    messages.join('|'),
  ).toBe(true)

  at(2026, 7, 15)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  notify()
  expect(sansOnP(PEOPLE.rocky, '2026-07-14')).toBe(true)
  expect(sansOnP(PEOPLE.rocky, '2026-07-15')).toBe(false)

  const r = record('rocky', '2026-07-14')
  expect(r).toBeTruthy()
  expect(
    commitInput(r, { ...draftOf(r), end: '2026-07-16' }, ['rocky']),
    messages.join('|'),
  ).toBe(false)
})

it('R4: deleting Hex preserves his past hidden shared-input slice', () => {
  shared('2026-07-20')
  posting('rocky', LATER)
  at(2026, 7, 19)

  expect(deletePerson('rocky'), messages.join('|')).toBeNull()
  expect(PEOPLE.rocky.deleted).toBe(true)
  expect(record('rocky', SAT)).toBeTruthy()
  expect(record('rocky', '2026-07-19')).toBeUndefined()
  expect(idsOf(record('bane', '2026-07-20'))).toEqual(['bane'])
})
```
