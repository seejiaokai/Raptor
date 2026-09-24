# [HUMAN-RETEST] the amendment system — walker w1: the marks, the counts and the publish buttons on a published day (24 Sep 26)

**Brief:** `raptor-port/docs/superpowers/briefs/2026-09-24-amendment-walker-brief.md`. **Rules judged against:** the LIVE lines of
`raptor-port/docs/superpowers/specs/2026-09-24-amendment-behaviour-register.md` (AM ids quoted per check). **Scenarios:** Fable
`raptor-port/docs/handpass/2026-09-24-amendment-fable-scenarios.md` §3 — S1, S2, S3, S5, S6, S9, S15, S22, S31, S32, S33, S34, S36, S40;
Astra `…-astra-scenarios.md` §3 — ranks 11, 12, 13, 16, 18, 20, 34, 35, 39 (added by the host). Roll-call rows R1–R6, R10, R11.

**How it was walked.** The production build at `http://localhost:4173`, driven in a scripted Chromium through the app's own
controls (sign selects, Publish day / Publish ALn / Unpublish, the plans menu, typing, right-click clear, dragging grips, the
Personal Inputs panel, the input dialog, the calendar). `window.SCHED` / `window.DAYS` were read only to record. Every scenario at
**desktop 1440×900 and phone 390×844** unless it is width-specific (S2, S40 desktop only — the Amendments panel is hidden under
820px; S6 phone only). Worlds: the everything week (`docs/handpass/2026-09-24-amendment-week.json`, each run its own browser
context) or a fresh demo world (`open({})`, nothing reloaded) where a scenario needed nothing else pending (S2, S22, S33).
**Console errors: none in any run.**

- **Scripts** (each prints PASS / FAIL / NOTE per check, so re-running it after the fixes IS the re-walk):
  `raptor-port/scripts/handpass/am/w1-*.mjs` — helpers `w1-lib.mjs`; walks `w1-s01-phantom`, `w1-s01b-reload`, `w1-s02-discard`,
  `w1-s03-counts`, `w1-s03b-accept-first`, `w1-s06-phonepanel`, `w1-s09-sign`, `w1-s15-structural`, `w1-s22-perday`, `w1-s31-peel`,
  `w1-s33-reorder`, `w1-s34-typepublish`, `w1-s36-eight`, `w1-s40-panelpub`, `w1-r12-addremove`, `w1-r39-nextmonday`,
  `w1-v01-viewchip`, `w1-10-rollcall`; read-only probes `w1-00-probe`, `w1-01-boardprobe`, `w1-02-dragprobe`, `w1-03-satkeys`,
  `w1-04-emptyseat`. Run from `raptor-port/`: `node scripts/handpass/am/w1-s01-phantom.mjs [desktop|phone]`.
- **Pictures:** `raptor-port/docs/img/handpass/2026-09-24-amendment/w1/` — 166 files, named `<scenario>-<width>-<step>.png`. Every one
  was opened and looked at (two, `dragprobe-*`, are driver diagnostics: a wave lifted mid-drag).

**Which build this walked — read before acting on anything below.** Every run (14:24–15:26) exercised the shared bundle served
at :4173, built at 13:58 from revision `a66367ba` — i.e. **before** the host's fix commit `7c69bd58` (14:29). The shared server was
never rebuilt, as the brief required. Line numbers below are in `a66367ba`. My findings are numbered **W1-1…W1-7** so they do not
collide with the evidence sheet's F1–F5. How they map:

| mine | the evidence sheet | what the host should re-walk on the fixed build |
|---|---|---|
| W1-1 phantom after Unpublish | **F4 — fixed** in `7c69bd58` | `w1-s01-phantom` (incl. the re-issue branch: no false solid mark frozen into the AL) and `w1-s31-peel` (after AL2 comes off, the note must wear its **solid AL1** mark again, not only lose the dotted one) |
| W1-5 Discard marks | **F3 — fixed** | `w1-s02-discard`, and `w1-s33-reorder` for the panel's sentence after a reorder-and-back |
| W1-6 "Not yet signed" on the board | **F1 — fixed** | `w1-10-rollcall` check S5 |
| W1-7 the ⓘ count | **F2 — fixed** | `w1-s03-counts`, `w1-s03b-accept-first`, `w1-s15-structural`, `w1-s33-reorder` (the ⓘ checks) |
| **W1-2** a removal from a desk / programme / sim row leaves no mark | **new** | `w1-10-rollcall` (R3/R5 seat checks), `w1-04-emptyseat` |
| **W1-3** the issued face shows "1 pending" after a filing change | **new** | `w1-v01-viewchip`, `w1-s03b-accept-first` (check f) |
| **W1-4** an input taken off and put back leaves "2 changes · 1 removal" | **new** | `w1-s03-counts` setup B |

