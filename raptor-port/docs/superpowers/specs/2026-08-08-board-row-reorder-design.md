# Reordering rows on the scheduler board — design

Owner ask, 8 Aug 26: *"In schedule board mode if I click on the far left I can
drag lines up and down to adjust the sequence."*

Every list on the board is drawn in the order it is stored, and a new row always
lands at the bottom. The only way to change a sequence today is to delete a row
and retype it lower down. This adds a direct one.

Brainstormed against the running board and a comp built in `scheduler.css`
itself, screenshotted at 1280 and 390. Owner decisions are marked **(owner)**;
everything else is a call made here, per `CLAUDE.md` §How to work here.

## What it does

A scheduler in edit mode gets a **grip** (`⠿`) at the far left of every movable
row on the board. Drag it and the row lifts; a blue bar shows the landing place;
release drops it there. On a phone the grip is hidden and the row's control
cluster carries **▲ / ▼** buttons instead — one tap, one place **(owner: grip on
desktop, buttons on mobile)**.

Movable rows, all of them **(owner: every list on the board)**:

| list | what one row is | container it may not leave |
|---|---|---|
| flying lines | a **formation** — all its jets travel together | its wave (Go) |
| jets inside a formation | one aircraft | its formation |
| Duties | a duty row | its duty block |
| Sims | an AMT or OFT row | its AMT / OFT group |
| Ground Programme | a ground item | the day |
| Overall programme | an all-hands item | the day |
| Overall notes | a note line | the day |

Four rules:

- **Within its own list only** **(owner)**. No row crosses into a neighbouring
  list — a line cannot change Go, a duty row cannot change block, an AMT row
  cannot become an OFT row. Those moves stay delete-and-retype.
- **A formation moves as a block** **(owner)**. Grab any row of a pair or
  four-ship and every jet travels with it, in order.
- **Jets resequence inside their formation** **(owner)** and can never leave it.
- **Never on a frozen version preview, never for a non-scheduler.**

A move is an ordinary edit: it marks the day amended, goes out on the next AL,
and Undo reverses it **(owner: it marks the day amended)**. The board and the
week read the same model, so the new order reaches the week and the CSV at once.

## Two lists that did not keep the order they were given

Found while scoping, raised with the owner, and both resolved toward the fuller
behaviour:

- **Ground Programme sorted itself by start time on both surfaces**
  (`groundOrder` in `html.ts`, called by the week and by `board-html.ts`), so a
  manual order would have been undone by the next redraw. **(owner: a manual
  move switches the sort off.)** Moving a Ground row sets `d.gman` on that day;
  from then on the day's Ground list renders in model order and new rows land at
  the bottom. The way back is **Undo**, which restores `gman` along with the
  order because `histSnap()` serialises the whole of `DAYS` — no new control is
  needed, and none is added.

  **The first move on a day freezes the visible order before it moves
  anything.** A move expressed in model indices would otherwise be undone by the
  next redraw — and the first one in particular would read as doing nothing at
  all: drag the 1000 line above the 0800 line and a naive model move puts it at
  model index 1, where the sort still prints it last. So `moveGroundRow` permutes
  the model into the order on screen (keys and all), sets `gman`, translates the
  caller's model indices into that frozen order, and only then moves. This is
  what makes the general permutation the primitive above.
- **Duties printed in a fixed role order on the week** (`dutySort`, SDO → SXO →
  OPS-O → …) while the board showed model order, so a reorder would have stuck
  on the board and never reached the issued programme. **(owner: the scheduler's
  order wins everywhere.)** `dutySort` comes out of the week's render.

  So that nothing appears to change on day one, the seed week's duty rows are
  **re-laid in the order they currently print** — day 0 wave 1 goes from
  `SXO, OPS-O, SDO` to `SDO, SXO, OPS-O`, and the same for every other block.
  With the stored order equal to the sorted order, deleting the sort produces
  byte-identical markup, so `parity.test.ts` stays byte-exact against the
  reference (which still sorts) with **no `refwin.ts` patch**. This is the whole
  reason to re-lay the data rather than patch the reference: it keeps a
  deliberate divergence out of the parity harness.

  Duty `d:`/`dr:` keys are model indices, so re-laying the seed changes which
  row a given index names. Nothing is persisted (only `rules` and `stores` are),
  so there is no migration; tests that hard-code a duty index are updated.

## Architecture

### 1. The move primitive — `engine/keys.ts`

The amendment machinery addresses rows by index (`dn:0.2`, `ap:0.3.prog`,
`fr:0.1.0.3`, the bare flying key `0.1.0.3.p`). `shiftKeys()` already rewrites
that key space for a **splice**: marks on the deleted row are dropped, marks
after it move down one. A **move** is the missing sibling.

```
permuteKeys(head, pos, oldOf)      oldOf[newIndex] = oldIndex
  n in the permutation → its new index
  n outside it         → left alone (a stale key is inert; a dropped one is a lost record)

moveKeys(head, pos, from, to, len) = permuteKeys over the splice-out/splice-in
                                     permutation of a list of length `len`
```

