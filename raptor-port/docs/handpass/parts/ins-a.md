# Walker A — [INSIGHTS-WHICH-COPY] walk (D477, D478) — 1 Oct 26

Served build `http://localhost:4211` (frozen), a fresh copy of the demo data per scenario. Desktop 1440×900 (`dk-`) and
phone 390×844 (`ph-`). Scripts `scripts/handpass/ins-a-*.mjs`; step table `docs/handpass/parts/ins-a.json`; pictures
`docs/img/handpass/2026-10-01-insights/a/`. "Identical" below means the window's whole text and title matched word for word.

## 1. The table

| # | What I did (the app's own controls) | What the window said · what the day beside it said | Verdict | Pictures |
|---|---|---|---|---|
| 1 | Both widths. Published Tuesday; Insights left open, then the board opened; read the board's bar; a waiting change made ON the board (desktop: Anvil dragged onto Rebel's seat; phone: CX on a line); ✓ Done; Insights; Publish AL1 | Board bar: Calendar, Highlight, Templates, Sort all, Undo, Redo, History, Sync, bell, ✓ Done (phone: ⋯ holds Sort all, Desktop layout). No Insights door at either width — the top-bar button is covered by the board (desktop) / the ☰ is covered (phone). A window opened BEFORE the board stays up, on top, same words. Counting half: Tuesday "1 pending" → window identical to Original; after AL1 it moved (desktop: Anvil off the idle list, Rebel on, hours swap; phone: Sorties 32→31, Tuesday 8→7) | RECORDED (door) · counting half PASS | dk-01…09-s1, ph-01…10-s1 |
| 2 | Both widths. Board ✕ on Go 2's RU in-time line; published Tuesday; Logic → Edit rules → Flight debrief 2h→3h, then Nominal report 3h→4h; Publish AL1; reload | See §2 "Scenario 2 numbers" | RECORDED | dk-01…10-s2, ph-01…10-s2 |
| 3 | Both widths. Monday (draft) board: Outlaw's late line made early; Tuesday published; then that line's landing put back to 20:45; top-bar Undo | Before: Tuesday 3 issues, no crew-rest line, Crew rest 0. After the Monday edit, at once: published Tuesday list 4 issues with the crew-rest line (View-only and Edit Schedule), dotted mark on Outlaw's Monday puck, window Tuesday 3→4 and Crew rest 0→1, week tile 32→35 (Monday 14→16 + Tuesday's one). Tuesday NOT pending, still Original; Monday still draft. Undo: all three signs gone, window identical | PASS | dk-01…13-s3, ph-01…13-s3 |
| 4 | AL1 current (seat + CX). Plans picker → Original (read-only look) on Edit Schedule; Back to live copy; same look from the board's picker | Day says "Viewing the issued Original — read-only", Rebel drawn; window stays AL1 (31 sorties) — identical before, during, after; identical after the board's look too | PASS | dk-01…08-s4 |
| 5 | Draft Tuesday: + Alt Plan, Plan B made different (seat, CX, landing); Plan A published; picker → Plan B; Publish AL1. Repeated with every plan gesture made from the BOARD's picker | After the switch: day shows Plan B, "3 pending", Not yet signed; window identical to Plan A on Edit Schedule, View-only Sched and Inputs. AL1: Sorties 32→31, Tuesday 8→7 sorties and 4→3 issues, Anvil/Rebel swap, Ace 25h35→27h05, Hex 3→2 — together. Board variant the same | PASS | dk-01…08-s5, dk-01…03-s5b |
| 6 | Published Tuesday (4 issues); ✕ on Static's long work day; reload; AL1; ↺; reload; AL2 | Tile / Long work day / Tuesday: 33·2·4 → (hide waiting) 33·2·4 → AL1 32·1·3, struck line still in the published list → (unhide waiting) 32·1·3 → AL2 33·2·4. Tile = sum of types = sum of days each time | PASS | dk-01…13-s6 |
| 7 | Board: Rebel dragged off his seat; dragged back; Anvil dragged on; AL1 | Removed: pending, window identical. Put back: chip gone, no "Not yet signed", signed line reads Original, window identical. Replaced: pending, window identical. AL1: Rebel onto the idle list, Anvil off; Rebel 5h25→20 min, Anvil 15h→20h05; Aircrew 38, Sorties 32, Formations 16 unchanged | PASS | dk-01…09-s7 |
| 8 | Board: CX on one line (reason WX) and on both lines of a formation; reload; AL1 | Waiting (before and after reload): identical. AL1: Sorties 32→29, Formations 16→15, Tuesday 5 sorties · 3 formations, Hex 3→2, four men join the idle list, Aircrew 38→34; tiles = sum of days | PASS | dk-01…07-s8 |
| 9 | Board: RU T/O 14:40→16:40; reload; AL1. Then VL T/O two hours earlier; reload; AL2 | Waiting: day shows 16:40, pending; hours and warnings identical. AL1: four men +2h. Second move waiting: identical while the working day already read 5 issues. AL2: Static 21h20→19h20, Long work day 2→1, Tuesday 4→5, tile 33→34 — in one step | PASS | dk-01…13-s9 |
| 10 | Board: + Row on duties (RSO 08:00–11:00, Vandal dragged on); + Item on Ground (13:00–15:30, Zulu dragged on); AL1 | Waiting: "2 pending", no bar for either man. AL1: Vandal 3h, Zulu 2h30 appear; nothing else moves | PASS | dk-01…06-s10 |
| 11 | Inputs → Add input: LL for Rebel; timed Duty for Anvil; leave deleted; AL1; leave filed and deleted again; filed once more; AL2 | Each waiting state: Tuesday pending, window identical (over Inputs, on top). AL1: only Anvil 15h→17h30 — the abandoned leave never shows. Round trip: back to no pending, AL1, signed. AL2: On leave + flying 1→2, Tuesday 4→5, matching the published list | PASS | dk-01…11-s11 |
| 12 | Tuesday published with a waiting CX; Wednesday draft: seat, formation CX, time, ✕ on a warning; Publish day | Every Wednesday change moved the window at once (Anvil off idle; Sorties 32→30, Formations 16→15; Trident 6h55→8h55; Wednesday 4→3 issues, tile 30→29). Tuesday's row never moved (8 sorties). Publishing Wednesday: window identical | PASS | dk-01…11-s12 |
| 13 | Admin, then member (Ranger): View-only Sched → Tuesday "Working draft — not issued"; back | Day shows Anvil and 16:40, "Not yet signed · 3 pending"; window identical to the Original, on top; unchanged on switching back | PASS | dk-01…10-s13 |
| 14 | Waiting seat change; top-bar Undo / Redo; the board's Undo / Redo; AL1; Undo; Redo | Undo: Rebel back, not pending; Redo: pending again; the board's pair gives the same two states; window identical throughout. AL1 moves it. Undo ("publishing an amendment"): day Original with the change pending, window identical to Original; Redo: AL1 again, identical | PASS | dk-01…08-s14 |
| 15 | AL1 current: look at Original → Load onto working copy → reload → Unpublish. Separately: plain Unpublish, then Unpublish again | Load: working copy holds Original's content, day AL1 "2 pending", window still AL1. Unpublish: day Original, window identical to Original. Plain Unpublish: AL1's edits stay pending, window reverts to Original. Second Unpublish (draft): window counts the working copy at once | PASS | dk-01…13-s15 |
| 16 | Week chip Jul 20; back; 📅 Jump to a date → 22 Jul; the board's own ‹ › week step | Title "Jul 20 – Jul 26", 17 sorties, all seven rows new, no section carried over; back is identical to week 1 (AL1 world, title too); date picker and board step give the same two windows | PASS | dk-01…09-s16 |
| 17 | One flow: reload after Original, pending, AL1, Load Original, Unpublish | Each reload: window, version tag, pending chip, marker, signed line and View-only count unchanged | PASS | dk-01…10-s17 |
| 18 | Both widths. Published Tuesday with a waiting change; door over every page offered — admin (9 pages), admin's member view (7), member Ranger (7) | 46 openings: identical contents, right title, window topmost at its centre, fits the screen, last row (Sunday) reachable. Guest: excluded by the brief | PASS | dk-01…23-s18, ph-01…23-s18 |
| 19 | Both widths. Saturday and Tuesday published, a waiting edit on each; recorded day head, list, ⓘ, CSV, print sheet, OIL Earn pucks, Leave War OIL tracker, stored rows; Insights opened / scrolled / closed 9 times over 3 pages; recorded again; reload; again | Every recorded value unchanged character for character; no stored row changed (231 → 231). The print sheet's "Generated <minute>" clock stamp was set aside | PASS | dk-01…14-s19, ph-01…14-s19 |