To re-walk against a build on another port: set `HP_URL`; the everything-week file is keyed to `http://localhost:4173` and the shared
driver refuses a state saved on another origin (`../lib.mjs` `assertStateOrigin`), so serve the fixed build on :4173 or re-save the
state on the new origin (`am-fixture.mjs`).

---

## 1. The findings (FAIL) — most serious first

### W1-1 — After an Unpublish, a cell that is back at the current version stays DOTTED; the next publish then stamps a false "changed at ALn" mark into the issued record
*(Fable S1, predicted 5-3 — reproduced; S31 shows a second shape; the re-issue half is new)*

**What a person sees.** Tuesday is issued as its Original (take-off 08:40). Change the take-off to 09:10 and the day note, sign,
Publish AL1. Put the take-off back to 08:40. Press Unpublish. The day is back at ORIG and the head correctly says **"1 pending"**
(only the note differs) — but **two** cells are dotted: the note, and the take-off, which is exactly the Original's 08:40. The
board draws the same dotted take-off. The ⓘ panel says "2 unpublished edits". The stray mark **survives a reload** and only
disappears after some unrelated edit anywhere in the week.
**Worse, if he re-publishes while it shows** (sign, Publish AL1 — the quiet correction, AM33): the toast rightly says "1 item", but
the take-off now wears a **solid "AL1"** mark on the edit week **and on the view page's issued AL1 face** — the published record
tells every reader the take-off changed at AL1, when AL1 never changed it.
**Second shape (S31):** AL1 changes the note; AL2 changes the note again and a take-off; the note is put back to AL1's value; Unpublish
AL2 → the day is at AL1, the head says "1 pending" (the take-off), but the note — now equal to the current AL1 — is dotted "goes
out as AL2" instead of wearing its solid AL1 mark.

- **Rules:** AM20 (a pending mark means "differs from what was issued" — change it back and the mark clears); AM23 (the count and
  every other count agree); AM19 (a solid mark = changed at that AL); AM4/AM5 (the issued version is exactly what went out).
- **Reproduce** (everything week, Tuesday, edit week): `ff:1.0.0.to` 08:40→09:10; `dn:1.0` → any text; sign the four; Publish AL1;
  `ff:1.0.0.to` back to 08:40; Unpublish → take-off dotted, head "1 pending". Then sign the four and Publish AL1 → take-off solid AL1,
  also on View-only Sched ("AL1 — as issued").
