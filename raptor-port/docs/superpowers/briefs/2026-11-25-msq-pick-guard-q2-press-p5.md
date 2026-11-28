# [MSQ-PICK-GUARD] the second questions page — presser P5's report: the six cases the plan's writer found (chat 175, 25 Nov 26)

Brief: `2026-11-25-msq-pick-guard-q2-press-brief.md` §P5. An Opus helper; saved whole from its hand-back by the host.

---

# P5 — the six cases the build plan's writer found from the code (today's app, 25 Nov 26, app at 4700)

Nothing under `src` changed, nothing committed. Scripts: `raptor-port/scripts/handpass/n175/p5-*.mjs`. Deciding pictures (whole + `-crop`, ringed): `raptor-port/docs/mock/2026-11-25-msq-pick-guard-q2/today/p5-*`. Logs and scratch pictures: `raptor-port/.tmp/n175/p5/`. Desktop Chromium 1536×864 (d), phone WebKit 402×874 touch (p). "Pick" = top-bar picker on d, ☰ → squadron list on p. Every fact below is from a FACT line; every deciding picture was opened.

| Case · size | What he did | What the screen said and did today | His typing / the record | Script · picture |
|---|---|---|---|---|
| N1 My leave · d, p | Saber: Leave War → My leave; Inputs tab; pick 149; Leave War; pick 142; Leave War | On Inputs at the pick: nothing of the window in sight, nothing said, bar 149. The window is kept on the Leave War page, held: back on Leave War (149) it is drawn greyed with the band "This is 142's. You picked 149 — close this to go on." and Close. Back on 142: the same window open and live, no band | Nothing typed in it | p5-n1 · `p5-n1-myleave-{d,p}-1-inputs-at-pick`, `-2-back-on-149` |
| N1 Tracker marking window · d | Tracker → an event pressed; Inputs; pick 149; Tracker; pick 142; Tracker | Still kept (out of sight) after the Inputs tab; **closed at the pick, nothing said**; not there on 149's Tracker nor back on 142 | Nothing changed in it | p5-n1 · `p5-n1-trkmark-d-*` |
| N1 Tracker marking window · p | Same | **Closed already when the Inputs tab was pressed**; nothing at the pick, on 149 or back on 142 | — | p5-n1 · `p5-n1-trkmark-p-*` |
| N1 Edit chart layout · d, p | ☰ syllabus → Edit chart layout; Inputs; pick 149; Tracker; pick 142; Tracker | Toolbar kept (out of sight) after Inputs; **closed at the pick, nothing said**; not open on 149's Tracker nor back on 142 | Nothing moved | p5-n1 · `p5-n1-trklayout-{d,p}-*` |
| N2 his own input on 149's Inputs · d, p | Hunter (Plan of 149; his 8 Dec Duty filed on 142 by Saber), pick 149, Inputs | Calendar (December, its own ›): "Hunter · Duty" drawn on 8 Dec. List (All dates): his 142 8 Dec Duty listed, and also his three 142 OIL inputs (9 Jan, 2 Mar, 30 Mar), among Gannet's and Heron's | — | p5-n2 · `p5-n2-{d,p}-1-calendar`, `-2-list` |
| same, tapped · d, p | The 8 Dec row opened | Window "Hunter · 8 Dec" opens **live**, bar stays **149**, no band, nothing said. Save, Delete, Remarks, Person, Type all live | — | p5-n2 · `p5-n2-{d,p}-3-opened` |
| same, Save · d, p | Remarks → "n175 N2 saved from 149", Save | Bar stays 149, window closes, no toast | His 142 input record changed (it carries no squadron stamp — the home squadron's), a change-log entry and a notice to Saber written | p5-n2 |
| same, Delete · d, p | (fresh browser) Delete | **No question**; toast "Input deleted"; bar 149 | The input removed; change-log "Hunter · Duty deleted · 8 Dec"; a notice to Saber stamped 142 (read on p) | p5-n2 |
| N3 "Check my quals" · d | Ranger (member of 142, View of 149; archived and restored by Saber so the "Welcome back" card shows), pick 149 | On 149 the card still reads "Welcome back, Ranger — check your quals and CAT. Check my quals / Later". Pressed: **bar back to 142**, Quals page, his row outlined (seen in the picture; the FACT line reads the Quals page), the card gone, nothing said | — | p5-n3 · `p5-n3-welcome-d-1-before-press`, `-2-after-press` |
| N3 same with a change not saved · d | Own 8 Dec input, Remarks changed, Save with storage refusing → band "Not saved — keep this page open" + Retry; pick 149 (allowed, band carried to 149); Check my quals | **Bar back to 142**, Quals, his row outlined; the "Not saved" band and Retry still drawn; the card gone; no toast, nothing asked | The unsaved change still waiting under the band | p5-n3 · `p5-n3-welcome-notsaved-d-1-before-press`, `-2-after-press` |
| N3 Undo · d | Own input's Remarks saved on 142 (Undo "Undo — Ranger's Duty"), pick 149 | On 149 View-only Sched **no Undo is drawn** — nothing to press. Same with the failed save before the pick | — | p5-n3 · `p5-n3-undo-d-1-before-press`, `p5-n3-undo-notsaved-d-1-before-press` |
| N3 all four · p | The same, pick by ☰ → its list | Same as d: "Check my quals" → **bar 142**, Quals, card gone, nothing said; with the failed save the "Not saved" band and Retry stay. Undo not drawn on 149 | As d | p5-n3 · `p5-n3-*-p-*` |
| N4 holiday line on 149 · d, p | Hunter (142 admin, **View** of 149; 8 Dec made "N175 Day" on 142, its OIL list left with Later), pick 149 (rows "142 Your squadron", "149 View only"), bell, the line "N175 Day · Tue 8 Dec · 1 input needs an OIL answer · Saber" | Window "OIL — Tue 8 Dec · Public holiday · N175 Day · 1 TO ANSWER" opens **over 149's View-only Sched**, bar stays **149**, nothing said. Yes to all, No to all, Yes · FO, No, Later live; Save greyed until an answer | — | p5-n4 · `p5-n4-{d,p}-1-bell-list`, `-2-after-line` |
| same, answered · d, p | Yes · FO, Save | Toast "OIL answered for 1 input"; window closes; bar still 149 | **142's input** written (no squadron stamp; OIL 8 Dec = 1), change-log "Hunter · Duty 8 Dec · OIL: not asked → earns OIL" | p5-n4 |
| N5 ball moved · d | Saber on 142: Edit chart layout, ST-01 dragged 95 px right / 60 px down, editor closed | The move is **saved at once** ("● saved"); no "Save changes" drawn. Badge → member view: nothing asked, ball where moved; badge back: nothing asked, ball where moved | Saved; nothing unsaved to lose | p5-n5 · `p5-n5-move-d-1-member-view`, `-2-back` |
| N5 unsaved chart edit · d, p | New test event N175EV (+ Test, name, OK), editor closed → "✓ Save changes ●" | Member view: **nothing asked**, N175EV still on the chart, "✓ Save changes ●" drawn and live. Pressed there: no question, status "● saved", **142's chart saved** (still in the member view). Back to admin: nothing asked, N175EV there, Save still offered | Kept each way | p5-n5 · `p5-n5-event-{d,p}-1-member-view`, `-2-back` |
| N6 Hunter · d, p | Hunter's Input window (Grit's), "N175 N6 words" typed; midnight; his move 142→149 lands | Bar 149, "Hunter · Member"; window greyed with "This change could not be saved." and Close; words kept, read-only. **No picker to press**: d — the top-bar picker is not drawn; p — ☰ opens with no squadron line | Kept, read-only | p5-n6 · `p5-n6-hunter-{d,p}-1-held`, `-2-after-pick` |
| N6 Saber (master admin, same move) · d | Same, then pick 142 (rows "142 Full access", "149 Your squadron") | Pick goes through, nothing asked: bar 142, **the window comes back live**, no band, words in the box and editable. Pick 149 again: window greyed, band now "This is 142's. You picked 149 — close this to go on." | Kept; editable again on 142 | p5-n6 · `p5-n6-saber-d-1-held`, `-2-after-pick` |
| N6 Saber · p | Same | ☰ is **covered by the window's title bar** — the pick cannot be reached | Kept | p5-n6 · `p5-n6-saber-p-1-held`, `-2-after-pick` |

