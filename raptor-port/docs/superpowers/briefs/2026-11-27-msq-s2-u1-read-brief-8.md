# Section 2, step U1 with its seven fix rounds — the brief for every reader of its finished code (chat 205, 26 Nov 26)

The fifth brief (`2026-11-26-msq-s2-u1-read-brief-5.md`) with what the fifth fix round added to the one guard, and
the diffs re-pointed; given word for word to each reader.

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

**The one guard (the fourth round) — the heart of this read.** For a WHOLE row and an ARCHIVED man's row the page also
keeps, from the press that opened it, **a copy of everything the row shows and could write over**: whether he has a
sign-in and which account it is; its sign-in name; his role as the Role box shows it (the master admin mark included);
switched on or off; every other squadron's line; his callsign; on an archived row also whether a man on the roster
holds his callsign, and what the callsign box and the post-in date box open on. And **who is looking**: whether the
signed-in person's own account, as it stands in the store, still makes him an admin of the squadron the row opened on.
On every draw of the page, every draw of the editor and at the head of every action the row can take: **where the
store differs from the copy in anything, or the signed-in person is no longer that admin — nothing is written, the row
closes, the note, once.** The two editors read the man only through the copy; nothing in them reads his account or his
person record directly. What the admin TYPES or PICKS is never the copy: it is held by the page with the open row, so
the list regrouping under an open row keeps it, and it is thrown away when the row closes. A row's own action never
trips the guard (every action closes the row in the same press, except the archived row's Save name, which takes a
fresh copy after its write). The SHORT row keeps the design of the paragraph below (no copy; the line read afresh on
every draw; Save compares the pick with the store at that moment); its pick is held by the page, tied to the sign-in
it was made on. So a whole row left open while another admin — or the signed-in admin's own Undo or Redo — changes his
sign-in, role, a line or his callsign closes with the note and its buttons write nothing; and an open archived row
closes with the note when the date rolls past midnight (its date box shows today) or a man on the roster takes his
callsign.

