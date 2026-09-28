# Evidence — `[HIST-PHONE-HIDE]` + `[CHG-BY-ITEM]`: History on a phone, and the changes window sorted by item (28 Sep 26)

Branch `claude/hist-phone-by-item`, cut from `main` at PR #453's merge. The plan:
`docs/superpowers/plans/2026-09-28-hist-phone-by-item-plan.md` (§9 — the red team's findings and what was done with each);
Astra's plan read kept whole: `docs/superpowers/specs/2026-09-28-hist-phone-by-item-plan-review-astra.md`.

## 1. The tier (bug-check order §5) — FULL

1 money — no · 2 published record — no (To go out untouched; an issued AL tag and a dot share a detail — walked) · **3 saved
data — YES** (two writers now store the man on a posting line and a roster add — `sub`, `fld`; the window reads the durable
history a new way) · **4 a shared drawer — YES** (the dot on every detail every builder draws) · **5 a new gesture or
mode — YES** (Hide / Show, Group by Item, the folds) · 6 a new surface — the hint strip · 7 roles — no · 8 warnings — no.
Raised from WALK to FULL by Astra's plan read (08). **FULL:** the rules sweep (§2), the scenario design by the two other
models (their plan reads — failure scenarios, and Astra's twelve action orders, §5), the roll-call and door check (§3,
§4), the walk at both widths (§5), break tests (§6), both models reading the finished code with this sheet (§8), the
re-walk of what their fixes touch, then his look (§10).

## 2. The rulings swept

D345 (both mock-ups approved, with their calls), D344 (the hint's words), D339 (History on a phone), D340 (sort by item,
item-first; narrows D168), D92 (a tag, never a ring), D116 / D338 (3) (History = the window open, on the board and the
edit week), D119 (newest first), D167 (the window; (2) the phone bar; (4) folds — narrowed by D345, marked), D168, D169 /
D211 (members read it), D170 (new to you), D171 (the doors), D172 (the OG tag), D263 (every absence change is a line),
D56 (demo data is not a finding), D201 (fix what an old rule left behind — done: `ui-contracts.md`, `feature-impact.md`,
`file-map.md`, `editlog.ts`'s field notes, `docs/mock/changes-window.html` §C, D167's row), the 2 Sep 26 rule (a control
tapped repeatedly must not move), the 11 Aug 26 rule (a change always says its date — every sub-line carries who · d/m hh:mm).
**Clashes found:** D345's "every group open by default" against D167 (4)'s "new opens, the rest fold" — the later word
applied to Item and Who (Astra 06), marked on D167's row, on his look card.

## 3. The roll-call — every place the THING is drawn

**The gold dot** (a detail with a history, while History is on):

| Where | Shows the dot | Answers the bubble | Painted over / beside it |
|---|---|---|---|
| Edit week — a seat (flying, duty desk, programme crowd, sim) | YES — outside its bottom-right corner (walk H4, both widths) | YES (H6) | OG tag top-right (H5), AL tag top-right; the dot never under the bar (H5 hit test) |
| Edit week — a text detail with text (time, label, remark, area, area time) | YES — outside its corner (H4; inside it covered the last character — fixed on the walk) | YES | an issued AL tag (its `::after`) and the dot together (H14) |
| Edit week — an EMPTY text detail | YES — inside its corner (no text to cover) | YES | the "—" placeholder (its `::before`, `:empty` only) |
| Edit week — an Unavailable / Personal Inputs row | YES — inside its corner (H4 "leave") | YES — the input's lines on that day (unit) | — |
| Board — seats, the empty seat (`.sb-slot`), typed boxes (inputs, textareas) | YES (H15) — typed boxes inside the corner | YES | the board's AL outline on a typed box |
| Board — the wave-title box | YES (H15) — inside its corner | YES (H15 — "1st wave → 2nd wave") | its own chooser arrow |
| Board — a look at a published version (`.pv-frozen`) | MUST NOT — a document, not your history (H16: 0 dots) | MUST NOT (H16: no bubble) | — |
| Edit week — a saved-plan / version look (`.preview`) | MUST NOT — draws no addressable cells at all (checked: `ted` with `ed` false); the pass skips `.preview` anyway | MUST NOT (unit — a look answers nothing) | — |
| View-only Sched | MUST NOT — no bubble is wired there (D338 (3)); H22: 0 dots | no | — |
| The next-week peek | MUST NOT — its seats carry no key (`peek.ts`) | no | — |
| The palettes, the ALL AVAIL window's pucks | MUST NOT — not a place in the day (no `data-slot`) | no | — |
| A drag ghost | MUST NOT — the lift veil owns a ghost's `::before` (`lift-css.test.ts` names the one seat rule, kept off ghosts) | — | — |
| The traffic (typed in a pop-up) | no — no cell anywhere; listed, not a button (as before) | no | — |

**The window** (grouping, words, the bar): New to you, All changes, a day, the week (H2, H8, H10), Who (H11), a member
(H22), a move between two desks (H9 — under both, one change), a move within one line (H8 — one entry, "#1 RCP → #2 RCP"),
an input (H2 "Input · Ranger · LL"), a publish and the sign-offs ("The day"), a wave title (H2 "Wave · WAVE 2"). Quals,
a posting and a roster add — by unit test (`changesmodel.test.ts`, `changelines*.test.ts`), not walked (§9).

## 4. The door check

| Action | Its door | Walked |
|---|---|---|
| Hide the panel (phone) | "Hide ▾" in the header | H3, H7, H18 |
| Bring it back | the bar's "History on · N changes · Show ▴" | H7, H13 |
| History off | ✕ on the panel / the bar; the board's History button; the admin's clock | H18 |
| See a detail's story | tap (phone) / hover (desktop) a dotted detail | H6, H15 |
| Group by Item / Who | the two buttons | H2, H11 |
| Fold / unfold a group | its caret header | H12 |
| Go to a change | a line or sub-line; a move's two entries each to its own place | H13 (unit: each entry's place) |
| Mark all as seen | its button (dots stay, new marks go) | H17 |

