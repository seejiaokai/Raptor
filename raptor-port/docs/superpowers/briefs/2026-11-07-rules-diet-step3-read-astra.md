# The rules diet's step 3, reading by section — Astra's blind read (7 Nov 26)

Read at commit `b1a5e682b` of `claude/rules-diet-step-3-f1a069` from the same brief,
`2026-11-07-rules-diet-step3-read-brief.md`, by Astra (Codex CLI, `codex exec -m gpt-6-astra -c
model_reasoning_effort=high -s read-only`, run 20:13–20:23) on his PC — his call for every reworded step of the diet
(D1739). Told to read nothing outside the worktree, where the fresh Opus reader's report was not: blind to it, though the
text it read already carried that report's fixes. Its first run, earlier that evening, read for a while and stopped on Astra's
usage limit before it wrote a report. Saved as it came back; what was done about each finding: the plan's §Step 3 review log.

---

**1. Checklist — four findings**

**Medium — step 17 tells a blind reader to read the walk report.**  
`raptor-port/docs/bug-check-checklist.md:68–70` says readers receive the evidence sheet. The current rule in `bug-check-order.md:229–240` requires the fresh Opus reader to have seen neither the walk’s report nor another reader’s report. An ordinary job needing a code read could therefore lose its required blind review.

The older instructions in §4a already conflict with the current rule, but the new checklist makes this worse by repeating their instruction for **any job needing a code read**. Replace the reminder with:

> Follow §4’s current reader arrangement. The fresh blind Opus reader receives the same brief and finished code, without the walk’s report or another reader’s report. Apply evidence-sheet handoffs only where they do not conflict with that arrangement.

**Medium — step 5 narrows the requirement to show a design before building it.**  
`raptor-port/docs/bug-check-checklist.md:26–27` starts with “Something new he will see.” The source, `bug-check-order.md:1175–1178`, also requires before-and-after pictures **when changing the look or layout of an existing daily-use surface**, including a filed defect.

An agent rearranging an existing screen without adding anything could skip step 5 and first reach §11 at the final owner look. Other design rules provide protection, but this checklist’s condition is narrower than its source. Replace step 5 with:

> Before building something new he will see (§5), or changing the look or layout of a surface he uses daily (§11), show him the required drawings. For the daily-use surface, show the whole screen before and after, including when the change was filed as a defect.

**Low — the fortnightly scorecard is classified as background.**  
`raptor-port/docs/bug-check-checklist.md:86` sends the agent to §9a only when asked why or when changing the order. However, `bug-check-order.md:1103–1110` contains an operative duty: produce the comparison every two weeks, using the stated command and keeping each subsequent page beside the baseline.

When the scorecard is due, neither listed condition need apply. Remove §9a from the background list and add:

> When the fortnightly scorecard is due, open §9a whole and produce the comparison it requires.

**Low — step 15 drops an express exception.**  
`raptor-port/docs/bug-check-checklist.md:65` says “‘rare’ is not a disposition.” Its source at `bug-check-order.md:765` says:

> “Rare” is not a disposition unless a scenario proves it rare.

The reminder forbids what that sentence conditionally permits. Restore the source sentence exactly; retain the preceding three dispositions unchanged.

The head’s framing is sound: full sections remain authoritative, parentheses do not limit the read, and requirements applying by kind of change survive tier boundaries. It is **not sufficient by itself** to repair an incorrect trigger, a conflicting reminder, or an operative section classified as background.

I found no further meaning change in the tier questions, batching, WALK with a shared drawer, FULL’s additional coverage, the security-read condition, or the checks applying by kind of change regardless of tier. NONE and LOOK retain their stated tier treatment without cancelling those independent requirements. The current checklist routes §3 through step 9 and §10 through step 14; neither is now classified as background.

**2. Design guide — two findings**

**Medium — §1a is required for more than shortening existing words.**  
`.claude/rules/ui-design.md:30–31` requires §1a only “to shorten words already on screen.” The source explicitly makes §§1, 1a and 1b the standing writing guide for **every new or changed piece of app text**: `raptor-port/docs/design-practices.md:96–98` and `209–214`.

An agent writing a new warning, or replacing existing wording without shortening it, could skip the method entirely. Replace those conditions with:

> Words a person reads, written or changed: §1, §1a and §1b, each whole, for new text as well as existing text (D833).

Individual tests can still apply according to their own conditions.

**Medium — §6 is reached too late for design and mock-up work.**  
`.claude/rules/ui-design.md:33` routes §6 only “Before anything built is shown to him.” But §6 contains rules shaping new designs: equal-width figures, corner relationships, wrapping, touch-target judgments and display scaling (`design-practices.md:623–636`).

An agent preparing a new mock-up could omit those rules and seek approval for a design that later needs correction. A review without a forthcoming build could also skip them. Replace the condition with:

> Designing, restyling, drawing or reviewing a visible surface: §6; check it again before the built result is shown to him.

I found no further missing route in §§2, 3, 4, 5, 5a, 7 or 8. The required head, §0 and **all of §9 for every design job** preserve D941 and D1417. The guide’s new head agrees with that requirement.

I also checked “Where each piece came from,” including “Not taken from any of them.” Those passages record provenance and the limits of what was adopted; omitting them from an ordinary design read does not authorise those excluded defaults. The head and §0 retain the governing precedence. “Changing this guide” has an explicit route. No additional finding there.

