# Merge walk — walker A (Share A), 25 Nov 26

Brief: `docs/superpowers/briefs/2026-11-25-r4-walk-faults-merge-walk-brief.md`. Builds: merged `D:/rw4/r183/build-merged-0ff30dbdf`
(`index-B9okpSpf.js`), main `D:/rw4/r183/build-main-1993bed86` (`index-DCU_WN_H.js`). Pictures under
`docs/img/handpass/2026-11-25-r4-walk-faults/merge/r4wf-ma/`.

## Results

| Scenario | Build | Size / engine | Verdict | What the screen and the store said | Pictures |
|---|---|---|---|---|---|
| X1 (a) | merged | phone 402 WebKit | COULD NOT BE MADE (the Undo press keeping the caret); rest walked → PASS | The caret cannot be kept through Undo: tried a WebKit tap, `element.click()` (no blur) and a Chromium phone tap — each time the app itself takes the caret (focusout fires on Hex's Start while it is still on the page, no new target; then the list is rewritten). After the Ground visit Hex's Start carried the bare address (no man's name), as the scenario feared. After Undo: ONE leave, Ranger+Hex 08:00–17:00 (pass). Continued with a fresh tap on Hex's Start (now addressed to Hex): `0900` Tab → Hex alone 09:00–17:00 on a leave of his own, Ranger 08:00–17:00 unchanged; Inputs page the same. | `x1a-merged-phone-webkit/007-X1a-4-after-undo.png`, `010-X1a-6-caret-left.png`, `011-X1a-7-inputs-day.png`; tries: `x1a-…` (tap), `x1a-js-merged-phone-webkit/`, `x1a-try3-merged-phone-chromium/` |
| X1 (a) | main | phone 402 WebKit | COULD NOT BE MADE (same); rest walked → PASS | Same: Undo takes the caret (focusout, box still on the page). On main Hex's Start kept his name in its address after the Ground visit (the list is not rewritten there). Undo → one leave both men 08:00–17:00; fresh tap, `0900` Tab → Hex alone 09:00–17:00, Ranger unchanged. | `x1a-main-phone-webkit/007-…`, `010-…`, `011-…`; `x1a-js-main-phone-webkit/` |
| X1 (a′) | merged | phone 402 WebKit | COULD NOT BE MADE (same); rest walked → PASS | Blank space in place of the Ground box: Hex's Start bare-addressed here too. Undo takes the caret. Undo → one leave both men; fresh tap, `0900` Tab → Hex alone 09:00–17:00, Ranger 08:00–17:00. | `x1a2-merged-phone-webkit/`, `x1a2-js-merged-phone-webkit/` |
| X1 (a′) | main | phone 402 WebKit | COULD NOT BE MADE (same); rest walked → PASS | Same as merged: bare address after blank, Undo takes the caret, the rest reaches Hex alone. The caret-taking Undo is on main already — not new with the merge. | `x1a2-main-phone-webkit/`, `x1a2-js-main-phone-webkit/` |
| X1 (b) | merged | phone 402 WebKit | COULD NOT BE MADE (same); rest walked → PASS | Caret in Ranger's Start (bare-addressed) before Undo; Undo takes the caret (1 press each). Fresh tap, `0900` Tab → Ranger alone 09:00–17:00, Hex 08:00–17:00. Not the [SHARED-ROW-HELD-LEFTOVERS] (1) case — the value saved. | `x1b-merged-phone-webkit/` |
| X1 (b) | main | phone 402 WebKit | COULD NOT BE MADE (same); rest walked → PASS | Ranger's Start kept `~bane` on main; otherwise the same. | `x1b-main-phone-webkit/` |
| X1 (c) | merged | phone 402 WebKit | PASS | Undo (caret lost, as above — the puck tap needs none) → one leave both men; Hex's puck tapped, Outlaw tapped in the crew list. Note: "Outlaw is now unavailable instead of Hex". Store: one leave Ranger+Outlaw 08:00–17:00; no Hex. Ranger not replaced. | `x1c-merged-phone-webkit/` (`…-5-armed`, `…-6-after-outlaw`, `…-7-caret-left`) |
| X1 (c) | main | phone 402 WebKit | PASS | Same words, same store. | `x1c-main-phone-webkit/` |
| X1 (d) | merged | phone 402 WebKit | COULD NOT BE MADE (Undo keeping the caret); rest walked → PASS | Three men: Ranger cut (End 1000), Hex cut (End 1100), Ground box, Outlaw's Start (bare address on merged, `~casper` on main). Undo (caret taken) → Ranger own 08:00–10:00, Hex+Outlaw 08:00–17:00. Fresh tap on Outlaw's Start, `0900` Tab → Outlaw alone 09:00–17:00; Hex 08:00–17:00 own; Ranger 08:00–10:00. Nothing on another man's leave. | `x1d-merged-phone-webkit/` |
| X1 (d) | main | phone 402 WebKit | COULD NOT BE MADE (same); rest walked → PASS | Same store at the end. | `x1d-main-phone-webkit/` |
| X4 (PI open) | merged | phone 402 WebKit | PASS | Shared OD 08:00–12:00. Ranger End 1000, his Remark tapped (Ranger own OD 08:00–10:00). Reject pressed: a WebKit tap and a Chromium phone tap both lost the caret; `element.click()` kept it (try 2). Remark box top 491.9 → 491.9 (0px) at both Rejects. Note: "Ranger's OD taken out of Unavailable". RECORD: while held, his old row stands in Unavailable reading 08:00–10:00 with its Reject, AND his duty already shows under Personal Inputs (08:00–10:00, → Ground / → Unavail). `x` typed in the standing box; second Reject: "Ranger's OD can't be changed here right now", nothing changed. `x` saved on Ranger's own duty (store `OD Ranger 480-600 "x" acc=r`), shown on his Personal Inputs line once the caret left. Caret gone: Ranger one line under Personal Inputs, Hex one row under Unavailable, Hex's OD 08:00–12:00 never touched. | `x4open-m2-merged-phone-webkit/` (`…-1-cut-held`, `…-2-after-reject`, `…-3-after-reject2`, `…-4-caret-left`); caret-lost tries `x4open-merged-phone-webkit/`, `x4open-try3-merged-phone-chromium/` |
| X4 (PI open) | main | phone 402 WebKit | PASS | Same store, same words, 0px. Difference: on main Personal Inputs stays empty while the caret is held (Ranger's duty appears there only after the caret leaves). | `x4open-m2-main-phone-webkit/`; tap try `x4open-main-phone-webkit/` |
| X4 (PI folded) | merged | phone 402 WebKit | PASS | Same, 0px both Rejects; the folded heading reads "1 input" at once while the caret is held. End: Hex one Unavailable row, Ranger's OD `"x"` rejected. | `x4fold-merged-phone-webkit/` |
| X4 (PI folded) | main | phone 402 WebKit | PASS | Same store; the folded heading shows "1 input" only after the caret leaves. | `x4fold-main-phone-webkit/` |
| M2 | merged | phone 402 WebKit | PASS | Carried on from X4 open: "→ Ground" on Ranger's Personal Inputs line (note "Ranger's OD added to the ground programme"); his Ground Programme row End 1100, then Hex's Start tapped: Ground row 08:00–11:00 "x", his Personal Inputs line 08:00–11:00, store `OD Ranger 480-660 acc=g`; Hex `OD 480-720` under Unavailable. No missing or doubled row. (Also PASS on the earlier caret-lost run.) | `x4open-m2-merged-phone-webkit/` (`M2-1-after-ground`, `M2-2-1100-caret-in-unav`, `M2-3-caret-left`) |
| M2 | main | phone 402 WebKit | PASS | Same. | `x4open-m2-main-phone-webkit/` |
| X6 | merged | phone 402 WebKit | COULD NOT BE MADE | Ranger End 1000, his Remark tapped, his puck tapped (a locator tap timed out; tapped at its measured middle): armed ("Planning Unavailable · Ranger"), the dashed ring on Ranger's row — but on the phone the crew drawer opens over the whole right of the Board, and the Ground Programme remark box lies under it (the point hits a crew name). The box cannot be tapped while armed; stopped there. | `x6-merged-phone-webkit/` (`…-X6-1-armed`, `…-X6-2-ground-box-covered`) |
| X6 | main | phone 402 WebKit | COULD NOT BE MADE | Same: the drawer covers the Ground box. | `x6-main-phone-webkit/` |
| X6 | merged | desk 1440 Chromium (in its place) | PASS | Tapping the Ground box does NOT put the arm down (strip still "Planning Unavailable · Ranger"); the ring (seat "armed") stays on Ranger's row, whose address became his own leave's. Outlaw tapped: "Outlaw is now unavailable instead of Ranger"; store Outlaw 08:00–10:00 (Ranger's own leave), Hex 08:00–17:00 untouched. | `x6-merged-desk-chromium/` |
| X6 | main | desk 1440 Chromium | PASS | Same words and store; arm also survives. | `x6-main-desk-chromium/` |
| X7 | merged | phone 402 WebKit | COULD NOT BE MADE (presses keeping the caret); substance → PASS | Caret in a Ground remark box; Undo pressed by `element.click()` still took the caret (focusout with the box on the page — the app's own, as in X1), so Redo and Undo-2 had no caret to keep. With that: after Undo one leave both men, Redo Ranger own + Hex, Undo-2 one leave; every step the Unavailable rows agree with the store, Ranger above Hex; Ranger Start 0900 Tab → two leaves (Ranger 09:00–17:00, Hex 08:00–17:00), never three; Hex's times never moved. (First run `x7-…` misjudged by a script slip, rerun as `x7v2`.) | `x7v2-merged-phone-webkit/` |
| X7 | main | phone 402 WebKit | COULD NOT BE MADE (same); substance → PASS | Same counts 1/2/1, same end. | `x7v2-main-phone-webkit/` |
| X8 (a) | merged | phone 402 WebKit | **FAIL** | Shared OD 08:00–12:00, unchanged. `0900` typed in Ranger's Start (not left); Reject on Ranger's row by `element.click()` — caret kept (Start). Note: "2 people's OD taken out of Unavailable"; store at once `OD Ranger+Hex 480-720 acc=r` (the WHOLE shared duty rejected — Hex's too). Tap blank → the held `09:00` is saved onto that shared duty: `OD Ranger+Hex 540-720 acc=r` — Hex's start became 09:00 by a box and a button on Ranger's row. Unavailable now holds neither man; the folded Personal Inputs heading reads "1 input". | `x8a-merged-phone-webkit/002-X8a-1-after-reject.png`, `003-X8a-2-caret-left.png` |
| X8 (a) | main | phone 402 WebKit | **FAIL** (same) | Identical store and words: whole duty rejected, then both men 09:00–12:00. Already on `main` — not new with the merge. (Merged shows "1 input" on the folded heading at once; main only after the caret leaves.) | `x8a-main-phone-webkit/` |
| X9 | merged | phone 402 WebKit | RECORD | Shared OD Sat 18 Jul 08:00–12:00, OIL 0.5 each on filing. On the phone "OIL Earn" sits in the Board's ⋯ menu: ⋯ then OIL Earn, both by `element.click()`, caret kept in Ranger's End (a real tap not tried here). Note: "OIL Earn: tap a puck to stop that man earning from that event, or an item to stop the whole item earning". Rows still drawn as editable boxes while the caret stays. `1000` Tab → saved: Ranger cut out onto his own OD 08:00–10:00 (OIL 0.5 kept on it), Hex 08:00–12:00 (OIL 0.5); then the Board redraws in OIL mode with no Unavailable section and the caret on the page body. No OIL figure moved. | `x9v4-merged-phone-webkit/` (`003-X9-1-oil-on`, `004-X9-2-after-1000-tab`) |
| X9 | main | phone 402 WebKit | RECORD | Identical: Ranger cut out to his own OD 08:00–10:00 from inside OIL Earn mode; OIL 0.5 each unchanged; Unavailable not drawn afterwards. | `x9v4-main-phone-webkit/` |
| X10 | merged | phone 402 WebKit | PASS | Ranger cut (End 1000), then 60 letters in his End, Tab. Note "…01234567 is not a time. Try 0900 or 09:00." — ink 30–372 inside its border 29–373, 2 lines. Box healed to HIS end 10:00; a Ground box tapped → Unavailable redrawn, Ranger's row first, 08:00–10:00 (address now his own leave), Hex 08:00–17:00. | `x10-merged-phone-webkit/003-X10-1-note.png`, `005-X10-2-unav-after-ground.png` |
| X10 | merged | 320-wide Chromium (touch) | PASS | Ink 31–289 inside 29–291, 3 lines; healed to 10:00; row in place. | `x10-merged-p320-chromium/003-X10-1-note.png` |
| X10 | main | phone 402 WebKit | FAIL (expected — the old fault) | Ink runs to 399, border's inner edge 373 — the long word spills over the border. Healing and the row are right (10:00; Hex untouched). | `x10-main-phone-webkit/003-X10-1-note.png` |
| X10 | main | 320-wide Chromium (touch) | FAIL (expected — the old fault) | Ink to 400 on a 320-wide screen (inner edge 291) — off the screen. Healing right. | `x10-main-p320-chromium/003-X10-1-note.png` |
| M9 | merged | phone 402 WebKit | PASS | Shared all-day leave. Available crew already sits above Unavailable (SANS Avail between); a mouse drag by its grip on the touch phone did not move it (order unchanged), so the day was walked in that order. `1800` in Ranger's Start (not left), his End tapped and `2359` typed at once: End box top 461.9 → 461.9 (0px), the same box, caret kept, value "2359". Available crew WAS rewritten while the caret sat in End (its height unchanged, 284px: Ranger joins the 1st wave, 32 → 33 can fly). Saved: Ranger own 18:00–23:59; Hex all day throughout. RECORD Available crew: before, no Ranger; while typing in End, Ranger shown (1st wave); after, Ranger shown. | `m9-merged-phone-webkit/` |
| M9 | main | phone 402 WebKit | PASS | Same 0px and store; Available crew NOT rewritten while the caret is held — Ranger appears there only after the caret leaves. | `m9-main-phone-webkit/` |
| M9 | merged | desk 1440 Chromium | PASS | No drag needed (Available above Unavailable). 0px (654.6), "2359" kept, Ranger 18:00–23:59, Hex all day. Available crew rewritten at once with Ranger (height 174 unchanged). (The first desk run's drag dropped Available BELOW Unavailable — a script aiming slip; set aside, rerun as `m9v2`.) | `m9v2-merged-desk-chromium/` |
| M9 | main | desk 1440 Chromium | PASS | Same; Ranger shows in Available crew only after the caret leaves. | `m9v2-main-desk-chromium/` |

## FAILs in full

**X8 (a) — merged and main, phone 402 WebKit.** Fixture: a shared overseas duty (OD) for Ranger + Hex, Wed 15 Jul 08:00–12:00, filed
through the Inputs page's window, under Unavailable, nothing changed. Presses: Ranger's Start tapped, Ctrl+A, `0900` typed and NOT
left; Reject on Ranger's row pressed by `element.click()` (the caret stayed in Ranger's Start — read); the blank middle of the
Unavailable heading tapped. EXPECTED (the brief, D737): nothing of Hex's changes by a box or button on Ranger's row. SEEN: the
Reject note says "2 people's OD taken out of Unavailable" and the store at once reads `OD Ranger+Hex 480-720 acc=r` — the whole
shared duty, Hex's part too, rejected; on leaving, the typed 09:00 lands on that shared duty: `OD Ranger+Hex 540-720 acc=r` —
Hex's start is now 09:00. Neither man is under Unavailable. Pictures `x8a-merged-phone-webkit/002-X8a-1-after-reject.png`,
`003-X8a-2-caret-left.png` (opened: the note and the empty Unavailable list). **`main` shows the same** (`x8a-main-phone-webkit/`)
— not new with the merge. Contrast X4: when Ranger's row had already been cut (End 1000 first), Reject took only HIS duty.

**X10 on main (expected, the old fault):** the 60-letter note spills past its border (ink to 399 / 400 against an inner edge of
373 / 291). The merged build keeps it inside. Not a merge fault.

## Notes for the host

- **Undo cannot keep the caret, on either build** (X1 a/a′/b/d, X7): a WebKit tap, `element.click()` with no blur, and a Chromium
  phone tap all end with the caret on the page body; the focusout fires while the box is still on the page with no new target,
  so it is the app's own Undo that lets go of the caret, then the list is rewritten. The risky path X1 named (typing on a
  bare-addressed row after an Undo re-joins the men) therefore could not be reached here. What WAS seen: on the merged build a
  visit to another section rewrites Unavailable under the caret and the remaining shared row loses the man's name from its
  address (on main it keeps it until the caret leaves the Board); every save after that still reached the right man.
- Reject (X4, X8) and the ⋯ / OIL Earn items (X9) DO keep the caret with `element.click()`; a WebKit tap lost it.
- X6 on the phone: once a puck is armed the crew drawer covers the Ground Programme boxes — the scenario's tap cannot be made
  there; walked on the desktop instead.
- Merged-only differences seen (all as A promises): Personal Inputs, its folded count, and Available crew are updated while the
  caret is still held in Unavailable; main updates them only after the caret leaves.

## Page errors

None on any run (every run's page-error list empty).

## Not walked / could not be made

- The Undo "keeping the caret" step of X1 (a), (a′), (b), (d) and X7's three presses — COULD NOT BE MADE (three tries: WebKit tap,
  `element.click()`, Chromium phone tap); the rest of each was walked with a fresh tap, as recorded.
- X6 on the phone — COULD NOT BE MADE (drawer covers the box); desktop in its place.
- M9's "drag Available crew above Unavailable by its grip" on the phone — not needed and not made (already above; the mouse drag on
  the touch phone did nothing).
- X9 with a real tap (only `element.click()` was used for ⋯ and OIL Earn).

## Scripts and commands

All in `scripts/handpass/`, run from `raptor-port/` through `bash scripts/handpass/r4wf-ma-run.sh <script> <folder> <merged|main> <size> <engine> [ENV=…]`
(which sets `WR4_OUT`, `WR4_NEW`, `SHR_BUNDLE`, `SZ`, `ENG`; logs in `.tmp/r4wf-ma/logs/`, results in `.tmp/r4wf-ma/res-*.json`):
- `r4wf-ma-lib.mjs` (helpers over `shr-a-lib.mjs`: `keepPress` with KEEP=tap|js and the focusout record, `groundRmks`, `inputsDay`),
  `r4wf-ma-show.mjs` (prints a result file), `r4wf-ma-probe.mjs`, `r4wf-ma-probe2.mjs` (looks, into `.tmp/r4wf-ma/`).
- `r4wf-ma-x1.mjs`: `… x1<s> <b> phone webkit SUB=<a|a2|b|c|d> KEEP=tap CONT=1` for both builds; tries `x1a merged … SUB=a KEEP=tap`,
  `x1a-js <b> … KEEP=js`, `x1a2-js <b> … SUB=a2 KEEP=js`, `x1a-try3 merged phone chromium SUB=a`.
- `r4wf-ma-x4.mjs`: `x4open <b> phone webkit PI=open M2=1 KEEP=tap`; `x4open-js merged … PI=open KEEP=js`; `x4open-try3 merged phone chromium PI=open`;
  `x4open-m2 <b> … PI=open M2=1 KEEP=js`; `x4fold <b> … PI=fold KEEP=js`.
- `r4wf-ma-x6.mjs`: `x6 <b> phone webkit`; `x6 <b> desk chromium`.
- `r4wf-ma-x7.mjs` (v2): `x7v2 <b> phone webkit KEEP=js` (v1's `x7` folders misjudged by a step-index slip).
- `r4wf-ma-x8.mjs`: `x8a <b> phone webkit KEEP=js`.
- `r4wf-ma-x9.mjs` (v4): `x9v4 <b> phone webkit KEEP=js` (`x9`, `x9v2`, `x9v3` folders: earlier tries that did not reach OIL Earn / stopped at the blank tap).
- `r4wf-ma-x10.mjs`: `x10 <b> phone webkit`; `x10 <b> p320 chromium` (320×700, touch).
- `r4wf-ma-m9.mjs`: `m9 <b> phone webkit`; v2 `m9v2 <b> desk chromium` (v1's desk runs set aside).
