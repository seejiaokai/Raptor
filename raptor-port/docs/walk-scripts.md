# Walk scripts, walkers' briefs and break tests — how they are written, and what each trap has cost

**Tier 2: read before writing a walk script, a walker's brief or a break-test list; every walker's brief names this file.**
**A walker reads §3 to §7; §1, §2, §8 and §9 are the host's.**
The method is `docs/bug-check-order.md` (§4 the fan-out, §5 the re-walk, §7 the walk, §8 the break test) and a walk's
size is `docs/walk-ledger.md`. This file is the HOW. Every line is here because a walk, a re-walk or a break test once
reported something untrue — a fault that was the script's own, or a pass that proved nothing. The drivers are in
`raptor-port/scripts/handpass/` (`lib.mjs`, `trk-lib.mjs`; the break runners `breaks.mjs` and `breaks-browser.mjs`); the
traps of their own selectors are in `docs/handpass/README.md`. Written 13 Oct 26 from the skill notes of 24 Sep – 13 Oct 26.

## 1. Before the walkers start

- **The host runs its own short walk on the shared helpers first.** Every trap it meets — a selector whose class has
  since gained a second use, a helper borrowed from an older walk that names a field by its old id — goes into the
  walkers' brief by name ("Known traps in the drivers"). A walk's private helper file is evidence of that day's screen,
  not a library: prove a borrowed helper's first step against the present screen before building a fixture on it.
- **One served folder a round** (the order's §4). A server found already running is used only once it is proved to
  serve this build: the hashed bundle name in the index page it serves equals the local build's. Check a port is free
  before pointing a run at it (`docs/gates-and-deploy.md`).
- **The clock is set to a start time and left RUNNING.** A frozen clock gives two records filed minutes apart the same
  moment, and a rule that tells them apart by time then matches them — a FAIL of the walk's own making. Hold it still
  only for a recording that must repeat byte for byte (§8), or for a scenario about one instant.

## 2. The walker's brief

- **It names this file, and carries the machine's traps itself** — a helper loads none of the host's memory. A script
  is written to a file with the file tool and run from there, never passed inline to the shell: backslashes are lost
  and an apostrophe fails to parse, often with no error. A script's rewrite and its run are never sent in one step —
  the run may use the old file — and a script prints a version line at the top of every run.
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

## 4. Steps, and what they assert

- **The words a person SEES are the parts with a width, never `innerText`** (met 16 Oct 26, Quals' one row, D935). A label
  that keeps its full words for a screen reader (clipped to 1px) beside a short form still counts both in `innerText`
  and `textContent`: read the children whose box is wider than 1px. The walk and the browser test both tripped on it;
  the pictures showed the right word.
- **Press the control the app routes.** Choose it by its action attribute, and use text only to choose AMONG those — a
  label is echoed in a neighbour's caption. Aim at the control's own box (the "+ add", the button), never at a
  container's centre: once a row holds people, its centre is a man's puck.
- **A locator that READS a result is copied from the markup that draws it** (or from an existing test of that element),
  never composed from a neighbour's attribute. Where a new walk script and a new browser test share a read, run the
  walk first: it is the cheap place to find that the read is wrong.
- **A step whose right result is that NOTHING changes** — a refusal, a no-op — also asserts positive proof that the
  gesture happened: the drag's ghost, the caption under it, the refusal's own words. "Nothing written" cannot tell a
  correct refusal from a press that landed off the screen.
- **A negative assertion first asserts that its subject exists:** "not greyed" passes on a row that was never drawn.
- **A gesture meant only to LOOK** — a tap or a hover that reads — on a surface that can also be edited counts the
  writes before and after (history lines, the stored record) and requires none: the tap that reads can be the tap
  that saves.
- **A single-slot surface** (a toast, a banner) is read for what it is LEFT showing after the whole action.
- **A new card, form or panel has its geometry measured**, not only its content: the main controls' left and right
  edges against the fields above, and inside their container. Looking normalises ten pixels.
- **Leaving a control.** A Tab inside a date box steps to its next part: leave it with Enter (where the app commits on
  Enter) or a press elsewhere. End and Home stop at the end of the wrapped LINE on a phone: use the document-level key
  (Control+End). When a "left the box" step fails, record `document.activeElement` before blaming the app.
- **A scripted finger RESTS before it lifts** (about 90ms after its last move, as a finger does). A swipe sent as a
  touch-start, a burst of moves and a touch-end with no pause lifts at full speed; the test browser then believes a
  fling is under way and SWALLOWS THE NEXT TAP — seconds later, on another page — which reads exactly like a dead
  button (13 Oct 26: a tap on a date box "opened nothing"; the Inputs calendar built before that job did the same
  under the same script). And a swipe that must BEGIN on a control starts at that control's centre, not half the
  swipe's length to one side of it. Worked example: `swipe()` in `scripts/handpass/odc-look.mjs`.
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
- **A script writes only under its own checkout**, every path resolved from the script itself (`import.meta.url`) —
  never an absolute path into a worktree: worktree folders are reused by other chats.
- **On a phone, a tap gets a picture right after it (owner D1281):** within about 100 ms of the lift, the pointer left
  where it pressed, besides the settled picture — an iPhone keeps the tapped thing "hovered", the test browser does
  not, and a fault that lives in that state is otherwise never pictured (the bug-check order §7.10).
- **One run, one folder.** A script that numbers its pictures empties its folder first, or writes a folder per run:
  two runs' pictures under interleaved numbers are no evidence.

## 6. The re-walk

- **The first walk's pictures are the defect's evidence: commit them before the re-walk, and give the re-walk its own
  folder.** A re-walk is nearly always launched by reusing the first walk's command line, so a script takes its folder
  from the environment only when none is already set (`process.env.HP_SHOTS ||= '<folder>'`, on a line that runs BEFORE
  the shared driver loads — the driver reads it once, at import, and a static `import` is hoisted above the line: load
  it with `await import('./lib.mjs')` afterwards, or set it in a small module imported first, as
  `scripts/handpass/ab/ab-env.mjs` does — or the pictures go to the driver's default folder in another checkout), and
  the evidence sheet writes the re-walk's command out in full, with its `rewalk/` folders, beside the first walk's.
- **Once a finding is fixed, the note that observed it becomes a CHECK** asserting the fixed behaviour, before the
  re-walk runs.

## 7. Reading a FAIL — the script's world first

Before a FAIL is a finding, ask: what does the world really hold (the seed, the page — is the "bid and award" day
really both)? What is the phone's own route to that surface (a menu, a folded panel — take one picture at the failing
step)? What did the script actually press, and what did the box actually read? Was the role signed in on a fresh
world? Then the order's rule: the host reproduces it. A script's mistake is written on the sheet as one. A fault that
depends on zoom or display scaling is reproduced in a browser STARTED at that scaling (`--force-device-scale-factor`),
never with an emulated picture scale, which leaves the page's own arithmetic at 1.

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
  this repo's long picture names — `docs/gates-and-deploy.md`). For one measured number, swap the touched files from
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
