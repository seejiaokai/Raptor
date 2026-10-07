# Stack read D1 — the look-only half of the workflow UI pass (Codex) — Opus 5.5, 5 Oct 26

Read-only. Branch `claude/codex-stack-review`, app code at `bcc69fc8`, against `main` `de470db5`. Nothing edited, built,
tested or served. The only commands run were read-only `git` and shell reads, and three small Node scripts kept in the
session's temp folder outside the repo (they read the parts and the existing `dist/`, and write nothing).

Pieces: (1) the stylesheet split `1733098c`; (2) the phone board's Desktop layout repair `063806c7`; (3) the tapered
wing, the Logic search and the Insights cross `7f0b78bf`. For (c) of piece 1, also every later stylesheet change in the
stack (`2f7ad9b1`, `11a5e7fd`, `c8d006eb`, `78772e58`, `bcc69fc8`) and the two merges before the split.

**Count of MISSING cells: 0.** One cell is UNSETTLED BY READING (the board's failed-save band in the phone's Desktop
layout — Lead 1).

---

## 1. Roll-call

### 1a. The split — the parts and the entry points

**The thing:** the one cascade every screen is painted from. It attaches to: the 22 part files, the one index file that
orders them, every place that loads the stylesheet, and every place that reads its text.

**(a) Is the concatenation byte-identical?** YES — re-done here, independently of Codex's script:
- old file: `git show 1733098c^:raptor-port/src/ui/scheduler.css` → 506,840 bytes, 6,717 lines, SHA-256 `0c16a9f0…f26fec`;
- the 22 parts at `1733098c`, concatenated in the order the index at `1733098c` imports them, no separator → 506,840
  bytes, 6,717 lines, the same SHA-256; `cmp` reports no difference.
- each part, as it stands now: braces balanced (ends at depth 0, never below 0), no unterminated comment or string, ends
  with a newline, holds no `@import`, `@charset`, `@namespace` or `@layer` (one `@supports` in part 02, whole).

**How Codex proved it, and whether that is sound.**
- *Source* (`scripts/handpass/css-split-preservation.mjs extract`): reads the committed blob of the merge `0804877c`,
  asserts its hash, cuts 22 byte ranges at line starts (never text-serialised), asserts each range's first 150 bytes
  hold its anchor, writes the parts, then asserts `Buffer.concat(parts)` deep-equals the original; hashes and ranges
  recorded in `docs/handpass/css-split/preservation/source-equality.json`. **Sound** — and reproduced above.
- *Built stylesheet* (`… compare`): compares the sorted SHA-256 list of the four built stylesheets in `dist/assets`
  before and after. The logic is sound, **with one gap: the script cannot tell a fresh build from a stale `dist/`** — if
  nobody had rebuilt after the cut, it would pass vacuously. Two things close the gap: (i) the retained gate log
  `docs/handpass/css-split/gates/gate-build.log`, a build run on the split, lists `index-CXdqUrrO.css 218.74 kB` — the
  same content-hashed name and size as the pre-split capture (a content hash cannot repeat by accident); (ii) my own
  check of the `dist/` on disk today (built 18:44, `index-OBFpK7qX.css`): 817 class names that occur in exactly one
  part were located in the built file — every one present, and every part's names sit wholly after the previous
  part's (no overlap, no part missing). I did not rebuild (not allowed); (ii) is on whatever tree that `dist/` was
  built from, which I cannot name.
- *Computed styles* (91 states, zero differences) is a sample of the running app — extra, not the proof.

