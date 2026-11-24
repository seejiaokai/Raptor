# Re-read brief — round 3: the fixes to round 2's reads of the new SANS words — 24 Nov 26, chats 156–157

**For:** each reader of this round, alone and blind to the others: Astra (the standing reviewer), a fresh, blind Opus
reader, and the security reader (D1411 — `state/perms.ts` changed again: `setSansUndoTold`, `setSansPlanOwed`), who
reads §3 item 3 first. You did not write this code. **Do not read `HANDOFF.md`'s chat blocks, any evidence sheet or walk
table, or any brief of this round other than this one.**

**The copy:** `D:/raptor-work/c156-read3`, an export of branch `claude/allavail-sans-postout-141` at its head (round 2's
fixes `2391f9dfa`, then two small fixes of 24 Nov: both whole-list SANS readers in `leavewar/sansunfiled.ts` through one
`sansAvailRecords()`, and a walk script's copy line), a git folder whose packages are linked in. At its root: `FIX.diff`
(this round: `git diff f73602f9f <head> -- raptor-port/src`), `ROUND.diff` (the whole job: `git diff 9b897f5d3 <head> --
raptor-port/src`), `FIXES-CLAIMED.md` (what the builder says each fix does, finding by finding), and `READS/` (round 2's
four reports, `round2-*.md`, for each finding's concrete case; `round1-FINDINGS.md` for round 1). Read the whole files the
fix touches as well as the diff: a fault is often in a line the diff did not touch. Run tests from `raptor-port/` with
`npx vitest run <file>`; if the copy refuses the app's own config, write your own small vitest config beside your test.

## 1. What the job must do
The rules, the approved words and the builder's readings are in `raptor-port/docs/superpowers/briefs/2026-11-24-sans-words-read-brief.md`
§1 (in the copy) — read it. The full rows: `grep -h '^| D2388 \|^| D2390 \|^| D2391 \|^| D2394 \|^| D2420 \|^| D2421 \|^| D2423 \|^| D2340 \|^| D2341 ' .claude/decisions-full/*.md`
(D2423: an Undo's words say "undone", never "taken back" — the owner's, 24 Nov 26; the built SANS line's wording is
still his open question, not a finding).

## 2. Not findings (D56, D785)
A problem living only in data already stored (demo data, cleared before the database step) is not a finding unless new
data would be hurt too. A scheduler is always an admin. The wording itself is the owner's. Older behaviour the change does
not touch or worsen is not a finding; say if you see one, marked "older". These are already filed for the database step
and are not findings this round: a store write during a command's delivery or a start-of-command hook saved unjudged; an
admin can rewrite another man's read record in any command; the posting's take-back trusting this device's read state;
the pruning of a past-day planning mark inside another admin's step blocking his later Undo; the read record only
growing; a remote or seed origin refused by the planning gate.

## 3. What to look for, in this order
1. **Does each fix close its finding?** For every round-2 finding named in `FIXES-CLAIMED.md`, take its concrete case
   (in `READS/round2-*.md`) and say CLOSED, NOT CLOSED (with the case that still fails, as a failing test) or CLOSED ONLY
   IN PART. A test the builder wrote is not proof by itself: check it tests the case, not a near one.
2. **What the fixes broke or left open:** a Redo taking back the line its step's Undo wrote — read or unread, Undo / Redo
   / Undo / Redo, another admin's step between, a reload between, a sign-out between; a "taken back" line hiding the line
   it names and ending nothing; the held weeks ahead kept by everything their reading uses — can a stale reading survive
   a change to any input it reads (a request, a deleted man, the week on screen, the squadron in view, the saved copy);
   the planning mark owed by its cause (the command that caused the projection), a person's own command or the posting's
   run deleting a man — can a mark be owed by a command that did not cause it, or a caused one go unowed; "later" for
   the hidden sentence by the bell's saved order, a line and its Redo copies one chain; a man deleted by his posting's run
   taking his planning rows and nothing else.
3. **The permission gate and the command layer (the security reader starts here):** `SANS_UNDO_TOLD` /
   `setSansUndoTold` and `setSansPlanOwed` in `state/perms.ts`; `causedBy` in the command stream — can any person,
   through any command or one built by hand, pass as the restore being applied, as a Redo, as the same person, or as a
   projection a command caused, and so write, retract or erase a SANS line or the planning mark on another man's bell?
   Is every new exception the narrowest that lets the right thing through?
4. **Saved data:** every write through the app's command layer and saved; nothing removed but what the fix names;
   growth bounded.
5. **Speed:** the held-weeks key — does building it cost more than the reading it saves, on a week of 40 held weeks?

## 4. What to give back — write it to the file your brief names, then reply with its path only
Each finding: **where** (file, function), **the concrete case** (named people from the demo, the days, what is pressed),
**what goes wrong** for the person, **the cause**, **the fix** — written as exact steps the builder can follow. A finding
without a concrete failure is a question, labelled so. Where you can, a failing test (vitest, the app's own way), its file
named. Then the per-item verdicts of §3.1 as a table. Then a tidiness note (D489): is anything duplicated, harder to follow
than it needs to be, or left doing nothing — filed, never fixed. Last line: how many findings, and which to fix first.
