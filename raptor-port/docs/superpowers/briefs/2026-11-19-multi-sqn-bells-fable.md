# Fable's look at the bell lines that concern both squadrons (D2216) — chat 110, 19 Nov 26

His call (D2216): Fable looks over every bell line that concerns both squadrons — which should reach both, what each
is told — following D2194; findings put to him with pictures, nothing built unasked. Read only; nothing driven in the
app (borrowing, transfer, detachments and shared waves are not built, so "today" for those is "nothing"). Brief: the
Agent call in chat 110 (goal, D2194's rule, the ruled lines D2202/D2206/D2213/D2214/D2215, the open moved-admin case
[MSQ-FIXREAD4-OPEN], what to cover). Report kept whole below, its examples' names as Fable gave them.

Examples use: 142 (Saber admin, Ranger, Hunter, Jester), 149 (Kestrel admin/scheduler, Viper), a master admin.

## A. The open case first — the admin who moved (fix read 4's question)

**1. Hunter read "Jester · Posted out · archived" as a 142 admin, moved to 149, then Jester's posting is undone.**
- Today: Hunter (now 149) gets the struck line "~~Posted out · archived~~ · taken back · Saber". The app makes a special exception to let 142's action write into a 149 man's bell.
- Recommend: **No.** Hunter gets no "taken back" line; his old line is simply removed. 142's current admins get the taken-back line as now.
- Why (D2194): Jester leaving the app and coming back is 142's own business; Hunter is 149's man now, cannot open Jester's row, and can do nothing with the news. D2215 does not cover it — that was about a posting that went *to* 149.
- New — his to decide. Differs from the branch (which does "yes"); agrees with the night's recommendation.
- Where in the code: `raptor-port/src/leavewar/sync.ts` (postingLinesOf, retractPostingLines), `raptor-port/src/state/perms.ts` (postingTakeBack, section 7e).

**2. The rule underneath it — what happens to lines a person already holds when he moves squadron (the root of case 1 and of three of fix read 4's five claims).**
- Today: he keeps every line; the app then needs special exceptions each time the old squadron undoes, redoes or takes back something he was told. Fix read 4's claims 2, 3 and 4 are all this (a Redo putting 149's "Bidding open" back on a man now in 142; an Undo removing a read line silently; a take-back deleting an older line in another squadron's bell).
- Recommend one rule, applied on the day he moves: **lines about his old squadron's business leave his bell (read or unread, no "taken back" later); lines about himself travel with him** (his leave, his inputs — he carries those, D2163). After the move, **who is told of a take-back is decided by who would be told of the thing today**, never by who held the old line. So Hunter gets a taken-back line only if he is, today, an admin of a squadron the matter concerns (as in D2215's transfer).
- Why (D2194): his access to the old squadron ended (D2147, D2203); its lines in his bell are another squadron's business from that day, and their taps open pages he no longer has.
- New. It removes the special exception in the code rather than adding more. The change history still keeps everything; only the bell is tidied.
- Where in the code: `raptor-port/src/state/perms.ts` 7e and postingTakeBack; `raptor-port/src/undo/timeline.ts` (the bell replay added by fix read 3); `raptor-port/src/leavewar/sync.ts` (atWarHome, tellWar).

## B. Where the app today sends a line across squadrons that it should NOT

**3. A holiday added by one squadron.** Today the "Inputs need an OIL answer" line goes to the schedulers of every squadron at that place. Should be the holiday's own squadron only. Already ruled (D2195), filed, not yet fixed. Where: `raptor-port/src/leavewar/sync.ts` (tellHoliday), `raptor-port/src/state/perms.ts` (holidayLine).

**4. A new access request.** Today every admin of every squadron has it on his bell (the request carries no squadron). Should be the admins of the squadron asked for only. Already ruled (D2111 and the batch plan: "that squadron's admins only"), not built. Where: `raptor-port/src/state/accounts.ts` (unseenRequests).

**5. The moved admin's "taken back" line** — case 1.

**6. Undo / Redo of a Leave War step (Open for bidding, a decision) that told a man who has since moved squadron.** Today the app is allowed to put the old squadron's line back in his bell. Under rule 2 it should not: a man who has left is told nothing more by the old squadron. Fix read 4, claim 2. Where: `raptor-port/src/undo/timeline.ts`, `raptor-port/src/state/perms.ts`.

Checked and correct today: a posting's lines go to its own squadron's admins only; the Leave War's bidding and decision lines go only to people at home in that squadron; an input's lines go to the people in it and its filer whatever their squadron (right — they are about the man himself).

## C. Borrowing (149 plans 142's Ranger) — not built; the lines it needs

