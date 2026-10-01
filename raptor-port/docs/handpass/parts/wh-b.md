# Walker B — the publish line · [WARN-HIDE-KEPT] · 1 Oct 26

The frozen build on `http://localhost:4212`, driven by a scripted real browser, every fixture through the app's own
controls (the ✕ / ↺ on a line, the four sign-off selects, Publish day / Publish AL / Unpublish, the plans selector's
issued versions, "Load onto working copy", Quals' callsign box, the board's seat and crew list). Both widths — desktop
1440×900 and phone 390×844 — for every scenario. Each scenario in a fresh world.

**Totals:** 190 checks PASS · 10 FAIL (two findings, each seen at both widths) · 38 recorded without a verdict.
**Errors:** none — no console error, page error, failed request or native dialog in any run.
**Evidence:** 382 pictures in `docs/img/handpass/2026-10-01-warn-hide/b/` (`dk-…` desktop, `ph-…` phone, named by
scenario: `…-s38a-…`, `…-s40-…`); every check with what the screen said in `docs/handpass/parts/wh-b.json`; scripts
`scripts/handpass/wh-b-*.mjs`. Every picture was opened (as contact sheets, and the finding pictures one by one).

## The table

| # | What I did (the controls) | What the screen said | Verdict | Pictures |
|---|---|---|---|---|
| **38** publish, hide, amend | Tuesday: four sign-offs, Publish day. ✕ on the line. Reload as scheduler; reload as the member (View-only Sched). Four sign-offs, Publish AL1; the member again. Run twice: Static's long work day (freezes on a published face) and Outlaw's crew-rest breach (stays live). | Working copy at once: line struck, ↺ on top, "4 issues" → "3 issues", nothing about "hidden", the puck plain, "1 pending", "Not yet signed", four sign-offs empty, "Publish AL1". Survives the reload. Member while it waits: still 4 issues, line not struck, no button, the puck still flagged, no pending chip; Outlaw's dotted "breaks Tuesday" mark on Monday still drawn. After AL1: 3 issues, line struck with no button, puck plain, Monday's dotted mark gone. | **PASS** (both warnings, both widths) | `*-s38a-*`, `*-s38b-*` |
| **40** every count says one | Published Tuesday; ✕ on the long work day; read the day's chip, marker, sign-offs, Publish AL button, Amendments panel, changes window ("To go out", "All changes"); sign the four; ✕ on a second warning; ↺ on it; publish AL1; ↺ then ✕ again. | One hide: "1 pending" · "Tue · 1 change" · "To go out · AL1 1" · one line "Warning · Static — … flagged → hidden" · never "Warnings on this day changed". Signed: "Not yet published", button unlocked. Second hide: "2" everywhere, the four fall. Back to one. AL1's own count: "1 item" (Amendments list and ⓘ). ↺ after AL1: one line "hidden → flagged again", "Publish AL2"; ✕ again: nothing pending. In "All changes" the hide sits under "The day". | **PASS** on every count · **FAIL** on the tap (finding 2) | `*-s40-*` |
| **37** hide, then publish | Draft Tuesday: ✕; reload; four sign-offs, Publish day; the member. Both warnings. | Draft: struck, 3 issues, nothing pending. Original goes out hidden: no pending anywhere, "To go out" empty. Member: 3 issues, struck, no button, puck plain; no dotted mark on Monday. | **PASS** | `*-s37a-*`, `*-s37b-*` |
| **39** hide, publish, flag again, amend | From 37: ↺; the member; reload; four sign-offs, Publish AL1; the member. | Working copy: 4 issues, puck flagged, "1 pending", one line "hidden → flagged again". Member while it waits: still struck, 3 issues, puck plain. After AL1: 4 issues, not struck, puck flagged, Monday's dotted mark back. | **PASS** | `*-s39a-*`, `*-s39b-*` |
| **41** Unpublish | Original flagged, AL1 hidden; Unpublish (confirmed); the member; reload; sign and Publish AL1 again. Second world: the Original itself unpublished. | Back at ORIG; the working copy keeps the hide; "1 pending"; button "Publish AL1" (no "Reissue"); one line "flagged → hidden". Member: Original, 4 issues, flagged. AL1 again restores it. Original unpublished: DRAFT, hide kept, View-only Sched follows it. | **PASS** | `*-s41-*` |
| **42** load the current version | (a) Published flagged, ✕, look at the Original, "Load onto working copy". (b) Published hidden, ↺, the same. | Confirm reads "Discard 1 edit & load — confirm"; after it the hide state is the version's, nothing pending, kept across a reload and for the member. | **PASS** | `*-s42a-*`, `*-s42b-*` |
| **3** load an older version | Astra's setup: Original flagged → AL1 hidden → ↺ on the working copy → look at the Original → Load. Plus two neighbours (3c, 3d) and two comparisons with a typed remark (3e, 3f). | Astra's case: plain "Load onto working copy", no confirm, no "edit replaced", and "1 pending" (hidden → flagged again) stays. The neighbours count wrongly — finding 1. | **PASS** (her case) · **FAIL** (3c, 3d) | `*-s3-*`, `*-s3c-*`, `*-s3d-*`, `*-s3e-*`, `*-s3f-*` |
| **43** a look at each of three versions | Original flagged, AL1 hidden, AL2 flagged again, then a pending hide of Saint's clash. 👁 each version on Edit Schedule and on the Scheduler Board; tap the long-day line. | Original and AL2: 4 issues, not struck, Static flagged. AL1: 3 issues, struck, Static plain. No ✕ / ↺, no sign-off boxes, no "Not yet signed"; the pending clash hide never shows in a look; a tap on the line (struck or not) lights Static's pucks. Working copy untouched afterwards. | **PASS** (recorded: see notes) | `*-s43-*` |
| **23** the ⓘ panel on each face | AL1 with one hide, then three more on the working copy; ⓘ on the working copy, on a look at the Original and at AL1, as the member; AL2 with all four hidden; ⓘ again. | Counts leave out hidden lines; the lines stay in place, struck, no button. All hidden: "Nothing flagged — this day is clean ✓" with four struck lines; the day bar "✓ No issues" still opens the list. Each face reads its own hides. | **PASS** | `*-s23-*` |
| **33** a rename | Published, ✕ on Static's long work day, four sign-offs over it; Quals → his callsign box → "Statix"; publish without signing again; rename once more. | Still hidden; the line and the pending line now read "Statix"; no second line; still exactly 1 pending; the four sign-offs stand; "Not yet published"; Publish AL1 still unlocked and it publishes. | **PASS** | `*-s33-*` |
| **10** ALL AVAIL window, published half | ALL AVAIL put on a Tuesday ground row (board seat + crew list); published; chip tapped on Edit Schedule and as the member, before the hide, while it waits, after AL1. | Outlaw stays in the crowd (43 both times). Working copy: his puck plain, reason gone, "2 men are flagged" → "One man is flagged". Member while it waits: unchanged; after AL1: plain, one fewer. | **PASS** | `*-s10-*` |
| **1** Insights while a hide waits | Published; the member opens Insights; ✕ on the working copy; the member again; AL1; again. | Published face's Tuesday count 4 → 4 → 3. Insights "By day" Tuesday 4 → **3** → 3; week total 33 → **32** → 32; "Long work day" 2 → **1** → 1. | **RECORDED**, not judged | `*-s1-*` |

