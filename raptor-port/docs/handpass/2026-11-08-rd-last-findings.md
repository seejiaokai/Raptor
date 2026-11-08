# Bug check — React Doctor's last findings in People & accounts ([RD-LEFT-1108] parts 1 and 2), branch `claude/chat22-rd-last-findings`, pull request 702

Chat 26 (D1744), 8 Nov 26. Part 1 built by chat 22 (`25bae6081`), part 2 by chat 25 (`ae2575a68`); this chat wrote
neither. Pictures: `docs/img/handpass/2026-11-08-rd-last-findings/`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL, who counts as present) | NO — no count, OIL or roster writer changed; only which loaders the save layer is handed, and from where |
| 2 | The published record | NO — no publish, sign or amendment code touched; Admin → Data's "Clear edit history…" form changed only its two headings |
| 3 | Saved data | **YES** — the people-and-settings save layer's registration, its command types and the four loaders a rollback or undo re-runs |
| 4 | A shared drawer | **YES** — the CSS rule `.mfield label` (every form's field heading) widened to `.mfield .mfield-lbl` |
| 5 | A new gesture or mode | **YES** — a press on Admin → Data's "Period" heading now puts the keys on its list (`htmlFor`) |
| 6 | A new surface | NO — no screen, panel, sheet or kind of row added; the editors are the same markup in their own components |
| 7 | Roles | **YES** — Admin → Users' account editors, the access screen, and where the account and seen-mark command types are declared to the permission gate |
| 8 | The warning list | NO — no rule, warning or engine file touched |

**Tier: FULL** (3, 7). The server question (§5): `perms.test.ts` and `perms-scan.test.ts` — to be checked green; no
§11 row is changed by this job (the declarations moved file, the decisions stay in `perms.ts`).
Security read owed (D1411): sign-in screen, Admin → Users, the permission declarations.

**Something new he will see (D1625):** none — every heading keeps its look (the span takes the label's rule); a press
on "Period" focusing its list is the one new behaviour, unseen until pressed. No mock-up owed.

**The rulings that apply** (the area's page, `.claude/rules/decisions/people-accounts.md`), each to be checked against
the running build as "the same as `main`": Admin → Users' one row per person, A to Z, own row not opened (D322, D310);
the buttons by state — Active Suspend · Archive · Delete, Suspended Enable · …, no sign-in Give sign-in · …, Archived
Restore · Delete, Waiting Give access · Refuse (D310, D322, D285, D298); the delete asks twice and names what goes
(D287, D298); Enable and Restore prompt "check your quals and CAT" (D284, D307, D322); the archived row's rename and
"Restore as …" when his callsign is taken (D286, D295, D310); the post-in date opening on today (D308); the archived
line (D329) and the posting tags (D326); Give access's "On the roster / New person" (D214, D224, D322); Undo only
through one's own changes, never adding, archiving, restoring, deleting or posting (D148, D350); Admin → Data's
"Clear edit history…" as built (D1752); the "Not saved" band on the access screen (D1657, D1664); the job's own ruling
(D1534). No clash found between them.

## 2. Roll-call — every place the touched things are drawn or written

Each cell: YES / NO-because / MISSING. EXPECTED everywhere: the same as on `main`'s build.

### 2a. Part 1 — the save layer (a storage writer: first write, undo, redo, a failed save's rollback, a reload)

| Row | Writer → its in-memory copy re-run on rollback / undo | Saves and reloads the same | Undo / redo the same | Failed save puts it back the same | Proved by |
|---|---|---|---|---|---|
| P1 | People edits — Quals cells, a rename (`quals-write`, `commitPeopleEdit`) | | | | |
| P2 | The eleven settings keys — Logic, stores, cancel reasons, day / duty / wave templates, qual columns, look-ahead, defaults, Insights | | | | |
| P3 | Accounts — give sign-in, suspend, enable, role, sign-in name, request, approve, refuse (`accounts`, loader `accountsLoad`) | | | | |
| P4 | The change history's seen marks (`changes`, loader `changesLoad`) | | | | |
| P5 | The bell's read marks (`noticeseen`, loader `noticeSeenLoad`) | | | | |
| P6 | The Leave War's and Approvals' seen marks (`lwseen`, `apprseen` — no loader, as on `main`) | | | | |
| P7 | The flying plan (`flyplan`, loader `flyplanLoad`) | | | | |
| P8 | The roster add — Add a person, approve as New person (`roster-add`) | | | | |
| P9 | Members may file for others — the Admin switch (`memberfile`) | | | | |
| P10 | Delete a person (`person-delete`) | | | | |
| P11 | The Leave War's people projection (`leavewar/sync`) | | | | |
| P12 | Start-up — every entry that registers the layer (`wireStore`), the order of types and loaders | | | | |

### 2b. Part 2 — the screens

| Row | Place | SHOWS the same (picture against `main`) | USABLE the same | What else is PAINTED there | Proved by |
|---|---|---|---|---|---|
| S1 | Admin → Users, a roster row — active, suspended, no sign-in, own row, a posting waiting, a held posting; its line under the callsign | | | | |
| S2 | Admin → Users, a roster row's open editor — typed values, armed Delete, after Cancel / row tap / another row / save / refusal, opened again | | | | |
| S3 | Admin → Users, an archived row and its editor — callsign free, taken, no sign-in; rename, Restore, Restore as, Delete | | | | |
| S4 | Admin → Users, a waiting request's Give access — "Person" heading, On the roster / New person | | | | |
| S5 | Admin → Data, "Clear old clutter…" — "Period" list, "Dates" range calendar | | | | |
| S6 | Admin → Data, "Clear edit history…" — the same two | | | | |
| S7 | The access screen, "Request access" — the callsign box's caret on arrival | | | | |
| S8 | Every other form heading drawn by `.mfield label` — the widened rule must change none | | | | |

## 3. The walk's size (D607)

1. Type of change: **G** (the save layer's registration — the command types it accepts and the four loaders a rollback
   or undo re-runs, now handed in by start-up), **H** (where the account and seen-mark types are declared to the
   permission gate; Admin → Users' editors), **E** (the widened `.mfield` heading rule; Admin → Users' editors split
   into their own components), **C** (a press on "Period" now puts the keys on its list).
2. What only a walk could find here: a writer whose type or loader is not handed in on a real start-up route of the
   BUILT app (sign-in, reload, `?fresh=1`, a second tab, a member) — the tests boot through their own set-up; an
   editor, now its own component, that keeps or drops typed values differently when closed by Cancel, a row tap,
   another row, a save or a refusal; any form heading elsewhere drawn differently by the widened rule; the access
   screen's caret. Already covered: §7's break tests (every wire RED when cut, one pin added); the touched tests.
3. What the ledger says: three React Doctor tidy-ups walked — 31 Oct (FULL, two walkers, 113/113 the same, 0 by the
   walk, the reads 1), 6 Nov People and Quals (WALK, 0 by the walk, the read 1 low), 8 Nov the shell and state (WALK,
   the host alone, 0 by the walk, the reads 7 low). Walks of this type find nothing by themselves; the picture and value
   comparison against `main` is what proves "the same", and the 31 Oct lesson says it proves it only for the data
   states the demo holds — so Astra's fixtures (seven made people, a taken archived name, postings past, due and future)
   are built through the app's controls first.
4. The walk chosen: **two Sonnet 5.5 walkers at once under the checks lock** (a fanned-out walk, D16), each in its own
   browser worlds, both on the same two frozen builds — `main` at `d8d5b1f57` and the branch at `8b54a2cd5` (main
   brought in), the clock held at 8 Nov 26 09:00 Singapore, desktop 1536 Chromium and iPhone 402 × 874 WebKit by touch.
   **Walker A, the screens:** `scripts/handpass/rdl1108-same.mjs` — `main`'s build twice first, then picture for picture
   against the branch: Admin → Users in every row state and every open editor, the archived group and its editor,
   Give access's "Person" choice, Admin → Data's two clearing forms in both modes, the access screen, the sign-in
   screen, and S8's other `.mfield` forms (Add a person, the approval form, the input window's fields, every Admin
   window drawing the heading); then Astra's S12, S13, S14, S16, S18, S20, S23, S24 on both builds, values compared,
   and the plain-user round (§7.0a) on Admin → Users and Admin → Data. **Walker B, the save layer:**
   `scripts/handpass/rdl1108-walk.mjs` — Astra's S01–S05, S07–S11, S15, S17, S19, S21, S22 on both builds, each with
   the reload, second tab, `?savefail` and phone her marks name, values compared. **Carried by tests, red first** (the
   host): S06 and Astra's three gaps — real values through real Undo / Redo, a signed-in actor's refusal of an
   undeclared type, a rollback after a change kept apart from `?savefail` — each a test that goes RED when its wire is
   cut; these change the data through the layer, so they prove the wire, never that a screen offers the route (the
   walk proves that). No approved drawing is touched: the access screen's one changed line is a comment.
   **The lessons (§7.11):** applying — 1 (the editors' state table, S12), 3 (a picture after every press), 9 (Admin →
   Users' list measured, both sizes), 10 (a second tab hidden and shown after a write, WebKit, S11), 14 (the keyboard
   boxes from Astra's inventory, found in the code), 16 (after a refusal at a box, S16), 17 (each editor opened, closed
   and opened again), 19 (each window closed by each of its ways, S23), 22 (what is drawn, pixels), 23 (what a tap on a
   row opens — the rulings', D322), the second 23 (side-by-side boxes one height, both sizes); not applying — 2, 7, 13,
   20, 21 (no gesture changed), 4 and 12 (no window leaves its page working, none opened from a new place), 5 (no row
   moved), 6 (nothing handed to the phone), 8 (no drawing touched), 11 (nothing depends on what fits), 15 (no bar
   changed), 18 (nothing printed).
5. After the walk:

## 4. Scenarios (designed by Astra — `docs/superpowers/briefs/2026-11-08-rd-last-findings-scenarios.md`)

## 5. Results — what the screen said, both builds

## 6. Cases carried by a test, each with what it proves

## 7. The break tests

Each wire cut by hand in the source, the named tests run, the source put back (`git checkout`), 8 Nov 26, chat 26.

| Wire cut | Tests run | Result |
|---|---|---|
| the accounts loader handed in as a do-nothing | wire, commit, write-seam, stores-boot | **RED** 2 |
| the change history's loader | the same | **RED** 2 |
| the bell's loader | the same | **RED** 2 |
| the flying plan's loader | the same | **RED** 2 |
| the account command types left out | the same | **RED** 1 |
| the change history's types | the same | **RED** 1 |
| the bell's types | the same | **RED** 1 |
| the Leave War's seen types | the same | **RED** 1 |
| the Approvals' seen types | the same | **RED** 1 |
| start-up (`wireStore`) skipping the registration | the four above | green — each registers the layer itself |
| the same | `accounts.test.ts`, `accounts-rows.test.ts`, `onedoor-users.test.tsx` (boot the app) | **RED** 33 |
| "Period" losing its `htmlFor` | `adminclear.test.tsx` | **RED** 1 |
| the range calendar losing its group name | `adminclear.test.tsx` | **RED** 1 |
| a roster row's editor drawn while closed | `onedoor-users.test.tsx` | **RED** 9 |
| an archived row's editor drawn while closed | `onedoor-users.test.tsx` | **green — no test had it.** A pin added, "archived: a closed row shows no editor, before it is opened and after Cancel": RED on the cut (1), green on the code (20 / 20) |
| the row's key no longer changing with its editor | `onedoor-users.test.tsx` | green, as it should be: since the split the editor exists only while open, so its fresh start no longer rests on the key — not a wire any more |

## 8. Errors seen

## 9. The reads — Astra, Sol 6.1, the fresh Opus read, the security read

## 10. What the walk and the reads found, and each disposition

## 11. Not walked, and why

Chat 32 sized what walker B did not reach (B's report, its "not walked"). S14, S15 and S19 with real clutter went to a
third walker (§5, walker C). The rest, each with its reason (§7.0's rule on a designer's scenario set aside):

- **S09, the bell's take-back for a second admin** — on both builds the second admin's bell drew no posting lines at
  all, so there was nothing to read or take back on either; B's bell steps (H03 a tap, H04 Mark all read and a reload)
  ran on that empty bell, the same on both, and the change history's Mark all as seen (H05) with lines. The bell's read
  marks with real lines are carried by `people-settings-wire-real.test.ts` groups 1–3 (a read kept through an Undo and
  a Redo, landing for a member and an admin, put back after a failed change) — data changed directly, so they prove
  the wire, not the screen. The missing bell line is a
  fault of `main` as well, seen in passing (§10), not of this change.
- **S10, the 12 settings B did not drive** — the eleven settings keys' command types, their loaders and the order the
  loaders run in are byte for byte `main`'s (the diff touches only the four module loaders now handed in); every setting
  rolls back and undoes through the one loader list, which B drove through three settings of different shapes (a
  switch, an ordered list with Reset, a window's Save) on both builds — Undo, Redo, reload, all the same. A wrong
  module loader would show on any of them, and the break tests (§7) cut each.
- **S22's downstream readings (Leave War, Tracker, availability)** — no file those pages read was touched, and the
  archive, restore, posting and delete commands are the same commands with the same types; A and B walked each journey
  to its Users, Quals and sign-in result on both builds, the same. What could differ — which loaders a rollback re-runs
  — the Leave War and the Tracker do not use (their own stores).
- **S06 and the J variants** — carried by tests (`people-settings-wire-real.test.ts` group 3), as the sizing said.

## 12. Gate counts
