# Red team of batch 1's second-half plan — the fresh Opus reader's report (22 Nov 26)

Brief: `2026-11-22-msq-b1-second-half-plan-read-brief.md`. Read an exported copy of commit 225c6eab (picture-free; the
builder's handoff block removed). Saved by the host as returned; the host spot-checked findings 2, 3a, 9 against the
code (`state/accounts.ts adminsOf` l.326–338 counts a master admin through his home only; the gate's "the master mark
changes only by its own command", `state/perms.ts` l.2652; `markRequestsSeen` marks every waiting request, l.1026–1035;
`ui/Drawer.tsx` l.25 reads `waitingCount`) — each holds.

## Findings, most serious first

1. **D2311's end of View and Plan on archive or Overseas posting is refused by the gate on both doors (step C 8, F).**
   Hunter (142's plain admin) archiving Ranger, who holds View of 149, drops a 149 grant row — `unitRowViolation`'s WHO
   block allows that only to an admin of 149 (exceptions: a person delete, a re-link, the member's drop), so the whole
   archive is refused. Hunter posted Overseas holding Plan of 149: `postingPassViolation` (l.1189–1376) allows in the
   pass only a Delete's request, its `reqseen` row and the gone account's grants, and only `po` lines — the pass is
   refused, "could not run" for ever. **Fix:** an exception like `personDeletedHere` for a grant removal in the command
   that archives that account's person; in `postingPassViolation`, for an `overseas` outcome, `GRANT_PFX` removals of
   rows naming the posted man's account; the pass's unsigned `acct` lines to the posted man in a no-setter form (a
   posting records no setter, D1690) — "Plan of 149 ended: archived"; red-first tests for both.
2. **The master admins' new bell audience is named at one of the five places that must agree (step F 2).** A 149
   posting's `po` line to Saber is refused by the pass gate (`adminOfPosting`, l.1327–1333, reads `adminsOf`, which
   counts a master admin through his home only); a 149 holiday likewise (`holidayTodo`'s `told`, `leavewar/sync.ts`
   l.1597, l.1612). Widening only `ownsLine` leaves the writers not writing. **Fix:** one audience function (widen
   `adminsOf`, or `adminLineAudience(u)` = `adminsOf` plus every master admin who can sign in) used at all five —
   `postingAdmins` (l.1539), `holidayTodo`, `adminOfPosting`, §7e `ownsLine` (l.3038), step D's request audience; test a
   149 posting and a 149 holiday writing to Kestrel and Saber.
3. **`saveAccess` (step C 5).** (a) Member for a master admin in one command is refused: "the master mark changes only by
   its own command" (l.2650). (b) "Every door's checks on the whole change" refuses Kestrel giving Hunter View of 149 —
   `otherSquadronProblem` (`accounts.ts` l.420–429). (c) Admin and Plan in one Save refused by `setGrant`'s
   `!adminNow(acct)` (`units.ts` l.276) judged before the change. **Fix:** a new command type (`account.access`) in
   `ACCOUNT_TYPES`, `COMMAND_OPS` and the gate's master-mark list, keeping "only a master admin", "never his own", "one
   master admin left"; each door's checks only for the part it governs; PA2 judged on the role after the change; the
   last-admin and last-master locks once over the whole state after; red-first tests for (a)–(c).
4. **149's list cannot show who else plans 149 (step C 1–3).** `rosterOf(149)` lists only 149's homes
   (`engine/roster.ts` l.82–85), so 6b's "· also plans 149" on 149's list, the "Plans 149" tick there and the count fail.
   **Fix:** the list is `rosterOf(u)` plus the people holding Plan of `u` that day plus `u`'s archived; Plan holders'
   rows open as R3 (only that squadron's line changeable); say whether the heading counts them; test.
5. **Step A's three kinds miss controls on the schedule in view or a named squadron.** (a) Admin → Data's "Clear old
   clutter…" and "Clear edit history…" act on the schedule in view's planning notes and history (149's after a pick —
   `switchUnit` reloads both), guarded by `canEditSched()` in `ui/inputedit.tsx` l.2331, l.2368, which the plan files as
   own. (b) The Inputs, SANS and Calendar settings windows opened from Logic follow the pick (`state/cutoff.ts winUnit`
   l.78; `winStale` false for a window with no squadron), guarded only by `!isAdmin()` (`InputsSettings.tsx` l.41,
   `SansSettings.tsx` l.39, `DaysWindow.tsx` l.108); the Calendar's Holidays half reads the loaded war. **Fix:** a fourth
   kind, "an admin of a named squadron" (`levelIn(me, u) === 'admin'`, role in force — as `ui/oilday.ts adminOfList`),
   for the three windows and the OIL list; Admin → Data's clears under "schedule"; tests: a settings window open, then
   149 picked → closed or read only; the clears off with 149 picked.
6. **D2310 as judged keeps lines when Plan is lowered to View, and brings back removed lines (step F 4).** View still
   reads 149, so its admin lines stay (D2191: View never carries its bell); Plan taken Monday and given again Thursday
   brings Monday's lines back unread (D2218: a line leaves for good; fault P, `units.ts setGrant` l.290,
   `noticeLeftBell`). **Fix:** a line of `u` stays only while his level in `u` has been admin without a break from the
   line's day to today (home admin role, a Plan right from on or before that day, or the master mark — as `adminThen`
   reads start days); lines about himself stay; tests: Plan → View removes; taken and given again brings none back; Undo
   of the take-away puts them back.
