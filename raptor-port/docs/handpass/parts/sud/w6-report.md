# w6 — D2338: Hex's SANS-days bell line, its life and its tap (walk of 23 Nov 26, chat 147)

Walker w6. Build: `raptor-port/dist` from `a203fc98c` (branch `claude/allavail-sans-postout-141`), served on port 4396,
never rebuilt. Brief: `docs/superpowers/briefs/2026-11-23-d2338-walk-brief.md`. Scenarios (Astra's numbers): A5, A6, A7,
A8, A9, A11, A12, A14, A15, A19, A21, A22, A23, and the brief's "working copy or published — RECORD which drives the line".

**Scripts:** `scripts/handpass/sud-w6-env.mjs` (sets the server and picture folder before the shared helpers load),
`sud-w6-lib.mjs` (helpers, built on `asp-w2-lib.mjs` and `cal-A-lib2.mjs`'s SANS-calendar recipe), `sud-w6.mjs` (the
scenarios), `sud-w6-report.mjs` (this table), `sud-w6-explore.mjs` (a read-only look at Hex's demo week first).
**Final run (cited):** `docs/img/handpass/2026-11-23-sans-unfiled/w6/run2/` — 358 step pictures, plus 521 phone pictures
taken within about 100 ms of each tap in `run2/taps/`. Command, from `raptor-port/`, four processes:
`W6_RUN=run2 ONLY=build-d,a5-d,…,a12x-d W6_TAG=P1 node scripts/handpass/sud-w6.mjs` (and P2 phone, P3/P4 the rest — the
logs are in `D:\raptor-work\c147-walk\w6\run2-P1..P4.log`, the raw results in `D:\raptor-work\c147-walk\w6\json-run2\`). **Earlier attempts** (script debugging, not cited):
`w6/run1/` — its FAILs were the script's own (it looked for a new input's id under `id`, the app keys it `iid`; a SANS
commitment names its man in `people`, not `person`; CX and Un-cancel ask a question the first script did not answer; a
suspended man's sign-in lands on a screen with no bell). Each was fixed in the script, never in the app.

**World.** Each scenario starts in a fresh browser context, the clock installed before the app loads at Wed 15 Jul 26
09:00 and left running. The base world was built once per size through the app's own controls and saved (the browser's
storage, `D:\raptor-work\c147-walk\w6\state-<size>.json`), each scenario reopening it and asserting a fact it made
before any step (Hex on Fri 17's BRIEF and on two Sat 18 rows): as Saber on Wed 15 — Leave War, Hex's Fri 17 cell → ⋯ →
Post out → SANS → Post out ("On 17 Jul: becomes SANS."); Ground Programme BRIEF 08:00–09:00 naming Hex on Fri 17 and Sat
18, TALK 13:00–14:00 naming Hex on Sat 18, and (Edit Schedule moved to the week of 20 Jul) BRIEF 08:00–09:00 naming Hex
on Tue 21; then back to the week of 13 Jul. Hex's own demo items, read first: Thu 16 wave 2, Mon 20 wave 1, Wed 22 wave 1
(Fri 17, Sat 18, Sun 19, Tue 21 clear, so no briefing sits on his flights). So on Fri 17 his planned days are 17, 18, 20,
21, 22 — Thu 16 before the posting. Astra's "task on 20 July" moved to Tue 21, since Mon 20 already holds his own flight.
The day moved by Playwright's `setSystemTime` and a reload (A12 by `fastForward`, no reload). Hex signs in as `hex`, the
others as `us`, `ad`, `ad2` (Hunter), `ad9` (Kestrel), `us9` (Osprey); one tab, signed out and in between people.
`window.*` was only read (the app's day, Hex's record, `INPUTS`, `NOTICES`) and `window.go` used as the recipes do.

**Counts (final run):** 464 rows — 364 PASS, 0 FAIL, 44 RECORDED, 2 NOT WALKED, 54 NOTE (each scenario's "the app's today"
line). Console errors, page errors and failed requests: none in any scenario at either size.

## What the walk found, in short
- **The line, as the brief words it, on both sizes:** bold "Your SANS availability" (drawn `<b>`, weight 600), "Fri 17,
  Sat 18, Mon 20 Jul", "Planned, no availability filed · 2 more days"; the bell lit; only from Fri 17 (none on Wed 15 or
  Thu 16); the week of 20 Jul counted while not open; Sat 18's two rows named once (A5).
- **It shrinks and goes:** filing by Hex, filing by Saber for Hex, and taking him off items each take that day out; the
  last one filed takes the line away, never struck (A6, A7, A15). A read line **stays read** when it shrinks (RECORDED).
- **Only Hex's bell:** Ranger, Kestrel, Osprey: nothing; Saber and Hunter: only their own "Hex · Fri 17 Jul · Posted out ·
  now SANS" line (A8).
- **The tap:** Inputs → SANS tab at July 2026 (from September, where Hex had left it), Fri 17's window open, on screen and
  on top, the bell closed; + Commitment there filed his availability; the line then started at Sat 18 (A9). Across a month
  and a year: the tap opened July for "Fri 31 Jul, Mon 3, Tue 4 Aug" and December 2026 for "Thu 31 Dec, Fri 1 Jan" (A23).
- **Taken back:** posting moved to Mon 20 or undone — unread: the line simply goes; read: "~~Planned, no availability filed ·
  2 more days~~ · taken back · Saber", unread again, the same after a reload (A11; A14 "SANS tapped again" the same). Undone
  and made again: the struck line AND one new active line, both unread, the same after a reload (A21).
- **Midnight with the page open (lesson 29), no reload:** Saber's crew list on Sat 18 went from "SANS from Fri 17 Jul: no
  availability filed. It can be filed from that day on the Inputs page's SANS tab." to "SANS — no availability filed for
  today" 12 s after 23:59:50; Hex's bell lit with the line; his + Commitment on Sat 18, greyed before ("SANS aircrew add
  their availability here."), was offered and filed (A12).

## RECORDED (the brief's RECORD lines and Astra's open readings)
- **A6, A7 — does a read line light again?** No, at both sizes: after Hex filed a day, after Saber filed for him, after a
  day left. (After Saber filed for him the bell DID light — for a separate, existing line, "SANS Availability · Fri 17
  Jul · You were added · Saber" (`run2/a6-a6-04-bell-desktop.png`); the SANS-days line itself stayed read.)
- **Working copy or published (WP):** the WORKING copy drives the line. Sat 18 published with Hex on its two rows, then
  both rows removed in the working copy only (2 pending): Sat 18 left the line. Sun 19 published without Hex, then a
  BRIEF naming him added in the working copy only (1 pending): Sun 19 came into the line — "Fri 17, Sun 19, Mon 20 Jul ·
  2 more days" (both sizes).
- **A14 — the outcome changed.** Before it ran: Overseas Sqn ("On 17 Jul: archived, account suspended.") — on Fri 17 Hex
  is archived and his sign-in shows "Your access is suspended", so his bell cannot be read; SANS tapped again ("On 17 Jul:
  off the manpower, nothing else.") — on Fri 17 his bell has no SANS-days line (PASS). After the line appeared: Overseas
  Sqn, unread — he is suspended at once, bell unreadable, `NOTICES` holds no stored line for him; SANS tapped again, read
  — struck "taken back · Saber" (PASS); Delete, read — asked "Delete Hex? On 17 Jul the app deletes him automatically,
  with his account. Days he flew keep his puck.", Delete: he is deleted at once; signing in as `hex` then shows the
  Request access screen; `NOTICES` holds nothing for him (no struck history line is stored).
- **A19 — archive, restore, delete.** Archive (unread and read runs): "Hex archived — his sign-in is suspended"; his
  sign-in shows "Your access is suspended". Restore (Post in Fri 17 Jul): "Hex restored — he can sign in, and he'll be asked
  to check his quals and CAT"; his record after it is NOT SANS (`san: false`), his bell has no line — and in the READ run
  no struck history line either (the read line simply went); his SANS tab's Sat 18 + Commitment is greyed, "SANS aircrew
  add their availability here." Delete: "Tap again to delete Hex", "Hex deleted"; `hex` then gets the Request access
  screen; no stored lines. Whether archive/delete should keep a struck line is the owner's (Astra's table).
- **A22 — cancelled / information-only items** (Tue 21's BRIEF, his only item that day): CX (it asks "Cancel this item",
  answered Cancel line, blank reason) — Tue 21 left the line ("· 1 more day"); CX off (asks "This item is cancelled —
  reason", answered Un-cancel) — it came back ("· 2 more days"); ⓘ Info only — left; ⓘ off — back. Control: Sat 18's TALK
  cancelled while his BRIEF stands — Sat 18 stays. Same at both sizes.
- **A23 — the words across ends:** "Fri 31 Jul, Mon 3, Tue 4 Aug · Planned, no availability filed · 1 more day" (Thu 6 Aug
  counted); "Thu 31 Dec, Fri 1 Jan · Planned, no availability filed" — no year is printed, so 1 Jan does not say 2027 (the
  tap opens December 2026, the first day's month). On the phone the line is one entry, 376 × 52 px inside the 402 screen;
  it cannot grow past three named days (more are counted, "· N more days"), so it never wraps further — Astra's "enough
  dates to wrap" cannot make it longer than this.
- **The order of two lines (A21):** the struck taken-back line ("now") stands above the new active line ("9 h") — newest
  first.

## FAILs
None in the final run.

## Errors seen
None — no console error, page error, 4xx or failed request in any scenario at either size (each scenario's `errors` row).

## A lead, not a finding (to check — outside this walk's scope)
On View-only Sched, with the app's day at Fri 17 Jul (and at Fri 31 Jul in A23), the loaded week's Monday heading reads
"Monday Jul 13 · Today" (`run2/a5-a5-17-bell-desktop.png`, `run2/a23j-a23-jul-bell-phone.png`). It may be the demo
week's own fixed "today", the app's day running on the page clock while the week keeps its seeded mark. Not read against
the rulings, not reproduced on purpose — for the host to check.

## The lessons of §7.11 — the step that covers each, or why it cannot apply
1. State table: the line's states (none, unread, read, shrunk, gone, struck, struck + new) are each a scenario row —
   A5, A6, A7, A11, A14, A15, A21 — at both sizes.
2. Drags and swipes: none in this scope (the bell and the SANS day open by taps; nothing is dragged) — cannot apply.
3. After every press, what tells him: every step pictures the bell or the window it opened; the bell's lit dot recorded.
4. A window leaving the page working: the tap closes the bell and opens the SANS day window (A9 reads `bellOpen: false`);
   pressing the page behind each window is w7's plain-user round.
5. A box moved into sight: the SANS day window after the tap is checked inside the screen and on top by `elementFromPoint`
   (A9, A23) — desktop at its corner, phone full height.
6. The phone's own scrolling: none here — the bell's list held one or two lines; its own scroll on his iPhone not walked.
7. Steered motion: none — cannot apply.
8. An approved drawing: none (built without a drawing, his D2339) — cannot apply.
9. Lists measured: the bell line's box measured (A23: 338 × 69 / 338 × 52 desktop, 376 × 52 phone); no heading-and-figures
   list here.
10. A page hidden and shown again: tried (A12x) — the test browser kept the tab "visible" behind a second tab, so hiding
    cannot be played here: NOT WALKED at both sizes.
11. Depends on how much fits: the line names three days whatever the width; the year's two ends were pressed (A23 Dec).
12. Every page a window opens from: the tap was made from View (A9) and from the Inputs page (A6's first tap from View,
    later bells read on Inputs); other pages not walked.
13. Pinch: cannot apply.
14. Keyboard: no keyboard walk here — cannot apply.
15. Bars over a scrolling area: cannot apply to the bell list.
16. After a refusal at a box: + Commitment greyed before midnight, offered after, then filed (A12h).
17. Show/hide controls: the bell opened and closed (Escape) at every read, the day window closed by ✕.
18. Print or download: cannot apply.
19. Each window's ways out: bell by Escape, day window by ✕ here; every other way is w7's plain-user round.
20. A gesture traced: cannot apply.
21. Touch: taps in WebKit at 402 × 874; what only his iPhone shows — the bell list's own scroll and the pull-up bar of the
    day window — named for his look.
22. Drawn pixels: the words are read from the drawn elements (`.bl-name`, `.bl-day`, `.bl-what`, `.bl-struck`), the
    struck words seen struck in the pictures (`run2/a11rm-a11-05-bell-*.png`); first frames: the tap pictures.
23. What a tap opens: the ruled destination (D2338 — "a tap opening the SANS calendar"; the build report: the SANS tab at the
    first day's month, its window open) walked as the expected one; the other kinds of bell line were not tapped here.
23b. Side-by-side boxes one height: not measured — the bell line is a single column.
24. Against the top bar on a flick: cannot apply.
25. In every place: the planned days came from ground rows and from his own flying seats (Mon 20, Wed 22); a sim, a duty
    and an OFT/AMT row were not used here (A17 is w5's).
26. Gesture measured by what is under the fingers: cannot apply.
27. Neighbouring controls moved: cannot apply.
28. On a phone, what a press opens proved on screen: the line tapped at its own middle by a finger, the window then read
    inside the screen and on top, the page not scrolled by the script (A9, A23 phone).
29. Midnight with the page open: A12s and A12h — every reading followed the new day without a reload; and again after a
    reload.
30. A picture within about 100 ms of each tap: `run2/taps/` (521).
31. 125% windows: cannot apply — nothing fitted to the screen was measured.

## What could NOT be walked, and why
- **The page hidden across midnight (A12, Astra's second half):** a second tab brought to the front left the first tab
  "visible" in both test browsers, so a hidden page could not be played — NOT WALKED, both sizes. His iPhone (lock the
  screen before midnight, open it after) is the place to see it.
- **Hex's bell while he is archived or deleted:** he cannot sign in (suspended / Request access), and the line is worked out
  only for the man signed in — it is not in `window.NOTICES` — so what his bell would hold is not readable in a walk
  (Astra's unit-only check).
- **Astra's A23 "wrap the line" at 402 wide:** the line names at most three days and counts the rest, so it cannot be made
  long enough to wrap further than the two rows it has.
- **Astra's "remark that only types Hex" and every kind of item (A17)**, and the note's words on the crew lists beyond
  A12's midnight reads: w5's scenarios.

## The step table (final run, `run2`)
| Scenario | Size | Step | What was done | What the screen said | Result | Pictures |
|---|---|---|---|---|---|---|
| build | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| build | desktop | F01 | Leave War: Hex's 17 Jul cell → ⋯ → Post out → SANS → Post out | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | build-F01-postout-open-desktop.png, build-F01-postout-sheet-desktop.png |
| build | desktop | F-4-BRIEF | day 4 of the week of 13 Jul: Ground Programme BRIEF 08:00–09:00 naming Hex (read back) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldicjkkunjru"} | PASS | build-F02-4-BRIEF-desktop.png |
| build | desktop | F-5-BRIEF | day 5 of the week of 13 Jul: Ground Programme BRIEF 08:00–09:00 naming Hex (read back) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldiig5f2dd86"} | PASS | build-F02-5-BRIEF-desktop.png |
| build | desktop | F-5-TALK | day 5 of the week of 13 Jul: Ground Programme TALK 13:00–14:00 naming Hex (read back) | {"prog":"TALK","str":"13:00","end":"14:00","who":"rocky","rid":"rmrldillzh4cjjq"} | PASS | build-F02-5-TALK-desktop.png |
| build | desktop | F-wk-2026-07-20 | Edit Schedule moved to the week of 2026-07-20 (read: CURWEEK) | 20/07/2026 | PASS |  |
| build | desktop | F-2026-07-20-1-BRIEF | week of 2026-07-20, day 1: BRIEF 08:00–09:00 naming Hex (read back; before: Jul 21: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldiuep87od9u"} | PASS | build-F03-2026-07-20-1-desktop.png |
| build | desktop | F-home | back on the week of 13 Jul; what Hex holds each day (read) | Jul 13: .sims.amt[1].pax[5] \| Jul 14: .waves[0].formations[0].aircraft[1].w \| Jul 15: .waves[0].formations[0].aircraft[1].w \| Jul 16: .waves[1].formations[1].aircraft[0].w \| Jul 17: .ground[2].who \| Jul 18: .ground[0].who .ground[1].who \| Jul 19: nothing | PASS |  |
| build | desktop | saved | the base world saved (the browser storage of this size, for the scenarios to reopen) | D:\raptor-work\c147-walk\w6\state-desktop.json · {"line":"On 17 Jul: becomes SANS.","after":{"san":false,"sanFrom":null}} | PASS |  |
| build | desktop | errors | console / page errors / failed requests |  | PASS |  |
| build | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| build | phone | F01 | Leave War: Hex's 17 Jul cell → ⋯ → Post out → SANS → Post out | sheet line "On 17 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | build-F01-postout-open-phone.png, build-F01-postout-sheet-phone.png |
| build | phone | F-4-BRIEF | day 4 of the week of 13 Jul: Ground Programme BRIEF 08:00–09:00 naming Hex (read back) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldiivurb0fie"} | PASS | build-F02-4-BRIEF-phone.png |
| build | phone | F-5-BRIEF | day 5 of the week of 13 Jul: Ground Programme BRIEF 08:00–09:00 naming Hex (read back) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldir86h1vgwr"} | PASS | build-F02-5-BRIEF-phone.png |
| build | phone | F-5-TALK | day 5 of the week of 13 Jul: Ground Programme TALK 13:00–14:00 naming Hex (read back) | {"prog":"TALK","str":"13:00","end":"14:00","who":"rocky","rid":"rmrldiwcoroiv6b"} | PASS | build-F02-5-TALK-phone.png |
| build | phone | F-wk-2026-07-20 | Edit Schedule moved to the week of 2026-07-20 (read: CURWEEK) | 20/07/2026 | PASS |  |
| build | phone | F-2026-07-20-1-BRIEF | week of 2026-07-20, day 1: BRIEF 08:00–09:00 naming Hex (read back; before: Jul 21: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldj86te9yvlf"} | PASS | build-F03-2026-07-20-1-phone.png |
| build | phone | F-home | back on the week of 13 Jul; what Hex holds each day (read) | Jul 13: .sims.amt[1].pax[5] \| Jul 14: .waves[0].formations[0].aircraft[1].w \| Jul 15: .waves[0].formations[0].aircraft[1].w \| Jul 16: .waves[1].formations[1].aircraft[0].w \| Jul 17: .ground[2].who \| Jul 18: .ground[0].who .ground[1].who \| Jul 19: nothing | PASS |  |
| build | phone | saved | the base world saved (the browser storage of this size, for the scenarios to reopen) | D:\raptor-work\c147-walk\w6\state-phone.json · {"line":"On 17 Jul: becomes SANS.","after":{"san":false,"sanFrom":null}} | PASS |  |
| build | phone | errors | console / page errors / failed requests |  | PASS |  |
| a5 | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a5 | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a5 | desktop | A5-15 | Wed 15 Jul, Hex signed in: his bell has no SANS-days line | lit false · 0 lines · SANS: none | PASS | a5-a5-15-bell-desktop.png |
| a5 | desktop | A5-16 | Thu 16 Jul (setSystemTime + reload; Thu Jul 16 2026 09:00): still no SANS-days line (he flies wave 2 that day, before the posting) | lit false · 0 lines · SANS: none | PASS | a5-a5-16-bell-desktop.png |
| a5 | desktop | A5-17 | Fri 17 Jul (Fri Jul 17 2026 09:00), week loaded 13/07/2026: ONE active line — "Your SANS availability" bold, "Fri 17, Sat 18, Mon 20 Jul", "Planned, no availability filed · 2 more days" (his days 17, 18, 20, 21, 22: the two Sat rows once, Thu 16 absent, the week of 20 Jul not open), unread | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" · name drawn B/600 · line id sansdue:rocky:2026-07-17 | PASS | a5-a5-17-bell-desktop.png |
| a5 | desktop | A5-lit | the bell lit for it | true | PASS |  |
| a5 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a5 | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a5 | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a5 | phone | A5-15 | Wed 15 Jul, Hex signed in: his bell has no SANS-days line | lit false · 0 lines · SANS: none | PASS | a5-a5-15-bell-phone.png |
| a5 | phone | A5-16 | Thu 16 Jul (setSystemTime + reload; Thu Jul 16 2026 09:00): still no SANS-days line (he flies wave 2 that day, before the posting) | lit false · 0 lines · SANS: none | PASS | a5-a5-16-bell-phone.png |
| a5 | phone | A5-17 | Fri 17 Jul (Fri Jul 17 2026 09:00), week loaded 13/07/2026: ONE active line — "Your SANS availability" bold, "Fri 17, Sat 18, Mon 20 Jul", "Planned, no availability filed · 2 more days" (his days 17, 18, 20, 21, 22: the two Sat rows once, Thu 16 absent, the week of 20 Jul not open), unread | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" · name drawn B/600 · line id sansdue:rocky:2026-07-17 | PASS | a5-a5-17-bell-phone.png |
| a5 | phone | A5-lit | the bell lit for it | true | PASS |  |
| a5 | phone | errors | console / page errors / failed requests |  | PASS |  |
| a6 | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a6 | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a6 | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a6 | desktop | A6-01 | Hex taps his line (read): the SANS tab opens; the line then reads as read | before lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" · tap opened {"page":"inputs","month":"July 2026","win":"⠿Fri 17 JulDay flying✕FigurePilotsWSOsRequired to fly––Avail"} · after lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a6-a6-01-pre-bell-desktop.png, a6-a6-01-tapped-desktop.png, a6-a6-01-after-bell-desktop.png |
| a6 | desktop | A6-02 | Hex files Sat 18 Jul: SANS tab → 18 → + Commitment, OFT, Add (read back: a new input of his) | person box no Person box · all day null · made [{"iid":"imro8emriibtizh","person":"rocky","type":"SANS Availability","date":"Jul 18","yr":2026,"sans":{"o":true},"allday":true}]  | PASS | a6-file-2026-07-18-form-desktop.png |
| a6 | desktop | A6-03 | his line now names 17, 20, 21 (22 counted): "Fri 17, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day"; never struck | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day" | PASS | a6-a6-02-bell-desktop.png |
| a6 | desktop | A6-03r | whether a read line lights again when a day is filed (RECORD; as built: stays read) | stays read · bell lit false | RECORDED |  |
| a6 | desktop | A6-04 | Saber files Fri 17 Jul FOR Hex (SANS tab → 17 → + Commitment, Person Hex, OFT, Add; read back) | person box Hex · made [{"iid":"imro8fhnzukhmyv","person":"rocky","type":"SANS Availability","date":"Jul 17","yr":2026,"sans":{"o":true},"allday":true}]  | PASS | a6-file-2026-07-17-form-desktop.png |
| a6 | desktop | A6-05 | Hex's line now "Mon 20, Tue 21, Wed 22 Jul" · "Planned, no availability filed" | lit true · 2 lines · SANS: [read] "Your SANS availability" · "Mon 20, Tue 21, Wed 22 Jul" · "Planned, no availability filed" | PASS | a6-a6-04-bell-desktop.png |
| a6 | desktop | A6-05r | read state after Saber filed for him (RECORD) | stays read · bell lit true | RECORDED |  |
| a6 | desktop | A6-06 | Hex files Mon 20, Tue 21, Wed 22 Jul (read back) | 20:filed · 21:filed · 22:filed | PASS |  |
| a6 | desktop | A6-07 | every day filed: no SANS-days line left — gone, never struck | lit true · 1 lines · SANS: none | PASS | a6-a6-06-bell-desktop.png |
| a6 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a6 | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a6 | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a6 | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a6 | phone | A6-01 | Hex taps his line (read): the SANS tab opens; the line then reads as read | before lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" · tap opened {"page":"inputs","month":"Jul 2026","win":"⠿Fri 17 JulDay flying✕FigurePilotsWSOsRequired to fly––Avail"} · after lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a6-a6-01-pre-bell-phone.png, a6-a6-01-tapped-phone.png, a6-a6-01-after-bell-phone.png |
| a6 | phone | A6-02 | Hex files Sat 18 Jul: SANS tab → 18 → + Commitment, OFT, Add (read back: a new input of his) | person box no Person box · all day null · made [{"iid":"imro8eq65nfaac7","person":"rocky","type":"SANS Availability","date":"Jul 18","yr":2026,"sans":{"o":true},"allday":true}]  | PASS | a6-file-2026-07-18-form-phone.png |
| a6 | phone | A6-03 | his line now names 17, 20, 21 (22 counted): "Fri 17, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day"; never struck | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day" | PASS | a6-a6-02-bell-phone.png |
| a6 | phone | A6-03r | whether a read line lights again when a day is filed (RECORD; as built: stays read) | stays read · bell lit false | RECORDED |  |
| a6 | phone | A6-04 | Saber files Fri 17 Jul FOR Hex (SANS tab → 17 → + Commitment, Person Hex, OFT, Add; read back) | person box Hex · made [{"iid":"imro8fo2llo9lj8","person":"rocky","type":"SANS Availability","date":"Jul 17","yr":2026,"sans":{"o":true},"allday":true}]  | PASS | a6-file-2026-07-17-form-phone.png |
| a6 | phone | A6-05 | Hex's line now "Mon 20, Tue 21, Wed 22 Jul" · "Planned, no availability filed" | lit true · 2 lines · SANS: [read] "Your SANS availability" · "Mon 20, Tue 21, Wed 22 Jul" · "Planned, no availability filed" | PASS | a6-a6-04-bell-phone.png |
| a6 | phone | A6-05r | read state after Saber filed for him (RECORD) | stays read · bell lit true | RECORDED |  |
| a6 | phone | A6-06 | Hex files Mon 20, Tue 21, Wed 22 Jul (read back) | 20:filed · 21:filed · 22:filed | PASS |  |
| a6 | phone | A6-07 | every day filed: no SANS-days line left — gone, never struck | lit true · 1 lines · SANS: none | PASS | a6-a6-06-bell-phone.png |
| a6 | phone | errors | console / page errors / failed requests |  | PASS |  |
| a7 | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a7 | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a7 | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a7 | desktop | A7-01 | Hex reads his line first (taps it) | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a7-a7-01-after-bell-desktop.png |
| a7 | desktop | A7-02 | Saber: Tue 21 Jul (next week) — the BRIEF, Hex's only item that day, removed by its ✕ | Hex left on Tue: [] | PASS | a7-a7-del-1-BRIEF-desktop.png |
| a7 | desktop | A7-03 | Hex's line: 21 gone — "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" (22); never struck | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" | PASS | a7-a7-02-bell-desktop.png |
| a7 | desktop | A7-03r | read state after a day left (RECORD) | stays read | RECORDED |  |
| a7 | desktop | A7-04 | Saber: Sat 18 — the TALK removed (his BRIEF that day stays) | Hex left on Sat: ["BRIEF"] | PASS | a7-a7-del-5-TALK-desktop.png |
| a7 | desktop | A7-05 | Hex's line: Sat 18 still named — "Fri 17, Sat 18, Mon 20 Jul" | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" | PASS | a7-a7-04-bell-desktop.png |
| a7 | desktop | A7-06 | Saber: Sat 18 — the BRIEF removed too (nothing of Hex left that day) | Hex left on Sat: [] | PASS | a7-a7-del-5-BRIEF-desktop.png |
| a7 | desktop | A7-07 | Hex's line: 18 gone — "Fri 17, Mon 20, Wed 22 Jul" · "Planned, no availability filed" | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Mon 20, Wed 22 Jul" · "Planned, no availability filed" | PASS | a7-a7-06-bell-desktop.png |
| a7 | desktop | A7-07r | read state now (RECORD) | stays read | RECORDED |  |
| a7 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a7 | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a7 | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a7 | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a7 | phone | A7-01 | Hex reads his line first (taps it) | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a7-a7-01-after-bell-phone.png |
| a7 | phone | A7-02 | Saber: Tue 21 Jul (next week) — the BRIEF, Hex's only item that day, removed by its ✕ | Hex left on Tue: [] | PASS | a7-a7-del-1-BRIEF-phone.png |
| a7 | phone | A7-03 | Hex's line: 21 gone — "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" (22); never struck | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" | PASS | a7-a7-02-bell-phone.png |
| a7 | phone | A7-03r | read state after a day left (RECORD) | stays read | RECORDED |  |
| a7 | phone | A7-04 | Saber: Sat 18 — the TALK removed (his BRIEF that day stays) | Hex left on Sat: ["BRIEF"] | PASS | a7-a7-del-5-TALK-phone.png |
| a7 | phone | A7-05 | Hex's line: Sat 18 still named — "Fri 17, Sat 18, Mon 20 Jul" | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" | PASS | a7-a7-04-bell-phone.png |
| a7 | phone | A7-06 | Saber: Sat 18 — the BRIEF removed too (nothing of Hex left that day) | Hex left on Sat: [] | PASS | a7-a7-del-5-BRIEF-phone.png |
| a7 | phone | A7-07 | Hex's line: 18 gone — "Fri 17, Mon 20, Wed 22 Jul" · "Planned, no availability filed" | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Mon 20, Wed 22 Jul" · "Planned, no availability filed" | PASS | a7-a7-06-bell-phone.png |
| a7 | phone | A7-07r | read state now (RECORD) | stays read | RECORDED |  |
| a7 | phone | errors | console / page errors / failed requests |  | PASS |  |
| a8 | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a8 | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a8 | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a8 | desktop | A8-hex | Hex: one SANS-days line | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a8-a8-hex-bell-desktop.png |
| a8 | desktop | A8-us | Ranger: no SANS-days line about Hex (other lines RECORDED) | lit false · 0 lines:  | PASS | a8-a8-us-bell-desktop.png |
| a8 | desktop | A8-ad | Saber: no SANS-days line about Hex (other lines RECORDED) | lit true · 1 lines: Hex · Fri 17 Jul · Posted out · now SANS | PASS | a8-a8-ad-bell-desktop.png |
| a8 | desktop | A8-ad2 | Hunter: no SANS-days line about Hex (other lines RECORDED) | lit true · 1 lines: Hex · Fri 17 Jul · Posted out · now SANS | PASS | a8-a8-ad2-bell-desktop.png |
| a8 | desktop | A8-ad9 | Kestrel: no SANS-days line about Hex (other lines RECORDED) | lit false · 0 lines:  | PASS | a8-a8-ad9-bell-desktop.png |
| a8 | desktop | A8-us9 | Osprey: no SANS-days line about Hex (other lines RECORDED) | lit false · 0 lines:  | PASS | a8-a8-us9-bell-desktop.png |
| a8 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a8 | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a8 | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a8 | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a8 | phone | A8-hex | Hex: one SANS-days line | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a8-a8-hex-bell-phone.png |
| a8 | phone | A8-us | Ranger: no SANS-days line about Hex (other lines RECORDED) | lit false · 0 lines:  | PASS | a8-a8-us-bell-phone.png |
| a8 | phone | A8-ad | Saber: no SANS-days line about Hex (other lines RECORDED) | lit true · 1 lines: Hex · Fri 17 Jul · Posted out · now SANS | PASS | a8-a8-ad-bell-phone.png |
| a8 | phone | A8-ad2 | Hunter: no SANS-days line about Hex (other lines RECORDED) | lit true · 1 lines: Hex · Fri 17 Jul · Posted out · now SANS | PASS | a8-a8-ad2-bell-phone.png |
| a8 | phone | A8-ad9 | Kestrel: no SANS-days line about Hex (other lines RECORDED) | lit false · 0 lines:  | PASS | a8-a8-ad9-bell-phone.png |
| a8 | phone | A8-us9 | Osprey: no SANS-days line about Hex (other lines RECORDED) | lit false · 0 lines:  | PASS | a8-a8-us9-bell-phone.png |
| a8 | phone | errors | console / page errors / failed requests |  | PASS |  |
| a9 | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a9 | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a9 | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a9 | desktop | A9-01 | Hex left the SANS tab on another month, then went to View | SANS month left on "September 2026" · page viewsched | PASS | a9-a9-01-view-desktop.png |
| a9 | desktop | A9-03 | the tap: Inputs → SANS tab at July 2026, Fri 17 Jul's window open, on screen and on top, the bell closed | {"page":"inputs","tab":true,"cal":true,"month":"July 2026","win":{"head":"⠿Fri 17 JulDay flying✕FigurePilotsWSOsRequired to fly––Avail","box":[1090,96,430,325],"inScreen":true,"topIsWin":true,"add":"enabled","addwhy":"","list":"No commitments yet."},"bellOpen":false} | PASS | a9-a9-03-tapped-desktop.png |
| a9 | desktop | A9-04 | in that window, + Commitment → OFT → Add: his availability for Fri 17 Jul is made (read back) |  person no Person box · made [{"iid":"imro8elwj84areo","person":"rocky","type":"SANS Availability","date":"Jul 17","yr":2026,"sans":{"o":true},"allday":true}]  | PASS | a9-file-2026-07-17-form-desktop.png, a9-a9-04-filed-desktop.png |
| a9 | desktop | A9-05 | the line then starts at Sat 18: "Sat 18, Mon 20, Tue 21 Jul" | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Sat 18, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day" | PASS | a9-a9-05-bell-desktop.png |
| a9 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a9 | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a9 | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a9 | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a9 | phone | A9-01 | Hex left the SANS tab on another month, then went to View | SANS month left on "Sep 2026" · page viewsched | PASS | a9-a9-01-view-phone.png |
| a9 | phone | A9-03 | the tap: Inputs → SANS tab at July 2026, Fri 17 Jul's window open, on screen and on top, the bell closed | {"page":"inputs","tab":true,"cal":true,"month":"Jul 2026","win":{"head":"⠿Fri 17 JulDay flying✕FigurePilotsWSOsRequired to fly––Avail","box":[0,8,402,854],"inScreen":true,"topIsWin":true,"add":"enabled","addwhy":"","list":"No commitments yet."},"bellOpen":false} | PASS | a9-a9-03-tapped-phone.png |
| a9 | phone | A9-04 | in that window, + Commitment → OFT → Add: his availability for Fri 17 Jul is made (read back) |  person no Person box · made [{"iid":"imro8eozai9029k","person":"rocky","type":"SANS Availability","date":"Jul 17","yr":2026,"sans":{"o":true},"allday":true}]  | PASS | a9-file-2026-07-17-form-phone.png, a9-a9-04-filed-phone.png |
| a9 | phone | A9-05 | the line then starts at Sat 18: "Sat 18, Mon 20, Tue 21 Jul" | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Sat 18, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day" | PASS | a9-a9-05-bell-phone.png |
| a9 | phone | errors | console / page errors / failed requests |  | PASS |  |
| a11um | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a11um | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a11um | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a11um | desktop | A11-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11um-a11-01-bell-desktop.png |
| a11um | desktop | A11-03 | Saber: Hex's posting sheet (posted-out sheet) → PO from moved to Mon 20 Jul (read back: he is not SANS today) | sheet line before "On 17 Jul: becomes SANS." · after "On 20 Jul: becomes SANS."  · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a11um-a11-03-sheet-desktop.png, a11um-a11-04-move-desktop.png |
| a11um | desktop | A11-04 | unread line, posting moved later: the line simply goes (nothing struck, nothing active) | lit false · 0 lines · SANS: none | PASS | a11um-a11-05-bell-desktop.png |
| a11um | desktop | A11-05 | after a reload: the same | lit false · 0 lines · SANS: none | PASS | a11um-a11-06-bell-desktop.png |
| a11um | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a11um | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a11um | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a11um | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a11um | phone | A11-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11um-a11-01-bell-phone.png |
| a11um | phone | A11-03 | Saber: Hex's posting sheet (posted-out sheet) → PO from moved to Mon 20 Jul (read back: he is not SANS today) | sheet line before "On 17 Jul: becomes SANS." · after "On 20 Jul: becomes SANS."  · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a11um-a11-03-sheet-phone.png, a11um-a11-04-move-phone.png |
| a11um | phone | A11-04 | unread line, posting moved later: the line simply goes (nothing struck, nothing active) | lit false · 0 lines · SANS: none | PASS | a11um-a11-05-bell-phone.png |
| a11um | phone | A11-05 | after a reload: the same | lit false · 0 lines · SANS: none | PASS | a11um-a11-06-bell-phone.png |
| a11um | phone | errors | console / page errors / failed requests |  | PASS |  |
| a11rm | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a11rm | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a11rm | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a11rm | desktop | A11-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11rm-a11-01-bell-desktop.png |
| a11rm | desktop | A11-02 | Hex reads it (taps the line) | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11rm-a11-02-after-bell-desktop.png |
| a11rm | desktop | A11-03 | Saber: Hex's posting sheet (posted-out sheet) → PO from moved to Mon 20 Jul (read back: he is not SANS today) | sheet line before "On 17 Jul: becomes SANS." · after "On 20 Jul: becomes SANS."  · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a11rm-a11-03-sheet-desktop.png, a11rm-a11-04-move-desktop.png |
| a11rm | desktop | A11-04 | read line, posting moved later: struck "Planned, no availability filed", then "taken back · Saber", unread; no active line | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" | PASS | a11rm-a11-05-bell-desktop.png |
| a11rm | desktop | A11-05 | after a reload: the same | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" | PASS | a11rm-a11-06-bell-desktop.png |
| a11rm | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a11rm | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a11rm | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a11rm | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a11rm | phone | A11-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11rm-a11-01-bell-phone.png |
| a11rm | phone | A11-02 | Hex reads it (taps the line) | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11rm-a11-02-after-bell-phone.png |
| a11rm | phone | A11-03 | Saber: Hex's posting sheet (posted-out sheet) → PO from moved to Mon 20 Jul (read back: he is not SANS today) | sheet line before "On 17 Jul: becomes SANS." · after "On 20 Jul: becomes SANS."  · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a11rm-a11-03-sheet-phone.png, a11rm-a11-04-move-phone.png |
| a11rm | phone | A11-04 | read line, posting moved later: struck "Planned, no availability filed", then "taken back · Saber", unread; no active line | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" | PASS | a11rm-a11-05-bell-phone.png |
| a11rm | phone | A11-05 | after a reload: the same | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" | PASS | a11rm-a11-06-bell-phone.png |
| a11rm | phone | errors | console / page errors / failed requests |  | PASS |  |
| a11uu | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a11uu | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a11uu | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a11uu | desktop | A11-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11uu-a11-01-bell-desktop.png |
| a11uu | desktop | A11-03 | Saber: Hex's posting sheet (posted-out sheet) → Undo post out (PO) (read back: he is not SANS today) | sheet line before "On 17 Jul: becomes SANS." · after ""  · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a11uu-a11-03-sheet-desktop.png, a11uu-a11-04-undo-desktop.png |
| a11uu | desktop | A11-04 | unread line, posting undone: the line simply goes (nothing struck, nothing active) | lit false · 0 lines · SANS: none | PASS | a11uu-a11-05-bell-desktop.png |
| a11uu | desktop | A11-05 | after a reload: the same | lit false · 0 lines · SANS: none | PASS | a11uu-a11-06-bell-desktop.png |
| a11uu | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a11uu | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a11uu | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a11uu | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a11uu | phone | A11-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11uu-a11-01-bell-phone.png |
| a11uu | phone | A11-03 | Saber: Hex's posting sheet (posted-out sheet) → Undo post out (PO) (read back: he is not SANS today) | sheet line before "On 17 Jul: becomes SANS." · after ""  · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a11uu-a11-03-sheet-phone.png, a11uu-a11-04-undo-phone.png |
| a11uu | phone | A11-04 | unread line, posting undone: the line simply goes (nothing struck, nothing active) | lit false · 0 lines · SANS: none | PASS | a11uu-a11-05-bell-phone.png |
| a11uu | phone | A11-05 | after a reload: the same | lit false · 0 lines · SANS: none | PASS | a11uu-a11-06-bell-phone.png |
| a11uu | phone | errors | console / page errors / failed requests |  | PASS |  |
| a11ru | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a11ru | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a11ru | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a11ru | desktop | A11-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11ru-a11-01-bell-desktop.png |
| a11ru | desktop | A11-02 | Hex reads it (taps the line) | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11ru-a11-02-after-bell-desktop.png |
| a11ru | desktop | A11-03 | Saber: Hex's posting sheet (posted-out sheet) → Undo post out (PO) (read back: he is not SANS today) | sheet line before "On 17 Jul: becomes SANS." · after ""  · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a11ru-a11-03-sheet-desktop.png, a11ru-a11-04-undo-desktop.png |
| a11ru | desktop | A11-04 | read line, posting undone: struck "Planned, no availability filed", then "taken back · Saber", unread; no active line | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" | PASS | a11ru-a11-05-bell-desktop.png |
| a11ru | desktop | A11-05 | after a reload: the same | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" | PASS | a11ru-a11-06-bell-desktop.png |
| a11ru | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a11ru | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a11ru | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a11ru | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a11ru | phone | A11-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11ru-a11-01-bell-phone.png |
| a11ru | phone | A11-02 | Hex reads it (taps the line) | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a11ru-a11-02-after-bell-phone.png |
| a11ru | phone | A11-03 | Saber: Hex's posting sheet (posted-out sheet) → Undo post out (PO) (read back: he is not SANS today) | sheet line before "On 17 Jul: becomes SANS." · after ""  · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a11ru-a11-03-sheet-phone.png, a11ru-a11-04-undo-phone.png |
| a11ru | phone | A11-04 | read line, posting undone: struck "Planned, no availability filed", then "taken back · Saber", unread; no active line | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" | PASS | a11ru-a11-05-bell-phone.png |
| a11ru | phone | A11-05 | after a reload: the same | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" | PASS | a11ru-a11-06-bell-phone.png |
| a11ru | phone | errors | console / page errors / failed requests |  | PASS |  |
| a12s | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a12s | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a12s | desktop | A12s-01 | Thu 16 Jul 23:59:50 (Thu Jul 16 2026 23:59), Saber on Edit Schedule, the crew list on Sat 18 (saturday): Hex's note is the look-ahead words | {"day":"Saturday","shown":true,"where":"SANS Avail","title":"Hex · C · ops wingman · SANS","rpTitle":"Hex — SANS from Fri 17 Jul: no availability filed. It can be filed from that day on the Inputs page's SANS tab.","why":"SANS from Fri 17 Jul: no availability filed. It can be filed from that day on the Inputs page's SANS tab.","rwhy":""} | PASS | a12s-a12s-01-desktop.png |
| a12s | desktop | A12s-02 | clock fast-forwarded 12 s, no reload (Fri Jul 17 2026 00:00): the note follows the new day — "SANS — no availability filed for today", the look-ahead words gone | {"day":"Saturday","shown":true,"where":"SANS Avail","title":"Hex · C · ops wingman · SANS","rpTitle":"Hex — SANS — no availability filed for today","why":"SANS — no availability filed for today","rwhy":""} | PASS | a12s-a12s-02-desktop.png |
| a12s | desktop | A12s-04 | after a reload on Fri 17 (Fri Jul 17 2026 00:00): the usual words | {"day":"Saturday","shown":true,"where":"SANS Avail","title":"Hex · C · ops wingman · SANS","rpTitle":"Hex — SANS — no availability filed for today","why":"SANS — no availability filed for today","rwhy":""} | PASS | a12s-a12s-04-desktop.png |
| a12s | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a12s | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a12s | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a12s | phone | A12s-01 | Thu 16 Jul 23:59:50 (Thu Jul 16 2026 23:59), Saber on Edit Schedule, the crew list on Sat 18 (saturday): Hex's note is the look-ahead words | {"day":"Saturday","shown":true,"where":"SANS Avail","title":"Hex · C · ops wingman · SANS","rpTitle":"Hex — SANS from Fri 17 Jul: no availability filed. It can be filed from that day on the Inputs page's SANS tab.","why":"SANS from Fri 17 Jul: no availability filed. It can be filed from that day on the Inputs page's SANS tab.","rwhy":""} | PASS | a12s-a12s-01-phone.png |
| a12s | phone | A12s-02 | clock fast-forwarded 12 s, no reload (Fri Jul 17 2026 00:00): the note follows the new day — "SANS — no availability filed for today", the look-ahead words gone | {"day":"Saturday","shown":true,"where":"SANS Avail","title":"Hex · C · ops wingman · SANS","rpTitle":"Hex — SANS — no availability filed for today","why":"SANS — no availability filed for today","rwhy":""} | PASS | a12s-a12s-02-phone.png |
| a12s | phone | A12s-04 | after a reload on Fri 17 (Fri Jul 17 2026 00:00): the usual words | {"day":"Saturday","shown":true,"where":"SANS Avail","title":"Hex · C · ops wingman · SANS","rpTitle":"Hex — SANS — no availability filed for today","why":"SANS — no availability filed for today","rwhy":""} | PASS | a12s-a12s-04-phone.png |
| a12s | phone | errors | console / page errors / failed requests |  | PASS |  |
| a12h | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a12h | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a12h | desktop | A12h-01 | Thu 16 Jul 23:59:50 (Thu Jul 16 2026 23:59), Hex on View: no SANS-days line; on the SANS tab Sat 18's + Commitment greyed (RECORD its words) | bell lit false · lit false · 0 lines · SANS: none · Sat 18 window {"head":"⠿Sat 18 JulNo flying set✕FigurePilotsWSOsRequired to fly––Av","box":[1090,96,430,349],"inScreen":true,"topIsWin":true,"add":"disabled","addwhy":"SANS aircrew add their availability here.","list":"No commitments yet."} | PASS | a12h-a12h-01-bell-desktop.png |
| a12h | desktop | A12h-02 | fast-forwarded 12 s, no reload (Fri Jul 17 2026 00:00): the bell lit and his line there | lit before opening true · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a12h-a12h-02-bell-desktop.png |
| a12h | desktop | A12h-04 | still no reload: on the SANS tab Sat 18's + Commitment offered and his availability filed (read back) | window {"head":"⠿Sat 18 JulNo flying set✕FigurePilotsWSOsRequired to fly––Av","box":[1090,96,430,325],"inScreen":true,"topIsWin":true,"add":"enabled","addwhy":"","list":"No commitments yet."} ·  made [{"iid":"imrnp4atf0x17qb","person":"rocky","type":"SANS Availability","date":"Jul 18","yr":2026,"sans":{"o":true},"allday":true}] | PASS | a12h-file-2026-07-18-form-desktop.png |
| a12h | desktop | A12h-05 | the line then leaves out Sat 18 ("Fri 17, Mon 20, Tue 21 Jul") — one line, no duplicate | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day" | PASS | a12h-a12h-05-bell-desktop.png |
| a12h | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a12h | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a12h | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a12h | phone | A12h-01 | Thu 16 Jul 23:59:50 (Thu Jul 16 2026 23:59), Hex on View: no SANS-days line; on the SANS tab Sat 18's + Commitment greyed (RECORD its words) | bell lit false · lit false · 0 lines · SANS: none · Sat 18 window {"head":"⠿Sat 18 JulNo flying set✕FigurePilotsWSOsRequired to fly––Av","box":[0,8,402,854],"inScreen":true,"topIsWin":true,"add":"disabled","addwhy":"SANS aircrew add their availability here.","list":"No commitments yet."} | PASS | a12h-a12h-01-bell-phone.png |
| a12h | phone | A12h-02 | fast-forwarded 12 s, no reload (Fri Jul 17 2026 00:00): the bell lit and his line there | lit before opening true · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a12h-a12h-02-bell-phone.png |
| a12h | phone | A12h-04 | still no reload: on the SANS tab Sat 18's + Commitment offered and his availability filed (read back) | window {"head":"⠿Sat 18 JulNo flying set✕FigurePilotsWSOsRequired to fly––Av","box":[0,8,402,854],"inScreen":true,"topIsWin":true,"add":"enabled","addwhy":"","list":"No commitments yet."} ·  made [{"iid":"imrnp4e495iztpk","person":"rocky","type":"SANS Availability","date":"Jul 18","yr":2026,"sans":{"o":true},"allday":true}] | PASS | a12h-file-2026-07-18-form-phone.png |
| a12h | phone | A12h-05 | the line then leaves out Sat 18 ("Fri 17, Mon 20, Tue 21 Jul") — one line, no duplicate | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day" | PASS | a12h-a12h-05-bell-phone.png |
| a12h | phone | errors | console / page errors / failed requests |  | PASS |  |
| a12x | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a12x | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a12x | desktop | A12x | the page hidden across midnight | the test browser left the first tab "visible" with a second tab in front — hiding it cannot be played here | NOT WALKED |  |
| a12x | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a12x | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a12x | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a12x | phone | A12x | the page hidden across midnight | the test browser left the first tab "visible" with a second tab in front — hiding it cannot be played here | NOT WALKED |  |
| a12x | phone | errors | console / page errors / failed requests |  | PASS |  |
| a14po | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a14po | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a14po | desktop | A14-01 | Wed 15 (before it runs): Saber's posting sheet (posted-out sheet) → overseas | before "On 17 Jul: becomes SANS." · after "On 17 Jul: archived, account suspended."   · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a14po-a14-01-sheet-desktop.png, a14po-a14-01-after-desktop.png |
| a14po | desktop | A14-02 | clock to Fri 17 (setSystemTime + reload): Hex's record | {"san":false,"sanFrom":null,"archived":true,"deleted":false} | RECORDED |  |
| a14po | desktop | A14-03 | Hex signs in to look at his bell | he cannot sign in: "TALON Your access is suspended Signed in as hex Ask an admin to enable it when you’re back. Sign out" (his bell not readable — the line is worked out only for the man signed in) | RECORDED | a14po-a14-03-signin-desktop.png |
| a14po | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a14po | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a14po | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a14po | phone | A14-01 | Wed 15 (before it runs): Saber's posting sheet (posted-out sheet) → overseas | before "On 17 Jul: becomes SANS." · after "On 17 Jul: archived, account suspended."   · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a14po-a14-01-sheet-phone.png, a14po-a14-01-after-phone.png |
| a14po | phone | A14-02 | clock to Fri 17 (setSystemTime + reload): Hex's record | {"san":false,"sanFrom":null,"archived":true,"deleted":false} | RECORDED |  |
| a14po | phone | A14-03 | Hex signs in to look at his bell | he cannot sign in: "TALON Your access is suspended Signed in as hex Ask an admin to enable it when you’re back. Sign out" (his bell not readable — the line is worked out only for the man signed in) | RECORDED | a14po-a14-03-signin-phone.png |
| a14po | phone | errors | console / page errors / failed requests |  | PASS |  |
| a14pn | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a14pn | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a14pn | desktop | A14-01 | Wed 15 (before it runs): Saber's posting sheet (posted-out sheet) → SANS tapped again (no outcome) | before "On 17 Jul: becomes SANS." · after "On 17 Jul: off the manpower, nothing else."   · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a14pn-a14-01-sheet-desktop.png, a14pn-a14-01-after-desktop.png |
| a14pn | desktop | A14-02 | clock to Fri 17 (setSystemTime + reload): Hex's record | {"san":false,"sanFrom":null,"archived":false,"deleted":false} | RECORDED |  |
| a14pn | desktop | A14-03 | Hex's bell on Fri 17: no SANS-days line (signed in as Hex · Member) | lit false · 0 lines · SANS: none | PASS | a14pn-a14-03-bell-desktop.png |
| a14pn | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a14pn | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a14pn | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a14pn | phone | A14-01 | Wed 15 (before it runs): Saber's posting sheet (posted-out sheet) → SANS tapped again (no outcome) | before "On 17 Jul: becomes SANS." · after "On 17 Jul: off the manpower, nothing else."   · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a14pn-a14-01-sheet-phone.png, a14pn-a14-01-after-phone.png |
| a14pn | phone | A14-02 | clock to Fri 17 (setSystemTime + reload): Hex's record | {"san":false,"sanFrom":null,"archived":false,"deleted":false} | RECORDED |  |
| a14pn | phone | A14-03 | Hex's bell on Fri 17: no SANS-days line (signed in as Hex · Member) | lit false · 0 lines · SANS: none | PASS | a14pn-a14-03-bell-phone.png |
| a14pn | phone | errors | console / page errors / failed requests |  | PASS |  |
| a14uo | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a14uo | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a14uo | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a14uo | desktop | A14-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a14uo-a14-01-bell-desktop.png |
| a14uo | desktop | A14-03 | Saber: the posting sheet (posted-out sheet) → overseas | before "On 17 Jul: becomes SANS." · after "On 17 Jul: archived, account suspended."   · record {"san":false,"sanFrom":null,"archived":true,"deleted":false} | PASS | a14uo-a14-03-sheet-desktop.png, a14uo-a14-03-after-desktop.png |
| a14uo | desktop | A14-04 | Hex signs in to look at his bell | he cannot sign in: "TALON Your access is suspended Signed in as hex Ask an admin to enable it when you’re back. Sign out" · his stored lines (window.NOTICES, read): [] | RECORDED | a14uo-a14-04-signin-desktop.png |
| a14uo | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a14uo | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a14uo | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a14uo | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a14uo | phone | A14-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a14uo-a14-01-bell-phone.png |
| a14uo | phone | A14-03 | Saber: the posting sheet (posted-out sheet) → overseas | before "On 17 Jul: becomes SANS." · after "On 17 Jul: archived, account suspended."   · record {"san":false,"sanFrom":null,"archived":true,"deleted":false} | PASS | a14uo-a14-03-sheet-phone.png, a14uo-a14-03-after-phone.png |
| a14uo | phone | A14-04 | Hex signs in to look at his bell | he cannot sign in: "TALON Your access is suspended Signed in as hex Ask an admin to enable it when you’re back. Sign out" · his stored lines (window.NOTICES, read): [] | RECORDED | a14uo-a14-04-signin-phone.png |
| a14uo | phone | errors | console / page errors / failed requests |  | PASS |  |
| a14rn | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a14rn | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a14rn | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a14rn | desktop | A14-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a14rn-a14-01-bell-desktop.png |
| a14rn | desktop | A14-02 | Hex reads it | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a14rn-a14-02-after-bell-desktop.png |
| a14rn | desktop | A14-03 | Saber: the posting sheet (posted-out sheet) → SANS tapped again (no outcome) | before "On 17 Jul: becomes SANS." · after "On 17 Jul: off the manpower, nothing else."   · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a14rn-a14-03-sheet-desktop.png, a14rn-a14-03-after-desktop.png |
| a14rn | desktop | A14-04 | read line: struck, "taken back · Saber", unread; nothing active | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" | PASS | a14rn-a14-04-bell-desktop.png |
| a14rn | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a14rn | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a14rn | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a14rn | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a14rn | phone | A14-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a14rn-a14-01-bell-phone.png |
| a14rn | phone | A14-02 | Hex reads it | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a14rn-a14-02-after-bell-phone.png |
| a14rn | phone | A14-03 | Saber: the posting sheet (posted-out sheet) → SANS tapped again (no outcome) | before "On 17 Jul: becomes SANS." · after "On 17 Jul: off the manpower, nothing else."   · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a14rn-a14-03-sheet-phone.png, a14rn-a14-03-after-phone.png |
| a14rn | phone | A14-04 | read line: struck, "taken back · Saber", unread; nothing active | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" | PASS | a14rn-a14-04-bell-phone.png |
| a14rn | phone | errors | console / page errors / failed requests |  | PASS |  |
| a14rd | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a14rd | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a14rd | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a14rd | desktop | A14-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a14rd-a14-01-bell-desktop.png |
| a14rd | desktop | A14-02 | Hex reads it | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a14rd-a14-02-after-bell-desktop.png |
| a14rd | desktop | A14-03 | Saber: the posting sheet (posted-out sheet) → delete | before "On 17 Jul: becomes SANS." · after ""  · asked "Delete Hex? On 17 Jul the app deletes him automatically, with his account. Days he flew keep his puck. Delete Cancel" · record {"san":false,"sanFrom":null,"archived":true,"deleted":true} | PASS | a14rd-a14-03-sheet-desktop.png, a14rd-a14-03-after-desktop.png |
| a14rd | desktop | A14-04 | Hex signs in to look at his bell | he cannot sign in: "TALON Request access Signed in as hex You're not on the squadron's list yet. Tell the admins who you are and they'll give you access. DISPLAYED CALLSIGN/NAME INITIALS PILOT, WSO OR PERSONNEL Pick… Pil" · his stored lines (window.NOTICES, read): [] | RECORDED | a14rd-a14-04-signin-desktop.png |
| a14rd | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a14rd | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a14rd | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a14rd | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a14rd | phone | A14-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a14rd-a14-01-bell-phone.png |
| a14rd | phone | A14-02 | Hex reads it | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a14rd-a14-02-after-bell-phone.png |
| a14rd | phone | A14-03 | Saber: the posting sheet (posted-out sheet) → delete | before "On 17 Jul: becomes SANS." · after ""  · asked "Delete Hex? On 17 Jul the app deletes him automatically, with his account. Days he flew keep his puck. Delete Cancel" · record {"san":false,"sanFrom":null,"archived":true,"deleted":true} | PASS | a14rd-a14-03-sheet-phone.png, a14rd-a14-03-after-phone.png |
| a14rd | phone | A14-04 | Hex signs in to look at his bell | he cannot sign in: "TALON Request access Signed in as hex You're not on the squadron's list yet. Tell the admins who you are and they'll give you access. DISPLAYED CALLSIGN/NAME INITIALS PILOT, WSO OR PERSONNEL CAT Reque" · his stored lines (window.NOTICES, read): [] | RECORDED | a14rd-a14-04-signin-phone.png |
| a14rd | phone | errors | console / page errors / failed requests |  | PASS |  |
| a15 | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a15 | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a15 | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a15 | desktop | A15-01 | unread, then a reload: one line, still unread, the same line | before lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" · after lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a15-a15-01-bell-desktop.png, a15-a15-02-bell-desktop.png |
| a15 | desktop | A15-02 | read (tapped), page left and back, reloaded: one line, still read | after reading lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" · after reload lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a15-a15-03-after-bell-desktop.png, a15-a15-04-bell-desktop.png |
| a15 | desktop | A15-03 | Sat 18 filed, reloaded: one line, 18 not back, read state kept | filed [{"iid":"imro8etny7hr3jd","person":"rocky","type":"SANS Availability","date":"Jul 18","yr":2026,"sans":{"o":true},"allday":true}] · lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day" | PASS | a15-a15-05-bell-desktop.png |
| a15 | desktop | A15-04 | every day filed, reloaded: no SANS-days line comes back | 17 filed · 20 filed · 21 filed · 22 filed · lit false · 0 lines · SANS: none | PASS | a15-a15-06-bell-desktop.png |
| a15 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a15 | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a15 | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a15 | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a15 | phone | A15-01 | unread, then a reload: one line, still unread, the same line | before lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" · after lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a15-a15-01-bell-phone.png, a15-a15-02-bell-phone.png |
| a15 | phone | A15-02 | read (tapped), page left and back, reloaded: one line, still read | after reading lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" · after reload lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a15-a15-03-after-bell-phone.png, a15-a15-04-bell-phone.png |
| a15 | phone | A15-03 | Sat 18 filed, reloaded: one line, 18 not back, read state kept | filed [{"iid":"imro8ez2nkcwexo","person":"rocky","type":"SANS Availability","date":"Jul 18","yr":2026,"sans":{"o":true},"allday":true}] · lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Mon 20, Tue 21 Jul" · "Planned, no availability filed · 1 more day" | PASS | a15-a15-05-bell-phone.png |
| a15 | phone | A15-04 | every day filed, reloaded: no SANS-days line comes back | 17 filed · 20 filed · 21 filed · 22 filed · lit false · 0 lines · SANS: none | PASS | a15-a15-06-bell-phone.png |
| a15 | phone | errors | console / page errors / failed requests |  | PASS |  |
| a19u | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a19u | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a19u | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a19u | desktop | A19-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a19u-a19-01-bell-desktop.png |
| a19u | desktop | A19-03 | Saber: Admin → Users → Hex → Archive (read back) | note "Hex archived — his sign-in is suspended" | PASS | a19u-a19-03-acc-open-desktop.png, a19u-a19-03-archived-desktop.png |
| a19u | desktop | A19-04 | Hex tries to sign in while archived: his sign-in suspended (RECORD what the screen says) | refused: "TALON Your access is suspended Signed in as hex Ask an admin to enable it when you’re back. Sign out" | RECORDED | a19u-a19-04-signin-desktop.png |
| a19u | desktop | A19-05 | Saber: Archived → Hex → Post in Fri 17 Jul → Restore (read back) | post-in "Fri 17 Jul 26 ▾" · note "Hex restored — he can sign in, and he'll be asked to check his quals and CAT" · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a19u-a19-05-restore-date-desktop.png, a19u-a19-05-restored-desktop.png |
| a19u | desktop | A19-06 | Hex after the restore: his SANS status {"san":false,"sanFrom":null,"archived":false,"deleted":false}, his bell (RECORD; a request only if his restored status is SANS) | lit false · 0 lines · SANS: none | PASS | a19u-a19-06-bell-desktop.png |
| a19u | desktop | A19-07 | Hex's SANS tab after the restore: Sat 18's window, + Commitment (RECORD) | {"head":"⠿Sat 18 JulNo flying set✕FigurePilotsWSOsRequired to fly––Av","box":[1090,96,430,349],"inScreen":true,"topIsWin":true,"add":"disabled","addwhy":"SANS aircrew add their availability here.","list":"No commitments yet."} | RECORDED | a19u-a19-07-sans-desktop.png |
| a19u | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a19u | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a19u | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a19u | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a19u | phone | A19-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a19u-a19-01-bell-phone.png |
| a19u | phone | A19-03 | Saber: Admin → Users → Hex → Archive (read back) | note "Hex archived — his sign-in is suspended" | PASS | a19u-a19-03-acc-open-phone.png, a19u-a19-03-archived-phone.png |
| a19u | phone | A19-04 | Hex tries to sign in while archived: his sign-in suspended (RECORD what the screen says) | refused: "TALON Your access is suspended Signed in as hex Ask an admin to enable it when you’re back. Sign out" | RECORDED | a19u-a19-04-signin-phone.png |
| a19u | phone | A19-05 | Saber: Archived → Hex → Post in Fri 17 Jul → Restore (read back) | post-in "Fri 17 Jul 26 ▾" · note "Hex restored — he can sign in, and he'll be asked to check his quals and CAT" · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a19u-a19-05-restore-date-phone.png, a19u-a19-05-restored-phone.png |
| a19u | phone | A19-06 | Hex after the restore: his SANS status {"san":false,"sanFrom":null,"archived":false,"deleted":false}, his bell (RECORD; a request only if his restored status is SANS) | lit false · 0 lines · SANS: none | PASS | a19u-a19-06-bell-phone.png |
| a19u | phone | A19-07 | Hex's SANS tab after the restore: Sat 18's window, + Commitment (RECORD) | {"head":"⠿Sat 18 JulNo flying set✕FigurePilotsWSOsRequired to fly––Av","box":[0,8,402,854],"inScreen":true,"topIsWin":true,"add":"disabled","addwhy":"SANS aircrew add their availability here.","list":"No commitments yet."} | RECORDED | a19u-a19-07-sans-phone.png |
| a19u | phone | errors | console / page errors / failed requests |  | PASS |  |
| a19r | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a19r | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a19r | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a19r | desktop | A19-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a19r-a19-01-bell-desktop.png |
| a19r | desktop | A19-02 | Hex reads it | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a19r-a19-02-after-bell-desktop.png |
| a19r | desktop | A19-03 | Saber: Admin → Users → Hex → Archive (read back) | note "Hex archived — his sign-in is suspended" | PASS | a19r-a19-03-acc-open-desktop.png, a19r-a19-03-archived-desktop.png |
| a19r | desktop | A19-04 | Hex tries to sign in while archived: his sign-in suspended (RECORD what the screen says) | refused: "TALON Your access is suspended Signed in as hex Ask an admin to enable it when you’re back. Sign out" | RECORDED | a19r-a19-04-signin-desktop.png |
| a19r | desktop | A19-05 | Saber: Archived → Hex → Post in Fri 17 Jul → Restore (read back) | post-in "Fri 17 Jul 26 ▾" · note "Hex restored — he can sign in, and he'll be asked to check his quals and CAT" · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a19r-a19-05-restore-date-desktop.png, a19r-a19-05-restored-desktop.png |
| a19r | desktop | A19-06 | Hex after the restore: his SANS status {"san":false,"sanFrom":null,"archived":false,"deleted":false}, his bell (RECORD; a request only if his restored status is SANS) | lit false · 0 lines · SANS: none | PASS | a19r-a19-06-bell-desktop.png |
| a19r | desktop | A19-07 | Hex's SANS tab after the restore: Sat 18's window, + Commitment (RECORD) | {"head":"⠿Sat 18 JulNo flying set✕FigurePilotsWSOsRequired to fly––Av","box":[1090,96,430,349],"inScreen":true,"topIsWin":true,"add":"disabled","addwhy":"SANS aircrew add their availability here.","list":"No commitments yet."} | RECORDED | a19r-a19-07-sans-desktop.png |
| a19r | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a19r | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a19r | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a19r | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a19r | phone | A19-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a19r-a19-01-bell-phone.png |
| a19r | phone | A19-02 | Hex reads it | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a19r-a19-02-after-bell-phone.png |
| a19r | phone | A19-03 | Saber: Admin → Users → Hex → Archive (read back) | note "Hex archived — his sign-in is suspended" | PASS | a19r-a19-03-acc-open-phone.png, a19r-a19-03-archived-phone.png |
| a19r | phone | A19-04 | Hex tries to sign in while archived: his sign-in suspended (RECORD what the screen says) | refused: "TALON Your access is suspended Signed in as hex Ask an admin to enable it when you’re back. Sign out" | RECORDED | a19r-a19-04-signin-phone.png |
| a19r | phone | A19-05 | Saber: Archived → Hex → Post in Fri 17 Jul → Restore (read back) | post-in "Fri 17 Jul 26 ▾" · note "Hex restored — he can sign in, and he'll be asked to check his quals and CAT" · record {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a19r-a19-05-restore-date-phone.png, a19r-a19-05-restored-phone.png |
| a19r | phone | A19-06 | Hex after the restore: his SANS status {"san":false,"sanFrom":null,"archived":false,"deleted":false}, his bell (RECORD; a request only if his restored status is SANS) | lit false · 0 lines · SANS: none | PASS | a19r-a19-06-bell-phone.png |
| a19r | phone | A19-07 | Hex's SANS tab after the restore: Sat 18's window, + Commitment (RECORD) | {"head":"⠿Sat 18 JulNo flying set✕FigurePilotsWSOsRequired to fly––Av","box":[0,8,402,854],"inScreen":true,"topIsWin":true,"add":"disabled","addwhy":"SANS aircrew add their availability here.","list":"No commitments yet."} | RECORDED | a19r-a19-07-sans-phone.png |
| a19r | phone | errors | console / page errors / failed requests |  | PASS |  |
| a19d | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a19d | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a19d | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a19d | desktop | A19-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a19d-a19-01-bell-desktop.png |
| a19d | desktop | A19-03 | Saber: Admin → Users → Hex → Delete, Tap again (read back) | first press "Tap again to delete Hex" · toast "Hex deleted" · record {"san":true,"sanFrom":"2026-07-17","archived":true,"deleted":true} | PASS | a19d-a19-03-del-armed-desktop.png, a19d-a19-03-deleted-desktop.png |
| a19d | desktop | A19-04 | Hex after the delete: his sign-in, and his stored lines (window.NOTICES, read) (RECORD) | cannot sign in: "TALON Request access Signed in as hex You're not on the squadron's list yet. Tell the admins who you are and they'll give you access. DISPLAYED CALLSIGN/NAME INITIALS PILOT, WSO OR PERSONNEL Pick… Pil" · stored lines [] | RECORDED | a19d-a19-04-signin-desktop.png |
| a19d | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a19d | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a19d | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a19d | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a19d | phone | A19-01 | Fri 17: his line is there | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a19d-a19-01-bell-phone.png |
| a19d | phone | A19-03 | Saber: Admin → Users → Hex → Delete, Tap again (read back) | first press "Tap again to delete Hex" · toast "Hex deleted" · record {"san":true,"sanFrom":"2026-07-17","archived":true,"deleted":true} | PASS | a19d-a19-03-del-armed-phone.png, a19d-a19-03-deleted-phone.png |
| a19d | phone | A19-04 | Hex after the delete: his sign-in, and his stored lines (window.NOTICES, read) (RECORD) | cannot sign in: "TALON Request access Signed in as hex You're not on the squadron's list yet. Tell the admins who you are and they'll give you access. DISPLAYED CALLSIGN/NAME INITIALS PILOT, WSO OR PERSONNEL CAT Reque" · stored lines [] | RECORDED | a19d-a19-04-signin-phone.png |
| a19d | phone | errors | console / page errors / failed requests |  | PASS |  |
| a21 | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a21 | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a21 | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a21 | desktop | A21-01 | Hex reads his line | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a21-a21-01-after-bell-desktop.png |
| a21 | desktop | A21-02 | Saber: posting sheet (posted-out sheet) → Undo post out (PO) (read back) | {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a21-a21-02-sheet-desktop.png, a21-a21-02-undone-desktop.png |
| a21 | desktop | A21-03 | Saber: the same posting made again — Hex's 17 Jul cell → ⋯ → Post out → SANS → Post out (today: it runs at once; read back) | line "On 17 Jul: becomes SANS." · {"san":true,"sanFrom":"2026-07-17"} | PASS | a21-a21-03-postout-open-desktop.png, a21-a21-03-postout-sheet-desktop.png |
| a21 | desktop | A21-04 | Hex's bell: the taken-back line struck AND one new active line, unread | lit true · 2 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" \|\| [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a21-a21-04-bell-desktop.png |
| a21 | desktop | A21-05 | after a reload: the same two | lit true · 2 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" \|\| [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a21-a21-05-bell-desktop.png |
| a21 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a21 | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a21 | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a21 | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a21 | phone | A21-01 | Hex reads his line | lit false · 1 lines · SANS: [read] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a21-a21-01-after-bell-phone.png |
| a21 | phone | A21-02 | Saber: posting sheet (posted-out sheet) → Undo post out (PO) (read back) | {"san":false,"sanFrom":null,"archived":false,"deleted":false} | PASS | a21-a21-02-sheet-phone.png, a21-a21-02-undone-phone.png |
| a21 | phone | A21-03 | Saber: the same posting made again — Hex's 17 Jul cell → ⋯ → Post out → SANS → Post out (today: it runs at once; read back) | line "On 17 Jul: becomes SANS." · {"san":true,"sanFrom":"2026-07-17"} | PASS | a21-a21-03-postout-open-phone.png, a21-a21-03-postout-sheet-phone.png |
| a21 | phone | A21-04 | Hex's bell: the taken-back line struck AND one new active line, unread | lit true · 2 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" \|\| [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a21-a21-04-bell-phone.png |
| a21 | phone | A21-05 | after a reload: the same two | lit true · 2 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · struck "Planned, no availability filed · 2 more days" · "Planned, no availability filed · 2 more days · taken back · Saber" \|\| [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a21-a21-05-bell-phone.png |
| a21 | phone | errors | console / page errors / failed requests |  | PASS |  |
| a22 | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a22 | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a22 | desktop | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a22 | desktop | A22-01 | Fri 17: his line | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a22-a22-01-bell-desktop.png |
| a22 | desktop | A22-02 | Tue 21 BRIEF (his only item that day) cancelled — CX (RECORD the line) | row now {"prog":"BRIEF","cx":true,"info":false,"asked":"asked \"Cancel this item\", answered Cancel line (blank reason)"} · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" | RECORDED | a22-a22-02-cx-desktop.png, a22-a22-02-hex-bell-desktop.png |
| a22 | desktop | A22-03 | Tue 21 BRIEF restored — CX again (RECORD the line) | row now {"prog":"BRIEF","cx":false,"info":false,"asked":"asked \"This item is cancelled — reason\", answered Un-cancel"} · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | RECORDED | a22-a22-03-cx-desktop.png, a22-a22-03-hex-bell-desktop.png |
| a22 | desktop | A22-04 | Tue 21 BRIEF made Info only — ⓘ (RECORD the line) | row now {"prog":"BRIEF","cx":false,"info":true,"asked":""} · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" | RECORDED | a22-a22-04-info-desktop.png, a22-a22-04-hex-bell-desktop.png |
| a22 | desktop | A22-05 | Tue 21 BRIEF back to a checked item — ⓘ again (RECORD the line) | row now {"prog":"BRIEF","cx":false,"info":false,"asked":""} · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | RECORDED | a22-a22-05-info-desktop.png, a22-a22-05-hex-bell-desktop.png |
| a22 | desktop | A22-06 | control: Sat 18 TALK cancelled while his BRIEF that day stands (RECORD the line) | row now {"prog":"TALK","cx":true,"info":false,"asked":"asked \"Cancel this item\", answered Cancel line (blank reason)"} · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | RECORDED | a22-a22-06-cx-desktop.png, a22-a22-06-hex-bell-desktop.png |
| a22 | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a22 | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a22 | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| a22 | phone | clock | clock moved to Fri 17 Jul 09:00 (setSystemTime) and the page reloaded, Hex signed in | Fri Jul 17 2026 09:00 · week loaded 13/07/2026 · Hex {"san":true,"sanFrom":"2026-07-17","archived":false,"deleted":false} | PASS |  |
| a22 | phone | A22-01 | Fri 17: his line | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | PASS | a22-a22-01-bell-phone.png |
| a22 | phone | A22-02 | Tue 21 BRIEF (his only item that day) cancelled — CX (RECORD the line) | row now {"prog":"BRIEF","cx":true,"info":false,"asked":"asked \"Cancel this item\", answered Cancel line (blank reason)"} · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" | RECORDED | a22-a22-02-cx-phone.png, a22-a22-02-hex-bell-phone.png |
| a22 | phone | A22-03 | Tue 21 BRIEF restored — CX again (RECORD the line) | row now {"prog":"BRIEF","cx":false,"info":false,"asked":"asked \"This item is cancelled — reason\", answered Un-cancel"} · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | RECORDED | a22-a22-03-cx-phone.png, a22-a22-03-hex-bell-phone.png |
| a22 | phone | A22-04 | Tue 21 BRIEF made Info only — ⓘ (RECORD the line) | row now {"prog":"BRIEF","cx":false,"info":true,"asked":""} · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 1 more day" | RECORDED | a22-a22-04-info-phone.png, a22-a22-04-hex-bell-phone.png |
| a22 | phone | A22-05 | Tue 21 BRIEF back to a checked item — ⓘ again (RECORD the line) | row now {"prog":"BRIEF","cx":false,"info":false,"asked":""} · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | RECORDED | a22-a22-05-info-phone.png, a22-a22-05-hex-bell-phone.png |
| a22 | phone | A22-06 | control: Sat 18 TALK cancelled while his BRIEF that day stands (RECORD the line) | row now {"prog":"TALK","cx":true,"info":false,"asked":"asked \"Cancel this item\", answered Cancel line (blank reason)"} · lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sat 18, Mon 20 Jul" · "Planned, no availability filed · 2 more days" | RECORDED | a22-a22-06-cx-phone.png, a22-a22-06-hex-bell-phone.png |
| a22 | phone | errors | console / page errors / failed requests |  | PASS |  |
| a23j | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a23j | desktop | F01 | Leave War: Hex's 2026-07-31 cell → ⋯ → Post out → SANS → Post out | sheet line "On 31 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | a23j-F01-postout-open-desktop.png, a23j-F01-postout-sheet-desktop.png |
| a23j | desktop | F-wk-2026-07-27 | Edit Schedule moved to the week of 2026-07-27 (read: CURWEEK) | 27/07/2026 | PASS |  |
| a23j | desktop | F-2026-07-27-4-BRIEF | week of 2026-07-27, day 4: BRIEF 08:00–09:00 naming Hex (read back; before: Jul 31: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldiegii2fgc0"} | PASS | a23j-F03-2026-07-27-4-desktop.png |
| a23j | desktop | F-wk-2026-08-03 | Edit Schedule moved to the week of 2026-08-03 (read: CURWEEK) | 03/08/2026 | PASS |  |
| a23j | desktop | F-2026-08-03-0-BRIEF | week of 2026-08-03, day 0: BRIEF 08:00–09:00 naming Hex (read back; before: Aug 3: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldin24r91h6a"} | PASS | a23j-F03-2026-08-03-0-desktop.png |
| a23j | desktop | F-2026-08-03-1-BRIEF | week of 2026-08-03, day 1: BRIEF 08:00–09:00 naming Hex (read back; before: Aug 4: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrlditribt9caw"} | PASS | a23j-F03-2026-08-03-1-desktop.png |
| a23j | desktop | F-2026-08-03-3-BRIEF | week of 2026-08-03, day 3: BRIEF 08:00–09:00 naming Hex (read back; before: Aug 6: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldj0mb482ghk"} | PASS | a23j-F03-2026-08-03-3-desktop.png |
| a23j | desktop | F-home | back on the week of 13 Jul; what Hex holds each day (read) | Jul 13: .sims.amt[1].pax[5] \| Jul 14: .waves[0].formations[0].aircraft[1].w \| Jul 15: .waves[0].formations[0].aircraft[1].w \| Jul 16: .waves[1].formations[1].aircraft[0].w \| Jul 17: nothing \| Jul 18: nothing \| Jul 19: nothing | PASS |  |
| a23j | desktop | A23-jul-1 | clock to the posting's date (Fri Jul 31 2026 09:00): one active line; the days and months read right, nothing doubled or invented (RECORD the words) | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 31 Jul, Mon 3, Tue 4 Aug" · "Planned, no availability filed · 1 more day" · facts ["Jul 13: .sims.amt[1].pax[5]","Jul 14: .waves[0].formations[0].aircraft[1].w","Jul 15: .waves[0].formations[0].aircraft[1].w","Jul 16: .waves[1].formations[1].aircraft[0].w","Jul 17: nothing","Jul 18: nothing","Jul 19: nothing"] · next weeks before: before-2026-07-27 Jul 31: nothing ; before-2026-08-03 Aug 6: nothing | RECORDED | a23j-a23-jul-bell-desktop.png |
| a23j | desktop | A23-jul-2 | the line's box: 338×69 px at x 894..1232 of 1536; one entry in the list (RECORD; phone: wraps inside the screen) | line heights in the list [69] | PASS |  |
| a23j | desktop | A23-jul-3 | its tap: the SANS tab at the first day's month, that day's window open | {"page":"inputs","month":"July 2026","win":{"head":"⠿Fri 31 JulDay flying✕FigurePilotsWSOsRequired to fly––Avail","box":[1090,96,430,325],"inScreen":true,"topIsWin":true,"add":"enabled","addwhy":"","list":"No commitments yet."}} | PASS | a23j-a23-jul-tap-tapped-desktop.png |
| a23j | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a23j | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a23j | phone | F01 | Leave War: Hex's 2026-07-31 cell → ⋯ → Post out → SANS → Post out | sheet line "On 31 Jul: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | a23j-F01-postout-open-phone.png, a23j-F01-postout-sheet-phone.png |
| a23j | phone | F-wk-2026-07-27 | Edit Schedule moved to the week of 2026-07-27 (read: CURWEEK) | 27/07/2026 | PASS |  |
| a23j | phone | F-2026-07-27-4-BRIEF | week of 2026-07-27, day 4: BRIEF 08:00–09:00 naming Hex (read back; before: Jul 31: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldimdlorz7dn"} | PASS | a23j-F03-2026-07-27-4-phone.png |
| a23j | phone | F-wk-2026-08-03 | Edit Schedule moved to the week of 2026-08-03 (read: CURWEEK) | 03/08/2026 | PASS |  |
| a23j | phone | F-2026-08-03-0-BRIEF | week of 2026-08-03, day 0: BRIEF 08:00–09:00 naming Hex (read back; before: Aug 3: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldiziescd3en"} | PASS | a23j-F03-2026-08-03-0-phone.png |
| a23j | phone | F-2026-08-03-1-BRIEF | week of 2026-08-03, day 1: BRIEF 08:00–09:00 naming Hex (read back; before: Aug 4: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldj8jauofdpt"} | PASS | a23j-F03-2026-08-03-1-phone.png |
| a23j | phone | F-2026-08-03-3-BRIEF | week of 2026-08-03, day 3: BRIEF 08:00–09:00 naming Hex (read back; before: Aug 6: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldjhwjhyjjme"} | PASS | a23j-F03-2026-08-03-3-phone.png |
| a23j | phone | F-home | back on the week of 13 Jul; what Hex holds each day (read) | Jul 13: .sims.amt[1].pax[5] \| Jul 14: .waves[0].formations[0].aircraft[1].w \| Jul 15: .waves[0].formations[0].aircraft[1].w \| Jul 16: .waves[1].formations[1].aircraft[0].w \| Jul 17: nothing \| Jul 18: nothing \| Jul 19: nothing | PASS |  |
| a23j | phone | A23-jul-1 | clock to the posting's date (Fri Jul 31 2026 09:00): one active line; the days and months read right, nothing doubled or invented (RECORD the words) | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 31 Jul, Mon 3, Tue 4 Aug" · "Planned, no availability filed · 1 more day" · facts ["Jul 13: .sims.amt[1].pax[5]","Jul 14: .waves[0].formations[0].aircraft[1].w","Jul 15: .waves[0].formations[0].aircraft[1].w","Jul 16: .waves[1].formations[1].aircraft[0].w","Jul 17: nothing","Jul 18: nothing","Jul 19: nothing"] · next weeks before: before-2026-07-27 Jul 31: nothing ; before-2026-08-03 Aug 6: nothing | RECORDED | a23j-a23-jul-bell-phone.png |
| a23j | phone | A23-jul-2 | the line's box: 376×52 px at x 13..389 of 402; one entry in the list (RECORD; phone: wraps inside the screen) | line heights in the list [52] | PASS |  |
| a23j | phone | A23-jul-3 | its tap: the SANS tab at the first day's month, that day's window open | {"page":"inputs","month":"Jul 2026","win":{"head":"⠿Fri 31 JulDay flying✕FigurePilotsWSOsRequired to fly––Avail","box":[0,8,402,854],"inScreen":true,"topIsWin":true,"add":"enabled","addwhy":"","list":"No commitments yet."}} | PASS | a23j-a23-jul-tap-tapped-phone.png |
| a23j | phone | errors | console / page errors / failed requests |  | PASS |  |
| a23d | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a23d | desktop | F01 | Leave War: Hex's 2026-12-31 cell → ⋯ → Post out → SANS → Post out | sheet line "On 31 Dec: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | a23d-F01-postout-open-desktop.png, a23d-F01-postout-sheet-desktop.png |
| a23d | desktop | F-wk-2026-12-28 | Edit Schedule moved to the week of 2026-12-28 (read: CURWEEK) | 28/12/2026 | PASS |  |
| a23d | desktop | F-2026-12-28-3-BRIEF | week of 2026-12-28, day 3: BRIEF 08:00–09:00 naming Hex (read back; before: Dec 31: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldihvnq8ek45"} | PASS | a23d-F03-2026-12-28-3-desktop.png |
| a23d | desktop | F-2026-12-28-4-BRIEF | week of 2026-12-28, day 4: BRIEF 08:00–09:00 naming Hex (read back; before: Jan 1 2027: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldioh3o48bgx"} | PASS | a23d-F03-2026-12-28-4-desktop.png |
| a23d | desktop | F-home | back on the week of 13 Jul; what Hex holds each day (read) | Jul 13: .sims.amt[1].pax[5] \| Jul 14: .waves[0].formations[0].aircraft[1].w \| Jul 15: .waves[0].formations[0].aircraft[1].w \| Jul 16: .waves[1].formations[1].aircraft[0].w \| Jul 17: nothing \| Jul 18: nothing \| Jul 19: nothing | PASS |  |
| a23d | desktop | A23-dec-1 | clock to the posting's date (Thu Dec 31 2026 09:00): one active line; the days and months read right, nothing doubled or invented (RECORD the words) | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Thu 31 Dec, Fri 1 Jan" · "Planned, no availability filed" · facts ["Jul 13: .sims.amt[1].pax[5]","Jul 14: .waves[0].formations[0].aircraft[1].w","Jul 15: .waves[0].formations[0].aircraft[1].w","Jul 16: .waves[1].formations[1].aircraft[0].w","Jul 17: nothing","Jul 18: nothing","Jul 19: nothing"] · next weeks before: before-2026-12-28 Jan 1 2027: nothing | RECORDED | a23d-a23-dec-bell-desktop.png |
| a23d | desktop | A23-dec-2 | the line's box: 338×52 px at x 894..1232 of 1536; one entry in the list (RECORD; phone: wraps inside the screen) | line heights in the list [52] | PASS |  |
| a23d | desktop | A23-dec-3 | its tap: the SANS tab at the first day's month, that day's window open | {"page":"inputs","month":"December 2026","win":{"head":"⠿Thu 31 DecDay flying✕FigurePilotsWSOsRequired to fly––Avail","box":[1090,96,430,325],"inScreen":true,"topIsWin":true,"add":"enabled","addwhy":"","list":"No commitments yet."}} | PASS | a23d-a23-dec-tap-tapped-desktop.png |
| a23d | desktop | errors | console / page errors / failed requests |  | PASS |  |
| a23d | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| a23d | phone | F01 | Leave War: Hex's 2026-12-31 cell → ⋯ → Post out → SANS → Post out | sheet line "On 31 Dec: becomes SANS." · record {"san":false,"sanFrom":null} | PASS | a23d-F01-postout-open-phone.png, a23d-F01-postout-sheet-phone.png |
| a23d | phone | F-wk-2026-12-28 | Edit Schedule moved to the week of 2026-12-28 (read: CURWEEK) | 28/12/2026 | PASS |  |
| a23d | phone | F-2026-12-28-3-BRIEF | week of 2026-12-28, day 3: BRIEF 08:00–09:00 naming Hex (read back; before: Dec 31: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldir82w22t1b"} | PASS | a23d-F03-2026-12-28-3-phone.png |
| a23d | phone | F-2026-12-28-4-BRIEF | week of 2026-12-28, day 4: BRIEF 08:00–09:00 naming Hex (read back; before: Jan 1 2027: nothing) | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmrldj0b8kd2lm7"} | PASS | a23d-F03-2026-12-28-4-phone.png |
| a23d | phone | F-home | back on the week of 13 Jul; what Hex holds each day (read) | Jul 13: .sims.amt[1].pax[5] \| Jul 14: .waves[0].formations[0].aircraft[1].w \| Jul 15: .waves[0].formations[0].aircraft[1].w \| Jul 16: .waves[1].formations[1].aircraft[0].w \| Jul 17: nothing \| Jul 18: nothing \| Jul 19: nothing | PASS |  |
| a23d | phone | A23-dec-1 | clock to the posting's date (Thu Dec 31 2026 09:00): one active line; the days and months read right, nothing doubled or invented (RECORD the words) | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Thu 31 Dec, Fri 1 Jan" · "Planned, no availability filed" · facts ["Jul 13: .sims.amt[1].pax[5]","Jul 14: .waves[0].formations[0].aircraft[1].w","Jul 15: .waves[0].formations[0].aircraft[1].w","Jul 16: .waves[1].formations[1].aircraft[0].w","Jul 17: nothing","Jul 18: nothing","Jul 19: nothing"] · next weeks before: before-2026-12-28 Jan 1 2027: nothing | RECORDED | a23d-a23-dec-bell-phone.png |
| a23d | phone | A23-dec-2 | the line's box: 376×52 px at x 13..389 of 402; one entry in the list (RECORD; phone: wraps inside the screen) | line heights in the list [52] | PASS |  |
| a23d | phone | A23-dec-3 | its tap: the SANS tab at the first day's month, that day's window open | {"page":"inputs","month":"Dec 2026","win":{"head":"⠿Thu 31 DecDay flying✕FigurePilotsWSOsRequired to fly––Avail","box":[0,8,402,854],"inScreen":true,"topIsWin":true,"add":"enabled","addwhy":"","list":"No commitments yet."}} | PASS | a23d-a23-dec-tap-tapped-phone.png |
| a23d | phone | errors | console / page errors / failed requests |  | PASS |  |
| wp | desktop | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| wp | desktop | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| wp | desktop | WP-01 | Saber: Sat 18 signed and published (Publish day), Hex on its BRIEF and TALK | {"pend":0,"notSigned":false,"signed":"SIGNED ORIG CUR CKAce SKED CKAnvil PLANNEDBasher APPROVEDBolt","approved":true} | PASS | wp-wp-01-desktop.png |
| wp | desktop | WP-02 | draft only: both Sat 18 rows naming Hex removed from the working copy, not published | left [] · {"pend":2,"notSigned":true,"signed":"SIGNED ORIG CUR CKAce SKED CKAnvil PLANNEDBasher APPROVEDBolt","approved":true} | PASS | wp-wp-02-desktop.png |
| wp | desktop | WP-03 | draft only: Sun 19 published (Publish day) without Hex, then a BRIEF naming him added to the working copy | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmro8efkhvui2ve"} · {"pend":1,"notSigned":true,"signed":"SIGNED ORIG CUR CKAce SKED CKAnvil PLANNEDBasher APPROVEDBolt","approved":true} | PASS | wp-wp-03-desktop.png |
| wp | desktop | WP-04 | Hex's line: which copy drives it (RECORD) — 18 named = the published copy for the removal; 19 named = the working copy for the addition | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sun 19, Mon 20 Jul" · "Planned, no availability filed · 2 more days" → Sat 18 not named · Sun 19 NAMED | RECORDED | wp-wp-04-bell-desktop.png |
| wp | desktop | errors | console / page errors / failed requests |  | PASS |  |
| wp | phone | today | the app's today (page clock) | Wed Jul 15 2026 09:00 | NOTE |  |
| wp | phone | world | the saved world reopened: Hex on Fri 17 BRIEF and on two Sat 18 rows (read) | {"fri":true,"sat":2} | PASS |  |
| wp | phone | WP-01 | Saber: Sat 18 signed and published (Publish day), Hex on its BRIEF and TALK | {"pend":0,"notSigned":false,"signed":"SIGNED ORIG Ace Anvil Basher Bolt","approved":true} | PASS | wp-wp-01-phone.png |
| wp | phone | WP-02 | draft only: both Sat 18 rows naming Hex removed from the working copy, not published | left [] · {"pend":2,"notSigned":true,"signed":"SIGNED ORIG Ace Anvil Basher Bolt","approved":true} | PASS | wp-wp-02-phone.png |
| wp | phone | WP-03 | draft only: Sun 19 published (Publish day) without Hex, then a BRIEF naming him added to the working copy | {"prog":"BRIEF","str":"08:00","end":"09:00","who":"rocky","rid":"rmro8eicuzpmiv7"} · {"pend":1,"notSigned":true,"signed":"SIGNED ORIG Ace Anvil Basher Bolt","approved":true} | PASS | wp-wp-03-phone.png |
| wp | phone | WP-04 | Hex's line: which copy drives it (RECORD) — 18 named = the published copy for the removal; 19 named = the working copy for the addition | lit true · 1 lines · SANS: [unread] "Your SANS availability" · "Fri 17, Sun 19, Mon 20 Jul" · "Planned, no availability filed · 2 more days" → Sat 18 not named · Sun 19 NAMED | RECORDED | wp-wp-04-bell-phone.png |
| wp | phone | errors | console / page errors / failed requests |  | PASS |  |
