# `[LEAVE-LATE-PUBLISHED]` — the test scenarios (Fable, 25 Sep 26, overnight, D181)

Brief: `docs/superpowers/briefs/2026-09-25-late-published-scenario-brief.md`. Read-only; nothing in the repo was
changed. Read first-hand: D177–D179, D44/D45, D98, D103, D109/D113/D114, D174–D176 (`.claude/rules/decisions/scheduler.md`),
the OIL rulings (`oil.md`), the register (AM1, AM11, AM13, AM20, AM23, AM24, AM53), the sweep
(`…/2026-09-25-published-face-live-inputs.md`), Astra's D176 read, `bug-check-order.md` §4/§6/§7, and the code named in
the brief (`publish.ts`, `weekctx.ts`, `validate.ts` the official pass, `world.ts`, `events.ts`, `inputs.ts`, `avail.ts`,
`slots.ts`, `drafts.ts`, `html.ts`, `board.ts`, `board-html.ts`, `pendlist.ts`, `inputedit.tsx`, `leavewar/sync.ts`,
`RemarksSheet.tsx`, `export.ts`, `printpdf.ts`, `peek.ts`, `oilev.ts`, `official-flags.test.ts`, the Quals and Logic pages).

**Tier: FULL.** Published records (what the squadron reads as issued), member-vs-admin doors, persistence (the snapshot),
and — through the ALL AVAIL crowd and OD claims — the OIL axis. Both reviewers read the code (order §4 rank 2).

## 1. The promise, and the shape of today's gap (one paragraph each)

**Promise (D178 + D179):** after a day is published, nothing a member files, edits, deletes or moves changes what the
published face shows or flags; every such change reads as ONE pending change for the admin, in the app's words, and
takes the four sign-offs down; the admin publishes an AL or Unpublishes-and-republishes; back to what was published
reads 0 (D98). "Everything" freezes — medical and quals included (provisional).

**Gap (checked in code, not from the sweep alone):** the issued snapshot freezes the day's content, its marks, the OIL
evidence (crowd included) and `fil` — a map of *input id → filing state* for inputs covering the date at publish. It
freezes **no input values**. So: (a) every renderer of the published face reads `INPUTS` live — the Unavailable block
(`html.ts` 1828), the ⓘ panel's Leave/Free counts (`dayInfoHTML` 2072), the board preview's three input panels
(`board.ts` 350, with live warning rings from `sevOf`), the SANS cards; (b) the comparison treats "absent at publish" and
"present, unfiled" as the same (`filingSame` 376), and never looks at values, so a leave filed, edited or deleted after
publish is 0 pending and the four hold (`filingKey` skips empty states; `pd` follows `dayDelta`); (c) the official
warning pass hides a post-publish input (`fileAcc` → 'r') but reads a pre-publish input's *live* values, bypasses the
filing for medical (`inpShow` 48), and reads SANS offers live (`sansGate`). One consequence worth knowing before the walk:
on a published day that carries an ALL AVAIL puck, a late leave by a man in its crowd **already** reads "1 pending" —
through the OIL axis ("who it stands for") — so a walker who checks only the number on such a day gets a false pass.

## 2. Roll-call — every place the app draws an input on a published day, and which world it must show