| # | Place | Gets ALL of the sheet, in order? | Can it load another order, or only some? | What else rides on it |
|---|---|---|---|---|
| 1 | `src/ui/scheduler.css` — the index (a comment + 22 `@import` lines) | YES — the order of the 22 lines IS the cascade; identical now to `1733098c` | NO — nothing else is allowed in the file (`schedulerParts` throws on any other text, a duplicate, a missing, an unlisted or a reordered line; `scheduler-css-order.test.ts`, 5 negative cases) | the only file production imports |
| 2 | The 22 parts `src/ui/scheduler/00…21-*.css` | YES — byte-identical in sequence to the old file (above) | NO — the order test compares the folder's listing to the fixed list, so a stray or missing part fails | 5 parts changed later (01, 09, 13, 17, 21) — §1b |
| 3 | The app — `src/main.tsx` line 3, the first style import | YES — imports the index once (pinned by the order test) | NO — Vite inlines `@import` in place; native `@import` is ordered by definition; no non-test source imports a part (pinned) | sign-in, the guest page, every tab |
| 4 | The Leave War (lazy page, own sheets) | YES — it never imported the scheduler sheet; it gets it from the page, as before | NO change — its own built sheet is byte-identical before/after (hash in `compiled-equality.json`) | loads after the main sheet, as before |
| 5 | The Tracker's wrapper `TrackerPage.tsx` (lazy, `tracker.css`) | YES — same as 4 | NO change — built sheet byte-identical | rules are nested under `#page-tracker` in the built file (checked: `#page-tracker .savestat…`) |
| 6 | Other lazy chunk (`idle-*.css`) and `postout.css` (Quals, Users, Welcome back, Leave War pickers) | YES — untouched by the split | NO change — `idle` hash identical | — |
| 7 | `index.html` | NO, because it links no stylesheet; only a comment names the file | — | — |
| 8 | Unit-test helper `src/testing/scheduler-css.ts` (`readSchedulerCss`) | YES — reads the index, validates it against the fixed list, joins the parts with no separator: the same string the ten tests read before | NO — throws rather than read a partial or reordered set | 10 readers migrated: `amendretest`, `caltouch`, `css-invalidation`, `drawerlock`, `flagglow-css`, `layers`, `lift-css`, `modal-phone-height`, `topbar-css`, `tracker/trk-palette` — no other test reads the file's text (searched `src`, `e2e`, `scripts`, `probes`) |
| 9 | Browser tests `e2e/*.ts`, `scripts/tracker/smoke.mjs`, the probes | YES — they drive the built bundle; none reads the stylesheet's text (the names in `geometry.spec.ts` / `leavewar.spec.ts` are comments) | NO | — |
| 10 | Vitest runs | NO, because unit tests never load the stylesheet (they read its text through 8) | — | so no unit test can see the BUILT order — only 3's two pins and the browser gates can |
| 11 | CI path filters, `docsize`, `rulecheck` | NO, because none names the stylesheet (searched) — a part is under `src/`, so a change to one runs every gate | — | — |
| 12 | Older one-off evidence scripts | NO — two still aim at what was there before (see "Left-behind helpers", §5) | — | not gates |

**(b) Where the order is fixed:** in ONE place, the index file's 22 lines; the fixed list in the test helper is a second
copy the order test holds equal to it. A bundler cannot reorder it (in-place inlining; and if a future toolchain left
the `@import`s un-inlined the browser would still apply them in order). A lazy chunk cannot load some parts (no chunk
imports any). Nothing guards WHICH part a future rule is added to — that is §1b's question for this stack.

### 1b. Every stylesheet rule added or changed AFTER the split (and the merges before it)

