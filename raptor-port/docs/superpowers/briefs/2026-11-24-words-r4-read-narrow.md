# The narrow read of round 4's three read-fixes (D2521) — a fresh Opus reader, 24 Nov 26

(Saved by the host, chat 170, from the helper's returned message: its file tool refused the write to
`D:/rw4/reads/narrow/report.md`. **Who:** a fresh Opus helper of chat 170 (the Agent tool, model opus) that wrote none of
the fixes. **What it read:** the blind copy `D:/rw4/read-copy` with the three fixes applied from
`D:/rw4/reads/narrow/FIXES.patch` (`git diff 68ab6d1db..489420a0c -- raptor-port/src`), and the three claims the fixes
answer — nothing of the walk, the scenario lists or the first three readers' reports. Its proof tests:
`D:/rw4/reads/narrow/scratch/p2.ts`, `p3.ts`. No file of the copy was changed.)

---

**Verdict: nothing wrong — all three fixes are right and complete, and none broke anything beside it.**

**Fix 1, the publish note (`publishFlagsBids`, `toastBatch`): right.**
- The day line with its two halves, nothing unanswered — the proof test, through the real batcher and the real note
  element: "Saturday 12 Feb published and approved. The ground programme has no usable times, so nobody on it earns OIL.
  No Leave War period for 2028, so no OIL can be earned for this day. Create the period on the Leave War." One full stop
  at the end, no " · ".
- The day line plus the unanswered line: the unanswered sentence is already part of the joined text, so the fix adds the
  no-period sentence once; nothing is said twice (by reading).
- The unanswered line alone: the joined text becomes "<open>. No Leave War…", the join capitalising its first letter (by
  reading).
- "Earned nobody any OIL" (no two halves): still joined by the dot, as designed (the proof test).
- Neither line: still "Saturday published and approved · No Leave War period for 2028, …", the approved picture (the
  proof test).
- The un-batched message and the amendment's note: the first argument is unchanged in every case.
- The other place `say` is called (the bid-clash ending) passes nothing, so it behaves exactly as before.
- Cutting the full stop off the sentence removes only its own last full stop.
- Its test fails without the fix for the right reason ("earns OIL. · No Leave War…"); it runs approve-then-check inside
  the batcher the way the real publish does, though not through the publish command itself.

**Fix 2, the drag (`applyDrop`, `same()`): right.**
- An input's own row: the input's own check still answers first with its "already on" refusal; the fix does not touch it.
- Order of checks: the not-his-squadron check also comes first; the new check then runs before the seat-refusal and
  once-per-row checks — the tap's order. A seat that would refuse him cannot already hold him, so no refusal is hidden.
- An empty seat with an empty drag: guarded. The "+ add" places are not seats and never reach this code.
- What the old path did: it wrote the same value back, which changed nothing; the once-per-row check skips the seat
  itself, so it never refused. Nothing relied on that path, and the new one writes nothing, so no empty Undo step.
- Clean-up: the drag state and the `dnd` class are cleared.
- ALL AVAIL dropped on its own seat now says "ALL AVAIL — already in that seat" instead of nothing — as the tap; not a
  fault. On a phone the crew list's drawer comes back after this drop, as after every other refused drop.
- Its test drives the real drag onto a real seat and fails without the fix.

**Fix 3, the rename (`ownName`): right.**
- `ownName` is used only by the title part of `common` and by `swallowed`.
- It cannot disagree with the bold name: it reads the title and the "To" through the same two functions the bold name
  uses, so no rename is said that the bold name does not show, nor the reverse.
- `common()` run on 13 before / after pairs: a Training titled "Training · briefing" → Meeting, title untouched — the
  kind only; retitled "Meeting · briefing" (the claimed case) — the kind and "renamed"; an Attach's "To" alone changed —
  "renamed"; an Attach with a title, its "To" changed — "renamed"; a Training titled "Brief" → LL — the kind and
  "renamed"; LL → a Training titled "Brief" — the kind and "renamed"; a title of spaces only, the kind changed — the
  kind only; a Training titled "MEETING" → Meeting — the kind only; no title → a title, and back — "renamed" only; a
  Training → an Attach with a "To" — the kind and "renamed"; a Training titled "attach" → an Attach with a "To" — the
  kind and "renamed".
- An Attach with a "To" and no title: the old and the new code give the same " · 145", so nothing changes there.
- Its test goes through the real save and the bell, and fails without the fix.

**Explicit negatives:** no doubled or missing full stop, no sentence said twice or lost; no change to the un-batched
note or the amendment's note; no drag state left behind, no check skipped or put in the wrong order; no title pair where
the bell and the bold name disagree. The six related test files pass — the three fix files, `oilsync`, `noteswords`,
`oilperiod-offer` — 288 tests.

**There before the fixes, unchanged by them, not a finding (no ruling says otherwise):** an untitled Training made a
Meeting with its title typed "Training" keeps the bold name "Training", and the bell says only "Training changed to
Meeting".
