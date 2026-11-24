# The rulings audit — slice 3, who may do what (`permissions`)

A fresh Opus helper, blind to the other slices, 24 Nov 26 (his D2567, D2610). Reading only — nothing in the app, a
drawing or a rule changed. Brief: `2026-11-24-rulings-audit-slice-brief.md`; plan: `../plans/2026-11-24-rulings-audit-plan.md`
§3–§5. App read on this working copy (branch `claude/readings-lapse-fix-fdbb3c`); none of slice 3's items lives only on the
SANS branch. Rulings read from `.claude/rules/decisions/people-accounts.md` and the full rows (shell grep), the scheduler
page's multi-squadron lines, `DECISIONS-ARCHIVE.md` where a row pointed there.

Counts: **MISMATCH 1** (two strings, one fault) · **OPEN READING 4** · **NO RULING 0** · notes (not findings) 4.

## Findings

| Id | Class | The item | Where | Ruling(s) and his words | The difference | The reading's standing | Harm | The question it would become |
|---|---|---|---|---|---|---|---|---|
| M1 | MISMATCH | A member who may not change or delete a one-person input is told who can: "Only Ace or an admin can change this." / "Only Ace or an admin can delete this input" | `raptor-port/src/ui/InputWindow.tsx:1274` (the read-only foot); `raptor-port/src/ui/InputsCal.tsx:982` (Delete on the opened day's line) | D655 — who may change or delete an input filed for another man: *"Him, the filer, and an admin"*; built as `state/perms.ts` `mayChangeInput` → `filedForOther` (the filer, while the members' switch is on, for a duty or commitment) | The sentence names the man and an admin but not the filer, who may change it too: the rule (`mayEditInput`) lets the filer in, the words leave him out. Shared inputs say it right (`sharedRefusal`: "Only Saber — who filed it — or an admin…") | Not a reading — the ruling is clear; the one-person sentence predates the filer rule | Wording only (told the wrong person to ask) | None — a fault: the sentence should name the filer where `filedForOther` holds, as `sharedRefusal` does. **When:** a member taps a squadron-mate's input on the Inputs calendar or list, any day, while the members' switch is on. **Example:** Ranger files a Training on Thu 16 Jul for Ace (switch on). Hex opens it: "Only Ace or an admin can change this." — Ranger, who filed it, can change it too, and is the one Hex should ask. |
| O1 | OPEN READING | Whether a filer who moved with the man is still told of a change to that input judges his admin role **today**, not on the input's days | `raptor-port/src/state/notices.ts:170-185` (`filerVia`, comment "the agent's reading in D2228's row") | D2228 — *"As recommended for Q1"*: a filer who moved with the man and is now an admin of his new squadron is told. Row: "The agent's reading: 'that man's admin' is read on the input's own days (the named man's home on each day, the filer an admin of that squadron today)" | Which day decides "now an admin of the man's squadron": the code takes his role today; the question he answered had him an admin on every day involved, so it never met the case where his role changed in between | Never put — in the row as "the agent's reading", not marked told; searched the row, the 20 Nov questions page's Q1 (put in words, no picture) and D2225/D2223 | Told wrongly (low) | **When:** a filer moves squadron with the man he filed for, and his admin role there changes after the input's days. **Example:** Hunter (142 admin) files Ranger's leave 15–20 Jul; both move to 149 on 16 Jul; on 1 Aug Hunter is made a member of 149; on 2 Aug Kestrel changes the leave's remark — Hunter is not told, though he was 149's admin on all the leave's 149 days. Is that right? |
| O2 | OPEN READING | An admin who asks to take over a day another scheduler holds may, after a minute with no answer or after "Keep editing", still "Take over anyway"; each take-over first saves the day as a saved plan | `.claude/rules/decisions/scheduler.md:245` (ruled, not built — [DB-SYNC-MODEL]) | D2212 — *"Ok 1. One editor per day"*: "an admin may ask to take it over". Row: "the take-over's further detail (one minute, 'Take over anyway', the saved plan) stays the agent's reading"; the page line: "not yet checked with him" | His word is "ask"; the line adds a way to take it without the holder's yes | Never put — the page says so in terms; searched D2212, D1751, D454 | Permission | **When:** two admins want the same day at once — the holder away from his desk, the other needing to publish a change. **Example:** Hunter holds Tuesday; Saber asks to take it over; Hunter does not answer for a minute (or presses Keep editing). May Saber then take it anyway, and should Hunter's unsaved work be kept as a saved plan named "Hunter — at take-over 14:05"? (Slice 2 may hold this too — the day lock.) |
| O3 | OPEN READING | Re-linking a sign-in that holds **Plan** of another squadron to another person is refused to everyone but a master admin: "This sign-in holds a right in 149. Only a master admin can link it to another person." | `raptor-port/src/state/accounts.ts:440-449` (`relinkRightsProblem`); the gate `raptor-port/src/state/perms.ts:2339-2360` (G4) | D2211 / D2199 — Plan is a master admin's alone to give; D2250 — *"Yes let the admin downgrade"*: an admin of the man's own squadron may make him a member, his Plan ending with it; D2241 — wherever a master admin may act for a squadron, a Plan holder of it may too; D2266 — no control moves a sign-in to another person, for now | The code reads "taking Plan away is a master admin's alone" (its comment, PA3/PH1); D2250 later lets the man's own squadron admin end it by a downgrade. A re-link also ends it, yet only a master admin may do it | Never put as such — the code comment cites the Plan audit (PA3, PH1); D2241's row says the re-link rule was to be "brought in line", which was done for a View right only. Searched D2199, D2201, D2211, D2241, D2250, D2266 | Permission — unreachable today (D2266: no screen re-links a sign-in) | **When:** only once a control to move a sign-in to another person exists. **Example:** Kestrel (149 admin) finds Osprey's sign-in, which holds Plan of 142, typed onto the wrong 149 man and moves it to the right one. Refused today unless Saber does it. May an admin of the man's own squadron do it, as he may already end that Plan by making him a member? |
| O4 | OPEN READING | Two rulings give a refused change to leave that runs across a man's move different opening words: the save door says "Blocked: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can change leave that runs across his move."; the ✕ on its schedule row is to say "Not saved: Ranger is 149's from Thu 16 Jul. Only Ranger or an admin of both 142 and 149 can take this leave off." | Built: `raptor-port/src/ui/inputedit.tsx:170`. Ruled, not built: D2261 (the ✕ door), drawn first, built at the Transfer step | D1667 — *"Blocked: (Recommended)"*: a refused change opens "Blocked:", never "Not saved", which stays the failed-save band's alone. D2261 (22 Nov 26, later) — the ✕'s words quoted beginning "Not saved:", the reading told to him and confirmed ("b10 ok") | The later ruling's words break the earlier standing rule; the built door follows D1667 | Disclosed and confirmed, but the clash with D1667 was not put to him — D90: where the newer ruling does not clearly mean to change the older rule, ask | Wording only | **When:** an admin of one squadron only presses ✕ on the schedule row of leave that runs across a man's move. **Example:** Hunter (142 only) presses ✕ on Ranger's leave on 142's Tue 14 Jul; Ranger is 149's from Thu 16 Jul. Should it open "Blocked:", as every other refused change does (recommended), or "Not saved:" as written in D2261? |

## Notes — not findings (the code is right going forward; a document or comment is stale)

- N1 · `raptor-port/src/leavewar/state/store.ts:4194-4196` (C0146) — the comment says a run posting refuses "his days from the
  posting-out date", citing D1436's replaced reading. The code (`leavewar/sync.ts postingOutWhy`) refuses only the Delete
  outcome, as D1541/D1545 rule. The comment should say so (record-decisions: a stale comment is fixed in the same change).
- N2 · `.claude/rules/decisions/people-accounts.md` §How a person joins — "no guest view, switch or button into it (to be
  removed)": built since — the guest role holds nothing (`state/perms.ts roleOf`), the switch and the button are gone (D2239).
