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
| D1680 | 5 Nov 26 | The boxes and buttons whose font line the browser dropped show the app's letters at the size and weight each line meant, as drawn. |
| D1666 | 5 Nov 26 | The app's address takes a test switch, `?savefail`: in the one tab opened with it every save is refused, so the "Not saved" band, its Retry and the pass's "Not sent yet" can be seen on his own iPhone; without it the app saves as always, and nobody else is touched. |
| D1665 | 5 Nov 26 | The app's other "not saved" messages — a refusal of one change (a Leave War figure box, the grades window, the schedule's refused change, a document too big to store) — take one matching look of their own, kept apart from the "Not saved" band's; each is pictured today and the common look drawn for him before anything is built (D1625). |
| D1664 | 5 Nov 26 | While a save has failed, the pass after asking for access reads "Not sent yet" in the band's amber — its mark and its first step — and its approved look comes back by itself once the save lands. |
| D1663 | 5 Nov 26 | His direction: the "Not saved" design is one design across the whole app. — changed by D1665 |
| D1643 | 4 Nov 26 | On a phone held sideways the page names always go into the side menu and the top bar is one row, for everyone, even where a member's fewer names would fit beside TALON. |
| D1642 | 4 Nov 26 | The page names beside TALON are built as the mock-up of 4 Nov 26 draws them: where they all fit beside TALON they stand there, the buttons after them or on a row of their own to the right; where they do not, they go into the side menu, unchanged, and the bar is one row. |
| D1641 | 4 Nov 26 | The page names, Edit Schedule to Admin, sit on the top bar's first row beside TALON; on any screen where they cannot all fit there, a phone or a narrow desktop, they go into the side menu as on a phone today; on a phone held sideways they always do (D1643). — changed by D1643 |
| D1638 | 4 Nov 26 | When Retry cannot fetch the page's files — no signal, a file cut off, or a save still waiting — it does not reload: the claw holds a full round and the card comes back, still signed in, the keyboard on Retry. |
| D1637 | 4 Nov 26 | The failed-download card keeps his words, "It didn't download. Check your signal, then retry.", though an app update since the tab opened is the other cause: Retry cures that case too. |
| D1636 | 4 Nov 26 | After a Retry that did not bring the page, the keyboard is back on Retry, which wears the app's own cyan focus ring; and the claw stands at least one full round of its three claws, about 1.3 s, so the press reads as tried. |
| D1635 | 4 Nov 26 | After Retry reloads the app, the app reopens the page that failed — the Leave War or the Tracker — by itself, once signed in, instead of its first page. |
| D1633 | 4 Nov 26 | Retry on the "Couldn't open the Leave War" (or the Tracker) card reloads the app once the page's files have come again (D1638): everything saved is kept, he signs in again until the database step, the Undo list starts empty; the card and its words stay; a failed background fetch shows the card when the page is opened. — changed by D1638 |
| D1632 | 4 Nov 26 | While the Leave War or the Tracker is still downloading after 8 seconds, a quiet grey line "Still loading…" shows under the loading claw, going with the claw when the page arrives, so a long wait on a slow signal does not look stuck. |
| D1631 | 4 Nov 26 | When the Leave War's or the Tracker's own download fails, only that page shows a card, "Couldn't open the Leave War" (or the Tracker), "It didn't download. Check your signal, then retry." and Retry, the top bar staying; a failed background fetch on a desktop shows nothing until the page is opened; the whole app never goes blank. — changed by D1633 |
| D1628 | 4 Nov 26 | The Leave War posting's delete from the Post out button, in the one-day sheet and the drag sheet, and the Delete key's "Delete this input for all N people?" on an input's card in the opened day become cards too, so each of these questions looks the same wherever it is raised. |
| D1627 | 4 Nov 26 | Of the questions drawn for D1626, only five become a card hanging from the control pressed: the input window's "Open the other input and lose them?", "Delete this input for all N people?" and "Take yourself out of this input?", and the Leave War posting's delete at its Delete chip and at its PO from date; every other question stays as today. — changed by D1628 |
| D1626 | 3 Nov 26 | A question raised by pressing a control appears right at that control, a small card hanging from it, because the hand is already there, never at the window's foot; the input window's "Close it and lose them?" (✕ and Escape) is built so, and every similar question in the app follows it. — changed by D1627 |
| D1618 | 4 Nov 26 | The start-up claw does not glide onto the logo: it keeps today's plain 0.2 s fade where it stands while the first screen appears, both logos briefly on screen; the hand-over of D1616 is not built. |
| D1617 | 4 Nov 26 | The claw's round stays as it is — its three claws drawn, held, faded, and drawn again from nothing, with its short dark moment between rounds; the overlapping next round is not built. |
| D1615 | 3 Nov 26 | The start-up claw shows on every start of the app, from its first moment, with no 0.3 s wait, even when the app is up a moment later; it still goes the moment the app has drawn itself, never adding to the load. |
| D1614 | 3 Nov 26 | Every page's background is the claw's plain dark: the faint blue wash at the top of the page goes, everywhere, so the moment before a slow page's claw and the claw look the same and the claw simply appears; the claw's one-frame-early raise (D1612) is taken out, so no time is added. |
| D1611 | 3 Nov 26 | The loading claw over a slow page shows from the tap, with no 0.3 s wait; only the pages measured to go blank raise it — the Leave War and the Tracker, on their first open after sign-in — so a page that opens at once never shows it. |
| D1610 | 3 Nov 26 | The loading claw for a slow page is one overlay for the whole app, covering the page area under the top bar, the top bar staying in view and in reach; any page not drawn within 0.3 s raises it; it is tried first on the Leave War, built on the branch as a test for his phone before the other pages are measured. — changed by D1612, D1611 |
| D1608 | 3 Nov 26 | On the sign-in and the access screens the claw sits 7px nearer "TALON" (option B): the word's left padding, which only balanced the letter spacing after its last letter, becomes a pull-in on its right, so the pair stays centred and reads as one mark. |
| D1607 | 3 Nov 26 | The loading claw also shows while any page that loads slowly opens — the Leave War and the Tracker among them, as his recording shows — in the blank moment before the page is drawn, never added to the time it takes; designed and drawn for him before it is built. — changed by D1610 |
| D1606 | 3 Nov 26 | The rename to TALON is built as the page listed: the sign-in and access screens, the line "Training · Availability / Leave & Ops Nexus", the top bars' "142 TALON", the tab title, the start-up failure messages, the spoken names; the Leave War's "Raptor-owned" words become "filed on the Inputs page"; a home-screen name TALON; the web address stays. |
| D1605 | 3 Nov 26 | The loading claw is built as its page recommended: each claw drawn along its own line, 0.42 s each, 0.16 s apart, held whole 0.55 s, then faded and drawn again; the sign-in's light round it, 72px, the claw alone; shown only after 0.3 s, so a quick load shows nothing; still for less motion; gone the moment the app is up. — changed by D1615 |
| D1591 | 3 Nov 26 | While the app loads it shows the blue talon logo drawn as a claw scratch: the left claw first, top to bottom, then the middle, then the right, then all three whole, repeating; light enough to add nothing to the load time, and shown to him as a moving mock-up before it is built. — changed by D1612, D1607 |
| D1590 | 3 Nov 26 | The app is called TALON (Training, Availability, Leave & Ops Nexus), not RAPTOR: everywhere the app names itself for a person is changed, the sign-in, the top bar, the browser tab, prints and exports; the talon logo stays. |
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
| D887 | 15 Oct 26 | The design guide carries "No mark in this app glows" as worded in version 4, all its readings approved; the balance bar's and move banner's band, the fast sync dot's and Admin → Users' dots' bands go; the sign-in logo's light and the page's faint wash stay, as the app's own sign. — changed by D1614 |
| D876 | 15 Oct 26 | The design guide carries "one mark, one look" as drafted in version 2 — the plain blue ring (the Leave War's cyan, D1449), no glow, on the edge of the thing added — all five readings approved: a row's controls outside the ring; a line, row or wave ringed round itself; any table row one box; no other flash over it; a new kind of mark his to rule. — changed by D1449, D1038 |
| D850 | 14 Oct 26 | Feedback for an action is designed into the screen itself, and a passing note is not raised for every action — only for what is important and not intuitive, or complicated; the design guide says so. |
| D726 | 10 Oct 26 | The app's screens are not wordy: a label, a hint or a line of small print earns its place or goes — fewer words on screen, the same information. — changed by D836 |
| D672 | 8 Oct 26 | Everywhere in the app, undo and redo leave the screen where it is when what they change is already in view; the screen moves to the change only when it is out of view. |
| D587 | 5 Oct 26 | A failed save's warning ("Not saved — keep this page open", retry) has a band of its own along the bottom of the top bar — the page moves down one line, nothing is covered; the same band under the bar of every full-screen surface that covers the top bar, but not in a window, sheet or menu (a short visit); the passing "Saving…" note stays as it is. — changed by D841 |
| D349 | 28 Sep 26 | The undo-topbar mock-up is approved as drawn: the Tracker's own Undo / Redo move to the top bar too, and the Scheduler Board's bar gets sync and the bell and one exit, ✓ Done (✕ Close goes), with Sort all and the layout switch behind one ⋯ on a phone. — changed by D481 |
| D348 | 28 Sep 26 | On a phone the top bar's buttons run in the desktop's order: Undo · Redo (· the changes clock on Edit Schedule) · the sync dot · the bell — the bell at the far right. |
| D347 | 28 Sep 26 | Every Undo / Redo pair sits in the top bar, in the same place, order and look as Edit Schedule's — on the desktop and on the phone; the Scheduler Board keeps its own bar (D349). — changed by D348 |
