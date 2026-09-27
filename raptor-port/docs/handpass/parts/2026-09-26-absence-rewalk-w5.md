# [HUMAN-RETEST] the absence record — RE-WALK W5: the orders and the lifecycle, on the rebuilt app (26 Sep 26)

Re-walker W5 (Opus 5.5), per `raptor-port/docs/superpowers/briefs/2026-09-26-absence-rewalk-brief.md`. The rebuilt app on
`http://localhost:4175`, bundle `index-KbvILaPW.js` (checked before the first run). A fresh demo world per script, driven
through the app's own controls; reads of `window.*` only for the tables. The first walk's scripts, pictures and logs are
untouched: every script re-run is a COPY `raptor-port/scripts/handpass/ab/rw-w5-*.mjs` (AB_WHO `rewalk/w5`), its output
`docs/handpass/parts/2026-09-26-absence-rewalk-w5-*.txt`, its pictures `docs/img/handpass/2026-09-26-absence/rewalk/w5/`
(names below without the folder or `.png`). Where a man's place on the QUALS page matters (W5-F1, FR2, FR4) it was read
there too — the page's own "All" view filtered to his callsign, and its "Archived" fold opened (`rw-w5-lib.mjs quals`).

**Result by finding: 6 PASS, 1 FAIL.** W5-F1, W5-F3, W5-F4, W5-F5, FR2 and FR4 behave as register §12 says, at both
widths. **W5-F2 FAILS: the vanishing row is still there.** The road through "Undo post out" is closed, but the same
vanish has a second road that needs no undo, found by bisecting (NF1): the Leave War shown on a LATER month before a man
is posted out from an earlier one. Plus one new wording finding (NF2) and four observations. **Console errors: none**
in any run (every `errors` array empty — no console error, page error or 4xx).

---

## The re-walk table

