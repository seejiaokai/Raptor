# Walk scripts, walkers' briefs and break tests — how they are written, and what each trap has cost

**Tier 2: read before writing a walk script, a walker's brief or a break-test list; every walker's brief names this file.**
**A walker reads §3 to §7; §1, §2, §8, §9 and §10 are the host's.**
The method is `docs/bug-check-order.md` (§4 the fan-out, §5 the re-walk, §7 the walk, §8 the break test) and a walk's
size is `docs/walk-ledger.md`. This file is the HOW. Every line is here because a walk, a re-walk or a break test once
reported something untrue — a fault that was the script's own, or a pass that proved nothing. The drivers are in
`raptor-port/scripts/handpass/` (`lib.mjs`, `trk-lib.mjs`; the break runners `breaks.mjs` and `breaks-browser.mjs`); the
traps of their own selectors are in `docs/handpass/README.md`. Written 13 Oct 26 from the skill notes of 24 Sep – 13 Oct 26; extended 27 Oct 26 from those of 13–26 Oct 26.

## 1. Before the walkers start

- **The host runs its own short walk on the shared helpers first.** Every trap it meets — a selector whose class has
  since gained a second use, a helper borrowed from an older walk that names a field by its old id — goes into the
  walkers' brief by name ("Known traps in the drivers"). A walk's private helper file is evidence of that day's screen,
  not a library: prove a borrowed helper's first step against the present screen before building a fixture on it.
