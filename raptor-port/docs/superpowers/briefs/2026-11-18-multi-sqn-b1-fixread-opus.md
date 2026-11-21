# The fresh, blind Opus read of the fixes — multi-squadron batch 1's full check (18 Nov 26)

Head: a fresh Opus agent (Agent tool, model opus, a new agent, not the check lead), brief `FIX-READ-BRIEF.md` (saved
beside this report as `2026-11-18-multi-sqn-b1-fixread-brief.md`), working only in the exported copy of `43273f997`
(app code = the fixes, `a7d0e9e22`, on step 4's `7e0a7c661`) at `scratchpad/fixread/copy`, the walk's results, the
evidence sheet below its job-5 heading and every earlier reader's report removed from the copy; blind to Astra's fix
read (finished 06:52:15, before this one started; kept outside the copy, and the agent told not to open any `astra*`
file). Started Wed 18 Nov 26 06:52:54 MPST, finished 07:13:34 (the reader's own clock). Its proof tests stayed in
`scratchpad/fixread/opus-proofs/` (linked into the copy as `raptor-port/src/__proof_opus__/`), never in the app. Saved
as it came.

---

# Fix read — multi-squadron batch 1, full check (11 faults + 1 wording change). Blind Opus read.

Start: Wed Nov 18 06:52:54 MPST 2026 · End: Wed Nov 18 07:13:34 MPST 2026

**What I opened and what I did not:**
- The chat was compacted partway through this read. After it, a start hook asked me to open this chat's `HANDOFF.md` block in the live checkout. My brief forbids that, so **I did not open it, and I did not read any handoff block.**
- I opened nothing under `C:\Users\User\projects\Raptor`.
- I opened no `astra*` file, no forbidden brief and no part of the evidence sheet below its "## The full check (job 5)" heading.

**How the proofs run:**
- Every proof is in `scratchpad\fixread\opus-proofs\`, which is linked into the copy as `raptor-port\src\__proof_opus__\`.
- The link points outside the copy, so a plain `npx vitest run` fails with "Cannot find module /@fs/…". The proofs need `opus-proofs\proof.config.mts`, which merges the copy's vite config and turns on `preserveSymlinks`. Run from `copy\raptor-port`:
  `VITE_CONFIG_NATIVE_IGNORE_WARNING=true npx vitest run --config src/__proof_opus__/proof.config.mts --root . src/__proof_opus__/<file>`

**Important for the host:** the fake store in the proofs has `keys()`. Without it, settings records cannot be listed, account changes drop out of the change, and finding 1 wrongly passes. The existing suite's postout-outcomes "Fable 6" test expects Saber deleted. It passes today only because its fake store has no `keys()`.

---

## Findings, by consequence

### 1. HIGH — introduced by fix 4. A posting with Delete for the master stops the whole posting pass, and the pass then overflows the stack.
- **Failure:**
  - Post Saber (stiff, the demo's master) out with outcome Delete on 16 Jul, and Ranger (bane) out overseas on the same date.
  - On the 16th, any admin's session runs the posting pass (`runPoOutcomes`).
  - The pass is one command, `lw.postoutRun`. It now removes Saber's account row.
  - Fix 4 judges the master mark on the whole account list (`masterMoved`), so the gate refuses the command with "member-writes-own: the master mark changes only by its own command".
  - Every posting due that day is refused with it: Ranger is not archived and his account is not switched off. Nobody is told why.
  - `runPoOutcomes` then calls `raptorNotify()`. The subscriber in leavewar/sync.ts (about lines 3143–3154) runs `lwSyncTurn(() => { runPoArchive(); runOilPass() })`, which starts the pass again and is refused again. This recurses until "Maximum call stack size exceeded".
  - In the real app this is a page that hangs or errors on every load from that date, for every admin.
  - Before fix 4, the pass silently deleted the only master. That was wrong too, but it did not freeze anything.
- **Same cause on Admin → Users:** a plain 142 admin who presses Delete on Saber gets "That did not save" (`saidOf`, invalid). The words do not say he is the master.
- **Cause:**
  - state/perms.ts `masterMoved`, which compares the whole account list (fix 4) inside section 6 `unitRowViolation`;
  - leavewar/sync.ts `runPoOutcomes` (2522 and on): one command for every posting, with no hold for a master's account;
  - its `raptorNotify()` after `settle()`, which re-enters through the subscriber.
- **Fix:**
  1. In `postOutProblem`, and in `deleteAccountProblem`/`deleteProblem`, refuse up front for a master's account: "Saber is a master admin — clear his master mark before he is deleted." This stops the posting being set at all.
  2. In `deleteBlocked`/`poHeldReason`, hold a due Delete posting whose person holds a master account, with the same reason. That posting is then skipped, and the others due that day still run.
  3. Break the loop in `runPoOutcomes`: when the command comes back refused, do not call `raptorNotify()` synchronously. Alternatively, keep a set of the posting keys tried this turn and skip them on re-entry.
  4. Change the existing "Fable 6" test so its fake store has `keys()`, and expect the Delete to be held, not Saber deleted.
- **Proofs:** `opus-proofs\f-pass-master.test.ts`
  - C1, "a posting's Delete of the master never holds up another man's posting": **FAILS** after about 33 s with "Maximum call stack size exceeded".
  - C2, the control (Rocky, a member, deleted instead): **passes**; both postings run.
  - C3, the gate's answer read directly: **passes**, showing the refusal message "the master mark changes only by its own command", which confirms the cause.

### 2. MEDIUM — already there; fix 2's check is too narrow. The home-row gate judges a row only against his squadron TODAY.
- **Failure:** section 8 (`homeUnitViolation`) asks whether the actor is an admin of his squadron today, and refuses a "day already begun" only when `h.from < tomorrow && h.unit !== nowU`. A forged home row dated in the past or the future moves him on other dates, and the admin of the squadron he leaves on those dates is never asked.
  - **F1:** the master moves Osprey (osp9) from 149 to 142 on 1 Oct 26. On 1 Nov, Prowler (ad2, 142's plain admin) writes a home row {osp9, u142, from 2026-09-01}.
    - It is accepted.
    - Mid-September now reads 142, so 149's days already begun are rewritten.
  - **F2:** the master moves Ranger (bane) to 149 from tomorrow. Prowler writes a row {bane, u142, from the day after}.
    - It is accepted.
    - 149 has him for one day. Its admin was never asked.
  - **F2b:** Prowler writes {bane, u142, from tomorrow} with the id 'hzzzzz'. On a same-date tie the later id wins, so the master's move is cancelled outright.
- **Cause:** state/perms.ts section 8 home loop (in the 1192–1426 range).
  - It uses `adminThere` on `homeUnitOn(…, today)` only.
  - Its day check compares against today's unit, not against the before-state on the row's own dates.
- **Fix:**
  1. For each changed home row of a person, collect the dates at which his squadron could differ: every `from` in his rows before and after, plus `h.from`.
  2. At each of those dates d, compare `homeUnitOn(before, pid, d)` with `homeUnitOn(after, pid, d)`.
  3. If they differ and d is before tomorrow, refuse ("a home changed for a day already begun").
  4. If they differ at all, the actor must be an admin of the before-squadron on d. Being an admin of the after-squadron is already checked by section 6.
- **Proofs:** `opus-proofs\f-home-dates.test.ts`. F1, F2 and F2b all **FAIL**: each forged row is accepted.
  - Each forged row is written through `commitSettingsIntent('home.set', …)` and then `unitsLoad()`.
  - Each is a forged command; the typed `setHome` writes only from tomorrow. The brief counts a forged command as a door.

### 3. MEDIUM-LOW — introduced by fix 11. Two kinds of change-history line are filed under the wrong squadron.
- **(a) A mission-role line from 149 goes to 142.**
  - The line's `sub` is the formation's row id (state/changelines.ts, the insights.role line: `sub: role.formationRid`), and it has no key.
  - The new rule in editlog.ts `push()` (`u = row.sub && !row.key ? homeUnitOf(row.sub, date) ?? UNIT : UNIT`) reads that id as a person.
  - No home row matches it, so it takes the demo's fallback, 142. A 149 admin's mission-role answer on 149's schedule therefore shows in 142's history and not in 149's.
- **(b) An Undo line goes to the squadron in view.**
  - `logReversed` writes "Undo — <label>" with `{date, sect:'day'}` and no `sub`, so it is filed under the squadron in view.
  - Example: the master changes Osprey's CAT from 142's view, then presses Undo. The change itself goes to 149, which is fix 11 working, but its Undo line "Undo — Osprey's CAT" goes to 142. That is the same leak fix 11 closed.
- **Cause:** engine/editlog.ts `push()`, the new `u` rule; state/changelines.ts, the mission-role line; `logReversed`.
- **Fix:**
  1. In `push()`, use the man's squadron only when `sect` is 'abs' or 'quals', or when `PEOPLE[row.sub]` exists. Otherwise use `UNIT`.
  2. In `logReversed`, file the line under the squadron of the person whose records the reversed command changed (people/inputs/lw.* ids). Pass that person's id as `sub`, or pass an explicit `u`.
- **Proofs:** `opus-proofs\f-history-unit.test.ts`. Both **FAIL**:
  - A: the line is stored with u='u142'; expected 'u149'.
  - B: the Undo line is stored with u='u142'; expected 'u149'.

### 4. LOW-MEDIUM — partly introduced by fix 5/the squadron doors. Admin → Users, as a 142 admin acting on a 149 man: three doors give wrong or raw words.
- **What each door says**, as Prowler on Osprey:
  - Suspend: "He is 149's. Only an admin of 149 can change his account." Correct.
  - Delete: the same words. Correct for an account. For a man with no sign-in, "his account" is slightly off.
  - Archive shows the raw gate text: "member-writes-own: a person of another squadron (u149) changed by one who is not its admin (people/osp9)". `archivePerson` returns `r.message` unchanged.
  - Save name says "You can only edit your own row", which is untrue for an admin.
  - Restore and Restore as say "That did not save".
- **Fix:**
  1. Add a person-level twin of `otherSquadronProblem`, for example "He is 149's. Only an admin of 149 can change him."
  2. Call it first in `archiveProblem`, `restoreProblem`/`restoreArchivedAs` and `updatePersonField` when the actor is an admin.
  3. Never pass a gate's `message` to a toast raw.
- **Proof:** `opus-proofs\f-pass-master.test.ts` E: **FAILS** for Archive, Save name and Restore.

### 5. LOW — introduced by fix 5. The posting and archive doors still word the lock as the whole app's.
- **Failure:** Kestrel (kes9) is 149's only admin, while 142 has three admins who can sign in. Yet:
  - `postingBlocked('kes9','overseas')` says "Kestrel is the last admin who can sign in — the posting waits until another admin can";
  - `archiveProblem('kes9')` says "Kestrel is the last admin who can sign in — he can't be archived until another admin can".
- **Cause:** leavewar/sync.ts `poHeldReason`/`deleteBlocked`/`archiveProblem` build their own sentence instead of using `lockProblem`'s per-squadron one.
- **Fix:** use `lockProblem`'s sentence ("Kestrel is 149's last admin…"), with the door's own ending.
- **Proof:** `opus-proofs\f-pass-master.test.ts` D: **FAILS**.

### 6. LOW — introduced by fix 2's day check. On a shared store, placing a man who has no squadron is always refused.
- **Failure:** `setHome` writes a row from today for a man with no squadron. On a shared store his squadron today is null, so `h.unit !== nowU` is always true, and the gate refuses with "a home changed for a day already begun".
- No screen offers this yet, and I wrote no unit test for it.
- **Input for the host:** `setUnitSeeds(false)`, squadrons stored, sign in as the master, then `setHome(<pid with no home row>, 'u142')`. Expected ok; actual: refused.
- **Fix:** in section 8's day check, allow a row from today when his squadron today (`nowU`) is null.

### 7. Gap beyond the fixes' promise — already there. A 142 admin can rewrite a 149 man's inputs.
- **Failure:** as Prowler, `writeInputsBatch` on her9's input (149) with `remarks = 'rewritten by 142'` is accepted.
- D2132 keeps inputs with his own squadron, and the remarks can be private.
- **Fix:** in perms.ts, add a section that judges input rows by the person's squadron on the input's date, as section 8 does for people rows.
- **Proof:** `opus-proofs\f-inputs-cross.test.ts`: **FAILS** (accepted).

---

## Fragile, not exploitable (noted, no finding)
- Sections 7 and 8 read the account (`acct`) from the live accounts list, which may already hold the command's after-state. It is not exploitable today, because the own-account "was" image is still refused. To be safe, use the before-image, as section 6 does.
- The changes window's memo key (changesmodel.ts, around lines 416 and 453) does not include the squadron in view. It will go stale when one person switches squadron, which arrives with step 5.
- A plain admin can suspend or archive the master's account. No ruling forbids this, so it is not reported.

## Explicit negatives (checked, found sound)
- **Fix 3:** `mayEditQualsOf` with `ofMySquadron`. Correct for the master, for members, and for the bridge's raised role.
- **Fix 6:** approving a request no longer calls `putNewHome`; only approving one as new does. No double home row (`putNewPerson` writes none).
- **Fix 7:** the week cache key now carries the squadron. No other week cache is left unkeyed (`XD_CACHE` is reset on each check).
- **Fix 8:** the sweep and remap act only on the squadron in view.
- **Fix 9:** `onSavesLanded` statuses, the reload after sign-out, the live session binding, and a double reload (harmless). Signing in before the waiting save lands is the known open question and is excluded.
- **Fix 10:**
  - a forged move of his own account to another person is refused;
  - a grant to 149 and a home in 149 are refused by section 6;
  - a change to the master mark is refused.
- **Section 8's "made" exemption:** cannot be abused; its before-images are real.
- **Undo:** the gate passes on the same day for Undo of adding a person, of `home.set` and of person changes.
- **The first account write:** stores the seeded rows unchanged and skips them.
- **The lock per squadron (`lockProblem`, `lastAdminIfGone`, `deleteAccountProblem`):** correct in logic; only the words in other doors are wrong (finding 5).
- **142's normal admin work, sign-out/sign-in into the home squadron (`switchUnit` with flush and load), and the change history's counts and clear** in the squadron in view: no regression found beyond findings 1 and 3.

## Proof files
All in `C:\Users\User\AppData\Local\Temp\claude\37df10f156419f1e\4b825657-ab4e-4e7a-aba0-42051bdae95b\scratchpad\fixread\opus-proofs\`:
- `proof.config.mts`: the run config.
- `f-pass-master.test.ts`: C1 FAILS (stack overflow), C2 passes, C3 passes, D FAILS, E FAILS.
- `f-home-dates.test.ts`: F1, F2 and F2b FAIL.
- `f-history-unit.test.ts`: A and B FAIL.
- `f-inputs-cross.test.ts`: FAILS.