**A general permutation is the primitive, and a single move is the wrapper** —
the reverse of the obvious arrangement, and planning forced it. Ground renders
time-sorted, so its first manual move has to freeze the order on screen into the
model before it can move anything within it (see below), and a freeze is a whole
permutation. One primitive serves both.

Applied to the same three places `shiftKeys` touches: `SCHED.pending`,
`SCHED.changes`, and `keys` on every issued AL.

Two properties that matter and are asserted directly:

- It **drops nothing**. Unlike `shiftKeys`, every key survives a move; a
  vanished mark is a bug, not a design.
- It is a **bijection** on the affected index range, so the rebuilt object can
  never collide two marks onto one address.

`from === to`, an out-of-range index, or a missing `head` is a no-op.

### 2. The movers — `engine/reorder.ts` (new)

One function per list, each reusing the exact head lists the matching
`shift*` helper already proved correct:

| mover | key-space heads (pos 0) |
|---|---|
| `moveFormation(di,gi,from,to)` | `ff:di.gi.` `fr:di.gi.` `st:di.gi.` `ar:di.gi.` `at:di.gi.` `di.gi.` |
| `moveAircraft(di,gi,li,from,to)` | `fr:di.gi.li.` `st:di.gi.li.` `di.gi.li.` |
| `moveDutyRow(di,wi,from,to)` | `d:di.wi.` `dr:di.wi.` |
| `moveSimRow(di,kind,from,to)` | `s:di.kind.` `sr:di.kind.` |
| `moveGroundRow(di,from,to)` | `g:di.` `gr:di.` — also sets `d.gman = true` |
| `moveProgRow(di,from,to)` | `ap:di.` `a:di.` |
| `moveNote(di,from,to)` | `dn:di.` |

Each one: bounds-check → `splice` the model array → `moveKeys` over its heads →
`markEdit(<the moved row's own name key at its NEW index>)` →
`afterSchedMutate()`.

**Why a key, and why that key.** A delete calls `markEdit()` with *no* key
because it must not re-mark the address it just removed. A move is the opposite
case: the row still exists and its position is what changed, so it marks its own
new address — `ff:di.gi.to.cs`, `dr:di.wi.to.role`, `gr:di.to.prog`,
`ap:di.to.prog`, `sr:di.kind.to.label`, `dn:di.to`, `fr:di.gi.li.to`. That is
the same idiom every **add** uses, it puts the row into the next AL (which is
what "marks the day amended" has to mean mechanically), and it tints the row
that actually moved. Re-marking a row that already carried a pending mark is
idempotent.

New engine file, so it wants a line in `engine/index.ts` and in
`src/probe-bridge.ts`.

### 3. Rendering — `ui/html.ts`, `ui/board-html.ts`, `ui/board.ts`

Every movable row gains, as its **first** child:

```html
<span class="sb-grip" data-move="mv:f.0.1.2" title="Drag to move this row">⠿</span>
```

and, inside its existing `.lctl` control cluster, two buttons:

```html
<button class="mbtn nudge" data-mvup="mv:f.0.1.2" title="Move up">▲</button>
<button class="mbtn nudge" data-mvdn="mv:f.0.1.2" title="Move down">▼</button>
```

Both are always in the markup; **CSS decides which is visible** at which width.
Rendering conditionally on viewport would make the string-diff depend on window
size and would not survive a resize.

**The `mv:` address grammar** is `mv:<kind>.<container…>.<index>`:
`ac` aircraft, `d` duty, `s` sim, `g` ground, `p` programme, `n` note. For every
kind except `ac`, two rows may exchange places **iff their addresses share
everything but the last component** — one test that enforces every containment
rule in the table at once (a duty row cannot change block, an AMT row cannot
become an OFT row) with no per-kind special casing.

**A flying row is the one case with two meanings, and the drop decides which.**
The grip on a flying row carries the full aircraft address `mv:ac.di.gi.li.ai`,
because a flying row *is* one jet — but the owner asked for both a formation
that travels as a block and jets that resequence inside it, and there is only
one grip. The drop target resolves it:

| the row it is dropped against | what happens |
|---|---|
| same `di.gi.li` — a sibling jet in the same formation | `moveAircraft` — the jets resequence |
| same `di.gi`, different `li` — another formation in this Go | `moveFormation` — the whole formation travels, jets in order |
| different `gi` — another Go | refused; the row springs back |

This is the only reading consistent with both owner decisions: a jet may never
leave its formation, so a drag that lands outside the formation cannot mean
"move this jet there" and can only mean "move this formation there". For a
single-jet formation the two cases collapse and either path is the same result.

**▲ / ▼ resolve the same way**, against the row immediately above or below: if
that row is a sibling jet the two jets swap, otherwise the formation steps one
place. ▲ on the first row of the first formation, and ▼ on the last row of the
last, are no-ops — the buttons stay rendered and simply do nothing rather than
appearing and disappearing as rows move.

