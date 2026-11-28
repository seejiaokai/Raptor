# Build 1 plan, read round 3 — the security reader (fresh Opus, blind; chat 176, 25 Nov 26)

Read from the exported copy `C:\rc176` of `b09f67b12`. Saved whole by the host from its report file.

# Security read, round 3 — Build 1 / Build 1V plan (exported copy C:\rc176, b09f67b12)

Read: the brief; plan §5, §19; the rulings named; units.ts, accounts.ts saveAccess/adminNow, perms.ts
(unitRowViolation, restoreLeavesOut, adminOwnerViolation), undo-wire.ts, useraccess-model.ts, belltap.ts,
reports.ts, HelpPage.tsx. No handoff block met.

## S1 — HIGH — a moved admin, a member of his new squadron, could give and end Plan of it
- Presses: Viper, 142's admin, is moved to 149 (K3: he joins as a member; his account still stores role "admin",
  adminOf 142). From the move day he opens Hunter's row on 149's page and gives Hunter Plan of 149 (or forges the
  command).
- Cause: §19.2 defines `mayGivePlanOf` as "an admin whose own squadron `unit` is that day (homeOn), in the admin
  role". Built from the stored role (the gate's own neighbouring check, "Plan on an account that is not an admin's",
  already reads raw `who.role`), Viper passes: home 149 + role "admin". He is a member of 149 in force (accounts.ts
  adminNow is false for him). Same in the restore's rule and lineState.
- Fix to the plan: define it as "his home that day is `unit` AND his level there from his home role alone is admin"
  — units-model levelFrom over the account with every grant stripped, which honours adminOf/adminFrom (adminNow's
  body) — the role in force admin, over the rows before the command at the gate. Add V5b: Viper moved 142→149 tries
  to give and to end Plan of 149 — refused at the row (greyed), setGrant, removeGrant, saveAccess, the gate, and his
  Redo. Also: the gate's recipient check (raw `who.role`) should read the same in-force test, because after V2 every
  squadron's own admins can write Plan rows, not only masters (a forged give to a moved "admin" who is a member makes
  him admin of 149).

## S2 — MEDIUM — the Plan bell lines and the callsign line need a gate rule the plan does not write
- Presses: (a) Kestrel gives Hunter Plan of 149: the line to Saber (master, home 142) and to a 150 admin holding Plan
  of 149 is not "his own squadron's man" for Kestrel; perms.ts adminOwnerViolation admits a squadron's admin line to a
  non-home reader only for war kinds (`oilhol`, `po`, `poback`, lineSquadron). (b) "Plan of 149 ended: he moved to 150"
  — a move writes no grant (the reading rule ends it at midnight), so there is no "command that changes the right";
  written in the move (home.set, whose op table holds no notice), its writer is 142's admin, no admin of 149.
  (c) "Plan of 149 ended: made a member" — written by 142's admin into 149's admins' bells. (d) §19.4 "Someone new":
  Kestrel writes a line onto 142's admins' bells.
