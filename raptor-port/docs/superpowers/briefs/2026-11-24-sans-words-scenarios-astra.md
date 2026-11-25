Read-only review complete. No files changed; no app, tests or build run. These are **expected walks of the future build**, not findings against this pre-build copy.

Use a fresh setup for each independent variant. Unless stated otherwise, set the browser clock to **Wed 15 Jul 26**, load the demo week **Mon 13 Jul**, and use Saber (`ad`) and Ranger (`us`). Give Hex a member sign-in through **Admin → Users** where required.

Run every scenario at **desktop 1536** and **iPhone 402**. The expected results below apply to both. On desktop, check the bell beneath its button; on iPhone, check its full-width panel. Titles, dates, actor names and bodies must wrap without clipping; the last line and **Mark all read** must remain reachable.

For postings, use **Leave War → Ranger’s day → ⋯ → Post out → PO from → SANS → Post out**. Change an existing posting through its **PO from** field; it commits immediately. Its removal button is **Undo post out (PO)**.

“Planned” below means actually named on the programme—not merely an unaccepted input. Use **Edit Schedule** and the person’s crew puck on a programme row; remove that puck to remove the engagement. Ensure no other engagement still names him that day.

1. **S1 — Date later, then back; filed and read.**  
   **State:** Ranger SANS from Fri 17, availability filed Fri 17–Sat 18, and a read reminder for unfiled Mon 20/Thu 23.  
   **Press:** Saber changes **PO from** to Sat 18; inspect as Ranger; Saber changes it back to Fri 17.  
   **Expected:** Fri 17 hides, Sat 18 stays. Ranger gets “Your SANS date moved to Sat 18 Jul. · Saber” and A’s exact Fri 17 hidden-day body. No struck reminder. Returning to Fri 17 restores the filing and its counts automatically; no sentence still claims it is hidden. Saber receives no notification of his own action. Repeat with several days hidden by the later move.

2. **S2 — Different days, unchanged count.**  
   **State:** Ranger has read his reminder for Sat 18 and Mon 20.  
   **Press:** Saber removes Ranger’s last Sat 18 engagement, then plans him on Thu 23. Inspect after each action.  
   **Expected:** Removing Sat 18 leaves the reminder read. Adding Thu 23 makes it unread and lights his bell, although the final count is still two. Check the reminder’s own unread appearance: another programme notification must not conceal failure here.

3. **S3 — Moved twice before reading; only some days return.**  
   **State:** Ranger SANS from Fri 17, filed Fri 17–Sun 19.  
   **Press:** Saber changes **PO from** Fri 17 → Sat 18 → Mon 20 without Ranger opening his bell, then back to Sat 18.  
   **Expected:** At Mon 20 all three days hide. At Sat 18, Sat–Sun return while Fri remains hidden. No surviving sentence may describe Sat–Sun as hidden. No duplicate filing or count appears. Whether successive change titles accumulate or replace one another is an owner decision, below.

4. **S4 — Quals untick, read, Undo, Redo.**  
   **State:** Ranger manually ticked SANS, no posting; filed Fri 17–Sat 18; read reminder for Mon 20.  
   **Press:** Saber opens **Quals → Edit quals**, unticks Ranger’s **SANS**; Ranger reads the resulting line; Saber presses **Undo**, then **Redo**.  
   **Expected:** Untick produces C: “You're no longer SANS. · Saber” with the approved hidden-days body. Undo restores the filings and removes the false hidden sentence. Redo hides them and tells Ranger again. Reading must not prevent Undo. Repeat with one filed day.

5. **S5 — Both manually ticked and posted SANS.**  
   **State:** Saber manually ticks Ranger SANS today, then saves a SANS posting from Fri 17. Ranger files Fri–Sat and reads his reminder.  
   **Press:** Saber moves the posting later, then removes it using **Undo post out (PO)**.  
   **Expected:** The independent hand tick continues to make those days SANS: filings remain visible and counted. No hidden-day body or “active again” claim is justified. A change title can be owed because Ranger read the reminder; the live reminder must still cover his outstanding SANS days. Also untick while the future posting remains: distinguish days covered by the posting from days covered only by the tick.

6. **S6 — Every selection door clips the same run.**  
   **State:** Ranger SANS from Fri 17; nothing filed.  
   **Press:** In **Inputs → SANS**, select Thu 16–Sat 18 by forward and reverse mouse drag, held finger drag, Shift+arrows followed by Enter or Space, and the **Dates** calendar inside **+ Commitment**. Press **Add**. Use independent attempts. Repeat as Saber filing for Ranger; select Ranger on a valid date before extending the form’s dates earlier if necessary.  
   **Expected:** One filing, Fri 17–Sat 18 only. Ranger sees: “Saved Fri 17 – Sat 18 Jul. Thu 16 Jul was left out because you're SANS from Fri 17 Jul.” Saber sees the approved “Ranger is SANS” version. No silent refusal at the calendar door.

