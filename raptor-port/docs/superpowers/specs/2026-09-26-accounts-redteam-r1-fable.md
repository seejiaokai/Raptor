# Red team of the [ACCOUNTS] plan, round 1 — Fable 5.1 (verbatim), 26 Sep 26

Read of plan commit a9ca3463 with the brief `raptor-port/docs/superpowers/briefs/2026-09-26-accounts-plan-redteam-brief.md`. Blind to Astra's report.

# Red-team report: `[ACCOUNTS]` plan, round 1

Verdict at the top so it stands alone: **REVISE**. The design direction obeys D166, D204 and D200, but one flow lets any person act as any admin-added account, the guest and the console can reach writes the plan never gates, and the "one place" claim does not reach the command layer or the Leave War store.

## Findings

**1. BLOCKER. Admin-added accounts have no password, so anyone who knows a sign-in name signs in as that person, including as an admin.** Plan §2 "Passwords": "any non-empty password passes for an admin-added account". Rests on D166 (2) and the brief's own line: report a flow that lets one person act as another. It is also a product decision the plan took silently, and it creates two sign-in rules side by side, which D166 (2) argues against.
Scenario: admin creates account `hex` as admin. A member on the same browser signs out, types `hex` and `x`. Result: he is Hex, an admin, and every "who" stamp names Hex. Expected: refused.
Fix in the plan: every account carries a stand-in password now. Add to §2: an account with no password stored takes the password typed at its first successful sign-in and stores it; from then on a wrong one is refused, exactly as `ad` and `us` behave today. The request-access path stores the password the requester typed on the request and moves it to the account on approval. The seeded pair keep theirs, so there is one rule. Lands in `signIn()` in the new `state/accounts.ts`, with a unit test: second sign-in with a different password is refused. Put the rule on his look card as the agent's reading, and keep the data-model note that the database stores none.

**2. MAJOR. The guest clamp covers the page switch and the page render, but not the App-level overlays, the view page's own doors, or the command layer.** Plan §6 "Guest" and roll-call row 33. `App.tsx:23` renders the board, the history list, the input editor, the document viewer and the availability window as siblings driven by their own flags, not by the page. The probe bridge exposes `setPage`, `go`, `openScheduler`, `setDayPreview` and `openWarns` on the deployed site, since only `raptorRole` and `fileInput` are localhost-gated (`probe-bridge.ts:107-117, 133, 154, 252`). View-only Sched itself offers the working-copy picker, the history list D169 gives to members, and the per-day pending count D171 keeps "for everyone".
Scenario: guest switch on, a requester signs in as guest, opens the console and calls `openScheduler(0)`. Result: the working copy of the squadron's programme, with the change history. Expected: nothing but the issued face.
Fix: (a) `App.tsx` renders a separate guest tree containing only the view page and the banner, none of the sibling overlays, so the clamp is structural. (b) The view page hides the working-copy picker, the history list and the pending list when the session is a guest. (c) `command/permissions.ts` `authorize` refuses every forward command whose actor role is `guest`, one line, pinned by a test. (d) The bridge's non-localhost setters are covered by (a) and (c); say so in roll-call row 34, whose "localhost only" is today false.

**3. MAJOR. `w.lwSetRole`, `w.lwSetViewer` and `w.lwLoadWars` are on the deployed site and let a member become a Leave War admin from the console.** `probe-bridge.ts:122, 140, 148`, outside the localhost guard. The Leave War store's gates read `state.role` (`leavewar/state/store.ts:2114, 2164, 2410, 2488`). Pre-existing, but this plan is the permissions build and its roll-call row 34 asserts the bridge is localhost only.
Scenario: a member signs in on the deployed app, runs `lwSetRole('admin')`, approves his own bid and types an FO award. Result: written and persisted. Expected: refused.
Fix: move the three inside the localhost guard beside `raptorRole`, and add a unit test that the bridge installs none of them when the hostname is not localhost. Add the Leave War role to the drift test as finding 5 describes.

**4. MAJOR. The command layer's permissions stay `anyone`, so a write that skips the new questions still commits.** `people-settings-commit.ts:232-233` defines `people.edit` and every `settings.<key>` as `anyone`; `sched-commit.ts:609` does the same for `approve`. The plan's `perms.ts` is called by UI functions only. For D149 there is no single Quals write function to gate: the page mutates `PEOPLE` inline in its click handler (`QualsPage.tsx:460-502`) and then calls `persistPeople()`.
Scenario: a member session; any code path calls `store.set('accounts', …)` or edits another person's row and calls `persistPeople()`. Result: a `settings.accounts` or `people.edit` command commits. Expected: refused at the write path (6 Aug 26 rule).
Fix, in step 1 and step 7 of the build order: `perms.ts` exports the actor predicates the command layer registers. `settings.accounts` and `settings.guestview` become admin-only; `settings.accessreqs` stays open for the anonymous create, with delete refused inside `accounts.ts` for a non-admin. `people.edit` becomes "admin, or every changed `people/<id>` in the command's diff equals the actor's person"; the people store already diffs by id, so this is the own-row write gate D149 asks for, and the per-column tests drive it. `approve` becomes admin-only, which is roll-call row 22's missing gate. `undo.restore` keeps `mayReverse`.

