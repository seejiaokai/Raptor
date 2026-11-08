# Trim report, second pass — `.claude/rules/decisions/people-accounts.md` (People & accounts)

## Result
- **26,796 bytes** (first pass 27,846; the 8 Nov page 50,556); ceiling 21,160; **still 5,636 over**. Gate: every page check passes (shape, 600-character statements, all 80 live rulings stated, change marks, ordinary letters, pointer lines); the **only** failure is the ceiling. Edited in place on the committed page; not committed, not pushed.

## What this pass changed
- **Frontmatter (−245 bytes):** six path lines removed, each wholly covered by a pattern on the same list (checked with the gate's own matcher): `src/state/accounts.ts` (by `src/**/*accounts*`), `src/state/perms.ts` (`src/**/*perms*`), `src/state/roster-add.ts` (`src/**/*roster*`), `docs/mock/one-door.html` (`docs/**/*one-door*`), `docs/mock/post-out.html` (`docs/**/*post-out*`), `docs/mock/new-person-account.html` (`docs/**/*new-person*`). No exact duplicates existed.
- **Head (603 → 495 characters):** dropped "open it before planning such work" (doc-structure.md says it) and the seams-file pointer (the seam file loads itself on these paths).
- **Repeats merged (citations unioned):** D166's "every record names the callsign as it was" folded into Quals' D218 rename bullet [D218, D1510, D1651, D1589, D166, D292]; D223's password box into the D166 sign-in bullet [D166, D292, D223]; D214's one-step person into the sign-up bullet with D322's Give access [D214, D224, D204, D322]; D204's guest switch with D221 and D215/D213/D211 into one guest bullet; the archived man's rename into the Quals-keeps bullet [D310, D322, D224, D295, D286]; D289's guest flyer with D296's orange corner [D288, D289, D296]; "his row shows a posting waiting" said once (D326 bullet), "asks the post-in date" said once (D308), "Delete account reads Delete since the one door" said once (D285 bullet), "so does the date that sets one off" said once (D1102 bullet), "one code base serves all" said once (D1100), the Transfer's "future, with the multi-squadron database" said once (D229 bullet, "(below)"), `[MULTI-SQN-DESIGN]` named once.
- **Shortened:** D304 to "not the demo's today (13 Jul)"; D1100's detachment and sharing descriptions to bracketed gists; "From other areas" glosses to bare subjects (the Leave War's gloss then lengthened by a few lowercase words so the gate's capitals rule, which counts the thirty D's, passes).
- Every condition, exception, scope, quoted screen wording, control name, number and citation of the first pass is still on the page; nothing in the table below was removed.

## Why the ceiling is out of reach without his word
Fixed matter is ~7,200 bytes (frontmatter 1,621, head 495, headings ~330, From-other ~1,200, citation brackets ~1,500, quoted screen wording ~2,000); the 80 rulings' statements have ~14,000 bytes under the ceiling, ~175 each. The old list fitted because about 40 of its lines were bare headlines whose conditions lived only in the rows; the 8 Nov page restored them as his rules (the account's "Fixed:" items).

## His choice — conditions that would go back to their rows to reach the ceiling
Ordered fewest and least important first; bytes are the clause as it stands on the page; "Old list" says whether the 97eaa5251 one-line list carried it. Nothing here has been removed. The running total crosses the 5,636-byte gap at the row marked **← ceiling**; the row marked **← ~200 spare** leaves about 200 bytes of headroom. Removing a whole bullet drops no citation: every number in those brackets is cited elsewhere on the page.