| # | Surface (desktop + phone unless said) | Today | Must show after the build |
|---|---|---|---|
| R1 | View-only Sched, issued face — the Unavailable block (rows, type, person, times/all day, remarks, LATE badge) | live `INPUTS` | the inputs **as issued** (the frozen projection); no row for a post-publish input |
| R2 | View-only Sched, issued face — warning list, puck rings/chips, cross-day trace | official pass: post-publish inputs hidden, pre-publish **values** live, medical + SANS live | frozen: what the day flagged when it went out |
| R3 | View-only Sched, issued face — the ⓘ panel ("Leave / downchit", "Free all day", issues list) | counts live, issues official | frozen with R1/R2 |
| R4 | View-only Sched, "Working draft" view (VWORK) | live | live — a reader's own choice (D179) |
| R5 | Edit week, 👁 ORIG/ALn preview — Unavailable block | live | that version's inputs |
| R6 | Board, 👁 preview — Personal Inputs / Unavailable / SANS panels, and `sbInpRow`'s rings | live rows, **live working-copy rings** on a frozen face | that version's inputs; no rings ("a past version is read, not checked") |
| R7 | ⓘ opened from the board's preview | working copy (sweep noted) | that version's counts — or, if left, filed with its reason |
| R8 | ALL AVAIL window opened from the issued face | crowd frozen (`oilev.sent`), flags official | unchanged crowd; flags follow R2 |
| R9 | Edit week + board, working copy — day head "N pending ▾", sign-off line "N changes to publish", Amendments panel, plan-switch message, "Discard N edits", Publish AL door, "Not yet signed/published" | all read `dayPendingItems`/`dayDelta` — one body | unchanged readers; the new entries must enter `dayDeltaIn` so all of them move together |
| R10 | The pending list's WORDS for an input line | request vocabulary only (`FIL`: "not on the programme"…) | leave/medical/SANS/OD words: "Hunter · OL · filed → under Unavailable", "all day → AM", "→ deleted", "Hunter → Viper" |
| R11 | Working copy's warning list — "goes away / new once signed" | works when the official pass diverges | must keep working against whatever R2 freezes |
| R12 | Print (PDF) and CSV | `publishedDays()` snapshots, flying lines only | nothing to do — no input reader |
| R13 | Desktop next-week peek on the view page | next week's stash (working copies) | out of scope, already noted by the sweep |
| R14 | Inputs page, Medical tracker view, Leave War grid | live | live — paperwork surfaces, not the published schedule (B6 stays) |

## 3. Writers — everything that can change an input after the day is published

