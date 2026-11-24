# Walk brief, round 4b — a SANS posting set ahead (his D2329), the restore repair and a delete before arrival, 22 Nov 26, chat 146 — walker w4

You are walker **w4**: you drive the running app like a person and report what the screen says. You do not read code
for bugs and you do not fix anything. Read first, whole: `docs/walk-scripts.md` (how a walk script and a report are
written here) and the first walk's brief, `docs/superpowers/briefs/2026-11-22-allavail-sans-posted-walk-brief.md` (its
method, fixture, sign-in, clock and report shape all apply), then round 4's, `…-walk-d2328-brief.md` (its "Where and
how" applies, with the changes below). This page only adds what round 4b walks.

## What changed

- His D2329 (22 Nov 26): "on 15 jul hex is put to post out on 17 jul. on 18 jul he is planned to be on a briefing … So
  from 15 -16 jul he should be counted in all avail assuming that he available. On 18 jul if he is not planned for
  anything, hes not going to be counted in all avail. but if hes planned like briefing, hes going to be counted in the
  all avail. assuming that the timing is deconflicted." Read by the day, whenever the day is looked at: a Saturday seen
  or published on Wed 15 Jul already counts him, and does not turn pending when Fri 17 Jul arrives. Every screen now
  reads such a day as a SANS day for him (his puck on Saturday may wear the purple SANS line already — RECORD it).
- A man posted out as SANS, archived, then restored with a later post-in date keeps the days he flew with us.
- A man deleted before he ever arrived is not counted on the days before his post-in date.
Nothing a person presses changed.

## Where and how — the changes to round 4's

- The build is made and current in THIS chat's copy: serve
  `C:\Users\User\projects\Raptor\.claude\worktrees\fable-read-faults-4104f0\raptor-port\dist` with
  `npx vite preview --port 4393 --strictPort`, run from that `raptor-port` folder (check the port is free first; if held,
  4395, and say so). Never run `npm run build` or a browser test suite. Stop your server by its PORT when you finish.
- Write your scripts as `scripts/handpass/asp-w4*.mjs` in that same copy, reusing `asp-w2-lib.mjs` (`W2_URL`, `W2_OUT`
  from the environment). Pictures: `docs/img/handpass/2026-11-22-allavail-sans-posted/w4/`. Report:
  `docs/handpass/parts/asp/w4-report.md`, in `w2-report.md`'s shape. Never edit another walker's scripts or pictures.
- Clock: Wed 15 Jul 26 09:00 before the app loads, as the w2 library does. For W1's last part, move the clock to
  Fri 17 Jul 26 09:00 and reload, keeping the same browser storage (the same world), then sign in again.
- "In the crowd" is the man's own puck in the ALL AVAIL window, beside the count chip, each with "+ SANS" off, on and off
  again on the Leave War (the w2 library's `bothWays`). Every set-up step that can refuse is read back before going on;
  one that did not take is the walk's own mistake, run again, never a FAIL.
- A picture right after each press that decides something, and the settled one; on the phone a picture after each tap.

## The scenarios — each EXPECTED line names its source

| # | Size | Do | EXPECTED | Source |
|---|---|---|---|---|
| W1 | desktop and phone | Wed 15 Jul. Leave War: Hex's cell → ⋯ → Post out, date Fri 17 Jul, SANS, Post out (read back: his row shows the posting from Fri). Scheduler Board Thu 16 Jul: Common Programme SQN EVENT 10:00–17:00 for ALL AVAIL, Hex not named; press the count. Sat 18 Jul: the same event, Hex not named; press the count. Then on Sat a Ground Programme BRIEF 08:00–09:00 naming Hex; press the count again. Picture Hex's puck on Sat's brief, close up. | Thu: Hex IN. Sat not named: Hex NOT in. Sat named: Hex IN. Each the same all three ways. Counts: RECORD. Hex's puck: RECORD whether it wears the purple SANS line. | D2329 (his example, word for word) |
| W1b | desktop | Continue W1's world: sign Saturday's four boxes, Publish. Read Sat's pending count and signed line, Hex in the window, and the Leave War's Sat 18 Jul cell for Hex. Move the clock to Fri 17 Jul 09:00, reload, sign in. Read again: Sat's pending count, the signed line, the window (Hex in?), the Leave War cell; the Leave War row (does it now show him SANS from Fri?). Then "+ SANS" on, off, reading Sat's pending count each time. | After publishing: 0 pending, "SIGNED ORIG", Hex in, his Sat cell RECORD (expected "FO*" — the event's hours). After Friday arrives: still 0 pending, the same signed line, Hex still in, the same cell; after each switch 0 pending. | D2329 (the agent's reading told to him: "does not turn pending when Fri 17 Jul arrives"); D44, D45; D25 |
| W2 | desktop | A fresh world. As W1 to Sat, but the BRIEF 10:00–11:00 naming Hex (inside the event). Press the count. | Hex NOT in, all three ways (his times clash). | D2329 ("assuming that the timing is deconflicted") |
| W3 | desktop | A fresh world. Post Hex out as SANS from Mon 13 Jul (it runs at once). Tue 14 Jul: BRIEF 08:00–09:00 naming Hex, SQN EVENT 10:00–17:00 for ALL AVAIL; press the count (Hex in?). Sign Tue's four boxes, Publish. Admin → Users: archive Hex (today, Wed). Then Restore him with Post in Sat 18 Jul. Back on Tue 14 Jul: press the count; read Tue's pending count and, if any, each pending line's words. | Tue before: Hex IN. After the archive and after the restore: Hex still IN Tue's window, all three ways; the count unchanged. Pending: RECORD each line's words (a line about his posting or archive may stand, D327; none about who earns OIL or about the crowd). | D283, D327; the fresh reader's R1 of D2328 |
| W4 | desktop | A fresh world. Admin → Users: New person Kiwi (WSO, CAT C), Post in Fri 17 Jul, Add (read back). Tue 14 Jul: SQN EVENT 10:00–17:00 for ALL AVAIL; press the count (Kiwi in?). Admin → Users: delete Kiwi (both presses). Tue again: press the count. | Kiwi NOT in, before the delete and after it; the count unchanged by the delete. If "Kiwi" is taken, pick another free callsign and say so. | D2328, D308, D297; Astra's finding 2 |
| PU | desktop and phone | The plain-user round on W1's world: open the ALL AVAIL window from the count and close it by its ✕; open Hex's Post out sheet again and close it by its ✕ without changing anything; look at the Leave War grid's row for Hex around 17 Jul. | Each opens and closes; nothing changes; RECORD what the grid draws for Hex from Fri 17 Jul. | the order's §7.0a (D1557) |

A count is always RECORDED, never asserted from this page. If a result differs from EXPECTED, stop that scenario,
picture it, and report exactly what the screen said — never adjust the expectation.

## What you hand back

Your report file, and as your final message: one line per scenario and size (PASS / FAIL / RECORDED with the counts),
every FAIL with its picture's file name and the exact words on screen, the walk's own mistakes, any console or page
error, the port you used and that you stopped your server. Do not commit or push anything.
