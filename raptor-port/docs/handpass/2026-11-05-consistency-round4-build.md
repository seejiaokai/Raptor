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
2. **OPEN — for him:** at 1280 × 720 (the raptor browser tests' size) with an input window open, the gear — now at the
   right end of the second line, as ruled and as DRAWN (the approved `q3-1280-new.png` shows the ringed gear under the
   window's corner) — is under the window and cannot be pressed (`e2e/inputs-calendar.spec.ts` "Escape closes the window in
   FRONT" times out). Before the change it sat alone at the left of the line, uncovered. Recommended: where the row wraps
   (below 1340) the filters and gear start the second line at its LEFT, together — never alone, never under a window.
   Not built: it reverses part of D1702, so it is his (picture to draw for him first, D1625).
3. Seen in passing, older: the SANS row at 821 wide wraps Highlight and the gear to the LEFT of a second line, together
   (`rows/after-row-sans-821.png`) — the same before. Not a lone gear; filed with 2.

Not faults: the script's own (a dialog closed by Escape that has none yet on this build, a heading read in capitals, a
picture of a button below the fold, the phone Info panel's own zoom, a question the ✕ asks first).

## 5. The drawing check (`scripts/drawcheck/specs/cr4.mjs`, 35 states; records `docs/mock/consistency-round4/drawcheck/`)

Run by one Opus helper on 06fde6c82 (report `docs/img/handpass/2026-11-05-drawcheck-cr4/report.md`): every replay IDENTICAL
to its approved picture; RED with five causes — (A) the Inputs row at 1366 (fault 1 above, fixed); (B) the OIL tracker's
gear and ? chips 33 → 30 tall (the gear as a block, not in the line as drawn) — fixed (`oiltracker.css`, in the line, as
drawn); (C) the phone ⋯ menu's Sort all shade — the drawing's own left-behind hover, an artefact; (D) the Leave War ⋯ menu
176 wide where the approved picture is 150 — put back to 150; (E) the Tracker's menus on a phone kept the bar's 3px 6px
padding (a phone rule outweighed) — fixed (`.menupanel.on>button.sm`). **Not yet re-run on the fixed build** — the next
step.

## 6. The code read

Not yet run. Its brief, written before the walk: `docs/superpowers/briefs/2026-11-05-cr4-code-read.md` — hand it to ONE fresh Opus reader with the final commit, after his answer is built.

## 7. The gates

*(GitHub's run of pull request 643)*

## 8. Not proved here, and seen in passing

*(filled at the close)*