| Writer (door) | Path | Today's effect on the four readers (count · sign-offs · words · face) | Expected |
|---|---|---|---|
| W1 Inputs page: file a leave/OD/course (member or admin) | `commitNewInput` | 0 · hold · — · **face shows the row at once** | 1 · fall · "filed" · face frozen |
| W2 Inputs page: edit times / all-day↔timed / type / dates / person / remarks | `commitInputEdit` | 0 · hold · — · face + official warnings change | 1 per input per day · fall · the field's words · frozen |
| W3 Inputs page: delete (also the calendar re-date drag) | `removeInput`, `caldrag` | 0 · hold · — · row vanishes from face | 1 (existed at publish) / 0 (filed since — D174 mirror) |
| W4 Week/board in-place time and remarks cells | `setInpField` → `commitInputEdit` | as W2 | as W2 |
| W5 Drag/tap a puck onto an Unavailable row | `reassignInput` → `commitInputEdit` | 0 · hold · — · face shows the new man | 1 · fall · "Hunter → Viper" · frozen |
| W6 Board "+ Add" (Unavailable / SANS / Ground "+ Inputs") | `commitNewInput` | as W1; Ground add lands a row (already pending, content) | as W1; the row+filing pair stays one (D114) |
| W7 Accept / → Unavail / ✕ on a request | `acceptInput` / `unacceptInput` | already on the filing axis (D114/D174/D176) | unchanged — **explicit negative**, but the 'u' row on the face is live (R1) |
| W8 Leave War: approve a bid | `doorApprove` → new input, or EXTENDS an existing one (same id, longer span) | as W1 | 1 on each newly covered published day |
| W9 Leave War: un-approve / delete approved days | `cutDates` → shrink, split (new id for the later piece) or delete | as W3 | 1 on each day that lost the leave; 0 where the status is unchanged by content |
| W10 Leave War: move approved leave | cut + **re-file with a new id** | as W3+W1 | 1 on the day left, 1 on the day landed; 0 anywhere the leave still reads the same |
| W11 Leave War: the remarks note (RemarksSheet) | `setLeaveRemarks` → `commitInputEdit` | 0 · hold · — · face remarks change | see Q5 |
| W12 Medical: a downchit filed (MO / member) | `commitNewInput` + `applyMedPlan` (trims other downchits, mints TAILS with new ids) | 0 · hold · — · **flags and Unavailable row live** (B1) | 1 · fall · "filed" · frozen (his accepted consequence: reads fit until re-issued) |
| W13 Medical: an upchit filed | `upchitTrimPlan` → the downchit ends the day before | 0 · hold · — · man reads fit at once on the issued face | 1 on the day that lost the downchit; the upchit itself is not a line (it draws nothing — Q6) |
| W14 SANS availability filed / edited / deleted | `commitNewInput`/`Edit`/`removeInput`; read by `sansGate` live | amber ring / "available hh:mm only" move on the issued face (A3) | 1 · fall · frozen ring |
| W15 Quals page (CAT, seat, ground crew, SANS, archive) | `PEOPLE` mutated + `persistPeople` | official face re-flags at once (§4 tests pin it) | D179: frozen and pending — **Q1** |
| W16 Logic page rule setting | `VCONF` + `ruleApply` | official face re-flags at once (§4) | D179: frozen, waits for re-issue, pending — **Q1** |
| W17 An input on an UNPUBLISHED neighbour day whose window reaches the published day (midnight tails; a Tuesday all-day leave shifts onto Monday's night sortie) | `buildDay` tails read `inpShow(inp, nextDt)` → an unsigned date reads live | Monday's issued warnings move, 0 pending (B5) | **Q2** |
| W18 Week navigation / reload / undo / redo | `applyWeekModel` clears landed states and re-lands; `INPUTS`, `als`, `orig` persist | — | no phantom pending from navigation; the frozen face survives a reload |

## 4. Ranked scenarios — least-shared surface first

Each: setup / action / expected / **the observation that disproves it** / surface. "Member" = `us`; "Admin" = `ad`.
Every scenario is run on a fresh demo world (D56 — no old snapshots), and every pair of actions in BOTH orders (§7.4).

**S1 — The AL's own view keeps the inputs it went out with (R5, R6, R1).**
Setup: Mon published (ORIG). Member Hunter files OL for Mon. Admin sees "1 pending", signs, publishes AL1.
Action: Hunter edits the OL to AM only. Admin opens 👁 AL1 on the edit week and on the board; View-only Sched issued face.
Expected: AL1's Unavailable block reads "all day" everywhere; the working copy reads AM; Mon reads "1 pending · Hunter · OL · all day → AM"; the four fall; the Amendments panel's AL1 record still says 1 input filing.
Disprove: any preview of AL1 reads AM, or the board preview's row wears a working-copy ring, or Mon reads 0.
Surface: edit week preview, board preview, view page — desktop and phone.

**S2 — A split or re-filed input that leaves a day's face unchanged reads 0 (D98) — by content, not by id (Q4).**
Setup: Mon–Fri published. Viper has ATT C Mon–Fri filed before publish.
Action A: the MO files OML for Viper Tue–Wed. The cascade trims ATT C to Mon and mints a Thu–Fri tail (a new id).
Expected: Tue and Wed read "1 pending · Viper · ATT C → OML"; Mon, Thu, Fri read 0 and keep their four.
Action B: Hunter deletes his Mon OL (filed and issued at AL1) and files the identical OL again.
Expected: Mon reads 0 (delete + re-file of the same thing is no difference).
Disprove: Thu/Fri read 1 or 2 with an unchanged face (the "old id gone + new id arrived" count); Mon reads 2 after Action B.
Surface: edit week, board; the pending list's words.

**S3 — The Leave War's four doors (W8–W11).**
Setup: Sat (weekend) and Sun published; the Leave War at published stage.
Action A: admin approves Hunter's Sat bid. Expected: Sat "1 pending · Hunter · OL · filed" (the line may say it came from the Leave War); four fall; Sat's issued face shows Hunter still available; the war grid shows the leave at once (B6 — the war is live by design).
Action B: admin moves the approved leave to Sun (the drag). Expected: Sat back to 0 and its four return; Sun 1.
Action C: admin un-approves it back to a request. Expected: Sun 0.
Action D: Hunter edits the note on the leave through the war's RemarksSheet. Expected: per Q5 (recommended: 1 pending on the day, "remarks changed").
Disprove: Sat stays 1 after the move (a leftover keyed by the old id), or the war's grid freezes anything.
Surface: Leave War (desktop and phone), then edit week/board of the same days.

**S4 — The upchit makes a published man fit; the day says so once, not twice (W13, Q6).**
Setup: Mon–Wed published; Viper ATT C Mon–Fri filed before publish; issued faces show him unfit.
Action: the MO files an upchit dated Wed (the ATT C now ends Tue).
Expected: Wed "1 pending · Viper · ATT C · removed from this day"; Wed's issued face still shows him unfit and the DNIF ring stays until re-issued (D179's consequence — put the picture on his look card); Mon and Tue read 0; the upchit's own record is not a second line.
Disprove: Wed reads 2 (upchit + trim); the issued face reads him fit at once; Mon/Tue read pending.