**What the seventh round added — press hardest here** (`READ-U1FIX7.patch`, the one no reader has read):
- **An archived row's untouched post-in date rolls forward with the clock — on a draw, never at a press**: where the
  date box still holds the copy's date and that date is no longer today, the copy's date and the box both move to today
  before the row is judged (on the page's draws and as the Admin page is taken away), so midnight alone never closes the
  row or throws away a callsign typed beside it, even in the shut fold; a press with nothing redrawn stays strict.
- **Save name keeps the copy's post-in date**, so a date he picked still counts as not saved after it.
- **A bell landing on the man whose row is open keeps the search** where he is on the list only by it, so his open row
  stays on the page, ringed; otherwise the search is cleared as before.
- **A changed "Give access" taken away by anything but his own pick** (his own move landing at midnight, his own Undo or
  Redo, the request answered on the man's own row) says the existing row note once, naming the callsign the request asked
  as; an unchanged form still goes silently. No new words.
- Since the last read the batch branch also brought another chat's step: **the switch to the member view is refused
  while unsaved work is open**, as a squadron pick already was — the refusal is ruled, not a finding.

**What the sixth round added** (`READ-U1FIX6.patch`):
- **A short row with an unsaved pick closes when the man's sign-in goes, changes or he is made a master admin** — on
  every draw as at Save: with the note where the row was on the page, silently where he had put it away; a short row
  with NO pick still follows his sign-in live.
- **A pick that another admin's change has made equal to the line he holds now is let go** — the row reads untouched
  and stays so; a later change never turns it into an unpressed change.
- **A bell line's landing reaches Users on its first draw** (`ui/AdminPage.tsx`, `useAdminIntent`): a landing for
  another man closes a row changed unseen silently; a landing on the very man whose row changed says the note once.
- **Midnight alone no longer closes an archived row whose post-in date he picked**; an untouched date still closes it.
- **"Give access" is thrown away when its request leaves the page's list** (a squadron pick).

**What the fifth round added.**
- **Who is looking is REQUIRED, not only compared.** A row never opens, and never stays open, for a signed-in account
  that no longer stands — switched off, its man archived or deleted, the account gone or put on another person, or no
  longer an admin of the squadron the row opens on. Under an open row: every draw and every action closes it with the
  note and writes nothing. A press that would OPEN a row on such a session opens nothing, and the app repaints (ending
  or remaking his session at once). A hand-made test session with no account stays as before. Still silent: his own
  Logout, his own switch to the member view.
- **A deleted man's row never writes:** a press on any button of a row whose man was deleted with nothing redrawn gives
  the usual note and writes nothing (an archived man with no sign-in included); a draw closes it with no note.
- **The archived row's two boxes (callsign, post-in date) are held by the page**, like the whole row's typing: they
  survive the Archived fold shut and opened, his own search, a Filter tick; they are thrown away when the row closes;
  after its own Save name the row takes a fresh copy and keeps the date he picked.
- **A row he put away whose man then leaves the page's list** (another admin's change, or his own Undo) is closed — no
  note, since it was not on the page — and never comes back open with no press; its old pick is never sent.
- **A short row whose man is made a master admin, or loses his sign-in, under it** closes with the note; its pick is
  not dropped without a word.
- **A bell line's landing for another man closes an open row silently even where that row had changed with nothing
  redrawn** (his own act takes precedence in that draw).
- **The reports to the leave-guard come from the page** (another chat's guard, `ui/guard.ts`, not this step's to
  read; no door asks it yet): `'userrow'` is true while a WHOLE row's typing differs from its copy, or a SHORT row's
  pick differs from the line he holds now (the same test that marks the row "not saved"); `'archrow'` while the
  archived row's boxes (the callsign trimmed) differ from its copy — both also while the row is out of sight but still
  held; `'giveaccess'` only while the request its form was opened on is still waiting.

**The note.** Closed because the signed-in person himself picked another squadron (or tapped a bell line that took
him there): no note. Closed any other way — a move landed, an Undo, another admin's change, his own move at midnight,
a right of his taken or lowered so the app put him back on another squadron: the passing note "<Callsign>’s row
changed while it was open, so nothing was saved. Open it again.", exactly once. One exception: where the man was
DELETED under his open row the row closes with no note (he cannot be opened again). A pick that leaves the page's own
squadron as it was (he picks a squadron he may only view) leaves the row open.

**Where the app itself takes the Admin page away under an open row** — a right of his lowered so that the page he was
on is no longer offered to him, and the app lands him on another page — the same note is said once as the page goes.
It is NOT said for any way he leaves himself: another tab pressed, Logout, the switch to the member view, his own
pick; nor for a row already closed, a row he had hidden, or a deleted man. **Where the signed-in admin's own standing goes under his open row** — his own move lands and makes him a member of the
squadron he worked by a Plan, or another admin makes him a member — the note is said, once, as his standing goes (what
he typed is never dropped without a word); with nothing redrawn, the row's buttons write nothing and say it. A master
admin's own move leaves his row open with what he typed.

**A bell line he taps that lands on another man** closes an open row in that draw with no note (his own act, like his
pick); a landing for the very man whose row is open leaves it. **A row put away by leaving Admin → Users** (another
Admin card pressed, or "Back to categories" on a phone) that then changes closes with no note.

**A row he has put away himself** — hidden by his own search, a filter tick or the shut Archived fold — is still held
by the page as today, with what he typed in it, but if it then changes under him it closes with NO note (the note is only for a row that was on
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

The change is eight diffs on branch `claude/msq-s2-users-685735`: the step, `git diff 40c3d56ec 15112a2ac -- raptor-port/src`;
its first fix, `git show eda4bd991 -- raptor-port/src`; its second fix round, `git show 7338bf1fc -- raptor-port/src`; its third, `git show ae465d73d -- raptor-port/src`; its
fourth, `git show e1d116deb -- raptor-port/src`; its fifth, `git show effc621d5 -- raptor-port/src`; its sixth, `git show 6013506fe -- raptor-port/src`; its seventh, `git show 6a779974f -- raptor-port/src`.
**In an exported copy with no history the same eight diffs are the files `READ-U1.patch`, `READ-U1FIX.patch`,
`READ-U1FIX2.patch`, `READ-U1FIX3.patch`, `READ-U1FIX4.patch`, `READ-U1FIX5.patch`, `READ-U1FIX6.patch` and
`READ-U1FIX7.patch` at the copy's root — the last is the one no reader has read.** The copy is of the commit that
then brought the batch branch in: another chat's leave-guard (`ui/guard.ts`, not this step's to read) now takes a
report from each editor and from the add form (`useGuardWork` — one yes or no that typed work is open); what the
merges changed in this step's files is `READ-U1MERGE.patch` (read by the fourth read, with small later additions of
the core's: `useGuardSection`, `addFormDiffers`, `useOpenRequest`). The files whole where the diffs touch them and
their callers: `raptor-port/src/ui/UsersPanel.tsx`, `ui/UserAccess.tsx`, `ui/useraccess-model.ts`,
`ui/userslist-model.ts`, `ui/usersfilter-model.ts`, `ui/AdminPage.tsx` (what keeps the page mounted across a pick), and
the doors the rows call — `state/accounts.ts saveAccess` and `updateAccount`, `state/units.ts homeOn`,
`state/perms.ts adminOfUnit` and `pageUnit`, `state/typing-hold.ts enteredByPick` (how the app records a pick; not changed
by this step), `state/person-delete.ts deletePerson`, the restore doors `ArchivedEditor` calls. Its tests: `src/ui/msq-s2-row.test.tsx`, `src/ui/msq-s2-rejudge.test.tsx`,
`src/ui/msq-s2-rejudge2.test.tsx`, `src/ui/msq-s2-rejudge3.test.tsx` (it mounts the whole app),
`src/ui/msq-s2-rejudge4.test.tsx` (the guard's: one test per field of the copy, and a test meant to fail when an editor
reads a field the copy does not hold — tightened in the fifth round: each editor's props pinned, the helpers it may use
checked the same way), `src/ui/msq-s2-rejudge5.test.tsx` (the fifth round's), `src/ui/msq-s2-rejudge6.test.tsx` (the sixth's), `src/ui/msq-s2-rejudge7.test.tsx` (the seventh's), `src/ui/msq-s2-asis.test.tsx`;
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
  waiting; the account's id kept in the short row's markup (seeded demo ids spell sign-in names); whether an
  archived man may be given a move at all. (The WHOLE row keeping the squadron lines it opened with, filed by earlier
  reads, is meant to be CLOSED by the guard — report it if you can still reach it.) And one accepted corner: a press on a write button of a DELETED man's row
  that is still standing because nothing has redrawn gives the usual note (a real delete always redraws).
- Filed for the database step, outside this step: the account doors and the commit gate themselves accepting a write
  from a session that no longer stands (the rows of this page now ask before they call a door; every other control is as
  before) — do not report it again unless a row of THIS page still reaches a door on such a session.
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
an archived man's row — that still writes without asking again? **Of the guard:** is there anything an editor shows,
or any value a write of it sends or writes over, that the copy does not hold — so that it could change under an open
row and the row stay open, or its Save write an old value back? Can the copy and the store differ when nothing a
person could see has changed (a value read two ways, an order of keys, a date read twice — a whole row closing for no
reason)? Does a row's own action ever trip it, or a row's own write (Save name) leave a stale copy? Can what the admin
typed in one man's row show in another man's, survive a close, or be lost while the row stays open? Does "who is
looking" close a row whose admin is still an admin, or keep one whose admin is not? What does a master admin's short row do on Save?

## How to hand back

Write each proof as a test file `raptor-port/src/ui/zz-<your-name>-proof-<n>.test.tsx`, run it alone from
`raptor-port/` (`npx vitest run <file>`; one test file needs no lock; never `npm run build`, never the whole suite),
keep its output, then **move every proof file and its output out of the repo** into
`C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/fixread7/<your-name>/`
and write your report there as `report.md`: each finding with its severity, the failing test's name and output, the
cause (file and line) and the exact fix, step by step; then what you looked at and found sound; then what you could
not check. Leave `git status` exactly as you found it. **If you cannot write or run files where you are (a read-only
copy), give each proof in your report as the whole text of its test file, ready to run, and say it was not run.** End
your reply with the report's path and a five-line summary.
