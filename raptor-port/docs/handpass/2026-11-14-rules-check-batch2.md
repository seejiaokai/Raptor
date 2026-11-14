# The rules check's small batch — the bug check (chat 80, 15 Nov 26)

`[RULES-CHECK-FIXES]`'s small batch, branch `claude/rules-check-batch2`, draft pull request 779. The plan:
`docs/superpowers/plans/2026-11-14-rules-check-batch2-plan.md`. What reaches a person:
1. **D2009** — the check names "On leave + flying" / "Downchit + flying" become "On leave + planned" / "Downchit + planned"
   (`engine/validate.ts` `WCODE`, built `8c3afe200`).
2. **D2010** — the crew-rest line where the last flight had no landing typed (blank, or "TBD" since D1990) reads "Mon took
   off 12:00 with no landing typed, +2h debrief assumed → ended 14:00 → crew rest clear at 02:00", never "landed" (built
   `8c3afe200`).
3. **D2015** — the Logic page's note under the changed-settings strip: "A published day keeps the settings it was published
   under, and the OIL they gave it, until it is published again. If a changed OIL setting would change that OIL, the day
   reads pending." (two cold reads; his to change).
4. **D2014 / D2044** — records only: nothing of OIL built; comments in `oil.ts`, `oilev.ts`, `faceattrs.ts`, `publish.ts`.
5. **D2024** — the project guide's "no rule versioning" corrected (a working-guide change; read by Astra and a fresh Opus
   reader on 15 Nov 26, part 5's log).

Pictures: `docs/img/handpass/2026-11-14-rules-check-batch2/`. Walk scripts: `scripts/handpass/rcb2/`.

## 1. The eight answers and the tier

