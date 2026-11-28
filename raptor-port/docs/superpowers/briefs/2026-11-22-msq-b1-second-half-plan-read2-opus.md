# Red team of batch 1's second-half plan, round 2 — the fresh Opus reader's report (22 Nov 26)

Brief: `2026-11-22-msq-b1-second-half-plan-read2-brief.md`. Read an exported copy of commit db88bc66 (picture-free; the
builder's handoff block removed). Saved by the host as returned, condensed only in layout.

## The §14 rows
Holds: R-O1/R-A4 (words list short — 8), R-O2 (gap: worked-out lines — 18), R-O3/R-A5 (holes: 14, 7), R-O4, R-O5, R-O7
(ordering trap — 19), R-O9/R-A8 for seen marks (navigation — 9), R-O11 (an answered request is deleted, `accounts.ts`
l.686, l.692), R-O12 as a design (row unguarded — 12), R-O14, R-O16, R-A3, R-A9. Partly: R-O10 (13, collides with R-O6
— 1), R-O13/R-A1 ("no unsaved chart work at risk" untrue — 15), R-O15/R-A7 in shape (3, 16). **Does not hold:**
R-O6/R-A2 (1, 2, 3), R-O8 (11), R-A6 (4, 5, 8).

## New findings
1. **Made a master admin wipes the lines of the squadrons he planned (R-O10 against R-O6).** Plan of 149 since 1 Nov, a
   149 line on 20 Nov, made master 22 Nov: the deleted Plan row and the mark's 22 Nov start (`notices.ts adminThen`
   l.300–310, `masterFrom`) leave no right "from then" — every 149 line leaves for good. **Fix:** end the dropped rows,
   not delete them — an `until` on the grant row at the mark's day (undo-contract checklist); `grantOn` reads a row past
   `until` as nothing; "Plan up to the mark's day, then the mark" is no break; test.
2. **The home admin role has no start day** (`accounts.ts adminRecFor` l.352–362 writes no `adminOf`/`adminFrom` for a
   man who never moved) — Admin → Member → Admin brings every earlier line back. **Fix:** Member → Admin always writes
   `adminOf` = home today and `adminFrom` = today (the gate's K3, `perms.ts` l.2279–2290, accepts the shape); a missing
   `adminFrom` read as "from always" only for stored accounts (D56); test, with Undo of the demotion bringing them back.
3. **Rights given back the same day bring that day's lines back** (`units.ts setGrant` l.290 keeps the row id, `from`
   today; `adminThen`'s strict `from < iso`, l.305, would hide every line of the day a right was given). **Fix:** the
   moment a right was given — `at` (ms) on new grant rows, `masterAt`/`adminAt` on the account, checked at the gate
   within the clock slack as `lineNotNow` does; the rule "held without a break since before the line's moment"; test.
4. **The app-written lines fold into a person's Undo step** — an app write chains to the command that woke it
   (`command/commit.ts` l.48–50); `undo/timeline.ts` l.234–241 sets apart only `lw.postoutRun`. Kestrel's Undo of a
   Quals tick would delete the "could not run" line or be refused. **Fix:** `posting.failed` and the later own-account
   writer out of band like `lw.postoutRun`; test.
5. **The own-account line written when a change takes effect is refused by the plan's own rule** (no row changes that
   day), and run as the app the gate checks nothing (`perms.ts` l.3378–3383). **Fix:** its actor named, out of band; its
   own check keyed on the line kind — his home changes that day, the right named held the day before and not that day,
   the line to that account's man, its id the change's, dated that day; test a forged one for a cancelled move.
6. **Own-account lines are not "about him"** (`noticeAboutHim` l.650–670 returns false; `noticeLeftBell` l.731 drops
   them on a move; a 149 stamp lets D2310's rule remove "Plan of 149 ended" as it is written). **Fix:** `acct` → about
   him; stamped with his home or no squadron; D2310's rule and the switch only for the named admin-line kinds (`po`,
   `poback`, `oilhol`, the worked-out `po` line, the could-not-run kind), named in §7 item 4; test.