- **Every time:** yes — S1 3 runs desktop, 2 phone; reload check both widths; S31 both widths.
- **Pictures:** `s1-{desktop,phone}-2-after-unpublish-line` (08:40 dotted), `-2-after-unpublish-head`, `-3-dayinfo` ("2 unpublished
  edits"), `-4-board-line`, `-5-reissued-line` and `-6-view-line` (08:40 wearing "AL1"), `-7-after-unrelated-edit` (cleared),
  `s1b-{desktop,phone}-after-reload-line` (still dotted), `s31-{desktop,phone}-2-after-unpub-1`.
- **Where (looked):** `src/engine/publish.ts` `unpublishDay` 780–794 re-opens the AL's marks without re-checking them against the
  version that becomes current; the take-off's own dotted key (left by `markEdit` 607 when it was edited back) is never re-checked
  either — the reconcile runs only from an ordinary edit. Then `alIssue` 665–673 turns **every** dotted key on the day into a solid
  issued mark, while the item count comes from the true difference (664) — so the stale key is frozen into the AL's snapshot (677).
  **After the evidence sheet's F4 fix** the Unpublish no longer leaves the stale key, but the publish step itself still marks from the
  raw keys and counts from the true difference: any other path that ever leaves a stale dotted key would again freeze a false
  "changed at ALn" into an issued record. Marking only the keys that are in the difference would close it at the source.

### W1-2 — A man taken off a duty desk, a Common Programme row or a sim seat on a published day leaves no mark anywhere
*(roll-call R3/R5/R6/R7 — new)*

**What a person sees.** On published Saturday, right-click Outlaw off the OPS DESK, Torch off MASS BRIEF, Basher off the EP-6 sim.
The head counts each change, but the row itself looks exactly like a desk that was always empty: a plain "+ ADD" (week) or empty
box (board). After Publish AL1 the same rows still show nothing — no dotted mark, no solid "AL1", on the week, the board **or the
view page's issued face**. A reader of AL1 cannot see that Outlaw was taken off the OPS DESK. On the view page, 13 changes produced
10 visible AL1 marks. **Cockpit seats are half-covered:** an emptied flying seat shows the "AL1" badge on the week once published,
but while pending it is a plain grey "+ RCP" on the week at both widths, and on the **board** it never carries any mark, before or
after publishing; an emptied sim seat on the board likewise.

- **Rules:** AM19 (on the edit surfaces a pending change is dotted in its AL's colour; an issued change is solid in its AL's colour);
  AM21 (a removal is a real amendment item).
- **Reproduce** (everything week, Saturday, board): right-click the puck on `d:5.0.2` (OPS DESK), `a:5.1.1` (Torch), `s:5.oft.0.w`
  (Basher), `5.0.1.0.w` (COBRA's RCP) → look at each row on the board and the week; sign, Publish AL1; look again, and on View-only Sched.
- **Every time:** yes — 2 runs × 2 widths; the emptied cockpit seat measured separately (`w1-04-emptyseat`, both widths).
- **Pictures:** `rc-{desktop,phone}-R5-board-duty` (OPS DESK: empty box, no mark), `-R3-week-duty` (plain "+ ADD"),
  `-R5-board-programme` (MASS BRIEF: Saber only), `-R5-board-sim`, `-R5-board-flying` (COBRA "+ RCP" unmarked), `-R5-board-duty-AL1`,
  `-R7-view-sat-duty` (issued AL1: OPS DESK row blank, SDO "08:10 AL1" beside it), `es-{desktop,phone}-1-week-emptied-pending`
  (grey "+ RCP"), `es-{…}-2-week-emptied-AL1` (the "AL1" badge appears).
- **Where (looked):** an empty list seat is not drawn at all — `src/ui/html.ts` `lSeat` 494–495 (week), `src/ui/board-html.ts`
  `sbSeat` 311–312 (board); the board's empty cockpit seat is drawn without its mark — `board-html.ts` `sbSlot` 803; the week's
  pending seat style paints only a puck inside the seat — `scheduler.css` 1672.

### W1-3 — The view page's ISSUED face shows the working copy's "1 pending" after a filing-only change — to members too
*(new; found in S15, reproduced on its own)*

**What a person sees.** The scheduler takes an accepted input off published Tuesday on the board (or adds one through "+ Inputs").
On View-only Sched, Tuesday reads **"Original — as issued"** with **"1 pending"** beside it — for the admin and, after logging in as
the squadron member, for the member. Its ⓘ says "1 unpublished edit". The issued content itself stays frozen (the appointment row is
still there). An ordinary edit (the day note) shows no chip on the issued face (control run). Separately, **after any edit** the
view page's ⓘ panel shows the working copy's "N unpublished edits" on the issued face (R11: Monday "1 unpublished edit").

- **Rules:** AM5 (viewers see the issued version; the working copy is the scheduler's until he publishes); AM24 (working-copy state
  shows on the working copy, **never on the issued face** — the newer rule Z9 chose over "shown to everyone"); AM51e.
- **Reproduce** (everything week): board on Tuesday → open Personal Inputs → "Undo" on Saint's Appointment → View-only Sched.
  Or: board on Tuesday → ground programme "+ Inputs" → Add → View-only Sched.
- **Every time:** yes — both widths, admin and member; also seen in S15 (Thursday) and S3B2.
- **Pictures:** `v01-{desktop,phone}-1-view-tue-admin`, `-2-view-tue-member` ("Original — as issued · 1 pending"), `-3-view-tue-note-edit`
  (control, no chip).
- **Where (looked):** on the issued face `dayStatHTML` counts `dayDelta` with the day's content frozen (`src/ui/html.ts` 1260), but
  the input-filing part of that comparison reads the live inputs, so a filing change reads as a difference of the frozen copy
  against itself. The ⓘ reads the raw marks (`html.ts` 1968).

### W1-4 — Taking an issued input off a published day and putting it back does not net to nothing
*(Fable S3 setup B, walked in the order the week allows — new)*

**What a person sees.** Tuesday (issued, clean). Board → Personal Inputs → "Undo" on Saint's Appointment ("2 pending": 1 removal, 1
input filing). "Accept" it again: the ground programme is back to exactly the issued four rows, same appointment, same times — yet
the day still reads **"2 pending"**, the panel "Tue · 2 changes · 1 removal", "Not yet signed", and the re-created row is dotted. To
clear it he would have to publish an AL for a day identical to what he issued, or load the Original back.

- **Rule:** AM20 (change it back and the mark clears — nothing to publish). Also AM11 (the sign-offs stay broken).
- **Reproduce:** as above. **Every time:** yes — every run of the S3 walk (4 at desktop, 4 at phone).
- **Pictures:** `s3-{desktop,phone}-B-ground-start`, `-B-taken-off-strip`, `-B-put-back-strip` ("2 pending"), `-B-ground-after`
  (identical rows, the APPOINTMENT box dotted).
- **Where:** the re-accept creates a new ground row with a new identity, so the comparison sees the issued row removed and a new one
  added (pending keys `del:1.1.ground` + `gr:1.<new id>.prog`). Not traced further.

### W1-5 — "Discard marks" is live when it can clear nothing, says "Pending marks cleared", and the panel's sentence claims changes that do not exist
*(Fable S2 / S33, Astra rank 3 — predicted 5-1, reproduced; desktop only)*

**What a person sees.** Fresh world: publish Monday, change its note. The panel reads "1 day with changes to publish · Mon · 1 change"
with **"Discard marks" enabled**. Press it: the message **"Pending marks cleared"** — and nothing is cleared (Monday still "1 pending",
still dotted). With a draft day edited too, it clears the draft's mark only and says the same words. After it has nothing left to
clear it is still enabled. **And (S33):** after a duty row is moved and put exactly back on published Monday, nothing waits anywhere,
yet the panel reads **"Changes are on unpublished days — publish the day first"** with "Discard marks" enabled.
(Checked and fine: the empty press leaves no stray step on Undo.)

- **Rules:** AM25 (the panel lists what there is to publish); AM15b's principle (where correct behaviour could read as a bug, the app
  says so — here it says the opposite of what happened); AM23.
