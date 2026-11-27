# [OIL-LATER-PASSES-ON] — the finished code's read (chat 210, 28 Nov 26)

CODE READ — blind, read-only. You are one of several readers; you will not see the others' reports. Do not read
HANDOFF.md, the evidence sheet `raptor-port/docs/handpass/2026-11-28-oil-later.md`, any walk picture or results, or any
file under `raptor-port/docs/superpowers/briefs/` other than this one. Change no file in the repo; a proof test you write
goes in your own scratch folder, never under `raptor-port/src`.

## The change
Repo: the folder you are given, branch `claude/oil-later-209`; the change is `git diff main...HEAD -- raptor-port/src`
(three commits). Read the changed functions whole and what they call: `src/engine/publish.ts` (currentBindNow,
pendingKey / pendingKeyOf / pendingKeyAtSign, pdBoundOk, oilAnsBoundOk, signBoundOk, oilRvBoundOk, oilDelta, signRoleOk,
signShown, publishALDay), `src/engine/oilev.ts` (oilSignKey, oilAnsKept, oilAnsAtSign, oilEvidenceKey, insSeg,
projectOilInputs), `src/ui/oilsign.ts` (signPick, writeSign, holdSave, holdLater, holdIsLast, holdCanSign),
`src/ui/OilDayList.tsx` (footSaid and the foot), and every writer of an input's OIL answer (`grep -n "\.oil = "` under
`src/ui`). Area rulings: `.claude/rules/decisions/oil.md`, `.claude/rules/decisions/scheduler.md` (the sign-off lines);
full rows by `grep -h '^| D2869 |' .claude/decisions-full/*.md` (the newest rows may be missing from this copy — the
text below is authoritative for them).

## The owner's rulings it builds (copied from the full rows)
- **D2800:** Later on a day's OIL list means "not my call": each next press of any of the day's four sign-off boxes
  opens the list again until someone answers; an OIL answer does not clear the names already signed; Save with rows
  left unpicked leaves them as Later does.
- **D2801:** an OIL answer leaves the names whether given on the sign-off list, the input's own "OIL?" sign or a bell
  line.
- **D2868:** "On a published day too, the answer to an OIL question that stood open when the names were signed leaves
  them signed; the day still shows the change waiting until the amendment is published." Narrows D103 ("any change that
  shows as pending wipes the sign-offs") and AM11 for that one answer.
- **D2869:** "An OIL answer changed after a name was signed clears the names signed over it; only the answer to a
  question that stood open when they signed leaves them." The door does not matter.
- **D2859, D2867 — the foot:** none picked "Later: Ace signs, and the next sign-off asks again"; some (not all) picked
  "Save: the next sign-off asks the rest"; last of the four boxes, none picked "Later: Ace signs, and OIL stays
  unanswered for now"; last box, some picked "Save: the rest stays unanswered for now"; every row picked, no line.
- Still in force: any other change on a published day wipes the names, and putting it back restores them (D103, AM11);
  a Logic-page value that moves OIL the names were signed over clears them (D592 (4)); ✕ and Escape sign nothing
  (D2299); a missing time refuses first ([END-TIME-GUARD]).
- **The builder's readings (rule each supported / contradicted / the owner's to decide):** (a) an open-at-signing
  question answered and then changed again before anyone re-signs leaves those names; (b) Save writes the answers before
  the held name, so the last signer's own answer is one his name was signed over; (c) an answer taken away (Undo, or
  cleared) counts as changed; (d) publishing an amendment re-bases the day, so names given before it never stand over a
  later change.

## Not a finding (D56)
A problem that lives only in data already stored (a signature from an older build reading unsigned once) is not a
finding. Only harm to new data is.

## What to hand back
Ask what is MISSING as much as what is wrong: a door that writes an answer another way, a reader of the binding that
was not updated, a published-day path where the copy of the comparison disagrees with the count, a place where the
kept answers are lost (saving, loading, a plan switch, Undo, a week stash, an export), the Logic check, cost on every
repaint. For each finding: the concrete steps in the app, what the screen shows, the cause (file and function), the
fix, and its severity. State each finding the moment it is confirmed. End with a list of the builder's readings
(a)–(d), each ruled, and a short tidiness note (three questions of the changed lines: is anything duplicated, named
unclearly, or longer than it needs to be — filed, not fixed).
