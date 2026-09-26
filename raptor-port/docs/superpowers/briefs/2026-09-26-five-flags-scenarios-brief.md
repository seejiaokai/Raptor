# Brief — the five-flags batch: design the test scenarios (Fable, 26 Sep 26)

**Your job is rank 1 of `raptor-port/docs/bug-check-order.md` §4: design the scenarios — hunt for what is MISSING,
not whether the code is wrong.** Read-only: do not edit any file, do not run the app. Work in
`C:\Users\User\projects\Raptor\.claude\worktrees\five-flags-batch-build-ef7d85` (branch
`claude/five-flags-batch-build-ef7d85`, from `main` at `e27e15fe`). The builder (Opus 5.5) is building the five
changes below in parallel; you are designing from the PROMISE and today's code, so your scenarios test the build
from outside its own picture of it.

Read first: `raptor-port/docs/bug-check-order.md` (§2, §2b, §5–§8), `.claude/rules/decisions/scheduler.md`
(D164 and §Settled "Board behaviour", "Week navigation & cross-week continuity"), `.claude/rules/decisions/leave-war.md`
(D160 and §Settled "Leave War roster & display"), `raptor-port/docs/feature-impact.md`, `raptor-port/docs/ui-contracts.md`.

## The five promises (the backlog items, `OUTSTANDING.md`)

1. **[PUCK-FLAG-GLOW] (D164)** — *"some of the flagging on the puck is glowing, some are not can u not make it glow."*
   A flagged puck never glows. The purple "this is you" puck (since `[ACCOUNTS]`, the SIGNED-IN person's own puck —
   `ad`/`a` is Saber, `us`/`us` is Ranger) wears a red glow on top of its red ring when it carries a red flag
   (`raptor-port/src/ui/scheduler.css` `.puck.me.boxred`, `.puck.me.boxdash`). The build drops that glow so a flagged
   "this is you" puck shows the same plain red ring — solid, or dashed for a sanctioned late show — as every other
   flagged puck, and keeps its purple fill (and its purple ring when unflagged).
2. **[LW-RESET-ORDER] (D160)** — a "Reset order" line in the Leave War's ⚙ Settings (admin only) that puts a
   hand-arranged roster back in the default order (each group as listed, pilots above WSOs, then CAT, then callsign).
   The builder's plan: it CLEARS the saved order (`setRosterOrder([])`, so later arrivals and CAT changes follow the
   default too) rather than freezing today's default as a saved order (`autoSortRoster`); it asks once ("Really
   reset?") like "Reset counters"; it is greyed when the roster already follows the default; it is undoable with the
   one Undo.
3. **[CROWD-SWAP-SAYS-BUSY]** — on the board, dragging a man onto another man in the SAME Common Programme crowd
   swaps them (right) and toasts "<him> — already on <that same row> 08:30–09:00" (wrong). Root cause found:
   `raptor-port/src/engine/avail.ts selfKey` trims a Common Programme key one step too far — a person seat
   `a:di.ri.N` becomes the row `a:di.ri`, but the event's own row key `a:di.ri` becomes `a:di`, so his own row never
   matches itself; and for an ARMED crowd ("+ add", `a:di.ri.+`) both become `a:di`, so every programme row of the
   day is excluded — a man already on ANOTHER overlapping programme row is offered as free although the warning list
   raises a hard clash once he is planted. The plan: trim only the person index; the busy check also excludes the seat
   a man is being dragged FROM (as the SC and AVALON checks above it already do — the hover must describe the week
   after the move); the cross-day check's "was it his only event that day" test compares keys of one shape.
4. **[VIEW-ARROW-OVER-LIST]** — on a desktop (>820px wide), the week's floating ‹ arrow (fixed, 8px from the left,
   38×70px, `#weekPrev`) sits over the first 26–38px of the day at the front: an opened "⚠ N issues" list, a row's
   name, a puck. The plan: give the desktop week an inset at its left (padding and scroll-padding of ~54px) and make
   every way a day is LANDED at the front (an arrow press, a page switch carrying the day, a week-jump to a day, a
   warning tap that pans, the next-week preview's landing) put it beside the arrow, not under it. Phones untouched.
5. **[BG-GUARD-FALSE]** — tooling, not the app: the background-command guard (`.claude/hooks/bg-cwd-guard.mjs`) and
   the notes that say a background shell "starts at the REPO ROOT". Measured 26 Sep 26: a background shell starts in
   the CHAT's starting folder, not where the foreground shell has moved to. The plan: the refusal names the absolute
   path; a chat whose starting folder is `raptor-port` itself may run a bare `npm`; the notes are corrected.

## What to hand back

Use this wording as your instruction — it is the standing order's §4 brief:

> Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
> qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order
> of actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item,
> state where the visible sign and the working gesture should exist in the production app. Then rank concrete failure
> scenarios with setup, action, expected result, and the observation that would disprove correctness. Start with the
> least-shared or most specialised surface.

And the exclusion, in the same breath (owner, D56):

> This app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before the database step.
> **Do not report a problem whose harm exists only in data already stored when the code is already correct going
> forward** — no migration, no back-compat, no "an existing record would read wrongly". If the app would do it again to
> NEW data, report it: that is a real finding and this exclusion does not touch it.

Specifically, per item: the ROLL-CALL you expect (every place that thing is drawn or reached — for item 1 every
surface that draws a puck that can be "this is you" AND flagged; for item 3 every caller of the busy check and every
drag/drop/arm route into a crowd, a ground row, a duty, a sim, a flying seat; for item 4 every landing path and every
edge-docked control), the DOORS (item 2: who sees the line, in which states, and what else in ⚙ Settings it must not
disturb), the ORDERS worth walking both ways, the ripple into other surfaces, and the scenarios ranked most-likely-to-
find-a-real-defect first. Give **explicit negatives** ("I checked X and expect nothing") where you looked and found no
risk. Keep it to what a walker can execute in the running app at 1440×900 and 390×844; mark anything only a real
iPhone can prove.

Return it as your final message (Markdown). The builder saves it to
`raptor-port/docs/superpowers/specs/2026-09-26-five-flags-scenarios-fable.md` and walks it.