**S5 — A downchit after publish freezes too (B1 → D179; reverses the CRPF-001 pin).**
Setup: Mon published, Hunter flying wave 1.
Action: Hunter files ATT C for Mon.
Expected: issued face — no Unavailable row, no red DNIF ring, no "Downchit + flying" in the warning list or ⓘ; working copy — row, red ring, the warning marked "new once signed"; "1 pending · Hunter · ATT C · filed"; four fall. Then Hunter's own Undo → 0 and the four return (AM11).
Disprove: the issued face shows the row or the ring (today's behaviour); the "new once signed" mark is missing on the working copy.
Note for the builder: `official-flags.test.ts` CRPF-001 and the medical bypass in `inpShow` pin the OLD rule; both must flip, and the 15 Sep crew-rest plan §4 is marked set aside.

**S6 — SANS availability (A3, W14).**
Setup: Mon published; Reaper (SANS) on a 09:00 sim slot with an all-day offer filed before publish (clean).
Action A: Reaper edits the offer to PM only. Expected: issued face — no amber ring, no "A" chip change; working — amber "available 12:01–23:59 only"; "1 pending · Reaper · SANS availability · all day → PM"; four fall.
Action B: Reaper deletes the record. Expected: still 1 ("→ deleted"); the issued ring stays clean.
Disprove: the issued face's ring or chip moves.
Surface: edit week SANS cards, board SANS panel, View-only Sched.

**S7 — The reassign drag (W5) on the edit week and the board.**
Setup: Mon published; Hunter's OL existed at publish.
Action: admin drags Viper's puck onto Hunter's Unavailable row (and, second order, tap-arm-then-plant).
Expected: "1 pending · Hunter → Viper · OL"; issued face keeps Hunter; working shows Viper; four fall; on a weekend the OIL question still follows. Admin's Undo → 0, four return.
Disprove: 0 pending, or the issued face shows Viper.

**S8 — Deleting, re-dating and shortening after publish (A1, Astra finding 1).**
Setup: Mon–Tue published; Hunter's two-day OL Mon–Tue existed at publish.
Actions, each from the clean state and then undone: delete → Mon 1 and Tue 1 ("→ deleted"), faces keep the rows; re-date to Wed–Thu (unpublished) → Mon 1, Tue 1, Wed/Thu 0 (draft days); re-date back → 0/0; shorten to Mon only → Tue 1, Mon 0.
Disprove: any of those reads 0 while the row is gone from the working copy but still on the issued face.

**S9 — The late leave, its words, and every way back (the D177 core, D98).**
Setup: Mon published and signed by four. Member Hunter files OL for Mon (after the deadline, so LATE).
Expected on filing: "1 pending" on the edit week and the board; the four fall; "Not yet signed"; the pending list reads ONE line "Hunter · OL · filed → under Unavailable", tap goes nowhere sensible (a filing has no cell — the list says so); View-only Sched issued face unchanged (no row, ⓘ "Leave / downchit" unchanged); "Working draft" view shows the row with LATE and the "1 pending" span.
Ways back, each from that state: (a) Hunter's own Undo → 0, four return; (b) Hunter deletes it on the Inputs page → 0; (c) admin signs and publishes AL1 → 0, ⓘ "AL1 · 1 item", the Amendments panel line reads "1 input filing", View-only Sched now shows the row with LATE; (d) admin Unpublishes the Original → the day is a draft (no pending), "Publish day" → a new Original showing the row, no AL number; (e) after (c), Unpublish AL1 → ORIG current, "1 pending" again, "Publish AL1" reissues the same label.
Disprove: 0 pending on filing; four hold; the list words in request vocabulary ("not on the programme"); the issued face shows the row before (c)/(d).
Surface: all edit surfaces and the view page, desktop and phone (the list scrolls on a phone).

**S10 — "Load onto working copy" against a member's late input (Q3).**
Setup: Mon published; Hunter files OL after; admin also moves a puck on Mon.
Action: admin previews ORIG → "Discard N edits & load".
Expected: the button says "Discard 1 edit" (the puck), not 2; the load discards the move, leaves the OL (a member's record is not the scheduler's to delete), the day still reads "1 pending" and the load's sentence says why ("Hunter's OL stays — filed since ORIG"); "already at ORIG" is never claimed while the face differs.
Disprove: the leave is deleted by the load; the count says 2; "already at ORIG" with "1 pending" beside it.

**S11 — One act that moves two axes: a leave that shrinks an ALL AVAIL crowd (Q7) — and the false pass.**
Setup: Sat published with ALL AVAIL on a duty desk; Hunter is in the frozen crowd.
Action: Hunter files OL for Sat.
Expected (recommended): count 1; one line "Hunter · OL · filed" with a sub-line "OPS DESK · who it stands for: Hunter no longer free"; four fall; the issued face's crowd, count chip and OIL figures unchanged (D44); after AL1 the crowd updates and Hunter's Sat credit is swept (D46).
Disprove: count 2 beside one act; the count and the list disagree.
**Walker's note:** BEFORE the fix this day already reads "1 pending" (the OIL axis) — read the WORDS, not the number.
Same shape: an OD claim answered "yes" filed on a published weekend (the OIL "what this day earns" axis + the filing).

**S12 — The neighbour day (B5, Q2) — whatever his answer, walk it and photograph it.**
Setup: Mon published with Hunter on a night sortie landing 23:45 (debrief runs past midnight); Tue unpublished.
Action: Hunter files an all-day OL for Tue.
Today: Mon's ISSUED face gains "On leave + flying", 0 pending anywhere.
Expected under the recommended answer: Mon's issued warnings frozen; Mon reads "1 pending · Hunter · OL on Tuesday — reaches Monday's night sortie"; Tue (draft) shows the leave live. If he defers: today's behaviour, on his look card with the picture.
Disprove: whichever reading he picks, the other.

**S13 — The board preview's panels and the ⓘ from it (R6, R7).**
Setup: Mon published; Hunter files OL after; Reaper edits a SANS offer.
Action: board → plans menu → 👁 ORIG; open ⓘ from that preview.
Expected: the Unavailable and SANS panels show ORIG's inputs (no Hunter; Reaper's old offer), no warning rings on any input row; the ⓘ counts read ORIG's (or, if R7 is left as is, the item is filed with the reason on the look card).
Disprove: Hunter's row or a red ring from the working copy on the preview.

