# M5a's security read (D1411) — a fresh Opus reader, read-only, on commit a780f063c (29 Oct 26)

Kept as the reader handed it back. Scope: who may write a typed figure, a grade, the grades list, the lock and a last
visit (the build spec §3's list). Its scratch tests are in the session scratchpad (`sec/m5a.sec.test.ts`, run with its own
config), not in the repo; each case below is spelled out so the next chat can write its own red test. "Accepted" means
`ownershipViolation` returned null AND, where a command was run, the commit came back ok with the change in its envelope.
D56 applied: nothing below lives only in stored demo data.

## 1. MEDIUM — a forged snapshot passes the gate, and a member gains a day for each weekend or holiday entry he forges
`state/perms.ts ownershipViolation`, the `lw.balance` case, checks `snap` only through `LW_BAL.sameSnap` →
`leavewar/engine/leaveyear.ts sameSnapshot`, which compares the two lists by a key made of each entry's date and half
**run together with no separator** (`${e[0]}${e[1]}`), and never checks an entry's shape. So `['2026-07-1', '8day']`
has the same key as `['2026-07-18', 'day']`, and keeps its place in the sort as long as the next entry's date sorts after it.

Failure (member `bane`, unlocked; the store's own snapshot for an approved LL Sat 18 – Mon 20 Jul 2026 is
`[['2026-07-18','day'], ['2026-07-19','day'], ['2026-07-20','day']]`): a hand-made `lw.balance` command — inside its
`apply`, `setTypedBalance('bane','LVE',20,0)` and then the stored row's `snap` replaced by
`[['2026-07-1','8day'], ['2026-07-19','day'], ['2026-07-20','day']]`. The commit is accepted with that `snap` in its
envelope; his LVE figure reads **21** where the honest typing reads **20**. Why: the engine charges the snapshot NOW
(`snapRow` → `chargedDays`): the junk date `'2026-07-1'` with the unknown half `'8day'` is charged a full weekday (1),
where the real Saturday charged 0, so one more day is "already counted" and comes back to him. Each forged weekend or
holiday entry with its own junk date gains a day; an `'am'` entry forged to `[date-less-a-digit, digit+'am']` gains half.
Also accepted by the same case (no gain, but the row is wrong): `by: ['bane']` (an array — `String(['bane'])` is
`'bane'`), and any extra field of any size (`junk: 'x'.repeat(…)`) — saved into his row and every device's store.
On a reload `readTypedBal` refuses such a row (bad date, half or `by`), so his figure then silently reads "never typed" —
a different figure on another device or after a refresh.

Fix, step by step:
1. In `leavewar/state/store.ts`, `readTypedBal` is already the one exact shape rule. In `ownershipViolation`'s
   `lw.balance` case, after the replay check and the plain-object test, require the record to BE that shape exactly:
   `const canon = readTypedBalShape(v, kind)` (move `readTypedBal`'s body into a pure function both modules can import
   — e.g. `leavewar/engine/leaveyear.ts` — so `perms.ts` does not import the store) and refuse when
   `!canon || JSON.stringify(canon) !== JSON.stringify(v)` with `a balance that will not read (${where})`. That alone
   refuses a non-string `by`, an entry that is not `[yyyy-mm-dd, 'am'|'pm'|'day']`, and any extra field.
2. Make `sameSnapshot` compare entries, not a run-together string: key each entry as `JSON.stringify([e[0], e[1]])`
   (or `${e[0]}|${e[1]}`), and refuse any entry that is not a 2-item array of a string date and a known half before
   sorting (so the `HALF_RANK[undefined]` NaN comparator can never reorder).
3. Keep the existing order of checks: `by`, `day`, halves, `cf`, then the snapshot.
4. Red tests (`src/leavewar/m5a-gate.test.ts`): the Sat 18 – Mon 20 Jul case above refused with "snapshot" or "will not
   read"; `by: ['bane']` refused; an extra field refused; and the honest typing still accepted.

## 2. MEDIUM-LOW — the change history and the Undo words say what the caller wrote, not what was saved
`state/changelines.ts balanceLines` takes the line's figures from the command's note (`env.detail`, the caller's
`meta.key`): `to = note.to ?? <the record>` and `from = note.from`. `undo/describe.ts balanceLabel` does the same for the
Undo button. Nothing checks the note against the record.

Failure 1 (member `bane`, accepted): a hand-made `lw.balance` command with
`meta.key = '{"k":"LVE","from":{"amount":18,"cf":0},"to":{"amount":20,"cf":0}}'` whose `apply` calls
`setTypedBalance('bane','LVE',95,0)` (the inner gesture joins the outer command, so the outer note is the one kept).
The gate accepts it (the row itself is honest), the store holds **95**, and the change history line reads
"LVE balance 18 → 20 · Ranger". The admin reading the history to see what members typed sees a two-day correction where
the man put 95.
Failure 2 (through the exported writer, accepted): `setTypedBalance('bane','CCL',40, undefined, { amount: 39 })` with
his running CCL at 0 — the line reads "CCL balance 39 → 40" for a jump of 40.

Fix, step by step:
1. `balanceLines`: take `to` from the record always — `to = { amount: a.amount, ...(typeof a.cf === 'number' ? { cf: a.cf } : {}) }`;
   use the note's `from` only when the note's `to` equals that record exactly (amount and cf), else write the
   no-"from" form ("LVE balance → 95").
