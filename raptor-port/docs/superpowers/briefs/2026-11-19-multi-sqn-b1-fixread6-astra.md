# Fix read 6 — Astra's report (GPT-6 Astra, read-only; 19 Nov 26, chat 114; copy at 63620a9e7)

Saved whole as handed back; not yet read or reproduced by the host.

**Not cleared. Three medium-severity defects remain.**

I reviewed the supplied export and patch without changing files. The required startup handoff exposed builder summaries, so this was not a perfectly isolated blind read. I opened no prohibited current-round reader or walk report and used no post-compaction handoff.

The normal test runner was blocked before collecting tests because the read-only sandbox prevented its temporary directory. I therefore ran the application code and assertions entirely in memory, with the existing test setup. **52 existing focused cases passed; nine new failing cases establish the findings below.** These are not claimed as a normal Vitest or browser pass.

**1. FR6-A2 — A genuine Undo or Redo can carry an unrelated correction onto another squadron’s bell.**

**Proof, two failing cases:** Kestrel refuses Osprey’s LL for 15 July 2026. Osprey moves from 149 to 142. During Kestrel’s authentic Undo, the proof appends a follow-up through the normal notice command, retaining the installed restore hooks and permission checks:

- Same recipient and reference to the original notice.
- Different leave: OL instead of LL.
- Different dates: 1–31 December 2027.
- Different decision: approved instead of refused.

Expected: the command refuses that unrelated follow-up. Actual: Undo succeeds and the false “taken back” notice is visible. The equivalent false “approved again” notice also succeeds during Redo.

This is a crafted-command case, not an ordinary form action. The control changing the recipient to Ranger is refused.

**Cause:** `perms.ts`’s new `followUpOf` verifies the reference, replay operation and recipient, but does not compare the follow-up’s leave, dates, decision or movement details with the referenced notice.

**Exact fix:**

1. Derive the permitted follow-up from the verified original notice.
2. Compare the complete decision payload: kind, dates, decision, war and movement details, allowing only the defined Undo/Redo transformation.
3. Validate the notice wrapper too; permit fresh identity/time and the restoring actor, not unrelated input or display details.
4. Retain the authentic-replay, author, recipient and conflict checks. Add both failing cases and the different-recipient control.

**Introduced here:** Yes, by the new follow-up allowance.

**2. FR6-A1 — Retired input notices reappear after a return or deletion.**

**Proof, six failing cases:** On 15 July, Hunter files Ranger’s leave and receives a notice when Saber changes its remarks. Hunter moves from 142 to 149 on 16 July. His notice correctly disappears.

It then reappears when either:

- Hunter returns to 142 on 17 July;
- Hunter completes two away-and-back trips; or
- Saber deletes the input while Hunter remains in 149.

Each case fails for both read and unread notices. An unread notice also relights the bell: the observed unread count becomes one.

Expected under D2218/D2223: an old squadron-business line that left his bell remains absent.

**Cause:** `noticeAboutHim` asks today’s `filerTold` against the current input. Returning makes the same-squadron test true again. Deleting the input activates the unconditional `!r` fallback. Both turn a previously retired business notice into a supposedly personal notice.

**Exact fix:**

1. Preserve the notice’s recipient relationship and source squadron when it is created, including whether the recipient was actually named.
2. Determine retirement from that evidence and dated moves, independently of the input’s continued existence.
3. Keep permanent retirement separate from eligibility to receive a **new** notice today. Returning must not revive an old line.
4. Apply the corrected rule to the bell, unread counts, read marking and restore exclusion. Keep the six cases, plus personal-notice, master and Plan controls.

**Introduced here:** The new live-input classification creates the disappear/reappear behaviour. The underlying cross-squadron exposure predates this round: previously these filer notices never disappeared. This is an incomplete repair, not a stored-demo-data-only issue.

**3. FR6-A3 — ALL AVAIL bypasses the moved-filer restriction.**

**Proof, one failing case:** Hunter files a Meeting for ALL AVAIL dated 15 July, while in 142. He moves to 149 on 16 July. Outlaw, a plain 142 admin, changes that historical 142 input’s remarks.

Expected: Hunter, neither named in the input nor still an admin of 142, receives nothing. Actual: the save succeeds and creates one new notice for Hunter.

**Cause:** `filerTold` returns true whenever the input names no real person. The writer and permission check share this unconditional exception. D2223 supplies no placeholder exemption, and D2194 still restricts another squadron’s business.

**Exact fix:**

1. Replace “no named people means eligible” with an explicit ownership check.
2. For placeholder-only inputs, resolve their squadron using the existing input-ownership rule: placeholder filer, otherwise input filer, on the input’s date.
3. Require continuing membership or administrative authority there, preserving master and Plan access.
4. Use that result consistently in delivery and permission checks; preserve historical ownership for retirement after deletion.

**Introduced here:** No. This round explicitly retains the earlier behaviour and therefore leaves this route unfixed.

**Explicit negatives and remaining limits**

- Personal approved and refused leave now survives the tested move correctly through Undo → Redo → Undo, with read/unread handling. The refused case has no accompanying input change.
- Posting take-backs and bidding reversals correctly exclude retired notices after one or two round trips. Never-moved controls pass.
- Forged standalone restores and foreign-recipient notice writes/deletes remain refused. The new hole requires an authentic replay in progress.
- The placement-attribution checks pass, including leave spanning the move.
- Master-filer, Plan-holder and never-moved member-filer controls pass.
- Bell lists, unread counts and read marking share the visibility rule. Storage and posting-run selection retain raw facts, as required.
- The inputs-readers guard passes all seven cases.
- `openNotice` does not independently recheck visibility; stale-click behaviour remains unverified.
- D2215’s two-squadron transfer take-back is **not cleared**: this export does not provide an implemented transfer outcome demonstrating that delivery.
- No browser walk or full-suite pass is claimed.

Tidiness: new-notice eligibility and permanent retirement answer different questions and should not share a mutable classification. Follow-up construction and validation should share one canonical transformation.

Rulings: none this session. No files changed, committed or pushed.