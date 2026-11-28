# Round 3's F wordings — the three new drafts as adjusted (a fresh Fable helper, 28 Nov 26)

The adjuster's read (his D2441) of drafts D1, D2 and D3 in `2026-11-28-round3-f-words-drafts.md`, by
`design-practices.md` §1, §1a, §1b and §9. This helper did not write them. No meaning is changed and no fact added;
where the code says something a draft does not, it is a finding at the end, not a silent fix. No cold read (§1a test 9)
was run here: the adjuster is not the cold reader. All three carry a reason or a rule, so each adjusted line still owes
one (§1b test 11). The box was not measured (§1a test 1): nothing here was run in the app.

Code read: `engine/warnhide.ts` hideKey, `engine/validate.ts` clashItem and every `clashItems(` call, `ui/html.ts` and
`ui/board.ts` (the ✕'s hover words, one place each), `ui/inputedit.tsx` commitInputEdit's and removeInput's refusals and
sharedRefusal, `ui/InputWindow.tsx` (the read-only line), `state/perms.ts` mayChangeInput, filedForOther, filerOf,
memberFilesForOthers, filerSwitchedOff.

## D1 — the ✕'s hover words on a hidden conflict between two schedule items

| Draft | Adjusted | Why |
|---|---|---|
| Hide this warning — it flags no puck and is not counted; it stays hidden while the same man is on the same two items, even if their times change | **Kept.** | Its first half is the built sibling's, word for word and mark for mark (the dash, the semicolon, no full stop), and that sibling stays on every other warning: a family keeps its marks, and a change to them is one change put to him, not made here (§1b test 9; test 2, "a wording he has ruled with a dash in it may stay"). Its second half is his approved F5 note's own clause, unchanged, so the hover and the note after the press say the same thing in the same words (§1 one name for one thing; §1b test 10). Every word is the app's: "warning", "Hide this warning", "puck", "man", "items" (the publish refusal's word). "Their times" can only be the two items' (one man, two items). One sentence, so no full stop (§1b test 4). True to the code: the hide is kept by the day, the rule, the man and the two items, never their times. |

## D2 — the refusal when a person tries to change a one-man input he may not change (a passing note)

| Draft | Adjusted | Why |
|---|---|---|
| Only Ace, Ranger (who filed it) or an admin can change this. | **Only Ace, Ranger (who filed it) or an admin can change this input** | Two changes. (1) The full stop goes: a passing note of one sentence takes none (§1b test 4), as every sibling note of this refusal is built ("Only Ranger — who filed it — or an admin can change this for everyone") and as his approved Delete line is written. The approved line with the full stop sits in the input's window, which is read as a line of the window. (2) "this" becomes "this input", one word longer (11 → 12 words; marked "longer", his to take). A passing note is read alone, with no window open around it, so the thing is named (§1a test 5); today's words name it ("your own inputs"); and it makes D2 and D3 one sentence with the verb changed, as a pair should be (§1b test 9), matching his approved "…can delete this input" and "…can move this input". No fact is added. If he prefers his window's words exactly, the line is "Only Ace, Ranger (who filed it) or an admin can change this". |
| Only Ace or an admin can change this. *(when Ace filed it himself)* | **Only Ace or an admin can change this input** | The same two changes, for the same reasons. |

## D3 — the same for deleting (a passing note)

| Draft | Adjusted | Why |
|---|---|---|
| Only Ace, Ranger (who filed it) or an admin can delete this input. | **Only Ace, Ranger (who filed it) or an admin can delete this input** | The full stop goes, nothing else: his approved F3 Delete line carries none, and a passing note of one sentence takes none (§1b test 4, test 9). |
| Only Ace or an admin can delete this input. *(when Ace filed it himself)* | **Only Ace or an admin can delete this input** | The same. |

Kept in all four lines: "Only … can" as every refusal of this kind starts (§1b test 9); the brackets, which say what
the name before them covers (§1b test 2); "change", not today's "edit", because his approved lines say "change" (§1 one
name for one thing); "an admin" (D785).

## Where the code disagrees with a draft

