Read-only report for the supplied export of **a5271a17c**. I read the brief whole, the prescribed roll-calls and evidence sheet, and traced the findings below through source and the reshape instructions. I edited nothing and ran neither the app nor tests. No other blind reader’s report or `HANDOFF.md` was opened.

**Nine findings remain:** one incorrect HAS IT verdict, five missing or incomplete implementation paths, and three document/drawing-text findings. Some become reachable only with the planned selector or bell work; those are identified explicitly. None depends on migrating old demo data.

Paths below are relative to `raptor-port/`. Finding numbers match the announcements made during the read; presentation order puts specialised behaviour and higher-impact failures first.

For the host’s tests, use the real seeded identities:

| Person | Account | Person ID | Home |
|---|---|---|---|
| Saber | `acad` | `stiff` | 142 |
| Hunter | `acad2` | `prowler` | 142 |
| Kestrel | `acad9` | `kes9` | 149 |
| Osprey | `acus9` | `osp9` | 149 |
| Ranger | `acus` | `bane` | 142 |

Give grants as Saber through `setGrant`, rather than constructing invalid accounts. All scheduling actors in these cases are admins.

**F2 — High: mission-role answers escape the squadron gate; gate row 25’s HAS IT is wrong.**

Locations: `src/state/mission-roles.ts:44,109–118`; `src/engine/mission-role.ts:67–69`; `src/state/perms.ts:1282–1283`; `src/state/persist.ts:436`.

The logical `insights.role` record has an encoded identity without a squadron. Section 7 extracts squads only from qualified IDs, so it sees none. Persistence subsequently chooses `UNIT`. The ordinary answer door checks `canEditSched()`, currently the account’s admin role, so an admin holding only View passes that check too.

This breaks D2191: **“View of another squadron shows its schedule pages and Logic read only, never its bell.”**

The reshape already recognises the identity defect as **K4/B5**, at `reshape.md:1067–1075`. This finding corrects the roll-call’s blanket assurance; it is not a claim that K4/B5 was previously unknown.

Exact input to run:

1. As Saber, give Hunter **View**, not Plan, of `u149`.
2. As Kestrel, prepare an unprotected 149 week beginning `30/11/2026`, with mission tracking enabled.
3. On Tuesday, use a formation with `rid: 'audit-plan-role'`, mission `ACM`, and an aircraft remark `DS for EAGLE`.
4. Sign in as Hunter; use `switchUnit('u149')` in the harness because the selector is not built.
5. Set the page to Edit Schedule and call `setMissionRole(roleTarget(1, 'audit-plan-role')!, 'blue')`.
6. Inspect the command result and persisted 149 answer.

Expected: Hunter cannot answer the question. A successful command or a new 149 answer disproves correctness. The visible question must offer no editing gesture to a View holder.

Fix:

1. Implement K4/B5’s squadron-qualified logical identity.
2. Carry it through encoding, decoding, the guarded store, persistence, revision keys and Undo.
3. Make section 7 authorize the record’s squadron independently of the door.
4. Test Hunter with no grant, View and Plan; Kestrel and Saber are positive controls.
5. Test answering in 149, switching to 142, then Undo/Redo: neither restoration nor persistence may target 142.
6. Change gate row 25 to identify this exception and its planned repair.

**F6 — High: the proposed foreign-squadron OIL list does not carry its squadron into Save.**

Locations: `src/ui/OilDayList.tsx:68`; `src/ui/oilday.ts:30–32`; reshape **PB4**, `docs/superpowers/plans/2026-11-20-multi-sqn-b1-reshape.md:1515`.

PB4 says the list opens on the notification’s squadron. Its save still accepts only dates and picks, then enumerates `oilOpenOn(..., myUnit())`. Even replacing that call with the general page resolver is insufficient when the list was opened from a 149 notification while 142 remains selected.

This breaks D2201: **“every page, each his to edit, its settings and Admin → Users among them.”**

Exact input to run after PB4’s list-opening change:

1. Saber gives Hunter Plan of 149.
2. Create a new, unanswered, all-day Duty for Osprey on `2026-12-01`, on the programme, titled `Plan-audit 149 duty`.
3. Kestrel makes that date a 149 public holiday, producing Hunter’s 149 notification.
4. Hunter keeps 142 selected and opens that notification.
5. Choose Yes for Osprey and press Save.
6. Reload 149 and inspect the input’s OIL answer.

Expected: the answer persists for Osprey. With the stated save path, the 142 enumeration finds no matching input, returns zero, and the window can close without saving the displayed answer.

Fix:

1. Store the target squadron in `OILLIST`.
2. Pass it through `Body` to `saveOilDay`.
3. Revalidate the actor’s authority in that squadron at Save.
4. Re-enumerate that squadron’s eligible inputs, then save the selected answers.
5. Include the squadron in the window’s identity so picks cannot leak between identically dated lists.
6. Test Save, background schedule switching, reload and Undo.

**F5 — High: holiday notification identity stops at the count; dates, replacement and footer checks still mix squadrons.**

Locations: `src/state/notices.ts:609–614,768–786`; `src/leavewar/sync.ts:1446–1456`; reshape **PB4/PB5**, lines `1515–1516`.

There are three connected omissions:

- `noticeSpan()` supplies no squadron to `HOL_SPAN`.
- `holidaySpan()` uses the loaded war’s holidays and name.
- Duplicate suppression compares recipient and date coverage without requiring the same originating squadron.

PB5 also proposes testing whether a notification’s **reader** administers the list’s squadron. Hunter administers both 142 and 149, so that does not identify which squadron the notification belongs to.

These break D2202: **“his bell carries that squadron’s admin lines”** and **“each line shows which squadron it is from”**. D2195 additionally says each squadron owns its own holiday list.

Exact inputs to run, using newly generated lines after A4/PB3/PB4:

1. **Wrong holiday source:** Hunter holds Plan of 149 and has 142 loaded. Only 149 makes `2026-12-01` a holiday, named `149 audit holiday`; Osprey has an unanswered duty that day. Hunter must see the 149 line with that name and date. Its disappearance, or a name/date obtained from 142, disproves correctness.
2. **Cross-squadron suppression:** both squadrons have unanswered duties on that date—Ranger in 142, Osprey in 149. Generate Hunter’s 142 line, then his 149 line. Both must remain visible. Repeat in reverse order.
3. **False footer promise:** generate only a 149 holiday notification addressed to Hunter, then open a separate 142 OIL list for the same date. The 149 notification must not make the 142 footer claim that its remaining questions are on schedulers’ bells.

Fix:

1. Pass the notification’s squadron through `noticeSpan`, `HOL_SPAN` and the holiday reader.
2. Read that squadron’s holidays, including when its war is not loaded.
3. Restrict supersession to notifications from the same squadron.
4. Give `holidayLineOn` and `holidayLineAny` a squadron context.
5. Make PB5 compare notification origin with list origin—not recipient membership.
6. Test both notification orders, holiday renaming/removal, and switching the loaded war.

**F4 — High, planned regression: PE1 would make unrelated schedule selection hide legitimate admin notifications.**

Locations: `src/state/auth.ts:39`; `src/state/notices.ts:752,761`; `src/ui/OilDayList.tsx:38–40`; reshape **PE1**, line `1519`.

PE1 scopes `mayEditSched()` to the selected schedule. That is appropriate for schedule editing, but existing consumers also use it to show posting/holiday notifications and admit the OIL window. A global change without moving those consumers makes their authority depend on an unrelated selected schedule.

D2202 requires: **“While an admin holds Plan of another squadron, his bell carries that squadron’s admin lines, on by default.”**

Exact input to run against PE1:

1. Saber gives Hunter Plan of 149 and View of a newly created 150.
2. Kestrel generates a fresh posting notification about Osprey for Hunter.
3. Hunter selects 150.
4. Inspect Hunter’s 149 posting line and unread count.
5. Repeat with a 149 holiday line and its OIL window.

Expected: 149’s permitted admin lines remain available. The proposed schedule-scoped `mayEditSched()` returns false in 150 and would hide them.

Fix:

