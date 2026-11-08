# Astra's scenarios — React Doctor's last findings ([RD-LEFT-1108]), 8 Nov 26

Astra (Codex, gpt-6-astra, high, read-only), answering `2026-11-08-rd-last-findings-scenarios.md`. Saved whole by chat 26; not yet sized or walked.

Scenario design complete. **I found no confirmed new production fault in the committed change.** The highest-risk gaps are silent failure to record a visit, stale values after Undo or rollback, and editors retaining or discarding the wrong state.

This is the scenario-design contribution to the **FULL** check, not a completed bug check. I read the source and relevant rulings; I ran no tests or browser scenarios and changed no files. Temporary source edits appeared during the read, so this report is anchored to the committed version, not those changing working files.

Three corrections matter before the host starts:

- The settings inventory contains **15 fixed keys**, not eleven, plus **10 row prefixes**.
- **`?savefail` does not cause command rollback.** It leaves changes in memory, queues their save and shows the failure band. A separate test must reject a command after its changes to exercise rollback.
- Literal “nothing behaves differently” has one deliberate exception: **pressing “Period” now focuses its list**, and the range calendar gains an accessible group name. Treat these as explicit accessibility changes; compare everything else with `main`.

The inventory below is the coverage list. Its entries describe source routes, not browser passes.

| Writer or record family | Visible door and gesture | Readers and visible result |
|---|---|---|
| People edits | Quals: edit initials, flight, CAT, qualifications and permitted ticks; admin renames. Archived rename is on Admin → Users. | Quals, Users, account identity, crew pickers, schedule pucks, warnings, Leave War roster and availability. |
| Add a person | Admin → Users → Add a person, with sign-in blank or supplied. Quals’ Add person opens that form. | Users, Quals, sign-in, Leave War post-in date and counts. |
| Accounts | Users row: Give sign-in, Save, Suspend, Enable; role and sign-in changes. | Row text, status dots, role badge, subsequent sign-in and access. |
| Access requests | Unknown sign-in → Request access; Users → Give access, either On the roster or New person; Refuse. | Request/waiting screens, Users waiting list, Admin count, each admin’s bell. |
| Access-request seen marks | Opening the visible Users list; on phone, entering Users rather than merely showing categories. | Only that admin’s access-request alert clears; waiting count remains until answered. |
| Archive, Restore and posting | Users → Archive, Restore, Restore as; Leave War posting sheets and automatic posting outcomes. | Users’ two lists, archive explanation, posting/held tags, sign-in, Quals, Leave War stints, availability and bells. |
| Delete | Active, suspended, no-sign-in and archived rows; also the posting’s Delete outcome. | Removal from current/future surfaces while historical identity remains; account, schedule, inputs, Leave War and Tracker consequences. |
| Welcome-back acknowledgement | Returning person → Check my quals or Later. | Welcome prompt stops recurring as on `main`; Quals opens through the offered route. |
| Change-history seen marks | Changes window → Mark all as seen. | That person’s NEW marks, counts and history readings. |
| Bell read marks | Tap an individual notice; Mark all read; take back a posting that removes a previously read notice. | Bell count, read styling, navigation, later taken-back and repeated notices. |
| Approvals visit mark | Leave War → Approvals. | New filter/dots use the previous visit for the current visit; next visit advances. |
| Own-person-window visit mark | Leave War → My leave/own person window. | New dots inside that person’s list; opening another person must not mark their visit. |
| Flying-plan day rows | Calendar: change a date’s flying class; Leave War Required cells/panel: one date or selected dates. | Calendar, Inputs’ no-fly indication, SANS needs and Leave War Required readings. |
| Flying-plan weekday rules | Calendar → weekday heading → Every weekday; save, replace or remove. | Every affected date and all flying-plan consumers. |
| Flying-plan running figures | Leave War Required cell/panel → From date on; change or remove one/both seats. | Required figures, SANS needs and date-specific overrides. |