7. **S7 — Two people’s bells remain independent.**  
   **State:** Saber gives Hex a member sign-in. Ranger and Hex each have SANS status, planned unfiled days and unread reminders.  
   **Press:** Ranger presses **Mark all read**. Saber adds a planned day for Hex. Then both read their reminders; Saber adds a day for Ranger only. Sign in as each after each change.  
   **Expected:** Reading Ranger’s reminder never reads Hex’s. A new day changes only the affected reminder’s read state. Neither receives the other person’s dates, title or hidden-day body.

8. **S8 — Shared-offer refusal, then remove the blocker.**  
   **State:** Saber creates one shared Sat 18 offer for Ranger and Hex while both qualify. He then moves Hex’s SANS date to Fri 24.  
   **Press:** Open the shared offer, extend **Dates** through Sun 19 and press **Save**. Deselect Hex under **People**, then save again. Separately try the extension on a one-person Hex offer.  
   **Expected:** Shared extension refuses with “Hex is SANS from Fri 24 Jul. Take him out of this offer to add earlier days.” Nothing partially extends. Removing Hex allows Ranger’s extension; Hex receives no new days. The one-person case retains today’s refusal, without “Take him out”.

9. **S9 — Neither notification trigger exists.**  
   **State:** Ranger has filed nothing and has never read his reminder.  
   **Press:** In separate setups, Saber moves the date later, earlier, removes the posting, changes its outcome, or unticks a manually granted SANS status.  
   **Expected:** No A–E change line merely because the status changed. A surviving live reminder reflects the remaining eligible days; an obsolete reminder disappears. There is no empty change card or invisible unread count.

10. **S10 — Read reminder, but nothing filed.**  
    **State:** Repeat S9 after Ranger reads the reminder. Run both reading routes: tap the line, and **Mark all read**.  
    **Press:** Perform each applicable A–E change.  
    **Expected:** The appropriate change title appears, with no invented filed dates and no hidden-day body. The old reminder is never struck through. D retains the updated live reminder. A retains a live reminder only for still-eligible outstanding days; B/C/E remove it where no SANS entitlement remains.

11. **S11 — Remove a posting, create it again, repeat.**  
    **State:** Ranger SANS from Fri 17; filed Fri–Sat and read his reminder.  
    **Press:** Saber presses **Undo post out (PO)**, then creates the SANS posting again for Fri 17. Repeat the cycle, including reading B between removal and re-posting.  
    **Expected:** Removal produces B’s exact title/body and hides the filings. Re-posting restores them without re-entry and removes false hidden wording. Repeated cycles must not suppress an owed change line or duplicate availability. Repeat with one filed day and with Ranger and Hex posted separately. Toolbar **Undo** does not recreate a posting.

12. **S12 — Earlier date adds an outstanding day.**  
    **State:** Ranger SANS from Fri 17, planned Thu 16 and Sat 18, and has read his Sat 18 reminder.  
    **Press:** Saber changes **PO from** to Thu 16. Ranger opens and taps the reminder.  
    **Expected:** D is title-only: “Your SANS date moved to Thu 16 Jul. · Saber”. The live reminder remains, names Thu 16 and Sat 18, and opens Thu 16. No hidden-day sentence. Repeat with one and several existing filed days: moving earlier hides neither.

13. **S13 — Another outcome without suspending the reader.**  
    **State:** Ranger SANS from Fri 17; filed Fri–Sat.  
    **Press:** On the posting sheet, Saber taps the selected **SANS** chip again, leaving “off the manpower, nothing else”. Inspect as Ranger, then select **SANS** again.  
    **Expected:** E’s title and exact body, including “hidden while you're not SANS those days”; no “active again”. Restoring SANS restores the filings and removes false hidden wording. Repeat with one day, several days, read and unread reminders. This reaches E without making Ranger’s sign-in inaccessible.

14. **S14 — Reminder disappears, then the same day returns.**  
    **State:** Ranger has read his only unfiled planned day, Sat 18.  
    **Press:** Saber removes his final engagement that day, then plans him again. Separately add a second engagement while the first remains.  
    **Expected:** Removing the final engagement removes the reminder without a take-back line. Re-adding the day returns an unread reminder. A second engagement on an already-listed day does not create a newly planned date or relight that reminder.

