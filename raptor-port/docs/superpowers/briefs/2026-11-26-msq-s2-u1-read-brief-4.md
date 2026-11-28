# Section 2, step U1 with its three fix rounds — the brief for every reader of its finished code (chat 205, 26 Nov 26)

The third brief (`2026-11-26-msq-s2-u1-read-brief-3.md`) with the rule as the third fix round completed it and the
diffs re-pointed; given word for word to each reader.

**You are a reader, not a builder.** You have seen no other reader's report and no walk; do not look for one. Change no
file of the repo. Find what is MISSING or WRONG in the finished code of this step — a claim counts only with a concrete
failure, its cause and its fix, and **each claim is written as a failing test before it is believed.**

## The rule the code must keep (the owner's rulings, in plain words)

On Admin → Users, each squadron's page shows that squadron's own people with their whole row. A man whose home squadron
is **not** the page's squadron (found by the search, or listed because he plans the page's squadron) shows only: his
callsign, his home squadron's grey number, seat and CAT, his role in words ("admin", or "master admin, full access";
a member adds nothing; no sign-in — no role), and what he already holds of the page's squadron ("also plans 149",
"also views 149"). No sign-in name, no role badge, no dots. Pressed, his row opens to **one line — the page's
squadron's, None · View · Plan — with Save and Cancel, and nothing else**: no sign-in box, no Role box, no other
squadron's line, no Suspend, Archive or Delete. A man with no sign-in opens to "No sign-in. Ask 142's admin to give him
one first." and Cancel alone. **The row's Save sends that one squadron's line and nothing else — never his sign-in
name, role, master admin mark or another squadron's line, whatever happened while the row was open — and the row is
judged again at Save:** if he is by then the page's own man, or the page is by then another squadron's, nothing is
sent, the row closes, and a passing note says "<Callsign>’s row changed while it was open, so nothing was saved. Open
it again." On his **own** squadron's page his row is whole, exactly as before. The signed-in admin's own row never opens.
Who may give View or Plan is unchanged in this step.

**An open row is judged again every time the page is drawn — and every time its own editor is drawn.** The page
remembers, for the open row (a man's roster row, another squadron's man's short row, an archived man's row alike),
how it stood at the press that opened it: the squadron whose page it opened on, whether it opened whole or short,
**his home squadron that day, and whether he was archived.** Where any of the four no longer holds — the page is
another squadron's; he became or stopped being another squadron's man here; he moved from one other squadron to
another; he was archived or restored by someone else — **the row closes and nothing typed is carried over.** An open
row is never carried from one kind of row to another (roster row, short row, archived row) without a press.

**The note.** Closed because the signed-in person himself picked another squadron (or tapped a bell line that took
him there): no note. Closed any other way — a move landed, an Undo, another admin's change, his own move at midnight,
a right of his taken or lowered so the app put him back on another squadron: the passing note "<Callsign>’s row
changed while it was open, so nothing was saved. Open it again.", exactly once. One exception: where the man was
DELETED under his open row the row closes with no note (he cannot be opened again). A pick that leaves the page's own
squadron as it was (he picks a squadron he may only view) leaves the row open.

**Where the app itself takes the Admin page away under an open row** — a right of his lowered so that the page he was
on is no longer offered to him, and the app lands him on another page — the same note is said once as the page goes.
It is NOT said for any way he leaves himself: another tab pressed, Logout, the switch to the member view, his own
pick; nor for a row already closed, a row he had hidden, or a deleted man. (One case is left as built, the owner's to
rule: another admin makes the signed-in admin a member — the Admin page goes and shows its own refusal words, with no
note.)

**A row he has put away himself** — hidden by his own search, a filter tick or the shut Archived fold — is still held
by the page as today, but if it then changes under him it closes with NO note (the note is only for a row that was on
the page at the last draw); brought back, it is closed. **An open row that leaves the list by no act of his** (the man
drops off the page's list through another admin's change or the signed-in admin's own Undo — e.g. a man listed only
because he plans the page's squadron loses that Plan) closes with the note, once; it is never left held to come back
open with no press.

**Every write an opened row can make asks again first** — the whole row's Save, Suspend / Enable, Give sign-in,
Archive and Delete; the short row's Save; the archived man's Restore, "Restore as", Save name and Delete (both taps of
a Delete): where the row no longer stands as it opened, nothing is sent, the note shows, the row closes. This is what
catches a move landing as the date rolls, when nothing redraws. The whole editor is never drawn for another
squadron's man on a page, by any route or any redraw.

**The open short row shows the line he holds today**, not the line he held when it opened: if another admin, or the
signed-in admin's own Undo, changes that line while the row is open, the row follows it and stays open while he stays on the page's list; it is marked
"not saved" only while the admin's own pick differs from what the man holds now; Save sends the admin's pick, and
only if it differs from what he holds at that moment. A pick the admin puts back by hand (he presses the line the man
holds) is let go: the row is untouched again and follows later changes. The "No sign-in. Ask 142's admin…" words name his home
squadron as it is today.

The cast of the test world: Saber master admin, home 142 · Hunter 142's admin, Plan of 149, View of 150 · Kestrel 149's
admin · Mako 150's admin · Ranger a 142 member · Osprey a 149 member.

## What to read

The change is four diffs on branch `claude/msq-s2-users-685735`: the step, `git diff 40c3d56ec 15112a2ac -- raptor-port/src`;
its first fix, `git show eda4bd991 -- raptor-port/src`; its second fix round, `git show 7338bf1fc -- raptor-port/src`; its third, `git show ae465d73d -- raptor-port/src`.
**In an exported copy with no history the same four diffs are the files `READ-U1.patch`, `READ-U1FIX.patch`,
`READ-U1FIX2.patch` and `READ-U1FIX3.patch` at the copy's root.** The files whole where the diffs touch them and
their callers: `raptor-port/src/ui/UsersPanel.tsx`, `ui/UserAccess.tsx`, `ui/useraccess-model.ts`,
`ui/userslist-model.ts`, `ui/usersfilter-model.ts`, `ui/AdminPage.tsx` (what keeps the page mounted across a pick), and
the doors the rows call — `state/accounts.ts saveAccess` and `updateAccount`, `state/units.ts homeOn`,
`state/perms.ts adminOfUnit` and `pageUnit`, `state/typing-hold.ts enteredByPick` (how the app records a pick; not changed
by this step), `state/person-delete.ts deletePerson`, the restore doors `ArchivedEditor` calls. Its tests: `src/ui/msq-s2-row.test.tsx`, `src/ui/msq-s2-rejudge.test.tsx`,
`src/ui/msq-s2-rejudge2.test.tsx`, `src/ui/msq-s2-rejudge3.test.tsx` (it mounts the whole app), `src/ui/msq-s2-asis.test.tsx`;
and `src/state/edit-rights-readers.test.ts` with `docs/data-schema.md`'s edit-rights table (the page now reads
`isAdmin()` once, only to decide whether a note is said — check that is all it decides). Also `ui/Shell.tsx` (what
mounts and unmounts the Admin page) and `state/perms.ts pageOffered`. The rulings page: `.claude/rules/decisions/people-accounts.md` (open it with the Read
tool where you have one).

