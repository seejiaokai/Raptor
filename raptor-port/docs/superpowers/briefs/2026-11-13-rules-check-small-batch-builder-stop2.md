# [RULES-CHECK-FIXES] the small batch (D2009, D2010, D2014, D2015) — the builder's final report, after the walks, the reads and the gates (13 Nov 26, 07:00, chat 67's night)

Saved by the night's coordinator as it arrived. Branch `claude/rules-check-small-batch`, last commit `019d0d2cf`
(build `300be6535`; walks, reads, fixes `5ec8aec9f`; the sheet closed `019d0d2cf`). No pull request (cut from the
unmerged 762). The evidence sheet: `docs/handpass/2026-11-13-rules-check-small-batch.md`; the three read reports
`docs/handpass/parts/2026-11-13-rcsb-read-astra.md`, `-read-opus.md`, `-read-fixes.md`.

## What the app now does
- **D2009:** the two checks are named "On leave + planned" and "Downchit + planned" (were "On leave + flying",
  "Downchit + flying"): on the Logic page and its search ("planned" and "leave" find them; "flying" finds no check), as
  the bold name in the Edit Schedule and View-only warning lists, in the day's info panel and in Insights' Conflicts by
  type, for an admin and a member alike. The messages are unchanged; the Scheduler Board still shows only the message.
- **D2010:** where the day's last flight has no landing typed: "Monday took off 12:00 with no landing typed, +2h debrief
  assumed → ended 14:00 → crew rest clear at 02:00, but told to report 01:40 — only 11h40 rest." (old: "Monday landed
  12:00, +2h debrief assumed → …"). It covers a blank landing, "TBD" and any other word that is not a time; a typed
  landing keeps "landed", even one equal to the take-off. The same sentence on the board, the warning lists, the day's
  info panel, View-only, the tight-turn note and the ALL AVAIL window, and across the week's edge; it follows the
  debrief setting.
- **D2014:** already built — a published day's OIL has followed the "Full day of OIL" it was published under since
  [OIL-WORK-START] (D592 (4)); the question's premise was wrong. Now pinned by tests and shown on screen both ways:
  after a Logic change the issued figure stays on the Leave War box and its window, the person window, the OIL tracker,
  Balances, View-only and a look at the Original; the day reads "1 pending" and "Not yet signed", and To go out names
  the OIL change; after Publish AL1 every one of those places moves to the new figure. Only the board's OIL Earn shows
  the working copy's answer at once, as D2013 rules. **One real fault found by the blind Opus read and fixed red-first:**
  the red "no usable times — nobody on it earns OIL" line on a published day moved at once with a Logic change while
  the Leave War still credited the day; it now follows the values the day was published under.
- **D2015:** the strip reads "1 setting changed from the squadron standard. Days not yet published use it now. A
  published day keeps the settings it was published with, for its checks and its OIL, until its next amendment is
  published." (two settings: "use them now"; a member's strip adds " Only an admin can change them."). Old: "… The
  schedule is checked against it now. A published day keeps its printed B and its OIL until it is published again."

## The Walk line
`Walk: docs/handpass/2026-11-13-rules-check-small-batch.md · 572 pictures · 26 surfaces · 17 orders · MISSING: 0 fixed, 0 ruled, 1 filed (the IT flow guide's deck, D403)`

The one MISSING cell: the IT flow deck (`scripts/itflow/content.mjs`, two slides) still has the old names; re-made only
on his word (D403).

## Findings
From the walk — no fault in the four rulings. W1-1 not a fault (the four sign-off boxes always read "— name — / 4 to
sign" for the next amendment; "Not yet signed" and the greyed Publish AL1 show the change waiting). W1-2 not a fault
(after Undo and Redo of AL1 the head reads 16 changes against 14: the two extra are the Undo and Redo lines in the
change history). W1-3 older, to file: an admin's tap on an FO*/HO* box opens the bid sheet, not the member's
"· approved" window. W1-4 known (D2013): OIL Earn shows the working copy's answer at once — a question, below. W1-5
older, to file: on a PC the Leave War's person window and OIL tracker do not close on a tap outside. W1-6 older, to
file: the Logic page's refusal says "(worked mins)". W1-7 (Astra's side question): a question, below. W2-1 older, to
file: the crew list shows no crew-rest reason for a man already seated. W2-2 older, to file: no Insights button on the
phone's Edit Schedule. W2-3 as ruled: the Inputs day panel does not close on a tap beside it (docked, D1143).

From the reads — Opus 1: the red "no usable times" line (above), fixed with three tests (all red with the fix removed),
re-walked, 4 PASS. Opus 2: the IT flow deck. Opus 3: two comments said the opposite of D2014 — fixed. Opus 4: the strip
counts the late cut-offs among "settings changed" though the LATE tag is drawn live — a question, below. Opus 5: two
old walk scripts use the old name — left, records of past walks. Astra 1: the reference copy of the original app raised
no crew-rest warning for "TBD" and kept the old names — fixed red-first with a new comparison test; nothing a person
could meet. Astra 2: `engine-rules.md` and the register's AM7 said OIL is the only way a Logic change makes a published
day pending; the printed brief lead (D186) is the other — both corrected, and the sheet's D592 (4) row. The narrow read
of the fixes: sound; a missing test (nothing credited, so nothing pending) and a stale comment — both fixed.

