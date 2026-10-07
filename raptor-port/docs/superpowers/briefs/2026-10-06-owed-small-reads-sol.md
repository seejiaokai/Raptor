**Part 2 — CHANGES REQUIRED**

The bullet preserves D596’s main instruction, but omits part of its practical direction. Older instructions also need an explicit exception for unattended runs.

1. **The question list’s required location is missing.**  
   [.claude/rules/doc-structure.md:69](C:/Users/User/projects/Raptor/.claude/rules/doc-structure.md:69) says “ONE list” without saying where. [D596’s full row:11](C:/Users/User/projects/Raptor/.claude/decisions-full/how-we-work.md:11) requires, during a bug check, **“Questions waiting for him” at the head of the evidence sheet’s look-card section**. Without that direction, questions can land elsewhere and be absent from the report he opens.

   **Exact correction:** add:
   > A question already answered by a ruling is never parked. Technical choices are the agent’s to make and explain. Keep the list readable in a minute; in a bug check, put “Questions waiting for him” at the head of the evidence sheet’s look-card section, naming exactly which finding or step waits on each answer.

   The technical-choice restriction already exists in the always-loaded plain-language rule; its absence here is not a separate contradiction.

2. **Older question and notification instructions remain unqualified.**  
   [shipping.md:51](C:/Users/User/projects/Raptor/.claude/rules/shipping.md:51) calls for notification when blocked waiting for an answer; [shipping.md:60](C:/Users/User/projects/Raptor/.claude/rules/shipping.md:60) allows returning early for “a genuine question.” [CLAUDE.md:26](C:/Users/User/projects/Raptor/raptor-port/CLAUDE.md:26) says to ask follow-up questions until uncertainty is resolved.

   During an overnight batch, one unanswered product choice could therefore trigger an early notification or a wait while other fixes remain possible. D596 requires parking that choice and continuing. D90 makes D596 win, but D201 requires correcting the older wording rather than leaving the clash.

   **Exact corrections:**
   - Add beside the shipping question/notification instructions:
     > During unattended runs, D596 governs: park questions and continue everything else. Send one notification when the run ends or when its remaining work is truly blocked.
   - Add after the confidence paragraph:
     > During unattended runs (D596), leave only the work needing his choice undone, record that choice in the unattended-run list, and continue everything else. Do not guess his answer.

Checked and sound:

- **Scope:** asleep-or-away jobs matches the recorded full row, including its stated reading that this applies beyond that night.
- **Search first:** the bullet retains the rulings-and-backlog check and names D53.
- **Question contents:** app wording, a recommended answer and the waiting work are retained.
- **Continuation:** only the dependent piece is withheld; everything else carries on.
- **Limits:** one notification at the end or true blockage, no merging and no touching `main` are faithful.
- **Other safeguards:** independent review, owner approval and the hard limits remain intact; D596 does not authorize guessing product choices.

Read-only review completed. Nothing changed; no builds or tests ran; no other reviewer’s report of 6 Oct 26 was opened.

Rulings: none this session.