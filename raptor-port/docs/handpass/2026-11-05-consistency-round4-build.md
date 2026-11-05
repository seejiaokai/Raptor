# Round 4 of the consistency look, built — evidence sheet (5 Nov 26, `claude/ui-consistency-round4`, pull request 643)

His "all as recommended" to round 4 of [UI-CONSISTENCY-LOOK] (D1700–D1707; the page
https://claude.ai/artifact/Eg1hSt3b17u2oVL2owKLux, version 4), built as drawn by `scripts/handpass/cr4-look.mjs` (its
pictures `docs/img/handpass/2026-11-05-consistency-round4/`). The build: commit 06fde6c82. D1701 (the four legends stay)
builds nothing. Pictures of this check: `docs/img/handpass/2026-11-05-cr4-build/` (the build) — the same script's
measures of the build before the change are kept beside them as `before-chromium-measures.json`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money / OIL | NO — OIL Earn's and the OIL tab's MARK change; what each does is unchanged (the tests of OIL mode pass untouched) |
| 2 | The published record | NO — nothing publishes, signs or amends differently |
| 3 | Saved data | NO — nothing stored changes |
| 4 | A shared drawer | **YES** — one gear drawing now drawn by six places (D1509, D1707); one Reorder mark by five; one menu look for three windows' ⋯ (the Leave War's `MoreButton`) and three Tracker menus |
| 5 | A new gesture or mode | NO — no control added or removed; each keeps its press |
| 6 | A new surface | NO |
| 7 | Roles | NO — the gears stay admins' where they were (the Tracker's for everyone, as before) |
| 8 | The warning list | NO |

**Tier: WALK** (question 4). No code read is required by the tier; one fresh, blind Opus read is run anyway, as the
handoff planned (D790 — §5).

## 2. The roll-call — every place each changed mark is drawn

Searched in the code (typed marks under `src`, comments aside) — `⚙ ⇅ ▤ ◧ ↺ 📱 🖥 📅 ✋ ▣ → 🗑 ╱ ❐ ✕ ⌢ ➤ ⤢ 📋 ⧉ ×` in a
button's text — and by the drawn glyphs' callers. Columns: SHOWS the drawn mark · its PRESS still works · what else is
PAINTED there.

