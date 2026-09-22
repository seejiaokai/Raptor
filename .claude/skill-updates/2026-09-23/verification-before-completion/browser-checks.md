# Browser Checks

**Load this reference when:** the change is something a browser draws or a
gesture drives, before claiming it works.

Tests that run without a layout engine (jsdom and similar) prove which markup
and handlers exist — never what was painted, scrolled or tapped. Each line
below is a way a real session "verified" a screen change and was wrong.

## Before Trusting Any Browser Result

- **The server is serving THIS build.** A reused preview server serves the
  last build. Rebuild before re-testing; a measurement that stays bit-identical
  across a change that should have moved it is a stale-build signature, not a
  failed fix.
- **Stop a stale server by the port it holds or its process id** and confirm
  the port is free. On Windows, a server started under a shell survives
  killing the shell — kill the process tree. (This project's exact commands
  are in `CLAUDE.md` §Build & verify.)
- **A single-page-app server answers every path with 200.** Verify a page or
  an asset by its content (content type, first bytes), never by status code.
- **A throwaway drive script lives inside the project folder**, so it finds
  the project's packages, and imports the browser-test package the project
  actually installs.

## Drive Every State the Change Appears In

- **Every width the app ships** (phone and desktop): a bug can live in only
  one of their code paths.
- **Scrolled, on every axis the container scrolls.** Sticky and frozen things
  are only tested by moving what they stick against, and a position flip
  (sticky / fixed / absolute) has different geometry at every scroll offset.
- **Every mode the change appears in** — another role, an admin toggle, an
  edit mode. A test proves its rule only in the states it renders: name the
  test that should catch your change and confirm it visits your state.
- **After changing a default** (a zoom, a view, a role): run the whole
  surface's tests, not the ones you touched, and drive its other modes at the
  new default. A default change re-baselines every earlier measurement.
- **A new hidden-by-default state:** search the tests for "it is there"
  assertions on the thing now hidden, before running them.
- **Pointer handlers:** mouse AND touch, from every place the gesture can
  start. Move the mouse after a click — a hover is a move — and include a move
  with no press first.

## Measure, Don't Estimate

- A width that must fit text, a sticky offset, a layout cost you are about to
  quote: read it off the rendered page with the real classes
  (`getBoundingClientRect`, `getComputedStyle` — including `::before` /
  `::after`) and write the measured number beside the rule.
- Browser assertions name the behaviour, not a value one browser version
  happens to compute: "same row" is the two boxes overlapping, not a pixel gap
  tuned to today's fonts; "no outline" is `outline-style: none`, not
  `outline-width: 0px`; compare a rect with a rect, never with a rounded
  integer.

## CSS Placement

Before inserting a rule, find what encloses the insertion point: a scope
wrapper around the whole file, the nearest `@media` above it, an override
block that must stay last. A base rule goes ABOVE the block that overrides it.
Then measure the narrow width on the first drive — the rule "appearing in the
built file" proves it shipped, not that it applies.

## Drive-Tool Traps

- A locator click scrolls its target into view first. When measuring scroll
  across a click, tap by coordinates on what is already on screen.
- Before a scripted gesture, check what is at the point
  (`document.elementFromPoint`) — sticky chrome can cover a target after a
  scroll. A gesture that measured nothing touched the wrong thing until proven
  otherwise.
- A timing harness asserts the interaction's own evidence (the drag armed,
  the drop landed) before recording a number, and measures its own latency
  (a run with the behaviour off) before a number becomes a target.
- Drive each control the way the user will — tap it, then read the result.
  Setting the state from outside proves the result, not the control.
- A control that gains a disabled state stalls every existing test click on
  it (the click waits, then times out quietly): search the tests for clicks on
  it.

## Reading CI

- A red unit job with every test passing: read its "Errors" section. A timer
  or render that outlives its test file fails the job on its own — fix the
  teardown, never re-run it away.
- Run the unit tests locally the way CI partitions them (per project), or a
  timing-order difference will surface only in CI.
