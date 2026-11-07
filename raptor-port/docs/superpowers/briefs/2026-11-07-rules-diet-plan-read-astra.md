# The rules-diet plan v1 — Astra's blind read (7 Nov 26)

Read at commit `a294a09f` (branch `claude/rules-diet-plan`), from the brief `2026-11-07-rules-diet-plan-read.md`, by Astra
(Codex CLI, `codex exec -m gpt-6-astra -c model_reasoning_effort=high -s read-only`) on his PC — his call (D1734). It was given an
exact copy of that commit with only the picture folders left out (`git archive`), so neither plan v2 nor the fresh Opus
reader's report (`2026-11-07-rules-diet-plan-read-opus.md`) was in its reach: blind to it. 34 commands, about 8 minutes,
348,341 Codex tokens. Saved as it came back, before anything was done about it; what was done with each finding, and how
the two reads compare, is in the plan's review log (`../plans/2026-11-07-rules-diet-plan.md`).

---

**Verdict: revise before approval.** The approach is workable, but version 1 has two significant change-over gaps, incorrect archive proposals, and several examples of rules losing or changing meaning.

I reviewed the supplied snapshot independently. I did not seek or read the other reader’s report.

**What I checked**

- The plan, both samples, the required working rules, the recording instructions and the relevant backlog entry.
- All 48 OIL short rows against the sample, opening the full rows for their amendment chains.
- Twenty general rulings in detail: D68, D136, D138, D141, D148, D390, D486, D489, D491, D493, D588, D766, D775, D787, D905, D906, D971, D1556, D1732 and D1734.
- The document checker, shared ruling parser, recording script, prompt hook, Stop hook, rule check and area-loading paths.
- File sizes, ruling counts, sample coverage and test mentions, using read-only calculations.

App-check tier: **NONE**. This is a plan review; no app behaviour changed.

**1. High — the staged change-over does not specify a working recording and merge route**

**Location:** Plan §3, §5 and §8, especially step 1.

**Failure:** After step 1, the new instructions tell every chat to write directly into the full-row file, and the converter “no longer writes a short line.” But unconverted areas still require short lines. Recording a ruling in one of those areas therefore fails the old check.

Two further operations also need changes beyond the proposed citation checks:

- The recording script currently rebuilds the rulings map from table rows in each area file. Its existing parser sees **zero rows in both sample pages**.
- Its merge route inserts another branch’s new ruling into the area’s table. A converted page has no such table, so that operation stops.

**Cause:** The plan makes the **checker** understand `shape: page`, but does not give the recorder, map builder and merge route an equivalent mixed-format contract.

**Exact fix:** Before converting any area, specify and test all four operations together:

1. Unconverted areas retain the existing recording and short-line process.
2. Converted areas use full rows plus edited page statements.
3. The map derives each converted area’s owned rulings from its full-row file, not incidental citations.
4. Merging an older branch imports its full rows, identifies page statements needing reconciliation, and stops on conflicting edits.

Step 1 needs tests for recording, amendment, retirement, renumbering and merging across **both formats**, while retaining the existing identity and homes checks.

**2. High — the proposed stale-rule check misses partial amendments**

**Location:** Plan §5 and §9.

**Failure:** A page can retain an obsolete statement while satisfying both proposed citation checks.

For example, keep D43’s unrestricted statement that placeholders earn by default, and cite D755 elsewhere without applying its input-row exception. Both rulings remain live; both numbers appear; neither is archived. The proposed checks pass even though the current rule is wrong.

The existing checker explicitly checks that a short line names the later rulings which amend it.

**Cause:** “Every live number appears” and “no retired number appears” do not preserve the relationship between a rule and its amendments. They cannot justify the claim that a stale line must be rewritten.

**Exact fix:** Preserve an amendment check for converted pages. Each current-rule statement must identify the amendments it incorporates, including amendments owned by another area. A changed full row must identify the corresponding statement for review. Add a failing case using an unchanged D43 statement beside a separately cited D755.

Keep the independent meaning review. Describe the automated guarantee accurately: it checks coverage and amendment links, not the meaning of the sentence.

**3. Medium — several proposed retirements do not satisfy the stated archive rules**

**Location:** General sample, “The account”; plan §7.

| Ruling | Concrete failure and cause | Exact fix |
|---|---|---|
| **D141** | The sample proposes replacing it because the diet changes the ban on size targets. The plan expressly says that ban **stands**. Following the account would retire a protection the approval question promises to retain. | Keep D141 live and place its rule explicitly in the checklist. Remove it from the proposed replacement group. |
| **D905** | The account says D906 restates it fully. D906 requires links and pictures when review is needed or work is finished; it does not restate D905’s prohibition on links after every unfinished push. | Keep D905, with D906’s widening, unless a later ruling explicitly carries both requirements. |
| **D766** | It is classified wholly as a spent job permission. Its full row also supplies the specific compaction instruction—what remaining work needs kept and what to drop—which the live document policy applies to unattended runs generally. | Preserve that continuing instruction and its citation. Retire the row only after identifying a live successor which carries it. |

These are disposition errors, not objections to archiving completed work.

**4. Medium — cited numbers conceal missing requirements in both samples**

**Location:** General sample, “Order of work” and “App-wide product rules”; OIL sample, “What does not earn”.