| finding | what must happen now (register §12) | what I saw | desktop | phone | pictures |
|---|---|---|---|---|---|
| **W5-F1** "Undo post out" after a Post out that archived him | "Undo post out" takes the Post out's archive back — the man's row, bids and leave come back | Cobra (PO 1 Aug, archive on — archived, in the Quals Archived section) → the posting sheet's Undo: his row back in July and September, 10–11 Sep LL and the 14 Sep LL (placed through "Place leave or OIL here instead…") kept, no PO tag; Quals: on the ROSTER, the Archived fold gone; the war's Undo + Redo after it leave the two pages agreeing; a reload keeps it. Drifter the same (June/July row, 17 Jul LL without the tag, on the roster) | **PASS** | **PASS** | `rw-w5-05-desktop-A0-quals-after-postout`, `-A4-after-undo-post-out`, `-A4b-after-undo-post-out-jul`, `-A4c-quals-after-undo-post-out`, `-B2-quals-cobra-after-reload`; phone `rw-w5-05-phone-A4-after-undo-post-out`, `-A4c-…`; `rw-w5-05b-{desktop,phone}-3b-quals-drifter-after-undo`, `-4b-quals-cobra-roster` |
| **W5-F2** a later Post out does not make the man vanish | (with F1) the row follows his dates and records (CURRENT-STATE item 13, answer C) | (i) **the undo road is closed:** `rw-w5-05d` V0–V4 all keep Drifter's July row — V2 (another man's Post out + Undo) and V4 (+ a reload) included; `rw-w5-08`'s last Post out after five posting moves keeps Recon's row. (ii) **the vanish itself is NOT fixed:** in `rw-w5-05`'s own world the published-Friday pair (Drifter, Ace) vanish from every July day after their Post out — 2 runs of 2 at desktop; and in a fresh world with NO undo at all, the war shown on SEP (or AUG) first, then JUL, then Drifter posted out from 15 Jul: his row is gone (SXO · 11, the SXO count row still 12 on 1–14 Jul). See NF1 | **FAIL** | **FAIL** | NF1's |
| **W5-F3** Tab stays in the open sheet; a war switch closes it | every Leave War sheet holds Tab / Shift+Tab; a war switch closes the open cell and the event sheet | Bid sheet on Ranger's 28 Dec: 45 Tabs and 45 Shift+Tabs never leave it (the picker, Stage advance and the zoom buttons are never reached); the switch to JAN–DEC 27 (made by the driver on the picker — no person can reach it with a sheet open) closes the sheet; nothing written on 28 Dec in either war. **The same for every other sheet** (the first walk's (d) left them unproved): read-only "Leave from Raptor", the tap list, the posting sheet, the event sheet, the drag-selection sheet — 40 Tab + 40 Shift+Tab each stay inside; the switch closes each | **PASS** | **PASS** | `rw-w5-06b-{desktop,phone}-1-sheet-open-picker-reach`, `-2-after-switch-sheet`, `-4-war26-after`; `rw-w5-06d-{desktop,phone}-<sheet>-1-open` / `-2-after-war-switch` (sheet = bid-sheet, read-only, tap-list, posting, event, selection) |
| **W5-F4** beside ATT C 09:00–14:00 no afternoon is offered | a half is offered only when it can be taken, read off the real hours | ATT C 09:00–14:00 on 12 Aug: the tap opens the read-only sheet ("Filed on the Inputs page — change it there, not here."), no bid sheet, no LL, no afternoon. Control ATT C 08:00–11:00: the afternoon offered and the LL> bid lands. ATT C 13:00–17:00: only the morning offered ("The afternoon is C>, filed on the Inputs page — change that there."), the <LL bid lands. The timed refusal ("ATT C runs 09:00–14:00 that day …") could not be reached through the screens — the sheet no longer offers a half the medical touches (the register's "wherever it is still reached") | **PASS** | **PASS** | `rw-w5-02b-{desktop,phone}-b-0900-1400-tap`, `-a-0800-1100-tap`, `-a-0800-1100-after-pm-bid`, `-d-1300-1700-tap` |
| **W5-F5** the heading reads "now <LL" | the bid sheet heading speaks the box's notation | "now <LL" beside a filed morning LL; "now <C" beside a morning medical; "now C>" beside an afternoon one — each as its box. (The READ-ONLY sheet's heading still prints the stored form — NF2) | **PASS** | **PASS** | `rw-w5-02b-{desktop,phone}-c-heading-beside-morning-LL`, `-a-0800-1100-tap`, `-d-1300-1700-tap` |
| **FR2** a Post out that archived him, moved to a date to come or with the switch off | he is back on the Quals roster at once; the posting archives him again when its date has come | Every door: **(a)** Cobra, PO 15 Aug (archived) → the posting sheet's date box to 15 Oct: the sheet reads "Posted out from 2026-10-15", Quals ROSTER at once, the war draws him in September and hatches from 15 Oct. **(b)** Gambit, PO 15 Aug → "Archive on PO date" OFF: "Stays on the Quals roster (custom)", ROSTER at once, the posting still hatched from 15 Aug; the switch ON again → archived again at once (the date has come). **(c) control** Wisp, PO 15 Aug → date to 18 Aug (still past): stays ARCHIVED. **(d)** Piston, PO 1 Aug → the bid sheet's PO again from 20 Oct: ROSTER. **(e)** Cinch, PO 1 Aug → the drag-selection's Post out from 20 Oct: ROSTER. A reload keeps all of it | **PASS** | **PASS** | `rw-w5-08-{desktop,phone}-FR2a-1-quals-after-po`, `-FR2a-2-posting-sheet`, `-FR2a-3-after-date-to-15-oct`, `-FR2a-4-quals-after-move`, `-FR2a-5-war-after-move`, `-FR2b-1-after-switch-off`, `-FR2b-2-quals-after-switch-off`, `-FR2b-3-quals-after-switch-on-again`, `-FR2c-quals-after-move-to-18-aug`, `-FR2d-quals-after-bidsheet-po-to-20-oct`, `-FR2e-1-selection-post-out`, `-FR2e-2-quals-after-selection-po` |
| **FR4** a man archived BY HAND with a future Post out: "Undo post out" | the date clears and he STAYS archived; a hand archive is never taken back by a posting door | Hunter, PO 2 Nov (not archived) → Quals: Enable editing → the red ✕ → archived by hand → the war still draws him (a posting keeps him) → the posting sheet on 10 Nov → Undo post out: Quals ARCHIVED (Gambit, Hunter, Wisp in the fold), not on the roster; his row leaves the war (a hand archive with no posting — as designed). **FR4b** Drifter, the same hand archive: the posting date moved (2 Nov → 15 Dec) and the switch turned OFF — still ARCHIVED after each. A reload keeps it | **PASS** | **PASS** | `rw-w5-08-{desktop,phone}-FR4-1-quals-x-before-archive`, `-FR4-2-quals-archived-by-hand`, `-FR4-3-war-after-hand-archive`, `-FR4-4-posting-sheet`, `-FR4-5-quals-after-undo-post-out`, `-FR4b-1-quals-after-date-to-15-dec`, `-FR4b-2-quals-after-switch-off`, `-reload-quals` |

