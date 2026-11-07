# The bug check, step by step — which part of the order to open, and when

**What this is (the rules diet, step 3 — his D1735, 7 Nov 26):** the way into `bug-check-order.md`. That file stays the
authority and is not cut; this page is its order of steps, each with the section to open when the step comes. **Open
every section a step names, whole, when that step applies** — a section that applies is a required read, never skipped
to save room, and its one line here is a reminder, never the rule. A step that does not apply to the tier is passed,
said so in the sheet. To open a section, find its heading or bold start (`grep -n '^## 6\.\|^\*\*7\.0 ' docs/bug-check-order.md`)
and read from there to the next. Never from memory — the order changes.

## The steps

1. **It has fired** (`.claude/rules/bug-check.md`, the order §0a): a bug check, a test, a "make sure it works", a
   change under `raptor-port/src`, work about to be called done, a fault he reports, a finding about to be acted on.
2. **The tier.** Open **§5** (whole: the eight questions, the tier rule and table, the batch and order-of-steps rules)
   and **§2b** (what is not a finding). Answer the eight — money (OIL included), the published record, saved data, a
   shared drawer, a new gesture or mode, a new surface, roles, the warning list; a question not answerable NO with a
   written reason is YES. YES to 1, 2, 3, 7 or 8 → FULL; else YES to 4, 5 or 6 → WALK; else cosmetic on one surface →
   LOOK; words only → NONE. A cosmetic change to a shared drawer is never LOOK.
3. **Tell him, in one block** (§0a step 3): the tier, its checks, the walk's size and why (step 9), and how long — from
   the last recorded run or "not measured". He reads it; he does not choose it.
4. **Something new he will see** — a box, a message, a mark, a button, even inside a fix: drawn and shown to him before
   it is built (§5, D1625; §11 for a look he uses daily).
5. **The rulings that apply** — listed, any clash flagged and resolved (§12's second box; `raptor-port/CLAUDE.md`'s
   standing order "sweep the rules"); on FULL each is walked against the build (§5's table, §2a's "Rules and logic").
   **FULL also:** the scenarios designed by a reader who did not build it — open **§4** (who reads now, the finder
   wording, what is not a finding, "before a brief leaves").
6. **Build, then open the pull request into `main`** — GitHub's run is the gates while the repo is public (§5, D1086).
7. **The roll-call** (WALK with a shared drawer, and FULL) — open **§6** and §2a's table for the kind of work. Name the
   thing; list every place the app draws it; three columns — does it SHOW, is the gesture USABLE, what else is PAINTED
   there; each cell YES / NO-because / MISSING, no blanks. §6's extra rows apply by kind of change (a floating surface,
   a wording, a navigating action, a changed quantity, a removed control, a storage writer, a new kind of record, who
   counts as away, and the rest) — read the list each time.
8. **The door check** (a new gesture or mode): every action the data allows → the control that does it, in every state
   and order (§3, §2a).
9. **Size the walk** — open **§7.0** and the walk ledger's sizing step (`docs/walk-ledger.md` §Before any walk). Five
   lines into the sheet; a WALK or FULL never has no walk; a screen with an approved drawing gets the drawing check; a
   test carries only repeated cases of a route already walked; resize when the evidence changes. **Go through every
   lesson below**, in the sizing lines and in each walker's brief: for each, the scenario or named test that covers it,
   or why it cannot apply — opening its full text in **§7.11** for each that applies.
10. **The plain-user round** (**§7.0a**): the area's everyday tasks start to finish, every control that opens or closes
    something pressed, every other place that shows the result looked at.
11. **The fixture** — the day that has everything on it, in the demo seed (**§7.1**), made through the app's own controls
    (**§7.7**).
12. **Stand up the real build** (**§7.2**): the production build served locally, fresh, phone and desktop, errors watched;
    before writing a walk script or a walker's brief, `docs/walk-scripts.md`.
13. **Walk** — open **§7.3 to §7.10**: surfaces, not rulings; every order and state table; a gesture asserted as the person
    sees it; what each engine does; the picture right after a press, pinned cells, the build beside its drawing, a close-up
    of each new control. Helpers walk in their own worlds and the host opens every deciding picture and reproduces every
    finding (**§4**, the fan-out paragraphs and the table of what each part holds still).
