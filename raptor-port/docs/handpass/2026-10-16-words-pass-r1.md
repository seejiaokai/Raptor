# The whole-app words pass, round 1 — evidence sheet (16 Oct 26)

**The change:** D938, D940 (his "1-5 as recommended" to round 1's page). On Edit Schedule, View-only Sched and the
Scheduler Board: the board's nine panel subtitles gone (a folded Personal Inputs keeps its count and ⌄; an open one ⌃);
"tap to review" / "tap to collapse" gone from every day's issues bar and the board's; "press a card to edit" gone from
SANS Avail; the fold words ("show", "hide", "by wave · close") gone, the carets kept; the editing hint of Personal Inputs
and Unavailable gone from both pages and NOT moved into the Legend (D938); the removed-input note's dash a full stop,
every word kept; the empty Amendments box "No amendments published yet." Design note and his answers:
`../superpowers/specs/2026-10-16-words-pass.md`. Branch `claude/whole-app-words-pass-73790e`.

## 1. The eight answers and the tier

| # | Question | Answer |
|---|---|---|
| 1 | Money (OIL) | NO — no number or credit changes; only words |
| 2 | The published record | NO — the published face prints the same bar; nothing about publishing, signing or amendments changes but the empty box's words |
| 3 | Saved data | NO — nothing stored |
| 4 | A shared drawer | **YES** — `dayHTML`'s issues bar is drawn on Edit Schedule and View-only Sched alike; the board's panels have a read-only and an editable face |
| 5 | A new gesture or mode | NO — but two folding headings LOST the words that named their gesture ("hide ⌃", "tap header to hide"): the walk presses each |
| 6 | A new surface | NO |
| 7 | Roles | NO — the hints were scheduler-only; a member's View-only Sched shares the issues bar, walked as a member |
| 8 | The warning list | NO — what the warnings say is untouched; only the bar's cue |

**Tier: WALK** (question 4). Told to him in the closing report (he answered by "1-5 as recommended" and was not at the
screen during the build).

## 2. The roll-call — every place the changed words were drawn

| Surface | Drawer | Changed words SHOWN as ruled? | Gesture still usable? | What else on the same pixels |
|---|---|---|---|---|
| Edit Schedule, a day's issues bar | `ui/html.ts` (`dayHTML`'s `dwbox`) | YES — walked, 2 sizes | YES — opens ▲ / closes ▼, walked | the count and ▼ only |
| View-only Sched, a day's issues bar (member) | the same drawer, read-only | YES — walked as member, 2 sizes | YES — opens ▲, walked | — |
| Edit Schedule, Personal Inputs heading (folded / open) | `ui/html.ts` plist | YES — "N inputs · N on programme ⌄" / "⌃", walked | YES — folds and unfolds by its heading, walked both ways | the grip ⠿ |
| Edit Schedule, Unavailable heading | the same | YES — no hint, walked | not a fold (never was) | — |
| Edit Schedule, SANS Avail heading | `sansSectionHTML` | YES — no hint (unit test); Monday holds a SANS card, walked | cards still press (unchanged code) | — |
| Edit Schedule, Available crew heading | `availHTML` | YES — "⌃" open, its counts and ⌄ shut, walked | YES — shuts and reopens, walked | — |
| Edit Schedule, removed-input note | `pl-inpnote` | YES — exact new text, walked | — | — |
| Edit Schedule, the Amendments box (desktop) | `ui/ALPanel.tsx` | YES — "No amendments published yet.", walked; NOT on a phone, as before | — | — |
| The board, issues bar | `ui/board.ts boardWarnHTML` | YES — walked, 2 sizes | YES on a phone (▾ opens), walked; on a desktop the bar is inert and the list always open, as built — walked: the list shows | — |
| The board, nine panel headings | `ui/board-html.ts sb*Panel` | YES — no subtitle on any, walked; read-only faces by unit test | Personal Inputs folds and unfolds by its heading, walked | each panel's own buttons (+ Note, + Item…) — unchanged |
| The board, removed-input note | `sb-pinote` | YES — exact new text, walked | — | — |
| Next week's peek | `ui/peek.ts` (its own renderer) | NOT TOUCHED — it never drew these words | — | — |