| Mark | Place (surface) | Shows | Press | Painted beside / over | Proved by |
|---|---|---|---|---|---|
| Gear (D1509, D1707) | Inputs calendar `#inGear` — the Calendar and the List | YES — white 18 | YES — opens Inputs calendar settings | the filters' group, its own button box | walk pc/ph; `inputstabs.test.tsx` |
| | SANS calendar `.sc-gear` | YES — white 18 | YES — SANS settings | Highlight before it | walk; `sanscal.test.tsx` |
| | Leave War top row `.lw-gear` | YES — grey 18, unchanged look (now the shared drawing) | YES — Settings | My leave before it | walk; `balances.test.tsx` |
| | OIL tracker `.oil-gear` | YES — 16, the chip's colour | YES — OIL tracker settings | the ? chip before it | walk; `oiltracker.test.tsx` |
| | Tracker flex `#flexBtn` | YES — 16 white | YES — Flex settings | Find event before, Hide after | walk; `trk-flex-setting.test.tsx`, `tracker.test.tsx` |
| | Board + Wave menu `.wm-mng` | YES — 14, the button's grey | YES — Flying waves | the menu's heading | walk; `board.test.tsx` |
| | Logic page's rows (D639) | NO, because each door is the setting's value and a ›, never a gear | — | — | read in `LogicPage.tsx` (`lgdoor`) |
| Line calendar (D1508) | OIL tracker Range | YES — 15 | YES — the date picker | RANGE under it | walk; `oiltracker.test.tsx` |
| Reorder (D1703) | Board Sort all (desktop bar) | YES — 14 | YES — its question; Cancel | Undo / History beside | walk; `board.test.tsx` |
| | Board ⋯ Sort all (phone) | YES — 15 centred | (opens the same question) | the menu's rows | walk ph; `board.test.tsx` |
| | A section's Auto sort (board-html) | YES — 13 | YES — sorts, no error | + Item beside | walk; `board.test.tsx` |
| | Leave War ⚙ Rearrange the grid | YES — 14 | YES — arranging on | Reset order beside | walk; `settingssheet.test.tsx` |
| | Leave War bar's Done | YES — 14, lit colour | YES — arranging off | Manning, Legend | walk; `settingssheet.test.tsx` |
| | Tracker menus' Reorder courses / syllabi | YES — already drawn (D1135) | YES — its window | the menu's plain rows | walk; `tracker.test.tsx` |
| Templates (D1703) | Board desktop bar `#sbTpl` | YES — 14 | YES — Day templates menu | OIL Earn / Sort all | walk; `board.test.tsx` |
| | Phone day bar's Templates (`oilmode.ts dayBarHTML`) | NO, because it was words only and stays so (the drawing drew no mark there) | — | — | read |
| OIL's ticket (D1704) | Board desktop bar `#sbOil` | YES — 14 | YES — OIL mode on / off | History's clock on the same bar | walk; `oilmode.test.tsx` |
| | Leave War OIL tab | YES — the tab's 14 | YES — the OIL tracker | Grid / Approvals / Balances tabs | walk; `balances.test.tsx` |
| | Phone day bar's OIL Earn | NO, because it was words only and stays so | — | — | read |
| Reset (D1703, D1705) | Leave War ⚙ Reset order | YES — 14 (at rest; "Really reset?" words alone) | YES — arms, asks | Rearrange beside | walk; `settingssheet.test.tsx` |
| | Tracker Reset layout | YES — 13 | (as before) | the tools row | walk; `tracker.test.tsx` |
| Phone / screen (D1703) | Board ⋯ layout switch (phone) | YES — 15, both states | YES — switches, both ways | the menu's rows | walk ph |
| Tracker tools (D1705) | Edit chart layout's strip (13 tools) and the phone's folded row (`#foldTool`, `#foldFit`) | YES — 13; Merge / Unmerge words alone | YES — Select chosen; Fit | the adds (+ Flight …) words alone | walk; `tracker.test.tsx` |
| Copy / ✕ (D1705) | The lull's Copy to… and a period's ✕ | YES | YES — ✕ removes | the dates beside | walk; `tracker.test.tsx` |
| Menu rows (D1706) | Leave War `MoreButton` — the bid window, the closed note, the Select sheet | YES — plain rows 38 | YES — Attach files, Escape closes | Grant OIL's green row | walk (the bid window); the other two share the one component and its one style |
| | Tracker File, course pencil, syllabus pencil menus | YES — plain rows 38 | YES — Reorder courses | the separators | walk |
| The Inputs row (D1702) | `.inputs-top` at 1920 … 821, and a phone's 402 / 375 | — | Filters on a phone, both ways | the tabs, the month, the switch | walk `rows` |

## 3. The five sizing lines (§7.0, `walk-ledger.md`)

1. **The type of change:** E (look — marks, a menu's style, a row's wrapping), with D (one mark drawn in several places,
   each by its own code).
2. **What only a walk could find:** a place still drawing the typed mark, or drawing the new one at the wrong size or
   colour; a button grown or shrunk by its mark (D487 — "each gear keeps its button's size", D1707); a press that no
   longer opens what it did; the Inputs row's wrapping at the widths between (the tests run with no stylesheet); a menu
   row's height. The unit tests already prove each mark's drawing and that no typed mark is left in the rendered DOM.
3. **What the ledger says:** type-E walks of one area (rows of 30 Oct – 5 Nov 26) were the host alone with one script,
   20–40 checks, and found 0–1 faults each, the roll-call more often than the walk.
