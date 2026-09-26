# [HUMAN-RETEST] the absence record — RE-WALK W3: the Leave War's gestures, on the rebuilt app (26 Sep 26)

**The bundle walked:** `http://localhost:4175`, `assets/index-KbvILaPW.js` (every script prints it; checked before the first
run — the brief's bundle). **World:** a fresh demo per script, made through the app's own controls; nothing written
through `window`. **Widths:** desktop 1440×900 and phone 390×844 (a real touch device — `hasTouch`, coarse pointer —
wherever a finger matters) at every place the first walk had both; the bulk rectangle and AB3's four paths at desktop only,
as the first walk. **Console / page errors / failed requests: none in any run** (every result file's `errors` line is `[]`).

**Expected** = the register §12 line (`…/specs/2026-09-20-one-absence-behaviour-register.md`). **A PASS below is what I
SAW** in the named picture, not the script's exit code — every picture named here was opened and looked at.

**Pictures:** `raptor-port/docs/img/handpass/2026-09-26-absence/rewalk/w3/` (209; the first walk's `w3/` folder untouched).
**Results:** `raptor-port/docs/handpass/parts/2026-09-26-absence-rewalk-w3-*.txt` (30 files) — **178 PASS / 0 FAIL** lines.

**Scripts** (`raptor-port/scripts/handpass/ab/`, run from `raptor-port/`; the first walk's scripts untouched):

| script | what it is |
|---|---|
| `rw-w3-01-bulk.mjs <act>` | copy of `w3-01-bulk.mjs` → `rewalk/w3`. Checks set to §12: AB7 must read "… already approved"; W3-F3 Delete takes the bid beneath AND the filed leave stays (new check); the Move-beneath check turned into a RECORD (`[LW-MOVE-BENEATH]`, filed); AB2 turned into a CONFIRM (unchanged on purpose). Run: delete, approve, move, and as regression fill, refuse, ack, moveclash |
| `rw-w3-03-postings.mjs [w]` | copy; one change — D3 closes the selection sheet before reading August (the fix now keeps that sheet up with its sentence; the old script expected it closed and timed out on a covered month button — `…THREW-D3…` pictures are from that first run, not the app) |
| `rw-w3-03b-po-archive.mjs`, `rw-w3-04c-tracker-n19.mjs`, `rw-w3-04d-code-follows-days.mjs [w]`, `rw-w3-06-till.mjs` | copies, checks unchanged (they were written as the right behaviour) |
| `rw-w3-05-switch.mjs [w]` | copy; E1 now requires the sheet CLOSED after the switch (the old check also let a sheet "stay but inert" pass); E3 adds "the refusal names the ATT C and the day" |
| `rw-w3-05b-stale-sheet.mjs [w]` | copy; E3 adds the named refusal |
| `rw-w3-05c-tab-reach.mjs` | copy, INVERTED: 80 Shift+Tab then 80 Tab must never reach the war picker; the focus ends inside the sheet; an arrow key then switches nothing |
| `rw-w3-08-roads.mjs [w]` | NEW — every other road to a war switch with a sheet up (below) |
| `rw-w3-08b-phone-move.mjs` | NEW — the phone roads that need a finger-drawn block (selection sheet; move banner) |
| `rw-w3-09-restore.mjs [w]` | NEW — FR1, W3-F8's second half, FR5 |
| `rw-w3-12-event-sheet.mjs [w]` | NEW — FR6 (the event sheet across a war switch) |
| `rw-w3-10-probe-refused-door.mjs [w]`, `rw-w3-11-probe-approved-half.mjs [w]` | NEW probes — things seen on the way (§3) |

---

## 1. The table — every finding re-walked

| finding | what must happen now (register §12) | what I saw | result | pictures |
|---|---|---|---|---|
| **AB7** | bulk Approve says an already-approved leave apart ("… already approved"), counts only what changed | "**2 decided. 1 already approved.** 9 skipped (no bid, or Raptor-owned)." — exactly 2 boxes changed (Dash 16 → Input; Ghost 16 afternoon → a PM Input); Fable's approved 17th untouched. Undo / Redo / reload exact | **PASS** (desktop) | `w3-01-approve-d-note`, `-e-after` |
| **W3-F3 (Delete)** | a dragged block's Delete takes the war's own bid beneath filed leave; the leave filed on the Inputs page stays | Ghost 16: `<LL +1` → `<LL` — the afternoon bid gone, his filed morning (and filed 17th) still there; "5 deleted. 4 skipped" = the 5 boxes that changed; his LVE −2 → −1.5. Undo / Redo / reload exact | **PASS** (desktop) | `w3-01-delete-a-before`, `-d-note`, `-e-after` |
| W3-F3 (Move) — record only | filed as `[LW-MOVE-BENEATH]`; record what it does | unchanged: "Tap a day to **move 2 entries**" — Dash 16 → 20 and Fable 17 → 21 move, Ghost's afternoon bid stays on the 16th (`+1`). The course and the medical never enter the move. Nothing lost | RECORDED | `w3-01-move-c-hover`, `-e-after` |
| AB2 — confirm only | unchanged on purpose (his question) | unchanged: bulk Delete still takes both OIL awards (Dash OIL 3 → 2, Fable 2 → 1); the confirm still reads "Delete 3 days for 4 people? Tap Delete again." with no word of awards | CONFIRMED unchanged | `w3-01-delete-c-confirm`, `-e-after` |
| **W3-F4 / AB5 — Post out sheet's date box** | refused AND said; the box snaps back | typed 1 Jul (before his PI) → box back to 14/08/2026 and the sheet says "**Posted in on 2026-07-08 — the post-out has to be after that day.**" | **PASS** both widths | `w3-03-{desktop,phone}-D1-postout-datebox-refused` |
| **W3-F4 — Post in sheet's date box** | same | typed 20 Aug (after his PO) → box back to 08/07/2026, "**Posted out from 2026-08-14 — the post-in has to be before that day.**" | **PASS** both widths | `w3-03-*-D2-postin-datebox-refused` |
| **W3-F4 — drag-selection's Post out** | same; the sheet stays | PO 01/07/2026 → Confirm → the selection sheet STAYS, "Posted in on 2026-07-08 — the post-out has to be after that day."; nothing changed | **PASS** both widths | `w3-03-*-D3-selection-po-after` |
| **W3-F4 — bid sheet's PO** | same | the bid sheet stays, same sentence under "Post out from 2026-07-01" | **PASS** both widths | `w3-03-*-D4-bidsheet-po-refused` |
| **W3-F5** | the posting sheet a tap opened stays that sheet while its date moves, even past the day tapped | tapped 12 Aug (greyed) → Post out sheet → date to 14 Aug: 12–13 Aug are his again (13 Aug tagged PO) and the sheet is STILL "Echo 2026-08-12 … Posted out from 2026-08-14" | **PASS** both widths | `w3-03-*-C3-after-po-date-moved-past-tapped-day` |
| **W3-F6 — OIL tracker** | an award's code follows its days: a day or more FO | Sidewinder's 0.5 HO made 2 on the tracker → the grid reads **FO**, the bid sheet "FO · 2 days", OIL 2. (Regression: 0.25 / 0.75 / 1.25 / −1 / "abc" still refused with their sentences, 2 lands, one Undo back) | **PASS** both widths | `w3-04d-*-grid-after-tracker`, `-tracker-2-days-sheet`; `w3-04c-desktop-tracker-0.25` |
| **W3-F6 — tap list** | under a day HO | Warden's 1-day FO made 0.5 via Edit… → the line reads "**HO** — OIL award", the box **HO**, the foot "half a day" | **PASS** both widths | `w3-04d-*-taplist-half` |
| **W3-F7 — the keyboard** | every Leave War sheet holds Tab / Shift+Tab | 160 presses (80 each way) with a bid sheet up: the focus went round the sheet's own 22 controls only, never reached the picker (the first walk reached it in 49); an arrow key then switched nothing — still JAN–DEC 26, the sheet still Ridge 15 Dec | **PASS** (desktop) | `w3-05c-after-keyboard-switch` |
| **W3-F7 — a switch closes the open cell** (each sheet) | the bid sheet, tap list, selection sheet, Post out sheet and read-only sheet close on a war switch; nothing written into 27; nothing re-opens in 26 | all five CLOSED (desktop: the picker given the focus, then an arrow; phone: a finger on the picker, then the war picked); 27's records untouched; back in 26 nothing open. (The first walk: the bid sheet, tap list and read-only sheet had become live bid sheets, the Post out sheet stayed) | **PASS** both widths | `w3-05-{desktop,phone}-E1-*-after-switch`, `-back-in-26` |
| **W3-F7 — the published lock** | nothing written past the lock of the war no longer on screen | Basher's approved 16 Dec leave on the PUBLISHED 26 war: the note sheet closes on the switch to 27 (no Clear to press); back in 26 the LL and its Inputs row are still there, stage PUBLISHED | **PASS** both widths | `w3-05b-*-1-published-remarks-sheet`, `-2-after-switch-to-27`, `-4-back-in-26` |
| **W3-F7 — every other road** (`rw-w3-08`, `-08b`) | same | **Desktop:** K1 picker focused by Tab first, then a mouse click on a day → the focus leaves the picker (BODY), the arrow switches nothing; M1 a mouse at the picker / M2 at the war's Undo (which would put 27 up) / M3 at "Edit Schedule" all land on the shade — the sheet closes, nothing undone, the war and page stay; M3b Edit Schedule's own Undo (reached with no sheet up) takes back the 27 bid and puts 27 on the war — nothing stale open on return; MV move mode has no shade and the picker IS reachable by mouse — the switch ends the move, a click in 27 moves nothing. **Phone:** F1 a finger on the war's Undo, F2 on "+ New", F3 on ☰ — each only closes the sheet (nothing undone, no new war, page stays); FV a finger-drawn block → Move… → finger on the picker → 27: the banner is gone, a tap in 27 moves nothing; the finger-drawn selection sheet itself closes when the finger reaches the picker | **PASS** (11 roads) | `rw-w3-08-desktop-{K1,M1,M2,M3,M3b,MV}-*`, `rw-w3-08-phone-{F1,F2,F3}-*`, `rw-w3-08b-phone-{b,c,d,e,f}-*` |
| **FR6** (the event sheet) | the event sheet closes on a war switch too | EVENT 1 sheet on 16 Dec 26 → switch (desktop: picker focused + arrow; phone: finger) → gone; no event row written; nothing on return | **PASS** both widths | `rw-w3-12-*-a-event-sheet`, `-b-after-switch` |
| **W3-F8 — Redo over a medical filed since** | Redo refuses and names what holds the day; the bid stays off the day | Warden's bid undone → ATT C filed on the Inputs page → Redo: "**Can't redo that — Warden's ATT C now holds 8 Dec, and a bid can't go over it.**" (and "… 2 Feb …" in the 27 war); no bid on the day, the box `C` with no amber `!`; the tap opens only the medical's read-only sheet | **PASS** both widths (both scripts) | `w3-05-*-E3-after-redo-refused`, `w3-05b-*-6-after-redo-taplist` |
| **W3-F8 — undoing a filing that replaced a bid** | still gives the bid back, in one step | Wisp's pending LL on 3 Dec → ATT C filed on the Inputs page ("This replaces Wisp's LL bid on 3 Dec on the Leave War"; the bid becomes a notice) → ONE Undo ("a batch of inputs"): the ATT C gone AND the bid back, pending; Redo files the medical and the bid gives way again | **PASS** both widths | `rw-w3-09-*-F8b-a-medical-replaced-bid`, `-F8b-b-after-one-undo` |
| **W3-F9 / AB3 on the war side** | each piece of a cut leave says its own "till" | a 5-day war-approved leave (27–31 Jul, "till 31 Jul") cut four ways: medical on 29 → "till 28 Jul" + "till 31 Jul"; Refuse 29 → same; Delete 29 → same; Move 30–31 → 3–4 Aug → "till 29 Jul" + "**till 4 Aug**" | **PASS** (desktop, 4 paths) | `w3-06-{a,b,c,d}-*-inputs-page` |
| **FR1** | Refuse a bid, Ack it, Undo, file a medical on its day, Redo → refused by name; the bid stays refused | Sidewinder 2 Dec: refused → acked → Undo (refused) → ATT C filed → Redo: "**Can't redo that — Sidewinder's ATT C now holds 2 Dec, and a bid can't go over it.**"; the bid is still "bid refused" on the tap list; the box `C` +1 | **PASS** both widths | `rw-w3-09-*-FR1-b-after-redo`, `-FR1-c-after-redo-tap` |
| **FR5** | a dragged block's Delete over a morning the WAR approved plus an afternoon bid takes both | Gambit 4 Dec: `<LL +1` (war-approved AM Input + PM bid) → drag 4–7 Dec → Delete ×2 ("Delete 4 days for Gambit? Tap Delete again.") → the box empty, no Input, no bid; LVE 7 → 8; one Undo brings both back | **PASS** both widths | `rw-w3-09-*-FR5-b-before`, `-FR5-d-after-delete` |
| S37 (regression, `w3-03b`) | a man posted out (archive on) from a past date keeps his row on the war with his bid | both doors: his row stays with the July bid | PASS | `w3-03b-after-sel-po` |
| Regression — the rest of the rectangle | fill / refuse / ack / a clashing move behave as the first walk | fill "7 written. 5 skipped"; refuse / ack "3 decided" = 3 changed, the approved leave turned back into a refused / acked bid; the clashing move refused whole ("That lands on 2026-07-21 which is already booked"); every Undo / Redo / reload exact | PASS | `w3-01-{fill,refuse,ack,moveclash}-*` |

**Count: 21 rows re-walked (19 for the findings, 2 regression; both widths where the first walk had both) — 21 PASS,
0 FAIL**; plus one RECORD
(Move beneath) and one CONFIRM (AB2), both as the brief asked. Every result line: 178 PASS / 0 FAIL.

## 2. Recorded while walking (not findings)
- **A refused Redo stays offered.** After "Can't redo that …" the Redo button stays lit; each press refuses again with the
  same sentence and writes nothing (`w3-05-desktop-E3-after-redo-refused`).
- **The war's Undo puts the other war on screen.** An Undo whose step was made in 27, pressed with 26 showing, takes it
  back and shows 27 (E2, both widths; M3b from Edit Schedule too) — as the first walk; with a sheet up it cannot be reached.
- **A clean block Delete closes its sheet with no note** (FR5: nothing skipped → the sheet closes; a partial one keeps it
  up with "N deleted. M skipped"). Same on the first walk's single-day delete.
- The dates in the posting sentences and sheet headings are ISO ("2026-07-08") — `[LW-ISO-DATES]`, filed.
- `rw-w3-05-switch.mjs phone` E1-selection drew its block with a MOUSE on a touch device, which selects nothing — that
  check was empty; `rw-w3-08b` walks the same with a finger (PASS).

## 3. New things seen on the way (with steps and pictures)

**N1 (low — wording, and a control offered then refused).** On a day where a **refused** bid sits under a medical filed
since, the tap list still offers that line **Approve** and **Ack**. Both are refused — the bid stays refused, no leave is
written — but the words never name the medical: Ack says only "**Couldn't change that**", Approve "**Couldn't approve —
something else is on that time**". The Redo road to the same state (FR1) says "…Sidewinder's ATT C now holds 2 Dec, and a
bid can't go over it." Steps (fresh world, admin): bid LL for Sidewinder on Wed 2 Dec 26 → tap it → Refuse → Inputs page:
ATT C for him on 2 Dec → back on the war tap 2 Dec → the tap list: "LL — local leave · bid refused  Approve  Ack  Clear"
→ press Ack (or Approve). Both widths. Rules: register §12's named refusal (the same rules at every door, B7); "a
control is never offered to someone who cannot use it" (W1-F3's line). Hurts: nobody's data — the admin reads a vague
refusal and has to guess why. **Not checked against `main`.** Pictures: `rw-w3-10-{desktop,phone}-ack-b-after-press`,
`-approve-b-after-press` (and `-a-taplist`).

**N2 (low — W5-F4's shape at a second door).** On a day whose **morning the war approved**, a tap opens the bid sheet with
the decision row AND "How much: **Whole day** (picked) / AM / PM"; pressing LL with Whole day or AM is refused "**That time
is already taken by LL — clear it first.**" Only PM can be taken. The SAME morning filed on the **Inputs page** offers only
PM, with "The morning is <LL, filed on the Inputs page — change that there." Steps: bid LL AM for Gambit on Fri 4 Dec 26 →
tap → Approve → tap the day again → the sheet (Whole day lit) → LL. Both widths. Rule: register §12 "a half is offered
only when it can be taken" (W5-F4, item D). Hurts: nobody's data (the approved morning is kept, the refusal is said) — the
admin is offered, and pre-picked, a choice that cannot work. **Not checked against `main`.** Pictures:
`rw-w3-11-{desktop,phone}-A-whole-a-sheet`, `-A-whole-b-after-LL`, `-B-am-b-after-LL`, the control `-C-inputs-filed-sheet`.

**N3 (for W4, corroborating).** A finger HELD still on one day and lifted opened nothing on the phone (my first
`rw-w3-08b` run, a 900 ms hold on Ridge 15 Dec, coarse pointer). W4's own re-walk log
(`2026-09-26-absence-rewalk-w4-hold-diag.txt`) shows the same on this bundle: the finger's trailing tap still reaches the
sheet's touch shield and closes the selection sheet. W4-1 is W4's ground; I drew my phone blocks by hold-and-slide instead.

**N4 (cosmetic, maybe deliberate).** The Post out sheet draws an empty band between "PO FROM" and "Undo post out" when there
is no refusal to show (the slot the sentence fills) — `w3-03-desktop-C3-…`, `w3-03-phone-C3-…`. Possibly kept so the
buttons do not move when a sentence appears.

## 4. Not walked, and why
- AB3's four war paths and the bulk rectangle at phone width — the first walk had them at desktop only (touch drag-select
  is W4's).
- W3-F10 (a member's own award outside the window) and AB1 — his questions, unchanged by the fixes; not re-walked.
- The member's side of the war (`w3-07`) — no fix touched it; not re-run.
- A hard reload with a sheet up — a reload closes everything (the sheet state is not kept), not a switch road.

## 5. Console errors
None — no console error, page error or failed request in any of the 30 runs.
