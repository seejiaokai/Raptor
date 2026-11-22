# Fix read 12 — Fable's blind read (D2224) (20 Nov 26, chat 118; copy at `04f8d92cb`, code = `c2fd83020`)

No handoff block pasted. Worked only in the copy; proofs `fr12-fable/raptor-port/src/zz-fable12/`, each run alone, each
red with its control green. Nothing under src outside that folder changed.

## F12-1 (highest; INTRODUCED by fault E, not cured by H): a Delete posting never runs for a man whose sign-in holds a right in another squadron
- Kestrel (149) gives a 149 man a sign-in; Saber gives it View of 142; Kestrel sets his posting out for 16 Jul, outcome
  Delete. On 16 Jul the pass runs: nothing holds it (`poHeldReason` null), yet the gate refuses the pass whole — the man
  not deleted, sign-in and right stay, posting not marked done, no admin told, nothing on screen; refused again every
  pass until someone removes the right by hand. Before E the posting ran.
- Cause: E put `dropGrantsOfAccount` inside `accounts.ts dropAccountOfPid`; the pass's Delete calls it (`leavewar/sync.ts
  runPoOutcomes` → `person-delete.ts applyDelete` → `dropAccountOfPid`) as `lw.postoutRun`; `perms.ts
  postingPassViolation`'s last loop allows only an accessreq and a reqseen row's removal — the grant row hits
  `if (!ok) return refuse(c)`. H's exemption is keyed on `env.type === 'person.delete'`.
- Proof: `f12-1-posting-delete.test.ts:87` red — `{deleted:false, account:true, grants:1, done:"not done",
  passCommitted:false}`; control (no right elsewhere) green.
- Fix: (1) in `postingPassViolation`'s last loop also allow a grant row's removal (judged as the accessreq rows) whose
  before-image's `account` is a key of the `accounts` map AND whose posted man's outcome is 'delete'
  (`posted.get(String(accounts.get(id).pid)) === 'delete'`); (2) nothing else — G5 then holds, WHO is skipped for the
  app; (3) tests: a Delete posting of a man holding View, and one holding Plan, of the other squadron runs on its date;
  an Overseas Sqn posting removes no right; a pass removing a grant of a man it does NOT post out stays refused;
  (4) `data-model.md` §11, the posting pass's row.

## F12-2 (INTRODUCED by fault H): H trusts the command's label — fault B's lesson
- Kestrel (149 admin, nothing in 142) raises a command typed `person.delete` that deletes nobody: it removes only his
  man's sign-in row and the Plan of 142 naming it. Saved: the man stays on the roster, his Plan of 142 taken by one who
  is no admin of 142 — the "bare removal" that stays refused; the brief's question 5 answered yes.
- Cause: `perms.ts unitRowViolation`, H's line `env.type === 'person.delete' && accountGoesHere(env, b.account)` asks only
  the type and that the account row goes; nothing asks the account's person is deleted in the same command; section 8
  (`homeUnitViolation`) asks only that the actor is admin of the man's squadron. `commitSettingsIntent` takes any type.
- Proof: `f12-2-delete-label.test.ts:74` red — `{saved:true, planOf142Stands:false, signIn:false, manStays:true}`; two
  controls green (bare `removeGrant` refused; the same two rows under `account.update` refused).
- Fix: replace the type test with the rows — read the account's person from its before-image (`accountBefore(aid,
  c.before).pid`) and require a `people` change of that id in the same command, before not deleted, after `deleted ===
  true`, `archived === true`, `archivedBy === 'del'` (the marks `postingPassViolation` asks for a Delete); keep the type
  test too if wanted, never alone. Tests: the label with no people change refused; with ANOTHER man's delete beside this
  man's account row refused; a real delete allowed.

## F12-3 (low — the seeded demo and tests only; a shared store has no seeds; INTRODUCED by fault H): H fails on the very first write of the accounts
- A store that has never written its accounts: Saber gives Osprey's seeded sign-in View of 142; Kestrel deletes Osprey:
  refused, "That did not save".
- Cause: `accounts.ts writeAccounts` records NO change for the row it drops on the first write (it leaves it out of the
  stored list), so `accountGoesHere`'s `env.changes.find(account row)` finds nothing.
- Proof: `f12-3-first-write.test.ts:75` red — `{refused:"That did not save", deleted:false, grants:1}`; control green.
  Its backend removes a key saved as null, as the real adapter does.
- Fix: where the command carries no change of that row, read the two lists as the loader does (`worldsOf(env)`: in acctB
  and not in acctA), as section 8 already does for the same first-write case.

## The builder's choices
1. A — supported: the saved copy written inside each command's own group, so "two commands before the save lands" cannot
   arise; a put with no before-image still meets "already written"; order row, remote, seed skipped on purpose. Not
   proven: a memory rewrite in collections the probe does not ask (settings rows, the war's records) — the gate reads
   settings from the store itself; no test run. 2. B — supported: nothing raises `sched.load` outside tests; pre-existing,
   not this round's: the label refused only for origin 'user', a projection runs as the app. 3. C — supported: the
   holiday line written inside the war's own command at both ends; a rename alone owes nothing. 4. D — supported: every
   writer signs as the check expects; no writer merges parts into an older line. 5. E and H — wrong in the three ways
   above; otherwise the person delete is the only door removing an account row; a right put back by Undo for a gone
   sign-in refused; a delete by one who may not make it refused whole. 6. F and G — supported on reading; no new proof.

## Not checked
The bell rules against D2218 / D2223 / D2225 / D2222 case by case; two Undos of different steps on one account by two
people (relied on the Undo's own "someone has since changed it").
Host re-run 05:08 on c2fd83020: f12-1 :87 red (control green), f12-2 :74 red, f12-3 :75 red (control green) — reproduced.
