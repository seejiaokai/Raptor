# Each kind its own colour — the bug check (24 Oct 26)

Branch `claude/lw-m3-placing-leave` (pull request 569). [INPUT-COLOURS]: his D1309, D1316 (set C), D1322 / D1323 (an OIL taken
chartreuse, apart from FO / HO), D1304 / D1321 (the Inputs month's bars in the war's colours; duties outlined). Built 458a7f549.

**The eight questions (§5):** money NO (colour only — what is counted is unchanged); published record NO; saved data NO; a
shared drawer YES (one set of colours drawn by every box, button, Legend swatch and bar); a new control NO; a new surface NO;
roles NO; the warning list NO. **Tier: WALK** — no code read owed (§5's table).

## The roll-call — every place that draws a kind's colour

| Place | Reads | Shows it | Proved |
|---|---|---|---|
| The grid's boxes (`MatrixRows.tsx`) | `kindOf` → `.c.k-*` | YES | walk C2, both sizes |
| The Legend (`Chrome.tsx LegBox`) | the same classes; two OIL lines now | YES | walk C1 |
| The bid windows' leave buttons (`LeaveButtons.tsx`) | `.tchip.lv.k-*` | YES | walk C3 |
| The day's list's boxes (`BidBits.tsx EntryBox`) | `kindOf` → `.c.k-*` | YES — the same classes | `round3.test.tsx`, `daylist.test.tsx` (classes); the colour is the class's (C2) |
| The day panel's Away lines (`LeaveLine.tsx`) | `kindOf` → `.c.k-*` | YES — the same classes | the class carries the colour (C2) |
| The stored row pictures (`__rows__`) | the grid's markup | `k-oil` → `k-oilt` on an OIL taken's box only — proved line by line | `matrix-rows.test.tsx` |
| The Inputs month's bars (`InputsCal.tsx`, `inputscal-model.ts colourOf`) | `kd k-*` / `duty` → `--k-*` | YES — absences filled, an upchit medical (as drawn), a duty outlined, a timed bar a tint (D729) | walk C4; `inputscal-model.test.ts` |

One home for the numbers: `--k-*` in `scheduler/00-foundation-login.css`; nothing else holds them.

## Sizing (§7.0)

Type D (one set of colours drawn by several places) and E (look). Only a walk sees a painted colour: the unit tests see the
classes. Chosen: the host alone, one scripted walk (`scripts/handpass/lw-colours-walk.mjs`) reading each place's COMPUTED
colour against his numbers at 402 × 874 and 1440 × 900 — four scenarios a size.

## The walk

Build 458a7f549, frozen, served at 4343; pictures `docs/img/handpass/2026-10-24-lw-colours-check/`. **PASS 10 of 10:** C1 the
Legend (every kind; "OIL taken: time off spent" and "OIL given: FO a day, HO half a day" apart); C2 the grid (an OIL taken
`rgba(170, 230, 40, .3)`, an FO `rgba(70, 196, 108, .38)`, a course `rgba(160, 100, 240, .36)`, an overseas duty
`rgba(128, 142, 160, .58)`, a medical `rgba(238, 82, 82, .3)`); C3 the bid window's buttons; C4 the Inputs month (each absence
filled at .40, an overseas duty at .58, a duty outlined, a timed one a tint); no errors at either size. The script's first run
found no bars — it had not reached November (its own); the month's own arrow driven, it passed.

**GitHub's run** of e89c68b48 and 836901e05 failed three browser tests written to the colours before this change: the
Raptor-owned OIL compared with FO's green (now an OIL taken is its own kind — the test compares it with an OIL taken
approved on the war itself), the tap list's afternoon OIL looked for as FO's kind, and an all-day Inputs bar expected to
have no edge (now ringed in its kind, D1321 — the test tells a timed bar by its left edge and fainter fill). The app was
right; the tests were rewritten to the approved colours (4874739fb, 5 / 5 at both sizes).

**Not walked:** the unforeseen absence's teal (D1325) — its kind arrives with round 2; the colour is in the one set already.
**Readings to put to him:** an upchit's bar is medical red, as his approved drawing painted it, though an upchit is not an
absence; the Legend keeps "a star, the app credited it" on the OIL given line (D1306), which the drawing left out.

`Walk: docs/handpass/2026-10-24-lw-colours.md · 8 pictures · 7 places · 4 scenarios × 2 sizes · MISSING: none`