The fixed settings require their own rows; checking one settings save does not cover all of them.

| Saved setting | Writer and visible door | Result to inspect |
|---|---|---|
| `rules` | Logic controls; Inputs/SANS late-cut-off settings | Both settings doors, relevant warning/late readings and reset-to-standard. |
| `stores` | Schedule stores picker’s editor | Add, rename, reorder, delete and reset; picker contents afterward. |
| `cxreasons` | Scheduler Board cancellation-reason editor | Saved reasons, their order and the cancellation picker. |
| `daytpl` | Day-template editor and capture/recapture from a day | Library, picker and a newly applied day. |
| `dutytpl` | Admin’s Duty templates and schedule picker’s editor | Library and newly inserted duty block. |
| `wavetpl` | Admin’s Wave templates and + Wave editor | Library and newly inserted wave. |
| `wavehide` | Same wave editor’s visibility controls | + Wave choices and the route back to hidden entries. |
| `qualcols` | Quals → Edit quals | Column names/order and rows underneath. |
| `lookahead` | Inputs list’s date-range/default controls | Default range when reopened; reset behavior. |
| `secdefault` | Admin → Squadron config; **Set as default** after rearranging a day | Untailored days on Edit Schedule and Scheduler Board; individually arranged days preserved. |
| `wavedefault` | Admin → Squadron config | Placement of newly added waves; already planned days preserved. |
| `guestview` | Admin → Users → Guest view | Waiting screen’s schedule door and guest access. |
| `insights` | Logic’s mission-tracking control | Relevant mission/Insights controls and readings. |
| `sanscalendar` | SANS settings’ three colour thresholds | Threshold boxes and calendar colours. |
| `memberfile` | Inputs settings; its Logic route | Member’s ability to file permitted duties/commitments for others. |

The ten row prefixes are `account:`, `accessreq:`, `reqseen:`, `seen:`, `noticeseen:`, `apprseen:`, `lwseen:`, `flyday:`, `flyrule:` and `flyrun:`.

The restoration inventory is:

| Restored state | Loader or restoration route |
|---|---|
| Rules, stores, cancellation reasons, day/duty/wave templates, qualification columns, lookahead, section order and wave order | Their existing ten loaders; rules reset in memory before overrides are loaded. Wave loading covers both templates and visibility. |
| Accounts, requests, request-seen marks and Guest view | Injected accounts loader. |
| Change-history seen marks | Injected changes loader, including its version used by cached readings. |
| Bell read marks | Injected notice-seen loader. |
| Insights setting | Existing Insights loader. |
| Flying-plan rows | Injected flying-plan loader invalidates the cached plan. |
| Approvals/own-window visits, member-filing switch, SANS colour thresholds | Read directly from settings; no separate module cache requiring an additional injected loader. |
| People and callsign lookup | People restoration rebuilds the roster and callsign index; Undo’s record writer also restores roster ordering and its saved baseline. |

Startup and secondary routes to cover are normal production boot, hydrated reload, `?fresh=1`, sign-out/sign-in without reload, admin/member-view switching, first entry into Leave War, first entry into Tracker, and the local probe bridge. The committed production route registers through the store before rendering; the bridge is installed after boot.

Roles are: admin, second admin, admin viewing as member, ordinary member, pending applicant, guest, suspended account, signed-out screen and a person with no sign-in. **Do not create a scheduler who is not an admin.** A headless/system actor is a separate test condition, not a substitute for any user.

Use these execution conventions for the scenarios:

- **B:** run both builds from identical, independently created fixtures. Every scenario below is B.
- **R:** reload after the save has settled.
- **T:** a second tab on the same build and origin, opened before the tested write.
- **F:** browser-storage failure using `?savefail`.
- **P:** phone, including touch WebKit; desktop remains required.
- **J:** host-controlled command rejection after mutation, before commit. This is a test harness condition, not a production control.
- Every EXPECTED line means **the same as `main`**, except the expressly identified label/accessibility changes.
- Record exact counts and refusals from the baseline. Do not invent expected numbers from the branch.

