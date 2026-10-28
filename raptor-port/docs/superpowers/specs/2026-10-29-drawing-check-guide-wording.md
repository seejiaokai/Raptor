# The drawing check — the guide wording to put to him (D1494, 29 Oct 26)

**Status: DRAFT, not in the guides.** Two working guides change (D70): it is read by a fresh, blind Opus reader (D790 —
the ChatGPT readers are out until about 1 Nov 26), then put to him; nothing goes into the guides before his approval.
The script it describes is built on `claude/drawing-check-b783bd` (`raptor-port/scripts/drawcheck/`), proved on M5a
(`raptor-port/docs/img/handpass/2026-10-29-drawcheck-m5a/report.md`). Backlog: `[DRAWING-CHECK]` (filed on the M5a branch).

## 1. `raptor-port/docs/bug-check-order.md`

**1a. §7.0, a new bullet after "The floor."**

> - **A screen with an approved drawing gets the drawing check (his D1494, 29 Oct 26).** The sizing lines name each
>   such surface's drawing and the check's part list for it (`scripts/drawcheck/specs/`); the check is run on the build
>   before the walk starts and after every fix, and the walk does not stand in for it, nor it for the walk. A surface
>   whose drawing has no record yet is recorded first (`docs/walk-scripts.md` §10). Where no drawing exists, nothing here
>   applies.

**1b. §7.10, the bullet "The built screen beside its drawing." replaced by:**

> - **The built screen beside its drawing — measured, not looked at (his D1494, 29 Oct 26).** The drawing check
>   (`scripts/drawcheck/check.mjs`, `docs/walk-scripts.md` §10) measures each named part of the build against the
>   approved drawing at his iPhone's size and his PC's — where it sits, its size, its fill, edges and corners, where
>   its words sit and what they say — and lists every difference over about 2px with the two side by side and laid
>   over each other. It runs while the screen is built and after every fix (D1424) and stays red until each
>   difference is put back or put to him (D1426); one he keeps goes into the part list's kept list with his ruling.
>   By eye, M4's and M5a's builds passed differences he then found; run on M5a's build as it was, the check caught every
>   one the eye had listed, found the Grades window matching, and found two more nobody had seen. Each row's height and boxes side by side on one centre line (his lessons 42 and 43) are
>   parts in its list.

## 2. `raptor-port/docs/walk-scripts.md` §10 (replaces the placeholder "The drawing check — D1494 (to build)")

> ## 10. The drawing check (his D1494, 29 Oct 26)
>
> The script is `scripts/drawcheck/` — `record.mjs`, `check.mjs`, a part list per screen under `specs/`, and
> `selftest.mjs`. The worked example is M5a's (`specs/lw-m5a.mjs`).
>
> - **Record the drawing when it is drawn.** Run the drawing script with the recorder beside it
>   (`DRAWCHECK_SPEC=… node --import ./scripts/drawcheck/record.mjs <drawing script>`): at each picture the part list
>   names, it saves every part's measure and a whole-screen picture beside the drawing, and — given the approved
>   pictures' folder — proves the replay draws the approved picture pixel for pixel. A record whose replay differs is
>   not a record of the approved drawing: find why before trusting it. An older drawing is replayed on the build it was
>   drawn on, served from its own built folder (`DRAWCHECK_DIST`), no server needed.
> - **Name the parts a person would point at** — the window, a row, a switch and its lit half, a column of figures, a
>   name — each with its drawing selector, its build selector and what is compared. A part inside another is measured
>   from it (`rel`), so a row that moved down the page does not make every figure in it "move". A figure with no box of
>   its own is judged by where its words are drawn (`words-place`), never by an invisible box's width.
> - **Bring the build to the drawing's own world** — the same people, leave and clock, the same lock and switches (the
>   staging is the drawing's stage script, through the app's own controls). A drawing taken with the page scrolled says
>   nothing about a window docked by the page's position: give every docked or floating part a second state with the
>   page at its top (M5a's window stood 136px lower there, and matched in the drawing's own scroll).
> - **Run it after every change**: `node scripts/drawcheck/check.mjs specs/<screen>.mjs --dist dist`. Red while any
>   difference is unexplained. Open the pictures before reporting a difference: a part off the screen is listed, not
>   pictured, and a difference in a rule with no visible effect is the check's to fix, not the build's.
> - **Each difference goes to him side by side (D1426)** — the report's pictures are that page's pictures. One he keeps
>   goes into the part list's kept list with his ruling; the report still shows it, marked.
> - **A change to the check runs `selftest.mjs` first**: it feeds the comparing each kind of difference M5a showed, and
>   each look that must not count, and fails on a miss.
