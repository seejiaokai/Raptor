# LEAVE WAR — known gaps

> **Vendored into RAPTOR 16 Aug 26** (`src/leavewar/`, the Leave War tab).
> This file came over from the standalone leave-war repo as the record of
> what that app knows about itself and did not fix. Read it with the merge
> in mind:
>
> - **The role switch is GONE.** The "affordance, not a permission" entry
>   below described the standalone app's on-screen member/admin toggle.
>   Since the merge the role is derived from the Raptor login on every
>   session change (`resetSession` → leavewar `setRole`) and is no longer
>   persisted. The affordance-not-security caveat still stands — Raptor's
>   auth is itself a prototype with hard-coded accounts.
> - **Its claims about Raptor are stale.** Entries below saying Raptor
>   holds only LL/OL/OIL, or reads every leave as a whole day, predate
>   Raptor's INPUT_META growing all eight leave types with half-day
>   awareness. The current sync design is
>   `docs/superpowers/specs/leavewar-sync.md` — plan from there, not from
>   here.
> - **"No shared data" is now the SAME missing server as Raptor's own
>   first HANDOFF bullet** — one backend replaces `leavewar/state/
>   storage.ts` and Raptor's `HOOKS.storeBackend` together.

What this branch knows about itself and did not fix. Written because the
subagent progress ledger these were first recorded in is git-ignored scratch,
and a limitation that leaves no trace in the repo was not deferred, it was
dropped.

Each entry says what it is, why it was not fixed, and what would fix it.

## Blocking squadron use

**No shared data.** Every write goes to the browser's own storage, so forty
people bidding is forty private copies and management approving is a
forty-first. This is the single thing between the app and real use, and it is
the next phase of work. Until it lands this is a prototype the owner can judge,
not a tool the squadron can use — the spreadsheet at least sits where everyone
can open it.

**What it has to become (owner, 10 Aug 26): everyone sees the same grid in
real time.** An input appears for everybody as it is made, and so does every
change of state — a cell going green or red as it is decided. That is a
stronger bar than "shared": it rules out a design where each browser reads a
snapshot and only notices someone else's bid on reload, which is the shape a
plain REST store would give. Whatever replaces `storage.ts` has to push, not
just persist.

Everything is built to make that change small: all persistence goes through one
module (`src/state/storage.ts`), and every write goes through one function
(`setCell`). Nothing else in the codebase touches either.

**Since the Raptor merge (17 Aug 26) the app boots on the seam's `memoryBackend`,
not `localBackend`** — so a leave war lasts the session and resets on reload,
deliberately matching Raptor's session-only `INPUTS` (the paragraphs below that
describe data surviving a reload are the standalone app's behaviour, superseded
by this). `localBackend` is still in `storage.ts` for reference and tests; the
future shared backend that "pushes, not just persists" replaces the seam.

Storage now holds five keys, not one: `wars` (each carrying its own period,
grid and states), `current`, `role`, `openings` and `ledger`. They are written together by a single `persist()` so
no path can save one and forget another, and `initStore` reconciles each
war's grid and states on load — a stored state whose cell no longer holds a
bid is dropped rather than left to colour the wrong cell.

Stored states written before bids carried a source are **bare strings**, and
they are migrated on load rather than rejected: a string could only ever have
meant a bid placed here, so `source: 'bid'` is a fact and not a guess.
Rejecting them would have degraded a squadron's real decisions to the seed to
gain nothing.

## The role switch is an affordance, not a permission

The interface now has a MEMBER/ADMIN switch, and **anyone can flip it**.
There is no login, so nothing verifies which one a person is: the switch
decides which controls appear and nothing else. Closing the war genuinely
locks members out of editing *in the interface*; it does not stop anyone who
flips the switch.

This is the spec's own two-role model (§Roles) built ahead of the accounts
that will enforce it, in the same way approval was. **Do not present it as a
security model** — it is the shape a real one will take, with the check
missing.

Everything else that follows from having no accounts still holds: anyone can
approve, refuse or shift anyone's bid, and anyone can bid on anyone's row.

The bidding plan called for a fixed `ME` roster entry standing in for a
session. That was not built: the tests bid on whichever row was clicked, so an
`ME` constant would have been dead code claiming an identity model that does
not exist. A real one arrives with accounts. Until then the app is honest
about being a scheduler's view of everybody rather than a bidder's view of
themselves.