15. **S15 — Every SANS man, without a future posting.**  
    **State:** Ranger has no posting.  
    **Press:** Saber ticks **SANS** under **Quals → Edit quals**, then plans Ranger on Thu 16, Sat 18, Mon 20 and Thu 23. Repeat with Ranger ticking himself.  
    **Expected:** One reminder headed “Your SANS availability is needed.” Body: “You're planned on Thu 16, Sat 18, Mon 20 Jul and 1 more with nothing filed. Tap to file for availability.” No planned days means no reminder. Also advance a posted man through his posting date; the competing title rules are identified below.

16. **S16 — Filing shrinks the reminder without a take-back.**  
    **State:** Ranger has the reminder for Sat 18, Mon 20 and Thu 23.  
    **Press:** Tap it; use **+ Commitment → Add** for Sat 18, then the remaining days. Repeat with Saber filing for Ranger.  
    **Expected:** Each filed day disappears from the reminder; tapping opens the first remaining day. The final filing removes the reminder without a take-back line. Repeat with AMT/OFT-only availability and hours that do not cover a flying task: “nothing filed” must not become a reminder about unsuitable activity or hours.

17. **S17 — Other saved weeks, sorting and duplicate engagements.**  
    **State:** Ranger SANS from Fri 17.  
    **Press:** Saber plans Sat 18; navigates to the week of Mon 20 and plans Mon 20/Thu 23; returns to the demo week. Name Ranger on two separate Sat 18 programme entries. Ranger reads the reminder, then navigates weeks.  
    **Expected:** Three distinct dates, chronologically ordered, including the saved week. The first outstanding date is the tap destination. Merely loading another week does not relight the reminder. Include a named ground entry and an OFT/AMT entry so the walk is not limited to flying seats. Do not treat an uncreated demo week as missing data.

18. **S18 — Disabled-button boundary and identity.**  
    **State:** Ranger SANS from Fri 17.  
    **Press:** As `us`, open Thu 16 under **Inputs → SANS**, then Fri 17. Repeat with no SANS status; then sign in as `ad` and open those days.  
    **Expected:** Thu 16: disabled **+ Commitment**, “You're SANS from Fri 17 Jul.” Fri 17: enabled. Non-SANS member: “SANS aircrew add their availability here.” Admin: enabled, with no admin variant of the disabled hint. Advance today through Fri 17 and reload: the same dates remain correctly classified.

19. **S19 — Clipping boundaries, cancellation and Undo.**  
    **State:** Use Ranger, then Saber filing for Ranger.  
    **Press:** Repeat S6 with several excluded days, one retained day, and Fri 31 Jul–Sun 2 Aug with SANS from Sat 1 Aug. Change **Dates**, hours and Fly/AMT/OFT choices before **Add**. In separate attempts press **Cancel**, or press **Undo** after a successful add.  
    **Expected:** Saved and omitted dates match the final selection; chosen availability details survive. One retained run is one filing and one Undo step. Cancel saves nothing and gives no “Saved” note. Undo removes the retained filing; it must not reveal discarded early days.

20. **S20 — No eligible day; non-SANS day in the middle.**  
    **State:** First, Ranger SANS from Fri 17. Separately, use the browser clock and Quals to tick him Wed 15, untick Thu 16, and retick Fri 17.  
    **Press:** First select only Wed 15–Thu 16. In the second setup, select Wed 15–Sat 18 and press **Add**. Repeat as Saber.  
    **Expected:** The entirely early run keeps the existing refusal. The second run is refused whole because Thu 16 is an interior gap. No trimming past the gap, no two filings and no success note. These are newly created states, not malformed stored fixtures.

21. **S21 — Clipping cannot bypass validation.**  
    **State:** Ranger SANS from Fri 17.  
    **Press:** Select Thu 16–Sat 18, untick all Fly/AMT/OFT choices, press **Add**. Separately repeat with an existing offer overlapping a retained day.  
    **Expected:** Existing validation refuses; nothing new saves and no clipped-success note appears.  
    **Unit-test-only extension:** Submit a newly constructed invalid final command directly to the save gate, bypassing the UI’s preparation. Confirm it still refuses pre-SANS days. Do not present that direct command as a browser gesture.

22. **S22 — Reload and sign-out preserve the right state.**  
    **State:** Use the transitions in S1 and S4, including unread and read change lines.  
    **Press:** At each transition inspect immediately, reload, sign out, sign in as Saber, then sign out and back in as Ranger. After restoration repeat the sequence.  
    **Expected:** Identical current visibility, hidden dates and read state. No duplicate or resurrected reminder. Removed hidden wording stays removed. No invisible notice keeps the bell lit. Signing in as Saber must not consume Ranger’s read state.

