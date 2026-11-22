# Red team of batch 1's second-half plan — Fable's report (22 Nov 26, third reader, his ask)

Brief: round 1's, `2026-11-22-msq-b1-second-half-plan-read-brief.md`, asked above all where the plan's shape breeds
faults; blind to Astra's and the Opus reader's reports. Read an exported copy of commit db88bc66 (picture-free; the
builder's handoff block removed). Saved by the host as returned, condensed only in layout; the host spot-checked
findings 1, 2, 3, 4 against the code (`state/perms.ts` l.1876 "master admins included"; `engine/oil.ts` l.99–102 reads
`ruleNow('oilFullMin')`; `ui/topstate.ts bellTap` l.51–56; `state/notices.ts noticeAboutHim` ends `return false`) —
each holds.

**The shape:** the plan adds a second meaning of "the squadron" (the pick) on top of three things that keep their own —
the Tracker's bound door, the settings held in memory (`VCONF`), and the bell. The top five findings are each one of
those disagreeing with the pick, where the plan guards the edit right but not the reader.

1. **After any pick, the Tracker already opened refuses every change, still looks editable, and F2's words send him to
   sign out (step B 5, §9 F2).** Saber opens the Tracker (142), picks 149, comes back: every press refused —
   `trkUnitViolation`'s last clause (`state/perms.ts` about l.1876) refuses whenever the bound squadron is not
   `pageUnit('own')`, "master admins included"; with the menu that bites on every pick, a bell tap on a 149 line too (R9).
   The Tracker has no read-only mode. `bandWords` (`state/store.ts` l.1028–1035) gives the chart editor's and an open
   Leave War window's band "This change could not be saved." when nothing was tried; an open Input window
   (`ui/InputWindow.tsx` l.185–187) freezes under the same band. **Fix:** keep the gate clause; while `storageUnit() !==
   pageUnit('own')` the Tracker page is covered read only, F2 reworded with both remedies — "This is 142's Tracker. Pick
   142 to change it. To open 149's, sign out and sign in, pick 149, then open the Tracker."; the three pick-time bands
   with their words in §9, drawn first; tests (Tracker on 142, 149 picked → no control offered, forged change refused;
   142 again → editable; the same by a bell tap).
2. **A request for another squadron locks the bell (step D 2, F 5).** Hunter (Plan of 149), 142 picked, a 149 request:
   `bellTap` (`ui/topstate.ts` l.51–56) toasts and opens Admin → Users on 142, whose Waiting list is empty; nothing is
   marked seen, the bell stays lit, the list never opens. **Fix:** the access branch takes the oldest unseen request of
   `requestsFor`, enters its squadron (R9's rule) when it is not the page's own, then opens Admin → Users, the toast
   naming it ("1 waiting for access to 149"); one rule for the counts — the bell alert counts requests of squadrons
   switched on in his bell, the Admin tab's and drawer's badge the page's squadron's only; tests.
3. **On his own Inputs page, a View holder's OIL question is priced by the picked squadron's rules (a reader step A does
   not list).** Hunter (View of 149) picks 149, files himself a 5-hour Saturday duty: 149's full-day threshold (4 h)
   prices it, not 142's (6 h 1 min) — `leavewar/sync.ts oilAskPlan` l.1382 → `engine/oil.ts inputOilAmt` l.107–112 →
   `ruleNow('oilFullMin')` → `VCONF`, reloaded for the pick (`state/store.ts` l.880). D2197's row: his OIL counted by his
   primary's settings (D2183). **Fix:** the threshold of the input's own squadron (as `engine/inputs.ts cutBackFor`
   l.1224 does); step A gains a second inventory — every reader of `VCONF` / `ruleNow` and the in-memory templates
   reachable from an own page (Inputs, SANS, Quals, the OIL list, the Leave War, the bell's `oilPendingFor`), each marked
   "schedule in view" or "own squadron"; test red first. (The posted-cell path, `desiredOilCells`, not traced.)
4. **The own-account line is not "about him" to any reader rule, and §7 item 4 does not say which lines it judges.**
   (A) "Plan of 149 ended · Saber" is a 149 line he is no longer admin of — it would leave at once, and hide behind a
   "Show 149" button he no longer has. (B) `noticeAboutHim` (`state/notices.ts` l.650–671) ends `return false` for an
   unknown kind, so every `acct` line leaves on his next move. (C) read literally, Ranger (a member) loses 142's
   "bidding opened" line. **Fix:** `noticeAboutHim`: `acct` → true, no squadron mark for the switch; §7 item 4 applies
   only to lines written through `adminLineAudience` (`po`, `poback`, `oilhol`, the posting-failed line), filer lines
   keeping the `fu` rule, everything else the move rule; the agent's reading told to him — an admin made a member also
   loses his own squadron's admin lines; at home the rule is "admin today" (the account keeps no history of its role);
   tests.
5. **The squadron switch is not placed in the one body, so a switched-off squadron still lights the bell (step F 3).**
   **Fix:** the switch test in `noticeLive` (after finding 4's about-him exception), so the list, the unread count, the
   lit bell and the seen mark all read it; tests (off: neither lights nor is marked seen by opening; on: shows, unread).
6. **Made a master admin, a Plan holder loses that squadron's lines for good (step C 5 against F 4).** The row drop
   erases the history the continuity rule reads. **Fix (recommended):** keep the rows while he is a master admin
   (`levelFrom`, `adminsOf` and `lastadmin.ts` already ignore them) and drop them in the command that takes the mark off;
   continuity read over the union of the three; tests.
7. **An Undo of an access change tells the man nothing (step F 6).** **Fix:** the Undo or Redo of `account.access` (and
   of a grant, role, master or suspend change) owes the reverse own-account line, written as a follow-up as the posting's
   take-back is, the gate's follow-up probe (`state/perms.ts setFollowUpsProbe`, l.2918–2920) extended to `acct`; test
   (give, read, Undo → "Plan of 149 ended · Saber"; unread at Undo → the first line simply goes).
8. **Plan lowered to View while on that squadron's Edit Schedule leaves him there (step A 3, B 6).** Neither R6 nor
   `refreshAccess` (`state/store.ts` l.546–555) moves him. **Fix:** the landing a standing check in the notify path —
   wherever the page is Edit Schedule and `maySchedEditPage()` is false, View-only Sched; test.
9. **Two bodies for "may he read this squadron" (step B 1).** `readableUnits` and `pickStandsOn` (l.290–298) must agree
   and read the account's own role: `levelFrom` (`units-model.ts` l.344–360) answers null for a Plan row with a member's
   role, so in the member view a Plan holder would lose 149 from his menu (D2253: it stays, "View only"). **Fix:**
   `pickStandsOn(iso)` = `readableUnits(iso).includes(UNIT)`; test.
10. **Smaller:** §6 item 3's "the admin who made it" — a place row keeps no maker (add the stamp or drop the clause);
    §6 item 4's leaving master admins out of the first-admin list narrows D2308's words — say it to him; `addUnit`,
    `setGrant`, `setMaster` still answer "This change could not be saved." for some refusals — the picker should not
    offer a man the door refuses (one who moves tomorrow), or the words go on §9's page.

**One line per step:** A holds with 3 and 8. B holds with 1 and 9 — item 5 does not hold as written. C holds with 6.
D holds with 2. E holds, with 10. F holds with 4, 5, 6 and 7 — item 4 does not hold until it names the lines it judges.
G holds on the plan's text; not traced through the save-wait code.
