# `[SAVE-NOTE-COVERS]` — the "Not saved — Retry" note that covers controls — evidence sheet (5 Oct 26)

**Authority: D586** (owner, 5 Oct 26): Opus 5.5 fixes it on its own branch `codex/save-note-controls` (from the pushed
`codex/workflow-ui`, c6e1634d); the proposed phone and desktop look is SHOWN BEFORE the layout changes; real button
presses are checked, not appearance alone; an independent read follows; the Inputs/SANS calendar stays on hold; no
merge, no `main`; `[OG-TAG-OVER-COUNT]` only afterwards.

**Status when this was last written: REPRODUCED and PROPOSAL SHOWN — no source file changed. Waiting for his word on
the picture.** Everything below the line "What is NOT done" is still to do.

## The eight questions (bug-check order §5) → tier WALK

| # | Question | Answer |
|---|---|---|
| 1 | Money / earned leave | NO — the note draws a save's state; it decides nothing anyone is owed |
| 2 | The published record | NO — publishing, signing and amendments are not touched |
| 3 | Saved data | NO — what is stored and how it is retried (`storage/postman.ts`) stays as it is; only where the note is drawn |
| 4 | A shared drawer | **YES** — the shell draws the note over every page |
| 5 | A new gesture or mode | NO new gesture — but Retry MOVES, so it is pressed for real at every size |
| 6 | A new surface | **YES** — a band of its own in the top bar (and, proposed, under the board's bar) |
| 7 | Roles | NO — the same note for admin and member |
| 8 | The warning list | NO |

WALK: the gates; the roll-call; the walk of every page at phone and desktop size with real presses; a break test; this
sheet; then ONE independent read (Astra — Opus wrote it, D67; one reviewer, D353: more than one surface, no money).

## How the failed save is made

The built app (`npm run build`, served on port 4173), a real Chromium, signed in as the admin. The browser's storage
is made to refuse every write (`Storage.prototype.setItem` throws a quota error — what a full disk or a locked-down
browser does), one change is made through the app's one write path, and the note turns to "Not saved — Retry".
Drivers: `raptor-port/scripts/handpass/sn-cover.mjs` (every page; written as assertions of the RIGHT behaviour, so the
same run on the fixed build is the re-walk) and `sn-board.mjs` (the full-screen board). **Not opened with `?fresh=1`** —
that mode keeps everything in memory, so no save can fail there (the first run did, and reproduced nothing).

## REPRODUCED — the app as built (c6e1634d), 5 Oct 26

`sn-cover.mjs`: 268 PASS, **47 FAIL**, no browser errors. Pictures: `raptor-port/docs/img/handpass/2026-10-05-save-note-controls/before/`
(one per page × size × top/scrolled; `result.json` holds every measurement). Sizes: phone 390×844 and 320×568 (touch),
desktop 1200×800, 1366×800, 1440×900. "Hidden" = how much of the control the note paints over; "a press lands on" = a
REAL tap or click on the control's own middle.

| Page | What the note covers at the top of the page | When scrolled |
|---|---|---|
| View-only Sched | the name search box — phone: 100% hidden, **a press lands on Retry** (390 and 320); desktop: 88% hidden at all three widths, its right part goes to Retry | phone: pucks and warning chips pass under it |
| Edit Schedule | the name search box — phone 390: 100% hidden, **a press lands on Retry**; phone 320: also Highlight (39%) and the ⋯ menu (100%); desktop 1200/1440: search box 88%; **desktop 1366: the account button 91% and Logout 10%** (see "A second fault") | rows and the issues strip pass under it |
| Inputs | nothing at the top | phone 320: date chips up to 90% |
| Quals | phone: the date box (19% at 390, 77% at 320); desktop: the filter box 88% at all three widths | phone: the sort buttons (62–76%), SANS; some spots go to Retry |
| Logic | nothing at the top | phone: the pinned search and its tabs, partly |
| Leave War | phone: "+ New" (21% at 390, **100% at 320**) and the period picker | — |
| Tracker | phone 390: the syllabus picker 96%, **its edit button 100% — a press lands on Retry**, Save changes 20%; phone 320: the course picker, its edit button 100%, File, Find; **desktop, all three widths: ✓ Save changes 96% hidden — a press lands on Retry** | the same (its bar stays put) |
| Help | nothing at the top | phone 320: the Category box 21% |
| Admin | nothing | nothing |
| **The scheduler board (full screen)** | **the warning cannot be seen at all** — the board lies over the top bar and the note with it (`sn-board.mjs`, phone 390 and desktop 1366: FAIL, FAIL) | — |

Real presses taken by Retry (the `a real press … is not taken by Retry` lines): the search box on both schedule pages
at 390 and 320; the Tracker's syllabus edit button at 390; the Tracker's ✓ Save changes at 1200, 1366 and 1440.

**A second fault, found here:** the note works out its place when it comes up and on a window resize, never on a page
change. Go from a page whose top bar is one line to one where it is two (Edit Schedule at 1366) and the note stays at
the old height — ON the bar's second line, over the account button and Logout
(`before/desk-1366-editsched.png`).

## THE PROPOSAL — shown to him before any layout change (D541, D586)

**A band of its own along the bottom of the top bar.** When a save has failed the top bar grows by one line (36 px)
and the warning fills it, edge to edge: "⚠ Not saved — keep this page open" and a larger Retry (right-hand end on a
desktop; words left, Retry right on a phone). The page below moves down by that one line, so nothing is covered —
the bar is simply taller, and everything that already follows the bar's height (it is one line or two by page and
width today) follows this too. It goes when the save lands. The passing "Saving…" note stays as it is: it never takes
a press and must not move the bar ([LW-FIGSEL-FLAKE]). The full-screen board gets the same band under its own bar.

Why not the others (said to him in plain words): the bottom of the screen already carries the week's sideways
scroller, the phone's sheets and a snack note; a slot inside the bar's row is what made the bar wrap and the page jump
on every save (the fault the floating note was built to cure); any floating place covers whatever scrolls under it.
The cost of this one: the page shifts down one line once, at the moment a save fails, and back when it lands.

Drawn on the RUNNING app with a throwaway style sheet and script (`SN_CSS` / `SN_JS` of `sn-cover.mjs` — kept outside
the repo, no source changed) and measured the same way: pictures in `…/2026-10-05-save-note-controls/proposal/`.
**Result of that run: 280 PASS, 0 FAIL, no browser errors** — at all five sizes, on all nine pages, at the top and
scrolled: the warning seen whole, no control covered, no sideways scroll, and a REAL press on Retry (with storage
working again) saves and clears it. What that run does NOT prove: it is a drawing laid over the app, not the build —
the board, a page change, the member, a short screen and every gate are still owed (below).

His page of before-and-after pictures (private Artifact): https://claude.ai/artifact/Ju7P8Y52PsMJrg8CCGeWmG

## What is NOT done (everything after his answer)

- The build: `ui/SaveStatus.tsx`, `ui/scheduler/17-save-status.css`, the board's bar; the note re-placed on a page
  change; the wording, if he accepts it.
- The tests, red first: a browser test per page × size that the element at each control's middle is that control with
  the warning up (the item's own ask), Retry pressed for real, the board, the page-change case; the existing
  "Saving… never moves the top bar" test stays green.
- The roll-call table of the BUILT thing; the walk at phone, desktop and a short screen; member as well as admin; a
  window, the drawer and the board open; the break test; the five gates; Astra's read; his look.
- Owed with Astra's read (D138): D586's short line read against its full row by a model that did not write it.
- Not yet looked at: the Inputs full-screen calendar, a phone on its side, the member's pages.