The following scenarios are ranked, with the least-shared save routes first.

1. **S01 — Required figures and a warm flying-plan cache.** **R, T, J, P**  
   **Setup:** As admin, open Calendar, SANS and Leave War so each has read the plan. Set a one-date pilot figure, a different WSO figure and a running figure.  
   **Action:** Replace the pilot figure with “from this date on”; Undo, Redo, remove the run, Undo again. Repeat with a selected block and with a weekday rule created, replaced and removed.  
   **EXPECTED:** Every reader follows the same restored plan as `main`; unrelated seat values and dates remain unchanged.  
   **Disproof:** The saved rows change but any already-open calendar or Required reading keeps the previous value; a date override survives incorrectly; one Undo restores only part of the operation.

2. **S02 — Visits that can fail silently.** **R, T, J, P**  
   **Setup:** Through normal member/admin actions, create leave requests and decisions since the previous visit.  
   **Action:** Enter Approvals for the first time; inspect New, leave and return. As the member, open My leave, close and reopen. As admin, open another person’s window. Repeat after reload.  
   **EXPECTED:** Current-visit dots use the previous visit; subsequent visits advance exactly as on `main`. Another person’s visit remains theirs. These marks create no Undo step.  
   **Disproof:** New items recur after every visit/reload, vanish before the first viewing, another person’s visit is marked, or opening a screen appears successful while its visit record was refused.

3. **S03 — First write after every startup route.** **R, P**  
   **Setup:** Separate fresh browser contexts for each route listed above. For the hydrated case, first create a person, account and nondefault settings through controls, then reload.  
   **Action:** Make the first applicable write immediately after boot or entry: account edit, own qualification, flying figure, seen mark or member-filing switch. Undo/Redo where supported.  
   **EXPECTED:** First and later writes agree with `main`; a hydrated person’s old value is the value before that edit, not the seed. `?fresh=1` remains intentionally nonpersistent.  
   **Disproof:** First write alone fails, edits unrelated people, restores seed values or works only after visiting another page.

4. **S04 — New person, account and post-in date as one action.** **R, J, F, P**  
   **Setup:** Create requests for one new person and one existing person without a sign-in. Also use Add a person directly, once with a sign-in and once without.  
   **Action:** Give access through both choices; use a future post-in date for the new-person cases. Reject the combined command after its writes in the J variant.  
   **EXPECTED:** Successful results match `main` across Users, Quals, sign-in, waiting list and Leave War. Rejection leaves no partial person/account/posting and retains an unanswered request.  
   **Disproof:** A request disappears without access, an orphan account/person remains, the date is lost, or access incorrectly waits until the post-in date.

5. **S05 — Account edits restored while their readers are open.** **R, J, P**  
   **Setup:** Create a second admin and an ordinary account. Open that person’s Users editor.  
   **Action:** Change sign-in and role; Save → Undo → Redo. Separately Suspend → Undo → Redo and Enable. Check the row, then sign in using the resulting name.  
   **EXPECTED:** Row text, dots, badge, actual sign-in and permissions agree with `main`. Enable’s check-quals prompt remains.  
   **Disproof:** Correct storage with stale sign-in behavior, incorrect role after Undo, or a row displaying different access from what sign-in grants.

6. **S06 — Genuine rollback rebuilds all four injected copies.** **J**  
   **Setup:** Populate and read accounts/requests, history-seen marks, bell-read marks and flying-plan values. Keep their screens or relevant editors open.  
   **Action:** For each affected writer family, reject a real command after mutation. Also reject an unrelated settings edit while all four copies are warm. Then act through the still-open editor.  
   **EXPECTED:** The pre-command values return everywhere, no committed history/Undo step is added, and the next action uses restored records as on `main`.  
   **Disproof:** A cache keeps rejected values, a draft writes through a stale record, a failed combined action leaves half its work, or the next successful command includes the rejected edit.