**7. 149 puts Ranger on its RU formation, Tue 24 Nov, and publishes.**
- Ruled: 142's schedulers' bell rung "each time", Ranger told by his own bell (D2160; D2091). Words not ruled.
- Recommend — to 142's schedulers (149 badge): **Ranger · Tue 24 Nov** / "On 149's RU formation, 08:00–11:00. · Kestrel". To Ranger: **RU formation · Tue 24 Nov** / "149 planned you. · Kestrel".
- Open point: D2091 says the bell rings at the pick, D2160 (later) says his row shows on publish. Recommend **one line when 149 publishes, none for unpublished drafts** — drafts change many times and he has ruled against flooding admins (D1208). 142 still sees a clash as it forms, on the warning list.
- Why: a borrowed man concerns both; 142 is told only of its own man and day.

**8. 149 changes his times or takes him off after publishing.**
- Recommend — to 142's schedulers: "Now 13:00–16:00 on 149's RU formation. · Kestrel" / "149 took him off its RU formation. He is free. · Kestrel". To Ranger: "Now 13:00–16:00." / "149 took you off." Ruled in principle (D2160 "each time"); words new.

**9. Ranger made unavailable at home on a day 149 plans him.**
- Ruled for leave approved and medical (D2206, words D2213): to 149's schedulers "On leave, but still on 149's RU formation. Replace him."
- Gap: every other home input that takes him away that day — a course, a duty, a DET, OIL, an overseas duty, Attach filed by hand. Recommend the same line with the input's own word: "On DET, but still on 149's RU formation. Replace him." New (widens D2206).
- No line for a leave bid still waiting, and none when the input is later removed (nothing for 149 to do).

**10. Ranger posted out, archived or deleted while 149 plans him.** Ruled (D2206, D2213) → 149's schedulers. Gap: 142's own posting line (B12) goes to 142's admins as today — correct, no change. An account only suspended: no line to 149 (he is still on the roster).

**11. 142 takes him back ("Take him off …").** Ruled → 149's schedulers: "142 took him off 149's VL formation. Fill his place." Gap: Ranger himself is not told. Recommend to Ranger: **VL formation · Tue 24 Nov** / "142 took you off 149's VL formation. · Saber". New, small.

**12. The borrowing ending.** There is no "end" step — the day passes. Recommend no line. New, nothing to build.

