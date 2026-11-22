# Red team of batch 1's second-half plan, round 2 — Astra's report (22 Nov 26)

Brief: `2026-11-22-msq-b1-second-half-plan-read2-brief.md`. Run: `codex exec -m gpt-6-astra`, high, read only, on the exported copy; saved by the host as returned (its links point into that copy).

Read an exported copy of commit db88bc66 (picture-free; the builder's handoff block removed).

The revised plan still needs five corrections. This was a static, read-only review: no files changed, no tests run, and no pictures available for visual verification.

1. **High — the retained Tracker can remain visible after access is reduced.**

   **Failure:** Hunter holds Plan of 149, picks 149 and opens its Tracker. Saber then lowers his access to View. The retained Tracker still contains 149’s courses and records. Refusing saves does not stop Hunter reading them. Switching to member view produces the same problem.

   D2252 expressly excludes another squadron’s Tracker, even read only; D2253 makes the member view’s Tracker his home squadron’s.

   **Cause:** Plan §3.5–6 retains the loaded Tracker and relies on the write gate. The [Tracker wrapper](/C:/rt138b/raptor-port/src/tracker/TrackerPage.tsx:48) continues rendering its app, while [the gate](/C:/rt138b/raptor-port/src/state/perms.ts:1868) protects writes only. Re-entering the home squadron cannot replace those cached records.

   **Fix:** Keep the caches and unsaved draft, but separately check whether the effective role may still see the bound Tracker. When it may not, conceal its contents and dialogs and disable its interactions, including export and keyboard handlers. Show an approved recovery surface pointing to the permitted Tracker. Do not reset or unmount the cached board as a shortcut.

   Add tests for Plan → View, Plan → None, demotion, master removal and member view, with 149’s Tracker already open. Verify that its records disappear, writes remain refused and temporary member view does not discard the retained draft.

2. **High — day-only rights records cannot prove uninterrupted access within a day.**

   **Failure:** Hunter receives a 149 posting notice at 09:00. His Plan is removed at 10:00 and given again at 11:00 that same day. Under the revised “start on or before the line’s day” rule, the new Plan qualifies and the retired notice returns.

   **Cause:** Plan §7.4 promises continuous admin access but implements it using start **days**. [Grant writes](/C:/rt138b/raptor-port/src/state/units.ts:291) record `todayIso()`, and [adminThen](/C:/rt138b/raptor-port/src/state/notices.ts:300) compares dates. Those values cannot distinguish the two tenures. Changing `<=` to `<` would instead hide legitimate notices received after Plan was first granted that day.

   **Fix:** Record enough information to distinguish separate periods of effective admin access—for example, a tenure identity with an ordered start point—and associate admin notices with the qualifying tenure. Determine continuity from effective access, so removing one overlapping right does not retire notices while another still provides admin access. A verified Undo must restore the previous tenure where the existing restoration rules permit it; a fresh grant must start another.

   Test removal and fresh regrant within one day, both read and unread notices, genuine notices received after a same-day grant, overlapping rights, and Undo. **R-O6/R-A2 remains incomplete.**

3. **High — the revised failed-posting gate still does not prove that an attempt failed.**

   **Failure:** Osprey has a saved, due, unfinished posting in 149, with no last-admin hold. Before the runner attempts it, a forged `posting.failed` command supplies the correct posting identity and audience. It satisfies every predicate listed in §7.7 and falsely tells the admins that the posting could not run.

   **Cause:** “Saved, due, not done, not held” describes both an unattempted posting and a failed one. The separate command fixes rollback survival, but its proposed gate lacks evidence of the failed attempt. Existing notice guards deliberately distinguish a correctly shaped line from a line actually owed by an operation: [perms.ts](/C:/rt138b/raptor-port/src/state/perms.ts:3111).

   **Fix:** Have the runner establish trusted failure evidence only after the final individual attempt has settled and rolled back. Bind that evidence to the exact saved posting, squadron, person, date and outcome. The separate failure operation must require it, recheck that the posting remains applicable, and permit only the corresponding failure record and notices. A caller-supplied flag or command name must not establish failure.

   Test a correctly shaped forgery naming a real due posting **before any attempt**, queued failures, changed or cancelled postings, and group failure followed by successful individual retries. **R-O15/R-A7 remains incomplete.**

4. **Medium — an access-request bell can repeatedly open the wrong squadron’s empty list.**

   **Failure:** Hunter holds Plan of 149 but currently has 142 picked. There is one unseen request for 149 and none for 142. His bell lights. Pressing it opens 142’s Users page, whose Waiting list is empty. The corrected seen logic properly leaves 149’s request unread, so the next press repeats the same journey and continues taking priority over the notice list.

   **Cause:** Plan §5.2 updates the audience and counts, but does not give the request shortcut a destination squadron. [bellTap](/C:/rt138b/raptor-port/src/ui/topstate.ts:49) calls `openAdminUsers()` without entering the request’s squadron. §7.5 addresses taps on notice lines; this shortcut returns before that list opens.

   **Fix:** Resolve an eligible unseen request and its squadron before navigating. Prefer the current squadron when it has one; otherwise choose a defined eligible squadron. Enter it through the normal navigation path, then open its Waiting list. Apply bell switches when choosing what triggers this shortcut, and mark only requests actually displayed.

   Test Plan holders and masters with only another squadron’s request, then requests in two squadrons. Verify the destination, displayed count and remaining unread request. The earlier seen-record fix holds; this is a separate navigation omission.

5. **Medium — the revised Tracker instruction sends View holders through a recovery that cannot work.**

   **Failure:** Hunter has only View of 149. He opens his own 142 Tracker, then picks 149’s schedule. The proposed comparison detects “Tracker 142, pick 149” and tells him to sign out, sign in, pick 149 and open the Tracker. Following those instructions correctly opens 142’s Tracker again: View never grants 149’s Tracker.

   **Cause:** Plan §3.5 and §9 F2 fill the warning from the raw schedule pick. The Tracker’s intended destination is `pageUnit('own')`, which remains 142 for this person. The same distinction applies in member view.

   **Fix:** Compare the bound Tracker with the permitted own-page squadron, and derive any recovery destination from that answer. Show no mismatch instruction when a View holder’s home Tracker is already correct. Combine this with finding 1’s visibility protection, and draw the corrected states before building them.

   Test View-only picking before and after first opening the Tracker, member view, and a genuine master/Plan mismatch. The no-reset decision holds, but **R-O13/R-A1’s wording fix remains incomplete.**

The nineteen §14 rows resolve as follows:

| Round-one row | Round-two assessment |
|---|---|
| R-O1, R-A4 | Holds: archive and overseas grant removals have narrow, record-proven exceptions, including already-suspended accounts. |
| R-O2 | Holds: the shared admin audience reaches the five named consumers. |
| R-O3, R-A5 | Holds: combined Save checks the relevant deltas and complete resulting state. |
| R-O4 | Holds: Plan holders appear on the squadron’s list without inflating its home-person count. |
| R-O5 | Holds: schedule clears and named-squadron settings are distinguished. |
| R-O6, R-A2 | Incomplete: finding 2. |
| R-O7 | Holds: the owed reload precedes the next sign-in and retains no password. |
| R-O8 | Holds: future place occupancy counts; creation and movement are one command. |
| R-O9, R-A8 | Holds for counts and seen records; finding 4 identifies the separate navigation gap. |
| R-O10 | Holds: promotion removes the otherwise hidden grant rows in the same command. |
| R-O11 | Holds: a waiting request prevents removal of its squadron. |
| R-O12 | Holds: only explicit bell choices override later defaults. |
| R-O13, R-A1 | No-reset fix holds; findings 1 and 5 remain around access and destination. |
| R-O14 | Holds: the audience test now uses posting and holiday notices. |
| R-O15, R-A7 | Rollback and individual-retry fixes hold; failure evidence remains missing, finding 3. |
| R-O16 | Holds: both missing drawing cases are expressly required before implementation. |
| R-A3 | Holds: the chosen squadron carries through identity and first-stint creation atomically. |
| R-A6 | Holds: effective access changes include grants and deferred changes, with once-only telling. |
| R-A9 | Holds: archive remains outside global Undo. |

Rulings: none this session.

- **Step A:** holds.
- **Step B:** does not hold — findings 1 and 5.
- **Step C:** holds.
- **Step D:** holds with finding 4.
- **Step E:** holds.
- **Step F:** does not hold — findings 2 and 3.
- **Step G:** holds.