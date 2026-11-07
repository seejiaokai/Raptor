# Brief — the blind code reads of React Doctor on the shell, the state and the windows (8 Nov 26)

**You are one of three readers, each blind to the others.** Do not open, search for or read any file under
`raptor-port/docs/handpass/parts/rss1108/` whose name starts with `read-`, nor any other reader's report. Read only;
change no file; commit nothing; run nothing that builds or starts a browser (reading files, `git diff`, `git show`, `grep`
and running ONE unit test file with `npx vitest run <file>` from `raptor-port/` are fine).

**The job.** Job 3 of the sized plan (`raptor-port/docs/superpowers/plans/2026-11-05-backlog-sizing.md`): React Doctor's
findings in `Shell.tsx`, `Modals.tsx`, `src/state/`, `src/storage/`, `src/command/`, `src/undo/` and the board's and
windows' files, each fixed or kept with its reason in a disable comment on the line above it (his D1534). **Its one rule:
nothing a person sees may change** — not a look, not a word, not what a press does — save one gesture added on purpose:
a press on Help's "Category" or "What happened" label now puts the keys in its field. `src/engine/` is not touched (D1537).
The whole change: `git diff 7744e66db 969042adb -- raptor-port/src` (the commit message of `969042adb` lists what was
fixed and kept, and why). The pictures already show every touched screen the same to the pixel before and after, at a
desktop and an iPhone's size; what pictures cannot show is what you are for.

**The question: would any change make the app DO something different** — a different answer to a question the code asks,
a different thing saved, a different word or look, a press that no longer works, a window that no longer closes, a
module read before it is ready — **and is anything MISSING** that the old code did? In particular:
1. **Every list lookup turned into a Set** (`changelines.ts`, `undo/describe.ts`, `undo/timeline.ts`, `perms.ts`, `plan.ts`,
   `notices.ts`, `noticeseen.ts`, `flyplan-model.ts`, `storage/fold.ts`, `ui/oilwait.ts`): is the Set built from exactly
   the list the old `includes` read, at the moment it read it? Is that list ever changed after the Set is built, inside or
   after the loop (then the Set must follow it — `plan.ts` and `oilwait.ts` add to both)? Can the "list" ever be a string
   or anything else that is not an array (a string's `includes` finds a part of it; a Set of a string holds its letters)?
   Do the values compare the same way (numbers against strings)?
2. **The three moves out of screen files** — the Insights body's builder to `ui/insights-html.ts`, the highlight chips'
   lists to `ui/hlchips-model.ts`, the save indicator's source to `ui/savestatus-source.ts`: is every importer pointed at
   the new home; is anything read at a different time (a value captured at import instead of read at each call, a
   module-level `let` now copied); does a new import order create a cycle that reads a value before it is set; do the
   indicator and every "Not saved" band still listen to the ONE source `main.tsx` sets, and does Retry still send what
   failed (the same flush)?
3. **The windows' shades** (`role="presentation"`) **and their ✕ buttons** (`aria-label="Close"`): does a shade that
   now says "presentation" hold anything a screen reader or the keyboard needs (focus, a name, a role it had)? Does any
   test, walk script or code find a window or its ✕ by a role or a name this changes?
4. **The top bar's mark** (`TalonMark` in `ui/icons.tsx`, used by `Shell.tsx` and `GuestApp.tsx`): the same markup?
5. **Every disable comment's reason**: is each one TRUE of its line? A reason that is false hides a real finding (for
   example: a JSON copy kept "because it drops keys set to undefined, as saving does" on a path where that does not
   matter, or an `await` in a loop kept as ordered where the order does not matter).
6. **The comments re-pointed** (`ui/drag.ts`, `ui/InputWindow.tsx`, `ui/board.ts`, `ui/inputedit.tsx`): does each now say
   what the code does today, and does each pointer lead to a heading that exists?

**Not a finding:** a problem that lives only in data already stored, when the code going forward is correct (D56 — the
whole store is demo data, cleared before the database step); wording you would merely prefer; React Doctor's findings
left in files this job did not touch (they ride with each area's next batch, D490); the 13 import cycles through
`state/people-settings-commit.ts` (filed); faults that were there before this change, unless this change makes them
worse — but say so in one line if you see one, marked "before this change". **A finding is a claim with a concrete
failure** (what a person or the app would then see or lose, and when), **its cause and its fix** — the exact code where
you can (D489).

**Report:** findings first, each ranked high / medium / low, with file, line, the failure, its cause and the fix. Then
what you checked and found nothing in, item by item (1–6 above). Plain prose, no preamble.

---

## The security reader's part (D1411 — `perms.ts` changed)

**You are the security reader: look only for holes.** `raptor-port/src/state/perms.ts` is the one module that decides
who may do what (`raptor-port/CLAUDE.md` §Security; `raptor-port/docs/data-model.md` §11). Two of its checks changed,
each from a list's `includes` to a Set's `has`: `stampForged` (who placed a Leave War request — `firstFor`), and
`postingPassViolation` (which fields of a man the posting pass may change — `PASS_FIELDS`). Read both whole, with what
feeds them (`passOutcomeOf`, `halvesOfCode`, the envelope they are given). **The question: can any envelope — one the app
writes, or one forged by a member's own browser — now pass a check it was refused before, or be refused where it passed,
or make the check throw where it did not?** Think of values the record controls: a `poOutcome` that names something
other than the three outcomes (a key every object has, such as `toString` or `constructor`), a `code` that is not a
string, an empty list, a field name repeated. Say also whether any other file of the change (`git diff 7744e66db
969042adb -- raptor-port/src`) touches sign-in, who may do or see what, or what one man can see of another — and if so,
read it the same way. The "not a finding" and "a finding is" paragraphs above hold for you too.