**S14 — The ⓘ panel on the view page (R3) and the Working draft view (R4).**
Setup as S13. Expected: issued face ⓘ "Leave / downchit" and "Free all day" as issued, no "unpublished edit" line; switch to Working draft → live counts and "1 unpublished edit".
Disprove: the issued face's ⓘ counts move.

**S15 — Roles and the phone.**
Member: files on the Inputs page (own row only, LATE shows there); View-only Sched issued face without his leave; "Working draft" shows it with the banner, the "1 pending" span (never a button) and "Not yet signed"; no Publish, no Unpublish, no top-bar changes door (D171). Admin: the button, the list, the doors. Phone: the day steps to Mon; the list opens under the chip and scrolls; the Working draft banner fits.
Disprove: a member sees a pending BUTTON or any publish door; the issued face shows his leave.

**S16 — Retyping an accepted request (A7): one act, one line.**
Setup: Mon published with Hunter's accepted Meeting row (from a request) beside his SC MAIN shift (amber clash on the issued face).
Action: Hunter retypes it to CSE (shift-hard). The relink un-accepts and re-accepts the row.
Expected: the issued face keeps the amber; the working copy goes red; "1 pending · Hunter · Meeting → CSE" (the row's change and the input's change are one act, paired as D114 pairs row and filing).
Disprove: the issued clash flips red; 2 pending for one save.

