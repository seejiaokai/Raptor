# Mobile scheduler board — flaw fixes (design)

Date: 8 Aug 2026. Owner critique session over the just-shipped one-window
phone board (PRs #117–118). A live-driven sweep found two shipped defects
and two weak spots; the owner chose a direction for each through four
questions. Phone (≤820px) only — the desktop board and `.sb-wide` are
untouched throughout.

## Findings (measured on the built bundle, 390×844)

1. **DEFECT — the parked AIRCREW tab steals taps from the header.** The
   drawer aside spans `top:0;bottom:0`, so its 26px parked sliver covers
   the right edge of `.sb-top`: `document.elementFromPoint` at the centre
   of **✕ Close** and of the **Sun 19** day chip returns `.ros-tab`.
   Tapping either opens the drawer instead.
2. **DEFECT — the invisible 14px tap extension overlaps inputs.** The
   `::before` added to widen the tab (left:-14px, so hit area 351–365px)
   sits over the last ~13px of every full-width input (they end at 364px).
   A caret tap at the end of a remarks line opens the drawer.
3. **WEAK — no visible result after a fill.** Arming a slot auto-opens the
   drawer; tapping a name plants the puck — behind the still-open drawer.
   Measured: the filled seat is fully covered at the moment of planting.
4. **WEAK — Live checks is a scroll-within-a-scroll.** Monday: 568px of
   warning rows in a 193px strip. Nested scrolling on a phone is fiddly
   and mis-taps warning rows.

Noted, no action: warning jumps land correctly with the drawer parked; a
no-flying day costs one tidy line; landscape phones (>820px wide) get the
desktop layout by the standing breakpoint — pre-existing, not part of this.

## Decisions (owner, 8 Aug 26)

- **Q1 — after a fill: the drawer parks itself.** See the puck land; one
  tap per seat (the next slot tap re-opens it). Chosen over stay-open and
  over a peek animation.
- **Q2 — Live checks collapses to one line, tap to expand.** Same idiom
  as the week's day-issue strips. Chosen over as-is and always-full.
- **Q3 — the tab becomes a centred grab-handle.** Roughly half the screen
  tall, vertically centred, slightly wider than 26px; the invisible
  extension is removed. Chosen over full-height-below-header.
- **Q4 — the edit week's tab gets the same handle**, for one look and one
  behaviour, and because it has the same latent tap-stealing over the
  topbar's right edge.

## Design

### 1. The centred AIRCREW grab-handle (board + week)

Parked, the drawer aside IS the handle: vertically centred on the right
edge (`top:50%`, translateY into the parked transform), height
`clamp(180px, 55vh, 440px)`, visible width 30px. Nothing
invisible extends past it — the `::before` extension is deleted. Open
(`body.ros-open`), the aside expands to `top:0;bottom:0` full height as it
slides out, exactly today's open state. Board rules live in the board's
820px block (`.schedboard .sb-ros`); the week's in the week's
(`.edit-board .eroster`). The shared `.eroster` tab styling and the
delegated `.ros-tab` toggle are unchanged. `.sb-wide` and desktop continue
to melt the wrapper (`display:contents`).

Consequences: ✕ Close, the day chips and every input end get their taps
back; the handle is an honest 30px-wide thumb target with no hidden hit
area.

### 2. Park after a successful fill (both drawers, phone only)

A successful plant into an armed slot from the roster, and a successful
drag-drop from the drawer onto a slot, remove `ros-open` (guarded by
`isPhone()`). Anything else — scrolling the list, a tap that is not a
name, an aborted drag, arming another slot — leaves the drawer as it is.
Implementation: the tap path parks where the plant commits (the
placeArmed success branch); the drag path stops re-adding `ros-open`
after a drop that landed on a slot (drag.ts's `ROS_REOPEN` reopens only
when the drop did NOT fill anything).

### 3. Live checks folds to one line (phone board only)

The strip renders collapsed as a single tappable summary row — count and
day, warning-styled, e.g. "⚠ 13 for Monday" (a quiet day reads "No
conflicts") — and expanded shows ALL rows with no inner `max-height` or
scrolling; the one board scroller does the work. Tapping the summary (or
the expanded header) toggles. State is module-local, defaulting to
collapsed each time the board opens; it survives day-tab switches within
a visit. Desktop and `.sb-wide` keep the always-open side list. A day
preview still replaces the strip with the read-only "viewing as issued"
bar, which never collapses.

### 4. Tests

- e2e (geometry gate): tap Close → board closes, not the drawer; tap the
  Sunday chip → the day switches; a tap at the right end of a remarks
  input focuses the input; the parked handle is centred and clear of the
  header; the collapsed strip expands on tap and collapses back; after a
  tap-fill the drawer is parked and the planted puck visible.
- jsdom: the collapse toggle's class/state logic; park-after-fill's
  `ros-open` removal on the plant path; the existing drawer pins updated
  to the new geometry classes.
- All six gates before shipping; the live page checked after Pages rolls
  over, as standing instructions require.

## Out of scope (recorded, not built)

- Landscape phones landing in the desktop layout (the 820px breakpoint
  is long-standing; revisit only if the owner raises it).
- Sim pax holes on the WEEK's builders (stays reference-shaped — the
  board is the planning surface; already documented in ui-contracts).
- iOS safe-area insets for the home indicator (app-wide question, not a
  board one).
