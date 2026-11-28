# Evidence sheet — the Leave War's Approve and Refuse: the decided one reads plainly as picked ([LW-DECIDE-LOOK])

His D2880 ("Doesn't feel like approved is selected"), D2881 ("A, solid + cyan ring", 28 Nov 26), D2921 ("4:1", 28 Nov 26 —
no tick or cross on Approvals' phone line). Branch `claude/lw-decide-look-197`, pull request 861. Drawing of record
`docs/mock/2026-11-27-decide-buttons/img/trio-E3-*`. Chats 196 (build, walk, reads, fix round 1) and 197 (the red gate,
D2921's change and its re-walk, this sheet). Pictures: `docs/img/handpass/2026-11-28-lw-decide-look/`. The walkers' and
readers' own reports, whole: `docs/handpass/parts/lw-decide-look/`.

## The eight answers and the tier

The change touches a drawer shared by four places (one look across the bid window, the day's list, the picked-days sheet
and Approvals), no saved data, no money, no permissions, no published record. What a button does is unchanged; only how
it looks. Tier: **WALK** — a shared drawer drawn in four places, at two sizes. LOOK would not cover the keyboard and the
narrow phones, where the faults were.

## Roll-call — every place the app draws a deciding pair

| Place | Has it | Desktop 1536 | Phone 402 | Phone 390 | Phone 360 | PC at 125% | Proved by |
|---|---|---|---|---|---|---|---|
| The one-day bid window | ring, grey, tick and cross | walked | walked | walked | walked (11px mark) | — | `litdecide.test.tsx`; `e2e/decidelook-leavewar.spec.ts` (360, 402) |
| The day's list | ring, grey, tick and cross | walked | walked | walked | walked (11px mark) | — | `litdecide.test.tsx`; the e2e spec (360, 402) |
| The picked-days sheet (drag window) | ring, grey, tick and cross; a mixed or empty range unlit | walked | walked (Chromium touch) | — | — | — | `selectsheet.test.tsx` |
| Approvals — desktop | ring, grey, tick and cross, 100 wide | walked | — | — | — | walked | `m4page.test.tsx` D2881; the e2e spec (1536) |
| Approvals — phone | ring, grey, **no tick or cross (D2921)** | — | walked (re-walk 2) | walked (re-walk 2) | walked (re-walk 2) | — | `m4page.test.tsx` D2921; the e2e spec (390) |
| Approvals' slim bar door to the grid | the grid's window, same look | walked | walked | — | — | — | the walk (DOORS) |
| The whole-leave window ("All n days") | the same look | walked | walked | — | — | — | the walk (WHOLE) |
| A member's own windows | must not: no Approve or Refuse at all, because only an admin decides | walked | walked | — | — | — | the walk (MEMBER); unchanged from `main` |
| A held Approve (a medical or leave holds the day) | greyed and not pressable, the grey at 45% | walked | walked | — | — | — | the walk (HELD) — for his look below |
| Grant OIL, "Give FO", Auto-approve | must not wear the mark or ring, because they are not decisions | walked | walked | — | — | — | the walk (SWEEP) |

No MISSING row.

## The five sizing lines (§7.0)

- **Type of change:** one shared look across four places (a drawer), with keyboard rings.
- **Scenarios:** Astra 22 and a fresh, blind Fable 25, each blind to the other, combined by the host to 47 cases.
- **Walkers:** one Opus walker on the built bundle against `main` side by side, then two re-walks of the fixes.
- **Sizes:** Chromium 1536×864; WebKit 402, 390 and 360 (iPhone 13 profile, touch); Chromium at 125% (his PC);
  Chromium 1100 wide; Chromium touch 402 for the hold-and-drag.
- **Why that size:** four places and the keyboard, at his phone's width and narrower, where room is tightest.

## What was walked, and what it found

The first walk (`parts/lw-decide-look/lwdl-walk-report.md`): 47 cases, **3 FAIL**, the rest PASS or the same as `main`.

| Found | Seen | Disposition |
|---|---|---|
| 1. The keyboard on a decided button showed nothing; the grey one got the browser's white ring (bid window, day's list) | `KEY-desk-1-key-on-lit`, `KEY-desk-2-key-on-grey`; `main/KEY-desk-1-key-on-lit` | Fixed in round 1: the decided one with the keys wears one 3px ring; the grey one the app's cyan ring on its own edge. Re-walked PASS (`rw1-KEY-*`, `fix1-window-keys-*`) |
| 2. On Approvals two buttons both looked decided under the keyboard | `AP-C-desk-C2-key-on-grey-zoom`; `main/AP-C-desk-C2-key-on-grey-zoom` | Fixed in round 1, the same rule. Re-walked PASS (`rw1-KEY-desk-A*`, `fix1-approvals-keys-*`) |
| 3. Approvals at 360 wide: rows grew to 45 tall | `AP-G-p360-G-approved`; `main/AP-G-p360-G-approved` | His D2921: no tick or cross on Approvals' phone line. Re-walk 2 PASS: the row 78 tall as before (`rw2-APPR-p360-*`) |
| GitHub's narrow-PC check failed on the first build (Approvals' Refuse past the headings at 1000 wide) | `rw1-NARROWPC-*` | Fixed in round 1 (desktop Approvals back to 100 wide). Absent on the fix and on `main` |
| "Approved" past the button's edge at 360 and 375 wide (the fresh Opus read) | `rw1-NARROW-*` | Fixed in round 1: under 380 wide the mark is 11px with a 3px gap, a named departure from the drawing's 12px (his look below) |
| GitHub's one red unit test on 6f8f0c0c6, "the event window's Save: the second tap opens no window behind it" | the run's log | Not a fault of this change: a test whose tap took past 1 s on a busy runner. Fixed in the tests (testkit `atOneMoment`), red first with a slow clock. GitHub green on 510714a5e |

