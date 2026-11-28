# Night of 22–23 Nov 26 — the second fix round, the builder's report (the same Opus helper)

Saved as it arrived (chat 149's helper, ~06:55 MPST; 3 commits on `be580dbc3`, branch `claude/msq-b1-screens-135`). Nothing
new on screen; no server started.

- **A1 (high) — an Undo put a Plan back onto a master admin's account.** Red: Astra's case `expected true to be false`
  (the Undo went through, the Plan stood); the same with View, and a Redo of giving the Plan. `state/accounts.ts
  accountsRestoreProblem` refuses an Undo / Redo that would leave a right on a master admin's account before anything
  moves, in D148's words "Something else changed this after your action — it can’t be undone now."; `state/perms.ts
  unitRowViolation` no longer lets a restore through "a right on a master admin's account" (§15 D14, every command).
  `data-model.md` UnitGrant row. Test `src/state/msq-fix4-undo-plan-master.test.ts` (4; one checks an Undo still passes
  when nobody made him master since). `cd7940e06`.
- **A2 + N1 (medium) — Approvals kept the old squadron's war after a pick.** Two causes. The walker's: a war loaded in
  place after a pick restarted its change count at 0 (`leavewar/state/store.ts initStore`), so a few changes later it
  could match the old number and the page (which redraws when it moves) never redrew — a war loaded in place now moves the
  count on. Astra's: `leavewar/ui/ApprovalsPage.tsx` kept its drawn rows, filter, date picker and armed Approve all by the
  period id alone, shared by two squadrons' periods with the same dates — now by the war's squadron and period together.
  Red: `149's request shown: expected 0 to be greater than 0`; `the count after loading u149's war is new: expected true
  to be false`; `no 149 line under 142: expected 1 to be +0`. Test `src/leavewar/msq-fix4-approvals-pick.test.tsx` (3).
  `7073dceda`.
- **A3 (low) — an Undo of "+ New squadron" stayed on Admin → Data.** Red: `after the Undo: expected 'admData' to be
  'admSquadrons'`; from another page `expected 'admUsers' to be 'admSquadrons'`. `state/view.ts requestAdminSquadrons`;
  `ui/AdminPage.tsx` opens the panel a request names, and starts on it when first drawn; `state/undo-wire.ts landingOf`
  every Undo / Redo of a squadron or place lands on Admin → Squadrons (pressed there, it stays); an account step still
  opens Users. `src/ui/msq-fix3-admin-panel-undo.test.tsx` +2 (4 pass). `41ca09274`.
- **Q1 — no "Plan of 149 ended" line when the master mark drops a right.** No ruling or plan line decides it: D2251 and
  the People & accounts page — told whenever "View or Plan given or ended" and "master admin made or unmade"; plan §7 item
  6 — "What owes a line is a change of his access in force". The silence comes from the builder's reading in
  `state/acctlines.ts accessParts` ("the Plan rows his Save drops tell nothing — Full access covers them (§4 item 5)").
  The case: Hunter holds Plan of 149; Saber makes him master, then admin again; his bell reads "Made a master admin ·
  Saber", then "Master admin taken off · Saber"; nothing says Plan of 149 has gone, and after the mark comes off he has no
  access to 149. Recommendation: leave it — while master he has more access, nothing has ended; "Master admin taken off"
  tells him the access went. Nothing changed.
- **Q2 — the Undo bubble of a Save that renames and gives access.** D2326 sets an access change's words only ("Undid:
  Plan of 149 given · Hunter"); nothing covers a Save that also renames. Today: "Undid: Plan of 149 given · Hunter",
  though the one Undo puts the sign-in name back too. A possible wording: "Undid: Plan of 149 given and his sign-in name ·
  Hunter" — new words, drawn first (D1625). Nothing changed.

**Checks:** unit tests under the lock in three parts (all msq, request, bell, account, save-access, Approvals, undo, the
two source scans, every Leave War and Leave War screen file, the account-door and master-mark files, the new files) —
409 files: 5268 passed, 2 expected to fail, 20 skipped, 0 failed; `npm run build` under the lock; `lint:changed` no new
finding (466 files); docsize. No CSS.

**Left for him:** Q1, Q2; the refused bell press's message; F2; Q3 (Escape does not close an opened Users row — noted
only); A3 changes where an Undo of a squadron step pressed from another page lands (Admin → Squadrons, was Users); Astra's
three tidiness notes filed in the read. Owed: a re-walk of A2 / N1 and A3 on the real app.
