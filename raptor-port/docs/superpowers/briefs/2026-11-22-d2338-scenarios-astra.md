ASTRA SCENARIOS — read an exported copy at commit 778f95cb1 (D2338 not yet built).

This is a walk specification, not a finding that the unfinished change fails. I read only, changed no files, and ran neither the app nor tests.

Run every scenario at **desktop width 1536 and iPhone width 402**. The expected words and behaviour are the same; on the phone, explanations must be readable without hovering, and dates and controls must remain reachable.

Use separate starting copies for destructive cases. Keep account changes within the same saved app: sign out and sign in, without resetting its data.

Start on **15 July 2026**, with the week beginning **13 July**. As Saber, set Hex’s posting through **Leave War → Hex’s 17 July cell → … → Post out**, with **PO from 17 July**, **SANS**, then **Post out**. Hex is the demo WSO. Use a WSO-compatible seat when testing flying.

The host must align the app’s test date and the browser’s local clock to Singapore time. For midnight, let the clock advance; changing only the Leave War date would not exercise every part of this change.

1. **Future posting: the owner’s example.**  
   On 15 July, leave Hex without availability. In **Edit Schedule**, select 18 July and inspect his crew-list entry; open **Scheduler Board** for that date and repeat. Expect a visible explanation containing all three facts: **no availability filed**, **can file from 17 July**, **Inputs → SANS**. Hex’s bell has no availability reminder yet. Also inspect 16 July: he remains an ordinary WSO there, with no future-SANS warning.

2. **The boundary day and the three note states.**  
   Still on 15 July, inspect both 17 and 18 July: both are SANS days, so both need the future explanation. Advance today to 17 July. The future instruction becomes the usual **“SANS — no availability filed for today”** explanation. As Hex, open **Inputs → SANS → 18 July → + Commitment**, choose **OFT**, **All day**, then **Add**. The missing-availability explanation disappears for 18 July, but remains for unfiled 17 July. Check both crew-list surfaces.

3. **An armed seat uses its own day and activity.**  
   On 15 July, select 16 July’s crew list, then arm a WSO-compatible flying seat on 17 July. Expect the explanation for the armed seat’s 17 July date, including the filing date. Repeat with OFT and AMT. On 17 July, file an **OFT-only, 09:00–10:00** offer. A compatible OFT slot should lose the missing-record reason; an afternoon OFT slot should show the hours restriction; flying should show **not offering Fly**. Filing must not conceal a different restriction. A briefing must not acquire a new flying-availability hard stop.

4. **Available crew and SANS Avail remain distinct.**  
   Inspect **Available crew**, expanded and folded, on 16 and 18 July. In this export, that panel does **not** print individual SANS missing-availability notes: its body lists ordinary crew, and its folded heading reports **SANS offering**. Before Hex’s posting date he can appear as ordinary crew on an eligible day. On a SANS day, he belongs in the separate SANS presentation; a filed offer appears in **SANS Avail** and updates the offering count. Do not require a new duplicate SANS list in Available crew merely to satisfy the brief’s surface checklist.

5. **One reminder, with the right days.**  
   Give Hex a named briefing on **17 July, 18 July and 20 July**, plus a second task on 18 July. Also give him a task on 16 July. Leave all availability unfiled. On 16 July his bell has no new reminder. On 17 July, inspect it while the displayed week is still 13 July. Expect **one active reminder naming 17, 18 and 20 July**, with 18 July once and 16 July absent. The following week must not disappear just because it is not open.

6. **Filing removes dates individually.**  
   From scenario 5, file OFT availability for 18 July through **Inputs → SANS → + Commitment → Add**. Expect the reminder to name only 17 and 20 July. File those two days: no active missing-availability reminder remains. Repeat with Saber filing for Hex, explicitly selecting Hex. Record whether each change makes a previously read reminder unread; that detail is not settled by D2338.

7. **Removing a task removes only the affected date.**  
   From scenario 5, as Saber remove Hex from the sole task on 20 July. His reminder should now name 17 and 18 July. Remove him from one of the two 18 July tasks: 18 July remains. Remove him from the last: it leaves. Inspect the bell after each change, including after Hex had already read the original line.

8. **Only the person receives this reminder.**  
   With Hex’s reminder due, sign in successively as **Hex, Ranger, Saber, Hunter, Kestrel and Osprey**. Only Hex receives this particular availability request. Saber and Hunter may retain their separate, existing posting notices; those are not failures. Kestrel and Osprey must receive no Hex reminder from the other squadron. Compare the actual words, not just the bell’s total count.