## Findings

**1 — "Load onto working copy" of an older version miscounts hidden warnings.** It counts every hide that differs
between the working copy and the version being loaded as "your unpublished edit", even one already published.
- *Nothing pending at all (3d):* Tuesday → four sign-offs → Publish day → ✕ on Static's long work day → four sign-offs →
  Publish AL1. Nothing is pending. Plans selector → Original. The day's chip now reads **"1 pending"**; "Load onto
  working copy" turns into **"Discard 1 edit & load — confirm"** (its hint: "This discards your 1 unpublished edit");
  after it: "… 1 unpublished edit replaced". There was no unpublished edit. The same steps with a typed remark instead
  of a hide (3e): no chip, no confirm. Pictures `dk-28-s3d-1-look`, `dk-29-s3d-1-load-pressed`, `dk-34-s3e-1-load-pressed`.
- *One pending (3c):* as above, then ✕ on Saint's clash ("1 pending", Amendments "Tue · 1 change"). Look at the
  Original: the chip reads **"2 pending"** beside an Amendments panel still saying 1; confirm **"Discard 2 edits"**;
  "2 unpublished edits replaced". With two remarks instead (3f): 1 / 1 / 1. Pictures `dk-20-s3c-1-look`, `dk-21-s3c-1-load-pressed`.
- Also seen in 43: looking at AL1 with one pending hide, the chip reads "2 pending".
- Expected: one per hidden warning on every count, the load's confirm included (WH8, D98). The load itself does the
  right thing; only the number and the words are wrong. Astra's own scenario 3 passes.

**2 — A tap on a pending "Warning · …" line does not go to the warning's line.** Published Tuesday → ✕ on the long
work day → tap "1 pending" → "To go out". The line cannot be tapped (hover: "This change has no place of its own on the
schedule to go to") while the window's foot says "Tap a change to go to it." With Saint's clash hidden its line can be
tapped, but it lights his seat on the flying line; the day's list stays shut and the struck line is not shown.
Expected (plan §3.4, D99, Astra 40): the tap lands on the struck line. Pictures `dk-05-s40-pend-tapped`,
`dk-14-s40-3t-tap-clash-line`, `dk-15-s40-3t-tap-longday-line` (and `ph-…`).

## Recorded, for a decision — not judged
- **Insights (scenario 1):** while a hide waits, Insights on View-only Sched already shows one fewer than the published
  day the member is looking at. Its three figures agree with each other. Pictures `dk-07-s1-b-pending-face`,
  `dk-10-s1-b-pending-insights-byday`.
- **Sign-offs come back by themselves (40):** four signed over one hide; a second hide makes them fall; ↺ on that
  second one brings all four back and "Not yet published" — the day is again exactly what they signed.
- **In a look, the crew list beside the day is today's:** looking at AL1 (Static's line struck, his puck plain in the
  day) the crew list still shows his L chip, because the working copy flags it.

## Not walked, and why
- **A second scheduler** (37, 38, 41, 42 ask for one): one admin is seeded; I reloaded and signed in again as the same
  scheduler and as the member. Walker C has the two-scheduler scenarios.
- **43's "no period-creation door" in a look:** Tuesday raises no OIL reminder, so that door is never offered there.
- **The Amendments panel on a phone:** it is not drawn at phone width, so its count was read on the desktop only.
- **42 (b):** not followed by a reload (42 (a) was).
- Scenario 10's draft half and 23's draft face are Walker A's.

My own probe scripts (`wh-b-probe*.mjs`, `wh-b-sheets.mjs`) and their pictures (`b/probe/`) are scratch, not evidence.

## What this walk does and does not cover
Everything above is the frozen build served on 4212 (built 17:00). While I walked, app files in the working folder were
changed by someone else (between 18:18 and 18:21: the week and board drawing, the cross-week helper, three tests and
four documents). I touched none of them, and none of those changes is in the build I drove — anything they alter needs
its own re-walk.