**5. MAJOR. Scattered checks will survive, and the drift test as designed cannot see them.** Plan §4. Direct `SESSION.role === 'admin'` reads remain in `Shell.tsx:253`, `Drawer.tsx:16`, `AdminPage.tsx:176`, `HelpPage.tsx:48`, `LogicPage.tsx:81-171`, `Modals.tsx:150,165`, `InputsPage.tsx:900,917`, `QualsPage.tsx:311,470`, `reports.ts:79`, the four template modals and `sync.ts:1393`. The Leave War store keeps some twenty `state.role !== 'admin'` gates. The test compares §11 with `PERMS` and `PERMS` with the questions; nothing proves the call sites ask the questions.
Scenario: §11 and `PERMS` both say members may decide nothing on a bid; a later edit relaxes `setBidStates` in the war store. Result: the drift test stays green while the app disagrees with §11.
Fix: (a) a source-scan test that fails on `SESSION.role`, `LOGINROLE`, `!== ME`, `=== ME` and `state.role` outside an allow-list of `perms.ts`, `auth.ts` and the Leave War store. (b) The drift test drives the Leave War store's public writers as admin, member-own, member-other and guest and compares the outcomes with the §11 rows for `LeaveWar`, `LeaveBid`, `LeaveLedger` and `LeaveOpening`; the role stays derived through `lwSetRole` from `resetSession` as the one seam. (c) Replace the direct role reads above with `isAdmin()`.

**6. MAJOR. The replaced-bid notice still keys on the login role, so an admin filing over his own bid is told "an admin" replaced it.** `inputgate.ts:319-321`. D166 (4) and (5). Roll-call row 15 says "the account role and person" without stating the new predicate.
Scenario: admin signed in as Saber bids LL on 11 Feb, then files LL for himself on the Inputs page. Result: a notice on his own row, "replaced by an admin". Expected: no notice; the toast says "your LL bid", as it does for a member.
Fix: `own = ME === p` whatever the role; `who` is the signed-in callsign. State it in row 15 and add the test to step 3.

**7. MAJOR. The plan claims sign-in and sign-out end the undo history; the global timeline is never cleared.** Rules-sweep row "13 Sep 26 + D148" and roll-call row 18. `resetSession` (`store.ts:283-344`) clears the Tracker session and the edit log, nothing in `undo/timeline.ts`. `mayReverse` lets any admin reverse anything.
Scenario: a member changes his input, signs out, an admin signs in and presses Undo. Result: the member's change is reversed under the admin's name. Expected under the 13 Sep ruling: nothing to undo.
Fix: `resetSession` calls a new production `endUndoSession()` in `undo/timeline.ts` that empties the entries and bumps the version, pinned in `session.test.ts`. Also state that account writes are not undo-eligible because `settings` is not cut over (`undo-wire.ts:145`), pin that, and add a note that a future cutover must re-check the "one admin remains" guard inside the restore write.

**8. MINOR. One seed points at the demo's posted-out man.** Plan §The seeds: `torch → ignite`; `demoworld.ts:45` marks ignite as posted out, so `runPoArchive` archives him on first boot and the Accounts list opens with an "archived callsign" mark on a seed. Fix: seed a member who is not posted out, for example `dj` or `rocky`. Also name that removing the sixty-option `#viewAs` select and widening the badge to "Ranger · Admin" shifts the top-bar geometry the e2e suite measures, and that those expectations are re-baselined, not loosened.

**9. MINOR. The SCHEDULER tick a member may now set on his own row makes him nameable in three sign-off boxes.** `publish.ts:1309` requires `isScheduler` for SKED CK, PLANNED BY and APPROVED BY. D149's row records he was told "a member still cannot sign"; this consequence was not put to him. Fix: keep the build as D149 says, and put the consequence on his look card.

