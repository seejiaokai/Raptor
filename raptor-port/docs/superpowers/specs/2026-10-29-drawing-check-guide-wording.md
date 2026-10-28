# The drawing check — the guide wording to put to him (D1494, 29 Oct 26)

**Status: DRAFT, not in the guides.** Two working guides change (D70 — Astra and Sol 6.1). With the ChatGPT readers out
until about 1 Nov 26, it was read by one fresh, blind Opus reader instead (29 Oct 26, "approve with the fixes": all 16
taken, below); the two owed reads are written on `[NO-ASTRA-LIST]` (D761) and named to him when it is put to him. Nothing
goes into the guides before his approval. The script it describes is on `claude/drawing-check-b783bd`
(`raptor-port/scripts/drawcheck/`), proved on M5a (`raptor-port/docs/img/handpass/2026-10-29-drawcheck-m5a/report.md`).
Backlog: `[DRAWING-CHECK]` (filed on the M5a branch). §10 replaces the M5a branch's placeholder, so it goes in after
pull request 586 merges.

## 1. `raptor-port/docs/bug-check-order.md`

**1a. §7.0, a new bullet after "The floor."**

> - **A screen with an approved drawing gets the drawing check (his D1494, 29 Oct 26).** The sizing lines name each
>   such surface's drawing and the check's part list for it (`scripts/drawcheck/specs/`); the check is run as §7.10
>   says, and the walk does not stand in for it, nor it for the walk. A surface whose drawing has no part list or no
>   record yet gets both first (`docs/walk-scripts.md` §10). A screen drawn at one size only is said so here, and its
>   other size is carried by the walk. Where no drawing exists, nothing here applies.

**1b. §7.10, the bullet "The built screen beside its drawing." replaced by:**

> - **The built screen beside its drawing — measured as well as looked at (his D1494, 29 Oct 26).** The drawing check
>   (`scripts/drawcheck/check.mjs`, `docs/walk-scripts.md` §10) measures each named part of the build against the
>   approved drawing at the size that drawing was taken at — where it sits, its size, its fill, edges and corners, where
>   its words sit and what they say — and lists every difference over about 2px with the two side by side and laid over
>   each other. Its part list carries a state at his iPhone's size and at his PC's for every screen drawn at both. It
>   runs while the screen is built and after every fix. The check sees only the parts its list names; the side-by-side
>   look by eye stays, for everything the list does not name.
>   While the screen is built, a difference is put back to the drawing (D1424), or kept on purpose for a better design
>   and named to him with its picture; once the build has gone for his look, each difference is shown to him side by
>   side before any is put back, an outright fault (words breaking, something covered or off screen, a wrong behaviour)
>   fixed without asking (D1426). The check stays red until each difference is put back or he has ruled to keep it —
>   one put to him and not yet answered stays red; a difference he keeps is recorded as §10 says.
>   Each row's height and each pair of side-by-side boxes (his lessons 42 and 43) are named as parts with their place
>   and size, so a row taller than drawn or a box off its neighbour's line shows as a difference from the drawing; the
>   check does not test two built boxes against each other, so lesson 43 on a row the drawing does not show is measured
>   by the walk.
>   Checked by eye, M4's screens reached him with differences he found himself (D1424) and M5a's with seven its walk had
>   to find (D1493); run on M5a's build as it stood, the check caught every one that build still had, found the Grades
>   window matching, and found two more nobody had seen.

## 2. `raptor-port/docs/walk-scripts.md`

**2a. The header's second line becomes:** "A walker reads §3 to §7; §1, §2, §8, §9 and §10 are the host's."

**2b. §10 (replaces the placeholder "The drawing check — D1494 (to build)")**

