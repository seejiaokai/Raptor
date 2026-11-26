**The set is not ready for “all as recommended.”** It contains wrong app facts, conflicting recommendations, and changes to earlier decisions that are presented as small fixes.

This was a read-only review of the questions, reviewed wording, chat answers and try-out source. I checked the full ruling rows, including the named branches, and relevant code on this branch and the available `origin/main`. I did not refresh those references, run tests or check the rendered pictures in a browser. Source paths below are relative to `raptor-port/`.

1. **Small point 15 and chat message 4 — the account advice misses newer decisions.**

   Faulty words: **“only a master admin gives Plan of another squadron”** and **“if the control is ever drawn, an admin of the man's own squadron may move his sign-in too.”**

   D2626 on `origin/claude/msq-b1-screens-135` records **“ok as recommended”**: a squadron’s **own admins or a master admin** may give and remove its Plan access; a Plan holder cannot pass it on. That branch’s D2730, Admin → Users Q12, already approves the refused re-link wording **“Only 149's own admins or a master admin…”**. This is the account ruling on that branch, not the unrelated local D2730.

   The current restriction in `src/state/accounts.ts`, `relinkRightsProblem`, explains the old behaviour; it does not override those newer decisions. Re-linking drops the account’s other-squadron grants in `updateAccount`. Calling this **“carries no rights”** is also too broad: the code separately retains or recalculates the account’s role.

   **Correction:** explain the approved change and distinguish the man’s home squadron from the squadron whose Plan access would be removed. Do not recommend that any home admin may remove another squadron’s Plan merely by re-linking the sign-in. Drop the obsolete master-only question.

2. **D, the try-out and small point 1 — the AMT exemption rests on an incomplete fact.**

   Faulty words: **“The app already knows when both end”** and **“counting them would block a routine day for two times nobody types today.”**

   `src/engine/events.ts` calculates the stated AMT brief/debrief windows for their particular checks. But people placed directly on those rows also receive ordinary sim events, whose missing ends use the sim-length setting. `src/engine/oil.ts`, in the sim rows of `dayOilWork`, requires an actual start and end; it does not use those special brief/debrief windows.

   Thus the app does not use one known end consistently for everything. This matters for conflicts, work spans and OIL. Nor does the demo establish what people routinely type.

   The try-out widens the proposed exception further: `items()` marks those rows `never`, exempting missing **starts as well as ends**, although D asks only about ends.

   **Correction:** put the actual trade-off: “Should these two rows be exempt from typing an end, although their direct assignments do not currently use the brief/debrief end for every check and for OIL?” Settle whether starts remain compulsory. Small point 1 and chat message 2 must retain this exception when claiming that missing-end OIL cases disappear after the guard ships.

3. **Small point 9 — this changes an earlier decision, and its description is too broad.**

   Faulty words: **“Make the day's figures read him free too, so one screen gives one answer. A small build.”**

   D1120 records the owner’s request that standby crew **“should not be faded as they are available to be planned.”** Its full row expressly leaves the day’s figures and Leave War unchanged. D2614’s later **“all as recommended”** changes ALL AVAIL/ALL membership and its OIL; it does not change those day figures.

   The code also distinguishes kinds of standby: `src/engine/avail.ts`, `dayEngaged`, already excludes SC SPARE from the ordinary tasked count, while other standby rows are excluded when the crew-list option is used.

   **Correction:** ask explicitly whether to replace the earlier treatment of the day figures. Name the affected standby kinds. Do not present this as an automatic consequence of the ALL AVAIL answer.

4. **Small point 17 — the proposed “fix” includes reversing an approved arrangement.**

   Faulty words: **“The Leave War's Available rows and SANS group … Read by the day, as every other screen now does.”**

   D321 records **“as recommended”** for moving the **whole Leave War row into the SANS group, earlier months included**. D2313’s full row also preserves the Leave War row’s grouping while introducing date-based SANS readings elsewhere. `src/leavewar/state/raptorRoster.ts` projects the current SANS flag into the roster.

   A whole person-row’s group and a particular day’s availability count are different decisions. Combining them risks changing an approved layout under the name of correcting counts.

   **Correction:** separate the dated counts/calendar behaviour from the whole-row grouping. Keep the approved grouping unless the owner explicitly chooses to change it.

5. **H, I3, chat message 1 and try-out switch 2 — there is no single recommendation.**

   The page recommends **“Yes, every row.”** The chat recommends **“yes when a person or name is on the row.”** The try-out defaults to `b: 'never'` and ignores the named dinner when nobody is assigned.

   Moreover, **“name”** is ambiguous: the dinner has an event name, but the try-out checks people, not that title.

   H also says **“One case could not be checked here: an input a member files with a start and no end.”** This is checkable and already refused. `src/ui/inputedit.tsx`, `normalizeInputDraft`, requires both times or All day, on this branch and `origin/main`.

   **Correction:** choose one recommendation across all three artifacts. If assignments are intended, say “a named person, ALL or ALL AVAIL,” and distinguish an event title from a person’s name. Replace the member-input speculation with the existing refusal.