- **Reproduce:** fresh world, desktop edit page: sign Monday, Publish day; edit `dn:0.0`; press "Discard marks". For the sentence:
  fresh world, publish Monday, on the board drag duty row 1 below row 2 and back → the panel.
- **Every time:** yes — 2 runs each.
- **Pictures:** `s2-desktop-1-panel-before`, `-2-panel-after`, `-2-mon-note-after` (the note still dotted), `-2-mon-head-after`
  ("1 pending"), `-3-panel-final`, `s33-desktop-3-panel-after-back`.
- **Where (looked):** `src/ui/ALPanel.tsx` 15, 25 and 27 (enabled and worded from every pending mark), `src/engine/publish.ts`
  `discardPending` 720–724 (skips published days, always toasts).

### W1-6 — "Not yet signed" is on the week head but never on the scheduler board
*(Fable S5, Astra rank 2 — predicted 5-5, reproduced)*

**What a person sees.** Monday (AL1 with a change waiting): the week head reads "AL1 · **Not yet signed**"; the board's strip for the
same day, at both widths, reads "AL1 · 1 pending" with no marker. Same on every published day with changes (S1, S9, S15 strips).

- **Rule:** AM24 ("Not yet signed" shows on the working copy of a published day that has unpublished changes — the board is the
  working copy). **Every time:** yes, both widths, every run.
- **Pictures:** `rc-{desktop,phone}-S5-week-head-mon` vs `rc-{desktop,phone}-S5-board-strip-mon`.
- **Where (looked):** `src/ui/board.ts` `boardSignHTML` 408–410 builds the strip without the marker; the week draws it in
  `src/ui/html.ts` 1409.