9. **The tap reaches a usable SANS calendar.**  
   As Hex, first leave **Inputs → SANS** showing a different month, then return to **View**. Open the bell and tap the availability reminder. Expect the **SANS calendar**, visibly open and usable, rather than an admin posting sheet or **“That input is gone”**. Reach a named day and successfully add Hex’s availability. On the phone, the calendar and day panel must not be hidden behind the bell. Automatically selecting the first missing day is a useful recommendation, not an explicit requirement.

10. **Move the posting later before it runs.**  
    On 15 July, open Hex’s **Posted out** sheet and change **PO from** from 17 to **20 July**, retaining SANS. Look at 18 July: Hex is ordinary there again. Look at 21 July: the future note now names 20 July. Advance to 17 July: no reminder and no permission to file for Hex yet. Advance to 20 July: the reminder names only applicable, unfiled planned days from that posting date.

11. **Move it later, or undo it, after the reminder appeared.**  
    On 17 July with planned days still missing availability, use two independent runs: leave the reminder unread in one; read it in the other. As Saber, change the posting to 20 July. Repeat separately using **Undo post out (PO)**. An unread withdrawn reminder disappears. A read one keeps its original words struck through, followed by **“taken back · Saber”**, and becomes unread. No active request continues telling Hex to file while he is no longer eligible.

12. **Midnight with the page already open.**  
    Start at **16 July, 23:59:50 Singapore time**. In one run keep Saber’s 18 July crew list open; in another keep Hex signed in on **View** with his bell closed. Advance past **17 July, 00:00:02**, without reloading. Expect the ordinary missing-availability note, Hex’s reminder and filing eligibility to become current. Repeat with the page hidden across midnight, then return to it. No early reminder, stale waiting instruction or duplicate line.

13. **Move the posting earlier.**  
    On 15 July, change **PO from 17 July** to **16 July**. The future note must now name 16 July; no reminder appears on 15 July. On 16 July, Hex can file and receives one reminder for the relevant missing days. Also test changing an already-run posting to an earlier date: the old notice must follow the existing take-back rule, with at most one active reminder for the revised posting.

14. **Change the posting’s outcome.**  
    Before the posting runs, change **SANS** to **Overseas Sqn**, then separately test clearing the SANS outcome. Neither should later produce a SANS availability request. Repeat after the reminder appeared, both unread and read: apply the same withdrawal distinction as scenario 11. Separately test **Delete** and its confirmation. Do not test the disabled transfer option as though that feature exists.

15. **Reading and reloading do not create another reminder.**  
    On 17 July, read Hex’s reminder, leave the page, return and reload. Its read state survives; it does not light again merely because the page redrew. Repeat while unread, after one date has been filed, and after the last date has been filed. Each state survives reload without duplicate active lines or resolved dates returning.

16. **Deleting an offer restores the missing day; abandoning a form does not resolve it.**  
    File 18 July, leaving Hex’s task in place. Open that commitment and **Delete** it: the missing note and that reminder date return. Start another **+ Commitment**, then **Cancel**: nothing clears. To move an existing SANS offer, use the app’s supported route—delete it and add it on the new date. Filing 19 July must not silently cover 18 July.

17. **A briefing counts; the search is not flying-only.**  
    Give Hex a single named task, testing each separately: a flying WSO seat, OFT, AMT, a duty and a **Ground Programme** briefing. On an applicable SANS day with nothing filed, each genuine planned assignment should contribute that date. Repeat with Hex added as an additional named person on a task. Multiple appearances still produce one date. A typed mention of “Hex” in a remark must not count as selecting him.

18. **ALL AVAIL keeps its existing rule.**  
    On 18 July, place Hex in a briefing at **08:00–09:00** and inspect an **ALL AVAIL** commitment at **10:00–11:00**. Compare its people and count on 15 July and 17 July, then after reading the reminder and filing availability. Hex’s inclusion stays the same. Remove his only named task: he is excluded even if an offer exists. Restore it outside the commitment’s hours: he is included even without an offer. Move it to **10:30–11:30**: the clash excludes him. Also retain the ordinary-person control on 16 July.

19. **Archive, restore and delete.**  
    With the reminder due, use **Admin → Users → Hex → Archive**, once while unread and once after reading. Confirm his sign-in is suspended. Use **Archived → Restore**, then inspect his actual SANS status, calendar and bell: restoration must not revive a request unsupported by his restored status. Run Delete separately. The deleted recipient cannot sign in, so checking his remaining notices needs the unit-only check below. Whether archive/delete preserve a struck historical reminder is not explicitly settled for this new line.

