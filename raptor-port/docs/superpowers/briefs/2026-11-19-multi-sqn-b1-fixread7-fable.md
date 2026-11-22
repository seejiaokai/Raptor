# Fix read 7 — Fable's report (Fable 5.2, D2224; 19 Nov 26, chat 116; copy at 69a5bdb1d)

Saved whole as handed back; not yet reproduced by the host.

---

# Fix read 7 — Fable's report (blind; copy at 69a5bdb1d)

No handoff block was pasted after a compaction; none was read. I opened only the brief, the fix read 6 brief, FIXES.patch / FIXES-LOG.txt, the rulings' full rows (D2218, D2222, D2223) and the source. Proof tests were placed temporarily in `raptor-port/src/leavewar/` and deleted; nothing under `src` is changed. The builder's own suites are green as delivered (inputs-readers 7, allavail 9, followups 11, retired 12, fixread4-bells 20, fixread3-retract-moved 16).

Two findings, both proved red. Fault B's fix I could not break.

---

## Finding 1 (highest) — a member's Undo of his own delete is refused whole when the leave was filed for him by someone else. INTRODUCED by these commits (fault A, a6f2b2923).

**Concrete failure.** Hunter (142 admin) files LL 25 Jul for Ranger. Ranger (member) deletes it; Hunter is told "deleted" as its filer. Ranger presses Undo: "That couldn't be completed just now." The leave does not come back, and since the step can never pass, it blocks his Undo there.

**Cause.** `state/perms.ts` `toldBy` now takes the filer from `changeFiler(c.before, …)`. In the Undo's envelope the input is put back, so its change has `before: null` — `changeFiler` treats it as a NEW input and returns the filer only if it is the actor. The filer (Hunter) is no longer in the set, so the member door's delete branch (`ownershipViolation`, `case 'notices'`: `c.op === 'delete' && env.origin === 'restore' && … toldBy(env, b.iid)?.has(String(b.to))`) fails. Before these commits `toldBy` added each image's `by` (the removed line `for (const r of imgs) if (r.by != null && filerTold(String(r.by), ...imgs)) out!.add(String(r.by))`), so the after-image's filer passed.

The admin door is not hit: its restore branch (own line, delete, verified replay) rescues it — control run green, including Hunter deleting / changing a leave the master filed after the master moved to 149, Undo then Redo.

