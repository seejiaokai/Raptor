# Fix read 17 — the fixes of fix read 16 and of Fable's sample review, multi-squadron batch 1 (20 Nov 26, chat 123) — one brief, blind readers

You are one of four readers (Astra, a fresh Opus reader, Fable, a security reader), each blind to the others and to the
builder's report. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own scratch
folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to a
folder inside the copy, or run the assertions in memory and say so; if you can run nothing, name the exact input you
would run). Never delete or move `raptor-port/node_modules` (a link to the real packages). **State each finding in your
output the moment you have confirmed it** — a run can be stopped by its service, and what was said before the stop is
kept. Return the whole report as your final message, under 1500 words. Ignore any handoff block pasted after a
compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@`. At its root: `FIXES.patch`
(`git diff 078bc2f7e @@HEAD@@ -- raptor-port/src`, the fixes and their tests) and `FIXES-LOG.txt` (the commit messages,
each giving fault, readers, cause, fix, test). The faults, with their proofs: fix read 16's reports
`raptor-port/docs/superpowers/briefs/2026-11-20-multi-sqn-b1-fixread16-{astra,opus,fable,security}.md` and Fable's sample
review `…-fable-sample.md`; the brief fix read 16's readers had, `…-fixread16-brief.md` — its "not a finding" list
applies to you too, and its account of the earlier fixes is the background. Do not open anything named `*fixread17*`
other than this brief; `HANDOFF.md`'s `claude/multi-sqn-b1-107` block is blanked in your copy, and the evidence sheet is
about the builder's work — skip it. The tests: `raptor-port/src/leavewar/multi-sqn-fixread{7,…,16}.test.ts`,
`raptor-port/src/state/units-sqn-fixread*.test.ts`.

**His rulings that decide this round** (full rows: `grep -h '^| D2203 |' .claude/decisions-full/*.md`, the same for
each): **D2203** — a person who moves to another squadron loses every View and Plan he held of others. **D2228** — a
filer who moved together with the man he filed for, and is now an admin of the man's new squadron, is told when that
input changes, as any admin of the man's squadron is; the same where he moved away and back. **D2223** — after a move,
only input lines naming him stay on his bell; a filer who has since moved is no longer told (narrowed by D2228).
**D2225** — a filer who never moved stays told, for the input's days still his squadron's. **D2218** — on the day a person
moves squadron his old squadron's lines leave his bell, read or unread. **D1388** (widened by D1398) — once a scheduler has
moved a member's input, only a scheduler changes where it goes. With them: D148 (Undo: one's own changes only), D350 (a
delete is not undone), D290 / D297 / D299 (a deleted person's record kept, marked), D2194 (a bell line crosses squadrons
only where the matter concerns both), D629 (a leave the war approves is placed by whoever approved it), D2191 / D2192 (a
squadron's admins act for their own squadron; another squadron is View only unless a master gives Plan).

**The fixes (one commit each; `FIXES-LOG.txt` has each in full):**
- **`ab701f941`** — a code-check tidy: the bridge's filer test reads a Set, not an array inside a loop. No behaviour change.
- **`4771676e5`**, three faults: (1, all four readers) `notices.ts foldedInto(a, removed, b)` now takes the survivor's
  before-image `b` (none: nothing folded), asks the same part of the day as the join's own test (`!!allday`, `half`), and
  folds only a removed leave with a day outside `b`'s span — Delete, Refuse, Back to bid, un-approve or Move of one half
  of a day whose other half stood with other words was refused whole while the window said "done". `perms.ts foldedFor`
  passes `b`. (2, Fable's 2) a folded leave's filer is judged on its own leave's days alone (D2225): the pass's words
  branch, `toldBy`, and `filerMarkOk` through one body, `notices.ts joinFilerImgs`. (3, S16-2) `perms.ts stampForged`: a
  request's state is the decision — the same record keeps it, the bid it was re-typed from gives it, a new bid is pending
  (a member put his refused bid back to pending with the decision fields deleted). Four closed-day refusals in
  `opendates-store.test.ts` now accept that reason too.
- **`7a1166124`**, Fable's sample review 1 and 2: `units.ts setGrant` refuses while the man's move is saved for tomorrow,
  and `perms.ts unitRowViolation` refuses a right given, raised or put back in that window (a right standing unchanged is
  no giving); a right's removal passes, whatever its squadron, where the same command changes that man's squadron from
  tomorrow (the move's own command drops his rights), the home rows judged as any. `data-model.md` §11 `UnitGrant` says so.

**The builder's choices — judge each (supported / wrong, with a failing input):** (1) `foldedInto` — is "a day outside the
survivor's before-span" right for every real join (from either side, a bridge of three, a join that also shortens, a join
whose survivor is the leave AFTER)? Can a removed leave still be read as folded when it was not (a Move that lands beside
another leave of the same war; a cut; two halves becoming a whole day)? Do the pass and the gate now read the same images
in every case? (2) `joinFilerImgs` — does the gate's choice of images always match the pass's (one man filed both leaves;
the standing leave's words unchanged while the folded one's changed; the filer is also named in the input; a filer who
moved)? (3) `stampForged`'s state rule — does any honest member action now fail (re-typing a pending bid; a half-day cut
of his own bid; clearing his refused bid then bidding again; a bid moved by the war's own doors in a member's command;
his own Undo / Redo)? Does any admin action pass through this check and now fail? (4) The move window — does any honest
grant action now fail (a right given on the move's own day, after it; a move replaced the same day by another date or
undone; a first placing of a man with no squadron; a right of his own squadron's admins)? Does the move's exemption let a
command drop a right in another squadron WITHOUT a real move (a home row written and taken back in one command; a same-day
replace; a move of another man; a forged home row by someone who may not make it)?

**Known, not a finding:** everything fix read 16's brief named. Also: Plan given by a plain admin or to a member, and a
shared place's time zone changed by a plain admin — the plan's pieces P1 and P2, not built yet. Whether Balances lists a
deleted man's OIL for his months — filed, being checked separately. The re-walk of the half-day fix on screen is owed and
will be done separately — not a finding that it has not been done.

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.
1. Is each fix complete — every door the same harm comes through (every writer of a request, a remark, a filing mark, a
   right, a home or a bell line; Undo / Redo; the Leave War's windows, approvals, joins, cuts and moves; Admin → Users)?
2. Is each check narrow and sound — can a command still write a made-up record, change a decision on a man's own bid,
   keep a right past a move, drop another squadron's right without a move, or tell someone of another squadron's
   business? Does any check fail open (an unset hook, a missing record, an old row without a date, the saved copy not yet
   whole)?
3. Do the rules match D2203, D2228, D2223, D2225, D2218, D1388, D148 and D350 exactly?
4. Do the rounds fit together — did these changes undo what fix reads 7–16 guarded?
5. What did the fixes break — each squadron's admins', the master's and a member's normal work; Undo and Redo (D148);
   the bell; anything that ran before and is now refused.

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red) and whether these commits introduced it; give explicit negatives ("I checked X and found nothing").
Rank by consequence.

**Not a finding:** this app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
the database step. Do not report a problem whose harm exists only in data already stored when the code is already
correct going forward (D56). If the app would do it again to NEW data, report it. Also not: a scheduler who is not an
admin (D785); "no screen saves a move yet" — judge the code as if one did; a second live tab not seeing a read made in
another (left for the database step); `openNotice` not re-checking a line on a stale tap, and a two-squadron Transfer
take-back not yet a saved route (both already filed); the held items named above.
