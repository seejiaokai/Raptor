# The fresh, blind Opus read of [RALLY-BOX-CHANGES] (19 Oct 26)

**Who reads:** one fresh Opus 5.5 that did not write this code and has not seen the chat that did (D790; no Fable — D903;
no ChatGPT reader while it is out — D761, so the job goes on `[NO-ASTRA-LIST]`). READ-ONLY: change no file, run no build
and no browser test (another process may hold the machine's check lock); `git`, reading and running single Vitest files
(`npx vitest run <file>` from `raptor-port/`) are fine.

**What to read:** the finished code — `git diff 4e93d0455..HEAD -- raptor-port/src raptor-port/e2e` on branch
`claude/rally-box-changes` — WITH the evidence sheet in hand: `raptor-port/docs/handpass/2026-10-19-rally-changes.md`
(the roll-call §3, the door check §4, the sizing §5, and the walk's results), the scenario designer's list
`raptor-port/docs/handpass/parts/rally-changes/scenarios.md`, and the walkers' reports `…/parts/rally-changes/walker-A.md`,
`walker-B.md`, `walker-C.md`.

**The rulings — copied from their FULL rows** (`grep -h '^| D10\(3[5-9]\|4[01]\) |' .claude/decisions-full/*.md`, and D1026,
D1030, D1032, D606, D592, D516, D24 the same way). In short:
- **D1038:** a tapped faint suggestion (a flying line's empty R or B) is placed NOT highlighted — in a typed time's colour,
  the caret after it — and the box wears the plain blue ring for about a second; the first key still replaces it (D1030).
- **D1039:** SC, AVALON and BB lines show no faint worked-out brief or rally; flying lines keep theirs.
- **D1040:** SC, AVALON and BB lines have their own R box — before / above B on the board, above START on the week and the
  next-week peek ("R / START").
- **D1041:** a rally typed on an SC MAIN line starts that crew's day as the SC in-time box (B) does — crew rest (the
  sentence says "rally"), the long day, work hours, OIL — the earlier of R and B counting; SC SPARE, AVALON and BB: shown,
  printed and exported only; an empty box counts nothing. Export and PDF carry the typed rally; a standby Brief column
  only where B was typed.

**WHAT IS NOT A FINDING (owner, D56):** a problem that lives ONLY in data already stored, when the code is correct going
forward — the demo data is cleared before the database. Do not report it. An older behaviour this change did not touch
(for example how SC's B box itself rolls an evening-before time) is reported only as "older, not this change", in one line.

**Read for ABSENCE as well as error:** a place that draws or reads a standby line's times, or SC's report, that the
roll-call does not list (search every reader of `scIntime`, `seatIntime`, `f.br` / `f.rl` on a standalone wave, `report`
on a shift event); every surface that draws a suggestion (`sugbox`) and whether it still gets the flash; the first-change
rule (`interactions.ts firstChange`) against every way text arrives — typing at the end, in the middle, a paste, a
Backspace, the phone's autocorrect, IME, a select-all then type, a box redrawn between the tap and the key; the flash's
timer against a redraw; Escape's restore after the flash; the crew-rest sentence's "rally" choice when R and B are equal,
one evening-before, or the SPARE badge flipped.

**A claim is a finding only with a concrete failure, its cause and its exact fix (D489).** Return ONE list: each finding
with severity (high / medium / low), the file and line, the failure in the app's terms (what a scheduler would see), the
cause, and the fix step by step. Then a short "Checked and fine" list. Under 2,000 words. Write it to
`raptor-port/docs/handpass/parts/rally-changes/read.md` (the one file you may create), and hand back a summary under 10
lines.