- N3 · the same page's heading "Many squadrons and aircraft types — not built yet" now covers lines that are built: the
  master admin and the master-only doors (D2191, D2205, D2249), Plan and View rights and their end at a move (D2201, D2203,
  D2243), the last-admin counting (D2246, D2247), the downgrade (D2250). What is not built there: every screen that gives
  or shows Plan/View (D2217's drawings), the "Schedules" menu (D2197), per-squadron requests (D2094), Admin → Users one
  squadron at a time (D2191, D2270 — today it lists every squadron's people; filed in `OUTSTANDING.md` [MSQ-PLAN-AUDIT] O3),
  the shared-place time-zone restriction (D2196), the bell switches (D2198, D2200, D2202).
- N4 · `raptor-port/src/state/accounts.ts:661` `setMaster` refuses marking a non-admin account a master admin with the
  generic "This change could not be saved." — no screen makes a second master admin yet (D2260's reading; words wait for
  the drawing, D1625). Nothing to ask now.

## Side by side — the step B questions

### 10. Who may edit the schedule

| Surface | The rule it applies | The ruling it rests on |
|---|---|---|
| Edit Schedule, the Board, the week's writes (~160 readers) | the role in force is admin (`state/perms.ts mayEditSched`) | D166, D292, D200, D785 |
| The newer question, for step 5's menu | admin role in force AND his level in the picked squadron that day is admin (`maySchedEditPage`, `adminOfPage`) | D2191, D2197, D2201, D2252, D2253 |
| The commit gate | every changed record's squadron (`unitRecordViolation`, 7): an admin must be an admin there — at home, by Plan, or a master admin; a View right writes nothing; plus no newly-named man of another squadron on a day (7a) | D2094, D2191, D2201, D2243 Q2 |

**AGREE today** (the pick has one caller, sign-in — `state/store.ts:929`). Once the menu is live a View holder picking
another squadron would be drawn edit controls by `mayEditSched`, but **the gate refuses every save** there (checked: 7
asks the level in the record's own squadron). Moving the call sites is filed (P3, step 5). Not a finding.

### 11. Who may file, change or delete an input

| Surface | The rule | Ruling |
|---|---|---|
| The input's window, card, list and calendar controls | admin; the only named man; its filer for a duty/commitment while the switch is on and he put everyone in (`mayFileInputFor`, `mayFileGroup`, `mayEditInput`, `mayDeleteInput`) | D149, D654, D655, D658, D660, D700, D755, D762, D763 |
| What a member's command changed | the same rule per changed record (`ownershipViolation`, `inputWhoProblem`) | same, D200 |
| Where it stands once a scheduler moved it | a scheduler only (`mayMovePlace` → `placeHeld`) | D1388 |
| Leave across a man's move | the man, or an admin of both squadrons (`inputWhoProblem` 7c; words `inputedit.tsx acrossMoveWords`) | D2240, D2261 |
| The Leave War's input gate (`leavewar/inputgate.ts`) | not a who-may rule: absence clashes only (sick cuts leave, no two leaves on one time, a clashing input replaces a bid); its writes still pass the commit gate above | D1177, his 20 Sep 26 answers A–D |
| The refusal's words | one-person input: "Only <man> or an admin…" — **omits the filer (M1)**; shared: "Only <filer> — who filed it — or an admin…"; switch off to the filer: FILING_OFF | D655, D731 (8), D755 |

**AGREE** on the rule (every door and the gate ask one body); the Leave War's gate does not answer this question, so
there is nothing to set against it. **DIFFER** in the words only — M1.

### 12. Who may write on the Leave War — a bid, a decision, an award

| Surface | The rule | Ruling |
|---|---|---|
| The grid and the store (`leavewar/engine/access.ts`) | a member his own row, on a day open for him and not before today; an admin any row, any day; only an admin decides | D1177, D1211, D1225, D333, D418 |
| The permissions table (`state/perms.ts` PERMS bid/award/ledger/balance; `mayDecideBids`, `mayAwardOil`) | bid: admin all, member his own C/U/D; decisions and awards: admin | D200, D1008, D1203, D1220 |
| The commit gate (`lwClosedKeys`, D1263 restore check) | a member's war record only on a day the war's own `canEditCell` says is open — the probe asks the war's rule, not a copy | D1177, D1211, D1225, D1263 |
| The squadron (`warUnitViolation`, 7b) | writes to the loaded war need a level there: admin for an admin (home, Plan or master admin), member at home for a member; no leave onto a day of another squadron's man | D2201, D2243 Q3 |

**AGREE** — the gate asks the war's own open-day rule through its probe, and the table and the war agree on decisions
(admin only) and rows (his own).

### 13. Who is "a scheduler"

| Surface | The rule | Ruling |
|---|---|---|
| SKED CK, PLANNED BY, APPROVED BY | the Scheduler tick on Quals, held in the squadron it was given in, that day (`engine/publish.ts signPeople`, `tickAt`); after the day's own people, a Plan holder of the squadron while his Plan holds and a master admin, each with the tick (`state/sign-more.ts`) | D1651 ("the tick decides who may sign"), D2245, D2243 Q2, D2160 |
| Who may edit and publish | the admin role (question 10) | D785 ("Schedulers will be admins"), D166 |
| The bell's lines "to the schedulers" (a holiday's OIL questions, a posting) | the squadron's admins that day, a Plan holder included, a master admin only at home (`state/accounts.ts adminsOf`) | D785 (confirms D780's reading: "the schedulers" told = the admin accounts), D1690 ("each admin's bell"), D2198, D2202 |

**DIFFER, RULED** — an admin with no Scheduler tick edits and is told, but is not offered in the three boxes; D1651 makes
the tick the signing rule and D785 the role the editing and telling rule. The reverse shape (a scheduler who is not an
admin) is out of scope (D785). Not a finding.

### 13a. Who may read a man's medical detail

| Surface | The rule | Ruling |
|---|---|---|
| The schedule's rows (`ui/html.ts hideMed` → `mayReadMedicalOf`) | every admin and member (`MEDICAL_DETAIL`) | D211 ("Keep as today"), D2239 (the guest gone) |
| The Leave War grid's medical codes | every member sees the code | D211 |
| A person waiting or switched off | reads nothing (the guest role holds nothing, `allows`) | D2239 |

**AGREE** — every signed-in admin and member reads it, by ruling; nobody else is shown the schedule.

## Items added that step A's list missed

- Admin → Users lists every squadron's people to any admin (`ui/UsersPanel.tsx:525`) — D2191 / D2270 say one squadron at a
  time; ruled, not built, filed ([MSQ-PLAN-AUDIT] O3). Ledger: MATCH (filed). In N3.
- Requests for access reach every admin, of every squadron (`ui/UsersPanel.tsx:178`) — D2094 / D2239 "that squadron's
  admins"; ruled, not built until "Request access" asks the squadron (step 5). Ledger: MATCH (filed). In N3.
- The ✕ door's words for leave across a move (D2261) against D1667 — O4.

## Coverage ledger

Step A's list carried 363 items for slice 3 (C 58, W 199, GN 80, GD 17, GS 9). All 363 are listed below; 64 dropped as
plainly another slice's or a false match of "his call" on "his callsign" (each says which); 20 strings are code, not
words a person reads. Plus 3 added (above) and the 5 step B questions (10, 11, 12, 13, 13a).
**Depth, said plainly:** every C item, every refusal or role string (W) and the step B questions were read against their
rows. The GN lines were read and their cited rulings checked by number; the rows were opened for those carrying a reading
or a who-may rule (GN028, GN033, GN064, GN118 and the Plan/View/master lines); the rest are marked "rows not opened one by
one". The GD drawings (lean copy — no pictures fetched) were read as their pages' words and answers; the GS plans were
read through the rulings they cite, not page by page. Nothing left for a second helper inside the brief's scope.

- C0054 (C) · dropped · ordinary use of "reading of" (OIL flight times) — not slice 3
- C0061 (C) · dropped · ordinary use of "assumed" (test fixture) — not slice 3
- C0121 (C) · dropped · Leave War counters order — slice 6
- C0122 (C) · dropped · "his call" matched "his callsign" — no reading
- C0126 (C) · MATCH · who is in what a member filed is his (the filer) to change, retype refused — D655, D763
- C0127 (C) · MATCH · a man is added to an input only by its filer or a scheduler — D763
- C0129 (C) · MATCH · Delete posting keeps refusing his leave from its date — the reading in D1541 answered by D1545
- C0131 (C) · MATCH (test note) · cites D1436's host reading, replaced by D1541/D1545; the test asserts the Delete case only
- C0132 (C) · MATCH · "a move ends the Plan" is his D2203/D2243 Q4; a line retires only on a move is D2218
- C0133 (C) · MATCH · same as C0132
- C0135 (C) · dropped · "his callsign" match — callsign rule D286/D295, no reading
- C0140 (C) · dropped · "his callsign" match — D286, no reading
- C0141 (C) · dropped · "his callsign" match — D286/D295, no reading
- C0144 (C) · dropped · SANS-before shading (admin unchanged) — slice 5; readings recorded as kept by him (D2388)
- C0146 (C) · NOTE (stale comment, code right) · comment cites D1436's replaced reading; postingOutWhy refuses only the Delete outcome, per D1541/D1545 — see Notes
- C0148 (C) · dropped · "his callsign" match — D286, no reading
- C0151 (C) · MATCH · a member in an input he did not file cannot write its war cell — D763
- C0154 (C) · dropped · "his callsign" match — no reading
- C0164 (C) · dropped · Leave War grid refusal words — slice 6 (lw-grid)
- C0170 (C) · dropped · Leave War select-sheet day line — slice 6
- C0171 (C) · dropped · "his callsign" match — viewer pin, no reading
- C0174 (C) · dropped · ordinary "assumed" (published day Logic) — slice 2
- C0179 (C) · MATCH · an admin who moves squadron arrives a member (D2160, GN101); bell audit follows D2223/D2228
- C0180 (C) · MATCH · members-file-for-others is "for now", one switch puts it back to admins only — his own words, D654/D655
- C0181 (C) · MATCH · his own input across his move stays his to change — D2261
- C0182 (C) · MATCH · same — D2261
- C0183 (C) · MATCH · reading "a filer who never moved is still told" (told in a closing report) — later ruled by him, D2225 Q16
- C0184 (C) · OPEN READING · O1 — the filer's admin role read on today, not on the input's days (D2228's row)
- C0185 (C) · MATCH · "a day is the filer's squadron's where the named man's home that day is it" — the case he answered, D2225 Q17
- C0187 (C) · MATCH · the posting's bell line — D1690, D1691
- C0188 (C) · MATCH · switch off: a filing for others is no longer his to change; the man and an admin still can — D654, D655
- C0189 (C) · MATCH · the filer rule's full statement — D654, D655, D658, D660, D700, D755, D760, D762, D763, D1388, D1620
- C0190 (C) · MATCH · a master admin's account is a master admin's alone — D2205
- C0191 (C) · OPEN READING · O3 — re-linking a sign-in that holds Plan: master admin only (unreachable today, D2266)
- C0192 (C) · dropped · "his callsign" match — delete frees his callsign, D290; no reading
- C0197 (C) · MATCH · Plan is for an admin, given by a master admin only — D2199, D2201, D2211 (his words "admins with plan")
- C0198 (C) · MATCH · a Plan holder in the member view holds nothing there (D292, D2253); rights end at the move day (D2203, D2243 Q4)
- C0199 (C) · dropped · "his callsign" match — undo words name a callsign; no reading
- C0205 (C) · dropped · "HIS CALLSIGN" match — layout note
- C0206 (C) · dropped · "his callsign" match — D1650/D1656 layout
- C0207 (C) · dropped · "his callsign" match — one-door test history
- C0209 (C) · dropped · ALL AVAIL open row OIL words — slice 1
- C0216 (C) · MATCH · a member opening another man's input reads it, not his to change — D149/D655
- C0222 (C) · MATCH · a member files a meeting for himself and another; his to change afterwards — D655
- C0225 (C) · dropped · SANS member files his own only — slice 5 (D2340)
- C0233 (C) · MATCH · his own input is his to change; no Person list for a member — D149, D655
- C0236 (C) · MATCH · "OIL?" shown to whoever may answer = mayEditInput; rests on D660/D762 (the filer gives the one answer), not on the reading alone
- C0237 (C) · MATCH · same switch, "for now" his words — D654, D655; gear D635; window D641; "Calendar…" D675
- C0238 (C) · dropped · D179 "freeze everything for now" after publish — slice 2
- C0250 (C) · dropped · OIL Earn words over an assumed hour — slice 1 (D31, D360)
- C0251 (C) · dropped · ordinary "assumed impossible" (OIL claim walk) — slice 1
- C0260 (C) · dropped · "his callsign" match — placeholder count words
- C0261 (C) · MATCH · a member files one (switch on): his and an admin's to change and delete — D655
- C0263 (C) · MATCH · his own filing is his to change — D655
- C0265 (C) · MATCH · only an admin ticks Management; his own cell reads only — D1510, D218
- C0266 (C) · MATCH (no rule) · a test pin left with the deleted paragraph — housekeeping, D935
- C0269 (C) · dropped · SANS-before shading, admin unchanged — slice 5 (readings kept by him)
- C0272 (C) · dropped · "his callsign" match — row sub-line layout
- W0004 (W) · MATCH · an admin creates the leave period — PERMS war: admin only (D200)
- W0040 (W) · MATCH · balances lock is the admin's — D1203, D1220
- W0041 (W) · MATCH · same
- W0077 (W) · dropped · bid state words — slice 6
- W0097 (W) · dropped · OIL award help text — slice 7
- W0098 (W) · dropped · OIL help text — slice 7
- W0113 (W) · MATCH · an award is given by an admin, only an admin changes it — PERMS award (D1008)
- W0149 (W) · not a string a person reads (code comment fragment)
- W0168 (W) · MATCH (no rule) · a label or heading
- W0184 (W) · MATCH · decisions are an admin's — D1177
- W0185 (W) · MATCH (no rule) · a label or heading
- W0256 (W) · MATCH (no rule) · a label or heading
- W0264 (W) · MATCH · an admin decides between clashing items — D1177
- W0265 (W) · MATCH · same
- W0266 (W) · MATCH · same
- W0425 (W) · MATCH · D1177
- W0436 (W) · MATCH (no rule) · a label or heading
- W0482 (W) · MATCH · only an admin opens or closes dates — D1177, D1211
- W0555 (W) · dropped · select-sheet refusal sum — slice 6
- W0563 (W) · MATCH (no rule) · a label or heading
- W0628 (W) · MATCH · only an admin creates a leave war — PERMS war
- W0640 (W) · not a string a person reads
- W0641 (W) · not a string a person reads
- W0642 (W) · MATCH · last-admin lock, no callsign case — D2184 Q10, D306
- W0643 (W) · MATCH · approved words — D2184 Q10, D2217 Q15
- W0644 (W) · MATCH · approved words — D2246
- W0645 (W) · MATCH · approved words kept — D2205 M5 (Plan counts as an admin of 149, confirmed by D2241)
- W0646 (W) · OPEN READING · O3 (unreachable today — D2266)
- W0647 (W) · MATCH · a View right re-linked by an admin of that squadron or a master admin — D2241 (unreachable today, D2266)
- W0648 (W) · MATCH · the person's form of D2205's words; "his account" form used on Archive since the re-walk
- W0649 (W) · MATCH (no rule) · a label or heading
- W0650 (W) · MATCH (no rule) · a label or heading
- W0651 (W) · MATCH (no rule) · a label or heading
- W0652 (W) · MATCH · last-admin lock — D306
- W0653 (W) · MATCH · PERMS user: admin
- W0654 (W) · MATCH (no rule) · a label or heading
- W0655 (W) · MATCH · PERMS user: admin
- W0656 (W) · MATCH (no rule) · a label or heading
- W0657 (W) · MATCH · never his own account, another admin changes it — D322, D166
- W0658 (W) · MATCH · "Only a master admin can do that" — D2249, D2205
- W0659 (W) · MATCH · the master mark never on his own account (D2191 line; same own-account rule as D322)
- W0660 (W) · label (state)
- W0661 (W) · label (state)
- W0662 (W) · MATCH · admin approves requests — D204, D2239
- W0663 (W) · MATCH (no rule) · a label or heading
- W0664 (W) · MATCH · admin declines requests — D204
- W0665 (W) · MATCH · only a person on no list asks — D293
- W0666 (W) · MATCH (no rule) · a label or heading
- W0667 (W) · MATCH (no rule) · a label or heading
- W0668 (W) · MATCH · "an admin will answer it" — D2239
- W0669 (W) · MATCH · never his own account — D322, D166
- W0670 (W) · MATCH · same
- W0671 (W) · not a string a person reads
- W0672 (W) · not a string a person reads
- W0673 (W) · MATCH (Undo refusal) · D148
- W0674 (W) · MATCH (Undo refusal) · D148
- W0675 (W) · MATCH (Undo refusal) · D148
- W0676 (W) · MATCH (Undo refusal) · D148
- W0677 (W) · MATCH · only an admin adds a person — D224, D322
- W0688 (W) · MATCH · balances lock line — D1203
- W0694 (W) · MATCH · Logic/settings an admin's — PERMS setting
- W0725 (W) · MATCH · generic failed save — D1667
- W0726 (W) · MATCH (no rule) · a label or heading
- W0759 (W) · not a string a person reads
- W0760 (W) · not a string a person reads
- W0761 (W) · not a string a person reads
- W0762 (W) · not a string a person reads
- W0763 (W) · not a string a person reads
- W0764 (W) · not a string a person reads
- W0765 (W) · not a string a person reads
- W0766 (W) · not a string a person reads
- W0767 (W) · not a string a person reads
- W0768 (W) · not a string a person reads (gate reason) · enforces D2250 (Plan ends with a member's role)
- W0769 (W) · not a string a person reads (gate reason) · enforces D2211
- W0770 (W) · not a string a person reads
- W0776 (W) · MATCH · only an admin deletes — D287, PERMS
- W0778 (W) · MATCH · only an admin renames — D218
- W0779 (W) · MATCH · only an admin ticks Management — D1510
- W0780 (W) · MATCH · only an admin ticks Scheduler — D1651
- W0794 (W) · MATCH · only an admin adds — D224
- W0812 (W) · MATCH · Plan given by a master admin alone — D2199, D2211
- W0815 (W) · MATCH (no rule) · a label or heading
- W0816 (W) · MATCH (no rule) · a label or heading
- W0817 (W) · MATCH (no rule) · a label or heading
- W0818 (W) · MATCH · a new squadron names its first admin — D2191
- W0819 (W) · MATCH · no screen yet ("+ New squadron" drawn first, D1625); refusal follows D2203 (rights end at move day)
- W0821 (W) · MATCH (no rule) · a label or heading
- W0822 (W) · MATCH (no rule) · a label or heading
- W0823 (W) · MATCH (no rule) · a label or heading
- W0827 (W) · MATCH · no right in his own home squadron — his role there is his account's (D2191/D2199); no screen yet
- W0830 (W) · MATCH · his words — D2249
- W0831 (W) · MATCH (no rule) · a label or heading
- W0913 (W) · MATCH · flex settings an admin's, all else everyone's — D121, D1014
- W0929 (W) · MATCH (no rule) · a label or heading
- W0931 (W) · MATCH (no rule) · a label or heading
- W1499 (W) · MATCH · an admin approves — D2239
- W1505 (W) · MATCH · suspended, an admin enables — D280
- W1507 (W) · MATCH · no Sign up; he asks the admins — D293
- W1514 (W) · MATCH (no rule) · a label or heading
- W1515 (W) · MATCH (no rule) · a label or heading
- W1516 (W) · MATCH (no rule) · a label or heading
- W1517 (W) · MATCH · generic failed save — D1667
- W1518 (W) · MATCH (no rule) · a label or heading
- W1519 (W) · MATCH (no rule) · a label or heading
- W1520 (W) · MATCH (no rule) · a label or heading
- W1521 (W) · MATCH (no rule) · a label or heading
- W1522 (W) · MATCH (no rule) · a label or heading
- W1523 (W) · MATCH (no rule) · a label or heading
- W1524 (W) · MATCH (no rule) · a label or heading
- W1525 (W) · MATCH (no rule) · a label or heading
- W1526 (W) · MATCH (no rule) · a label or heading
- W1527 (W) · MATCH (no rule) · a label or heading
- W1528 (W) · dropped · section order help — slice 10
- W1529 (W) · MATCH (no rule) · a label or heading
- W1530 (W) · MATCH (no rule) · a label or heading
- W1531 (W) · dropped · wave order help — slice 10
- W1532 (W) · dropped · slice 10
- W1533 (W) · MATCH (no rule) · a label or heading
- W1534 (W) · MATCH · "Admin tools are for schedulers" — a scheduler is always an admin (D785)
- W1535 (W) · MATCH (no rule) · a label or heading
- W1536 (W) · MATCH (no rule) · a label or heading
- W1537 (W) · MATCH (no rule) · a label or heading
- W1538 (W) · MATCH (no rule) · a label or heading
- W1539 (W) · MATCH (no rule) · a label or heading
- W1540 (W) · dropped · template help — slice 10
- W1541 (W) · MATCH (no rule) · a label or heading
- W1542 (W) · dropped · slice 10
- W1543 (W) · MATCH (no rule) · a label or heading
- W1544 (W) · dropped · slice 10
- W1545 (W) · MATCH (no rule) · a label or heading
- W1546 (W) · MATCH (no rule) · a label or heading
- W1547 (W) · MATCH (no rule) · a label or heading
- W1548 (W) · dropped · clutter help — slice 10
- W1549 (W) · MATCH (no rule) · a label or heading
- W1550 (W) · MATCH · stays until the database step — D1752
- W1551 (W) · MATCH (no rule) · a label or heading
- W1552 (W) · MATCH · D1752
- W1592 (W) · MATCH (no rule) · a label or heading
- W1594 (W) · dropped · board empty state — slice 4
- W1829 (W) · MATCH (no rule) · a label or heading
- W1831 (W) · MATCH · the member view switch — D292
- W1832 (W) · MATCH · D292
- W2014 (W) · dropped · scheduler-only note — slice 2
- W2015 (W) · dropped · slice 2
- W2016 (W) · dropped · slice 2
- W2103 (W) · dropped · view empty state — slice 4
- W2164 (W) · MATCH · his words, opened "Blocked:" per D1667 — D2240, D2261 (see O4 for the ✕ door)
- W2189 (W) · MATCH · no access, no filing — D2239
- W2205 (W) · MATCH · switch off told to the filer — D731 (8)
- W2206 (W) · MATCH · D755 (3)
- W2207 (W) · MATCH · a shared input: its filer or an admin — D655, D755
- W2214 (W) · MISMATCH · M1 — omits the filer (D655)
- W2328 (W) · MATCH · the members' switch — D654
- W2354 (W) · MATCH (no rule) · a label or heading
- W2392 (W) · MISMATCH · M1 — omits the filer (D655)
- W2436 (W) · dropped · stores list — slice 4
- W2475 (W) · dropped · note on view-only — slice 2
- W2497 (W) · MATCH · the members' switch on Logic — D654
- W2562 (W) · MATCH · Logic an admin's — PERMS setting
- W2586 (W) · MATCH (no rule) · a label or heading
- W2587 (W) · label (TALON stays)
- W2588 (W) · MATCH (no rule) · a label or heading
- W2589 (W) · MATCH (no rule) · a label or heading
- W2590 (W) · MATCH (no rule) · a label or heading
- W2591 (W) · MATCH (no rule) · a label or heading
- W2592 (W) · MATCH (no rule) · a label or heading
- W2593 (W) · MATCH (no rule) · a label or heading
- W2594 (W) · MATCH (no rule) · a label or heading
- W2595 (W) · MATCH (no rule) · a label or heading
- W2596 (W) · MATCH (no rule) · a label or heading
- W2597 (W) · MATCH (no rule) · a label or heading
- W2598 (W) · MATCH (no rule) · a label or heading
- W2599 (W) · dropped · prototype note on the sign-in card — slice 10 (production words rule)
- W2809 (W) · not a string a person reads (variable)
- W2824 (W) · MATCH · quals columns an admin's — PERMS qualification
- W2832 (W) · MATCH · new person on Admin → Users — D310, D322
- W2990 (W) · MATCH (no rule) · a label or heading
- W3008 (W) · MATCH (no rule) · a label or heading
- W3009 (W) · not a string a person reads (comment fragment)
- W3010 (W) · MATCH · D292
- W3011 (W) · MATCH · D292
- W3058 (W) · not a string a person reads
- W3060 (W) · label (field name, D219)
- W3062 (W) · MATCH (no rule) · a label or heading
- W3063 (W) · MATCH (description) · member role — D166, D149
- W3064 (W) · MATCH (description) · admin role — D166
- W3077 (W) · MATCH · never his own account — D322
- W3078 (W) · MATCH (no rule) · a label or heading
- W3081 (W) · MATCH · archived callsign: restore first — D295, D322
- W3084 (W) · MATCH · Give access / Refuse — D322
- W3086 (W) · MATCH (no rule) · a label or heading
- W3090 (W) · MATCH · what Delete takes — D299, D297
- W3092 (W) · MATCH · own row not opened (one-door drawing: "Your own row can't be opened") — D322
- W3093 (W) · MATCH (no rule) · a label or heading
- W3096 (W) · MATCH · Give sign-in on his row — D322
- W3102 (W) · MATCH (no rule) · a label or heading
- W3105 (W) · MATCH (no rule) · a label or heading
- W3109 (W) · MATCH (no rule) · a label or heading
- W3110 (W) · MATCH · post-in date counts him on the war — D308
- GD007 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD008 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD009 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD021 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD022 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD028 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD029 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD030 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD031 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD032 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD033 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD034 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD036 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD037 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD038 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD039 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GD040 (GD) · MATCH · a question/drawing page; its answers are recorded rulings (D2190, D2185, D2217, D2225, D2240–D2243, D2246–D2250, D2261–D2265); guest parts superseded by D2239 — not re-opened picture by picture
- GN002 (GN) · dropped · app speed — slice 10 / how-we-work
- GN005 (GN) · dropped · SANS availability run — slice 5
- GN006 (GN) · dropped · SANS calendar words — slice 5
- GN016 (GN) · MATCH · line restates D166/D292 (war follows the signed-in callsign) and the posting outcomes (D2136…) — read, not opened row by row
- GN018 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN019 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN020 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN021 (GN) · MATCH (open question already on record) · database split by type, put to him with a recommendation; not a who-may rule
- GN022 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN023 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN024 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN025 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN026 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN027 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN028 (GN) · MATCH · "his to switch on" (D2198 reading) — the switch was drawn and approved, "the master's Show 142 149 bell buttons" (D2217)
- GN029 (GN) · MATCH · ruled, not built — D2200
- GN030 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN031 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN032 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN033 (GN) · MATCH · built: masterChangeProblem refuses a non-master (state/accounts.ts); the held sign-in not built — D2205
- GN034 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN035 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN036 (GN) · MATCH · the Plan audit (D2242) was run — [MSQ-PLAN-AUDIT]
- GN037 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN038 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN048 (GN) · dropped · active-pool date — slice 5 / 4
- GN050 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN052 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN053 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN054 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN055 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN056 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN057 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN058 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN059 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN060 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN061 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN062 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN063 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN064 (GN) · MATCH · reading "a place one squadron alone sits on stays its admins'" was drawn ("the greyed shared time zone") and approved (D2217); the shared-place restriction itself is not built yet (D2196 row; data-model §11 marked)
- GN066 (GN) · MATCH · his lean, design only — D2114, D2149
- GN067 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN069 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN070 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN072 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN073 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN074 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN075 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN076 (GN) · dropped · cross-squadron conflicts — slice 4
- GN077 (GN) · dropped · Tracker per squadron — slice 8
- GN080 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN081 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN082 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN086 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN087 (GN) · dropped · Logic per schedule — slice 4/1
- GN088 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN089 (GN) · dropped · ✕ Wave question — slice 4
- GN092 (GN) · dropped · detachment short-name box — slice 10
- GN093 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN095 (GN) · dropped · shared wave signing look — slice 2
- GN096 (GN) · dropped · shared wave amendment sentence — slice 2
- GN097 (GN) · dropped · + Wave when other has none — slice 4
- GN098 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN099 (GN) · dropped · crew list foot group — slice 4
- GN100 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN101 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN102 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN103 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN104 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN105 (GN) · dropped · OIL across two squadrons — slice 1
- GN107 (GN) · dropped · crew rest across places — slice 4
- GN108 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN109 (GN) · MATCH · ruled, not built (or built since under a stale "not built" heading); the line restates its cited rulings — read, rows not opened one by one
- GN111 (GN) · MATCH · his lean, design only — D2097
- GN114 (GN) · MATCH · day lock simple mark — D1751, D2212 (slice 2 owns the detail)
- GN115 (GN) · MATCH · one editor per day — D2212
- GN118 (GN) · OPEN READING · O2 — "Take over anyway" without the holder's answer (D2212 row: the agent's reading)
- GN120 (GN) · dropped · sign-in opens today — slice 2/4
- GN121 (GN) · dropped · single-seat lines — slice 4
- GN124 (GN) · dropped · Admin Display — slice 10
- GS039 (GS) · MATCH · plan/spec of a still-open item; its permission rules read through the rulings it cites (D165–D224, D2087–D2270) — not re-read in full
- GS069 (GS) · MATCH · plan/spec of a still-open item; its permission rules read through the rulings it cites (D165–D224, D2087–D2270) — not re-read in full
- GS074 (GS) · MATCH · plan/spec of a still-open item; its permission rules read through the rulings it cites (D165–D224, D2087–D2270) — not re-read in full
- GS075 (GS) · MATCH · plan/spec of a still-open item; its permission rules read through the rulings it cites (D165–D224, D2087–D2270) — not re-read in full
- GS089 (GS) · MATCH · plan/spec of a still-open item; its permission rules read through the rulings it cites (D165–D224, D2087–D2270) — not re-read in full
- GS102 (GS) · MATCH · plan/spec of a still-open item; its permission rules read through the rulings it cites (D165–D224, D2087–D2270) — not re-read in full
- GS114 (GS) · MATCH · plan/spec of a still-open item; its permission rules read through the rulings it cites (D165–D224, D2087–D2270) — not re-read in full
- GS115 (GS) · MATCH · plan/spec of a still-open item; its permission rules read through the rulings it cites (D165–D224, D2087–D2270) — not re-read in full
- GS116 (GS) · MATCH · plan/spec of a still-open item; its permission rules read through the rulings it cites (D165–D224, D2087–D2270) — not re-read in full

**Closing count:** 363 listed items + 3 added + 5 questions; 363 checked or dropped with a reason; 0 left.
