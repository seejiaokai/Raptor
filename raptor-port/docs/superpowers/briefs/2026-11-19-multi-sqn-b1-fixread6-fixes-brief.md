# Fix read 6 — the builder's brief for its three open faults (chat 115, 19 Nov 26)

Branch `claude/multi-sqn-b1-107` (pull request 806, draft), head `c0c266077` (the code is as at `63620a9e7`, which the
three readers read). You are the builder (Opus). Read first: `.claude/rules/raptor-executor.md`,
`.claude/rules/decisions/people-accounts.md` §Posting out (D2218, D2222, D2223), the scheduler page's line on bell lines
crossing squadrons (D2194), the full rows (`grep -h '^| D2218 |\|^| D2222 |\|^| D2223 |\|^| D2194 |\|^| D1693 |\|^| D1699 |' .claude/decisions-full/*.md`),
and the three reports this brief acts on, in `raptor-port/docs/superpowers/briefs/`: `2026-11-19-multi-sqn-b1-fixread6-security.md`
(SEC6-A, SEC6-B), `…-fixread6-opus.md` (F1–F3; F4 is a question for him — do NOT build it), `…-fixread6-astra.md`
(its 1 = SEC6-B, its 2 = Opus F2+F3, its 3 = SEC6-A). Each report gives proofs and exact fix steps; where they differ,
this brief decides. Code: `src/state/notices.ts` (`filerTold`, `noticePass`, `noticeAboutHim`, `noticeLeftBell`),
`src/state/perms.ts` (`inputUnitViolation`'s `unitsOf` ~1315, `toldBy` ~1841, `followUpOf` ~1872,
`adminOwnerViolation` ~1885, the member pass ~2030), `src/leavewar/sync.ts` (`warNoticesReversed` ~1635),
`src/state/undo-wire.ts` (`leaveOut`). Harness to copy for tests: `src/leavewar/multi-sqn-fixread4-bells.test.ts`.

## The three faults — each reproduced RED first by a test that fails on `c0c266077`, then fixed at its cause

**Fault A — an ALL AVAIL input tells, and lets a forger reach, a man of another squadron (SEC6-A = Opus F1 = Astra 3; worst).**
An input naming nobody HAS a squadron: the gate's 7c gives it the placeholder's filer's (else the input's filer's)
home on the input's own date. `filerTold`'s `!named.size → true` ignores that.
1. ONE helper for "the input's squadron when it names nobody" — placeholder's `by` first, else `r.by`, his home on the
   input's date (`inputAtIso(r.date, r.yr)`, today if none) — exported from one place and called by BOTH `filerTold`
   and 7c's `unitsOf` (7c reads homes from the rows before the change, `homeBefore(…, before)`: let the helper take
   the home-reader as a parameter, or equivalent — one body, not two copies).
2. `filerTold`: named → as today; nothing named → told only if that squadron is null, or it is his home, or he is an
   admin of it (`levelOfAccount`; master and Plan count). Give `filerTold` an optional date (homes and level read on
   it) — fault C needs it.
3. `toldBy`: the filer counts only from the BEFORE image on a change; on a new input only when its `r.by` is the
   actor himself (the after-image's `by` is the attacker's to write).
4. `adminOwnerViolation`'s `toldBy` door: the line's `by` must be the actor (`String(n.by) === self`), as the pass
   always writes it — the member pass ~2032 already checks this.
Tests (red first): the security read's three proofs (forged filer field on a new ALL AVAIL input with a line to Osprey;
an existing 142 ALL AVAIL input whose filer is changed to Osprey; a line signed `by: 'kes9'`); the honest flow (Hunter
files ALL AVAIL 15 Jul, moves to 149 from 16 Jul, Outlaw — plain 142 admin — changes it 17 Jul: no line to Hunter,
the gate refuses a forged one). Controls green: a filer never moved still told; a master filer still told; a Plan
holder still told; the same input naming a 142 man refused as today.

