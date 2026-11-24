**Astra’s first read: changes required.** One must-fix and two should-fix findings.

1. **Must-fix — the central rule is missing.**  
   The approved plan’s C1 was not added. The new builder, design, recording and checking instructions all point to “A reading”, but that passage does not exist in the rulings guide. Its change only updates the index.

   Consequently, the promised home never explains how to record an open interpretation, keep it open until you answer, or distinguish your approval of wording from approval of its underlying interpretation. Folding lesson 32 into pointers therefore loses safeguards.

   **Fix:** insert C1’s approved passage after the recording steps. Check that every new pointer reaches it and that all four original lesson requirements remain covered.

2. **Should-fix — ordinary wording and line wrapping escape the check.**  
   I reproduced two false passes with newly added comments: “the host’s reading: any row counts”, and “the agent’s” followed by “reading: any row counts” on the next line.

   The first wording is already used by the checking guide. The second changes only formatting. Both describe an interpretation explicitly, yet neither requires its recording mark because the check recognises a limited phrase list, one line at a time.

   **Fix:** include the project’s established alternative wording; recognise phrases across comment-line boundaries while retaining which lines were added. Add regression cases for both.

3. **Should-fix — the comment reader skips genuine comments in valid code.**  
   I reproduced a false pass when “his to change” follows a pattern matching a quotation mark. Another occurs inside the executable part of an interpolated text expression.

   The reader mistakes the quotation mark for the start of quoted text and skips the comment; it also skips interpolated expressions wholesale. These failures affect tests as well as application code.

   **Fix:** recognise patterns and interpolated expressions correctly when locating comments, then test both examples alongside ordinary quoted text that must remain ignored.

**Other conclusions:** lesson 32’s historical case text is byte-for-byte unchanged. Apart from the missing central passage, the guide edits follow the approved plan without an additional safeguard loss or unnecessary duplication.

The nine reported failures are inherited from the unmerged parent branch; this change adds no application lines. Comparing against the destination branch is correct: other open branches will also fail for unmarked interpretation comments they add, including test comments. That is what C7 requires. Comments already present in the comparison base remain exempt; merging that parent first removes its nine lines from this change’s added-line comparison.

**Checks and limits:** nine existing tests ran in memory and passed; the additional examples above reproduced the gaps. Tests requiring temporary files were not run under read-only access. I read the named revision directly from Git; I could not create the prescribed exported copy. No prohibited report was opened. No files changed, committed or pushed.

Walk: not required by the approved plan; no app change.  
Rulings: none this session.