| # | Question | Answer, and why |
|---|---|---|
| 1 | Money | NO — nothing that works out OIL changed: part 4 is comments only (`oil.ts`, `oilev.ts`, `faceattrs.ts`, `publish.ts`); the note is words. The OIL Saturday across a "Full day of OIL" change is still walked (his look card owes its pictures, D853) |
| 2 | The published record | YES, read and walked rather than answered NO: a published day draws its frozen warnings by their code and message (`publish.ts` `warnSliceKey`), with the check's NAME read live from `WCODE` — so a published day shows the new name and nothing compared moves (the name is not stored); the crew-rest line is live on the face (`validate.ts` `LIVE_ON_FACE`: CREW_REST, CREW_TIGHT — D183, D184), never stored or compared. Expected: no published day reads pending from this batch — walked |
| 3 | Saved data | NO — nothing stored changes shape or value; the name is not stored, the crew-rest message is not frozen |
| 4 | A shared drawer | YES — one label (`WCODE`) read by four builders (the warning list, the board, Insights, the Logic page); one message built once, shown wherever the CREW_REST warning shows |
| 5 | A new gesture or mode | NO — no control added |
| 6 | A new surface | NO — nothing new on screen |
| 7 | Roles | NO — who may see or do anything is unchanged (the note's "Only an admin can change them." untouched) |
| 8 | The warning list | YES — what two checks are called, and what the crew-rest warning says |

**Tier: FULL** (YES to 2 and 8). One check for the batch, sized by its riskiest part (D485).

## 2. The rulings swept (each checked on the running build)

D2009, D2010, D2015, D2014 (answered by D2044), D2044, D2024; and what they touch: D1990 (a "TBD" landing is a blank one for
crew rest), D1786 (a day with nothing entered starts at take-off less the default rally), D592 (4) (a published day keeps the
OIL it went out with; a change reads pending), D186 (the printed B), D2005 / D2013 (a published day is checked by the settings
it was published under; once anything waits, by today's), D183 / D184 (the crew-rest marks live on a published day), D103
(the four sign-offs fall on a pending change), D928 (the strip's old untrue words), D56, D785.

**The host's reading of D2009, stated in the sheet as the plan asked:** the label is read in four places, not only the Logic
page. D2009's rule is "one name, true on every row", so the warning list's heading, the board's list and Insights' count
print the new name too — the same fix; the day's own message ("On leave but tasked — BRIEFING") stays, as its reading says.

| Ruling | What the running build must do | Pass / fail — seen in |
|---|---|---|
| D2009 | "On leave + planned" / "Downchit + planned" on every surface that names the check | |
| D2010 | the crew-rest line says "took off … with no landing typed" for a blank and a "TBD" landing; "landed" where a landing is typed | |
| D1990 | a "TBD" landing ends the day as a blank one does | |
| D2015 | the note's words as built, on the Logic page, admin and member | |
| D2044 / D592 (4) | a published earning weekend: "Full day of OIL" changed → "1 pending", sign-offs gone, the OIL credited unchanged until republished | |
| D2005 / D2013 | a published day nothing waits on keeps its own flags; the batch makes no published day pending | |
| D183 / D184 | the crew-rest line on a published day is today's, with the new words | |
| D186 | the printed B unchanged | |

## 3. The roll-call

**(a) The check's name — `WCODE.LEAVE_FLY` / `WCODE.DNIF_FLY` (`wlbl(WCODE[code])`).** Old words searched one by one, uncapped
(`+ flying`, `flying'`): app code — only `validate.ts`; tests — `official-flags.test.ts` (an assertion's own message, not
the label — left); the IT flow guide's captions — `scripts/itflow/content.mjs`, MISSING, corrected here, the deck's pictures
filed under `[ITFLOW-OIL-RESHOOT]` (D403).

| Surface | SHOWS the new name | USABLE (the warning's tap: lights the crew) | PAINTED beside it | Seen in |
|---|---|---|---|---|
| Edit Schedule's warning list (`html.ts` ~1201) | | | | |
| the warning list's hidden (struck) line (`html.ts` ~1221) | | | | |
| View-only Sched / the published face's list (`html.ts` ~2606, with its severity word) | | | | |
| the Scheduler Board's list (`board.ts` ~515 — `w.msg` first, so the name only where no message) | | | | |
| Insights' count by type (`insights-html.ts` ~56) | | | | |
| the Logic page's check line (`logic-html.ts` `lgChkName`) | | | | |
| a member's View-only Sched | | | | |
| phone width (402) of each | | | | |
| the IT flow guide's captions | MISSING → corrected in its source; pictures wait (D403) | — | — | `content.mjs` |

**(b) The crew-rest line — `validate.ts` ~659, the one message for CREW_REST (and its "Crew rest breach — …" form).**
Shown wherever that warning is shown; the previous day can be inside the week, the week before (`weekctx.ts`, a published
or working week), or the phantom pass over next week's Monday.

| Where the line shows / how the previous day is reached | SHOWS "took off … with no landing typed" (blank) | the same ("TBD") | "landed" kept where a landing is typed | PAINTED beside it | Seen in |
|---|---|---|---|---|---|
| Edit Schedule's warning list, previous day in the same week | | | | | |
| the same, previous day in the week before (Monday's line) | | | | | |
| the next-week peek / phantom Monday (the crew-rest pass over next Monday) | | | | | |
| the dotted "breaks tomorrow's crew rest" mark's title / ⓘ on the previous day | | | | | |
| the Scheduler Board's list | | | | | |
| View-only Sched (a published day — live on the face, D183/D184) | | | | | |
| the "Crew rest breach — … but" form (`crMsg`) | | | | | |
| a flying SC line or a duty input as the previous commitment ("ended", no "landed" — untouched) | | | | | |
| phone width (402) | | | | | |

**(c) The Logic page's note (`LogicPage.tsx` `#lgOff`).**

| Surface | SHOWS the new words | USABLE (Reset to standard still clears it) | PAINTED beside it | Seen in |
|---|---|---|---|---|
| Logic page, admin, one setting changed ("setting … it") | | | | |
| the same, two settings changed ("settings … them") | | | | |
| Logic page, member ("Only an admin can change them.") | | | | |
| phone width (402) | | | | |

**(d) Part 4 — nothing built; the as-built OIL Saturday walked for his look card (D2044, D853).**

| Surface | What it must show after "Full day of OIL" is changed | Seen in |
|---|---|---|
| the published earning weekend's day — the pending count ("1 pending") | | |
| the four sign-offs | | |
| the pending list's line | | |
| OIL Earn on the working copy | | |
| the Leave War's credit for the man | | |
| after republishing | | |

## 4. The five sizing lines (§7.0)

1. **Type:** A (one message built once — the crew-rest line, `validate.ts`), D (one label read by four builders — the
   warning list, the board, Insights, the Logic page — each by its own code), F (the Logic page's note, words only). Not G:
   nothing of the publish path changed (part 4 is comments), but the as-built OIL Saturday is walked for his look card.
2. **What only a walk could find here:** whether each of the four builders actually prints the new name on screen (the
   board prints the warning's own message first, so whether the name shows there at all), in a published day's face and a
   member's view, at a phone's width (a longer word: "planned" is one letter longer than "flying" — a cut or a wrap in a
   narrow list); whether the crew-rest line's new words reach the previous week's Monday and the next-week peek, which are
   built through other routes into the same pass (`weekctx.ts`); whether a published day reads pending from this batch;
   the note's two lengths (one setting / several) on a phone. The tests already carry the words themselves (blank, "TBD",
   typed) in the calculation (`rulescheck-batch2.test.ts`, `logic.test.tsx`) — calling the calculation, not the screen.
3. **What the ledger says:** walks of type A and D on the scheduler's warning words (the rules check's fixes, 12 Nov 26:
   654 pictures, 17 surfaces, 3 MISSING fixed; the published day's settings, 409 pictures, 2 MISSING fixed, 2 filed) found
   their faults on the surfaces drawn by their own builders — a heading reading today's limit, a title — not in the shared
   calculation; one Sonnet walker per world was enough for a change of this size.
4. **The walk chosen (chat 80's sizing; chat B may resize on evidence, §7.0):** ONE Sonnet 5.5 walker on the frozen
   build of app commit `cc2eefa50` (served from its own folder, never rebuilt under it), desktop 1536 Chromium and iPhone
   402 × 874 WebKit by touch; Astra's 14 scenarios in his order (1–5 and 7–10 at both sizes; 6, 11, 12, 14 desktop with one
   phone look each at the deciding screen) and the plain-user round at both sizes; a picture after each step and within
   ~100ms of each phone tap. Sizes beyond the required: none — the note and the longer names are judged at 402 (the
   narrowest he uses). Carried by a test, not walked again: the words for each landing kind in the calculation
   (`rulescheck-batch2.test.ts` — it calls the validator directly, so the screens are walked); the note's two grammars
   (`logic.test.tsx` — renders the page; both sizes walked once). Every lesson of the checklist's list gone through in the
   walker's brief (chat B), each with its scenario or why it cannot apply.
5. **After the walk:** _(its row in `docs/walk-ledger.md`)_

## 5. The scenarios (designed by Astra)

Astra's report, whole: `docs/superpowers/briefs/2026-11-15-rules-check-batch2-scenarios.md` — 14 ranked scenarios, the
plain-user round (8 steps, each opened window closed every way it offers), explicit negatives, no new question for him.
**His roll-call gaps, added to §3 as rows (a)–(d) below, each to be walked:**
- **(a) the name:** the day-details window from the day's `?` (`html.ts` ~2544/2606, `Modals.tsx`) — its own row; the
  sheet's "~2606" row is that window, not the ordinary View-only list; the ~1221 row is the struck "goes away once signed"
  line, NOT the hidden line (a hidden warning is the ordinary row, subdued) — both walked; the current and older published
  version's eye (👁), week and board; the Logic page's search ("planned") and its fired / severity filters.
- **(b) the crew-rest line:** the amber "Tight turning" (`validate.ts` ~720/733 — the same tail; a red breach does not
  exercise it); the ALL / ALL AVAIL window's per-person reason and its title (`html.ts` ~891, `AvailWindow.tsx`); the
  previous day's full "Breaks Tuesday" explanation apart from the puck's short title (`html.ts` ~1048/1118 vs ~476 —
  the title need not repeat the sentence, only never say "landed" for a borrowed take-off); the peek row split in three —
  Sunday's forward explanation, the desktop next-week preview (plain tasking by design, D1010), loaded Monday's warning.
- **(c)** the pending list's lines and the hide / restore notes use the warning's own message — read, no heading required.
- **(d) OIL outside the board:** the published puck's OIL mark and title, the current version's eye, the Leave War's
  credited entry and the OIL balance — all must agree on what was credited.
**His corrections to the expectations, taken:** the board prints the warning's own message first, so "On leave but tasked —
BRIEFING" there is right, no heading added (D2009's reading); the next-week preview, a picker's short reason and the
puck's short title need not carry the full sentence — only agree with it.
**One wording question for his look (Astra's §5):** a change of the default rally or the debrief that moves a man's worked
times but leaves his OIL the same (FO → FO) still reads pending (D592 reading (8)) — does the note's "If a changed OIL
setting would change that OIL" explain that? The walk's picture of that case (scenario 12 B) goes on his look card.

## 6. The orders walked — what the screen said

## 7. Cases carried by a test

| Claim | Test | What it proves | Through the real controls, or the calculation directly |
|---|---|---|---|
| the two names | `engine/rulescheck-batch2.test.ts` | | |
| the crew-rest words, blank and TBD | `engine/rulescheck-batch2.test.ts` | | |
| the note's words | `ui/logic.test.tsx` | | |

## 8. The break tests

## 9. Errors seen

## 10. What was NOT walked, and why

## 11. The reads (Astra; a fresh, blind Opus reader)

## 12. What the walk and the reads found, and each disposition

## 13. The gates

## 14. His look card
