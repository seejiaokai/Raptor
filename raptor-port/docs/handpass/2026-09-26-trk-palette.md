# Evidence — the Tracker in Raptor's colours, fully (`[TRK-PALETTE-ASK]`, D157) — 26 Sep 26

Branch `claude/tracker-palette` (parallel with `[ACCOUNTS]`; port 4180, rulings D230–D239 — his instruction of
26 Sep 26). Pictures: `docs/img/handpass/2026-09-26-trk-palette/`. Walk script `scripts/handpass/trk-palette-walk.mjs`
(assertions of the RIGHT colour — a PASS means correct), its results `docs/handpass/parts/trk-palette/trk-palette-walk.json`;
break tests `scripts/handpass/trk-palette-breaks.mjs` → `…/trk-palette-breaks.json`.

## 1. The eight questions and the tier

| # | Question | Answer, with the reason |
|---|---|---|
| 1 | Money / owed | NO — colours only; no OIL, leave or count is read or written |
| 2 | Published record | NO — the Tracker has none; nothing about Raptor's schedule changes |
| 3 | Saved data | NO — no colour is stored or exported (checked: `fileFormat.js`, `fileStore.js`, `storage.js` carry none; the chart is never rendered to an image) |
| 4 | A shared drawer | **YES** — the event colours are drawn by the chart (`innerShape`, `ballGroup`) and read by the legend, Show All, the side panel, the find list, the edit strip, the pop-up and the key ball |
| 5 | A new gesture or mode | NO — no control added or changed |
| 6 | A new surface | NO |
| 7 | Roles | NO — the Tracker reads no role (D121) |
| 8 | The warning list | NO |

**Tier: WALK** (question 4). D157's own note said "LOOK plus a phone look"; the order is decided by the facts, and a
colour read by eight places is a shared drawer ("a cosmetic change to a shared drawer is never LOOK").
**The server question (D202): NO** — colours only; nothing about who may do what, what anyone is owed, an official
record or personal details. `data-model.md` §11 untouched.

## 2. Rulings that apply (the rules sweep)

| Ruling | What it asks of this change | Walked / pinned |
|---|---|---|
| **D157** (24 Sep 26, "7 c") | Raptor's colours FULLY — backgrounds, text, the event colours; sim yellow → amber | the whole walk; built = picture C (`compare-*.png`) |
| The standalone rule (9 Sep 26) | the Tracker must still work lifted out of Raptor | tokens COPIED, not `var()`-linked to Raptor; pinned equal by `trk-palette.test.ts` |
| Readability floor (15 Aug 26, the smoke suite) | every event code ≥ 4.5:1 on its ball; arrows ≥ 3:1 | smoke gate + `trk-palette.test.ts` ("every event code stays readable") — worst is CFT/IAT/EPT at **4.76:1** (was 5.38) |
| "Cyan edge only" for the picked student (9 Sep 26) | an edge, never a fill; the key ball's colour | S2 marks check: `path.mine` stroke = Raptor's accent |
| The search ring is its own colour (the smoke suite) | not the "selected" blue | S7: stays turquoise `#00e5c8`; smoke check re-pointed at the new accent |
| Failures outlined, never solid (16 Aug 26, `tracker.css`) | the chips' red outline | **found never drawn — fixed** (§7 F1) |
| D121 — admin and member the same | nothing role-dependent | one role walked (§8) |
| UI quality both widths (12 Aug 26) | phone and desktop | both walked |
| Production copy (25 Aug 26) | no prototype words | no copy added; one colour WORD corrected (§7 F3) |

No clash between rulings found.

## 3. The colour map — what changed, what stayed

Raptor's tokens are `scheduler.css :root`. Changed (the Tracker's own version of a Raptor colour):