1. Keep the schedule-edit predicate scoped to the schedule.
2. Use the notification’s squadron and the reader’s effective role for notification visibility.
3. Use the OIL window’s captured squadron for its door and save.
4. Audit the non-schedule consumers of `canEditSched`/`mayEditSched`, including input-window controls.
5. Test Plan-149/View-150 selection and member-view toggling. Member view must still hide admin-only lines.

The bell roll-call’s row 11 is reasonable for today’s role-only implementation, but is not safe evidence for PE1 as written.

**F7 — High, plan omission: losing Plan does not trigger the planned rebinding of open worlds.**

Location: reshape **A-iv**, lines `248–263`; loaded-world seams in `src/state/store.ts:459–465` and `src/tracker/peoplewire.ts:121–123`.

The proposed `notify()` reconciliation runs when the person’s home changes. It does not name a grant/authority change while home stays the same. Consequently, `pageUnit('own')` can start answering 142 while the already-loaded Leave War and Tracker remain bound to 149.

This violates D2191’s restriction that View exposes **“its schedule pages and Logic read only”**.

Exact input to run when the planned selector is implemented:

1. Hunter holds Plan of 149, selects it and loads both its Leave War and Tracker.
2. As Saber, lower Hunter’s Plan to View while preserving the Hunter session’s selected/bound page state in the test harness.
3. Deliver the committed grant change and call the ordinary notification/reconciliation path.
4. Repeat with outright removal, and with an edit window open.

Expected: with View retained, 149’s schedule/Logic remain readable but own pages return to 142. With no right retained, the schedule selection must also fall back. A retained 149 war/chart is the counterexample; save rejection alone does not fix the read/door mismatch.

Fix:

1. Reconcile permitted selection and bound worlds after relevant grant and account-authority changes.
2. Compare desired own-page squadron with each actual binding, not only home-at-entry.
3. Rebind on Plan loss; reset schedule selection if no readable right remains.
4. Handle open edits explicitly, without saving them into a newly selected world.
5. Test lowering, removal, re-grant and the same orders around midnight.

This is separate from the already-planned move-day expiry.

**F8 — Medium: notification taps do not enter their destination squadron.**

Locations: `src/ui/topstate.ts:104–123`; `src/ui/adminopen.ts:8–11`; `src/leavewar/sync.ts:1651–1665`; `src/ui/UsersPanel.tsx:449–461`.

Posting navigation carries a person but no squadron. Leave War navigation searches only `rawState().wars`, the loaded war. The doors roll-call notes the posting issue under “Unsure” item 6, but the reshape does not supply a repair.

D1547 requires **“a tap opening his row on Admin → Users”**. D1142 requires **“a tap takes the grid to it.”** D2201 extends the relevant admin access to Plan holders.

Exact inputs:

1. **Foreign posting:** Hunter holds Plan of 149 and keeps 142 selected. Osprey is newly posted Overseas from 149. Hunter taps that notification. Once PF1 filters Users by squadron, the destination must be 149 with Osprey’s archived row visible and ringed; landing on 142 without that row fails.
2. **Personal leave while planning elsewhere:** Saber approves Hunter’s newly filed 142 leave for `2026-12-02`. Hunter selects 149 and taps his approval notification. It must open his 142 leave cell. Searching 149’s loaded war or opening a rowless person window there fails.

Fix:

1. Resolve the destination squadron for each notification kind.
2. Check current access to that destination.
3. Enter/rebind the destination before consuming its person/date navigation intent.
4. Preserve D1691’s deleted-person exception: a deleted person’s posting line opens nothing.
5. Test both directions, the destination already open, and an intervening edit window.

**F3 — Medium: the reshape drawing page still authorizes a live-Plan re-link by a non-master admin.**

Location: `docs/mock/2026-11-20-multi-sqn-reshape/page.html:171`.

The “Told to you” paragraph allows an admin of every relevant squadron to move a sign-in holding live access, without separating View from Plan. It also describes replacement access generically as something squadron admins can give.