**S17 — A leave over two published days: each day is its own amendment (AM1).**
Hunter files OL Mon–Tue after both are published → Mon 1, Tue 1. Publish AL1 on Mon → Mon 0, Tue still 1. Hunter edits the remarks → Mon 1 again (Q5), Tue 1. Disprove: a week-wide count, or Tue clearing with Mon's AL.

**S18 — Navigation, reload, undo/redo (W18).**
After S9's filing: go to next week and back → still "1 pending", same words; reload → the same, and the issued face still without the row (the projection rides the snapshot into storage); Hunter's Undo/Redo → 0/1 with the four returning/falling. On a published day with NO input change: navigate away and back, reload, wait past midnight (the `mod: 'now'` stamp) → still 0.
Disprove: a phantom pending after navigation or on a new day; the issued face changes after a reload.

**S19 — Parked plans (AM12).**
Mon published with Plan B parked. After S9's filing: switch to Plan B → still "1 pending", Plan B's four fall too (`pd` binds the comparison on every plan); switch back → the same. Disprove: a plan whose sign-offs survive the filing.

**S20 — A request filed for a published day of another loaded week (never auto-landed).**
Setup: from week N, Hunter files a Meeting for Mon of week N+1, already published. Load week N+1.
Expected: Mon reads "1 pending · Hunter · Meeting · filed — not on the programme" (the working copy flags INPUT_FLY, the issued face does not); Accept → still 1 (row + filing, one act — D114); ✕ → 0 (D174).
Disprove: 0 pending while the working copy flags it and the scheduler has a door to act on.

**S21 — Quals and rules (Q1) — whatever shape is chosen, the observation is the same.**
Setup: Mon published with Hunter in a front seat, clean.
Action A: Quals page — Hunter set to WSO. Action B: Logic page — crew rest 12h → 14h (with a day whose margin sits between).
Expected (D179): the issued face keeps no Q ring / no new crew-rest ring; the working copy flags; each published day whose flags would move reads pending in the app's words ("What this day flags changed · Hunter — Qualification, illegal seat"); the four fall; a re-issue carries the new flags. Days whose flags would not move read 0.
Disprove: the issued face re-flags at once (today's §4 pins), or nothing reads pending so the admin never re-issues.

**S22 — Both orders, every pair.** Admin moves a puck THEN Hunter files; Hunter files THEN admin moves → 2 both ways, two lines in both orders, each undo taking exactly its own change off (D148: the admin's Undo never removes the member's leave; on one device the member's history is gone at logout, so the admin's routes are AL, Unpublish+republish, or deleting the input as an admin on the Inputs page — walk that door too).

## 5. The open design questions — two readings, two apps

**Q1. How do quals and rules "freeze and show pending" when they are not the day's data?** Today the second
validation pass computes a published day's flags from frozen content + frozen filing + LIVE people, rules, medical and
neighbour inputs. Reading A: extend that pass — freeze roster facts and `VCONF` into each snapshot, swap them in per day
during the pass, and add a fourth comparison axis. Reading B: **store the issued face's flags at publish** (the day's
official warnings, rings, chips and trace — the way `oilev` is already frozen in `daySnap`), have the published face
read the stored list, and compare "what this day flags" the way "what this day earns" is compared (one line, D109).
**Recommend B.** Reasons: D179 makes the frozen face's flags, by definition, what they were at publish — recomputing them
under a per-day swapped rulebook is rule versioning in all but name (AM7 forbids it; D48 chose a marker over a versioned
rulebook for the same reason); B removes the medical, quals, rules and neighbour-input exceptions as a class instead of one
by one; the precedent (`oilev`) exists and rides persistence and Unpublish already. What B keeps: the official pass still
runs for DRAFT days on the view page (a draft day's flags against a published neighbour's issued content); the working
copy's "goes away / new once signed" diff reads stored-vs-working. Cost: snapshot size; and a rule change reads pending on
every published day whose flags would move (the honest count). This is an architecture choice: a Claudex plan with both
reviewers before code (D144, D67).

