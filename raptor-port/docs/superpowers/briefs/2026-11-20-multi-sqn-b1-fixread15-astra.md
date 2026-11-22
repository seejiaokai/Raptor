# Fix read 15 — Astra (GPT-6 Astra, high), returned 20 Nov 26 — finished whole (not stopped by its service this round); its report file as written

Read the exported copy identified as `f27c924be`. **Two findings remain: C is incomplete; A introduces a broken Undo path.** B and D are supported within the checks below.

I remained blind to this round’s other readers and builder’s report. No post-compaction handoff was used. No files were changed.

**1. Medium — approving a bridge between two leaves still loses the absorbed leave’s filer notification (C).**

**Setup and action:** On 15 July 2026, Hunter approves Ranger’s LL for 29 July with words “right”. Saber approves Ranger’s LL for 27 July with words “left”, then enters a pending LL bid for 28 July. Saber selects 27–29 July, types “joined” and presses Approve.

I ran the production command sequence used by the drag window, with saved storage wired and seeded.

**Expected:** Hunter receives one remark notification: words on the leave he filed changed. He never moved; D2225 applies. Its tap should reach the surviving leave.

**Observed, red:** One approved leave survives for 27–29 July, bearing “joined”. Hunter receives **zero** new lines. The assertion expecting one remark notification fails.

**Cause:** The join keeps the preceding leave and removes the following leave. The remark pass compares an original leave only with a surviving record bearing the same identity. Hunter’s original record has no surviving counterpart, so the pass skips it. Removing the “words-only change” restriction did not cover this absorbed-record path.

**Exact fix:**

1. Preserve command-owned correspondence between each absorbed approved leave and its surviving leave.
2. Compare the typed words/till choice against each original piece; retain that piece’s original filer and applicable days when judging notification rights.
3. Make notification creation, permission checking and the squadron mark use that same correspondence. Deduplicate recipients, exclude the actor and target the surviving leave.
4. Add the two-filer bridge proof, unchanged-words control, moved-filer controls and Undo/Redo coverage.

Keep D629’s approver attribution unchanged.

**Introduced here?** No. This is the same missing-notification harm left incomplete by C. The unchanged-words bridge control passes: it produces no remark notification.

**2. Medium — an accepted never-saved request cannot be undone (A).**

**Setup and action:** With saved storage wired and seeded, sign in as Ranger. Place this request only in memory: Ranger’s all-day LL for 27 July 2026, filed by Ranger now, words “mine”, with `lw: 'y2026'` and a fresh identity. Through the ordinary input write command, remove `lw` and change the words to “changed”. The command accepts and saves it. Press Undo.

**Expected:** Since no saved request preceded the accepted write, Undo removes it; Redo restores the accepted request without the invented war mark.

**Observed, red:** Undo returns failure and the saved request remains. Internally, restoration attempts to put a null request into the input collection and rolls back.

**Cause:** A carries absence as `before: null`. Undo recognises creation only when `before === undefined`; it therefore constructs a put of null instead of a deletion.

**Exact fix:**

1. Carry an absent before-image using the canonical representation for creation: omitted/`undefined`.
2. Strengthen the existing never-saved test to require successful acceptance, successful Undo, absence from both memory and storage, then successful Redo without the invented marks.

I applied that single correction **only to the in-memory test bundle**. The same proof then passed through Undo and Redo.

The existing test misses this because it checks only that the saved request lacks `lw`, without requiring Undo to succeed or remove the request.

**Introduced here?** Yes, by carrying the null before-image into history. This is the brief’s memory-divergence case; I have not established an ordinary screen gesture that creates its starting condition. Ordinary saved-request edit → Undo → Redo passed.

The surface inventory, starting with the specialised doors, was:

| Objects, doors and consumers traced | Required visible sign and working gesture |
|---|---|
| Leave War drag selection, bid picker, request/remarks windows and day-list “Add to leave”; pending bids and approved leaves | Typed words survive approval, extension, joining and splitting; affected people and eligible filers receive the appropriate bell line. Finding 1 covers the missing bridge path. |
| Posting Delete and take-back; Admin → Users deletion; Quals edits | Deleted people remain marked in retained history, stay out of active Quals/account use, and cannot return through Undo. Permitted edits retain all four deletion marks. |
| Shared inputs, person-specific splits, reassignment, medical cuts and ordinary request editors | Editing one person’s part affects that part; dates, words, ownership and notifications remain consistent across lists, calendars and Leave War projections. |
| Week landings and published-day working copies; scheduler, Unavailable and Ground Programme consumers | Loaded filing marks remain correct; subsequent edits and history describe only the actual change. Undo restores the saved request while retaining intentional landing state. |
| Seeded, partially initialised, remotely received and missing saved records | Honest edits remain available; forged ownership/approval is refused; history and Undo use the correct prior record. Finding 2 covers accepted absence. |
| Desktop/phone bell, badge, list and destination opening | Only entitled recipients see lines; read and unread old-squadron filer lines retire on the move day; new eligible lines open the affected matter. |
| Global history, Undo and Redo | Only the actor’s eligible changes are restored; deletion remains final; notification follow-ups respect whether the original was read. |

Across those paths I distinguished each squadron’s admin, master, member, named person, filer and actor; moved-together, moved-alone and moved-away-and-back histories; and changes before versus after a move. This was source tracing and command-level testing, **not a rendered browser walk**.

**Other choices and explicit negatives:**

- **A:** Saved before-images are supported. I found no additional intentional memory-only request field beyond `acc` and `odGround` in the landing paths inspected. Seeded editing, pre-seed editing, remote-record exemption and ordinary Undo/Redo controls passed. No evidence established that blanket refusal is necessary.
- **B:** Supported. Per-image men/days avoided the false cross-product. Several-person and both directions of ALL AVAIL conversion passed additional checks. Existing moved-together, away-and-back, moved-alone and D2225 controls passed; I found no new cross-squadron disclosure.
- **C:** Incomplete as above. Simple remark editing, the fixed one-sided extension, unchanged joins and actor suppression passed. Source inspection of moves, cuts, shortening, deletion, posting take-back and date-driven till defaults found no further concrete false-word notification; those combinations were not all executed.
- **D:** Supported. Resurrection attempts were refused; deletion/Undo controls passed. An allowed edit after deletion preserved all four marks. I found no additional normal-action refusal.
- I found no additional concrete fail-open case in the inspected replay/boot checks. Unset-hook and malformed-date combinations were not exhaustively executed. The explicitly exempt unseeded harness and already-filed matters are not findings.

**Verification limits:** Native Vitest could not start tests because temporary-directory creation was denied (`EPERM`). I instead bundled the real production modules in memory and replayed assertions using a small assertion harness: all 44 cases from reads 13–14, plus five selected read-12 controls, passed their existing assertions. The two stronger proofs above failed. This is not a native Vitest or full-suite pass; reads 7–11 were not rerun wholesale.

Rulings: none this session.


---
**Host's reproduction (chat 122):** both findings red on `f27c924be` (`src/leavewar/multi-sqn-fixread15.test.ts`, "Astra 1" and "Astra 2"); Astra 1's unchanged-words control green, as it said.