## What balances do not yet do

Balances are computed and on screen. Two parts of §Counters are not built:

- **Earned OIL is BUILT (sync wire 4, 17 Aug 26)** — and not the way this
  bullet used to describe. The old spec's knock-off-time rule (later than
  14:30 credits 1.0) is superseded by the owner's scheduled-hours rule,
  computed on the Raptor side from the published schedule (`engine/oil.ts`:
  SC AM/PM shift = 0.5, more = 1.0; a duty row's summed written hours ≥
  `VCONF.oilFullMin` = 1.0, under = 0.5, on weekends and days this app calls
  a holiday — `DayInfo.ph` or an 'off'-tagged event). The credit lands as a
  raptor-owned FS/HS cell, and the OIL balance is
  `opening + grants + earned − drawn`, `earned` derived straight from the
  FS/HS cells' `earnsOil` (`counters.ts:earnedOil`) — a ledger entry for the
  same fact would be the two-records-of-one-fact this engine refuses. The
  **OIL BAL figure** joined the counter column as its landing strip. The
  wire itself: `src/leavewar/sync.ts` `runOilPass`, tested in
  `src/leavewar/oilsync.test.ts`.
- **No grant sheet.** The ledger is seeded and read; nothing can post a
  top-up, an award or a correction through the interface.
- **No ledger view.** §Counters promises that any number on screen can be
  opened and explained. The breakdown sheet (17 Aug 26 — tap a person's
  counter cell) now answers the first layer: the figure's composition, a
  balance as opening + granted (+ earned) − taken. The individual LEDGER
  ENTRIES behind "granted" are still not visible anywhere.

Also note the derivation, because it narrows the spec deliberately: §Counters
says every change to a counter is a ledger entry, and **leave taken is not
posted to the ledger here**. The grid is already that record, and a second
copy of it would be a second version of the truth. The ledger holds only what
the grid cannot know.

## The counter column is figures, not raw counters (Aug 26)