4. **The walk chosen:** the host alone, one script (`scripts/handpass/cr4-walk.mjs`) at his PC's 1536 × 864 and his
   iPhone's 402 × 874 (touch), the phone again in WebKit, and the Inputs and SANS rows at twelve widths (1920, 1536,
   1440, 1366, 1340, 1300, 1280, 1100, 900, 821; 402, 375). Each changed control is measured on the build AND on the
   build before the change (the same script, `CR4W_TAG=before`), pressed, and what it opens checked. A plain-user round
   (D1557): Attach filed from the Leave War window's ⋯, then the one Undo; OIL Earn on and off; Sort all asked and
   cancelled; a Tracker menu row pressed. Carried by tests and not walked: the closed note's and the Select sheet's ⋯
   (the same `MoreButton` and the same CSS rule as the bid window's — the walk of one proves the style; their items are
   pinned by `creditdoor.test.tsx` and `leavebuttons.test.tsx`). The drawing check (D1495) runs beside it on a part list
   of its own (§5).
   **§7.11's lessons:** 1 (one state only) — menus open and closed, OIL Earn on and off, the layout switch both ways, the
   Inputs row with the filters open on a phone; 3 (feedback) — each press checks what it opened; 6 (only the real phone
   draws) — the marks are drawings, not letters, so a phone's fonts no longer change them; the phone pass is run in
   WebKit too, and his iPhone look is asked for; 8 (the drawing beside the build) — the drawing check; 9 (a list
   measured) — every menu row measured; 11 (sizes) — twelve widths including 1920; 12 (a window opened from one page) —
   the OIL tracker's and Settings' openers are unchanged by this build (only the tab's and the gear's marks), so not
   re-walked from Balances or Approvals; 17 (a control that changes width) — Filters on a phone and the layout switch
   pressed both ways; 19 (a window over a window closed) — each settings window closed by Escape or its Cancel; 22
   (judged by what it draws) — every mark measured AND its picture opened. 2, 4, 5, 7, 10, 13–16, 18, 20, 21: no
   gesture, keyboard lift, pinch, print or moving part changes here.
5. **After the walk:** its row in the ledger (§9 below).

## 4. The walk (round 1, on 06fde6c82; the host, `scripts/handpass/cr4-walk.mjs`)