**3. Ripple map — two findings**

**Medium — the flow condition excludes work without an edit operation.**  
`raptor-port/docs/feature-impact.md:15` directs the agent to “the §2 flow of each kind of edit it makes.” Section 2 also contains explicitly non-mutating flows, notably Flow C’s board navigation (`355–367`) and Flow F’s cross-week reads (`531–555`).

A change to within-week board navigation could make no data edit and skip Flow C, missing its requirement not to validate or wake the mounted editors. Reading the affected surface rows does not replace reading the applicable flow whole. Replace the sentence with:

> Then go down §2’s flow headings and read whole every flow the change alters, uses or could affect, including navigation, loading and validation that make no saved-data edit.

**Medium — the heading search hides an applicable pinch-zoom rule.**  
`feature-impact.md:15–17` selects §4 material by headings. The rule “Inside a pinch zoom, a list’s pixels are not the screen’s” at line `1298` is a bullet beneath **“The Leave War’s figures and bulk balance entry”** at line `1204`. That heading’s introductory note also tells readers to treat the following bullets as history.

An agent adding a scroller or mirrored table inside the Board or Quals pinch area can reasonably skip that unrelated heading. It would miss the coordinate conversion and the required check at a zoom other than 1.

The placement predates this change; selecting reads by headings makes it materially worse. Give the pinch rule its own heading, outside the historical Leave War block:

> `#### Inside a pinch zoom, a list’s pixels are not the screen’s`

Keep its operative paragraph unchanged beneath it.

**Surface-search result:** I ran both commands. The command quoted in the brief returns **46 table entries**, omitting the two bullet surfaces: the failed-save warning’s band and a shared store’s empty pages. It does not return misleading rows from other tables.

The command actually present at `feature-impact.md:12` is already corrected: it limits the search to §1 and includes both table rows and bullets. It returns **all 48 surface entries**, with no unrelated entries. No finding against the current command.

I found no further narrowing in the surface-selection conditions, the instruction to read unclear rows, the requirement to read §3 whole, or the selection of dated parts. The rule to consider surfaces fed by data or rules the change reads or writes preserves the wider ecosystem check.

**4. Changed pointers — no meaning change**

I checked:

- `.claude/rules/bug-check.md`: its head and step 1.
- `raptor-port/docs/bug-check-order.md`: §0a step 1.
- `raptor-port/CLAUDE.md`: the bug-check one-liner and all three changed map rows.
- `raptor-port/docs/guide-full.md`: “Weigh the whole ecosystem” and “The bug-check standing order.”

They point to the intended reading routes and retain the requirement to read applicable sections whole. Their destinations have the findings above, but the pointers introduce no separate change of meaning.

The unchanged ripple-map one-liner does **not** independently require reading the entire map. It directs the agent to the map, whose head now explains section selection; the expanded standing rule agrees. Leaving that one-liner unchanged is not misleading.

**Part 1 coverage: source sections and checklist steps**

All section references below are in `raptor-port/docs/bug-check-order.md`.

| Source section | Checklist step naming it |
|---|---|
| §0 | None directly. Its operative coverage and evidence duties recur in the sections reached by steps 8–16 and 20–21. |
| §0a | 1 and 3 |
| §1 | Background route only; no omitted operative check found. |
| §2 | Background route only; its practical duties are carried by §§2a, 3 and the later checking sections. |
| §2a | 6, 8, 9 and 10 |
| §2b | 2 |
| §3 | 9 |
| §4 | 6, 14 and 17 |
| §4a | 17 |
| “With the Claudex loop” | None directly; it repeats the §4a material reached by step 17. No separate missing duty found. |
| §5 | 2, 5–7 and 17–19; also the explicit LOOK/NONE paragraph |
| §6 | 8 |
| §7 | None directly; its substantive subsections are mapped below. |
| §7.0 | 10 |
| §7.0a | 11 |
| §7.1 | 12 |
| §7.2 | 13 |
| §7.3 | 14 |
| §7.4 | 14 |
| §7.5 | 14 and 15 |
| §7.6 | 14 and 15 |
| §7.7 | 12 and 14 |
| §7.8 | 14 |
| §7.9 | 14 |
| §7.10 | 14 |
| §7.11 | 10 for applicable lessons; 23 for the head’s missed-fault duty |
| §8 | 6 and 16 |
| Second lesson 23, after §8 | 10, explicitly located by the checklist |
| §9 | 4, 17 and 20 |
| §9a | Background route only; finding above. |
| §10 | 14; the framing requires the whole section, not only anti-pattern 21. |
| §11 | 5, 22 and 23; step 5’s narrowed trigger is reported above. |
| §12 | 6 and 21 |
| §13 | Background route only; no omitted operative check found. |

I closely compared lessons **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22 and 23**, plus the **second 23 after §8**. I found no additional meaning change in their reminders when combined with step 10’s mandatory full reading of each applicable lesson. The duplicate number and ordering of lessons 7 and 8 are not findings.

All reads stayed within this worktree. Neither other reader’s report was opened or searched. No scripts were reviewed, no files changed, and nothing was committed or pushed.

Rulings: none; read-only review.