## 2. Findings

**Scenario 2 numbers (RECORDED for the host, both widths the same).** Original · debrief 3h · report 4h · after AL1 · reload:
Rebel 4h45 → 5h45 → 5h45 → 5h45 → 5h45 (Cinder, Vapor, Marlin move the same hour); week issues tile 33 → 35 → 37 → 37 → 37;
By day Tuesday 4 → 5 → 7 → 7 → 7; Tuesday's own bar on Edit Schedule 4 → 5 → 7 → 7 → 7 and on View-only Sched the same;
pending chip none → "1 pending" → "1 pending" → none (AL1) → none. So the Work hours bar and the warning figures moved
together, at the moment of the rule change, while Tuesday was still Original — and so did the published day on
View-only Sched. Tuesday turned "1 pending · Not yet signed" (Amendments: "1 change · what the published day shows
changed") and offered Publish AL1; publishing it moved nothing further. The report-lead change added warnings but not
hours (Rebel stayed 5h45). Pictures dk-03…08-s2.

**F1 — a negative Work-hours figure (side observation, low; likely older than this build).** Fresh world, nothing
published. Monday's board: Go 2's RU line T/O 19:20 → 10:00 and LD 20:45 → 11:25, leaving the wave's in-time line
"1920H: NIGHT WAVE RU IN TIME"; ✓ Done; Insights. Expected: no negative hours. Happened: "Wisp -2h-30" drawn with a
full-width bar (longest in the list), "Outlaw 10 min"; Monday's issues list says nothing about either man.
Pictures dk-01…03-s3x.

No other defect found. Scenario 1's missing door is recorded, not judged.

## 3. Errors seen

None — no console error, page error, 4xx or native dialog in any run.

## 4. Not walked, and why

- 18: a guest — excluded by the brief.
- 4–17 were walked at desktop width only (the brief asks for both widths on the first three and where a scenario says so: 1, 18, 19).
- 1 on a phone: the waiting change was a line's CX, not a seat — on a phone a tap on a filled seat picks the man up, and I did not find a reliable finger gesture to replace him.
- 8: the board has no formation-level CX; the formation was cancelled by its two line CX buttons.
- 10: "+ Row" on an existing duty block, not "+ Block".
- 19: "Leave War award/balance" was read from the OIL tracker's per-person balances; no hand-given award was created.
- A repo status check at the end printed the other walker's two result file NAMES; I did not open them.

## 5. Pictures

281 saved, 281 opened.