7. **Step G clashes with the reload sign-out still owes.** `ui/logout.ts` l.33 has registered "reload if nobody is signed
   in" on the save landing; Kestrel's waiting sign-in either is wiped by the reload or skips it and keeps Hunter's page —
   142's Tracker among it, the fault the reload exists for. **Fix:** when Login's wait ends with a reload owed, reload
   first, bring back only the typed name (never the password), ask him to press Sign in again — or do all the reload
   does, which for the Tracker is the reload; say which; show him if picture 10's words change; test.
8. **A place "two squadrons sit on" is judged on today only (step E 3, PG1).** (a) Saber moves 149 to Home base from
   tomorrow; today only 142 is there, so Hunter may change its time zone, shifting 149's times from tomorrow. (b) A new
   place made from 3b's list: today nobody sits there, so the gate (`placeIdOn(before, u.id, today)`, about l.2615)
   refuses his own correction. **Fix:** count a squadron with a place row holding today or any later day; need an admin
   of every such squadron (a master admin always), the same set naming D2299's sentence; let the place's maker correct it
   while nobody sits there — better, make 3b's "+ New place…" and its move one command; tests.
9. **The request audience misses a count, and marking seen marks every squadron's (step D 2).** `markRequestsSeen`
   (`accounts.ts` l.1026–1034) records every waiting request; `ui/Drawer.tsx` l.25 `waitingCount()` is a fifth count.
   **Fix:** one reader `requestsFor(account, today)` for the Waiting list, `AdminPage.tsx` l.243, `Drawer.tsx` l.25,
   `Shell.tsx` l.320 and l.348, `topstate.ts` l.49–53; `markRequestsSeen` marks only its ids; test.
10. **Made a master admin, his View and Plan rows hide and come back when the mark comes off (step C 4–5).** **Fix:**
    the Save that turns the mark on drops his grant rows in the same command (a gate exception like the member's drop for
    `account.master` going on); test on then off leaves none — or, if he is to keep them, a question with a picture.
11. **A request or bell switch naming a squadron "+ New squadron"'s Undo removed (steps D, E).** The gate's "a unit
    removed while still named" check (about l.2540) looks at place rows, homes and grants, not access requests. **Fix:**
    add `accessreq:` rows' `unit`; test.
12. **The saved bell switch can turn D2202's default off for a later Plan (step F 3).** **Fix:** store only explicit
    choices per squadron; absent takes the default (on for a Plan squadron and a master admin's home, off for his
    others); test.
13. **F2's Tracker words wrong in one case; the spike repeats a finished read (step B 5, §9 F2).** The Tracker binds to
    `pageUnit('own')` at first open (`boot.ts` l.93), not his home; signing in again is not enough without picking 149
    before opening it; the step-0 read of 21 Nov already answered it (`state/store.ts`, `tracker/storage.js` notes; a
    generic band exists, `store.ts bandWords`). **Fix:** words filled from `storageUnit()` and the pick — "This is 149's
    Tracker. To open 142's, sign out, sign in, pick 142, then open the Tracker." — drawn; the spike as confirming.
14. **Step F's test sends an input line to the wrong audience (step F 8).** Input lines go to the named and the filer
    (`notices.ts noticePass` l.471–585), never to admins. **Fix:** use a posting or holiday line in that test.
15. **A forged "could not run" line (step F 7).** Written in its own command by the app; a command type is only a label.
    **Fix:** its own type and gate rule — the posting named is saved, due, not done, not held by the last-admin rule; its
    id the posting's; audience `adminLineAudience`; test the forgery.
16. **Not drawn (D1625).** (a) A person with no sign-in opened on Admin → Users — rights need an account. (b) Eight
    squadrons in the bell buttons, a row's lines, the filter's group and the menu — only two or three drawn; on an iPhone
    they wrap or scroll. **Fix:** draw them and put them with §9's page, or name them as departures.

## One line per step
- A: holds with findings 5 and 13(c). B: holds with 13 and 7. C: does not hold as written — 1, 3, 4, 10, 16(a).
  D: holds with 9 and 11. E: holds with 8 and 11. F: does not hold as written — 1, 2, 6, 12, 14, 15, 16(b).
  G: does not hold as written — 7.
