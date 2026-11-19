# Fix read 4 — Astra's read (Codex, gpt-6-astra, read-only, 08:24–08:30 19 Nov 26)

Read of an exported copy of `claude/multi-sqn-b1-107` at `ea68a8f48` (fix read 3's five fixes, `3f9e5a204..ea68a8f48`), brief `…-fixread4-brief.md`. Blind to the walk and to the other reader. Saved after both readers had reported; unchanged below. Not yet reproduced by the host.

---

**The five fixes are not fully cleared. Two code-read findings remain: an overly broad posting-notice exception and an incomplete Undo notification path.** Neither was executed here; the host must reproduce the proofs below.

Reviewed the exported `ea68a8f48` copy and supplied five-commit patch. No files changed, no tests run, no commits or pushes. I did not open any FIXREAD4 report under the briefs folder. No post-compaction handoff was received or used.

**1. Medium — the posting exception permits deleting an older run’s notice from another squadron’s bell**

A posting can run twice for the same person, date and outcome after a same-day Restore. The earlier run’s notices must remain when the later posting is taken back. The normal writer distinguishes them, but the new permission exception does not.

Cause: `raptor-port/src/state/perms.ts:1847–1852` matches person, date and outcome, then checks only that the notices being deleted share a timestamp **with each other**. It never checks that timestamp against the current posting’s newest run. Deleting one older notice always satisfies that last check.

Consequently, a forged `lw.postout` command cancelling the current posting can delete an earlier run’s notice held by a recipient who has moved squadron. This is **introduced by A2 (`b918800cf`)**. The ordinary Undo writer selects correctly; the new boundary protecting another squadron’s bell is too permissive.

Exact host proof:

1. Copy the fixture from `src/leavewar/multi-sqn-fixread3-retract-moved.test.ts`.
2. On 15 July 2026, sign in as Saber and promote Outlaw as its `setup` does.
3. Run `postOut('bane', '2026-07-15', 'overseas')`. Save Hunter’s posting notice as `old`.
4. Run `restoreArchivedPerson('bane', '2026-07-15')`.
5. Advance the clock to 15 July, 09:05; run the same Overseas Sqn posting again. Assert Hunter now has two matching `po` notices with distinct timestamps.
6. Save Hunter’s move with `setHome('prowler', 'u149')`; advance to 17 July, reload units, sign in as Outlaw.
7. Take the current posting record as `rec`. Submit this boundary proof:

```ts
const env: any = {
  type: 'lw.postout',
  origin: 'user',
  actor: {
    id: 'acoutlaw', role: 'admin',
    personId: 'casper', session: null,
  },
  changes: [
    {
      collection: 'lw.postouts', id: 'bane',
      op: 'delete', before: structuredClone(rec), after: null,
    },
    {
      collection: 'notices', id: old.id,
      op: 'delete', before: structuredClone(old), after: null,
    },
  ],
}
expect(ownershipViolation(env)).not.toBeNull()
```

**Predicted failure:** it returns `null`, permitting deletion of the older run’s foreign notice. Repeat through the command harness to verify rejection and rollback of the whole forged command.

**Exact fix:** reconstruct the notices before the command, including deleted before-images; select the newest matching run using the same rule as `postingLinesOf`; allow foreign deletions only from that selected set. Validate added “taken back” lines against those exact originals. Retain a passing control where ordinary Undo removes the latest run’s lines and preserves the earlier ones.

**2. Medium — successful Undo silently removes a read notice after its recipient moves**

O2 now permits the original notice to be removed by verified Undo. Its follow-up still skips anyone no longer in the war’s squadron.

Cause: `raptor-port/src/state/undo-wire.ts:400` calls `warNoticesReversed`, but `raptor-port/src/leavewar/sync.ts:1642` immediately skips a moved recipient. The new verified-replay exception covers the original restore, not this separate follow-up command.

Example: Osprey reads Kestrel’s “Bidding open” notice, moves to 142, then Kestrel undoes opening bidding. Undo succeeds and the original disappears, but Osprey receives no unread “taken back” notice. Redo restores the original with its already-read identifier, without a fresh notification.

This is an **incomplete O2 fix**: the filter predates these commits, but O2 newly allows Undo to reach this silent outcome. D1693/D1699 require the correction for a read line.

Exact host proof:

Use `src/leavewar/multi-sqn-fixread3-undo-moved.test.ts`. In `run(true)`, immediately after opening bidding and before moving Osprey, capture his new `lwopen` notice as `old`. Simulate his read record arriving from another device, preserving Kestrel’s Undo history:

```ts
mem['sqn142_noticeseen:osp9'] =
  JSON.stringify({ upto: 0, ids: [old.id] })
noticeSeenLoad()
expect(hasRead('osp9', old)).toBe(true)
```

Continue the fixture’s existing move and Undo. Require:

```ts
expect(r.ok).toBe(true)
expect(NOTICES.some(n => n.id === old.id)).toBe(false)
expect(NOTICES.some(n =>
  n.to === 'osp9' &&
  n.what.some(p => p.k === 'lwback' && p.ref === old.id)
)).toBe(true)
```

**Predicted failure:** the final assertion is false. Then call `globalRedo()` and require a fresh unread opening notice to Osprey; the restored, already-read original alone is insufficient. Keep no-move and unread-original controls.

**Exact fix:** carry trusted reversal context into the follow-up, authorizing only corrections derived from that actor’s verified reversed step and its original recipients. Remove the current-home exclusion for those corrections. Extend the permission check narrowly for this follow-up; simply removing the filter would leave its foreign write refused. Cover Undo, Redo and repeated reversal.

**Other checks and explicit negatives**

| Fix | Static conclusion |
|---|---|
| O1 — own inputs | I found no additional recipient or placeholder escape in the changed sole-person exception. Shared inputs still undergo squadron checks. |
| O2 — verified replay | I found no bypass from merely claiming `origin: 'restore'`: the active timeline application, originating person and recorded changes are checked. Restoring the original line on Redo is intentional; the missing read-notice follow-up is finding 2. |
| A2 — posting retraction | Normal unread removal and read correction now include moved recipients. Unrelated notices without a qualifying posting change remain refused. Finding 1 concerns selecting the wrong run. |
| A1 — last-admin protection | I found no additional bypass in the changed future-home and archived-person checks. The pass rechecks each posting after earlier outcomes, supporting “one runs, the last waits.” An already-short squadron alone does not trigger the per-squadron comparison. |
| O3 — grid anchoring | I found no new self-sustaining loop. The manual-position and phone restrictions are narrower, but browser behaviour remains unproved here. |

For O3, the host should repeat September → March → December → September at desktop 1536×864 and phone 402×874, including fractional zoom. Measure each first-day gap during filling and after settling. Repeat with an unrelated click during desktop filling: the document-wide listener clears the landing mark even without scrolling, exposing the drift risk named in the brief. On a phone, flick 100, 400 and 1,000ms after a jump; real-iPhone inertia remains a device check.

Tidiness: the posting preflight and command backstop still contain separate last-admin calculations. No additional failure established; consider sharing the calculation when fixing this area.

**Walk: NOT DONE — read-only review. Host reproduction and browser evidence remain owed.**  
**Rulings: none this session.**