**Fault B — a genuine Undo / Redo carries any follow-up lines (SEC6-B = Astra 1).** `followUpOf` checks the part's kind,
its `ref` and `to`, never its contents, `name` / `day` / `iid`, `by`, or how many name one line.
1. Export a pure `followUpsFor(replayedChanges, dir)` from `leavewar/sync.ts` that builds exactly the follow-up lines
   `warNoticesReversed` writes (take-back `{k:'lwback', c?, a, b, d, ref, w?, to?, tb?}`; Redo `{...q, again:true, ref}`),
   ids and times aside; `warNoticesReversed` writes from it, and the gate requires every follow-up line a restore puts
   on another squadron's man to deep-equal one of its results (`what`, `name`, `day`, `iid`, `to`), `by` the actor.
2. At most one follow-up per `ref` per command (a set in `adminOwnerViolation`).
Tests (red first): the security read's (a) and (b) — extra "taken back" lines in an Undo, extra "again" lines in a Redo
— and Astra's two (an OL 1–31 Dec 2027 "approved" follow-up in Kestrel's Undo of a refusal of LL 15 Jul; the same in a
Redo); controls: Astra's different-recipient case refused; D2222's Undo → Redo → Undo, read and unread, approved and
refused, still green.

**Fault C — a filer line D2218 / D2223 retired comes back (Opus F2+F3 = Astra 2, and the security read's "not proven").**
`noticeAboutHim` asks today's input and today's homes: deleting the input (`!r → true`), moving back, or the named man
moving into the filer's squadron brings a retired line back, unread ones relighting the bell.
1. Record at the line's writing whether its reader was told ONLY as the filer (not named in the input before or after)
   and the input's squadron(s) that judgement used — e.g. `f: true` and `fu: ['142']` on the notice (names yours; keep
   them small). Lines already stored carry no mark: demo data, not a finding (D56).
2. `noticeAboutHim` for an `iid` line: its `in` / `out` / `rbid` parts as today; unmarked = about him (he was named);
   marked = never "about him" by itself.
3. `noticeLeftBell` for a marked line: on the first day after the line was written on which his home changed (the
   existing `moved` loop), ask `filerTold` ON THAT DAY against the recorded squadron(s) — not told then = off his bell
   for good, read or unread, whatever happens after (the input deleted, he moves back, the named man moves). No read
   of the stored input for a marked line.
4. The gate: a line through the `toldBy` door to someone not named in either image must carry the mark and the right
   squadron(s) — a forger dropping the mark would make the line permanent.
5. `noticeAboutHim` is read by `leaveOut`, the posting take-back and `warNoticesReversed` too: keep them asking the
   one rule; nothing that stores goes through it.
Tests (red first): Opus P2 (input deleted → the line stays off, unread count stays 0); P3 and Astra's two round trips
(away and back, twice — stays off); read and unread each; the named man moving into the filer's squadron after the line
retired — stays off. Controls: a named man's own line survives his move, the deletion and the round trip; a master
filer's line stays; a never-moved filer's line stays.

**Not to build:** Opus F4 (the filer never moved, the named man did — told or not) is a question to him, q2. Leave
`filerTold`'s reading of a named man's home as today; note in its comment that q2 is open.

## Rules
- Each fault its own commit, A first, then B, then C; the message says fault, cause, fix, test. Red first: run each new
  test on `c0c266077`'s code (`git stash`-free: a temporary worktree or `git show c0c266077:path` into a scratch copy)
  and keep its failing line for the report.
- Do not touch `src/engine/` bodies. `perms.ts` changes → `docs/data-model.md` §11 where what it allows changes; a new
  field on the notice → `docs/data-schema.md` and `docs/data-model.md` (the table list, D473). Code comments say WHY, in
  prose, naming the ruling. `docs/file-map.md` if a file is added.
- Checks before you finish (from `raptor-port/`): the touched suites one by one; then the whole `npm test` under the
  lock — `node scripts/gatelock.mjs exec "multi-sqn-b1-107 — fr6 fixes" -- npm test` (it releases by itself); `npm run
  build`; `node reference/tfin.js` (728/0); `npm run rulecheck`; `npm run docsize`; `npm run lint:changed`. No browser
  files: nothing a screen draws changes (if you find one does, say so and stop for the host).
- Commit; do NOT push (the host pushes after reading your diff). No merge. No `HANDOFF.md` edits.

## Hand back (short — the host's context matters)
Per fault: cause in one line, fix in one line, each test's name, its red line on the old code, green after. Every
check's result. The commits. Anything you could not do, or any place this brief was wrong, plainly.