That contradicts the audit’s own **PA3** correction at reshape line `1511`: dropping live Plan through re-linking is reserved for a master admin. D2199 says the Plan switch is **“set by a master admin only”**; D2201’s recorded reading says Plan is given and taken away by a master admin only.

Exact acceptance input:

1. Saber gives Hunter Plan of 149 and Kestrel Plan of 142.
2. Create an accountless 142 person, `Audit Relink`.
3. Kestrel attempts to re-link Hunter’s sign-in to that person.

Expected: refusal, leaving both the link and Plan unchanged. The drawing page’s stated rule permits it.

Fix:

1. Split the explanation into live Plan, live View and ended rights.
2. Reserve live-Plan re-linking for master admins.
3. Retain the appropriate all-relevant-squadrons authority rule for live View.
4. State that replacement Plan also requires a master admin.
5. Recheck this paragraph alongside PA3 and the eventual refusal text.

**F1 — Medium: the remaining-pieces map omits Plan holders from P3/P4’s scope.**

Location: `docs/superpowers/plans/2026-11-19-multi-sqn-b1-rest-files.md:16–20`.

P3 describes every page following a master’s pick; P4 is described as the master’s bell. Neither scope statement names the Plan holder or the different bell default.

D2241 says: **“both are named, never the master admin alone.”** D2202 requires Plan notifications on by default; D2198 requires a master admin’s other squadrons off by default.

Exact acceptance input:

1. Saber gives Hunter Plan of 149.
2. Hunter selects 149 and visits schedule, Logic, Inputs/calendars, Quals, Leave War, Tracker and Admin.
3. Generate a fresh 149 admin notification.
4. Repeat the selection and bell check as Saber.

Expected: all Hunter’s applicable pages follow 149; 149 notifications start on for Hunter and off for Saber. A P3/P4 implementation accepting only the map’s named master-admin case would miss Hunter.

Fix:

1. Add Plan holders explicitly to P3’s page-following contract.
2. Add both roles to P4, with separate defaults.
3. Add the paired acceptance sequence to each piece.
4. Use “master admin” in the operative descriptions.
5. Link the map to the updated `pageUnit` and bell-origin contracts.

**F9 — Low: visible drawing explanations still say “master” alone.**

Locations: `docs/mock/2026-11-19-multi-sqn-pieces/page.html:80,103`.

The visible paragraphs contain “or a master” and “A master starts…”. These are user-facing explanations, not internal code comments.

D2240 states: **“The role is always called ‘master admin’ … never ‘master’ alone.”**

Exact input: open the access-row and bell explanations. Saber’s role is described using the prohibited name at those two locations.

Fix:

1. Replace both occurrences with “master admin”.
2. Check visible captions and generated explanatory text for the same wording.
3. Add these locations to the drawings roll-call; picture 1c is not its only wording issue.

**Coverage and required production signs/gestures**

This is the object-to-surface inventory used for the read. “Existing finding” means the supplied roll-call/reshape already owns the defect; it is not counted again above.

| Objects and consumers | Where the visible sign and working gesture belong | Result |
|---|---|---|
| Mission-role answer, role store, persistence, history, Undo | Conditional formation question on Edit Schedule/Board; answer affects that squadron’s Insights | F2; K4/B5 already planned |
| Holiday notice, live span, count, replacement, unread count | Bell line for its originating squadron | F4/F5; PB3/PB4 cover only part |
| OIL list state, row selection, save and Undo | Bell-opened consolidated list; Save applies to the displayed squadron | F6 |
| Posting and personal-leave navigation intents | Bell tap → correct Users row or Leave War cell | F8 |
| Grant/account authority, selected schedule, loaded war, bound Tracker | Selector and open pages reconcile when authority changes | F7 |
| Schedule days/weeks, publication, templates, drafts, Logic and settings | Selected squadron’s schedule controls; View remains read-only | Existing PE1; mission-role exception F2 |
| Inputs, calendars, Medical, SANS, Quals and page settings | Own-page resolver selects home or the authorized Plan target; personal input ownership remains person/date based | Existing A-ii, B4, C1/C2/C6/C11 |
| People, accounts, search, linking, add, archive, restore, delete | Admin → Users; target squadron’s editable rows, foreign search-only rows where appropriate | Existing PD1/PF1/PA3; F8 landing |
| Grants, master mark, squadron/place/home rows | Access controls, Squadrons controls and future transfer door | Existing PA1/PA2/PG1 and Piece B |
| Last-admin counts across dates | Refusal at account, posting, archive and move doors | Existing Piece C; intentional home-admin exception retained |
| Leave War bids, decisions, cells, ledger, balances, periods and settings | Loaded squadron’s grid, sheets, Approvals, Balances and OIL | Existing A1/A7 and world-binding work; F7/F8 |
| Tracker chart/course records, import/export, flex, queued saves and Undo | Bound squadron’s Tracker; flex retains its admin-only distinction | Existing A-iv/A-v; F7 |
| Posting pass, derived posting lines, take-back and follow-ups | Bell audience, struck/read lines and held note on Users | Existing PB1/PB2/PC1 and A5/A6 |
| Reshape rules, remaining-piece scope, drawing explanations | Builder instructions and user-facing drawings | F1/F3/F9 |