**Q2. A neighbour day's input that reaches a published day (B5).** Reading A: live (today) — a Tuesday leave can add or
clear a warning on published Monday's face with nothing pending anywhere. Reading B: frozen, and pending on Monday.
**Recommend B**, by D45's own test ("a reader could see a different answer tomorrow with nobody having acknowledged it").
Under Q1-B it is free on the face side (Monday's flags are stored); the pending side needs Monday's snapshot to record
which neighbour-date inputs it read (its tails), and the comparison to name them ("Hunter · OL on Tuesday — reaches
Monday's night sortie"). This is the one piece I would let him DEFER if the build is running long — but only with his
word, and S12's picture goes on the look card either way.

**Q3. What does "Load onto working copy" do with a member's late input?** Reading A: the load makes the day read exactly
as the version, so it deletes the leave. Reading B: **the load leaves it and says so** (LOADLEFT's existing shape), does
not count it in "Discard N", and the day honestly still reads pending. **Recommend B**: a member's record is his, not the
scheduler's; D98's "must get it there" was said of a REQUEST the scheduler himself took off. Say the sentence.

**Q4. Compare by id or by content?** `fil` is keyed by input id. Splits (the medical cascade's tail), Leave War moves
(cut + re-file with a new id) and delete-then-re-file all change ids without changing what a day shows. Reading A: id —
those read 1 or 2 pending on an unchanged face, and the four fall for nothing (D98 broken, S2). Reading B: **compare the
day's projection by content** — per input covering the date and drawn on the face: person, type, window (all day / half /
times), remarks (Q5), filing state — as a multiset. **Recommend B** for the face projection; D174/D176's id-based 'r' rules
stay for the request filing axis they were written about. Exclude from the projection: `mod` (the LATE stamp — `'now'`
re-reads as today's date and would make every day pending tomorrow), `lw`, document ids, the `yr` label (compare by
date ordinal, the `fileAcc` lesson).

**Q5. Is a remarks-only edit pending?** D178 says "edited"; the Unavailable block prints remarks, so the face changes.
Reading A: pending. Reading B: remarks excluded (the Leave War's note editor is the common case and would otherwise make
the admin re-issue for a note). **Recommend A**, because D179 is "everything" and the alternative leaves a stale note on
the face with nothing to prompt a re-issue; but say the noise cost to him with S3-D's picture, since he ruled the note
editor into the published war himself (27 Aug 26).

**Q6. Which inputs are "in" the comparison, and which are "on the face"?** Recommend: every input covering the day
except an UPCHIT enters the comparison (an upchit draws nothing and flags nothing — its trim of a downchit is the change,
S4); the face projection is the subset the face draws — Unavailable-block inputs (leave, medical, OD, courses, 'u'-filed
requests) and SANS offers (they drive the amber ring). An unlanded request on a published day (S20) counts pending even
though the view page never draws it: the scheduler has a door to act on it, and D178 says every input change.

**Q7. One act, two axes.** A leave that shrinks an ALL AVAIL crowd; an OD claim that changes what the day earns. Reading
A: two lines (two things go out). Reading B: **one line for the act, the consequence as its sub-line(s)** — the multi-row
shape the list already has for several crowds. **Recommend B** (D109, D114's spirit: he counts acts). Whichever he picks,
the count must equal the list (AM23), and S11's false-pass note stands.

**Q8. Does the member get a sign on the issued face that his own leave is not yet issued?** Recommend no (AM24/AM5:
working-copy state never shows on the issued face); D170's "new to you" window is where that belongs. Not now.

## 6. Traps for the builder (named, short)

1. **The view week's Unavailable block on an UNPUBLISHED day is byte-compared to the reference (728/0).** The frozen
   projection must apply only to a published day's issued face and previews — never to the plain view render.
2. **`filingSame`'s D174 sentence** ("absent still matches '' as before, e.g. a leave") is exactly the line D177 flips;
   D174's absent↔'r' and D176's 'r'↔absent must survive it (Astra's fix step 1). One helper for `publish.ts` and
   `weekctx.ts filingDiffers` (Astra finding 2), with pins on `filingDivergesAt` and `windowDiverges`.
3. **The snapshot is taken in one synchronous step with the signature check** (`daySnap` comment): the projection must be
   taken there, and nothing between the check and the freeze may write `INPUTS`.
4. **`issuedDayIn` re-labels the snapshot's `dt` for neighbour-week reads** (New Year): the projection's dates must be
   ordinals, not labels.
5. **`publishReadPass` memo** — the projection comparison runs inside the paint pass; keep it per-day memoised (Fable F9's
   116 ms lesson).
6. **The list's words** for a deleted input must come from the frozen projection (the input is gone) — this also closes
   `[REQ-DOOR-WORDS]` item 3.
7. **Tests that pin the old rule and must flip:** `official-flags.test.ts` §4 (quals, rules) and CRPF-001 (medical); the
   sweep's B1/B2 rows; the crew-rest plan §4 "never versioned" (marked set aside).
8. **Start the walk on a fresh demo world** (D56): no snapshot without a projection is a finding.

## 7. Explicit negatives — checked, needs nothing

- **Print and CSV**: read `publishedDays()` snapshots and carry flying lines only; no input reader.
- **The ALL AVAIL crowd and count chip on the issued face**: frozen in `oilev.sent`; the window replays the chip's world.
- **Accept / → Unavail / ✕ on a request**: already on the filing axis with D114's pairing and D174/D176's rules.
- **A request filed on a published day auto-lands on the working copy only** (`autoAcceptInput(row, true)`); the issued
  face never gets its row.
- **The sign-off binding (`pd`)** carries the whole comparison, so once an entry exists the four fall with no second
  wire; **"Not yet signed / published"**, **Publish AL eligibility**, the **Amendments panel**, the **plan-switch
  message** and **"Discard N edits"** all read `dayPendingItems`/`dayDelta` — one body.
- **The working copy's "goes away / new once signed" diff** already marks a late leave's LEAVE_FLY (the official gate is
  membership-aware, so the pass runs) — must survive, nothing to add.
- **LATE hidden per input (LATEOFF) and the Working draft choice (VWORK)** are session view state, reset at login — left
  alone by D179.
- **The Leave War grid, its OIL advisories (B6) and the Inputs page / Medical tracker** read live by design.
- **The desktop next-week peek** shows next week's working copies — outside this item, already noted by the sweep.
- **The reassign write path** already has its role gate and the OIL follow-up question (`askOilIfPending`).

## 8. Verified versus assumed

Checked first-hand in the code this session: every "today" cell in §2 and §3, the `filingSame`/`filingKey`/`pd`
behaviour, the medical bypass, the live SANS gate, the board preview's live panels and rings, the export/print readers,
the Leave War doors' id behaviour (extend keeps the id; move and split mint new ones), the medical cascade's tail
minting, the Quals/Logic write paths, the `mod: 'now'` stamp, and the §4/CRPF-001 pins. Not run: no test was executed
(the reads were sufficient and the sweep's A0 probe already ran). Assumed, stated as such: the phone layout of the list
under a Working draft banner, and that a fresh demo world publishes its seed days through the app's own publish (if the
seed injects snapshots, the walker must publish a day by hand first).