7. **S07 — Browser save failure, separately from rollback.** **F, R, P**  
   **Setup:** Save a known baseline normally, then reopen with `?savefail`.  
   **Action:** Repeat account edit, new-person approval, qualification edit, flying-plan edit, settings edit and seen-mark actions in separate cases. Press Retry; navigate among app, access, guest and sign-in screens where reachable.  
   **EXPECTED:** Match `main`’s in-memory changes and failed-save state. Retry continues failing while the switch is on. An unsaved request reads **Not sent yet**.  
   **Disproof:** A success indicator hides failure, the band covers controls, the request claims it was sent, or this branch loses additional changes compared with `main`. Do not call unchanged memory a rollback failure here.

8. **S08 — Change-history marks survive unrelated restoration.** **R, T, J, P**  
   **Setup:** One person makes changes; a second signs in normally and opens their history.  
   **Action:** Mark a displayed day’s changes seen; inspect another day/week. Make an undoable settings edit, Undo/Redo it, then reopen history. Repeat with a rejected settings edit.  
   **EXPECTED:** Only the viewer’s displayed changes are marked, and unrelated restoration preserves the same NEW readings as `main`.  
   **Disproof:** All history becomes seen, marks return unexpectedly, another viewer’s marks change, or counts disagree with the visible lines.

9. **S09 — Bell read, take-back and repeat.** **R, T, J, P**  
   **Setup:** Produce notices through real input/leave/posting actions, including a posting notice for another admin.  
   **Action:** Read one line; use Mark all read; take back the source action by its proper Undo route; repeat the posting/action where supported. Compare previously read and unread lines.  
   **EXPECTED:** Match `main` and the read/unread take-back rulings. Read state remains separate from the action that generated the notice. A posting that deleted someone opens no nonexistent Users row.  
   **Disproof:** Reading prevents the maker’s Undo, a repeated notice returns already read, a taken-back line has the wrong treatment, or the bell count and list disagree.

10. **S10 — All 15 settings, including alternate doors.** **R, T, J, P**  
    **Setup:** One independent case per settings-table row; choose a distinctive valid value through its real control.  
    **Action:** First save → inspect consumer → Undo → inspect → Redo → inspect → reload. Exercise add/remove/reorder/reset where that setting offers them. For wave templates, change both a template and visibility. Use both default-section-order doors.  
    **EXPECTED:** Values, consumers and Undo boundaries match `main`; resetting removes overrides rather than leaving stale values in memory.  
    **Disproof:** The editor changes while its consumer does not, grouped wave settings split, a deleted override survives, or an alternate door misses the save layer.

11. **S11 — Two tabs, first writes and later writes.** **T, R**  
    **Setup:** Open both tabs before the first write. Repeat once after accounts are already stored. Use different people, requests, settings rows and flying dates.  
    **Action:** A writes; stale B writes something different; reload both. Repeat with the same record and with whole-list settings. Run each writer family from the inventory.  
    **EXPECTED:** Same behavior as `main`. No live cross-tab refresh is promised. Preserve the distinction between separate row records and a whole settings list.  
    **Disproof:** The branch overwrites or drops something the baseline preserves. Record existing stale-tab behavior separately: the backlog already identifies the demo account first-write case and whole-list settings overwrites.

12. **S12 — Roster editor reset matrix.** **P**  
    **Setup:** Active, suspended and no-sign-in people; pilot, WSO and personnel; a pending posting and a held posting; the signed-in admin’s own row.  
    **Action:** Open, type an unsaved sign-in, change role, arm Delete. Close separately by Cancel, the same row, another row and successful action; reopen. Try the own row.  
    **EXPECTED:** The same saved values, buttons, posting explanation and unarmed Delete as `main`. Own row stays closed.  
    **Disproof:** Unsaved values return after an actual close, Delete remains armed, state leaks between people, a posting line disappears or the own row becomes editable.