6. **I and I1 — the explanation overstates what stops working without a start.**

   Faulty words: **“Nothing”**, **“raises no warning at all”**, **“The only thing flagged … leave or grounded for the whole day”**, and **“with no start it checks nothing.”**

   `src/engine/validate.ts` still checks ordinary flight seat qualifications and relevant crew requirements without requiring a take-off time. Sim seat checks likewise survive missing times. The app also retains whole-day absence checks. D1993 expressly retains the consecutive-day count for a row without times.

   **Correction:** say that a missing start prevents checks needing a time window and prevents timed work/OIL calculations; it does not switch off every check.

   I1 separately says an Attach **“lands on the Ground Programme.”** D1374, **“All as recommended,”** places Attach under **Unavailable** automatically. `src/engine/inputs.ts`, `landsUnavail`, implements that; the try-out itself uses Unavailable.

   **Correction:** use the correct destination. The recommendation to exempt genuine all-day inputs remains sound.

7. **E7 and F2 — the other OIL card’s behaviour is known now.**

   Faulty words: **“Whether that OIL also waits for the day to be published again was not checked. Check it when F2 is built.”**

   `src/leavewar/sync.ts`, `creditFrom` and the published-day collection, derive both schedule-earned and input-earned credit from the published snapshot’s OIL evidence. This remains true on `origin/main`.

   Leaving the input card untouched would preserve the same missing publication step that F2 fixes on the schedule card.

   **Correction:** include both cards now. The input version should tell the reader to change the input and publish the day again. F2’s schedule-card wording has no separate finding.

8. **E6 — an agent’s reading is attributed to the owner.**

   Faulty words: **“Your ruling on that list has each answer stamped with who gave it.”**

   D782’s owner words request a consolidated list with individual answers and Yes/No to all. The stamp appears under **“The agent’s readings, to confirm on the picture.”** That row does not establish the attribution made here.

   `src/ui/oilday.ts`, `saveOilDay`, changes the input’s OIL answer and general change stamp; it does not keep a separate durable answerer record. The backlog already records the proposed work.

   **Correction:** say: “The earlier agent proposed keeping who answered; that proposal needs confirmation.” F1 can still use the truthful, actor-neutral wording without waiting for that decision.

9. **F6 and the reviewed wording — “Every input” remains false.**

   Faulty words: **“Every input closes the man for the hours it covers, from the moment it is filed.”**

   `src/engine/events.ts`, `inpShow`, explicitly excludes SANS availability and Upchits. SANS availability offers hours; an Upchit records restored fitness. The same function also reads the published filing state when checking the published face, so a new filing does not universally change that face immediately. D179’s **“freeze everything for now”**, with its recorded later exceptions, matters here.

   **Correction:** describe inputs that block time in the **working plan**, and retain the removed, cancelled and information-only exceptions. Do not approve the revised sentence as fully true while its opening still covers every input and every schedule face.

10. **J, C, E11–E12 and try-out switch 3 — the colour choices need reconciling.**

   J1 says **“Red, as you ruled, softened by point E12”** and **“A box is never red while the scheduler is still in its row.”** E12 recommends the opposite: immediate red, with waiting until leaving the row only a possible later change. D2613’s **“all as recommended”** establishes immediate red while drafting.

   J2 correctly declares that grey changes that decision. But the chat also recommends **“C … as drawn”** and all E points, leaving incompatible instructions together. E11 describes only a red mark although J2 introduces a grey one.

   The try-out additionally defaults to `c: 'red'`: a missing time on a published day’s working copy becomes red immediately. J2 does not state that exception. Preventing an incomplete amendment from being published does not, by itself, decide when its draft turns red.

   **Correction:** present one combined choice covering ordinary drafts and amendments, then update C, E11 and E12 accordingly. Label immediate red on an amendment as a recommendation requiring an answer.

11. **Small point 19 and chat message 3 — distinguish retained records from new filings.**

   Faulty words: **“the wording isn't built yet”** and **“every day is checked for every man … the offer doesn't save.”**

   The trimming and explanatory note are already implemented in `src/ui/inputedit.tsx`, `sansRunTrim` and `sansCut`, on this branch and `origin/main`. D2394 approves the note’s words.

   `sansRefusal` deliberately permits days already held for that person in an existing SANS record; it checks newly added days. The unqualified refusal claim hides precisely the retained-record case behind small point 19.

   There is also a real policy question: D2341’s approved choice is **“Yes, hidden”**, with the full row saying **“hidden on every screen and in every count, as if deleted.”** Keeping the person visibly named in the editing window is an exception to that wording. “The window counts nothing” does not settle it, and preserving stored membership does not inherently require displaying it as an ordinary active participant.

   **Correction:** report the trim as built, limit the refusal explanation to new people/days, and explicitly ask whether the editor may show retained inactive participants, preferably marked as inactive.

