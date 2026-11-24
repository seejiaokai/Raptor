# w14b report — the change lines and the read rule through ticks and postings (B1, B2, B3, B4, B7, B9), chat 174, 25 Nov 26

Walker: a fresh Opus. Build `index--V1bS7d_.js` (dist as it stood, `f3f0e7388` + `e80742fc5`), served on 4812 (bundle name
proved), not rebuilt; server stopped by its port at the end. Clock Wed 15 Jul 26 09:00, running. Each case a fresh browser
context, desktop Chromium 1536×864 and iPhone WebKit 402×874 (touch, scale 3, a picture right after each tap).

- Step table: `raptor-port/docs/handpass/parts/swd/w14b-walk.md` (per-scenario summary, finding-candidates, lessons, every step).
- Deciding pictures, cropped: `raptor-port/docs/img/handpass/2026-11-24-sans-words/w14b/` (126, named `<run>__<picture>`).
- Scripts: `raptor-port/scripts/handpass/swd-w14b.mjs`, `swd-w14b-lib.mjs`, `swd-w14b-env.mjs`, `swd-w14b-probe.mjs`,
  `swd-w14b-probe2.mjs`, `swd-w14b-report.mjs`, `swd-w14b-pics.mjs`. Raw runs and logs: `D:/raptor-work/c174-walk/w14b/`.
- Recipes appended for w14c–d: `D:/raptor-work/c174-walk/recipes.md` (P6, Hex's sign-in and demo days, the top bar on Quals).
- Runs cited: desktop `run1` + `run2` (b3, b7a, b9iii, b9iv); phone `run1p` + `run2p` (the same four). Run 1 stopped those four
  at set-up — the script's own check (a man posted from a LATER date reads not-SANS in his record until that date; the sheet said
  "On 17 Jul: becomes SANS."); the check was changed to the sheet's words and the four re-walked whole. Run 1's rows for them are
  not cited.

## Counts

282 judged steps (desktop 141, phone 141): **PASS 202 · FAIL 0 · RECORDED 80 · NOT WALKED 0**. Besides them: 144 set-up steps
(all landed) and 22 error watches (console errors, page errors, 4xx, failed requests): none. Desktop and phone said the same
words at every RECORDED step (compared as text).

## Faults

None.

## Probes proved

- P0: the served page on 4812 loads `index--V1bS7d_.js`, the same as `dist/assets`.
- **P6 — NO.** A reload of Saber's own tab opens the sign-in card; signed in again his top-bar Undo is "Undo", greyed (before the
  reload "Undo — Ranger's quals"). A second tab also opens on the sign-in card. The read-then-Undo cases (D2's read case,
  `0eaacc411`'s Redo after a read Undo, round 2's struck Redo) stay test-only; not walked.
- Hex signs in `hex` / `x`; his demo seats Wed 15, Thu 16 (RCP). Ranger's demo Thu 16 wave 2 FCP. The top bar Undo / Redo of a
  Quals tick: "Undo — Hex’s quals" → "Undid: Hex’s quals", "Redid: …".
- A Meeting filed by Saber for Ranger through the Inputs calendar's day → "+ Input" (B3, both sizes).

## RECORDED finding-candidates (for the host to put to him)

1. **B9 — a SANS that ends and starts again is news, all four ways, both sizes.** Untick → tick; untick → Undo → Redo → tick;
   Undo post out → post again; another outcome → SANS again: each time the reminder he had READ comes back UNREAD, bell lit
   (the build's "a new SANS period is news"; D2560's letter would leave it read). NOT RULED. (B7 (b)'s re-ticks show the same.)
2. **B9 — the "no longer" line stays, unread, after he is SANS again.** In all four B9 cases the title-alone "You're no longer
   SANS. · Saber" / "You're no longer posted out as SANS. · Saber" stays in his bell, unread, right beside "You're SANS from Fri 17
   Jul." / "Your SANS availability is needed." — two lines contradicting each other. B4's C line that carried a sentence went
   whole on the re-tick; a READ title-alone line stays (B7 b). No ruling says when a title-alone line goes. A candidate.
3. **B7 — the same title twice.** W12-1 holds (one sentence, never two lines with the same full words), but after the second
   identical change he reads two lines with one title ("Your SANS date moved to Sat 18 Jul. · Saber" with the sentence and alone;
   B7 b: "You're no longer SANS. · Saber" twice), and each move BACK to his first date adds an unread title-alone "Your SANS date
   moved to Fri 17 Jul." The older lines are kept titled alone, not removed.
4. **B2 (open point 1)** — Undo post out with the tick standing leaves an UNREAD title-alone "You're no longer posted out as
   SANS. · Saber" while he is still SANS by the tick (reminder untouched, read, "Your SANS availability is needed."). After the
   untick that line is gone and only C's line stands: ONE SANS change line in all.
5. **B1 (open point 1)** — "You're no longer SANS. · Saber" / "…filed for Thu 16 Jul is hidden…" for a man still SANS from Fri 17
   by his posting; his reminder above is retitled "You're SANS from Fri 17 Jul." Title before the untick (ticked today, posted
   from Fri 17): "Your SANS availability is needed."
6. **B1 (b)** — untick with the posting standing, nothing filed, reminder read: no change line at all; only the reminder's title
   changes, read (as w11 recorded).
7. B3 — the Meeting's line reads "W14B MEETING" · "Mon 27 Jul" · "You were added · Saber", its own line; all PASS.
8. A lead outside this part, to check, not filed: the reminder line's age reads "9 h" at 09:00 on the day it was made
   (`D:/raptor-work/c174-walk/w14b/run1/b9i-b9i-4-desktop.png`), as if stamped at midnight.

## Not walked / narrowed

- P6's read-then-Undo cases: test-only (P6 said no).
- B2: no Sun 19 sim needed (Hex's reminder already named his demo Wed 15, Thu 16).
- B9 (iv)'s "another outcome" = the posting sheet's SANS chip pressed off, then on (as w11 s13).
- Reminder taps used only to read it; where a tap lands is w14a / w14c's.
- Lesson 19 narrowed (Quals by Done, Post out sheet by ✕, bell by Escape); the rest is E (w14d).