The meaningful orders checked were: grant → select → act; Plan versus View; list open → change background selection → save; two squads’ same-date notifications in both orders; notification → destination already open; Plan → lowering/removal while open; move saved → midnight → open-window save; and write → switch squadron → Undo/Redo. These are static traces and proposed host inputs, not executed walks.

**Explicit negatives**

- I checked `units-model.ts:153–158` and the level wrappers and found **no additional Plan exclusion in the central level answer**. A valid admin-level grant returns admin. The member-grant problem is already PA2.
- I checked the account/person squadron doors and §8’s before/after checks and found **no additional exclusion of Hunter acting for an ordinary 149 person while holding Plan**.
- I checked Quals’ write path and found **no additional Plan-specific restriction** on ordinary row edits, callsign changes, Management or Scheduler ticks. The master-admin callsign exception is deliberately separate.
- I checked the master-mark and master-account guards and found **no reason to remove their MUST NOT treatment**. Plan does not authorize making master admins or changing Saber’s protected account.
- I checked the home-admin last-admin rule and found **no defect in excluding Hunter’s Plan from replacing Kestrel as 149’s last home admin**. The no-home-admin case is already Piece C.
- I checked the loaded Leave War and Tracker squadron gates and found **no additional Plan exclusion in their `level === 'admin'` checks**. Their routing/rebinding gaps are separate.
- I checked the Leave War’s basic row/day/decision access functions and found **no independent master-only branch excluding a Plan holder once the correct world and role are supplied**.
- I checked the Tracker role seam and found **no extra admin-only restriction on ordinary chart work or import/export**. Flex is deliberately different.
- I checked the qualified schedule/settings/calendar gate and found **no further omission in its ordinary qualified-ID branch**. The unqualified mission-role exception is F2.
- I checked input-filer notification eligibility and found **no additional missing Plan branch** in `filerVia`/`adminThen`. Move-expiry changes remain Piece B’s responsibility.
- I checked the reshape’s move-day access rule and A7’s leave-day rule and found **no planned master-admin or Plan-holder exemption allowing leave to be added to the wrong squadron’s days**. Removal-only handling is explicitly preserved.
- I checked the corrected UnitGrant wording in `data-model.md:1108–1110,1722` and found **no remaining omission there of Plan holders giving View, or ambiguity there that Plan itself is master-admin-only**.
- I checked the supplied drawing source for Plan’s full-access wording and the separate master-admin/Plan-holder bell defaults and found **no defect in those stated defaults**. F9 concerns the remaining role name, not the default.
- I found **no basis to report an old-data migration defect**, or any scenario requiring a scheduler who is not an admin.

The shared-place time-zone extension remains an explicitly labelled interpretation: D2196 names master admins alone, while PG1 proposes an all-squadrons-admin reading of D2241. I have not silently treated that interpretation as a settled ruling.

The export contains the two drawing HTML pages and the 19 November drawing script, but **none of their referenced image files**. I therefore checked their text and drawing instructions, not the rendered pictures. The report does not claim a browser pass or a complete visual clearance.