1. **D2, D3 — the filer may not always change or delete it.** The rule lets the man who filed it in only while "members
   may file for other people" is switched on, and only for a kind a member may file for others (the "other" kinds, never
   SANS availability, leave or medical). With the switch off, or on another kind, a filer who is not an admin is
   refused, and the draft would still name him as one who can. Told to Ranger himself it reads "Only Ace, Ranger (who
   filed it) or an admin can change this input" while he is Ranger. The inputs of several people already have the true
   line for this: "Filing for other people is switched off — an admin can change this." The same holds for his approved
   F3 lines in the window. The builder decides the condition; the words needed are the two-name line whenever the filer
   has no right of his own, and the switched-off line to the filer himself.
2. **D2, D3 — "when Ace filed it himself" is not the only case for the short line.** An input stored with no filer (filed
   before 7 Oct 26) has nobody to name, and a filer since deleted has no callsign to print (the several-people line
   falls back to "whoever filed it"). Both need the short line, "Only Ace or an admin can change this input".
3. **D2, D3 — who may delete is the same as who may change.** The code asks one rule for both; the drafts agree.
4. **D1 — the code keeps more than "Conflict" lines hidden by their two items.** The warnings that begin "Overlaps
   standby:" are kept by the same man and the same two items too, and one of them is a personal input against a standby
   line (not two schedule items). If those keep today's words ("…it comes back if the situation changes"), those words
   are untrue for them: moving the times does not bring them back. His D2855 names only the conflict between two
   schedule items, so which words the standby lines take is a question for him, not settled here.
5. **D1 — "two schedule items" in the code includes an input placed on the programme.** A conflict between a flight and
   a ground row that came from an input is kept by its two items; a conflict with an input that is not on the programme
   is told apart by its words, as D2018 says. The new hover words are true wherever the warning carries its two items,
   so the build should choose the words by that, not by the warning's heading.

## After the cold read

Three lines came back from the cold read (`2026-11-28-round3-f-words-coldread-fable.md`, the host's comparison in
`…-coldread-compare.md`). His approved round-3 words (D2856) are the starting point; the fewest words are changed and no
meaning. Each changed line goes back to him before it is built (D2856), and takes a cold read of its own (§1a test 9).

| Line | Approved words | Adjusted | Why |
|---|---|---|---|
| F2 | Earned off the published schedule. Change the schedule and publish the day again, and the OIL follows. | **Earned off the published schedule. Change the schedule and publish the day again, and the OIL changes to match.** — longer, 17 → 19 words | "Follows" was read two ways: the OIL changes to match, or it arrives afterwards. "Changes to match" is the writer's own listed fact for this line, word for word, and can be read only one way (§1a test 9; §1b: every fact first, then short). Swapped: "follows" → "changes to match". Nothing else touched. "Follows the schedule" was weighed and left: F7 would then need "follows that input", and the two cards would stop ending alike (§1b test 9). |
| F7 | Earned off a duty input that was accepted. Change that input and publish the day again, and the OIL follows. | **Earned off a duty input that was accepted. Change that input and publish the day again, and the OIL changes to match.** — longer, 20 → 22 words | The same swap for the same reason; the two cards stay one sentence with its source changed (§1b test 9). |
| F6 | On the working copy an input closes the man for the hours it covers, from the moment it is filed. SANS availability and an upchit close nothing, nor does an input a scheduler takes off the programme, cancels (CX) or marks information only. | **On the working copy an input closes the hours it covers for the man it is for, as soon as it is filed. SANS availability and an upchit close nothing, nor does an input a scheduler rejects, cancels (CX) or marks Info only.** — longer in the first sentence (19 → 22 words), shorter in the second (23 → 20) | Four changes, one for each second reading. (1) "the man" → "the man it is for": the reader could not tell the man it is for from the man who filed it (§1a test 5, a named thing is not left vague); "closes the hours it covers", as the check's own name says ("An input closes its hours"). (2) "from the moment it is filed" → "as soon as it is filed": "from" let the closed time be read as starting at the moment of filing; "as soon as" says only that it closes at once. (3) "takes off the programme" → "rejects": the button reads Reject, and one thing has one name (§1; §1b test 10). Checked in the code, below: the button covers exactly the cases that close nothing, and the old description covered fewer. (4) "information only" → "Info only", the button's own words with its capital, as "(CX)" names its button (§1; the word list's line). |

What the code says about F6's two button words (read: `engine/inputs.ts` inputFlags, inputDormant, inputSilent;
`engine/slots.ts` unacceptInput, the only place an input is set aside; `ui/html.ts`, the Reject button;
`ui/board-html.ts`, the CX and ⓘ buttons; `ui/logic-html.ts`, the line as built today):

