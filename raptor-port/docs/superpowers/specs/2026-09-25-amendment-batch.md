# The amendment batch — everything he decided on 24–25 Sep 26, to build in ONE chat

Written 25 Sep 26 at the close of the `claude/amendment-retest` chat (context full), so the build chat starts from one
list. Every item is a recorded ruling (`.claude/rules/decisions/scheduler.md`, D91–D105; items 12–14 added from his look at PR #434, D107–D109) with a backlog item in
`OUTSTANDING.md`; the mock-ups are pictures of the real app, their makers committed under
`raptor-port/scripts/handpass/am/` (run against the build on :4173). **Build it after PR #434 merges** (his "merge live"),
on a fresh branch from `main`. Tier: **FULL** — it touches sign-offs and the published face (bug-check order §5);
Opus 5.5 builds, Fable 5.1 AND Astra read (D67). Walk every surface (edit week, board, View-only Sched) at desktop AND
phone.

| # | What to build | Ruling | Backlog item | Mock-up / evidence | Notes for the builder |
|---|---|---|---|---|---|
| 1 | **A changed puck gets a TAG, never a ring** — published: the solid ALn tag only (today's tag, no AL-coloured ring); waiting: a hollow, dotted ALn tag, no dotted outline. A puck's edge carries only warnings. Times, areas and remarks keep their marks. Every surface, View-only Sched included | D92, D93 | `[AMEND-MARK-RING-CLASH]` | `raptor-port/docs/mock/amend-seat-marks.html` (the busy day; approved) — CSS as `C_CSS` in `mk-seat-marks-lib.mjs` | Removes `.seat[data-alc] .puck{box-shadow…}` and the edit surfaces' `.seat[data-aln] .puck` outline (`raptor-port/src/ui/scheduler.css`); measured: today the published ring hides the thin amber/grey/red `.warn` rings (Tally, AL3). e2e geometry pin: every ring's stroke survives a published and a waiting change. `ui-contracts.md` §Amendment marks on screen changes (D92 changes the August look). The view page's neutral pending hint on the seat has the same geometry — check it |
| 2 | **The board draws the dashed and dotted rings** as the edit week does | D94 | `[BOARD-RING-STROKES]` | same page, "Also found" | `raptor-port/src/ui/board-html.ts` calls `puck(…, dash=false, trace=null)`; pass the day's dash and trace as the week's builder does |
| 3 | **"Signed ALn" line** — one slim line under the day head naming the four who signed the version on screen (roles on desktop, names only on a phone) — on View-only Sched, the board AND the edit week | D95, D102 | `[AMEND-PHONE-APPROVER]` | `raptor-port/docs/mock/amend-answers.html` §Question 3 (option A) | An AL record keeps its signers (`SCHED.als[].sign`); the ORIGINAL does not — `setDayApproved` clears them unkept (`raptor-port/src/engine/publish.ts`): keep them on `SCHED.orig[di]`. B (the ⓘ list) was NOT taken |
| 4 | **A day template is refused on a published day**, with the reason on screen at every door | D96 | `[AMEND-TEMPLATE-PUBLISHED]` | — | Draft days unchanged |
| 5 | **Two-state marker:** "Not yet signed" while any of the four is missing or invalid; "Not yet published" once all four are valid | D97 | `[AMEND-NYS-WORDING]` | — | `notYetSigned` never reads the sign-offs today (`publish.ts`); `nysMarkHTML` (`raptor-port/src/ui/html.ts`); register AM24 wording |
| 6 | **"Load onto working copy" puts back a request the scheduler had taken off**, so the day reads exactly as that version (nothing pending) | D98 | `[AMEND-LOAD-FILING]` | `amend-answers.html` §Question 7 (walked) | Do it in the load alone, from the version's own filing record (`snap.fil`) — the first attempt, in the general reconcile, turned a deliberate removal into a fresh input on a plan switch (Fable #2) |
| 7 | **Any pending change wipes the sign-offs** — one rule: something waiting means sign again | D103 (replaces D45's signature half) | `[PENDING-SUMMARY]` part 1 | — | Bind the signature to the same comparison the pending count uses (`currentBind` in `publish.ts` leaves membership out today; request times are not in the filing fingerprint). Putting a change back still restores the signatures (AM11). Register AM13 changes |
| 8 | **"N pending ▾" opens the list of what will go out** — where, before → after, who and when ("earlier" where the record is gone); a long list scrolls; a tap takes the view to the change and marks it | D99, D100 | `[PENDING-SUMMARY]` part 2 | `raptor-port/docs/mock/pending-list.html` (approved, look and function) | The NET difference (AM20): a change made and put back is not on it; who/when from the edit log (`raptor-port/src/engine/editlog.ts` — kept only while the page is open) |
| 9 | **Who = the shared account until the database** ("Admin" / "Member"); callsigns come with personal accounts | D104 | `[PENDING-SUMMARY]` part 3 | — | Not the "View as" person (it would name the wrong man) |
| 10 | **The change bubble stays** — hover on a desktop, tap on a phone — and a long one scrolls inside itself | D105 | `[PENDING-SUMMARY]` part 4 | — | `raptor-port/src/ui/histbubble.ts` |
| 11 | **Phone: typing on the board shows the schedule behind above the keyboard** | (his bug report) | `[BOARD-KEYBOARD-GAP]` | `raptor-port/docs/img/bugs/2026-09-25-board-keyboard-gap.png` | `.schedboard` is `position:fixed; inset:0`; follow the visual viewport or hold the page still; reproduce with History on and off |
| 12 | **A tap on a change in Edit history keeps him on the page he is on** — from Edit Schedule it takes the view to the change on the week and marks it; it never opens the board. On the board, today's jump stays | D107 | `[HIST-JUMP-STAYS]` | reproduced 25 Sep 26 (his look at PR #434) | `jumpToChange` (`raptor-port/src/ui/interactions.ts`) calls `boardTab`, which opens the board. Build ONE "take me to this change" for this AND item 8's tap, landing on the current page; phone: step the edit week to the day, then scroll. A key the week does not draw says so on screen (the board's `NO_BOARD_CELL` is the worked example) |
| 13 | **The ORIG tag stands out** so a published day reads as published — **A1, the seal**: a faint white wash, a thin light outline, a drawn tick in a white disc before "ORIG" | D108, D110, D111 | `[ORIG-TAG-STANDOUT]` | `raptor-port/docs/mock/orig-tag.html` (picked: A1) — CSS and the tick's SVG are variant `s` in `mk-orig-tag-refine.mjs` | One drawer (`verTagHTML`, `.verchip.orig` in `scheduler.css`) on the edit week, the board and View-only Sched. Must not read as an AL colour (AL4 is white) or a warning. Register AM22 changes |
| 14 | **A move counts as ONE pending change** — a man (or a placeholder) taken off one place and put on another of the same day is one; a swap is two; times, areas, remarks one per box | D109 | `[MOVE-COUNTS-ONE]` | reproduced 25 Sep 26 (his look: Warden MET + NOTAM → SODB read "2 pending") | Every count reads ONE body: `dayShownPendCount`, `dayDiscardCount`, the Amendments panel, the ⓘ panel, the plan-switch toast and item 8's list (a move = one line, "Warden: MET + NOTAM BRIEF → SODB"). The AL's stored diff and the marks are unchanged. Register AM23 |

**Not to build (ruled):** a mark for a man taken off a seat (D91); a "Reissue AL1" button (D101 — Publish AL1 is the way
back after an Unpublish, walked).

**Also in the backlog, not part of this batch:** `[AMEND-SMALL-SEEN]`, `[AVAILWIN-PREVIEW-BAR]`, `[UNDO-ROSTER-SETTINGS]`,
and his order after the re-test (D147): the absence record with `[S4-HUNT-REST]` next.

## Overnight — how the batch is built while he sleeps (D112, 25 Sep 26)

He sleeps from about 02:40 to **11:00 his time (UTC+8; 03:00 UTC)**, 25 Sep 26; the batch is built in a FRESH chat on `claude/amendment-batch` without waiting
for him. Opus 5.5 at high effort builds; Fable 5.1 (high) and Astra review, never the builder (D67).

**The order** — what later items read is built first; every fix and every item red first:
1. **Plan and scenarios (~45 min).** Write the build plan (`raptor-port/docs/superpowers/plans/2026-09-25-amendment-batch-plan.md`).
   Fable and Astra, blind to each other, get ONE round each (the ~3-round cap, well inside it): design the scenarios
   with the finder brief (bug-check order §4, the D56 exclusion included) AND attack the plan. Fold the findings in.
2. **The one counting body (items 14, then 7).** One routine lists a day's net waiting changes against the published
   version, pairing a move into one change (D109); every count reads it — the day head, the Amendments panel, the ⓘ
   panel, the plan-switch message, "Discard N edits". Then the sign-off binding covers everything that shows as
   pending (D103).
3. **The pending list and the jump (items 8, 9, 12, 10).** The list is drawn off that same body; ONE "take me to this
   change" serves the list and Edit history and lands on the page you are on (D107); the bubble scrolls when long.
4. **The marker (item 5).**
5. **The marks and tags (items 1, 2, 13, 3).**
6. **The doors (items 4, 6).**
7. **The phone keyboard gap (item 11).** Chromium cannot show an iPhone keyboard: build from the visual viewport and
   put it on his morning card for his own phone.

**The stop rule.** By about **08:00 his time** (5 hours in), or with the chat two-thirds full, STOP BUILDING: what is built gets the whole FULL
check; what is not stays filed with where it stopped. A check is never skipped to fit an item in.

**FULL tier** (bug-check order §5): the rules sweep against the register
(`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` — AM13, AM22, AM23 and AM24 change;
D91–D111) → gates → roll-call and door check (observation #244: a row per OPENER for anything that navigates) → the
walk at desktop and phone, fanned out by world (D16) → fixes, red first → gates → Fable and Astra read the code,
blind, with the evidence sheet → fixes → re-walk what they touched → gates → the evidence sheet with his look card →
the pull request open and green. **Nothing merges:** `main` waits for his look and his "merge live".

**A question** goes into `OUTSTANDING.md` with a recommendation, and the work carries on (D112). A ruled item is never
re-decided.

**If the chat fills up:** it compacts itself and carries on — his "Yes", 25 Sep 26 (D112) — after writing its state
into the repo first: the handoff block, the evidence sheet, the commit messages (D68).

**In the morning he gets**, before 11:00 his time, ONE notification: what was built and checked, what was not and why, the pull request, the
branch's Vercel link, and a five-minute look card.