2. `balanceLabel` in `undo/describe.ts`: the same rule, `to` from the step's `lw.balance` after-image.
3. For `from` itself (the running figure shown before): it cannot be trusted from the caller. Either (a) accept the
   reduced line above as the rule whenever the note disagrees with the record, which closes failure 1; or (b) to close
   failure 2 as well, compute it on the gate side: add `runningBefore(pid, kind, beforeRow)` to the `LwBalanceProbe`
   (`leaveFiguresOf` with that one typed row replaced by the change's before-image) and refuse a member's forward write
   whose note `from` differs (`who typed a balance` style message: `the figure a balance came from`). (b) is the one the
   server will need at the database step; (a) is enough for now — the agent's reading, his to choose.
4. Red tests: failure 1 writes "→ 95" (or is refused under 3b); failure 2 is refused under 3b.

## 3. LOW — no upper bound on a typed figure
Neither `balanceProblem` (the box) nor the gate bounds the figure: `readFig` in `BalancesPage.tsx` accepts any run of
digits and `isHalfNum` passes up to about 9e307. Failure (accepted, through the box itself): Ranger types
`1000000000000000000000` in his CCL box → saved; every viewer's Balances page and his person window show `1e+21` in his
row. Fix: one bound in one place — e.g. `const FIG_MAX = 999` — refused when `Math.abs(amount) > FIG_MAX` (and `cf`) in
`balanceProblem`, in the gate's `lw.balance` case and in `readTypedBal` (step 1 of finding 1 then carries it for free);
the box's words "Type a figure from −999 to 999". Red test: 1e21 refused by the box and by a hand-made command.

## 4. LOW — an admin can write another man's last visit and wipe his "changed since you last looked" dots
§11 gives `LeaveSeen` "C R U **own**" to an admin as to a member, but `ownershipViolation` returns at once for an admin, and
`cmdAuthorize('lw.seen', admin, { owner: <his own pid> })` checks only the owner the caller CLAIMS. Failure (accepted):
signed in as Saber, `commitSettingsIntent('lw.seen', { owner: 'stiff' }, () => store.set('lwseen:bane', { at: Date.now() }))`
writes Ranger's row; any `settings.*` command of an admin can too. So an admin who deleted or moved Ranger's leave can set
Ranger's last visit to now, and Ranger's window shows no dot and no struck-through line for it — the one thing the dots
exist to tell him (D1231, D1481). The same pattern as M4's "lower, noted" `apprseen:` (admins' own rows); here the row
protects the member from the admin. Fix: in `ownershipViolation`, before the admin/system return, for every non-system
actor: a change to `settings/lwseen:<x>` is refused unless `env.type === 'lw.seen'` and `x === String(actor.personId)`
(`another person's last visit`). Red test: the case above refused; Saber opening his own window still writes his own.

## Lower, noted (not findings under D489 — no door a member reaches through a command)
- `installDemoBalances` (new, exported) writes typed figures and grades into the war's memory with no role check, no
  command and no persist; the change is picked up by the NEXT command's diff and judged under THAT command's actor. Only
  a console reaches it today; at the database step make sure no system projection (`lw.sync`) can carry a write it did
  not make, or give this writer the boot-only guard its siblings rely on (`!LW_READY`).
- The legacy Leave War undo stack (`lwUndo` / `historyApply`) now also holds the figures, grades, grades list and lock,
  and puts them back off the command stream (no gate). No screen calls it (tests only); it should go, or never be wired.
- The lock, the app's today and the snapshot are read from this device's memory; at the database step the server must
  read the lock and build the snapshot itself (§11 says so).

## What was tried and held (one line each)
1. Another man's row by the store writer — refused (`balanceProblem` and the gate's own-pid test).
2. Another man's row by a hand-made command, of type `lw.balance`, `lw.edit` or any other — the gate judges the record,
   whatever the type: refused.
3. A batch with his own row and another man's — the whole command refused.
4. A command that merely calls itself a restore (`origin: 'restore'`, `type: 'undo.restore'`) with a forged `by`/`day`/
   snapshot — `verifiedReplay` answers only for the restore the timeline is applying: judged as a forward write, refused.
5. His Undo or Redo of an admin's step — `mayReverse` refuses (another's step); replaying an admin's row is possible only
   as the before-image of his OWN step, which is putting back what stood — correct.
6. Writing while locked: open box, Undo, Redo, forward delete — the lock is read before the replay and delete exits.
7. OIL, or any kind outside the six — refused, delete included; `cf` on a non-LVE kind refused; `cf: null` refused.
8. NaN, Infinity, `'20'` (a string), 17.3 — refused by `isHalfNum`.
9. An id with no colon, or a pid with a colon (`bane:x:LVE`, `bane:LVE:CCL`) — parsed from the right in the gate, the
   store and the row keys alike; never his own pid: refused.
10. No war wired (`setLwBalanceProbe(null)`) — refused before any other check, delete included.
11. A grade, the grades list or the lock: `lw.grade` and `lw.config` are "an admin's record" in any command type (his own
    `lw.edit`, `settings.*`, `lw.seen`); `cmdAuthorize` refuses `lw.grade`, `lw.grades`, `lw.balLock` for a member.
12. The old `lw.edit` path to an opening — `setBalance` is admin-only, and `lw.opening` is "an admin's record" for a
    member in any command.
13. `lwseen:` of another pid by a member — refused under `lw.seen`; any `lwseen:` row under another type refused; his own
    `at` set to any moment changes only his own dots.
14. A member's balance change riding a `lw.seen` command (not an Undo step) — still judged by the `lw.balance` case.
15. The admin's member view (D292) — the actor is a member with the admin's own pid: every member rule applies, and
    `balanceProblem` reads the role in force; his Undo of a step made as admin is refused.
16. What the history and Undo words show — figures (every member reads every man's, D1242), grade names (`LeaveGrade` R),
    the lock's state: nothing beyond §11; a last visit writes no line.
