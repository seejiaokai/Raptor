# Job 2 (31 Oct 26, the night) — the security read (D1411)

One fresh Opus reader looking only for holes, read-only, on `claude/lw-roster-restore-fixes` at 7d0c12b24
(`postout-roster.test.ts` 16/16). Saved as it arrived.

1. **Medium, at the database step — the rule written in §11 and in the gate is looser than what the pass does**
   (`src/state/perms.ts`, the new `lw.postoutRun` block; `docs/data-model.md`'s new posting-pass paragraph). Once
   translated: the pass runs in every signed-in browser, members' too (`sync.ts lwSyncTurn` → `runPoArchive` on every
   notify), so the service account §11 describes must be usable from a member's browser; that browser sends a
   `lw.postoutRun` changeset with any change to rocky's posting record and, beside it, his Person row with Management
   ticked, a new callsign or the delete mark cleared — the rule passes it, since it asks only "is there a change to
   `lw.postouts` with the same id". The account side is not held either: the gate never checks the pass's `settings`
   changes (`suspendForPosting`, `dropAccountOfPid`), though §11 says it "suspends or deletes his User … never any other
   person's row". Cause: matched by id alone; nothing checks the posting change is the done mark of a posting that is
   due, nothing limits which Person fields change, account rows uncovered. Fix: (a) for `lw.postoutRun` require the
   posting change to set `poDone` from something else to its own posting date (`to` + 1, on or before today); require
   the Person row differ only in that outcome's fields (Overseas `archived/archivedBy/archivedOn`; SANS
   `san/quals.san/sanQ/sanBy`; Delete `deleted/deletedFrom/archived/archivedBy` — confirm against `applyDelete` and
   `forgetPersonFrom`); allow `settings` account rows only for the men being posted. (b) §11: at the database step the
   pass runs on the server (a scheduled flow), never under a credential a browser holds — file as a database-step item.
   Not usable in today's build: no path to an envelope under the app's own name but the app's own code.
2. **Low — only the people store is covered.** The war's `lw.sync` projection (`leavewar/state/store.ts` ~1660) and the
   inputs projection (`writeInputsBatchProjection`) compare against their saved copies and run as the app itself,
   unchecked; a change slipped into memory there rides the same way. The pass's own war, settings and schedule stores
   are safe. Fix: the same database-step item — every pass the app runs under its own name is server-side and limited
   to the rows it owns.
3. **Low, a posting stall only, needs a console — a console-added body marked `special` escapes the put-back.**
   `revertUnsavedPeople`'s `isPlaceholderBody(id) && !(id in base)` skips any `special` body, not only `all` and
   `allavail`; the gate then refuses the whole pass every turn, postings stall until a reload. The gate holds. Fix: skip
   only `all` and `allavail`.
4. **The Redo change gives a member nothing.** D1263 still held by the gate's `lw.cell` rule on Redo envelopes; D1447
   R21 — approval is an admin's alone and the gate refuses a member's unvouched `lw` mark; D1436 — the Delete posting
   drops his account. Two admin-side leads, older than this change, never run in the app (not findings): the count is
   a net sum (a war step approving a refused day and removing as many other approved days sums to no growth, and its
   Redo passes — the old code summed the same way); the final `inputs` check tests only an input's start date against
   his cutoff (`inInput(v,id) && inputDates(v).some(d => d >= cut)`). Worth one red test each before filing.
5. **An admin's own roster command saving whatever is in memory is not a hole** — he may write any Person row; a stray
   change can only come from his own console, recorded under his name and limited by his role. At most a tidiness note.

Verdict: the change closes the carrier inside the app; no member-reachable bypass. Tighten the rule (1) before the
database step, and file it with (2).
