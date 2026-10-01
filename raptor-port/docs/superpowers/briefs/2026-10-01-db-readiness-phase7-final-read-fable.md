# Fable's final code read — [DB-READINESS] group A phase 7 (1 Oct 26)

*(Saved from Fable's final message — a Fable 5.1 agent, read-only, the code at commit 11274558; brief
`2026-10-01-db-readiness-phase7-final-read-brief.md`. Blind to Astra's read. Its findings and fix instructions verbatim;
its long list of what it read is shortened to the first paragraph.)*

Read in full: the brief, the plan, the evidence sheet and all three walkers' reports, the whole non-test diff,
`engine/oilev.ts`, `engine/oil.ts`, `ui/AvailWindow.tsx`, the live bodies of `validate.ts`, `slots.ts`, `oilmode.ts`,
`html.ts`, `events.ts`, `overlay.ts`, `state/holderbase.ts`, `inputedit.tsx`, `pendlist.ts`, `publish.ts`,
`leavewar/sync.ts`, `inputs.ts`, the three list readers, the Leave War's manning-rule reader / writer, the new tests, the
rulings files and the full rows of D18, D25, D27, D31, D33, D37, D43, D44, D46, D47, D48, D52, D54, D56, D360, D468, D470.

## VERDICT: REVISE

Nothing this change's own lines do moves OIL wrongly on new data, and the crowd / sim / padding / reader work is sound. One
older rule that D470 makes consequential silently removes a man's earned leave through an ordinary member action
(finding 1). Two low findings beside it. Fix 1, re-walk its two scenarios, and this is approvable.

## FINDINGS (ranked)

### F1 — MEDIUM — a member's edit of his own request silently wipes the scheduler's man (or placeholder) out of the row's NAME BOX, and the OIL he earned under D470 goes with it
**Where:** `raptor-port/src/engine/overlay.ts` rule 6 (`Object.assign(row, requestRowFields(r)); row.srcv = sv`), with
`requestRowFields` (`who: inp.person`). Consequence made real by `engine/oilev.ts` (`add(row.who)`).
**New or older:** older code (phase 6 (c); and the relink rule before it) that D470 has just made consequential: before this
change the man in the box earned nothing, so losing him cost a scheduling fact only; now it costs a credit. The placeholder
face of it is older still (D46) and reachable since 6 (c).
**Scenario A (D470's own door):** Saturday. Ranger files a Training request 08:00–16:00, answers Yes; it lands. The
scheduler drags Blade onto the row's name box. OIL Earn: Blade FO, Ranger FO on his card. Ranger then edits his request on
the Inputs page — remarks, or the times, any field `srcvOf` hashes. After the command the view is re-derived; `row.srcv !==
srcvOf(r)` → rule 6 re-makes the row from the request → `who` = Ranger. Blade is gone from the row, from OIL Earn and from
any credit a later publish would land; no history line, no toast. On a published day the working copy reads pending "who:
Blade → Ranger" with nothing saying why, and the scheduler who republishes to carry the member's remark change takes
Blade's day in lieu away. The holder base's own `requestAddMarks` already treats "a man of his in the name box" as the
scheduler's change — rule 6 contradicts that the moment the request changes.
**Scenario B (older, same cause):** ALL AVAIL dragged into the name box of a Training request on a Saturday (44 men earning,
D46). Ranger edits his remarks → the placeholder is wiped, 44 credits-to-be vanish from the working copy, no line anywhere.
**What should happen:** the name box is the scheduler's when it holds someone other than the holder (a named man under D470,
a placeholder under D46) and survives a request edit exactly as the extras do. A former holder still in the box after a
hand-over must still give way to the new holder.
**Fix:** in rule 6, build the request's fields, and drop `who` from them when the box holds someone who is not the request's
person, is not a former holder (`r.leftAt[w]`), and is a placeholder or a person on the roster; then assign. Tests, red
first, in `engine/oilnamebox.test.ts`, driving `viewOfWeek` after changing the request: the man in the box survives the
member's own edit (and still earns); a placeholder in the box survives it too; a former holder gives way. Re-walk A2 + a
remarks edit, and C33-N1 + a remarks edit, on an unpublished and a published Saturday; the published one must read pending
for the member's change only.