No MISSING row.

## 3. Sizing (D607, `../walk-ledger.md`)

1. **Type:** F (words) and E (the headings' layout changes as lines go), in a shared drawer (D).
2. **What only a walk could find:** that a heading which lost its "hide" still folds when pressed by a finger and a
   mouse; the board's bar at each size; the member's face; that no old word survives anywhere the page draws it (the
   words a person SEES, not markup).
3. **The ledger:** E/F changes walked by the host alone with an assertion script found the script's own errors more often
   than faults (the Quals row, the input defaults).
4. **The walk chosen:** the host alone, `scripts/handpass/words-r1-walk.mjs` on the built bundle, as assertions; 1440 × 900
   by mouse and 390 × 844 by touch; admin on Edit Schedule and the board, member on View-only Sched; every fold pressed
   both ways. Carried by tests instead: the read-only board panels and every day's bar (`src/ui/wordspass-r1.test.tsx`).
5. **Its row:** added to the ledger.

## 4. The walk

`node scripts/handpass/words-r1-walk.mjs` (v2) — **40 / 40 PASS**, no page errors, no console errors. Pictures:
`../img/handpass/2026-10-16-words-pass/walk/` (11), opened. v1 had 3 FAILs, all the script's own: the crew panel's counts
are drawn in capitals (its pattern was case-sensitive); the desktop board's issues bar is inert by design (the list is
always open there; it folds on a phone only — `interactions.ts`'s phone gate) — its check now reads the list.

**Found in passing, not a fault of this change:** "tap to review" on the desktop board told a scheduler to tap a bar that
does nothing there; it is gone with D940.

## 5. Cases carried by a test

| Case | Test | Proves |
|---|---|---|
| Every board panel, editable AND read-only, carries none of the old subtitles or how-tos | `src/ui/wordspass-r1.test.tsx` "no panel name carries…" | the words are absent from the drawn panels (both faces) |
| A folded / open Personal Inputs on the board | the same file | its count and ⌄; ⌃ open; the note's exact new words |
| No "tap to review" on any day's week bar or board bar | the same file | across all seven days |
| The week still matches the original app apart from the recorded differences | `src/ui/html.test.ts` (both parity tests, `noDwCue`) | the cue is the only change to the bar |
| SANS panels | `src/ui/sanscards.test.tsx` | no press-a-card hint on either face |

## 6. Break tests

Each old wording put back by hand, the new test run, the file restored from a copy (byte-compared):
the board's bar cue → 1 red; the week's bar cue → 1 red; a board subtitle and the note's dash → 2 red. All restored.

## 7. Not walked, and why

The SANS card's own press (code untouched); the read-only board faces (carried by the unit test); a phone on its side
(no layout rule of this change depends on it); other days (the same drawer draws every day — the unit test covers seven).

## 8. Gates

The whole set under the PC lock, one run: build clean · tfin 728 / 0 · unit 11506 / 11507 · e2e 824 passed, 3 failed, 59 skipped · smoke 446 / 0 · rulecheck OK · docsize OK. The four failures were older tests still reading the removed words (`warnmute-week.test.ts` expected "tap to review" after the count; `e2e/grouprow.spec.ts` looked for "show" to tell a folded heading) — each re-expressed (the caret instead), its file run alone: 11 / 11 and 5 / 5. Only test files changed after the run.

## 9. The fresh reads (the writing guide §1a test 9; D941)

- The removed-input note and the moved editing line, cold (round 1): every fact of the note came through (same words);
  the moved line lost its subject — relabelled, and then his ruling deleted it anyway (D938).
- His design lesson 1 and the guide's new paragraph (D941): five faults found (a reason added that he did not give,
  "never plain instructions" wider than his words, a filter option A did not have, an unclear pointer, a short-form line
  with nothing to refer to) — all five fixes taken word for word.
