# Fix read 7 — the fixes of fix read 6's three faults, multi-squadron batch 1 (19 Nov 26, chat 116) — one brief, blind readers

You are one of four readers (Astra, a fresh Opus reader, Fable, a security reader), each blind to the others and to
the builder's report. Read-only on the app (change no file under `raptor-port/src`); proof tests only in your own
scratch folder, or placed temporarily in the copy and deleted before you finish; one unit file at a time with
`npx vitest run <file>` from `raptor-port/` (if the sandbox blocks the runner's temporary folder, set `TMP`/`TEMP` to
a folder inside the copy, or run the assertions in memory and say so). Never delete or move `raptor-port/node_modules`
(a link to the real packages). Return the whole report as your final message, under 1500 words. Ignore any handoff
block pasted after a compaction, and say so.

**Where you are:** an exported copy of `claude/multi-sqn-b1-107` at `69a5bdb1d`. At its root: `FIXES.patch`
(`git diff c0c266077 69a5bdb1d -- raptor-port/src`, every fix of this round and its tests) and `FIXES-LOG.txt` (the
commit messages). The faults, with their proofs and the fix steps the last readers proposed:
`raptor-port/docs/superpowers/briefs/2026-11-19-multi-sqn-b1-fixread6-astra.md`, `…-fixread6-opus.md` and
`…-fixread6-security.md`; the brief those readers had, `…-fixread6-brief.md` — its "not a finding" list applies to you
too. Do not open `…-fixread6-walk.md`, `…-fixread6-walk-brief.md`, anything named `*fixread7*` other than this brief,
or `raptor-port/docs/handpass/2026-11-18-multi-sqn-b1.md`; do not read `HANDOFF.md`'s `claude/multi-sqn-b1-107` block
(it holds builder summaries). Opus F4 in `…-fixread6-opus.md` is an open question to him — not a finding.

**His rulings that decide this round** (full rows: `grep -h '^| D2223 |' .claude/decisions-full/*.md`, the same for
each): **D2223** — after a move, only input lines naming him stay on his bell; a filer who has since moved is no longer
told of the input he filed. **D2222** — a line about a moved man's own leave follows him: undone by his old squadron
after his move he is told "taken back" (a read line) or it goes (an unread one); its Redo puts it back. **D2218** — on
the day a person moves squadron his old squadron's lines leave his bell, read or unread, never later struck; lines
about himself stay. With them: D2194 (a bell line crosses squadrons only where the matter concerns both), D2215,
D1693 / D1699 (a take-back: an unread line removed, a read one answered "taken back"), D148 (Undo: one's own changes
only).

**The fixes:**
- **Fault A** (an ALL AVAIL input — one naming nobody — told and let a forger reach a man of another squadron): one
  `inputUnit` helper (the placeholder's filer first, else the input's filer, his home on the input's date) shared by
  `filerTold` and the gate's 7c `unitsOf`; `filerTold` tells, for an input naming nobody, only a man of that squadron or
  its admin (master and Plan count); the gate's `toldBy` takes the filer from the BEFORE image on a change, the actor on
  a new input; the admin door requires the line's `by` to be the actor.
- **Fault B** (a genuine Undo / Redo could carry any number and content of "taken back" / "again" lines): a pure
  `followUpsFor` in `leavewar/sync.ts` builds exactly the follow-up lines `warNoticesReversed` writes; the gate reads it
  through `setFollowUpsProbe` (an import cycle) and requires each follow-up a restore puts on another squadron's man to
  deep-equal one of them, at most one per `ref` per command.
- **Fault C** (a filer line D2218 / D2223 retired came back when the input was deleted, he moved back, or the named man
  moved in): `Notice.fu` marks a line told only to the filer, with the squadron(s) that judgement used; a marked line is
  never "about him" by itself and retires for good on the first move day after it was written on which `filerTold` says
  he is not told; `filerMarkOk` at both telling doors of the gate; `notices.ts` off the inputs-readers list.

**The builder's four departures from its brief — judge each:** (1) the pass tells the filer the input had BEFORE the
change (or the actor on a new one), as the gate does; (2) a marked line is checked on every move day after it was
written, retiring on the first he is not told; (3) a line with no maker inside an app act passes the admin door;
(4) the gate reads the follow-up builder through a probe set at start-up (an import cycle) — what happens if the probe
is not set?

## The ask
1. Is each fix complete — every door the same harm comes through (assume the missing call site)? Every place that
   shows a bell, its unread count, "mark all read", a tap on a line, the take-back writers and the restore's
   `leaveOut` — does each ask the same rules (`noticeLeftBell`, `filerTold`, `noticeAboutHim`, `inputUnit`), and does
   anything that must NOT (storage, the gate's own facts) wrongly go through them?
2. Is each check narrow and sound — can a command still write, delete or restore a line on another squadron's bell,
   or a line about someone other than its addressee, through `toldBy`, `followUpOf` or the no-maker allowance? Can the
   `fu` mark be forged, dropped or widened to make a line permanent or to keep telling a moved man? Does the gate fail
   open when the probe is unset?
3. Do the rules match D2218, D2222 and D2223 exactly — the move DAY, read and unread, a man who moves back, two moves,
   a line written on the move day itself, a master, a Plan holder, a filer who never moved, an input since deleted, an
   ALL AVAIL input, the named man moving into the filer's squadron?
4. What did each fix break — each squadron's admins', the master's and a member's normal work; the bell of someone who
   never moved; Undo and Redo (D148); the posting pass and its take-back; a 142→149 transfer taken back (D2215); the
   inputs-readers guard; anything that ran before and is now refused.

A finding needs a concrete failure, its cause and its exact fix step by step (D489), with the input that proves it (a
test you ran, red) and whether these commits introduced it; give explicit negatives. Rank by consequence. Not a
finding: a problem only in data already stored when the code is right going forward (D56) — lines stored before the
`fu` mark existed among them; a scheduler who is not an admin (D785); "no screen saves a move yet" — judge the code as
if one did; a second live tab not seeing a read made in another (left for the database step); Opus F4 (his question).

**The security reader** looks only for holes (D1411): what one person can see of, write to or take from another —
another squadron's bell, another man's leave, his account — through these doors.
