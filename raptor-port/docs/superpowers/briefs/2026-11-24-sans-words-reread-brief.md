# Re-read brief — the fixes to the new SANS words' reads (round 2) — 24 Nov 26, chat 156

**For:** each reader of the fix round, alone and blind to the others: Astra (the standing reviewer), a fresh, blind Opus
reader, a fresh, blind Fable reader (D2440: high risk — saved data, the permission gate and the command layer), and the
security reader (D1411; `state/perms.ts` and the command layer changed), who reads §3 item 3 first. You did not write this
code. **Do not read `HANDOFF.md`'s chat blocks, any evidence sheet or walk table, or any brief of this round other than
this one.**

**The copy:** an export of branch `claude/allavail-sans-postout-141` at commit `f73602f9f`, a git folder whose packages are
linked in. At its root: `FIX.diff` (this round: `git diff 0eaacc411 f73602f9f -- raptor-port/src`), `ROUND.diff` (the whole
job: `git diff 9b897f5d3 f73602f9f -- raptor-port/src`), `FINDINGS.md` (what round 1 found and what each fix claims), and
`READS/` (round 1's four reports, for each finding's concrete case). Read the whole files the fix touches as well as the
diff: a fault is often in a line the diff did not touch. Run tests from `raptor-port/` with `npx vitest run <file>`; if the
copy refuses the app's own config, write your own small vitest config beside your test, as round 1's readers did.

## 1. What the job must do
The rules, the approved words and the builder's readings are in `raptor-port/docs/superpowers/briefs/2026-11-24-sans-words-read-brief.md`
§1 (in the copy) — read it. The full rows: `grep -h '^| D2388 \|^| D2390 \|^| D2391 \|^| D2394 \|^| D2420 \|^| D2421 \|^| D2340 \|^| D2341 ' .claude/decisions-full/*.md`.

## 2. Not findings (D56, D785)
A problem living only in data already stored (demo data, cleared before the database step) is not a finding unless new
data would be hurt too. A scheduler is always an admin. The wording itself is the owner's. Older behaviour the change does
not touch or worsen is not a finding; say if you see one, marked "older". Item 11 of `FINDINGS.md` is the owner's question,
not a finding.

## 3. What to look for, in this order
1. **Does each fix close its finding?** For every item of `FINDINGS.md`, take round 1's concrete case (in `READS/`) and
   say CLOSED, NOT CLOSED (with the case that still fails, as a failing test) or CLOSED ONLY IN PART. A test the builder
   wrote is not proof by itself: check it tests the case, not a near one.
2. **What the fixes broke or left open:** the planning mark that only grows (a stamp newer than this device's last, the
   day's mark and any he read) — two devices, a reload, an Undo then a fresh planning, a Redo, a clock behind another
   device's; the `ended` mark — a man both ticked and posted, a tick or a posting taken away while the other stands;
   the read record kept and folded — tap, "Mark all read", sign-out, another person; Saber's Undo of a tick writing its
   line inside the Undo; only the latest Redo copy standing; the hidden sentence said on the later line only (W12-1),
   worked out when the bell is drawn — and after a reload.
3. **The permission gate and the command layer (the security reader starts here):** `sansPlanViolation`; the replay probe
   `setSansPlanReplay` (in `leavewar/sansunfiled.ts`, reading `applyingRestore` from `undo/timeline.ts`) — can any person,
   through any command or a command built by hand, pass as an Undo/Redo the war vouches for, and so write or erase the
   planning mark or a SANS line on another man's bell?; `sansBackEraseViolation` without its posting exception; the
   start-of-command hooks in `command/commit.ts` now able to run for restores and handed the envelope — can a hook now
   run where it must not, or see what it must not, and is the change-history hook truly unchanged?
4. **Saved data:** every write of the planning mark through the app's command layer and saved; past days pruned and a
   deleted man's rows gone, with nothing else removed; growth bounded.
5. **Speed:** the skipping of past weeks by key and the parse kept until the saved copy changes — can a stale parse be
   used after a change, Undo or reload; is the start-of-command snapshot still taken wherever it is needed.

## 4. What to give back — write it to the file your brief names, then reply with its path only
Each finding: **where** (file, function), **the concrete case** (named people from the demo, the days, what is pressed),
**what goes wrong** for the person, **the cause**, **the fix** — written as exact steps the builder can follow. A finding
without a concrete failure is a question, labelled so. Where you can, a failing test (vitest, the app's own way), its file
named. Then the per-item verdicts of §3.1 as a table. Then a tidiness note (D489): is anything duplicated, harder to follow
than it needs to be, or left doing nothing — filed, never fixed. Last line: how many findings, and which to fix first.
