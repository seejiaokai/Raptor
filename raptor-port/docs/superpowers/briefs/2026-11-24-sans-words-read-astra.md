**Changes required. Five findings reproduced.** No files changed. I read the round’s diff, touched code and required rulings. The reproductions used production code and the existing fixture, bundled and executed entirely in memory. **Full Vitest suite: NOT RUN** under the export’s configuration and read-only restrictions.

1. **P1 — `sansplan` can be written without a genuine planning change, including for another person.**

   **Where:** [people-settings-commit.ts:379](D:/raptor-work/c156-read/raptor-port/src/state/people-settings-commit.ts:379), settings write hook; [sansunfiled.ts:218](D:/raptor-work/c156-read/raptor-port/src/leavewar/sansunfiled.ts:218), reminder unread calculation.

   **Concrete case:** Saber posts Ranger as SANS from Fri 17 Jul 2026 and plans him on Sat 18. Ranger reads his reminder. Signed in as Hex, a hand-built `store.set('sansplan:bane:2026-07-18', 200)` succeeds, saves the value and lights Ranger’s reminder again. Separately, Saber can do the same to Hex through `commitSettingsIntent('settings.rules', …)`; that command returns `ok: true`.

   **Cause:** Registering the prefix makes it persistable, but neither the raw-write hook nor the command gate restricts these rows to the app’s legitimate planning transition.

   **Fix:** Reject raw writes and unrelated commands. Validate the permitted person/day changes and counter values against the planning command that caused them. A command name or system actor alone must not authorize arbitrary counters.

2. **P1 — A fresh change line can omit its required wording and disappear from the bell.**

   **Where:** [sansunfiled.ts:465](D:/raptor-work/c156-read/raptor-port/src/leavewar/sansunfiled.ts:465), `sansBackCovered`; [notices.ts:915](D:/raptor-work/c156-read/raptor-port/src/state/notices.ts:915), `sansBackLeft`.

   **Concrete case:** Hex is SANS from Fri 17 Jul, planned on Sat 18, and reads his reminder. Saber submits a hand-built posting command moving the SANS date to Fri 24, with the correct reminder days but no `how` field on its change line. The command succeeds. Hex’s reminder disappears, and **no explanation is visible**.

   **Cause:** The gate checks `how` only when supplied. The renderer then treats this newly created row as an old-format row; without hidden filings, it suppresses it entirely.

   **Fix:** Require the exact `how` and associated destination for every newly written line. Compatibility with old stored rows must not exempt fresh writes. This reproduces with new data, so it is not a legacy-data finding.

3. **P1 — Undo accepts a forged in-memory read state as permission to notify another person.**

   **Where:** [noticeseen.ts:88](D:/raptor-work/c156-read/raptor-port/src/state/noticeseen.ts:88), `seenOf`; [sync.ts:361](D:/raptor-work/c156-read/raptor-port/src/leavewar/sync.ts:361), follow-up gate wiring; [sync.ts:1990](D:/raptor-work/c156-read/raptor-port/src/leavewar/sync.ts:1990), `warNoticesReversed`.

   **Concrete case:** Saber ticks Hex SANS, plans Sat 18 and files Fri 17–Sat 18. Saber unticks him, producing “You’re no longer SANS.” Hex has **not** read that change line. On Saber’s device, appending its ID to `seenOf('rocky').ids`, then pressing Undo, successfully writes a struck “taken back · Saber” line to Hex.

   **Observed:** Hex’s saved read record remains unchanged, but the unowed follow-up is accepted and displayed.

   **Cause:** The new accessor exposes the live mutable array. Both follow-up generation and its permission check use `hasRead`, which trusts that cache.

   **Fix:** Use the saved read record, including its before-image where appropriate, for authorization. Return a defensive copy or deeply immutable value from `seenOf`. This round exposes the mutable accessor and extends the affected follow-up path to SANS.

4. **P2 — Planning afresh after Undo can fail to light the reminder.**

   **Where:** [sansunfiled.ts:422](D:/raptor-work/c156-read/raptor-port/src/leavewar/sansunfiled.ts:422), planning counter increment; `sansUnfiledLines` at line 218.

   **Concrete case:** Saber posts Hex SANS from Fri 17 Jul, then adds him to Sat 18’s programme. Hex reads the reminder on another device. Saber presses Undo, removing that planning action, then **adds Hex to Sat 18 afresh**.

   **Observed:** The new planning action succeeds, but the reminder remains read: unread count **0**, expected **1**.

   **Cause:** Undo removes the counter value `1`; the new action assigns `1` again. Hex’s saved read token already acknowledges that generation, so the fresh action is mistaken for the old one.

   **Fix:** Give fresh planning actions identities that cannot be reused after Undo. Preserve the intended distinction between Redo and a new action without deleting another person’s read marks.

5. **P2 — Repeated Redo leaves duplicate current change lines.**

   **Where:** [notices.ts:920](D:/raptor-work/c156-read/raptor-port/src/state/notices.ts:920), `sansBackLeft`; [sync.ts:1840](D:/raptor-work/c156-read/raptor-port/src/leavewar/sync.ts:1840), `followUpsOwed`.

   **Concrete case:** Saber ticks Hex SANS, plans Sat 18 and files Fri 17–Sat 18, then unticks him. Hex reads the change line. Saber presses Undo, then Redo; Hex reads the repeated line. Saber presses Undo and Redo again.

   **Observed:** Hex now has **two current, unstruck “You’re no longer SANS” lines**, rather than one current line told again.

   **Cause:** Each Redo creates another `again` row referring to the original. Visibility suppresses the original but does not suppress earlier siblings with that same reference. The equivalent Leave War path already handles this distinction.

   **Fix:** Display only the latest current SANS repeat for a reference, while retaining whatever taken-back history the rules require.