14. **Walked enough, and each MISSING disposed of** (**§7.5, §7.6**): fixed with a red-first test, ruled "leave it" by him
    with its date, or filed with its place — "rare" is not a disposition.
15. **The tests find rather than confirm** (**§8**): over the roll-call, on the everything day, written the way the app
    writes, red first, one break test per wired surface.
16. **The reads, after the walk** (FULL, and any job that needs a code read) — open **§4** ("Who reads the finished code
    now", the brief, "What to do with what they hand back") and **§4a**: readers get the evidence sheet and the roll-call
    and are asked for what is missing.
17. **Fix, then re-walk what the fixes touched** (§5: the re-walk, a fix is new code, the touched suite between rounds).
18. **The gates green on the last pushed commit** (§5; `.claude/rules/shipping.md` §The checks).
19. **The evidence sheet** — open **§9**: made at the start with every heading and the roll-call drawn; the closing report
    carries the `Walk:` line (or `Walk: NOT DONE — <reason>`), and the `Docs:` and `docsize:` lines copied from
    `npm run docsize`. No `Walk:` line, no "ready for merge live".
20. **Before calling it bug-checked** — open **§12** and tick every box; nothing stands in for an unticked one.
21. **His look** (**§11**): last, a "look here" card of three to five lines in the app's own words.
22. **A fault he finds that a walk missed** (§7.11's head, D1297): fixed red-first the same day, and why the walk missed it
    written as a new lesson there, read by one fresh reader, named in the closing report.

**LOOK:** the gates, one before-and-after picture at phone and desktop, a two-line sheet (§5); a surface an earlier walk
script already pictures re-runs that one step into a new folder (§5; `docs/walk-scripts.md` §6). **NONE:** nothing.
**Background, opened when asked why or when changing the order:** §1, §2, §3, §9a, §10, §13.

## The lessons of §7.11 — one line each of what to check (his words and each case stay there)

1. A surface with more than one state: a table of state × every reading it shows, each cell a scenario or a named test.
2. Every drag and swipe at a person's ordinary speed as well as slowly — a quick flick, a short hold — on the phone.
3. After every press: what tells the person it happened, and what is out of sight — pictured.
4. A window that leaves the page behind it working: press the page behind it; does what lights match what the window says?
5. A box or row moved into sight: checked at its resting place against everything that can stand over it, pictured there.
6. A change that hands something to the phone itself: name what only the real phone draws; his look or recording before
   merge.
7. Something steered frame by frame against the phone's own motion: no stand-in proves it — his recording first, and
   the design question (hand the motion to the phone) before a model.
8. A screen with an approved drawing: compared with it while built and after every fix; a departure named to him.
9. Every list or table measured, heading against figures on every line, phone and desktop, each kind of row inside it.
10. A page hidden and shown again: change it while hidden, wait past idle, come back by every route, in WebKit; the
    first frame of each switch pictured.
11. A reading that depends on how much fits: zoomed out at 1536 and at 2560, pressed at the year's two ends.
12. Every page each window can be opened from: open and close it from each; the window in sight, the page under it as left.
13. A pinch part-way down a list as well as at its top, fingers drifting, pictured mid-pinch.
14. A keyboard walk's boxes found by searching the code, never from memory, each tapped on the phone.
15. Every bar over a scrolling area: its own fill, in front; the spill forced; zoomed in and out, scrolled.
16. After a refusal or warning at a box: tap away, tap it afresh, type the figure it shows.
17. Every control that shows, hides or resizes part of a page: pressed both ways and back, the page measured after each.
18. A change that prints or downloads: its result seen in print pictures in Chromium and WebKit; the real phone on his
    look card.
19. Every window over another closed by each of its own ways, on a touch screen in WebKit and a desktop; the window
    under it as it was.
20. A gesture the ways a hand makes it — slow, quick, short, long, curling, again before it settles — traced frame by frame.
21. A test browser's touch is not his phone's: where his fault does not reproduce, an on-screen log of what his phone
    hands the page, before any fix is guessed.
22. What a person is meant to see is checked by what is drawn — pixels in its box — first frames included.
23. Before asserting what a tap opens: what the rulings say a tap on that kind of entry opens on an ordinary day, walked
    side by side.

**And the second "23", written after §8:** every screen a walk pictures is checked for the standing layout lessons — each
pair of side-by-side boxes one height and one line, phone and desktop.
