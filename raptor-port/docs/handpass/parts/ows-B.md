# Walker B — the reporting lines and where the day starts (OIL-WORK-START, 6 Oct 26)

Frozen build on http://localhost:4294. Desktop 1440×900; phone 390×844 for S09 and S24. Every fixture through the app's own controls ("+ Wave", the line's boxes, the crew list, "+ In-time / Rally" and the line's own box and ✕, the four sign-off selects, Publish / Publish AL, the Logic page's box, the top bar's Undo / Redo, the Leave War event row for PH). Each scenario in a fresh world. Every "holds"/"moves" step read all three downstream numbers: the Leave War cell, the worked times (the OIL tracker row, which prints the stored periods) and the balance B, plus the day's waiting chip (`.dpend:not(.dnew):not(.dchg)`), the To go out words and the sign-offs. Balance column = tracker balance of the man, baseline B = 0 each time. On a published day "sign-offs fallen" = the day head's "Not yet signed" mark; "stand" = no mark.

**Result: 81 PASS, 0 FAIL, 17 RECORDED, 0 NOT WALKED in the final runs** (98 table rows; JSON: `docs/handpass/parts/ows-B.json`). No defect found by this share.

## The table

| # | What I did | What the screen said | Verdict | Pictures |
|---|---|---|---|---|
| S09 | Ranger on a new Sat flying line 12:00–13:00 (crew list), no line; four sign; Publish. Then "+ In-time / Rally" (it put "09:00H: IN TIME + WX/NOTAMS"), typed IN TIME 08:30; then four sign + Publish AL | Published: cell HO, worked 09:00–15:00, balance 0.5, nothing pending. Typed: chip "1 pending", sign-offs "Not yet signed", To go out: "WAVE 1 · In-time / Rally — 0 In-time / Rally lines → 1 In-time / Rally line" (no Logic line); cell HO / 09:00–15:00 / 0.5 hold. AL1: FO, 08:30–15:00, balance 1, nothing pending | PASS | dk-*-S09* |
| S09 phone | same at 390 wide | same numbers; To go out list readable, nothing clipped | PASS | ph-*-S09ph* |
| H-03 | Insights → Work hours, Ranger, at the three points | 18h (published, no in-time) → 18h (08:30 typed on working copy, bar 61%) → 20h30 (after AL1, bar 70%). His OIL day: 09:00–15:00 (6h00) → same paid → 08:30–15:00 (6h30). No verdict | RECORDED | dk-*-S09{a,b,c}-insights |
| S33.a / .b | 12:00–13:00 no line; and IN TIME 08:59; each published | a: HO, 09:00–15:00, +0.5. b: FO, worked 08:59–15:00, +1 | PASS ×2 | dk-*-S33* |
| S25 | one line typed IN TIME 0830 / 08:30 / 0830H / 0830L / 830, five worlds | each: box kept "…08:30(H/L)", FO, worked 08:30–15:00, +1 | PASS ×5 | dk-*-S25_IN_TIME* |
| S25 bare | the line typed literally `08:30` and `830` (no words) | kept as "08:30"; FO, 08:30–15:00, +1; no warning | RECORDED | dk-*-S25_bare* |
| S26 | lines: IN TIME 8h30 / 25:90 / FL240 / plain words / RALLY AFTER IN TIME | all: HO, 09:00–15:00, +0.5. Words: 8h30 and 25:90 → "reporting line 1 has no recognised clock. Check the time."; RALLY AFTER IN TIME → "rally after in-time has no applicable in-time clock."; **FL240 and the plain words: no warning at all** | PASS ×5 (+3 words rows RECORDED) | dk-*-S26* |
| S27.a/.b | `0830 IN TIME — brief 1000`; `FL240 0830 IN TIME — brief 1000` | both FO, worked 08:30–15:00, +1 (first usable clock) | PASS ×2 | dk-*-S27* |
| S27.c | Ranger front, Echo (WSO) rear, line `IN TIME 0830 — Ranger to brief` | Ranger FO 08:30–15:00 +1; Echo (not named) FO 08:30–15:00 +1 | PASS | dk-*-S27c* |
| S28 | two lines VIPER (Ranger) / COBRA (Saber); typed IN TIME 08:30 and `VIPER IN TIME 10:00`; published; then wave-wide RALLY 09:00 via "+"; Publish AL | before: Ranger HO 10:00–15:00; Saber FO 08:30–15:00. RALLY typed: 1 pending, both hold. AL1: Ranger HO 09:00–15:00 (+0.5), Saber FO 08:30–15:00 (+1), nothing pending. (Existing hard word "in-time 10:00 is later than suggested brief 09:40" shown, publish not blocked.) | PASS ×2 | dk-*-S28* |
| S29 | 01:00–02:00; two in-times typed in each order (23:00,00:30) and (00:30,23:00) | both orders: HO, worked 00:00–04:00, +0.5 | PASS ×2 | dk-*-S29* |
| S30 | Sat 01:00–02:00, IN TIME 22:00, published; changed to 21:59; AL | 22:00: HO, 00:00–04:00, +0.5; Friday cell empty. Typed 21:59: 1 pending, HO holds. AL1: FO, 00:00–04:00, +1; Friday still empty | PASS ×2 | dk-*-S30* |
| S31 | Mon 20 Jul "PH" on the Leave War event row; week chip "Jul 20"; flight 01:00–02:00, Vandal (a free man), IN TIME 21:59; published; chips Jul 13 → Jul 20; reload | Monday FO, worked 00:00–04:00, +1; Sunday empty; after week moves and after reload the same, ORIG, nothing pending. (First try with Ranger showed a second period 05:40–13:55 — he already had a Monday duty; re-done with Vandal) | PASS ×2 | dk-*-S31* |
| S32 | Sat 22:00–01:00, IN TIME 20:00; published; Logic debrief 2h → 1h30 | FO, worked 20:00–23:59, +1, Sunday empty. After: 0 pending, sign-offs stand, cell/worked/balance unchanged, Sunday empty. (The candidate's 390 min / 02:30 end is not shown by any surface without a pending item — not read) | PASS ×2 | dk-*-S32* |
| S23 | "+ In-time / Rally" on week and board, twice each; (a) no report, (b) after 08:30 typed; (c) take-off and landing blanked | (a) every new line "09:00H: IN TIME…", published HO 09:00–15:00 +0.5. (b) new lines "08:30H: IN TIME…", published FO 08:30–15:00 +1. A second press adds another line, it does not reset. (c) button gives "IN TIME + WX/NOTAMS" with no clock; hard word "the VIPER line has no usable times — nobody on it earns OIL for this day"; publish went through, cell empty, balance 0 | PASS ×3 | dk-*-S23* |
| S24 | published IN TIME 08:30 (FO). (a) typed 10:00, Escape; then ✕ on the line, AL. (c) separate world: committed 10:00, AL | Escape: line stays 08:30, 0 pending, FO 08:30 holds. ✕: 1 pending, FO 08:30 holds, AL1 → HO 09:00–15:00 +0.5. Commit 10:00: 1 pending, FO holds, AL1 → HO 10:00–15:00 +0.5 | PASS ×3 | dk-*-S24* |
| S24 phone | same three at 390 wide | same | PASS ×3 | ph-*-S24ph* |
| S34 | 12:00–12:00 no line; then IN TIME 12:00 + AL; then Logic debrief 2h → 0 + AL | HO 09:00–14:00 +0.5 (words: "takes off and lands at the same time… the day still earns from the report and debrief"); then HO 12:00–14:00 +0.5; debrief 0: chip 1 pending, paid holds, To go out "Flight debrief after land 2h → 0 min / Ranger · OIL half day · 12:00–14:00 → nothing"; AL2: cell empty, balance back to 0; the same-time advisory still says it "earns from the report and debrief" (known `[OIL-ZERO-SPAN-SORTIE]`) | PASS ×3 (+words RECORDED) | dk-*-S34* |

### The ordered pairs {T+, T~, T−} × {P, A, Lr} — 36 runs, both orders, from unpublished and from published, all PASS

Flight 12:00–13:00; a line `IN TIME 10:00` prepared BEFORE the pair for T~ and T−; the four sign as part of P / A. After each step: cell, worked, balance, chip, sign-offs, To go out words. After the second step: Undo, Redo, reload read as well. Pictures `dk-*-pair_*`.
- **Unpublished start:** T then P (any T): nothing paid until P, then HO 10:00 (T+), FO 08:30 (T~), HO 09:00 (T− → nominal), balance +0.5 / +1 / +0.5, ORIG, sign-offs stand; Undo → draft, nothing paid; Redo and reload → the same. P then T: paid holds (09:00 / 10:00 / 10:00 HO), 1 pending, "Not yet signed". A is **absent** (no button) on a never-published day in both orders, nothing changes; Lr alone changes nothing and raises nothing.
- **Published start:** P is absent (already ORIG). T+→A: AL1 HO 10:00–15:00; T~→A: AL1 FO 08:30–15:00 (+1); T−→A: AL1 HO 09:00–15:00; each button was locked until the four signed; A→T: A absent first (nothing pending), then T leaves paid held with 1 pending. **T+ with Lr: "2 pending"** in both orders, To go out lists both the line change and "Logic · Nominal report before T/O 3h → 2h30 / Ranger · OIL half day · 09:00–15:00 → half day · 09:30–15:00"; paid HO 09:00 holds. T~ or T− with Lr (line 10:00 published): Lr alone raises nothing (0 pending, sign-offs stand); after T the chip stays "1 pending" (no Logic line).
- Undo on T+ takes back only the typing (T+ is two steps: the "+" press, then the typing), so the day still reads pending; Redo and reload agree.

## Findings
None confirmed as defects. Things the screen did that the host may want to weigh:
1. **`IN TIME FL240` gives no warning** (nor does plain prose). 8h30 and 25:90 do ("no recognised clock"). OIL falls back to nominal correctly in all cases (S26). Steps: board, wave, "+ In-time / Rally", type `IN TIME FL240`, leave the box; the box and the day's list say nothing. Pictures dk-*-S26_IN_TIME_FL240*.
2. A line with only a clock and no words (`08:30`, `830`) is accepted as an In-time (FO 08:30–15:00). The scenario text is ambiguous about this; reported as seen.
3. H-03: Insights' work hours move by 2h30 (18h → 20h30) after the 08:30 in-time is published, while the OIL day moves by 30 min (6h00 → 6h30); on the working copy Insights does not move.

## Errors seen
None: console errors, page errors and 4xx lists were empty in all 20 script runs.
My own faults, fixed and re-run (their rows excluded): first S09 and S32.2 read the sign-offs from the four selects (empty on a published day) — now read from the "Not yet signed" mark; the first pair runs judged P / A before signing (the button is locked until signed); S31 first used a man with a Monday duty.

## Not walked
Undo → Redo → reload around every single step of S09, S23–S34 (done only for the 36 pairs, and S31's week moves / reload); reporting-line writer variants (Rally lines in the pairs, week-surface typing, Reset to standard and cold reload as the L writers); the pairs at phone width; S29 reversed by controls on a published day (done as two typed orders instead); the candidate-only figures (S32's 390 min, S33's) since no surface shows a candidate without a pending item.

**Pictures: 654 files saved in `docs/img/handpass/2026-10-06-oil-work-start/B/` (about 100 of them from two superseded runs); 21 opened and looked at (every FAIL-prone and "holds" kind once: tracker rows, To go out lists, boards, Insights, phone).**
