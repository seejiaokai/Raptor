# Fix read 7 — the fresh, blind Opus reader's report (19 Nov 26, chat 116; copy at 69a5bdb1d)

Saved whole as handed back; not yet reproduced by the host.

---

# Fix read 7: report from the fresh, blind Opus reader (copy at 69a5bdb1d)

I worked only in `.../scratchpad/fr7/opus`. No handoff block was pasted after a compaction. I opened none of the forbidden files: the fixread6 walk and walk brief, any other `*fixread7*` file, the handpass sheet, and HANDOFF's b1-107 block.

I put two proof files in `src/leavewar/` for a short time (`zz-fr7-opus-proof*.test.ts`, built on the fixread6 test harness) and have deleted them. The scratch TMP folder is deleted too, and node_modules was not touched.

**Baseline, each file run on its own, all green:** the three new fixread6 files (32 tests), inputs-readers 7, m4bell 24, fixread2-war 11, fixread3-postlock 5, fixread3-retract-moved 16, fixread3-undo-moved 3, fixread4-bells 20, job2-retract 3, job2-sec5 5, job2-warbell 3, job2-xhist 1, postout-notice 27, state fixread3-admin-own-input 4, fixread4-admin-own-input 5, fixread5-admin-placer 6, perms 102, undo-wire 52, units-sqn-fixread 14, units-sqn-fixread2 34.

## Findings, by consequence

### F1 (medium, introduced by a6f2b2923, fault A's `changeFiler`): a member's Undo of deleting an input someone else filed for him is refused, even when nobody has moved

- **Failure.** Hunter (142 admin) files LL for Ranger. Ranger (member, 142) deletes it, and the pass tells Hunter "Deleted" (`fu: ['u142']`). Ranger presses Undo and gets "That couldn't be completed just now." It breaks D148: the delete itself was allowed.
- **Cause.** The Undo's restore puts the input back (`before: null`), so in `toldBy` the call `changeFiler(null, after, self)` returns only the actor. Hunter is therefore not in the set of people the change tells.
  - The member door's restore-delete clause (`perms.ts` ownershipViolation, case 'notices': `c.op === 'delete' && env.origin === 'restore' && … && toldBy(env, b.iid)?.has(b.to)`) then refuses the delete of Ranger's own line to Hunter.
  - The old `toldBy` added `r.by` from any image, so Hunter was in the set and the Undo went through.
  - An admin's Undo of the same delete passes, through the admin restore-delete branch (my control test, green).
- **Proof (red).** The test did: `signInAs('ad2','a2'); fileFor('bane','prowler'); signInAs('us','us'); del(); expect(l.fu).toEqual(['u142']); globalUndo()`.
  - Result: `{"ok":false,"reason":"That couldn’t be completed just now."}`.
  - I wrapped the `member-writes-own` gate check to log the refusal: `REFUSED: undo.restore restore a notice that is not his own change's (notices/…) [["inputs",…,"put"],["notices",…,"delete"]]`.
- **Fix.**
  1. In the member door's `case 'notices'`, let a restore's delete through when the timeline vouches for it:
     `if (c.op === 'delete' && env.origin === 'restore' && b && String(b.by) === pid && rides(b.iid)) { if (replayed === undefined) replayed = REPLAY ? REPLAY(env) : null; if (toldBy(env, b.iid)?.has(String(b.to)) || (replayed && replayed(c))) break }`
     This only ever takes away his own line, image for image, the same as the admin branch.
  2. Leave `changeFiler` as it is for puts (the security reason for it holds).
  3. Tests: this one turns green. Add controls: a forged restore (no replay) deleting someone else's line is still refused, and the Redo of the delete puts the marked line back.

### F2 (medium, not introduced by these commits; dates from fix read 5's `filerTold` in `toldBy`): a member's Undo is refused once the filer has moved

