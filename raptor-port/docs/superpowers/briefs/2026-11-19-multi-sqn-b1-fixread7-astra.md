# Fix read 7 — Astra's report (GPT-6 Astra, read-only; 19 Nov 26, chat 116; copy at 69a5bdb1d)

Saved whole as handed back; not yet reproduced by the host. Astra says its start-up reads (AGENTS.md: the handoff first) showed it the builder summaries before the brief's exclusion.

---

**Not cleared. Three medium-severity defects remain: one introduced in this round and two incomplete repairs.**

Reviewed the supplied export at `69a5bdb1d`, read-only. The initial mandatory guidance read exposed the handoff’s builder summaries before I reached the brief’s exclusion; this was therefore not a perfectly blind read. I opened no other fix-read-7 report or prohibited walk report. No post-compaction handoff was used.

The normal test runner failed before collection because the sandbox blocked its temporary directory. I instead bundled and executed the application and assertions entirely in memory, using the existing test setup. **74 existing focused cases and four additional controls passed; seven new assertions failed**, establishing the findings below. These are not claimed as normal Vitest results.

Provenance was checked against the pre-round source reconstructed in memory by reversing the supplied patch.

**1. FR7-A1 — An admin can defeat a filer message’s retirement before its recipient moves. Newly introduced.**

**Proof: three failing cases.** On 15 July, Hunter files Ranger’s LL for 25 July; Saber changes its remarks, creating Hunter’s filer-only message with `fu: ['u142']`. While Hunter still belongs to 142, Outlaw, a plain 142 admin, uses the normal input command to alter that existing message:

- Delete `fu`.
- Replace it with `['u142', 'u149']`.
- Replace it with `[]`.

All three commands succeed. Hunter moves to 149 on 16 July. **Expected:** the message leaves his bell. **Actual:** it remains visible in every case.

These same three retirement assertions pass against the pre-round source. This concerns newly created messages, not legacy unmarked data.

**Cause:** `filerMarkOk` protects the cross-squadron telling exception, but failure falls through to the general permission to change an own-squadron recipient’s notices. That permission also allows modifying an existing message without changing its input. The new reader then trusts the altered mark: absent means personal; widened or empty means still eligible.

**Exact fix:**

1. Validate input-notice classification before either the telling exception or general squadron ownership can allow a write.
2. For new messages, require the canonical named-recipient/filer classification and exact source squadrons.
3. For existing messages, preserve their established classification and retirement evidence; permit restoration only through verified replay.
4. Protect the recipient, source and creation-time facts used by retirement from equivalent rewriting.
5. Retain all three failing cases and the legitimate creation/replay controls.

**2. FR7-A2 — Giving Plan later brings an already-retired message back. Incomplete repair.**

**Proof: two failing cases, read and unread.** Use the same Hunter message. Hunter moves to 149 on 16 July; the message correctly disappears and his unread count is zero. On 17 July, Saber gives Hunter Plan of 142 through the real grant command.

**Expected under D2218/D2223:** the old retired message remains absent; eligibility for new messages is separate. **Actual:** the old message returns. The unread case relights his bell, increasing its count from zero to one.

Both cases also fail against the pre-round source.

**Cause:** `noticeLeftBell` revisits each historical move day, but `toldIn` uses the account and grants held **today**. Passing an earlier date dates the home lookup only: grants and master status have no historical version. Later authority therefore rewrites whether the message supposedly retired earlier.

**Exact fix:**

1. Preserve effective-dated evidence of the authority relevant to retirement, including Plan and master status.
2. Evaluate each move boundary against the authority actually held then.
3. Make the first ineligible boundary permanently decisive; a later grant must not reverse it.
4. Keep current authority for deciding whether to send a **new** message.
5. Test read/unread messages, later grants and removals, master changes, reloads and subsequent moves.

**3. FR7-A3 — A genuine Undo or Redo still accepts a follow-up that is not owed. Incomplete repair.**

**Proof: two failing cases.** Kestrel refuses Osprey’s LL for 15 July. Osprey does **not** read the message, then moves from 149 to 142 on 16 July.

Before Kestrel’s genuine Undo, inject one structurally correct follow-up referencing that decision: `lwback`, LL, 15 July, refused, addressed to Osprey and signed by Kestrel.

**Expected:** the unread decision simply disappears, with no “taken back” message. **Actual:** Undo succeeds; the injected message enters the committed restore and appears on Osprey’s bell.

In a separate case, perform the clean unread Undo, then inject the matching `lw` / `again: true` message before Redo. Redo commits and displays it despite there being no taken-back message to answer.

Both assertions also fail against the pre-round source. These are crafted-command cases using the same pre-restore injection route as the previous security proof.

**Cause:** `followUpsFor` supplies the correct content, but eligibility remains separately inside `warNoticesReversed`: whether the original was read, whether a taken-back line exists, and whether the latest “again” line was read. The gate checks content and quantity without checking those conditions.

**Exact fix:**

1. Share both follow-up construction **and eligibility** between writer and gate.
2. Supply trusted pre-command notice/read facts and the verified restore direction.
3. For Undo, require the applicable read state; for Redo, require the legitimate prior take-back and repeat-message conditions.
4. Do not let an injected candidate supply its own eligibility evidence.
5. Retain exact-content, recipient, signature and one-per-reference checks, plus both failing cases.

**Judgment on the four departures**

1. **Before-image filer:** supported. Writer and gate agree; changing the after-image’s filer no longer selects an unrelated recipient.
2. **Checking every move day:** appropriate in principle, but not historically sound while authority comes from today’s records—finding 2.
3. **No maker for app acts:** the tested exception remains bounded. A permitted posting-related message passes; an unrelated recipient and the same unsigned ordinary input command are refused.
4. **Startup probe:** fails closed. With the probe unset, the tested cross-squadron Undo is refused. Normal startup installs it; no fail-open result found.

**Explicit negatives and limits**

- The supplied ALL AVAIL forgery cases, altered follow-up contents and duplicate follow-ups are refused.
- Ordinary approved/refused leave passes Undo → Redo → Undo, read and unread.
- Posting take-backs and bidding messages exclude moved recipients; posting round trips and never-moved controls pass.
- Named personal messages survive moves, including a message created on the move day. Master, Plan and never-moved member-filer controls pass.
- Bell lists, unread counts and read marking share the visibility rule. Restore exclusion and posting take-back writers consult retirement. Storage retains raw records.
- A line’s tap receives a filtered list entry, but `openNotice` does not independently recheck visibility. Stale-click behaviour remains unverified.
- The input-reader guard passes all seven cases.
- D2215’s two-squadron **Transfer to Sqn** take-back is not cleared: this export’s implemented posting outcomes do not demonstrate that route.
- Opus F4 remains excluded as instructed.

Tidiness: ownership lookup is shared appropriately; historical retirement still depends on mutable authority; follow-up content and eligibility remain split. The latter two directly explain findings above.

Walk: not performed; this was the requested code read. No full-suite or browser clearance is claimed.

Rulings: none this session. No files changed, committed or pushed.