The frozen column no longer cycles the six entitlement counters. It cycles
TWELVE named figures (owner's set; `OIL BAL` joined with wire 4), each
labelled `BAL` (a balance left) or `USED` (days taken):

    LL USED · OL USED · OIL USED · OIL BAL · OFF USED · CCL USED · PL USED ·
    FCL USED · MED USED · OML USED · LVE BAL · LVE USED

- **Ten are consumed (`USED`)** — days of that type taken, read per-TYPE by
  `takenOf` (not the per-counter `drawnFrom`, which cannot tell LL from OL —
  both spend the one annual pool). Two are aggregates: `MED USED` = ATT C + HL +
  OML, `LVE USED` = LL+OL+OIL+OFF+CCL+PL+FCL (medical deliberately excluded).
- **One is a balance (`LVE BAL`)** — the annual pool, `opening + grants −
  drawn`, the only figure that can go negative and red. The other entitlement
  balances (OIL/CCL/FCL/PL/EL) are still computed by `balanceOf` and used by
  the bid-warning path, but are NOT surfaced in the column — the owner asked
  for exactly the eleven above. EL is dropped from the column yet stays a valid
  biddable code.
- **The order is persisted (`figorder`) and ADMIN-GATED since 17 Aug 26**
  (owner: "normal user should not have authority to change the leave war
  column arrangement") — the ▲▼ and Reset render for an admin only and
  `moveFigure`/`resetFigureOrder` refuse a member at the write path; the
  figure SELECTION stays ungated view state. `orderedFigures` heals a stale
  saved order — an unknown id is dropped, a newly added figure appended.
- **The picker sheet is also the legend** (owner: "show the legend as a
  bubble"): the USED/BAL key and the two aggregates' compositions render
  inline. **Since 17 Aug 26 its rows answer with the VIEWER's own numbers**
  ("your numbers — <callsign>", each row "N taken/left, yours") — the
  viewer being Raptor's "View as" person, mirrored into `state.viewer` by
  the sync wire (never persisted). **With no viewer on the roster the row
  now reads a DASH, not a squadron-wide sum** (owner, 18 Aug 26: "I don't
  need to see totals when no one is picked… it defaults to the account
  viewer") — the figure answers "how much do I have left", which has no
  meaning without a person.
- **The viewer's row is lit on the matrix** (same ask) — `tr.me`, a solid
  tint on the frozen callsign+counter pair and a faint band across the row.
  The CSS lives INSIDE matrix.css's `#page-leavewar` wrapper — a rule
  appended after the closing brace loses to the wrapper's +1 id specificity,
  which is exactly the trap the file's header warns about.
- **Any callsign tap opens that person's ALL-FIGURES sheet, for every role**
  (owner: "everyone should be able to click on that person's name and see
  these logics") — the twelve figures with that person's numbers, each row
  opening its parts breakdown; an admin reaches the person EDITOR through
  the sheet's "Edit person" button (the old direct-to-editor tap).
- **Medical is FOUR markers now** — `ATTB` (shown as a bare "B" on the grid),
  `ATTC` (shown "C"), `HL`, `OML` — B joined 17 Aug 26 ("u can indicate,
  B (att b), C (att c), OML, HL"), and since the same day they TAKE PORTIONS
  (`*OML` a morning, `HL*` an afternoon; a half counts 0.5 in MED USED). ATT B
  deliberately feeds NO figure (the owner's MED USED sum names the other three)
  and removes nothing from manning — no flying, but at work, matching Raptor's
  own meaning of the code. Still assigned, not bid, but **the cell-entry UI now
  exists**: the cell sheet shows a Medical row of the four chips to an ADMIN
  only (whole day default, AM/PM the halves, range supported); members file on
  Raptor's Inputs page and the record syncs across (the spec's Wire 5 — an
  ATT B / ATT C / HL / OML input lands as a read-only raptor-owned cell, an
  admin-marked cell lands as an lw-tagged input, no approval step either way).
- **Tapping a person's counter CELL opens the breakdown** (owner, 17 Aug 26):
  MED USED as its ATT C / HL / OML rows, LVE USED as its seven codes, a
  balance as opening + granted (+ earned) − taken, any single-code figure as
  its one line — parts signed so they visibly sum to the total
  (`figureParts` in counters.ts, `FigureBreakdownSheet`). The column HEADER
  still opens the figure picker; the two controls answer different questions.

## The owner's review of 10 Aug 26, and what it settled

Twelve pieces of feedback from a phone. What they changed is in the spec; what
they SETTLED is here, so it is not relitigated:

- **The year is the sheet; bidding opens on a range inside it.** A quarter is
  never a war of its own again. Asked and answered when their screenshot
  showed "JUL - SEP 26" being created inside a year-long 2026.
- **A bid nobody has answered carries no colour.** Purple means management has
  acknowledged it. This is why `acknowledged` exists at all.
- **`OFF` is leave, not a marker.** Free — no entitlement spent — but the
  person is gone from the manning picture, so it is asked for and answered
  like any other leave. The only leave type with a null counter.
- **`OD` counts the manpower as gone**, and always did. Pinned at the count
  level now.
- **There is no PCL.** See the leave-type section below.
- **Events are the scheduler's**, not the bidder's: admin-only to write, and
  everyone reads them.
- **The category is still derived.** The roster sheet edits seat, band and
  SXO — never the category itself — because that derivation is what lets
  Raptor's roster replace this one without a migration.

## Wars, and what is not built about them

An admin can create a leave war over any span and switch between them. Three
things are deliberately absent:

- **No war can be deleted or renamed.** Nothing removes one, which is why
  `wars` is never empty and `withCurrent` can fall back to the first. A war
  created by mistake stays.
- **A war's requirements are shared, not per-war.** `Requirements` still sits
  at the top of the store, so every war is judged against the same manning
  rules. Real squadrons vary them by period; the rules editor is where that
  belongs.
- **Nothing stops a war being created in the past**, or a hundred of them.
  There is no sanity bound on the dates beyond "end not before start" and
  "no overlap".
- **The seeded wars now cover the whole of 2026 and 2027**, one year each,
  because the owner reads the year at once (10 Aug 26). A consequence worth
  knowing before writing a test: **there is no free date nearer than 2028**,
  so anything creating a war has to reach that far out or be refused for
  overlap. Two e2e tests and several store tests moved for exactly this.
- **The bidding window does not bind an admin**, and never overrides the
  stage. It holds the SQUADRON to the part of the year the schedule has
  reached; a closed war is closed to them on every date, window or no window.
- **A window is refused, never clamped.** An admin who typed the wrong year
  has made a mistake worth being told about; sliding their dates to the
  period's edges would leave them believing they opened something else.
- **A month is only navigation, never a filter.** The strip scrolls the year
  to a month; it does not narrow the grid to it. That was the owner's ask —
  see the whole year, jump to a month — and it matters because a filter would
  hide the manning counts either side of a boundary, which is where a leave
  clash actually shows up.

## Removing a leave type is a breaking data change

Twice over, on the same day. `FCL` was removed on the morning of 10 Aug 26,
and that afternoon the owner settled the confusion that caused it: **there is
no PCL.** This author could not tell FCL from PCL, guessed there were two,
and removed the wrong one. The catalogue now carries `FCL` — family care
leave — and no `PCL` at all. `PL` is unrelated and unchanged.

The counter list is derived from the code catalogue, so a counter follows its
leave type in and out with no other file edited — the property both changes
proved. But **stored balances that still name a counter the catalogue no
longer has are rejected on load**, and `openings` or `ledger` falls back to
the seed entire rather than dropping just the stale entries. Anyone whose
browser holds a balance from this morning naming `pcl` gets the seed back.

That is the established rule for every stored shape here (an unknown value
means the blob is not trustworthy), and it is the right default while this is
one browser's own storage. It stops being acceptable when the shared backend
lands and a removed code could discard a squadron's real balances: at that
point a removal needs a migration, not a fallback.

## The RAPTOR clash has nowhere to go

`ingestFromRaptor` returns `clash` when an inbound input lands on a date the
squadron already bid differently, and **nothing displays it**. The value is
returned to the caller and dropped, because until the wire exists the only
caller is a test. The rule is right and tested; the surface it needs does not
exist. Build it with the wire, not before.

## The geometry gate claims less than it appears to

`npm run test:e2e` runs its "phone" project as **Chromium with an iPhone
viewport, not WebKit**, because the container ships no WebKit build. The
viewport, touch, user agent and scale factor are emulated; the rendering engine
is not the one real iPhones use.

This matters more than it usually would. The gate's whole purpose is the frozen
column and sticky header, and `position: sticky` inside a `<table>` is exactly
where Blink and WebKit have historically diverged. So the gate proves the layout
holds in Chromium and infers the rest.

Run the gate against real WebKit before the squadron opens this on iPhones. It
is a one-line config change wherever a WebKit build is available; nothing in the
test code needs to change.

Narrowed on the phone since 20 Aug 26: the roster's two frozen columns are no
longer `position: sticky` there — they are drawn once in a `.mxband` overlay
outside the sideways scroller (HANDOFF's frozen-columns block), which is
ordinary absolute positioning Blink and WebKit agree on. So the sticky-in-table
divergence now only rides the phone's frozen HEADER (the `.mxfixed` mirror, its
own machinery) and the DESKTOP's still-sticky columns. Still worth the WebKit
pass, but the riskiest surface — sticky cells on 80 scrolling rows — is off the
phone now.

## Deliberately deferred to later plans

- **The day's overall verdict is computed and not shown.** `evaluateDay`
  produces a worst-across-all-rules verdict per day, and the interface still
  renders only the per-rule count rows. This was marked "for the bidding
  plan", and the bidding plan did not do it: a bidder can watch the count
  rows move as they bid, but nothing tells them in words what their bid
  would break. Still outstanding, and now more clearly worth doing — the
  bid sheet is the surface that would carry it.
- **`title` tooltips do not exist on touch.** The blocked-day reason and the
  count-row detail are still `title` attributes, which a phone never shows.
  Bidding added a real surface (the bid sheet) but did not move these onto
  it. The spec's promise that a bidder is told *why* a day is blocked is
  therefore still unkept on a phone.
- **A cell is not reachable from the keyboard.** Bidding and deciding hang
  off `onClick` on a `<td>`, which takes no focus and answers no Enter key.
  Making 1,440 cells focusable buttons would cost more DOM than the grid can
  afford, so the fix is a roving-tabindex grid, which is its own piece of
  work. The sheets themselves are ordinary buttons and are fully operable.
- **The sheets are `role="dialog"` without the behaviour that usually
  implies.** No focus trap, no focus restore, no Escape key — a click on the
  ✕, on another cell, or on a choice is what closes them. The role is right
  for what they are; the interaction is not yet complete.

## The date header no longer sticks

Given up on 10 Aug 26 to buy the owner's ask for ONE vertical scroll. The grid
wrapper scrolls horizontally only now and the page carries the vertical
scrolling for everything, so scrolling down takes the date header with it.

It is not a bug and there is no CSS that avoids it: `position: sticky`
resolves against the nearest scrollport, the wrapper is still that scrollport
because it scrolls one axis, and it no longer scrolls vertically. An element
cannot scroll one axis itself and let a descendant stick to the page's other
axis.

Two ways out if it starts to hurt, neither free:

- **Invert the single scroll.** Pin the page (`html, body { overflow: hidden }`),
  let the grid fill the viewport and be the only vertical scroller. That is
  still one scroll, keeps the sticky header, and keeps the chrome permanently
  visible — but it is the scroll the owner asked NOT to have.
- **Lift the header out of the scroller.** A second, non-scrolling copy of the
  date row above the grid, its horizontal offset synced to the wrapper's
  `scrollLeft`. Costs a sync path that can drift, which is the failure this
  codebase keeps choosing to avoid.

The roster is roughly one-and-a-quarter phone screens tall, so the header goes
out of view during ordinary use rather than only in extreme cases. Worth
raising with the owner rather than assuming it is fine.

## The cycle runs backwards for an admin, and forwards for anyone

Overturned on 10 Aug 26 at the owner's word: "as an admin I can open bidding
again after closing it". It had been forward-only since the bidding plan, and
the reason recorded in `stages.ts` was a real one — a bid arriving against a
decision already made is exactly what a cycle with stages is for. What that
missed is the ordinary case: bidding closes while somebody is on detachment,
and a whole new leave war is a heavy answer to one late input.

Two things were kept so the original guarantee mostly survives. **Nothing is
erased** — the stage is one field, so every decision already made outlives a
reopen — and **stepping back is admin only**.

The asymmetry that leaves is deliberate but worth knowing: **advancing the
stage is not gated at all**, so a member can close a war and then not be able
to reopen it (they can flip the role switch and do it, which is the affordance
model working as designed rather than a lock). Gating both directions would
match the spec's own roles table, and it would break the existing strip test
that advances as a member — it was left alone because the owner asked for the
way back, not for the way forward to be taken away. Worth settling when
accounts land and the roles stop being an affordance.

## Rulings made, so they are not relitigated

- **The scrim lives in the `Sheet` wrapper, not beside each sheet.** Seven
  places open a sheet; putting the click-outside in the wrapper means an
  eighth cannot be written without it. A per-sheet scrim would have passed its
  own test while the next sheet shipped without one.

- **`focusDate` is view state, and it lives in the domain store on purpose.**
  The stage strip and the matrix render independently of each other — neither
  takes props from the other, so both stay renderable standalone in their own
  tests — and the store is already the channel they share. It is not
  persisted: where someone was last looking is not a fact about the leave war.
  The `focusSeq` counter beside it exists because a date alone cannot say
  "asked again", and with 365 columns the grid is almost never still where it
  was left, so choosing the same day twice must snap back to it. It is cleared
  on `selectWar`: wars do not overlap, so a date from the old one names no
  column in the new grid.
- **The under-manned list is positioned from JS, not CSS.** The stage strip is
  `flex-wrap: wrap`, so the chip it hangs from sits in a different place on a
  phone than on a desktop, and there is no CSS way to say "under the chip, but
  never off the screen" when the anchor itself moves. Anchored naively it ran
  past the right edge of the phone viewport and its rows stopped being
  clickable — a mutation probe reproduces exactly that, failing on phone and
  passing on desktop. `LIST_WIDTH` in `Chrome.tsx` must stay in step with
  `.umlist`'s width in `chrome.css`.
- **The tinted chips do not use Raptor's `.wk.on` ink.** Raptor's value is for
  a chip that is one of several and only has to look *lit*; here the same
  chips have to be *read*. Do not "restore" them to Raptor's palette — see the
  comment on `.wk.on` in `chrome.css` for the measurement and why a contrast
  ratio does not catch it.

- **`DayCounts.duty` counts heads, not availability.** It increments by one for
  a half-day SC duty exactly as for a full day. This is deliberate — it answers
  "how many people are on SC today", which is a head count, not a fraction of a
  person. Every *availability* figure in the same module is fractional; this one
  is not, on purpose.
- **A cleared cell deletes its key rather than storing an empty string**, so a
  day someone cleared is indistinguishable from one never set. Intended: there
  is no third state to represent.
- **`initStore()` clears every subscriber.** Call it once before render, never
  after mount, or a live component's subscription is silently dropped. Pinned by
  a test named as a contract. A fresh boot is a clean slate; the trap is real,
  which is why it is written down rather than left implicit.

## Small and safe to carry

- **The swipe on the counter column is gated only on the phone project**,
  because Chromium's touch emulation is what dispatches it. Three tests skip
  elsewhere rather than pretending to have run. The sheet — the guaranteed
  path — is gated on both.
- **`.bidsheet`'s `max-height` is belt and braces, not tested.** The gate
  asserts every sheet sits wholly inside the viewport and deleting it does not
  break that: the tallest sheet is ~500px against a 664px phone, so nothing
  yet overflows. It is there for the sheet that eventually does.
- **A stale `vite preview` server will silently invalidate the browser gate.**
  `playwright.config.ts` sets `reuseExistingServer: !CI`, so a server left
  running from a manual screenshot is reused and `npm run build` never runs —
  the gate then tests the last build, not the working tree. This cost real
  time twice on 10 Aug 26: mutation probes "passed" against code that was
  never compiled. Kill it with `pkill -f "vite prev[i]ew"` — the bracket stops
  the pattern matching the shell running it.
- One test writes a real `leavewar:grid` key into jsdom's storage and does not
  clean it up. Harmless while every other test passes an explicit backend and
  none calls bare `initStore()` — it becomes a cross-test dependency the day one
  does. Now slightly larger a trap than it was, since a bare `initStore()`
  would read `leavewar:states`, `leavewar:stage`, `leavewar:role`,
  `leavewar:openings` and `leavewar:ledger` from the same store.
- The DOM ceiling in the geometry gate is **9600 against a measured 9241**,
  raised from 2500/2357 on 10 Aug 26 when the war became a year rather than a
  quarter. Raising it is meant to be a deliberate edit in whichever change
  adds the nodes, not a reflex when it goes red. Note the selector's blind
  spot: it counts `.mx *`, and the bid sheet renders outside the table, so it
  adds nothing to that figure. The same test therefore also counts the whole
  document with the sheet open (9278, ceiling 9700). It now carries a **lower**
  bound of 8000 as well, so a grid that quietly shrank back to a quarter fails
  instead of passing comfortably.
- `setCell` stores an empty row object for a person whose last state is
  cleared, so `states.ramp` can be `{}` rather than absent. Every reader uses
  `stateOf`, which is indifferent, and `initStore` prunes empty rows on the
  next load. Worth knowing before someone reads a persisted blob and
  concludes a row means something.

## Event model (17 Aug 26; per-event tags 18 Aug 26) — tags, ranges, merged bands, colours only

The two event lines grew a real editor and a classification (owner, Aug 26).
What is a contract, and what is deliberately still open:

- **The tag is invisible; only colour shows.** An event is classified off /
  no-leave / work. Typing `PH` shows `PH`, never `PH (off)` — the kind
  surfaces ONLY as colour: a green column for an off day, an orange column
  for no-leave, red text for a work word (the column left alone).
  `columnKindFor` lets `off` win over `nolv` on one day; `work` never
  colours the column.
- **The tag lives ON the event, not in the library (owner, 18 Aug 26 — "I
  don't want u to save it as a type").** Tapping a tag in the Event sheet
  used to silently mint the typed word into the type library; now it is held
  in the sheet and saved with the event — `DayInfo.eventKinds[line]` for a
  per-day word (written by `writeDayEvent`, read by `dayEventKind`),
  `EventBand.kind` for a merged bar. Precedence everywhere is **instance tag
  first, library word match second** (`columnKindFor`, the red work word in
  `EventRows`, wire 4's holiday answer). The library changes ONLY inside the
  Edit types view. Both new fields read leniently in `readWar` (absent =
  untagged, exactly the old shape); clearing an event clears its tag so a
  stale kind can never colour a later word.
- **Classification is stored but not yet wired to the rules.** This is the
  deliberate gap the owner chose this pass ("colours only for now"): the
  off/no-leave/work kind changes no manning count and raises no warning. It is
  persisted (`state.eventDefs`, key `eventdefs`) so a future rules pass — and
  Wire 4's PH→OIL — can read it. A no-leave day does NOT block or warn a bid;
  urgent leave still goes through. Nothing reads `DayInfo.ph` yet either (it
  stays the inert flag it was); an off-day tag is what colours a holiday, not
  that flag.
- **Two ways to span a range, both kept.** REPEAT writes the word into each
  day's own `events[line]` (`setDayEventRange`); MERGE stores one `EventBand`
  on the period drawn as a colspan cell (`addEventBand`). A band suppresses —
  and, on creation, clears — the per-day text under it on that line, so a
  merged label never hides stray words a later delete would resurrect. Bands on
  one line never overlap (refused, not trimmed). `period.bands` is read
  leniently in `readWar`, so a war stored before the feature loads with none.
- **Editing is a sheet, not inline.** An admin taps an event cell to open the
  Event sheet (`ui/EventSheet.tsx`); the old inline textareas are gone. A
  member still only reads. The sheet also carries the type-library editor
  (add / rename / reclassify / delete / reset), reached from its "Edit types"
  button.
- **The type library is squadron-wide, not per-war** (a holiday is a holiday
  in every war), so it lives on `state.eventDefs`, seeded PH=off / No Leave=
  nolv / SC=work, and persists under its own `eventdefs` key.
- **The counter-picker header was squared** in the same batch (owner: "make it
  squarish, it's blocking the event box") — a contained bordered chip now, kept
  at a 40px tap target (the earlier "too small to hit" complaint still holds).

## SANS are off the roster by default, with an enable switch (18 Aug 26)

The owner's rule: "we will not show the SANS in the leave war however there is
a function to still enable this." What that means here:

- **The exclusion is at the PROJECTION** (`state/raptorRoster.ts`): a Raptor
  person flagged `san` is simply not projected, so the grid, the manning
  counts, the counters and both sync directions all agree by construction —
  the sync's own skip-unknown-persons rule makes a hidden SANS body's leave
  inputs harmless (they land nowhere and clear nothing).
- **The enable function is `setShowSans`** (`state/store.ts`) — admin-gated
  squadron config, persisted under `showsans`, default off. The UI control is
  the "Show SANS" button in the matrix's Rearrange toolbar (admin, edit mode).
  Flipping it re-projects at once: the sync's Leave War subscription runs
  `reprojectRoster`, which reads the flag.
- **With the switch ON, a SANS body rides the roster exactly as before the
  exclusion existed** — grouped by CAT, counted in manning, syncable. Turning
  it back off drops them again; nothing they carried is deleted, only
  unprojected (their war cells stay in the grid keyed by id, invisible until
  shown again).
- **The demo world never touches a SANS body** (`DEMO_MAP` remapped
  `slammed` off vinci onto pike when this shipped; a test guards it), so the
  demo reads identically with the switch off.

## The manning rows explain themselves, and their lines are the squadron's (19 Aug 26)

Tapping a count row's NAME (the frozen cell — the whole label is the target,
dotted-underlined) opens `ManningSheet`: what the row counts in plain words
(`ManningRule.desc`, seeded in `seed.ts`; `SETS_DESC` for the set rule), the
current colour rule as a sentence, and — admin only — the amber/red numbers as
editable fields with Save and a per-row Reset. The numbers are an OVERLAY on
the seeded defaults (`store.ts` `manningThresh`, persisted `manningthresh`,
admin-gated `setManningThreshold`/`resetManningThreshold`): only thresholds
are stored, never rule definitions, so a later build can reword or re-target a
rule without an old blob freezing it (the stores-list lesson). Amber at or
under red is accepted deliberately — it means "no amber band", the SXO seed's
own idiom — and the sheet says so rather than printing a number that never
fires.

Two rows joined the block the same day: **SC D** and **SC N** (the AVALON
cover). Each counts COMPLETE TEAMS — 2 SC-qualified pilots + 2 SC-qualified
WSOs + 1 SXO + 1 more crew, six different people, ground crew never counted
(`availability.ts:scTeams`; seeded red below one team). Three things worth
restating so they are not read as bugs:

- **The count is a matching, not four separate counts.** The only SXO
  doubling as one of only two SC pilots reads under 1 team — one body cannot
  fill two of the six seats. That is the point, not an error.
- **A duty-stander counts as PRESENT for these two rows** while reading 0 to
  every other figure. SC duty is at work; a fully-manned duty weekend must
  not go red for being manned.
- **The SC quals ride the Raptor projection** (`scd`/`scn` off Raptor's
  `quals.scDay`/`scNight`, in `reprojectRoster`'s signature) — tick or untick
  SC DAY / SC NIGHT on the Quals page and the rows recount on the next
  notify. The raw seed carries a demo set mirroring Raptor's own boot rule.

## The manning counters are the squadron's own rules (19 Aug 26, supersedes the overlay above)

Later the same day the owner asked for the rules themselves ("instead of hard
coding these permutations, make it editable… these counters can also be
deleted"), so the numbers-only overlay above is history: a `ManningRule` is
now DATA, stored whole under `manningdefs`, and the section above's
"only thresholds are stored, never rule definitions" no longer holds — the
deliberate departure and its forward-compat story live on the State comment in
`store.ts` and in HANDOFF's top bullet. What stands from the section above:
the explainer sheet, the amber/red quick-edit, the no-amber-band idiom, and
everything said about the SC teams' matching, duty presence, and projected
quals.

The shape, briefly (detail in HANDOFF's bullet):

- **Two counting kinds cover the old six.** `people` sums availability over
  one `CrewFilter` (seats · effective CAT is/is-not · qualification keys
  held/not held); `team` counts complete teams of DIFFERENT people from 1–6
  slots (`availability.ts:teamsOf`, the full Hall subset walk that `scTeams`
  hand-picked; parity pinned per seeded rule per demo day in
  `engine/counterrules.test.ts`). Crew sets are the two-slot team; a team can
  `show` teams or people-in-teams, and `presence` keeps duty-standers counted.
- **The form** (`ui/CounterForm.tsx`, testids `cform-*`) is guided pickers,
  never free text (owner's pick): name, kind, filters, slots, a live
  first-day sample, amber/red. Delete arms. `+ Counter` and the armed
  "Reset counters" live in the Rearrange tools; `Edit counter…` on the sheet.
  A rule saved from the form carries no hand `desc` — the sheet writes its
  words from the definition (`describeRule`), so words and rule cannot drift.
- **The qual chips are Raptor's live catalogue** (`qualCatalogue()` →
  `setQualCatalog`, refreshed with every reprojection; held keys ride
  `Person.xq`). A qualification added on the Quals page appears in the form
  as soon as anyone holds it; one removed keeps counting whoever still holds
  the flag (removal never touches `p.quals`), and an edited rule keeps its
  orphan key as a chip so Save cannot silently rewrite it.
- **The counters forget with the war**: `manningdefs` / `manningorder` /
  `manninghidden` ride the memory backend like everything else (owner,
  19 Aug 26 — no persistence wanted; counter configuration will live in the
  database when it arrives), so a counter built or deleted resets on reload
  back to the seeded eleven. The boot reader IS the save validator
  (`readManningRules`), so nothing saveable is un-loadable within a session;
  a corrupt blob falls back to the seeded eleven, and the legacy
  `manningthresh` overlay is still read once as a migration.

Two things a counting sweep (19 Aug 26) checked and DELIBERATELY left — do
not "fix" either without reading this first:

- **`matchesFilter` compares CAT case-sensitively** (`availability.ts` —
  `effectiveCat` upper-cases `p.q`, the filter's `cats`/`notCats` are compared
  verbatim). Not reachable from the form: the CAT chips are `CAT_LADDER`, all
  upper-case, so a saved rule can only ever hold upper-case CATs. It is a trap
  only for a hand-written or imported rule storing a lower-case CAT, which
  would silently match nobody. Left as-is (no reachable bug); if a non-form
  import path is ever added, upper-case the CAT there or normalise on read.
- **A half-day SC duty (`HS`) counts as a WHOLE present body** in a
  `presence` team and the duty tally (`availability.ts` — `weightOf` returns a
  flat 1 for any duty code). Deliberate, and load-bearing: the old hard-coded
  `scTeams` did the same, so the migration parity pin in
  `counterrules.test.ts` requires it. A team seat is filled or it is not —
  there is no half a body in a Hall count. Changing it would break parity;
  raise it with the owner as a product question, never as a silent fix.

The custom shapes the seed never exercises — a slot count above 1 still
demanding distinct bodies, `quals` + `notQuals` on one filter, `show:'people'`
keeping a fractional team, ATT B counting while ATT C does not, and the
Quals-tick-lifts-the-count integration — are pinned in
`engine/counterrules.test.ts` §custom counter shapes and `roster.test.ts`.