## 5. The walk — both widths, the production build

`scripts/handpass/hp-walk.mjs` against a local build (port 4212), one world per run built through the app (Saber publishes
Monday on the board; Hex, given the admin role in place, changes Tuesday and a Monday remark Saber then issues as AL1;
Ranger files his leave; Saber and Ranger look). Every step an assertion — re-running it is the re-walk.
**Desktop 1440×900: 22/22 PASS. Phone 390×844: 24/24 PASS. No console errors.** Pictures: `docs/img/handpass/2026-09-28-hist-phone-by-item/walk-desktop/`, `…/walk-phone/`.

**Astra's twelve orders, walked:** (1) open → Hide → Show → close: H3, H7, H18 · (2) the bar at the bottom after a drag:
the stylesheet's place, unit + H7 · (3) a tap on a line → the bar → Show: H13 · (4) Mark all as seen — OG and new go,
dots stay: H17 · (5) Edit Schedule ↔ the board: H15 · (6) a row reordered — NOT walked (§9) · (7) a look → no dots →
back to live: H16 · (8) an issued AL and a dot on one detail: H14 · (9) a week change while hidden: H21 · (10) ALL AVAIL
before / after hiding: H20 (walk), both orders in `e2e/changeswin.spec.ts` · (11) a reload: H19 · (12) a member from a
day chip: H22; the admin's clock: H2; the board's button: unit.

**What the walk found (both fixed, re-walked):** (a) a dot drawn INSIDE a text detail's corner covered its last character
("05:5●", "1300-14●0" — both widths): a text detail with text now takes the dot outside its corner, like a seat; (b)
closing History left dots on the SHUT board's details (invisible; gone when it reopened): History off now clears every
dot at once. And four fixture slips in the walk script itself (not the app), corrected.

**Looked at:** the phone edit week with the dots (03), the window grouped by Item with the hint and Hide (02), the
formation group with its seats and the one "moved" entry (06), the bar (05), the board with the wave title's bubble
(desktop 10), the member's View-only (16).

## 6. Break tests (`scripts/handpass/hp-breaks.py`) — every wire broken once, its test red

B1 the edit week's pass · B2 the board's pass · B3 an input row's story · B4 a look answers nothing · B5 the wave-title
box is a cell · B6 the pass skips a look · B7 Hide is not the grip · B8 the hint where a tap raises a bubble · B9 every
group open · B10 a posting keeps its man · B11 a roster add keeps its man · B12 a move within one item is one entry —
**all 12 RED** (unit). B13 the seat dot painted · B14 a text detail's dot painted outside · B15 the hidden bar over the
ALL AVAIL window — **all 3 RED** (a real browser). Each file put back byte for byte.

## 7. Tests, red first

`changesmodel.test.ts` (the item table, identity by row and day, the groups, the words, a move under both, within one,
postings and roster adds, the week view's day, Who item-first — red before the model), `histbubble.test.tsx` (the dots =
the bubble's own answer on both surfaces; a look; Hide / Show / the hint / the bar's words on a phone and not on a
desktop; View-only's bar; Item / Who; the wave title and an input row answering; Hide never starts a drag — red before
the code), `changelines.test.ts` / `changelines-lw.test.ts` (the two writers — red first), `e2e/changeswin.spec.ts` (the
dot as PAINTED on a seat and a text detail; an issued AL tag beside a dot; the phone's Hide, bar and Show; the bar over
the ALL AVAIL window in both orders; Item as drawn). Three older tests updated to the new design, each saying why:
`amendbatch-app.test.tsx` (the move is under both desks — it picks the desk's own group), `audit-a-hist.test.tsx` (the
wave title is now a jump target — Astra 02), `histlist.test.tsx` (the detail reads "Area"); `lift-css.test.ts` (the one
seat `::before` this adds, kept off ghosts). The old walk `dp-walk.mjs` A6, A7, A10 rewritten (Fable F6).

## 8. The final reads (Fable and Astra, blind to each other, with this sheet)

(to be filled)

## 9. Not walked, and why

- **A row reordered with a dotted detail (Astra's order 6).** The dot is found by the same row-anchored translation the
  OG tag uses (`ridKey` at the cell, `histbubble.ts`), whose "follows its row" is pinned for the OG tag (Fable P1,
  `[DRAFT-PENDING]`); the item's identity by row is pinned in `changesmodel.test.ts`. Not driven through a row drag here.
- **Quals, a posting, a roster add in the window** — pinned at the writers and the model (unit), not walked: they need the
  Quals page and the Leave War's posting sheet, whose own walks are theirs.
- **Safari / a real iPhone** — the dot is a pseudo-element and a background image (no engine-specific event); the phone
  bar's place is the stylesheet's. For his look.

## 10. Gates

(to be filled from the run on the final code)
