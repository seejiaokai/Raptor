# Two small Quals fixes — the fix round's brief (11 Nov 26, chat 64, job 3)

For the builder of `7765901d1`. The walk and both blind reads are in: the walk's report is
`raptor-port/docs/handpass/parts/2026-11-11-quals-small-walk.md`; the reads are beside this file
(`2026-11-11-quals-small-read-astra.md`, `…-read-opus.md`) — read both whole before you start. Same rules as your first
brief (`2026-11-11-quals-small-builder-brief.md`): red first, each claim SEEN failing before any fix (keep each red line
for your hand-back — the host must be able to see it); never weaken an assertion; commits on the branch, no push; no
edits to `HANDOFF.md`, `OUTSTANDING.md` or anything under `.claude/`; the whole unit suite, `npx tsc -b`,
`npm run lint:changed`, the build and your browser files under the checks lock before you hand back; `dist` left built
from your last commit. Leave the untracked picture folders under `raptor-port/docs/img/handpass/2026-11-11-quals-small/`
alone and never `git add` that folder whole.

## The items — each: reproduce (a failing test), fix, green

**F1 — a second finger during a drag begun on a pinned heading (Astra's finding 1; the Opus reader read it the other
way — "the pinch starts only on the table's wrap, which cancels the drag; unchanged").** Settle it by evidence, in a
real browser at the phone's size with two real fingers (CDP touch points, as your finger-drag test does): the first
finger down on a pinned heading and held; a second finger down on another pinned heading, moved sideways, lifted alone.
EXPECTED (as the table's own heading does today — FIRST run the same two-finger sequence on the table's own heading row
on your build and record what it does; that is the control): no column order is written, Undo gains nothing, no lift
frame or landing mark is left. Also the case: one finger on a pinned heading, the second on the table below. If the
pinned row does differ from the table's own, fix it as Astra's steps 1–5 say (the starting pointer tracked, a second
touch cancels, moves and releases only from the starter, `pointercancel` cancels, the pinned row joined to the same
pinch controller) — the smallest change that makes the pinned row behave as the table's own. If your red test cannot
make it fail, say exactly what you drove and what happened, keep the test as a passing guard, and change no code for F1.

**F2 — the filter case (the walk's A8, Astra's finding 2, the Opus reader's finding 3).** With the filter box hiding
his row when "Check his quals" is pressed, the ask is spent on that repaint; clearing the filter then outlines him but
the page does not go to him. On `main` the page went to him then. THE HOST'S DECISION (a technical default, to be told
to the owner in one line — he may change it): restore `main`'s recovery without the old fault — the trip is made on the
first repaint that DRAWS his row. In order: look the row up first; if it is not drawn, return WITHOUT spending the ask;
once it is drawn, put the outline back; if this ask's trip is already made, stop; mark it made, then the existing
in-view check and the conditional trip. A newer ask still replaces the older. Tests (unit, and one browser case at a
desktop's size): hidden by the filter → no trip, no outline; a tick on another man's row while he is still hidden → no
trip; the filter cleared → outlined and ONE trip (if out of view); a later tick or sort → no trip. Cover the admin's
"Check his quals", and Undo / Redo of a change to a man the filter hides.

**F3 — a redraw during a drag begun on the pinned row (the Opus reader's finding 2).** The pinned copy's markup is
re-set on every render, so a redraw mid-drag (a resize, the phone's toolbar, a store change) wipes the picked-up look
from the pressed pinned heading. Reproduce as the reader says (mid-drag, `window.dispatchEvent(new Event('resize'))`,
wait, move once more; assert the pressed pinned heading still wears its picked-up look and exactly one landing mark
shows). Fix by the reader's (a) — the pinned copy's markup memoised as the table's is — unless (a) breaks a pinned
row test; then (b). If it cannot be made to fail, say so and change nothing.

**F4 — the wobble (the walk's B3).** A finger's drag on a pinned heading with about 40px of up-and-down wobble lifted
nothing. Drive the SAME wobbling drag on the table's own heading row: if the table's own lifts and the pinned does
not, that is a difference to fix (the pinned row must behave as the table's own); if both refuse it, record that and
change nothing.

**F5 — the stale contract line (both readers).** `raptor-port/docs/ui-contracts.md` lines 5520–5522 still say the
frozen header mirror carries no drag handlers. Correct it in place (a correction, never a trim), then search the
document by subject — "mirror", "no drag handlers", "pinned", "heading" with "drag" — and correct any other line that
now reads wrong; say which lines.

**F6 — the missing tests the Opus reader lists (its Q7 b, c):** (b) a drag from the pinned row carried to the edge:
the table and the pinned row scroll sideways together, drop, Undo; (c) a member, and an admin outside Edit quals,
pressing and moving on a pinned heading: nothing lifts, nothing is written. Add them (they should pass on your build —
say if one does not).

Not yours: the ✕ inside a pinned heading (older — filed), the outline's life (older — the item's own text), a finger's
drag in WebKit (the test browser cannot make one), the Leave War's quals list (the host's re-walk).

## Hand back (final message, under 400 words)
For F1–F6: reproduced or not, with the red line (or the control's result); the fix in a sentence; the tests (file and
titles). The commits. The counts of each check. Any existing assertion changed and why. Anything left, with its reason.
