# Fix read 11 — the security reader (D1411) (20 Nov 26, chat 118; copy at `a45a1e002`, code = `eb51fa689`)

Worked only in the copy; proofs `fr11-security/raptor-port/src/zz-sec11/sec11.test.ts` (5, all red, one file at a time,
TMP inside the copy). Nothing changed under the app's source. No handoff block pasted. All five reached as earlier rounds
accepted in scope: a write outside every command, or a raw call to an exported function or command runner.

## SEC11-1 (high; fault C incomplete, older root): an in-place rewrite replaces a 149 man's saved leave request
- `sec11.test.ts:89` red, `{ ok: true, storedPerson: 'bane' }`. Kestrel files LL for Osprey; Outlaw (142) changes it in
  memory outside any command to `person:'bane', type:'Training', by:'casper'`, then `writeInputsBatch(() => x.remarks =
  'y')`: committed; the SAVED row is Outlaw's Training for Ranger, Osprey's LL gone.
- Cause: the resync before enlisting takes the in-place write up as the starting point, so the before-image is the fake
  and every check passes on it; `writtenAsNewViolation` asks only puts with `before == null`.
- Fix: (1) the probe returns the stored row (`wb.get`); (2) for every `inputs` / `notices` change, put or delete, whose id
  has a stored row, also run the owner checks against a copy of the change whose `before` is the parsed stored row —
  refuse if either before-image fails; (3) compare only the fields the owner checks rely on (a week load's landing marks
  change memory rows on purpose and are never saved — a whole-row compare would refuse honest edits); (4) lines 89, 102
  as tests.

## SEC11-2 (high): the same road deletes another squadron's saved bell line
- `:102` red, `{ ok: true, stored: 'gone' }`. Kestrel files LL for Osprey; Saber's later change tells Osprey (a saved
  line on Osprey's bell); Outlaw sets its `to` to `'casper'` in memory, then removes it from "his own" bell inside a
  `writeInputsBatch`: committed, deleted from Osprey's saved bell. Cause and fix: SEC11-1 step 2 (deletes too).

## SEC11-3 (medium; INTRODUCED by fault C): a command labelled `sched.load` skips the backstop
- `:123` red. At the gate the same `before:null` put under a saved id is refused as `inputs.batch` but allowed as
  `sched.load`. End to end: Outlaw drops Saber's line to Ranger from memory, runs any command so the drop is taken up,
  then `commitSchedValue('sched.load', …)` putting his own line under its id: committed, saved line `by: 'casper'`.
- Cause: the exemption `env.type === 'sched.load'` trusts a label anyone can set; `sched-commit.ts` says nothing raises
  that type any more; the row writer skips only the requests' rows for it (`persist.ts` ~424), notices still saved (~428).
- Fix: (1) remove the `sched.load` exemption from `writtenAsNewViolation`; (2) refuse a `sched.load` command of origin
  `'user'` at the gate; (3) line 123 a test.

## SEC11-4 (medium; fault B incomplete): a 142 admin calls `noticeHoliday` himself and writes lines to 149's bells
- `:133` red, `{ ok: true, made: ['kes9', 'osp9'] }`. Outlaw runs `writeInputsBatch(() => noticeHoliday(['kes9','osp9'],
  'casper', '149: all leave cancelled…', '2026-08-09', '2026-08-09'))`: saved on 149's admin's and a 149 member's bells —
  crossing squadrons where the matter does not concern both (D2194).
- When it shows (read, not run): only to a scheduler, only while a real holiday covers those days; newer than Saber's
  real line, it takes its place (one line per holiday) with Outlaw as maker; its free-text name is replaced by the
  holiday's own name once the reader is installed.
- Cause: B requires only that `noticeHoliday` minted it and that it is signed by the actor; `noticeHoliday` is a plain
  function — addressees and dates are the caller's; no holiday change required.
- Fix, as fault A did for war lines: (1) `holidayLinesOwed(changes)` in `leavewar/sync.ts` — owed only by this command's
  own change of a holiday covering [a,b], at a place where the actor is an admin; (2) `to` among that place's schedulers
  (`toFor(h)`), name the holiday's; (3) installed through a hook, none installed nothing passes; required beside
  `holMade` and `by === self`; (4) fault B's control and fix read 9's Outlaw control call `noticeHoliday` bare — point
  them at the real holiday door; (5) line 133 a test.

## SEC11-5 (high; fault D incomplete, the leftover right older): a 149 admin makes a 149 man an admin of 142
- `:159` red, `{ gate: 'allowed', ok: true, holder: 'har9', plan142: true }`. (1) Kestrel adds an account for a 149 man;
  Saber gives it Plan of 142. (2) Kestrel's re-link at the door is refused, as D intends. (3) Kestrel deletes that man
  (his own): the account goes, its Plan of 142 stays with no account (`person-delete.ts` never drops rights; a move does,
  `units.ts` ~220). (4) Kestrel writes a NEW account row under the old id, linked to another 149 man, by a raw
  `commitSettingsIntent` (O10-4's road): the gate allows it; the new man is 142's admin through the leftover right; with
  no link date the right counts "from always", so a mover's retired lines would come back (D2218).
- Cause: G4 (`if (!was || same pid) continue`) and G2b (a new row may carry no link date) ask only a row that existed
  before. The demo's seeded accounts hide it — `accountBefore`'s seed fallback supplies a "before"; an id made by Add
  account has none.
- Fix: (1) G4 skips only `was && same pid` — a new account row whose id any standing grant names counts as a re-link;
  (2) G2b: such a row must carry `pidFrom` = today; (3) `relinkRightsProblem` as is at the door; (4) drop the account's
  rights inside the person delete's own command, as a move does, so its Undo puts them back with it; (5) the gate refuses
  removing an account row while a right still names it; (6) line 159 a test.

## Checked and found closed
- **A:** a war line to another squadron's man refused by the owner check first; a member's war line refused; a line with
  no parts or a null part refused (both sections); a war part on the telling door refused; owed matching ties a
  decision line to that man, a day of the changed cell or leave and its kind, a posting line to that record's man, day
  and outcome — no real-door line covered for another man or day; unset hook owes nothing (closed).
- **B:** a line signed as someone else refused; the hole is only SEC11-4.
- **C:** the probe wired at boot (`boot.ts` ~102) before any person's command; remote and seed are not a person's; unset
  probe asks nothing — open, but only in tests.
- **D:** door and gate agree on a re-link, each by the actor's admin level in that squadron; a re-link and back in one
  command shows only its net change; a re-link's Undo / Redo dated today (F10-4).
- **E:** steps from before the change have no stamp — dated today (closed); a move on the very day the right went off is
  not a move since (the world as it was); the new moments live in the in-memory undo history the replay check already
  trusts for every recorded image — no wider than tampering with those images.

**Introduced by these commits:** SEC11-3. SEC11-1, 2, 4, 5: these fixes left incomplete over older roots.
Host re-run 03:08: sec11.test.ts 5/5 red on eb51fa689 — reproduced.