## What is NOT a finding

- A problem that lives only in data already stored, where the code is right going forward (the store is demo data).
- A scheduler who is not an admin (there is none). The command gate and the doors themselves — unchanged by this step.
- Parts that come in later steps and are known: the "Edit on 142 →" link; the refusal at a squadron pick while a row
  holds a change (so, for now, a pick closes an open row and drops what was typed in it); who may give Plan; the
  page's new order, folds and jumps; the search matching another squadron's sign-in name (a later step closes it).
- Two things already found, pinned as tests of today's behaviour in `msq-s2-rejudge.test.tsx` and placed in later
  work — do not report them again, but DO report anything that makes either worse or reaches it by a new route:
  a master admin's Squadron tick in the Filter brings another squadron's ARCHIVED men into the Archived fold with
  their whole archived row (closed in the step that retires the tick); a man whose home squadron the app cannot read
  gets the whole row (cannot arise in today's store; closed before the database step).
- Seen by earlier reads and filed for later work — do not report again unless this code makes one worse: the account
  door answering "already has an account (…)" before asking whose man he is; a door's refusal telling of a move
  waiting; the account's id kept in the short row's markup (seeded demo ids spell sign-in names); the WHOLE row keeping
  the squadron lines it opened with when another admin changes them under it (older than this step); whether an
  archived man may be given a move at all. And one accepted corner: a press on a write button of a DELETED man's row
  that is still standing because nothing has redrawn gives the usual note (a real delete always redraws).
- By the owner's build rule for this step: a fault in a note's WORDS or TIMING that can only happen with two people at
  the keys at once is filed for the database step, not built now — report it, marked as such; anything that lets a
  write through, shows what must not be seen, or drops typed work without a word is a finding to fix now.
- Style, naming, tidiness — unless it hides a fault.

## Questions to press on (not a checklist — look wider)

Every way such a row can be reached and opened (search, the Plan-holder listing, a bell line's landing ring, a filter,
Quals' link, the keyboard) — does any still open the whole editor for another squadron's man? Every way the open row's
facts can change under it (an Undo, a Redo, a move landing at midnight, a squadron pick, the man archived, deleted,
suspended, his sign-in removed or given, a second admin's save, a reload) — what does each of the row's buttons send
then, and what stays readable on the page? Can the opened row show one squadron's line under another squadron's page?
Is anything of his sign-in, role state or postings still readable from the page (titles, test ids, attributes, the
search, the filter's ticks)? Does the judging on every draw ever close a row it should leave open, close it without
the note where the note is owed, show the note where his own pick closed it, show it twice, or loop — on the page's
draws, on an editor's own draws, under a draw run twice? Can a row that is now judged by more things be made to close
when nothing a person could see has changed (the same squadron read two ways, a date read twice across midnight)? Is there a press — on the whole row, the short row or
an archived man's row — that still writes without asking again? What does a master admin's short row do on Save?

## How to hand back

Write each proof as a test file `raptor-port/src/ui/zz-<your-name>-proof-<n>.test.tsx`, run it alone from
`raptor-port/` (`npx vitest run <file>`; one test file needs no lock; never `npm run build`, never the whole suite),
keep its output, then **move every proof file and its output out of the repo** into
`C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/fixread/<your-name>/`
and write your report there as `report.md`: each finding with its severity, the failing test's name and output, the
cause (file and line) and the exact fix, step by step; then what you looked at and found sound; then what you could
not check. Leave `git status` exactly as you found it. **If you cannot write or run files where you are (a read-only
copy), give each proof in your report as the whole text of its test file, ready to run, and say it was not run.** End
your reply with the report's path and a five-line summary.
