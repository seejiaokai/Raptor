# Fix read 11 — the fresh, blind Opus read (20 Nov 26, chat 118; copy at `a45a1e002`, code = `eb51fa689`)

No handoff block pasted. Opened only the brief, AGENTS.md, FIXES.patch / FIXES-LOG.txt, the code and fix read 10's reports
and briefs. Changed no file under `raptor-port/src`. Proofs in chat 118's scratch `fr11-opus/raptor-port/src/zz-opus11/`
(`c-rewrite.test.ts`, with `harness.part`, the fix read 10 harness re-pathed).

## O11-1 (high; not introduced by these commits — fault C incomplete): another squadron's stored request or bell line overwritten or deleted when REWRITTEN in memory rather than dropped
- `c-rewrite.test.ts:113` — Kestrel files LL for Osprey (149). Outlaw (142 admin) rewrites it in memory, outside every
  command, to name Ranger (142), by himself; then any ordinary `writeInputsBatch` edit: `ok: true`, the stored row
  `person: 'bane', by: 'casper'` — Osprey's saved leave request replaced.
- `:121` — the same rewrite, then a delete: `ok: true`, Osprey's saved request gone.
- `:130` — Saber's real holiday line on Kestrel's bell rewritten in memory to `to/by: 'casper'`, then deleted by a
  command: `ok: true`, Kestrel's stored line gone.
- Cause: SEC10-2's root. Every check reads the before-image, and the scheduler store takes it from memory
  (`resyncBeforeEnlist` / `resyncSchedBaseline` take up a write outside every command). Fault C's `writtenAsNewViolation`
  covers only a put with NO before-image; a put or delete whose before-image was faked in memory is never compared with
  the saved copy; the owner checks judge the faked image ("his own man") and pass; `persist.ts rowOf` writes or deletes
  the stored row by id. SEC10-2's step 1 was not done.
- Fix: (1) `persist.ts wireRows` installs a probe returning the stored value (`wb.get`), not only `has`; (2) in `perms.ts`
  widen `writtenAsNewViolation` to every `inputs` / `notices` change, put or delete — except origin remote or seed,
  `sched.load`, the inputs order row — where a stored row exists, refuse unless `c.before` equals the parsed stored row;
  (3) strip derived, never-saved fields from both sides before comparing (the input's `acc: 'g'` landing, as
  `undo/timeline.ts landed()` does), or every honest edit after a week load is refused; (4) keep the no-before-image rule;
  (5) or do SEC10-2's step 1 (memory reset to the stored state before enlisting) — either way recheck fix read 8's W
  tests; (6) the three proofs red to green; re-run fix read 8 W, fix read 9 B, fix read 10 C and controls, the war's
  input-range file. Needs the console (in scope by earlier rounds); a member is still refused by the member section.

## Checked, found nothing (read only, not run)
- **A:** every war-line writer — decisions (`sync.ts`), bidding open / close (`openingTells`), the posting pass, Undo
  post out, the restore's "taken back" / "again": a decision line owed only by that man's war row or war-approved leave
  on the line's days; bidding by the war's period change through the writer's own code; a posting line's day
  `poDate = to + 1` = `addDays(r.to, 1)`, `markPostingDone` and the delete outcome change the posting record so the
  pass's lines are owed; the pass run on its own is a projection with the system actor; follow-ups
  (`warNoticesReversed`, `lw.notice`) matched field by field (`restoreFollowUpOwed`). `oilhol` passes before the war
  check. A `po` / `poback` line's addressee is not checked beyond the own-squadron check — forged content inside his
  own squadron only = the filed content-field item.
- **B:** `tellHoliday` signs with `me()` — the actor, a master at a shared place included; Undo / Redo by the verified
  replay, unchanged; D148 keeps an Undo to its maker.
- **C:** an Undo / Redo of a delete — the stored row is gone, so the put passes; seed, remote, week load exempt; posting
  and war lines minted with fresh ids; no app write removes a request or line from memory outside a command
  (person-delete, inputedit, sched-commit, sync); no probe until `wireRows` — boot calls it right after hydrate; only
  tests run without it.
- **D:** `updateAccount` the only writer changing an account's person; the others keep `pidFrom` through `masterOf`; a
  new account today or none; door and gate apply the same G4 (today's level each); a re-link's Undo / Redo dated today
  in `restoreRedated` and G2b. Edge, not filed: a re-link and back in one command is refused by the gate (link dated
  today, person unchanged) where the door would allow it — no screen does it.
- **E:** a step from before the change has no stamp — dated today, the safe side, as fix read 9; a move on the removal's
  own day counts before it (a move starts at its day's start, D2218); a Redo after a second Undo uses the latest
  `undoneOn`; door and gate ask the same (`restoredDayHolds`, `markBackHolds`, `setRestoreOffAt`).
- **Rounds:** A's "a bell line about nothing the command changed" stops only hand-made lines naming no input — fix reads
  8 and 9 already changed their tests for that; no other door writes such a line.

## Limits
Only O11-1 has a run test (3 red). Every negative above is by reading. The fix read 7–10 files were not run.
Host re-run 03:05: c-rewrite.test.ts 3/3 red on eb51fa689 — reproduced.
