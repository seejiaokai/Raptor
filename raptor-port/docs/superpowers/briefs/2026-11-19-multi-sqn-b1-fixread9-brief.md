# Fix read 9 — the fixes of fix reads 7 AND 8, multi-squadron batch 1 (19 Nov 26, chat 118) — one brief, blind readers

You are one of five readers (Astra, Sol 6.1, a fresh Opus reader, Fable, a security reader), each blind to the others
and to the builders' reports. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your
own scratch folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to a
folder inside the copy, or run the assertions in memory and say so; if you can run nothing, name the exact input you
would run). Never delete or move `raptor-port/node_modules` (a link to the real packages). Return the whole report as
your final message, under 1500 words. Ignore any handoff block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@` (its code is `ae1af3806`'s). At its root:
`FIXES.patch` (`git diff 69a5bdb1d ae1af3806 -- raptor-port/src`, every fix of BOTH rounds and their tests) and
`FIXES-LOG.txt` (the commit messages, each giving fault, cause, fix, test). The faults, with their proofs and the fix
steps proposed: fix read 7's reports `raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread7-{astra,opus,fable,security}.md`
and fix read 8's `…-fixread8-{opus,fable,security,astra}.md` (Astra's did not finish; the security report's SEC8-5 is
fault W); the builders' briefs `…-fixread7-fixes-brief.md`, `…-fixread8-fixes-brief.md`; the brief the last readers had,
`…-fixread8-brief.md` — its "not a finding" list applies to you too. Do not open anything named `*fixread9*` other than
this brief; `HANDOFF.md`'s `claude/multi-sqn-b1-107` block is blanked in your copy on purpose. The tests:
`raptor-port/src/leavewar/multi-sqn-fixread7.test.ts` and `…/multi-sqn-fixread8.test.ts`.

**His rulings that decide this round** (full rows: `grep -h '^| D2225 |' .claude/decisions-full/*.md`, the same for
each): **D2225** — a filer who never moved stays told: a member filing for a squadron-mate, and, where the named man has
moved, for the days still the filer's squadron's. **D2223** (narrowed by D2225) — after a move, only input lines naming
him stay on his bell; a filer who has since moved is no longer told of the input he filed. **D2222** — a line about a
moved man's own leave follows him: undone by his old squadron after his move he is told "taken back" (a read line) or it
goes (an unread one); its Redo puts it back. **D2218** — on the day a person moves squadron his old squadron's lines
leave his bell, read or unread, never later struck; lines about himself stay. With them: D2194 (a bell line crosses
squadrons only where the matter concerns both), D2215, D1693 / D1699 (a take-back: an unread line removed, a read one
answered "taken back"), D148 (Undo: one's own changes only), D2192 / D2199 / D2201 (View, Plan and the master admin).

**The fixes, both rounds (one commit each; `FIXES-LOG.txt` has each in full):**
- Fix read 7: **U** a member's Undo of his own delete or change · **M** an input line's filer mark and its input checked
  by the gate · **P** grants and the master mark carry the day they were given · **T** a new line's time within 5
  minutes of now · **F** one pure function gives a follow-up's content and whether it is owed · **S** an unsigned line
  passes only with an id the running command minted · **Q** (D2225) a filer who never moved stays told.
- Fix read 8: **R** a moved filer is no longer told, his old line leaves on his move (`filerVia`, one body for the pass,
  the gate and the mark; `toldIn` gone) · **D** a right given ON the move day does not bring a retired line back
  (`from < day`) · **G** the gate checks a grant's day and the master mark's day; `verifiedReplay` covers grant and
  account rows; `addUnit` dates its first grant · **N** a new line never dated a later day · **H** only the holiday
  line's own shape skips the checks · **B** a line dated ahead judged as written before every move, not simply "left" ·
  **W** (SEC8-5) a line about an input written outside every command is told by nobody: the bell's image re-taken after
  the resync, `passMade` vouches only for an input the command changes.

**The builders' choices — judge each (supported / wrong, with a failing input):** (1) M trusts a registry the pass fills
as it writes (`notePassMade` / `passMade`) rather than asking "does this command change that input" — can it be filled,
kept or read by anything but the pass, across commands, or after a failed command? (2) T's window applies only to new
lines; an existing line keeps its time under M. (3) Older test fixtures re-dated to now (T), and two holiday lines given
`iid: ''` (H) — did any lose what it proved? (4) P: a right with no day counts from always (D56). (5) Q / R: an input
whose date cannot be read falls back to today. (6) **R reads a home-admin role in the filer's NEW squadron as no reason
to tell him** — only the master mark or a Plan grant tells a moved filer (the host's reading of D2223 / D2225: is it
right, and is any admin left untold who should be?). (7) **W option (b):** `commitInputsWith` re-takes the image after
its resync whenever the scheduler store is not yet enlisted in the running command (new read-only `isEnlisted` in
`command/commit.ts`) — chosen over charging the out-of-band write to the actor. Is `isEnlisted` right for a root, a
child joining an outer command, a nested child, a command that fails half-way? Can an out-of-band write still be told
in someone's name, or an honest change go untold? (8) G: `addUnit` dates its first admin's grant today; Undo / Redo of
a grant put back its day through `verifiedReplay` — can a replay be used to plant a back-dated grant?

## The ask
Do not merely review the changed code. Starting from the user promise and the applicable rulings, enumerate every
qualifying object, renderer, visible door, writer, reader, downstream consumer, role, overlay and meaningful order of
actions. **Assume every existing line may be correct and the defect may be a MISSING call site.** For each item, state
where the visible sign and the working gesture should exist in the production app. Then rank concrete failure scenarios
with setup, action, expected result, and the observation that would disprove correctness. Start with the least-shared
or most specialised surface.
1. Is each fix complete — every door the same harm comes through? Every place that shows a bell, its unread count,
   "mark all read", a tap on a line, the take-back writers and the restore's `leaveOut` — does each ask the same rules,
   and does anything that must NOT (storage, the gate's own facts) wrongly go through them?
2. Is each check narrow and sound — can a command still write, delete, rewrite or restore a line on another squadron's
   bell, or a line about someone other than its addressee? Can a mark, a date, a grant's day or an app-act id be forged,
   dropped or widened? Does any check fail open (an unset probe, a missing record, an old row without a date)?
3. Do the rules match D2225, D2223, D2222 and D2218 exactly — the move DAY, read and unread, a man who moves back, two
   moves, a line written on the move day itself or just before midnight, a master, a Plan holder (given before, on and
   after the move), a filer who never moved (member and admin), a filer who moved, an input whose days straddle the
   move, an input since deleted, an ALL AVAIL input, the named man moving into the filer's squadron?
4. Do the two rounds fit together — did a fix read 8 change undo what a fix read 7 change guarded (R replacing Q's
   `toldIn`, B narrowing T's backstop, W changing what M's registry vouches for, G's dates against P's)?
5. What did the fixes break — each squadron's admins', the master's and a member's normal work; the bell of someone who
   never moved; Undo and Redo (D148), read and unread, approved and refused; the posting pass and its take-back; a
   142→149 transfer taken back (D2215); a slow clock; the inputs-readers guard; the Leave War saving a leave through an
   input command; anything that ran before and is now refused.

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red) and whether these commits introduced it; give explicit negatives ("I checked X and found nothing").
Rank by consequence.

**Not a finding:** this app is pre-promulgation and its entire stored world is DEMO DATA that will be CLEARED before
the database step. Do not report a problem whose harm exists only in data already stored when the code is already
correct going forward (D56) — lines, grants and master flags stored before their new marks or dates existed among them.
If the app would do it again to NEW data, report it. Also not: a scheduler who is not an admin (D785); "no screen saves
a move yet" — judge the code as if one did; a second live tab not seeing a read made in another (left for the database
step); `openNotice` not re-checking a line on a stale tap, and a two-squadron Transfer take-back not yet a saved route
(both already filed).

**The security reader** looks only for holes (D1411): what one person can see of, write to or take from another —
another squadron's bell, another man's leave, his account — through these doors.