## What surprised me
1. N1: My leave survives a pick out of sight and comes back live on 142; the Tracker's marking window and Edit chart layout are closed silently at the pick (on a phone the marking window closes as soon as he leaves the Tracker).
2. N2: on 149's Inputs he sees all four of his own 142 inputs, not only the one filed; Delete removes one with no question, under a bar reading 149.
3. N3: "Check my quals" takes a View-only man from 149 back to 142 without a word — even with "Not saved" up; the card stays drawn on 149.
4. N4: with only View of 149, the holiday line still opens 142's live OIL list over 149's page and writes 142's input under a bar reading 149.
5. N5: a moved ball is never an unsaved edit (saved at once); only a new event makes "Save changes", and it survives both switches and saves 142's chart from the member view.
6. N6: Hunter, after his move, has no picker at all, so the case cannot be pressed for him; for a man who keeps a picker the held window comes back live on 142.
7. Set-up (N3): Ranger's View of 149, given before an archive and restore, was gone after the restore (no picker drawn), so it was given again after.

## Stand-ins
- Set-ups by presses, their saved data copied into fresh browsers: `p5-setup.mjs` (Hunter Plan or View of 149, his 8 Dec Duty, the holiday "N175 Day" left with Later); N3's own (Ranger's duty, archive, restore, View of 149).
- N3 failed save: storage refuses every write (localStorage.setItem throws) from just before Save, left on.
- N5 phone: no finger drag under Playwright's WebKit, so the phone's edit is a new event made by presses (named in its FACT line); the ball move is pressed on the desktop only.
- N6: the move written as a home row at the sign-in card; the page clock 15 Jul 23:58:30 run to 16 Jul 00:00:30 (p4-card / mid-e1's).
- Phone typing set through the box's own input event (n166's way).

## Not pressed, and why
- N3 Undo landing on Inputs from 149: Undo is not drawn on 149's View-only Sched for Ranger, so there was nothing to press.
- N6 for Hunter himself: after the move he has no picker (no rights elsewhere); Saber stood in as a man who keeps one.
- N5 ball moved on a phone: no finger drag (above).

## Scripts, re-run order (repo root; each `d` then `p`)
`p5-n1.mjs` · `p5-n4.mjs` (runs `p5-setup.mjs view`) · `p5-n2.mjs` (runs `p5-setup.mjs plan`) · `p5-n3.mjs` · `p5-n5.mjs` (d runs move and event; p event) · `p5-n6.mjs`.