- Cause: §19.2 and §19.4 say "written in the command" and list words and register rows only. As the gate stands each
  is refused (the Save fails), so the builder must loosen the gate — and a loose kind (any admin may write squadron
  X's admin line) lets Hunter or any admin put any wording on another squadron's admins' bells.
- Fix to the plan: name the gate rule in V2 and V4: each new kind carries its squadron and its subject, and is
  admitted only where the same command changes that very right (a grant row of that account and unit, given or
  ended; for the member case the account made a member and its Plan row dropped) or, for the callsign line, adds a
  person with that callsign while the named squadron holds an archived man of it; signed by the actor (`by`); never
  unsigned except a pass the app mints. For the move: say which command writes it (the move, saved the day before,
  dated to its day) or that it is the app's own pass at midnight — or put the case to him. Add a forged-line case to
  V6 and V18.

## S3 — MEDIUM (a question for him, not a plan fault) — a Plan holder can still pass Plan on, in two steps
- Presses: Hunter (142's admin, Plan of 149) moves Viper, a 142 man, to 149 (allowed: he is admin of the squadron
  left); from the move day Hunter, as admin of 149, makes Viper an admin of 149 (D2201, D2336 — unchanged, pinned in
  §19.2). Viper is now 149's own admin and gives Plan of 149 to any 142 admin. No 149 person is asked.
- Cause: each step is ruled; together they defeat D2626's "a Plan holder never passing it on".
- Fix: put it to him with the case drawn (three squadrons); options: a Plan holder may not make a man an admin of the
  squadron he holds Plan of, or 149's admins are told on the bell when one is made. Until he answers, V5 pins today's
  behaviour by name so it is not read as covered.

## S4 — LOW — Undo of a Plan removal skips the Plan check entirely
- Presses: Kestrel (149's own admin) gives Viper Plan of 149. At midnight Kestrel's move to 150 lands (made admin of
  150 there); still signed in, he is given Plan of 149 by 149's other admin; he presses Undo on his old give — Viper's
  Plan of 149 is removed by a Plan holder. Same today for a master whose mark was taken off mid-session.
- Cause: unitRowViolation exempts a verified replay from the Plan who-check on both sides; restoreLeavesOut judges
  only put-backs (`op put`). A removal by replay is asked only "admin of 149", which a Plan holder is.
- Fix: in V2, keep the replay exemption for the moment check only; ask `mayGivePlanOf` of a replayed removal of a
  holding Plan row too, refusing in today's Undo words (D148: refused where the change itself would be). Add to V7.
  Also make the new per-squadron restore input fail closed: today `ctx.master === undefined` lets a Plan row back.

## S5 — LOW — bug reports as saved records: three gate gaps
- (a) `u` is "the squadron in view when sent", but nothing in §19.6 checks it: Osprey (149 member) forges a report
  stamped 142 and rings 142's admins with any text. Gate: `u` must be his home or a squadron he holds View/Plan of
  that day (any for a master).
- (b) Help shows the filer's live callsign from `pid`, else the stored `who`: a report with `pid` null and
  `who: "Saber"` reads as Saber's. Gate: `pid` = the actor's person, never null; `who` ignored or must match.
- (c) The table's read rule is not in the records list: a member reads only his own (Help's "Your reports"); add the
  row to perms.ts's table and data-model §11 in V8, or the database step will let a member read every squadron's
  report text.
- Content: a report carries only id, time, filer, category, text, squadron, the seen list. Every admin of every
  squadron reading every report's free text is D2628 C5, ruled — named so he knows 149's admins read 142 members'
  words.

## S6 — LOW — the folded headings must hold live people only
- §19.3 says "its people A to Z" without saying whether another squadron's archived, deleted or waiting men are in a
  folded group. Listed, an archived 142 man would offer Restore from 149's page (live for Hunter: he is 142's admin).
- Fix: say it outright — a folded group lists live people only, no archived, no deleted, no Waiting; no Restore; and
  V12 asserts it.

## S7 — LOW — until V1 lands, another squadron's sign-in names show to every admin of the page
- Today PersonSub prints a found 142 man's sign-in name on 149's page for Kestrel, and Hunter sees and can change
  Ranger's sign-in and role there (the change is within Hunter's rights; the display is not D2625's). Build 1 does
  not make it worse, but V1 waits on every drawing of §19 (V0).
- Fix: let V1's hiding (no sign-in name, no Role box, no buttons) land without waiting for the drawings of §19.3–19.8.

## Checked, nothing found
- After V2 a Plan holder cannot give, raise, lower or end Plan by the row (lineState greys it), setGrant, removeGrant,
  saveAccess (checked per line), a forged command, or his own Redo — provided S1's definition. His own Plan: saveAccess
  refuses his own account, removeGrant asks the Plan rule. A stale row: every door re-reads the signed-in account at
  Save.
- On another squadron's page, after V1, nothing but that squadron's line is offered; the doors stay with the man's own
  squadron's admins, so Kestrel can change nothing of a 142 man but his 149 line (gate section 8 and
  otherSquadronProblem), and V1 also stops 149's page showing a 142 man's rights in 150.
- A View holder or a member never reaches Admin (adminOfUnit reads the role in force); the folded headings follow it.
- Undo of an access change after the maker lost his rights is refused (the gate's admin-of check is not exempt for
  replays). Undo/Redo across a pick write under the other bar but within his rights — Build 3's, not a hole.
- Bell taps: enterForLine refuses a squadron his pages may not be (ownPageMayBe); no line enters a squadron he has no
  right in. Part F: after §5.1 no row on another squadron's Inputs page is his own input of a squadron he can open;
  letOpenOn lets only the moved man's own old input open live, and the gate still limits him to his own part.