13. **S13 — Archived editor: free/taken name, with/without sign-in.** **R, J, P**  
    **Setup:** Archive people through Users. For one, give the callsign to a new active person. Include an archived person with no account.  
    **Action:** Open, edit callsign/date, provoke a duplicate-name refusal, arm Delete, Cancel and reopen. Separately Save name without restoring; then Restore or Restore as with a future date.  
    **EXPECTED:** Initialization, name suggestion, error clearing and date behavior match `main`. Save name alone keeps the person archived. Restore re-enables an existing account and preserves the gap between stints.  
    **Disproof:** A stale name/date/error returns after closing, Save name restores accidentally, the wrong person is renamed, or Restore leaves an archived-but-enabled half-state.

14. **S14 — Hidden is different from closed.** **P**  
    **Setup:** Type unsaved values and arm Delete in each editor kind.  
    **Action:** Hide Users by changing Admin category; use the phone’s category-back button; leave Admin and return. Separately hide the row through search, fold Archived, then reveal it again. Wait beyond idle before returning.  
    **EXPECTED:** Each route preserves or resets state exactly as `main`. Do not assume every hidden panel unmounts, or every return discards edits.  
    **Disproof:** A route resets only on one build, an armed action returns unexpectedly, or a hidden editor receives keys intended for the visible screen.

15. **S15 — Changes elsewhere while an editor is open.** **T, R, P**  
    **Setup:** Open an account or archived editor and type a distinctive draft.  
    **Action:** Rename the active person on Quals; Undo a prior account/people edit while the editor is open; navigate away and back. Repeat with a stale second tab, both with and without reloading it.  
    **EXPECTED:** Saved identity, row headings, draft handling and subsequent Save match `main`. Do not expect a stale tab to receive live updates.  
    **Disproof:** Save affects the wrong person, overwrites a restored field unexpectedly, or succeeds against an obsolete object only on the branch.

16. **S16 — Refusal, no-op and dangerous-action ordering.** **J, P**  
    **Setup:** Open each editor type. Have a duplicate sign-in/callsign available.  
    **Action:** Submit blank/duplicate values; tap away, return and type the same value; correct it. Also Save unchanged values. Test Delete → edit → Save, Delete → refusal → Cancel, and Delete → another row → return.  
    **EXPECTED:** Refusals, retained drafts, closing behavior and Delete arming match `main`. No-op Save makes no extra data change.  
    **Disproof:** A refusal closes the editor, stale error cannot be cleared, a single later tap unexpectedly deletes, or an unchanged Save adds an Undo step.

17. **S17 — Waiting requests and each admin’s bell.** **R, T, F, P**  
    **Setup:** Requests matching an active person without an account, a person already holding an account, an archived-only callsign, and a wholly new callsign. Use two admins.  
    **Action:** Open Give access; switch On the roster ↔ New person; type, Cancel, reopen; approve or Refuse. On phone, visit Admin categories before entering Users.  
    **EXPECTED:** Defaults, explanatory notes, candidate choices and retained values match `main`. Only the admin who actually viewed Users loses their access-request alert; the Admin count lasts until answered.  
    **Disproof:** Merely opening categories marks requests seen, one admin clears another’s alert, the wrong person is linked or a cancelled draft contaminates another request.

18. **S18 — Both clearing forms’ labels and calendars.** **P**  
    **Setup:** Admin → Data, with both clearing forms mounted.  
    **Action:** Press each Period label; use keyboard to change its list. Select range mode in both forms. Open date/month-year controls and return through every supported dismissal.  
    **EXPECTED:** **Explicit exception:** each Period label focuses its own list; each range group is named Dates. Appearance and date selection otherwise match `main`. Person remains a heading over the two approval choices.  
    **Disproof:** A label focuses the other form, group names are missing/duplicated, a heading changes appearance, or keys/taps reach a hidden control.

