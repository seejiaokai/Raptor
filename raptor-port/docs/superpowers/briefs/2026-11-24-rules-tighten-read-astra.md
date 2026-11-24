I read an exported copy of commit c3b956832.

1. **High — The shipping summary loses the check that the new version is live.**  
   **File and sentence:** [.claude/rules/shipping.md:52](C:/rt158/.claude/rules/shipping.md:52): “Vercel reports the live app READY”.  
   **Failure:** The full wording requires a Production deployment containing the merge, including a later deployment that contains it. The summary drops that condition and gives no moment to open this section’s steps. A reader could see the previous version’s READY status and announce that the new change is live. The repository records this exact deployment failure in `gates-and-deploy.md`.  
   **Exact fix:** Replace that bullet with:  
   > After an app-changing merge, open `raptor-port/docs/shipping-steps.md` §“Done” means LIVE and follow it through: `main`’s run green, then a READY Production deployment whose commit contains the merge, then one notification with the link. A green check or merged pull request alone is not done (D143, D1746).

2. **Medium — React Doctor’s operating conditions are behind the wrong trigger.**  
   **File and sentence:** [.claude/rules/decisions/how-we-work.md:125](C:/rt158/.claude/rules/decisions/how-we-work.md:125): “Also stated there: … how React Doctor is run [D1531, D1533].”  
   **Failure:** The preceding trigger covers database, M365 and IT work. React Doctor also runs during ordinary feature work. Those chats need its rule that usage tracking stays off and its permission to send findings for the score. Moving that rule behind a database-only trigger removes the required read from those jobs. The existing commands preserve tracking-off today, but the document no longer governs a direct run or a change to those commands.  
   **Exact fix:** Remove that final clause from the list and add:  
   > Before running React Doctor or changing how it runs, open `raptor-port/docs/how-we-work-when-needed.md` §The platform and the database; its usage tracking stays off, and its findings may be sent to its maker for the score [D1531, D1533].

3. **Medium — Parallel-work agreements no longer have to survive a handoff.**  
   **File and sentence:** [.claude/rules/shipping.md:85](C:/rt158/.claude/rules/shipping.md:85): “Before changing a file or function another open chat’s branch also changes, message that chat … and settle the overlap at once”.  
   **Failure:** The full wording also requires answering when asked and repeating the agreement in the chat’s own handoff block. Neither survives in the summary, and this bullet does not direct the reader to the steps. A replacement chat can therefore lose the agreed boundary and change work reserved for another chat.  
   **Exact fix:** After “settle the overlap at once”, insert:  
   > ; answer the same when asked, and repeat what you promised in your own `HANDOFF.md` block

4. **Medium — “Never a rule file” changes the notes-only boundary.**  
   **File and sentence:** [.claude/rules/shipping.md:18](C:/rt158/.claude/rules/shipping.md:18): “what ‘only notes’ covers — never a working guide, a rule file …”.  
   **Failure:** The full list explicitly includes area-ruling files under `.claude/rules/decisions/`; it excludes the unscoped working rules under `.claude/rules/*.md`. The summary excludes both. A routine area-ruling update can consequently be classified as needing another approval. The handoff skill also directs readers to this list when classifying future work, before the summary’s “before merging” trigger.  
   **Exact fix:** Replace these two lines with:  
   > Before classifying or merging a notes-only pull request, open `raptor-port/docs/shipping-steps.md` §“Push” and “merge live” for the exact file list, exceptions and local checks. Area-ruling files can qualify; unscoped working rules, working guides, hooks, settings, skills and workflows cannot (D1407, D1737, D1980).

5. **Medium — The checks summary adds a new locking requirement.**  
   **File and sentence:** [.claude/rules/shipping.md:79](C:/rt158/.claude/rules/shipping.md:79): “Before … any browser-test run … or anything that builds, take the checks lock”.  
   **Failure:** The full wording distinguishes **taking** the lock from **waiting until it is free**. A normal build or single-file browser run needs the latter. The summary requires ownership for both, unnecessarily blocking other work and contradicting the distinction retained in the full steps and the guard.  
   **Exact fix:** Replace that bullet with:  
   > Before the full unit suite, a browser-test run of more than one file, the Tracker smoke or a fanned-out walk, open the steps and take the checks lock. Anything that builds, including a single-file browser run, waits until the lock is free. The steps name the exemptions and stale-lock procedure. Release a lock you took as soon as the run ends, pass or fail (D228).

6. **Medium — The Vercel correction is absolute where the implementation is conditional.**  
   **Files and sentence:** [.claude/rules/shipping.md:12](C:/rt158/.claude/rules/shipping.md:12), plus `raptor-port/docs/shipping-steps.md` lines 12 and 80: “a notes-only push builds nothing”.  
   **Failure:** A first deployment or an unreadable comparison base still builds. I checked the decision function directly: a notes-only change with a known base skips; the same change without a base builds. Also, a successful skip produces Canceled, while the shipping loop still expects a new READY deployment. A reader can misreport expected behaviour or wait for a deployment that will never become READY.  
   **Exact fix:** Replace each absolute clause with:  
   > a notes-only push normally skips the build; a first deployment or an uncertain comparison still builds (D2032)

   Add to the short and full completion sections:  
   > For a notes-only merge, check the skip result using `gates-and-deploy.md` §A notes-only push skips its build. A confirmed skip leaves the existing app serving; report the notes merged without waiting for a new READY deployment.

7. **Low — The replacement pointer repeats the roster it says is stated once.**  
   **File and sentence:** [.claude/rules/bug-check.md:52](C:/rt158/.claude/rules/bug-check.md:52): the paragraph beginning “Who they are now is stated once” and ending “It is not repeated here.”  
   **Failure:** Its roster summary adds words to the every-chat layer without adding a condition or a reading trigger. It creates another partial restatement to keep aligned.  
   **Exact fix:** Replace that paragraph with:  
   > Who builds and reads is stated in `.claude/rules/decisions/how-we-work.md` §Models and readers (D2460).

Checked and found sound:

- All 30 moved general-page bullets match their old wording exactly.
- The shipping body is preserved apart from its introduction and the two declared Vercel corrections; the latter need finding 6.
- The merged readers’ lines retain Astra first, the second-seat conditions, the interpretation labels, reads owed, blindness and the working-guide wait when Astra cannot run.
- Dropping “as plans have been read since 13 Oct” removes history, not a condition; D1760 preserves the owner-approved fallback.
- The two reader pointers retain the substantive arrangements; I found no additional lost reader condition.
- “Merge live”, the four merge steps, level checking, no pushes during checks, the database deferral, Astra’s rewording read, fresh Opus and “never by its writer” remain.
- The overnight and compaction detail remains available; the compaction figures agree with the hooks inspected.

No files changed. I did not read `HANDOFF.md` or another reader’s report. App-check tier: NONE; no app tests or document checks run.

Rulings: none this session.