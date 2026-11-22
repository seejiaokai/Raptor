# Fix read 10 — Fable's read (blind; D2224; 20 Nov 26, chat 118; copy at `064079abf`, code = `945c6de69`)

No handoff block was pasted. Read: the brief, AGENTS.md, FIXES-LOG, FIXES.patch, fix read 9's security report and
brief, the code. `src` unchanged but its proof folder; node_modules untouched. Proofs (chat 118's scratch,
`fr10-fable/raptor-port/src/zz-fable10/`): `p.test.ts` — 6 red, 1 green control; `q.test.ts` — 4 red probes (the gate's
own words). Could not run the pre-fix code: "introduced by" is from the diff, except where a same-day control proves it.

## F10-1 (medium) — fault D incomplete: a line with no parts and no input follows a moved man
- Outlaw (142 admin), in an ordinary input command, puts `{to:'prowler', by:'casper', iid:'', name:'149: report to
  Kestrel 0600 Sat', what:[]}` — saves; on 17 Jul it is on Hunter's 149 bell for good: `{saved:true, shownOn17:true}`.
- Worse: `what:[null]` passes the gate; `noticeAboutHim` reads it as about him; `noticeWords` throws ("Cannot read
  properties of null (reading 'k')") — his bell's list breaks in his new squadron.
- Cause: D's check fires only when some part is a war kind; `noticeAboutHim` returns true with no first part; nothing
  checks a line's parts.
- Fix: (1) in `adminOwnerViolation`, after the own-man door, any put with an empty `iid` must be in `warMade(env)` or a
  verified replay, whatever its parts (noticeHoliday's new line already skipped above); (2) every put, both sections:
  `what` a non-empty array of objects each with a string `k`; (3) `noticeAboutHim` false, not true, with no first part.
- Proof: `p.test.ts:110`, `:115`; `q.test.ts:138`. Introduced? No — older; the door D was meant to close.

## F10-2 (medium) — fault D incomplete: a war line rides the telling door
- Outlaw changes the remark of an input naming Hunter (dated 15 Jul) and pushes `{to:'prowler', by:'casper', iid:<that
  input>, name:'Your leave', what:[{k:'lw', c:'OL', a:'2026-12-01', b:'2026-12-31', d:'refused'}]}` — saved, shown on
  Hunter's 149 bell on 17 Jul as a leave decision the war never made.
- Cause: the telling door (`signed && n.iid && changedInputs.has(…) && toldBy… && filerMarkOk`) `continue`s before D's
  war check; the member section refuses a war part on such a line, the admin section does not.
- Fix: add "no part in `WAR_LINE_KINDS`" to the telling door's condition, or move D's check above it; red test.
- Proof: `p.test.ts:128`; gate-level `q.test.ts:106` ("allowed"). Introduced? No — older, left open by D; the log's
  "refuses a put of a line with any war part" is not true here.

## F10-3 (medium) — fault C broke a normal action: a master cannot re-link another master's account to a different person
- Saber makes Hunter a master on 15 Jul; on 18 Jul Saber changes that account's person on Admin → Users
  (`updateAccount('acad2', {pid})`): "That did not save" — the gate: "the master mark not dated today (account:acad2)".
  The same re-link on 15 Jul saves (control green). A master whose mark has no day (the seeded master) can never be
  re-linked.
- Cause: `masterKept` now needs the same person, so the gate wants today's day; `updateAccount` copies the old
  `masterFrom`.
- Fix: in `updateAccount`, when `patch.pid` changes and the account is a master, `next.masterFrom = todayIso()`; red test.
- Proof: `p.test.ts:137`; `q.test.ts:130`. Introduced? Yes, by `f27fbb89e` (fault C).

## F10-4 (low–medium) — fault C incomplete: an account holding a grant, re-linked to a moved man, keeps the grant's old day
- Kestrel's account holds Plan of 142 from 15 Jul; Hunter moves to 149 on 16 Jul, his 142 filer line retired; on 18 Jul
  Saber re-links Hunter's own account elsewhere, then Kestrel's account to Hunter — two ordinary Admin → Users saves:
  `{r:null, back:true}` — the retired line is back.
- Cause: C closed the right changing hands on the grant row and the mark, not through the account row's person;
  `adminThen` counts the grant from its own day whoever holds the account.
- Fix: (1) `pidFrom` on the account row, `updateAccount` writing today on a person change; (2) `adminThen` counts a grant
  or the mark only from the later of its own day and `pidFrom`; (3) the gate and `restoreRedated` hold `pidFrom` as they
  hold `masterFrom`.
- Proof: `p.test.ts:156`. Introduced? No — SEC9-1's class, left open.

## F10-5 (low; choice 2's failing input) — a removal undone the same day, after a move, loses a line he rightly held
- Hunter holds Plan of 149 from 13 Jul, is told as filer on 15 Jul (marked 149), moves to 150 on 16 Jul — the line stays,
  correctly. 17 Jul Saber removes the grant by mistake and presses Undo: the grant back dated 17 Jul, the line gone for
  good.
- Cause: A's "one rule, no move test". Fix, if he wants it: `restoreRedated` keeps the recorded day when none of the
  man's home changes falls after the day the step turned the right off, up to today; otherwise today.
- Proof: `p.test.ts:174`. Introduced? Yes, by `f5fb03fd1` — a trade-off, his to rule on.

## The builder's choices
1. F's exception — supported: a marked filer line can be ahead only if written today, and the pass writes one today only
   through his home or a right held today — the exception's test. One flicker: a right removed within the minutes the
   clock was set back hides the line until the clock catches up. No failing input worth a fix.
2. Redo dated the Redo's day — supported by D2218 / D2223, with F10-5's cost: never keeps a line he should lose; can lose
   one he should keep.
3. The bare resync callers — supported: boot, load, sign-in and week load run outside commands; `postRestore` runs inside
   a restore, which tells nobody; the after-command pass runs after the commit.
4. The registries — supported: keyed by the running envelope, written only by their writers; a nested child joins its
   parent's envelope; a failed command's entries go with it; Undo / Redo pass by verified replay. Limit: `warMade`
   vouches for an id, not for what the line says.
5. C — supported at the grant row (net change only; removed and given again dated today in one command is refused; no
   screen does that). Holes: F10-3, F10-4.
6. E — supported: a put over an existing id carries a before-image, so it takes the owner check (and D's — `oilhol` is a
   war kind); a replay only for the same person's own step. Older: a new holiday-shaped line may still name any maker.

## Explicit negatives
- A: the image vouched for is the re-dated one; the recorded step untouched; the mark staying on keeps its day; a
  restore leaving the mark off not re-dated; Post out, archive, restore do not toggle the mark or a grant.
- B: all five call sites before the enlist; the posting pass's resync before its own changes.
- D: the five production calls of the three writers all inside a command's reducer; no legitimate war line refused —
  decision, bidding, posting, take-back, Undo's "taken back" and "again".
- E: nothing in the app deletes or rewrites a holiday line outside Undo / Redo.
- F: a new line still within five minutes and not on a later day; fix read 7's backstop holds; every bell reader calls
  `noticeLeftBell` with today's default.
- Rounds: A vs G, D vs M and S, E vs H, F vs T and B — nothing undone; C vs P: only F10-4.
- Not run: the three fix-read test files as a baseline; the three "known, red on purpose" proofs.