19. **S19 — Clear a real period, not merely a mocked count.** **R, F, P**  
    **Setup:** Through Inputs Calendar, add notes/pucks and day titles inside, outside and across the chosen period, including the loaded week. Create edit-history entries on known dates.  
    **Action:** In each clearing form test Older than, A specific date and A date range; empty selection, zero results, first confirmation, date/mode change while armed and second confirmation. Use Undo where offered.  
    **EXPECTED:** Exact same count and removal as `main`; changing the dates/mode disarms. Old clutter preserves inputs, saved weeks and the loaded week. History clearing remains available now and does not alter the schedule.  
    **Disproof:** The confirmation names one period but clears another, the forms share state, protected content disappears or history clearing becomes undoable unexpectedly.

20. **S20 — Request-access focus and keyboard.** **F, R, P**  
    **Setup:** Sign out, then sign in with a new synthetic name, without reloading.  
    **Action:** Type immediately; Tab through all fields; change Pilot/WSO/Personnel; submit invalid then valid values. Repeat after another identity and with the failed-save band.  
    **EXPECTED:** Caret, field values, CAT handling and first-frame layout match `main`. A 15-character name is refused rather than silently shortened.  
    **Disproof:** Focus is missing/stolen, an earlier applicant’s text appears, the band/keyboard hides the active box or the changed comment masks an actual autofocus regression.

21. **S21 — Roles, identity changes and Undo ownership.** **R, P**  
    **Setup:** Admin, second admin, `us`, admin’s member view, pending, guest and suspended accounts.  
    **Action:** Attempt each visible route permitted to that role. As member edit an allowed own qualification, then check another row and own callsign/Management/Scheduler restrictions. Switch identity normally and inspect Undo.  
    **EXPECTED:** Same gates as `main`; sign-out clears the former person’s Undo. Admin member view behaves as a member.  
    **Disproof:** A registration change grants an extra action, an expected action silently fails, stale admin tools remain usable or Undo affects another signed-in person’s changes.

22. **S22 — Complete archive/restore/posting/delete journeys.** **R, J, P**  
    **Setup:** A newly created person has past and future schedule appearances, an input, Leave War records and relevant Tracker participation. Create pending and last-admin-held postings through their sheets.  
    **Action:** Suspend → Enable; Archive → Restore; rename; finally Delete with both taps. Separately let each reachable posting outcome run and take it back through its own sheet where supported.  
    **EXPECTED:** Same as `main`, with the ruled distinctions: past identity remains, future/current consequences follow, held posting is whole, and adding/archive/restore/delete/posting are not ordinary Undo actions.  
    **Disproof:** Any partial outcome, changed historical identity, early posting effect, missing held explanation or newly enabled ordinary Undo for these operations.

23. **S23 — Every opener, overlay and way out.** **P**  
    **Setup:** Reach Users directly, from Quals’ Add person, from an access-request bell and from a posting bell. Open each Post in calendar; reach Calendar from Inputs settings, SANS settings and a SANS day.  
    **Action:** Open/close each route, including nested month/year controls. Press Escape, close buttons, toggles and outside areas where applicable. On nonmodal windows, operate the page behind them. Repeat quickly before settling.  
    **EXPECTED:** Same destination, focus, scroll, draft retention and dismissal as `main`; the topmost dismissible surface closes first. An outside tap is not assumed to close an inline editor or persistent nonmodal window.  
    **Disproof:** Wrong underlying page, lost unrelated draft, invisible overlay, click-through, wrong date highlighted or the underlying window closing first.

24. **S24 — Whole-screen appearance and immediate feedback.** **P**  
    **Setup:** Every Users row kind, both clearing forms, approval choices and access screens; short and 14-character names, error text and armed Delete.  
    **Action:** Capture immediately after each important press and after settling; scroll, fold/unfold and resize. Measure paired fields and status-column alignment. Include a bell landing on a low row while the save band is visible.  
    **EXPECTED:** Same visible result as `main`, apart from the stated accessibility semantics. Compare approved drawings where applicable.  
    **Disproof:** Misaligned paired controls, changed heading styling, hidden feedback, a covered target, horizontal overflow or a first-frame flash that the settled picture conceals.