Chromium 1536 desktop: 43 / 43 board and Tracker checks after the script's own faults were fixed (picture folder
`rerun/`), the rest of the desktop pass 32 / 32; phone 402 in Chromium and in WebKit (`webkit/`): 39 / 39; the rows at
twelve widths (`rows/`): 25 / 25 after the fix below. No page errors. Before / after measures (the same script on the
old build, kept in the scratchpad, summarised here): every gear the same size at every width (D1707); the Inputs gear,
alone at the LEFT of a second line from 821 to 1366 before, now at the row's right end with the filters; Templates and
Sort all 29 → 28 tall (History beside them 30, as before — the typed marks' own line made 29); the chart tools 28–30 →
all 28.

**Faults the walk found (mine):**
1. **The narrower search box (1340–1439) never applied** — its rule stood above the rule it narrows and lost to it, so
   1366 stayed two lines. Fixed (moved below); red-first browser test `e2e/consistency-heights.spec.ts` (D1702 tests:
   red at 1366 without the fix, 10 / 10 green with it). 1340 wraps by design (the ruling holds one line at 1366).
2. **SETTLED — his "A" (D1708), drawn, approved ("Yes") and built (§4a):** at 1280 × 720 (the raptor browser tests' size) with an input window open, the gear — now at the
   right end of the second line, as ruled and as DRAWN (the approved `q3-1280-new.png` shows the ringed gear under the
   window's corner) — is under the window and cannot be pressed (`e2e/inputs-calendar.spec.ts` "Escape closes the window in
   FRONT" times out). Before the change it sat alone at the left of the line, uncovered. Recommended: where the row wraps
   (below 1340) the filters and gear start the second line at its LEFT, together — never alone, never under a window.
   Not built: it reverses part of D1702, so it is his (picture to draw for him first, D1625).
3. Seen in passing, older (now matched by D1708): the SANS row at 821 wide wraps Highlight and the gear to the LEFT of a second line, together
   (`rows/after-row-sans-821.png`) — the same before. Not a lone gear; filed with 2.

Not faults: the script's own (a dialog closed by Escape that has none yet on this build, a heading read in capitals, a
picture of a button below the fold, the phone Info panel's own zoom, a question the ✕ asks first).

## 4a. D1708 built, and the re-walk (round 2, on the D1708 build)

- **Drawn first (D1625):** `cr4-look.mjs` step `d1708` — the built row at 1366 / 1340 / 1300 / 1280 with an input window
  open, and the same with the group's own left margin dropped (pictures `docs/img/handpass/2026-11-05-cr4-d1708/`, page
  https://claude.ai/artifact/4384HywiC1SR3q9mUtw4eT). Measured: 1366 one line, nothing moves; at 1340, 1300 and 1280 the gear
  under the window and unpressable as built, pressable as drawn. His "Yes", 5 Nov 26.
- **Built at every width, not "below 1340":** on one line the spring before the switch keeps the group at the right end, so
  only a row that really wraps changes, whatever the letters. Checked at 1366 with letters 0.9px wider (as GitHub's Linux
  machines draw them): the row wraps, the filters and gear lead the second line from the left, the gear pressable with a
  window open (`built-1366-letters-wider.png`); with his PC's letters one line (`built-1366-letters-his-pc.png`).
- **At 821** the switch wraps too: the second line reads Calendar · List, the filters, the gear, from the left
  (`cr4-build/d1708-rows/after-row-inputs-821.png`) — D1708's "start the second line at its left", as the SANS row at 821.
- **The walk's rows (`d1708-rows/`): 35 / 35** — the twelve widths, the List's row added (the gear's other place on that
  row, roll-call §2). A first run failed 821 on the script's own reading (it took "the gear on the switch's line" for one
  line); now one line is judged by the row's height and "at the left" by the second line's first item.
- **The desktop and phone passes re-walked (`r2/`): 86 / 86**, no page errors.
- **Tests:** `e2e/consistency-heights.spec.ts` 10 / 10 (1340 / 1300 / 1280 red before the change, on "the group starts the
  line at its left"); `e2e/inputs-calendar.spec.ts` with it, 71 / 71 — "Escape closes the window in FRONT" green;
  `inputstabs` and `sanscal` unit files 64 / 64. The 1366 test follows D1702's reading: the narrower search box applied
  (read off its style), the gear never alone, the right end on one line or the left of the second.

## 5. The drawing check (`scripts/drawcheck/specs/cr4.mjs`, 35 states; records `docs/mock/consistency-round4/drawcheck/`)

Run by one Opus helper on 06fde6c82 (report `docs/img/handpass/2026-11-05-drawcheck-cr4/report.md`): every replay IDENTICAL
to its approved picture; RED with five causes — (A) the Inputs row at 1366 (fault 1 above, fixed); (B) the OIL tracker's
gear and ? chips 33 → 30 tall (the gear as a block, not in the line as drawn) — fixed (`oiltracker.css`, in the line, as
drawn); (C) the phone ⋯ menu's Sort all shade — the drawing's own left-behind hover, an artefact; (D) the Leave War ⋯ menu
176 wide where the approved picture is 150 — put back to 150; (E) the Tracker's menus on a phone kept the bar's 3px 6px
padding (a phone rule outweighed) — fixed (`.menupanel.on>button.sm`). **Re-run on the D1708 build (`docs/img/handpass/2026-11-05-drawcheck-cr4-r2/report.md`): GREEN** —
0 unexplained, 1 kept. The q3 states at 1300 and 1280 (the right end) are replaced by D1708's drawing at 1340 / 1300 / 1280,
recorded on the build it was drawn on (every replay identical to his approved picture); q3 at 1366 stands. (C), the phone
⋯ menu's Sort all shaded only in the drawing, is kept as built under D1706 (plain rows, no fill at rest) — named to him with
its picture `drawcheck-cr4-r2/more-ph--sort.png`.

## 6. The code read

ONE fresh, blind Opus reader (D790), on 298d6f9bd with the brief `docs/superpowers/briefs/2026-11-05-cr4-code-read.md`
(D1708 added to it). Four findings, each reproduced on the real build before it was fixed (the before sizes measured by
`cr4-walk.mjs` `CR4W_TAG=before` on the branch's base, 5fcef0e1e, built apart; the after on the fixed build, `cr4-build/r3/`):

| # | Finding | Reproduced | Fix | Proved by |
|---|---|---|---|---|
| R1 | The Tracker's File and pencil menus never shade a row under the mouse or the keyboard — the shade rule less specific than the resting rule's `background:none` (D1706: the board's look) | YES — rest, hover and focus all transparent | `tracker.css`: the shade written as `.menupanel.on>button.sm:focus-visible` and, for a mouse only, `:hover` | hover and focus `rgb(32, 38, 46)` on the build; `trk-palette.test.ts` "the Tracker's menus shade a row…" — red on the old rule, green |
| R2 | Three gears grew past their buttons' size (D1707 "each gear keeps its button's size"): the OIL tracker's 31.8 → 36 (phone 25.7 → 32), the + Wave menu's 21.3 × 17 → 26 × 20, the Tracker's flex 29.8 → 34 (phone 25.8 → 30) — the drawing drew the same growth, its words win | YES (before / after) | the padding trimmed, the drawn marks' sizes kept: `oiltracker.css` 9 → 7 (phone 7 → 4), `18-oil-board.css` `.wm-pen.wm-mng`, `tracker.css` `#flexBtn` | 32 / 26, 21 × 17, 30 / 26 measured; the drawing check keeps each value under D1707 |
| R3 | Every section's Auto sort 17.5 → 21.1 tall, and + Item / + Line beside it with it (D487) — the 13px mark in a 9.5px line | YES | `18-oil-board.css`: the button a centred row, the mark taking no line of its own | 17.5 and 17.5 measured (`pc-autosort-vs-neighbour`) |
| R4 | The browser test of the Inputs gear's size read a letter size that no longer sizes it | read | `e2e/inputs-calendar.spec.ts` D910: the drawn gear's box, 18 × 18 | 71 / 71 |

**Found beside it, by the host:** the OIL tracker's Range 32 → 35 tall (phone 36 → 37) — the 15px calendar in a 12px line
(D487); fixed in `oiltracker.css` (the mark takes the line's 12), 32 / 36 measured. Other buttons that carry a new mark
are 3–5px wider (Templates, Sort all, OIL Earn, Rearrange, Reset order, Done, Auto sort), the drawn mark wider than the
letter it replaced, as drawn and approved; Templates, Sort all and OIL Earn 29 → 28 tall (§4) — named to him.
**Seen, not ruled — filed for round 5** (`OUTSTANDING.md` [UI-CONSISTENCY-LOOK], round 4's paragraph): the Tracker's
"↺ Restore", the warning lines' "✕ / ↺", the Inputs "⤢ / ⤡", the phone day bar's words-only Templates and OIL Earn.
Its explicit negatives (every gear site converted, no covered typed mark left, colours and sizes won by their own rules,
the Inputs group's phone row, keyboard order and List unchanged, the Leave War menu's look kept to its menu, the Tracker's
copies of the drawings the same) are in the reader's report, kept in this chat's record.

**After the fixes:** the re-walk `cr4-build/r3/` 86 / 86; the drawing check `2026-11-05-drawcheck-cr4-r3/report.md` GREEN —
0 unexplained, 21 kept (the 20 differences of the sizes put back, each under D1707 or D487 with the value seen, and (C));
unit files 388 / 388 and 43 / 43; the Inputs browser tests 71 / 71. One narrow read of the fixes is not needed: each is a
padding or a selector, no logic (§5 "a fix is new code" — more than a one-line guard rewrites logic; none does).

## 7. The gates

GitHub's run of pull request 643 on 298d6f9bd (D1708 built): GREEN — the full set, the Docs guard, the secrets scan. The
run of the read's fixes: in the closing report.

## 8. Not proved here, and seen in passing

- **His iPhone** — the marks are drawings, so a phone's fonts no longer change them (§7.11 lesson 6), but the rows' and
  menus' words are still Apple's letters: his look on his iPhone is the step that proves it.
- **WebKit after the read's fixes** — the phone pass ran in WebKit on 06fde6c82 (§4); the read's fixes (paddings, a menu's
  hover for a mouse only) were re-walked in Chromium at 402 by touch, not in WebKit again.
- **1366 with GitHub's letters** — imitated by widening the letters 0.9px on his PC's build (§4a); GitHub's own run of the
  1366 test is the real one, green on 298d6f9bd.
- **Seen in passing:** `bidpicker.css` keeps the Grant OIL menu row's green rules, unused since Grant OIL became its own
  button — harmless, left.