**Checks, by script** (final runs; raw lines in the `.txt` files):

| script | desktop | phone |
|---|---|---|
| `rw-w5-05-postout-file.mjs` (W5-F1, the published pair = F2) | 12 PASS · 1 FAIL (P-same-both-orders — F2), twice (`-desktop-run1.txt`, `-desktop.txt`) | 11 PASS · 0 FAIL (the pair kept at 390 — why not, not established) |
| `rw-w5-05b-postout-row-probe.mjs` (W5-F1, Quals added) | 5 PASS | 5 PASS |
| `rw-w5-05d-vanish-trigger-probe.mjs` (the old F2 trigger) | 5 PASS (V0–V4) | — (desktop only, as the first walk) |
| `rw-w5-05h-first-month-probe.mjs` (NF1) | H1 FAIL · H2 PASS · H3 FAIL · H4 FAIL · H5 PASS | H1 FAIL · H2 PASS |
| `rw-w5-06b-stale-sheet-probe.mjs` (W5-F3, three checks added) | 4 PASS | 4 PASS |
| `rw-w5-06d-sheet-hold.mjs` (W5-F3, every sheet) | 12 PASS | 12 PASS |
| `rw-w5-02b-medical-hours-control.mjs` (W5-F4 / F5) | 4 PASS | 4 PASS |
| `rw-w5-08-fr2-fr4.mjs` (FR2, FR4, F2, reload) | 12 PASS | 12 PASS |

Driver corrections, for the record (not the app): the FR2 postings were re-dated from 1 Aug to 15 Aug and FR4b's from
1 Dec to 15 Dec, because a posting dated the 1st of a month hides his row in that month, leaving no hatched day to tap
(observation O2; the first runs are kept as `…-08-{desktop,phone}-run1.txt`, `…-06d-{desktop,phone}-run1.txt`);
`rw-w5-06b`'s "nothing written" check first failed on its own pattern ("NO CELL" contains "LL") and was re-run.

---

## NF1 — W5-F2 is still live: a man posted out from a month EARLIER than the one the war was first shown on vanishes