**Re-walk 2 (chat 197, D2921, `scripts/handpass/lwdl-rw2.mjs`):** at 402, 390 and 360, on Approvals: no tick or cross
anywhere on the list; the half-day date "23 Jan AM ›" one line at 402 and 390 and two at 360, as on `main`; the row 78 tall
in every state; Approve tapped → "Approved", ringed, Refuse grey; Refuse tapped → the other way round; a second tap → back to
waiting; neither button's edge moves under the finger; no sideways scroll. Desktop: the list keeps its 22 marks, Approve
lit with its tick. The bid window on a phone keeps its tick and cross. "28 May PM ›" at 402: one line (it was two with the
tick — `rw2-may/rw1-MAY-p402-may-line`). Four sizes, every check PASS.

## Cases carried by a test

| Test | What it proves |
|---|---|
| `src/leavewar/ui/litdecide.test.tsx` | In the bid window and the day's list: the decided one carries the ring class, the other the grey class; marks drawn, never typed glyphs |
| `src/leavewar/m4page.test.tsx` "D2881 …" | On Approvals (desktop): waiting marks, the ring, the grey, a second tap back to pending, the line staying put |
| `src/leavewar/m4page.test.tsx` "D2921 …" | On a phone (the war's 700px query stood up): no mark in either button, waiting or decided; the ring and the grey stay. Red before the change |
| `src/leavewar/ui/selectsheet.test.tsx` | A picked range stays unlit |
| `e2e/decidelook-leavewar.spec.ts` (4 tests) | In a real browser: the ring 2px, 3px with the keys, one ring only; the grey one's ring on its own edge; marks and words inside the edge at 360 and 402; Approvals 100 wide at 1536; **at 390 Approvals with no mark, a half-day date on one line, the decided one ringed** |
| `src/leavewar/ui/doubletap*.test.tsx` (3 files, 74 tests) | A tap in these tests is one moment on the clock; the new slow-machine test failed with GitHub's words before the fix |

## Break tests

The D2921 unit test was red before its change (a mark found on a phone). The slow-machine test was red before the testkit
helper. Fix round 1's browser spec was red on 35674d625 and green on 6c602adc7.

## Errors seen

None on any walked page: no page errors, no console errors, no failed requests (the walk driver records all three).

## What was NOT walked, and why

- Delete armed beside Refuse in the day's list: a bid's Delete there deletes at once, so nothing is ever armed — the same on `main`.
- The 375 window pictures in fix round 1 were measured, not saved.
- His iPhone's own letters: every phone check ran in WebKit on Windows; his phone may draw slightly wider letters.

## Gates

GitHub's run on 510714a5e: every check green (the leave war unit shard that failed before included). On his PC: the touched
test files (`m4page`, `apprscroll`, `litdecide`: 62 passed; the three double-tap files: 74 passed), the browser spec
(4 passed, under the checks lock), the build, the code check (no new finding), the document check.

## For his look

1. The keyboard on the grey button is told apart by its ring on its own edge and its grey fill; on the decided one the ring
   goes from 2px to 3px — subtle.
2. A held Approve (a medical holds the day) now shows faded grey; on `main` it showed faded green
   (`HELD-vs-grey-p402`, `HELD-vs-grey-desk`).
3. On phones under 380 wide the window's tick and cross are 11px, not the drawing's 12px, so "Approved" stays inside the edge.

## Reads

Astra and a fresh, blind Opus read the first build (`parts/lw-decide-look/lwdl-read-astra.md`, `lwdl-read-opus.md`); both
found the keyboard ring (fixed), Astra the desktop Approvals width (fixed), the Opus reader the 360 overflow (fixed). Fable's
scenario design ran beside Astra's. Tidiness notes, filed, not fixed: `dec-off` reads as "disabled" (a better name:
`dec-muted`); the full look is described again in several comments where the shared helper already says it.
