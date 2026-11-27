# Section 1 (the guard rail), step K8 — the Undo that would change the squadron in view, refused before its step: the builder's report (chat 204's helper, 27 Nov 26)

Brief: `2026-11-27-msq-s1-k8-brief.md` (K4's brief where it is silent). Branch `claude/msq-s1-guard-6ae5e1`, working copy
`lw-balances-hover-275293`, from `d6fcfbb82`. Nothing committed or pushed; `HANDOFF.md`, the plan and `OUTSTANDING.md` not
touched. Not touched: `src/engine/`, `ui/UsersPanel.tsx`, `ui/AdminPage.tsx`, `storage/`, any line of `undo/timeline.ts`
but the three agreed with chat 205.

**In one line: an Undo or a Redo whose step would take away the squadron in view (row 21 — the Undo of "+ New squadron"
with that squadron picked) or whose landing would bring his own squadron back (row 13) now asks the guard as the last of
the timeline's refusals, before the view moves or anything is written; refused, the note stands under the Undo button —
"Blocked: <a lead that adds no Undo step>, then press Undo again." — and the Undo's engine says nothing more; with nothing
open the step goes through as today.**

**K8 is whole but for one item that needs a decision** (decision 1 below: the OIL list card's "…then try again." is not
built, because it was never shown to him). Everything else in the brief is built and green.

## What changed, file by file

| File | Change |
|---|---|
| `undo/timeline.ts` | The three agreed lines, nothing else: the hook field `squadronRefusal?(entry, dir): string \| null` beside `restoreRefusal`; in `globalUndo` the one line just before `snap(entry, 'undo')`; its twin in `globalRedo` before `snap(entry, 'redo')`. Nothing stored on the step. |
| `state/undo-wire.ts` | New `squadronRefusal(entry, dir)` (its comment says the whole rule), wired by one line in `setUndoHooks` (`squadronRefusal,`); new test export `_squadronRefusal`; imports `pageOffered`, `myUnit` (perms) and `refuse`, `saidNote`, `UNSAID` (the seam). |
| `state/guard.ts` | The seam learns what the last refusal said: `refuse()` clears it before saying; `noteSaid(words)` (called by the note's own function), `saidNote()`, the constant `UNSAID` (the reason of a refusal said by no one — never shown), `saidByGuard(reason)`. Still no imports. |
| `ui/guardnote.ts` | `noteAtFor('undo')` → under the Undo on screen, left edge, under the bar (the top bar's `#undoBtn`; the board's `#sbUndo` while the board is up — the board is always in the page, hidden while shut, so "up" is "not inside `[hidden]`"); `guardSay` reports its words through `noteSaid` before raising the note; head comment updated. |
| `ui/guard.ts` | `GUARD_ENDINGS.undo = 'press Undo again.'`; new `GUARD_UNDO_LEADS` (the Cancel halves); new `guardUndoLead(row, at)`; `guardEnding('undo')`; `guardWords` takes the Undo's own lead for the `undo` door. |
| `ui/topstate.ts` | **Not named in the brief (difference 2).** `globalUndoEngine`'s undo and redo raise a refusal's reason as a note only where `!saidByGuard(reason)`; the import line. |
| `ui/msq-guard-doors-undo.test.tsx` | **New** — 12 tests and 1 to-do (B24, Redo's twin, B23 row 13 and its Redo twin, the pin on the page door, the card's to-do). File-map line for K12: "the guard rail's doors — the Undo's and Redo's halves of §4.7's B23 and B24, pressed on the real controls (step K8)". |
| `ui/msq-guard-note.test.tsx` | One pin re-pointed (below); new describe "K8 — the Undo ending" (5 tests); two place tests for `undo` in the door → place table. |

## How row 21 is read (the brief left the read to the builder)

The step's own changes — `inverse` for an Undo, `forward` for a Redo — hold a change of the `settings` row whose id is
exactly `unit:<the squadron in view>` (its `UNIT_PFX` row, the same plain id `stepStuck` reads), whose new image (null for a
`delete`) differs from the one it holds now. "Remove, or change": its going, or any other image. Only "+ New squadron"
writes that row today (`units.ts addUnit`), so in practice it is the Undo of "+ New squadron" with that squadron picked.
**The squadron it would enter, both rows:** his own today, `myUnit(todayIso())` — where `maybeReenter` and the landing
would take him. Row 13 is read exactly as `snapView` reads it: the landing's page is not the page shown, not one of its
`also` pages, and not offered by the squadron in view.

## The page door's own refusal is no longer reached from an Undo or Redo (pinned)

The hook asks the same question the landing's door (`store.ts stepPage`) asks, one call earlier: in between run only
`snap`'s week load (`loadContext`) and nothing that can open a window or change a save. So with this hook `stepPage`'s
`'refused'` answer is no longer reached once the step has started; it stays the landing's door, a belt. **Pinned** in
`msq-guard-doors-undo.test.tsx` B23: under a refusal the seam is asked once, by the `undo` door, never by `page`. (A save
still *going* at the press is not a refusal: the hook lets it through and `stepPage`'s wait remains the belt. With the
stores the app ships a save answers in the same turn, D2742.)

## Every lead and ending built, and where it was shown to him

| Words | Where shown / ruled |
|---|---|
| ending "press Undo again." | the section page's group 5 (D2729); the sections' words review kept it |
| "Blocked: close the open window, then press Undo again." | group 5's desktop drawing; the words review |
| "Blocked: cancel the new holiday, then press Undo again." | group 5's phone drawing; the words review |
| "cancel the open row" · "cancel giving access" · "cancel the new squadron" · "cancel the new person" (+ the Undo ending) | the sections' words review (kept, "not drawn") |
| "press Retry to save your changes" + the Undo ending | his ruled lead (D2627 A13) and the reviewed ending, joined as §4.6's E9n reading joins halves. **§4.6 asked the builder to read what a landed Retry leaves on top of the Undo list first:** Retry re-sends the change already made (`ui/savestatus-source.ts retrySaves` → the saver's flush); it records no command, so the step on top is unchanged and "press Undo again" stays true. B24's Retry test presses Undo again after Retry and 151 goes |

## Every one listed "for a fresh Fable and his look" — not built

1. **The OIL list card's ending "…then try again."** (§4.6, words3 W4). A fresh Fable read it in words3, but it is in the
   sections' words review's "Not read" list and on no drawing. See decision 1. Its press stays silent, as K6 left it.
2. **The same ending for a press naming no door** (`'page'`). §4.6 gives it "try again." too ("any later button that would
   bring his own squadron back"), so it waits with item 1. Silent, as built.
3. **A Redo's ending — "…then press Redo again."** (draft). It stands nowhere he has seen. **I did not give Redo the Undo's
   ending** (difference 1). Redo's refusal holds — nothing moves, nothing is written — and says nothing. No press reaches a
   Redo refusal today: no step's forward takes a squadron row away, and on a squadron he only views there is no Redo button.
4. **The Undo's leads with no Cancel half shown to him.** Each refuses with the plain lead for its kind, pinned in
   `msq-guard-note.test.tsx` "(listed …)":
   - the section-named leads "…on Users" / "…on Squadrons" (D2814) → the plain Cancel half ("cancel the open row",
     "cancel the new squadron", "cancel the new person", "cancel giving access"). Drafts: "cancel the open row on Users",
     "cancel the new squadron on Squadrons" and the like;
   - "save or cancel the changed holiday", "save or cancel “Every Monday”", "add or cancel the sheet's holidays", the two
     settings windows (and their "close the Calendar, …" forms) → "close the open window" (closing adds no step). Drafts:
     "cancel the changed holiday", "cancel “Every Monday”", "cancel the sheet's holidays", "cancel Inputs calendar settings";
   - a window on a page out of sight (§4.6 gap 2c, "…on the Leave War, then press Undo again.") → "close the open window";
   - **"add or clear the new qualification" keeps its own words** with the Undo ending. It has no Cancel half and is no
     window. "Add" would add an Undo step, so the sentence is only half true. Draft: "clear the new qualification".
5. **(the agent's reading, named)** "cancel the new holiday, or create its leave period" takes "cancel the new holiday" —
   the words shown on group 5's phone drawing — since creating the leave period would add a step.
6. **Ctrl+Z (§4.6 gap 2b)** — read: the app has no keyboard Undo for the one Undo (only the Tracker names Ctrl+Z, its own),
   so there is nothing to word.

## Where the brief and the code differed, and what I did

1. **Redo asks the guard as its own door, `'redo'`, not `'undo'`.** The brief says "either way: `refuse('undo', …)`" and
   the note ends "…then press Undo again." For a Redo that sentence is untrue: pressing Undo next would undo the newest
   step, not redo his. So Redo uses its own door, which has no ending of his yet → silent (item 3). One word to change
   back if the orchestrator rules otherwise (`refuse(dir, …)` in `undo-wire.ts squadronRefusal`).
2. **`ui/topstate.ts` changed (two lines and an import).** The Undo's engine raises any refusal's reason as a note of its
   own (`HOOKS.toast(reason, 'warn')`). Returning the words as the reason, as the brief asks, would have raised them a
   second time, in the warning face, at the ordinary place — moving the note off the Undo button. So the seam records
   what it said, and the engine passes over a reason the guard already said (or left unsaid). In jsdom `HOOKS.toast` is a
   stand-in, so the doubled note would not show in the page; the tests assert the engine raised no 'warn' note.
3. **The board's Undo.** §4.6 names "the top bar's Undo button". The board covers the top bar and carries its own pair,
   so the note stands under the board's Undo while the board is up (the same shape as the bell's "the bell on screen").
4. **Row 21 has no Redo road.** Every Redo of "+ New squadron" puts the squadron back, so it never takes the squadron in
   view away. B24's Redo is a pin of today (Undo with nothing open, then a holiday half typed on 142, then Redo: through,
   142 still in view) plus the hook's Redo half asked of a made-up step (a belt, named so). Row 13's Redo twin is driven
   as the landing drives it, as B23 is.
5. **B23's window case uses his own input's window** (put up by its setter, as the bell's OIL tap opens it), not the
   OIL list: for Ranger on 149 the OIL list opener does not make a counting window (`whatIsOpen` is null), which the test
   now checks as its premise. Not investigated further; named for the orchestrator.

## Decision needed

1. **The OIL list card's "…then try again." (and the same for a press naming no door).** The brief says to build it. The
   brief and my rules also say to build only words shown to him or ruled, and this ending is in neither of the two
   sources. The words review lists it under "Not read"; it is `[WNS]` in §4.6. I did not build it; the card's refused
   press stays silent, and its test is an `it.todo` in `msq-guard-doors-undo.test.tsx`. **If the orchestrator holds the
   card's words as cleared** (words3's Fable read it), building it is two lines in `ui/guard.ts` (`card: 'try again.'` in
   `GUARD_ENDINGS` and `case 'card': case 'page':` in `guardEnding`), plus the to-do written out. Otherwise it goes to a
   fresh Fable and his look with items 3 and 4.

## Tests — seen failing first (the patch-file method, never `git stash`)

- **The six source files set aside** (`git diff` of them to `.tmp/k8.patch`, checked out, the two test files run, the
  patch applied back, the same six files and line counts after): `.tmp/k8-red.txt` — **14 failed, 63 passed, 1 to-do**.
  Several failed only because the new names were absent. So a second run was made:
- **Only the timeline's three lines set aside** (`.tmp/k8-tl.patch`), the words in place: `.tmp/k8-red2.txt` — **7 failed
  for the right reason**: in each B24 case "151 still there: expected false" (the Undo took 151 away with the window open);
  in B23 "his leave still filed — nothing half applied: expected false" (the step wrote its Undo while the landing's door
  refused — the half-applied fault row 13 names); the Redo twin applied its step under a failed save. The 5 that passed
  there are the controls and pins (nothing open; 151 not picked; the Redo's real road; the hook's own belt, which calls
  the hook directly).
- The note test's new cases failed on the old code (no `undo` ending, no `GUARD_UNDO_LEADS`, no `undo` place).

## The pin re-pointed — old and new expectation

| Test | Old | New |
|---|---|---|
| `ui/msq-guard-note.test.tsx` "a door with no ending of his yet …" | `card`, `page`, `undo` each say nothing | `card`, `page`, `redo` each say nothing. The Undo's ending is built now (D2729, group 5); its words have their own describe. The comment says so. No assertion weakened: the Undo's words are now asserted positively |

## Checks (all in `raptor-port/`)

| Command | Result |
|---|---|
| `npx vitest run src/ui/msq-guard-doors-undo.test.tsx` | **12 passed, 1 to-do**, exit 0 (`.tmp/k8-g3.txt`) |
| `npx vitest run src/ui/msq-guard-note.test.tsx` | **65 passed**, exit 0 (`.tmp/k8-note1.txt`) |
| every guard file but `msq-guard-open` (it runs in the full suite), every undo test file (`src/undo/`, `src/state/*undo*`), the role-question count test (`state/edit-rights-readers`), `msq-inputscal-own-calendar`, `msq-fix3-admin-panel-undo`, `msq-squadrons-panel`, `test-support/no-app-import` | **41 files, 725 passed, 7 to-do**, exit 0 (`.tmp/k8-batch1.txt`) |
| `npm run lint:changed` | the one known finding only (`ui/UsersPanel.tsx`, high complexity — not this section's file), exit 1 as before (`.tmp/k8-lint.txt`) |
| `npm test` under the checks lock (taken free; released after the build) | **1147 of 1147 files passed; 17824 passed, 5 expected fail, 20 skipped, 7 to-do, of 17856**; exit 0; 1571 s (`.tmp/k8-full.txt`, `.tmp/k8-full-exit.txt`) — `msq-guard-open` included |
| `npm run build` under the lock, right after | passed — the typecheck and the build (491 modules), exit 0 (`.tmp/k8-build.txt`) |
| `npm run docsize` | OK — every record accounted for (`.tmp/k8-docsize.txt`) |

## What only a browser can show (for K12)

- The note under the top bar's Undo on a desktop ("Blocked: cancel the new holiday, then press Undo again."), its left
  edge on the button's, and at the foot on his iPhone, clear of the Calendar's Cancel and Save (§4.6's first paragraph).
- On the board: Saber on 151 with the board open and a row being edited, the board's Undo pressed — the note under the
  board's Undo, and only one note (no second, amber one).
- After the refusal: Cancel, then Undo again — 151 gone, the bar on 142.

## Scenarios worth a walker's time

1. Saber makes 151, picks it, opens Inputs → the Calendar, starts "Add a holiday", types a name, presses Undo. Refused,
   151 still in view. Cancel, Undo again: 151 gone, 142 in view.
2. The same with Admin → Squadrons' 142 row open and a place typed ("cancel the open row"), and with "+ New squadron"
   open again with a number typed ("cancel the new squadron").
3. The same with the save made to fail (`?savefail`): the Retry note; Retry once saving is back; Undo again goes through.
4. Saber makes 151 but stays on 142 with a form open: Undo goes through (nothing in view is taken away).
5. Undo then Redo of "+ New squadron" with a holiday half typed on 142: the Redo goes through, the form stays.

## Rulings

Rulings: none this session (a builder helper; no message from him).

```
Status: READY FOR INDEPENDENT REVIEW (but for decision 1)
Changes: undo/timeline.ts (the three agreed lines); state/undo-wire.ts (squadronRefusal, its one hook line, _squadronRefusal); state/guard.ts (what the last refusal said: noteSaid, saidNote, UNSAID, saidByGuard); ui/guardnote.ts (the undo door's place; the words reported); ui/guard.ts (the Undo ending, GUARD_UNDO_LEADS, guardUndoLead); ui/topstate.ts (the engine does not say a guard refusal twice); new ui/msq-guard-doors-undo.test.tsx; ui/msq-guard-note.test.tsx (K8 describe, two place tests, one pin re-pointed)
Checks: listed above, in raptor-port/
Open items: decision 1 (the card's "…then try again."); the words listed for a fresh Fable and his look (items 1–5); docs/file-map.md line for the new test file (K12); the browser looks above (K12)
```