- **Failure.** Hunter files LL for Ranger. Ranger changes its remark, and Hunter is told. Hunter moves to 149 from 16 Jul. On 16 Jul Ranger's Undo is refused, with the same refusal and the same door. The change itself would be allowed today, and the line it removes has already left Hunter's bell (D2218).
- **Cause.** The same clause: `filerTold` is now false for Hunter.
- **Fix.** The same as F1, which covers both. Red test: `rmk('Ranger words'); homes('prowler',…,[['u142','2026-07-15'],['u149','2026-07-16']]); on(16); globalUndo()` returns ok false.

## The ask: explicit negatives

**1. Completeness.**
- All bell paths go through `noticeLive`, then `noticeLeftBell`: the list, the unread count, "mark all read" and marking a single line read. Undo's `leaveOut` uses the same rule, and so do the posting take-back and `followUpsFor`.
- The pass is the only writer of input lines, and it marks `fu` in both the change branch and the delete branch.
- Storage and 7c read no display rule. 7c and `filerTold` share `inputUnit`, and 7c still hands in the homes as they stood before the command.
- `notices.ts` no longer imports INPUTS; inputs-readers is green.

**2. Narrowness.**
- The admin telling door now needs the line signed by the actor, or no maker on an app act. The member door was already signed.
- `toldBy` takes the filer from the before-image, so a forged after-image `by` or placeholder `by` cannot widen it; a forged after-placeholder pointing into 149 is refused by 7c anyway.
- `filerMarkOk` demands the exact set (duplicates are caught), and no mark at all to a named man, at both doors.
- `followUpOf` deep-compares what the line says, its name, day, input and addressee with `followUpsFor`, and allows one line per ref per command.
- With the probe unset, the gate fails closed. Proof: `setFollowUpsProbe(null)` makes a genuine Undo after the move refused whole, with the line left intact. It is set inside `wireLeaveWarSync`, the same module that writes the follow-ups.
- Residuals I did not prove as harm:
  - The gate checks the shape of a follow-up line, not whether it is owed now. For example, a "taken back" for an unread line is not refused if it rides a genuine Undo. My attempt to slip one in was not saved.
  - Its `at` is not checked.
  - An admin may still write an unmarked or wrongly marked input line to a man of his own squadron through his own-man door; only a forged command could, and he owns that bell at the time. Low.

**3. The rules: D2218, D2222 and D2223.** Each of these matches the rulings:
- The move day itself: lines dated after the line was written count, a line written on the move day is never retired, and the pass does not tell him that day.
- Read and unread; moving back; two round trips; the input deleted; the named man moving into the filer's squadron (all fixread6-retired tests).
- A master and a Plan holder stay told (toldIn by level on that day).
- A filer who never moved stays told.
- An ALL AVAIL input is judged by `inputUnit`.
- D2222: Undo, Redo, Undo, read and unread, approved and refused.

The only gap is in Undo (F1 and F2). F4 / q2 is still open, as the brief says.

**4. What broke.**
- F1 and F2 above.
- Otherwise none found: admins' and the master's normal work, a never-moved bell, the posting pass and its take-back (postout-notice, job2-retract, fixread3-retract-moved), D2215 (no change to the posting lines; the app-acts list moved but has the same members), and the pass's tellers (`by` = actor, `app` from the app-acts list) are all consistent.

## The builder's four departures

1. **Filer from the before-image, or the actor on a new input.** Sound for security. But it leaves out a restore that re-creates an input, which is F1; fix that at the door rather than reverting this.
2. **Re-judged on every move day.** Correct, and truer to D2218 than "first move day only": a master or Plan holder told on one move is judged again on the next, and nothing comes back.
3. **A line with no maker on an app act passes.** Needed, because the pass writes `by: null` on `person.delete`, `lw.postout` and `lw.postoutRun`. It is narrower than before, where no signature was checked; the addressee is still bounded by `toldBy` and the mark. Acceptable.
4. **Probe set at start-up.** Acceptable. If unset it fails closed (proved): only the follow-up allowance is lost, and the Undo is refused rather than letting anything through.

Rulings: none.