For S22, the downstream check must explicitly visit **Quals, Users, sign-in, Leave War, bell and change history**, then the relevant schedule and Tracker views. For availability, inspect the Edit Schedule crew list both with and without a selected seat, Scheduler Board crew, day counts, free-crew reading, ALL AVAIL and Leave War counts. A correct Users row alone is insufficient.

The walk-lesson accounting is:

| Lesson | Coverage or reason |
|---|---|
| 1. State × readings | S12–S19 and the roster/archived state matrices. |
| 2. Ordinary-speed drag/swipe | S10’s section-default gesture; S01’s selected Required block; S23’s Calendar gestures. |
| 3. Feedback after every press | S24, applied throughout. |
| 4. Operate behind nonmodal windows | S01 and S23. |
| 5. Scrolled target under overlays | S20, S23 and S24. |
| 6. Real-phone keyboard/scroll behavior | S20/S24; physical iPhone confirmation remains separate. |
| 7. Frame-by-frame native motion | No new motion mechanism is introduced; S20/S24 compare keyboard transitions. A model cannot prove native timing. |
| 8. Approved drawing comparison | S24: one-door, new-person/access and applicable posting/access drawings. |
| 9. Measure all row kinds | S12/S13/S24: pilot, WSO, personnel, active, suspended, absent sign-in, archived and held. |
| 10. Hidden page, idle, return | S14/S15/S23 in WebKit, including first frame. |
| 11. View-dependent reading at wide/zoomed sizes | S01’s SANS/Leave War consumers and S23’s landing visibility, at 1536 and 2560; year ends included. |
| 12. Every window opener | S10 and S23. |
| 13. Pinch part-way down | Quals/Leave War downstream inspection in S22/S24. Admin itself must not gain page zoom. |
| 14. Every typed box | S12–S20, with boxes enumerated from source below. |
| 15. Solid bars over scrolling content | S20/S24, particularly the save band and downstream pinned headings. |
| 16. Refocus and retype same refused value | S16; numeric settings in S10. |
| 17. Show/hide both ways | S14/S18/S24. |
| 18. Printed/downloaded result | No print/download implementation changed. If the host uses export to verify historical deletion consequences, inspect its actual output; a print-call stub is insufficient. |
| 19. Close nested windows every way | S18/S23, desktop and touch WebKit. |
| 20. Fast/repeated/curving gesture | S01/S10/S23 where selecting or dragging; rapid row/calendar taps in S12/S18. |
| 21. Emulated touch is not his phone | S20/S23/S24 limitation; request a real-phone recording if behavior differs. |
| 22. Pixels, not element presence | S24, including bell landing, failure band and first frames. |
| 23. Ruled destination, ordinary comparison | S09/S23, especially deleted versus nondeleted posting notices. |
| Additional 23. Surrounding layout | S24 measures all paired fields in the pictured form, including Add a person, with iPhone lettering. |

I checked the following and found no committed-source omission:

- All four injected loaders are supplied in their correct positions; their overall restoration order is preserved.
- Both `lw.seen` and `lw.apprseen` are registered. Their direct storage reads explain why they do not need new loaders.
- Flying-plan command types remain registered by the core layer.
- The member-filing and SANS-colour commands remain covered by the fixed settings registrations.
- The roster and archived row keys already change with open/closed state on `main`; moving their local state into child editors does not, by itself, establish a reset regression.
- The autofocus behavior is unchanged in source; the access-screen edit adds a comment.
- The Period identifiers are distinct between the two clearing forms.
- I found no remaining caller importing the moved registration function from its former module.
- I found no production entry among those inspected that renders the app or installs the probe bridge before normal boot registration.

These negatives are source findings only. They do not replace the scenarios.

There is **no established production fault for which I recommend a code fix yet**. There are three concrete evidence gaps for the host to close:

1. **Actual restoration values:** the new wiring tests partly prove object replacement/version changes, and their “Undo” helper writes an empty entry list. Add tests that change real values, operate actual Undo/Redo and assert both stored values and rendered consumers.
2. **Real authorization:** an unknown command is refused for a real user, but the system/headless actor bypasses that registration check. Test with normal signed-in identities. Also assert the visible outcome: some seen-mark callers return the previous value or `false`, so refusal need not produce a prominent error.
3. **Rollback distinct from failed persistence:** inject rejection after mutations, assert no committed changes, then act through the still-open editor. Keep this separate from `?savefail` and its retry queue.

For each new test, the host should first demonstrate that removing the specific registration or loader it protects makes it fail, then restore the correct code and rerun. Do those temporary breaks away from the source being read or the frozen build being walked.

The exact inputs I would run are:

- Freeze both builds at **8 November 2026, 09:00, Asia/Singapore**.
- Start with `ad` / `a` and `us` / `us`, using real sign-in controls.
- Create through Users: `RDACTIVE`, `RDWSO`, `RDGROUND`, `RDNOSIGN`, `RDSUSP`, `RDARCH` and `RDADMIN2`. Use synthetic sign-ins such as `rdactive@example.test`; initials `RX`; Pilot CAT C and WSO CAT B where valid.
- Create an archived-name collision by archiving `RDARCH`, then adding a different active person called `RDARCH`.
- Request access as `rdrequest@example.test`; test blank initials, all three seat choices, `ABCDEFGHIJKLMN` and `ABCDEFGHIJKLMNO`.
- Use post-in dates **8 November** and **16 November 2026**; postings on **7, 8 and 9 November** to cover past, due and future.
- Flying-plan inputs: **9 November 2026**, pilot **7**, WSO **3**; a pilot run of **11** from **10 November**; Thursday rule from **12–26 November**, then change its class and remove it. Include **30 November–1 December** and **31 December–1 January** boundaries.
- SANS colour thresholds: **2, 4, 6**, then invalid equal thresholds and correction.
- Clearing fixtures: notes and day titles dated **5, 6, 7 and 9 November**, plus one on the loaded week. Test specific date **6 November**, range **5–7 November**, and older than **7 November**.
- Each settings-list case gets an identifiable `RDTEST` entry, a reorder, removal and reset where those controls exist.

For host tests, I would run the changed wiring/boot/editor tests first, then the account, flying-plan, member-filing and permissions tests:

```powershell
npx vitest run src/state/people-settings-wire.test.ts src/state/people-settings-commit.test.ts src/state/command-write-seam.test.ts src/state/stores-boot.test.ts src/ui/onedoor-users.test.tsx src/ui/adminclear.test.tsx

npx vitest run src/boot.test.ts src/boot-walk.test.tsx src/state/accounts.test.ts src/state/accounts-rows.test.ts src/state/flyplan.test.ts src/state/memberfile.test.ts src/state/perms.test.ts src/state/perms-scan.test.ts src/ui/accounts-ui.test.tsx src/ui/accounts-newperson.test.tsx src/leavewar/onedoor.test.ts
```

Run from `raptor-port`. Add the missing integration cases above; existing test names are not evidence that those cases already pass. Use the project’s checks lock for builds and the applicable browser runs.

The keyboard inventory must include Users search; sign-in and role in both roster editor variants; archived callsign and Post in; approval’s person choice, person picker, new-person fields, role and Post in; Add a person’s fields; both Period lists and date controls; access callsign, initials, seat and CAT; and every settings editor exercised by S10.

The committed comparison used for this report was branch head `91fb25ed141c4851a12dc0bb327655f4a07a4f2b` against local `origin/main` at `99ecc114deffe90f57fe639b64d53ef396cadb00`. The host should freeze its two walk builds explicitly and record any subsequent change.

**Walk: NOT DONE — scenario-design brief; execution belongs to the host.**  
**Rulings: none this session.**

