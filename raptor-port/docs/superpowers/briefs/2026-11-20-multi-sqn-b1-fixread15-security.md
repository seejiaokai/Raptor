# Fix read 15 — the security reader (a fresh Opus reader looking only for holes, D1411), returned 20 Nov 26 (saved by the host from its final message)

Read-only; one proof test file placed temporarily in the copy, run with `npx vitest run`, deleted; `perms.ts` put back
byte for byte after one comparison run against the pre-fix gate. No handoff block was pasted, so there was none to ignore.

## Finding SEC15-1 — a member's Undo erases the scheduler's Remove from his own leave (fix A incomplete; it existed before these commits)

**Consequence.** Ranger is a member. He can clear the scheduler's "Remove" from his own saved leave. Remove is `acc: 'r'`,
the scheduler's choice to take a request off the programme. Once it is cleared, the request counts and flags again, and the
next week load can land it back on the programme. The gate refuses this when he tries it directly (D1388, "where a
scheduler put an input"). It goes through by way of an honest edit followed by Undo.

**Cause.** In `perms.ts`, `storedRowViolation` (b) now carries the saved row as a put's before-image. That is right. But
`withLanding` then copies `acc` and `odGround` from memory onto it, "present or absent as memory has them", whatever the
value. Only `acc: 'g'` is a mark that a week load writes and never saves:
- `said` in `perms.ts` says this, and so does the restore strip in `sched-commit.ts`, which strips only `'g'`.
- The landing in `slots.ts` returns early when `acc` is `'u'` or `'r'`.
- `holderbase.ts` writes only `'g'`.

The values `'u'` (Unavailable) and `'r'` (Remove) are real filings. So the Undo image the gate carries is not the image
its second pass judged, and no check reads a restore (`inputBreach` returns at `replayed`).

**Proof (ran it, red).** Same harness as `multi-sqn-fixread14.test.ts`, with a saved copy wired (Whiteboard, `wireRows`,
`writeSeedRows`):
1. As `us`: `writeInputsBatch` pushes `{person:'bane', date:'Jul 27', yr:2026, allday:true, type:'LL', by:'bane', iid:X, …}`.
2. As `ad2`: `writeInputsBatch(() => { x.acc = 'r' })`. The saved row now holds `acc: 'r'`.
3. As `us`, outside every command: `delete x.acc`.
4. Then `writeInputsBatch(() => { x.acc = 'r'; x.remarks = 'mine, changed' })`. Accepted: the first pass sees memory with
   no hold, and the second pass sees `'r'` kept.
5. `globalUndo()`. It returns ok, and the saved row's `acc` is now **undefined**. Expected `'r'`.

Control (green): as `us`, `writeInputsBatch(() => { delete x.acc; … })` straight on the removed leave is refused, and the
saved row keeps `'r'`.

The same probe on the pre-fix `perms.ts` is also red. So fix A did not introduce this; it narrowed SEC14-1's hole to these
two fields and left it open there. The same door works with memory `acc: 'u'` over a saved `'r'`: Undo saves `'u'`.

**Fix, step by step:**
1. In `withLanding`, carry only the landing value of `acc`:
   - if memory's `acc` is `'g'` and the saved row has none, set `'g'`;
   - if the saved row's `acc` is `'g'` and memory has none, drop it;
   - otherwise keep the saved row's `acc`. Never take or drop `'u'` or `'r'`.
2. Where the saved row is held (`placeHeld`: `schedPlaced` or `acc: 'r'`), keep its `odGround` as saved. Otherwise carry
   memory's `odGround` only alongside a `'g'` landing.
3. Add the probe above, plus the `'u'`-over-`'r'` variant, as red-first tests.
4. Change the builder's honest control in `fixread14.test.ts` to use `x.acc = 'g'`. It sets `x.acc = 'u'` "as a week load's
   landing writes it", but no week load writes `'u'`. As written, that test locks in the over-broad carry.

**Rank.** Medium. It is the same threat model as SEC14-1: memory written outside every command, the tool a member has in
his own browser. Only his own leave is reached; nothing crosses squadrons, and nobody else's account is touched.

## Explicit negatives (checked, nothing found)

**A, a member setting marks directly.** As `us`, I set `acc: 'u'`, `acc: 'r'` and `odGround: true` directly on his own
unheld saved leave (and on an OD). All are accepted and saved. That is allowed, because the "Goes to" control lets a member
move an unheld request (`mayMovePlace`). So the Undo route adds nothing there; it matters only against a hold.
- `odGround` with `schedPlaced`: the first pass refuses the needed edit, because memory still holds `schedPlaced`. So I
  found no door for it today. Step 2 above is defence in depth.

**A, the "never saved" half and other rows.**
- A put with no saved row carries no before-image, so its Undo takes the record away. This cannot reach a saved record,
  because `before: null` is set only where the saved copy holds nothing.
- Records that came from another device (`REMOTE_ONLY`) and the saved copy not yet whole are exempt, as before.
- Bell lines carry the saved row whole.
- The carry is applied only when every check passes (`ownershipViolation`: `if (!why && stored)`).

**People (D).** A people command's before-image is the saved-roster baseline (`PEOPLE_BASELINE`), never live memory. So the
memory rewrite behind SEC15-1 cannot clear `deleted` to slip past `deletedPersonViolation`.
- All four delete marks are compared for every actor, a restore included. An Undo that would bring him back is refused
  (D350, D290/D297).
- A delete of the row is refused, because the after-image is missing.
- I found no door by which another squadron's admin, or a member, brings a deleted man back.

**B (`filerUnits`, read per image).** Per image is never wider than the old cross, with one exception: an image naming
nobody now counts its own squadron (`inputUnit`, from its placeholder's filer or else its `by`).
- `filerVia` still tells only through a squadron that is the filer's own home (unmoved, or a moved admin there — D2228)
  or one where he is admin today. A moved filer who is not an admin there gets null (D2223).
- Named men with no squadron still give null, not "told with no squadron". So it does not fail open.
- A forged `by` in the after-image is held by `inputUnitViolation` and the `by` rules, and the filer told is always the
  before-image's (`changeFiler`).
- The pass, the gate (`toldBy`, `filerMarkOk`) and the line's mark read one body. A crafted image cannot get a line past
  the gate that the pass would not write.

**C (words on a war-approved leave told whatever else changed).** The recipients are unchanged: the men named in the
after-image, plus the before-image's filer through `filerVia`. Only the set of commands that produce a words line grew.
- Another squadron's admin cannot raise a war command on 149's leave (`warUnitViolation`).
- I found no way to tell someone of another squadron's business, or to tell a moved, non-admin filer.

**Rounds 7–13.** None of these commits weakens the checks of earlier rounds:
- the written-as-new rule;
- a saved row judged as saved;
- a removal of a never-saved record refused;
- the retired command type;
- the posting pass.

SEC15-1 is the only security finding.

---
**Host's reproduction (chat 122):** both proofs red on `f27c924be` (`src/leavewar/multi-sqn-fixread15.test.ts`, "SEC15-1":
the Remove cleared → saved `acc` undefined; `'u'` over it → saved `'u'`); the control (clearing it straight) refused, green.
Its step 4 confirmed: a restore strips the derived `'g'` (sched-commit.ts), so the honest control is rewritten with `'g'`
and expects no filing saved after Undo.