12. **A — the recommendation omits how long “not asked again” lasts.**

   Faulty words: **“The rows left unpicked are not asked again at the other boxes.”**

   That describes the uninterrupted session. `src/ui/oilsign.ts` stores the suppression in `OILSIGN_LATER`; `src/ui/pops.ts` defines an in-memory map and resets it with session state. Reloading also loses it. New unanswered inputs are not covered by the old suppression.

   D2294 records **“Later asks no more that day.”** The page asks about partial Save but leaves this separate interpretation unstated.

   **Correction:** keep the partial-Save question, but disclose the current lifetime and ask whether deferral should survive reload/sign-in and apply across schedulers. Do not promise day-long suppression without that qualification.

13. **G, E1 and the try-out — the offered behaviour and demonstration differ.**

   - G promises **“a second tap to the next”** missing box. The try-out always selects `missingBoxes().boxes[0]`. Make it cycle, or state that it demonstrates only jumping to the first.
   - E1 says making greyed Publish respond **“is the only way Publish can say it.”** G itself offers the persistent count beside Publish. Present the clickable refusal as an additional choice, not the only solution.
   - E3 requires a **TBD** landing to remain marked and counted. The try-out’s `normTime` rejects TBD and restores the previous value. It does not demonstrate that case.
   - E5 specifies **“AL1 was not published.”** The try-out’s `refuse` always ends the publication refusal with **“Thursday was not published.”** Match the offered amendment wording.
   - D2734 already records **“yeah as recommended”** for the Board’s shortened missing-time/sign-off line. Carry that settled part forward; keep any remaining navigation choice separate.

   These are discrepancies in the demonstration’s behaviour, not faults confined to demo data.

14. **I/D — one scope question is missing.**

   The set offers **“any row with a person or a name on it”** without settling cancelled or information-only rows. The app deliberately excludes those rows from relevant work/conflict calculations: see `src/engine/events.ts` and `src/engine/oil.ts`. The try-out’s `items()` has no corresponding exclusion.

   **Correction:** explicitly ask whether a cancelled or information-only row can prevent signing/publication. Recommend exempting them if the guard is intended to require usable times for active work. Do not silently decide this during implementation.

15. **B and small point 7 — remove the stale pending decisions.**

   B is answered by D2617: **“b as recommended”**, expressly accepting immediate LATE-mark changes without pending changes or lost signatures. Drop its choices, including the third option. The outstanding View-only check is verification work, not a reason to ask B again.

   Small point 7 says **“That drawing is being checked.”** D2217 records **“Yes. All outstanding questions as recommended”** and approves the master’s Show buttons. D2198 records the default-on home squadron and default-off others, with the switch interpretation taken into that drawing. The subsequent bell drawings also have approvals. Replace the pending-check wording with the checked outcome; no new answer is needed for the stated recommendation.

The remaining item statuses are:

| Item | Result |
|---|---|
| I2, I3 | **No finding** in their proposed treatment; resolve “name” consistently as noted under H. |
| K | **No finding** in recommending no outline on View-only Sched. |
| E2, E4, E8, E9, E10 | **No finding.** |
| E3, E5 | **No finding** in the proposed rule/wording; the try-out discrepancies are listed above. |
| F1, F3, F4, F5 | **No finding**, retaining E8’s permission condition and E10’s schedule-to-schedule scope. |
| Small 2, 3, 4, 6, 8, 10, 11, 12, 13, 14, 16, 18 | **No finding** in the stated recommendations. |
| Small 5 | **No finding** for the initial unfiled-availability reminder. D2588–D2590 concern a different event: changing or deleting availability after being planned. |
| Reviewed wording document | Findings under E7/F2, F6 and the time-rule reconciliation apply. No additional finding in its other reviewed sentences; its declared cold reads remain outstanding. |

**Verdict:** K, I2–I3, E2–E5, E8–E10, F1 and F3–F5, and the small points marked “no finding” can stand within their stated scope. I, J, C, G, D, H, A, E1, E6–E7, E11–E12, F2’s coverage, F6, small points 1, 9, 15, 17 and 19, and the associated chat/try-out explanations must be corrected before collective approval. Drop B and small point 7’s stale pending check, and carry the Board line already approved in D2734 as settled. Do not seek another blanket “all as recommended” answer until the recommendations agree and the missing scope questions are explicit.

Rulings: none. No files changed, committed or pushed.

