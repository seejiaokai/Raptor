# Section 2, step U1 with its fix — the brief for every reader of its finished code (chat 205, 26 Nov 26)

The first brief (`2026-11-26-msq-s2-u1-read-brief.md`, chat 199) with the step's later rule added and the diff
re-pointed; given word for word to each reader.

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

**An open row is judged again every time the page is drawn.** The page remembers, for the open row, the squadron
whose page it opened on and whether it opened whole or short. Where that no longer holds — it opened whole and he is
now another squadron's man on this page; it opened short and the page's squadron is no longer the one it opened on; it
opened short and he is now the page's own man — **the row closes and nothing typed is carried over.** Closed because
the signed-in person picked another squadron: no note. Closed because it changed under him with no pick (a move
landed, an Undo, another's change): the same passing note, once. The whole editor is never drawn for another
squadron's man on a page, by any route. And **every write the whole row can make — Save, Suspend / Enable, Give
sign-in, Archive, Delete — asks again first**: if he is by then another squadron's man here, or the page's squadron is
not the one the row opened on, nothing is sent, the note shows, the row closes (this is what catches a move landing as
the date rolls, when nothing redraws).

The cast of the test world: Saber master admin, home 142 · Hunter 142's admin, Plan of 149, View of 150 · Kestrel 149's
admin · Mako 150's admin · Ranger a 142 member · Osprey a 149 member.

## What to read

The change is two diffs on branch `claude/msq-s2-users-685735`: the step, `git diff 40c3d56ec 15112a2ac -- raptor-port/src`,
and its fix, `git show eda4bd991 -- raptor-port/src`. **In an exported copy with no history the same two diffs are the
files `READ-U1.patch` and `READ-U1FIX.patch` at the copy's root.** The files whole where the diffs touch them and
their callers: `raptor-port/src/ui/UsersPanel.tsx`, `ui/UserAccess.tsx`, `ui/useraccess-model.ts`,
`ui/userslist-model.ts`, `ui/usersfilter-model.ts`, `ui/AdminPage.tsx` (what keeps the page mounted across a pick), and
the doors the rows call — `state/accounts.ts saveAccess` and `updateAccount`, `state/units.ts homeOn`,
`state/perms.ts adminOfUnit`. Its tests: `src/ui/msq-s2-row.test.tsx`, `src/ui/msq-s2-rejudge.test.tsx`,
`src/ui/msq-s2-asis.test.tsx`. The rulings page: `.claude/rules/decisions/people-accounts.md` (open it with the Read
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
- Style, naming, tidiness — unless it hides a fault.

## Questions to press on (not a checklist — look wider)

Every way such a row can be reached and opened (search, the Plan-holder listing, a bell line's landing ring, a filter,
Quals' link, the keyboard) — does any still open the whole editor for another squadron's man? Every way the open row's
facts can change under it (an Undo, a Redo, a move landing at midnight, a squadron pick, the man archived, deleted,
suspended, his sign-in removed or given, a second admin's save, a reload) — what does each of the row's buttons send
then, and what stays readable on the page? Can the opened row show one squadron's line under another squadron's page?
Is anything of his sign-in, role state or postings still readable from the page (titles, test ids, attributes, the
search, the filter's ticks)? Does the judging on every draw ever close a row it should leave open, close it without
the note where the note is owed, show the note twice, or loop? Is there a press — on the whole row, the short row or
an archived man's row — that still writes without asking again? What does a master admin's short row do on Save?

## How to hand back

Write each proof as a test file `raptor-port/src/ui/zz-<your-name>-proof-<n>.test.tsx`, run it alone from
`raptor-port/` (`npx vitest run <file>`; one test file needs no lock; never `npm run build`, never the whole suite),
keep its output, then **move every proof file and its output out of the repo** into
`C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat205/<your-name>/`
and write your report there as `report.md`: each finding with its severity, the failing test's name and output, the
cause (file and line) and the exact fix, step by step; then what you looked at and found sound; then what you could
not check. Leave `git status` exactly as you found it. **If you cannot write or run files where you are (a read-only
copy), give each proof in your report as the whole text of its test file, ready to run, and say it was not run.** End
your reply with the report's path and a five-line summary.
