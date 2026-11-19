# Fix read 8 — the fixes of fix read 7's faults, multi-squadron batch 1 (19 Nov 26, chat 117) — one brief, blind readers

You are one of four readers (Astra, a fresh Opus reader, Fable, a security reader), each blind to the others and to
the builder's report. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own
scratch folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to
a folder inside the copy, or run the assertions in memory and say so). Never delete or move `raptor-port/node_modules`
(a link to the real packages). Return the whole report as your final message, under 1500 words. Ignore any handoff
block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `@@HEAD@@`. At its root: `FIXES.patch`
(`git diff 69a5bdb1d @@HEAD@@ -- raptor-port/src`, every fix of this round and its tests) and `FIXES-LOG.txt` (the
commit messages). The faults, with their proofs and the fix steps the last readers proposed:
`raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread7-astra.md`, `…-fixread7-opus.md`,
`…-fixread7-fable.md` and `…-fixread7-security.md`; the brief those readers had, `…-fixread7-brief.md` — its "not a
finding" list applies to you too. Do not open anything named `*fixread8*` other than this brief, `*-walk*.md`,
`…-fixread7-fixes-brief.md`, or `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md`; `HANDOFF.md`'s
`claude/multi-sqn-b1-107` block is blanked in your copy on purpose.

**His rulings that decide this round** (full rows: `grep -h '^| D2225 |' .claude/decisions-full/*.md`, the same for
each): **D2225** — a filer who never moved stays told: a member filing for a squadron-mate (as built), and, where the
named man has moved, for the days still the filer's squadron's. **D2223** (narrowed by D2225) — after a move, only
input lines naming him stay on his bell; a filer who has since moved is no longer told of the input he filed.
**D2222** — a line about a moved man's own leave follows him: undone by his old squadron after his move he is told
"taken back" (a read line) or it goes (an unread one); its Redo puts it back. **D2218** — on the day a person moves
squadron his old squadron's lines leave his bell, read or unread, never later struck; lines about himself stay. With
them: D2194 (a bell line crosses squadrons only where the matter concerns both), D2215, D1693 / D1699 (a take-back: an
unread line removed, a read one answered "taken back"), D148 (Undo: one's own changes only).

**The fixes (one commit each):**
- **U** (a member's Undo of his own delete or change refused): in the member door, a restore's delete of his own line
  on that input passes when `toldBy` has the addressee or the verified replay vouches for the change.
- **M** (an input line's `fu` mark could be dropped, widened or emptied, or a line could name an input the command does
  not change): every non-replay notice put with an `iid` must name an input the command changes and pass
  `filerMarkOk`; an existing line's `fu`, `to`, `iid` and `at` change only by a verified replay — both sections of the
  gate.
- **P** (Plan or master given after a move brought a retired line back): grants and the master flag carry the date
  they were given; `toldIn`, judging a past move day, counts only those held by then (`levelFrom` unchanged).
- **T** (a line dated in the future never left): a non-replay notice put must have an `at` within 5 minutes of now;
  `noticeLeftBell` treats a line dated past that as left.
- **F** (a genuine Undo / Redo accepted a follow-up line not owed): one pure function gives a follow-up's content AND
  whether it is owed, from the notice and read records as they stood before the command; the writer and the gate both
  call it.
- **S** (an unsigned line rode an app-act label): the pass records the ids it mints in the running command; a no-maker
  line passes only if its id is among them.
- **Q** (D2225: a filer who never moved was not told once the named man moved): `filerTold` (and the gate's `toldBy`,
  one body) counts the filer where, on any of the input's days, a named man's home that day is the filer's squadron,
  or the filer is its admin, master or Plan.

@@DEPARTURES@@

## The ask
1. Is each fix complete — every door the same harm comes through (assume the missing call site)? Every place that
   shows a bell, its unread count, "mark all read", a tap on a line, the take-back writers and the restore's
   `leaveOut` — does each ask the same rules, and does anything that must NOT (storage, the gate's own facts) wrongly
   go through them?
2. Is each check narrow and sound — can a command still write, delete, rewrite or restore a line on another
   squadron's bell, or a line about someone other than its addressee? Can a mark, a date, a grant's date or an
   app-act id be forged, dropped or widened? Does any check fail open (an unset probe, a missing record, an old row
   without a date)?
3. Do the rules match D2225, D2223, D2222 and D2218 exactly — the move DAY, read and unread, a man who moves back, two
   moves, a line written on the move day itself, a master, a Plan holder (given before and after the move), a filer
   who never moved (member and admin), an input whose days straddle the move, an input since deleted, an ALL AVAIL
   input, the named man moving into the filer's squadron?
4. What did each fix break — each squadron's admins', the master's and a member's normal work; the bell of someone who
   never moved; Undo and Redo (D148), read and unread, approved and refused; the posting pass and its take-back; a
   142→149 transfer taken back (D2215); a command carried over a slow clock (the 5-minute window); the inputs-readers
   guard; anything that ran before and is now refused.

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red) and whether these commits introduced it; give explicit negatives. Rank by consequence. Not a
finding: a problem only in data already stored when the code is right going forward (D56) — lines, grants and master
flags stored before their new marks or dates existed among them; a scheduler who is not an admin (D785); "no screen
saves a move yet" — judge the code as if one did; a second live tab not seeing a read made in another (left for the
database step); `openNotice` not re-checking a line on a stale tap, and a two-squadron Transfer take-back not yet a
saved route (both already filed).

**The security reader** looks only for holes (D1411): what one person can see of, write to or take from another —
another squadron's bell, another man's leave, his account — through these doors.
