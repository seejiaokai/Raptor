# Trial 1 — an Opus walker and a Sonnet walker on the same Rally scenarios (D588 (3), D480, D595) — 5 Oct 26

For the evidence sheet's §11 (`../2026-10-05-codex-stack-check.md`). Written by the host of the finding half; the next
chat folds it in and tells him the decision.

## How it was run
- **The build:** `raptor-port/dist-rallyold` — commit `786d2b2c`, the Rally build as it stood BEFORE its review fixes.
  Neither walker was told anything was wrong with it (`../../superpowers/briefs/2026-10-05-codex-stack-trial-note.md`:
  no evidence sheet, no other walker's files, no backlog, no git history).
- **The share:** twelve of the check's Rally scenarios — P2-06 to P2-13, P2-16, P2-17, H-01, H-05 — the same brief and
  the same note, word for word, for both; the Opus walker (`TO`, port 4226) first, the Sonnet walker (`TS`, port 4227)
  after it, never both at once.
- **Cut while running (D595 — "make a smaller comparison"):** the Sonnet walker's share was cut to seven scenarios. The
  message reached it late: it had already walked eleven of the twelve, so only P2-17 was not walked by it. The
  comparison below is on the eleven both walked.
- **What was in the build to catch** — the faults Claude's small review of 3 Oct 26 found in this very build
  (`../../superpowers/briefs/2026-10-03-codex-review-fixes.md`, R1–R3) and the two rulings made after it:

| Key | The known fault in `786d2b2c` |
|---|---|
| K1 | A timing pair out of order BLOCKS publishing and amending (the rule then, D502; reversed by D509) — so a fresh demo day cannot be published (R1) |
| K2 | The message says "brief", never "suggested brief", when the brief box is blank (fix B) |
| K3 | "+ In-time / Rally" fills in the take-off's own clock, not take-off less the Logic value, and is flagged at once (R2; D510) |
| K4 | Logic has no setting for the button's words (D511) |
| K5 | A previous-day reporting time prints with no day — on the line, the board's wave header, and as a negative rest figure in the crew-rest message (R3) |

## What each caught

| | Opus walker (TO) | Sonnet walker (TS) |
|---|---|---|
| K1 publishing blocked | CAUGHT — P2-10 FAIL, both the first publish and the amendment; and "the untouched demo Monday cannot be published" (P2-17) | CAUGHT — P2-10 FAIL, both doors; P2-17 not walked (the cut) |
| K2 no "suggested" | CAUGHT | CAUGHT |
| K3 the button's clock | CAUGHT — P2-08, P2-09, H-05 (H-05 judged FAIL) | CAUGHT — P2-08, H-05, and a fourth press on a fresh wave; listed as a finding, but H-05 marked RECORDED, not FAIL |
| K4 no words setting | CAUGHT | CAUGHT |
| K5 no day on a previous-day time | CAUGHT — the line and the board header show the bare clock (P2-07, H-01, H-05), written up as a finding | CAUGHT IN PART — "no day word" noted in the H-05 and H-01 rows, not raised as a finding; but it alone caught the negative rest figure ("only -0h05 rest") |
| Real faults off the key | "NaN min" in Insights for a person on a line with no times; "08.00" ignored without a word; an unreadable instruction explained only when the line has a take-off | "NaN min" (with a control that proved it is the missing take-off, not the text); "8" and "08.00" ignored; "RALLY AFTER IN TIME" with no in-time raises nothing |
| Correct remarks outside the share | the old build still shows "Discard marks" | the same; and that this build has no Insights button on the board and no phone ⋯ menu (true of that build) |
| False alarms | none | none |
| Verdict discipline | every scenario with an EXPECTED line judged PASS or FAIL; where a setup was refused it walked the nearest legal form and said so | two scenarios with an EXPECTED line (H-05, H-01) marked RECORDED instead of judged — the facts were right, the verdict was ducked |
| Pictures saved / opened | 136 / 136 | 117 / about 38 |
| Time | 54 minutes | 31 minutes (eleven scenarios) |
| Tokens | about 627,000 | about 446,000 |

**The allowance readings (his week · the 5-hour window).** Before the Opus walker 6% · 2%; after it 6% · 4%; after the
Sonnet walker 7% · 6%. They are NOT clean: the host answered him and wrote the handoff and a ruling inside both
windows, so the two points of each window cannot be split between walker and host. The token counts are the reliable
measure: the Sonnet walker used about 70% of the Opus walker's tokens, at Sonnet's lower price per token — on the 1 Oct
trial the same shape came to about half the cost.

## The decision (the agent's, D595)

*His word on it, the same night, when told: "ok so sonnet is good for this" — he agrees; no overrule.*

**Walking the app stays with Sonnet 5.5, for every walk, with no Opus walker beside it.** On a build with five known
faults the Sonnet walker caught all five that the Opus walker caught (one of them only in part, one of them better),
raised no false alarm, and found the same off-the-key fault ("NaN min") with a sharper control. Across the eight Sonnet
walkers of the main walk the same held: every reader's lead that was real was reproduced, and several real finds were
the walkers' own.

**Three conditions, each from a weakness seen tonight — they go into the walk brief:**
1. **The host opens the pictures behind every FAIL and behind every high-consequence PASS** (OIL, a published day, a
   role, saved data). A Sonnet walker opens about a third of its pictures whatever the brief says; an unopened picture
   is not evidence (anti-pattern 21), so the looking is the host's.
2. **A scenario with an EXPECTED line is judged PASS or FAIL.** "RECORDED" is only for the scenarios the host marks so.
   The brief says it in one line, and the host re-judges any RECORDED row that has an EXPECTED line.
3. **A walker's conclusion is not a finding until the host has reproduced it** — unchanged (D16), and needed: one
   walker inferred "Logic values are not kept across a reload" from a script that had pressed Reset first.
   And one housekeeping line: the report is sent ONCE, after every script and browser is stopped.

**What this does not open** (D588 (5), unchanged): Sonnet never reads code to find bugs, never decides whether a
finding is real, never writes a plan, a roll-call or a scenario list, and builds nothing but the one trial fix.

## Not learned from this trial
Whether a Sonnet walker designs a good fixture for a scenario it has not been handed step by step (every scenario here
was written out); a real phone; anything about its work on a walk of OIL figures beyond the main walk's P2-01 to P2-03,
which it recorded correctly.