### F2 — LOW — the ALL AVAIL window's EARN half keeps a stale inert reason after an edit behind the window
**Where:** `ui/AvailWindow.tsx` — `setAvailFoot(why)` with no id on the inert branch, and the `foot` expression
(`AVAILWIN_FOOTID && !oil ? … : AVAILWIN_FOOT`).
**Scenario:** Saturday, Personal row with ALL AVAIL, OIL Earn on, window open on "Who earns OIL" (0 of 44), tap Ranger → foot
"Ranger — a personal request earns no OIL". Leave the window open, retype the request to Training. The window redraws "43 of
43", Ranger's puck says "earns a full day"; the foot still says "Ranger — a personal request earns no OIL".
**Fix:** pass the id on the inert branch; when the earn half's foot carries an id and the man is still listed, re-say his
inert reason if he is still inert, else drop to the half's own hint; a switch's own sentence carries no id and stays.

### F3 — LOW — the changes window names a REQUEST row's crowd change "A placeholder · who it stands for", with no row name and no jump (roll-call miss)
**Where:** `ui/pendlist.ts` `rowByItem` — it resolves `r:<rid>` items only; an `i:<iid>` item returns null → "A placeholder".
**New or older:** older for Training rows; this change makes Personal rows reach it too.
**Scenario:** published Saturday, Personal (or Training) row with ALL AVAIL. The scheduler deletes a sortie on the working
copy → its crew JOIN the crowd. The pending list shows a line "A placeholder · who it stands for … Bane, Stiff" that names no
row and cannot be tapped.
**Fix:** at the top of `rowByItem`, resolve an `i:` item to the day's ground row whose `src` is that request (not `kept`):
its `prog` as the name, its `g:` / `gr:` keys for the jump. Test beside the pending-list tests.

## EXPLICIT NEGATIVES — the eight questions (each "checked and found nothing wrong")
1. **The Personal crowd loop** — writes `sent[i:<iid>]` only; no credit path exists (`oilEarnedWork`'s input half iterates
   `ev.inputs`, its schedule half skips every `src` row); `spanDefault` / `itemState` / `oilEligible` read inert; the keys
   carry and strip the crowd correctly; the conditions mirror the asking loop; every reader of `ev.sent` copes.
2. **SIMW** — reset, written, snapped and restored with the official pass, never written by the phantom Monday pass; the two
   sentences byte-identical to the strings they replaced; ground crew exempt; nothing still asks the flight half only.
3. **pax / more writers** — every writer pads or appends; no reader relied on a hole.
4. **The empty-list readers and the counter limit** — every consumer works with an empty list; no fourth reader of the same
   shape; one constant at both ends, a rework at 60 allowed.
5. **carriedRemark** — the typist's words are never cut (every box caps at 200; only the app's own date tail takes it over).
6. **On-screen pay / money** — none left; every remaining hit is a comment.
7. **D470 / landedExtras** — the holder is never gathered; his own No is never buried; nobody is credited from a row he is
   not on; the hand-over cases are consistent. Caveat: F1. **D56 over D48: read the same way** — the database-era rule
   change will need D48's marker, nothing to build now.
8. **The foot** — the who half is right in every state; the earn half: F2.

## ROLL-CALL GAPS
1. The request row's NAME BOX after the member's own edit — never walked with a man or a placeholder in it. F1.
2. The changes window's line for a request row's crowd change not caused by an input. F3.
3. The earn half's foot after a retype behind the open window. F2.
4. The window's "One man is flagged" count now includes sim flags — walked (B14) but not a row of §6.1; add it.