| Ruling | Concrete failure and cause | Exact fix |
|---|---|---|
| **D148** | The general sample retains own-change Undo and refusal after another person’s edit, but drops clearing Undo at sign-out and saying **who** caused a refusal. A build following that sentence can omit both safeguards while the citation check passes. | Restore both requirements beside D148. |
| **D493** | Its citation now accompanies only the two separate tidy-up jobs. The restrictions that Leave War saved-data reading waits for the database step, and its schedule link stays whole, disappear. Those restrictions still constrain later restructuring. | Add those restrictions explicitly, including the full row’s condition for reconsidering a split. |
| **D1094** | The OIL sample retains only the same-time-line wording. The approved Unpublish warning, completion note and armed-button title are absent, although the account says the standing words were kept. | Add an Unpublish entry identifying all three approved wordings and their existing home. Retire only the spent merge permission. |

**Cause:** The accounts count a ruling as carried when its number appears beside **one part** of it.

**Exact fix to the method:** For multi-part rulings, the conversion account must map each continuing requirement—not just each number—to its destination.

**5. Medium — two summaries widen the owner’s restrictions**

**Location:** General sample, “Models and readers” and “Order of work”.

- **“Opus does not walk”** widens D787. Its full row prohibits an Opus **helper walker**, while expressly allowing the host to reproduce findings and run a short look when starting a helper is not worthwhile. Following the sample could prevent those required host checks.  
  **Fix:** Say that helper walkers remain Sonnet, while the host retains those checks.

- **“Outside skills are never installed whole”** widens D486 and D491. Those decisions concern the five skills in one article and the named collection; they do not impose a universal ban. Following the sample would reject an unrelated future skill on authority the owner never gave.  
  **Fix:** Name the collections covered, or retain a scoped pointer to their decisions.

**Cause:** Removing the subject or role qualifier turns a limited decision into a general prohibition.

**6. Medium — moving architecture only onto boundary paths removes it from ordinary area work**

**Location:** Plan §2, “The seam files”.

**Failure:** The architecture sections currently load both for the area’s own files and for files connecting it to the rest of the app. The proposal moves them into files loaded on the boundary paths, while the area page loads only on its own files.

An ordinary edit within the Tracker can consequently lose its storage, identity and import constraints. A Leave War component edit can lose the instruction never to initialise the store from a component because that clears subscribers.

**Cause:** The text being moved contains rules for the whole area, not only its connections to other areas. The proposed page template supplies no equivalent mandatory architecture read.

**Exact fix:** Make each extracted architecture file load for the union of:

- its area’s own relevant paths; and
- its existing boundary paths.

Alternatively, require the area page to open it before applicable work. Test representative internal and boundary files. The conversion account must also cover unnumbered architecture and standing rules, which a D-number inventory cannot protect.

**7. Medium — the job totals omit required reads and mix starting cost with whole-chat cost**

**Location:** Plan Part 1 and §1.

**Failure:** The totals do not follow all the loading consequences of the reads they already count:

- The counted ripple map opens the scheduler’s rulings. That adds **45,057 tokens** to the Leave War and Tracker scenarios, where that area is omitted.
- Interface work must read the performance guide’s Part 1. I measured **11,025 tokens**, absent from the layers.
- Opening that guide also loads the Leave War’s rulings. That adds **51,059 tokens** to the scheduler and Tracker scenarios, where those are omitted.

These are concrete missing dependencies, not uncertainty in the projected compression ratio.

Separately, layer C counts **40 owner messages across a chat**, but Part 1 uses totals containing that layer to describe consumption “before writing a line of code” and how much room a job “starts” with.

**Cause:** The measurement adds selected documents without following their further loading paths, and combines costs incurred at different times.

**Exact fix:** Build the measurement from a reproducible read list. Follow each read through the path rules, adding newly loaded files until no more appear; count each loaded file once. Report separately:

1. initial loading;
2. required task reads;
3. additional reads during checking;
4. repeated per-message cost.

Recalculate both before and after totals before presenting the remaining working space.

**Explicit negatives — checked and found sound**

- The snapshot contains **1,337 live rulings**, including **207 general** and **48 OIL** rulings, as stated.
- The samples account for the numbered inventory: **184 general rulings cited plus 23 proposed retirements**, and **46 OIL rulings cited plus two proposed retirements**. I found no omitted numbered ruling in those accounts. Coverage does not establish preservation of meaning, as finding 4 shows.
- I reproduced **891 of 1,130 area rulings mentioned in tests**. The plan correctly warns that a mention does not prove whole-rule coverage.
- The rule check passed: **848 test files, 278 registered rules**. It checks its existing behaviour-register identifiers; it is not a general test-coverage check for every D-number.
- The OIL sample correctly carries the important amendments concerning input-row placeholders, standby rows that fly, unanswered swaps, and opening the OIL list for another affected day.
- Keeping full rows as the identity record supports preservation, archive searches and the existing homes audit. Those checks need not be discarded to adopt pages.
- The plan retains independent meaning reviews, owner approval before changes, explicit permission for hook work, and remeasurement before the largest conversions.
- Section-based checklists are compatible with D68 and D138 **provided all applicable detail remains a required read**. Shortening the entry point is not itself a violation.
- I found no reason to include app builds or browser walks in this review. The omitted picture folders did not prevent the checks reported here.

**Cheaper, safer sequence**

Start with section-based reading instructions and the architecture extraction with its loading paths corrected. Measure those savings first. Then pilot OIL through the complete mixed-format recording, checking and merge process before rewriting the larger areas.

That tests the mechanism on a small area and may obtain substantial savings without immediately rewriting hundreds of live decisions.

No files changed; no commit or push. The working tree remained clean. I did not run the document self-tests because they create temporary repositories; the proposed new mechanism is not implemented in this snapshot.

**Rulings: none this session.**