## Fable's blind read — the new SANS words and rules (copy `D:\raptor-work\c156-read`, commit `0eaacc411`)

Read: `ROUND.diff` (source half whole, the tests' names and fixtures), the rulings' full rows, `leavewar/sansunfiled.ts`, `state/noticeseen.ts`, the parts of `state/perms.ts`, `command/commit.ts`, `ui/inputedit.tsx`, `leavewar/sync.ts` the diff touches. Nothing changed in the copy.

**How the findings were proved.** The copy cannot run a test as it stands: its `tsconfig.json` names a `tsconfig.node.json` the export left out, so every vitest file fails at transform. I ran from the copy with a config of my own outside it (`D:\raptor-work\c156-read-fable\vitest.config.mjs`, `oxc: { tsconfig: false }`), one file at a time. My tests are `f1.test.tsx` (findings 1–4) and `f4.test.tsx` (finding 5) in that folder; they use the fixture of `sans-words-156.test.tsx` word for word (its lines 1–89 with the import paths repointed). To re-run: make a `node_modules` junction in that folder to the copy's (I removed mine), then from `raptor-port`: `npx vitest run D:/raptor-work/c156-read-fable/f1.test.tsx --config D:/raptor-work/c156-read-fable/vitest.config.mjs`. Simpler for the host: paste each test below into `src/leavewar/sans-words-156.test.tsx` on the branch. Each one FAILS on this commit.

Helpers the tests use beyond that file's own:
```ts
const readAll = () => { mem['sqn142_noticeseen:rocky'] = JSON.stringify({ upto: 0, ids: noticesFor('rocky').map(n => n.id) }); noticeSeenLoad() }
const dueDays = () => (due()[0]!.what[0] as any).days as string[]
```

---

### 1. A day planned again after its planning was Undone does not light his bell (breaks D2394 2a and the builder's own reading 1) — REPRODUCED
- **Where:** `leavewar/sansunfiled.ts`, `wireSansBackBefore` (the `onCommit` counter, `commitProjection … 'sans.planned'`) with `planOf` / `sansUnfiledLines`.
- **Case:** Hex posted out as SANS from Fri 17 Jul, on Sat 18. Saber puts him on Sun 19; Hex reads the reminder ("Sat 18, Sun 19"). Saber presses Undo (Hex off Sun 19), then later puts Hex on Sun 19 again by a fresh change.
- **What goes wrong:** Hex's bell stays dark; a newly planned day he was told had gone is back and he is never told.
- **Cause:** the count is written by a projection raised from the planning command's commit, so it folds into that command's Undo step. Undo puts `sansplan:rocky:2026-07-19` back (1 → null — the row stays, holding null), the fresh planning counts 1 again, and his read record holds "19.1", so `g > read.get(d)` is false. The code's comment says "an Undo or a Redo counts nothing"; in fact an Undo un-counts. (Measured: before undo `=1`, after undo `=null`, after re-plan `=1`, the reminder's id identical to the one he read.)
- **Fix:** make the mark something an Undo cannot bring back to a value a later planning will reuse: store a stamp that only grows (the moment or the command's sequence number of the latest planning) instead of count + 1, and compare the stamp he read with the stamp now. An Undo then restores an older stamp (still read, correctly), and any fresh planning writes a newer one (lit).
```ts
it('a day planned, read, its planning undone, then planned again: lit', () => {
  plan(SATI); posted(); plan(SUNI); readAll()
  expect(dueUnread()).toBe(0)
  expect(globalUndo().ok).toBe(true); raptorNotify()
  expect(dueDays()).toEqual([SAT])
  plan(SUNI)
  expect(dueDays()).toEqual([SAT, SUN])
  expect(dueUnread()).toBe(1)          // receives 0
})
```

### 2. Saber's Undo of a SANS tick takes Hex's SANS away and tells him nothing (D2391's C, D2341 "a hiding is never silent") — REPRODUCED
- **Where:** `state/quals-write.ts` `SANS_WATCH` / `sansunfiled.ts` `setSansTickWatch`, `sansTakeBack`; `command/commit.ts` begin hooks (origin `user` only); `sync.ts followUpsFor`.
- **Case:** Hex is on Sat 18. Saber ticks SANS for Hex on Quals; Hex reads his reminder (and, on his own phone, may file Fri 17 – Sat 18 — his filing does not block Saber's Undo, it is another record). Saber presses Undo.
- **What goes wrong:** Hex's tick is off, his reminder is gone, anything he filed is hidden — and his bell says nothing. The same change made by unticking the box writes "You're no longer SANS. · Saber".
- **Cause:** the line is written only inside `updatePersonField`; an Undo (origin `restore`) replays the record and never passes there. `followUpsFor` only handles an existing untick line's own Undo/Redo. And the start-of-command note (`BEFORE`) is taken for a person's own commands only, so even the gate could not check such a line in a restore.
- **Fix:** owe line C on any change of his record from SANS to not, whatever raised it: take the start note for a restore too, and write the line as a restore follow-up (the gate's `sansUntickOwed` already reads the change itself). Mirror for a Redo of an untick is already covered by the replay.
```ts
it('Saber ticks Hex SANS, Hex reads his reminder, Saber Undoes the tick: Hex is told', () => {
  plan(SATI)
  expect(updatePersonField('rocky', { tick: 'san' })).toBeNull(); raptorNotify()
  readAll(); expect(dueUnread()).toBe(0)
  expect(globalUndo().ok).toBe(true); raptorNotify()
  expect(due()).toEqual([])
  expect(backs().length).toBe(1)       // receives 0
})
```
(The filed-days variant I could not stage in one test — a sign-in ends Saber's Undo list — it follows from the same cause.)

### 3. A saved filing stretched back before his date, saved from the input's window: the early day is dropped and nothing is said (D2388 "saying why") — REPRODUCED
- **Where:** `ui/inputedit.tsx commitInput`, the early `return true` at "if (rec && !says && !answers && !gone.length && !added.length) return true", which sits before `if (cut) sayCut(cut.note)`.
- **Case:** Hex, SANS from Fri 17, has Fri 17 – Sat 18 filed. Saber (or Hex) opens it and stretches it to Thu 16 – Sat 18, Save.
- **What goes wrong:** the save answers "done", the record is unchanged, and no note says Thu 16 was left out or why. The one-person save (`commitInputEdit`) does say it — the existing test covers only that door.
- **Cause:** the cut makes the draft equal to the record, so "nothing changed" returns before the note.
- **Fix:** `if (… nothing changed …) { if (cut) sayCut(cut.note); return true }`.
```ts
it('the window\'s several-people path on a saved filing stretched back: says what it left out', () => {
  posted(); expect(commitNewInput(draft(FRI, SAT))).toBe(true); toasts.length = 0
  const rec: any = mine()[0]
  expect(commitInput(rec, { ...draftOf(rec), start: THU, end: SAT }, ['rocky'])).toBe(true)
  expect(toasts).toEqual(['Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Hex is SANS from Fri 17 Jul.'])   // receives []
})
```

### 4. His record of having read the reminder is thrown away whenever the reminder is not standing and he reads anything else — the code breaks its own reading 1 — REPRODUCED
- **Where:** `state/noticeseen.ts markNoticeRead` (keeps a `sansdue:` id only while a reminder of the same base is live) and `markAllNoticesRead` (keeps only ids of lines in the list now).
- **Case:** Hex read his reminder for Sat 18. Sat 18 is then filed (by him or Saber), so the reminder goes. Hex taps any other bell line, or presses "Mark all read". The filing is then deleted.
- **What goes wrong:** the reminder comes back LIT, though reading 1 (and the existing test "a filing deleted brings its day back into the line: the bell stays dark") says dark — that test passes only because another day kept the reminder standing. The knock-on: `dueRead` then says he had not read it, so a later change of his posting owes him no title line (D2391's "or he had read the reminder") when by the reading it does.
- **Cause:** as above; measured — his record went from `["sansdue:rocky~2026-07-18"]` to the other line's id alone.
- **Fix:** both writers keep his `sansdue:` ids whether or not a reminder stands (prune only ids of another base, or with days all in the past).
```ts
it('read; Sat filed for him; he taps another line; the filing deleted: dark', () => {
  plan(SATI); posted(); hexReads()
  expect(commitNewInput(draft(SAT))).toBe(true); raptorNotify()
  signInAs('hex'); expect(markNoticeRead(noticesFor('rocky').find(n => isUnread(n, 'rocky'))!.id)).toBe(true); signInAs('ad', 'a')
  removeInput(mine()[0]); raptorNotify()
  expect(dueDays()).toEqual([SAT])
  expect(dueUnread()).toBe(0)          // receives 1 — and the same with hexReads() in place of the tap
})
```

### 5. Speed: every change anyone makes now re-reads every edited week held — MEASURED
- **Where:** `sansunfiled.ts wireSansBackBefore` (the start-of-command hook) → `sansUnfiledDays` → `weeksHeld` → `stashDays` (a JSON parse and re-label of each held week) and `dayEngaged` of each of its days.
- **Case:** any squadron with one man ticked SANS on Quals (always true in use) and many edited weeks held. Before this round only men with a SANS posting saved were asked, so the usual cost was nil.
- **What goes wrong:** with 40 edited weeks held and Hex ticked, one fresh reading took about 165 ms (about 4 ms a week) in the test runner, out of about 240 ms for a whole planning change — on every command by any person, since the cache is keyed to the store's version, which every change moves. It grows with every week ever edited, past weeks included (a past week is parsed, then every day skipped).
- **No loop:** the counter's own projection is origin `projection`, which neither hook acts on — checked.
- **Fix:** skip a held week whose Sunday is before today by its key, before parsing; keep the parsed weeks and their named sets by the stash's own generation mark rather than dropping them on every version; or take the start-of-command note lazily, only when a command actually changes a posting or a SANS tick.

### 6. The new setting only ever grows (saved data) — by reading
- **Where:** `planKey` / the `onCommit` counter; no line anywhere removes a `sansplan:` row (the only mentions of the prefix are the three registrations and this file).
- **Case:** every SANS man × every day he is ever newly planned leaves a row for good; an Undo leaves the row holding null (seen in finding 1); a man archived, deleted or moved to another squadron keeps his rows. Every row rides in the settings store that each command snapshots, and `dueToken` lists his rows on every reading of his reminder.
- **Fix:** drop a man's rows for days before today when the counter next writes for him (the id already ignores them), and with him when he is deleted.

### Questions (no concrete failure staged)
- **Q-a, the gate.** `sansBackCovered` checks `how` only when the line carries one (`p.how !== undefined && …`). A line with no `how` on a real change passes, and then reads in the pre-D2391 words ("Your SANS availability … is hidden while you're not SANS that day"). Only an admin's hand-built command on a change that does owe a line could do it; should the gate require `p.how === o.how`?
- **Q-b, a man moved between squadrons.** The count is kept with the squadron's settings while his read record follows him; a day newly planned in the new squadron counts from 1 against a higher count he may have read for the same date in the old one, and stays dark. Would the stamp of finding 1's fix settle this too?
- **Q-c.** `saveBatchX`: if the body throws, `CUT_NOTE` is left set and the next unrelated save says a stale "left out" note. Clear it in the `finally`?
- **Permissions, as asked (3, 4):** a member cannot write a `sansplan:` row (the member gate answers "an admin's record" for any settings row but his three own); the counter is written by the system actor only; a member's own untick can owe a line only to himself, signed by himself; I found no door by which one person stores a line on another man's bell that the rules do not owe, nor removes one owed, beyond Q-a.

### Tidiness note (D489) — filed, not fixed
1. **Duplicated:** "what changed of the posting" is worked out twice (`postingHow` for the writer, `howOfAfter` for the gate) and "walk forward to his next SANS day" three times (`sansNextDay`, `sansRunTrim`, the loop in `sansRefusal`); `sansFiledShown` and `sansFiledOn` both walk every input for the same question.
2. **Harder to follow than needed:** the reminder's id is a small language of its own (`base[:n]~day.count,day.count`) parsed back by `readOf`, with "lit" decided in `sansUnfiledLines` and "read" in `dueRead` by two slightly different rules; `sansTakeBack`'s four flags (`stands`, `read`, `prior.kept`, `hid`) need the comment beside every line to be read.
3. **Left doing nothing:** `partWords`' `'sansback'` case and `backWords` no longer serve a posting's line; `hasReadSaved` has lost its only caller in this file's path; `NoticePart`'s `from?` on a pre-D2391 line and the "no `how`" branch of `sansBackWords` exist only for demo data (D56).

**Findings: 6 (five reproduced or measured, one by reading), plus three questions. Fix first: finding 1 (the count an Undo rolls back — it is the saved-data design itself, and the same change answers Q-b), then 2 (a silent loss of SANS), then 3 (a one-line fix).**
