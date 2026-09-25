---
paths:
  - raptor-port/src/leavewar/**
  - raptor-port/docs/leavewar/**
  - raptor-port/e2e/*leavewar*
  - raptor-port/docs/**/*leavewar*
  - raptor-port/docs/**/*lw-*
  - raptor-port/docs/**/*lw-*/**
  - raptor-port/docs/**/*one-absence*
  - raptor-port/docs/**/*arch-stack-4*
  - raptor-port/scripts/handpass/lw-*.mjs
  - raptor-port/scripts/handpass/seat-lw-*.mjs
  # the seams where the Leave War meets the rest of the app (widened 24 Sep 26, the spring clean's red team):
  # its architecture below binds these files too, so a session editing them must load it
  - raptor-port/src/main.tsx
  - raptor-port/src/probe-bridge.ts
  - raptor-port/src/state/store.ts
  - raptor-port/src/state/inputgate-hook.ts
  - raptor-port/src/state/people-settings-commit.ts
  - raptor-port/src/storage/**
  - raptor-port/src/command/**
  - raptor-port/src/undo/**
  - raptor-port/src/engine/qualcols.ts
  - raptor-port/src/engine/people.ts
  - raptor-port/src/engine/inputs.ts
  - raptor-port/src/ui/QualsPage.tsx
  - raptor-port/src/ui/InputsPage.tsx
  - raptor-port/src/ui/inputedit.tsx
  - raptor-port/src/ui/Shell.tsx
  - raptor-port/docs/data-schema.md
  - raptor-port/docs/undo-contract.md
  - raptor-port/docs/performance.md
---

# Rulings — the Leave War

**Loads by itself** whenever a session reads a Leave War file (the `paths:` at the top of this file). The general rulings are in `.claude/rules/decisions/how-we-work.md`, loaded in every session; the map of every ruling and how to add or retire one: `DECISIONS.md`. Newest first; each row keeps the date it was recorded.
**No ruling is filed under the Leave War alone yet.** Its decisions from before this list began are below, in
§Settled before this list, and its architecture in §Architecture (both moved from `raptor-port/CLAUDE.md`,
24 Sep 26). **The OIL rulings load with every
Leave War file** (OIL is leave the war banks) — among them **D79, D80, D81, D82** (a hand-typed award: any
day; never flags a leave day; a worked weekend that earns nobody says so; an award and a worked day add up),
**D19** (a weekend no Leave War period covers says so and offers to create it) and **D21** (an Off day earns
no OIL). **Also read** — in `how-we-work.md`: **D166** (accounts: the war follows the signed-in callsign, not "View as"). In `scheduler.md`: **D44, D45** (nothing on a published day changes without the
scheduler acknowledging it; the pending mark is the mechanism).

**Where the detail lives:** the grid, its sheets and its window of months — `raptor-port/docs/ui-contracts.md`
(its Leave War sections) and `raptor-port/docs/performance.md` §E. Leave War; what the war stores —
`raptor-port/docs/data-schema.md` §World 2; its gaps — `raptor-port/docs/leavewar/known-gaps.md`; the one-absence
rules — `raptor-port/docs/superpowers/specs/2026-09-20-one-absence-behaviour-register.md` and
`…/2026-09-20-arch-stack-4-clash-check.md`; its files — `raptor-port/docs/file-map.md`.

| # | Date | His ruling, in his words where short enough | What it means | Where it lives now |
|---|---|---|---|---|
| D160 | 24 Sep 26 | **"9 yes"** — asked whether he wants a "Reset order" line in ⚙ settings, since the Auto-sort button went on 6 Sep 26 | **BUILD A "RESET ORDER" LINE IN THE LEAVE WAR ⚙ SETTINGS** that puts a hand-arranged roster back in the default order (the store's `autoSortRoster` already does the sort). This is the "his ask" the 6 Sep entry waited for; the Auto-sort BUTTON and the on-grid strip stay gone | `.claude/rules/decisions/leave-war.md` §Settled before this list (the Rearrange entry); `OUTSTANDING.md` `[LW-RESET-ORDER]` |
| D159 | 24 Sep 26 | **"8 leave it"** — asked whether the desktop Leave War grid should also open one step zoomed out, like the phone | **LEAVE IT: THE DESKTOP GRID OPENS AT NORMAL SIZE** (zoom 1); only the phone opens one step out (6 Sep 26). `[LW-DESKTOP-ZOOM]` closed | `.claude/rules/decisions/leave-war.md` §Settled before this list (the zoom entry); `OUTSTANDING-ARCHIVE.md` `[LW-DESKTOP-ZOOM]` |

## Settled before this list — moved from `raptor-port/CLAUDE.md` §Stable decisions (24 Sep 26)

**CLOSED: a new decision is a row in the table above, with a D-number — never a line added here.** These are
the Leave War's settled decisions from before the rulings list began (21 Sep 26), MOVED WHOLE, word for word
(D138), so they load with this area instead of in every chat (D140). Where a row above changes an entry
here, the row wins (newest instruction wins). The preamble they carried in `raptor-port/CLAUDE.md`, unchanged:

Each entry is a tripwire: the decision is SETTLED — don't rebuild, re-propose or
re-litigate it. Where a reference doc holds the full story, the line keeps the
decision + a pointer. Owner + date establish authority; keep them.

### Leave War roster & display (owner, 3–4 Sep 26)
- **Admin controls live in ONE ⚙ Settings; rearranging is on the grid.** Matrix top
  row is now ONE line (owner, 5 Sep 26 — "all in 1 row to minimise row height
  space"): Manning · ⚙ · Rearrange for an admin, then the OIL tracker RIGHT AFTER
  the last control (no spring to the far edge); a member sees just Manning · OIL.
  The old "JAN – DEC 26 · 365 days · 50 people" line was dropped (the war NAME
  still lives in the Period picker in the page chrome). "OIL tracker" shortens to
  "OIL" on a phone (`.rtlbl`) so the four hold one line. **The − / + ZOOM pair
  follows OIL in this row at BOTH widths** (owner, 6 Sep 26 — moved off the
  month strip, where it was phone-only), and **a phone OPENS one step out**
  (`zoom` 0.8, desktop 1 — "can this be the default zoom? Like zoom 1 click
  out"; the desktop STAYS at 1 — his "leave it", D159, 24 Sep 26); the freed month strip holds all twelve months on ONE line on a phone
  (equal-width buttons, 9px, 44px row — the 72px two-line row is gone) and the
  strip CANCELS the grid zoom (`zoom: 1/zoom` inline — navigation chrome stays
  readable at 0.8). The OIL TRACKER sheet has its OWN − / + beside RANGE with
  the same steps and the same phone-opens-at-0.8 default (`OilTracker.tsx`).
  Don't put the zoom back on the strip, let the strip wrap, or let it scale
  with the grid. ⚙ opens `SettingsSheet`
  (CONFIG: + Counter, +/− Event row, Show SANS, Reset counters + the roster GROUPS
  editor folded in; old `⚙ Groups` button + `GroupSheet.tsx` deleted). REARRANGING
  is STILL hands-on-grid (person rows AND category headings drag), and the top
  row's ⇅ toggle is the ONE way in and out (owner, 6 Sep 26 — "delete this whole
  blue section … when I click on it, it exits"): the on-grid strip
  (`.lw-rearrange-bar`, "Rearranging — drag people…", Auto-sort, Done) is
  DELETED; the toggle lights accent while on and is icon-only (⇅) on a phone.
  **No Auto-sort button anywhere** — the store's `autoSortRoster` stays for the
  tests; don't re-add the button or the strip without his ask. **His ask came 24 Sep 26 (D160): a "Reset order"
  line in ⚙ Settings — not a button or a strip.** In Rearrange the
  frozen NAME column WIDENS by the grip's footprint (`.mx-outer.mx-arranging`
  re-sets `--who-w`, 136px desktop / 92px phone) so callsigns keep their at-rest
  width beside the ⠿ ("not … shortened"); the header mirror and strip geometry
  re-pin on `arranging`. The corner cell is empty (5 Sep 26). Don't move config
  onto the grid or rearrange into a sheet (a Sheet's scrim swallows the drag's
  taps), and don't push OIL back to the far edge.
- **Who-wins follows the page order by default** (reversal of 28 Aug "two separate
  orders"). Group higher on the page wins a tie; dragging a category reorders
  who-wins with it (`groupPriorityIds` until `groupPriorityCustom`). A hand edit of
  the ⚙ "Who wins" list switches to CUSTOM; "Match the page order"
  (`clearGroupPriority`) clears it. **Standard categories OVERLAP** — a category is
  a FIT check (`people.ts fitsCategory`), so an SXO IP fits both and IP-above-SXO
  draws them under IP; `groupOf` = first fit down `GROUP_ORDER` (untouched page
  unchanged). Two fits stay exclusive by design: ground crew fit only Personnel;
  OCU fits OCU but never OPS P/W. `sxo`/`san` are never offered as qual groups (they
  ARE the SXO cat / SANS group; a stored one is pruned). The store's
  `autoSortRoster` buckets by live grouping (`liveAutoOrder`) — no button calls
  it since 6 Sep 26 (above); an empty `rosterOrder` shows the same order.
- **A chip shows only the CAT; hover/tap reveals DISPLAYED quals in group colours.**
  Chip stays CAT-coloured (`catClass` off `groupOf`), never encodes a qual. The
  popover (`qualpop`, screen-fixed so the frozen column can't clip it) lists ONLY
  the qual GROUPS on the page the person matches, each pill its group colour, + SXO
  gold when present. Undisplayed quals not listed; an empty chip is inert (no
  `.has-quals`). Click swallowed (doesn't open figures sheet); dismissed by
  pointer-leave, outside pointer-down, scroll, Escape, or a second tap — no scrim.
- **A qual group's colour is the admin's PICK.** `groupColors` (persisted
  `groupcolors`, admin-gated, `q:` ids + `#rrggbb`, dropped with the group, cleared
  by reset); `groupColorOf` falls back to a deterministic palette (`qualSwatch`) so
  an unpicked group is never black. ⚙ list opens a 12-dot palette (`PALETTE`);
  built-ins/SANS keep their CSS-class CAT colours, no button. Pill text by luminance
  (`inkFor`). Palette closes on pick / outside click / Escape (per the popup rule).
  **NOT pruned at boot** — pruning is at read (`groupsInOrder`) and when the
  catalogue arrives (`setQualCatalog`); a boot prune once threw away every saved
  TF/NVG/custom group before Raptor's real column list landed (bug hunt, 4 Sep).
- **The ⚙ groups list drags too.** Rows carry `data-grow` + a `⠿` grip wired to the
  same `GROUP_DRAG` → `moveGroupTo` as the grid heading, so the two never disagree
  (SANS has no grip, auto-placed at the foot). "Drop after row X" resolves from the
  hovered row's OWN container, never a document-wide query. Every draggable list
  shows the bar on the hovered row's bottom edge for a lower-half hover.
- **Pilots above WSOs inside every block, ALWAYS.** `rankCompare` sorts seat before
  `CAT_RANK`; `displayRoster` partitions each block by seat around the hand-order —
  a drag can't carry a WSO above the pilots (single-seat blocks untouched). The
  callsign wears a FULL-WIDTH seat-colour bar across the frozen column (pilot olive,
  WSO green; `.cs.seat-*`, `flex:1` to the CAT chip). LW bars are DARKER than
  Raptor's pucks — explicit deep-olive/deep-green hex in `matrix.css`, NOT
  `var(--fcp/--rcp)` (never darken the flight line via scheduler.css); ground crew
  keep a light bar off pure white. Phone (≤430px): bar side-padding tightens to 4px.
- **The qual catalogue is Raptor's LoX column list, not the holders.** Column list
  lives in `engine/qualcols.ts`; `qualCatalogue` takes keys+headings from it,
  appending any key someone still holds after a removed column (ticks survive).
  (The old "known gap — the column list isn't saved across reload" was SUPERSEDED
  by the 8 Sep 26 storage work: `qualcols` is one of the durable settings keys,
  saved and reloaded by `engine/qualcols.ts`. Corrected 17 Sep 26.)
- **Show SANS = SANS as their own counted group at the foot.** Injects `SANS_GROUP`
  (auto-managed, never stored) LAST on the page / FIRST in who-wins, so shown SANS
  draw together; they still count in manning by seat+band (a group never moves a
  count — `groups.ts` invariant).


### Leave War grid performance (split 24 Sep 26 from "Leave War grid & scheduler render/drag performance")
Full detail for this whole group: `docs/performance.md` (Part 1 invariants + Part 2
ledger). Read it before any layout/render/drag-touching change. *(Heading and intro copied at the split; the
scheduler half of the group — the board DOM ceiling, the dragged ghost, the per-block day swap — is in
`scheduler.md` §Settled before this list.)*

- **The open-bidding dates wear a glowing dark-green border on the LW grid** (owner,
  1 Sep 26). One overlay `.lw-bidbox` (`Matrix.tsx measureBidBox`) around
  `bidFrom..bidTo`, shown only while `stage==='open'`. Colour `rgba(74,140,100,.80)`
  + low-opacity halo (the lighter of two faded greens he compared; deeper
  `rgba(56,104,76,.78)` was the other) — don't brighten or swap to `--ok` without
  asking. OUTLINE ONLY — he declined the faint-green wash (built, one-line add if he
  asks; don't re-pitch). `ui-contracts.md` §The open-bidding box; pin
  `e2e/leavewar.spec.ts`.
- **The tab opens on the war being bid on, at the start of its bidding window**
  (owner, 7 Sep 26 — "the default view … is always the start of the period in which
  it is opened for bidding, followed by bidding closed, followed by published"). Boot
  picks `currentId` by STAGE (open→closed→published→draft, `stages.ts
  pickDefaultPeriodId`) on EVERY load — a remembered `current` is recorded but
  deliberately NOT honoured at boot (owner reaffirmed 17 Sep 26; it briefly WAS
  honoured after the 8 Sep storage seam made the tab persist, which silently
  reopened the squadron on whatever war was last glanced at. A picker switch
  still holds for the rest of that session). Pinned by
  `state/store.test.ts` "records the chosen war but does NOT reopen on it".
  The grid lands on
  `period.ts defaultFocusDate` (`bidFrom ?? start`) once on first show
  (`LeaveWarPage.tsx` → `focusDay` → `Matrix jumpTo`, the under-manned jump path — so
  it preloads the target months and scrolls there), and `selectWar` lands the same way
  on a picker switch. The column window builds AROUND that month, not month 0 — don't
  reset it to 0 on a war change or the desktop whole-year fill drifts the landing back
  to January (the phone's rolling window doesn't). Reads the same `stage`/`bidFrom` as
  the open-bidding box; keep them in step. `ui-contracts.md` §The Leave War opens on
  the war being bid on; pins `stages.test.ts` / `period.test.ts` / `leavewarpage.test.tsx`.
- **The Leave War year grid: one draw-toward-a-target window engine** (owner, 3–5 Sep
  26). Whole months at real widths over year-wide PLACEHOLDER cells (one empty cell
  per side per row, as wide as the months it stands for), drawn IN PLACE while the
  scroll is still moving. One loop `colwindow.ts stepToward` toward a per-mode TARGET:
  phone = rolling window a few months ahead (prune at rest); desktop on-screen = whole
  year (scrollbar slides); desktop off-screen = capped `HIDDEN_MONTHS`, drawn only
  while idle (`state/idle.ts`). Shrinks on leave (dropped months → measured-width
  placeholders, scroll kept), rebuilds on return; pre-warmed hidden after login
  (`Shell.tsx`, idle-gated). Load-bearing invariants: `docs/performance.md`
  §Leave War window engine holds them in full — the short form (don't undo): a drawn month keeps
  its MEASURED width in the placeholder (`monthPxRef`); never draw/prune an
  estimated-width month left of the view mid-scroll; placeholder widths are INLINE
  styles, never a CSS custom property on `.mx-outer` or ANY grid ancestor (restyles
  ~7k nodes; `--lwx-max` lives on the frozen bar's own box); EVERY row incl header
  carries identical cells (the owner's iPhone/WebKit is the gate); on-screen signal is
  `screen.ts` (a listener set, NOT the store — never repaint the grid on tab show);
  `PersonRow` day cells stay one memoised `PersonMonth`/month; keep `.mx tbody tr
  {position:relative}`. This reverses the 3 Sep "never fixed-width spacers" and the
  4 Sep "desktop keeps whole year / never prune" — the reveal cost is why.
  `ui-contracts.md` §The Leave War grid draws a window of months; HANDOFF-ARCHIVE.md
  (the 5 Sep 26 entry); pins `colwindow.test.ts` + e2e.

## Architecture — moved from `raptor-port/CLAUDE.md` §Architecture rules (24 Sep 26)

The Leave War's architecture rules, MOVED WHOLE, word for word (D138), so they load with this area instead of
in every chat (D140). The rules every area shares — the store, the mutation and persistence funnels, what
persists, the one command layer — stay in `raptor-port/CLAUDE.md` §Architecture rules. Paths inside this
section are relative to `raptor-port/` (as they were in that file).

**The Leave War tab is a SECOND app with a SECOND store** (vendored 16 Aug
26, `src/leavewar/`). It keeps its own store/notify/useVersion, its own
`state/storage.ts` seam (NOT `HOOKS.storeBackend`), and its own vitest project
(fixed TZ + jsdom + 20s timeout — see vite.config.ts). **IT PERSISTS — the
17 Aug 26 "session-only" decision was SUPERSEDED by the 8 Sep 26 storage work
(corrected here 17 Sep 26 after both reviewers found this reading as live).**
`main.tsx` boots it on the WHITEBOARD (`lwInitStore(leavewarAdapter(wb))`), so
on a built site a world that came back from storage keeps its wars, its OIL
story and its inputs; `installDemoWorld` overlays the demo only on a
first-ever boot. `memoryBackend` is now the DEV/TEST path only (`vite` dev,
`MODE==='test'`, `?fresh=1`, or a browser whose storage can't be touched —
`storage/boot.ts chooseBackend`). **Do not "restore" session-only behaviour or
delete this persistence as unintended — it is deliberate.** The seam interface
(`state/storage.ts`, `memoryBackend`/`localBackend`) stays; the shared database
replaces the implementation behind it. What is stored: `docs/data-schema.md`. Four seams cross the boundary, and only
four: `main.tsx` boots it once (`lwInitStore` → `installDemoWorld` →
`wireLeaveWarSync` → a `histInit` re-baseline, in that order), `resetSession`
derives its role from the Raptor login (`store.ts:toggleRole` — the admin's
view-as-member flip, 27 Aug 26 — is the only other production writer, riding
this same seam so the war always reads the session's EFFECTIVE role; on the
Leave War itself, moving the cycle stage forward became admin-only the same
day — members still bid), `probe-bridge.ts`
exposes `w.lwSetRole` for its e2e suite, and **`src/leavewar/sync.ts`** — the
sync wires (17 Aug 26; this seam also mirrors Raptor's "View as" person into
the Leave War store's `viewer` on every Raptor notify — what lights the
viewer's row and personalises the counter picker — a rider on this seam, not
a fifth): Leave War's roster is a boot-time PROJECTION of
Raptor's PEOPLE; **an absence is ONE record — the Raptor Input ([ARCH-STACK]
step 4, 20 Sep 26; SUPERSEDES the 17 Aug two-way copy: `runInbound`,
`runOutbound`, `retractLwRow`, `ingestFromRaptor` are deleted)**. The war
stores only its own records — a LIST per person/date of requests, OIL credits
and replaced-bid notices (`engine/warrecs.ts`) — and DERIVES everything it
shows about leave, medical, courses and overseas duty from the Inputs on read
(`sync.ts:refreshAbsences` → `state/merge.ts` → `engine/dayview.ts`: one main
code by the agreed ladder, grey `+n` / amber `!`, charges by halves). Approving
on the war writes the Input inside the same command (the absence door in
`sync.ts`, installed on the store, carrying `lw` = the war id as provenance).
The owner's clash rules run at ONE seat inside the Raptor inputs door
(`leavewar/inputgate.ts` via `state/inputgate-hook.ts`: sick cuts leave, no
overlapping leave / leave over a medical / leave over recorded work, a
clashing input replaces an undecided bid with a notice) — and on undo/redo, and
publishing a weekend/PH day replaces a clashing bid inside the publish command. *(SUPERSEDED 20–21 Sep 26 — marked
24 Sep 26 by the amendment re-test, per D90: "keep the bid and flag the day, both ways" — publishing KEEPS a clashing
undecided bid and flags the day; `leavewar/sync.ts` `publishFlagsBids`, pinned by `leavewar/publishdoor.test.ts`;
register AM48c.)*
Rules of record: `docs/superpowers/specs/2026-09-20-arch-stack-4-clash-check.md`.
Weekend/holiday WORK — the
PUBLISHED schedule plus acknowledged Duty-&-commitments input claims
(`row.oil`, the OilConfirm ask-flow, 28 Aug 26) — credits OIL as a third
derived pass (wire 4, `runOilPass` +
`engine/oil.ts`, one ≤6h/>6h test on the day's start-to-finish ENVELOPE
since 29 Aug 26 — gaps between events count, and the schedule half reads
every visited week via the session stash, not just the loaded one — the
ownership partition is by cell vocabulary, FO/HO vs
leave codes; credits are `oil:'auto'` records with the work times). Editing
or deleting a war-approved Input on the Inputs page needs no carry-back any
more — the war simply re-reads it (a member's own date/type edit clears `lw`,
so it gains the blue "filed on the Inputs page" edge, owner 19 Sep 26). The roster is a LIVE projection since 18 Aug 26: `sync.ts:reprojectRoster`
re-projects Raptor's PEOPLE on every Raptor notify (change-guarded), so a body
added on the Quals page reaches Leave War without a reload — a rider on this
same seam. Its DISPLAY is categorised (`engine/people.ts:groupOf` — SXO / IP /
OPS P by CAT / IWSO / OPS W by CAT / OCU / Personnel, colours from Raptor's
`--q-*`), and ground crew ride it (`pers`, seat `gnd`) but are skipped by every
manning count (`countsFor`); `categoryOf` and the thresholds are untouched.
The PUBLISHED remarks editor (27 Aug 26) rides this same seam in the war→Raptor
direction: `sync.ts:leaveInputAt` finds the Raptor input a war cell derives
from (through the day view), and `RemarksSheet` saves through Raptor's own
`setLeaveRemarks → commitInputEdit` — a remarks-only edit. A day holding more
than one record opens the TAP LIST instead (`ui/DayList.tsx`), each record on
its own line with its own actions. Don't add a fifth seam casually,
and never call its `initStore` from a component — it clears the store's
subscribers.
