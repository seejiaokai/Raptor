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

1. Type of change:
2. What only a walk could find here:
3. What the ledger says:
4. The walk chosen:
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

## 12. Gate counts
