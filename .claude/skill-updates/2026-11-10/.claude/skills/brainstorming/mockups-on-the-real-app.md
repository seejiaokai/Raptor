# Mock-ups on the Real App

**Load this reference when:** making a picture of a proposed change to a screen
that already exists — before the first drawing.

SKILL.md's "Prefer drawing the options on the real running app" is the rule.
This is the method and its traps; every line comes from a mock-up that misled
someone.

## The Method

**When the decision being drawn was made from a picture** (his screenshot, a
marked picture), find and open that picture first: his words name the surface
as he calls it, which may not be the app's own name for it. Say on the page
which surface you read his words as, and why (19 Oct 26: "Edit Schedule" in a
ruling was the Scheduler Board in the picture he ruled from). **His picture is
part of the question:** name its device and width, and answer on the same one
(27 Oct 26: a phone question answered with a desktop picture). Where it shows
what the PC's render does not, find the input that differs — letters, zoom,
text size — before drawing; his picture is then the "today" frame, and the
proposal is drawn as his device measures it, said so on the page (4 Nov 26:
his iPhone's wider letters wrapped a bar the PC drew on two rows).

1. Drive a local or preview build — throwaway data, the clock held still where
   the date colours the screen — to the "today" state through the app's own
   controls, and picture it at each size the app ships. The "today" premise is
   checked as strictly as the proposal: each staged record is asserted ON
   SCREEN before anything is drawn (31 Oct 26: an entry staged under the wrong
   type name never reached the grid, and the empty day passed), and "today" is
   pictured for every role the change touches — a role may already have a
   window of its own there. A fault filed from reading code is reproduced
   (refuse the request, cut the signal, feed the bad value) and the proposal
   sized by what the screen does (4 Nov 26: "nothing to show" was the whole
   app going black). A message no control reaches (a safety net) is pictured
   by reaching its element through the nearest real state that raises it and
   changing only its words, named on the page — a forced state the app
   corrects takes its box away with it (5 Nov 26).
2. Do the nearest REAL interaction first (a real drag, a real open) and record
   its look and its markup. Reuse those; never restyle them.
3. Apply ONE named transform on the page: it moves, hides or clones existing
   nodes, never removes one the app drew (Traps). New parts are cloned from a
   real neighbour and marked as new. Any
   style the app does not already have is a design decision to tell the owner.
   A mark that shows him the place — a ring, a number — is drawn ON the
   element (an outline, which takes no room, and a tag in its own `::before`),
   always, never as a box laid over the page at measured coordinates: on a
   phone, and on a layer that scrolls or glides by itself, the laid-over box
   drifts off its text with no error (16 and 20 Oct 26). The mark must not move
   what it marks: its class never sets `position`, display, size or overflow on
   the element (a fixed list given `position:relative` left the picture —
   5 Nov 26); a static element gets its tag as a child. The script asserts the
   marked box is unchanged by the mark, and that each tag lies inside every
   ancestor that clips its overflow (8 Nov 26: two tags cut off, both scripts
   clean).
4. Picture the same frames again at the same sizes. Lay them out
   today-beside-proposed, numbered, so the owner answers by number, and say on
   the page which pictures are real and which are drawn in.
5. Write down everything the transform had to touch that the design note did
   not name — four places printing one count, a list that was not grouped
   after all. That list goes into the plan: each item is a requirement nobody
   had written down.
6. Commit the injection script beside the pictures, so the set can be shot
   again and the build starts from it — drawn with the drawing check's
   recorder beside it, so its measures are kept as it is drawn
   (`raptor-port/docs/walk-scripts.md` §10). The picture the owner picks — or the
   script that drew it, with its exact values — is committed too, and the
   record of the decision names it: words describing a picture are a summary,
   not the spec. **From the picture to the build:** keep the drawing's
   prefixed class names, or prefix every new class with the component's own
   word — a bare `.go`, `.day` or `.r` already belongs to the app (14 Oct 26: a
   wave's margin reached a new span, 46px tall for 30; 27 Oct 26: a mock row's
   `.r` stretched the real puck's rear seat) — and the built screen's first
   check re-measures the figures the drawing printed (heights, edges), not only
   its words. A place the script
   computes from the live page (the scroll, a neighbour's box) is a means of
   drawing, not the spec: the note says in words where the part stands ("under
   the top bar, whatever the scroll"), and the builder takes the picture's
   place (29 Oct 26: a copied formula put a window 136px low at the page's top).

## Traps When Injecting Into a Live Page

- The app owns its DOM: a scroll, a repaint or a partial swap wipes injected
  state silently. Do every scroll first, inject last, and re-apply the fragile
  part immediately before the picture. Have the capture step ASSERT its
  premise is still there (a hand-set class, an injected node) — or refuse the
  picture. To take away a part the app draws, HIDE it (`display:none`), never
  `remove()` it: the app's next redraw of it throws and the screen goes blank
  (5 Nov 26: three runs chased the wrong cause). Print the page's own errors to
  the run's log as they happen.
- **Code sent into the page runs without its module:** a function given to
  `page.evaluate` declares inside itself every helper it calls. A kit shared by
  several drawing helpers is tried once on one real case at both sizes first,
  and a card placed "on the side its control is on" measures that side within
  the control's own window or sheet, not the screen (4 Nov 26).
- **A panel laid in at a measured place can cover the live parts beside it** —
  a row above may be taller for another role. Look at its top and bottom edges
  against them on every role and size drawn, and assert no live control's box
  is overlapped (29 Oct 26: 6px of a member's boxes covered, approved unseen;
  a later "back to the drawing" would have built the cover in).
- **Restyling a live element in place keeps what the app set on it for its old
  look** (an inline nudge, a transform, a measured width): clear those, or
  re-run the app's own placing, and name any element the app places by its own
  size (6 Nov 26: the drawn tag stood 53px off its box; the build, rightly, did
  not).
- Clear injected nodes before staging the next option: the app swaps only what
  changed, so option A's markup survives into option B's frames.
- A script that toggles styles by finding "the original rule" finds its own
  injected copy the second time: keep the app's rule once, and skip your own
  sheet. A before/after made by removing a rule from the BUILT stylesheet
  prints how many rules it removed and the measured size on both sides — the
  build rewrites selectors and media conditions; zero removed, or equal sizes,
  means the "before" is not a before. A fix that only corrects existing CSS is
  drawn by editing that rule in place in the page's stylesheet object
  (`rule.style.setProperty`), found by its exact selector and asserted found
  once — an injected sheet sits elsewhere in the cascade (5 Nov 26).
- Hide transient toasts. Frame clear of sticky bars by asking the page what is
  at the element's own top edge (`elementFromPoint`), not by trusting
  scroll-into-view.
- **A close-up picks the n-th VISIBLE match** (a box wider than zero), never
  the first — of windows, the front one, not the first in the page's order —
  and every query is scoped to the surface being pictured: the app
  keeps hidden copies (the week behind the Scheduler Board), and a page-wide
  query draws a mark twice. For a mark bigger than the screen, or one whose
  effect falls outside its own box (a light below a card, a halo), bring the
  EDGE where the effect is into view and clip a fixed window round it. A
  before/after pair that looks identical means the crop missed the change.
- **A state reached by tapping the app's own controls leaves the last one
  hovered or focused** in a touch-emulated picture (a blue ring on a ▼ the
  drawn flow never touches); `blur()` does not clear it. Tap a neutral
  element (a heading) before the picture, and say in the caption which
  controls the drawn flow touches.
- **On an emulated phone, never TYPE into a box before a picture.** It zooms
  to a focused box smaller than 16px, as a real phone does, and every later
  picture comes out zoomed and shifted with no error. Set the value through
  the box's own change event, or emulate the width and density without
  `isMobile`. Before a third framing fix, take the same page without the
  last action: the cause is usually the step before the picture.
- **Moving nodes between containers, and measuring inside a zoomed part.**
  Move the part whose styles are global into the container whose styles are
  scoped, never out of it (a moved month name lost its font and size); a new
  window is appended INSIDE the page's scoped container, or it renders
  unstyled and see-through; then measure the moved part's font size and place
  against the original. Inside a CSS-zoomed part (the phone's grid is drawn at
  0.8), rects read unzoomed: divide by the zoom, or place tags as the
  element's children. Before moving rows, list every copy the app keeps of
  them (a figures drawer, a phone's frozen band) and move each, by position
  from one shared anchor row.
- **"Every X" is found on the running page,** not by a source search: tag the
  visible elements whose own text or icon is X. A place the source lists that
  the screen does not show is reported "already done", not pictured.
- Look at every picture before sending it: each failure above passed its
  script with no error.

## Judging the Proposal

- **A mark a few pixels wide:** measure the element boxes and the gaps to
  their neighbours BEFORE designing; capture at the target screens' real
  densities (1x desktop, 3x phone) and show those at true size, with an
  enlarged copy only as a detail view. Enlargement hides sub-pixel collisions.
- **An existing component shown inside a mock is measured, not styled:** read
  the live element's computed styles (its pseudo-elements and overflow
  included) and its markup, reproduce them verbatim, scale them as one piece,
  and put a close-up of the real one beside the mock's before anyone sees it.
  A copy made by eye converges one correction at a time, each paid for by the
  reviewer. A colour is read on the drawn part itself (the svg, the glyph's
  element), never its container — an icon's class may override what it would
  inherit (5 Nov 26: a "cyan" gear that was grey on screen).
- **Reusing an older drawing or its script reuses its shortcuts.** List every
  app component it draws and replace each hand-made stand-in with the app's own
  markup (on a local build the probe bridge exposes builders, `window.puck`
  among them — 27 Oct 26: a hand-drawn puck where his ruling asked for his own).
  Where its page now sits under controls built since, check each control it
  carries against them for one doing the same job: a duplicate is put to him,
  never carried over because the old drawing had it (28 Oct 26: two year
  pickers on one screen — a side-by-side with the old drawing proves sameness,
  not fitness).
- **Include one BUSY state by default** — the fullest realistic mix of what
  the change touches (every mark colour, every ring kind, issued and pending
  together, a plain case) — and take the fix's scope from what the rule being
  changed affects, not from the bug's first description. **Choose the state by
  what it shows:** list the app states in which the change is VISIBLE and
  pick one where it shows on most rows (21 Oct 26: with a front seat picked
  the crew list printed no per-man reason at all — three pictures of a change
  nobody could see); where a ruled change not yet built will alter the screen
  first (a new default), picture the proposal in that future state too, and
  in each state that changes the answer, with the measure that shows the
  difference (15 Oct 26). Have the script count the exact element the change
  touches, not a looser selector other rows also match.
- **Options compared share one data set** — one set in the script covering
  the hard cases he named (the most a day holds, spans, a name-only item, a
  kind with its own colour), every option drawn from it, an option drawn in
  an earlier round redrawn too, all measured in one table (22 Oct 26: the
  old option's own data hid a several-day event covering the day's own).
- **An ask about a quantity** ("less height", "on one line", more names on
  the first screen) is measured in the same run that draws it, before and
  after, on every device and role it touches, with each row's overflow; the
  page states the figures per device, including one where nothing was saved
  (22 Oct 26: 50px saved on the desktop, 10px on the phone).
- **A change that takes or gives width** (a side window, a column added or
  narrowed) is drawn at the narrowest width that still gets the desktop layout
  and at a laptop's (about 1280) as well as at his own sizes, its narrowest
  column measured at each; the cost goes into the recommendation, or a safe
  version is drawn (8 Nov 26: fine at 1536, one column crushed to a letter at
  1024).
- **A machine check that cannot reach a drawn mock-up gets a copy it can
  read:** write the drawn element, the page's stylesheets inlined, to a
  standalone file per state and point the design skill's detector at it, and
  measure a control's EDGE contrast as well as its text (22 Oct 26: a box
  edge at 1.85:1 the eye had passed; a control's edge needs 3:1).
- **"This works like the existing X" is a behaviour claim, not a picture.**
  Exercise X for the behaviour named (close it, press outside it, drag it, use
  the page behind it) or read its code first, and list what was exercised
  beside the picture. Where the proposal and the existing behaviour differ,
  say so on the drawing itself. A caption that says what a control or
  another surface does or shows TODAY is written from what the script
  measured (the node's own markup) or the code read, never from a ruling's
  summary or a code comment's notation — or it says "not checked" (22 and
  24 Oct 26: what a count counted, and what a grid box shows, both wrong).
  A drawing of what an event produces (a bell line, a mark) asserts for every
  case drawn that the event fires in the running app, never clones the result
  by hand; a case where it does not is a design question (5 Nov 26: one of four
  posting outcomes runs nothing on its date, so its line had no moment).
- **A LAYOUT question over a range of content** (long and short text, optional
  parts) is not answered by a re-lettered screenshot — that shows one
  instance. Build working markup in the app's own style values: the same
  varied sample set under every option (the worst case included), a switch per
  open choice, a measured figure per option computed in the page, a
  today/proposed toggle. When checking such a page locally, assert the layout
  width first — a file with no viewport tag opens 980 wide in a phone-emulated
  browser.
- **A question about FEEL** — a swipe, a scroll, an animation — is answered by
  a page he operates on his own phone: real pictures of each part at the
  device's size, inside a container built to the app's measured scroll rules,
  the proposed behaviour scripted, a switch per open choice; tried by a real
  finger in a visible browser before it is sent (3 Nov 26: drawing it surfaced
  four requirements nobody had written). An animation is checked frame by frame
  first, in WebKit (the iPhone's engine) as well as Chromium: every animation
  paused at fixed moments (`document.getAnimations()`, `currentTime`), one strip
  per engine and option, read for order and direction
  (`raptor-port/scripts/handpass/talon-claw-frames.mjs`).
- **A reproduction written as assertions of the RIGHT behaviour**, with a hook
  that injects a candidate stylesheet, gives three things from one script: the
  defect's evidence, the proposal's pictures, and a pass/fail measurement of
  the proposal on every page and size — and later the fix's re-check. Confirm
  first that the mode the app is opened in can show the state under test (a
  memory-only start cannot produce a failed save).

- **A fit drawn in the test browser's letters is not a fit on his device.** Say in the drawing's script which part
  gives way when the letters are wider (a date must not be the one that breaks), and draw that case — the same list in
  letters about a seventh wider — beside the plain one. It shows what yields; only his own device proves the fit.

## Showing It

- A change to the LOOK or LAYOUT of a surface the owner uses daily gets a
  full-screen before/after put to him BEFORE it is built — whoever filed it,
  and even when it is framed as a defect. Whether it is an improvement is the
  user's call, not the finder's.
- When the answer to a choice is a question ("show me what he will see
  exactly"), it is a request for the picture, not for more words.
- Republishing a page of pictures is a sync of the whole set against what is
  live: list the published files, compare each with the local copy, and send
  every one that differs, whoever changed it. Each approved state's picture is
  also kept as a file of its own beside any side-by-side sheet, so a later
  measurement can compare against it (29 Oct 26).
- **An answer changes every picture of the thing it governs.** After
  recording it, find every picture on the page that draws the changed thing
  (search the drawing scripts for the element or the role) and redraw each in
  the same turn, then look at the redrawn screens whole for clashes the
  change made (22 Oct 26: he found the main page's picture still without the
  tab he had just given members).
- **A ring on a picture shown cropped** is placed against the crop — pixels
  from the box's top over the box's height in picture pixels — or drawn onto
  the picture itself.
- **A recording he sends is read first:** pull its frames with
  `raptor-port/scripts/handpass/video-frames.mjs` (the installed Chrome in a
  visible window plays an iPhone's HEVC, where a headless one draws blank
  frames); its key frames, turned upright, cropped to the place and marked,
  go on the page as his own pictures beside the drawn ones. Wait for the
  upload's path in his message rather than searching the disk; ask him to
  describe it only if that fails.
- **Picturing someone else's app** (a colleague's page, as a reference):
  read its saved source whole — a summary of a page drawn by script is
  empty; never open its live data; run it locally against a stand-in store of
  made-up records; replace identifying names before any picture; commit
  nothing that carries their storage keys or names (21 Oct 26).