The following regression tests fit the existing fixture in [sans-words-156.test.tsx](D:/raptor-work/c156-read/raptor-port/src/leavewar/sans-words-156.test.tsx). They are proposed here only; nothing was written. `readElsewhere` follows the fixture’s approach to simulating another device without clearing Saber’s Undo history.

```ts
// Additional imports:
import { store as kv } from '../engine/hooks'
import { seenOf } from '../state/noticeseen'
import { commitSettingsIntent } from '../state/people-settings-commit'

const readElsewhere = (pid = 'rocky') => {
  mem[`sqn142_noticeseen:${pid}`] = JSON.stringify({
    upto: 0,
    ids: noticesFor(pid).map(n => n.id),
  })
  noticeSeenLoad()
}

it('F1: an unrelated settings command cannot forge planning news', () => {
  plan(SATI); posted(); hexReads()
  const result = commitSettingsIntent('settings.rules', null, () => {
    kv.set(`sansplan:rocky:${SAT}`, 200)
  })
  expect(result.ok).toBe(false) // actual: true
})

it('F1: Hex cannot raw-write Ranger’s planning counter', () => {
  plan(SATI, 'bane')
  expect(postOut('bane', FRI, 'sans')).toBe(true)
  raptorNotify()
  readElsewhere('bane')
  signInAs('hex')
  expect(me()).toBe('rocky')

  expect(() => kv.set(`sansplan:bane:${SAT}`, 200)).toThrow()
  // Actual: saves 200 and makes Ranger’s reminder unread.
})

it('F2: a fresh posting-change line must include its exact wording kind', () => {
  plan(SATI); posted(); hexReads()
  const days = (due()[0]!.what[0] as any).days

  const result = cmdCommit({
    type: 'lw.postout',
    scope: { module: 'people' },
    apply: txn => {
      resyncBeforeEnlist()
      txn.enlist(schedStore)
      txn.enlist(peopleStore)
      txn.enlist(settingsStore)
      txn.enlist(lwStore)
      // Low-level storage uses the last active day.
      setPostOut('rocky', '2026-07-23', 'sans')
      noticeSansBack('rocky', me(), days, FRI) // deliberately omit how
      validate()
      finishPeopleWrite()
      schedApplyEnd()
    },
  })

  expect(result.ok).toBe(false) // actual: true; backs() is empty
})

it('F3: cache tampering cannot authorize a taken-back line', () => {
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  raptorNotify()
  plan(SATI)
  readElsewhere()
  expect(commitNewInput(draft(FRI, SAT))).toBe(true)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  raptorNotify()

  const line = backs()[0]!
  expect(isUnread(line, 'rocky')).toBe(true)
  const saved = mem['sqn142_noticeseen:rocky']
  seenOf('rocky').ids.push(line.id)

  expect(globalUndo().ok).toBe(true)
  raptorNotify()
  expect(mem['sqn142_noticeseen:rocky']).toBe(saved)
  expect(backs()).toEqual([]) // actual: one taken-back line
})

it('F4: a fresh planning action after Undo lights the reminder', () => {
  posted()
  plan(SATI)
  readElsewhere()
  expect(dueUnread()).toBe(0)

  expect(globalUndo().ok).toBe(true)
  raptorNotify()
  expect(due()).toEqual([])

  plan(SATI) // fresh action, not Redo
  expect(dueUnread()).toBe(1) // actual: 0
})

it('F5: repeated Redo leaves only one current change line', () => {
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  raptorNotify()
  plan(SATI)
  expect(commitNewInput(draft(FRI, SAT))).toBe(true)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull()
  raptorNotify()
  readElsewhere()

  for (let i = 0; i < 2; i++) {
    expect(globalUndo().ok).toBe(true)
    expect(globalRedo().ok).toBe(true)
    raptorNotify()
    readElsewhere()
  }

  expect(backs().filter(n => !noticeWords(n).nameStruck)).toHaveLength(1)
  // actual: 2
})
```

**Older, not counted:** Reading another notification while all SANS days are filed can discard the absent reminder’s read marker. Deleting the filing then relights the reminder. I reproduced this, but the underlying read-record pruning predates this round.

**Question, not counted:** What retires `sansplan` rows? I found no expiry or cleanup path for the new per-person, per-day records. Their retention needs an explicit bound; I have not measured a resulting slowdown.

**Tidiness note — filed, not fixed:**

- **Duplicated?** `postingHow` and `howOfAfter` separately determine the posting-change wording. A shared pure classification function could reduce divergence while keeping the gate’s independent inputs.
- **Harder to follow than necessary?** Reminder identity combines termination counts, date lists and counters inside a string, with its interpretation spread across three modules. Named parsing and identity types would make the Undo rules easier to inspect.
- **Anything now unused?** `unfiledNow` still calculates `const from = sansPostedFrom(pid)` at line 120 but never uses it.

**5 findings. Fix #1 first: protect `sansplan` writes at both the raw-write boundary and the command gate.**