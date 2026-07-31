ported 341 skipped 382
rt map (phase 2)

Every assertion in `reference/tfin.js`, by its label, marked **ported** (with
its Vitest home under `src/engine/`) or **skipped** (with why). “≈” means the
assertion was adapted: the same contract, driven through the engine instead of
the rendered page, or re-expressed as behaviour instead of a source-text regex.
The reference suite itself still runs untouched (`npm run test:reference`),
so every skipped assertion continues to be enforced against the reference.

| tfin line | assertion | status |
|---|---|---|
| 9 | admin login | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 11 | all-hands | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 12 | programme columnar | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 13 | avail by wave | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 14 | in-times | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 15 | sims columnar | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 16 | duties columnar | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 17 | ground shown | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 18 | DT/C/CR/TT chips | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 19 | stores view | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 22 | click select | **ported** → ui/interact.test.tsx |
| 26 | puck click opens that person's issue boxes | **ported** → ui/interact.test.tsx |
| 28 | opened boxes are the days that person is flagged on | **ported** → ui/interact.test.tsx |
| 30 | person-focused boxes are marked | **ported** → ui/interact.test.tsx |
| 31 | person-focused box names the callsign | **ported** → ui/interact.test.tsx |
| 33 | person-focused box lists only that person's issues | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 36 | cross-day pointer when flagged on more than one day | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 38 | the clicked person stays selected, not warning-focused | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 41 | clicking the same puck again clears it | **ported** → ui/interact.test.tsx |
| 44 | INS hl | **ported** → ui/interact.test.tsx |
| 47 | insights sorties | **ported** → ui/textedit.test.tsx |
| 49 | no warn modal | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 50 | day issue strips | skipped — jsdom UI — login, view-week rendering, puck selection, inline warning boxes |
| 51 | strips start collapsed | **ported** → ui/interact.test.tsx |
| 55 | strip expands inline | **ported** → ui/interact.test.tsx |
| 56 | expanded day highlights affected pucks | **ported** → ui/interact.test.tsx |
| 57 | other pucks dimmed | **ported** → ui/interact.test.tsx |
| 62 | focused item marked | **ported** → ui/interact.test.tsx |
| 64 | warning focus lights pucks | **ported** → ui/interact.test.tsx |
| 65 | only related pucks lit | **ported** → ui/interact.test.tsx |
| 69 | solid focus stays on the focused day | **ported** → ui/interact.test.tsx |
| 72 | any echo is off the focused day and same-person | **ported** → ui/interact.test.tsx |
| 74 | clear-focus button shown | **ported** → ui/interact.test.tsx |
| 76 | focus cleared | **ported** → ui/interact.test.tsx |
| 78 | strip collapses again | **ported** → ui/interact.test.tsx |
| 81 | blocking pill expands days | **ported** → ui/interact.test.tsx |
| 83 | all strips collapsed | **ported** → ui/interact.test.tsx |
| 86 | draft banner | **ported** → ui/editweek.test.tsx |
| 87 | draft banner names no days | **ported** → ui/editweek.test.tsx |
| 97 | every day carries its own sign-off strip | **ported** → ui/editweek.test.tsx |
| 100 | the strip has the four roles | **ported** → ui/editweek.test.tsx |
| 102 | each role is a roster dropdown | **ported** → ≈ ui/editweek.test.tsx |
| 106 | Scheduler is a qual column | **ported** → ≈ ui/quals.test.tsx (against QUAL_COLS in the port) |
| 109 | some schedulers are appointed | **ported** → ≈ publish.test.ts |
| 112 | the three scheduling roles offer ONLY appointed schedulers | **ported** → ≈ publish.test.ts (signPeople, not the dropdowns) |
| 117 | CUR CK stays open to everyone | **ported** → ≈ publish.test.ts |
| 122 | the three are marked as restricted | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 123 | the restricted list is a strict subset of the roster | **ported** → ≈ publish.test.ts |
| 127 | the strip knows which day it belongs to | **ported** → ≈ ui/editweek.test.tsx |
| 129 | the view page shows no sign-off strip | **ported** → ui/editweek.test.tsx |
| 130 | publish day is locked while unsigned | **ported** → ui/editweek.test.tsx |
| 131 | the lock says what is missing | **ported** → ≈ ui/editweek.test.tsx (title from signMissing) |
| 133 | a locked day cannot be published by clicking | **ported** → ui/editweek.test.tsx |
| 135 | nor through the model | **ported** → publish.test.ts |
| 139 | three of four is still locked | **ported** → ≈ publish.test.ts (signMissing, not the strip DOM) |
| 141 | the strip counts what is left | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 142 | signed roles are marked | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 145 | all four unlocks the day | **ported** → ≈ publish.test.ts |
| 146 | the strip says so | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 147 | signing one day leaves the others locked | **ported** → ≈ publish.test.ts |
| 148 | day 1 keeps its own empty strip | **ported** → ≈ ui/editweek.test.tsx |
| 155 | publish-day is the primary blue button | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 157 | unsigned darkens it instead of fading it | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 160 | and the view-only chip stays a chip, not a button | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 162 | per-day beak buttons | **ported** → ≈ ui/editweek.test.tsx |
| 164 | view beak read-only | **ported** → ≈ ui/editweek.test.tsx |
| 169 | part-published banner | **ported** → ui/editweek.test.tsx |
| 170 | banner names the beaked day | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 171 | day 0 marked ok | **ported** → ui/editweek.test.tsx |
| 173 | the word "beaked" is gone from the interface | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 176 | day 1 still draft | **ported** → ≈ ui/editweek.test.tsx |
| 179 | view page mirrors day 0 | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 181 | undo unpublishes the day | **ported** → ≈ state/store.test.ts + ui/editweek.test.tsx |
| 182 | redo re-publishes the day | **ported** → ≈ state/store.test.ts |
| 184 | publish-day toggles off | **ported** → ≈ ui/editweek.test.tsx |
| 187 | no publish-all button on the edit page | **ported** → ≈ ui/editweek.test.tsx (never rendered) |
| 189 | and the AL / reopen actions are still there | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 193 | a signed day publishes from its own button | **ported** → ≈ publish.test.ts (setDayApproved, not the button) |
| 199 | publishing a day spends its signature | **ported** → ≈ publish.test.ts |
| 202 | and locks that day again | **ported** → ≈ publish.test.ts |
| 206 | approved | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 207 | all days dok | skipped — jsdom UI — edit page, sign-off strips, publish buttons, banners (the model contracts behind them are ported to publish.test.ts) |
| 208 | AL3 bright green | **ported** → ≈ publish.test.ts (alColor; the CSS var is phase 4) |
| 210 | AL4 white | **ported** → ≈ publish.test.ts (alColor; the CSS var is phase 4) |
| 212 | edit roster pilots | **ported** → ≈ ui/editweek.test.tsx (palette renders) |
| 213 | edit roster SANS group | **ported** → ≈ ui/editweek.test.tsx (SANS column in paletteHTML) |
| 217 | right-click clears slot | **ported** → ui/editweek.test.tsx |
| 224 | duty cells droppable | **ported** → drag.test.tsx |
| 225 | sim cells droppable | **ported** → drag.test.tsx |
| 226 | ground cells droppable | **ported** → drag.test.tsx |
| 227 | programme cells droppable | **ported** → drag.test.tsx |
| 228 | available crew are drag sources | **ported** → drag.test.tsx |
| 237 | slot round-trip all prefixes | **ported** → ≈ slots.test.ts (keys built from the model, not data-slot) |
| 242 | roster -> duty seat | **ported** → drag.test.tsx |
| 248 | flying <-> duty swap | **ported** → drag.test.tsx |
| 255 | roster -> programme append | **ported** → drag.test.tsx |
| 260 | roster -> empty sim front seat | **ported** → drag.test.tsx |
| 262 | roster -> empty sim front seat | **ported** → drag.test.tsx |
| 266 | seat -> roster unassigns | **ported** → drag.test.tsx |
| 268 | dnd class cleared after drop | **ported** → drag.test.tsx |
| 269 | view page stays read-only | **ported** → drag.test.tsx |
| 270 | week nav arrows present | **ported** → pan.test.tsx |
| 273 | store toggles + dirty | skipped — jsdom UI — roster palette, drag & drop wiring, store pills, AL panel, undo buttons, quals page, inputs page, scheduler board |
| 278 | the week banner carries no Publish AL button | **ported** → ≈ ui/editweek.test.tsx |
| 280 | the day that carries the edits carries the button | **ported** → ui/editweek.test.tsx |
| 282 | and a day with nothing pending carries none | **ported** → ui/editweek.test.tsx |
| 283 | the view page never renders one | **ported** → ≈ ui/editweek.test.tsx |
| 284 | publishing an AL needs that day signed | **ported** → ≈ publish.test.ts (canPublishAL/alUnsignedDays) |
| 290 | the lock names the day, not the week | skipped — jsdom UI — roster palette, drag & drop wiring, store pills, AL panel, undo buttons, quals page, inputs page, scheduler board |
| 293 | a blocked publish issues no AL | **ported** → ≈ publish.test.ts |
| 295 | signing that day again unlocks it | **ported** → ui/editweek.test.tsx |
| 298 | AL1 published | **ported** → ≈ publish.test.ts (SCHED.changes/als, not the banner) |
| 299 | publishing spends that day's signatures | **ported** → ≈ publish.test.ts |
| 302 | the day stays published though | **ported** → publish.test.ts |
| 303 | signing is per day, not shared | **ported** → ≈ publish.test.ts |
| 308 | the published AL records a name per day | **ported** → ≈ publish.test.ts |
| 314 | the board shows the open day's strip | **ported** → board.test.tsx |
| 325 | no global AL tint | skipped — jsdom UI — roster palette, drag & drop wiring, store pills, AL panel, undo buttons, quals page, inputs page, scheduler board |
| 326 | only changed item marked AL1 | **ported** → ≈ ui/editweek.test.tsx |
| 328 | AL panel lists AL1 | **ported** → ui/editweek.test.tsx |
| 331 | undo+redo buttons | **ported** → ui/editweek.test.tsx |
| 336 | undo restores slot | **ported** → ≈ state/store.test.ts + ui/editweek.test.tsx |
| 338 | redo reapplies slot | **ported** → ≈ state/store.test.ts + ui/editweek.test.tsx |
| 342 | AL has unpublish control | **ported** → ui/editweek.test.tsx |
| 344 | unpublish clears AL1 marks | **ported** → ≈ publish.test.ts (model marks, not the tint) |
| 345 | the AL-panel publish is gated too | skipped — jsdom UI — roster palette, drag & drop wiring, store pills, AL panel, undo buttons, quals page, inputs page, scheduler board |
| 347 | signing again re-enables it | skipped — jsdom UI — roster palette, drag & drop wiring, store pills, AL panel, undo buttons, quals page, inputs page, scheduler board |
| 351 | board inputs panel | **ported** → board.test.tsx |
| 352 | board inputs banded | **ported** → board.test.tsx |
| 355 | SANS pucks marked | skipped — jsdom UI — roster palette, drag & drop wiring, store pills, AL panel, undo buttons, quals page, inputs page, scheduler board |
| 358 | quals rows | **ported** → ui/quals.test.tsx |
| 361 | the Quals table has a Scheduler column | **ported** → ui/quals.test.tsx |
| 362 | the column sits with the appointments, not the flying quals | **ported** → ui/quals.test.tsx |
| 364 | appointed people are ticked | **ported** → ui/quals.test.tsx |
| 366 | every row carries the cell | **ported** → ui/quals.test.tsx |
| 369 | a tick matches isScheduler | **ported** → ui/quals.test.tsx |
| 375 | ticking the cell appoints them | **ported** → ui/quals.test.tsx |
| 377 | unticking withdraws it | **ported** → ui/quals.test.tsx |
| 379 | ticking the cell appoints them | **ported** → ui/quals.test.tsx |
| 379 | unticking withdraws it | **ported** → ui/quals.test.tsx |
| 382 | inputs rows | **ported** → ui/inputs.test.tsx |
| 383 | no TDY | **ported** → leave.test.ts + ui/inputs.test.tsx |
| 386 | sched board opens | **ported** → board.test.tsx |
| 387 | sched lines render | **ported** → board.test.tsx |
| 388 | sched roster render | **ported** → board.test.tsx |
| 389 | sched wave title select | **ported** → board.test.tsx |
| 393 | sched setSlotVal | **ported** → board.test.tsx |
| 397 | downchit renamed | skipped — jsdom UI — roster palette, drag & drop wiring, store pills, AL panel, undo buttons, quals page, inputs page, scheduler board |
| 424 | css parsed | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 428 | puck vars declared once | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 430 | puck 74x15 | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 431 | puck vars are root-level | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 433 | .puck exists | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 434 | .puck 9px type | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 435 | .puck line-height 1 | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 436 | .puck geometry from vars | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 439 | .role 9.5px square chip | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 444 | .puck.sm never overrides the canonical size | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 448 | no rule shrinks the puck or its name | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 451 | pucks are still rendered with the sm class in lists | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 453 | no per-breakpoint puck override | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 455 | no hardcoded 74/15 puck geometry | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 457 | seat pucks pinned to the var | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 465 | people columns derived from --puck-w | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 470 | trap a — no CSS zoom anywhere | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 472 | all four flying templates found | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 473 | trap b — leading flying columns are fixed px | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 477 | trap b — exactly one trailing fr track per template | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 479 | trap c — .ntx keeps its 30px base | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 480 | trap c — released inside flight cells on mobile | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 481 | trap c — still tappable in edit mode | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 483 | trap d — no descendant .nm selectors | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 484 | trap d — row names are direct-child | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 485 | trap d — leaked props only on direct-child rules | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 491 | flying base template | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 492 | flying ≤820 template | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 493 | flying ≤374 template | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 494 | formcols header tracks match .form | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 495 | 5 flying columns at every width | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 498 | plist desktop = 5 tracks | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 500 | plist phone = 4 tracks | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 502 | plist phone template | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 503 | plist ≤374 template | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 504 | phone plist hides END header | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 505 | phone START header relabelled TIME | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 506 | phone name spans both time rows | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 507 | phone all-day time spans both rows | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 510 | single-puck template exists at all three widths | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 513 | single-puck people track is ONE puck wide, still from the var | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 518 | single-puck desktop = 5 tracks, phone = 4 | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 520 | single-puck NAME is wider than the two-puck NAME | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 525 | trap b — single-puck phone tracks stay fixed px before the 1fr | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 531 | long names can never paint over the TIME column | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 534 | single-puck override is declared after the block it overrides | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 545 | the single-puck blocks are marked | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 547 | ground scheduler + personal inputs are single-puck | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 549 | Available and Office are single-puck | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 551 | Duties and Sims keep the two-puck grid | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 554 | every single-puck row really does hold at most one puck | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 557 | single-puck rows still carry all four cell kinds | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 560 | headers are unchanged on single-puck blocks | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 568 | formations render | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 569 | container class is .go not .wave | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 571 | every header has 5 columns | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 573 | header labels CS/MSN B/TO LD FCP/RCP RMKS | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 577 | rmkcell is column 5 | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 578 | every formation carries an AREA strip | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 579 | AREA strip is full width | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 580 | AREA strip row from --ga | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 581 | acrow is column 4 on row --gr | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 582 | rmkcell shares --gr with acrow | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 583 | leading cells span --gs | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 585 | --gs/--gr/--ga emitted | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 586 | mobile grid twins deleted | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 588 | one rmkcell per aircraft row | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 590 | pucks live in .pucks inside .acrow | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 595 | plist headers render | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 596 | plist header spans h-nm h-st h-en h-pp h-rk | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 598 | plCols() shape | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 600 | plist rows render | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 601 | time cells carry t-s / t-e | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 603 | sims/duties/ground all use .plist | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 604 | plist rows carry a rmk cell | skipped — CSS layout contract — parses the stylesheet (puck geometry, grid templates, columnar lists); binding in phases 4–5 |
| 609 | validate returns WARN shape | **ported** → validate.test.ts |
| 610 | byDay covers every day | **ported** → ≈ validate.test.ts (vs DAYS.length, not rendered days) |
| 613 | every warning has a known tier | **ported** → validate.test.ts |
| 617 | every warning has a known code | **ported** → validate.test.ts |
| 619 | WCODE covers all 16 codes | **ported** → ≈ validate.test.ts (against the object, not source text) |
| 621 | CHIP_LABEL covers all 10 chips | **ported** → ≈ validate.test.ts (against the object) |
| 628 | every rule fires at its documented tier | skipped — engine (F) — see ported column |
| 630 | runtime tiers agree with the source | **ported** → validate.test.ts |
| 631 | SEVWORD is Warning/Advisory/Note | **ported** → ≈ validate.test.ts (against the object) |
| 632 | the word Caution is gone | skipped — engine (F) — see ported column |
| 633 | abutting windows do NOT overlap | **ported** → ≈ time.test.ts (as behaviour, not source regex) |
| 637 | VCONF thresholds unchanged | **ported** → ≈ validate.test.ts (against the object) |
| 638 | brief time is the hardline, not T/O−3h | skipped — engine (F) — see ported column |
| 639 | crew rest has the report-time escape hatch | skipped — engine (F) — see ported column |
| 640 | day warnings sorted hard → adv → note | **ported** → validate.test.ts |
| 643 | sev index keyed by day then person | **ported** → validate.test.ts |
| 644 | counters match the tallies | skipped — engine (F) — see ported column |
| 649 | ALL AVAIL sentinels never raise warnings | **ported** → validate.test.ts |
| 651 | collectEvents skips cancelled lines | **ported** → ≈ validate.test.ts (as behaviour) |
| 652 | at least one warning of each tier in the seed | **ported** → validate.test.ts |
| 657 | advisory bar markup removed | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 658 | advisory bar mounts removed | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 659 | advisory bar CSS removed | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 660 | advBarHTML/shortWarn gone | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 661 | nothing between the banner and the legend | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 665 | edit page banner is followed by the AL panel | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 668 | there is no week-wide sign-off bar any more | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 669 | severity pills still count the week | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 670 | the warn pill still expands the days | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 688 | a cross-day warning exists in the seed | **ported** → ui/interact.test.tsx |
| 696 | the guilty day lights solid | **ported** → ui/interact.test.tsx |
| 698 | the same aircrew light on the other days | **ported** → ui/interact.test.tsx |
| 699 | echo pucks are never on the focused day | **ported** → ui/interact.test.tsx |
| 700 | echo pucks are the same people | **ported** → ui/interact.test.tsx |
| 702 | everyone else is still dimmed | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 704 | every flagged person is accounted for | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 706 | the box explains the dashed pucks | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 708 | clear focus drops the echo too | **ported** → ui/interact.test.tsx |
| 715 | cross-day echo (no seed case) | skipped — jsdom UI — advisory-bar removal and cross-day warning focus rendering |
| 726 | a person with several issues on one day exists | skipped — jsdom UI — person-focus narrowing of the warning box |
| 733 | puck click narrows the box | skipped — jsdom UI — person-focus narrowing of the warning box |
| 736 | picking one of their warnings does NOT widen the box | skipped — jsdom UI — person-focus narrowing of the warning box |
| 739 | the box still names the person | skipped — jsdom UI — person-focus narrowing of the warning box |
| 740 | the picked warning is marked | skipped — jsdom UI — person-focus narrowing of the warning box |
| 741 | warning focus now owns the lighting | skipped — jsdom UI — person-focus narrowing of the warning box |
| 743 | cross-day echo still fires inside a person focus | skipped — jsdom UI — person-focus narrowing of the warning box |
| 745 | the clear button offers the way back | skipped — jsdom UI — person-focus narrowing of the warning box |
| 748 | clearing steps back to the person, not out of it | skipped — jsdom UI — person-focus narrowing of the warning box |
| 752 | the person is selected again after stepping back | skipped — jsdom UI — person-focus narrowing of the warning box |
| 755 | a second click on the puck leaves warning mode entirely | skipped — jsdom UI — person-focus narrowing of the warning box |
| 759 | the day strip alone still lists every issue on the day | skipped — jsdom UI — person-focus narrowing of the warning box |
| 764 | narrowed person focus (no seed case) | skipped — jsdom UI — person-focus narrowing of the warning box |
| 768 | day panel exists and starts hidden | **ported** → ≈ ui/textedit.test.tsx |
| 769 | every day offers the info button | **ported** → ui/textedit.test.tsx |
| 772 | info buttons address their own day | **ported** → ≈ ui/textedit.test.tsx |
| 775 | day panel opens on click | **ported** → ui/textedit.test.tsx |
| 777 | panel titles the day | **ported** → ≈ ui/textedit.test.tsx |
| 778 | panel shows the beak state | **ported** → ui/textedit.test.tsx |
| 779 | panel lists AL coverage | **ported** → ui/textedit.test.tsx |
| 780 | panel tasking grid | **ported** → ui/textedit.test.tsx |
| 782 | panel names the tasking rows | **ported** → ui/textedit.test.tsx |
| 787 | panel lists that day's issues | **ported** → ui/textedit.test.tsx |
| 789 | panel says clean when the day is clean | **ported** → ≈ ui/textedit.test.tsx |
| 790 | panel items use the Warning/Advisory/Note wording | **ported** → ui/textedit.test.tsx |
| 793 | day panel is read-only | **ported** → ui/textedit.test.tsx |
| 797 | panel issue jumps to the puck | **ported** → ui/textedit.test.tsx |
| 800 | panel issue jumps to the puck | **ported** → ui/textedit.test.tsx |
| 803 | day panel closes | **ported** → ui/textedit.test.tsx |
| 809 | AL1–AL4 colours pinned | skipped — CSS — AL colour variables (phase 4); alColor itself is tested in publish.test.ts |
| 810 | AL1 is cyan, AL3 bright green, AL4 white | skipped — CSS — AL colour variables (phase 4); alColor itself is tested in publish.test.ts |
| 811 | no whole-page AL tint | skipped — CSS — AL colour variables (phase 4); alColor itself is tested in publish.test.ts |
| 815 | cxTag renders only when cancelled | skipped — UI/CSS — CX + flag mark rendering |
| 816 | flagTag renders only when flagged | skipped — UI/CSS — CX + flag mark rendering |
| 817 | cancelled rows greyed | skipped — UI/CSS — CX + flag mark rendering |
| 818 | cx covers every row type | skipped — UI/CSS — CX + flag mark rendering |
| 821 | no floating rule is drawn across a cancelled row | skipped — UI/CSS — CX + flag mark rendering |
| 824 | the strike lands on leaf text only | skipped — UI/CSS — CX + flag mark rendering |
| 829 | no row box carries the strike itself | skipped — UI/CSS — CX + flag mark rendering |
| 832 | pucks and store pills are greyed, never crossed | skipped — UI/CSS — CX + flag mark rendering |
| 835 | the CX badge stays legible | skipped — UI/CSS — CX + flag mark rendering |
| 837 | a cancelled row still reads as cancelled without text | skipped — UI/CSS — CX + flag mark rendering |
| 840 | every personal-input name has a leaf to strike | skipped — UI/CSS — CX + flag mark rendering |
| 849 | keyDay resolves the day for every prefix | **ported** → keys.test.ts |
| 850 | keyDay rejects junk | **ported** → keys.test.ts |
| 851 | the 14 text prefixes are all live | skipped — engine (K) — see ported column; source-text pins on prefixes/commit wiring stay with the reference suite |
| 853 | txtRef resolves a remarks field | **ported** → slots.test.ts |
| 854 | txtRef survives a bad path | **ported** → slots.test.ts |
| 855 | scheduler-board inputs commit on change not input | skipped — engine (K) — see ported column; source-text pins on prefixes/commit wiring stay with the reference suite |
| 856 | time helpers round-trip | **ported** → ≈ time.test.ts (fmtT half is UI — see skips) |
| 861 | sanStatus returns null for non-SANS | **ported** → sans.test.ts |
| 863 | SANS baseline: 6 for proficiency, 3 for allowance | **ported** → sans.test.ts |
| 864 | surplus sorties do NOT carry forward | **ported** → sans.test.ts |
| 866 | 3 sorties earns allowance but not proficiency | **ported** → sans.test.ts |
| 867 | a short quarter counts as missed | **ported** → sans.test.ts |
| 869 | shortfall carries forward into the next quarter | **ported** → sans.test.ts |
| 870 | more than 2 short quarters puts them out of flying | **ported** → sans.test.ts |
| 872 | missing allowance is worse than missing proficiency | **ported** → sans.test.ts |
| 874 | exactly 6 meets proficiency | **ported** → sans.test.ts |
| 875 | out-of-flying is the most severe tier | **ported** → sans.test.ts |
| 876 | SANS highlighting NOT wired up yet | skipped — engine (L·SANS) — see ported column |
| 882 | member no edit tab | skipped — UI — member login, drag-and-drop internals, touch-drag source pins |
| 883 | member sees AL banner (view) | skipped — UI — member login, drag-and-drop internals, touch-drag source pins |
| 885 | dragFrom / applyDrop are exposed | **ported** → ≈ drag.test.tsx (module exports, not window globals) |
| 886 | dragFrom reads a slot seat | **ported** → drag.test.tsx |
| 888 | dragFrom reads a roster puck | **ported** → drag.test.tsx |
| 890 | dragFrom ignores anything undraggable | **ported** → drag.test.tsx |
| 891 | applyDrop is a no-op without a drag | **ported** → drag.test.tsx |
| 892 | the mouse drop handler delegates to applyDrop | **ported** → ≈ drag.ts (verbatim body; behaviour covered by the dnd tests) |
| 894 | the swap zone has a margin | **ported** → ≈ drag.ts (verbatim nearSeat + SWAP_SLOP; jsdom has no geometry to measure) |
| 895 | a near miss is resolved to the nearest puck | **ported** → ≈ drag.ts (verbatim body; probe re-measures in phase 5) |
| 899 | below a puck adds rather than resolving back to it | **ported** → ≈ drag.ts (verbatim body; probe re-measures in phase 5) |
| 902 | and dropping a puck back where it started says so | **ported** → drag.test.tsx |
| 904 | both input paths hand the pointer to applyDrop | **ported** → ≈ drag.ts (mouse drop and touch lift both call applyDrop) |
| 906 | a jet line refuses a third body | **ported** → drag.test.tsx |
| 907 | every list cell is an append target | **ported** → drag.test.tsx |
| 912 | overflow crew round-trip on every list prefix | **ported** → ≈ slots.test.ts |
| 926 | there is no headcount label anywhere | skipped — UI — member login, drag-and-drop internals, touch-drag source pins |
| 928 | an overflow slot is addressable and empties cleanly | **ported** → slots.test.ts |
| 936 | touch runs the same applyDrop | **ported** → ≈ drag.ts (verbatim touch state machine) |
| 937 | touch drag is wired to pointer events | **ported** → ≈ drag.ts (verbatim; pointerdown/move/up/cancel attached in initDrag) |
| 940 | mouse pointers are left to native HTML5 dnd | **ported** → ≈ drag.ts (verbatim pointerType==='mouse' bail) |
| 941 | a press-and-hold arms the drag, a quick move does not | **ported** → ≈ drag.ts (verbatim TD_HOLD/TD_SLOP machine) |
| 943 | the page cannot scroll under an armed drag | **ported** → ≈ drag.ts (verbatim touchmove preventDefault, passive:false) |
| 945 | the drag ghost is inert and pinned | skipped — UI — member login, drag-and-drop internals, touch-drag source pins |
| 948 | body.tdrag locks touch-action | skipped — UI — member login, drag-and-drop internals, touch-drag source pins |
| 949 | the tap that ends a drag is eaten | **ported** → ≈ drag.ts (verbatim click-eater with pointerdown retirement) |
| 950 | a cancelled drag leaves nothing behind | **ported** → ≈ drag.ts (verbatim tdClear) |
| 956 | phone board scrolls as one column | skipped — CSS — phone board layout and the roster resize grip |
| 959 | board panes size to their content | skipped — CSS — phone board layout and the roster resize grip |
| 963 | no pane keeps a desktop max-height that would overflow | skipped — CSS — phone board layout and the roster resize grip |
| 965 | the roster is pinned to the bottom on a phone | skipped — CSS — phone board layout and the roster resize grip |
| 968 | the pinned roster still scrolls its own list | skipped — CSS — phone board layout and the roster resize grip |
| 970 | drop bins are unchanged | skipped — CSS — phone board layout and the roster resize grip |
| 972 | the roster has a resize grip | skipped — CSS — phone board layout and the roster resize grip |
| 973 | the grip only exists in the phone layout | skipped — CSS — phone board layout and the roster resize grip |
| 979 | the grip will not scroll the page under the finger | skipped — CSS — phone board layout and the roster resize grip |
| 982 | the height is a variable, so it can be dragged | skipped — CSS — phone board layout and the roster resize grip |
| 984 | it is clamped at both ends | skipped — CSS — phone board layout and the roster resize grip |
| 986 | a double-tap resets it | skipped — CSS — phone board layout and the roster resize grip |
| 987 | the size is re-applied whenever the board opens | skipped — CSS — phone board layout and the roster resize grip |
| 991 | one arrow click = one whole day | skipped — source-text pins — week panning / proxy-scrollbar internals (behaviour proven by probes, phase 5) |
| 993 | the step is measured off the live layout | skipped — source-text pins — week panning / proxy-scrollbar internals (behaviour proven by probes, phase 5) |
| 994 | panning clamps to the day count | skipped — source-text pins — week panning / proxy-scrollbar internals (behaviour proven by probes, phase 5) |
| 995 | the instantaneous scroll lock is gone | skipped — source-text pins — week panning / proxy-scrollbar internals (behaviour proven by probes, phase 5) |
| 1000 | the 260ms ownership lock is gone | **ported** → ≈ pan.ts (the lock never existed in the port; B33 sync ported directly) |
| 1002 | echo counting is gone too | **ported** → ≈ pan.ts (same) |
| 1003 | a mirror write is suppressed only when already in sync | **ported** → pan.test.tsx |
| 1005 | every mirror write goes through hsSet | **ported** → ≈ pan.ts (verbatim wiring) |
| 1010 | hsSet clamps to the real overflow | **ported** → pan.test.tsx |
| 1012 | travel is mapped end to end, not by a width ratio | **ported** → ≈ pan.ts (verbatim formulas) |
| 1014 | the thumb keeps a proportional size | **ported** → ≈ pan.ts (verbatim) |
| 1018 | mirror writes are instant, never CSS-smooth | **ported** → ≈ pan.ts (verbatim hsSet) |
| 1020 | hsSet falls back to a bare write if instant is refused | **ported** → pan.test.tsx |
| 1022 | the week still carries scroll-behavior:smooth for the arrows | **ported** → ≈ scheduler.css + pan.ts (both verbatim) |
| 1024 | the arrows do not claim ownership any more, so the thumb follows the pan | **ported** → ≈ pan.ts (verbatim panDays) |
| 1026 | both arrow pairs share panDays | **ported** → pan.test.tsx |
| 1032 | logout closes the scheduler board | **ported** → board.test.tsx |
| 1034 | only one contextmenu handler survives | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1039 | it is gated on the role AND on Edit mode being on | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1041 | [hidden] beats an author display rule | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1046 | planting a name goes through setSlotVal / fillSlot | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1048 | and so does the palette | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1054 | a delete does not re-mark the address it just deleted | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1062 | and no mark survives on a deleted row | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1073 | adding a wave earns an amendment key | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1077 | and a standalone wave takes its duty block away with it | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1080 | a stale armed slot is put down when its row goes | **ported** → ≈ slots.test.ts (armTargetExists behaviour; disarm wiring is UI) |
| 1083 | and flyRef returns nothing rather than throwing | **ported** → slots.test.ts |
| 1086 | a no-op assignment is not an edit | **ported** → ≈ slots.test.ts (made non-vacuous: pending stays empty) |
| 1092 | esc() closes attributes | skipped — esc is HTML-escaping, a rendering concern (React escapes natively); revisit in phase 4 |
| 1093 | free text is never overwritten by a drop | **ported** → slots.test.ts |
| 1105 | the squadron-wide programme is checked | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1106 | overflow crew become events | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1107 | overflow crew count as busy and tasked | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1108 | a window that crosses midnight is rolled forward | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1110 | an open-ended row still occupies time | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1111 | a hard conflict rings the puck | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1112 | every clash is reported, not just the first | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1113 | an offer to fly is not a clash | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1114 | the published in-time is the report time | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1115 | an IP in either seat satisfies the OCU rule | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1116 | crew rest remembers the last FLYING end | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1117 | leave and downchit bar every commitment | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1118 | a standalone shift is not a sortie | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1119 | every warning still has a known tier and code | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1120 | the sentinel is still silent | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1123 | programme people hold their index | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1125 | whoSet holds blanks, trims only the tail | **ported** → ≈ slots.test.ts (as behaviour) |
| 1126 | a withdrawn appointment invalidates the signature | **ported** → ≈ publish.test.ts (as behaviour) |
| 1127 | publishing a day spends its signature | **ported** → ≈ publish.test.ts |
| 1128 | reopening a day voids it too | **ported** → ≈ publish.test.ts (as behaviour) |
| 1129 | the banner cannot claim nothing is published while ALs exist | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1130 | personal inputs join the undo stack | **ported** → ≈ state/store.test.ts + ui/inputs.test.tsx |
| 1132 | a tap clears its own arm timer | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1136 | no orphaned advisory-bar / paxn / aircrew-roster CSS | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1141 | dead functions removed | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1142 | sanStatus is kept on purpose and still works | **ported** → sans.test.ts |
| 1143 | the conflicting desktop scrollbar block is gone | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1145 | the scroll bar strip is no longer hidden from assistive tech | **ported** → pan.test.tsx |
| 1147 | every select has an accessible name | skipped — B26 audit — source-text pins and UI wiring; the model-level items are ported (see ported column) |
| 1156 | the sign-off scrolls with the board, it is not pinned | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1159 | it is the first thing in the board | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1161 | nothing is left pinned in the top bar | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1162 | it still carries the open day | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1172 | the admin account is a / a | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1173 | and the sign-in hint says so | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1174 | the old admin/admin pair is gone | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1175 | the dropdown and its whole apparatus are gone | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1178 | and its markup went with it | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1179 | its dead styling went too | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1180 | arming and planting exist instead | **ported** → ≈ state/store.test.ts |
| 1182 | the palette is built from one function for both surfaces | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1185 | the board arms on a tap and is still edit-gated | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1188 | a filled puck on the board is left to the ordinary selection | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1190 | the week arms only EMPTY positions | **ported** → ≈ ui/editweek.test.tsx (via routeClick gate) |
| 1192 | the phone gate is gone with the dropdown | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1193 | isPhone survives for the places that still need it | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1194 | dragging still works alongside it | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1197 | the palette is no longer hidden below 820px | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1199 | it parks against the right edge with its tab showing | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1203 | and slides out on body.ros-open | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1205 | the tab only shows on a phone | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1209 | picking a name up out of the drawer parks it for the drag | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1211 | and it slides back out when the drag ends | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1213 | both drag paths tell dndOn where the drag came from | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1215 | the palette is still a bin you can drop back into | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1216 | the tab is in the palette markup | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1218 | tapping the tab toggles the drawer | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1225 | pinch-to-zoom is allowed | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1230 | the palette has a day, and an armed slot pins it | **ported** → ≈ palette-html.ts (verbatim paletteDay) |
| 1232 | panning the week walks the palette along, debounced | **ported** → pan.test.tsx |
| 1234 | an armed slot stops the palette wandering off its day | **ported** → pan.test.tsx |
| 1236 | crew on leave are darkened, not deleted from the list | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1238 | tasked crew are faded, unavailable crew are darkened harder | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1242 | the armed slot is ringed, not merely coloured | skipped — jsdom UI / CSS — board on a phone, palette drawer, arm-and-plant wiring |
| 1250 | the CX button opens a box, it does not toggle silently | **ported** → board.test.tsx |
| 1253 | it asks for a reason under a CX DUE label | **ported** → board.test.tsx |
| 1255 | nothing is cancelled just by opening it | **ported** → board.test.tsx |
| 1257 | it offers the usual reasons | **ported** → board.test.tsx |
| 1258 | Un-cancel is hidden on a line that is not cancelled | **ported** → board.test.tsx |
| 1259 | the action button says what it will do | **ported** → board.test.tsx |
| 1260 | a quick reason fills the field | **ported** → board.test.tsx |
| 1263 | saving cancels the line and keeps the reason | **ported** → board.test.tsx |
| 1267 | the line reads CX DUE <reason> everywhere it is drawn | **ported** → board.test.tsx |
| 1271 | cxText falls back to a plain CX with no reason | **ported** → board.test.tsx |
| 1273 | the change is recorded for the amendment | **ported** → ≈ board.test.tsx (a board field commit earns its pending mark) |
| 1274 | re-clicking CX reopens the box to edit the reason | **ported** → board.test.tsx |
| 1281 | Un-cancel restores the line and drops the reason | **ported** → board.test.tsx |
| 1284 | every dialog outranks the full-screen board | skipped — jsdom UI — the CX reason dialog |
| 1309 | SC keeps its AM and PM shifts | **ported** → waves.test.ts |
| 1314 | AVALON runs overnight and no longer calls its shift MAIN | **ported** → waves.test.ts |
| 1318 | BB still leaves its times blank | **ported** → waves.test.ts |
| 1322 | SC main crews are still cross-checked | **ported** → waves.test.ts |
| 1324 | SC spare crews are not | **ported** → waves.test.ts |
| 1326 | every AVALON line is exempt | **ported** → waves.test.ts |
| 1332 | every standalone line is labelled on screen | skipped — engine (S) — see ported column; the rendered MAIN/SPARE badges are phase-4 UI |
| 1333 | the labels read MAIN and SPARE | skipped — engine (S) — see ported column; the rendered MAIN/SPARE badges are phase-4 UI |
| 1336 | spare badges are marked apart from main | skipped — engine (S) — see ported column; the rendered MAIN/SPARE badges are phase-4 UI |
| 1339 | the day count still counts mains only, once per shift | **ported** → ≈ waves.test.ts (dayCount output, not the badge DOM) |
| 1343 | the badge is a property, not typed into remarks | skipped — engine (S) — see ported column; the rendered MAIN/SPARE badges are phase-4 UI |
| 1349 | both are qual columns | skipped — engine (T·SC currency) — see ported column; QUAL_COLS/source pins are UI |
| 1352 | the window is 07:00 to 19:00 | skipped — engine (T·SC currency) — see ported column; QUAL_COLS/source pins are UI |
| 1353 | a shift inside the window is a day shift | **ported** → waves.test.ts |
| 1355 | a shift reaching outside it is a night shift | **ported** → waves.test.ts |
| 1357 | the boundaries themselves are day | **ported** → waves.test.ts |
| 1359 | SC currency has its own code at hard severity | skipped — engine (T·SC currency) — see ported column; QUAL_COLS/source pins are UI |
| 1361 | it wears the qual chip | skipped — engine (T·SC currency) — see ported column; QUAL_COLS/source pins are UI |
| 1363 | spare crew are checked for currency even though they dodge clashes | skipped — engine (T·SC currency) — see ported column; QUAL_COLS/source pins are UI |
| 1365 | only SC is gated — AVALON and BB are exempt throughout | skipped — engine (T·SC currency) — see ported column; QUAL_COLS/source pins are UI |
| 1375 | the roster holds a day-only and a both-current body | **ported** → validate.test.ts |
| 1379 | an SC wave rendered with slots to fill | skipped — engine (T·SC currency) — see ported column; QUAL_COLS/source pins are UI |
| 1381 | an empty SC raises nothing | **ported** → validate.test.ts |
| 1384 | a both-current body is fine on the day shift | **ported** → validate.test.ts |
| 1386 | a day-current body is fine on the day shift | **ported** → validate.test.ts |
| 1387 | a day-current body is fine on the day shift | **ported** → validate.test.ts |
| 1390 | moving the crew change past 19:00 changes what is required | **ported** → validate.test.ts |
| 1421 | slotRules reads the slot | **ported** → ≈ slotrules.test.ts |
| 1422 | the scheduler is back in edit mode | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1425 | a front seat leaves no WSO selectable | **ported** → ≈ slotrules.test.ts (through slotBar, not the palette DOM) |
| 1427 | the ineligible are darkened, not dropped from the list | **ported** → ≈ ui/editweek.test.tsx (.rpuck.no rendered) |
| 1430 | the palette header says what is being planned | **ported** → ui/editweek.test.tsx |
| 1432 | and the reason is the real one | **ported** → slotrules.test.ts |
| 1434 | a darkened name cannot be planted | **ported** → ≈ state/store.test.ts + ui/editweek.test.tsx |
| 1437 | a name still showing can | **ported** → ≈ ui/editweek.test.tsx |
| 1443 | a rear seat leaves only WSOs and IPs | **ported** → slotrules.test.ts |
| 1444 | a plain pilot is barred from the rear seat | **ported** → slotrules.test.ts |
| 1457 | an SC day shift leaves only SC DAY current crew selectable | **ported** → ≈ slotrules.test.ts |
| 1460 | the rule engine agrees it is a day shift | **ported** → slotrules.test.ts |
| 1463 | pushing the crew change past 19:00 changes who is selectable | **ported** → ≈ slotrules.test.ts |
| 1466 | and the rule engine calls it night | **ported** → slotrules.test.ts |
| 1475 | a board slot exists to arm | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1479 | arming rings the slot | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1482 | the palette says what it is planning | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1484 | the palette lists the squadron | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1487 | nobody ineligible is left selectable | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1489 | everyone darkened has a reason | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1490 | and the reason rides on the puck for a tap to report | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1492 | a darkened name does not plant | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1495 | and the slot stays armed after a refusal | **ported** → ≈ ui/editweek.test.tsx |
| 1497 | a name still showing plants on the first tap | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1499 | planting puts the slot down again | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1500 | tapping the same slot twice disarms it | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1503 | Escape disarms | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1509 | an append cell can be armed too | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1513 | an append key routes to fillSlot | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1518 | the bar checks leave and downchit for that day | **ported** → ≈ slotrules.test.ts (as behaviour) |
| 1520 | and reports which it was | **ported** → ≈ slotrules.test.ts + leave.test.ts (offWord behaviour) |
| 1523 | the three leave types replace the single Leave | **ported** → ≈ leave.test.ts (against INPUT_TYPES) |
| 1525 | LL is local, OL is overseas, OIL is off in lieu | **ported** → ≈ leave.test.ts (against LEAVE_TYPES) |
| 1527 | all three read as leave, none of them as anything else | **ported** → leave.test.ts |
| 1530 | LL and OIL keep the man on the island, OL does not | **ported** → leave.test.ts |
| 1532 | and a downchit is still its own thing | **ported** → leave.test.ts |
| 1534 | the engine reads the three types, not the word Leave | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1538 | the day-off set and the Leave block read all three | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1542 | a spare post forgives LL and OIL but not OL or a downchit | **ported** → ≈ slotrules.test.ts (as behaviour) |
| 1545 | the roster really does carry leave to test against | **ported** → leave.test.ts |
| 1552 | a duty slot has no seat rule but still darkens leave | **ported** → ≈ slotrules.test.ts |
| 1557 | a toast raised from the board is visible above it | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1559 | barDrop exists and reads the same rule as the picker | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1561 | every drop path runs it | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1562 | an append key is normalised before the rule is read | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1564 | the warning is a toast, not a refusal | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1566 | toast understands a warning kind | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1567 | a warning toast lingers longer than a plain one | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1569 | an SC shift inside 0700-1900 is a day shift | **ported** → waves.test.ts |
| 1570 | anything outside it is a night shift | **ported** → waves.test.ts |
| 1572 | the shift decides which currency the picker demands | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1574 | the palette header names the currency it is demanding | skipped — engine (U·slotRules/slotBar) — see ported column; the palette DOM, armSlot/placeArmed and toast wiring are phase-3/4 UI |
| 1584 | the un-click test is the name alone, not the name plus a warning | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1586 | the pieces of a selection are named | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1589 | a first click remembers what was on screen | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1591 | and the second click puts it back | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1593 | selClear leaves a warning focus alone, selDrop takes it too | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1596 | clearOtherHL uses the narrow one — its callers set WFOCUS first | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1603 | the roster has someone carrying no warning | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1607 | clicking them selects every puck of theirs | **ported** → ≈ ui/interact.test.tsx |
| 1610 | clicking the same puck again un-clicks them | **ported** → ≈ ui/interact.test.tsx |
| 1613 | a delete is caught by counting, so every delete path is covered | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1615 | the count walks every place a person can be written | **ported** → ≈ avail.test.ts (as behaviour) |
| 1620 | an edit-week puck exists to delete | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1625 | it is selected before the delete | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1627 | deleting it un-clicks everybody | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1630 | blank space clears on all three surfaces, board included | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1632 | and it disarms an armed slot at the same time | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1634 | the exclusion list still protects everything you can click | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1636 | the board repaints after a blank-space clear | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1642 | clicking the week background un-clicks everybody | **ported** → ui/interact.test.tsx |
| 1645 | changing who you are viewing as drops the selection too | skipped — UI selection state (SELID/WFOCUS et al) — phase 3/4; personCount behaviour is ported |
| 1655 | a standalone line takes its own hours, unpadded | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1660 | and it is filed as a shift, not a sortie | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1661 | every other commitment names its kind too | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1664 | a cockpit or a duty post beats a shift; ground and programme only advise | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1667 | the advisory has its own code and wording | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1668 | sortie-vs-sortie is still the tight-turn rule's business | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1670 | the long-day span uses the shift hours as written | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1672 | an SC spare is standing by, not tasked | **ported** → ≈ avail.test.ts (dayStandby/dayEngaged behaviour) |
| 1675 | the palette tells standby, tasked and barred apart by KIND of mark | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1683 | and no board-only override sneaks the old fade back in | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1685 | and every puck says which it is | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1689 | a shift ends the previous day for rest, with no debrief tail | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1692 | and a shift's own start IS its report time — no 3h lead, no brief lead | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1695 | today's shifts are checked for rest, not just today's sorties | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1698 | the breach reads differently for a shift than for a sortie | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1700 | validate publishes when rest expires, per day per person | **ported** → ≈ validate.test.ts (as behaviour) |
| 1702 | and the picker closes an SC MAIN slot to anyone not yet clear | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1704 | slotRules carries the shift start for that check | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1708 | an ordinary flying seat carries no shift start, so no rest bar | **ported** → slotrules.test.ts |
| 1713 | a spare slot is marked as one, so the picker can tell | **ported** → ≈ slotrules.test.ts (as behaviour) |
| 1715 | and a spare carries no crew-rest bar — the shift buys him none | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1717 | and a spare is never barred by what else he is doing — he may still fly | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1719 | but a spare still needs the currency for that shift | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1722 | SHIFT_SOFT marks an A, not the conflict C | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1724 | A prints as A and is ranked below the hard flags | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1726 | A is amber, and draws no red box round the puck | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1730 | A carries its own label and sits in the legend | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1735 | exactly twelve hours is clear, not a breach | skipped — engine (X·shift) — behavioural parts ported; the rest are source-text pins on collectEvents/validate internals already held by the parity test |
| 1744 | the AM shift is read as 07:00-13:00 | **ported** → validate.test.ts |
| 1745 | the PM shift is read as 13:00-19:00 | **ported** → validate.test.ts |
| 1746 | so the two abut and do not overlap | **ported** → validate.test.ts |
| 1752 | a bare AAR is day by default and night by the clock | **ported** → aar.test.ts |
| 1753 | an untagged remark belongs to the front seat | **ported** → aar.test.ts |
| 1754 | DAAR and NAAR are taken literally | **ported** → aar.test.ts |
| 1755 | NO AAR / NO DAAR / NO NAAR ask for nothing | **ported** → aar.test.ts |
| 1757 | a rear-seat tag is ignored outright | **ported** → aar.test.ts |
| 1759 | a front-seat tag later in the line still counts | **ported** → aar.test.ts |
| 1760 | a negation does not swallow a real requirement after it | **ported** → aar.test.ts |
| 1761 | remarks with no AAR in them ask for nothing | **ported** → aar.test.ts |
| 1763 | the digit is ignored — only the letter is read | **ported** → aar.test.ts |
| 1765 | DAAR and NAAR are qual columns | **ported** → ≈ ui/quals.test.tsx |
| 1768 | AAR is front seat only | skipped — engine (V·AAR) — see ported column; quals-page tick wiring is UI |
| 1769 | NAAR cannot be ticked before DAAR | **ported** → ≈ ui/quals.test.tsx (as behaviour) |
| 1770 | removing DAAR removes NAAR with it | **ported** → ≈ ui/quals.test.tsx (as behaviour) |
| 1771 | the invariant holds across the whole roster | **ported** → ≈ aar.test.ts (over PEOPLE, not palette DOM) |
| 1775 | no WSO holds AAR currency | **ported** → ≈ aar.test.ts (made non-vacuous) |
| 1779 | AAR has its own code at hard severity | skipped — engine (V·AAR) — see ported column; quals-page tick wiring is UI |
| 1780 | it wears the qual chip | skipped — engine (V·AAR) — see ported column; quals-page tick wiring is UI |
| 1781 | only the front seat is checked | skipped — engine (V·AAR) — see ported column; quals-page tick wiring is UI |
| 1782 | night is the wave OR the sortie running past 19:00 | skipped — engine (V·AAR) — see ported column; quals-page tick wiring is UI |
| 1784 | the picker bars a pilot who is not current | skipped — engine (V·AAR) — see ported column; quals-page tick wiring is UI |
| 1785 | and the palette carries the reason on the puck | skipped — engine (V·AAR) — see ported column; quals-page tick wiring is UI |
| 1794 | the Logic page exists and is reachable from both navs | **ported** → ≈ ui/logic.test.tsx (drawer nav is a later surface) |
| 1798 | and it renders every group and rule | **ported** → ui/logic.test.tsx |
| 1802 | it is read-only — nothing but the search box takes input | **ported** → ui/logic.test.tsx |
| 1804 | the thresholds are read from the live VCONF, not copied | **ported** → ui/logic.test.tsx |
| 1811 | the clash matrix is read from SHIFT_HARD | **ported** → ui/logic.test.tsx |
| 1819 | the flag order is read from RANK, at module scope now | **ported** → ≈ rules.test.ts (RANK values; module-scope is true by construction) |
| 1823 | the leave taxonomy is read from LEAVE_TYPES | **ported** → ui/logic.test.tsx |
| 1831 | every SETTING the engine carries is documented | **ported** → ui/logic.test.tsx |
| 1837 | and the guard actually bites — an undocumented setting fails it | skipped — Logic-tab UI (jsdom evals over the rendered page); the engine rules behind it are ported to rules.test.ts |
| 1842 | every EVENT KIND the engine produces is documented | skipped — Logic-tab UI (jsdom evals over the rendered page); the engine rules behind it are ported to rules.test.ts |
| 1849 | every warning code the engine can raise is documented | **ported** → ui/logic.test.tsx |
| 1855 | the firing counts come from the live WARN | **ported** → ui/logic.test.tsx |
| 1859 | search narrows the list and clears back | **ported** → ui/logic.test.tsx |
| 1867 | the squadron standard is captured before anything can touch it | **ported** → rules.test.ts |
| 1869 | every editable setting is bounded and named | **ported** → rules.test.ts |
| 1873 | and every VCONF setting is editable — none is stranded | **ported** → rules.test.ts |
| 1875 | a change reaches the ENGINE, not just the page | **ported** → rules.test.ts |
| 1880 | a value outside its bounds is refused | **ported** → ≈ rules.test.ts (parse + bounds; the refusal wiring is UI) |
| 1885 | the formats a scheduler would type all parse | **ported** → rules.test.ts |
| 1889 | only what differs from standard is stored | **ported** → ≈ rules.test.ts (ruleOff/rulesOffCount behaviour) |
| 1891 | reset restores the standard exactly | **ported** → rules.test.ts |
| 1894 | editing is admin-only, in the UI and in the handler | **ported** → ≈ ui/logic.test.tsx (as behaviour) |
| 1898 | a modified rule set is never silent | **ported** → ≈ ui/logic.test.tsx (page-rules-off stamp) |
| 1901 | a sentence quoting a threshold quotes the live one | **ported** → ≈ ui/logic.test.tsx (10h/12h swap) |
| 1906 | the Inputs person filter is called Personnel, not All flights | **ported** → ≈ ui/inputs.test.tsx |
| 1909 | a squadron member sees it too | skipped — Logic-tab UI (jsdom evals over the rendered page); the engine rules behind it are ported to rules.test.ts |
| 1920 | a hole in a programme row renders nothing at all | skipped — source-text pins — B49 drag internals, toast hit-test, click-eater |
| 1922 | the toast cannot take the hit test | skipped — source-text pins — B49 drag internals, toast hit-test, click-eater |
| 1923 | a wobble restarts the hold instead of killing the gesture | skipped — source-text pins — B49 drag internals, toast hit-test, click-eater |
| 1927 | a drop anywhere on a list row resolves to that row | skipped — source-text pins — B49 drag internals, toast hit-test, click-eater |
| 1929 | the click-eater is retired on the next pointerdown | skipped — source-text pins — B49 drag internals, toast hit-test, click-eater |
| 1932 | the phone aircrew drawer stays fixed through a drag | skipped — source-text pins — B49 drag internals, toast hit-test, click-eater |
| 1935 | the proxy scrollbar is inert only while dragging | skipped — source-text pins — B49 drag internals, toast hit-test, click-eater |
| 1937 | a per-day AL takes only that day's keys | **ported** → ≈ publish.test.ts (as behaviour) |
| 1948 | winOverlap is gone — one frame, plain overlap | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1950 | and a night shift looks at tomorrow explicitly | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1952 | a fly event now carries its brief time, so NO_BRIEF can fire | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1954 | an offer is tested before the conflict marks go on | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1956 | a sim row is built through win(), and counts its extras | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1960 | crew rest is measured off the rest-bearing end only | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1963 | one man twice on a row is one event | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1965 | slotRules reads a sim seat | **ported** → ≈ slotrules.test.ts (as behaviour) |
| 1966 | barDrop revalidates before it judges | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1967 | the free count ranks men on leave as unavailable | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1969 | reflow redraws the Inputs table | **ported** → ≈ ui/inputs.test.tsx (as behaviour) |
| 1970 | a traffic edit goes through the amendment funnel | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1972 | shiftKeys exists and every splice calls it | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1980 | and it drops the deleted row, shifts the rest, leaves the earlier ones | **ported** → keys.test.ts |
| 1989 | undo puts down an armed slot | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 1990 | changing the board day disarms a slot on another day | skipped — B48 — source-text pins; shiftKeys renumbering and flyRef safety are ported |
| 2002 | #5 a live rule field asks the role, not just the flag | skipped — B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI |
| 2006 | #5 and the flag is dropped on both edges of a session | skipped — B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI |
| 2008 | #5 a member never renders an editable field | **ported** → ≈ ui/logic.test.tsx |
| 2015 | #6 the stamp is set by renderStatus, not only by the Logic page | skipped — B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI |
| 2017 | #6 and it appears without ever opening Logic | **ported** → ≈ ui/logic.test.tsx (body class from rulesOffCount) |
| 2024 | #7 chip and code labels quote the live threshold | skipped — B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI |
| 2029 | #7 an edited crew rest changes what the label says | **ported** → rules.test.ts |
| 2033 | #7 the CREW_TIGHT message does too | skipped — B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI |
| 2037 | #8 offers are excluded from the brief and debrief windows | **ported** → ≈ validate.test.ts + leave.test.ts (isOffer behaviour) |
| 2042 | #8 an offer adds nothing where a meeting would | **ported** → validate.test.ts |
| 2060 | #9 double turning is described at two sorties, with no span test | skipped — B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI |
| 2062 | #23 the brief is pinned to take-off, not to the in-time | skipped — B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI |
| 2067 | #10 spare crew are kept, not discarded, at collect time | skipped — B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI |
| 2069 | #10 and OIL still leaves the spare slot open | **ported** → ≈ validate.test.ts + slotrules.test.ts (as behaviour) |
| 2073 | #11 the turn rule takes the larger of threshold and dekit+step | skipped — B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI |
| 2077 | #11 and the Logic sentence no longer claims one derives the other | skipped — B53 audit — engine parts ported (see ported column); session/edit-mode/Logic-page items are UI |
| 2082 | #14 the issue stamps its own day list and item count | **ported** → ≈ publish.test.ts (as behaviour) |
| 2085 | #14 a delete cannot shrink an amendment that already went out | **ported** → publish.test.ts |
| 2093 | #17 right-click obeys the Edit-mode switch | **ported** → ≈ ui/editweek.test.tsx (as behaviour) |
| 2097 | #19 the repaint remembers where the finger was going | **ported** → ≈ ui/LogicPage.tsx (LGNEXT restore, post-commit) |
| 2102 | #22 a stored rule must be a number inside its own bounds | **ported** → ≈ rules.test.ts (as behaviour) |
| 2106 | #22 a hand-edited string never reaches VCONF | **ported** → rules.test.ts |
| 2122 | a day’s markup is a pure function, extracted from the week loop | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2128 | and it touches no DOM of its own | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2135 | only the days whose markup changed are written | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2138 | the fallback covers shape, mode, a missing section and a foreign child | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2142 | both paths hold the week’s scroll position | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2145 | a swapped day keeps its own per-wave offsets, by index, phone only | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2148 | renderSchedule cannot re-enter itself, and never queues past a throw | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2154 | weekDirty forces one day, or drops the cache when it cannot say which | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2158 | and the sentinel can never collide with real markup | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2160 | the cache is replaced wholesale each pass, so no sentinel survives it | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2164 | identical markup is never written back over itself | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2170 | nothing writes a week or a board panel raw any more | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2174 | every edit-week repaint asks the Edit-mode switch | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2181 | a drifted inline field is healed from the model, in place | **ported** → ≈ ui/textedit.test.tsx (as behaviour) |
| 2189 | AREA and TIME derive from ONE builder each, used by both surfaces | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2194 | clearing a derived AREA cell does not blank it behind the renderer | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2203 | the text-domain time formatter does not double-escape | **ported** → ≈ ui/textedit.test.tsx (fmtTxt path) |
| 2207 | an inner comparison survives esc/serialiser disagreement | **ported** → ≈ ui/textedit.ts (sameInner verbatim) |
| 2214 | the repair never re-renders inside focusout | **ported** → ≈ ui/textedit.ts (deferred txtCommit + editingText guard) |
| 2217 | in-times has ONE builder, shared by the renderer and the repair | **ported** → ≈ ui/textedit.ts (intimesInner shared) |
| 2221 | Enter commits in the sim-notes block too, since a break never survived | **ported** → ≈ ui/textedit.test.tsx (as behaviour) |
| 2226 | a one-day edit rewrites exactly one section | skipped — B54 per-day string-diff redraw — the mechanism React's reconciler replaces; its guarantees return as probes in phases 4–5 |
| 2247 | the programme row’s name cell breaks a long token | skipped — CSS text-wrapping contract (B55) — phase 4; probes/wrap.js measures the behaviour |
| 2250 | its sub-line and the EP/ORDERS notes do too | skipped — CSS text-wrapping contract (B55) — phase 4; probes/wrap.js measures the behaviour |
| 2252 | every inline text cell does, wherever it appears | skipped — CSS text-wrapping contract (B55) — phase 4; probes/wrap.js measures the behaviour |
| 2254 | and the people cells can shrink to their track | skipped — CSS text-wrapping contract (B55) — phase 4; probes/wrap.js measures the behaviour |
| 2258 | the list row’s name cell kept the treatment it already had | skipped — CSS text-wrapping contract (B55) — phase 4; probes/wrap.js measures the behaviour |
| 2260 | a puck name is untouched — it still ellipsises on one line | skipped — CSS text-wrapping contract (B55) — phase 4; probes/wrap.js measures the behaviour |

Totals: 341 labels ported (some cover several tfin result lines), 382 skipped.