**10. MINOR. The guest identity is two values the one mirror line cannot produce, and the empty string slips past a null check.** Plan §3 sets `ME = null` and `viewer = ''`; `sync.ts:1424,1433` mirrors `ME` straight into the viewer; `deriveActor` maps a guest to role `member` (`actor.ts:28`); `mayReverse` treats `''` as a person (`timeline.ts:352`). Fix: the actor role is `guest`; `perms.me()` returns null for a guest; the sync writes `SESSION ? (ME ?? '') : null`; `mayReverse` requires a non-empty person. State what `resetSession(null)` sets `ME` to, since the plan only covers a call without `pid`.

**11. MINOR. Persistence details the plan leaves implicit.** `accountsLoad()` must never write: a loader runs inside every settings rollback (`people-settings-commit.ts:89-92`), so seeds are in-memory defaults when the key is null, and the first admin edit writes the list. Say what an unreadable stored value does; falling back to the seeds silently restores the demo admin. Say that own-account relinks apply at once by re-deriving `ME`, or are refused; the plan's "next sign-in" rule covers only someone else's account. Say that Sign out on an access screen clears the `ACCESS` state as well as the session.

**12. MINOR. §11 and §3 need four more lines for IT.** `User`: member reads his own row only. `AccessRequest`: create by any signed-in principal on no list, read and delete by admin. The guest is a third named security role reading the issued programme and `Person` names only, not a footnote, or IT builds two roles and the guest view reads nothing. `Person` own-row update excludes `archived`, `special` and `id`. `EditLog` gains `byUser`.

**13. MINOR. The D201 sweep list misses stale text found by subject.** Add `feature-impact.md:564-575` (the two role reads), `ui-contracts.md:5033` (the toggle), `docs/leavewar/known-gaps.md:92`, `matrix.css:1431`, `undo-contract.md:241`, `command/types.ts:65`, the `actor.ts` header, `e2e/app.ts:207-213`, `tracker/role.js:10-13` and `CLAUDE.md:706`.

**14. MINOR. Decisions the plan takes that are his.** One person one account, an archived puck keeps its access, the not-your-own-account guard, the guest seeing View-only Sched alone. Each is reasonable; each goes on the look card as the agent's reading, not as settled.

## Readers and doors the plan's roll-call misses

Each line: where the sign shows and where the gesture must refuse.
- Bug-report bell for admins, `reports.ts:79`: top bar; reads the role directly.
- Airspace editor, `Modals.tsx:150,165`: the day's airspace popover; admin only, direct read.
- Late-mark, warning-mute and note-publish toggles, `view.ts:151,738,755`: fine through the re-export, list them.
- Admin-only block on the Inputs page, `InputsPage.tsx:900,917`: direct read.
- Archive toast, `QualsPage.tsx:470`: direct read.
- Sign-off eligibility, `publish.ts:1309`: finding 9.
- Ledger approver, `leavewar/state/store.ts:2895`: becomes the admin's callsign automatically; say so in row 14.
- Boot mirror before sign-in, `main.tsx` via `sync.ts:1424`: `ME` before any session.
- Tests that pin the old world: `people.test.ts:54` ("Squadron member"), `app.test.tsx` (`ACCOUNTS`), `roletoggle.test.tsx`, `tracker.test.tsx:66`; each replaced by the absence it now pins.
- Orders to add to the walk: member ticks SCHEDULER on his own row, then an admin opens the sign-off boxes; guest opens the console; admin files over his own bid; member signs out, admin signs in, presses Undo.

## Checked and found sound

- D166 (1) to (5): each clause has a build line and a roll-call row; nothing read wrongly.
- D204: both ways in, waiting screen, guest switch off by default, typed callsign never links; all present.
- D200 (1) to (3): D149 built here, §11 rewritten, one module plus test; present, subject to findings 4 and 5.
- D149 scope: every column, own row, archive and add stay admin; matches the ruling.
- Clashes named: D104 against D166 (5), the 27 Aug toggle against D166 (3); both correct, later wins.
- Lock-out guards: at least one admin on, not your own account; sound, and undo cannot break them today.
- OIL awards, Q-A: deferring `by` and `at` on a manual credit to the award fix matches D203's order; the ledger grant already stamps the approver.
- Storage: the schema reset keeps `settings`; the legacy import cannot collide with the three keys; the memory backend seeds fresh; `captureSettings` widening is safe.
- The archived-puck rule, Q-C: the automatic posting-out pass makes refusal a lock-out; correct.
- `canEditRow` with a `''` viewer refuses every row; `ackReplacement` refuses too.
- D121, D129, D66: Tracker untouched, every sign-out through `logout.ts`, the availability window closes.
- Database step: the three keys map to `User` and `AccessRequest` cleanly; nothing here must be undone, given finding 12.

**Verdict: REVISE.**
