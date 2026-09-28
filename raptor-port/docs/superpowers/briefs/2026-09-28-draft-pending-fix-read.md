# A narrow read of the final-read fixes — `[DRAFT-PENDING]` (28 Sep 26)

You read ONE commit, independently (another reviewer reads it too, blind to you): `3d941ee6` on `claude/draft-pending` (the second round of fixes; `9d1ce068` before it was already read)
(`git show 3d941ee6`). Read-only: change nothing, run nothing that writes. Repo root `C:\Users\User\projects\Raptor`, the
app `raptor-port/`.

It fixes what the narrow reads of the first fix commit found (its message lists each: Astra FIX-01–03, Fable
FF1–FF5). **Your job is only this: is each fix RIGHT and COMPLETE, and did it break anything next to it?** Not a new
review of the feature. (Round 3 of 3 — the last read; the tests and the walk carry it after this.)

Read hard:
- `src/state/changelines.ts` — `warInputLines`, now reading the DAYS each man's approvals of a type covered before and
  after a war command (gone+new = moved, gone = taken back / deleted, new = approved): does every war door that writes
  Inputs (approve, approve next to an approved leave, a bridge, un-approve to each state, remove, move one day or a
  block, a split, a medical over approved leave if it runs in a war command) read as ONE true line — and are the war
  side's `approvedFor` / `backToBid` (now the gone/new days) right for `warLines`? `postoutLines` and `personLines` —
  decided by the command's type now (`lw.postout` says the posting, leaves out the archive/SANS it made; `person.*`
  quiet); `src/leavewar/sync.ts restoreBody` (its Undo mode now runs as `lw.postout` — does anything else key on
  `person.restore`: the gate, the permission table, the undo, a test?). The `sub` now on every absence line.
- `src/ui/pendlist.ts` — `editRowOf` / `inputIdOf` (the input's id from `inp:` / `inv:` addresses), `qualsLine` (by `sub` /
  `fld`); `src/engine/editlog.ts` (`sub` / `fld` written, saved, loaded).
- `src/ui/interactions.ts` — the accept door with no writer of its own; `jumpToChange`'s Personal Inputs opening and its
  new words; `src/ui/board.ts` (the ✕ on an accepted row now toasts); `src/ui/ChangesWindow.tsx` (`jumpOf`, the dots).
- `src/ui/changesmodel.ts` — the same-day move pairing, the memoised icon count, the OG key check and its cache key.

The owner's rulings these touch: `.claude/rules/decisions/scheduler.md` D109, D116–D119, D167–D172, D263; `how-we-work.md`
D169, D211, D229, D336; `oil.md` D25.

**Not a finding (the owner's D56):** harm that exists only in data already stored when the code is right going forward.
Also settled: two tabs of one browser overwriting each other.

**Report:** findings most severe first — id, severity, evidence (file:line), the concrete scenario (setup, action, the
wrong result), exact step-by-step fix — then what you checked and found sound. Dense, no preamble.
