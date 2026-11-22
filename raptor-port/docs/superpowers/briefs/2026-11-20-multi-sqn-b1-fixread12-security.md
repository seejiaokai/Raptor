# Fix read 12 — the security reader (D1411) (20 Nov 26, chat 118; copy at `04f8d92cb`, code = `c2fd83020`)

Worked only in the copy; read the brief, AGENTS.md, FIXES-LOG.txt, FIXES.patch's code and the gate around each fix. No
other `*fixread12*` file opened; no handoff block pasted. Proofs `fr12-security/raptor-port/src/zz-sec12/` (each copies
the first 128 lines of `multi-sqn-fixread11.test.ts`), run alone. Two holes.

## SEC12-1 (INTRODUCED by `c2fd83020`, fault H): a command labelled "person.delete" that deletes nobody takes 142's right from a 149 man who stays
- `sec12-h-label.test.ts` :142 (A), :152 (B), both red. Kestrel (149 admin, nothing in 142) adds a sign-in for a 149 man;
  Saber gives it Plan of 142; on 18 Jul Kestrel's bare removal is refused (control inside A). Then
  `commitSettingsIntent('person.delete', null, …)` removing the 142 grant row and the account row (B also writes a new
  account row for the same man): A allowed — not deleted, Plan of 142 gone; B allowed — he signs in under a new account
  id, Plan of 142 gone, in one command. `person.delete` is on the timeline's no-Undo list (`undo/timeline.ts` ~469), so
  no one can undo it.
- Cause: H's exemption in `unitRowViolation` — `id.startsWith(GRANT_PFX) && b && n == null && env.type ===
  'person.delete' && accountGoesHere(env, b.account)`; a type is a caller's label (fault B's own log);
  `commitSettingsIntent` takes any; section 8 judges only the account row; G5 satisfied; nothing asks whether a person is
  deleted. The brief's question 5 answered yes; breaks "a bare removal of another squadron's right stays refused".
- Fix: (1) replace `env.type === 'person.delete'` with what the command does — `pid = accountBefore(aid,
  ac.before).pid` from the account change `accountGoesHere` found; require a `people` change of that pid whose before is
  not deleted and whose after has `deleted === true`; require no account in the after-world names that pid
  (`worldsOf(env).acctA`, or the raw after rows); (2) the type as an extra condition only; (3) the two tests green; H's
  real-delete cases in `multi-sqn-fixread11.test.ts` stay green.

## SEC12-2 (older — the missing half of fault A): a record made up in memory and then "changed" skips every rule for a new record
- `sec12-fabricated-before.test.ts` :135 (member) red, :159 (admin, bell line) red, :154 (control) green — the same
  request filed honestly as new in Kestrel's name is refused.
- Member: Ranger (142 member, `us`) pushes into memory outside every command his own leave on 27 Jul with `by: 'kes9'`
  and `at` a month ago, then changes its remarks by `writeInputsBatch`: saved — "filed by Kestrel", dated a month back.
  Admin: Hunter (142 admin) puts into memory a copy of a real line to his own man Ranger with a new id and `at` 1 Jan
  2099, changes Ranger's request and touches that line in one command: saved, dated 2099.
- Cause: the before-image comes from memory; `storedRowViolation` (A) re-judges only where a saved row exists;
  `writtenAsNewViolation` catches only a put with no before-image where a saved row exists; the third case — memory claims
  a before-image, nothing saved — goes through the edit rules: the member input rule's `same(b.by, f.by)` / `same(b.at,
  f.at)` against the made-up before; `lineNotNow` skips any put with a before-image; `lineRewritten` compares the line
  with its made-up self.
- Harm: a saved request naming another squadron's admin as its filer at a made-up time; a bell line dated far ahead,
  top of that bell for good. Limits checked: Kestrel is not told of later changes (:144 passes); a line to another
  squadron's man still refused (`ownsHim`); `noticeLeftBell` does not let the made-up date keep a line on a moved man
  longer. A forged record, not a leak across squadrons; ranks below SEC12-1.
- Fix: (1) in `storedRowViolation`, `STORED` installed and origin not remote or seed: for an inputs or notices change
  (not the order row) where `storedRow(...)` is null and `c.before != null`, set `before: null` in the copy and mark it
  moved — the second pass judges it as new (a member's request filed by himself, now; a line dated now; a war or holiday
  line one its writer minted); (2) before shipping, check no honest path holds an unsaved record in memory and edits it
  before its row lands — `writeSeedRows` on a store not started, `tryInputsBatch`'s thrown-away runs, a restore's
  verified replay (should go through the replay exemptions), a record that arrived by a remote change but was never
  written locally; exempt any explicitly; (3) the two tests green; re-run A's honest paths (Fable's c-legit, the
  week-load control).

## Explicit negatives
- A on saved rows: the second pass runs before "already written"; `SECOND_PASS` reset in a `finally`; the copy carries the
  command's own minted-line records only; no probe asks nothing — every built boot installs it in `wireRows`.
- B: nothing outside tests raises `sched.load` (its declaration, the gate's table, persist's landing mapper); a person's
  command with the label refused; the exemption gone.
- C: the holiday skip needs all five — owed by the command's own change to the war or its event types; the holiday's own
  name; dated its first day; to a scheduler `tellHoliday` tells; signed by an admin of the war's squadron; a memory
  rewrite of the war could at most copy a real holiday's own line; 142 cannot change 149's war (`warUnitViolation`).
- D: signing as Saber refused; a remarks-only edit owes nothing; a 149 man's war-approved leave cannot be changed by 142
  (input squadron check).
- E: G5 refuses an account row going while a right names it, a master too; remove and write back in one command nets to
  one change; a new account row under a named id is a re-link — today, a master's alone.
- H apart from SEC12-1: a delete by one who may not make it refused whole (section 8, by the man's squadron as it stood);
  a 142 admin cannot use the label on a 149 man; a master's account stays a master's (G1); no restore door for a deleted
  person (D350).
- F and G: an Undo step with no stamps fails closed (today); `restoreDir` / `restoreOffAt` answer only for the restore
  being applied; the re-link exemption Undo-only, a verified replay plus "no move since"; G4 applies to restores; Undo /
  Redo of Plan → View give the expected days. Low, not proved, not reported: `pidOfAccount` and `restoredDayHolds` read
  the in-memory account list — a rewrite affects only the actor's own step and squadron.
Host re-run 05:09 on c2fd83020: fabricated-before :135 and :159 red, h-label A and B red — reproduced.