23. **S23 — Self-action; other take-backs remain unchanged.**  
    **State:** Ranger manually SANS, filed Fri–Sat, with a read reminder.  
    **Press:** Ranger unticks his own **SANS**, then presses **Undo**. Separately, Saber adds an ordinary **Meeting** input for Ranger; Ranger reads its notification; Saber presses **Undo**.  
    **Expected:** Ranger’s self-action changes availability without notifying him of his own action. The ordinary input’s read notification retains its existing struck-through “taken back” treatment. D2391’s exception must not remove that treatment from unrelated notifications.

24. **S24 — Crew list gets no new reason line.**  
    **State:** Choose a day whose SANS crew have no availability filed, so its actual free count is zero. Include Ranger with a future posting and Hex manually ticked SANS.  
    **Press:** As Saber, open **Edit Schedule**, inspect the crew list without a seat picked, then pick a seat. On desktop also hover the struck name.  
    **Expected:** Strike and “0 free” remain, with no new explanatory row or filing instruction. Existing desktop hover and armed-seat reasons remain as built. Filing subsequently updates availability normally.

**What is missing or needs a decision**

These are gaps in coverage or acceptance detail, not claims that the unbuilt code is faulty.

| Rule’s words | Case a builder may forget | Owner to decide? |
|---|---|---|
| “Only when something filed was hidden or the reminder had been read.” | The four combinations of filed/unfiled and read/unread, including read-only titles with no body. S9–S10 separate them. | **No.** The condition is explicit. |
| “A newly planned day … lights his bell again; a day dropping off never does.” | Equal-count replacement, duplicate engagements, disappearance and reappearance, and another person’s read marks. | **No.** Compare dates, not just count or notice existence. |
| The same “newly planned day” rule. | Ranger reads, files every outstanding day, then deletes a filing. The day is newly **unfiled**, not newly planned. Also, after the reminder disappeared, does its historical read state qualify a later posting change for a title? | **Yes.** These histories are not explicitly settled by the supplied wording. |
| “Hidden … goes once it is no longer true.” | Only some named days return; successive moves have overlapping hidden-day lists. | **Partly.** Restored days must not remain described as hidden. Whether to narrow each sentence, retire it, or consolidate notices needs a presentation decision. |
| “The whole line if nothing is left.” | All newly drawn A–E lines have a title, so removing their hidden body normally leaves that title. | **No new stored-data finding.** Do not invent a titleless legacy notice to claim browser coverage. If a fresh command can produce one, test that route; otherwise the empty-line rendering branch is unit-test-only. |
| “When his SANS posting or tick changes…” | A man remains SANS through an independent hand tick or future posting. The action changes one source without necessarily hiding any filing. | **No** for visibility and the prohibition on false hidden/active claims. S5 exercises the distinction. |
| “A run … saves the days from his SANS date on” versus shared-offer “Take him out … to add earlier days.” | A **new** shared offer where Ranger qualifies earlier than Hex, rather than the drawn extension of an existing offer. Clip everyone to the common start, or refuse? | **Yes.** Existing shared extension is settled by Q10; its interaction with clipping a fresh shared selection is not explicit. |
| “When his … date changes…” | Two or more changes before reading: retain every title, replace with the latest, or combine? | **Yes.** Current visibility is settled; notice-history presentation is not. |
| “The read reminder … simply goes” versus D’s “the live reminder staying.” | Moving earlier while outstanding days remain. | **No.** The explicit D drawing supplies the exception: retain the updated live reminder, without a struck obsolete copy. |
| “A man with no SANS date ahead” gets the generic title, versus D2340’s “the line’s words stay the same after the date.” | A posted man reaches or passes his SANS date. | **Confirm intent.** The newer wording literally implies the generic title; the older rule explicitly retained the dated title. This affects the clock-boundary walk, not wording quality. |
| Brief’s “undone then redone by Undo” versus D350 excluding postings from toolbar Undo. | Mistaking **Undo post out (PO)** for a reversible toolbar step. | **No**, unless changing D350 is intended. Use Quals for Undo/Redo; remove and recreate postings through their own controls. |
| D2390 mentions a struck form; D2391 removes it. Likewise original 2c/Q4 include now-withdrawn additions. | Implementing older wording alongside the new drawing. | **No.** Apply D2391, D2420 and D2421’s explicit narrowing. |

The source basis is the [approved words and drawings](/D:/raptor-work/c156-sc/raptor-port/docs/mock/2026-11-24-sans-words/index.html), [full scheduler decisions](/D:/raptor-work/c156-sc/.claude/decisions-full/scheduler.md), [clipping decision](/D:/raptor-work/c156-sc/.claude/decisions-full/inputs.md), and [D350’s Undo boundary](/D:/raptor-work/c156-sc/.claude/decisions-full/how-we-work.md:227).