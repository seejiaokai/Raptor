# Fix read 11's faults — the builder's brief (20 Nov 26, chat 118, overnight; branch `claude/multi-sqn-b1-107`)

You are the builder (Opus). Build the seven faults below, each RED FIRST by a test that fails on `eb51fa689`'s code, then
fixed at its cause, one commit each, in a new file `raptor-port/src/leavewar/multi-sqn-fixread11.test.ts`. Read first:
`AGENTS.md`'s rules list, `.claude/rules/raptor-executor.md`, `.claude/rules/decisions/people-accounts.md`, and the four
reports `raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread11-{opus,fable,security,astra}.md` (Astra's
did not finish). The readers' proofs, each red on this code (the host ran them all), sit in chat 118's scratch
`C:/Users/User/AppData/Local/Temp/claude/37df10f156419f1e/9fd34fb7-f6fc-4b49-8eb7-eec4d211d74d/scratchpad/fr11-{opus,fable,security}/raptor-port/src/zz-*11/`
— copy their set-ups, never import from there. The earlier rounds' files `multi-sqn-fixread{7,8,9,10}.test.ts` stay green
(the three Q1 proofs of fix read 9 are not in them — leave that case alone: it waits for his answer). Fable's
`f11-c-legit.test.ts` (6 honest paths with the saved copy wired) is a control set: copy it in and keep it green.

## The faults

**A. A saved request or bell line is still overwritten or deleted when REWRITTEN in memory, not dropped (Opus O11-1,
SEC11-1, SEC11-2; high; fault C incomplete, older root).** Outlaw (142) rewrites Osprey's (149) saved LL in memory to his
own man, then edits or deletes it by a command; or re-addresses a 149 bell line to himself, then deletes it (Opus
c-rewrite :113, :121, :130; security :89, :102). Fix (the security reader's form — it refuses nothing honest): (1) the
probe `persist.ts wireRows` installs returns the stored row (`wb.get`), keeping a `has`; (2) in `perms.ts`, for every
`inputs` / `notices` change, put or delete, whose id has a stored row — except origin remote or seed and the inputs'
order row — run the same owner checks a second time on a copy of the change whose `before` is the parsed stored row;
refuse if either fails, in words that say a saved record was changed outside the app's doors; (3) keep the
no-before-image rule. Do not compare whole rows (a week load's landing marks change memory on purpose and are never
saved). Controls: an honest edit and delete of an input after a week load; Fable's six honest paths; W's tests.

**B. The backstop is switched off by a label (F11-3, SEC11-3; medium; INTRODUCED by fault C).** `commitInputs` /
`commitSchedValue('sched.load', …)` skips it (Fable f11-ac :118; security :123). Fix: delete the `env.type ===
'sched.load'` exemption from `writtenAsNewViolation` (and from A's new check); refuse at the gate a `sched.load` command
of origin `'user'` — nothing raises it (`sched-commit.ts`); confirm with a search that no app path does.

**C. A holiday line with no holiday (F11-1, SEC11-4; medium; fault B incomplete).** Outlaw calls `noticeHoliday(['kes9',
'osp9'], 'casper', '149: all leave cancelled…', …)` in his own input command: saved on 149's bells (Fable f11-b1 :106;
security :133). Fix, as fault A of fix read 10 did for war lines: `leavewar/sync.ts holidayLinesOwed(changes)` — a
holiday line is owed only by this command's own change of a holiday covering exactly `a..b`, under that holiday's own
name, at a place where the actor is an admin, `to` among that place's schedulers (`toFor(h)`); installed into
`perms.ts` by a setter, owing nothing when unset; the skip requires owed AND `holMade` AND `by === self`. Point fault B's
control and fix read 9's Outlaw control at the real holiday door instead of a bare `noticeHoliday` call (say so in the
commit). Who a holiday line goes to stays as built (D2195 is job 4's).

**D. A made-up war line in another admin's name (F11-2; high; fault A incomplete).** Outlaw edits only the remarks of
Ranger's approved LL and calls `noticeWar(['bane'], 'stiff', {k:'lw', d:'refused', …})`: saved, signed as Saber,
follows Ranger after his move (Fable f11-a2 :114). Fix: (1) the war-line check requires the signer the writers give —
`by === self` for `lw`, `lwopen`, `poback`; `by == null` for `po` (check each writer and the restore's follow-ups first;
match what they write); (2) the `inputs` branch of `warLinesOwed` owes a line only where the leave came, went, or changed
its person, dates, type or `lw` mark between before and after. Controls: fix read 10's A controls.

**E. A new account row under the id of a deleted account inherits its rights (SEC11-5; high; fault D incomplete, the
leftover right older).** Kestrel deletes his man whose account holds Plan of 142, then writes a NEW account row under that
id for another 149 man: allowed, and he is 142's admin "from always" (security :159). Fix: (1) G4 skips only
`was && same pid` — a new account row whose id any standing grant (or the master mark) names counts as a re-link; (2) G2b:
such a row carries `pidFrom` = today; (3) the person delete drops the account's grants inside its own command, as a move
does (`units.ts`), so its Undo puts them back with it; (4) the gate refuses removing an account row while a right still
names it. Controls: Admin → Users' delete and its Undo; Add account.

**F. An older Undo writes the link's day back (F11-4; INTRODUCED by fault D).** A rename then a re-link; the re-link's
Undo dated today (correct); then the rename's Undo puts `pidFrom` back to none and a retired line returns (Fable f11-d3
:122). Fix: `restoreRedated`, account branch — where `was` exists with the same person, write `pidFrom: was.pidFrom`;
G2b drops the `replayed && !relinked` skip, so an unchanged link always carries `was.pidFrom`.

**G. Three Undo cases still lose a line the man kept (F11-5a, F11-5b, F11-6; medium; faults D and E left open).** (a) A
Redo by mistake and its Undo: `madeAt` is stamped once — re-stamp the moment the right went off on each Redo (a
`redoneOn`, preferred by `offAtOf` for an Undo) (f11-ed :119); (b) Plan turned to View and undone: a restore taking the
same account and squadron from not-admin to admin counts as "put back", the recorded day kept where `restoredDayHolds`
(f11-e2 :115); (c) a re-link by mistake and its Undo: where a restore puts the account back on the person its recorded
image names and `restoredDayHolds(n.pid, offAt)`, keep the recorded `pidFrom` and `masterFrom` (f11-ed :134). The gate
asks the same predicates. Fix read 9's F1, F1b, O9-2, fix read 10's E tests stay green.

## Rules
- Change only what each fault needs; no other tidying. Every gate change goes through `state/perms.ts` with
  `docs/data-model.md` §11 in the same commit (D200). A changed expected result in an older test only where a fault here
  requires it, said in the commit.
- Each commit message: the fault, the readers, the cause, the fix, the test, "red on eb51fa689's code (…), green now".
- Before you hand back: from `raptor-port/`, the unit suite under the lock (`node scripts/gatelock.mjs exec
  "claude/multi-sqn-b1-107 — fixread11 unit" -- npm test`), `npm run build`, `node reference/tfin.js` (728/0), `npm run
  rulecheck`, `npm run docsize`, `npm run lint:changed`. `docs/file-map.md` names the new test file.
- Commit on `claude/multi-sqn-b1-107`; do NOT push, do NOT touch `HANDOFF.md`, do NOT merge. A blocker: stop and say it.

## Hand back (short)
Status, the commits (one line each), each fault's red-then-green evidence, the checks with their counts, any departure
from this brief with its reason, and anything found outside it (filed by the host).