**What happens.** Open the Leave War, press **SEP** (or AUG), then **JUL**, and post a man out from a July date. His row is
gone from July — every day, the ones he was in included — and with it his leave and bids; the group heading drops a
man (SXO · 11) while the SXO count row still counts him on 1–14 Jul. Pressing another month (JAN) and then JUL again brings
the row back; so does a reload. **No "Undo post out" is needed.** The road the first walk found (another man's "Undo post
out", V2) is closed on the rebuilt app; this second road to the same symptom never went through it.

**Steps from a fresh world (admin `ad`).** (1) Leave War → press **SEP**. (2) Press **JUL**. (3) Tap Drifter's 14 Jul → PO →
date 2026-07-15 → leave "Archive on PO date" as it is → "Post out from 2026-07-15". (4) July: no Drifter row (the SXO group
reads 11). Controls, the same world otherwise: the war shown on JUL first (H2) — the row stays, hatched from 15 Jul; a
Post out dated AFTER the first month shown (SEP first, PO from 1 Oct — H5) — the row stays. Waiting 20 s on September
before going to July (H4) changes nothing: it is not a timing race. Script `rw-w5-05h-first-month-probe.mjs` (H1–H5,
`[desktop|phone]`); a person reaches it the same way on a phone (H1 phone FAIL).

**How it was found (the bisect).** `rw-w5-05`'s published pair vanished on the rebuilt app (2 runs of 2) though
`rw-w5-05d` V2 no longer did. `rw-w5-05e` (fresh worlds, one prefix each — T0–T16: the Cobra steps, the Gambit steps, a
reload, the counts read, publishing, and their pairs) kept the row every time; `rw-w5-05g` (rw-w5-05 with steps left out)
lost it whenever the Cobra or the Gambit step ran first — both begin by opening the war on SEPTEMBER. T17–T19 then lost it
with nothing but "the war opened on September first" (T19). Records: `…-rewalk-w5-05e-T*.txt`, `…-05g-desktop-skip-*.txt`,
`…-05f-desktop.txt` (the canary copy — its first canary's Post out opened the war on JULY before anything else, and the
pair survived there: consistent with the trigger). The evidence points to the month the war was FIRST shown on in the
sitting — a war first shown on July and only later moved to September (T1, T16) kept the row — with one exception not
explained: `rw-w5-05` at 390 px (the war first on September, then a reload) kept its pair, while H1 at 390 px lost the row.

**Rule.** CURRENT-STATE item 13 (the row follows his dates and records); answer C (his leave is shown and charged). The
first walk's F2 and its "who it hurts" stand unchanged; the evidence sheet §3's W5-F2 line ("its trigger is gone with
W5-F1's fix") is not borne out.

**Who it hurts.** An admin who looks at a later month and then posts someone out: the man, his leave and his bids seem to
vanish from the war. Nothing is lost (a month jump or a reload shows him), but it reads as data loss, and while hidden
his leave cannot be seen or decided there.

**Pictures:** `rw-w5-05h-desktop-H1-0-war-first-on-09` (the start), `rw-w5-05h-desktop-H1-1-after-postout` (July, no
Drifter, SXO · 11), `rw-w5-05h-desktop-H2-1-after-postout` (control: Drifter hatched from 15 Jul, SXO · 12),
`rw-w5-05h-desktop-H3-1-after-postout` (AUG first), `rw-w5-05h-phone-H1-1-after-postout`, `rw-w5-05h-*-H1-2-after-reload`;
in the order's own world `rw-w5-05-desktop-P1-published-friday-both` (and `run1/` of the same name).

## NF2 — the read-only "Leave from Raptor" sheet's heading prints the stored notation: "*ATTC" beside a box reading "<C"

**What happens.** W5-F5's fix reached the bid sheet's heading ("now <LL"); the read-only sheet still prints the stored
code. Tapping Ranger's 12 Aug (ATT C 09:00–14:00) shows the box "<C" and the sheet heading "*ATTC" — the star notation,
and "ATTC" without its space. **Steps:** Inputs: ATT C for anyone, custom 09:00–14:00; Leave War: tap that day.
**Rule:** one notation on screen (the box's — W5-F5). **Who:** anyone reading the sheet; cosmetic, low. **Pictures:**
`rw-w5-02b-desktop-b-0900-1400-tap`, `rw-w5-02b-phone-b-0900-1400-tap`. (The same raw print sits in two more sheet
headings in the code — "Decide a bid" and the remarks editor — NOT walked.)

## Observations (not findings)

- **O1 — the 09:00–14:00 medical gives no reason on its sheet.** The box is drawn as a morning ("<C"), the tap offers
  nothing, and the sheet says only "Filed on the Inputs page — change it there, not here." — not that the medical runs to
  14:00, which is why no afternoon is offered (`rw-w5-02b-*-b-0900-1400-tap`). The first walk's F4 "who it hurts" (he is not
  told he could bid from 14:00 on the Inputs page) is only half answered.
- **O2 — a Post out dated the 1st of a month leaves no hatched day in that month.** Pressing that month's button hides
  his row (he is out for all of it), so the posting sheet — Undo post out, the date, the switch — cannot be reached from
  that month; on a phone, taps on 2 and 10 Dec found no box for a man posted out from 1 Dec, and 30 Nov opens the bid sheet
  (`rw-w5-08c-phone-tap-2026-12-10`, `rw-w5-08b-*-aug`; `…-08b.txt`, `…-08c-phone.txt`). The bid sheet's PO on a day he is
  in still moves the date. Reaching his hatched days by scrolling from an earlier month was not tried.
- **O3 — the posting sheet on a man archived by hand** still says "Moves to the Quals archive on that date." (FR4's
  Hunter, already archived — `rw-w5-08-desktop-FR4-4-posting-sheet`).
- **O4 — neither a posting move nor the sheet's "Undo post out" is on the war's timeline:** after FR2a's move the war's
  Undo was disabled ("Undo the last change"); after W5-F1's "Undo post out" the war's Undo took back the step before it
  (the LL placed on 14 Sep through "Place leave or OIL here instead…") and Cobra stayed on the Quals roster — consistent
  with the first walk's R28 (a posting is not on the timeline); recorded (`…-05-desktop.txt`, A-topbar-undo-after-sheet-undo-RECORD).

## Not walked, and why

- The timed refusal's wording ("ATT C runs 09:00–14:00 that day …") — unreachable through the screens now (W5-F4 row).
- The range bid across a timed medical (the first walk's O2 wording) — not re-walked.
- NF1's cause (which window state hides the row) — a walker's finding, not a diagnosis; nor why `rw-w5-05`'s pair survives
  at 390 px while H1 does not. Phone for `rw-w5-05d` and `rw-w5-05h` H3–H5 (desktop only).
- The Quals "Save changes" toast wording (seen in the page's code while writing the driver, not on screen).