20. **The right person and date must be filed.**  
    Give Outlaw a separate SANS posting and a missing planned day. As Saber, file availability for **Outlaw on 18 July**, then **Hex on 19 July**. Neither clears Hex’s missing 18 July. File **Hex on 18 July**: only that obligation clears. Also test one shared commitment covering both people; both should update correctly. Before the posting date, neither Saber nor Hex may successfully file Hex’s SANS availability through these routes.

21. **Undo, then make the posting again.**  
    Let Hex read the reminder. As Saber, use **Undo post out (PO)**, then create the same SANS posting again for the current date, with planned days still unfiled. Expect the taken-back historical line and one new active reminder. Remembering that Hex read the old posting must not suppress the new request. Reload and check again.

22. **Cancelled and information-only items do not masquerade as live tasks.**  
    Make Hex’s only task on 20 July a named briefing. Cancel that item through its existing controls: 20 July should leave the active reminder. Restore it: the date returns while availability remains missing. Repeat with **Info only**. Keep a control with a second real task on the same date: cancelling the first must not remove the date while the second still requires him.

23. **Dates remain intelligible across boundaries and on the phone.**  
    In independent runs, use a **31 July** posting with tasks on **31 July and 3 August**, then a **31 December 2026** posting with tasks on **31 December and 1 January 2027**. Advance to each posting date and inspect the reminder and calendar. Dates must identify the correct month and year, without duplicates or invented intervening days. Add enough separated planned dates to wrap the reminder at 402 pixels: it remains one active entry, with readable dates and a working tap.

24. **The clock and bell do not disturb a published day.**  
    Before 17 July, publish the prepared 18 July programme and record its ALL AVAIL people, count and sign-offs. Let the clock cross into 17 July; inspect the new note, read the reminder and reload, without editing the programme or filing an input. Those actions alone must not make the published day pending, alter its people or erase sign-offs. This is separate from the normal consequences of an actual programme edit.

The most likely omissions are the **unarmed phone crew list**, the **posting date itself**, the **armed seat’s date differing from the selected day**, planned days **outside the open week**, the reminder’s **read-versus-unread withdrawal**, and the calendar tap when **there is no existing availability input to open**. Adding the new reminder must also preserve the existing posting notices.

These are the readings I would use when judging the walk:

| Reading | Assessment |
|---|---|
| Before the posting date, explain when and where filing becomes possible; on that date, use the usual missing-availability explanation. | **Supported.** |
| The reminder goes to Hex himself, names his missing planned days once, and opens SANS. | **Supported.** |
| A briefing can create a missing planned day. | **Supported** by the owner’s example. |
| Any successful availability filing removes the *missing-record* reason; activity and hours restrictions remain separate. | **Supported.** |
| Send the reminder as soon as the future posting is created, or allow an admin to file early. | **Contradicted.** |
| Require a filed offer before a planned, otherwise free SANS person counts in ALL AVAIL. | **Contradicted.** |
| Withdraw a read posting reminder by simply deleting it or fading it. | **Contradicted.** |
| Search only the currently displayed week, or only flying. | **Contradicted** by the promise’s unqualified planned days and briefing example. |
| Every change to the remaining dates makes a read reminder unread again. | **The owner’s to decide.** The dates must stay accurate; the renewed alert policy is not specified. |
| Use the working programme rather than the latest published programme when they disagree. | **The owner’s to decide.** Walk both a draft-only addition and a draft-only removal; record which plan drives the reminder. |
| Keep reminding about past unfiled days, or stop after a particular number of days. | **The owner’s to decide.** No expiry period is supplied by D2338. |
| New tasks added after the posting day create or update the reminder. | **My recommended reading**, but the continuing trigger should be recorded explicitly; D2338 states the initial posting-day trigger. |
| Archive/delete must retain exactly the same struck history as Undo. | **The owner’s to decide for this line.** Undo’s appearance is settled; D1696 describes the separate off-manpower notice. |

**Unit-only checks:** inspect the deleted or suspended recipient’s computed notices; check withdrawal with the original read words preserved; and check an already-open reminder whose posting disappears before its tap completes. Malformed offers with no selected activity, broken person references or impossible dates are also unit-only cases, not walk findings based solely on old demo data.

The host should run the scenarios, capture paired desktop/phone evidence, and check that the notifications register describes this new line’s audience, trigger, dates, destination and withdrawal. Its absence from this pre-build export is not a defect in the unfinished build.

Rulings: none made or recorded in this read-only review.

