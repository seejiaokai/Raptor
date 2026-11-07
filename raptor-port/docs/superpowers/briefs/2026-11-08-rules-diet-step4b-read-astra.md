# The rules diet, step 4 part 2 — Astra's blind read (8 Nov 26)

Astra's report (`codex exec -m gpt-6-astra`, read-only, reasoning high) on the brief `2026-11-08-rules-diet-step4b-read-brief.md`,
branch `claude/rules-diet-step-4-7b92cb` at 584bca6e6 — saved whole, as it came back (D1739). Kept out of the working
folder until the fresh Opus reader had finished, so each stayed blind to the other (`2026-11-08-rules-diet-step4b-read-opus.md`).
What was done with each finding: the plan's step-4 section.

---

1. **Low — the earlier fixes incorrectly say all 31 code-check errors were fixed.**  
   **Where:** `.claude/rules/decisions/how-we-work.md`, “the 31 old errors outside the app were fixed … (done)”.  
   **Authority:** D1572, its archived job `[WALK-SCRIPT-DOCTOR-ERRORS]`, and `gates-and-deploy.md` §Now. The completed work retained 30 findings with written reasons and left one finding in the read-only original untouched; D1716 later excluded those folders from the check.  
   **Problem:** the new sentence turns a completed disposition into a claim that the underlying errors were corrected, which could mislead a later reader.  
   **Fix:** say that the job closed with 30 findings retained with reasons and one left untouched, and that those folders were later excluded under D1716.

Checked **174 entries in the requirement account**, including stories and pointers, against the original text; the 14 rows of the document-home table were checked individually. Also checked the cited full rulings, the specified part 1 fixes, heading destinations, manual duties behind hooks, and all five size limits.

**Found whole:** `shipping.md`, `doc-structure.md`, `record-decisions.md`, `plain-language.md` and `bug-check.md`. I found no lost requirement in their checklist rewrites. Their original bodies each appear exactly once in the archive, byte for byte. Required headings and their expected instructions remain present.

All five size limits exceed the new sizes and have recorded reasons. The document check passed.

Read-only review completed. Neither other reader’s report was opened. I changed no files, committed nothing and pushed nothing.

Rulings: none this session.