- **Reject is the exact word, and truer than the approved one.** An input closes nothing in this way only after
  Reject is pressed on it, and every press of Reject does that. Reject is offered on an input on the ground programme
  ("Take its row off the ground programme") and also on one under Unavailable, an overseas duty included ("Take it back
  out of Unavailable, into Personal Inputs"). "Takes off the programme" did not cover the second case, which closes
  nothing all the same.
- **Info only is the exact word.** The ⓘ button's hover words begin "Info only", and the mark it sets is the one the
  rule reads. The app also says "information only" in three built sentences elsewhere (two names on screen); making
  those match is a change of its own for him, not made here.
- **Not checked here:** whether "the OIL changes to match" in F2 and F7 is what the app does. It is the writer's listed
  fact, taken as given.
- **One thing "the man it is for" leaves loose:** an input for several people closes each of them. The sentence reads
  true for that case, and naming it would add words his approved line does not have.

## Round 3 of F6

The second cold read (`2026-11-28-round3-f-words-coldread2-fable.md`) left F2 and F7 standing and sent F6 back on two
points: "closes the hours" is no phrase of the app and read two ways (the man is taken in those hours, or the hours are
locked), and "nor does an input a scheduler rejects…" read as "never closed" where the input stops closing. This is the
last round (design rounds are capped). The check's name on the page, "An input closes its hours", stays.

| Approved words (round 3, D2856) | Adjusted | Why |
|---|---|---|
| On the working copy an input closes the man for the hours it covers, from the moment it is filed. SANS availability and an upchit close nothing, nor does an input a scheduler takes off the programme, cancels (CX) or marks information only. | **On the working copy the man an input is for counts as taken for the hours it covers, as soon as it is filed. SANS availability and an upchit take nobody's hours. Once a scheduler rejects an input, cancels it (CX) or marks it Info only, it stops taking the man's hours.** — longer, 42 → 52 words, his to take | (1) "closes the man" → "the man an input is for counts as taken": the line now says in everyday words what the check's name means, so the name above it is explained and not repeated (§1b test 5, everyday words; §1 one name for one thing — "closes" stays the name's word alone). "Taken" is the reader's own word for the first reading. (2) "from the moment" → "as soon as", as in the last round. (3) The exceptions are split in two, because they are two different facts: two kinds that never take hours, and three acts after which an input stops. "Once … it stops" is the link read from the code (§1b test 2: the link is a fact, not guessed). (4) "rejects" and "Info only" are the buttons' own words, as in the last round. Text read as prose on the Logic page, so each sentence ends with a full stop (§1b test 4). |

The facts it was written to carry:

1. It is true on the working copy.
2. An input makes the man it is for count as taken (not the man who filed it).
3. Only for the hours the input covers.
4. At once, when the input is filed; nobody has to accept it first.
5. SANS availability never takes anybody's hours.
6. An upchit never takes anybody's hours.
7. An input that a scheduler rejects stops taking the man's hours from then on.
8. The same when a scheduler cancels it (CX).
9. The same when a scheduler marks it Info only.

What was checked in the code (`engine/inputs.ts` inputFlags, inputDormant, inputSilent; `engine/events.ts`, which asks
the same three on every day's read; `engine/slots.ts` unacceptInput): each of the three is a mark on the input that the
checks read afresh every time, so the input counts from filing, stops the moment the mark is set, and counts again when
the mark comes off (Accept, the CX button pressed again, the ⓘ button pressed again). The line does not say "counts
again": his approved words do not, and it would be a tenth fact. "Counts as taken" is this adjuster's plain wording of
"closes": in the code it means the man is checked against the rules for those hours and the crew list reads him as
committed; whether a press is refused or only warned is said by the checks listed under it on the Logic page, not here.
