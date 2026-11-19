# Fix read 13 — the security reader (D1411) (20 Nov 26, chat 118; copy at `f4830e7b3`, code = `3d9743036`)

Worked only in the copy; no other `*fixread13*` file opened; no handoff block pasted. Proofs `fr13-security/raptor-port/src/zz-sec13/`
(each starts with the first 92 lines of `multi-sqn-fixread12.test.ts`, copied), run alone. Two holes, both older; A widens the first.

## SEC13-1 (high, older; fault A widens it): a Delete posting made up in memory is carried out by the posting pass
- `sec13-forged-posting.test.ts` :111 red — Kestrel gives Hunter View of 149; on 16 Jul Ranger (142 member, signed in) runs
  `getState().postOuts.prowler = {…his row, to:'2026-07-14', poOutcome:'delete'}` outside every command and the pass runs in
  his browser: `lw.postoutRun` committed, Hunter deleted, sign-in `acad2` gone, 149's grant gone. :121 red — the same on a saved
  copy as start-up leaves it (wireRows then writeSeedRows): Hunter's saved people row deleted, grants 0. :135 red — the older
  half: a made-up Delete posting for Casper (no rights elsewhere) carried out. :142 green — control, no posting, nothing done.
- Cause: `runPoOutcomes` (leavewar/sync.ts ~2747) reads whatever postings are in memory (`poDueNow` → `getState().postOuts`);
  it puts back unsaved roster changes (`revertUnsavedPeople`), never unsaved postings. `postingPassViolation` (perms.ts ~1103)
  accepts any `lw.postouts` change whose after has `poDone === to+1` with a date already come, even with no before-image
  (`!b || b.poDone !== f.poDone`); nothing checks the posting is a saved one an admin of that squadron set (section 7b). The pass
  runs as the app in every signed-in browser, members' too: a member can delete, or archive and suspend (Overseas), any man of
  the squadron whose war is loaded, short of the last admin. A now also takes every right the man's sign-in holds in another
  squadron (on `c2fd83020` that grant row refused the pass) — the cross-squadron part new in `a336b00e5`, the rest older.
  `[SERVER-SIDE-PASSES]` files the database-step side; it does not cover today's gate, and the lw-rr1031 security read's "the
  pass's own war … stores are safe" does not hold.
- Fix: (1) in `postingPassViolation`, each `lw.postouts` change needs a before-image equal to the saved posting row (the war's
  saved copy, read through a probe like `setStoredRowProbe` for the war backend), its `to` and outcome unchanged in the after;
  never `!b` except the removed-record Delete branch, where `b` must equal the saved row; (2) or as well, `runPoOutcomes` puts
  the war's unsaved postings back to the saved ones before `poDueNow`, as `revertUnsavedPeople` does for the roster; (3) the
  three proofs as tests, green after; re-run fix read 12's A tests and `postout-roster`, `postout-persist`, `onedoor`.

## SEC13-2 (low, older; the missing delete half of D): a request made up in memory and then deleted carries a line to a "filer" who never filed it
- `sec13-deleted-madeup.test.ts` (saved copy wired and seeded): :123 red — Ranger pushes his own LL for 27 Jul, `by:'prowler'`, a
  month ago, into memory; in one input command deletes it and adds the line the pass would write to Hunter (`what:[{k:'del'}]`,
  `fu: filerVia(...)`): saved, on Hunter's bell. :129 red — Hunter the same for his own man "filed by Saber": the line on Saber's
  bell. :135 green — the same record changed instead is refused by D. :141 green — a filer in 149 (Kestrel, no right in 142)
  refused (`filerTold`).
- Cause: `storedRowViolation`'s never-saved branch returns early on `c.op !== 'put'`; a delete keeps memory's made-up
  before-image; `toldBy` and `filerMarkOk` read its `by` as the filer.
- Harm: a line inside one squadron (or to an admin holding a right in it) about a request that never existed; no crossing.
- Fix: (1) where `raw == null`, `c.op === 'delete'`, `c.before != null`: the same exemptions as a put (not whole, restore,
  REMOTE_ONLY), otherwise the second pass with the change removed — a line naming a record that never existed is untold;
  (2) simpler: refuse, "a record never saved, deleted as if it were"; (3) :123, :129 green, :135, :141 stay green; re-run fix
  read 12's D tests and `bellnotices.test.tsx`.

## Answers and negatives
(1) A: a grant goes only where its account is a posted Delete man's sign-in the pass removes (or leaves out on the first
write); fixread12 :176 refuses another man's grant; G5 runs for the pass on the raw lists; Overseas keeps the right; no honest
delete refused — the only way through is SEC13-1. (2) B: `personDeletedHere` needs the command's own people change; people
before-images come from the last saved roster, so memory cannot fake "not deleted before"; no row left naming him; the actor an
admin of his home before; a man with no home skips the admin test as section 8 does. (3) D: whole off from the first wireRows,
on only by writeSeedRows on its store or wirePersist on a stored one; `restore` / `remote` set only by the timeline, the row
layer or commitAs; REMOTE_ONLY grows only from remote envelopes; the gap is the delete case (SEC13-2). (4) E: `stood` read just
before the restore writes, used only for the same grant / mark / link; no backdating found (not proved by a test). (5) C: the
fallback shows an account gone only on the very first write; section 8 still judges it. Fit: A's pass allowance is the one
widening; elsewhere nothing undone. D2203 honoured; no breach of D2218 / D2223 / D2225 / D2222.