**The two merges (`e0764c1e` Rally, `0804877c` Discard) are BEFORE the split** (both are ancestors of `1733098c`; the
split's baseline IS `0804877c`). What the stack had changed in the one file by then, against `main`: Rally's
`.lgcell-text…` (now in part 01) and `.intimes .reporting-feedback` (part 04); the pop-up height rules `.modal-box`
(part 08, D536/D537); `.sb-go-h` wrap (part 10); the Insights block (part 21). Discard added no rule. **All of these sit
exactly where they sat in the one file — the split moved bytes, not order — so no cascade difference is possible.**

After the split, 5 parts changed. Specificity is written (ids, classes, elements). "Same result in one file" = the rule
would have had the same winner had the file never been split.

| # | Commit · part | Rule (added / changed) | Spec. | Everything else, in ANY part, that matches the same element for the same property with equal or higher specificity | Same result in one file? |
|---|---|---|---|---|---|
| 1 | `063806c7` · 13 | `.schedboard.sb-wide .sb-boardwrap` + `display:flex` | 0,3,0 | Lower: `.sb-boardwrap{display:flex}` (part 10); `@media ≤820 .sb-boardwrap{display:contents}` (part 13, earlier). Equal: `.schedboard:not(.sb-wide) .sb-boardwrap` (part 10) — other property, and can never match together with `.sb-wide`. Nothing in parts 14–21 names the element | YES |
| 2 | `2f7ad9b1` · 09 | `.schedule-morewrap{display:none;position:relative}` | 0,1,0 | Higher, same part: `@media ≤820 .filters .schedule-morewrap{display:inline-flex;flex:0 0 auto}` (0,2,0) — intended; `#page-…sched .filters>*{flex:0 0 auto}` (1,1,0) — same value | YES |
| 3 | `2f7ad9b1` · 09 | `.schedule-moremenu{…}`; `@media ≤355 #page-editsched .schedule-moremenu{left:auto;right:0}` | 0,1,0 / 1,1,0 | none elsewhere (new names) | YES |
| 4 | `2f7ad9b1` · 09 | `.schedule-moreitem`, `:hover/:focus-visible` | 0,1,0 / 0,2,0 | none | YES |
| 5 | `2f7ad9b1` · 09 | `@media ≤820 .filters .schedule-more{30×26, padding:0, font 17}`; `.schedule-more.on` | 0,2,0 | The button is also `.abtn`: `.abtn` (0,1,0, part 02) loses; `.abtn:hover` / `:focus-visible` (0,2,0, part 02, EARLIER) touch border/outline only; `.abtn.sm` (part 12) and `.topbar .abtn` (part 09) do not match it. Nothing in parts 10–21 | YES |
| 6 | `2f7ad9b1` · 09 | changed: `#page-viewsched/.editsched .filters .right` + `flex:1 1 0;min-width:0;max-width:135px` | 1,2,0 | beats `…filters>*{flex:0 0 auto}` (1,1,0, same part) and `.filters .right` (part 02). Nothing later | YES |
| 7 | `2f7ad9b1` · 09 | new `…filters .searchbox{min-width:0;width:100%;box-sizing}`; changed `…searchbox input` + `min-width:0;flex:1 1 0` | 1,2,0 / 1,2,1 | beats `.searchbox`, `.searchbox input{width:150px}` (part 02). Nothing later | YES |
| 8 | `7f0b78bf` · 01 | changed `.lgbar`: gap `10px`→`4px 6px`, padding `12px 20px`→`8px 12px`, background → solid `var(--panel)`; the phone's own `.lgbar{padding:10px 12px;gap:7px}` REMOVED | 0,1,0 | no other `.lgbar` rule in any part. `top` is now set inline by `LogicPage` (beats the sheet's `top:0`) | YES |
| 9 | `7f0b78bf` · 01 | new `.lgbar .fchip,.lgbar .abtn{padding:4px 8px;min-height:28px}` | 0,2,0 | **Part 01 is BEFORE part 02, where the base rules live** — `.fchip{padding:6px 11px}` and `.abtn{padding:6px 12px}` (0,1,0) come later but are weaker, so the new rule wins at EVERY width. Equal and later: `.fchip.on`, `.abtn.primary`, `.abtn.ghost`, `.abtn:hover` (part 02) — colours only; `.abtn.sm{padding:4px 9px}` (part 12) would win on a `.sm` button — the Logic bar has none | YES |
| 10 | `7f0b78bf` · 01 | `@media ≤820 .lgbar .lgfilters,.lgbar .lgedit{display:contents}` | 0,2,0 | beats `.lgfilters{display:flex}`, `.lgedit{display:flex}` (0,1,0, same part). The buttons inside keep `[hidden]{display:none!important}` (part 00) | YES |
| 11 | `7f0b78bf` · 01 | `@media ≤820 .lgbar .lgnote{margin-left:0;flex:1 1 240px}` (was `.lgnote{…flex:1 1 100%}`) | 0,2,0 | beats `.lgnote{margin-left:auto}` | YES |
| 12 | `7f0b78bf` · 21 | `#insightModal .modal-head{position:sticky;top:0;z-index:1;background:var(--panel)}` | 1,1,0 | `.modal-head` (0,1,0, part 08) sets no position. Nothing else | YES |
| 13 | `7f0b78bf` · 21 | `#insightModal .modal-head b{min-width:0;overflow-wrap:anywhere}`; `… .x{flex-shrink:0}` | 1,1,1 / 1,2,0 | `.modal-head b`, `.modal-head .x` (part 08) — other properties | YES |
| 14 | save-note · 17 | `:root{--save-band:36px}` | — | the name occurs only in part 17 | YES |
| 15 | save-note · 17 | `.topbar.save-failed{padding-bottom:calc(12px + band)}`; phone `calc(8px + band)` | 0,2,0 | `.topbar` (part 02) and the phone `.topbar{padding:8px 14px}` (part 09) are weaker; `.topbar.editing` (0,2,0, part 02) sets colours only | YES |
| 16 | save-note · 17 | `.topbar > .savestat.failed, .saveband{…}`; `.topbar > .savestat.failed{left:0;right:0}` | 0,3,0 / 0,1,0 | beats `.topbar > .savestat` and its phone `right:14px` (0,2,0, same part, earlier). The Tracker's own `.savestat` rules are `#page-tracker .savestat` in the built sheet — they match only the Tracker's own note | YES |
| 17 | save-note · 17 | `.topbar.save-failed ~ .week-nav{top}`; `… ~ .page .ros-rail{top}` | 0,3,0 / 0,4,0 | `.week-nav{top:52%}`, `.ros-rail{top:150px}` (part 03) weaker; no other `top` for either | YES |
| 18 | save-note · 17 | `@media ≥621 #shell.save-failed ~ .chgwin:not([data-placed]), … .availwin:not([data-placed]){top;max-height}` | 1,3,0 | **The one rule here whose targets' own rules sit in LATER parts**: `.availwin{top:96px}` (part 19), `.chgwin{top:96px}` (part 20), both 0,1,0. The id carries it whatever the order. Under 621 the two windows' bottom-panel rules (`@media ≤620`, parts 19/20) apply untouched — the new rule is scoped ≥621 to the pixel | YES |
| 19 | save-note · 17 | `.savestat .sv-msg/.sv-ico`, `.saveband …`; `.topbar > .savestat.failed button, .saveband button` | 0,2,0 … 0,3,1 / 0,1,1 | `.savestat button` (0,1,1, same part, earlier) loses to both. Equal and LATER: `[data-role-ui] button` (0,1,1, part 21) would restyle a band's Retry only if a band sat inside the Blue/Red question — none of the five call sites does | YES |
| 20 | save-note · 17 | `.sb-top > .saveband`, `.inpcal > .saveband`, `.bidsheet.full > .saveband` (+ phone) | 0,2,0 / 0,3,0 | no universal child rule on `.sb-top`, `.inpcal` or the Leave War sheet (searched all sheets, and the built Leave War sheet for `#page-leavewar button`/`*` — none) | YES |

