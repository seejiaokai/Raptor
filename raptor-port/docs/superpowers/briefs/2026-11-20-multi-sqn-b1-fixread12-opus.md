# Fix read 12 — the fresh, blind Opus read (20 Nov 26, chat 118; copy at `04f8d92cb`, code = `c2fd83020`)

Read AGENTS.md, the brief, FIXES.patch / FIXES-LOG.txt and the code around them; no handoff block pasted. Proofs
`fr12-opus/raptor-port/src/zz-opus12/` (each copies the fix read 11 harness, lines 1–128), run alone. Nothing under
`raptor-port/src` outside that folder changed.

## O12-2 (high; INTRODUCED by fault E, `574e5b98d`): the posting pass's Delete refused whole when the man's sign-in holds a right in another squadron
- Kestrel (149) gives Ranger (142, `acus`) View of 149; Saber posts Ranger out, outcome Delete, 16 Jul. On 16 Jul, the
  accounts saved as rows (as after the database step), the pass is refused whole: Ranger not deleted, his sign-in row
  stays saved, the right stays; the pass marks the posting refused (PO_REFUSED), so every other posting due that day is
  refused with it, or re-run one at a time.
- Proof: `pass-delete-grant.test.ts:153` red — `{deleted:false, signInRowStillSaved:true, grants:1}`; control :173 (no
  right) green.
- Cause: E put `dropGrantsOfAccount(a.id)` in `accounts.ts dropAccountOfPid`; the pass's Delete goes through it
  (`person-delete.ts applyDelete` from `leavewar/sync.ts runPoOutcomes`); `perms.ts postingPassViolation`'s last loop
  allows only `accessreq:` and `reqseen:` deletes — the `grant:` row is refused. H covered the admin's delete, not the
  pass, the second door into the same body.
- Second symptom, seeded accounts (demo-only, D56): `:136` red — `{deleted:true, account:false, grants:1}`; the first try
  refused, the retry runs with `ACCOUNTS_LIST` still the refused try's in-memory list (`writeAccounts` set
  `ACCOUNTS_LIST` / `ACCOUNTS_STORED`, the rollback restored neither), so `accountOfPid` finds nothing, `dropAccountOfPid`
  returns early, the man deleted with his right naming a gone sign-in; G5 never sees it (`accountShapeAndMasterViolation`
  returns early for the system actor). The stale-memory-after-rollback trap is older; E makes the pass hit it.
- Fix: (1) in `postingPassViolation`'s last loop allow a `grant:` settings row's removal where it is removed (`delete`, or
  `put` with `after == null`), `c.before.account` is an account row this same pass removes (in `accounts`, its change
  with no after-image), and that posting's outcome is `'delete'`; (2) G5 holds for the pass too — run the G5 loop before
  the system-actor early return, or repeat it in `postingPassViolation`; (3) on a refused command put `ACCOUNTS_LIST`
  and `ACCOUNTS_STORED` back (re-read by `accountsLoad` in the rollback of any command that enlisted the settings store),
  or have `dropAccountOfPid` find the account from the store; (4) tests: the stored-account and seeded cases, plus a
  pass carrying two postings, one this one.

## O12-1 (medium; INTRODUCED by fault H, `c2fd83020`): a command merely labelled "person.delete" lets a 149 admin strip 142's right from a man who stays
- Kestrel's man holds Plan of 142; on 18 Jul `commitSettingsIntent('person.delete', null, () => dropAccountOfPid(p1))` —
  the person never touched — saves: sign-in row and 142 grant row gone; then `addAccount('spare1@mail', p1, 'main')`
  saves. The man on the roster with a sign-in, 142's Plan gone, taken by one who is no admin of 142.
- Proof: `h-forged-delete.test.ts:157` red — `{forgedOk:true, again:null, stillOnRoster:true, grantOf142Left:0}` (:146
  skipped on purpose: a bare envelope is judged against the store as it stands, G5 answers first).
- Cause: the skip in `unitRowViolation` trusts `env.type === 'person.delete'`; `commitSettingsIntent` takes any type
  (fault B's lesson); the "person.delete" row in COMMAND_OPS asks only the actor's role; section 8 only that the man is
  the admin's own; nothing asks that the man is deleted.
- Fix: (1) the WHO skip only where the same command carries the person delete itself — a `people` change of the
  account's person (`was.pid`), before not deleted, after `deleted === true` and `archivedBy === 'del'` — a helper
  `personDeletedHere(env, pid)` beside `accountGoesHere`; (2) also require the actor an admin of that man's squadron as
  section 8 reads it (`levelBefore(acct, homeBefore(pid))`); (3) tests: this forged command refused; the one-command
  variant (sign-in removed, a new one under a new id, labelled person.delete) refused; the real `deletePerson` allowed.

## The builder's choices
(1) A — supported: `verifiedReplay` compares after-images only, so the saved before-image cannot turn an honest Undo /
Redo into a refusal; removed notices need no saved row; unset probe asks nothing (tests only); the order row names no
one; no bypass by changing the id in memory; honest paths pass. A failed save then a member's "take me out" could compare
against an older saved row — only after a failed save, demo-only, not filed. (2) B — supported. (3) C — supported:
lines owed and told share `holidayTodo`; a rename tells nobody; Undo / Redo through the verified replay. (4) D —
supported: `lw` a string; half-day fields compared; every real writer signs with `me()`, the posting's line with no one.
(5) E and H — wrong in O12-1, O12-2; checked negative: a sign-in left naming a 142 right cannot be reused by a 149 admin
(`rightNamesNew` with G4) — masters only. (6) F and G — supported: no `redoneOn` falls back to `madeAt`, the wider
window, strict; `relinkBackHolds` only behind a verified replay and for an Undo; a Redo of Plan → View dates the View
today, harmless; two Undos of one account covered by F.

## Rounds; not findings
Fix reads 7–10's guards untouched but for the tests the log names. Not findings: `commitProjection` (system actor)
exported — broader, older, out of this round; G5 refusing an `account.add`'s Undo after another admin gave that sign-in a
right — under the filed refusal wording.