Readers: scenarios by Astra, before the build; the code read by Astra and a fresh, blind Opus reader, blind to each
other; the fixes by another fresh, blind Opus reader; Sol 6.1 not called. Walkers Sonnet (W1, then W2); the builder ran
its own route first and the re-walk itself.

## Gates (on his PC under the checks lock, 06:32–06:55, commit `5ec8aec9f`)
Unit PASS — 832 files, 14,306 passed, 20 skipped. Build PASS. The original's 728 assertions PASS, 728/0. Tracker smoke
PASS, 472/0. Rule check and document check PASS. **Browser tests FAIL — 1,207 passed, 117 skipped, 1 failed:** the Leave
War's "a month button scrolls the grid to that month" on desktop (September 1 landed 1.11px under the frozen column,
the test allows 1px). This branch touches no Leave War screen, style or grid code; run alone it failed 2 of 5; on the
branch's parent code it failed 1 of 8 too. The cause is in the test: it waits until the distance, rounded, is at least
−1 (so −1.5 passes the wait), then demands at least −1. Not changed (never weaken a test) — to file; GitHub's run of
the pull request is the full check.

## Pictures for him (under `docs/img/handpass/2026-11-13-rules-check-small-batch/`)
- The renamed checks: `w2/N1/d-07-g0-logic-list.png` (the Logic page), `w2/N1/d-03-a-edit-strip.png` (the warning list,
  a flying row and a BRIEFING row).
- The new strip: `w1/s6-pc/s6-admin-one.png`.
- The crew-rest line: `w2/N4-blank-pc/d-03-tuesday-edit-strip.png`.
- A published weekend's OIL: `w1/s1/s1a-lw-grid.png` (HO* when published), `w1/s1/s1b-lw-grid.png` (still HO* after the
  line was lowered; the pending mark `w1/s1/s1b-edit-head.png`), `w1/s1/s1c-lw-grid.png` (FO* after AL1).
- The fixed red line: `rw1/b2-view.png`, `rw1/b3-edit-issues.png`, `rw1/c2-view.png`.

## Questions for him (the case first)
1. **The open-ended row's assumed hour on a published day.** A published Saturday has a "Briefing" at 09:00 with no
   end, holding ALL AVAIL 45; its window reads "09:00–10:00 · no end time, an hour assumed". Then "Any other row" is
   changed from 1h to 2h on the Logic page: the published day reads "09:00–11:00 · 2 hours assumed" at once; nothing
   reads pending, no AL1 is offered, nobody earns OIL either way. The scheduler page (D360, the agent's reading) says
   such a change "reads pending"; D2005 keeps a published day's settings, this one among them, but the window uses
   today's. Recommended: the published day keeps its 1h until its next amendment, no pending mark, and the D360 line
   reworded. Waiting on it: a small engine change, red-first, and that line.
2. **Should OIL Earn on a published day also show the issued figure?** Recommended: no — leave it as D2013 has it; To
   go out already says it plainly.
3. **The strip counts the late cut-offs among "settings changed".** Recommended: leave it — LATE is a mark, not a check.

## For the coordinator's records
- Scheduler page: the D2009, D2010, D2014, D2015 lines move from "Not built yet" to built lines (the words in the
  Stop 1 report); D2010 prints the day's full name; D2014's line: "follows the "Full day of OIL" it was published under
  (built since [OIL-WORK-START], D592 (4); pinned and shown 13 Nov 26), and so does its red "no usable times" line"; in
  "A Logic change never starts a flag…", "its OIL is to keep… not built" becomes built.
- D2014's full row: the premise corrected — already built (D592 (4), 5 Oct 26); the build was tests plus the one
  red-line fix.
- The D360 line ("reads pending") is not what the app does — reword once question 1 is answered.
- To file: the IT flow deck's two slides (D403); an admin's FO*/HO* tap opens the bid sheet; the Leave War's person
  window and OIL tracker do not close on a tap outside (PC); "(worked mins)" in the Logic refusal; the crew list shows
  no reason for a seated man; no Insights button on the phone's Edit Schedule; the flaky month-button browser test.
- The project guide's "no rule versioning" line (D2024), suggested: "no rule versioning beyond a published day's own
  copy: a published day is checked by, and keeps its OIL from, the Logic settings it was published under (its printed
  B, D186; every check, D2005; its OIL's report lead, debrief and full-day line, D592, D2014) until its next amendment;
  the rulebook itself keeps no history."
- A lesson worth adding to the order's list on his word: a warning drawn live on a published day is also a reader of
  the Logic setting, so it belongs in a roll-call of this kind — the read caught it, the roll-call had not listed it.

## Traps met
`npx tsc -b` caught a test vitest had passed; `--window-size` counts in screen points at 125%, and `viewportSize` is
null with `viewport:null`; `../../` log paths land outside the repo; stopping a helper leaves vite listening — stop it
by its port; the day's issues list stays folded until its bar is pressed; "1 pending" holds a non-breaking space; the
browser gate rewrites two tracked pictures (`docs/img/handpass/2026-10-27-lw-m4/d1444/f1-decided-*.png`) — restored by
the coordinator, not committed. The builder compacted three times (about 04:04, 04:55, 06:30).