**13. Publishing.** 149 publishing a day with Ranger on it: the lines of 7 and 8. 142 publishing its own day: nothing to 149 (142's own business). A 149 amendment that moves Ranger's time puts 142's published day pending: that is line 8, once, not a second line for "pending". OIL earned on 149's day lands on his own squadron's OIL; any "needs an OIL answer" line stays with 142's schedulers only.

**14. Shared wave (142's RU formation inside 149's wave).**
- Ruled: a line of both changed after both published → the other's schedulers told (D2124); a save overwritten → "Your change is gone: 142 saved over it. Check and redo it." (D2213).
- Gap: 149 presses "✕ Wave" and removes a wave holding 142's lines (D2113 asks at the button, but 142 is told nothing). Recommend to 142's schedulers: **RU formation · Tue 24 Nov** / "149 removed the wave. 142's RU formation went with it. · Kestrel". New.
- Gap: the words for D2124's line. Recommend: "149 changed 142's RU formation. Check it. · Kestrel" (and the mirror).

## D. Transfer to Sqn (Ranger, 142 → 149, on Fri 3 Apr) — not built

**15. When it is set.** Ruled: both squadrons' admins told when it is set and on the date (D2147/D2160); words not ruled.
- Recommend — 142's admins: **Ranger · Fri 3 Apr** / "Transfer to 149 set. · Saber". 149's admins: **Ranger · Fri 3 Apr** / "Joining from 142. · Saber" (142 badge).

**16. On the date.** Ruled P15: one line to both, "Posted out · now with 149".
- Recommend 149's line reads from its own side: **Ranger · Fri 3 Apr** / "Posted in · from 142". 142 keeps "Posted out · now with 149". A tap opens his row in each reader's own Admin → Users (for 142: nothing to open once he has gone — the line stays as the record, as a deleted man's does).
- Why: D2194's second half — each side told what touches it. Changes P15's wording for 149; his to decide.

**17. Taken back.** Ruled (D2215): both squadrons' admins, read lines struck "taken back · <who>", unread ones gone. Note for him: a transfer can be undone only before its date (D2136), so what is taken back is line 15, the "set" line. After the date, sending him back is a new transfer and makes new lines. No gap.

**18. A transfer that could not run on its date.** Ruled for his own squadron (D2214): "Posting out could not run. See his row on Admin → Users."
- Gap: 149 was told he is coming (15). Recommend 149's admins once: **Ranger · Fri 3 Apr** / "Transfer from 142 could not run. He is still with 142." New.

**19. What the date does to plans.** After the date, 142's lines keep him as a borrowed 149 man — from then lines 7–11 apply the other way round, with no extra line on the date itself beyond 16. Recommend none added.

## E. Master admin, View and Plan

**20. A master admin (primary 142) changes something in 149** — posts out Viper, approves leave, publishes. 149's people are told exactly as if a 149 admin did it, his name after the dot; 142's people are told nothing; the master's own bell stays his primary's unless he switched 149 on (D2198). No new line. Ruled by D2194 + D2198; just to be held when built.

**21. Plan given to Hunter (142) over 149.**
- Today: nothing (not built). Recommend — to Hunter: **Plan of 149** / "You can now plan 149's schedule. · <master>". To 149's admins: **Hunter (142)** / "Can now plan 149's schedule. · <master>". Removed: "Plan of 149 ended." to both.
- Why: 149's people will see their days changed by a 142 man — it touches their days. 142's other admins: no line.
- New.

**22. View given or removed.** To the man only: "You can now see 149's schedule." 149 is not told — a reader changes nothing of theirs. New, low.

**23. View/Plan cleared by a move (D2203).** No separate line; the move's own line (16) covers it. If the man held Plan of 149 and it clears, 149's admins get "Plan of 149 ended." as in 21.

**24. A planner's bell (D2202).** Ruled. One gap: when Plan is removed or he moves, the other squadron's admin lines already in his bell follow rule 2 — they leave.

## F. Detachments — not built

**25. A 142 man files DET onto 149's detachment "249".** Ruled: 249's schedulers told (D2160/D2184). Words — recommend: **Ranger · 20–26 Jul** / "On DET with 249. · Ranger" (142 badge).

**26. 149 closes "249" early while 142's men are on it.**
- Ruled: each man told (D2135); 149's admins one line was proposed, not ruled.
- Gap: 142's schedulers. Recommend: **Exercise North · Sat 25 Jul** / "149 closed it early. 3 of 142's people are home from Sun 26 Jul. · Kestrel". To each man: "Closed early. Your DET ends Sat 25 Jul."
- Why: 142's men and 142's days (they become plannable at home). New.

**27. 142 shortens or deletes its man's DET, or posts him out, while 249 plans him.** Same shape as 9–11, to 249's schedulers: "DET ended Thu 23 Jul, but still on 249's RU formation Fri. Replace him." New (follows D2206's pattern and the one-man-one-place "schedulers told", D2165).

**28. The detachment's planned end-date reminder (D2134).** 149's admins only. 142 is not told. Correct as ruled.

## G. Shared places

**29. A master changes the time zone of a place 142 and 149 share (D2196).** Today: nothing. Recommend both squadrons' admins, each naming its own days: **Home base · from Fri 20 Nov** / "Time zone now GMT+9. Check 142's days from then. · <master>" (149's line says "149's"). New.

**30. 149's place is moved away from the shared place.** The design note recommended both told; not found ruled as a bell line. Recommend 142 is told only if it holds or lends people across: "149 moved to North base from Fri 20 Nov. 2 of 149's people come off 142's lines." 149's own admins: "Now at North base from Fri 20 Nov." New.

**31. Holidays, Off days.** Never cross (D2195). **Two sims overlapping, people clashes across the two:** warning list, not the bell — recommend no line.

## Questions for him, each with Fable's recommendation

1. The moved admin (case 1): does Hunter, now 149, get "taken back" about Jester's posting out of the app? — **No; his old line is just removed.**
2. On moving squadron (case 2): do the old squadron's lines leave a person's bell on the day he moves, his personal lines staying? — **Yes.** It closes case 1 and three of fix read 4's open faults at the root.
3. A borrowed man picked (case 7): bell to his home schedulers at every pick, or once when the other squadron publishes? — **When it publishes.**
4. Other inputs than leave and medical (case 9): does any home input that takes a borrowed man away tell the borrowing squadron? — **Yes, same line, the input's word in it.**
5. The man himself (cases 7, 8, 11): told when he is planned, moved or taken off by either squadron? — **Yes.**
6. Transfer, the receiving side's words (case 16): "Posted in · from 142" for 149 instead of the same "Posted out · now with 149"? — **Yes.**
7. A transfer that could not run (case 18): tell 149 too? — **Yes, once.**
8. Plan given or removed (case 21): tell the man and that squadron's admins? — **Yes.** View: the man only.
9. A shared wave removed (case 14): tell the other squadron whose lines went with it? — **Yes.**
10. A detachment closed early (case 26): tell the other squadron's schedulers whose men come home? — **Yes.**
11. Time zone of a shared place (case 29) and a squadron leaving a shared place (case 30): a line to both, each naming its own days? — **Yes.**

No question needed (already ruled, only to build): the holiday line to its own squadron only (D2195); access requests to the squadron asked for only (D2111).

All wordings above are drafts in the app's short style and need his look as drawings before any is built (D1625).
