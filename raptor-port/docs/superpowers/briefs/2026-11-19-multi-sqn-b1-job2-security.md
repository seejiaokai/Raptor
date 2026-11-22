# Job 2 — the security read (a fresh Opus reader looking only for holes across squadrons — D1411; 19 Nov 26; proof tests one file at a time)

Read of an exported copy of `claude/multi-sqn-b1-107` at `2b792ebc5` (job 1 = `b63195c56..2b792ebc5`), brief `…-job2-read-brief.md` (the readers' shared brief, saved beside this file). Blind to the walk of the running app and to every other reader's report. Saved here by the check lead after all four had reported (19 Nov 26); the report below is unchanged.

---

# Security read — job 1 of multi-squadron batch 1, fix read 2 (copy at 2b792ebc5)

Reader: the security reader (fresh, blind to the other readers and to the walk). Scope: holes only — who may do or see
what, above all across 142 and 149. Proofs: `raptor-port/src/__proof_sec__/sec-state.test.ts` and `sec-war.test.ts` in
the copy (also in `scratchpad/job2/proof-sec/`). Each test asserts what the rulings say should happen; red = hole open.
Run one file at a time from the copy's `raptor-port/`: `npx vitest run src/__proof_sec__/<file>`.

Results: `sec-war.test.ts` — control green, 2 red. `sec-state.test.ts` — 8 red.

Ranked by consequence.

---

## SEC-5 (HIGH) — 142's plain admin posts the master out (archive + account suspended) through the A3 store

**Command-only** (a crafted command; no screen offers it).

- **Setup:** Hunter (`ad2`, 142's plain admin) signed in, 142's war loaded, the world door wired (as boot.ts wires it).
- **Action:** one command (`lw.postout`, an admin's type) that enlists `foreignWar('u142')` and sets Saber's window to
  `{ ...his window, to: '2026-07-14', poArchive: true }` — an Overseas Sqn posting. It commits as
  `lwx.profile/u142@stiff`.
- **What happens:** the command is accepted; foreign.ts's commit hook writes `profile:stiff` into 142's stored war. On
  the next load of 142's war (a reload, a sign-in, a swap) the posting pass runs it as the app: Saber is archived
  (`archivedBy 'po'`), and his account is switched off (`on:false, offBy:'po'`). Proof (`sec-war.test.ts`, test 3):
  received `{ ok: true, storedTo: '2026-07-14', archived: true, archivedBy: 'po', acctOn: false, offBy: 'po' }`.
- **Expected (D2205, the rule 7b states):** "an Overseas Sqn posting (archive and suspend) only by a master". The
  control test shows the same posting written as `lw.postouts/stiff` is refused (`…master admin…`).
- **Cause:** `state/perms.ts` `warUnitViolation` (≈ line 1366) filters `String(c.collection).startsWith('lw.')`, so
  `lwx.*` is never looked at; its master-posting loop reads only `lw.postouts`. Section 7 checks only that the actor is an
  admin of the unit in the `lwx` id — Hunter is 142's. The posting pass does not catch it either: `leavewar/sync.ts`
  `poHeldReason` (≈ line 2500) holds an Overseas posting only for the last-admin lock, not for a master; and the
  master guard G1 (`accountShapeAndMasterViolation`) is not asked of the app's own pass.
- **Introduced by job 1:** yes — the `lwx.*` collections are A3's (commit 5d4a0f14a). Job 1's own gate test (A3 test 6)
  tries `lwx` only for `u149` (another squadron), never for the actor's own squadron.
- **Fix:**
  1. In `warUnitViolation`, take `lwx.profile` changes into the master-posting loop: the man is `localOf(c.id)`;
     a Delete outcome for a master is refused for everyone; an Overseas outcome for a master needs `actorMaster`.
  2. Refuse any `lwx.*` change whose unit is the war loaded (`unitOf(c.id) === lwUnitNow()`): A3 never writes the loaded
     war through the second store, and allowing it also lets the stored rows and the loaded store drift apart.
  3. Better still, allow `lwx.*` only in the four door types (`person.archive`, `person.restore`, `person.delete`, and
     the Restore-as type) — the A3 brief says they are its only writers.
  4. Belt and braces: in `poHeldReason`, hold an Overseas posting for a master whose posting record was not set by a
     master (or hold every master's Overseas posting with the sentence the master sees).
- **Test that fails today:** `sec-war.test.ts` tests 2 and 3.

---

## SEC-4 (MEDIUM) — an input is judged by its man's squadron on its first day only; reachable from the Inputs page

**Screen** (the Inputs page — likely; I proved it through the input write path the page uses, not by driving the page).

- **Setup:** the master moves Ranger (142) to 149 from tomorrow (`setHome('bane','u149')`, today 15 Jul 26).
- **Action:** Hunter (142's plain admin) files LL for Ranger from 15 Jul to 24 Jul. On the Inputs page, Ranger is still
  in Hunter's list today (`ui/inputedit.tsx rosterOptions` → `rosterOf(unit)` with today's home).
- **What happens:** accepted. From 16 Jul that leave stands on **149's** schedule (`inputBelongs(r,'u149','2026-07-20')`
  is true). And the reverse: Kestrel, 149's own admin, cannot shorten or remove that leave on his own man's 149 days —
  refused, because the gate judges it as 142's. After the move, the old leave is still listed on 142's Inputs page
  (listed by its start date), so Hunter can go on extending it into 149's time; Kestrel's Inputs page does not list it.
- **Expected:** D2132 / 7c's own words — "a man's inputs are his own squadron's"; another squadron is View only (D2094,
  D2160 Q5). A leave that covers days a man is 149's is (at least in part) 149's business.
- **Cause:** `state/perms.ts` `inputUnitViolation` (≈ line 1284): `iso = inputAtIso(r.date, r.yr)` — one date, the
  first day. The schedule reads it per day (`engine/inputs.ts inputBelongs(r, unit, at)`).
- **Introduced by job 1:** yes (7c is job 1's; it reads only the first day).
- **Fix:** in `unitsOf`, collect the man's home on every date the input covers on which it can differ — its first day,
  its last day (`endDate`), and every home row's `from` between them (the same set of dates G2 uses) — and require the
  actor's level in each. Decide (a product question for him, if not ruled) whether an input spanning a move needs both
  squadrons' admin or splits at the move; the minimum security fix is "both".
- **Tests that fail today:** `sec-state.test.ts` SEC-4 (both).

---

## SEC-2 (MEDIUM-LOW) — an admin's bell line to another squadron's man rides past 7e two ways

**Command-only.**

- **(a) The holiday part as a pass.** `adminOwnerViolation` skips the WHOLE line when ANY part is `oilhol`
  (`state/perms.ts` ≈ line 1767). Hunter writes Osprey (149) a line with `[{k:'oilhol',…}, {k:'lw', code:'LL', d:'refused'}]`
  — Osprey's bell shows a "leave refused" from 142. Accepted (proof: `ownershipViolation` returns null).
- **(b) Any changed input as a pass.** It also skips any line whose `iid` is an input the same command changes
  (≈ line 1769), whoever the line is addressed to. Hunter changes his own man's (Ranger's) input and, in the same command,
  writes Osprey a line naming it; Osprey is neither in that input nor its filer. Accepted. The same skip lets him DELETE a
  149 man's line about such an input.
- **Expected:** D2194 — no bell line about one squadron's business reaches the other's people unless it concerns both.
  The skip is meant only for the tell of that input (tellPass: its people and its filer).
- **Introduced by job 1:** yes (7e is job 1's).
- **Fix:** (a) skip only when every part is `oilhol`. (b) skip only when `to` is someone the tell would address — a person
  named in that input's before or after image, or its filer (`by`, `grpBy`, an entry's `by`) — else judge `to` as usual.
- **Tests that fail today:** `sec-state.test.ts` SEC-2 (both). Job 1's own control (a plain line to Osprey is refused)
  still passes, so the gate is wired; only these two doors are open.

---

## SEC-3 (MEDIUM-LOW) — a member sends a bell line to another squadron's man

**Command-only.**

- **Setup/Action:** Ranger (142 member) changes his own input and, in the same command, pushes a notice
  `{ to: 'kes9', by: 'bane', iid: <his input>, name: '149: all flying cancelled tomorrow', what: [{k:'del'}] }`.
- **What happens:** accepted at the gate and through the real input door (`writeInputsBatch`) — the line reaches
  Kestrel's bell with any name text Ranger chose.
- **Cause:** 7e (`adminOwnerViolation`) is admin-only; the member branch's `notices` case (`state/perms.ts` ≈ line 1873)
  checks only that the line rides his own input change, names him, and is to someone else — never who it is to.
- **Introduced by job 1:** no — the member rule is older; the cross-squadron harm exists since multi-squadron batch 1.
  The brief asks for every door that writes a bell line, the actor a member included; 7e covers admins only.
- **Fix:** in the member `notices` case, require `n.to` to be a person named in the input it rides (before or after) or
  its filer — the people tellPass tells. With 7c already holding a member's input to his own squadron, that closes it.
- **Tests that fail today:** `sec-state.test.ts` SEC-3 (both).

---

## SEC-1 (LOW) — another squadron's admin's "seen" records: `apprseen:` and `reqseen:`

**Command-only.**

- **Action:** Hunter runs `lw.apprseen` naming himself as owner (`meta.owner = 'prowler'`) but writes
  `apprseen:kes9` far in the future; and `access.seen` naming himself but writing `reqseen:acad9`.
- **What happens:** both accepted. Kestrel's Leave War Approvals then marks no request "New"; his record of seen access
  requests is rewritten.
- **Cause:** `cmdAuthorize` reads only the owner the command names; for an admin nothing reads the row the command
  actually wrote. 7e covers `seen:` and `noticeseen:` but not `apprseen:` and `reqseen:` (both community rows,
  `storage/keyowner.ts`). §11 gives an admin these rows "own" only.
- **Introduced by job 1:** no (an admin could do this to another admin of his own squadron before); the cross-squadron
  form is the missing call site next to 7e.
- **Fix:** in the gate (beside the `lwseen:` own-row rule, which already applies to every role): an `apprseen:<pid>` row
  only by `lw.apprseen` and only `pid === actor.personId`; a `reqseen:<accountId>` row only by `access.seen` (or the
  account writers that maintain it) and only for the actor's own account id. If another admin's row must ever be written
  (an account removal), judge it by 7e's squadron rule.
- **Tests that fail today:** `sec-state.test.ts` SEC-1 (both).

---

## Checked and found nothing (explicit negatives)

- **Section 7 on `lwx.*` for another squadron:** Hunter writing `lwx.*/u149@…` is refused; a member writing any `lwx.*`
  is refused (job 1's A3 test 6, read and agreed). An `lwx` id with no unit is written nowhere (foreign.ts skips it).
- **7b, the war probe:** sign-in swaps the war to the signed-in person's squadron (A3 tests); the probe answers only while
  the world door is set (boot sets it). A posting set in 142's war for a 149 man is refused at the posting pass
  (`postingPassViolation`'s new home check) — the cost is 142's own whole pass, not 149's people.
- **Accounts and people (G0, G1, section 8):** a 142 admin changing a 149 man's person, account, role or sign-in, or
  re-pointing an account onto a 149 man, is refused both sides; the master's account is held by G1 for every non-system
  actor. A home move in or out is held by section 6 (the unit joined) and section 8 (the unit left), on every date.
- **Grants:** an admin cannot grant himself or anyone rights in a squadron he is not admin of; the D2203 drop rides
  `home.set` and deletes only grants section 6 lets him delete.
- **Master-only commands:** `unit.add`, `account.master` — master only; the mark never on his own account; one left.
- **History lines (7d):** filing under another squadron is redirected to the unit in view; a sweep or rewrite of another
  squadron's line is refused (job 1's tests, read and agreed). A raw write outside every command is the raw store's (as
  the brief says).
- **Tracker (7f):** the probe is bound once, at the Tracker's first load, to the signed-in person's own squadron; Tracker
  commands exist only after that load. Guests and pending people are refused everything by the member branch.
- **Members:** settings rows other than their own `seen:`, `noticeseen:`, `lwseen:` are refused; `lwx.*`, the war's own
  admin records and homes are refused; 7c holds a member to inputs of his own squadron (his own taking-out excepted, and
  `ownPart` keeps that to taking himself out only).
- **Undo / Redo:** no unit section is skipped for a restore; the master mark's restore still needs a master.
- **The developer bridge's raised role:** localhost only (`probe-bridge.ts`); not a hole.

## Not examined (out of time or out of scope)

- Whether `lw.current` (the period on screen, let through for members and excluded from 7b) is stored per squadron and
  shared by its viewers — if so, anyone who loads another squadron's war could change what that squadron sees first.
  Unverified; low.
- Reads (what one person SEES of another): no new read door found in job 1 beyond `readForeign`, which runs only after
  `otherSquadronPersonProblem` passes.