Render gate is `HOOKS.editMode()`, matching the stores chips (`board.ts`'s
`stoRO`): the board is a modal that survives a page change, so a bare `CURPAGE`
test would render live controls to a duty crew who still has a board open.

`groundOrder(rows, man)` takes a second argument; `man` returns model order
untouched. Default (`undefined`) keeps today's time sort, which is what holds
byte-exact parity.

### 4. The drag machine — `ui/rowdrag.ts` (new)

Its own small pointer machine, modelled on the qual-heading drag in
`QualsPage.tsx`. **`drag.ts` stays scoped to pucks** (owner, Aug 26) — a board
row is not a puck, and the no-drag-to-section decision is not reopened.

- Pointer events, not HTML5 DnD, so a finger works.
- `releasePointerCapture` on the way down, or every `pointermove` keeps
  reporting the row the drag began on and the row can never find a new home.
- The lifted row and the drop bar are written **straight onto the DOM**, not
  through state: the board is an innerHTML string that a re-render rebuilds, and
  rebuilding it under a moving pointer would drop the drag. Only the drop
  changes state.
- Delegated on the board wrap, so it survives every panel repaint.

### 5. Write-path guards

Three layers, the 6 Aug role lesson applied without exception:

1. Render — `HOOKS.editMode()` emits no grip and no buttons otherwise.
2. Gesture — `rowdrag` and the `▲/▼` branch both refuse unless
   `canEditSched()`, and both bail on `view.DPREV.has(view.SBDAY)` (the stale
   markup guard `boardMbtn` already uses).
3. Engine — every mover no-ops on an out-of-range index, so a stale or forged
   address cannot corrupt the model.

### 6. Stylesheet

- Desktop: prepend one `18px` track to `.sb-lcols/.sb-line` and to
  `.sb-acols/.sb-arow` in both the 6-column and `c6r` forms.
- Phone (`max-width:820px`): the grip is `display:none`, so it creates no grid
  item and the phone templates need no new track — but it is still a DOM child,
  so **every `nth-child()` rule in the phone block shifts by one**. That
  re-indexing is the single most breakage-prone edit in this change and is the
  reason the geometry gate covers it.
- `.mbtn.nudge` is hidden above 820px and shown below it.

`scheduler.css` carries measured contracts, so the grip's 18px track and the
30px phone tap target are stated as measurements, not preferences.

### 7. Perf

Three nodes per movable row (grip + two buttons). The board's recorded DOM
ceiling is **810** against a last measurement of **767**
(`probes/perf-port.cjs`), so this will very likely need raising. The number is
**measured, not estimated**, and the ceiling is raised as a deliberate,
argued edit in the same PR, with the reasoning in `docs/probe-sweep.md` §The
performance gate — the process that file already prescribes.

## Testing

The amendment key rewrite is the part that fails silently, so it carries most of
the weight.

- **`engine/keys.test.ts`** — `moveKeys` up, down and no-op; nothing dropped;
  no collisions; other key spaces untouched by a move in one of them.
- **`engine/reorder.test.ts`** (new) — every mover reorders its array and takes
  each row's seats, remarks, stores, CX and red-box with it; a pending mark, a
  `changes` entry and an **issued AL's** key all still name the same row after a
  move in each direction; out-of-range and `from === to` are no-ops; a formation
  move carries all its jets in order; a drop inside the formation resequences
  jets while a drop against another formation moves the block, and a drop into
  another Go is refused.
- **`engine/ground-order.test.ts`** — a ground move sets `gman`, the list stops
  time-sorting, and Undo restores both.
- **`parity.test.ts`** — unchanged and still byte-exact, with the re-laid duty
  seed and the default-off ground flag. If this goes red the re-lay is wrong.
- **`e2e/geometry.spec.ts`** — at 1280, drag a grip and assert the order changed
  and a pair stayed together; at 390, tap ▼ and assert the same; assert the
  phone board's column layout still holds after the `nth-child` re-index (this
  is the one jsdom cannot see); assert a member sees no grip and no buttons.
- **Live view** — build, `vite preview`, drive the real board at both widths,
  screenshot and look, per `CLAUDE.md` §Build & verify. Then the deployed page
  after it ships.

## Out of scope

- Moving a row **between** lists (a line to another Go, AMT ↔ OFT). Declined by
  the owner as the boundary question; delete-and-retype stays the path.
- Reordering anything from the **week** — the board is the editing surface.
- A "sort by time" button to undo the Ground manual flag. **Undo is the way
  back**, and a second control for the same job is not built.
- An AL that names the before-and-after position of a moved row. The owner chose
  the plain "day amended" record; the AL stores addresses, not positions.
- Persistence. Order lives in `DAYS`, which is not written to storage — a reload
  restores the seed, exactly as it does for every other schedule edit.
