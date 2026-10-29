# Evidence sheet — the Leave War's small fixes (30 Oct 26)

**The change:** four backlog items of the Leave War, one batch (D485, D1087) — `[LW-DELETED-NO-ROW-APPROVE]`,
`[LW-HALF-DAY-WORDS-LEFT]`, `[LW-M1-READ-LEFTOVERS]` (2), `[LW-MONTH-MEMO-UNPINNED]`. Branch `claude/lw-small-fixes-1030`, cut
from `main` at 9e9ee8e44. Scenario design (an independent designer, 33 scenarios):
`docs/superpowers/briefs/2026-10-30-lw-small-fixes-scenarios.md`. Built and walked on the night of 29–30 Oct 26 (unattended — D596).

1. **A deleted man's leftover pending bid is never approved.** `sync.ts approveWhy` reads the app's own delete mark
   (`deletedMan` — the war's `gone`, or `PEOPLE[id].deleted`), so a man deleted before he ever arrived — no row and no posting
   record on the war — is refused "Posted out — refuse or delete it" (D1447 R21's words) at every door; a Delete POSTING
   that has run keeps D1436's date rule (R3c-1). **Found while walking it and fixed with it:** Undo and Redo replayed such an
   approval — `state/person-delete.ts deletedRestoreProblem` now refuses a restore that takes a request of a deleted man off
   the war and writes the leave the war approved for it.
2. **What is printed for a credited OIL or a half day reads as its box.** The clash note (desktop line and phone list) and
   the "OIL the app credited" sheet's title print "FO*", "HO* (morning)", "LL (afternoon)" through one helper
   (`engine/codes.ts codeInWords`); the stored grammar (`sync.ts notationOf`) is untouched. The item's part (2) — the bid
   window on a morning box lights AM (D1331) — was already built by round 3: confirmed on screen.
3. **"This replaces … bid" said only once a filing lands** — built on `main` 23 Oct 26 (M3's folded items); walked at its
   doors here (verify only — no line changed).
4. **The month's memo compares what its cells read.** The joined bar (D1359) reads neighbours two days either side, across a
   month's edge, and each bid's run key; the month now compares the man's views and war records over its days and two each
   side, and the bar reads the records from a prop (`MatrixRows.tsx`, `Matrix.tsx`).

**Tier: FULL** — §5's questions: 1 money/OIL — yes (an approval writes a leave input, which moves the LVE figures; the
clash note names OIL credits); 2 published record — no (nothing of a publish changes; the walk publishes a day only as a
fixture); **3 saved data — YES** (an approval writes a leave input; Undo / Redo restores refused); 4 shared drawer — yes (the
grid's month blocks); 5 new control — no; 6 new surface — no; 7 roles — no new rule (`perms.ts` untouched; the refusal is a
war rule, as R3-6's was; `perms.test.ts` / `perms-scan.test.ts` run in GitHub's full set); 8 warnings — no.

## Questions waiting for him

None is blocking; nothing of the build waits on them. Each is filed in the backlog and put to him when he says so (D994).

| # | The question, in the app's words | Recommended | Picture (the place) | What waits |
|---|---|---|---|---|
| Q1 | A man deleted on Admin → Users before he ever arrived: his leftover line on Approvals reads "Posted out — refuse or delete it", but he has no row on the grid, so there is no box to delete — only Refuse. Keep the words? | Keep them — they are your ruled words (D1447 R21), and Refuse stands beside them on the line | `docs/img/handpass/2026-10-30-lw-small-fixes/after/s1-desk/s1-1-c-approve-pressed.png` (his line at the foot), phone: `after/s1-phone/s1-1-c-approve-pressed.png` | nothing — `[LW-DELETED-NOROW-WORDS]` |
| Q2 | The "OIL the app credited" window's title reads "FO* · approved". Nobody approves an OIL credit (the code's own comment: "only leave is approved"). Keep "· approved" there? | Your call — the agent's reading: drop "· approved" for an OIL credit, keep it for leave | `after/s2-desk/s2-4-b-sheet.png`, phone `after/s2-phone/s2-4-b-sheet.png` (the title line) | nothing — put with `[LW-HALF-WORDS-ELSEWHERE]` |
| Q3 | More places still print a half day or a credited OIL the old way — the day's list's lines ("your <LL bid was replaced by …", "<LL (morning)", a credited HO with no star), a member's approved-leave window ("<LL"), the bell ("LL approved", the half not said). Print each as the clash note now does? | Yes, each as the clash note — the bid window's own leave buttons ("<LL" with AM picked) staying, by D1331 | to be taken when it is put to him (D853) | nothing — `[LW-HALF-WORDS-ELSEWHERE]` |

## 1. The rules sweep

D1447 (R20 the one date rule; R21 a man deleted on Admin → Users keeps the refusal — the full row read) · D1436 (a man's leave
refused from his posting-out date; Refuse still works) · D283, D323 (SANS and archive postings keep the date rule) · D290,
D297, D299, D321 (a deleted man kept underneath; the past keeps his record; leave or OIL may still be added on his past days)
· D350 (a delete is not an Undo step) · D1263, D148 (what Undo / Redo may put back) · D1421, D1428, D1431 (Approvals' lit
buttons, Approve all armed) · D1215, D1221 (SANS off the war) · D1211 (an admin may bid a past day) · D1306 (a credited
FO / HO keeps its star after its code) · D1160, D1246, D1402 (a half day by its box's half; the Legend teaches it) · D1331,
D1330 (the bid window opens on its half; a second tap sends back) · D827, D837 (the clash note's words — kept but for the
codes) · D80 (an award never clashes with leave) · D1359, D1346 (the joined bar; next-door bids of one remark act as one) ·
D1142, D1216 (the bell) · `docs/performance.md` §E (the month memo). **No ruling contradicted.** D1447 R21 is read as
covering Undo / Redo ("in every door" — R3-6's words on its own row); the one reading of the agent's (S1-7): with
Auto-approve on, leave placed on a deleted man's past day lands as a pending bid (D321 lets it be placed; R21 keeps it
from being approved) — as on `main`.

## 2. The roll-call

**Fix 1 — every door that approves a war bid** (the designer's §1a, marked here):

| Door | Never-arrived man, deleted | Man deleted after arriving | Delete posting run | Delete posting set, then deleted | SANS man, SANS off | Ordinary man |
|---|---|---|---|---|---|---|
| Approvals' Approve | HAS IT — refused, the words (S1-1, walked both sizes) | HAS IT — refused (walked S1-7's door via the bid window; unit R3-6) | HAS IT — the date rule (S1-2 walked) | HAS IT — refused whole (S1-3 walked) | HAS IT — approves (S1-4 walked) | HAS IT — approves |
| Approve all | HAS IT — his line refused, the rest approved, one Undo (S1-5 walked) | as row 1 (same writer, `decideRequests`) | as row 1 | as row 1 | approves (unit) | approves |
| Refused → Approve (D1428) | HAS IT — the same writer, `decideRequests` (unit) | same | same | same | same | same |
| The bid window's Approve | MUST NOT be reachable — he has no row (checked: no cell drawn) | HAS IT — refused (S1-7 walked) | HAS IT — `setBidStates` → `doorApprove` → `approveWhy` (unit R3c-1) | same door (unit) | not drawn (SANS off — no row) | approves |
| Auto-approve place-and-approve | not reachable (no row) | HAS IT — lands pending, the reason said (S1-7 RECORDED; unit R2-4) | — | — | not drawn | approves |
| The day's list's Approve | not reachable | HAS IT — `decideRequestById` → the same door (unit, m4decide R3-6) | unit | unit | not drawn | approves |
| The drag window over several men | not reachable | HAS IT — refused with his name, the other man approved (S1-7 walked) | unit (R3-4) | — | not drawn | approves |
| Undo / Redo re-approving | WAS MISSING — fixed (S1-6 walked, unit) | same restore check (`deletedRestoreProblem`, any deleted man) | n/a — the posting deletes; a run posting's restores are the date rule's | same check | — | unaffected (unit: a Redo for a man not deleted) |
| A posting's own pass | MUST NOT approve — it only removes and marks (unchanged) | — | — | — | — | — |

Readers that must agree: the Approvals tab's count (his line counted until refused — S1-1: 14 → 14, then out once Refused);
the line's name (his callsign, from the war's label — "NEWBY"); a new man given his callsign (S1-9 — told apart by the new
man's "posting in 3 Nov" tag; the rule reads the id).

**Fix 2 — every place a half-day credit or a half-day leave is printed** (the designer's §2a): the grid's box and second box
— HAS IT (unchanged, the reference); the clash note, desktop line and phone list (one `clashWhat`) — WAS MISSING, fixed
(walked both sizes); the "OIL the app credited" sheet's title — WAS MISSING, fixed (walked both sizes); the day's list's box
— HAS IT; the day's list's words, a member's approved-leave window, the bell — MISSING by the same standard, **filed, his to
rule** (Q3, `[LW-HALF-WORDS-ELSEWHERE]` — the designer's S2-8 says record, do not fix unasked); the bid window's leave buttons
"<LL" with AM picked — MUST NOT change, D1331's reading; the closed-day note — HAS IT ("morning"); Approvals' box — HAS IT
(box "LL", the line names "AM"); the Legend — HAS IT. **The stored grammar's writers** (`notationOf` — a send-back's code,
the bell's halves, Approvals' "Also since") — MUST NOT change: untouched (S2-9 walked, unit).

**Fix 3 — the doors that raise the note:** the Inputs page's input window, new leave — HAS IT (S3-3 walked); the same
window refused by the gate — HAS IT, nothing said (S3-1 walked); a member's filing refused by the commit (D763) — HAS IT
(`memberclash.test.ts`, the production door `writeInputs`); Undo / Redo of a filing — HAS IT, the note not said again (S3-5
walked); the war's own filings — MUST NOT say it, because they run in the door (S3-7 walked); the give-back sheet and Edit
Schedule's drag onto an Unavailable row — run through the same gate (`inputgate.ts apply`); not walked (§6).

**Fix 4 — what a month's cells read, and whether the memo compares it:** the person, the period, its days, the role, the
viewer, deciding, the event kinds, the closed days — by identity (unchanged; S4-4, S4-5 walked); his code and state on the
month's days — by content (unchanged); his day views **on the month's days and two days each side** — by content (NEW;
S4-1 walked, unit); **his war records on the same days** — by content (NEW; S4-2 walked, unit); the joined bar reads the
records from the prop, never from the store (NEW — a month's draw a function of its props).

**Painted on the same pixels:** fix 1's refusal on the Approvals line — beside the date, the buttons at their size, the
words wrapping whole on the phone (picture `after/s1-phone/s1-1-c-approve-pressed.png`); fix 2's longer codes in the clash
note — on one line on the desktop, the phone's list row two lines as drawn (D827) (`after/s2-phone/s2-1-b-clash-note.png`);
fix 4 — classes on the boxes already drawn, no element added.

**The door check:** no new control. Every walked action was pressed through its own control: Admin → Users' Add and Delete
(tapped twice), the post sheets' Delete (tapped twice), the bid window, the drag window, Approvals' Approve / Refuse /
Approve all (armed, then tapped), the top bar's Undo / Redo, the Inputs page's calendar, "+ Input" and its window, Edit
Schedule's board sign-offs and Publish day.

## 3. Sizing the walk (D607, `docs/walk-ledger.md`)

1. **Type:** G (decides and writes saved leave; Undo / Redo) leading; A (words a person reads — the clash note, a sheet's
   title); E (the grid's redraw — a performance guard whose fault is something drawn stale).
2. **What only a walk could find here:** whether the fixture for each fault can be reached through the app's own controls
   (a never-arrived man with a bid on a past day; a credited Saturday); the stale bar at a month's edge on the real
   whole-year grid, and that it heals on a redraw (the proof the memo was the cause); the refusal's words in their place on
   a phone (WebKit); the replace note at its real doors; the time one bid costs the built grid before and after.
3. **The ledger:** walks of Leave War decide and window changes (M4, the whole-leave window, M5b — types C, D, G, H) each
   found faults the tests had not met, most of them states and orders; a redraw (E) walk found the month strip's fault.
4. **The walk chosen:** the host alone (Low night — no helpers), seven assertion scripts (`scripts/handpass/lw-sf-*.mjs`),
   every fault reproduced on `main`'s build first (port 4391) and walked again on the fixed build (port 4392); desktop
   Chromium 1536 × 730 at 1.25 (his PC) for every scenario walked, phone WebKit 402 × 874 (his iPhone's engine) for S1-1,
   S2-1/4/6/9, S4-1/2; admin throughout, the member's view by D292's switch for S2-4 (changed in place — §7.7). 21 scenarios
   walked, 4 carried by tests, 1 recorded from the code, 7 set aside with reasons (§6).
5. **After the walk:** its row in the ledger — §11.

**§7.11's lessons, each against this change:** 1 a reading in one state — S2-6 (pending, approved, sent back), S1-1 (pending
→ refused → Refuse), S1-6 (approved → undone → deleted → redone); 2 a gesture at one speed — no new gesture; the drags are
the app's own (S4-1 on both engines); 3 feedback — S1-1 the refusal on its line, S3 every passing note recorded; 4 a press
behind an open window — cannot apply (no window changes what it opens over); 5 a box brought into sight — cannot apply
(nothing is scrolled into view by the change); 6 only the real phone draws it — cannot apply (nothing handed to the
phone); 7 a model of the phone — cannot apply; 8 an approved drawing — the clash note's phone drawing (D827) keeps its
layout, only its codes change (picture above); 9 alignment by eye — the Approvals line's refusal measured in place on both
sizes; 10 a page hidden and shown again — S1 goes Admin → Users and back to the Leave War between every step; 11 how much
fits — S4-1 on the whole-year desktop grid and the phone's rolling window; 12 a window from one page only — the refusal
from Approvals, the bid window and the drag window; 13 a pinch part-way down — cannot apply (no pinned part changes); 14
the keyboard list — no new box; 15 a pinned bar — cannot apply; 16 a warning cleared only by a change of value — S3-1 the
same refused filing made twice.

## 4. Gates

| Check | Where | Result |
|---|---|---|
| The new tests, red on `main`'s code first | his PC | `deletednorow.test.ts` 6 of 9 red; `halfwords.test.tsx` 7 of 9 red; `matrix-rows-memo.test.tsx` 4 of 9 red — then all green with the fixes |
| The Leave War unit project (the touched area, whole) | his PC, under the lock | 222 files, 3926 passed, 20 skipped, 0 failed (before the last three pins; those files re-run green: 10 / 13 / 11) |
| The delete and undo tests of the main project | his PC | `person-delete*.test.ts`, `p6d-deleteonread.test.ts`: 40 passed; `undo/timeline*.test.ts`, `undo-wire.test.ts`: 114 passed |
| Build (typecheck + bundle) | his PC, under the lock | green |
| The full set (the original's 728, unit, browser, the Tracker's, rules, documents) | GitHub's run of pull request 592 (D1086) | first run (06cc6dd25): every job green but one browser test — `e2e/leavewar.spec.ts` "on a tablet and a desktop the clash note stays the strip…", whose pattern pinned the old notation (`earns \*?[FH]O\*?`); brought to the new form, both clash tests re-run on his PC under the lock (lw-desktop and lw-phone: 2 passed, 2 skipped by size) — the re-run on GitHub: see the report |

## 5. The walk — every scenario against its EXPECTED

Pictures: `docs/img/handpass/2026-10-30-lw-small-fixes/` — `before/` (main's build), `after/` (the fixed build), by
scenario. Each script's own result list is the `.json` beside its pictures.

| # | Scenario | Before (main) | After | Pictures (after unless said) |
|---|---|---|---|---|
| S1-1 | Never-arrived man (NEWBY, post-in 3 Nov), pending LL on 27 Oct, deleted on Admin → Users | **FAIL — reproduced:** Approve lit "Approved", a leave input written for him | **PASS** desk + phone: refused "Posted out — refuse or delete it", no input, Refuse works; count 14 → 14 until refused. RECORDED: the line shows "NEWBY"; Refuse is the only way (Q1) | `before/s1-desk/s1-1-c-approve-pressed.png`; `s1-desk/s1-1-*`, `s1-phone/s1-1-*` |
| S1-2 | Delete posting that has run (Drifter, PO from 26 Oct; bids 22 and 28 Oct) | PASS | **PASS:** 22 Oct approves; 28 Oct "He posted out on 26 Oct: refuse or delete it". (The scenario's day ahead is not reachable: a delete takes his days from its cutoff, D299 — both bids put on past days) | `s1-desk/s1-2-*` |
| S1-3 | Delete posting set (14 Nov), then deleted on Admin → Users | PASS | **PASS:** both lines refused whole | `s1-desk/s1-3-approvals.png` |
| S1-4 | SANS man, SANS off | PASS | **PASS:** his row gone, his line approves | `s1-desk/s1-4-approvals.png` |
| S1-5 | Approve all over a mixed list (NEWBY's, Ranger's, the demo's 13) | (not run) | **PASS:** NEWBY's line refused with its words, the rest approved (war-approved leave 19 → 31), one Undo → 19 | `s1-desk/s1-5-*` |
| S1-6 | Undo / Redo putting an approval back for a man since deleted | **FAIL — found:** (a) Redo after his delete wrote his leave; (b) Undo of a send-back after his delete wrote it | **PASS:** (a) Redo greyed (the step can never be taken — a delete is final), no leave; (b) Undo refused "A later change touches the same thing and can't be undone.", no leave | `before/s1-desk/s1-6-*`, `s1-desk/s1-6-*` |
| S1-7 | Man deleted after arriving: bid window, drag window, Auto-approve | PASS | **PASS:** bid window "Nothing was decided. Posted out — refuse or delete it"; drag window over him and Ridge: Ridge approved, "1 not approved: Drifter: Posted out — refuse or delete it". RECORDED: Auto-approve on, a new LL on his past day lands pending, the reason said | `s1-desk/s1-7-*` |
| S1-8 | Archived; posted out as SANS | — | **Carried by tests** (§6) | — |
| S1-9 | His callsign given to a new man | PASS | **PASS:** the new NEWBY's line approves, the old stays refused; RECORDED: told apart by the new man's "posting in 3 Nov" tag | `s1-desk/s1-9-*`, `s1-phone/s1-9-*` |
| S2-1 | The clash note on a credited Saturday holding approved leave (plasma, 18 Jul published from Edit Schedule) | **FAIL — reproduced:** "earns FO" while the box reads "FO*" | **PASS** desk + phone: "Weekend/PH work earns FO*, but the day holds approved LL" — the line and the phone's list alike | `before/s2-desk/s2-1-b-clash-note.png`; `s2-desk/s2-1-*`, `s2-phone/s2-1-*` |
| S2-2 | The same, afternoon work | — | **Carried by test** (`halfwords.test.tsx`: "HO* (afternoon)") | — |
| S2-3 | The leave side, half a day | — | **Carried by test** ("OL (morning)") | — |
| S2-4 | The "OIL the app credited" sheet | **FAIL — reproduced:** "FO · approved" | **PASS** desk + phone: "FO* · approved"; RECORDED: "· approved" on an OIL credit (Q2) | `before/s2-desk/s2-4-b-sheet.png`; `s2-desk/s2-4-*`, `s2-phone/s2-4-*` |
| S2-5 | A hand-given HO stays starless | — | **Set aside** (§6) | — |
| S2-6 | D1331 — the bid window on a morning box | PASS (already built) | **PASS** desk + phone: AM lit beside the lit LL; OL pressed there keeps the morning | `s2-desk/s2-6-*`, `s2-phone/s2-6-*` (the pressed picture beside the settled one: the same) |
| S2-7 | D1331 on the windows that open differently | — | **Set aside** (§6) | — |
| S2-8 | The words elsewhere — record, do not fix | — | **RECORDED** from the code (the roll-call above) — filed, Q3 | — |
| S2-9 | The stored grammar stays — a send-back lands a morning | PASS | **PASS** desk + phone: approved OL top → sent back, still top, pending; Approvals "12 Nov, AM" | `s2-desk/s2-9-*`, `s2-phone/s2-9-*` |
| S3-1 | A filing the gate refuses says nothing of the bid (Ranger: ATT C AM filed, OL bid PM, then LL whole day) | — | **PASS:** refused "Ranger is on ATT C on 18 Nov (00:00–12:00) — leave can't go over a medical", nothing else said, the bid stays; filed again (lesson 16): the same | `s3-desk/s3-1-*` |
| S3-2 | Refused by the permission check (a member, D763) | — | **Carried by test** (`memberclash.test.ts`) | — |
| S3-3 | It lands — said once | — | **PASS** (a): one note "This replaces Ranger's OL bid on 17 Nov on the Leave War · Input added"; his bid became the leave. (b), (c) not walked (§6) | `s3-desk/s3-3-*` |
| S3-4 | The give-back sheet | — | **Set aside** (§6) | — |
| S3-5 | Undo and Redo of a filing that replaced a bid | — | **PASS:** Undo — the bid back, "Undid: a personal input", nothing of the bid; Redo RECORDED: "Redid: a personal input", the note not said again | `s3-desk/s3-5-a-undo.png` |
| S3-6 | The schedule's drag onto an Unavailable row | — | **Set aside** (§6) | — |
| S3-7 | The war's own filings never say it (CSE over Ranger's pending LL) | — | **PASS:** nothing said of the bid; the course beside it | `s3-desk/s3-7-a-course.png` |
| S4-1 | A joined bar across a month's edge (Ranger 1–3 Dec, then 30 Nov, Auto-approve on; Undo; pending; delete) | **FAIL — reproduced:** 1 Dec kept its code and rounded edge (no `jl`); healed by a December bid; after Undo 1 Dec still joined left; a pending run not joined at 1 Dec | **PASS** desk + phone: one bar 30 Nov–3 Dec; Undo → 1 Dec the start; pending run joined; delete 30 Nov → 1 Dec the start | `before/s4-desk/s41-a2-after-30nov.png`, `s41-a3-*`, `s41-a4-*`; `s4-desk/s41-*`, `s4-phone/s41-*` |
| S4-2 | One remark over two bids (Vector 10, 11 Nov) | **FAIL — reproduced:** two boxes while Approvals listed one line | **PASS** desk + phone: one joined bar, Approvals one line; (b) carried by test (§6) | `before/s4-desk/s42-*`; `s4-desk/s42-*`, `s4-phone/s42-*` |
| S4-3 | The measure | — | **PASS:** a mid-month bid draws 28 cells (as before), a bid on the 1st 59; the built grid's time for one bid unchanged within noise (§8) | — |
| S4-4 | A holiday added — every row's column tinted | — | **PASS:** an Off day on 18 Nov, all 49 drawn rows tinted at once (written through the war's Event line on the localhost bridge — the control that writes it is unchanged; what is checked is the redraw) | `s4b-desk/s44-a-off-day.png` |
| S4-5 | A posting moved across a month's edge | — | **PASS:** PO from 2 Dec → 30 Nov → 2 Dec, the hatch following in both months each time (written through the bridge's posting writer, as S4-4) | `s4b-desk/s45-*` |
| S4-6 | Everything else that must redraw after a bid | — | **Set aside** (§6) | — |
| S4-7 | The open-bidding outline and the closed dim | — | **Set aside** (§6) | — |
| S4-8 | Undo / Redo over two months, a move across the edge | — | **Set aside** (§6) | — |

**Count (33):** PASS 21 · FAIL 0 · carried by a test 4 · RECORDED 1 · set aside with a reason 7. Faults reproduced on `main`
before the fix: 6 (S1-1, S1-6, S2-1, S2-4, S4-1, S4-2) — every one PASS after.

## 6. What was NOT walked, and why

**Carried by a test (§7.0 — the route on screen walked by a sibling, the behaviour the same):**
- **S1-8** — an archive is a posting "overseas", run (D323 reading 4), and a SANS posting keeps his leave (D283): both read
  `postingOutWhy`, which this change leaves as it was; the date rule's route on screen is the one S1-2 walked. Tests:
  `m4decide.test.ts` "a posting out as SANS that has run approves in the bid windows too (D283)", "a posting that has RUN: a
  day before the date approves…" (both through the production writers). The new delete check reads only `deleted`, which an
  archive or a SANS posting never sets — pinned by break 3 (every man treated as deleted: 8 tests red).
- **S2-2, S2-3** — the same `clashWhat`, the same strip, the half alone differs: `halfwords.test.tsx` "a credited afternoon",
  "the leave side, half a day" (the clash built by the real OIL pass from a ground row on the published Saturday; the strip
  rendered).
- **S3-2** — `memberclash.test.ts` "a leave the commit refuses (a member filing it for another man) says nothing of the bid"
  (the production door `writeInputs`).

**Set aside, each with its reason (§7.0):**
- **S2-5** (a hand-given HO stays starless) — nothing of an award's drawing or its own sheet changed; the one place this
  change prints an award's code would be the clash note, and an award never clashes (D80). Test: `codeInWords('HO', false)`.
- **S2-7** (D1331 on the whole-leave window, the free half, the day's list, the drag window) — walked on code this change
  leaves as it was: the whole-leave window's walk of 28 Oct 26 (`handpass/2026-10-28-lw-whole-leave.md`) and round 3's.
- **S3-3 (b), (c), S3-4, S3-6** — the note is said by the one gate every filing door runs through (`inputgate.ts apply`,
  deferred to the landed command); this job changes no line of it or of those doors (fix 3 is verify-only); the walked doors
  (S3-1, S3-3 (a), S3-5, S3-7) cover a landed filing, a refused one, both Undo directions and the war's own doors.
- **S4-2 (b)** (words on one day of a three-day run) — the same remarks writer (`setRequestWords`) and the same compare as
  (a); pinned by `matrix-rows-memo.test.tsx` S4-2 and by break 14 (the records not compared: red).
- **S4-6** (the bubble, the Manning rows' figures, "n red ›", the LVE figure) — none is drawn inside a month block: the
  name's figures are `PersonRow`'s (drawn again on every store change, unchanged) and the rest the grid's own; nothing of
  them changed.
- **S4-7** (the open-bidding outline, a member's dim) — the closed days and the role are compared by identity, unchanged;
  walked by D1267's and D1269's walks.
- **S4-8** (a move across the edge, Undo / Redo) — a move writes a delete on one day and a place on another, both walked
  across the edge in S4-1 (delete 30 Nov; place 30 Nov; Undo), and pinned by the memo tests.

## 7. Break tests (§8.4) — `scripts/handpass/breaks/lw-sf1030.json`

19 breaks, one per wire (fix 1: 6, fix 2: 6, fix 4: 7). **First run: 17 of 19 caught.** Break 18 (the join's reach one day,
not two) stayed green — reading (1), no test: the reach of two matters where a day holds a second whole entry beside a bid
run; a pin was written (`matrix-rows-memo.test.tsx` "a change two days before a month draws that month again"), and break 18
re-run: **CAUGHT**. Break 15 (the fast path ignores the records) stays green — reading (4), a second guard: the store gives a
man's day views a new object whenever his records change (the merge rebuilds his row from them), so the fast path is never
taken when they changed; the behaviour is pinned by break 14 (the records not compared: red). **Final: 18 of 19 caught, the
19th a second guard with its reason.**

## 8. The measure (S4-3, `docs/performance.md` Part 1)

The unit grid's counter (`matrix-rows-memo.test.tsx` — day cells drawn): a mid-month bid 28 on `main` and after; a bid on the
1st 28 on `main` (the month before wrongly skipped) and 59 after (its month and the month before, whose last two days read it);
every month of every row (5,840) never. The built bundle, his PC's desktop at 1.25 with the whole year drawn, one bid written
through the war's writer and two frames waited, 20 bids each, two runs each (`scripts/handpass/lw-sf-perf.mjs`): mid-month
median 99.9 / 101.9 ms on `main`, 115.4 / 100.7 ms after; a month's edge 82.6 / 85.4 ms on `main`, 84.3 / 80.9 ms after —
within the run-to-run noise (the after runs straddle the before runs). The grid is not made slower for the common case.

## 9. Errors seen

None: every script watched the console, page errors and 4xx responses — `errors: none` on every run, both builds, both
engines.

## 10. What the walk found, and each disposition

| Finding | Disposition |
|---|---|
| F1 — a never-arrived man deleted: his leftover bid approved (the item) | confirmed on `main`; **fixed**, red-first (`deletednorow.test.ts`) |
| F2 — Undo / Redo wrote a deleted man's approved leave back (S1-6, new with this walk, older than it) | confirmed on `main`; **fixed**, red-first (`deletednorow.test.ts` S1-6 (a), (b)); the refusal is the approval alone (a Redo of an Inputs-page leave of his still comes back — pinned) |
| F3 — the clash note's "FO" / "*HO" / "*LL"; the sheet's "FO · approved" (the item, wider) | confirmed on `main`; **fixed**, red-first (`halfwords.test.tsx`) |
| F4 — the month skipped across its edge; one remark over two bids not joined (the item's new half) | confirmed on `main`; **fixed**, red-first (`matrix-rows-memo.test.tsx`) |
| F5 — the same old grammar in the day's list's lines, the approved-leave window, the bell | **filed** `[LW-HALF-WORDS-ELSEWHERE]`, his to rule (Q3) — the scenario list's S2-8: record, do not fix unasked |
| F6 — "refuse or delete it" for a man with no row | **filed** `[LW-DELETED-NOROW-WORDS]`, his question (Q1) |
| F7 — "· approved" on an OIL credit | his question (Q2), with F5's item |
| F8 — the roll-call's search for the old wording missed one browser test (it spells the phrase with an escaped slash, `Weekend\/PH`, and matched the code by a pattern) — found by GitHub's run, not by the walk | **fixed** (the test's pattern brought to the new form); the lesson is the order's own §6 rule — search each exact old phrase, and each code it prints (`[FH]O`), across `e2e/` and the scripts as well as `src/` |

## 11. The ledger's row

Added to `docs/walk-ledger.md` (30 Oct 26).

## 12. The reads (D790)

The fresh, blind Opus read of the finished code is arranged by the night's coordinating chat after this sheet (fix 1 and fix
4 touch saved leave and the undo restore — §4 rank 2; D1411's security read does not apply: no sign-in or permission rule
changed). Astra and Sol 6.1 are out (D761): this job goes on `[NO-ASTRA-LIST]` when the reads are recorded.

**Walk:** `docs/handpass/2026-10-30-lw-small-fixes.md` · 116 pictures · 9 surfaces (Approvals, Approve all, the bid window,
the drag window, Admin → Users, the post sheets, the clash note, the credited sheet, the grid's joined bar; the Inputs page's
window for fix 3) · 21 scenarios walked (both builds for the 6 faults), 4 carried by tests, 7 set aside · MISSING: 2 fixed
(Undo / Redo re-approving; the month's edge), 2 filed (the old grammar elsewhere; the words for a man with no row)