> ## 10. The drawing check (his D1494, 29 Oct 26)
>
> The script is `scripts/drawcheck/` — `record.mjs`, `check.mjs`, `compare.mjs`, a part list per screen under `specs/`,
> and `selftest.mjs`. The worked example is M5a's (`specs/lw-m5a.mjs`).
>
> - **Record the drawing when it is drawn**, from `raptor-port/`: `DRAWCHECK_SPEC=scripts/drawcheck/specs/<screen>.mjs
>   DRAWCHECK_APPROVED=<the approved pictures' folder> DRAWCHECK_DIST=<the drawing's build> DRAWCHECK_DRAWN_ON='<branch>
>   at <commit>' [DRAWCHECK_ORIGIN=<the address the drawing script opens; default http://localhost:4197>] node --import
>   ./scripts/drawcheck/record.mjs <drawing script>`, the drawing script's own pictures sent to a scratch folder, never the
>   approved one. At each picture the part list names, it saves every part's measure and a whole-screen picture beside
>   the drawing (`docs/mock/<area>/drawcheck/`). Each record says whether its replay drew the approved picture (no pixel
>   more than 24 colour levels off); a record that differs, or that was never compared, is not a record of the approved
>   drawing — find why, or record it again, before trusting it. The drawing's build is the commit it was drawn on, built
>   as §8 says.
> - **Name the parts a person would point at** — the window, a row, a switch and its lit half, a column of figures, a
>   name — each with its drawing selector, its build selector and what is compared. A part inside another is measured
>   from it (`rel`), so a row that moved down the page does not make every figure in it "move". A figure with no box of
>   its own is judged by where its words are drawn (`words-place`), never by an invisible box's width.
> - **Bring the build to the drawing's own world** — the same people, leave and clock, the same lock and switches: each
>   state's `reach` in the part list brings the build there through the same doors the drawing's stage script used
>   (M5a's: the bids by the localhost bridge, approve and refuse pressed in the real window), and returns a sentence when
>   it cannot — the state is then NOT CHECKED. A drawing taken with the page scrolled says nothing about a window docked
>   by the page's position: give every docked or floating part a second state measured against the same record
>   (`drawing.record: '<state>'`) with the page at its top (M5a's window stood 136px lower there, and matched in the
>   drawing's own scroll).
> - **Run it after every change**, from `raptor-port/`: `npm run build`, then `node scripts/drawcheck/check.mjs
>   scripts/drawcheck/specs/<screen>.mjs --dist dist --out docs/img/handpass/<date>-drawcheck-<screen>` (each run empties
>   its `--out` folder: give the run whose pictures go to him a folder of its own, §6). Red while any difference is
>   unexplained, any state has no drawing record, or any state could not be reached (its `reach` returned why); page
>   errors are listed but do not turn it red. Open the pictures before reporting a difference: a part off the screen is
>   listed, not pictured.
> - **A difference in a rule with no visible effect** (an edge of no width, a see-through fill) is the comparing's
>   fault: fix it in `compare.mjs`, add that look to `selftest.mjs` as one that must not count, and name it in the
>   closing report — never drop the part or its check to turn the run green.
> - **Each difference goes to him side by side (D1426)** — the report's pictures are that page's pictures. One he keeps
>   goes into the part list's `accepted` list — `{ state, part, check, why }`, `why` naming his ruling — with `check` set
>   to the one kind of difference he kept (place, width, fill…), so a new difference in the same part still turns the
>   check red (the script refuses an entry without it); the report still shows the kept one, marked.
> - **After any change to the comparing**, run `node scripts/drawcheck/selftest.mjs` (it feeds the comparing each kind
>   of difference M5a showed, and each look that must not count, and fails on a miss); after a change to the measure,
>   the recorder or the runner, re-run the check on M5a's build at 794346689 and compare its report with the committed
>   one.

## The blind read (29 Oct 26) — what was changed

All sixteen findings were taken: the title "measured as well as looked at" and the look by eye kept (1); the size each
state is checked at, and phone states added to M5a's list for the Balances page and Days taken (2); D1424 while building,
D1426 after, red until put back or kept by his ruling (3); the `accepted` entry named, its `check` now required by the
script (4); the run command from `raptor-port/`, the build first, its own `--out` (5); what else turns it red (6); every
setting of the recorder, the scratch folder, the 24-level tolerance — and the recorder now refuses a self-comparison (7);
how `reach` stages, and `drawing.record` (8); a rule with no visible effect fixed in the comparing, never by dropping a
part (9); said once each (10); a part list before a record (11); what the self-test covers (12); lessons 42 and 43 (13);
the proof sentence (14); the header's §10 (15); the reads owed (16).
