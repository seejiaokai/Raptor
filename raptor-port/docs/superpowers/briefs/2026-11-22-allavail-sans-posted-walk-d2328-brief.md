# Walk brief, round 4 — ALL AVAIL and the post-in date (his D2328), 22 Nov 26, chat 141 — walker w3

You are walker **w3**: you drive the running app like a person and report what the screen says. You do not read code
for bugs and you do not fix anything. Read first, whole: `docs/walk-scripts.md` (how a walk script and a report are
written here) and the first walk's brief, `docs/superpowers/briefs/2026-11-22-allavail-sans-posted-walk-brief.md` (its
method, fixture, sign-in, clock and report shape all apply). This page only adds what round 4 walks.

## What changed

The owner ruled (D2328, 22 Nov 26): "the sans should left out until he becomes a SANS. This modality should be applied
for post in and out. Like they should only reflect their actual status on the day itself." Before his post-in date a man
is not ours, even a SANS man named on our programme: ALL AVAIL leaves him out until that date. The app was changed to do
this. Nothing a person presses changed — only who is in the ALL AVAIL list and its count.

## Where and how

- The build is already made and current: serve `raptor-port/dist` yourself with
  `npx vite preview --port 4392 --strictPort` from `C:\Users\User\projects\Raptor\raptor-port` (check the port is free
  first; if it is held, use 4394 and say so). **Do not run `npm run build` or any browser test suite** — another chat
  may hold the checks lock. Stop your server by its PORT when you finish (`Get-NetTCPConnection -LocalPort 4392` →
  `Stop-Process`), never by a command-line pattern.
- Reuse the first walk's helpers: `scripts/handpass/asp-w2-lib.mjs` (it reads `W2_URL` and `W2_OUT` from the
  environment) and, for S1, `scripts/handpass/asp-w1-lib.mjs` / `asp-w1-s1.mjs`. Write your own script
  `scripts/handpass/asp-w3.mjs` (and more `asp-w3-*.mjs` if you need them). Never edit the w1 / w2 scripts or their
  picture folders — those are the first walk's evidence.
- Pictures: `docs/img/handpass/2026-11-22-allavail-sans-posted/w3/`. Report:
  `docs/handpass/parts/asp/w3-report.md`, in the shape of `w2-report.md` there (a table per scenario: what I did, what
  the screen said, verdict, pictures), then "Recorded", "The walk's own mistakes", and console / page errors.
- Clock: Wed 15 Jul 26 09:00, installed before the app loads, as the w2 library does. Sign in `ad` / `a`.
- "In the crowd" is read as membership — the man's own puck in the ALL AVAIL window — beside the count chip, each with
  "+ SANS" off, then on, then off again on the Leave War (the w2 library's `bothWays`).
- A set-up step that can refuse (Post out, Post in, New person, the Quals tick) is checked by reading back what it
  made before the scenario goes on; a scenario whose set-up did not take is reported as the walk's own mistake and run
  again, never as a FAIL of the app.

## The scenarios — each EXPECTED line names its source

| # | Size | Do | EXPECTED | Source |
|---|---|---|---|---|
| R4-1 | desktop and phone | Admin → Users: New person (callsign Quokka, WSO, CAT C), Post in Fri 17 Jul, Add. Quals: tick his SANS. Scheduler Board Thu 16 Jul: a Ground Programme BRIEF 08:00–09:00 naming Quokka, a Common Programme SQN EVENT 10:00–17:00 for ALL AVAIL. Press the event's count. | Quokka is NOT in the list — the same with "+ SANS" off, on and off again. The count: RECORD it each way; the three must be equal. | D2328's full row (the very case he ruled on). On the build before this change the same steps counted him: 22 (walker w2, S3-5). |
| R4-2 | desktop and phone | The same Quokka. Scheduler Board Sat 18 Jul (after his post-in date): BRIEF 08:00–09:00 naming Quokka, SQN EVENT 10:00–17:00 for ALL AVAIL. Press the count. | Quokka IS in the list, the same all three ways. Count: RECORD. | D2328 ("until that date"); D27 (a SANS man planned with us that day counts). |
| R4-3 | desktop | The same Quokka. Scheduler Board Tue 14 Jul (before today's SANS tick and before his post-in date): a Common Programme SQN EVENT 10:00–17:00 for ALL AVAIL, Quokka not named. Press the count. | Quokka is NOT in the list, the same all three ways. Count: RECORD. | D2328; D308 (counted from his post-in date). |
| R4-4 | desktop | A fresh world. New person Kiwi (WSO, CAT C), Post in Fri 17 Jul, NOT ticked SANS. Thu 16 Jul: SQN EVENT 10:00–17:00 for ALL AVAIL. Press the count. Then the same on Sat 18 Jul. | Thu: Kiwi NOT in the list. Sat: Kiwi IN the list. Each the same all three ways. Counts: RECORD. | D308; "as before the change" (a unit test held it). If "Kiwi" is taken, pick another free callsign and say so. |
| R4-5 | desktop | A fresh world. The first walk's S1 again, whole: post Hex out as SANS from Wed 15 Jul (his Leave War cell → ⋯ → Post out → SANS → Post out), name him on Sat 18 Jul's BRIEF 08:00–09:00, SQN EVENT 10:00–17:00 for ALL AVAIL, read the count; sign the four boxes, Publish; Leave War: Hex's Sat 18 Jul cell; then "+ SANS" on, off, on, off, reading Saturday's pending count and signed line each time. | As the first walk recorded on the earlier build: count 45 with Hex in the list each way; after publishing "FO*" on Hex's Sat 18 Jul; after every switch 0 pending and the "SIGNED ORIG" line unchanged. | The first walk's S1 (`docs/handpass/parts/asp/w1-report.md`) — this round must not change it. |
| R4-6 | desktop | A fresh world. The first walk's S13 again (w2's script `s13`): Hex posted out as SANS, days published with him named, then archived on Admin → Users. | As w2 recorded: Tue's crowd keeps Hex; Tue's one pending line names his posting out; Thu's count drops by one after the archive. RECORD the counts and compare with w2's (35; 33 → 32). | The first walk's S13 (`docs/handpass/parts/asp/w2-report.md`); D327. |

A count is always RECORDED, never asserted from this page. If a step's result differs from EXPECTED, stop that
scenario, picture it, and report exactly what the screen said — do not adjust the expectation.

## What you hand back

Your report file, and as your final message: one line per scenario and size (PASS / FAIL / RECORDED with the counts),
every FAIL with its picture's file name and the exact words on screen, the walk's own mistakes, any console or page
error, the port you used and that you stopped your server. Do not commit or push anything.
