# [APPROVALS-SCROLL-INSIDE] the PC build — the builder's final report, after the walk and the reads (13 Nov 26, 03:50, chat 67's night)

Saved by the night's coordinator as it arrived. Branch `claude/approvals-scroll-pc`, pull request 763, last code commit
`29f2ef0cb`; GitHub's runs on it read green by the coordinator at 03:50 (Docs guard, the full check, the Secrets scan).
The evidence sheet is `docs/handpass/2026-11-13-approvals-scroll-pc.md`; this file keeps the report's summary.

## What the app does now
- **On a PC** (wider than 700), Leave War → Approvals fills the screen and only the list scrolls. The title, the chips,
  Approve all and the column headings stay put. The card reaches the foot of the screen even when the list is short.
- **Fixes that came out of the walk and the reads** (rows 1–5 below): "Pick dates…" opens its calendar inside the
  scrolling list, at the top, and on a narrow window at the left too; pressing a chip, picking a new range or choosing
  another period shows the new list from its first request (pressing the first day of a range does not move the list);
  if the window is narrowed past the phone width and back with the calendar open, the calendar keeps the month he had
  moved to; on a narrow PC (700–1210 wide) the pinned headings cover the whole width of the lines.
- **On a phone** the page is exactly as before; measured identical to `main`.

## The Walk line
`Walk: docs/handpass/2026-11-13-approvals-scroll-pc.md · 334 pictures · 13 surfaces · 27 orders · MISSING: 2 fixed (the short window's calendar, the narrow PC's headings), 0 ruled, 0 filed`

## Findings and what was done with each
| # | Found by | Finding | Done |
|---|---|---|---|
| 1 | Walk W3 | On a short PC window the calendar was cut off by the card; at 560 tall days 19–31 could not be reached. | Fixed (`0a1802567`); the re-walk F1–F6 pass. |
| 2 | Astra (read-only; its browser could not start) | Crossing 700 wide with the calendar open reset it to January. | Fixed red-first: one wrapper at both widths, drawing nothing on a phone. |
| 3 | Fresh Opus F1 | Narrow PC: the lines leaked past the pinned headings' right end. | Fixed red-first; clear at 1000, 820 and 1280 wide; a new browser test at 1000 wide. |
| 4 | Fresh Opus F2 | A chip or another period kept the old scroll place, the new list's first requests hidden above the headings. | Fixed red-first; walk F7. |
| 5 | Narrow fresh-Opus read of the fixes | Narrow PC scrolled sideways: the calendar and a new list opened off to the left, out of sight. | Fixed red-first: the list also goes back to its left edge; walk F8. |
| 6 | Same read, minor | One frame drawn at the old place after a period change. | Fixed: the reset happens before the frame is drawn. |
| 7 | Same read | No test pinned the reset on a period change. | Test added. |
| 8 | Same read | Pressing the chip that is already lit jumps the list to the top. | Not changed: a re-press already starts the list afresh on `main` (its lit lines go). Older — for the coordinator to file. |
| 9 | Walk W2 | Approve all's left edge moves up to 6.8px with its count; its right edge stays. | The same on `main`; not this change. |
| 10 | Walk W7 | The ringed line from the clash link sits 1px clear of the card's foot fade. | In view as the ruling asks; no fault. |
| 11 | Walker, seen besides | At 560 tall the arrow keys inside the calendar move below the box without scrolling it. | The same on `main`. Older — for the coordinator to file. |
| 12 | Walker, seen besides | A name's puck tap does nothing on a PC; an empty range hides the headings. | Both the same on `main`. |
| 13 | Fresh Opus, not proven | If something above the page grew with no window resize, the page could become taller than the screen. | No case found; Balances has the same limit. |
| 14 | Host check | On a narrow PC the sideways scroll bar sits under the card's 28px fade. | Seen in a real window and still pressable; no fault. |
| 15 | Fresh Opus, tidiness | The fit-plus-body-class pair is repeated in both pages; `screenHeight` is exported but used only in its own file. | Filed, not fixed. |

Readers who ran: Astra, the fresh Opus reader, and a narrow fresh-Opus read of the logic fixes. Nothing went without
Astra's read.

## The drawing check against pictures 1–4
Green on the fixed build — 0 differences in all five states (`docs/img/handpass/2026-11-13-approvals-scroll-pc/drawcheck-fix2/report.md`);
red on `main` (5 differences, 4 states not reachable), so the check can fail. Its records were replayed from the
drawing script rather than read off the approved pictures; the replay differs from them only in the clock words,
checked by eye side by side.

## Pictures for him (under `docs/img/handpass/2026-11-13-approvals-scroll-pc/`)
- `walker-fix2/appr-a-f7-chip-All-1-pressed.png` — PC, a new list shown from its first request
- `walker-fix3/appr-a-f8-820-1-pick-open.png` — narrow PC, the calendar opened in sight after scrolling sideways
- `walker-fix2/appr-a-f7-cross-1-phone-width.png` — the calendar keeps March across the phone width
- `host-narrow-fix2/narrow-fix2-1000-at120-x200.png` — narrow PC, headings over the lines, scrolled sideways
- `host-narrow/narrow-fix1-1000-at120-x0.png` — the leak before the fix
- `host-narrow-fix2/sidebar-1000-real.png` — a real 125% window: the sideways scroll bar under the fade

## His looks (the sheet's §14)
On his PC at 125%, the wheel at the list's foot then straight back up. On his iPhone, a hard flick to the foot and back.

## Questions for him
None.

## Checks the builder ran
The six Approvals unit files 193 of 193; this job's browser tests 6 passed, 6 skipped by project; `npx tsc -b` clean;
`npm run lint:changed` no new finding (one kept with its reason in a disable comment: the period effect runs on the
period change only); re-runs on the fixed build — the PC fit check 73 of 73, the phone check identical to `main` in
WebKit and Chromium, the narrow-PC check clear.

## Traps met, and a note for the skill-notes log
- Every PC scenario of the first walk ran at 1536 wide or wider, so the narrow-PC faults (lesson 11's widths) were
  caught only by a code read: size the walk of a fitted page at a narrow PC width too.
- The first chip walk scrolled the "New" list (3 lines, cannot scroll) before pressing All — a script fault, fixed and re-run.
- The walker's scripts imported by absolute path; they are copied into `raptor-port/scripts/handpass/appr-walk/` with
  relative imports, so the evidence can be re-run.
- Untracked `docs/img/handpass/2026-10-12-one-rule/B/*` pictures sit in the checkout — not this job's, left alone.
