# Scenarios for the four builds of 27 Sep 26 — D270, D271, D272, D275 (Fable 5.1, scenario design)

Branch `claude/five-flags-batch-continue-2cfa70`, commit `752781cb`. Built by Opus 5.5; this is the bug-check order's
rank-1 job (§4): hunt for what is MISSING, starting from the four rulings, not from the diff. I read the code and the
two new tests; I ran nothing (the PC's check lock is held elsewhere). Everything below is a prediction to be walked,
not a result. D56 applied throughout: nothing here is about data already stored.

**The four promises, in one line each**
- **D270** — on his own puck, any flag's ring replaces the purple "this is you" ring; the purple fill stays; no glow.
- **D272** — in OIL Earn mode his own puck wears the green OIL ring, not the purple one; the purple fill stays.
- **D271** — a man put on a row he already stands on is refused at every door, before anything is written, with the
  reason said; a swap inside one crowd, a move to the end of his own crowd and a man on two DIFFERENT rows still work.
- **D275** — the desktop week keeps no room beside the ‹ arrow; every landing puts the front day flush at the box's
  left edge, exactly as `main` does.

**My tier reading (order §5):** FULL — question 8 (how a rule is read: the busy check now refuses), question 4 (a
shared drawer: the puck ring rule reaches every puck), question 2 by consequence (a refused drop on a published day
must leave the pending count and the sign-offs untouched). Not money, not roles.

---

## 1. Roll-call A — every place the app draws a man's puck where "this is you" can land (D270 / D272)

The "you" class is hung by ONE pass (`ui/highlights.ts refreshHighlights`) on every `.puck[data-person]` in the whole
document after every repaint — so the CSS rule reaches every drawer by construction. **When it is NOT hung** (and so
where D270 cannot be seen): while a puck is selected or a highlight chip is on (the purple yields to focus, Aug 26);
on WEEK and BOARD pucks while a clicked warning's focus is live (the loop returns before it reaches "you"); on any puck
without `data-person` (the next-week peek); for a guest or nobody signed in. Ring classes a puck can carry, from
`html.ts puck()`: `warn` (amber), `warn hard` (thin red), `warn note` (grey), `boxred`, `boxdash`, `boxdot`, and in
OIL Earn mode `oilglow` / `oilglow half` / `oildim`. The new rule excludes every one of the first seven and `oilglow`.

| # | Where the puck is drawn | Does D270/D272 reach it | Also painted on the same pixels | What he should SEE |
|---|---|---|---|---|
| A1 | View-only Sched — every seat of the official face: flying lines, SC / AVALON / BB lines, duty desks + extras, sims (seats, pax, extras), ground rows + extras, Common Programme crowds, the Unavailable block, the Personal Inputs block | YES (class hung; flags are the issued face's, D183–D185 live ones on top) | the OIL green left bar on a weekend (`oilbar`), the CAT chip, the letter chip, AL tags on the seat (outside the puck), the SANS purple right edge | flagged: the flag's ring only, purple fill; unflagged: purple ring + glow |
| A2 | Edit Schedule week — the same rows in edit mode, plus the Available-crew block (`availpuck`), the SANS cards | YES | the armed dashed ring on the SEAT, the green "can take" rings on seats (only while a man is selected — purple has yielded by then), the ~6s fresh-add box, the landing flash, `flagnew` pulse (opacity only) | as A1 |
| A3 | The crew palette (edit week drawer `#eroster`) and the board's roster `#sbRoster` | YES — the palette pucks carry `sevOf`/`chipOf` flags | `.rpuck.busy` / `.rpuck.no` grey blend and the inset grey bar (a struck or busy "you" puck shows the blend — known and wanted) | flagged: ring wins; the strike-through and the printed reason are the row's, not the puck's |
| A4 | The scheduler board — flying seats (`sb-slot`), crowd rows (`sb-arow`), duty / sim / ground seats and extras, the sim's spare seat (D50), Personal Inputs rows, Unavailable rows | YES (D94: the board draws all three red rings) | the AL tags, the dense row grips, the row control strips | as A1 |
| A5 | The board in **OIL Earn mode** — every puck redrawn by `oilSeatHTML` / `oilRowPeople` (a crowd becomes the list of men it credits) | YES — this is D272's surface | the FO / HO figure in place of the CAT letter; `oilpk inert` (a man the day measures nothing for — no ring class at all) | earning: green ring (full: with its soft green glow; half: plain green ring), purple fill; not earning: `oildim` → purple ring + glow at half opacity (**see Q-B**); inert: purple ring + glow |
| A6 | The 👁 look at a published version — board and edit week (`.pv-frozen` / `.preview`), wearing that version's warnings (D187) | YES — the "you" class IS hung on preview pucks (only the focus is withheld there) | the version's own tags | flagged in that version: the flag's ring; else purple |
| A7 | The ALL AVAIL window (React; `personPuckHTML`) — both tabs | PROBABLY, but verify: the window is not one of the string-built surfaces; "you" lands only if a highlight pass runs after the window renders. The window's pucks carry NO `oilglow`, so D272 does not apply inside it | the reason lines under each puck | flagged: ring wins; unflagged: purple — **or no purple at all, if the pass never reaches it (pre-existing if so)** |
| A8 | The Inputs month calendar's mini-pucks (`InputsCal`), the medical view (`MedicalView`) | YES (class hung; no flags there) | the calendar's own CAT line and SANS line pseudo-elements | purple ring + glow, as today |
| A9 | The drag ghost — a CLONE of the puck (`.dragimg` / `.tdghost`), mouse and finger | YES (the clone brings `me` + ring classes) | the cyan lift veil (`::before`), the depth shadow; a `!important` ring (purple unflagged, `boxred`) still replaces the depth shadow — same as any other man's red-ringed ghost | his flagged ghost draws exactly as another man's flagged ghost |
| A10 | The next-week peek | NO — no `data-person`, never validated, never "you" | — | plain puck (by design) |
| A11 | Print / CSV / the printed schedule | NO — no pucks | — | — |
| A12 | The Leave War grid, the Tracker | NO — their own drawing, no `.puck` | — | — |

Two pre-existing things that share his puck's pixels and are NOT this change (walk them as negatives, not findings):
a SANS man's purple right edge is invisible on a purple fill; and under a clicked warning's focus the WEEK/BOARD "you"
puck loses its purple FILL as well as its ring (the focus colours take the puck — the 7 Aug 26 invariant).

---

## 2. Roll-call B — every DOOR that puts a man onto a row (D271)

Rows that hold PEOPLE'S PLACES and are held to the rule (`slots.ts rowPlaces`): a Common Programme crowd
(`a:di.ri.N`), a ground row's primary (`g:di.ri`) + extras (`.xN`), a duty desk's holder (`d:di.wi.ri`) + extras, a
sim's two seats (`.p` / `.w`), passengers (`.pax.N`) and extras. An ⓘ info-only row IS held (the refusal is asked
before the ⓘ exit). A cancelled or zero-length row is held (the sentence just loses its times). **Not held:** a jet
line's two seats (a flying seat "is its own row" — `rowPlaces` returns nothing for it; **Q-A**), SC / AVALON / BB
lines (flying seats), the Unavailable row (an input, not a row), and a placeholder (ALL / ALL AVAIL) anywhere (**Q-C**).

| # | Door | Must refuse / must not / MISSING | Why |
|---|---|---|---|
| B1 | Mouse drag from the crew palette onto a PLACE (another man's puck) in a row he is on | must refuse | `drag.ts applyDrop` seat branch, roster kind: `rowTwice` before `setSlotVal` — reading (3) |
| B2 | Mouse drag from the palette onto the row's "+ add" cell | must refuse | cell branch, `rowTwice(id, fillKey)` before `fillSlot` |
| B3 | Mouse drag from the palette dropped on the ROW (its title / times / remarks, not the people cell) | must refuse | the roster drop resolves to the row's `[data-fill]` — same preflight. **But the hover caption is silent there** (S-28) |
| B4 | Finger drag on a phone — the same `applyDrop` | must refuse | one mutation path; the drawer parks during the drag and comes back on a refusal (`ROS_REOPEN`) |
| B5 | Drag from the Available-crew block or the board roster | must refuse | both are roster-kind drag sources (`data-person` + `data-drag`) |
| B6 | Drag of a SEATED puck from another row onto a place in a row he is already on (a swap) | must refuse whole — neither end written | both ends judged before either write: `twice(a, target, from)`, `twice(b, from, target)` |
| B7 | …the OTHER end: the man swapped OUT would land on a row he is already on (an extra there) | must refuse whole | the second `twice` — pinned by the new test |
| B8 | Drag of a seated puck from another row onto the "+ add" of a row he is already on | must refuse, source untouched | cell branch preflights BEFORE `setSlotVal(from,'')` — the order matters and is right |
| B9 | Swap of two men INSIDE one crowd | must NOT refuse | `from` is the place he leaves, so neither man is "elsewhere" |
| B10 | His own puck dropped on the "+ add" of his own crowd (move to the end) | must NOT refuse | `from` excluded; the belt in `fillSlot` runs after the source is cleared |
| B11 | A man dropped on a row where he already is, ACROSS days (Monday's crowd man onto Tuesday's crowd he is also on) | must refuse | `rowTwice` reads the target row; the sentence names Tuesday's row |
| B12 | The armed palette tap on a crowd's "+ add" | must refuse; the slot stays armed | `view.ts placeArmed`, asked of the key AS ARMED (`.+` kept) |
| B13 | The armed palette tap on an armed EMPTY seat of a row he is on (a sim's rear seat, a duty extra slot, the D50 spare seat) | must refuse | `here` = the armed seat; he stands elsewhere on the row |
| B14 | The armed palette tap on an armed PLACE holding another man (a placeholder-filled or re-armed seat) | must refuse if he is elsewhere on that row | same body |
| B15 | The board's tap-to-arm (`board.ts boardArmClick`) then the roster tap | must refuse | same `placeArmed` |
| B16 | The armed `iu:` (Unavailable-row reassign) tap or drop | must NOT refuse (not a row) | routed to `reassignInput` before `placeArmed`; `rowTwice` on an `iu:` key resolves no row anyway |
| B17 | Arm the "+ add", then DRAG the struck man onto the armed cell | must refuse; arm stays | a refused drop never reaches `done()`, so the arm is not put down |
| B18 | Right-click (desktop) removes a puck | n/a — a removal | `Shell.tsx onCtx` |
| B19 | Keyboard | none exists — no Enter-to-plant (`routeKeyDown` handles the nav only) | n/a |
| B20 | Typing a name into a row | none exists — the board's `data-bfld` fields are times / labels / remarks; a free-text `who` is read-only on screen | n/a |
| B21 | Accepting a request (`acceptInput`) | n/a — makes a NEW row for the request's person | — |
| B22 | **Changing the PERSON of an ACCEPTED request (the Inputs page dialog's Person field; the same relink runs for a reassign drop)** — `commitInputEdit` un-accepts, re-accepts the row as the NEW person and puts the scheduler's extras back onto it | **MISSING — no preflight, no belt** | if the new person was already an EXTRA on that row he is now on it twice (the primary and the extra), through `nr.more = extras.more` at `inputedit.tsx` ~1145. NEW data, going forward. **F1 below**; S-1 |
| B23 | Day template | n/a — templates blank every `who` (`daytpl.ts`) | — |
| B24 | Copy / duplicate a wave | n/a — flying seats only (not held) | — |
| B25 | Load a version onto the working copy; switch to a plan | n/a for D271 — a whole-day replacement can only bring back what was stored (D56); no new duplicate is written | — |
| B26 | Undo / redo | n/a — snapshots | but see S-17: a refusal must leave NO history step |
| B27 | The store's `writeSlot` / `writeFill` wrappers | no production caller (checked) | probe bridge only |
| B28 | The `fillSlot` belt (a caller nobody guarded) | refuses silently, returns `false` | correct as a belt; not a door |

---

## 3. Roll-call C — every landing that puts a day "at the front" of the desktop week (D275)

Checked against `main`: `ui/pan.ts`, `ui/highlights.ts` and `e2e/geometry.spec.ts` are byte-identical to `main`;
`state/view.ts` differs from `main` only by the D271 lines in `placeArmed`; the `.week` rules (base, phone 12px,
desktop 20px) are identical to `main`; no `weekInset` and no `scroll-padding` remain anywhere in `src` or `e2e`
(one comment in `pan.ts` says "sets NO scroll-padding" — true again). So the revert is complete by construction; the
walk is to SEE it.

| # | Landing | Reads | Expected (desktop) |
|---|---|---|---|
| C1 | At rest after sign-in / page open | the padding | Monday's left edge = the week box's left + 20px; the ‹ arrow (8px in, 38px wide) floats over Monday's first ~26px — **his choice (D275)** |
| C2 | ‹ › arrow press (`pan.ts panDays`) | whole day steps from the padding | each day lands at the same x as Monday at rest |
| C3 | Page switch carry Edit ↔ View (`scrollWeekToDay` + `weekLeftDay`) | the box's own left edge | the same day fronts on the other page, flush |
| C4 | Week calendar jump to a day (`scrollWeekToDay`) | the box's left edge | that day flush |
| C5 | A warning tap, a "take me to this change" tap, a pending-list tap (`bringIntoView`) | on-screen = between the box's edges | an off-screen day lands flush; a puck already on screen does not move the week (6 Aug 26 rule) — including a man fully visible beside the crew palette on Edit Schedule (W4's F-W4-1 cannot recur: the right-hand room is gone) |
| C6 | The next-week peek click (`scrollWeekToLanding`) | the x it was clicked at | unchanged |
| C7 | The palette follow (which day the palette shows — `weekLeftDay`) | the box's left edge | the day at the front, not the one before it (the 42px strip that fooled the old tests is gone — ~8px shows, as on `main`) |
| C8 | The phone week (12px padding, no arrows) | unchanged | unchanged |
| C9 | A window resize | never re-lands (as on `main`) | as `main` |

---

## 4. Ranked scenarios

Sign in as `ad` (admin, Saber) unless said; `us` is the member Ranger. Desktop 1440×900 and phone 390×844. "Nothing
written" always means: the row as it was, the day's pending count unchanged, no Undo step, no landing flash, no
pending mark. FS = Monday's FLIGHT SAFETY STAND-DOWN 08:30–09:00 (Ranger on it in the seed).

| Rank | Scenario | Setup (through the app) | Action | Expected on screen AND in the data | The observation that would disprove correctness |
|---|---|---|---|---|---|
| **S-1** | **A man twice via the accepted request's Person change (MISSING door, B22)** | A request accepted onto Monday's Ground Programme (Ranger's row). On the board, "+ add" Havoc as an extra on that row (allowed — different men). Inputs page → edit Ranger's request → Person: Havoc → save | (also try: drag Havoc from the roster onto the row's Unavailable/Personal-Inputs seat if it offers a `data-inpseat`) | D271 says the row keeps ONE copy of a man. Expected under the ruling: Havoc once on the row — the primary — and a word that his extra place was dropped (my recommendation, F1); or the change refused with the D271 sentence | the row shows Havoc TWICE (primary + extra); the pending count rises by the extra; the crew list then strikes Havoc for that row with "already on … · not added twice" while he stands there twice |
| **S-2** | A swap whose OTHER end is the second copy, with a real pointer on the board | Comet on FS and on ROW A (a ground row); Ranger on FS | Drag ROW A's Comet onto Ranger's puck in FS — aim within a few pixels of the puck (the 7px near-seat slop) and also dead on it | Refused whole: toast "Comet — already on FLIGHT SAFETY STAND-DOWN 08:30–09:00 · not added twice"; ROW A keeps Comet, FS keeps [Ranger, Comet]; no flash on either seat; 0 pending on an unpublished day | Ranger appears on ROW A while Comet is still on FS (one end written) — or the crowd reads [Comet, Comet]; the seat flashes; "1 pending" |
| **S-3** | Phone, finger drag from the drawer onto the crowd's "+ add" where he already is | Phone 390×844, Edit Schedule, Monday, drawer open | Press-hold Ranger in the drawer, carry to FS's people cell, lift below the pucks | Toast visible over the drawer/board; nothing written; the drawer slides BACK out (a failed drop returns it); the amber "why" outline under the ghost read the same sentence before the lift | the drawer stays parked; a second Ranger; no toast; the caption and the toast disagree |
| **S-4** | The armed tap, three orders | Board, Monday FS. Arm its "+ add" | (a) tap Ranger on the roster → (b) tap Havoc → (c) arm Havoc's new place in FS, tap Ranger | (a) refused, "+ add" still armed, Ranger struck on the list with the sentence; (b) Havoc lands, arm goes down, "Havoc planned" (or a warning); (c) refused — reading (3) by tap: Havoc not replaced, the seat stays armed | the arm drops after (a); (c) replaces Havoc with a second Ranger |
| **S-5** | D270 for the member on View-only Sched | Sign in `us` (Ranger). Make Ranger carry an AMBER advisory on a published day (as `ad` first: e.g. a ground row eating his brief, publish, sign out; or a day already flagged in the seed) | Look at Ranger's puck on View-only, desktop and phone | Purple fill, AMBER ring (1.5px), NO purple ring, NO glow — pixel-match the amber ring on a neighbour's puck; the letter chip as today | a purple ring; a glow; a ring thicker than the neighbour's |
| **S-6** | D272 in OIL Earn mode | `ad`, the board on Saturday, Saber on a duty desk; OIL Earn on | Look at Saber's puck; tap him off; tap him back on; a half-day case (a short event) | Earning full: green ring with its soft green glow, purple fill; half: plain green ring; taken off (`oildim`): the puck at half opacity with the purple ring + glow (**Q-B**); another man's puck beside him wears the same green | the purple ring over the green one; his ring differs from the neighbour's |
| **S-7** | D270: the dotted ring ALONE on his puck | Sunday: give Saber a late finish that breaks Monday's crew rest (edit Sunday's line landing time) | Look at Sunday's Saber puck (week and board) | Dotted red ring at 2px offset, purple fill, NOTHING purple behind the dots, no glow; Monday's breach puck shows the solid red box | purple ring/glow under the dots (the W1 C2 picture); the dots over a glow |
| **S-8** | D270: solid red, dashed red, red + dotted | Saber in a hard clash (two events at once); then a sanctioned "late show" remark on his crew-rest breach; then a clash on a Sunday that also breaks Monday | Look at each | Solid 2px red box; dashed 2px red, nothing behind the dashes; box + dots together — each identical to the same flag on another man | any purple ring or haze; a dashed ring with a solid haze in its gaps |
| **S-9** | D270 on the 👁 look at a published version | Publish Monday with Saber flagged; then change something so the working copy differs; 👁 the published version on the board AND on the edit week; also an OLDER version after an AL | Look at Saber's puck in the look | The look's own flags (D187): flag ring wins, purple fill; an unflagged look: purple ring + glow | purple ring over a flag inside the look; no purple at all on an unflagged look |
| **S-10** | D270 on the drag ghost | Saber flagged amber; another man flagged amber | Pick each up with the mouse, then with a finger; screenshot mid-drag | Both ghosts identical: cyan lift veil, depth shadow; the amber ring not on either (the lift rule wins at equal specificity, as on `main`); a `boxred` ghost keeps its red ring on both | his ghost shows a purple ring or glow the other's does not |
| **S-11** | D270 in the ALL AVAIL window | Drop ALL AVAIL on a Saturday crowd; tap its count | Find Saber in the window | Verify FIRST whether his puck is purple there at all (A7). If yes: flagged → flag ring | a purple ring over a flag inside the window (if purple lands there) |
| **S-12** | D270 on the crew palette and the board roster | Saber flagged (any); arm a seat he cannot take | Look at his palette puck struck and unstruck | Flag ring wins, purple fill, the grey blend when busy/struck; the strike is on the row | purple ring on a flagged palette puck |
| **S-13** | D271 on an ⓘ info-only row | Monday, a ground row marked ⓘ with Ranger on it | Arm its "+ add" → Ranger struck with the sentence; drop Ranger from the roster; drop Havoc | Ranger refused (the caption said it first); Havoc lands with NO warning at all (FYI rows raise nothing) | Ranger planted twice on the FYI row; Havoc warned about a clash on an FYI row |
| **S-14** | D271 on a duty desk's extras, a sim's rear seat, the D50 spare seat | Havoc holds a duty desk; Havoc in an OFT front seat (its rear empty); a full AMT box with Havoc in it (the spare pair shows) | Drop Havoc from the roster below the desk (its extras); onto the OFT's empty rear seat; onto the AMT's spare seat; also by arm-and-tap | All refused: "Havoc — already on <row> <times> · not added twice"; the desk/sim as they were | an extra Havoc; Havoc front AND rear |
| **S-15** | D271 wording on a row with no times / open end | A ground row with no times holding Ranger; a crowd whose end is blank | Drop Ranger on each | "Ranger — already on this row · not added twice" (no times to print) or with the row's label and the app's open-end time — either way it names the refusal, never a blank | a toast with no reason, or "planned" |
| **S-16** | D271 on a PUBLISHED day — refusal vs a real change | Publish Monday (all four signed). | (a) drop Ranger onto FS again; (b) swap Ranger and Comet inside FS; undo; redo; reload | (a) 0 pending, sign-offs intact, no AL item; (b) "1 pending" (the same men in a new order is ONE item — W3), the four sign-offs fall (D103); undo → 0 and the signatures back; redo → 1; reload keeps 1 | (a) "1 pending" or a fallen sign-off after a refusal; (b) 2 pending |
| **S-17** | Undo after a refusal | Do one real change (move Havoc somewhere), then a refused drop | Press Undo once | Undo names and reverses the REAL change (Havoc's move) — the refusal left no step | Undo says "Undid: …" about FS, or does nothing on the first press |
| **S-18** | Reading (1): two DIFFERENT rows still plant and warn | MET + NOTAM BRIEF's end moved to 08:45 so it overlaps FS | Drop a MET+NOTAM man onto FS's "+ add" | He lands; the drop toast / drop delta says "already on MET + NOTAM BRIEF …" WITHOUT "not added twice"; the warning list gains the clash | refused; or planted with no word |
| **S-19** | Reading (2), D274 item 3: swap inside one crowd | FS [Ranger, Comet] | Drag Ranger onto Comet | They swap; NO "already on" and NO "twice" anywhere (toast, caption, list) | any "already on FLIGHT SAFETY" word |
| **S-20** | Move to the end of his own crowd | FS [Ranger, Comet] | Drag Ranger onto FS's "+ add" | One Ranger, now last; no "twice". Note how the crowd draws afterwards: the place he left is a held blank — look for an odd empty gap (pre-existing behaviour, report as an observation) | two Rangers; a refusal |
| **S-21** | Cross-day | Ranger on Monday's FS and on Tuesday's crowd X | Drag Monday's Ranger puck onto Tuesday's crowd X "+ add" and onto a man in it | Refused, the sentence naming TUESDAY's row and times; Monday untouched | Monday's Ranger removed with Tuesday refused (a move half-done) |
| **S-22** | Removed then re-added (the read is live) | FS [Ranger] | Drag Ranger off FS onto blank space (removed); then drag him back from the palette onto FS | The second drop LANDS (he is no longer there); undo twice puts things back | a stale refusal after the removal |
| **S-23** | Arm + drag order | Arm FS's "+ add" | Drag Ranger from the palette onto the armed cell → refused; drag Havoc onto it | Refusal leaves the arm; Havoc's drop lands AND puts the arm down (it did the arm's job) | the arm survives Havoc's landing, or dies on Ranger's refusal |
| **S-24** | Q-A: one man in both seats of one jet line | An empty jet line | Drop Ranger on FCP, then Ranger again on RCP (and by arm-and-tap) | **As built: planted**, then the hard "two events at once" warning names the line twice. **Put to him** — is a jet line "a row" under D271? | (nothing to disprove — a question) |
| **S-25** | Q-C: a placeholder twice on one row | A Saturday crowd | Drop ALL AVAIL twice onto it | As built: both land, silently (a placeholder is not a man). The count chip now shows twice. Put to him | — |
| **S-26** | D275 at rest and after presses, three widths | Desktop 1440×900, 1024×700, 1920×1080; View-only and Edit | Look at rest; press › three times; press ‹ back | The front day's left edge sits 20px in from the week box's edge every time; the ‹ arrow overlaps its first ~26px (his choice); the day before shows ~8px at the left, not 42 | a 54px gap; a day landing off the box's edge; the arrow beside the day instead of over it |
| **S-27** | D275: the landings that read the front | On View-only: open Monday's "⚠ issues" list; tap a warning on Thursday; tap a change in the changes list; jump with the week calendar to Friday; switch to Edit Schedule and back | | Each destination day lands flush (20px); the list's first letters sit UNDER the ‹ arrow (his choice); Edit ↔ View carry the same day; a warning on a man already on screen does not move the week sideways — including a man visible right beside the crew palette | any landing 54px in; the carry naming the day before; the palette-side man swinging the week |
| **S-28** | The caption's silence over a row's TITLE | FS with Ranger | Drag Ranger from the palette and hover the row's NAME cell, then its people cell, then lift on the name cell | Over the people cell / a puck the ghost carries the sentence; over the title NO caption (the hover only asks `[data-fill]`/seats) — yet the drop there resolves to the cell and refuses. D271 is kept; the promise "said before the drop" is kept only over the cell. Observation for the look card | — |
| **S-29** | The caption cannot speak for the OTHER end of a swap | As S-2 | Hover before dropping | The caption is about the dragged man (Comet) only → nothing; the drop then refuses for the OTHER end. Not a defect — the toast says why — but note it | — |
| **S-30** | The belt behind the doors (break test the walker should demand) | Remove the `twice()` line in the drag door's cell branch; drop Ranger on FS's "+ add" | | `fillSlot` returns `false` silently: nothing written, but NO toast — proves the belt exists and that the door's own words are what the user relies on; `rowtwice-refusal.test.tsx` must go red | the second copy appears (belt missing) |
| **S-31** | D270 under a live warning focus / selection (negative) | Saber flagged; tap the warning naming him; then click another man | | Under the focus his puck wears the red focus glow and loses the purple entirely (the focus owns the puck — pre-existing); under another man's selection his puck dims (pre-existing) | — (nothing new to find; record it so a walker does not file it) |
| **S-32** | Roles (negative) | Sign in `us` | Try every D271 door | No door exists for a member: nothing drags, nothing arms; no D271 toast can appear | a member reaching any refusal (means a door leaked) |
| **S-33** | Refusal on the week vs the board | Edit Schedule week's Common Programme row (its own `[data-fill]`) | Repeat S-2/S-3's drops on the WEEK | Identical refusals; no flash on the week's copy of the seat; the hidden week behind the board never flashes for a board refusal | a flash anywhere on a refusal |

---

## 5. Explicit negatives — what I checked and found nothing wrong with

- **The key shapes agree.** `rowPlaces` builds `a:di.ri.N`, `g:di.ri`, `d:di.wi.ri`, `s:…​.p/.w/.pax.N`, `…​.xN`; the
  board and the week emit exactly those on `data-slot`, and `…​.+` on `data-fill`. `here` (the place asked about) and
  `from` (the place left) compare by string with those keys — no shape mismatch that would let a refusal miss or fire
  wrongly.
- **Both ends of a swap are judged before either write; the cell move preflights before it clears the source.** The
  D33 defect shape (one end written, the other refused) cannot recur through these doors.
- **The belt is in `fillSlot` only, never `setSlotVal`** — correct: a swap inside one crowd is two writes and would
  otherwise refuse itself.
- **A placeholder is excluded** from the refusal (`isSpecial`) — consistent with D33's "silent on every row".
- **The caption, the crew list's strike and the drop read one body** (`slotBar` → `rowTwice`, ahead of the ⓘ exit;
  `hoverWhy` passes the same `fromKey` the door passes). On FYI rows the three agree.
- **The palette's armed key keeps its `.+`**, so an armed "+ add" strikes a man already in the crowd, and an armed
  PLACE strikes him only if he is elsewhere on the row — the same question the tap asks.
- **A refusal returns before `done()` / `afterSchedMutate`**: no flash, no history step, no notify, the arm untouched;
  on a phone the drawer comes back (`ROS_REOPEN` is cleared only by a landed drop).
- **No other writer of a man onto a row** exists in the UI except B22: `writeSlot`/`writeFill` have no callers; day
  templates blank every `who`; no text field writes `who`; the keyboard plants nothing; `acceptInput` makes a new row;
  `reassignInput` changes an input's person (its relink is B22).
- **D270/D272 CSS:** the purple ring rule excludes every ring class `puck()` can emit and both OIL glows; specificity
  (0,7,0) with `!important` — nothing on a puck outranks it when it applies, and it steps aside exactly when a ring
  class is present; the purple fill, `z-index` and `position` stay; the four D164 fight-back rules are gone and nothing
  else in the stylesheet draws a `.puck.me` ring. The ring test resolves all 96 class sets and requires his winning
  ring = another man's; it guards itself against reading nothing.
- **The "you" class is removed and re-hung on every pass**, on preview pucks too; the peek carries no `data-person`.
- **D275:** `pan.ts`, `highlights.ts`, `geometry.spec.ts` identical to `main`; `view.ts` differs only by D271;
  `.week` rules identical at every width; no `weekInset`, no `scroll-padding`; `weekinset.test.ts` gone and the
  file map updated; `ui-contracts.md` and `feature-impact.md` state the no-room rule.
- **Docs match the build** for D271 (`engine-rules.md`, `ui-contracts.md` §Arm-and-plant) and D270/D272
  (`ui-contracts.md` "No flag ring glows").

---

## 6. What I believe is WRONG against the rulings, with fix instructions — and three questions for him

### F1 — MISSING door (B22, S-1): changing an accepted request's Person can put a man on its row twice — NEW data
**Where:** `raptor-port/src/ui/inputedit.tsx`, `commitInputEdit`. Around line 1024 it captures the row's extras
(`extras = { more, flag, cx }`) before un-accepting; around line 1145, after `acceptInput` re-creates the row as the
NEW person, it writes them back: `if (extras.more?.length) nr.more = extras.more`. Nothing asks whether the new
`r.person` is among `extras.more`. If the scheduler had added Havoc as an extra on Ranger's request row and the
request is then re-pointed to Havoc (the Inputs page dialog's Person field, admin-gated; or the reassign drop/tap on
the row's seat where it offers one), Havoc is the primary AND an extra. D271: "the row keeps its one copy".
**Severity:** low-medium — rare, but it is the one path I found that writes a second copy to new data going forward,
and the crew list will then strike Havoc for that row while he already stands there twice.
**Fix (step by step):**
1. In `commitInputEdit`, at the extras put-back (~line 1145), drop the new person from the extras before writing them:
   `const keep = (extras.more || []).filter((v:any) => whoId(v) !== r.person)` (import `whoId` from
   `../engine/people` if not already), then `if (keep.length) nr.more = keep` — and trim trailing blanks the way
   `setSlotVal` does (or route through `whoSet`-style trimming), so held indices stay tidy.
2. If anything was dropped, say so: `HOOKS.toast(`${PEOPLE[r.person].cs} was already on this row as an extra — kept
   once`, 'warn')`. One sentence, the D271 vocabulary.
3. Test, red first: in `raptor-port/src/engine/inputground.test.ts` (or a new case in `rowtwice-refusal.test.tsx`):
   accept a request onto Ground, add a second man as an extra through `fillSlot(row + '.+')`, change the input's
   person to that man through `commitInputEdit`'s real path, assert `rowPlaces(rowKey).filter(x => x.id === him)`
   has length 1 and the toast fired. Break test: remove the filter, watch it go red.
4. Roll-call row B22 goes to "refuses (keeps one copy)".
*Alternative I considered and do not recommend:* refusing the person change outright — that blocks a legitimate
correction of whose request it is.

### F2 — a stale comment in `scheduler.css` (~line 4245)
The ghost-veil comment still lists `.puck.me.boxred` and `.puck.me.boxdash` among the `!important` rules a clone
inherits, with "(three since D270…)" bolted on. Those two rules no longer exist. Reword the sentence to name the three
that do (`.puck.me`'s fill, `.puck.boxred`, `.puck.boxdash`). Words only.

### Q-A — is a jet line "a row" under D271? (S-24)
The build does not hold a flying line's two seats to the rule: one man can be put in FCP and RCP of one jet and is
only WARNED (the hard "two events at once" clash). The ruling's own text names crowds, extras and sim seats, so this
is a reading, not a defect — but "one man, once per row" in his words would cover a jet line too. Put it to him;
if yes, `rowTwice` needs a flying branch (`flyRef(key)`: the other seat of the same aircraft) and `slotBar`'s
flying keys reach it already.

### Q-B — his own puck NOT earning in OIL Earn mode (S-6)
`oildim` is not excluded, so his taken-off puck keeps the purple ring AND glow at half opacity while every other
taken-off puck is simply dimmed. D272 spoke only of the green ring; the ring test pins this as intended. Show him a
picture: is a glowing (if faded) purple ring the right look for "earns nothing"?

### Q-C — a placeholder twice on one row (S-25)
ALL / ALL AVAIL may be dropped twice on one row, silently, with two count chips. D33 makes the placeholder silent
everywhere; D271 speaks of "a man". Likely fine; one line on the look card.

### Observation for the look card, not a finding
On the crew list a struck name looks the same whether its reason will REFUSE (D271's "· not added twice") or only
WARN after planting ("everything plants, warning after"). The printed reason differs; the look does not. He may want
the refusing strike to read differently.

---

## 7. Break tests to demand of the builder (order §8.4), one per wired place
Drag seat branch (roster) · drag seat branch (swap, each end) · drag cell branch (roster) · drag cell branch (move) ·
`placeArmed` on `.+` · `placeArmed` on an armed seat · the `fillSlot` belt · the `slotBar` early return (caption and
strike) · the CSS `:not()` chain (delete one `:not` and watch `flagglow-css.test.ts` go red for that ring) · the five
landing tests measure from the box edge (put `scroll-padding-left:54px` back and watch them go red).
