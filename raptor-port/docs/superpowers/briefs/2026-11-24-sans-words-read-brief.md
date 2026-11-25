# Code-read brief — the new SANS words and rules (D2388, D2390, D2391, D2394, D2420, D2421) — 24 Nov 26, chat 156

**For:** each reader of the finished code: Astra (the standing reviewer), a fresh, blind Opus reader, a fresh, blind Fable
reader (D2440: ranked high risk, saved data and the permission gate), and the security reader (D1411), who reads §4 first.
Each reads alone and is blind to the others and to the walk. **Do not read `HANDOFF.md`'s chat blocks, any evidence sheet
under `raptor-port/docs/handpass/`, any walk table, or any brief of this round other than this one.** You did not write this.

**The copy:** an export of branch `claude/allavail-sans-postout-141` at commit `0eaacc411`. The round's change to the app:
`ROUND.diff` at the copy's root (`git diff 9b897f5d3 0eaacc411 -- raptor-port/src`). Read the whole files it touches as
well as the diff; a fault is often in a line the diff did not touch.

## 1. What the change must do (the owner's rulings; read the full rows)
`grep -h '^| D2388 \|^| D2390 \|^| D2391 \|^| D2394 \|^| D2420 \|^| D2421 \|^| D2340 \|^| D2341 \|^| D1693 \|^| D1699 \|^| D1710 \|^| D350 \|^| D2194 ' .claude/decisions-full/*.md`.
Pages: `.claude/rules/decisions/inputs.md` §The SANS calendar, `.claude/rules/decisions/scheduler.md` §Crew and pucks, and
`.claude/rules/raptor-executor.md`. The approved words: `raptor-port/docs/mock/2026-11-24-sans-words/index.html`.
- A run of SANS availability days that starts before his SANS date saves the days from his date on, with a note; a run
  with no SANS day, or a non-SANS day inside it, is refused as before; the final save's check is unchanged.
- His reminder: "You're SANS from Fri 17 Jul." / "You're planned on Sat 18, Mon 20, Thu 23 Jul with nothing filed. Tap to
  file for availability."; every SANS man planned with nothing filed gets it, "Your SANS availability is needed." where
  he has no SANS date ahead (a man SANS now by his Quals tick counts as such); once read, it lights again for a NEWLY
  PLANNED date only.
- The change lines A–E when his posting or tick changes, only where something filed was hidden or the reminder had been
  read; the read reminder simply goes, never struck; the "hidden" sentence goes once untrue.
- The greyed "+ Commitment" words; a shared offer's refusal; no new crew-list line.
- **The builder's readings where the rulings are silent (to be put to the owner; a fault is code that breaks its own
  reading, or a reading that breaks a ruling's words):** a newly planned date is counted by a stored setting per man and
  day (`sansplan`), written by the app after the change that plans him; one current change line per man, latest title,
  only days hidden now; a new shared offer is refused, never trimmed; a man whose date has arrived takes the no-date
  title, without lighting the bell; a Redo of a take-back tells the line again, unread.

## 2. Not findings (D56, D785)
A problem living only in data already stored (the store is demo data, cleared before the database step) is not a finding
unless new data would be hurt too. A scheduler is always an admin. The wording itself is the owner's. Older behaviour this
change does not touch is not a finding unless the change makes it worse; say if you see one, marked "older".

## 3. What to look for, in this order
1. **What is missing:** a state, order or door the rules cover that the code does not handle — sequences of posting,
   tick, read, Undo, Redo, reload, sign-out, another week loaded, another person's bell; a man both ticked and posted; one
   filed day and several; days across a month end.
2. **Saved data:** the new `sansplan` setting and the changed change line — every write goes through the app's command
   layer and is saved, survives a reload, takes part in Undo as the rules say; nothing written by reading the screen; no
   unbounded growth; what happens to the setting when a man is archived, deleted, transferred or his posting is undone.
3. **The permission gate** (`state/perms.ts` and the SANS checks it calls: `sansBackCovered`, `followUpsOwed`): can any
   person, through any command, store a line on another man's bell that the rules do not owe, or remove one that is owed?
4. **Security (the security reader starts here):** who may write what, and what one person can see of another — a member
   writing or reading another man's SANS lines or settings, the system-actor command, a command built by hand.
5. Speed: a reader that runs on every change of the schedule (the counting of newly planned days) — its cost on a full
   week, and whether it can run in a loop.

## 4. What to give back — your final reply, nothing written in the copy
Each finding: **where** (file, function), **the concrete case** (named people from the demo, the days, what is pressed),
**what goes wrong** for the person, **the cause**, **the fix**. A finding without a concrete failure is a question, so
label it so. Where you can, write the failing test (vitest, the way the app's own tests do it) in your reply. Then a
tidiness note (D489): three questions of the changed lines — is anything duplicated, is anything harder to follow than it
needs to be, is anything left that no longer does anything — filed, never fixed. Last line: how many findings, and which
you would fix first.