7. **An Undo of an access change tells the man nothing** (7e's restore path, `perms.ts` l.3088–3091). **Fix:** the
   Undo/Redo keeps the original line and writes the opposite one in its own command (model: `restoreFollowUpOwed`, the
   gate's follow-up door); test.
8. **F3's app-written words miss two changes D2251 names:** (a) a moved admin made a member of his new squadron (K3,
   `units-model.ts adminRoleHolds` l.317–327) — "Made a member: you moved to 149"; (b) an Overseas posting's suspension
   (`suspendForPosting`) — "Suspended" with no setter. **Fix:** add both to F3 and to the writers.
9. **The access-request tap and counts lead to a page that hides the request** (`ui/topstate.ts` l.52–56). **Fix:** the
   tap enters the squadron of the newest unseen request before opening Admin → Users; the badges by squadron, or the tap
   lands where the count came from; test.
10. **A request can be removed by five paths the plan does not cover** — `addAccount` (l.570), `addPersonAndAccount`
    (l.987), a rename in `updateAccount` (l.644), `dropAccountOfPid` (l.870), the posting pass's Delete. **Fix:** the rule
    on the request row — deleting it needs an admin of its squadron (the pass's Delete excepted); at the door "He asked to
    join 149 — only an admin of 149 can answer it" (new words, drawn first); test.
11. **Step E's same-day correction of a new place is still refused** — `units-model.ts placeIdOn` l.145 uses `atOn`
    (l.135–141), the row holding that day only; no record keeps a place's maker (`setPlace` l.250–258). **Fix:** replace
    the gate's check with the set of squadrons whose place rows name the place today or later, an admin of every one (a
    master admin always); drop "who made it" or add a maker field; test.
12. **The bell switch row is not held to its owner** (7e's admin check, `perms.ts` l.3170–3177, guards only `seen:`,
    `noticeseen:`, `apprseen:`, `reqseen:`). **Fix:** a row rule — `bellsqn:<pid>` only for the actor's own person, by its
    one command; the type in `undo/timeline.ts` NOT_STEPS (l.272); test.
13. **R2's moved Approvals mark escapes the own-record rule** (a `u149@…` id no longer starts `apprseen:`). **Fix:** 7e
    matches the unit-split local name, keeps the own-row rule; the key in `UNIT_SETTING_PREFIXES`; test.
14. **A View or Plan row can still be put on a master admin's account** (`setGrant` l.266–294; the gate's master-account
    rule l.2350–2360). **Fix:** `setGrant` refuses a master admin's account; the gate refuses a grant row left on one
    after the command (the same-command end excepted); test.
15. **The Tracker after a pick: unsaved chart work becomes unsaveable; two messages contradict** (`trkUnitViolation`
    l.1876–1878; `bandWords` l.1040–1043; no Tracker hold, `store.ts` l.952–955). **Fix:** with unsaved Tracker edits, a
    pick asks sign-out's Save / Discard / Stay question (`trackerMayLogOut`); F2's line replaces the generic band and says
    changes need the bound squadron picked again; test.
16. **D2214: a posting held for any reason but the last admin never rings** (`stashPreflight`, `masterDeleteProblem` —
    `sync.ts` l.2895–2897, `deleteBlocked` l.3277–3288). **Fix:** a held posting (not by the last-admin lock) triggers the
    could-not-run write once too; test.
17. **Step A's landing never runs on a pick** — `store.ts` l.550's rule is in `refreshAccess` (l.545–553), not
    `enterSquadron` (l.925–941). **Fix:** run the landing after every `enterSquadron`; the Admin half stays the role's;
    test through the menu and R6.
18. **The worked-out "off the manpower" lines carry no squadron** (`leavewar/sync.ts postedLinesOf` l.1723–1744).
    **Fix:** stamped with the squadron they are built for.
19. **Smaller:** the switch in `noticeLive` (l.739), the one body; step G — sign-out's own reload registered first
    (`ui/logout.ts` l.39), so the typed name is kept (sessionStorage, in try/catch) when Sign in is pressed, and a save
    that never lands needs a test and words; `account.access` needs its `undo/describe.ts` label (l.81).

## One line per step
A holds with 17. B holds with 13, 15. C holds with 1, 2, 7, 14. D holds with 9, 10. E does not hold (11). F does not hold:
1–8, 12, 16, 18, 19. G holds with 19.
