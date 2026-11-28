# Section 2, step U1 — the brief for every reader of its finished code (chat 199, 26 Nov 26)

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
Who may give View or Plan is unchanged in this step. The cast of the test world: Saber master admin, home 142 · Hunter
142's admin, Plan of 149, View of 150 · Kestrel 149's admin · Mako 150's admin · Ranger a 142 member.

## What to read

The change: `git diff 40c3d56ec..HEAD -- raptor-port/src` on branch `claude/msq-s2-users-685735` (the commit after
40c3d56ec that names U1). The files whole where the diff touches them and their callers: `raptor-port/src/ui/UsersPanel.tsx`,
`ui/UserAccess.tsx`, `ui/useraccess-model.ts`, `ui/userslist-model.ts`, `ui/usersfilter-model.ts`, and the doors the
row calls — `state/accounts.ts saveAccess`, `state/units.ts homeOn`, `state/perms.ts adminOfUnit`. Its tests:
`src/ui/msq-s2-row.test.tsx`, `src/ui/msq-s2-asis.test.tsx`. The rulings page: `.claude/rules/decisions/people-accounts.md`
(open it with the Read tool).

## What is NOT a finding

- A problem that lives only in data already stored, where the code is right going forward (the store is demo data).
- A scheduler who is not an admin (there is none). The command gate and the doors themselves — unchanged by this step.
- Parts that come in later steps and are known: the "Edit on 142 →" link; the refusal at a squadron pick while a row
  holds a change; who may give Plan; the page's new order, folds and jumps; the search matching another squadron's
  sign-in name (a later step closes it).
- Style, naming, tidiness — unless it hides a fault.

## Questions to press on (not a checklist — look wider)

Every way such a row can be reached and opened (search, the Plan-holder listing, a bell line's landing ring, a filter,
Quals' link, the keyboard) — does any still open the whole editor for another squadron's man? Every way the open row's
facts can change under it (an Undo, a Redo, a move landing at midnight, a squadron pick, the man archived, deleted,
suspended, his sign-in removed or given, a second admin's save, a reload) — what does Save send then? Can the opened row
show one squadron's line under another squadron's page? Is anything of his sign-in, role state or postings still
readable from the page (titles, test ids, attributes, the search, the filter's ticks)? A man with no home the app can
read: which row does he get? What does a master admin's short row do on Save?

## How to hand back

Write each proof as a test file `raptor-port/src/ui/zz-<your-name>-proof-<n>.test.tsx`, run it alone from
`raptor-port/` (`npx vitest run <file>`; one test file needs no lock; never `npm run build`, never the whole suite),
keep its output, then **move every proof file and its output out of the repo** into
`C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_eeb07289-ed8b-483b-8502-00962970c7d1/s2-chat199/<your-name>/`
and write your report there as `report.md`: each finding with its severity, the failing test's name and output, the
cause (file and line) and the exact fix; then what you looked at and found sound; then what you could not check.
Leave `git status` exactly as you found it. End your reply with the report's path and a five-line summary.
