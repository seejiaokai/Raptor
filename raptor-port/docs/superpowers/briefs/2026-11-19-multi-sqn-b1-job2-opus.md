# Job 2 — the fresh, blind Opus code read (Agent tool, model opus, 19 Nov 26; proof tests in its scratch folder, run one file at a time with `npx vitest run`)

Read of an exported copy of `claude/multi-sqn-b1-107` at `2b792ebc5` (job 1 = `b63195c56..2b792ebc5`), brief `…-job2-read-brief.md` (the readers' shared brief, saved beside this file). Blind to the walk of the running app and to every other reader's report. Saved here by the check lead after all four had reported (19 Nov 26); the report below is unchanged.

---

# Job 2 — the fresh, blind Opus read of job 1's finished code (multi-squadron batch 1, fixread2 faults)

Reader: fresh Opus, blind to Astra, the other readers and the walk (their files were not opened). Read from the exported
copy at 2b792ebc5. No handoff block was pasted into my context. Proof tests sit in the copy's
`raptor-port/src/__proof_opus__/` (to resolve imports) and are copied, with their run output, to
`scratchpad/job2/proof-opus/`. Each was run alone with `npx vitest run <file>`.

Two findings, both proved red. Ranked by consequence.

---

## F1 — 149's admin cannot open or close bidding once a man posted out of 149 has been moved to 142 (HIGH; introduced by job 1, 7e)

**Proof (red):** `proof-opus/war-bell-moved-man.test.ts` — control (no move) opens; with the move it does not. A probe put
first among the commit gate's checks names the refusal:
`lw.open: a bell line of another squadron's man (notices/…)`. Nothing is said on screen (no toast, no error): the
"Open for bidding" tap simply does nothing.

**Setup through the app's controls:**
1. Kestrel (149's admin) signs in; on the Leave War he posts Osprey out from 1 Sep 26 with no outcome (or SANS, or any
   posting still to come). Osprey keeps his sign-in.
2. Saber (the master) signs in and moves Osprey to 142 on Admin → Users (from tomorrow) — the transfer.
3. Two days on, Kestrel signs in and opens a day for bidding.

**Expected:** bidding opens; the "bidding opened" bell line goes to 149's people, not to Osprey, who is now 142's (D2194:
no bell across squadrons).
**Shown/stored wrong:** the whole `lw.open` command is refused, silently. Same for closing, changing a stretch, and every
later bidding change — for as long as Osprey's posting window keeps him a row of 149's war (after the posting runs with
"no outcome" or SANS, that is for good). The same root refuses a 149 admin's approve / refuse of the moved man's own
bids (tellWar writes his line) and the Undo of such a step where its lines are taken away.

**Cause:**
- `leavewar/sync.ts` `warAudience()` (about line 1528) — "every person on the war with a sign-in": `getState().people`,
  which keeps a man whose posting window has a `to` after he leaves the projection (`leavewar/state/store.ts` `setPeople`,
  the keep rule `if (!ids.has(id) && po[id].to) next.push(po[id])`). A man moved to another squadron is such a row.
  `state/notices.ts` `noticeWar` skips only the archived, deleted and placeholders (`here`), so the line is written to him.
- `state/perms.ts` `adminOwnerViolation` (7e, new in job 1) refuses any admin's notice addressed to a man whose home today
  is a squadron the admin is not an admin of — whole command, no exemption for the war's own lines.

**Fix (step by step):**
1. In `leavewar/sync.ts` `warAudience()`, keep only men at home in the war's squadron today:
   `.filter(pid => homeUnitOf(pid) === worldUnit())` (the same reading `ownSchedulerIds` already uses for the posting
   lines). That is D2194 as ruled — a moved man is not told of his old squadron's bidding.
2. In `tellWar` (and `warNoticesReversed`, which writes "taken back" lines), skip a target not at home in the war's
   squadron, the same filter — or, if he should still hear of his own leave in his old war (D2194 "unless it concerns
   both" — his call), let 7e pass a war-line kind (`lw`, `lwback`) addressed to a man who is a row of the war loaded.
   Recommend the filter (one rule, fewer doors).
3. Test: the proof file above, plus the same for close, for an approve of the moved man's pending bid, and for the
   142 side (Hunter, 142's plain admin, after Saber moves a posted-out 142 man to 149).

**Related consequence, for him (product, not fixed here):** the moved man's posting stays in his old squadron's war.
Its posting pass now refuses to run it (`postingPassViolation`'s new "another squadron's man" check), held silently every
load, and the old squadron's plain admin cannot clear it (`postOutProblem` now says the other-squadron words) — only the
master can. Whether a move of squadron should close or carry the old war's posting is his to rule.

---

## F2 — the last-admin lock misses a move already stored: a squadron left with no admin from tomorrow (MEDIUM; already there before job 1 — job 1's G3 claims every date and leaves this one open)

**Proof (red):** `proof-opus/lock-future-move.test.ts` — both cases fail: the change is accepted (`null`) and 149 has
no admin who can sign in from tomorrow (`adminsTomorrow: []`).

**Setup through the app's controls:**
1. Saber (master) makes Osprey a second 149 admin (Admin → Users, role admin).
2. Saber moves Osprey to 142 (from tomorrow) — allowed: Kestrel stays.
3. The same day, Saber (or Osprey himself, still 149's admin today) demotes Kestrel to member, or suspends him.

**Expected:** refused in the lock's words — "Kestrel is 149's last admin…" — because from tomorrow 149 has no admin of
its own who can sign in (D2184 Q10).
**Shown/stored wrong:** accepted. From tomorrow 149 has no admin at all; nobody in 149 can run its Admin → Users,
Leave War or schedule as an admin until a master fixes it.
The same hole by other doors: Archive or Delete of Kestrel (people-only commands), and the reverse order's variant — Saber
moves Kestrel tomorrow while Osprey has a stored move from a later day X (the dates checked are today, tomorrow and
Kestrel's own rows; X is not among them, so 149 has none from X).

**Cause:** `state/perms.ts` `lastAdminViolation` (G3): `dates` = today plus the `from` of home rows of men whose home rows
THIS command changes (`movedPids`). An account or person change alters the answer on every date where another admin's
stored home row changes squadron, and those dates are never asked. The screen's own checks read today only
(`accounts.ts` `lockProblem` via `updateAccount`; `homeMoveLockWords` reads only the move's own date).

**Fix (step by step):**
1. In `lastAdminViolation`, build `dates` from today plus every home row `from >= today` in `w.rowsB.homes` and
   `w.rowsA.homes` of any man who is an admin who can sign in on either side (`ableB`/`ableA` pids) — or simply every
   home row `from >= today` (few rows; cheap).
2. Screen words: in `updateAccount` / the archive and delete doors, ask `lockProblem` on those same dates (or let the
   gate's refusal be said in the lock's words), so the admin hears why; `homeMoveLockWords` the same over the later
   dates of other admins' stored moves.
3. Tests: the proof file's two cases, plus Archive of Kestrel, plus "Saber moves Kestrel while Osprey leaves from day X".

---

## Checked and found nothing (explicit negatives)

- **G0 / G1 (account rows read as the loader reads them, a master's account a master's):** `worldsOf` builds both sides
  through `readAccounts` with each side's people; `droppedKeys` compares only newly dropped rows, and a deleted man's
  dropped account is skipped on purpose. `normName` is trim + lower-case, the same as `droppedKeys` compares, so an
  ordinary add, rename or delete never reads as a dropped row. I found no normal 142 or 149 admin write that G0 refuses.
- **G3 today, and a move's own dates:** correct for the cases job 1 named (person-only delete, placeholder, a home move
  dated ahead, the master acting). Only F2's stored-move dates are missing.
- **G2 / homeUnitViolation and Opus F3 (a first home before today):** `putNewHome` writes from today; the new refusal
  only bites a forged earlier row. Nothing found.
- **D2203 (a move drops his rights):** the drop sits inside `home.set`'s own command; a grant's delete needs an admin of
  the grant's squadron, but a move already needs an admin of the destination (the new home row), so in practice only a
  master moves and the drop never half-refuses. Undo puts the rights back; the gate's "right in his own home unit" reads
  the home after the Undo (the old one), so the Undo passes. Nothing found.
- **7b (the war probe):** set only while the world door exists (`WORLD_DOOR ? worldUnit() : null`); a sign-in swaps the
  world (`setSessionWorldHook`), sign-out reloads; the world's own passes run as projections, which the gate does not
  judge. A member's bids in his own war, an admin's war work in his own war and the master's in 142 all pass. `lwx.*` ids
  do not start with `lw.`, so the foreign store is judged by section 7 (its `<unit>@` id) and the admin-only case, not by
  the loaded war. Nothing found beyond F1's posting-pass consequence.
- **A3 (the foreign store):** loaded before the command (or inside before it is enlisted, for the delete); a refused
  command writes nothing (the stored rows are written only in `onCommit`); Archive, Restore and Delete are never undone
  (D350, `NOT_UNDONE_TYPES`), so its missing `write` is never reached by Undo; a world never opened keeps the stored
  windows and labels (`initStore`'s `early`); the restore refusal reads the stored window. Home rows survive a delete, so
  `foreignHome` still finds his squadron after `applyDelete`. Nothing found.
- **Astra 4 (home before post-in):** the three adders now write the home first; the new refusal fires only where the
  projection still lacks him with wars present. On the demo store nothing found. (A note only: on a store with no unit
  rows at all — no fallback home — every add with a post-in date would now be refused whole, where before the date was
  lost in silence. The war would hold nobody there anyway; I did not treat it as a finding.)
- **Astra 5 (Undo's history line):** the line's squadron is kept by the command's sequence number, which the Undo step
  carries (`undo/timeline.ts` sets `seq: env.seq`); only user commands are kept, and Undo / Redo of them is what reads it.
  Nothing found.
- **H5 (history lines):** a line's squadron falls back to the unit in view when the giver may not file elsewhere, so an
  ordinary command never writes a line the write guard then refuses; the trim and the sweep touch only the unit in
  view's lines (the in-memory list holds only those). Nothing found.
- **7c (inputs by their people's squadrons):** mirrors `inputBelongs` (named people on the input's own date, else the
  placeholder's or the filer's `by`); ALL / ALL AVAIL are placeholders (`isPh`), so they are judged by the filer;
  D755's own taking-out is kept. A 142 or 149 member's own inputs and an admin's in his own squadron pass. Low-value
  edges only, not filed: a man moved from tomorrow cannot change his own input dated after the move until the move day
  (his level is read on today); an input running across a move date is judged by its start date.
- **7e for adds and approvals:** a new man's add writes no read record or bell line to him, so the fallback home of a
  man with no home row yet is never asked. Nothing found beyond F1.
- **7f (the Tracker):** bound once at the Tracker's first load to the signed-in person's squadron; none bound, nothing
  asked. Nothing found.
- **settleWorld() and the 32 test files:** it is called in setup only (after the reset, before the action), so each test
  still sees its own command's changes. I sampled the inputs, bell and command-seam files and found none now testing
  nothing; I did not read all 32.
- **The refusal sentences' order (D2205, Astra 6):** the master sentence is said first at every door I read (update,
  delete, archive, restore, restore as, callsign, Overseas Sqn posting).

Not read: the browser tests; every one of the 32 settled test files in full.