**Test, red** (harness of `multi-sqn-fixread6-retired.test.ts`):
```
signInAs('ad2','a2'); fileFor('bane','prowler')
signInAs('us','us'); del()
expect(NOTICES.find(n => n.to==='prowler' && n.iid===IID)).toBeDefined()
const u = globalUndo(); expect(u.ok).toBe(true)
```
Output: `Undo: {"ok":false,"reason":"That couldn't be completed just now."}`. Wrapping the registered `member-writes-own` check showed the gate's own words: `undo.restore restore [["notices","delete",before,to prowler],["inputs","put",-,"after.by=prowler"]] => a notice that is not his own change's`.
Controls green: the member's Undo + Redo of a CHANGE to that leave; his Undo of deleting a leave he filed himself.

**Fix, step by step.**
1. In `toldBy`, compute once `const replay = env.origin === 'restore' && REPLAY ? REPLAY(env) : null`.
2. In the filer loop, where `c.before == null` and `replay?.(c)` is true (the verified replay putting back the input the actor's own step took away), take the filer from `c.after`: `const b0 = c.before ?? (replay && replay(c) ? c.after : null)`, then `changeFiler(b0, c.op === 'delete' ? null : c.after ?? null, self)`. A forged restore gets no replay, so fault A's proofs stay closed (the image is the step's own recorded one, not the command's to write).
3. Add the red test above, plus its Redo, to the fault A file.

---

## Finding 2 — a retired filer line still comes back: when the moved filer is later given Plan of his old squadron (or made master). NOT introduced — a door of fault C left open.

**Concrete failure.** Hunter files for Ranger; Saber's change on 15 Jul tells Hunter as filer (marked 142). Hunter moves to 149 from 16 Jul; on the 17th the line is off his bell. On the 18th the master gives Hunter Plan of 142: the 15 Jul line is back on his bell, and an unread one lights it again. D2218 says it left "for good".

**Cause.** `noticeLeftBell`'s marked branch asks `toldIn(to, fu, d)` for the move day `d`, but `toldIn` → `levelOfAccount` → `levelFrom` reads the master flag and the grant rows, which carry no date. So the move-day judgement is re-made from today's rights each time a bell is drawn — the same shape as fault C's original cause.

**Test, red** (read and unread, both fail):
```
const l = hunterLine(); homes('prowler','hc',[['u142','2026-07-15'],['u149','2026-07-16']]); on(17)
expect(shown('prowler', l.id)).toBe(false)            // passes
on(18); signInAs('ad','a'); expect(setGrant('acad2','u142','admin','prowler').ok).toBe(true)
signInAs('ad2','a2'); expect(shown('prowler', l.id)).toBe(false)
```
Output: `still off after the Plan grant: expected true to be false`.

**Fix, step by step.**
1. `setGrant` writes `from: todayIso()` on the grant row (rewritten when a grant is replaced); add the optional field to `Grant` in `units-model.ts` and its row check.
2. In `toldIn`, when `iso` is given, count a grant only if it has no `from` (rows stored before this — D56) or `from <= iso`. Do this in `toldIn` only, not in `levelFrom` — the commit gate's rights must not change.
3. The master flag has the same timeless shape (a filer made master after his move gets the line back). Either date it the same way or accept it as a named reading — it needs the owner's reading only if kept.
4. Add the red test to the fault C file. Note the opposite direction is harmless: a Plan removed later makes the line leave, never return.

---

## Notes, not findings
- **Frozen at writing.** The mark freezes "named or filer-only" at the moment of writing. So (i) a man named when told and later taken out keeps his older lines on that input after a move (before, they left); (ii) a filer-only line retires on his move even if he was later added to the input, or moved together with the named man into the same squadron. D2223's "named in that input" can be read either way; the builder's reading is consistent and never brings a line back. Worth one line to him only if he cares.
- **Follow-up not tied to read state.** The gate lets the one exact "taken back" line ride a genuine Undo even where the man had not read the original (the honest writer writes none). One true line, exact content; not run as a test.
- **A future-dated ALL AVAIL input follows its filer's move** (its squadron is his home on the input's date) — that is the gate's existing rule, which `inputUnit` only shares; not from these commits.

## Explicit negatives, by the brief's ask
1. **Complete / same rules.** Bell list, unread count, mark-all-read and the tap all go through `noticeLive` → `noticeLeftBell`; the restore's `leaveOut`, the posting take-back and `followUpsFor` ask `noticeLeftBell` / `noticeAboutHim`. The pass and the gate both ask `changeFiler`, `filerTold`, `filerUnits`; 7c and `filerTold` share `inputUnit`. `notices.ts` no longer reads the stored inputs (guard green). Storage keeps the mark (whole objects saved; snapshot restores it). Nothing that should not goes through them — except Finding 1, where the gate's fact (the filer) is wrongly read from a restore's absent before-image.
2. **Narrow / sound.** I found no way to write, delete or restore a line on another squadron's bell through `toldBy`, `followUpOf` or the no-maker allowance: fault A's three forgeries stay refused; a follow-up must equal the writer's own line field for field, one per line named; a forged restore gets no replay. The mark cannot be dropped, widened or mis-set on a line through either telling door (`filerMarkOk` demands exactly the pass's value; a named man must carry none); a marked line with an "added / taken out" part is still judged by the mark. Probe unset: `followUpOf` returns null — fails CLOSED (the Undo is refused, nothing leaks).
3. **Rulings.** Move day, read and unread, moving back, two round trips, a line on the move day (not told that day), master, Plan holder at writing, never-moved filer, input deleted, ALL AVAIL, named man moving in: all behave as ruled — except Finding 2 (rights given after the move).
4. **Broken.** Only Finding 1. Admins' and the master's Undo / Redo of input changes and deletes across the squadrons pass; D2222's Undo → Redo → Undo passes; the posting take-back handles only posting lines and is untouched.

## The builder's four departures
1. **Filer from the before-image (actor on a new input):** right for user commands; wrong for a restore that puts a deleted input back — Finding 1.
2. **Checked on every move day, retiring on the first not told:** sound and matches D2218; its one gap is that the test reads undated rights — Finding 2.
3. **No-maker line in an app act passes the admin door:** needed (a delete or posting tells with no name) and narrow — it reaches only people the change already tells. Residual: an admin could label his own change as one of those acts to tell without his name; low, same reach.
4. **Probe set at start-up:** installed by the Leave War wiring at boot, before any Undo can run; unset, the gate refuses the follow-up (and so that Undo) rather than letting anything through — acceptable.