### W1-7 — The ⓘ day panel's "N unpublished edits" disagrees with the day head in most setups
*(Fable S3, predicted 5-2; Astra rank 4 (Astra's own finding two) — reproduced, and in more shapes than predicted)*

| setup | day head (week + board) | ⓘ panel (week + board) |
|---|---|---|
| S3A — Saturday, one man taken off an event in OIL Earn (nothing else) | 1 pending | nothing |
| S3B — input taken off / put back (W1-4) | 2 / 2 | 1 / 2 |
| S3B2 — input added / taken off | 2 / 1 | 1 / nothing |
| S3C, S33, rank 13 — a reorder and exactly back (by hand and by Undo) | nothing | **2** unpublished edits |
| S1 — after the unpublish (W1-1) | 1 | 2 |
| S15 — edit + line deleted + input off + wave moved; after unpublish; after the wave moved back | 5 / 5 / 4 | 4 / 4 / **5** |
| roll-call — 13 edits on Saturday (the 14th item is "what this day earns changed") | 14 | 13 |

- **Rule:** AM23 ("N pending" counts real differences and agrees with every other count). **Every time:** yes, both widths.
- **Pictures:** `s3-{w}-A-dayinfo`, `s3-{w}-C-dayinfo`, `s33-{w}-2-dayinfo-after-back`, `s1-{w}-3-dayinfo`.
- **Where (looked):** `src/ui/html.ts` 1968 counts raw marks (`dayPendCount`); the head counts the true difference (1260).

---

## 2. Scenario by scenario

AM ids are the register's. "both" = desktop and phone. Picture names omit the folder.

| scenario | world · day | what I drove | expected (register) | observed | result |
|---|---|---|---|---|---|
| **S1** (Fable) | everything · Tue | take-off + note → sign → AL1 → take-off back → Unpublish; board; re-issue; view page; separately an unrelated edit, a reload | AM20/AM23: only the note dotted after the unpublish; the re-issue marks only the note | ORIG, "1 pending" ✓, Unpublish one tap ✓, AL1 offered again ✓, sign-offs cleared ✓ — take-off dotted (week + board) ✗, ⓘ 2 ✗, re-issue freezes a false AL1 mark ✗ (W1-1); survives reload, clears on an unrelated edit | **FAIL** both (W1-1, W1-7) · `s1-*`, `s1b-*` |
| **S2** (Fable) = Astra 3 | fresh · Mon (+ Tue draft) | publish Mon, edit, "Discard marks"; mixed case | AM25/AM15b: no false offer, no false message | enabled, "Pending marks cleared", nothing cleared ✗; draft mark cleared ✓; published kept ✓; no stray undo step ✓ | **FAIL** desktop (W1-5) · `s2-desktop-*` |
| **S3 A** (Fable) = Astra 4 | everything · Sat | board → OIL Earn → Saber off MASS BRIEF → leave | AM23 ⓘ = head; AM47 no Leave War move | head/board "1 pending" ✓, panel "Sat · 1 change · what this day earns changed" ✓, Leave War FO* unchanged ✓ — ⓘ shows nothing ✗ | **FAIL** both (W1-7) · `s3-*-A-*` |
| **S3 B** (Fable, reverse order) | everything · Tue | Personal Inputs "Undo" on Saint's appointment, then "Accept" | AM20 nets to nothing | "2 pending · 1 removal" remain ✗; ⓘ 1 then 2 ✗ | **FAIL** both (W1-4, W1-7) · `s3-*-B-*` |
| **S3 B2** (Fable's order) | everything · Tue | "+ Inputs" → Add → Personal Inputs "Undo" | AM23; AM5/AM24 | the row nets out ✓; "1 pending · 1 input filing" stays (the request is still on file — see §5 Q-c); ⓘ 1 vs 2, then nothing vs 1 ✗; issued face "1 pending" ✗ | **FAIL** both (W1-3, W1-7) · `s3b2-*` |
| **S3 C** (Fable) | everything · Thu | drag Wave 1 below Wave 2, then again (back) | AM21: 1 reorder; AM20: back = nothing; AM23 | "1 pending · 1 reorder" ✓; back → nothing ✓; ⓘ "2 unpublished edits" ✗ | **FAIL** both (W1-7) · `s3-*-C-*` |
| **S5** (Fable) = Astra 2 | everything · Mon | week head vs board strip | AM24 on the board too | week yes, board no ✗ | **FAIL** both (W1-6) · `rc-*-S5-*` |
| **S6** (Fable) | everything + Tue AL1 · phone | scroll the edit page; ⓘ Monday | no register line (Fable Q3) | panel in the page but hidden; no phone surface names who approved an AL except a passing toast; ⓘ lists "AL1 · 1 item" without the approver; publish doors = each head's button | **RECORDED** (question) · `s6-phone-*` |
| **S9** (Fable) = Astra 8 | everything · Tue | sign on the BOARD at P0; edit on the week; put back; edit then sign | AM15b, AM15, AM11, AM10 | "All signed — no changes to publish right now" ✓, no Publish anywhere ✓; edit blanks all four on week AND board ✓; revert restores all four ✓; edit-then-sign "Published at Original · 1 change to publish — Publish AL1", no false note ✓ | **PASS** both · `s9-*` |
| **Astra 11** | everything · Tue | take-off A→B, Undo, Redo, Undo | AM20/AM11 | mark + count + blank sign-offs at B, all restored at A, both ways ✓ | **PASS** both |
| **Astra 20** | everything · Tue | sign three of four; press every door (forced) | AM10 | week, board and panel buttons locked, title "Sign off APPROVED BY…"; nothing published ✓ | **PASS** both · `s9-*-r20-*` |
| **S15** (Fable) + **Astra 34** | everything · Thu | board: take-off edit, delete a line, input off, drag a wave; sign → AL1; board; Unpublish; view; drag the wave back | AM21/AM21b kinds; AM19 solid marks, nothing dotted; AM37c; AM20 | "5 pending": "2 removals · 1 reorder · 1 input filing" ✓ (the input off removes its ground row too); AL1 "5 items" with kinds + "appr" ✓; take-off solid AL1, no dotted remnants ✓; Unpublish → ORIG, "5 pending" ✓; view shows the Original ✓ (but "1 pending", W1-3); wave back → 4 ✓; ⓘ 4/4/5 ✗ | **FAIL** both (W1-7, W1-3) · `s15-*` |
| **S22** (Fable) + **Astra 16** (+17) | fresh · Mon, Tue | publish both; edit both; sign both; publish Mon AL1 only; then Tue | AM1/AM2/AM3 | toast "…on Mon only… 1 day with changes still held" ✓; Tue untouched (ORIG, "1 pending", own AL1, signatures and marks unchanged) ✓; Tue → its own AL1 ✓; each ⓘ lists only its own AL1 ✓; panel "AL1 Mon", "AL1 Tue" ✓; Tue's AL1 preview shows Tue's content ✓ | **PASS** both · `s22-*` |
| **S31** (Fable, "BUG 1") + **Astra 18, 35** + **S32** | everything · Tue | AL1 (note); AL1 note edited + put back; AL2 (note + take-off); note back to AL1's value; Unpublish ×3 with the working copy reset to the Original before the last | AM37c/AM34 peel; tag = ⓘ = menu = view page; AM4 Original never changes; AM20; AM15 | peel AL2→AL1→ORIG→DRAFT: tag, ⓘ, plans menu and view page agree at every step ✓ (BUG 1 not back); Unpublish names the version it pulls ✓; Original identical, no marks, after every step ✓; r35: AL1 tint returns before AL2 ✓, after AL2 the AL1 value is dotted AL3 ✓; S32: nets to nothing, no Publish anywhere, "All signed" note ✓ — after AL2 comes off the note is dotted "AL2" instead of solid AL1 ✗ | **FAIL** both (W1-1 second shape) · `s31-*`, `s32-*` |
| **S33** (Fable) + **Astra 13** | fresh · Mon | AL1 changes duty row 2's time; move row 1 below row 2, back; again by Undo/Redo; panel | AM21, AM20, AM11; marks follow their row | "1 pending", sign-offs blank ✓; the AL1 mark follows its row ✓; back → nothing, names back ✓; Undo/Redo the same ✓ — ⓘ "2 unpublished edits" ✗; panel "Changes are on unpublished days…" + Discard live ✗ | **FAIL** both (W1-7), desktop (W1-5) · `s33-*` |
| **S34** (Fable) | everything · Tue | edit → sign → type a take-off without leaving the box → press Publish AL1 (board, then week) | AM10/AM11 | the typed time kept, sign-offs cleared, button locked, nothing published ✓ (no message — §5) | **PASS** both · `s34-*` |
| **S36** (Fable) | everything · Tue | 8 rounds of edit → sign → Publish ALn; look at AL7 and AL8 | AM22/AM19 one palette | AL1–AL7 tag, solid and dotted marks all the register's colour ✓; AL8 tag = marks = preview bar ✓; AL7 and AL8 both orange (§5 Q-a) | **PASS** both · `s36-*` |
| **S40** (Fable) | everything · Sun | sign Sunday; scroll the week to Monday; press Sunday's "Publish AL1" in the panel; also the panel while Monday's Original is looked at | AM25, AM1 | toast names Sunday ✓; Sunday's off-screen head → AL1, nothing pending ✓; Monday untouched ✓; the week did not jump ✓; Monday's panel button locked under a preview, with its reason ✓ | **PASS** desktop · `s40-*` |
| **Astra 12** | everything · Tue | + Line then delete it; delete an issued line, Undo; delete an issued ground row and rebuild it by hand | AM21; AM39b | add+delete → nothing ✓; issued line → "1 change · 1 removal" ✓; Undo → clean ✓; rebuilt row marks no other row ✓ (counts removal + new row — §5 Q-d) | **PASS** both · `r12-*` |
| **Astra 39** | everything · Mon 13 Jul ↔ 20 Jul | look at Mon's Original; calendar → 20 Jul; back | AM51f, AM1/AM3 | 20 Jul Monday: DRAFT, no count, no marks, no preview, no issued versions (week, board, view page) ✓; back: 13 Jul exactly as it was, preview reset ✓ | **PASS** both · `r39-*` |

---

## 3. Roll-call rows (evidence sheet §4)

| # | place | SHOWS | ACT | PAINTED WITH | walked |
|---|---|---|---|---|---|
| R1 | Edit week — day head | YES: tag (dashed DRAFT, grey ORIG, AL1–AL8 coloured — all checked); selector ("Live working copy" / "Plan A" / "👁 Original" under a preview); "N pending" (the true count — right in every setup); "Not yet signed" (published + changes only); "Publish day" / "Publish ALn" (only with something to publish; locked until signed, title names what is missing); Unpublish (published, not previewing; names the version it pulls); ⓘ | YES: plans menu opens (issued versions to look at, "+ Alt Plan"); Publish; Unpublish one tap on weekdays; ⓘ opens | Templates, the 4×4 badge; on a phone the head wraps to two rows — nothing clipped at 390px (`rc-phone-R1-*`) | both, `w1-10-rollcall` + every scenario |
| R2 | Edit week — sign-off strip | YES: four selects, "Clear" once one is signed, the state line in all four wordings | YES: pick; Clear empties all four; an edit blanks them; a revert restores them; three of four locks every door | wraps two-up on a phone | both (`rc-*-R2-*`, S9) |
| R3 | Edit week — cells | YES for every TEXT cell (callsign, take-off, flying remarks, day note, Common Programme time, duty time, sim label, ground name): dotted in the next AL's colour, solid + "ALn" after publishing; a swapped seat puck dotted/solid. **MISSING:** an emptied cockpit seat while pending (plain "+ RCP"); an emptied duty / Common Programme / sim seat before and after publishing (W1-2). No cell by design for removals, reorders, filings (counted only). **Wrong:** W1-1 phantom | YES: edit, right-click clear, drag | warning rings, OIL green edge, "you" fill, selection; the phantom (W1-1) | both |
| R4 | Board (desktop) — sign strip | YES as R1/R2 (same builders), **MISSING "Not yet signed"** (W1-6) | YES: sign, Clear, Publish ALn, Unpublish, ⓘ, plans menu | history line above, Live Checks below | desktop |
| R5 | Board (desktop) — cells | YES for every text cell and a swapped seat (the take-off box repeats on each aircraft row of a formation — two marks for one change, as designed). **MISSING:** an emptied cockpit seat ("+ RCP", no mark before or after AL1); an emptied sim seat (spare seat, unmarked); an emptied duty / Common Programme seat (nothing drawn) — W1-2 | YES: type, right-click clear, drag grips (rows and waves), + Line, ✕, Personal Inputs | OIL mode pucks, warning chips | desktop |
| R6 | Board (phone) — strip and cells | as R4 + R5 at 390px, same MISSINGs; strip wraps; drags work from the grip | as R4/R5 | as R5 | phone |
| R10 | Amendments panel | desktop YES: "N days with changes to publish"; per day "Day · N changes · N removals · N reorders · N input filings · what this day earns changed" with its own Publish ALn (locked unsigned and under a preview, with the reason); issued AL tags with the approver. **Wrong:** "Discard marks" and its sentence (W1-5). Phone: in the page but hidden — no substitute (S6) | Publish ALn publishes that day only, even off screen (S40); Discard (W1-5) | the day label runs straight into its button, no gap (`rc-desktop-R10-panel`) | desktop; phone recorded |
| R11 | ⓘ day panel (both pages) | YES: status ("✓ Published — APPROVED · at ALn" / "Draft — not yet published"), "AL versions covering …" chips "ALn · N items" (no approver), tasking, issues. **Wrong:** its "N unpublished edits" (W1-7); on the view page it shows the working copy's count on the issued face (W1-3) | rows jump to warnings; Close | a modal over the page | both, week + board + view page |

**Also touched by these walks** (partial — the rows' owners fill the rest):

| # | place | SHOWS | ACT | PAINTED WITH | walked |
|---|---|---|---|---|---|
| R7 | View-only week — issued face | YES: tag, "<version> — as issued" / "Working draft — not issued", the issued solid marks, content frozen in every scenario. **Wrong:** "1 pending" after a filing change (W1-3); a false solid AL1 after W1-1's re-issue; nothing where a man was taken off a desk / programme / sim row (W1-2) | the picker; ⓘ | the official flags | both, admin and member |
| R14 | A preview of an issued version (week) | YES: "👁 Viewing the issued ALn — read-only…", tinted in the version's colour (AL7 and AL8 checked), "← Back to live copy", "Load onto working copy"; the Original identical after every AL and every unpublish; dropped by a week change | "← Back to live copy" (Load not pressed in my walks) | the frozen body, no warnings | both |
| R16 | The plans menu | YES: the live row ("● live now — differences from X go out as ALn", or "this is what publishes" on a draft), one "read-only" row per surviving issued version — withdrawn versions leave the menu at once — and "+ Alt Plan" | look at a version | the note "This day is published — the issued versions don't change…" | both |

---

## 4. Checked and found right (explicit negatives)

- **Signing is bound to content, both surfaces, both orders** (AM10/AM11/AM15/AM15b): S9 and Astra 11/20 all PASS at both widths.
- **Per-day numbering and isolation** (AM1–AM3): S22 / Astra 16/17 all PASS.
- **The peel order** (AM34/AM37c): the old "BUG 1" (a tag naming a version the ⓘ list lacks) does **not** return — tag, ⓘ, plans menu
  and view page agree at AL2 → AL1 → ORIG → DRAFT; the Unpublish button names the version it pulls at every step.
- **The Original never changes** (AM4/AM8): looked at after every AL and every unpublish — identical text, no marks (Astra 18).
- **A correction that nets to nothing** hides every Publish door and says "no changes to publish" (AM15; S32).
- **The AL1 tint returns** when an AL1 item is edited and put back before AL2; after AL2 the AL1 value correctly reads as a new change
  (AM20; Astra 35).
- **Reorders**: one reorder = one item; exactly back = nothing (by hand and by Undo/Redo); a mark follows its row, not its position
  (Astra 13; S3C; S15).
- **Add-then-delete a line** is no change; deleting an issued line is one removal; Undo restores it clean (AM21; Astra 12).
- **Publish with an unsaved box** never issues on stale signatures and never loses the typed value (S34).
- **The AL palette** (AM22): tag, solid mark, dotted mark and preview bar agree for AL1–AL8.
- **The panel's per-day Publish** publishes only that day, updates it off screen, and is locked under a preview (S40).
- **Next week's Monday** carries none of this Monday's state; a preview does not survive a week change (Astra 39).
- **A working-copy OIL change moves nothing on the Leave War** until published (AM47; S3A — Saber's FO* unchanged).
- **The issued face's content** stayed frozen in every scenario (W1-3 is only the chip and the ⓘ).
- **No console errors** in any run.

## 5. Observations and questions (not judged FAIL — for the host)

- **Q-a (S36).** AL7 and AL8 are the same orange; only the number tells them apart. The register names no colour past AL7.
- **Q-b (S6, Fable Q3).** A phone has no Amendments panel: no list of every day with changes waiting, and no place that shows who
  approved an issued AL (the ⓘ lists "AL1 · 1 item" with no approver; only the publish toast ever names him).
- **Q-c (S3B2).** A request added onto a published day and then un-accepted leaves "1 pending · 1 input filing": the request is still
  on file for the day, just not accepted. AM41 keeps a filing pending until the scheduler removes it, so this may be right — but the
  ground programme is identical to the issued one, and the ⓘ says nothing is pending.
- **Q-d (Astra 12, S15).** Rebuilding an identical ground row by hand counts as a removal plus a new row; taking an accepted input off
  counts twice (the input filing and the removal of its ground row). Consistent with rows having their own identity; noted in case he
  expects one item.
- **Publish confirmation hidden on a weekend.** On Saturday, "Published AL1 · 14 items on Sat only · approved by Anvil…" is replaced in
  the same instant by the OIL warning ("the SXO desk has no usable times…"); a person only ever sees the warning (roll-call run).
- **Silent presses.** Unpublish shows no message (the tag changes); pressing Publish while a typed box is still open (S34) shows no
  message — the sign-offs clear and the button locks. AM15b's principle would favour a word in both.
- **Undo wording (outside my subject).** Undoing a take-off time change says "Undid: a note on the schedule" (S9) — AM39b says the
  bubble says what it did.
- **Panel layout.** "Mon · 1 change" runs straight into its "Publish AL2" button, no gap (`rc-desktop-R10-panel`).
- **Callsigns drawn as "…" (outside my subject).** The edit week's callsign column shows a five-letter callsign as "•…": on the
  phone both VIPER and COBRA (`es-phone-2-week-emptied-AL1`, `rc-phone-R3-week-flying`), on the desktop COBRA (the wider word) while
  VIPER fits (`es-desktop-1-week-emptied-pending`). The text is intact underneath; the column is narrower than the name. On the
  phone BOARD the callsign boxes wrap instead ("VIP/R", "COB/RA", `rc-phone-R5-board-flying`). Not investigated.
- **Small visual notes.** At 390px the solid "AL1" tag beside a time is clipped to "AL" by the narrow time column (week and view page:
  `s1-phone-5-reissued-line`, `rc-phone-R7-view-sat-duty`). On the desktop week the left scroll arrow "❮" sits over the first
  sign-off pill of the leftmost day, half-hiding its name (`rc-desktop-R1-mon-head`, `s9-desktop-A-week-after-edit`).

## 6. What I could not walk, and why

- **Fable S3 B exactly as written** (accept an `Other` input to Unavailable, then un-accept): the everything week has no unaccepted
  `Other` input on a published weekday. Walked both orders with what exists instead (S3B: take off an issued appointment then put it
  back; S3B2: add through "+ Inputs" then take off). The "→ Unavail" route was not walked.
- **Real touch.** Drags at 390px were driven with a mouse pointer, not a finger; iPhone Safari's touch delivery is not proven here
  (bug-check order §7.9).
- **The Leave War after publishing Saturday's AL1** in the roll-call (who lost OIL when three men were taken off) — money scenarios
  belong to another walker; I checked only AM47.
- **A short screen** (phone on its side, a 700px laptop) — not walked.

## 7. Driver notes — misses of mine, fixed before any result was recorded (so the next walker skips them)

- The "N pending" chip uses a no-break space — compare normalised text.
- Wave and row drags: park the grip ~100px below the top of its scroll box — the app auto-scrolls while a held pointer is in the top
  or bottom 72px, which slides the target away; with two waves, drag the upper one down twice rather than dragging upward.
- With the board open, press the board's own Undo/Redo (`#sbUndo`/`#sbRedo`); the page's buttons sit behind its bar.
- Plans-menu rows read "AL7read-only…" — no word boundary after the number (and use `planMenuLook` for issued versions).
- The toast is one element whose text is replaced; record each added text node, or a message replaced in the same instant is lost.
- On a phone, Logout is in the menu (`#burger` → `#drawerLogout`).
- A generic "confirm" button lookup can hit hidden week controls behind the open board — deleting a line needs no confirm.
- The newest input is not the last one in the list — find it by comparing ids before and after.