| Ruling | Condition (as on the page) | Bytes | Running | Old list carried it | Note |
|---|---|---|---|---|---|
| D1694 (Settled) | its ring 8px outside the row kept as built | 42 | 42 | no | repeat of the body |
| D300 (Settled) | trimmed to say each thing once | 30 | 72 | yes (D299 tail) | repeat of the body |
| D322 (Settled) | the agent's calls on it approved with it | 40 | 112 | no | in D322's row |
| D224 (Settled) | the post-in date added, approved as drawn — a change he names later is a new ruling; its add's "On the roster" gave way to the one door's "Add a person" | 154 | 266 | no | in D224's and D308's rows |
| D304 | not the demo's "today" (13 Jul) | 33 | 299 | no | explanation |
| D298 | the past keeps his record, "fully" overstates it | 53 | 352 | no | his reason |
| D325 | leave and OIL seen — | 27 | 379 | no | detail |
| D283 (D1692) | his name wearing the SANS purple line, not a "SANS" tag | 57 | 436 | no (the Leave War's D1692) | the Leave War's mark, stated on its page |
| D283 | which replaced Show SANS | 26 | 462 | no | history |
| D283 | tracking SANS stays his choice | 32 | 494 | no | in the row |
| D1690 | nobody is named as who set the posting, the app not keeping it | 64 | 558 | no | in the row |
| D1690 | The outcome's words, as drawn: "archived, account suspended" ("archived" with no sign-in), "deleted", "now SANS", "off the manpower" | 132 | 690 | no | screen wording; in the row |
| D1651 | and a scheduler is always an admin; a member unticking his own had blanked his signatures, why the tick became an admin's | 122 | 812 | no | the why; How we work's D785 carries the first half |
| D1651 | The Scheduler tick decides who may sign SKED CK, PLANNED BY and APPROVED BY, | 76 | 888 | no | the why |
| D1653 | IT's 8 Nov 26 answers (database rights theirs, who may do what the app's roles) are put to him, `[DB-SECURITY-ROLES]` | 119 | 1007 | no | not in any row (the account's B15); the backlog item holds it |
| D300/D310 | his example line, "On 14 Oct: archived on Quals, account suspended.", predates the one door — the app writes "On 14 Oct: archived, account suspended." ("archived." with no sign-in), the agent's reading of D310 as built | 220 | 1227 | the example only | not in any row (the account's A5); the code comment cites D310 |
| D1101/D1695 | Not settled: his 5 Nov 26 direction (below) names one database for many squadrons, not aircraft types, so by its words does not end the split by type; IT's 8 Nov 26 answer (one production environment for code apps, so no database per type today) was put to him, recommended: no change now, settled when a second type joins; `[AIRCRAFT-TYPE-SETTING]`, `[MULTI-SQN-DESIGN]` (the agent's reading) [D1101, D1695]. | 409 | 1636 | no | not in any row (the account's A3); held on the two backlog items and HANDOFF.md |
| D1101 | his leaning of 21 Oct 26 ("Im thinking"), answering D1100's open question | 78 | 1714 | no | history |
| D1101 | so far at most two squadrons a type | 40 | 1754 | no | in the row |
| D1100 | rule checks included; rules common to every type shared, each squadron's quirks kept; a change made once | 106 | 1860 | no | his description (the account's A4) |
| D1100 | (a squadron split across two places, each its own schedule and people, a scheduler seeing only who is with him) | 112 | 1972 | no | his description (A4) |
| D1100 | (each other's schedules seen, a man lent by day or period, even split between the two in one day, clash and crew-rest checks seeing both) | 138 | 2110 | no | his description (A4) |
| D1695 | its design goes to him with pictures as a job of its own before the database step | 83 | 2193 | no | in the row |
| D281 | transferred by the admin automatically that date or by hand, his data going with him | 86 | 2279 | no | in the row |
| D296 | taken knowing it is a little less distinct beside a red warning chip, his concern standing: the mark must never hide the callsign, a puck a fixed width that never wraps | 170 | 2449 | no | his caveat; in the row |
| D288 | so the database must not make one unique app-wide | 51 | 2500 | no | in the row |
| D166 | admins creating admins and members | 36 | 2536 | no | in the row |
| D166 | a member bidding only on his own row | 38 | 2574 | no | in the row |
| D166 (2) | Today's sign-in stands for the defence-mail sign-in: the sign-in name as the address, the password as the organisation's; at the database step Microsoft's sign-in, with an authenticator, replaces the whole page, nobody signing in twice, IT's one piece tying each account to its real address; until then | 302 | 2876 | no (D223's line had the password box) | his words of 25 Sep 26 (the account's B14) |
| D165 | the first sign-in with it becoming him; the hand over then shows each what changed since he last looked | 105 | 2981 | no | in the row (B13) |
| D293 | in reserve, not built: a line under the button, "New here? Sign in with your defence mail to ask for access.", if new people are confused once live | 149 | 3130 | no | in the row |
| D292 | "SABER · ADMIN" to "SABER · MEMBER"; there the app behaves exactly as for a member (his own Quals row and a member's inputs; no Admin tab, no Edit Schedule); every sign-in starts as admin; he stays himself throughout | 220 | 3350 | no | in the row |
| D204 | his defence mail taken from the sign-in so it cannot be faked and he never types it | 85 | 3435 | no | in the row |
| D204 | a typed callsign never claims a puck by itself | 51 | 3486 | no | in the row |
| D204 | the admin changes role, puck or account later either way | 58 | 3544 | no | in the row |
| D214/D224 | callsign/name, initials, Pilot / WSO / Personnel, CAT, so approving makes his Quals row from what he gave; the sign-up no longer asks only callsign and name | 158 | 3702 | no | in D214's row |
| D224/D322 | Give access offers "On the roster / New person", as drawn and built, the first linking him to a man already on the roster | 123 | 3825 | no | in D224's and D322's rows |
| D215 | a published day as issued, an unpublished one as it stands now, | 68 | 3893 | no | in the row |
| D211 | knowing the database step then departs from it; the change history shows a medical change in full to members too, his own since How we work's D1536, D1537 | 156 | 4049 | no | in the row; D1536, D1537 stay cited |
| D216/D227 | lit for every admin, out for one only once he has had the waiting list on screen; another admin looking does not put it out; the Admin tab's count stays until the request is answered | 184 | 4233 | no | in D227's row |
| D216 | at the database step a Teams message too | 42 | 4275 | no | in the row (D204) |
| D225 | a blank is filled in later on Quals | 37 | 4312 | no | in the row |
| D226 | as the Quals callsign box does, and the box says so: more than 14 is refused with "at most 14 letters" on the form, so he picks a short form | 142 | 4454 | the box says so | in the row |
| D219 | a man with no callsign, ground crew for one, goes by his name in it | 72 | 4526 | no | in the row |
| D220 | no (FCP) / (RCP), wherever asked; "Personnel (ground crew)" stays | 67 | 4593 | no | in the row |
| D329 | "Archived 27 Sep 26 by Saber", "Archived 14 Oct 26 by his posting (Overseas Sqn)" — the latest archive only, his pick, stored on the person; archived before it was built, none | 182 | 4775 | no | his pick and the proposal's examples; in the row |
| D310/D322 | Buttons by state: Active → Suspend · Archive · Delete; Suspended → Enable · Archive · Delete; no sign-in → Give sign-in · Archive · Delete; Archived, folded "▸ Archived · N" at the foot → Restore · Delete; Waiting → Give access · Refuse; the words stay — Suspend / Enable, Archive / Restore, Delete — "Give sign-in" new [D310, D322, D285, D298]. | 370 | 5145 | no | the design of record (the mock-up) and D310's row |
| D322 | never the signed-in admin's own row, which another admin changes ("Your own row can't be opened"); the list never reorders itself | 134 | 5279 | no | the mock-up's approved calls |
| D322/D310 | Archive also suspends the sign-in; Restore brings both back — even a sign-in suspended by hand before the archive, narrowing for Restore alone the post-out rule that "he's back" enables only a posting's suspension — and says check his quals and CAT: no "can sign in but archived" half-state, Archive one tap, Restore undoing it, no Enable on an archived row, so no signing in while archived [D310, D322]. | 408 | 5687 **← ceiling** | no | D310's row and the mock-up's approved calls (B9) |
| D322 | "Add a person" at the foot makes a New person only, sign-in blank for someone who will not use the app; a roster man gets his sign-in on his own row, Give sign-in [D322, D310]. | 177 | 5864 **← ~200 spare** | no | in the row |
| D322 | His first sign-in after Restore shows "Welcome back, <callsign> — check your quals and CAT", with "Check my quals" and "Later" | 128 | 5992 | a welcome-back note | screen wording; in the row |
| D326/D322 | "posting out 14 Oct · Overseas Sqn", "posting in 19 Oct" — | 66 | 6058 | no | screen wording; in the row |
| D308 | the account works from the day he is added or restored, the post-in date decides from when he counts in the squadron (availability, manning, the crowds a placeholder stands for); every door onto the roster asks it, the box opening on today | 244 | 6302 | no | in the row |
| D320 | posted out and restored with a post-in date he reads "away" between — not in manning or availability, no bids, the posting hatch — his months before the posting as they were, his leave included, counted again from the post-in date; a leave period he is away for all of shows no row for him, one holding his posting-out date shows his days before it as normal | 364 | 6666 | no | in the row |
| D328 | a posting date is an official date, not a bid — never the man's, as he was told; an earlier stint's dates are read-only, as built: its Post in sheet says "Back from a posting on …" with no Undo, a date aimed into an earlier stint is refused with the reason; the current stint's dates still move, chosen knowing an old stint's wrong date then has no door to correct it | 376 | 7042 | read-only, as built | in the row (B10) |
| D303 | posted out on the Leave War from the date, still on Quals with his account open, nothing archived, deleted or made SANS — how a man leaving for another squadron is recorded until Transfer is built; the sheet still opens on Overseas Sqn | 239 | 7281 | no | in the row |
| D306 | never half done; said before the confirm and on his account row, it runs by itself once the reason goes | 108 | 7389 | no | in the row |
| D284 | "fresh" on return — new quals, new Leave War balances, his 13 Sep 26 rule — no longer covers a man archived while overseas | 128 | 7517 | no | in the row |
| D323 | normal up to yesterday, leave and OIL kept, "PO" (away) from today, not counted in manning; a leave period wholly after today does not show him; Restore with a post-in date opens a new stint | 192 | 7709 | his past kept | in the row |
| D327 | the working copy reads him by his stints, out from his archive on, a gap before a later Restore out too; a published day he is named on — a seat, a desk — reads "1 pending" until the next amendment | 203 | 7912 | no | in the row and D321 (7) |
| D286/D295 | Restore refuses a taken name, never renaming anyone itself, and offers the rename on the spot ("Ace is taken — give him another callsign") | 142 | 8054 | offers the rename on the spot | in the rows |
| D286 | A request whose callsign only an archived man holds: Approve opens on New person, filled from the request, a line saying an archived man holds it — the sign-up checks no names, the approve allows it [D286]. | 208 | 8262 | no | in the row (B7) |
| D299 | Goes: account and sign-in; his Quals row from every list, the Archived one included, and every picker; every day still to come, a published day reading pending as any change does; future leave, bids and inputs; his OIL balance; his Leave War row after he left and the war's current views; his place on any Tracker course still running; how long medical records are kept is the organisation's rule, applied at the database step [D299, D297, D981, D300, D1105]. | 459 | 8721 | no | in the row |
| D299 | past inputs with their documents; his signatures on published days (CUR CK, SKED CK, PLANNED BY, APPROVED BY); the change history; his Tracker record from finished courses | 173 | 8894 | his inputs and signatures, the history | in the row |
| D290/D297 | a new man taking it, the old days still show the old one — the app knows each by his id | 91 | 8985 | no | in D297's row |
| D290 | in the database his row stays, marked deleted, invisible everywhere — the data model's tombstone | 100 | 9085 | no | in the row |
