# Outstanding — ARCHIVE

Items from `OUTSTANDING.md` that are FINISHED and carry no instruction to a future session.
**Search this file; never read it whole, and never append to it by hand** — the same shape as
`HANDOFF-ARCHIVE.md`. An item arrives here only when it is done AND says nothing a later session has
to obey; a finished item that still warns somebody off re-doing something STAYS in the live backlog,
which is why several merged items are not here.

Established 22 Sep 26 by the owner's D29, after a trim made to satisfy the size gate destroyed two
filed items — one of them a ruling's only home. The live backlog is read at the start of every
session, so every line there costs every session; this file costs nothing until it is searched.

---

### [INP-CSID] Stable ids for personal inputs — DONE (13 Sep 2026, ARCH-STACK 1A item 1)
Delivered by ARCH-STACK step 1A: personal inputs are filed/accepted/undone/edited by their
stable opaque `iid` (`newId('i')`), not the content key `inpKey`. Twins file independently and
the accept guard is a same-input idempotency check; `inpKey` stays only as a display/dedup hint.
Merged live in PR #396. Finding J (`DU-007`) closed.

### [OIL-XWEEK-DENY] A refusal survived a hand-back in a week nobody had loaded — CLOSED, 22 Sep 26

**Money, silent, and both reviewers found it (Fable F1, Codex rank 2).** The clear that kills a
scheduler's refusal when a request changes hands walked only the LOADED week, and the read-side
prune merely HIDES a key while somebody else holds the request — so a hand-over and hand-back made
while a different week was on screen brought a dead refusal back to life. On an already-published
day nothing flagged it. It vindicated Codex's M1 over the cheaper repair that was chosen.

**CLOSED.** The clear reaches every readable stashed week (`stashEditDays`), skipping the loaded
week and every byte-frozen one — the hazard this note asked to be respected. The prune stays as the
guard for exactly those two cases. The week stash joins the input batch on a person change, so ONE
Undo restores the assignment and the off-week refusal together, proved by a test that fails if the
enlistment is removed. Commit `26f9de5`; background in the two reviews' §F1 / rank 2.

### [OIL-XWEEK-ELSEWHERE] A cancelled anchor in an unloaded week kept paying — CLOSED, 22 Sep 26

**Money, and pre-existing rather than introduced by job 2** (Fable F2, Codex rank 3; both wanted it
closed before merge live). A request running into the next week, whose ONE row was CANCELLED in the
first, went on paying its later days. The build's note named the wrong mechanism — such a request
does not read "elsewhere", it reads as never-landed, and the money paid it at a short-circuit before
the row's state was read — so the repair it sketched would never have fired.

**CLOSED.** The standing resolves the anchor's own week and reads its stashed days: no stash entry
means the week was never edited, so nothing contradicts the man and he is paid; an entry that cannot
be read does NOT pay (Codex's conservative answer, taken over Fable's degrade-to-seed); a row found
gives its own state. The short-circuit is gone, and the key now records only what the standing
decides — earns or does not — so a row merely moving into an unloaded week no longer offers an
amendment with no money behind it. Commit `7045067`.

### [AMEND-SEL-FOLLOWUPS] Plans-selector 7 follow-ups (incl. the signature-leak bug) — DONE + LIVE 15 Sep 26
The owner's 15 Sep batch of seven changes, built test-first and merged as **PR #405** (`9ba253c`).
The one worth remembering: **signatures are PER-PLAN** (his option a) — each saved plan carries
its own four sign-offs, so signing one never fills another, and a plan whose content moved out
from under a signature reads empty. The other six were selector wording and layout.
**Full resolutions are in PR #405 and the commit messages**, which is where a finished batch's
detail belongs (`doc-budget.md` §3). Nothing outstanding.

### [LW-OPEN] Leave War opens on the war being WORKED — DONE 17 Sep 26
Owner ruling (17 Sep 26, restating his 7 Sep rule under newest-instruction-wins):
the tab always opens on the war open for bidding, else closed, else published,
else draft — never on the one last viewed. Was a REGRESSION, not a missing
feature: the 8 Sep storage seam made the tab persist, so the stored `current`
started winning from the second visit; before that nothing was stored and the
stage pick ran every load, so the rule held by accident.
**Resolved:** `state/store.ts initStore` now always stage-picks and ignores the
stored `current` (still recorded at every switch, for the shared database and
so a switch holds for the rest of the session). Pinned by three tests in
`state/store.test.ts`, one of which REPLACES an older test that asserted the
opposite ("remembers which war was on screen across a reload") — reversed by
owner ruling, noted in place. Gates: vitest 4865/4865, parity 728/0, build,
e2e (only the 2 known pre-existing failures, proved pre-existing by re-running
them against a stashed tree), tracker smoke. LIVE-DRIVEN on the built bundle:
opened on JAN-DEC 26 -> switched to the 27 draft -> switch held -> reload came
back on JAN-DEC 26 with the bidding border showing, no console errors.


### [TRK-IMPORT] Tracker import-conflict refusal — DONE (12 Sep 2026)
Import now refuses when a file names a *different person* under a callsign already
on the course, before writing anything — so the existing student is no longer
silently dropped and their marks orphaned. Rebased on current `main`, full gates
green, independent Astra/Codex bug-check run **on the fix**: it found the refusal
scan read only the per-syllabus rosters and missed a course still on the ORIGINAL
pre-syllabus flat roster (v3:<c>:roster), which a conflicting import could still
overwrite. Closed that (the scan reads the flat roster + its links too) and made
the refusal message honest that charts imported first may already be in. Astra
re-check: sound. Merged as **PR #386**, deployed, confirmed live (Tracker renders,
no console errors).

### [TRK-LEDGER] Tracker legacy-import ledger (Decision B) — DONE (12 Sep 2026)
A half-finished first-time legacy import used to seal itself done on the first
`raptor:` key and hide the rest forever; it now resumes via a per-key ledger and
grandfathers existing installs. Rebased on `main`, gates green, Astra bug-check on
the fix found a residual: if the store was so full that even the ledger write
failed, the next boot grandfathered and lost the rest. Closed with a
`__legacy__/started` marker written before the first copy, and gated persistence on
that marker being durable (a persisted record always has its marker). One inherent
corner documented (a record deleted seconds after migration on an already-full
store can be re-copied — resume without a durable ledger can't tell "not copied"
from "copied then deleted"). Astra re-check: sound. Merged as **PR #387**, deployed,
confirmed live.

### [SEC-ALTIP] AL panel tooltip HTML injection (AM-08) — DONE (11 Sep 2026)
The amendment sign-off tooltip could run injected code from a crafted callsign;
it's now escaped at display time, so already-saved names are covered too. Verified
end to end: merged as **PR #393** to `main` (CI green), deployed, and confirmed on
the live site (Amendments panel renders normally, no errors). Found by the
Astra/Codex amendment review; fixed in its own spawned session.
