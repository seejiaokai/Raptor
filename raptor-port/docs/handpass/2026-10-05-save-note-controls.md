# `[SAVE-NOTE-COVERS]` — the "Not saved — Retry" note that covers controls — evidence sheet (5 Oct 26)

**Authority: D586** (owner, 5 Oct 26): Opus 5.5 fixes it on its own branch `codex/save-note-controls` (from the pushed
`codex/workflow-ui`, c6e1634d); the proposed phone and desktop look is SHOWN BEFORE the layout changes; real button
presses are checked, not appearance alone; an independent read follows; the Inputs/SANS calendar stays on hold; no
merge, no `main`; `[OG-TAG-OVER-COUNT]` only afterwards.

**D587 (owner, 5 Oct 26 — "ok looks good" to the pictures):** the band along the bottom of the top bar is accepted as drawn,
its words included ("Not saved — keep this page open", Retry); the same band under the bar of every full-screen surface
that covers the top bar; "Saving…" unchanged.

**Status: BUILT, WALKED, GATES — see §Gates; the independent read — see §The read. Not merged; `main` untouched.**

## The eight questions (bug-check order §5) → tier WALK

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave | NO — the note draws a save's state; it decides nothing anyone is owed |
| 2 | The published record | NO — publishing, signing and amendments are not touched |
| 3 | Saved data | NO — what is stored and how it is retried (`storage/postman.ts`) stays as it is; only where the note is drawn |
| 4 | A shared drawer | **YES** — the shell draws the note over every page |
| 5 | A new gesture or mode | NO new gesture — but Retry MOVES, so it is pressed for real at every size |
| 6 | A new surface | **YES** — a band of its own in the top bar, and under four full-screen surfaces' bars |
| 7 | Roles | NO — the same note for admin and member (the member's pages were walked) |
| 8 | The warning list | NO |

WALK: the gates; the roll-call; the walk of every page at phone and desktop size with real presses; a break test; this
sheet; then ONE independent read (Astra — Opus wrote it, D67; one reviewer, D353: more than one surface, no money).

## The rulings that apply

D586, D587 (above) · D541 (a picture before a visual build — done, below) · the 2 Sep 26 rule "a control tapped again
and again must not move" (the bar's own buttons do not move when the band comes; tested) · `[LW-FIGSEL-FLAKE]`
("Saving…" never moves the bar — unchanged; its test stays green) · D487 (button sizes stay — only Retry, the note's
own button, grew, and it was drawn in the accepted picture) · D347–D349 (the top bar's and the board bar's contents —
untouched) · D373 (the Tracker's folded tools on a short screen — walked) · UI copy reads production (the new words).
No clash found between them.

## How the failed save is made

The built app (`npm run build`, served on port 4173), a real Chromium, signed in as the admin. The browser's storage
is made to refuse every write (`Storage.prototype.setItem` throws a quota error — what a full disk or a locked-down
browser does), one change is made through the app's one write path, and the note turns to the warning. **This is the
one thing the walk does that a person cannot do with the app's own controls** (bug-check order §7.7): a real failed
save needs a full disk. Drivers: `raptor-port/scripts/handpass/sn-cover.mjs` (every page; written as assertions of the
RIGHT behaviour, so the same run on the fixed build is the re-walk), `sn-board.mjs` (everything that lies over the top
bar), `sn-sheet.mjs` (contact sheets, so every picture is opened). **Not opened with `?fresh=1`** — that mode keeps
everything in memory, so no save can fail there (the first run did, and reproduced nothing).

## REPRODUCED — the app before the fix (c6e1634d)

`sn-cover.mjs`: 268 PASS, **47 FAIL**, no browser errors. Pictures: `raptor-port/docs/img/handpass/2026-10-05-save-note-controls/before/`
(`result.json` holds every measurement). Sizes: phone 390×844 and 320×568 (touch), desktop 1200×800, 1366×800,
1440×900. "Hidden" = how much of the control the note paints over; "a press lands on" = a REAL tap or click on the
control's own middle.

| Page | What the note covered at the top of the page | When scrolled |
|---|---|---|
| View-only Sched | the name search box — phone: 100% hidden, **a press lands on Retry** (390 and 320); desktop: 88% hidden at all three widths, its right part goes to Retry | phone: pucks and warning chips pass under it |
| Edit Schedule | the name search box — phone 390: 100% hidden, **a press lands on Retry**; phone 320: also Highlight (39%) and the ⋯ menu (100%); desktop 1200/1440: search box 88%; **desktop 1366: the account button 91% and Logout 10%** (the stale place, below) | rows and the issues strip pass under it |
| Inputs | nothing at the top | phone 320: date chips up to 90% |
| Quals | phone: the date box (19% at 390, 77% at 320); desktop: the filter box 88% at all three widths | phone: the sort buttons (62–76%), SANS; some spots go to Retry |
| Logic | nothing at the top | phone: the pinned search and its tabs, partly |
| Leave War | phone: "+ New" (21% at 390, **100% at 320**) and the period picker | — |
| Tracker | phone 390: the syllabus picker 96%, **its edit button 100% — a press lands on Retry**, Save changes 20%; phone 320: the course picker, its edit button 100%, File, Find; **desktop, all three widths: ✓ Save changes 96% hidden — a press lands on Retry** | the same (its bar stays put) |
| Help | nothing at the top | phone 320: the Category box 21% |
| Admin | nothing | nothing |
| **The scheduler board (full screen)** | **the warning could not be seen at all** — the board lies over the top bar and the note with it (`sn-board.mjs`'s first version, phone 390 and desktop 1366: FAIL, FAIL) | — |

**A second fault, found here:** the note worked out its place when it came up and on a window resize, never on a page
change. Going from a page whose top bar is one line to one where it is two (Edit Schedule at 1366) left it at the old
height — ON the bar's second line, over the account button and Logout (`before/desk-1366-editsched.png`).

## THE PROPOSAL — shown to him before any layout change (D541, D586), accepted (D587)

A band of its own along the bottom of the top bar. Drawn on the RUNNING app with a throwaway style sheet and script
(`SN_CSS` / `SN_JS` of `sn-cover.mjs`, kept outside the repo — no source changed) and measured the same way: 280 PASS,
0 FAIL (`…/proposal/`). His page of before-and-after pictures (private): https://claude.ai/artifact/Ju7P8Y52PsMJrg8CCGeWmG.
Why not the others: the bottom of the screen already carries the week's sideways scroller, the phone's sheets and a
snack note; a slot inside the bar's row is what made the bar wrap and the page jump on every save; any floating place
covers whatever scrolls under it. The cost, told to him: the page shifts down one line once, when a save fails, and
back when it lands.

## WHAT WAS BUILT

`ui/SaveStatus.tsx` (the warning's words; its place measured from the bar on mount, on resize and whenever the bar's
height changes; `SaveBand`, the same warning in the flow), `ui/scheduler/17-save-status.css` (the band; the room the
bar makes; four things that move down with the page), `ui/Shell.tsx` (`.save-failed` on the bar and on the shell),
`ui/SchedBoard.tsx`, `ui/InputsCal.tsx`, `ui/MedicalView.tsx`, `leavewar/ui/OilTracker.tsx` (the band under each one's
own bar). After Astra's read: one warning exposed at a time; one window `resize` from `Shell` when the warning comes or
goes; the movable windows' rule desktop-only and shorter by the band. Tests: `e2e/save-note.spec.ts` (35, new; in the
`raptor` project), `ui/SaveStatus.test.tsx` (two added). The contract:
`raptor-port/docs/ui-contracts.md` §The failed-save warning has a band of its own.

## THE ROLL-CALL — every place a top bar is drawn, or something lies over one

Columns: **shows** the warning · **Retry works** there (a real press) · **what else is on those pixels**.

| # | Surface | Shows the warning | Retry works | What else is on its pixels |
|---|---|---|---|---|
| 1 | The top bar — View-only Sched | YES (walk, 6 sizes; test) | YES — pressed at all 6 sizes (walk and test) | nothing: the bar's own added line. The name search box below takes its own press (test) |
| 2 | — Edit Schedule (a two-line bar at 1200–1366, three lines on a sideways phone) | YES — and it follows the bar when the page changes (the old stale place; test walks page to page) | same element as row 1 | nothing. The week's side arrows and the CREW tab move down with the page (found by the test at 844×390, fixed) |
| 3 | — Inputs | YES | same element | nothing |
| 4 | — Quals (a frozen header that follows the bar) | YES, top and scrolled | same element | nothing; the frozen header sits below the band — walked scrolled with the warning already up, AND tested with the header ALREADY frozen when the warning comes and when it goes (Astra F3; it sat 36px off) |
| 5 | — Logic (its search pinned under the bar) | YES, top and scrolled | same element | nothing; the pinned search sits below the band (walked scrolled) |
| 6 | — the Leave War (its own chrome has a `.topbar` class of its own; a frozen header) | YES, top and scrolled | same element | nothing; "+ New" and the period picker clear; its header ALREADY frozen follows the bar both ways (Astra F3; test) |
| 7 | — the Tracker (its own bar, ✓ Save changes showing; a full-height column) | YES | same element | nothing; ✓ Save changes takes its own press (test, all 6 sizes); its column still ends at the screen's foot when the warning comes and goes WITHOUT leaving the page (Astra F4; test). Its open menus and Find strip re-place on the same resize — NOT pressed |
| 8 | — Help | YES | same element | nothing |
| 9 | — Admin | YES | same element | nothing |
| 10 | The member's pages (View-only Sched, Inputs, Quals, Logic, Leave War, Tracker, Help) | YES (walk, phone 390 and desktop 1366) | same element | nothing |
| 11 | The scheduler board (full screen, over the top bar) | YES — under the board's own bar (walk, 3 sizes; test, 6 sizes); the bar's copy beneath is inert and hidden from readers (Astra F5; test) | YES — pressed from the board, refusing then saving (walk 3 sizes; test 6) | nothing; every control of the board's bar is its own target; the board's content starts below the band |
| 12 | The Inputs calendar (full screen) | YES — under its head (walk 3 sizes; test 6) | YES — pressed while refusing: it stays (test) | nothing |
| 13 | The Medical view (full screen) | YES — under its head (walk 3 sizes; test 6) | YES — pressed with storage working: it saves and goes (test) | nothing |
| 13a | **The Leave War's OIL tracker — its grid** (a full-screen sheet; credits are awarded from it) | YES — under its head (walk 3 sizes; test 6). MISSING before Astra's read (F1) — FIXED | YES — refused, then saving (test) | nothing |
| 13b | **— its settings** (the same sheet's other screen) | YES (walk 3 sizes; test 6) | same band | nothing |
| 13c | — one person's ledger (the same component opened on a person) | the same `Sheet` and the same head as 13a; NOT walked separately | — | — |
| 14 | The changes window, on a desktop (movable, stays open while working) | MUST NOT carry one — the bar's own is visible beside it | YES with it open (test, 3 desktop sizes) | it opens 96px down the right edge; moved down by the band so it stands where it stood, and shorter by the band — its foot stays on a 600-tall screen (Astra F2; test). Under a two-line bar its top edge still lies 7px over the band's lower edge, as it lay over the bar before — filed `[FLOATWIN-TWO-LINE-BAR]` |
| 14a | — on a phone (a bottom panel; "Hide" makes it a slim bar) | MUST NOT | n/a | the desktop rule must not reach it: the panel stays where it was and the slim bar stays slim (Astra F2 — the first build pulled it to the top; test, phones 390 and 320) |
| 14b | The ALL AVAIL window | MUST NOT | NOT pressed | the same one rule: its opening spot read from the page — lower by the band on a desktop, still a bottom panel on a phone (test) |
| 14c | A window a person has MOVED | MUST NOT | NOT walked | its own inline place wins — it is where they put it |
| 15 | A window (Insights walked), a SHORT sheet, the phone's menu (walked), a dialog — NOT the full-screen OIL tracker (13a) | MUST NOT, because each is a short visit (D587): it covers the bar's warning as it covers the bar, and the warning is there, seen and covering nothing, when it closes (walk, 3 sizes) | n/a while open | the window itself |
| 16 | The sign-in screen; the pages of someone signed in without access (the guest's and the access-request pages) | MUST NOT differ — the sign-in screen saves nothing; the guest's pages are the same shell and the same bar. NOT walked as a guest | n/a | — |
| 16a | The Tracker exported as a standalone app | not this app's shell — it has no Raptor top bar and no postman; out of scope | n/a | — |
| 17 | The Tracker's own save words in its header (`#saveStat`, shares the `savestat` class) | MUST NOT change — the new rules are scoped to `.topbar > .savestat.failed` and `.saveband` | n/a | unchanged (the Tracker smoke gate) |
| 18 | "Saving…" (the passing note) | unchanged: floats, takes no press, never moves the bar | n/a | `e2e/geometry.spec.ts` "the Saving… note never moves the top bar" stays green |

## THE WALK — the exact final build

Every run below is the build of the final source (the tree this sheet is committed with), served on port 4173.

| Run | What | Result |
|---|---|---|
| `sn-cover.mjs`, admin | 9 pages × 6 sizes (phones 390, 320, a phone on its side 844×390; desktops 1200, 1366, 1440) × top and scrolled: the warning seen whole; the page does not scroll sideways; no control under it. Then Retry pressed for real at each size | **336 PASS, 0 FAIL**, no browser errors |
| `sn-cover.mjs`, the member's pages | 7 pages × phone 390 and desktop 1366 × top and scrolled, the role changed in place (§7.7) | **88 PASS, 0 FAIL**, no browser errors (the top bar read "Saber · Member"; no Edit Schedule or Admin tab — seen on the pictures) |
| `sn-board.mjs` | the board, the Inputs calendar, the Medical view, the OIL tracker (grid and settings), a window (desktop) or the menu (phone), at phone 390, a phone on its side and desktop 1366; Retry pressed from the board while refusing and then saving | **45 PASS, 0 FAIL**, no browser errors (the OIL tracker's grid and settings added after Astra's read) |
| `e2e/save-note.spec.ts` | the same, as a gate: 6 sizes; real presses on the search box, ✓ Save changes, Retry (bar, board, both calendars); the bar grows by exactly the band and its own buttons do not move; the changes window open | **35 passed** (21, then 14 added for Astra's findings); run twice over, 70 of 70 |

Pictures: `…/2026-10-05-save-note-controls/after/` and `after-member/` — one per page and size (the top of the page),
plus the board, both calendars, the window and the menu; a contact sheet per size (`sheet-*.png`). **Opened and looked
at:** four of the admin's six contact sheets (phone 390, phone 320, a phone on its side, desktop 1366 — 36 of the 54
page pictures), the member's phone sheet (7 of 14) and its desktop View-only Sched; and, from the run on the build before
the last style rule (the movable windows' opening spot — nothing on these pictures), the board at all three sizes, the
Inputs calendar (phone), the Medical view (desktop) and the Insights window open (desktop). **Not opened:** the admin's
desktop 1200 and 1440 sheets, the member's desktop sheet, the final build's re-taken board and calendar pictures —
measured, not looked at.

Orders walked: failed on one page → every other page (the page-change case) · failed → Retry while storage still
refuses (stays) → storage works → Retry (saves, the bar returns to its height) · failed on Edit Schedule → the board →
Retry from the board → back · failed → each calendar → back · failed → a window / the menu open → closed.

## The break test

Each wire cut on purpose, the app rebuilt, `e2e/save-note.spec.ts` run, the wire put back (the files compared byte for
byte with their copies), rebuilt, and the suite green again.

| # | The wire cut | What went red (of 21) |
|---|---|---|
| 1 | the bar makes no room for the band (its two padding rules removed) | 13 — "covers no control" at all 6 sizes, "a real press reaches…" at all 6, and one board test |
| 2 | the board carries no band | 6 — the board test at every size |
| 3 | the Inputs calendar and the Medical view carry no band | 6 — the same test at every size (it reaches the calendars after the board) |
| 4 | the note does not follow the bar's height (its size observer removed) | 1 — "covers no control" where the bar goes from one line to two between pages |
| 5 | the side arrows, the CREW tab and the movable windows do not move down | 4 — "covers no control" on a phone on its side, and "the changes window, open" at all 3 desktop sizes |

After Astra's read, the four new wires and one more, the same way (of 35):

| # | The wire cut | What went red |
|---|---|---|
| 6 | the page is not told when the bar gains or loses the band (`Shell`'s one `resize`) | 6 — "a header already frozen, and the Tracker's column…" at every size |
| 7 | the OIL tracker carries no band | 6 — the OIL tracker test at every size |
| 8 | the movable windows' rule reaches phones | 2 — "the changes window stays a bottom panel…" at both phone sizes |
| 9 | the bar's copy stays exposed under a full-screen surface | 6 — the board test at every size |
| 10 | the movable window is lower but no shorter | 3 — "the changes window, open…" at every desktop size (its foot on a 600-tall screen) |

**One fault of the TEST found by this step, and fixed:** after the wires were put back one run failed waiting for the
board's Retry. The test put storage back and THEN pressed Retry; the app's own retry (1s, 2s, 4s …) had saved in
between and taken the button away. Storage is now put back by the press on Retry itself (the spec and both walk
scripts), and the suite was run three times over: 63 of 63.

## What the walk found, and each disposition

| # | Found by | What | Disposition |
|---|---|---|---|
| 1 | the new test, a phone on its side | the week's right-hand side arrow lay on Retry (it floats at mid-screen above the bar's layer; a three-line bar plus the band reaches it) | FIXED — the arrows move down by the band; the test went red on it first |
| 2 | the new test, a phone on its side | Edit Schedule's blue CREW tab (150px down the right edge) under the band | FIXED the same way; red first |
| 3 | the roll-call | the two movable windows open 96px down the right edge — on Retry under a two-line bar | FIXED — they open lower by the band (red first: the test read 96 where it wanted 132); the 7px they already lay over a two-line bar is FILED `[FLOATWIN-TWO-LINE-BAR]` |
| 4 | the reproduction | the full-screen board hid the warning entirely | FIXED — the band under the board's bar; and, the same rule, the Inputs calendar and the Medical view |
| 5 | the reproduction | the note kept a stale place after a page change | FIXED — it follows the bar's height |
| 6 | his question, 5 Oct 26 | the branch shows about 680,000 added lines — almost all machine-written records of Codex's checks | FILED `[EVIDENCE-RECORD-SIZE]` (his call) |
| 7–11 | Astra's read, round 1 | F1–F5 — see §The read | each FIXED with a test that goes red when the fix is cut |

## What was NOT walked, and why

- **A real iPhone.** Chromium with touch only. Named for his look: the band on his phone at the top of each page; and
  pulling the page down past its top (the bar bounces, a fixed note does not — the band may part from the bar for the
  length of the bounce, as the floating note did). `ui-contracts.md` carries the caveat.
- **A real failed save** (a full disk, a blocked browser): forced, as above. The retry timing itself is
  `storage/postman.ts`, unchanged and unit-tested.
- **The ALL AVAIL window open with a failed save** — moved by the same one rule as the changes window, which was
  pressed; not pressed itself.
- **Every window and sheet** — one window (Insights) and the phone's menu stand for the kind (row 15).
- **The Leave War's and the Tracker's own sheets and dialogs under a failed save** — short visits (row 15); their pages'
  tops were walked.
- **Light or custom colour palettes** — the band's amber is fixed on the page's own background colour; not looked at
  under a changed palette.

## Gates

GATES

## The read

**Round 1 — Astra (`gpt-6-astra`, read-only, on c8d006eb): CHANGES REQUIRED.** Brief:
`raptor-port/docs/superpowers/briefs/2026-10-05-save-note-controls-astra-final-r1.md`; the complete report, verbatim:
`raptor-port/docs/handpass/2026-10-05-save-note-controls-astra-final-r1.md`. Astra read; it ran nothing. Every finding
was then reproduced by the host in the running app — by a test that fails with the fix cut (break tests 6–10) — and
fixed (commit 78772e58). None is older than this change in a way that excuses it: F2 was made by this change; F1, F3
and F4 are old arrangements this change made matter.

| # | Astra's finding | Reproduced | Disposition |
|---|---|---|---|
| F1 | the Leave War's full-screen OIL tracker (grid and settings) had no warning or Retry | YES (break 7) | confirmed — a surface the first roll-call filed under "sheets"; FIXED: the band under its head, both screens; roll-call rows 13a–13c |
| F2 | lowering the movable windows' opening spot broke their phone layout, and on a short desktop put the foot off the screen | YES (breaks 8, 10) | confirmed, NEW with this change; FIXED: desktop only, and shorter by the band |
| F3 | a Quals or Leave War header already frozen did not follow the bar when the warning came or went | YES (break 6) | confirmed; FIXED — by ONE window `resize` from `Shell` when the warning comes or goes, not by Astra's instruction (an observer in each page). Every one of those pages already re-measures on a resize, so one trigger covers them and anything else that listens, and the vendored Leave War and Tracker are not edited for it. Put to Astra in round 2 |
| F4 | the Tracker's full-height column kept its old height: its foot 36px below a screen that does not scroll | YES (break 6) | confirmed; FIXED by the same trigger |
| F5 | under a full-screen surface the bar's copy stayed a second `role="status"` and a second Retry for a reader and the keyboard | YES (break 9) | confirmed; FIXED: inert and hidden while a band shows |
| tests | Retry not told apart from the automatic retry; "seen" asked the band's middle only; failure always made before the page was visited; the windows untested on a phone | — | FIXED: a refused-write count proves Retry tries at once; the unit test gives Retry 20ms where the automatic retry needs a second, and tests that apart; "seen" asks Retry's middle and both ends of the words; the page-you-are-on test; the phone window test |
| D138 | D586's short line matches its full row; D587's left out the short-visit exemption | — | FIXED: the short line carries it; the full row names the OIL tracker |

Astra's roll-call corrections are in the table above (rows 4, 6, 7, 11, 13a–13c, 14–14c, 15, 16–16a).

ROUND2
