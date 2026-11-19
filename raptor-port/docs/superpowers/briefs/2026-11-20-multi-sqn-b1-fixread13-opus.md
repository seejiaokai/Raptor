# Fix read 13 — the fresh, blind Opus read (20 Nov 26, chat 118; copy at `f4830e7b3`, code = `3d9743036`)

No handoff block pasted. Proofs `fr13-opus/raptor-port/src/zz-opus13/`, each run alone. `multi-sqn-fixread12.test.ts`
green on the copy (37/37).

## O13-1 (highest; older door, D incomplete): a made-up request or bell line is still saved through a Delete then Undo
- `o13-d-undo.test.ts` — 4 tests, all red. Saved copy as built (wired, seeded, whole on).
  - :77 member, two cases (filer `kes9` / `bane`): Ranger pushes "his leave, filed by Kestrel a month ago" into INPUTS
    outside every command, deletes it by `writeInputsBatch`, then `globalUndo()`: delete allowed, Undo allowed, the saved
    row reads `by: 'kes9'`, `at` 15 Jun — SEC12-2's harm through a second door.
  - :100 admin: Hunter files for Ranger, Saber edits (a real line); Hunter pushes a copy of the line dated 2099
    (`nfab13`) into NOTICES, deletes the request and that line in one command, Undo: the 2099 line saved on Ranger's bell.
  - :88 the "moved" half (fix read 11's A): Ranger's own saved Appointment rewritten in memory `by: 'kes9'`, a month old;
    delete then Undo: the saved row reads `by: 'kes9'`.
- Cause (`state/perms.ts storedRowViolation`): the second check judges only a put — an unsaved record passes on
  `c.op !== 'put'`; a moved delete is judged against the saved row and passes as an honest delete. The Undo step records
  the change with the made-up before-image and writes it back with origin `restore`, which skips the never-saved check
  (exempt), the moved check (`raw == null`) and passes the replay check (image for image what the step recorded).
- Introduced: no — the door existed under fix read 11's A; D meant to close SEC12-2's harm, which survives.
- Fix: (1) run the unsaved and moved checks for every op, keeping the exemptions (restore, seed, not whole, remote-only);
  (2) a delete of an input or notice with no saved row while whole is on, carrying a before-image: refuse ("a record never
  saved, removed as if it were"); (3) a delete whose before-image differs from the saved row: refuse, unless the only
  differences are fields the app never saves (an explicit list); (4) the robust alternative: the gate hands the timeline
  the saved image, so an Undo step of an input or notice change records the saved row as its before-image; (5) the four
  proofs as tests red then green, plus a control: a member deletes his own saved request and Undoes it, the row back as
  saved.

## The builder's choices
1. A — supported (`o13-a.test.ts`, green): :97 an immediate Delete then top-bar Undo leaves the world whole; :109 Undo
   post out after an immediate Delete refused, he stays deleted, the right gone; :117 a Delete for 16 Jul taken back on
   15 Jul: the pass deletes nobody, the 149 right stands; :127 two Delete postings in one pass, both with View of 149:
   both run, both rights go. A master is never deleted (`masterDeleteProblem`); a member cannot set a posting; Overseas
   Sqn and a forged extra right covered by fixread12's tests.
2. B — supported (`o13-be.test.ts:98`, green): Kestrel deletes his man then marks him undeleted in the same command
   while taking 142's Plan — refused, Plan stands. A different man or an archive without delete fails
   `personDeletedHere`. Its `!u` (no home) returns true, but section 8 reads the delete the same way.
3. D — remote: nothing raises origin `remote` (only perms.ts, commit.ts, timeline.ts), so the list never fills — later,
   not open now. Restore: only the timeline raises it; a person can feed it a made-up image through a Delete step
   (O13-1). Whole: both start-up paths turn it on, `wireRows` off for the boot's own commands; no case on early or off
   on a built site.
4. E — supported (`o13-be.test.ts:121`, green): Saber's step since touched by Kestrel — refused or dated today, never
   13 Jul. Redo / Undo repeated traced by hand: the day stays. An old step with no record cannot exist (the Undo list is
   memory only).

## Explicit negatives
C's fallback only where the command records no change of the row. G5 for the pass and the first write consistent with
`rightOutlivesAccount`; no honest pass refused. D2218 / D2223 / D2225 / D2222 untouched. Fix reads 7–11's guards not
loosened; the pass's right removal narrowed to gone accounts.
