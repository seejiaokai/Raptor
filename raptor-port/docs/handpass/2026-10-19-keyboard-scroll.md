# [KEYBOARD-SCROLL] with D1080 — the WALK bug check (19 Oct 26)

Branch `claude/keyboard-scroll`, cut from `claude/rally-box-changes` (pull request 541, his D1047's one-tap time boxes —
not yet live). Two changes, one check (D485):
- **D1048** — on a phone, a box tapped to type in that the keyboard would cover is scrolled to sit just above the
  keyboard (`src/ui/kbscroll.ts`, installed once from `main.tsx`): the box's own scrolling panels, nearest first, then the
  page; in a window that cannot scroll, the window itself is raised and put back after.
- **D1080** — his answer to the four places pictured for him (the artifact "One tap, then type", pictures
  `docs/img/handpass/2026-10-19-keyboard-scroll/look/`): one tap then typing replaces in the duty and wave templates'
  time boxes, the Leave War's numbers, the SANS and late cut-off numbers and the Logic page's settings, through D1047's
  own `interactions.ts armFreshTime`.

## Questions waiting for him
None.

## 1. The eight questions and the tier
1. Money (OIL) — NO: no OIL arithmetic or record changes; the Leave War's OIL figure boxes save what the box shows, by
   their own unchanged save; only how the first key edits the box's text changes, and the box shows it before any save.
2. The published record — NO: nothing touches publishing, amendments or an issued copy.
3. Saved data — NO: no stored field, key or reader; each screen saves through its own unchanged path.
4. A shared drawer — YES in kind: one behaviour that must hold on every surface that has a box to type in (D1048 "every
   box in the app"), and D1080's on four screens' boxes.
5. A new gesture or mode — YES: the first key after a tap replaces (D1080); the screen moves when the keys come up (D1048).
6. A new surface — NO.
7. Roles — NO with a reason: who may type in each box is each screen's own unchanged gate; the new code arms only a box
   that is shown, enabled and not read-only.
8. The warning list — NO.
**Tier: WALK.**

## 2. Rulings swept (every one that applies)
D1048 (this job), D1047 (the one-tap time boxes, reused), D1080 (four more places), D1038 (the first change read by the
browser's kind of change), D686 (a finger on a window never scrolls the page behind it), D997 / D995 / D706 (a window on
a phone stands in the middle, as tall as its content), D537 (the day panels at the foot), the board following the
visible screen with a keyboard up (`SchedBoard.tsx`, his 25 Sep 26 report), the Leave War sheets' own keyboard anchoring
(31 Aug 26, `leavewar/ui/Sheet.tsx`), D991 (motion as smooth as the phone allows — the lift is instant, measured once the
keys are up), D487 (no button changes size), D853 / D921 (pictures with every question — the look page).

## 3. The roll-call
THE THING: a box to type in on a phone (D1048), and the boxes of the four places (D1080). Columns: **Lifted** — is the
box brought above a stand-in keyboard; **One tap** — does a tap then typing replace (D1080 places only; the schedule's
time boxes are D1047's, unchanged); **Over the same pixels** — what else moves the same thing.

| Surface | Lifted | One tap | Over the same pixels |
|---|---|---|---|
| (filled during the walk) | | | |

## 4. Door check
(filled during the walk)

## 5. Sizing the walk (D607 — the five lines)
1. **The type of change:** C (a new behaviour on a press and when the keys come up) and E (the screen moves — what
   scrolls, what rises), on every surface with a box to type in (D1048 "every box in the app"), and C on the four places
   of D1080.
2. **What only a walk could find here:** a surface whose box sits in something that neither scrolls nor is a plain page
   (a window whose rows all fit — the host's own browser test found one, Admin → Duty templates); a surface that moves
   itself for a keyboard too (the board, the Leave War's sheets) and could fight the lift; a React box whose state does
   not take the replaced value (found by the host's test, red first); a place the list of classes misses or catches too
   much (the Logic page's words setting). The tests carry the arithmetic (`kbscroll.test.ts`, 16) and the arming
   (`freshbox.test.tsx`, 15); five browser tests (KS1–KS5) cover the board, a page, a window, a box in sight, and three
   of the four places.
3. **What the ledger says:** the recent C / E walks (13–19 Oct 26) ran one to four Sonnet walkers at a desktop and a
   phone; the scripted host-alone walks of 18 Oct 26 found their faults at small cost; the rally walks found five faults
   in the change, most of them about presses on a phone.
4. **The walk chosen:** two Sonnet walkers in parallel on one frozen build (the brief:
   `docs/superpowers/briefs/2026-10-19-keyboard-scroll-walkers.md`). A — 17 surfaces at a phone with a stand-in
   keyboard, the phone on its side once, six orders, two break tests; B — the four places at a desktop by mouse and a
   phone by finger, five steps each, a member, the schedule's time box as a regression, two break tests. The arithmetic
   of how far a box moves is carried by `kbscroll.test.ts` (it calls the measuring function directly — not a proof that
   the screen offers the route, which the walk gives).
5. **After the walk:** its row in `docs/walk-ledger.md` — (filled at the close).

## 6. Orders
(filled during the walk)

## 7. Cases carried by a test
(filled)

## 8. Break tests
(filled)

## 9. Errors seen
(filled)

## 10. What was NOT walked, and why
- **WebKit — his iPhone's own browser — is not walked.** Chromium cannot raise an iPhone keyboard; the walk stands a
  stand-in visual viewport in for it (the way of `scripts/handpass/am/b3-03-keyboard.mjs`). How Safari itself pans the
  page when the keys come up, and how its keyboard's word-suggestion bar resizes the screen, only his iPhone can show —
  his look card.

## 11. The gates
(filled)

## 12. The code read
(filled)

## 13. What the walk found, and each disposition
(filled)

## 14. His look card
(filled)
