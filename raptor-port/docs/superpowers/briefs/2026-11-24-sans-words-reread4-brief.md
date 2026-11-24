# Re-read brief — round 4: the fixes to round 3's reads of the new SANS words — 24 Nov 26, chat 169

**For:** each reader of this round, alone and blind to the others: Astra (the standing reviewer), a fresh, blind Opus
reader, and the security reader (D1411 — `state/perms.ts` changed again: the planning-mark gate removed), who reads §3
item 3 first. You did not write this code. **Do not read `HANDOFF.md`'s chat blocks, any evidence sheet or walk table,
or any brief of this round other than this one.**

**The copy:** `D:/raptor-work/c169-read4`, an export of branch `claude/allavail-sans-postout-141` at `0e59ea5f3` (round 3's
fixes), a git folder whose packages are linked in (the walk pictures left out). At its root: `FIX.diff` (this round:
`git diff 9320eebc9 0e59ea5f3 -- raptor-port/src`), `ROUND.diff` (the whole job: `git diff 9b897f5d3 0e59ea5f3 --
raptor-port/src`), `FIXES-CLAIMED.md` (what the builder says each fix does — claims to check), and `READS/` (round 3's
three reports, `round3-*.md`, for each finding's concrete case). Read the whole files the fix touches as well as the
diff: a fault is often in a line the diff did not touch. Run tests from `raptor-port/` with `npx vitest run <file>`; if
the copy refuses the app's own config, write your own small vitest config beside your test.

## 1. What the job must do
The rules, the approved words and the builder's readings are in `raptor-port/docs/superpowers/briefs/2026-11-24-sans-words-read-brief.md`
§1 (in the copy) — read it. The full rows: `grep -h '^| D2388 \|^| D2390 \|^| D2391 \|^| D2394 \|^| D2420 \|^| D2421 \|^| D2423 \|^| D2437 \|^| D2560 \|^| D2561 \|^| D2340 \|^| D2341 ' .claude/decisions-full/*.md`.
**New this round — the owner's D2560 (24 Nov 26):** after a man has read his SANS reminder, it lights his bell again
only for a day not in it when he last read it; a day he already saw, taken off and put back, does not relight it (the
line still lists it until he files); the hidden "planned at" mark on each day goes, with its permission checks. While
unread there is one line either way, its days following the plan. It narrows D2394 2a. D2423: an Undo's words say
"undone", never "taken back"; the built SANS line's wording is the owner's, not a finding.

## 2. Not findings (D56, D785)
A problem living only in data already stored (demo data, cleared before the database step) is not a finding unless new
data would be hurt too. A scheduler is always an admin. The wording itself is the owner's. Older behaviour the change does
not touch or worsen is not a finding; say if you see one, marked "older". Already filed, not findings this round: a store
write during a command's delivery or a start-of-command hook saved unjudged; an admin can rewrite another man's read
record in any command; the posting's take-back trusting this device's read state; the read record only growing; on a
phone a passing note covering the SANS day window's date and ✕.

## 3. What to look for, in this order
1. **Does each fix close its finding?** For every round-3 finding (Astra F1, F2; SEC-R3-1, SEC-R3-2; Opus O3-1, O3-2), take
   its concrete case in `READS/round3-*.md` and say CLOSED, NOT CLOSED (with the case that still fails, as a failing test)
   or CLOSED ONLY IN PART. A test the builder wrote is not proof by itself: check it tests the case, not a near one.
2. **D2560 built as ruled, and what its removal broke or left open:** does the reminder light exactly for a day not
   among the days he read, and never otherwise — a day taken off and put back (by Undo, by hand, by a filing deleted, by
   his date moving), "Mark all read", two devices or a reload between, a record in the older shape, a reminder that ended
   and began again (a new base), Undo / Redo of the planning, of his tick and of his posting? Judge the builder's four
   changed answers in `FIXES-CLAIMED.md` (a)–(d) against D2560's words: one that does not follow them is a finding; one
   that follows them but would surprise the man (his bell lighting and going dark as weeks come on and off screen) is a
   question, labelled so, with the case. Can the line, unread, ever name a day it should not, or miss one it should?
3. **The permission gate and the command layer (the security reader starts here):** with the planning-mark gate gone,
   did a row it guarded become writable by anyone (`sansplan:` is now an unlisted settings name — what may a member, an
   admin of another squadron, a hand-built command or a projection write there, and does anything read it)? The read
   record (`noticeseen:<pid>`): only its owner's `notices.seen` writes it — can any person, any command, a projection, a
   restore or a Redo write or empty another man's? `reminderDays` trusts nothing in the id — can a crafted id in his own
   record change what another man is told, or throw? `sansRetracted` and `SANS_UNDO_TOLD`: can a person retract or
   revive another man's SANS line? Is every exception the narrowest that lets the right thing through?
4. **Saved data:** every write through the app's command layer and saved; nothing removed but what the fix names; the
   read record's growth no worse than filed.
5. **Speed:** `landingSig` and the home signature — is building the key cheaper than the reading it saves (40 held
   weeks)? Does anything now re-read on every render? Is the next-week peek (`ui/peek.ts`) left with the stale-home gap
   Astra F2 found?

## 4. What to give back — write it to the file your brief names, then reply with its path only
Each finding: **where** (file, function), **the concrete case** (named people from the demo, the days, what is pressed),
**what goes wrong** for the person, **the cause**, **the fix** — written as exact steps the builder can follow. A finding
without a concrete failure is a question, labelled so. Where you can, a failing test (vitest, the app's own way), its file
named — under `raptor-port/src/r4-<you>/` only. Then the per-item verdicts of §3.1 as a table. Then a tidiness note (D489):
is anything duplicated, harder to follow than it needs to be, or left doing nothing — filed, never fixed. Last line: how
many findings, and which to fix first.
