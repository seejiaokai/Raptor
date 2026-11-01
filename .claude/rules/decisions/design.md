---
paths:
  - raptor-port/src/**
  - raptor-port/docs/mock/**
  - raptor-port/docs/ui-contracts.md
  - raptor-port/docs/design-practices.md
  - .claude/skills/impeccable/**
  - .claude/skills/brainstorming/mockups-on-the-real-app.md
  - raptor-port/docs/img/**
  - raptor-port/docs/handpass/**
  - raptor-port/e2e/**
---

# Rulings — Screen design (how a screen looks and behaves)

**Loads by itself** whenever a session reads a file of screen work (the `paths:` at the top of this file): the app's
code, the mock-ups, the screen rules, the design guide and the design skill — the design guide's own paths
(`.claude/rules/ui-design.md`) — and the walks' pictures, evidence sheets and browser tests, where a fault on screen is
judged. Moved out of the general rulings on 1 Nov 26 (D1554), every line whole. The general rulings are in
`.claude/rules/decisions/how-we-work.md`, loaded in every session — the rulings on how the agent works on design (pictures
with every design question, how mock-ups are drawn and checked, the design guide's lessons, the design skill, what the app
is meant to be) stay there; the map of every ruling and how to add or retire one: `DECISIONS.md`.
**One line per ruling — its number, its date, the rule as it stands (D390). Its full row** — his words, the readings he
was told, where it lives — **is in `.claude/decisions-full/design.md`, never loaded by itself: open it before acting on a
ruling's detail or asking him about it** (`grep -h '^| D… |' .claude/decisions-full/*.md` — the shell; the Grep tool
hides a long row). A "— changed by" tail names the later rulings that changed it. Newest first.

| # | Date | The rule |
|---|---|---|
| D1567 | 2 Nov 26 | On a phone the page itself never zooms: only the grids that zoom by their own pinch (the Leave War grid and its OIL tab, Quals, the Scheduler Board’s desktop layout) zoom, and a pinch anywhere else does nothing, so the page can never be left zoomed in with no way out. |
| D1523 | 30 Oct 26 | A window he has resized but never moved moves down below a failed save's "Not saved" band, as a window not yet placed does, so the band and its Retry are never covered (D587); a window he has moved keeps its place. |
| D1518 | 29 Oct 26 | Nothing pinned on screen leaks: a bar, or any other part that stays put while what is under it scrolls, shows none of that content behind it or through a gap at its edges — at every zoom and every scroll position; the desktop week's ‹ › arrows excepted, which stay see-through (D1522). — changed by D1522 |
| D1509 | 29 Oct 26 | The one settings gear everywhere in the app is the Leave War's drawn line gear, the ⚙ symbol going wherever it stands today (the Inputs calendar, the OIL tracker, the Tracker's flex settings, the Scheduler Board's flying-waves gear). |
| D1138 | 21 Oct 26 | Help's and Admin's titles take the size and weight of Logic's page name and keep their place; the pages without a title stay without one. |
| D1134 | 21 Oct 26 | Every pencil in the app is one design, the solid pencil of his picture (filled, eraser at the top left, tip at the bottom right), drawn by the app so every device shows it alike, never the ✏ emoji, the line pencil included; only a ✎ inside help text, or after an edited chart's name in the Tracker's Syllabus list, stays typed. |
| D1126 | 21 Oct 26 | On every page the top bar's compact look reaches up to 1599 wide — Undo and Redo as their arrows only, their names on hover, and the sync pill its dot alone — so Edit Schedule's top bar, which carries the changes clock too, stays on one line at his PC's 1536 like every other page. |
| D1127 | 21 Oct 26 | Every search box in the app looks like the Edit Schedule week's: a grey line magnifier inside the box on the left, the box as tall as the buttons beside it; each keeps its own words, because each finds something different. |
| D1122 | 21 Oct 26 | Arrows on either side of words that change — a day, a month, a count — keep their place as the words change: the words get the room their longest value needs, so the arrow pressed again and again never moves; first Edit Schedule's crew panel ‹ day ›, then every such place in the app, found and fixed. |
| D926 | 15 Oct 26 | The design guide carries "a page's controls are one row" as worded in version 2 (§3 — D911), and the Edit Schedule's "Legend" fold stays alone on its row as built: a fold is not a button. |
| D895 | 15 Oct 26 | The design guide's two drag rules go in as worded in version 2 (one drop, one landing line; carried to the edge, the view follows — a section of their own, §5A "Dragging"), and the branch carrying them and the work behind them goes live on this "merge live". |
| D887 | 15 Oct 26 | The design guide carries "No mark in this app glows" as worded in version 4, all its readings approved; the balance bar's and move banner's band, the fast sync dot's and Admin → Users' dots' bands go; the sign-in logo's light and the page's faint wash stay, as the app's own sign. |
| D876 | 15 Oct 26 | The design guide carries "one mark, one look" as drafted in version 2 — the plain blue ring (the Leave War's cyan, D1449), no glow, on the edge of the thing added — all five readings approved: a row's controls outside the ring; a line, row or wave ringed round itself; any table row one box; no other flash over it; a new kind of mark his to rule. — changed by D1449, D1038 |
| D850 | 14 Oct 26 | Feedback for an action is designed into the screen itself, and a passing note is not raised for every action — only for what is important and not intuitive, or complicated; the design guide says so. |
| D726 | 10 Oct 26 | The app's screens are not wordy: a label, a hint or a line of small print earns its place or goes — fewer words on screen, the same information. — changed by D836 |
| D672 | 8 Oct 26 | Everywhere in the app, undo and redo leave the screen where it is when what they change is already in view; the screen moves to the change only when it is out of view. |
| D587 | 5 Oct 26 | A failed save's warning ("Not saved — keep this page open", retry) has a band of its own along the bottom of the top bar — the page moves down one line, nothing is covered; the same band under the bar of every full-screen surface that covers the top bar, but not in a window, sheet or menu (a short visit); the passing "Saving…" note stays as it is. — changed by D841 |
| D349 | 28 Sep 26 | The undo-topbar mock-up is approved as drawn: the Tracker's own Undo / Redo move to the top bar too, and the Scheduler Board's bar gets sync and the bell and one exit, ✓ Done (✕ Close goes), with Sort all and the layout switch behind one ⋯ on a phone. — changed by D481 |
| D348 | 28 Sep 26 | On a phone the top bar's buttons run in the desktop's order: Undo · Redo (· the changes clock on Edit Schedule) · the sync dot · the bell — the bell at the far right. |
| D347 | 28 Sep 26 | Every Undo / Redo pair sits in the top bar, in the same place, order and look as Edit Schedule's — on the desktop and on the phone; the Scheduler Board keeps its own bar (D349). — changed by D348 |