- **One served folder a round** (the order's §4). A server found already running is used only once it is proved to
  serve this build: the hashed bundle name in the index page it serves equals the local build's. Check a port is free
  before pointing a run at it (`docs/gates-and-deploy.md`).
- **A new script's name carries its job's word and is proved free** — list the folder and search `docs/file-map.md`
  first. A write tool that answers "updated" to what was meant as a create is a stop (14 Oct 26: a new walk script went
  over the previous day's script of the same name, and was run and cited under it).
- **The clock is set to a start time and left RUNNING.** A frozen clock gives two records filed minutes apart the same
  moment, and a rule that tells them apart by time then matches them — a FAIL of the walk's own making. Hold it still
  only for a recording that must repeat byte for byte (§8), or for a scenario about one instant.

## 2. The walker's brief

- **It names this file, and carries the machine's traps itself** — a helper loads none of the host's memory. A script
  is written to a file with the file tool and run from there, never passed inline to the shell: backslashes are lost
  and an apostrophe fails to parse, often with no error. A script's rewrite and its run are never sent in one step —
  the run may use the old file — and a script prints a version line at the top of every run.
- **The route every scenario starts from is driven by the host first** — a browser test or a look script that passes —
  and the brief names that file as its recipe. A control named in a brief comes from that passing run, never from
  reading the source: the source says what exists, not what is on screen, in which panel, folded or open (13 Oct 26:
  the brief's take-off button was not on the board, and the card with "Accept" sat in a folded panel; the host's own
  browser test of the route failed three times on exactly those steps before anything of the app was wrong).
- **Scope and stopping:** the number of scenarios; one picture per assertion that matters; "stop and report after N
  failed attempts at one gesture"; "send your report ONCE, after stopping every script and browser you started". The
  report goes to a named file, and the hand-back message is a short summary. A walker's cost is its own token count
  (the harness's figure): a reading of his allowance needs the host silent for the whole window, so promise one only
  when it can be.
- **A scenario with an EXPECTED line is PASS or FAIL** (the order's §4), and its EXPECTED line was checked against the
  rulings before the brief left (the order's §4, "Before a brief leaves").
- **Each helper gets its own scratch sub-folder and its own output folder.**

## 3. Fixtures

- **A fixture that will be SAVED and reopened** — at another size, as another role, by another walker — is built on
  real storage in a fresh browser context, never on the app's "start fresh" address, which keeps nothing. Built there,
  the saved file is empty, the reopened world is a perfectly valid demo week, and every later step fails "no such
  line", which reads like a defect in the app. A new browser context is already clean. Straight after reopening a
  saved world, assert one fact the fixture made — a man on a row — before any step runs. (A saved world is also tied
  to its port: `docs/handpass/README.md`.)
- **A fixture step asserts that it landed** before the step that relies on it, and a helper answers every confirmation
  the real control can raise (the Leave War's "below zero — tap the same leave again") — or the fixture silently lacks
  its record and the failure is blamed on the app.
- **What an action created is named by the difference** between the ids before and after it, never by position: one
  door puts a new record at the top of a list, another at the bottom.
- **A fault seen only with a fixture planted straight into the data is checked through the real door before it is
  filed.** A planted record can have a shape no door writes (17 Oct 26: an end date without its year; a backlog item,
  its place and an engine change were built on it, and every real door writes the year). If the real door cannot
  reproduce it, the item says it was seen only in planted data.
- **A stand-in keyboard is set at the page's own height first, and plays his iPhone's measure as well as Chromium's.**
  The stand-in visible screen starts at the size the page had before its width was set (1668 on a 684 screen) — give it
  the real screen before the tap, or the app never learns the full height. And once the keys are up and the screen has
  panned, his iPhone gives every box from the top of the VISIBLE screen and the layout's height as what is left below
  it: a stand-in that only moves `offsetTop` tests a phone he does not have (four rounds of the keyboard fix passed
  every check on Chromium's measure — his `?kbdebug` recordings of 25 Oct 26 showed the other; the way to play his is
  `scripts/handpass/kbs-his-measure.mjs` and `e2e/kbscroll.spec.ts` KS3g). **Its motion is his phone's, measured off his
  screen — never the app's own numbers:** round 5's test played the keys' slide on the very curve the app glided on, so
  it could only pass, and the window dipped 90–145 points on his phone (his recordings of 11:49 and 11:54 — the slide read
  at sixty frames a second off the `?kbdebug` readout, which stands at the pan: `kbs-slide-walk.mjs`, KS3j).

## 4. Steps, and what they assert

- **The words a person SEES are the parts with a width, never `innerText`** (met 16 Oct 26, Quals' one row, D935). A label
  that keeps its full words for a screen reader (clipped to 1px) beside a short form still counts both in `innerText`
  and `textContent`: read the children whose box is wider than 1px. The walk and the browser test both tripped on it;
  the pictures showed the right word.
- **A word is found by the element that draws it.** To assert a word is shown, find a drawn element — a box wider than
  zero, inside the surface being checked: the app keeps hidden copies (the week behind the board, a phone's frozen
  band) — whose OWN trimmed
  text equals the word — never a word-boundary pattern over a container's text, which runs words together ("DrifterOD",
  "…ODLATE…"; 24 Oct 26, four tries). Words a person typed stand in a box's `value`, never in `innerText`: read the
  `input` and `textarea` values too, and check that a row is there by an element keyed to it (its id-carrying button),
  not by a panel's text (25 and 26 Oct 26). Read a grid cell's text once on screen before writing what it should say
  (the Leave War's "FO*").
- **Press the control the app routes.** Choose it by its action attribute, and use text only to choose AMONG those — a
  label is echoed in a neighbour's caption. Aim at the control's own box (the "+ add", the button), never at a
  container's centre: once a row holds people, its centre is a man's puck.
- **A drag is aimed at the TARGET's measured box, never by a distance from the grip** (15 Oct 26: 1.6 rows below the
  grip landed in the next formation on a desktop and back in place on a phone). Record the order before and after, so
  a drop that landed in place is told from an app that failed; a mark painted after the redraw is waited for, never
  looked for once.
- **Two taps at one point closer than about half a second are a double tap** in Chromium's touch emulation, which
  selects the word under the finger (19 Oct 26: the typed digit replaced only "00"). Wait about 600ms between taps on
  the same box unless the step is about a second tap, and print the box's selection when a typing step fails.
- **A box that saves when it is left is also tested with no blur before the next press.** On an iPhone a tapped button
  takes no focus, so the box never blurs and its words are lost; Chromium's walk passes the same order (24 Oct 26, the
  bid window's Remarks). Press with no blur in between — a unit test's events, or `element.click()` after focus.
- **A locator that READS a result is copied from the markup that draws it** (or from an existing test of that element),
  never composed from a neighbour's attribute. Where a new walk script and a new browser test share a read, run the
  walk first: it is the cheap place to find that the read is wrong.
- **A step whose right result is that NOTHING changes** — a refusal, a no-op — also asserts positive proof that the
  gesture happened: the drag's ghost, the caption under it, the refusal's own words. "Nothing written" cannot tell a
  correct refusal from a press that landed off the screen.
- **A negative assertion first asserts that its subject exists:** "not greyed" passes on a row that was never drawn.
- **An absence is judged after the slowest route to presence.** Name what would have moved and wait out the slowest way
  it could (14 Oct 26: End in a scrolling list settles after about 750ms; a check at 450ms passed), or read the cause
  directly (the scroll position over time). A judge for "X is absent" is written as absence, never through X's own
  fields (`!!b.show && b.show.visible === …` reports WRONG exactly when Show is rightly absent).
- **A check over a list asserts the list's size first, and the premise that fills it** — `every(…)` over an empty list
  passes (21 Oct 26: a fault dropped the picked seat, the list emptied, and "0 of 0" passed).
- **Every scroll step asserts that the scroll position moved** — of the scroller the step means to move, not the window
  — and "in view" is read with `elementFromPoint` at the
  visible part's middle, never from the box alone: a scripted touch scroll (`Input.synthesizeScrollGesture`) left the
  Leave War grid where it was, and the app bar or a frozen heading can stand over a box that is "in view" (25 Oct 26).
- **`elementFromPoint` proves a surface that takes presses** (a window, a calendar, a button). It skips one that takes
  none (`pointer-events: none` — a passing note, a mark) and returns what lies beneath: prove that one by its box inside
  the screen and its computed visibility and opacity, and open the picture (20 Oct 26: eleven false FAILs on the note).
- **A gesture meant only to LOOK** — a tap or a hover that reads — on a surface that can also be edited counts the
  writes before and after (history lines, the stored record) and requires none: the tap that reads can be the tap
  that saves.
- **A single-slot surface** (a toast, a banner) is read for what it is LEFT showing after the whole action.
- **A new card, form or panel has its geometry measured**, not only its content: the main controls' left and right
  edges against the fields above, and inside their container. Looking normalises ten pixels.
- **A fit check is run with the LONGEST content the control can hold, in every instance.** Fill each box (the widest
  weekday and month: a Wednesday in a long month) before measuring: four empty boxes of five passed, and two of them cut
  "Wed 28 Oct 20…" once filled (13 Oct 26).
- **When a typed mark becomes a drawn icon, assert its PLACE as well as its presence** — the icon's box beside the words
  (its right edge at or before the words' left, their middles within a few pixels) and the control's height unchanged
  (21 Oct 26: "wears the icon" passed 71 of 71 with one icon drawn above its words). A new button's computed background
  and border equal those of a button of the same kind beside it (22 Oct 26: two new buttons drawn in the browser's grey).
- **A step that reads a SAVED record takes its key from the built app's storage** — on a built site the Leave War's
  records are `raptor:leavewar/rec:…`, not the `leavewar:rec:` its unit tests see — and the script proves the read once,
  on a write it has just made, before any step relies on it (24 Oct 26: seven checks read nothing).
- **Leaving a control.** A Tab inside a date box steps to its next part: leave it with Enter (where the app commits on
  Enter) or a press elsewhere. End and Home stop at the end of the wrapped LINE on a phone: use the document-level key
  (Control+End). When a "left the box" step fails, record `document.activeElement` before blaming the app.
- **A scripted finger RESTS before it lifts** (about 90ms after its last move, as a finger does). A swipe sent as a
  touch-start, a burst of moves and a touch-end with no pause lifts at full speed; the test browser then believes a
  fling is under way and SWALLOWS THE NEXT TAP — seconds later, on another page — which reads exactly like a dead
  button (13 Oct 26: a tap on a date box "opened nothing"; the Inputs calendar built before that job did the same
  under the same script). And a swipe that must BEGIN on a control starts at that control's centre, not half the
  swipe's length to one side of it. Worked example: `swipe()` in `scripts/handpass/odc-look.mjs`.
- **One finger of several is lifted by a touch-end that NAMES it** (met 21 Oct 26, `[TRK-PINCH-OLD-EDGES]`). Over
  Chromium's touch input (`Input.dispatchTouchEvent`) a move that leaves a finger out of its list does NOT lift it; a
  `touchEnd` listing a point lifts that finger only, and an empty list lifts them all. The 18 Oct 26 walk's "the finger
  left down after a pinch" step lifted its second finger by leaving it out of a move, so it never lifted it. And a third
  finger's tap presses nothing while two others are down (no click is made): press a control under a held pinch with a
  mouse click. Worked example: `scripts/handpass/trk-small-walk.mjs` (P4, P7).
- **Navigate by reading the screen's own heading** until it says the wanted month, day or tab — never by a fixed
  number of steps — and write what was reached into the run's log ("calendar on: July 2026").
- **Every sentence a script prints is built from what it just read**, or is a plain description of the action. A typed
  conclusion outlives the fact it described: on the re-walk it prints the old story beside the new reading.
  Conclusions are the walker's, in the report. And every assertion's note prints the observed value it judged, so a
  FAIL can be read without a re-run.
- **A check whose own set-up step could not act reports NOT WALKED, never FAIL**; a helper that fails says why ("not
  armed", "nobody offered").

## 5. Pictures

- **A step leaves on screen what it asserted.** Its picture is taken after the step's function returns: close a dialog
  at the START of the next step, not inside this one, or the picture shows the plain page. Whoever cites a picture
  opens it.
- **A fixed-coordinate picture ("the top of the page") scrolls to the top first**, and any helper that scrolls runs
  after it: a row that slid under the sticky bar reads as a new defect. Measure the claim, then picture it.
- **A framed picture brings its subject into view first.** The shared `pic(…, { around })` clamps a box that is off the
  screen to the screen's edge and pictures the top bar, while the step's measure, read from the element, passes
  (15 Oct 26). Until the helper refuses it, scroll the subject into view before framing it.
- **A script writes only under its own checkout**, every path resolved from the script itself (`import.meta.url`) —
  never an absolute path into a worktree: worktree folders are reused by other chats. Its logs and scratch files go to
  the session's scratchpad or a folder under the checkout, never a fixed name in the shell's `$TEMP`, which is one
  folder for every chat on the PC (16 Oct 26: a run's `$TEMP/after.txt` held another chat's list).
- **On a phone, a tap gets a picture right after it (owner D1281):** within about 100 ms of the lift, the pointer left
  where it pressed, besides the settled picture — an iPhone keeps the tapped thing "hovered", the test browser does
  not, and a fault that lives in that state is otherwise never pictured (the bug-check order §7.10).
- **One run, one folder.** A script that numbers its pictures empties its folder first, or writes a folder per run:
  two runs' pictures under interleaved numbers are no evidence.
- **A picture of something moving carries its own moment, on the clock its motion is drawn on** (25 Oct 26, the keyboard
  slide walk). Chromium's screencast stamps a frame later than what it shows, and its compositor draws a moving window
  between the page's own frames — a frame ahead of anything the page itself paints: pictures timed by either showed the
  fixed window 15–18 points low and the page behind it, the numbers saying it held still. Stamp each frame with a mark
  the compositor moves (`kbs-slide-walk.mjs`: a 4px mark sweeping the foot of the screen, 400ms a sweep, its sweep told
  by a colour the page paints) and time the picture by it.

## 6. The re-walk

- **The first walk's pictures are the defect's evidence: commit them before the re-walk, and give the re-walk its own
  folder.** A re-walk is nearly always launched by reusing the first walk's command line, so a script takes its folder
  from the environment only when none is already set (`process.env.HP_SHOTS ||= '<folder>'`, on a line that runs BEFORE
  the shared driver loads — the driver reads it once, at import, and a static `import` is hoisted above the line: load
  it with `await import('./lib.mjs')` afterwards, or set it in a small module imported first, as
  `scripts/handpass/ab/ab-env.mjs` does — or the pictures go to the driver's default folder in another checkout), and
  the evidence sheet writes the re-walk's command out in full, with its `rewalk/` folders, beside the first walk's.
  **Before a re-walk, check the folder line of every helper file it loads:** `grep -n "LW_OUT =\|HP_SHOTS =" <its
  files>` must print nothing but the re-walk's own setter file (its one line naming the `rewalk/` folder) — every other
  helper must read `||=` — a helper that sets its folder with a plain `=` writes the re-walk
  over the first walk's pictures (25 Oct 26, twice). Run a re-walk from a small script FILE that sets the folder
  first, never with the variable typed into each command.
- **A re-walk runs only the steps of the places the change touched.** Give the script a step filter (`ONLY=w2`) and use
  it: a script being cheap is no reason to run all of it, and its unrelated steps bring failures of their own (15 Oct
  26: a one-line change re-walked whole, stopped by an unrelated page change before the one step that mattered).
- **Once a finding is fixed, the note that observed it becomes a CHECK** asserting the fixed behaviour, before the
  re-walk runs.

## 7. Reading a FAIL — the script's world first

Before a FAIL is a finding, ask: what does the world really hold (the seed, the page — is the "bid and award" day
really both)? What is the phone's own route to that surface (a menu, a folded panel — take one picture at the failing
step)? What did the script actually press, and what did the box actually read? Was the role signed in on a fresh
world? Then the order's rule: the host reproduces it. A script's mistake is written on the sheet as one. A fault that
depends on zoom or display scaling is reproduced in a browser STARTED at that scaling (`--force-device-scale-factor`),
never with an emulated picture scale, which leaves the page's own arithmetic at 1.
**A before / after comparison reads the same place on both sides** — the same month, the same day, the same scroll: the
Leave War opens on its bidding window, not on today, so a "same session" read taken as the page opened and an "after
reload" read taken after a month button compare January with December, and an archived man rightly counts in one and
not the other ([LW-GROUPS-STALE-AFTER-ARCHIVE], 21 Oct 26 — filed as a fault, found on 27 Oct 26 to be this;
`docs/handpass/parts/lw-small-1027/groups-diagnosis.md`).

## 8. When nothing on screen should change

A refactor, a storage-only change, "leave the other sizes exactly as they are":

- **Record the running app twice and compare the records as text.** Hold the clock still and seed the random numbers,
  so every minted id and time stamp repeats; save each screen's markup and each rule's output as text, on the worst
  realistic world (plain, published, the next week, a phone, another role); compare the build before with the build
  after, byte for byte. First compare two runs of the SAME build — that is what proves the comparison sees only the
  code. An intended difference is saved apart and shown, so that "identical but for X" is literal.
- **Two equal records prove sameness, not coverage.** A recorder that landed on an empty month recorded it equally in
  both builds, and the comparison passed. Assert where each step landed, and open the pictures even when the
  comparison is green.
- **For one size, role or mode that must not move:** dump everything of the out-of-scope cases (words, boxes, type,
  colours) from the build BEFORE the first edit, and compare after it. Write the out-of-scope test first and see it
  pass on the OLD build — that is what makes it a description of "as it was", not of "as I built it".
- **The build before the change:** `git archive <commit>` of the source and the config into a SHORT path,
  `node_modules` joined by a junction, built and served on another port (a `git worktree` of an old commit fails on
  this repo's long picture names — `docs/gates-and-deploy.md`). Leave the bulky folders out of the archive
  (`':(exclude)raptor-port/docs'`) — the copy, install and build then take under a minute — and serve the built folder
  from inside the test browser, routing every request to it (`index.html` as the fallback) at `http://localhost:<a
  free port>`: the app's test hooks answer only on localhost, and no second server holds a port (15 Oct 26). For one
  measured number, swap the touched files from
  `origin/main`, rebuild, run the SAME script into a scratch folder, put the files back and prove it with
  `git diff --stat` — never while walkers are served that build.
- **A storage conversion is walked on data the OLD build really wrote.** Serve the old build, make the owner's kind
  of work through its own controls, and save the browser's storage; serve the new build on the SAME address (storage
  belongs to an address) and assert that it reads — and exports — exactly what the old one did. Hand-made "old"
  records prove the converter only against the builder's picture of the old shape.
- **A storage-shape change is walked with a mechanical check on every step**, through one shared driver: every row the
  gesture changed is named by that gesture's own change record; the state before a reload equals the state after it;
  the reload itself writes nothing. The reload is a step, not only the thing between steps.

## 9. Break tests

The rule is the order's §8, item 4. The runners are `scripts/handpass/breaks.mjs` and `breaks-browser.mjs`, each fed a
list.

- **Commit first, and break where nobody is reading.** The runner restores the exact bytes it changed. By hand,
  restore from a copy taken just before the break — never `git checkout` / `git restore` on a file with uncommitted
  work, which returns it to the last commit and throws the fix away — and read `git diff --stat` afterwards. While a
  reader or a walker is using the checkout, break in a separate worktree at a SHORT path (`node_modules` by a
  junction). A runner that edits source holds the tree until it prints DONE: no edit, build, browser test or commit
  meanwhile.
- **Re-run the WHOLE list after the last code change**, not only the breaks for the lines that changed: a later fix
  that covers the same case makes an earlier guard's break silently green (17 Oct 26: 34 of 36 caught after the read's
  fixes). Read each one that stays green by the four readings below.
- **A walk or look script used as a break test's detector is pointed at a scratch folder.** It empties and rewrites
  its evidence folder on every run, so six broken builds replaced the committed pictures with pictures of broken
  screens (13 Oct 26). Run the look again on the true build afterwards.
- **Prove the list runs before trusting its reds.** Run the guard suite once unbroken and compare its file count with
  the list — a mistyped file name "guards" nothing. A `find` that does not match exactly once is re-targeted, never
  counted. A test selected by name is confirmed to have RUN.
- **A break that stays green has four readings — say which.** (1) No test: write one, for the BEHAVIOUR, and run the
  break again. (2) The break never met a test able to see it: search the whole suite for an assertion on that
  surface — especially tests that boot the real storage — and run the break against it. (3) The wire is invisible to
  that test world (layout, a scroll window, real events): write the watcher in the real browser, and prove it against
  the broken BUILD. (4) The line decides nothing: would anyone see a difference? If not, delete it and run again — or
  it is a second guard whose behaviour another wire's break already pins: record which, and why the cut one cannot be
  reached by new data (D56).
- **A rule held in two layers** — a door's own refusal, and the save boundary behind it — is broken one layer at a
  time, and each layer's test asserts something only THAT layer does: the exact wording with no rollback tail, one
  message and not two, no command attempted. An outcome-only test cannot see that the outer layer is missing.
- **A mapping** (a palette, a lookup, a label wired to a token): at least one break per wired place swaps in ANOTHER
  CURRENT value, not only the retired one. A break caught only by "the old value must not come back" proves that
  guard, not the wiring.
- **Each new test is proved red in the medium it runs in.** A list that runs unit tests says nothing about a browser
  test. And a browser test of an act that shares a code path with its own set-up takes its "before" from a value read
  BEFORE the set-up.

## 10. The drawing check (his D1494, 29 Oct 26; a standing step of every build with a drawing, D1495)

The script is `scripts/drawcheck/` — `record.mjs`, `check.mjs`, `compare.mjs`, a part list per screen under `specs/`,
and `selftest.mjs`. The worked example is M5a's (`specs/lw-m5a.mjs`). When it is run, and what a difference leads to:
`docs/bug-check-order.md` §7.0 and §7.10.

- **Record the drawing when it is drawn**, from `raptor-port/`: `DRAWCHECK_SPEC=scripts/drawcheck/specs/<screen>.mjs
  DRAWCHECK_APPROVED=<the approved pictures' folder> DRAWCHECK_DIST=<the drawing's build> DRAWCHECK_DRAWN_ON='<branch>
  at <commit>' [DRAWCHECK_ORIGIN=<the address the drawing script opens; default http://localhost:4197>] node --import
  ./scripts/drawcheck/record.mjs <drawing script>`, the drawing script's own pictures sent to a scratch folder, never the
  approved one. At each picture the part list names, it saves every part's measure and a whole-screen picture beside
  the drawing (`docs/mock/<area>/drawcheck/`). Each record says whether its replay drew the approved picture (no pixel
  more than 24 colour levels off); a record that differs, or that was never compared, is not a record of the approved
  drawing — find why, or record it again, before trusting it. The drawing's build is the commit it was drawn on, built
  as §8 says.
- **Name the parts a person would point at** — the window, a row, a switch and its lit half, a column of figures, a
  name — each with its drawing selector, its build selector and what is compared. A part inside another is measured
  from it (`rel`), so a row that moved down the page does not make every figure in it "move". A figure with no box of
  its own is judged by where its words are drawn (`words-place`), never by an invisible box's width.
- **Bring the build to the drawing's own world** — the same people, leave and clock, the same lock and switches: each
  state's `reach` in the part list brings the build there through the same doors the drawing's stage script used
  (M5a's: the bids by the localhost bridge, approve and refuse pressed in the real window), and returns a sentence when
  it cannot — the state is then NOT CHECKED. A drawing taken with the page scrolled says nothing about a window docked
  by the page's position: give every docked or floating part a second state measured against the same record
  (`drawing.record: '<state>'`) with the page at its top (M5a's window stood 136px lower there, and matched in the
  drawing's own scroll).
- **Run it after every change**, from `raptor-port/`: `npm run build`, then `node scripts/drawcheck/check.mjs
  scripts/drawcheck/specs/<screen>.mjs --dist dist --out docs/img/handpass/<date>-drawcheck-<screen>` (each run empties
  its `--out` folder: give the run whose pictures go to him a folder of its own, §6). Red while any difference is
  unexplained, any state has no drawing record, or any state could not be reached (its `reach` returned why); page
  errors are listed but do not turn it red. Open the pictures before reporting a difference: a part off the screen is
  listed, not pictured.
- **A difference in a rule with no visible effect** (an edge of no width, a see-through fill) is the comparing's
  fault: fix it in `compare.mjs`, add that look to `selftest.mjs` as one that must not count, and name it in the
  closing report — never drop the part or its check to turn the run green.
- **Each difference goes to him side by side (D1426)** — the report's pictures are that page's pictures. One he keeps
  goes into the part list's `accepted` list — `{ state, part, check, why }`, `why` naming his ruling — with `check` set
  to the one kind of difference he kept (place, width, fill…), so a new difference in the same part still turns the
  check red (the script refuses an entry without it); the report still shows the kept one, marked.
- **After any change to the comparing**, run `node scripts/drawcheck/selftest.mjs` (it feeds the comparing each kind
  of difference M5a showed, and each look that must not count, and fails on a miss); after a change to the measure,
  the recorder or the runner, re-run the check on M5a's build at 794346689 and compare its report with the committed
  one.