| Tracker name / literal | Before | Now = Raptor's |
|---|---|---|
| `--bg --panel --panel2 --line` | `#0f1115 #161922 #1d212b #2b313d` | `--bg --panel --panel-2 --edge` (`#0B0D10 #14181D #1A1F26 #2A313A`) |
| `--ink --muted --accent` | `#e9ecf2 #98a2b3 #36c2ff` | `--ink --ink-3 --accent` (`#F1F4F7 #8A96A3 #3BC6E8`) |
| flight · acad · test · sim · device (`TYPE_COLOR`, the tokens) | `#19b6e8 #27d64a #ff4040 #ffe000 #b063ff` | `--flight --ok --hard --adv --san` (`#3BC6E8 #57C97A #F0555F #E5A83B #B24DEA`) |
| Marginal · fail · red · orange | `#27d64a #ff2b2b #ff2b2b #ff9800` | `--ok --hard --hard --adv` |
| selected / switched-on fill (`#16384a`: primary buttons, open menus, chosen tool, find row, phone tab, key ball, hint bar) | dark teal | Raptor's "on" wash `rgba(59,198,232,.16)` (its `.fchip.on`); laid on `--panel` where it must be opaque (the hint bar) |
| accent literals in the chart (selected student's edge, connect / multi-select rings, a selected line or arrow, the line being drawn, snap points, the drag band, guides) | `#36c2ff`, `rgba(54,194,255,…)` | `PAL.accent` / `rgba(59,198,232,…)` |
| failure ticks · failure chips (wash, edge, text) · Delete ball text | `#ff2b2b`, `#ff2b2b1f/88`, `#ff9b9b`, `#ffb3a0` | `--hard`, `rgba(240,85,95,.12/.55)`, Raptor's light red `#FBB4B9` |
| code on a ball · dark text on a grade badge | `#10131a` | `--bg` |
| save slot words (saved / unsaved / error) · Save changes unsaved | `#39d353 #ffb84d #ff6b6b` · `#4a2f16` | `--ok --adv --hard` · amber wash `rgba(229,168,59,.16)` |
| row hairlines · progress bar · hint text · ink on accent | `#262c38` · `#19b6e8→#27d64a` · `#dff` · `#04121b` | `--edge` · `--flight→--ok` · `--ink` · `--accent-ink` |

After the two reads (§9), also moved: the lull calendar's picked start day (`#16584a` → the "on" wash) and the days of a
lull already set (`#3a3030` → Raptor's red tint); a ticked box (the browser's own blue → `accent-color:var(--accent)`,
Raptor's own recipe); the details bubble's colours now carry Raptor's VALUES as fallbacks, and the page is
`color-scheme:dark` like Raptor's `<html>`, so a standalone Tracker draws the same.

Kept as the Tracker's own (Raptor has no word for them; all unchanged in picture C): the DCO black / DPCO blue `#1f6dff` /
N.A. tan `#cdbb8e` grade fills and the white "not done" wedge; the yellow "available" ring `#ffd23f`; the turquoise
search ring `#00e5c8`; the chart's grey lines `#657085` and `--grey #5a6172` (arrowheads, "not yet" chips, grey flex
bars); the Edit chart layout handles (orange ends `#e67e22`, blue bend squares `#2b6cb0`, amber loose ends `#ffb84d`, the
brighter hovered snap point `#0af`); the key ball's gold centre `#f6c21a`; shadows and scrims; near-black neutrals (the
scroll track, the number badge's disc, the editing canvas). All listed on his look card (§11) so he can say "those too".

## 4. The roll-call — every place the Tracker paints a colour

Thing attached to: **the Tracker's colours**. Columns: SHOWS Raptor's colour (walk check · picture) / USABLE (no gesture
changed; each surface was still OPERATED in the walk) / PAINTED ON THE SAME PIXELS.

| # | Surface | Shows | Usable | Painted over / beside |
|---|---|---|---|---|
| S1 | The page and its bar (desktop, phone) | YES · `d01`, `p02` | YES — bar dropdowns and buttons used throughout | — |
| S2 | The chart: event shapes, code on the ball, grade wedges, failure ticks, the picked student's edge, hover edge | YES · `d02`, `d04`, `p01` (210 balls, every type read) | YES — graded through the pop-up | the "available" ring (yellow) round an amber sim — more distinct than the old yellow-on-yellow; failure ticks now the SAME red as a test ball (were near-identical before) — ticks sit on the ring, the test shape inside |
| S3 | The colour key under the bar | YES · `d03` | n/a — not a control (it is a key) | — |
| S4 | Side panel: cards, Overall bar, the Students key ball, Next event / Plannable chips, Currency & Flex bars (green, amber and red each set through the date boxes), Failures | YES · `d06`, `d07`, `d07b`, `p04` | YES — crew picked, failures counted, dates typed | flex bars: white words on green / amber ~2:1 (§7 F4, pre-existing) |
| S5 | The grade pop-up | YES · `d05` | YES — DCO, DPCO, Marginal, N.A., + failures pressed | — |
| S6 | Show All (dots, grade badges, the row being edited) | YES · `d11`, `d12` | YES — Edit pressed on a row | — |
| S7 | Find: predictions, picked row, the searched ball; the phone's find strip | YES · `d08`, `d09`, `p03` | YES — typed, arrowed, Enter | the turquoise search ring beside the yellow available ring (smoke: never touching) |
| S8 | Switched-on buttons: an open menu, Details on, its hint bar | YES · `d10`, `d13` | YES — opened and closed | — |
| S9 | Dialogs: + Add (OK), the event editor (Save, Delete ball, its type list's words) | YES · `d14`, `d19` | YES — opened, cancelled | — |
| S10 | Edit chart layout: + event buttons, chosen tool, hint bar, canvas edge, drag band, picked ball, unsaved Save, connect ring, line being drawn, snap points, words on leaving unsaved | YES · `d15`–`d18`, `d20` | YES — Select band, + Acad, Connect, Line, Edit lines, ✎ Text | handles kept orange / blue |
| S11 | Phone view tabs | YES · walk check `phone S11` | YES — tapped | — |
| S12 | The details bubble (on `<body>`, outside the page): its box, the code, the record divider, the "No details yet" line | YES · `d10`, `d25`; its record divider and its hint line **MISSING before — fixed** (§7 F2, F7) | YES — Details on, a ball and a new ball tapped | — |
| S13 | Zoom controls | YES · walk check `S13` | YES (seen; zoom itself untouched) | — |
| S14 | Failure log pop-up | YES · `d07` | YES — opened, closed | — |
| S15 | Reorder windows (course, syllabus, students) | YES by token (`--panel2 --line --accent`); not separately pictured — same rules as S14 | not operated — no colour of their own | — |
| S16 | Copy / syllabus modal lists | YES by token (`var(--line)` borders); not separately pictured | not operated | — |
| S17 | The lull calendar ("+ Set lull period"): today's ring, the start just picked, the days of a lull already set | YES · `d21`, `d22` — **missing from the first roll-call** (Fable F-A); its two old colours moved (§7 F8) | YES — a lull set by two taps, the calendar reopened | — |
| S18 | Tick boxes: Copy lull periods, the Export window | YES · `d23`, `d24` — **missing from the first roll-call** (Astra #2); fixed (§7 F9) | YES — ticked | — |

## 5. The walk

`trk-palette-walk.mjs` on the production build (`npm run build` + `vite preview` on 4180), fresh browser per width,
the world made through the app's own controls (graded balls, failures, a search, a new ball in Edit chart layout,
syllabus and currency dates, a lull period). First walk 54/54; **after the reads' fixes, re-walked in full: 65 checks,
65 PASS**; desktop 1440×900 and phone 390×844 by finger; **no console error, failed request or page error** at either
width. 35 pictures, including `compare-desktop.png` / `compare-phone.png`: **before · the picture
he chose (C, 24 Sep 26) · built** at the same framing — built matches C.

## 6. Break tests (§8.4)

`trk-palette-breaks.mjs`: one old colour put back per wired place, the pin run, the file restored byte for byte.
**21 of 21 turned a named test red** — the sim token, the page background, a CFT/IAT/EPT ball, the failure ticks, the
Marginal wedge, the picked-student edge, a picked find row, the code on a ball, the failure-chip rule, the Legend's
Sim swatch (a retired colour), a grade badge's text, the pop-up divider, the bubble's divider, the editor's
"Sim (yellow)", and Raptor's own amber changing with the Tracker left behind; and, after the reads, six breaks using
ANOTHER CURRENT colour rather than a retired one (Astra #4): the key's Sim swatch in the Test token, the DPCO dot in the
Marginal token, an unsaved Save changes in an orange Raptor does not use, the bubble falling back to a non-Raptor
colour, tick boxes back to the browser's own, the lull start back to the old teal. The smoke suite adds a browser check that two failures draw two
ticks in Raptor's red (it also proves the "no ticks" checks below it can see a tick at all).

## 7. What the walk found, and each disposition

| # | Found | Age | Disposition |
|---|---|---|---|
| F1 | **The failure chips' red outline was never drawn** — every chip is also a `.chip`, whose grey outline sits later in the file at the same weight, so the red border and clear fill lost | pre-existing (16 Aug 26 on); on `main` | **fixed** (`.chip.failchip`), pinned by the unit test and walk S4 |
| F2 | **The details bubble's student record had no divider or spacing** — its rule sat inside the page wrapper (`#page-tracker #detailBubble …`), which never matches a bubble hung off `<body>`; and it named `--line`, which does not exist out there | pre-existing; on `main` | **fixed** (moved out beside the bubble's other rules, in Raptor's `--edge`), pinned: nothing outside the wrapper may name a non-Raptor colour, and no bubble rule may sit inside it |
| F3 | The event editor's type list said **"Sim (yellow)"** | new with D157 | **fixed** ("Sim (amber)"), pinned per type in the unit test and walk S9 |
| F4 | The Currency & Flex bars print white words on green and amber at ~2.1:1 (floor 4.5:1); red 3.4:1 | pre-existing (1.9 / 2.2 / 3.7 before); D157 moves each a hair | **filed** `[TRK-FLEXBAR-INK]` — a design choice put to him (dark words on the light bars) |
| F5 | Three smoke checks found things by their OLD colour; after a palette change two of them ("N.A. carries no ticks") would have passed counting nothing | new with D157 | **fixed** — ticks found by a class (`line.ftick`), a positive two-ticks check added, the selected-colour checks re-pointed |
| F6 | CFT/IAT/EPT codes are the least contrasty label: 4.76:1 (was 5.38) | new with D157 | within the floor; on his look card (he chose C knowing the event colours are softer) |
| F7 | (Fable F-B) The bubble's "No details yet" line was never muted or small — `.mini` sat inside the page wrapper, which never reaches the bubble | pre-existing; on `main` | **fixed** (`#detailBubble .mini` outside), pinned: every class the bubble's content uses has its rule outside; walk S12 |
| F8 | (Fable F-A, Astra #3) The lull calendar was missing from the roll-call; its start day and lull days kept two old Tracker colours | the omission new; the colours on `main` | **fixed** (the "on" wash; Raptor's red tint; the dead `.cal .lull` rule too), walked S17, the three colours added to the retired list |
| F9 | (Astra #2) Tick boxes drew the browser's own blue | on `main`; a missing D157 place | **fixed** (`accent-color:var(--accent)`, Raptor's own recipe), walked S18, pinned |
| F10 | (Fable F-C, Astra #1) Lifted out of Raptor, the bubble would lose its colours (it names Raptor's `:root` names), and date boxes would turn light | partly on `main` | **fixed** — every bubble colour carries Raptor's value as its fallback (each pinned equal to Raptor's), and the page is `color-scheme:dark`. Astra suggested a whole standalone test page; the pin reaches the same place without one |
| F11 | (Fable F-D) Four Raptor tints written as `rgba()` had no test tying them to Raptor | new | **fixed** — every `rgba()` in the Tracker must be Raptor's accent, red or amber (or a shadow's black) |
| F12 | (Astra #4) The "legend" check never read the key; the walk only ever saw grey flex bars | new | **fixed** — the key, the pop-up's dots and the edit strip read label by label; the walk sets green, amber and red flex bars through the date boxes |
| F13 | (Fable F-E) The look card did not list everything kept as the Tracker's own | new | **fixed** — §3 and §11 list them all |
| F14 | (Fable F-F) Two older walk scripts (`trk-w2-05-rings.mjs`, `trk-w2-lib.mjs`) found failure ticks and the picked edge by the old colours | new with D157 | **fixed** — `line.ftick`, and the new accent |

## 8. What was NOT walked, and why

- **The member role** — the Tracker reads no role (D121); the colours are identical, so one role was walked.
- **A short screen** (a phone on its side) — no size, position or layout changed; colour only.
- **A real iPhone / Safari** — the walk ran in Chromium. Two lines only a real device proves: the chart's `rgba()` fill
  on the key ball's picked wedge, and the amber sims reading apart from the yellow "available" ring at a glance. On
  his look card.
- **Reorder / copy windows (S15, S16)** — no colour of their own; they read the same tokens the walked surfaces prove.
- **The Tracker truly standalone** (no Raptor stylesheet) — pinned by the fallback test (F10), not driven: there is no
  standalone page to open yet.
- **The standalone app** — does not exist yet; the copied tokens are what keep it working.

## 9. The model reads

(§4: one other model is called when a change reaches more than one surface; D182: both, until 28 Sep 26.) Both read
blind to each other, with this sheet and the brief `docs/superpowers/briefs/2026-09-26-trk-palette-read-brief.md`.

- **Fable 5.1** — nothing high; six low: F-A (lull calendar missing → F8), F-B (bubble hint line → F7), F-C (bubble
  standalone → F10), F-D (unpinned tints → F11), F-E (look card → F13), F-F (old walk scripts → F14). Agreed with
  F1–F6's dispositions and recomputed F6 at 4.76:1. Negatives: no other missed painter, no unresolved name inside the
  wrapper, no portal, no new colour collision (the shapes keep same-colour marks apart), no vacuous check.
- **Astra (Codex)** — one medium, three low: #1 standalone bubble and native controls (→ F10), #2 tick boxes (→ F9), #3
  lull calendar (→ F8), #4 two checks that could pass while wrong (→ F12). Negatives: no other missed renderer, no
  stored colour, no other scope problem; SVG `rgba()`, nesting and the layered background read back in Chromium.
- **All 10 findings: confirmed, fixed, pinned and re-walked** (§4 S4, S12, S17, S18; §5; §6). None disputed. Both
  named the same limit: only a real iPhone proves the native tick boxes, the washed key-ball wedge and amber sims beside
  the yellow ring (his look card).

## 10. The gates

Run on a quiet PC (checked first: no other chat's checks running, D86), on ports of their own (E2E 4181, smoke 4182) so
no other chat's preview could be tested by mistake. Two full runs, both watched:

| Gate | Run 1 — the code the reviewers read (`5733d5c9`) | Run 2 — the final code, after the reads' fixes |
|---|---|---|
| unit (`vitest`) | **6027 / 6027** (369 files) | **6029 / 6030** — the one failure is `[LW-FIGSEL-SLOW]` (a Leave War test that times out only under a full parallel run, filed 23 Sep 26); re-run alone: 12 / 12. This change touches no Leave War file |
| build | clean | clean |
| tfin (the original's assertions) | **728 / 0** | **728 / 0** |
| e2e | **471 passed**, 48 skipped | **471 passed**, 48 skipped |
| smoke:tracker | **443 / 0** (one more than before: the two-ticks check) | **443 / 0** |
| rulecheck | OK | OK |
| docsize | OK | OK |

## 11. His look — the card

1. **Open the Tracker on your phone and scroll the chart.** Can you still tell a flight, an acad, a test, a sim and a
   CFT/IAT/EPT apart at a glance? (Sims are now amber, not yellow; the purple ones' codes are the faintest.)
2. **Tap a ball and give it a failure or two.** The ticks and the Failures card chips are Raptor's red — the chips now
   have the red outline they were always meant to have.
3. **Kept as the Tracker's own** (Raptor has no colour for them): the yellow "can fly next" ring, the turquoise search
   ring, the DCO black / DPCO blue / N.A. tan grade colours, the key ball's gold centre, the chart's grey lines and
   arrowheads, and in Edit chart layout the orange line ends, blue bend squares and amber loose ends. Say if any of those
   should change too.
4. **Question (filed, `[TRK-FLEXBAR-INK]`):** the Currency & Flex bars' white words on green and amber are hard to read
   — they were before this change too. Dark words on those two, like Raptor's own amber chips? (Recommended: yes.)
