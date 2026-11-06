# Evidence — "Undo post out" takes the posting's bell lines back, struck through; the SANS purple line ([NOTICE-UNDO-RETRACT] step 1, [PO-SANS-PUCK-EDGE]), 5 Nov 26

Branch `claude/postout-bell-look` (pull request 641), the build at 248a13bf5 with its fixes aeedfbd77 and 3a181dbd8. Rulings:
D1693, D1696, D1697, D1698, D1699 (and D1216, D283, D287, D299, D350 that bound them). Drawing of record
`docs/mock/2026-11-05-taken-back-sans/` (pictures 2, 4 and 8; his answers on the page https://claude.ai/artifact/QtJDmvCdv4QNRcqKhwLW7G).
The walk's pictures: `docs/img/handpass/2026-11-05-taken-back-sans/` (its log `walk-log.json` beside them). The drawing check:
`docs/img/handpass/2026-11-05-drawcheck-taken-back-sans/`. The scenario design: `docs/handpass/parts/tb1105/scenarios.md`. The
reads: `docs/handpass/parts/tb1105/`.

## 1. The eight questions and the tier
Money NO (no OIL, leave or count changes) · the published record NO · **saved data YES** (a new stored bell line kind, `poback`;
stored lines removed by a command) · a shared drawer YES (the grid's one name drawer, `NamePuck`, for the row and the phone's frozen
copy; the bell's one list) · a new gesture NO (Undo post out is an existing button; the taken-back line's tap is the posting line's)
· a new surface NO · **roles YES** (`lw.postout` may now delete bell lines — `perms.ts`; the gate's war-line kinds gain `poback`)
· the warning list NO. **Tier: FULL**, with a security read (D1411). The server question is carried by `perms.test.ts` and
`perms-scan.test.ts` (green); the §11 row touched: the Notice table's delete under `lw.postout`.

## 2. The roll-call
**Every place that draws a man's name with the SANS mark** (D1697, D1698):
| Place | Has the line | Seen and operated |
|---|---|---|
| The Leave War grid's row (`NamePuck`, `MatrixRows.tsx`) | YES — a man posted out as SANS from when it is set, and every SANS man | S1a, S2b, S19b (every kind), S19e (his own ringed row), S19f ("+ SANS" on) |
| The phone's frozen copy of the row (the same `NamePuck`, `Matrix.tsx`) | YES — the one drawer | S1a, S19b (phone: row + frozen) |
| The grid zoomed out at 1536; at 2560 wide | YES | S19g, S19h |
| A long callsign faded on the phone | YES, the line over the fade's end | S19b (Wildcard, Sidewinder "faded", purple pixels counted), `s19d-long-name-close` |
| The chip under the line (its last 4px) | the chip's tap still opens the quals list | S20 (phone, a tap 2px from the chip's edge) |
| Balances, Approvals (and "also" lines), the day panel — the schedule's own puck (`sync.ts puckHtml`) | the line only once he IS SANS (D651's puck) — before his date the grid has it and these do not | S1e (before: no line), S19i (after the run: line) — **shown to him side by side** (§9, Q2) |
| The OIL tracker's name list | MUST NOT, because D1698 covers the grid; it keeps its own badge | S19j, pictured |
| The person window header, the bid and posting sheets, the selection sheet | MUST NOT — plain words, no puck | code roll-call |
| A man posted out to Overseas Sqn | MUST NOT | S19c |
| Ground crew posted out as SANS | before his date YES (S19b-torque); after it NO — the war's copy of a ground-crew man carries no SANS mark | **MISSING — filed as a question (Q1)** |
| The "SANS" tag | MUST NOT anywhere | S19a, S1a |

**Every place that draws or reads a bell line about a posting** (D1693, D1699):
| Place | Behaviour | Seen and operated |
|---|---|---|
| The bell's list, desktop and phone (`ui/topbits.tsx BellList`) | the struck words, then "taken back · Saber", unread, wrapping | S2e–S2h (pixels), S4, S5, S6, S11, S13, S14 |
| The bell lit | YES | S2e |
| The admin who pressed Undo | MUST NOT be told | S2d, S5 |
| An admin who had not read it | his line simply goes | S3 |
| A tap on the taken-back line (`postOf`) | Admin → Users at his row, ringed | S7 from six pages, desktop; two on the phone |
| The member view (D292) | MUST NOT list it | S8 |
| A reload | kept | S9b |
| The top bar's Undo / Redo | no posting step (D350) — greyed | S9 |
| The changes window | the posting is not a schedule change; nothing listed | S18 (recorded) |
| The war's own taken-back lines ("~~LL approved~~ · taken back · Saber") | the same look | unit tests (S21: one browser cannot reach them — the Undo list clears at sign-out) |
| Restore on Admin → Users | MUST NOT take a line back | S16 |
| The gate (`WAR_LINE_KINDS`), the notice kinds' branches (`noticeLive`, `postOf`, `isWarNotice`) | `poback` handled in each; no gap | code roll-call; `postout-takeback.test.ts` |

## 3. The sizing step (§7.0)
1. **Type of change:** G (saved data — a stored line kind, lines removed inside a command), D (a mark drawn by one drawer in two
   places of the grid, and the schedule's puck elsewhere), H (who may delete a bell line).
2. **What only a walk could find here:** the strike as DRAWN on both engines (lesson 22); the line wrapping on the phone; the line
   on every kind of puck, faded names, zoom, the frozen copy, the chip's tap under the line; the Undo's door in each posting state
   (before, after, archived, moved, deleted); orders across admins and sign-ins; two tabs.
3. **The ledger:** stored-data and posting walks on this branch found order and door faults the tests passed (the morning's walk:
   the ring's timer, the run's order, midnight).
4. **The walk chosen:** the host alone, one assertion script, `scripts/handpass/tbw-walk.mjs`, 1536 × 864 Chromium and 402 × 874
   WebKit touch (a picture right after each deciding tap); the designer's 21 scenarios — 19 driven (S1–S20 but S21), the repeated
   per-kind cases each driven once; S21 carried by `ui/halfampm.test.tsx` and `m4bell.test.ts`. The drawing check (§7.10) beside
   it, green (§7).
5. **After the walk:** its row is in `docs/walk-ledger.md`.

## 4. Orders walked (what the screen said)
`tbw-walk.mjs`, both sizes. Posted before the date, closed by ✕ / Escape / a press outside, undone before the date — nobody told
(S1) · posted, run, read by a tap → Undo by Saber → Hex: one struck unread line, Saber nothing (S2) · not read → nothing (S3) · read
by Mark all read (S4) · roles swapped (S5) · Overseas Sqn, off the manpower, Delete (S6 — Ranger signs in again after) · Undo
pressed twice quickly on the phone → one line (S10) · undone, posted again (it runs at once), read, undone again → two struck lines
(S11) · off the manpower undone then set again → unread (S12) · the date moved after the run, then Undo → no posting line left
(S13) · the outcome changed after the run, then Undo (S14) · undone 16 days after its date (S15, recorded) · Restore keeps the line
(S16) · two tabs (S17) · the changes window (S18) · every kind of SANS man (S19) · the chip under the line (S20).

**The re-walk** (the same script, the fixed build at b54345ecd, its own folder `rewalk/`, run whole because the fixes sit in the one Undo command every scenario goes through): 97 checks passed, 0 failed, 17 recorded, no page or console error — with S12b (the presser sees a re-set line lit), S19k (no SANS chip for ground crew, both sizes) and S19b-sr (the screen-reader word, kept off the screen) added. The drawing check after the fixes: GREEN, the same two kept states (`docs/img/handpass/2026-11-05-drawcheck-taken-back-sans/after-fixes/`). The later fixes of the fixes' read (an admin whose sign-in is suspended; the command landed) change no screen route — carried by `postout-takeback.test.ts`. Seen, not a fault: the test WebKit on Windows draws the Balances page's `system-ui` names in a serif face (it has no system font; his iPhone has).

## 5. Carried by a test
`src/leavewar/postout-takeback.test.ts` (11): read → struck line; unread → gone; the presser never told; derived "off the manpower"
read → struck; Restore keeps it; an earlier stint's line kept; the scenario designer's 12 and 13 (red before aeedfbd77) ·
`ui/halfampm.test.tsx`, `m4bell.test.ts`: the war's own taken-back lines struck (S21) · `ui/namepuck.test.tsx`: the `san` class for
a SANS man and a man posted out as SANS, none for others · `perms.test.ts`, `perms-scan.test.ts`: the §11 table.

## 6. Break tests
17 breaks, each line restored byte for byte after its run: 14 RED at once. The three that stayed green, read (walk-scripts §9): the member view's hiding of a taken-back line — no test (1): written (`postout-takeback.test.ts`, the member view), now RED; the presser's own read line — a second layer holds it (4): `noticePostingBack` never sends a line to the man who pressed Undo; the gate's war-line list for `poback` — a second layer behind the gate's own "not his own change's notice" refusal, which the forged-member test pins (4). And one left green on purpose: lines taken back when a posting is only moved — that is his Q4. The drag window's missing SANS chip: RED with the fix removed (`po.test.tsx`).

## 7. The drawing check (§7.10) — `scripts/drawcheck/specs/taken-back-sans.mjs`
Records replay identical; the build GREEN (`docs/img/handpass/2026-11-05-drawcheck-taken-back-sans/`); the bell's own "Mark all
read" foot kept as a drawing state.

## 8. What the checks found, and each disposition
| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | scenario designer 12 | an off-the-manpower posting set again after a taken-back line came back already read | fixed red-first, aeedfbd77 |
| 2 | scenario designer 13 | a ran posting's moved date left its old line after Undo | fixed red-first, aeedfbd77; walked S13 |
| 3 | GitHub's run on 248a13bf5 | three untyped lines (the Leave War's strict-typing guard) | fixed, 3a181dbd8; run green |
| 4 | walk S19f | ground crew posted out as SANS lose the line at their date (the war's copy of ground crew carries no SANS mark — older code this change made visible) | put to him; **his answer D1709, "No SANS for ground crew"** — built red-first: no SANS chip for him on any posting door, the writer refuses it; walked S19k |
| 5 | walk S15 | off the manpower undone more than 14 days on: its line has already left the bell by itself (D1696), so nothing is taken back — the stored outcomes would get a taken-back line | consistent with D1696 — **put to him as a note (Q3)**, nothing to build |
| 6 | security read S1 (low, new) | a "taken back" line stored for a man who read his line as an admin and is a member since (hidden by the bell, but a scheduler's line stored for a member) | fixed red-first: only to a man still an admin; his old line still goes (`postout-takeback.test.ts`) |
| 7 | code read 1 (medium, older) | a posting that ran, then given a later date or another outcome on its Post out sheet, keeps its "Posted out" line (`postOut` → `takeBack` with no take-back of lines); seen by the walk too (S13's log) | **put to him — Q4**; his answer **D1710** ("As recommended") — BUILT red-first, §16 |
| 8 | code read 2 (low, new) | the admin who pressed Undo, having read the worked-out line, saw a posting set again for the same date already read | fixed red-first: his own read record forgets the lines his Undo took (`noticeseen.ts forgetRead`, his own `notices.seen` command); walked S12b |
| 9 | code read 3 (low, new) | a screen reader no longer heard "SANS" with the name (the line is drawing only) | fixed red-first: " SANS" kept for a screen reader, off the screen (`NamePuck.tsx`, `matrix.css .lw-sr`); walked S19b-sr |
| 10 | code read 4 (older) | the Undo pressed in a tab opened before the posting ran leaves its line (the tab's old copy) | **filed** with the two-tabs item [LW-NIGHT1025-OLDER] (b), the database step |
| 11 | the fixes' read 1 (low) | an admin whose sign-in is suspended was skipped (the admin set read sign-ins switched on) | fixed red-first: by role |
| 12 | the fixes' read 2 (low) | `takeBack` forgot the presser's lines without asking whether the command landed | fixed: only once it landed, as `restoreBody` |
| 13 | the fixes' read, info 3 | no test for the drag window's chips | written; RED with the fix removed |
| — | walk, first runs | the script's own: a page tab order, a loose name match, a 4px width read at the phone's zoom, the hidden copy measured, the moved posting's sheet reached by the wrong day, a deleted man's row (kept, D299) | the script corrected; none in the app |

## 9. For his look
Q1 — answered, D1709 · Q2 — Balances / Approvals show the line only from his date
(pictures `s1e-*` beside `s19i-*`) · Q3 — the late Undo of an off-the-manpower posting (S15) · Q4 — a posting changed after it ran (code read 1; picture `s13a-after-move-sheet`).

## 10. §7.11's lessons
The designer's table (`parts/tb1105/scenarios.md` §C) — each walked as mapped: 1 (S2–S4, S8, S9, S11–S15), 3 (S2 the bell lit, S10),
5 (S7 the row uncovered), 8 (the drawing check), 9 (S19 every kind, measured), 10 (S7-back), 11 (S19g/h), 12 (S7 from six pages),
13/15 (S19g zoom — no pinned bar or fill changed), 19 (S1b), 22 (S2g, S19b by pixels). **23** (every pictured screen checked for
the standing layout lessons): the bell's line wraps, nothing side by side changed; Admin → Users' pairs carried by
`adm-pairs-measure.mjs` (12/12 on this branch). Not applicable: 2, 6, 7, 14, 16, 18, 20, 21.

## 11. Not walked, and why
The Scheduler Board's bell (the same list and tap body); a pinch part-way down on the phone (the change adds a mark inside the puck
and touches no pinned bar, fill or zoom code — zoom carried by S19g/h); the Rearrange drag picture (the drag image is drawn from the
row by the same `NamePuck` — carried by S19b's frozen copy); a member's own taken-back war line in one browser (S21 — tests).

## 12. Gates
On his PC after the last fix: the build; the Leave War project 235 files, 4182 passed; the bell and permission files 174/174; the code check no new finding; docsize OK. The full set: GitHub's run of the pull request on the last pushed commit (D1086).

## 13. The reads
A fresh blind Opus code read (`parts/tb1105/read-code.md`): 1 medium, 3 low — dispositions 7–10 in §8; its explicit negatives cover every other path that changes or reads a posting's line. A fresh security read (D1411, `parts/tb1105/read-security.md`): 1 low (§8 #6); only an admin can run `lw.postout` (page, write path and gate agree); Notice delete on `lw.postout` gives an admin no power he did not hold; a member can neither write nor read a `poback` line. Lesson 89 read by a fresh reader against his words: one phrase went past them ("never a faded line") — corrected. The fixes' own narrow read: §14.

## 14. The fixes' narrow read — `parts/tb1105/read-fixes.md`
A fresh Opus reader handed only the fix commit (b54345ecd) and the findings it answers: all four fixes right, their twin paths covered; 2 low and 1 info — §8 #11–13, all fixed. This round's own fixes are a few lines each (an admin set by role, a landed check), each with a test that was red; no further read.

## 15. The walk line
Walk: docs/handpass/2026-11-05-taken-back-sans.md · 78 + 80 pictures (walk, re-walk) + 14 for his look · 13 surfaces · 21 orders · MISSING: 1 ruled (D1709, built)

## 16. [PO-CHANGE-RETRACT] — his D1710 built (5 Nov 26, after his look page's answers)
**What:** a posting out that has run and is then changed on its Post out sheet — another date, either way, or another outcome
— takes back its bell lines inside the posting's own command, as the sheet's Undo does: a read line struck through, "taken back ·
Saber", unread; an unread one goes; the admin who changed it told nothing; the changed posting runs, and tells, again on its date.
A date moved EARLIER counts too (the agent's reading, agreed by the fresh reader: the store already clears the "has run" mark on
any date change, so the bell would otherwise hold two lines for two dates). `leavewar/sync.ts postOut`.
**Tier:** FULL (saved data — stored bell lines removed), sized small by Opus: the unit tests red-first, three break tests, a
re-walk of the stages that change or undo a ran posting, a fresh read of the fix, a narrow read of the read's fixes.
**Tests (`postout-takeback.test.ts`):** five cases for D1710 (date moved later; SANS → none, unread; Overseas → SANS, read, the new
outcome running and telling; off the manpower moved; saved unchanged and a posting not yet run touch no bell) — four red before
the fix. Breaks, each restored after its run: the take-back switched off (4 red); the outcome left out of "changed" (2 red);
taken back on every save (1 red).
**The fresh read (`parts/tb1105/read-pcr.md`):** 1 medium, 2 low — all fixed red-first (six more cases, four red, two pinning
what the reader saw hold: a change already due run in the same one command, the new line unread; the changer's own
"off the manpower" line unread):
| # | What | Disposition |
|---|---|---|
| R1 (medium, new) | moving a posting not yet run took back an EARLIER posting's line when he was restored on that posting's own day (a Restore then reopens the same stint, with no boundary) | fixed: `postingLinesOf` takes only the lines THIS posting wrote when it ran — once it has run, of its date and outcome — instead of every line of the stint. The reader proposed a new saved list of run dates; not needed, nothing new is saved |
| R2 (low, older — Undo had it) | the same reopened stint: an Undo or a change of the next posting took back the first one's line too | fixed by the same change |
| R3 (low, older) | with "+ SANS" on, a ran SANS posting saved again unchanged ran again and told every admin twice (the store read "has it run" from the man as the grid shows him) | fixed: `store.ts setPostOut` reads it from the saved posting |
**Re-walks (frozen builds, desk 1536):** `rewalk2/` — S13 and S14 with new checks right after the change (S13m, S14m): 5/5;
`rewalk3/` — on the build with the read's fixes, every stage that changes or undoes a ran posting (S2–S6, S11, S12, S12b, S13–S16):
35/35, S15 recorded as before (his Q3 note). Pictures opened by the host: Hex's bell after the move — only the struck "taken back ·
Saber" line, unread; Saber's after the move — nothing; Saber's after SANS → Overseas — the new "archived, account suspended" line;
S11's two runs undone — two struck lines.
**Narrow read of the fix round (35bc38195 — `parts/tb1105/read-pcr-fixes.md`):** 2 low, both older, fixed red-first:
| # | What | Disposition |
|---|---|---|
| N1 (low, older) | restored on a posting's own day, then posted again for the SAME date and outcome: an Undo or change of the second took both runs' lines | fixed: `postingLinesOf` keeps the newest run's lines (one run stamps every admin's line with one moment); for the shared database, filed under [DB-STEP] |
| N2 (low, older) | with "+ SANS" on, a post-in set on a man whose SANS posting has run wiped the posting from the record — Admin → Users lost "posted out 16 Nov · SANS", and it could never be undone (reproduced on screen on the old build, walk S22) | fixed: `store.ts setPostIn` and `postingProblem` read the saved posting; new walk stage S22 presses the door: FAILED on the old build, PASSES now |
**The third read (c38a3d271 — `parts/tb1105/read-pcr-fixes2.md`): 0 findings** — the last round (the order's cap of about three).
`rewalk4/` — the build with every fix: S2–S16 34/34 (S15 recorded) and S22; S22's first run on it expected Undo with "+ SANS" still
on, where the app (D283) draws no posting day — the script's premise, corrected: "+ SANS" switched off by its ✕ first, as an
admin would; then PASS. Pictures opened by the host: Ranger's Admin → Users row after the post-in, "POSTED OUT 16 NOV · SANS" kept.
**Gates on his PC (first round):** the Leave War project 235 files / 4194 passed; the code check no new finding; the build.
The full set: GitHub's run on the last pushed commit (D1086).
**Gates on his PC, last:** after every fix the Leave War project 235 files / 4196 passed; the code check no new finding; the build after merging `main`.
**Walk (this part):** docs/handpass/2026-11-05-taken-back-sans.md §16 · 6 + 31 + 33 pictures (rewalk2, rewalk3, rewalk4) · 3 surfaces (the bell, the Leave War's posting and post-in sheets, Admin → Users) · 14 orders · MISSING: none