Also changed, no effect: a trailing blank line removed at the end of parts 01, 09 and 13.

**Result of (c): no rule in the stack landed where an equal-specificity older rule now treats it differently from the one
file.** Two rules lean on being stronger than rules in later or earlier parts (rows 9 and 18); both are stronger by a
whole class or an id, not by position.

### 1c. The phone board's Desktop layout repair (`063806c7`)

**The thing:** the board's main column wrapper — ONE element, `<div class="sb-boardwrap [hist-on]">` in
`SchedBoard.tsx` (line 580) — while the board wears `.sb-wide` (`SBWIDE`, switched only by ⋯ More → Desktop layout /
Phone layout, a menu CSS shows at ≤820 only; kept for the session across closing and reopening the board; reset at
sign-in/out).

| # | Width · layout | Does the selector match? | What `display:flex` changes there | What else is on the same pixels |
|---|---|---|---|---|
| 1 | ≤820 · Phone layout (normal) | NO, because the board has no `.sb-wide` | nothing — the wrapper stays flattened (`display:contents`), one scroller | unchanged |
| 2 | ≤820 · Desktop layout | YES | the wrapper is a box again: a column (the base rule's `flex-direction:column`) holding the sign-off then the board panels, beside the 320px side column; `.sb-board` is the vertical scroller, the whole board pans sideways (1180px minimum). Before: the wrapper had no box, the sign-off and panels became ROW items of `.sb-main` and the panels collapsed to zero width (the blank schedule) | Phone leftovers still apply in this mode (weaker rules, untouched): the sign-off's and panels' 30px right gutter, the warnings list's transparent background and 30px side padding. The failed-save band — Lead 1 |
| 3 | ≥821 · `.sb-wide` still on (a phone turned on its side past 820px, or a window widened, in the same session) | YES | nothing visible — the base rule already says `display:flex` there | the More menu is hidden at this width, as before (pre-existing; the layout is the desktop one anyway) |
| 4 | ≥821 · normal desktop | NO | nothing | unchanged |
| 5 | History on (`.hist-on` on the wrapper), a look at an older version (`.pv-frozen` INSIDE `.sb-board`) | as rows 1–4 | no rule keys on the wrapper's own class (searched `.sb-boardwrap.` / `.hist-on{`) | — |
| 6 | Code that uses the wrapper (`wireHistBubble`, `refreshHistDots`, the warning jump's root, the fresh-add box, the "take me to this change" root) | — | each only SEARCHES inside it or hands it to the scroll helper; none measures its box. In row 2 these now run against a visible board for the first time — not settled by reading (§7) | — |
| 7 | Week pages, View-only Sched, Inputs, Quals, Logic, Leave War, Tracker, every pop-up | NO, because the element exists only inside the board | — | — |

`flex:1 1 auto;min-width:0;min-height:0` on the same rule were already there (dead while the wrapper had no box; live now
in row 2 — they are what let the inner scroller scroll).

### 1d. The Tracker's flight symbol (`7f0b78bf`, D560–D566)

**The thing:** the centre drawing of a flight event's ball. ONE routine draws it (`innerShape`, `core.js`), called from
ONE place (`ballGroup` ← `renderBoard`). Searched the whole Tracker for a second copy (old coordinates, `polygon`,
`innerShape`): none.

| # | Place | Shows the new shape? | Label readable / usable? | What else is on the same pixels |
|---|---|---|---|---|
| 1 | Flow chart | YES (`ballGroup` → `innerShape`) | YES — the label band (about 3.5 above to 3 below centre) now has backing to ±16 units where the old jet had ±7; the browser test rasterises all 41 shipped labels against the shape, zero pixels off it, in this mode and rows 2–3 | The wing is drawn AFTER the ring, so its tips (to 18.5 + half a hairline) lie over the innermost hairline of the ring's black edge and about half a unit of the selected student's cyan edge at 3 and 9 o'clock — the sim oval (18 wide) and the device hexagon already do the same. Centre-tap vs ring-tap is decided by class, not tag: unchanged |
| 2 | Details mode | YES — same drawing | YES | the bubble is separate text |
| 3 | Edit chart layout | YES — same drawing | YES; a larger chosen font or a longer typed label can still run off the wing (Astra measured: all 41 backed up to size 9; at 9.5 two labels lose 1 pixel) — an existing limit, smaller than before | selection/search/connect rings are outside the ring, untouched |
| 4 | The Tools strip ("+ Flight") | NO, because it is a button with a blue edge, never a symbol | — | — |
| 5 | The key under the chart (`Legend.jsx`) | NO, because it is colour swatches ("Centre = type"), no shapes — still true | — | — |
| 6 | The Students card's key ball (`renderKeyBall`) | NO, because its centre is the course's yellow disc, not an event symbol | — | — |
| 7 | Show-all list, side-panel chips, the mark pop-up, the Details bubble | NO, because each shows a colour dot/edge or text only | — | — |
| 8 | An export, a printed or saved picture | NO, because the Tracker has none — Export is the data file (no canvas/serialiser/print code, no `@media print`); the old baked-page export is gone (`core.js` comment at "Seed a brand-new browser") | — | — |
| 9 | The smoke suite | YES — its flight finder was moved from "a 10-point polygon" to "the round-joined shape inside `.core`" (the ring's cyan edge is also round-joined but is outside `.core`, so it cannot be mistaken); its contrast check reads the shape before the label, any tag | — | — |
| 10 | Browser test `D566 …` (geometry.spec) | YES — counts exactly 41 flights, 3 modes × 2 widths | — | tied to the shipped syllabus's count |
| 11 | Tracker stylesheet | NO effect, because no rule there selects `path` or `polygon` (searched) — the new `<path>` is styled only by its own attributes | — | — |
| 12 | Scheduler, Leave War, every other tab | NO, because none draws a Tracker symbol | — | — |

Colours, ball size (58), rings, fonts unchanged (D157, D566 hold). The shape grew from 30×29 to 37×33 units inside the
same 38-unit hole.

### 1e. The two bars that now stay in view (`7f0b78bf`, D561, D562)

| # | Bar | Where it sits | What can be painted OVER it | What it can COVER |
|---|---|---|---|---|
| 1 | Logic's search-and-filters bar (`.lgbar`, layer 20). `top` is now the top bar's measured height (`LogicPage` layout effect: on arriving, on a window resize, on the top bar's own size change) — on `main` it was `top:0`, i.e. tucked UNDER the top bar (wholly hidden on a desktop; on a phone only its search row hidden) | directly under the top bar | **The top bar (layer 60):** never, while the measurement is current. **The failed-save band:** the band is the top bar's own extra line (padding), so the bar's height includes it. The size-watcher alone would NOT see it (it watches the content box; padding does not change that, and the band itself is out of flow) — it is the `resize` notice Shell sends when the band comes or goes that re-measures; arriving on Logic with the band already up measures it at once. YES, sits right in both. (One frame late at the moment the band appears — the notice goes out after paint.) **"Saving…" note** (top bar's layer, floats under the bar's right end for a third of a second): lies over the bar's right end — the rule count on a desktop — and lets presses through; as designed. **Phone drawer (440), pop-ups (470+), toasts:** over it, as over everything | the page's own content scrolling under it (the off-standard notice, the Insights switch, the rules) — nothing on the Logic page is layered above 20 (the switch's knob is positioned without a layer). Solid background now, so nothing shows through |
| 2 | Week Insights' title bar with its ✕ (`#insightModal .modal-head`, sticky inside the window's own scroller, layer 1 inside the window) | top edge of the window (the window has no padding, so flush) | Nothing inside the window is layered or positioned (checked the builder and every Insights rule). The window itself is layer 471 over everything, the top bar and its band included — **the band cannot touch it**: on a desktop the band shows dimmed through the surround, on a phone the sheet (to 24px from the top, D537) covers it. Single component, five doors (week button, the two phone ⋯ menus, the board's button and its ⋯) — all get it | the window's own rows as they scroll under it; clipped to the window's rounded top |
| 3 | Every other pop-up window | NO, because D562 scopes it to Insights (the rule carries the window's id) | — | — |

**Button sizes (D487).** Split: none changed. Board repair: none. **`7f0b78bf` made buttons SMALLER, on Logic only, at
every width (desktop too):** the five filter chips' padding 6×11 → 4×8 (about 6px narrower each, height about 29 → 28
with the new 28 floor); Edit rules / Done / Reset to standard 6×12 → 4×8 (about 8px narrower, about 29 → 28 high). Text
size unchanged. D561's full row covers it ("the owner's local compactness request under D487's owner-word condition,
never global button resizing") — the rule is scoped to the Logic bar and reaches nothing else. Whether he has seen the
DESKTOP result is for the host to confirm: the sheet records the phone figures (108px against 174) and "desktop 45 vs
55", and says the owner's look at the final preview was still pending.

---

## 2. Doors

| Thing | Action | Control | Who · where | Result |
|---|---|---|---|---|
| Stylesheet split | — | none | NO door, because it is look-only by ruling (D541) | — |
| Board's Desktop layout | switch to it / back | ⋯ More → Desktop layout / Phone layout | whoever can open the board (Edit Schedule: admin; a member has no door to the board; guest none), phone width only; offered in every day state incl. a look at an older version (not gated) | door exists in each state the code allows; at ≥821 no door and none needed |
| Board's Desktop layout | read the far side, reach Done / ⋯ / Next day | sideways pan | as above | by design (D548: "retain its existing sideways navigation") |
| Board's Desktop layout | Retry a failed save | the band's Retry button | as above | at the far end of the sideways pan — Lead 1 |
| Logic bar | search, 5 filters | box + chips, pinned | admin, admin's member view, member — phone and desktop | same doors as `main`, now in view while scrolling |
| Logic bar | Edit rules / Done / Reset to standard | buttons, pinned | admin only (`hidden` otherwise; the write paths re-check `isAdmin()`); member sees none | unchanged gating |
| Logic bar | — | — | guest, no-access sign-in: NO door, because Logic is not drawn for them | — |
| Insights window | close | ✕ (pinned now), a press on the surround | every door, every role that has Insights | unchanged dismissal; ✕ in view at any scroll |
| Flight symbol | mark, pick a student, Details, edit | centre tap / ring tap / hover / double-click | everyone the same (D121) | unchanged — decided by class, the hit disc is unchanged |

No state the code permits lacks a control; no control is drawn where the write path refuses.

## 3. Orders

| Order | Required | By reading |
|---|---|---|
| Split: any page first, then any other; a reload; sign-out/in; storage reset | identical look | one eager sheet, loaded once before the app starts — order of visits cannot matter |
| Split: Leave War or Tracker visited (their sheets load late) then back | identical to before the split | their built sheets are byte-identical before/after |
| Phone → Desktop layout → Phone | phone geometry returns exactly | the rule needs `.sb-wide`; removing the class removes it (Codex: deep-equal to baseline) |
| Desktop layout → close board → reopen | still Desktop layout, schedule shown | `SBWIDE` kept for the session; same rule |
| Desktop layout → sign out → sign in | Phone layout | reset on session change |
| Desktop layout → widen past 820 → narrow back | nothing blank either way | at ≥821 the rule equals the base rule |
| Desktop layout, then publish / amend / Unpublish / Undo / Redo | look-only: no change to what is saved or marked | no script touched; CSS only |
| Logic: scroll then search · search then scroll · filter either order | bar stays under the top bar | sticky + measured offset; search/filter code unchanged |
| Logic: arrive, then the top bar goes to two lines (resize) and back | bar follows | size-watcher + resize listener |
| Logic: save fails while on Logic · arrive on Logic with the warning up · warning clears | bar under the band each time | Shell's notice / measured on arrival / notice again |
| Logic: leave the page | listeners released | cleanup returned (unit test pins it) |
| Insights: open by each of 5 doors → Show all → scroll → ✕ | ✕ always in view, closes | one rule on the one window |
| Insights open, then a save fails | window unaffected (D587: a window has no band) | window is above the bar's layer |
| Tracker: Flow → Details → Edit layout → back; reload; second student; undo/redo | same shape everywhere | one drawing routine, no state |

## 4. Leads (ranked)

**Lead 1 — LOW (reachability; new in this stack). On a phone with the board in Desktop layout, a failed save's warning
shows but its Retry button is a long sideways pan away.**
- *Steps:* phone width (390) → sign in as admin → Edit Schedule → open a day on the board → ⋯ More → Desktop layout → a
  save fails (storage refused/full; in a check, the postman's failure path as `e2e/save-note.spec.ts` does it).
- *The ruling:* D587 — the same warning under the bar of every full-screen surface, "nothing is covered"; the warning
  is "Not saved — keep this page open" WITH Retry.
- *What the code does:* in this layout every direct child of the board is at least 1180px wide
  (`.schedboard.sb-wide>*{min-width:1180px}`, part 13), so the board's bar is; the band is a line of that bar
  (`.sb-top > .saveband{width:calc(100% + 16px)}`) and at ≤820 it spreads its two pieces to its two ends
  (`.saveband{justify-content:space-between}`, part 17's phone block). The words sit at the left edge of the screen;
  Retry sits about 1,100px to the right — some 700px off a 390px screen. It is reachable by panning (as Done and ⋯ are
  in this layout), not covered; but a person sees a warning with no button.
- *`main`:* does neither — no band on the board at all, and the Desktop layout was blank. New, at the join of the board
  repair and the save band; no test or walk covers the pair (searched `save-note.spec.ts` and the save-note sheet for
  the Desktop layout: nothing).
- *Fix, exactly:* in `src/ui/scheduler/17-save-status.css`, inside the existing `@media (max-width:820px)` block at
  the end, after the `.sb-top > .saveband{…}` line, add:
  `.schedboard.sb-wide .sb-top > .saveband{position:sticky;left:0;width:100vw;margin:2px 0 -6px -8px}`
  (the board itself is the sideways scroller, so `left:0` pins the band to the screen's left edge and `100vw` makes it
  one screen wide: words left, Retry right, on screen at any pan). Then add to `e2e/save-note.spec.ts`'s board test a
  phone-only step: ⋯ More → Desktop layout, fail a save, assert Retry's box lies inside the viewport and
  `elementFromPoint` at its centre is the button; pan the board 400px, assert again. **Read, not run — walk it before
  and after.**

**No other lead.** Nothing else in the three pieces reads as wrong or as a missing call site with a concrete failure.

## 5. Explicit negatives — checked, found nothing

- The 22 parts re-concatenated from git objects: byte-identical to the old file (hash, length, `cmp`).
- Every part self-contained: balanced braces, no open comment/string, no stray at-rule that must come first.
- The built sheet on disk keeps all 22 parts in order (817 single-part class names, none absent, none out of order).
- No production file imports a part; `main.tsx` imports the index once; `index.html` links nothing.
- Leave War, Tracker and the idle chunk: built sheets byte-identical across the split (recorded hashes; names repeat in
  the post-split gate log).
- All ten stylesheet-reading tests go through the one helper; no other test, e2e file, probe or gate script reads the
  stylesheet's text.
- The helper cannot read a partial or reordered set (it throws); the folder listing is pinned to the list.
- The two merges' rules (Rally, Discard — and Insights before them) are part of the split's baseline: positions unchanged.
- Each of the 20 later rule changes (§1b): no equal-specificity competitor in a part that would now beat it, or be
  beaten by it, differently from the one file.
- Board repair: the selector matches exactly one element, only with `.sb-wide`; at ≥821 the property equals the base
  rule; nothing keys on the wrapper's own classes; no script reads the wrapper's box.
- Flight symbol: one drawing routine, one caller; no second copy; no stylesheet rule selects SVG `path`/`polygon` in
  the Tracker or the scheduler sheet (the only `path` rule is the week's version-chip tick); no handler branches on the
  tapped element's tag being `path`/`polygon`; the smoke suite's and the browser test's flight finders are scoped inside
  the centre group, so the ring's round-joined cyan edge cannot be counted as a flight.
- Tracker colours, ball size, rings, label ink (dark on every event colour) — untouched (D157).
- Logic bar under the failed-save band: follows it on arrival and on change (the content-box watcher would miss a
  padding-only change — Shell's `resize` notice covers exactly that; `save-note.spec.ts` walks Logic top and scrolled).
- Logic bar: no ancestor clips or scrolls (it pins to the page, like the top bar); nothing on the Logic page is layered
  above it; the phone's dissolved wrappers (`display:contents`) leave the hidden admin buttons hidden.
- Insights title bar: nothing in the window is layered above it; the id-scoped rule reaches no other pop-up; D536/D537's
  height rules untouched.
- Button sizes: only Logic's (stated in §1e). The split and the board repair changed none.
- The Tracker's own save note and the top bar's share a class name; the Tracker's rules are page-scoped in the built
  sheet, so neither restyles the other's.

**Left-behind helpers (not app findings, not gates — one line each for whoever next runs them):**
- `scripts/handpass/hp-breaks.py` (B13–B15) still aims its break edits at `src/ui/scheduler.css`; the text is now in the
  parts, so those three stop with "expected exactly one match". Point each at its part if the script is run again.
- `scripts/handpass/trk-palette-walk.mjs` (`shapeFills`) still recognises a flight as "a polygon that is not
  six-pointed"; a flight is a `<path>` now and would be counted with the rectangles. Use the smoke suite's test
  (`.core [stroke-linejoin="round"]`) if it is run again.
- Codex's `css-split-preservation.mjs compare` trusts that `dist/` was rebuilt (§1a) — fine for a finished one-off.

## 6. What I did NOT read, and why

- **The 6,717 moved lines one by one** — by instruction; established by byte equality instead.
- **Codex's 323 pictures and the result JSONs** (91 states, the matrix) — starting material by the brief; the byte proof
  and the cascade table do not rest on them.
- **A fresh build** — not allowed; the built-sheet check used the `dist/` already on disk (built 18:44 today, tree
  unknown to me) and Codex's retained post-split build log.
- **The Tab route (`8d6ffffe`)** — touched no stylesheet; another reader's piece.
- **The phone Insights menu's component logic (`2f7ad9b1`) and the save band's scripts** — only their stylesheet rules
  (§1b) and the two joins my piece meets (Logic under the band; the board's band in Desktop layout).
- **`ui-contracts.md`, the register and the backlog wording for these three items** — not checked for truth against
  the code.
- **Astra's final reads** for these pieces — glanced at for scope only, not relied on.

## 7. Only the running app can show

1. **Lead 1** — where Retry actually sits on a 390px phone in the board's Desktop layout, and whether the proposed
   pinned band looks right.
2. **The phone board's Desktop layout is working for the first time, so everything in it is newly reachable:** tap a
   warning in the list (does the board scroll to the man — the jump's scroller choice is by phone/desktop, and here it
   is a phone showing the desktop arrangement), drag a name from the crew column, History's dots and bubble, the Tab
   route, a look at an older version, Insights from ⋯. Codex walked pan, scroll, day arrows, ⋯ and Done; not these.
3. **Logic on his iPhone:** the pinned bar is 108px under a 49px top bar — with the keyboard up, and on its side, how
   much of the rules is left to read; and, editing rules, whether Shift+Tab lands a box under the two bars (it already
   landed under the top bar on `main`).
4. **Insights' pinned title bar on iPhone Safari** (browser bars, the 24px strip) — Chromium only so far.
5. **The wing at the size his phone shows it** — the label test is exact in Chromium; his look is the proof of "easier
   to read".
6. **Logic's smaller chips and buttons on a desktop** — whether that is what he meant by "fewer rows" (D561 was asked
   from phone pictures).
