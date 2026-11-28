**Astra’s round-2 read: changes required.** The guide changes preserve the intended meaning. Five checker faults remain.

1. **Should-fix — valid code still hides interpretation comments.**  
   I reproduced missed comments between two apostrophes in ordinary JSX text, and after an `if` condition followed by a pattern containing a backtick. Both examples contained “his to change”, but the checker found nothing.

   **Cause:** the comment reader mistakes ordinary text for quoted code, or fails to recognise the pattern and treats its backtick as the start of quoted text.  
   **Fix:** recognise JSX text and patterns after control conditions correctly. Keep both examples as regression cases alongside quoted text that should remain ignored.

2. **Should-fix — wrapping still makes an interpretation disappear from the reviewers’ list.**  
   A comment with “his”, “to” and “change” on consecutive lines is caught by the comment check, but the listing reports none. Joining those words onto one line makes it appear.

   **Cause:** the listing first selects files using phrases that must occur on one physical line. The later check, which understands wrapping, never receives excluded files.  
   **Fix:** make that initial selection include every possible wrapped match, then let the existing comment reader decide. Test the complete listing, including old comments.

3. **Should-fix — a wrapped answer citation bypasses validation.**  
   A comment saying “our reading: any row counts; ruled”, followed by `D999999` on the next line, passes despite that ruling not existing. The same citation on one line correctly fails.

   **Cause:** the exemption accepts a line break, while citation collection and validation do not.  
   **Fix:** collect and validate answer citations across the same comment boundaries used by the exemption. Only a validated citation should exempt the comment.

4. **Should-fix — ordinary technical explanations are falsely blocked.**  
   “The bytes are read here as UTF-8 before parsing” fails as an unasked interpretation. So does “The value is his to change using the editor.”

   **Cause:** phrase matching treats these ordinary meanings as product interpretations. The new answered-reading exception cannot honestly resolve an explanation that required no owner decision.  
   **Fix:** provide a narrowly documented way to identify a non-interpretation, with its reason, without inventing an open question or claiming an owner answer.

5. **Minor — another malformed open mark disappears silently.**  
   `READING, OPEN: …` produces neither a listed reading nor an error.

   **Cause:** malformed-mark detection itself requires the opening parenthesis that is missing.  
   **Fix:** detect the marker independently of its required punctuation, then reject any occurrence that cannot be parsed.

The central rule is present. Its added answer-citation sentence, the rewritten recording instruction and the folded lesson preserve their meaning. The lesson’s historical case is byte-for-byte unchanged. Both size increases accommodate information needed where it sits; I found no unnecessary addition.

**Checks and limits:** 18 existing tests passed in memory. Fresh probes confirmed the failures above; listing and citation integration probes used in-memory filesystem/Git substitutes. Moved, re-indented and renamed-file examples passed. The live checker took approximately 2.9–3.3 seconds; comparison with the local main reference still reports nine inherited parent-branch failures.

Read-only access prevented creating the prescribed exported copy and running six temporary-repository tests. I checked the named revision directly; reviewed files match it. No other round-2 report was opened. No files changed, committed or pushed.

Walk: not required by the approved plan.  
Rulings: none this session.

