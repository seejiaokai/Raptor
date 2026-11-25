# Walker w13 — the SANS calendar's doors, the crew list, the plain-user round (S6, S8, S18, S19, S20, S21, S24, §7.0a), 24 Nov 26, chat 156

Brief: `docs/superpowers/briefs/2026-11-24-sans-words-walk-brief.md`. Build: `raptor-port/dist` from `99581f03d` (branch
`claude/allavail-sans-postout-141`), served on port 4803, not rebuilt; the server stopped by its port at the end. Clock
installed before load at Wed 15 Jul 26 09:00 (the app's own today logged at the head of every scenario: "Wed Jul 15 2026
09:00"; S18a moves it to Sat 18, S20c/d to Thu 16 then Fri 17, each logged). Each scenario variant in a fresh browser
context. Desktop: Chromium 1536×864. Phone: his iPhone in WebKit 402×874 (isMobile, touch, scale 3, real taps, a picture
straight after each tap in `run1-p/taps/` — 631 of them); for a held finger drag only, Chromium 402×874 with real fingers
over CDP ("phone-chromium" in the table — WebKit's in-page touches drive no pointer events, walk-scripts §4). Everything
staged through the app's own controls; `window.*` only read (the input records, the people records, the history count —
each such read says "read" or names the records).

Scripts: `scripts/handpass/swd-w13.mjs` (the walk, version 2), `swd-w13-lib.mjs` (built on w12's `swd-w12-lib.mjs` → w11's
`swd-w11-lib.mjs` → `sah-w8-lib`, `sah-w10-lib`, `asp-w2-lib`, `sud-w5-lib`), `swd-w13-env.mjs`, `swd-w13-report.mjs` (this
table), `swd-w13-probe.mjs` / `swd-w13-probe2.mjs` (each door tried once: drag, keys, the window's calendar, Saber's Person
box, the month's end).

Runs cited (raw pictures and logs on `D:\raptor-work\c156-walk\w13\`): desktop `run1-d` (whole set, version 2, 267
pictures), phone `run1-p` (whole set, version 2, 260 pictures + 631 tap pictures). Not cited: `probe-d`, `probe2-*`, `try1-*`
(a trial of nine scenarios; its one FAIL, S8a.04, was the script's: on the window's calendar a tap after a whole run starts a
new pick, so a lone tap on Sun 19 made the offer Sun 19 alone — the walk taps Sat 18 then Sun 19). Deciding pictures (40)
copied to `docs/img/handpass/2026-11-24-sans-words/w13/`.

Demo world (w12's probe): Ranger's demo days Mon 13, Thu 16; Hex Mon 13–Thu 16; no demo SANS filing on Fri 17–Sun 19 (the
demo's SANS filings: Zenith Wed 15–Thu 16, others Mon 13–Wed 15). Hex's sign-in is in the demo already ("hex"), not needed
here. Each S6/S19 door: Saber posts Ranger out as SANS from Fri 17 (Leave War → his cell → ⋯ → Post out → SANS → Post out),
then Ranger signs in (or Saber files for him, picking Ranger in the Person box).

**Counts:** 561 steps (set-up rows included; 65 notes not counted) — PASS 503 · FAIL 0 · RECORDED 56 · NOT WALKED 2 ·
pictures: 479 cited in the table (on D:), 631 phone tap pictures, 40 deciding ones in the repo.

## The FAILs
None. Known faults W11-1 and W12-1 were not met (no hand tick with a posting, no back-and-forth move here).

## Errors seen
None at either size: every scenario's console / page-error / failed-request check passed.

## RECORDED — what the screen did where the brief asks to record, and leads for the host
- **The cut of two or more days (S19a, both sizes):** the note reads as ONE run, the approved shape — "Saved Sat 18 – Sun 19
  Jul. Wed 15 – Fri 17 Jul were left out because you're SANS from Sat 18 Jul." (not a list as the brief warned this build
  might say). Picture `s19a-s19a-01-added-desktop.png`.
- **One day kept (S19b):** "Saved Fri 17 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." — one filing, Fri
  17 alone.
- **The existing refusals (S20a, S20c, S20d, S21a, S21b):** a run with no SANS day of his, dragged by Ranger, is refused at
  the calendar door, no window, "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then"; the gap run
  (SANS Wed 15 by Quals, unticked Thu 16, ticked Fri 17 — Wed 15's + Commitment open, Thu 16's greyed "You're SANS from Fri
  17 Jul.") refused whole with the same words, as Ranger and as Saber; nothing ticked: "Tick at least one of Fly / AMT /
  OFT"; a Sat 18 filing already there: "A SANS availability is already filed for one of these days — edit that entry
  instead of adding another". None saved anything; none showed a "Saved" note.
- **S20b (Saber, Wed 15 – Thu 16):** Saber's Person box does not offer Ranger for those days (he is not SANS on them), so
  the refusal is at the box. The window kept its default person, Zenith, and Add was refused by Zenith's own filing on
  those days ("A SANS availability is already filed…"). Nothing saved for anyone. The PASS of s20b.02 rests on this: the
  refusal the walk saw is the Person box's, not the save's.
- **S18a after the date (clock to Sat 18, reload):** Thu 16 still greyed "You're SANS from Fri 17 Jul."; Fri 17 (yesterday,
  his first SANS day) open, no words; Sat 18 and Sun 19 open.
- **S8a, after Hex is taken out and the offer saved:** the note says "Input updated"; Ranger's offer is Sat 18 – Sun 19.
- **S24, desktop hover (as built, D2420's reading):** Ranger's struck name carries the title "Ranger — SANS from Fri 17 Jul:
  no availability filed. File it on the Inputs page's SANS tab."; Hex's "Hex — SANS — no availability filed for today".
  Nothing printed under either name.
- **S24, a seat picked:** the walk armed a Ground Programme row's "+ add" on Sat 18 (Sat has no flying line). The board's
  SANS Avail then read "13 free", Ranger and Hex not struck, nothing printed (a ground row takes a SANS man).
- **Plain-user round:** a press on the sheet's grey surround closes the Leave War's Post out sheet (both sizes); a press on
  Sun 19 behind the SANS day window moves the window to Sun 19 and keeps it open (D641/D642); on the phone the day window's
  six-dot bar dragged down takes it from 854 to 577 tall (top 285) and dragged up brings it back to 854 (D648); View-only
  Sched draws no SANS section; the changes window lists "SANS Availability added · 18 Jul", "SANS Availability deleted · 18
  Jul" and an "Undo — Ranger's SANS Availability" line under "Sat · The day".
- **Lead, to check (not a FAIL, not in EXPECTED):** on the phone every passing note stands at the top of the screen, over the
  SANS day window's own title bar — the date and the ✕. The cut note is two lines and covers both for the seconds it shows
  (`s6a-s6a-01-added-phone-chromium.png`); the ordinary "Input added" does the same (`pu1-pu1-13-added-phone.png`), so the
  place is the app's, not this change's. Whether a tap on the ✕ under it still lands was not tested.

## NOT WALKED, and why
- **s8b.03, both sizes — extending a one-man Hex offer whose day a later date hides:** once Hex's date moves past the offer's
  day, its line is hidden on that day (D2341: hidden everywhere, as if deleted), so no door opens it. The one-man words were
  walked on a new filing instead (s8b.01: "Hex is SANS from Fri 24 Jul: file SANS availability for days from then", no "Take
  him out", nothing saved).
- Not walked as steps of their own: an armed FLYING seat in S24 (Sat 18 has no flying line; a ground row was armed); a quick
  flick drag (every drag moved at an ordinary pace, a finger held 600 ms first); the clock moved without a reload (S18a and
  S20 reload); the held finger drag in WebKit (walked by Chromium's fingers — his iPhone's drag is a look for him); a tap on the
  day window's ✕ while the note covers it (the lead above).

## The lessons of §7.11 (the checklist) — the step that covers each, or why it cannot apply
1. State table: the cut's states — one day left out, several, one day kept, the month's end, none of his SANS days, a gap in
   the middle, nothing ticked, a day already filed, a shared offer (extended, and new), a one-man offer, Cancel, Undo, Redo —
   each a scenario (S6, S8, S19, S20, S21).
2. Drag at speed: forward and reverse, mouse and held finger, at an ordinary pace; a quick flick not walked (NOT WALKED).
3. After every press, what tells him: the note at the foot read from the drawn element (its box and visibility) and
   pictured after every Add, Cancel and Undo; the day's list and the month's counts read after.
4. A window leaving the page working: pu1.08, a press on Sun 19 behind the SANS day window (desktop).
5. Moved into sight: the SANS day shown after each save pictured where it lands; the phone note over its head (lead).
6. Handed to the phone itself: the remark box typed in pu1.12 raises the phone's keys — only his phone shows them.
7. Steered against the phone's motion: nothing here.
8. Approved drawing: every note and hint compared word for word with the brief's words; the drawing check is not this walk's.
9. Every list measured: no new list; the crew list's SANS Avail section read (heading count, struck, printed lines).
10. Hidden and shown again: S18a and S20 reload after moving the clock; no idle wait.
11. Fit-dependent readings: none.
12. Every page a window opens from: the SANS day window from the month and from the bell's tap; + Commitment's window from
    the day; the saved commitment from its day's line; the Post out sheet from the Leave War cell's ⋯.
13. Pinch: none.
14. Keyboard boxes: the month's keys found from the recipe (`sah-w8-lib keysRun`): Shift+→ then Enter, and then Space
    (s6c, s6d, s6h, s19c — across the month's end too).
15. Bars over a scrolling area: none changed.
16. After a refusal at a box: S8a — refused, Hex taken out, saved again; S21 — the window stays open after each refusal.
17. Show / hide controls: the crew panel opened and closed; the board's crew drawer on the phone; the phone window's bar.
18. Print or download: none.
19. A window over another closed each way: pu1 (the bell: Escape, the bell again, a press outside; the SANS day window: ✕,
    Escape, a press outside; + Commitment's window: Cancel, ✕, Escape, ✕ with a remark typed → "Close it and lose them?");
    pu2 (the Post out sheet: ✕, Escape, a press outside; the posted-out sheet: ✕, Escape), desktop and WebKit.
20. Gesture traced: the drags' picked days read while held (`taps/…-held-*.png`); not frame by frame.
21. The test browser's touch is not his phone's: the finger drag is Chromium's CDP fingers, named; his iPhone's drag a look.
22. What is drawn: the note's and the hint's words read from their drawn elements; the deciding pictures opened.
23. What a tap opens, by the rulings: the reminder's tap opens the SANS tab on its first day, + Commitment open (pu1.05,
    D2342); the saved commitment's line opens its window with Delete.
23b. Side-by-side boxes: no new pair; not measured.
24. Against the top bar: the phone note against the window's head (lead); no flick walked.
25. Made in every place it can be put: the cut made by every door (mouse drag both ways, finger drag both ways, keys with
    Enter and Space, the window's calendar), by Ranger and by Saber for him, at the month's end, one day and several.
26. Gesture by what is under the fingers: the picked days read under the held finger before the lift.
27. Neighbouring controls: none moved by these presses.
28. On a phone what a press opens proved on screen: each tap pictured at once (`taps/`) and settled.
29. Today read: S18a and S20 move the clock with a reload (without a reload: not walked).
30. Every phone tap pictured within about 100 ms: yes, `run1-p/taps/` (631).
31. A page fitted to the screen at 125%: not this walk's.

## The step table

| Step | Size | What was done | What the screen said | Result | Picture |
|---|---|---|---|---|---|
| s6a.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6a.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s6a-s6a.f1-postout-open-desktop.png, run1-d/s6a-s6a.f1-postout-sheet-desktop.png |
| s6a.f2 | desktop | set-up: the door: a mouse dragged Jul 16 → Jul 18 | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s6a-s6a-form-desktop.png |
| s6a.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s6a-s6a-01-added-desktop.png |
| s6a.02 | desktop | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s6a-s6a-01-added-desktop.png |
| s6a.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s6a-s6a-01-added-desktop.png |
| s6a.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-d/s6a-s6a-04-16-desktop.png |
| s6a.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6a-s6a-05-desktop.png |
| s6a.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s6a.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6a.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s6a-s6a.f1-postout-open-phone-chromium.png, run1-p/s6a-s6a.f1-postout-sheet-phone-chromium.png |
| s6a.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 16 → Jul 18 | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s6a-s6a-form-phone-chromium.png |
| s6a.01 | phone-chromium | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s6a-s6a-01-added-phone-chromium.png |
| s6a.02 | phone-chromium | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s6a-s6a-01-added-phone-chromium.png |
| s6a.03 | phone-chromium | the window closed after Add | stayed false | PASS | run1-p/s6a-s6a-01-added-phone-chromium.png |
| s6a.04.07-16 | phone-chromium | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-p/s6a-s6a-04-16-phone-chromium.png |
| s6a.05 | phone-chromium | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6a-s6a-05-phone-chromium.png |
| s6a.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s6b.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6b.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s6b-s6b.f1-postout-open-desktop.png, run1-d/s6b-s6b.f1-postout-sheet-desktop.png |
| s6b.f2 | desktop | set-up: the door: a mouse dragged Jul 18 → Jul 16 (reverse) | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s6b-s6b-form-desktop.png |
| s6b.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s6b-s6b-01-added-desktop.png |
| s6b.02 | desktop | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s6b-s6b-01-added-desktop.png |
| s6b.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s6b-s6b-01-added-desktop.png |
| s6b.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-d/s6b-s6b-04-16-desktop.png |
| s6b.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6b-s6b-05-desktop.png |
| s6b.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s6b.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6b.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s6b-s6b.f1-postout-open-phone-chromium.png, run1-p/s6b-s6b.f1-postout-sheet-phone-chromium.png |
| s6b.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 18 → Jul 16 (reverse) | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s6b-s6b-form-phone-chromium.png |
| s6b.01 | phone-chromium | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s6b-s6b-01-added-phone-chromium.png |
| s6b.02 | phone-chromium | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s6b-s6b-01-added-phone-chromium.png |
| s6b.03 | phone-chromium | the window closed after Add | stayed false | PASS | run1-p/s6b-s6b-01-added-phone-chromium.png |
| s6b.04.07-16 | phone-chromium | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-p/s6b-s6b-04-16-phone-chromium.png |
| s6b.05 | phone-chromium | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6b-s6b-05-phone-chromium.png |
| s6b.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s6c.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6c.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s6c-s6c.f1-postout-open-desktop.png, run1-d/s6c-s6c.f1-postout-sheet-desktop.png |
| s6c.f2 | desktop | set-up: the door: focus Jul 16, Shift+→ ×2, Enter (picked 16,17,18) | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s6c-s6c-form-desktop.png |
| s6c.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s6c-s6c-01-added-desktop.png |
| s6c.02 | desktop | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s6c-s6c-01-added-desktop.png |
| s6c.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s6c-s6c-01-added-desktop.png |
| s6c.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-d/s6c-s6c-04-16-desktop.png |
| s6c.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6c-s6c-05-desktop.png |
| s6c.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s6c.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6c.f1 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s6c-s6c.f1-postout-open-phone.png, run1-p/s6c-s6c.f1-postout-sheet-phone.png |
| s6c.f2 | phone | set-up: the door: focus Jul 16, Shift+→ ×2, Enter (picked 16,17,18) | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s6c-s6c-form-phone.png |
| s6c.01 | phone | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s6c-s6c-01-added-phone.png |
| s6c.02 | phone | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s6c-s6c-01-added-phone.png |
| s6c.03 | phone | the window closed after Add | stayed false | PASS | run1-p/s6c-s6c-01-added-phone.png |
| s6c.04.07-16 | phone | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-p/s6c-s6c-04-16-phone.png |
| s6c.05 | phone | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6c-s6c-05-phone.png |
| s6c.errors | phone | console / page errors / failed requests |  | PASS |  |
| s6d.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6d.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s6d-s6d.f1-postout-open-desktop.png, run1-d/s6d-s6d.f1-postout-sheet-desktop.png |
| s6d.f2 | desktop | set-up: the door: focus Jul 16, Shift+→ ×2, Space (picked 16,17,18) | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s6d-s6d-form-desktop.png |
| s6d.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s6d-s6d-01-added-desktop.png |
| s6d.02 | desktop | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s6d-s6d-01-added-desktop.png |
| s6d.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s6d-s6d-01-added-desktop.png |
| s6d.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-d/s6d-s6d-04-16-desktop.png |
| s6d.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6d-s6d-05-desktop.png |
| s6d.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s6d.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6d.f1 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s6d-s6d.f1-postout-open-phone.png, run1-p/s6d-s6d.f1-postout-sheet-phone.png |
| s6d.f2 | phone | set-up: the door: focus Jul 16, Shift+→ ×2, Space (picked 16,17,18) | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s6d-s6d-form-phone.png |
| s6d.01 | phone | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s6d-s6d-01-added-phone.png |
| s6d.02 | phone | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s6d-s6d-01-added-phone.png |
| s6d.03 | phone | the window closed after Add | stayed false | PASS | run1-p/s6d-s6d-01-added-phone.png |
| s6d.04.07-16 | phone | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-p/s6d-s6d-04-16-phone.png |
| s6d.05 | phone | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6d-s6d-05-phone.png |
| s6d.errors | phone | console / page errors / failed requests |  | PASS |  |
| s6e.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6e.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s6e-s6e.f1-postout-open-desktop.png, run1-d/s6e-s6e.f1-postout-sheet-desktop.png |
| s6e.f2 | desktop | set-up: the door: + Commitment on Jul 17, the window's Dates calendar: Jul 16 then Jul 18 | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s6e-s6e-form-desktop.png |
| s6e.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s6e-s6e-01-added-desktop.png |
| s6e.02 | desktop | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s6e-s6e-01-added-desktop.png |
| s6e.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s6e-s6e-01-added-desktop.png |
| s6e.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-d/s6e-s6e-04-16-desktop.png |
| s6e.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6e-s6e-05-desktop.png |
| s6e.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s6e.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6e.f1 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s6e-s6e.f1-postout-open-phone.png, run1-p/s6e-s6e.f1-postout-sheet-phone.png |
| s6e.f2 | phone | set-up: the door: + Commitment on Jul 17, the window's Dates calendar: Jul 16 then Jul 18 | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s6e-s6e-form-phone.png |
| s6e.01 | phone | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s6e-s6e-01-added-phone.png |
| s6e.02 | phone | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s6e-s6e-01-added-phone.png |
| s6e.03 | phone | the window closed after Add | stayed false | PASS | run1-p/s6e-s6e-01-added-phone.png |
| s6e.04.07-16 | phone | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-p/s6e-s6e-04-16-phone.png |
| s6e.05 | phone | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6e-s6e-05-phone.png |
| s6e.errors | phone | console / page errors / failed requests |  | PASS |  |
| s6f.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6f.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s6f-s6f.f1-postout-open-desktop.png, run1-d/s6f-s6f.f1-postout-sheet-desktop.png |
| s6f.f2 | desktop | set-up: the door: a mouse dragged Jul 16 → Jul 18 · Person: picked bane | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person bane:Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s6f-s6f-form-desktop.png |
| s6f.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s6f-s6f-01-added-desktop.png |
| s6f.02 | desktop | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s6f-s6f-01-added-desktop.png |
| s6f.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s6f-s6f-01-added-desktop.png |
| s6f.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6f-s6f-04-16-desktop.png |
| s6f.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Saber for Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6f-s6f-05-desktop.png |
| s6f.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s6f.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6f.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s6f-s6f.f1-postout-open-phone-chromium.png, run1-p/s6f-s6f.f1-postout-sheet-phone-chromium.png |
| s6f.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 16 → Jul 18 · Person: picked bane | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person bane:Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s6f-s6f-form-phone-chromium.png |
| s6f.01 | phone-chromium | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s6f-s6f-01-added-phone-chromium.png |
| s6f.02 | phone-chromium | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s6f-s6f-01-added-phone-chromium.png |
| s6f.03 | phone-chromium | the window closed after Add | stayed false | PASS | run1-p/s6f-s6f-01-added-phone-chromium.png |
| s6f.04.07-16 | phone-chromium | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6f-s6f-04-16-phone-chromium.png |
| s6f.05 | phone-chromium | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Saber for Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6f-s6f-05-phone-chromium.png |
| s6f.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s6g.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6g.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s6g-s6g.f1-postout-open-desktop.png, run1-d/s6g-s6g.f1-postout-sheet-desktop.png |
| s6g.f2 | desktop | set-up: the door: + Commitment on Jul 17, Person → Ranger, the window's Dates calendar: Jul 16 then Jul 18 | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person bane:Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s6g-s6g-form-desktop.png |
| s6g.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s6g-s6g-01-added-desktop.png |
| s6g.02 | desktop | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s6g-s6g-01-added-desktop.png |
| s6g.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s6g-s6g-01-added-desktop.png |
| s6g.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6g-s6g-04-16-desktop.png |
| s6g.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Saber for Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6g-s6g-05-desktop.png |
| s6g.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s6g.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6g.f1 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s6g-s6g.f1-postout-open-phone.png, run1-p/s6g-s6g.f1-postout-sheet-phone.png |
| s6g.f2 | phone | set-up: the door: + Commitment on Jul 17, Person → Ranger, the window's Dates calendar: Jul 16 then Jul 18 | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person bane:Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s6g-s6g-form-phone.png |
| s6g.01 | phone | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s6g-s6g-01-added-phone.png |
| s6g.02 | phone | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s6g-s6g-01-added-phone.png |
| s6g.03 | phone | the window closed after Add | stayed false | PASS | run1-p/s6g-s6g-01-added-phone.png |
| s6g.04.07-16 | phone | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6g-s6g-04-16-phone.png |
| s6g.05 | phone | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Saber for Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6g-s6g-05-phone.png |
| s6g.errors | phone | console / page errors / failed requests |  | PASS |  |
| s6h.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6h.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s6h-s6h.f1-postout-open-desktop.png, run1-d/s6h-s6h.f1-postout-sheet-desktop.png |
| s6h.f2 | desktop | set-up: the door: focus Jul 16, Shift+→ ×2, Enter (picked 16,17,18) · Person: picked bane | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person bane:Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s6h-s6h-form-desktop.png |
| s6h.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s6h-s6h-01-added-desktop.png |
| s6h.02 | desktop | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s6h-s6h-01-added-desktop.png |
| s6h.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s6h-s6h-01-added-desktop.png |
| s6h.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6h-s6h-04-16-desktop.png |
| s6h.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Saber for Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s6h-s6h-05-desktop.png |
| s6h.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s6h.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s6h.f1 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s6h-s6h.f1-postout-open-phone.png, run1-p/s6h-s6h.f1-postout-sheet-phone.png |
| s6h.f2 | phone | set-up: the door: focus Jul 16, Shift+→ ×2, Enter (picked 16,17,18) · Person: picked bane | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person bane:Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s6h-s6h-form-phone.png |
| s6h.01 | phone | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s6h-s6h-01-added-phone.png |
| s6h.02 | phone | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s6h-s6h-01-added-phone.png |
| s6h.03 | phone | the window closed after Add | stayed false | PASS | run1-p/s6h-s6h-01-added-phone.png |
| s6h.04.07-16 | phone | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6h-s6h-04-16-phone.png |
| s6h.05 | phone | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Saber for Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s6h-s6h-05-phone.png |
| s6h.errors | phone | console / page errors / failed requests |  | PASS |  |
| s8a.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s8a.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s8a-s8a.f1-postout-open-desktop.png, run1-d/s8a-s8a.f1-postout-sheet-desktop.png |
| s8a.f2 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s8a-s8a.f2-postout-open-desktop.png, run1-d/s8a-s8a.f2-postout-sheet-desktop.png |
| s8a.f3 | desktop | set-up: Saber files ONE shared Sat 18 offer for Ranger and Hex (+ Commitment, Several, both pucks) | {"iid":"imrldikx7zvgffd","people":"[{\"p\":\"bane\",\"by\":\"stiff\",\"at\":1784077224811},{\"p\":\"rocky\",\"","date":"Jul 18","endDate":null,"sans":{"f":true},"allday":true,"e":1439,"remarks":"","by":"stiff"} | PASS | run1-d/s8a-s8a-f3-form-desktop.png, run1-d/s8a-s8a-f3-saved-desktop.png |
| s8a.f4 | desktop | set-up: Saber moves Hex's PO from to Fri 24 on the posting sheet | "On 17 Jul: becomes SANS." → "On 24 Jul: becomes SANS."  | PASS | run1-d/s8a-s8a-f4-sheet-desktop.png, run1-d/s8a-s8a-f4-moved-desktop.png |
| s8a.f5 | desktop | set-up: the shared offer opened from Sat 18 (its line) | people bane+rocky · several true | PASS | run1-d/s8a-s8a-f5-open-desktop.png |
| s8a.00 | desktop | set-up: the window's Dates calendar: Sat 18 then Sun 19 tapped — the offer's dates read Sat 18 – Sun 19 | picked 07-18,07-19 · "Jul 18 → Jul 19" | PASS | run1-d/s8a-s8a-01-form-desktop.png |
| s8a.01 | desktop | Save through Sun 19: refused with "Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days." | "Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days." · window stayed true | PASS | run1-d/s8a-s8a-01-added-desktop.png |
| s8a.02 | desktop | nothing partly extends: the offer still Sat 18 alone, both men, nothing new made | offer bane+rocky Jul 18 [f] · made none | PASS | run1-d/s8a-s8a-01-added-desktop.png |
| s8a.03 | desktop | Hex taken out under People (his puck pressed off): Ranger alone picked | picked bane · picked bane · picked 07-18,07-19 · "Jul 18 → Jul 19" | PASS | run1-d/s8a-s8a-03-form-desktop.png |
| s8a.04n | desktop | the note after the save (RECORD) | "Input updated" | RECORDED | run1-d/s8a-s8a-04-added-desktop.png |
| s8a.04 | desktop | Save again: Ranger's offer now Sat 18 – Sun 19 | offer bane Jul 18→Jul 19 [f] · window stayed false · made none | PASS | run1-d/s8a-s8a-04-added-desktop.png |
| s8a.05 | desktop | Hex receives no new days (no record of his holds Sun 19) | Hex's records: none | PASS | run1-d/s8a-s8a-04-added-desktop.png |
| s8a.06 | desktop | the SANS month: Sun 19 lists Ranger, not Hex | 19 Jul: Ranger[F All day Saber for Ranger · 15 Jul, 09:00 · changed by Saber · 15 Jul, 09:01] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s8a-s8a-06-desktop.png |
| s8a.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s8a.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s8a.f1 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s8a-s8a.f1-postout-open-phone.png, run1-p/s8a-s8a.f1-postout-sheet-phone.png |
| s8a.f2 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s8a-s8a.f2-postout-open-phone.png, run1-p/s8a-s8a.f2-postout-sheet-phone.png |
| s8a.f3 | phone | set-up: Saber files ONE shared Sat 18 offer for Ranger and Hex (+ Commitment, Several, both pucks) | {"iid":"imrldjcfrjzmn7d","people":"[{\"p\":\"bane\",\"by\":\"stiff\",\"at\":1784077260471},{\"p\":\"rocky\",\"","date":"Jul 18","endDate":null,"sans":{"f":true},"allday":true,"e":1439,"remarks":"","by":"stiff"} | PASS | run1-p/s8a-s8a-f3-form-phone.png, run1-p/s8a-s8a-f3-saved-phone.png |
| s8a.f4 | phone | set-up: Saber moves Hex's PO from to Fri 24 on the posting sheet | "On 17 Jul: becomes SANS." → "On 24 Jul: becomes SANS."  | PASS | run1-p/s8a-s8a-f4-sheet-phone.png, run1-p/s8a-s8a-f4-moved-phone.png |
| s8a.f5 | phone | set-up: the shared offer opened from Sat 18 (its line) | people bane+rocky · several true | PASS | run1-p/s8a-s8a-f5-open-phone.png |
| s8a.00 | phone | set-up: the window's Dates calendar: Sat 18 then Sun 19 tapped — the offer's dates read Sat 18 – Sun 19 | picked 07-18,07-19 · "Jul 18 → Jul 19" | PASS | run1-p/s8a-s8a-01-form-phone.png |
| s8a.01 | phone | Save through Sun 19: refused with "Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days." | "Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days." · window stayed true | PASS | run1-p/s8a-s8a-01-added-phone.png |
| s8a.02 | phone | nothing partly extends: the offer still Sat 18 alone, both men, nothing new made | offer bane+rocky Jul 18 [f] · made none | PASS | run1-p/s8a-s8a-01-added-phone.png |
| s8a.03 | phone | Hex taken out under People (his puck pressed off): Ranger alone picked | picked bane · picked bane · picked 07-18,07-19 · "Jul 18 → Jul 19" | PASS | run1-p/s8a-s8a-03-form-phone.png |
| s8a.04n | phone | the note after the save (RECORD) | "Input updated" | RECORDED | run1-p/s8a-s8a-04-added-phone.png |
| s8a.04 | phone | Save again: Ranger's offer now Sat 18 – Sun 19 | offer bane Jul 18→Jul 19 [f] · window stayed false · made none | PASS | run1-p/s8a-s8a-04-added-phone.png |
| s8a.05 | phone | Hex receives no new days (no record of his holds Sun 19) | Hex's records: none | PASS | run1-p/s8a-s8a-04-added-phone.png |
| s8a.06 | phone | the SANS month: Sun 19 lists Ranger, not Hex | 19 Jul: Ranger[F All day Saber for Ranger · 15 Jul, 09:01 · changed by Saber · 15 Jul, 09:02] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s8a-s8a-06-phone.png |
| s8a.errors | phone | console / page errors / failed requests |  | PASS |  |
| s8b.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s8b.f1 | desktop | set-up: Post out → SANS from 2026-07-24 | "On 24 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s8b-s8b.f1-postout-open-desktop.png, run1-d/s8b-s8b.f1-postout-sheet-desktop.png |
| s8b.f2 | desktop | set-up: the door: + Commitment on Jul 24, Person → Hex, the window's Dates calendar: Jul 18 then Jul 19 | window: picked 07-18,07-19 · "Jul 18 → Jul 19" · person rocky:Hex | PASS | run1-d/s8b-s8b-form-desktop.png |
| s8b.01 | desktop | a one-man filing keeps today's words: "Hex is SANS from Fri 24 Jul: file SANS availability for days from then" — no "Take him out" | "Hex is SANS from Fri 24 Jul: file SANS availability for days from then" · stayed true | PASS | run1-d/s8b-s8b-01-added-desktop.png |
| s8b.02 | desktop | nothing saved | made none | PASS | run1-d/s8b-s8b-01-added-desktop.png |
| s8b.f3 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s8b-s8b.f3-postout-open-desktop.png, run1-d/s8b-s8b.f3-postout-sheet-desktop.png |
| s8b.f4 | desktop | set-up: Saber files a one-man Fri 24 offer for Hex | {"iid":"imrldis1ws59sfl","people":"[{\"p\":\"rocky\",\"by\":\"stiff\",\"at\":1784077234052}]","date":"Jul 24","endDate":null,"sans":{"f":true},"allday":true,"e":1439,"remarks":"","by":"stiff"} | PASS | run1-d/s8b-s8b-f4-form-desktop.png, run1-d/s8b-s8b-f4-saved-desktop.png |
| s8b.f5 | desktop | set-up: Saber moves Hex's PO from to Sat 25 | "On 24 Jul: becomes SANS." → "On 25 Jul: becomes SANS." | PASS | run1-d/s8b-s8b-f5-sheet-desktop.png, run1-d/s8b-s8b-f5-moved-desktop.png |
| s8b.03 | desktop | extend a one-man offer whose day his later date hides | its line is hidden on Fri 24 (D2341: hidden everywhere, as if deleted), so no door opens it: no such line on the day · day list "No commitments yet." | NOT WALKED | run1-d/s8b-s8b-03-noline-desktop.png |
| s8b.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s8b.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s8b.f1 | phone | set-up: Post out → SANS from 2026-07-24 | "On 24 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s8b-s8b.f1-postout-open-phone.png, run1-p/s8b-s8b.f1-postout-sheet-phone.png |
| s8b.f2 | phone | set-up: the door: + Commitment on Jul 24, Person → Hex, the window's Dates calendar: Jul 18 then Jul 19 | window: picked 07-18,07-19 · "Jul 18 → Jul 19" · person rocky:Hex | PASS | run1-p/s8b-s8b-form-phone.png |
| s8b.01 | phone | a one-man filing keeps today's words: "Hex is SANS from Fri 24 Jul: file SANS availability for days from then" — no "Take him out" | "Hex is SANS from Fri 24 Jul: file SANS availability for days from then" · stayed true | PASS | run1-p/s8b-s8b-01-added-phone.png |
| s8b.02 | phone | nothing saved | made none | PASS | run1-p/s8b-s8b-01-added-phone.png |
| s8b.f3 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s8b-s8b.f3-postout-open-phone.png, run1-p/s8b-s8b.f3-postout-sheet-phone.png |
| s8b.f4 | phone | set-up: Saber files a one-man Fri 24 offer for Hex | {"iid":"imrldjj9cvm8m48","people":"[{\"p\":\"rocky\",\"by\":\"stiff\",\"at\":1784077269312}]","date":"Jul 24","endDate":null,"sans":{"f":true},"allday":true,"e":1439,"remarks":"","by":"stiff"} | PASS | run1-p/s8b-s8b-f4-form-phone.png, run1-p/s8b-s8b-f4-saved-phone.png |
| s8b.f5 | phone | set-up: Saber moves Hex's PO from to Sat 25 | "On 24 Jul: becomes SANS." → "On 25 Jul: becomes SANS." | PASS | run1-p/s8b-s8b-f5-sheet-phone.png, run1-p/s8b-s8b-f5-moved-phone.png |
| s8b.03 | phone | extend a one-man offer whose day his later date hides | its line is hidden on Fri 24 (D2341: hidden everywhere, as if deleted), so no door opens it: no such line on the day · day list "No commitments yet." | NOT WALKED | run1-p/s8b-s8b-03-noline-phone.png |
| s8b.errors | phone | console / page errors / failed requests |  | PASS |  |
| s8c.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s8c.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s8c-s8c.f1-postout-open-desktop.png, run1-d/s8c-s8c.f1-postout-sheet-desktop.png |
| s8c.f2 | desktop | set-up: Post out → SANS from 2026-07-18 | "On 18 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s8c-s8c.f2-postout-open-desktop.png, run1-d/s8c-s8c.f2-postout-sheet-desktop.png |
| s8c.f3 | desktop | set-up: + Commitment on Sat 18 (both men SANS that day) |  | PASS | run1-d/s8c-s8c-f3-opened-desktop.png |
| s8c.f4 | desktop | set-up: Several: Ranger and Hex picked; Dates Fri 17 then Sun 19 | picked bane+rocky · picked bane+rocky · picked 07-17,07-18,07-19 · "Jul 17 → Jul 19" | PASS | run1-d/s8c-s8c-f4-form-desktop.png |
| s8c.01 | desktop | Add: refused whole with "Hex is SANS from Sat 18 Jul. Take him out of this offer to add earlier days." | "Hex is SANS from Sat 18 Jul. Take him out of this offer to add earlier days." · stayed true | PASS | run1-d/s8c-s8c-01-added-desktop.png |
| s8c.02 | desktop | never trimmed: nothing saved, no "Saved" note | made none | PASS | run1-d/s8c-s8c-01-added-desktop.png |
| s8c.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s8c.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s8c.f1 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s8c-s8c.f1-postout-open-phone.png, run1-p/s8c-s8c.f1-postout-sheet-phone.png |
| s8c.f2 | phone | set-up: Post out → SANS from 2026-07-18 | "On 18 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s8c-s8c.f2-postout-open-phone.png, run1-p/s8c-s8c.f2-postout-sheet-phone.png |
| s8c.f3 | phone | set-up: + Commitment on Sat 18 (both men SANS that day) |  | PASS | run1-p/s8c-s8c-f3-opened-phone.png |
| s8c.f4 | phone | set-up: Several: Ranger and Hex picked; Dates Fri 17 then Sun 19 | picked bane+rocky · picked bane+rocky · picked 07-17,07-18,07-19 · "Jul 17 → Jul 19" | PASS | run1-p/s8c-s8c-f4-form-phone.png |
| s8c.01 | phone | Add: refused whole with "Hex is SANS from Sat 18 Jul. Take him out of this offer to add earlier days." | "Hex is SANS from Sat 18 Jul. Take him out of this offer to add earlier days." · stayed true | PASS | run1-p/s8c-s8c-01-added-phone.png |
| s8c.02 | phone | never trimmed: nothing saved, no "Saved" note | made none | PASS | run1-p/s8c-s8c-01-added-phone.png |
| s8c.errors | phone | console / page errors / failed requests |  | PASS |  |
| s18a.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s18a.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s18a-s18a.f1-postout-open-desktop.png, run1-d/s18a-s18a.f1-postout-sheet-desktop.png |
| s18a.01 | desktop | Ranger opens Jul 16: + Commitment greyed, "You're SANS from Fri 17 Jul." | + Commitment greyed · "You're SANS from Fri 17 Jul." | PASS | run1-d/s18a-s18a-01-desktop.png |
| s18a.02 | desktop | Ranger opens Jul 15: + Commitment greyed, "You're SANS from Fri 17 Jul." | + Commitment greyed · "You're SANS from Fri 17 Jul." | PASS | run1-d/s18a-s18a-02-desktop.png |
| s18a.03 | desktop | Ranger opens Fri 17: + Commitment enabled, no hint | + Commitment enabled · no words | PASS | run1-d/s18a-s18a-03-desktop.png |
| s18a.04 | desktop | Saber opens Jul 16: + Commitment enabled, no admin hint | + Commitment enabled · no words | PASS | run1-d/s18a-s18a-04-desktop.png |
| s18a.05 | desktop | Saber opens Jul 17: + Commitment enabled, no admin hint | + Commitment enabled · no words | PASS | run1-d/s18a-s18a-05-desktop.png |
| s18a.06 | desktop | the clock moved through Fri 17 to Sat 18 09:00, reloaded, Ranger signed in: the app's today | Sat Jul 18 2026 09:00 | RECORDED |  |
| s18a.07 | desktop | after the date: Thu 16 still not open to him (greyed) | + Commitment greyed · "You're SANS from Fri 17 Jul." | PASS | run1-d/s18a-s18a-07-desktop.png |
| s18a.07w | desktop | after the date: Thu 16's words (RECORD) | + Commitment greyed · "You're SANS from Fri 17 Jul." | RECORDED | run1-d/s18a-s18a-07-desktop.png |
| s18a.08 | desktop | after the date: Sat 18 (today) enabled, no hint | + Commitment enabled · no words | PASS | run1-d/s18a-s18a-08-desktop.png |
| s18a.09 | desktop | after the date: Fri 17 (yesterday, his first SANS day) (RECORD) | + Commitment enabled · no words | RECORDED | run1-d/s18a-s18a-09-desktop.png |
| s18a.10 | desktop | after the date: Sun 19 enabled, no hint | + Commitment enabled · no words | PASS | run1-d/s18a-s18a-10-desktop.png |
| s18a.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s18a.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s18a.f1 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s18a-s18a.f1-postout-open-phone.png, run1-p/s18a-s18a.f1-postout-sheet-phone.png |
| s18a.01 | phone | Ranger opens Jul 16: + Commitment greyed, "You're SANS from Fri 17 Jul." | + Commitment greyed · "You're SANS from Fri 17 Jul." | PASS | run1-p/s18a-s18a-01-phone.png |
| s18a.02 | phone | Ranger opens Jul 15: + Commitment greyed, "You're SANS from Fri 17 Jul." | + Commitment greyed · "You're SANS from Fri 17 Jul." | PASS | run1-p/s18a-s18a-02-phone.png |
| s18a.03 | phone | Ranger opens Fri 17: + Commitment enabled, no hint | + Commitment enabled · no words | PASS | run1-p/s18a-s18a-03-phone.png |
| s18a.04 | phone | Saber opens Jul 16: + Commitment enabled, no admin hint | + Commitment enabled · no words | PASS | run1-p/s18a-s18a-04-phone.png |
| s18a.05 | phone | Saber opens Jul 17: + Commitment enabled, no admin hint | + Commitment enabled · no words | PASS | run1-p/s18a-s18a-05-phone.png |
| s18a.06 | phone | the clock moved through Fri 17 to Sat 18 09:00, reloaded, Ranger signed in: the app's today | Sat Jul 18 2026 09:00 | RECORDED |  |
| s18a.07 | phone | after the date: Thu 16 still not open to him (greyed) | + Commitment greyed · "You're SANS from Fri 17 Jul." | PASS | run1-p/s18a-s18a-07-phone.png |
| s18a.07w | phone | after the date: Thu 16's words (RECORD) | + Commitment greyed · "You're SANS from Fri 17 Jul." | RECORDED | run1-p/s18a-s18a-07-phone.png |
| s18a.08 | phone | after the date: Sat 18 (today) enabled, no hint | + Commitment enabled · no words | PASS | run1-p/s18a-s18a-08-phone.png |
| s18a.09 | phone | after the date: Fri 17 (yesterday, his first SANS day) (RECORD) | + Commitment enabled · no words | RECORDED | run1-p/s18a-s18a-09-phone.png |
| s18a.10 | phone | after the date: Sun 19 enabled, no hint | + Commitment enabled · no words | PASS | run1-p/s18a-s18a-10-phone.png |
| s18a.errors | phone | console / page errors / failed requests |  | PASS |  |
| s18b.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s18b.f1 | desktop | Ranger's record (read): no posting, no tick | {"san":false,"sanFrom":null,"archived":false} | RECORDED |  |
| s18b.01 | desktop | Ranger, not SANS, opens Jul 16: greyed, "SANS aircrew add their availability here." | + Commitment greyed · "SANS aircrew add their availability here." | PASS | run1-d/s18b-s18b-01-desktop.png |
| s18b.02 | desktop | Ranger, not SANS, opens Jul 17: greyed, "SANS aircrew add their availability here." | + Commitment greyed · "SANS aircrew add their availability here." | PASS | run1-d/s18b-s18b-02-desktop.png |
| s18b.03 | desktop | Saber opens Jul 16: enabled, no hint | + Commitment enabled · no words | PASS | run1-d/s18b-s18b-03-desktop.png |
| s18b.04 | desktop | Saber opens Jul 17: enabled, no hint | + Commitment enabled · no words | PASS | run1-d/s18b-s18b-04-desktop.png |
| s18b.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s18b.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s18b.f1 | phone | Ranger's record (read): no posting, no tick | {"san":false,"sanFrom":null,"archived":false} | RECORDED |  |
| s18b.01 | phone | Ranger, not SANS, opens Jul 16: greyed, "SANS aircrew add their availability here." | + Commitment greyed · "SANS aircrew add their availability here." | PASS | run1-p/s18b-s18b-01-phone.png |
| s18b.02 | phone | Ranger, not SANS, opens Jul 17: greyed, "SANS aircrew add their availability here." | + Commitment greyed · "SANS aircrew add their availability here." | PASS | run1-p/s18b-s18b-02-phone.png |
| s18b.03 | phone | Saber opens Jul 16: enabled, no hint | + Commitment enabled · no words | PASS | run1-p/s18b-s18b-03-phone.png |
| s18b.04 | phone | Saber opens Jul 17: enabled, no hint | + Commitment enabled · no words | PASS | run1-p/s18b-s18b-04-phone.png |
| s18b.errors | phone | console / page errors / failed requests |  | PASS |  |
| s19a.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19a.f1 | desktop | set-up: Post out → SANS from 2026-07-18 | "On 18 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s19a-s19a.f1-postout-open-desktop.png, run1-d/s19a-s19a.f1-postout-sheet-desktop.png |
| s19a.f2 | desktop | set-up: the door: a mouse dragged Jul 15 → Jul 19 | window: picked 07-15,07-16,07-17,07-18,07-19 · "Jul 15 → Jul 19" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s19a-s19a-form-desktop.png |
| s19a.01 | desktop | Add: ONE filing, Ranger, Jul 18 – Jul 19 only | made bane Jul 18→Jul 19 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s19a-s19a-01-added-desktop.png |
| s19a.02 | desktop | the note, as it reads (RECORD) | "Saved Sat 18 – Sun 19 Jul. Wed 15 – Fri 17 Jul were left out because you're SANS from Sat 18 Jul." (shown true) | RECORDED | run1-d/s19a-s19a-01-added-desktop.png |
| s19a.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s19a-s19a-01-added-desktop.png |
| s19a.04.07-15 | desktop | the SANS month: Jul 15 (left out) does not list Ranger | 15 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] Kraken[F All day Saber for Kraken · 24 Jun, 08:06] Scribe[O AM Scribe · 23 Jun, 16:59] · need – · F F20 · O O01 · A A00 · faded | PASS | run1-d/s19a-s19a-04-15-desktop.png |
| s19a.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-d/s19a-s19a-04-16-desktop.png |
| s19a.04.07-17 | desktop | the SANS month: Jul 17 (left out) does not list Ranger | 17 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 · faded | PASS | run1-d/s19a-s19a-04-17-desktop.png |
| s19a.05 | desktop | the SANS month: Jul 18 lists Ranger | 18 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s19a-s19a-05-desktop.png |
| s19a.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s19a.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19a.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-18 | "On 18 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s19a-s19a.f1-postout-open-phone-chromium.png, run1-p/s19a-s19a.f1-postout-sheet-phone-chromium.png |
| s19a.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 15 → Jul 19 | window: picked 07-15,07-16,07-17,07-18,07-19 · "Jul 15 → Jul 19" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s19a-s19a-form-phone-chromium.png |
| s19a.01 | phone-chromium | Add: ONE filing, Ranger, Jul 18 – Jul 19 only | made bane Jul 18→Jul 19 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s19a-s19a-01-added-phone-chromium.png |
| s19a.02 | phone-chromium | the note, as it reads (RECORD) | "Saved Sat 18 – Sun 19 Jul. Wed 15 – Fri 17 Jul were left out because you're SANS from Sat 18 Jul." (shown true) | RECORDED | run1-p/s19a-s19a-01-added-phone-chromium.png |
| s19a.03 | phone-chromium | the window closed after Add | stayed false | PASS | run1-p/s19a-s19a-01-added-phone-chromium.png |
| s19a.04.07-15 | phone-chromium | the SANS month: Jul 15 (left out) does not list Ranger | 15 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] Kraken[F All day Saber for Kraken · 24 Jun, 08:06] Scribe[O AM Scribe · 23 Jun, 16:59] · need – · F F20 · O O01 · A A00 · faded | PASS | run1-p/s19a-s19a-04-15-phone-chromium.png |
| s19a.04.07-16 | phone-chromium | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-p/s19a-s19a-04-16-phone-chromium.png |
| s19a.04.07-17 | phone-chromium | the SANS month: Jul 17 (left out) does not list Ranger | 17 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 · faded | PASS | run1-p/s19a-s19a-04-17-phone-chromium.png |
| s19a.05 | phone-chromium | the SANS month: Jul 18 lists Ranger | 18 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s19a-s19a-05-phone-chromium.png |
| s19a.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s19b.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19b.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s19b-s19b.f1-postout-open-desktop.png, run1-d/s19b-s19b.f1-postout-sheet-desktop.png |
| s19b.f2 | desktop | set-up: the door: a mouse dragged Jul 16 → Jul 17 | window: picked 07-16,07-17 · "Jul 16 → Jul 17" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s19b-s19b-form-desktop.png |
| s19b.01 | desktop | Add: ONE filing, Ranger, Jul 17 only | made bane Jul 17 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s19b-s19b-01-added-desktop.png |
| s19b.02 | desktop | the note, as it reads (RECORD) | "Saved Fri 17 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | RECORDED | run1-d/s19b-s19b-01-added-desktop.png |
| s19b.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s19b-s19b-01-added-desktop.png |
| s19b.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-d/s19b-s19b-04-16-desktop.png |
| s19b.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s19b-s19b-05-desktop.png |
| s19b.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s19b.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19b.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s19b-s19b.f1-postout-open-phone-chromium.png, run1-p/s19b-s19b.f1-postout-sheet-phone-chromium.png |
| s19b.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 16 → Jul 17 | window: picked 07-16,07-17 · "Jul 16 → Jul 17" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s19b-s19b-form-phone-chromium.png |
| s19b.01 | phone-chromium | Add: ONE filing, Ranger, Jul 17 only | made bane Jul 17 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s19b-s19b-01-added-phone-chromium.png |
| s19b.02 | phone-chromium | the note, as it reads (RECORD) | "Saved Fri 17 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | RECORDED | run1-p/s19b-s19b-01-added-phone-chromium.png |
| s19b.03 | phone-chromium | the window closed after Add | stayed false | PASS | run1-p/s19b-s19b-01-added-phone-chromium.png |
| s19b.04.07-16 | phone-chromium | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-p/s19b-s19b-04-16-phone-chromium.png |
| s19b.05 | phone-chromium | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s19b-s19b-05-phone-chromium.png |
| s19b.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s19c.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19c.f1 | desktop | set-up: Post out → SANS from 2026-08-01 | "On 1 Aug: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s19c-s19c.f1-postout-open-desktop.png, run1-d/s19c-s19c.f1-postout-sheet-desktop.png |
| s19c.f2 | desktop | set-up: the door: focus Jul 31, Shift+→ ×2, Enter (picked 01,02) | window: picked 07-31 · "Jul 31 → Aug 2" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s19c-s19c-form-desktop.png |
| s19c.01 | desktop | Add: ONE filing, Ranger, Aug 1 – Aug 2 only | made bane Aug 1→Aug 2 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s19c-s19c-01-added-desktop.png |
| s19c.02 | desktop | the note's exact words: "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug." | "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug." (shown true) | PASS | run1-d/s19c-s19c-01-added-desktop.png |
| s19c.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s19c-s19c-01-added-desktop.png |
| s19c.04.07-31 | desktop | the SANS month: Jul 31 (left out) does not list Ranger | 31 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 · faded | PASS | run1-d/s19c-s19c-04-31-desktop.png |
| s19c.05 | desktop | the SANS month: Aug 1 lists Ranger | 01 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s19c-s19c-05-desktop.png |
| s19c.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s19c.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19c.f1 | phone | set-up: Post out → SANS from 2026-08-01 | "On 1 Aug: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s19c-s19c.f1-postout-open-phone.png, run1-p/s19c-s19c.f1-postout-sheet-phone.png |
| s19c.f2 | phone | set-up: the door: focus Jul 31, Shift+→ ×2, Enter (picked 01,02) | window: picked 07-31 · "Jul 31 → Aug 2" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s19c-s19c-form-phone.png |
| s19c.01 | phone | Add: ONE filing, Ranger, Aug 1 – Aug 2 only | made bane Aug 1→Aug 2 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s19c-s19c-01-added-phone.png |
| s19c.02 | phone | the note's exact words: "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug." | "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug." (shown true) | PASS | run1-p/s19c-s19c-01-added-phone.png |
| s19c.03 | phone | the window closed after Add | stayed false | PASS | run1-p/s19c-s19c-01-added-phone.png |
| s19c.04.07-31 | phone | the SANS month: Jul 31 (left out) does not list Ranger | 31 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 · faded | PASS | run1-p/s19c-s19c-04-31-phone.png |
| s19c.05 | phone | the SANS month: Aug 1 lists Ranger | 01 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s19c-s19c-05-phone.png |
| s19c.errors | phone | console / page errors / failed requests |  | PASS |  |
| s19d.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19d.f1 | desktop | set-up: Post out → SANS from 2026-08-01 | "On 1 Aug: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s19d-s19d.f1-postout-open-desktop.png, run1-d/s19d-s19d.f1-postout-sheet-desktop.png |
| s19d.f2 | desktop | set-up: + Commitment on Sat 1 Aug |  | PASS | run1-d/s19d-s19d-opened-desktop.png |
| s19d.f3 | desktop | set-up: the window's Dates: ‹, Fri 31 Jul, ›, Sun 2 Aug | picked 08-01,08-02 · "Jul 31 → Aug 2" | PASS | run1-d/s19d-s19d-form-desktop.png |
| s19d.01 | desktop | Add: ONE filing, Sat 1 – Sun 2 Aug | bane Aug 1→Aug 2 [f] | PASS | run1-d/s19d-s19d-01-added-desktop.png |
| s19d.02 | desktop | the note: "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug." | "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug." | PASS | run1-d/s19d-s19d-01-added-desktop.png |
| s19d.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s19d.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19d.f1 | phone | set-up: Post out → SANS from 2026-08-01 | "On 1 Aug: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s19d-s19d.f1-postout-open-phone.png, run1-p/s19d-s19d.f1-postout-sheet-phone.png |
| s19d.f2 | phone | set-up: + Commitment on Sat 1 Aug |  | PASS | run1-p/s19d-s19d-opened-phone.png |
| s19d.f3 | phone | set-up: the window's Dates: ‹, Fri 31 Jul, ›, Sun 2 Aug | picked 08-01,08-02 · "Jul 31 → Aug 2" | PASS | run1-p/s19d-s19d-form-phone.png |
| s19d.01 | phone | Add: ONE filing, Sat 1 – Sun 2 Aug | bane Aug 1→Aug 2 [f] | PASS | run1-p/s19d-s19d-01-added-phone.png |
| s19d.02 | phone | the note: "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug." | "Saved Sat 1 – Sun 2 Aug. Fri 31 Jul was left out because you're SANS from Sat 1 Aug." | PASS | run1-p/s19d-s19d-01-added-phone.png |
| s19d.errors | phone | console / page errors / failed requests |  | PASS |  |
| s19e.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19e.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s19e-s19e.f1-postout-open-desktop.png, run1-d/s19e-s19e.f1-postout-sheet-desktop.png |
| s19e.f2 | desktop | set-up: the door: a mouse dragged Jul 16 → Jul 18 | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s19e-s19e-form-desktop.png |
| s19e.f3 | desktop | set-up: changed before Add: Dates Thu 16 then Sun 19; AMT + OFT, not Fly; Custom 09:00–12:00 | picked 07-16,07-17,07-18,07-19 · "Jul 16 → Jul 19" · Fly AMT✓ OFT✓ · 09:00–12:00 | PASS | run1-d/s19e-s19e-changed-desktop.png |
| s19e.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 19 only, oa | made bane Jul 17→Jul 19 [ao] 540–720 · Ranger's filings before 0, after 1 | PASS | run1-d/s19e-s19e-01-added-desktop.png |
| s19e.02 | desktop | the note's exact words: "Saved Fri 17 – Sun 19 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sun 19 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s19e-s19e-01-added-desktop.png |
| s19e.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s19e-s19e-01-added-desktop.png |
| s19e.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-d/s19e-s19e-04-16-desktop.png |
| s19e.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[O · A 09:00–12:00 Ranger · 15 Jul, 09:00] · need – · F F00 · O O10 · A A10 | PASS | run1-d/s19e-s19e-05-desktop.png |
| s19e.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s19e.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19e.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s19e-s19e.f1-postout-open-phone-chromium.png, run1-p/s19e-s19e.f1-postout-sheet-phone-chromium.png |
| s19e.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 16 → Jul 18 | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s19e-s19e-form-phone-chromium.png |
| s19e.f3 | phone-chromium | set-up: changed before Add: Dates Thu 16 then Sun 19; AMT + OFT, not Fly; Custom 09:00–12:00 | picked 07-16,07-17,07-18,07-19 · "Jul 16 → Jul 19" · Fly AMT✓ OFT✓ · 09:00–12:00 | PASS | run1-p/s19e-s19e-changed-phone-chromium.png |
| s19e.01 | phone-chromium | Add: ONE filing, Ranger, Jul 17 – Jul 19 only, oa | made bane Jul 17→Jul 19 [ao] 540–720 · Ranger's filings before 0, after 1 | PASS | run1-p/s19e-s19e-01-added-phone-chromium.png |
| s19e.02 | phone-chromium | the note's exact words: "Saved Fri 17 – Sun 19 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sun 19 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s19e-s19e-01-added-phone-chromium.png |
| s19e.03 | phone-chromium | the window closed after Add | stayed false | PASS | run1-p/s19e-s19e-01-added-phone-chromium.png |
| s19e.04.07-16 | phone-chromium | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-p/s19e-s19e-04-16-phone-chromium.png |
| s19e.05 | phone-chromium | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[O · A 09:00–12:00 Ranger · 15 Jul, 09:00] · need – · F F00 · O O10 · A A10 | PASS | run1-p/s19e-s19e-05-phone-chromium.png |
| s19e.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s19f.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19f.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s19f-s19f.f1-postout-open-desktop.png, run1-d/s19f-s19f.f1-postout-sheet-desktop.png |
| s19f.f2 | desktop | set-up: the door: a mouse dragged Jul 16 → Jul 18 | picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" | PASS | run1-d/s19f-s19f-form-desktop.png |
| s19f.01 | desktop | Cancel: the window closed, nothing saved | records 6 → 6 | PASS | run1-d/s19f-s19f-01-desktop.png |
| s19f.02 | desktop | no "Saved" note | note "" | PASS | run1-d/s19f-s19f-01-desktop.png |
| s19f.03 | desktop | the SANS month: Fri 17 does not list Ranger | 17 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 | PASS | run1-d/s19f-s19f-03-desktop.png |
| s19f.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s19f.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19f.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s19f-s19f.f1-postout-open-phone-chromium.png, run1-p/s19f-s19f.f1-postout-sheet-phone-chromium.png |
| s19f.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 16 → Jul 18 | picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" | PASS | run1-p/s19f-s19f-form-phone-chromium.png |
| s19f.01 | phone-chromium | Cancel: the window closed, nothing saved | records 6 → 6 | PASS | run1-p/s19f-s19f-01-phone-chromium.png |
| s19f.02 | phone-chromium | no "Saved" note | note "" | PASS | run1-p/s19f-s19f-01-phone-chromium.png |
| s19f.03 | phone-chromium | the SANS month: Fri 17 does not list Ranger | 17 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 | PASS | run1-p/s19f-s19f-03-phone-chromium.png |
| s19f.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s19g.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19g.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s19g-s19g.f1-postout-open-desktop.png, run1-d/s19g-s19g.f1-postout-sheet-desktop.png |
| s19g.f2 | desktop | set-up: the door: a mouse dragged Jul 16 → Jul 18 | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s19g-s19g-form-desktop.png |
| s19g.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s19g-s19g-01-added-desktop.png |
| s19g.02 | desktop | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s19g-s19g-01-added-desktop.png |
| s19g.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s19g-s19g-01-added-desktop.png |
| s19g.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-d/s19g-s19g-04-16-desktop.png |
| s19g.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s19g-s19g-05-desktop.png |
| s19g.06 | desktop | ONE Undo ("Undo — Ranger’s SANS Availability"): the retained filing gone, nothing left of Ranger's | "Undid: Ranger’s SANS Availability" · Ranger's records none | PASS | run1-d/s19g-s19g-06-desktop.png |
| s19g.07.16 | desktop | after Undo: Jul 16 lists no Ranger (no discarded early day shows) | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-d/s19g-s19g-07-16-desktop.png |
| s19g.07.17 | desktop | after Undo: Jul 17 lists no Ranger (no discarded early day shows) | 17 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 | PASS | run1-d/s19g-s19g-07-17-desktop.png |
| s19g.08 | desktop | Redo ("Redo — Ranger’s SANS Availability"): the same Fri 17 – Sat 18 filing back, Thu 16 not in it | "Redid: Ranger’s SANS Availability" · bane Jul 17→Jul 18 [f] | PASS | run1-d/s19g-s19g-08-desktop.png |
| s19g.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s19g.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19g.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s19g-s19g.f1-postout-open-phone-chromium.png, run1-p/s19g-s19g.f1-postout-sheet-phone-chromium.png |
| s19g.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 16 → Jul 18 | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person fixed Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s19g-s19g-form-phone-chromium.png |
| s19g.01 | phone-chromium | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s19g-s19g-01-added-phone-chromium.png |
| s19g.02 | phone-chromium | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s19g-s19g-01-added-phone-chromium.png |
| s19g.03 | phone-chromium | the window closed after Add | stayed false | PASS | run1-p/s19g-s19g-01-added-phone-chromium.png |
| s19g.04.07-16 | phone-chromium | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-p/s19g-s19g-04-16-phone-chromium.png |
| s19g.05 | phone-chromium | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s19g-s19g-05-phone-chromium.png |
| s19g.06 | phone-chromium | ONE Undo ("Undo — Ranger’s SANS Availability"): the retained filing gone, nothing left of Ranger's | "Undid: Ranger’s SANS Availability" · Ranger's records none | PASS | run1-p/s19g-s19g-06-phone-chromium.png |
| s19g.07.16 | phone-chromium | after Undo: Jul 16 lists no Ranger (no discarded early day shows) | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 · faded | PASS | run1-p/s19g-s19g-07-16-phone-chromium.png |
| s19g.07.17 | phone-chromium | after Undo: Jul 17 lists no Ranger (no discarded early day shows) | 17 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 | PASS | run1-p/s19g-s19g-07-17-phone-chromium.png |
| s19g.08 | phone-chromium | Redo ("Redo — Ranger’s SANS Availability"): the same Fri 17 – Sat 18 filing back, Thu 16 not in it | "Redid: Ranger’s SANS Availability" · bane Jul 17→Jul 18 [f] | PASS | run1-p/s19g-s19g-08-phone-chromium.png |
| s19g.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s19h.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19h.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s19h-s19h.f1-postout-open-desktop.png, run1-d/s19h-s19h.f1-postout-sheet-desktop.png |
| s19h.f2 | desktop | set-up: the door: a mouse dragged Jul 16 → Jul 18 · Person: picked bane | picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" | PASS | run1-d/s19h-s19h-form-desktop.png |
| s19h.01 | desktop | Cancel: the window closed, nothing saved | records 6 → 6 | PASS | run1-d/s19h-s19h-01-desktop.png |
| s19h.02 | desktop | no "Saved" note | note "" | PASS | run1-d/s19h-s19h-01-desktop.png |
| s19h.03 | desktop | the SANS month: Fri 17 does not list Ranger | 17 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 | PASS | run1-d/s19h-s19h-03-desktop.png |
| s19h.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s19h.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19h.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s19h-s19h.f1-postout-open-phone-chromium.png, run1-p/s19h-s19h.f1-postout-sheet-phone-chromium.png |
| s19h.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 16 → Jul 18 · Person: picked bane | picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" | PASS | run1-p/s19h-s19h-form-phone-chromium.png |
| s19h.01 | phone-chromium | Cancel: the window closed, nothing saved | records 6 → 6 | PASS | run1-p/s19h-s19h-01-phone-chromium.png |
| s19h.02 | phone-chromium | no "Saved" note | note "" | PASS | run1-p/s19h-s19h-01-phone-chromium.png |
| s19h.03 | phone-chromium | the SANS month: Fri 17 does not list Ranger | 17 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 | PASS | run1-p/s19h-s19h-03-phone-chromium.png |
| s19h.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s19i.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19i.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s19i-s19i.f1-postout-open-desktop.png, run1-d/s19i-s19i.f1-postout-sheet-desktop.png |
| s19i.f2 | desktop | set-up: the door: a mouse dragged Jul 16 → Jul 18 · Person: picked bane | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person bane:Ranger · ticks Fly✓ AMT OFT | PASS | run1-d/s19i-s19i-form-desktop.png |
| s19i.01 | desktop | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-d/s19i-s19i-01-added-desktop.png |
| s19i.02 | desktop | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." (shown true) | PASS | run1-d/s19i-s19i-01-added-desktop.png |
| s19i.03 | desktop | the window closed after Add | stayed false | PASS | run1-d/s19i-s19i-01-added-desktop.png |
| s19i.04.07-16 | desktop | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s19i-s19i-04-16-desktop.png |
| s19i.05 | desktop | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Saber for Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s19i-s19i-05-desktop.png |
| s19i.06 | desktop | ONE Undo ("Undo — Ranger’s SANS Availability"): the retained filing gone, nothing left of Ranger's | "Undid: Ranger’s SANS Availability" · Ranger's records none | PASS | run1-d/s19i-s19i-06-desktop.png |
| s19i.07.16 | desktop | after Undo: Jul 16 lists no Ranger (no discarded early day shows) | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 | PASS | run1-d/s19i-s19i-07-16-desktop.png |
| s19i.07.17 | desktop | after Undo: Jul 17 lists no Ranger (no discarded early day shows) | 17 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 | PASS | run1-d/s19i-s19i-07-17-desktop.png |
| s19i.08 | desktop | Redo ("Redo — Ranger’s SANS Availability"): the same Fri 17 – Sat 18 filing back, Thu 16 not in it | "Redid: Ranger’s SANS Availability" · bane Jul 17→Jul 18 [f] | PASS | run1-d/s19i-s19i-08-desktop.png |
| s19i.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s19i.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s19i.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s19i-s19i.f1-postout-open-phone-chromium.png, run1-p/s19i-s19i.f1-postout-sheet-phone-chromium.png |
| s19i.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 16 → Jul 18 · Person: picked bane | window: picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" · person bane:Ranger · ticks Fly✓ AMT OFT | PASS | run1-p/s19i-s19i-form-phone-chromium.png |
| s19i.01 | phone-chromium | Add: ONE filing, Ranger, Jul 17 – Jul 18 only | made bane Jul 17→Jul 18 [f] · Ranger's filings before 0, after 1 | PASS | run1-p/s19i-s19i-01-added-phone-chromium.png |
| s19i.02 | phone-chromium | the note's exact words: "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." | "Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because Ranger is SANS from Fri 17 Jul." (shown true) | PASS | run1-p/s19i-s19i-01-added-phone-chromium.png |
| s19i.03 | phone-chromium | the window closed after Add | stayed false | PASS | run1-p/s19i-s19i-01-added-phone-chromium.png |
| s19i.04.07-16 | phone-chromium | the SANS month: Jul 16 (left out) does not list Ranger | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s19i-s19i-04-16-phone-chromium.png |
| s19i.05 | phone-chromium | the SANS month: Jul 17 lists Ranger | 17 Jul: Ranger[F All day Saber for Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s19i-s19i-05-phone-chromium.png |
| s19i.06 | phone-chromium | ONE Undo ("Undo — Ranger’s SANS Availability"): the retained filing gone, nothing left of Ranger's | "Undid: Ranger’s SANS Availability" · Ranger's records none | PASS | run1-p/s19i-s19i-06-phone-chromium.png |
| s19i.07.16 | phone-chromium | after Undo: Jul 16 lists no Ranger (no discarded early day shows) | 16 Jul: Zenith[F All day Zenith · 22 Jun, 15:52] · need – · F F10 · O O00 · A A00 | PASS | run1-p/s19i-s19i-07-16-phone-chromium.png |
| s19i.07.17 | phone-chromium | after Undo: Jul 17 lists no Ranger (no discarded early day shows) | 17 Jul: no lines ("No commitments yet.") · need – · F F00 · O O00 · A A00 | PASS | run1-p/s19i-s19i-07-17-phone-chromium.png |
| s19i.08 | phone-chromium | Redo ("Redo — Ranger’s SANS Availability"): the same Fri 17 – Sat 18 filing back, Thu 16 not in it | "Redid: Ranger’s SANS Availability" · bane Jul 17→Jul 18 [f] | PASS | run1-p/s19i-s19i-08-phone-chromium.png |
| s19i.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s20a.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s20a.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s20a-s20a.f1-postout-open-desktop.png, run1-d/s20a-s20a.f1-postout-sheet-desktop.png |
| s20a.01 | desktop | Wed 15 – Thu 16 dragged: refused at the calendar door (RECORD the words) | no window · note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | RECORDED | run1-d/s20a-s20a-form-desktop.png |
| s20a.02 | desktop | nothing saved, no "Saved" note | Ranger's records none | PASS | run1-d/s20a-s20a-form-desktop.png |
| s20a.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s20a.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s20a.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s20a-s20a.f1-postout-open-phone-chromium.png, run1-p/s20a-s20a.f1-postout-sheet-phone-chromium.png |
| s20a.01 | phone-chromium | Wed 15 – Thu 16 dragged: refused at the calendar door (RECORD the words) | no window · note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | RECORDED | run1-p/s20a-s20a-form-phone-chromium.png |
| s20a.02 | phone-chromium | nothing saved, no "Saved" note | Ranger's records none | PASS | run1-p/s20a-s20a-form-phone-chromium.png |
| s20a.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s20b.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s20b.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s20b-s20b.f1-postout-open-desktop.png, run1-d/s20b-s20b.f1-postout-sheet-desktop.png |
| s20b.00 | desktop | the door opened: a mouse dragged Jul 15 → Jul 16 · Person: not offered: bane | picked 07-15,07-16 · "Jul 15 → Jul 16" · vinci:Zenith | RECORDED | run1-d/s20b-s20b-form-desktop.png |
| s20b.01 | desktop | Add on Wed 15 – Thu 16: the refusal as it reads (RECORD; the existing refusal) | "A SANS availability is already filed for one of these days — edit that entry instead of adding another" · stayed true | RECORDED | run1-d/s20b-s20b-01-added-desktop.png |
| s20b.02 | desktop | refused: nothing saved, no "Saved" note, a refusal shown | made none | PASS | run1-d/s20b-s20b-01-added-desktop.png |
| s20b.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s20b.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s20b.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s20b-s20b.f1-postout-open-phone-chromium.png, run1-p/s20b-s20b.f1-postout-sheet-phone-chromium.png |
| s20b.00 | phone-chromium | the door opened: a held finger dragged Jul 15 → Jul 16 · Person: not offered: bane | picked 07-15,07-16 · "Jul 15 → Jul 16" · vinci:Zenith | RECORDED | run1-p/s20b-s20b-form-phone-chromium.png |
| s20b.01 | phone-chromium | Add on Wed 15 – Thu 16: the refusal as it reads (RECORD; the existing refusal) | "A SANS availability is already filed for one of these days — edit that entry instead of adding another" · stayed true | RECORDED | run1-p/s20b-s20b-01-added-phone-chromium.png |
| s20b.02 | phone-chromium | refused: nothing saved, no "Saved" note, a refusal shown | made none | PASS | run1-p/s20b-s20b-01-added-phone-chromium.png |
| s20b.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s20c.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s20c.f1 | desktop | set-up: Quals → Edit → Ranger's SANS ticked → Done | {"san":true,"sanFrom":"2026-07-15"} | PASS | run1-d/s20c-s20c.f1-quals-desktop.png |
| s20c.f2 | desktop | the clock moved to Thu 16 09:00, reloaded: the app's today | Thu Jul 16 2026 09:00 | RECORDED |  |
| s20c.f3 | desktop | set-up: Quals → Edit → Ranger's SANS unticked → Done | {"san":false,"sanFrom":null} | PASS | run1-d/s20c-s20c.f3-quals-desktop.png |
| s20c.f4 | desktop | the clock moved to Fri 17 09:00, reloaded: the app's today | Fri Jul 17 2026 09:00 | RECORDED |  |
| s20c.f5 | desktop | set-up: Quals → Edit → Ranger's SANS ticked → Done | {"san":true,"sanFrom":"2026-07-17"} | PASS | run1-d/s20c-s20c.f5-quals-desktop.png |
| s20c.f6 | desktop | each day's + Commitment, read before the pick (is Wed 15 a SANS day and Thu 16 a gap?) | Jul 15: + Commitment enabled · no words \| Jul 16: + Commitment greyed · "You're SANS from Fri 17 Jul." \| Jul 17: + Commitment enabled · no words \| Jul 18: + Commitment enabled · no words | RECORDED |  |
| s20c.00 | desktop | the door: a mouse dragged Jul 15 → Jul 18 | picked 07-15,07-16,07-17,07-18 · "Jul 15 → Jul 18" | RECORDED | run1-d/s20c-s20c-form-desktop.png |
| s20c.01 | desktop | Add on Wed 15 – Sat 18: what it said (RECORD) | "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" · stayed true · made none | RECORDED | run1-d/s20c-s20c-01-added-desktop.png |
| s20c.02 | desktop | refused whole: nothing saved (no Fri 17 – Sat 18, no two filings), no "Saved" note | made none · note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | PASS | run1-d/s20c-s20c-01-added-desktop.png |
| s20c.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s20c.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s20c.f1 | phone-chromium | set-up: Quals → Edit → Ranger's SANS ticked → Done | {"san":true,"sanFrom":"2026-07-15"} | PASS | run1-p/s20c-s20c.f1-quals-phone-chromium.png |
| s20c.f2 | phone-chromium | the clock moved to Thu 16 09:00, reloaded: the app's today | Thu Jul 16 2026 09:00 | RECORDED |  |
| s20c.f3 | phone-chromium | set-up: Quals → Edit → Ranger's SANS unticked → Done | {"san":false,"sanFrom":null} | PASS | run1-p/s20c-s20c.f3-quals-phone-chromium.png |
| s20c.f4 | phone-chromium | the clock moved to Fri 17 09:00, reloaded: the app's today | Fri Jul 17 2026 09:00 | RECORDED |  |
| s20c.f5 | phone-chromium | set-up: Quals → Edit → Ranger's SANS ticked → Done | {"san":true,"sanFrom":"2026-07-17"} | PASS | run1-p/s20c-s20c.f5-quals-phone-chromium.png |
| s20c.f6 | phone-chromium | each day's + Commitment, read before the pick (is Wed 15 a SANS day and Thu 16 a gap?) | Jul 15: + Commitment enabled · no words \| Jul 16: + Commitment greyed · "You're SANS from Fri 17 Jul." \| Jul 17: + Commitment enabled · no words \| Jul 18: + Commitment enabled · no words | RECORDED |  |
| s20c.00 | phone-chromium | the door: a held finger dragged Jul 15 → Jul 18 | picked 07-15,07-16,07-17,07-18 · "Jul 15 → Jul 18" | RECORDED | run1-p/s20c-s20c-form-phone-chromium.png |
| s20c.01 | phone-chromium | Add on Wed 15 – Sat 18: what it said (RECORD) | "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" · stayed true · made none | RECORDED | run1-p/s20c-s20c-01-added-phone-chromium.png |
| s20c.02 | phone-chromium | refused whole: nothing saved (no Fri 17 – Sat 18, no two filings), no "Saved" note | made none · note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | PASS | run1-p/s20c-s20c-01-added-phone-chromium.png |
| s20c.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s20d.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s20d.f1 | desktop | set-up: Quals → Edit → Ranger's SANS ticked → Done | {"san":true,"sanFrom":"2026-07-15"} | PASS | run1-d/s20d-s20d.f1-quals-desktop.png |
| s20d.f2 | desktop | the clock moved to Thu 16 09:00, reloaded: the app's today | Thu Jul 16 2026 09:00 | RECORDED |  |
| s20d.f3 | desktop | set-up: Quals → Edit → Ranger's SANS unticked → Done | {"san":false,"sanFrom":null} | PASS | run1-d/s20d-s20d.f3-quals-desktop.png |
| s20d.f4 | desktop | the clock moved to Fri 17 09:00, reloaded: the app's today | Fri Jul 17 2026 09:00 | RECORDED |  |
| s20d.f5 | desktop | set-up: Quals → Edit → Ranger's SANS ticked → Done | {"san":true,"sanFrom":"2026-07-17"} | PASS | run1-d/s20d-s20d.f5-quals-desktop.png |
| s20d.f6 | desktop | each day's + Commitment, read before the pick (is Wed 15 a SANS day and Thu 16 a gap?) | Jul 15: + Commitment enabled · no words \| Jul 16: + Commitment enabled · no words \| Jul 17: + Commitment enabled · no words \| Jul 18: + Commitment enabled · no words | RECORDED |  |
| s20d.00 | desktop | the door: a mouse dragged Jul 15 → Jul 18 · Person: picked bane | picked 07-15,07-16,07-17,07-18 · "Jul 15 → Jul 18" | RECORDED | run1-d/s20d-s20d-form-desktop.png |
| s20d.01 | desktop | Add on Wed 15 – Sat 18: what it said (RECORD) | "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" · stayed true · made none | RECORDED | run1-d/s20d-s20d-01-added-desktop.png |
| s20d.02 | desktop | refused whole: nothing saved (no Fri 17 – Sat 18, no two filings), no "Saved" note | made none · note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | PASS | run1-d/s20d-s20d-01-added-desktop.png |
| s20d.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s20d.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s20d.f1 | phone-chromium | set-up: Quals → Edit → Ranger's SANS ticked → Done | {"san":true,"sanFrom":"2026-07-15"} | PASS | run1-p/s20d-s20d.f1-quals-phone-chromium.png |
| s20d.f2 | phone-chromium | the clock moved to Thu 16 09:00, reloaded: the app's today | Thu Jul 16 2026 09:00 | RECORDED |  |
| s20d.f3 | phone-chromium | set-up: Quals → Edit → Ranger's SANS unticked → Done | {"san":false,"sanFrom":null} | PASS | run1-p/s20d-s20d.f3-quals-phone-chromium.png |
| s20d.f4 | phone-chromium | the clock moved to Fri 17 09:00, reloaded: the app's today | Fri Jul 17 2026 09:00 | RECORDED |  |
| s20d.f5 | phone-chromium | set-up: Quals → Edit → Ranger's SANS ticked → Done | {"san":true,"sanFrom":"2026-07-17"} | PASS | run1-p/s20d-s20d.f5-quals-phone-chromium.png |
| s20d.f6 | phone-chromium | each day's + Commitment, read before the pick (is Wed 15 a SANS day and Thu 16 a gap?) | Jul 15: + Commitment enabled · no words \| Jul 16: + Commitment enabled · no words \| Jul 17: + Commitment enabled · no words \| Jul 18: + Commitment enabled · no words | RECORDED |  |
| s20d.00 | phone-chromium | the door: a held finger dragged Jul 15 → Jul 18 · Person: picked bane | picked 07-15,07-16,07-17,07-18 · "Jul 15 → Jul 18" | RECORDED | run1-p/s20d-s20d-form-phone-chromium.png |
| s20d.01 | phone-chromium | Add on Wed 15 – Sat 18: what it said (RECORD) | "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" · stayed true · made none | RECORDED | run1-p/s20d-s20d-01-added-phone-chromium.png |
| s20d.02 | phone-chromium | refused whole: nothing saved (no Fri 17 – Sat 18, no two filings), no "Saved" note | made none · note "Ranger is SANS from Fri 17 Jul: file SANS availability for days from then" | PASS | run1-p/s20d-s20d-01-added-phone-chromium.png |
| s20d.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s21a.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s21a.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s21a-s21a.f1-postout-open-desktop.png, run1-d/s21a-s21a.f1-postout-sheet-desktop.png |
| s21a.f2 | desktop | set-up: the door: a mouse dragged Jul 16 → Jul 18 | picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" | PASS | run1-d/s21a-s21a-form-desktop.png |
| s21a.f3 | desktop | set-up: Fly, AMT and OFT all unticked | Fly AMT OFT | PASS | run1-d/s21a-s21a-unticked-desktop.png |
| s21a.01 | desktop | Add: the refusal as it reads (RECORD) | "Tick at least one of Fly / AMT / OFT" · stayed true | RECORDED | run1-d/s21a-s21a-01-added-desktop.png |
| s21a.02 | desktop | refused: nothing new saved, no "Saved" (clipped-success) note | Ranger's records none → none | PASS | run1-d/s21a-s21a-01-added-desktop.png |
| s21a.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s21a.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s21a.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s21a-s21a.f1-postout-open-phone-chromium.png, run1-p/s21a-s21a.f1-postout-sheet-phone-chromium.png |
| s21a.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 16 → Jul 18 | picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" | PASS | run1-p/s21a-s21a-form-phone-chromium.png |
| s21a.f3 | phone-chromium | set-up: Fly, AMT and OFT all unticked | Fly AMT OFT | PASS | run1-p/s21a-s21a-unticked-phone-chromium.png |
| s21a.01 | phone-chromium | Add: the refusal as it reads (RECORD) | "Tick at least one of Fly / AMT / OFT" · stayed true | RECORDED | run1-p/s21a-s21a-01-added-phone-chromium.png |
| s21a.02 | phone-chromium | refused: nothing new saved, no "Saved" (clipped-success) note | Ranger's records none → none | PASS | run1-p/s21a-s21a-01-added-phone-chromium.png |
| s21a.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s21b.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s21b.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s21b-s21b.f1-postout-open-desktop.png, run1-d/s21b-s21b.f1-postout-sheet-desktop.png |
| s21b.f1b | desktop | set-up: Ranger files Fly 2026-07-18 on the SANS tab | {"iid":"imrldif2yggnymx","people":"[{\"p\":\"bane\",\"by\":\"bane\",\"at\":1784077217243}]","date":"Jul 18","endDate":null,"sans":{"f":true},"allday":true,"e":1439,"remarks":"","by":"bane"} | PASS | run1-d/s21b-s21b.f1b-form-desktop.png, run1-d/s21b-s21b.f1b-saved-desktop.png |
| s21b.f2 | desktop | set-up: the door: a mouse dragged Jul 16 → Jul 18 | picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" | PASS | run1-d/s21b-s21b-form-desktop.png |
| s21b.01 | desktop | Add: the refusal as it reads (RECORD) | "A SANS availability is already filed for one of these days — edit that entry instead of adding another" · stayed true | RECORDED | run1-d/s21b-s21b-01-added-desktop.png |
| s21b.02 | desktop | refused: nothing new saved, no "Saved" (clipped-success) note | Ranger's records bane Jul 18 [f] → bane Jul 18 [f] | PASS | run1-d/s21b-s21b-01-added-desktop.png |
| s21b.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s21b.today | phone-chromium | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s21b.f1 | phone-chromium | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s21b-s21b.f1-postout-open-phone-chromium.png, run1-p/s21b-s21b.f1-postout-sheet-phone-chromium.png |
| s21b.f1b | phone-chromium | set-up: Ranger files Fly 2026-07-18 on the SANS tab | {"iid":"imrldiiyaaaw6hu","people":"[{\"p\":\"bane\",\"by\":\"bane\",\"at\":1784077222258}]","date":"Jul 18","endDate":null,"sans":{"f":true},"allday":true,"e":1439,"remarks":"","by":"bane"} | PASS | run1-p/s21b-s21b.f1b-form-phone-chromium.png, run1-p/s21b-s21b.f1b-saved-phone-chromium.png |
| s21b.f2 | phone-chromium | set-up: the door: a held finger dragged Jul 16 → Jul 18 | picked 07-16,07-17,07-18 · "Jul 16 → Jul 18" | PASS | run1-p/s21b-s21b-form-phone-chromium.png |
| s21b.01 | phone-chromium | Add: the refusal as it reads (RECORD) | "A SANS availability is already filed for one of these days — edit that entry instead of adding another" · stayed true | RECORDED | run1-p/s21b-s21b-01-added-phone-chromium.png |
| s21b.02 | phone-chromium | refused: nothing new saved, no "Saved" (clipped-success) note | Ranger's records bane Jul 18 [f] → bane Jul 18 [f] | PASS | run1-p/s21b-s21b-01-added-phone-chromium.png |
| s21b.errors | phone-chromium | console / page errors / failed requests |  | PASS |  |
| s24.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s24.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/s24-s24.f1-postout-open-desktop.png, run1-d/s24-s24.f1-postout-sheet-desktop.png |
| s24.f2 | desktop | set-up: Saber ticks Hex's SANS on Quals → Edit | {"san":true,"sanFrom":"2026-07-15"} | PASS | run1-d/s24-s24-f2-quals-desktop.png |
| s24.00 | desktop | Edit Schedule's crew list on saturday: the SANS Avail section as it reads | heads ["SANS Avail · 0 free"] · "0 free" · Hex struck title "Hex — SANS — no availability filed for today"; Ranger struck title "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." · reason lines [] | RECORDED | run1-d/s24-s24-01-clip-desktop.png |
| s24.01 | desktop | no seat picked: Ranger and Hex struck, "0 free" | heads ["SANS Avail · 0 free"] · "0 free" · Hex struck title "Hex — SANS — no availability filed for today"; Ranger struck title "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." · reason lines [] | PASS | run1-d/s24-s24-01-clip-desktop.png |
| s24.02 | desktop | no new reason row or filing instruction: nothing printed under either name, no line "File it…/no availability filed" | heads ["SANS Avail · 0 free"] · "0 free" · Hex struck title "Hex — SANS — no availability filed for today"; Ranger struck title "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." · reason lines [] | PASS | run1-d/s24-s24-01-clip-desktop.png |
| s24.03 | desktop | desktop hover on Ranger's struck name: what it says (as built) | title "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." · data-why "SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." · tooltip "" | RECORDED | run1-d/s24-s24-03-hover-desktop.png |
| s24.03b | desktop | the Scheduler Board's crew list, Sat, no seat picked: both struck, "0 free", no reason line printed | heads ["SANS Avail · 0 free"] · "0 free" · Hex struck title "Hex — SANS — no availability filed for today"; Ranger struck title "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." · reason lines [] | PASS | run1-d/s24-s24-03b-clip-desktop.png |
| s24.04 | desktop | a seat picked (armed g:5.0.+): the board's SANS Avail section as built (struck names' reasons — as built, RECORD) | heads ["SANS Avail · 13 free"] · "13 free" · Hex title "Hex"; Ranger title "Ranger" · reason lines [] | RECORDED | run1-d/s24-s24-04-clip-desktop.png, run1-d/s24-s24-04-desktop.png |
| s24.f5 | desktop | set-up: Saber files Sat 18 (Fly, all day) for Ranger | {"iid":"imrlditeejhiglv","people":"[{\"p\":\"bane\",\"by\":\"stiff\",\"at\":1784077235798}]","date":"Jul 18","endDate":null,"sans":{"f":true},"allday":true,"e":1439,"remarks":"","by":"stiff"} | PASS | run1-d/s24-s24-f5-form-desktop.png, run1-d/s24-s24-f5-saved-desktop.png |
| s24.05 | desktop | after the filing: Ranger not struck, "1 free"; Hex still struck | heads ["SANS Avail · 1 free"] · "1 free" · Ranger title "Ranger"; Hex struck title "Hex — SANS — no availability filed for today" · reason lines [] | PASS | run1-d/s24-s24-05-clip-desktop.png |
| s24.errors | desktop | console / page errors / failed requests |  | PASS |  |
| s24.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| s24.f1 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/s24-s24.f1-postout-open-phone.png, run1-p/s24-s24.f1-postout-sheet-phone.png |
| s24.f2 | phone | set-up: Saber ticks Hex's SANS on Quals → Edit | {"san":true,"sanFrom":"2026-07-15"} | PASS | run1-p/s24-s24-f2-quals-phone.png |
| s24.00 | phone | Edit Schedule's crew list on saturday: the SANS Avail section as it reads | heads ["SANS Avail · 0 free"] · "0 free" · Hex struck title "Hex — SANS — no availability filed for today"; Ranger struck title "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." · reason lines [] | RECORDED | run1-p/s24-s24-01-clip-phone.png |
| s24.01 | phone | no seat picked: Ranger and Hex struck, "0 free" | heads ["SANS Avail · 0 free"] · "0 free" · Hex struck title "Hex — SANS — no availability filed for today"; Ranger struck title "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." · reason lines [] | PASS | run1-p/s24-s24-01-clip-phone.png |
| s24.02 | phone | no new reason row or filing instruction: nothing printed under either name, no line "File it…/no availability filed" | heads ["SANS Avail · 0 free"] · "0 free" · Hex struck title "Hex — SANS — no availability filed for today"; Ranger struck title "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." · reason lines [] | PASS | run1-p/s24-s24-01-clip-phone.png |
| s24.03b | phone | the Scheduler Board's crew list, Sat, no seat picked: both struck, "0 free", no reason line printed | heads ["SANS Avail · 0 free"] · "0 free" · Hex struck title "Hex — SANS — no availability filed for today"; Ranger struck title "Ranger — SANS from Fri 17 Jul: no availability filed. File it on the Inputs page's SANS tab." · reason lines [] | PASS | run1-p/s24-s24-03b-clip-phone.png |
| s24.04 | phone | a seat picked (armed g:5.0.+): the board's SANS Avail section as built (struck names' reasons — as built, RECORD) | heads ["SANS Avail · 13 free"] · "13 free" · Hex title "Hex"; Ranger title "Ranger" · reason lines [] | RECORDED | run1-p/s24-s24-04-clip-phone.png, run1-p/s24-s24-04-phone.png |
| s24.f5 | phone | set-up: Saber files Sat 18 (Fly, all day) for Ranger | {"iid":"imrldkxybqheohw","people":"[{\"p\":\"bane\",\"by\":\"stiff\",\"at\":1784077335012}]","date":"Jul 18","endDate":null,"sans":{"f":true},"allday":true,"e":1439,"remarks":"","by":"stiff"} | PASS | run1-p/s24-s24-f5-form-phone.png, run1-p/s24-s24-f5-saved-phone.png |
| s24.05 | phone | after the filing: Ranger not struck, "1 free"; Hex still struck | heads ["SANS Avail · 1 free"] · "1 free" · Ranger title "Ranger"; Hex struck title "Hex — SANS — no availability filed for today" · reason lines [] | PASS | run1-p/s24-s24-05-clip-phone.png |
| s24.errors | phone | console / page errors / failed requests |  | PASS |  |
| pu1.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| pu1.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/pu1-pu1.f1-postout-open-desktop.png, run1-d/pu1-pu1.f1-postout-sheet-desktop.png |
| pu1.f2 | desktop | set-up: a Ground Programme row "W13 BRIEF" 22:00–22:30 naming Ranger on 18 Jul (read back) | {"prog":"W13 BRIEF","str":"22:00","end":"22:30","who":"bane","rid":"rmrldidlh06x40x"} | PASS |  |
| pu1.01 | desktop | the bell opens: his reminder, unread, bell lit | lit true · 1 line(s) · Mark all read in view · [unread] "You're SANS from Fri 17 Jul." "" "You're planned on Sat 18 Jul with nothing filed. Tap to file for availability." | PASS | run1-d/pu1-pu1-01-desktop.png |
| pu1.02 | desktop | closed by Escape |  | PASS | run1-d/pu1-pu1-02-desktop.png |
| pu1.03 | desktop | closed by pressing the bell again |  | PASS | run1-d/pu1-pu1-03-desktop.png |
| pu1.04 | desktop | closed by a tap outside it (the screen's lower left) | page now viewsched | PASS | run1-d/pu1-pu1-04-desktop.png |
| pu1.05 | desktop | a tap on the reminder opens the SANS tab on Sat 18, its + Commitment open to him | page inputs · July 2026 · window "Sat 18 JulNo flying set" · + Commitment enabled | PASS | run1-d/pu1-pu1-05-tapped-desktop.png |
| pu1.06 | desktop | the SANS day window closed by its ✕ |  | PASS | run1-d/pu1-pu1-06-desktop.png |
| pu1.07 | desktop | closed by Escape |  | PASS | run1-d/pu1-pu1-07-desktop.png |
| pu1.08 | desktop | a press outside it, on Sun 19 of the month: the page acts (the window shows Sun 19) and the window stays (D641/D642) | window "Sun 19 JulNo flying set" | PASS | run1-d/pu1-pu1-08-desktop.png |
| pu1.09 | desktop | + Commitment → Cancel: the window closed, nothing made | opened true | PASS | run1-d/pu1-pu1-09-opened-desktop.png, run1-d/pu1-pu1-09-after-desktop.png |
| pu1.10 | desktop | + Commitment → ✕ (nothing typed): closed at once, no question |  | PASS | run1-d/pu1-pu1-10-after-desktop.png |
| pu1.11 | desktop | + Commitment → Escape: closed |  | PASS | run1-d/pu1-pu1-11-after-desktop.png |
| pu1.12 | desktop | + Commitment → a remark typed → ✕: "Close it and lose them?" asked at the ✕ | ask shown 1 · "⠿New input · Jul 18✕This input has unsaved changes. Close it and lose them?Discard and closeKeep editingPersonRangerTypeSANS AvailabilityAvailability Fly AMT OFTDurationAll dayAMPMCustomDocumentDocumentRemarksDatesJuly 2026›13‹›MONTUEWEDTHUFRISATSUN12345678910111213141516171819202122232425262728293031Jul 18Choose the dates and your available hours. Save adds one input covering the whole date range.CancelAdd" | PASS | run1-d/pu1-pu1-12-ask-desktop.png |
| pu1.12b | desktop | answered to close: the window gone, nothing made |  | PASS | run1-d/pu1-pu1-12-after-desktop.png |
| pu1.13 | desktop | + Commitment → Add: one Sat 18 filing; the day lists it | made bane Jul 18 [f] · note "Input added" · day lines imrldj4w0dv2yfg | PASS | run1-d/pu1-pu1-13-added-desktop.png |
| pu1.14 | desktop | the bell: his reminder gone now Sat 18 is filed, no take-back line | lit false · 0 line(s) · Mark all read none · empty | PASS | run1-d/pu1-pu1-14-desktop.png |
| pu1.15 | desktop | the saved commitment opens from its day, with Delete | fixed Ranger · Fly✓ AMT OFT · del true | PASS | run1-d/pu1-pu1-15-open-desktop.png |
| pu1.16 | desktop | Delete: the filing gone, the day no longer lists it | note "Input deleted" · day lines  | PASS | run1-d/pu1-pu1-16-desktop.png |
| pu1.17 | desktop | Undo ("Undo — Ranger’s SANS Availability"): the filing back | "Undid: Ranger’s SANS Availability" | PASS | run1-d/pu1-pu1-17-desktop.png |
| pu1.18 | desktop | the SANS month: Sat 18 lists Ranger, its F count counting him | 18 Jul: Ranger[F All day Ranger · 15 Jul, 09:00] · need – · F F10 · O O00 · A A00 | PASS | run1-d/pu1-pu1-18-desktop.png |
| pu1.19 | desktop | Edit Schedule's crew list, Sat: Ranger under SANS Avail, not struck | saturday · SANS Avail | PASS | run1-d/pu1-pu1-19-clip-desktop.png, run1-d/pu1-pu1-19-desktop.png |
| pu1.20 | desktop | the Scheduler Board's crew list, Sat: Ranger under SANS Avail | SANS Avail | PASS | run1-d/pu1-pu1-20-clip-desktop.png, run1-d/pu1-pu1-20-desktop.png |
| pu1.21 | desktop | View-only Sched: what it shows of SANS availability (the crew panels never reach it, as ruled) | no SANS section drawn | RECORDED | run1-d/pu1-pu1-21-desktop.png |
| pu1.22 | desktop | the changes window (Edit Schedule's clock): what it lists (RECORD) | ⠿ Changes · week of 13/7 9 changes this week ✕ New to you 3 All changes 9 Week Mon Tue Wed Thu Fri Sat Sun GROUP BY Item Who Sat · The day Ranger · 15/7 09:00 Undo — Ranger’s SANS Availability ▾ Sat · Input · Ranger · SANS Availability · 2 NEW 09:00 SANS Availability deleted · 18 Jul Ranger · 15/7 09:00 SANS Availability added · 18 Jul Ranger · 15/7 09:00 ✓ Mark all as seen | RECORDED | run1-d/pu1-pu1-22-desktop.png |
| pu1.23 | desktop | the changes window closed by Escape |  | PASS | run1-d/pu1-pu1-23-desktop.png |
| pu1.errors | desktop | console / page errors / failed requests |  | PASS |  |
| pu1.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| pu1.f1 | phone | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/pu1-pu1.f1-postout-open-phone.png, run1-p/pu1-pu1.f1-postout-sheet-phone.png |
| pu1.f2 | phone | set-up: a Ground Programme row "W13 BRIEF" 22:00–22:30 naming Ranger on 18 Jul (read back) | {"prog":"W13 BRIEF","str":"22:00","end":"22:30","who":"bane","rid":"rmrldjcshtsbmju"} | PASS |  |
| pu1.01 | phone | the bell opens: his reminder, unread, bell lit | lit true · 1 line(s) · Mark all read in view · [unread] "You're SANS from Fri 17 Jul." "" "You're planned on Sat 18 Jul with nothing filed. Tap to file for availability." | PASS | run1-p/pu1-pu1-01-phone.png |
| pu1.02 | phone | closed by Escape |  | PASS | run1-p/pu1-pu1-02-phone.png |
| pu1.03 | phone | closed by pressing the bell again |  | PASS | run1-p/pu1-pu1-03-phone.png |
| pu1.04 | phone | closed by a tap outside it (the screen's lower left) | page now viewsched | PASS | run1-p/pu1-pu1-04-phone.png |
| pu1.05 | phone | a tap on the reminder opens the SANS tab on Sat 18, its + Commitment open to him | page inputs · Jul 2026 · window "Sat 18 JulNo flying set" · + Commitment enabled | PASS | run1-p/pu1-pu1-05-tapped-phone.png, run1-p/taps/pu1-pu1-05-line-now-phone.png |
| pu1.06 | phone | the SANS day window closed by its ✕ |  | PASS | run1-p/pu1-pu1-06-phone.png |
| pu1.07 | phone | closed by Escape |  | PASS | run1-p/pu1-pu1-07-phone.png |
| pu1.08 | phone | the phone window's top bar (six-dot grip): tapped, then dragged down 288 and back up (D648, as built; RECORD) | bar {"cls":"win-bar","box":[0,9,402,57]} · at open 854px tall · after the tap top 8 height 854 · dragged down top 285 height 577 · dragged back top 8 height 854 | RECORDED | run1-p/pu1-pu1-08a-phone.png, run1-p/pu1-pu1-08b-phone.png |
| pu1.09 | phone | + Commitment → Cancel: the window closed, nothing made | opened true | PASS | run1-p/pu1-pu1-09-opened-phone.png, run1-p/pu1-pu1-09-after-phone.png |
| pu1.10 | phone | + Commitment → ✕ (nothing typed): closed at once, no question |  | PASS | run1-p/pu1-pu1-10-after-phone.png |
| pu1.11 | phone | + Commitment → Escape: closed |  | PASS | run1-p/pu1-pu1-11-after-phone.png |
| pu1.12 | phone | + Commitment → a remark typed → ✕: "Close it and lose them?" asked at the ✕ | ask shown 1 · "⠿New input · Jul 18✕This input has unsaved changes. Close it and lose them?Discard and closeKeep editingPersonRangerTypeSANS AvailabilityAvailability Fly AMT OFTDurationAll dayAMPMCustomDocumentDocumentRemarksDatesJuly 2026›13‹›MONTUEWEDTHUFRISATSUN12345678910111213141516171819202122232425262728293031Jul 18Choose the dates and your available hours. Save adds one input covering the whole date range.CancelAdd" | PASS | run1-p/pu1-pu1-12-ask-phone.png |
| pu1.12b | phone | answered to close: the window gone, nothing made |  | PASS | run1-p/pu1-pu1-12-after-phone.png |
| pu1.13 | phone | + Commitment → Add: one Sat 18 filing; the day lists it | made bane Jul 18 [f] · note "Input added" · day lines imrldl66jk48mqk | PASS | run1-p/pu1-pu1-13-added-phone.png |
| pu1.14 | phone | the bell: his reminder gone now Sat 18 is filed, no take-back line | lit false · 0 line(s) · Mark all read none · empty | PASS | run1-p/pu1-pu1-14-phone.png |
| pu1.15 | phone | the saved commitment opens from its day, with Delete | fixed Ranger · Fly✓ AMT OFT · del true | PASS | run1-p/pu1-pu1-15-open-phone.png |
| pu1.16 | phone | Delete: the filing gone, the day no longer lists it | note "Input deleted" · day lines  | PASS | run1-p/pu1-pu1-16-phone.png |
| pu1.17 | phone | Undo ("Undo — Ranger’s SANS Availability"): the filing back | "Undid: Ranger’s SANS Availability" | PASS | run1-p/pu1-pu1-17-phone.png |
| pu1.18 | phone | the SANS month: Sat 18 lists Ranger, its F count counting him | 18 Jul: Ranger[F All day Ranger · 15 Jul, 09:02] · need – · F F10 · O O00 · A A00 | PASS | run1-p/pu1-pu1-18-phone.png |
| pu1.19 | phone | Edit Schedule's crew list, Sat: Ranger under SANS Avail, not struck | saturday · SANS Avail | PASS | run1-p/pu1-pu1-19-clip-phone.png, run1-p/pu1-pu1-19-phone.png |
| pu1.20 | phone | the Scheduler Board's crew list, Sat: Ranger under SANS Avail | SANS Avail | PASS | run1-p/pu1-pu1-20-clip-phone.png, run1-p/pu1-pu1-20-phone.png |
| pu1.21 | phone | View-only Sched: what it shows of SANS availability (the crew panels never reach it, as ruled) | no SANS section drawn | RECORDED | run1-p/pu1-pu1-21-phone.png |
| pu1.22 | phone | the changes window (Edit Schedule's clock): what it lists (RECORD) | ⠿ Changes · week of 13/7 9 changes this week Hide ▾ ✕ History on: Tap a gold dot on the schedule New to you 3 All changes 9 Week Mon Tue Wed Thu Fri Sat Sun GROUP BY Item Who Sat · The day Ranger · 15/7 09:02 Undo — Ranger’s SANS Availability ▾ Sat · Input · Ranger · SANS Availability · 2 NEW 09:02 SANS Availability deleted · 18 Jul Ranger · 15/7 09:02 SANS Availability added · 18 Jul Ranger · 15/7 09:02 ✓ Mark all as seen | RECORDED | run1-p/pu1-pu1-22-phone.png |
| pu1.23 | phone | the changes window closed by Escape |  | PASS | run1-p/pu1-pu1-23-phone.png |
| pu1.errors | phone | console / page errors / failed requests |  | PASS |  |
| pu2.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| pu2.01 | desktop | Hex's Fri 24 → ⋯ → Post out: the sheet opens; its ✕ closes it | opened true | PASS | run1-d/pu2-pu2-01-desktop.png, run1-d/pu2-pu2-01-after-desktop.png |
| pu2.02 | desktop | opened again; Escape closes it | opened true | PASS | run1-d/pu2-pu2-02-after-desktop.png |
| pu2.03 | desktop | opened again; a press outside it at 768,223 (on "sheetscrim"): what happened (RECORD) | sheet still up false | RECORDED | run1-d/pu2-pu2-03-after-desktop.png |
| pu2.04 | desktop | Post out → SANS → Post out: Hex SANS from Fri 24 | "On 24 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/pu2-pu2-04-postout-open-desktop.png, run1-d/pu2-pu2-04-postout-sheet-desktop.png |
| pu2.05 | desktop | his PO cell opens the posted-out sheet; its ✕ closes it | posted-out sheet · "On 24 Jul: becomes SANS." | PASS | run1-d/pu2-pu2-05-sheet-desktop.png |
| pu2.06 | desktop | opened again; Escape closes it | posted-out sheet | PASS | run1-d/pu2-pu2-06-after-desktop.png |
| pu2.07 | desktop | Undo post out: the posting gone, his Fri 24 cell no longer PO | "On 24 Jul: becomes SANS." · cell "" ·  | PASS | run1-d/pu2-pu2-07-sheet-desktop.png, run1-d/pu2-pu2-07-undone-desktop.png |
| pu2.08 | desktop | Saber's own bell: no line about Hex's posting (his own action) | lit false · 0 line(s) · Mark all read none · empty | PASS | run1-d/pu2-pu2-08-desktop.png |
| pu2.errors | desktop | console / page errors / failed requests |  | PASS |  |
| pu2.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| pu2.01 | phone | Hex's Fri 24 → ⋯ → Post out: the sheet opens; its ✕ closes it | opened true | PASS | run1-p/pu2-pu2-01-phone.png, run1-p/pu2-pu2-01-after-phone.png |
| pu2.02 | phone | opened again; Escape closes it | opened true | PASS | run1-p/pu2-pu2-02-after-phone.png |
| pu2.03 | phone | opened again; a press outside it at 201,216 (on " act"): what happened (RECORD) | sheet still up false | RECORDED | run1-p/pu2-pu2-03-after-phone.png |
| pu2.04 | phone | Post out → SANS → Post out: Hex SANS from Fri 24 | "On 24 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/pu2-pu2-04-postout-open-phone.png, run1-p/pu2-pu2-04-postout-sheet-phone.png |
| pu2.05 | phone | his PO cell opens the posted-out sheet; its ✕ closes it | posted-out sheet · "On 24 Jul: becomes SANS." | PASS | run1-p/pu2-pu2-05-sheet-phone.png |
| pu2.06 | phone | opened again; Escape closes it | posted-out sheet | PASS | run1-p/pu2-pu2-06-after-phone.png |
| pu2.07 | phone | Undo post out: the posting gone, his Fri 24 cell no longer PO | "On 24 Jul: becomes SANS." · cell "" ·  | PASS | run1-p/pu2-pu2-07-sheet-phone.png, run1-p/pu2-pu2-07-undone-phone.png |
| pu2.08 | phone | Saber's own bell: no line about Hex's posting (his own action) | lit false · 0 line(s) · Mark all read none · empty | PASS | run1-p/pu2-pu2-08-phone.png |
| pu2.errors | phone | console / page errors / failed requests |  | PASS |  |
| probe.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| p.f1 | desktop | set-up: Post out → SANS from 2026-07-17 | "On 17 Jul: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/probe-p.f1-postout-open-desktop.png, run1-d/probe-p.f1-postout-sheet-desktop.png |
| probe.errors | desktop | console / page errors / failed requests |  | PASS |  |
| probe2.today | desktop | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| p.f1 | desktop | set-up: Post out → SANS from 2026-08-01 | "On 1 Aug: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-d/probe2-p.f1-postout-open-desktop.png, run1-d/probe2-p.f1-postout-sheet-desktop.png |
| probe2.errors | desktop | console / page errors / failed requests |  | PASS |  |
| probe2.today | phone | the app's today (page clock), Saber signed in | Wed Jul 15 2026 09:00 | note |  |
| p.f1 | phone | set-up: Post out → SANS from 2026-08-01 | "On 1 Aug: becomes SANS." {"san":false,"sanFrom":null} | PASS | run1-p/probe2-p.f1-postout-open-phone.png, run1-p/probe2-p.f1-postout-sheet-phone.png |
| probe2.errors | phone | console / page errors / failed requests |  | PASS |  |
